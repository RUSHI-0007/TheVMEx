"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { motion } from "framer-motion";

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [attendeeName, setAttendeeName] = useState<string | null>(null);
  
  useEffect(() => {
    // Only initialize scanner on the client side
    if (typeof window !== "undefined") {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      
      scannerRef.current.render(onScanSuccess, onScanFailure);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const onScanSuccess = (decodedText: string) => {
    // Expected format: VMEX-{orderId}-{ATTENDEE_NAME}
    if (decodedText.startsWith("VMEX-")) {
      const parts = decodedText.split("-");
      if (parts.length >= 3) {
        const id = parts[1] + "-" + parts[2]; // Reconstruct Order ID if it had a dash
        // Actually, order ID is VMX-XXXXXXXX. So decoded is VMEX-VMX-XXXXXXXX-NAME
        // Let's parse safely:
        const match = decodedText.match(/^VMEX-(VMX-[A-Z0-9]+)-(.*)$/);
        if (match) {
          if (scannerRef.current) {
            scannerRef.current.pause(true); // Pause scanning
          }
          setOrderId(match[1]);
          setAttendeeName(match[2].replace(/_/g, " "));
          setScanResult(decodedText);
          setError(null);
        } else {
          setError("Invalid Ticket Format");
        }
      }
    } else {
      setError("Not a Masquerade Ticket");
    }
  };

  const onScanFailure = (err: any) => {
    // Ignore scan failures (happens every frame it doesn't find a QR)
  };

  const resumeScanning = () => {
    setScanResult(null);
    setOrderId(null);
    setAttendeeName(null);
    setError(null);
    if (scannerRef.current) {
      scannerRef.current.resume();
    }
  };

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-primary)", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        
        <header style={{ textAlign: "center", marginBottom: "2rem" }}>
          <a href="/admin" style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--text-muted)", textDecoration: "none" }}>← Back to Admin</a>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: "var(--text-primary)", marginTop: "1rem" }}>
            Entry Scanner
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--text-dim)" }}>
            Scan attendee QR codes here
          </p>
        </header>

        {/* Scanner Window */}
        <div style={{ display: scanResult ? "none" : "block", border: "2px solid rgba(212,175,55,0.3)", borderRadius: "12px", overflow: "hidden", background: "#000" }}>
          <div id="reader" style={{ width: "100%", border: "none" }}></div>
        </div>

        {error && !scanResult && (
           <p style={{ color: "#e05c5c", textAlign: "center", marginTop: "1rem", fontFamily: "var(--font-body)", fontSize: "0.85rem" }}>
             ⚠ {error}
           </p>
        )}

        {/* Scan Result */}
        {scanResult && orderId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              background: "rgba(46,160,67,0.1)", 
              border: "1px solid rgba(46,160,67,0.3)", 
              padding: "2rem",
              textAlign: "center"
            }}
          >
            <div style={{ width: "64px", height: "64px", background: "#3fb950", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              Valid Ticket
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "1rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              {attendeeName}
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", textAlign: "left", background: "var(--bg-primary)", padding: "1rem", border: "1px solid rgba(212,175,55,0.2)", marginBottom: "2rem" }}>
              <div>
                <p style={{ fontSize: "0.6rem", textTransform: "uppercase", color: "var(--text-dim)", letterSpacing: "0.1em" }}>Order ID</p>
                <p style={{ fontSize: "0.8rem", color: "var(--gold-muted)", fontFamily: "monospace" }}>{orderId}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.6rem", textTransform: "uppercase", color: "var(--text-dim)", letterSpacing: "0.1em" }}>Status</p>
                <p style={{ fontSize: "0.8rem", color: "#3fb950" }}>Approved</p>
              </div>
            </div>

            <button onClick={resumeScanning} className="btn-gold" style={{ width: "100%" }}>
              Scan Next Ticket
            </button>
          </motion.div>
        )}
      </div>

      <style jsx global>{`
        /* Overrides for html5-qrcode UI */
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
