"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ──────────────────────────────────────────────────────────────────────
type ScanState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "valid"; orderId: string; attendeeName: string; tier: string; checkedInAt: number }
  | { status: "duplicate"; orderId: string; attendeeName: string; checkedInAt: number }
  | { status: "rejected"; reason: "not_approved" | "not_found" | "bad_format" | "refunded" }
  | { status: "error"; message: string };

// ── Helper: unix timestamp → readable time ────────────────────────────────────
function formatTime(unixTs: number): string {
  return new Date(unixTs * 1000).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ── Scanner component ─────────────────────────────────────────────────────────
export default function ScanPage() {
  const [scanState, setScanState] = useState<ScanState>({ status: "idle" });
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const processingRef = useRef(false); // prevents double-fires from scanner

  // ── Session guard ───────────────────────────────────────────────────────────
  useEffect(() => {
    // Hit a protected endpoint — if 401, not logged in
    fetch("/api/admin/orders")
      .then((r) => {
        if (r.ok) {
          setIsAuthorized(true);
        } else {
          window.location.href = "/admin";
        }
      })
      .catch(() => { window.location.href = "/admin"; })
      .finally(() => setSessionChecked(true));
  }, []);

  // ── QR scanner init ─────────────────────────────────────────────────────────
  const handleScanSuccess = useCallback(async (decodedText: string) => {
    // Prevent re-entry while a check is in flight
    if (processingRef.current) return;
    processingRef.current = true;

    // Pause the camera immediately so it doesn't fire again
    scannerRef.current?.pause(true);

    // Parse QR: expected format VMEX-VMX-XXXXXXXX-ATTENDEE_NAME
    const match = decodedText.match(/^VMEX-(VMX-[A-Z0-9]+)-(.+)$/);
    if (!match) {
      setScanState({ status: "rejected", reason: "bad_format" });
      processingRef.current = false;
      return;
    }

    const orderId = match[1];
    const attendeeName = match[2].replace(/_/g, " ");

    setScanState({ status: "checking" });

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/checkin`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        // Successfully checked in
        setScanState({
          status: "valid",
          orderId,
          attendeeName,
          tier: data.order?.ticket_tier_label ?? "—",
          checkedInAt: data.order?.checked_in_at ?? Math.floor(Date.now() / 1000),
        });
      } else if (res.status === 409) {
        // Already checked in
        setScanState({
          status: "duplicate",
          orderId,
          attendeeName,
          checkedInAt: data.checkedInAt ?? 0,
        });
      } else if (res.status === 403) {
        if (data.error === "refunded") {
          setScanState({ status: "rejected", reason: "refunded" });
        } else {
          setScanState({ status: "rejected", reason: "not_approved" });
        }
      } else if (res.status === 404) {
        setScanState({ status: "rejected", reason: "not_found" });
      } else if (res.status === 401) {
        // Session expired — redirect to login
        window.location.href = "/admin";
      } else {
        setScanState({ status: "error", message: data.error ?? "server_error" });
      }
    } catch (err) {
      setScanState({ status: "error", message: "Network error. Check connection." });
    } finally {
      processingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!isAuthorized) return;

    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 260, height: 260 } },
      false
    );
    scannerRef.current.render(handleScanSuccess, () => { /* frame failures are normal */ });

    return () => {
      scannerRef.current?.clear().catch(console.error);
    };
  }, [isAuthorized, handleScanSuccess]);

  const resetScanner = () => {
    setScanState({ status: "idle" });
    scannerRef.current?.resume();
  };

  // ── Loading / unauthorized ──────────────────────────────────────────────────
  if (!sessionChecked) {
    return (
      <div className="min-h-[100dvh] bg-[#0b0b0d] flex items-center justify-center">
        <p className="font-body text-text-muted text-[0.9rem]">Verifying session…</p>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] bg-[#0b0b0d] p-8 px-6">
      <div className="max-w-[500px] mx-auto">

        <header className="text-center mb-8">
          <a href="/admin" className="font-display text-[1rem] text-text-muted no-underline hover:text-gold transition-colors">← Back to Admin</a>
          <h1 className="font-display text-[1.8rem] text-text-primary mt-4 mb-2">
            Entry Scanner
          </h1>
          <p className="font-body text-[0.8rem] text-text-dim">
            Point camera at attendee's ticket QR
          </p>
        </header>

        {/* Camera window — visible only when idle/checking */}
        <div className={`relative border-2 border-gold/30 rounded-xl overflow-hidden bg-black ${(scanState.status === "idle" || scanState.status === "checking") ? "block" : "hidden"}`}>
          <div id="reader" className="w-full border-none [&_button]:bg-gold [&_button]:text-black [&_button]:border-none [&_button]:py-2 [&_button]:px-4 [&_button]:font-body [&_button]:font-semibold [&_button]:cursor-pointer [&_button]:mb-2.5 [&_select]:bg-[#18151a] [&_select]:text-text-primary [&_select]:border [&_select]:border-gold/30 [&_select]:p-1.5 [&_select]:mb-2.5 [&_a]:hidden" />
          {scanState.status === "checking" && (
            <div className="absolute inset-0 bg-[#0b0b0d]/80 flex flex-col items-center justify-center gap-4 z-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full"
              />
              <p className="font-body text-gold text-[0.9rem]">Verifying ticket…</p>
            </div>
          )}
        </div>

        {/* Result panels */}
        <AnimatePresence mode="wait">
          {scanState.status === "valid" && (
            <motion.div
              key="valid"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-[#2ea043]/10 border border-[#2ea043]/35 p-8 text-center"
            >
              <div className="w-16 h-16 bg-[#3fb950] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="font-display text-[1.6rem] text-[#3fb950] mb-1">Valid Ticket ✓</h2>
              <p className="font-display text-[1.1rem] text-text-primary mb-1">{scanState.attendeeName}</p>
              <p className="font-body text-[0.75rem] text-text-muted mb-6">Checked in just now · {formatTime(scanState.checkedInAt)}</p>

              <div className="grid grid-cols-2 gap-3 text-left bg-[#0b0b0d] p-4 border border-gold/15 mb-8">
                <div>
                  <p className="text-[0.6rem] uppercase text-text-dim tracking-[0.1em] mb-1">Order ID</p>
                  <p className="text-[0.78rem] text-gold-muted font-mono">{scanState.orderId}</p>
                </div>
                <div>
                  <p className="text-[0.6rem] uppercase text-text-dim tracking-[0.1em] mb-1">Ticket</p>
                  <p className="text-[0.78rem] text-text-primary">{scanState.tier}</p>
                </div>
              </div>

              <button onClick={resetScanner} className="w-full relative inline-flex items-center justify-center gap-2 px-8 py-3 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-[#0b0b0d] bg-gold border border-gold hover:bg-gold-muted hover:border-gold-muted transition-colors duration-400 whitespace-nowrap">
                Scan Next →
              </button>
            </motion.div>
          )}

          {scanState.status === "duplicate" && (
            <motion.div
              key="duplicate"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-[#e08c00]/10 border border-[#e08c00]/50 p-8 text-center"
            >
              <div className="w-16 h-16 bg-[#e08c00] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h2 className="font-display text-[1.6rem] text-[#e08c00] mb-1">Already Checked In ⚠</h2>
              <p className="font-display text-[1.1rem] text-text-primary mb-1">{scanState.attendeeName}</p>
              <p className="font-body text-[0.75rem] text-text-muted mb-6">
                {scanState.checkedInAt > 0
                  ? `Previously checked in at ${formatTime(scanState.checkedInAt)}`
                  : "This ticket was already used for entry"}
              </p>
              <p className="font-body text-[0.78rem] text-[#e08c00] mb-6 border border-[#e08c00]/30 p-3 bg-[#e08c00]/5">
                Do NOT allow entry — this QR has already been scanned.
              </p>

              <button onClick={resetScanner} className="w-full relative inline-flex items-center justify-center gap-2 px-8 py-3 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-gold bg-transparent border border-gold/40 hover:text-[#0b0b0d] hover:border-gold hover:bg-gold transition-colors duration-400 whitespace-nowrap group">
                <span className="absolute inset-0 bg-gold scale-x-0 origin-left transition-transform duration-400 group-hover:scale-x-100 -z-10" />
                Scan Another →
              </button>
            </motion.div>
          )}

          {scanState.status === "rejected" && (
            <motion.div
              key="rejected"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-[#e05c5c]/10 border border-[#e05c5c]/40 p-8 text-center"
            >
              <div className="w-16 h-16 bg-[#e05c5c] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <h2 className="font-display text-[1.6rem] text-[#e05c5c] mb-2">
                {scanState.reason === "bad_format" ? "Invalid QR Code" :
                 scanState.reason === "not_found" ? "Ticket Not Found" :
                 scanState.reason === "refunded" ? "Ticket Refunded — Do Not Admit" :
                 "Payment Not Verified"}
              </h2>
              <p className="font-body text-[0.85rem] text-text-muted mb-6">
                {scanState.reason === "bad_format" && "This QR code is not a Masquerade Night ticket."}
                {scanState.reason === "not_found" && "No order matching this QR exists in the system."}
                {scanState.reason === "not_approved" && "This booking was not approved — payment may be pending or rejected."}
                {scanState.reason === "refunded" && "This order has been refunded and the ticket is permanently void."}
              </p>
              <p className="font-body text-[0.78rem] text-[#e05c5c] mb-6 border border-[#e05c5c]/30 p-3 bg-[#e05c5c]/5">
                Deny entry and contact the admin team if needed.
              </p>

              <button onClick={resetScanner} className="w-full relative inline-flex items-center justify-center gap-2 px-8 py-3 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-gold bg-transparent border border-gold/40 hover:text-[#0b0b0d] hover:border-gold hover:bg-gold transition-colors duration-400 whitespace-nowrap group">
                <span className="absolute inset-0 bg-gold scale-x-0 origin-left transition-transform duration-400 group-hover:scale-x-100 -z-10" />
                Try Again →
              </button>
            </motion.div>
          )}

          {scanState.status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#646464]/10 border border-[#646464]/40 p-8 text-center"
            >
              <h2 className="font-display text-[1.4rem] text-text-muted mb-2">Something went wrong</h2>
              <p className="font-body text-[0.82rem] text-text-dim mb-6">{scanState.message}</p>
              <button onClick={resetScanner} className="w-full relative inline-flex items-center justify-center gap-2 px-8 py-3 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-gold bg-transparent border border-gold/40 hover:text-[#0b0b0d] hover:border-gold hover:bg-gold transition-colors duration-400 whitespace-nowrap group">
                <span className="absolute inset-0 bg-gold scale-x-0 origin-left transition-transform duration-400 group-hover:scale-x-100 -z-10" />
                Retry →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
