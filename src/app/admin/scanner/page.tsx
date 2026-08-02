"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";

interface ScanResult {
  ticketId: string;
  orderId: string;
  attendeeName: string;
  tierName: string;
  quantity: number;
  status: string;
  college: string;
  phone: string;
}

type ScanStatus = "idle" | "scanning" | "found" | "invalid" | "error";

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
  const [result, setResult] = useState<ScanResult | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const stopCamera = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Auto-start camera on mount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
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
      setTimeout(() => { cooldownRef.current = false; }, 4000);
    }
    rafRef.current = requestAnimationFrame(scanFrame);
  };

  const handleQrData = async (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      const { ticketId } = parsed;
      if (!ticketId) {
        setStatus("invalid");
        setMessage("Not a valid TheVMEx ticket.");
        return;
      }
      setMessage("Verifying...");
      const res = await fetch(`/api/orders/lookup?q=${encodeURIComponent(ticketId)}`);
      const data = await res.json();
      if (!res.ok || !data.orders?.length) {
        setStatus("invalid");
        setMessage("Ticket not found in system.");
        return;
      }
      const order = data.orders[0];
      if (order.status !== "approved") {
        setStatus("invalid");
        setMessage(`Status: ${order.status.toUpperCase()}. Entry denied.`);
        return;
      }
      setStatus("found");
      setMessage("VALID TICKET");
      setResult({
        ticketId: order.ticketId,
        orderId: order.orderId,
        attendeeName: order.attendeeName,
        tierName: order.tierName,
        quantity: order.quantity,
        status: order.status,
        college: order.college,
        phone: order.phone,
      });
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
    invalid: "border-[#e05c5c]/60 text-[#e05c5c]",
    error: "border-[#e05c5c]/60 text-[#e05c5c]",
  }[status];

  return (
    <div className="min-h-screen bg-[#000] flex flex-col">
      {/* Top bar */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-4">
        <button
          type="button"
          onClick={() => { stopCamera(); router.back(); }}
          className="inline-flex items-center gap-2 font-body text-[0.72rem] tracking-[0.12em] uppercase text-white/70 hover:text-white transition-colors bg-black/40 backdrop-blur-sm px-3 py-2 rounded-sm"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Dashboard
        </button>
        <div className="bg-black/40 backdrop-blur-sm px-3 py-2 rounded-sm">
          <p className="font-body text-[0.65rem] tracking-[0.2em] uppercase text-white/50">Scanner</p>
        </div>
      </header>

      {/* Full-screen camera */}
      <div className="relative flex-1 bg-black overflow-hidden" style={{ minHeight: "60vh" }}>
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Scan frame overlay */}
        {cameraActive && status === "scanning" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Dimmed corners */}
            <div className="absolute inset-0 bg-black/40" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, 10% 25%, 90% 25%, 90% 75%, 10% 75%, 10% 25%)" }} />
            {/* QR target frame */}
            <div className="relative w-56 h-56">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold" />
              {/* Scan line animation */}
              <div className="absolute left-1 right-1 h-px bg-gold/60 animate-[scanline_2s_ease-in-out_infinite]" style={{ top: "50%" }} />
            </div>
          </div>
        )}

        {/* Result overlay for found/invalid */}
        {(status === "found" || status === "invalid" || status === "error") && (
          <div className={`absolute inset-0 flex items-center justify-center ${
            status === "found" ? "bg-emerald-900/30" : "bg-red-900/30"
          }`}>
            <div className={`text-center p-6 ${
              status === "found" ? "text-emerald-400" : "text-[#e05c5c]"
            }`}>
              {status === "found" ? (
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mx-auto mb-3">
                  <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 32l9 9 15-15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mx-auto mb-3">
                  <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" />
                  <path d="M22 22l20 20M42 22L22 42" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
              <p className="font-display text-[1.4rem] font-bold">{message}</p>
            </div>
          </div>
        )}

        {/* Camera off state */}
        {!cameraActive && status !== "error" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-body text-[0.8rem] text-white/40 tracking-widest uppercase">{message}</p>
          </div>
        )}
      </div>

      {/* Bottom panel */}
      <div className="bg-[#0b0b0d] border-t border-gold/10 safe-area-inset-bottom">
        {/* Status bar */}
        <div className={`px-5 py-3 border-b ${statusColor} border-opacity-30`}>
          <p className={`font-body text-[0.78rem] tracking-[0.1em] text-center ${statusColor.split(" ")[1]}`}>
            {message || "Initialising..."}
          </p>
        </div>

        {/* Scan result details */}
        {status === "found" && result && (
          <div className="px-5 py-4 space-y-2 border-b border-gold/[0.07]">
            <div className="flex items-center justify-between">
              <p className="font-display text-[1.2rem] font-bold text-text-primary">{result.attendeeName}</p>
              <span className="font-body text-[0.6rem] tracking-[0.15em] uppercase text-emerald-400 border border-emerald-500/30 px-2 py-1">Admitted</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
              <div>
                <p className="font-body text-[0.6rem] uppercase tracking-widest text-text-dim">Ticket ID</p>
                <p className="font-mono text-[0.8rem] text-gold">{result.ticketId}</p>
              </div>
              <div>
                <p className="font-body text-[0.6rem] uppercase tracking-widest text-text-dim">Tier</p>
                <p className="font-body text-[0.82rem] text-text-primary">{result.tierName} × {result.quantity}</p>
              </div>
              <div>
                <p className="font-body text-[0.6rem] uppercase tracking-widest text-text-dim">College</p>
                <p className="font-body text-[0.82rem] text-text-muted truncate">{result.college}</p>
              </div>
              <div>
                <p className="font-body text-[0.6rem] uppercase tracking-widest text-text-dim">Phone</p>
                <p className="font-body text-[0.82rem] text-text-muted">{result.phone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="p-4">
          {status === "error" ? (
            <button
              type="button"
              onClick={startCamera}
              className="w-full py-4 bg-gold text-[#0b0b0d] font-body font-bold text-[0.85rem] tracking-[0.12em] uppercase"
            >
              Retry Camera
            </button>
          ) : (
            <button
              type="button"
              onClick={handleScanNext}
              disabled={status === "scanning" && !result}
              className="w-full py-4 border border-gold/40 text-gold font-body font-semibold text-[0.85rem] tracking-[0.12em] uppercase hover:bg-gold/10 transition-colors disabled:opacity-30"
            >
              {status === "found" || status === "invalid" ? "Scan Next Ticket" : "Scanning..."}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes scanline {
          0%, 100% { transform: translateY(-80px); opacity: 0; }
          20%, 80% { opacity: 1; }
          50% { transform: translateY(80px); }
        }
      `}</style>
    </div>
  );
}
