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
      <div style={{ minHeight: "100dvh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)", fontSize: "0.9rem" }}>Verifying session…</p>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-primary)", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>

        <header style={{ textAlign: "center", marginBottom: "2rem" }}>
          <a href="/admin" style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--text-muted)", textDecoration: "none" }}>← Back to Admin</a>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: "var(--text-primary)", marginTop: "1rem" }}>
            Entry Scanner
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--text-dim)" }}>
            Point camera at attendee's ticket QR
          </p>
        </header>

        {/* Camera window — visible only when idle/checking */}
        <div style={{
          display: (scanState.status === "idle" || scanState.status === "checking") ? "block" : "none",
          border: "2px solid rgba(212,175,55,0.3)",
          borderRadius: "12px",
          overflow: "hidden",
          background: "#000",
          position: "relative",
        }}>
          <div id="reader" style={{ width: "100%", border: "none" }} />
          {scanState.status === "checking" && (
            <div style={{
              position: "absolute", inset: 0,
              background: "rgba(11,11,13,0.8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexDirection: "column", gap: "1rem",
            }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ width: 40, height: 40, border: "3px solid var(--gold)", borderTopColor: "transparent", borderRadius: "50%" }}
              />
              <p style={{ fontFamily: "var(--font-body)", color: "var(--gold)", fontSize: "0.9rem" }}>Verifying ticket…</p>
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
              style={{
                background: "rgba(46,160,67,0.08)",
                border: "1px solid rgba(46,160,67,0.35)",
                padding: "2rem",
                textAlign: "center",
              }}
            >
              <div style={{ width: 64, height: 64, background: "#3fb950", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "#3fb950", marginBottom: "0.25rem" }}>Valid Ticket ✓</h2>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "0.25rem" }}>{scanState.attendeeName}</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>Checked in just now · {formatTime(scanState.checkedInAt)}</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", textAlign: "left", background: "var(--bg-primary)", padding: "1rem", border: "1px solid rgba(212,175,55,0.15)", marginBottom: "2rem" }}>
                <div>
                  <p style={{ fontSize: "0.6rem", textTransform: "uppercase", color: "var(--text-dim)", letterSpacing: "0.1em" }}>Order ID</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--gold-muted)", fontFamily: "monospace" }}>{scanState.orderId}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.6rem", textTransform: "uppercase", color: "var(--text-dim)", letterSpacing: "0.1em" }}>Ticket</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-primary)" }}>{scanState.tier}</p>
                </div>
              </div>

              <button onClick={resetScanner} className="btn-gold" style={{ width: "100%" }}>
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
              style={{
                background: "rgba(224,140,0,0.08)",
                border: "1px solid rgba(224,140,0,0.5)",
                padding: "2rem",
                textAlign: "center",
              }}
            >
              <div style={{ width: 64, height: 64, background: "#e08c00", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "#e08c00", marginBottom: "0.25rem" }}>Already Checked In ⚠</h2>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "0.25rem" }}>{scanState.attendeeName}</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                {scanState.checkedInAt > 0
                  ? `Previously checked in at ${formatTime(scanState.checkedInAt)}`
                  : "This ticket was already used for entry"}
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "#e08c00", marginBottom: "1.5rem", border: "1px solid rgba(224,140,0,0.3)", padding: "0.75rem", background: "rgba(224,140,0,0.05)" }}>
                Do NOT allow entry — this QR has already been scanned.
              </p>

              <button onClick={resetScanner} className="btn-gold-outline" style={{ width: "100%" }}>
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
              style={{
                background: "rgba(224,92,92,0.08)",
                border: "1px solid rgba(224,92,92,0.4)",
                padding: "2rem",
                textAlign: "center",
              }}
            >
              <div style={{ width: 64, height: 64, background: "#e05c5c", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "#e05c5c", marginBottom: "0.5rem" }}>
                {scanState.reason === "bad_format" ? "Invalid QR Code" :
                 scanState.reason === "not_found" ? "Ticket Not Found" :
                 scanState.reason === "refunded" ? "Ticket Refunded — Do Not Admit" :
                 "Payment Not Verified"}
              </h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                {scanState.reason === "bad_format" && "This QR code is not a Masquerade Night ticket."}
                {scanState.reason === "not_found" && "No order matching this QR exists in the system."}
                {scanState.reason === "not_approved" && "This booking was not approved — payment may be pending or rejected."}
                {scanState.reason === "refunded" && "This order has been refunded and the ticket is permanently void."}
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "#e05c5c", marginBottom: "1.5rem", border: "1px solid rgba(224,92,92,0.3)", padding: "0.75rem", background: "rgba(224,92,92,0.05)" }}>
                Deny entry and contact the admin team if needed.
              </p>

              <button onClick={resetScanner} className="btn-gold-outline" style={{ width: "100%" }}>
                Try Again →
              </button>
            </motion.div>
          )}

          {scanState.status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "rgba(100,100,100,0.08)",
                border: "1px solid rgba(100,100,100,0.4)",
                padding: "2rem",
                textAlign: "center",
              }}
            >
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Something went wrong</h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--text-dim)", marginBottom: "1.5rem" }}>{scanState.message}</p>
              <button onClick={resetScanner} className="btn-gold-outline" style={{ width: "100%" }}>Retry →</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        #reader { border: none !important; }
        #reader button {
          background: var(--gold) !important;
          color: #000 !important;
          border: none !important;
          padding: 8px 16px !important;
          font-family: var(--font-body) !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          margin-bottom: 10px;
        }
        #reader select {
          background: var(--bg-card) !important;
          color: var(--text-primary) !important;
          border: 1px solid rgba(212,175,55,0.3) !important;
          padding: 6px !important;
          margin-bottom: 10px;
        }
        #reader a { display: none !important; }
      `}</style>
    </div>
  );
}
