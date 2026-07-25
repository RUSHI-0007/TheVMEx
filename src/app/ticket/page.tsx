"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import { EVENT } from "@/lib/config";
import { toJpeg } from "html-to-image";
import { useRef, useState as useReactState } from "react";

interface Order {
  id: string;
  ticket_tier_label: string;
  quantity: number;
  payable_amount: string;
  attendee_name: string;
  attendee_phone: string;
  attendee_email: string;
  attendee_college: string;
  attendee_year: string;
  status: string;
  utr: string | null;
  rejection_reason: string | null;
  handled_by_name: string | null;
  ticket_qr_code: string | null;
  created_at: number;
  expires_at: number;
}

// ─── Approved Ticket Stub ─────────────────────────────────────────────────────
function TicketStub({ order }: { order: Order }) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useReactState(false);

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toJpeg(ticketRef.current, {
        quality: 0.95,
        backgroundColor: "#0B0B0D",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `VMEX-Ticket-${order.id}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download ticket", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{ maxWidth: "480px", width: "100%", position: "relative", display: "flex", flexDirection: "column", gap: "1.5rem" }}
    >
      <div ref={ticketRef} style={{ position: "relative" }}>
        {/* Gold top bar */}
      <div style={{ height: "3px", background: "linear-gradient(90deg, transparent, var(--gold), var(--gold-muted), transparent)" }} />

      <div style={{ border: "1px solid rgba(212,175,55,0.3)", borderTop: "none", background: "var(--bg-card)", overflow: "hidden" }}>
        {/* Header */}
        <div
          style={{
            padding: "2rem",
            background: "linear-gradient(135deg, #0f0d10 0%, #1c1720 100%)",
            textAlign: "center",
            borderBottom: "1px dashed rgba(212,175,55,0.2)",
            position: "relative",
          }}
        >
          {/* Corner dots for perforation effect */}
          {[-1, 1].map((side) => (
            <div
              key={side}
              style={{
                position: "absolute",
                top: "50%",
                [side === -1 ? "left" : "right"]: "-12px",
                transform: "translateY(-50%)",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "var(--bg-primary)",
              }}
            />
          ))}

          <p style={{ fontFamily: "var(--font-script)", fontSize: "1rem", color: "var(--gold-muted)", marginBottom: "0.25rem" }}>TheVMEx presents</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
            MASQUERADE
          </h2>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 400, color: "var(--gold)", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
            NIGHT 2026
          </h3>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", letterSpacing: "0.12em", color: "var(--text-dim)", textTransform: "uppercase" }}>
            {EVENT.date}
          </p>
        </div>

        {/* Ticket body */}
        <div style={{ padding: "1.75rem 2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            {[
              ["Attendee", order.attendee_name],
              ["Ticket", `${order.ticket_tier_label} × ${order.quantity}`],
              ["College", order.attendee_college],
              ["Year", order.attendee_year],
            ].map(([l, v]) => (
              <div key={l}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.2rem" }}>{l}</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--text-primary)", lineHeight: 1.3 }}>{v}</p>
              </div>
            ))}
          </div>

          {/* Order ID */}
          <div style={{ borderTop: "1px solid rgba(212,175,55,0.1)", paddingTop: "1rem", marginBottom: "1.5rem" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.2rem" }}>Order ID</p>
            <p style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--gold-muted)", letterSpacing: "0.08em" }}>{order.id}</p>
          </div>

          {/* QR Code */}
          {order.ticket_qr_code && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", paddingTop: "1rem", borderTop: "1px dashed rgba(212,175,55,0.15)" }}>
              <div style={{ padding: "0.85rem", background: "#fff", display: "inline-flex" }}>
                <QRCode value={order.ticket_qr_code} size={120} fgColor="#0B0B0D" />
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-dim)", textAlign: "center" }}>
                Show this QR at the entry desk to be scanned by our team.
                <br />
                {EVENT.ageRestriction} · Valid ID required
              </p>
            </div>
          )}
        </div>

        {/* Bottom strip */}
        <div style={{ padding: "1rem 2rem", borderTop: "1px solid rgba(212,175,55,0.1)", display: "flex", justifyContent: "center" }}>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#3fb950",
              background: "rgba(46,160,67,0.1)",
              border: "1px solid rgba(46,160,67,0.25)",
              padding: "0.3rem 0.75rem",
            }}
          >
            ✓ Confirmed &amp; Approved
          </span>
        </div>
      </div>

      {/* Gold bottom bar */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--gold-dim), transparent)" }} />
      </div>
      
      {/* Download Action outside the capture area */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="btn-gold"
        style={{ alignSelf: "center", display: "flex", alignItems: "center", gap: "0.5rem" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {downloading ? "Saving..." : "Save Ticket as Image"}
      </button>
    </motion.div>
  );
}

// ─── Pending State ─────────────────────────────────────────────────────────────
function PendingState({ order }: { order: Order }) {
  const remaining = Math.max(0, order.expires_at - Math.floor(Date.now() / 1000));
  const mins = Math.floor(remaining / 60);

  return (
    <div style={{ maxWidth: "440px", width: "100%", textAlign: "center" }}>
      <div style={{ width: "56px", height: "56px", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", background: "rgba(212,175,55,0.05)" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="9.5" stroke="rgba(212,175,55,0.2)" strokeWidth="1" />
            <path d="M11 1.5A9.5 9.5 0 0 1 20.5 11" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.div>
      </div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.75rem" }}>
        Verification Pending
      </h2>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
        Your payment proof has been received. Our team is verifying it against the UPI transaction history. Most approvals complete within <strong style={{ color: "var(--text-primary)" }}>1–2 hours</strong>.
      </p>
      <div style={{ border: "1px solid rgba(212,175,55,0.15)", background: "var(--bg-card)", padding: "1.25rem", marginBottom: "1.5rem", textAlign: "left" }}>
        {[
          ["Order ID", order.id],
          ["Amount", `₹${order.payable_amount}`],
          ["Attendee", order.attendee_name],
          ["Expires in", `~${mins} min`],
        ].map(([l, v]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.6rem", borderBottom: "1px solid rgba(212,175,55,0.07)", marginBottom: "0.6rem" }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--text-dim)" }}>{l}</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--text-muted)" }}>{v}</span>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--text-dim)", lineHeight: 1.6 }}>
        Not approved yet?{" "}
        <a href={EVENT.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-muted)", textDecoration: "underline" }}>
          Contact us on WhatsApp
        </a>{" "}
        with your Order ID.
      </p>
    </div>
  );
}

// ─── Rejected State ───────────────────────────────────────────────────────────
function RejectedState({ order }: { order: Order }) {
  return (
    <div style={{ maxWidth: "440px", width: "100%", textAlign: "center" }}>
      <div style={{ width: "56px", height: "56px", border: "1px solid rgba(224,92,92,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", background: "rgba(224,92,92,0.05)" }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="9.5" stroke="rgba(224,92,92,0.4)" strokeWidth="1" />
          <path d="M7 7l8 8M15 7l-8 8" stroke="#e05c5c" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.75rem" }}>
        Order Rejected
      </h2>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1rem" }}>
        Your order could not be verified. The reason given was:
      </p>
      {order.rejection_reason && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "#e05c5c", marginBottom: "1.5rem", padding: "0.75rem 1rem", border: "1px solid rgba(224,92,92,0.2)", background: "rgba(224,92,92,0.05)" }}>
          {order.rejection_reason}
        </p>
      )}
      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
        If you believe this is an error, contact us on{" "}
        <a href={EVENT.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-muted)", textDecoration: "underline" }}>
          WhatsApp
        </a>{" "}
        with your Order ID <strong style={{ color: "var(--gold-muted)", fontFamily: "monospace" }}>{order.id}</strong> and UTR number.
      </p>
      <a href="#tickets" className="btn-gold" style={{ display: "inline-block" }}>
        Rebook Ticket →
      </a>
    </div>
  );
}

// ─── Lookup Form ──────────────────────────────────────────────────────────────
function LookupForm({ onResult }: { onResult: (orders: Order[]) => void }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"orderId" | "phone" | "email">("orderId");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ [type]: query.trim() });
      const res = await fetch(`/api/orders/lookup?${params}`);
      const data = await res.json();
      if (!res.ok) { setError("Something went wrong."); return; }
      if (!data.orders?.length) { setError("No orders found. Check your Order ID, phone, or email."); return; }
      onResult(data.orders);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "440px" }}>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {(["orderId", "phone", "email"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.68rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "0.4rem 0.85rem",
              background: type === t ? "var(--gold)" : "transparent",
              color: type === t ? "var(--bg-primary)" : "var(--text-muted)",
              border: `1px solid ${type === t ? "var(--gold)" : "rgba(212,175,55,0.2)"}`,
              cursor: "pointer",
            }}
          >
            {t === "orderId" ? "Order ID" : t === "phone" ? "Phone" : "Email"}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
        <input
          className="input-field"
          placeholder={type === "orderId" ? "VMX-XXXXXXXX" : type === "phone" ? "+91 XXXXX XXXXX" : "your@email.com"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{ flex: 1 }}
        />
        <button
          className="btn-gold"
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          style={{ flexShrink: 0, padding: "0.75rem 1.25rem", opacity: loading || !query.trim() ? 0.5 : 1, cursor: loading || !query.trim() ? "not-allowed" : "pointer" }}
        >
          {loading ? "…" : "Find"}
        </button>
      </div>
      {error && <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "#e05c5c" }}>{error}</p>}
    </div>
  );
}

// ─── Inner Page (uses useSearchParams) ───────────────────────────────────────
function TicketPageInner() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[] | null>(null);

  // Auto-lookup if orderId is in URL (from pending screen CTA)
  useEffect(() => {
    const id = searchParams.get("orderId");
    if (!id) return;
    fetch(`/api/orders/lookup?orderId=${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.orders?.length) setOrders(d.orders); })
      .catch(() => {});
  }, [searchParams]);

  const latestOrder = orders?.[0];

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg-primary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{ textAlign: "center", marginBottom: "2.5rem" }}
      >
        <a href="/" style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", textDecoration: "none", letterSpacing: "0.08em" }}>
          ← TheVMEx
        </a>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 700, color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "0.5rem" }}>
          Your Ticket
        </h1>
        <p style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", color: "var(--text-muted)" }}>
          Masquerade Night · 21 Aug 2026
        </p>
      </motion.div>

      {/* Lookup form (shown if no order found yet) */}
      {!latestOrder && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} style={{ marginBottom: "2.5rem" }}>
          <LookupForm onResult={setOrders} />
        </motion.div>
      )}

      {/* Order result */}
      {latestOrder && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem", width: "100%" }}>
          {latestOrder.status === "approved" && <TicketStub order={latestOrder} />}
          {latestOrder.status === "pending" && <PendingState order={latestOrder} />}
          {latestOrder.status === "rejected" && <RejectedState order={latestOrder} />}
          {latestOrder.status === "expired" && (
            <div style={{ textAlign: "center", maxWidth: "420px" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--text-muted)", marginBottom: "1rem" }}>Order Expired</h2>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                This order expired before payment was verified. The seat has been released. You can rebook below.
              </p>
              <a href="/#tickets" className="btn-gold">Rebook →</a>
            </div>
          )}

          {/* Search again */}
          {orders && (
            <button
              onClick={() => setOrders(null)}
              style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
            >
              Search a different order
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────
export default function TicketPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100dvh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--text-dim)" }}>Loading…</p>
      </div>
    }>
      <TicketPageInner />
    </Suspense>
  );
}
