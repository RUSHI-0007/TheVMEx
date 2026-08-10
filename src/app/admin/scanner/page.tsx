"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";

interface OfflineTicket {
  ticketId: string;
  orderId: string;
  attendeeName: string;
  tierName: string;
  quantity: number;
  college: string;
  phone: string;
  checkedIn: boolean;
  checkedInAt: string | null;
}

type LocalCheckins = Record<string, string>; // ticketId -> timestamp

type ScanStatus = "idle" | "scanning" | "found" | "already_checked_in" | "invalid" | "error";

export default function ScannerPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastScannedRef = useRef<string>("");
  const cooldownRef = useRef<boolean>(false);

  const [status, setStatus] = useState<ScanStatus>("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<OfflineTicket | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Offline Sync State
  const [isOnline, setIsOnline] = useState(true);
  const [tickets, setTickets] = useState<Record<string, OfflineTicket>>({});
  const [lastLoaded, setLastLoaded] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const storedTickets = localStorage.getItem("vmex_tickets");
    if (storedTickets) {
      setTickets(JSON.parse(storedTickets));
    }
    const meta = localStorage.getItem("vmex_scanner_meta");
    if (meta) {
      const parsed = JSON.parse(meta);
      setLastLoaded(parsed.lastLoaded);
      setLastSynced(parsed.lastSynced);
    }
    
    updateUnsyncedCount();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const updateUnsyncedCount = useCallback(() => {
    const checkins: LocalCheckins = JSON.parse(localStorage.getItem("vmex_checkins") || "{}");
    setUnsyncedCount(Object.keys(checkins).length);
  }, []);

  // Background sync every 45s
  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.onLine && !isSyncing) {
        syncCheckins(true);
      }
    }, 45000);
    return () => clearInterval(interval);
  }, [isSyncing]);

  const syncCheckins = async (silent = false) => {
    const checkins: LocalCheckins = JSON.parse(localStorage.getItem("vmex_checkins") || "{}");
    const checkinKeys = Object.keys(checkins);
    
    if (checkinKeys.length === 0) {
      if (!silent) alert("Everything is already synced!");
      return;
    }

    setIsSyncing(true);
    try {
      const payload = checkinKeys.map(ticketId => ({
        ticketId,
        checkedInAt: checkins[ticketId]
      }));

      const res = await fetch("/api/admin/scanner/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Clear local checkins that were successfully synced
        // In a perfect world we'd only remove the ones confirmed, but for this setup we clear all that were sent
        localStorage.removeItem("vmex_checkins");
        
        // Update local tickets to reflect they are now permanently checked in
        const newTickets = { ...tickets };
        payload.forEach(p => {
          if (newTickets[p.ticketId]) {
            newTickets[p.ticketId].checkedIn = true;
            newTickets[p.ticketId].checkedInAt = p.checkedInAt;
          }
        });
        setTickets(newTickets);
        localStorage.setItem("vmex_tickets", JSON.stringify(newTickets));

        const now = new Date().toISOString();
        setLastSynced(now);
        updateMeta({ lastSynced: now });
        updateUnsyncedCount();
        if (!silent) alert(`Successfully synced ${payload.length} check-ins!`);
      } else {
        if (!silent) alert("Failed to sync check-ins. Please try again later.");
      }
    } catch (error) {
      console.error(error);
      if (!silent) alert("Network error during sync.");
    } finally {
      setIsSyncing(false);
    }
  };

  const prepareForEvent = async () => {
    if (!navigator.onLine) {
      alert("You must be online to prepare for the event.");
      return;
    }
    
    setIsPreparing(true);
    try {
      const res = await fetch("/api/admin/scanner/preload");
      if (!res.ok) throw new Error("Failed to load tickets");
      
      const data = await res.json();
      const ticketMap: Record<string, OfflineTicket> = {};
      data.tickets.forEach((t: OfflineTicket) => {
        ticketMap[t.ticketId] = t;
      });

      setTickets(ticketMap);
      localStorage.setItem("vmex_tickets", JSON.stringify(ticketMap));
      
      const now = new Date().toISOString();
      setLastLoaded(now);
      updateMeta({ lastLoaded: now });
      
      alert(`Successfully loaded ${data.tickets.length} approved tickets.`);
    } catch (error) {
      console.error(error);
      alert("Error preparing for event. Check network.");
    } finally {
      setIsPreparing(false);
    }
  };

  const updateMeta = (updates: Partial<{ lastLoaded: string | null; lastSynced: string | null }>) => {
    const meta = JSON.parse(localStorage.getItem("vmex_scanner_meta") || "{}");
    const newMeta = { ...meta, ...updates };
    localStorage.setItem("vmex_scanner_meta", JSON.stringify(newMeta));
  };

  const stopCamera = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    if (Object.keys(tickets).length === 0) {
      alert("Please 'Prepare for Event' first to load ticket data.");
      return;
    }

    setStatus("scanning");
    setMessage("Starting camera...");
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setMessage("Point at ticket QR code");
      scanFrame();
    } catch {
      setStatus("error");
      setMessage("Camera access denied. Allow camera in browser settings.");
    }
  };

  const scanFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code && code.data && code.data !== lastScannedRef.current && !cooldownRef.current) {
      lastScannedRef.current = code.data;
      cooldownRef.current = true;
      handleQrData(code.data);
      setTimeout(() => { cooldownRef.current = false; }, 3000); // Shorter cooldown for offline
    }
    rafRef.current = requestAnimationFrame(scanFrame);
  };

  const handleQrData = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      const { ticketId } = parsed;
      
      if (!ticketId) {
        setStatus("invalid");
        setMessage("Invalid QR Format");
        return;
      }

      const ticket = tickets[ticketId];
      if (!ticket) {
        setStatus("invalid");
        setMessage("Ticket not found (Unapproved or Invalid)");
        return;
      }

      const checkins: LocalCheckins = JSON.parse(localStorage.getItem("vmex_checkins") || "{}");
      
      if (ticket.checkedIn || checkins[ticketId]) {
        setStatus("already_checked_in");
        const time = checkins[ticketId] || ticket.checkedInAt;
        const formattedTime = time ? new Date(time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "earlier";
        setMessage(`Already Checked In at ${formattedTime}`);
        setResult(ticket);
        return;
      }

      // Valid and not checked in -> Check them in locally!
      const now = new Date().toISOString();
      checkins[ticketId] = now;
      localStorage.setItem("vmex_checkins", JSON.stringify(checkins));
      updateUnsyncedCount();

      setStatus("found");
      setMessage("VALID ✓");
      setResult(ticket);

    } catch {
      setStatus("invalid");
      setMessage("Unrecognised QR code.");
    }
  };

  const handleScanNext = () => {
    lastScannedRef.current = "";
    cooldownRef.current = false;
    setStatus("scanning");
    setResult(null);
    setMessage("Point at ticket QR code");
  };

  const statusColor = {
    idle: "border-gold/20 text-text-muted",
    scanning: "border-gold/30 text-gold/70",
    found: "border-emerald-500/60 text-emerald-400",
    already_checked_in: "border-amber-500/60 text-amber-500",
    invalid: "border-[#e05c5c]/60 text-[#e05c5c]",
    error: "border-[#e05c5c]/60 text-[#e05c5c]",
  }[status];

  return (
    <div className="min-h-screen bg-[#000] flex flex-col">

      {/* Video element ALWAYS in DOM so ref is valid when startCamera sets srcObject */}
      <video
        ref={videoRef}
        className={`fixed inset-0 w-full h-full object-cover z-0 ${cameraActive ? "block" : "hidden"}`}
        playsInline
        autoPlay
        muted
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-4 bg-black/60 backdrop-blur-md border-b border-gold/10">
        <button
          type="button"
          onClick={() => { stopCamera(); router.back(); }}
          className="inline-flex items-center gap-2 font-body text-[0.72rem] tracking-[0.12em] uppercase text-white/70 hover:text-white transition-colors px-2 py-1"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Dashboard
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded">
            <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-[#e05c5c] animate-pulse"}`} />
            <span className="font-body text-[0.6rem] tracking-[0.1em] uppercase text-white/60">
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </header>

      {/* Dashboard panel — shown when camera is off */}
      {!cameraActive && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0b0b0d] pt-20 relative z-10">
          <div className="w-full max-w-md space-y-6">
            
            <div className="text-center">
              <h1 className="font-display text-3xl text-gold mb-2">Offline Scanner</h1>
              <p className="text-text-muted text-sm leading-relaxed">
                This scanner works completely offline. You must &quot;Prepare&quot; before doors open to download the guest list.
              </p>
            </div>

            <div className="bg-[#151316] border border-gold/20 p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-gold/10 pb-3">
                <span className="font-body text-[0.7rem] uppercase tracking-widest text-text-dim">Local Tickets</span>
                <span className="font-display font-bold text-xl">{Object.keys(tickets).length}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gold/10 pb-3">
                <span className="font-body text-[0.7rem] uppercase tracking-widest text-text-dim">Unsynced Scans</span>
                <span className={`font-display font-bold text-xl ${unsyncedCount > 0 ? "text-amber-500" : ""}`}>{unsyncedCount}</span>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="font-body text-[0.7rem] uppercase tracking-widest text-text-dim">Data As Of</span>
                <span className="font-body text-xs text-text-muted">
                  {lastLoaded ? new Date(lastLoaded).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Never"}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={prepareForEvent}
                disabled={isPreparing || !isOnline}
                className="w-full py-4 border border-gold text-gold font-body font-bold text-[0.8rem] tracking-[0.15em] uppercase hover:bg-gold/10 transition-colors disabled:opacity-40"
              >
                {isPreparing ? "Downloading..." : "1. Prepare For Event"}
              </button>
              
              <button
                onClick={startCamera}
                disabled={Object.keys(tickets).length === 0}
                className="w-full py-4 bg-gold text-[#0b0b0d] font-body font-bold text-[0.85rem] tracking-[0.15em] uppercase transition-colors hover:bg-gold/90 disabled:opacity-50"
              >
                2. Start Scanning
              </button>

              <button
                onClick={() => syncCheckins(false)}
                disabled={isSyncing || unsyncedCount === 0 || !isOnline}
                className="w-full py-3 text-text-muted text-[0.75rem] tracking-[0.1em] uppercase hover:text-white transition-colors disabled:opacity-30"
              >
                {isSyncing ? "Syncing..." : "Force Background Sync"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera overlays — shown when camera is active */}
      {cameraActive && (
        <>
          {/* Scan frame overlay */}
          {status === "scanning" && (
            <div className="fixed inset-0 z-10 flex items-center justify-center pointer-events-none">
              <div className="absolute inset-0 bg-black/40" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, 10% 25%, 90% 25%, 90% 75%, 10% 75%, 10% 25%)" }} />
              <div className="relative w-64 h-64">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold" />
                <div className="absolute left-1 right-1 h-px bg-gold/60 animate-[scanline_2s_ease-in-out_infinite]" style={{ top: "50%" }} />
              </div>
            </div>
          )}

          {/* Result overlay */}
          {(status === "found" || status === "invalid" || status === "already_checked_in" || status === "error") && (
            <div className={`fixed inset-0 z-10 flex flex-col items-center justify-center p-6 ${
              status === "found" ? "bg-emerald-900/90 backdrop-blur-sm" : 
              status === "already_checked_in" ? "bg-amber-900/90 backdrop-blur-sm" :
              "bg-red-900/90 backdrop-blur-sm"
            }`}>
              <div className={`text-center ${
                status === "found" ? "text-emerald-400" : 
                status === "already_checked_in" ? "text-amber-400" :
                "text-[#ff6b6b]"
              }`}>
                {status === "found" ? (
                  <svg width="80" height="80" viewBox="0 0 64 64" fill="none" className="mx-auto mb-4">
                    <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="3" />
                    <path d="M20 32l9 9 15-15" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : status === "already_checked_in" ? (
                  <svg width="80" height="80" viewBox="0 0 64 64" fill="none" className="mx-auto mb-4">
                    <path d="M32 4a28 28 0 100 56 28 28 0 000-56zM32 16v18l12 12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="80" height="80" viewBox="0 0 64 64" fill="none" className="mx-auto mb-4">
                    <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="3" />
                    <path d="M22 22l20 20M42 22L22 42" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                )}
                <p className="font-display text-4xl font-bold mb-2">{message}</p>
                
                {result && (
                  <div className="mt-8 space-y-2">
                    <p className="font-display text-3xl text-white">{result.attendeeName}</p>
                    <p className="font-body text-xl text-white/80">{result.tierName} × {result.quantity}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom panel */}
          <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#0b0b0d] border-t border-gold/10">
            <div className={`px-5 py-3 border-b ${statusColor} border-opacity-30 flex justify-between items-center`}>
              <p className={`font-body text-[0.78rem] tracking-[0.1em] uppercase ${statusColor.split(" ")[1]}`}>
                {status === "scanning" ? "Ready to scan" : "Scan complete"}
              </p>
              <span className="font-body text-[0.6rem] uppercase tracking-widest text-text-dim">
                Unsynced: {unsyncedCount}
              </span>
            </div>

            <div className="p-4 flex gap-3">
              <button
                type="button"
                onClick={handleScanNext}
                disabled={status === "scanning" && !result}
                className="flex-1 py-4 bg-gold text-[#0b0b0d] font-body font-bold text-[0.85rem] tracking-[0.15em] uppercase transition-colors hover:bg-gold/90 disabled:opacity-30 disabled:bg-gold/10 disabled:text-gold"
              >
                {status === "scanning" ? "Scanning..." : "Scan Next"}
              </button>
              
              <button
                type="button"
                onClick={stopCamera}
                className="py-4 px-6 border border-gold/20 text-text-muted hover:border-gold/50 hover:text-white transition-colors font-body text-[0.85rem] tracking-[0.15em] uppercase"
              >
                Stop
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes scanline {
          0%, 100% { transform: translateY(-100px); opacity: 0; }
          20%, 80% { opacity: 1; }
          50% { transform: translateY(100px); }
        }
      `}</style>
    </div>
  );
}
