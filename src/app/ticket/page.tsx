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
      className="max-w-[480px] w-full relative flex flex-col gap-6"
    >
      <div ref={ticketRef} className="relative">
        {/* Gold top bar */}
      <div className="h-[3px] bg-[linear-gradient(90deg,transparent,var(--color-gold),var(--color-gold-muted),transparent)]" />

      <div className="border border-t-0 border-gold/30 bg-[#18151a] overflow-hidden">
        {/* Header */}
        <div
          className="p-8 text-center border-b border-dashed border-gold/20 relative bg-[linear-gradient(135deg,#0f0d10_0%,#1c1720_100%)]"
        >
          {/* Corner dots for perforation effect */}
          {[-1, 1].map((side) => (
            <div
              key={side}
              className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0b0b0d] ${side === -1 ? "-left-3" : "-right-3"}`}
            />
          ))}

          <p className="font-script text-[1rem] text-gold-muted mb-1">TheVMEx presents</p>
          <h2 className="font-display text-[1.8rem] font-bold text-text-primary tracking-[0.05em] mb-1">
            MASQUERADE
          </h2>
          <h3 className="font-display text-[1.2rem] font-normal text-gold tracking-[0.1em] mb-2">
            NIGHT 2026
          </h3>
          <p className="font-body text-[0.72rem] tracking-[0.12em] text-text-dim uppercase">
            {EVENT.date}
          </p>
        </div>

        {/* Ticket body */}
        <div className="py-7 px-8">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              ["Attendee", order.attendee_name],
              ["Ticket", `${order.ticket_tier_label} × ${order.quantity}`],
              ["College", order.attendee_college],
              ["Year", order.attendee_year],
            ].map(([l, v]) => (
              <div key={l}>
                <p className="font-body text-[0.55rem] tracking-[0.2em] uppercase text-text-dim mb-1">{l}</p>
                <p className="font-body text-[0.82rem] text-text-primary leading-[1.3]">{v}</p>
              </div>
            ))}
          </div>

          {/* Order ID */}
          <div className="border-t border-gold/10 pt-4 mb-6">
            <p className="font-body text-[0.55rem] tracking-[0.2em] uppercase text-text-dim mb-1">Order ID</p>
            <p className="font-mono text-[0.85rem] text-gold-muted tracking-[0.08em]">{order.id}</p>
          </div>

          {/* QR Code */}
          {order.ticket_qr_code && (
            <div className="flex flex-col items-center gap-3 pt-4 border-t border-dashed border-gold/15">
              <div className="p-3.5 bg-white inline-flex">
                <QRCode value={order.ticket_qr_code} size={120} fgColor="#0B0B0D" />
              </div>
              <p className="font-body text-[0.6rem] tracking-[0.15em] uppercase text-text-dim text-center">
                Show this QR at the entry desk to be scanned by our team.
                <br />
                {EVENT.ageRestriction} · Valid ID required
              </p>
            </div>
          )}
        </div>

        {/* Bottom strip */}
        <div className="py-4 px-8 border-t border-gold/10 flex justify-center">
          <span
            className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-[#3fb950] bg-[#2ea043]/10 border border-[#2ea043]/25 py-1.5 px-3"
          >
            ✓ Confirmed &amp; Approved
          </span>
        </div>
      </div>

      {/* Gold bottom bar */}
      <div className="h-px bg-[linear-gradient(90deg,transparent,var(--color-gold-dim),transparent)]" />
      </div>
      
      {/* Download Action outside the capture area */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="relative inline-flex self-center items-center justify-center gap-2 px-8 py-3 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-[#0b0b0d] bg-gold border border-gold hover:bg-gold-muted hover:border-gold-muted transition-colors duration-400 whitespace-nowrap"
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
    <div className="max-w-[440px] w-full text-center">
      <div className="w-14 h-14 border border-gold/30 rounded-full flex items-center justify-center mx-auto mb-6 bg-gold/5">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="9.5" stroke="rgba(212,175,55,0.2)" strokeWidth="1" />
            <path d="M11 1.5A9.5 9.5 0 0 1 20.5 11" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.div>
      </div>
      <h2 className="font-display text-[1.5rem] font-bold text-text-primary mb-3">
        Verification Pending
      </h2>
      <p className="font-serif text-[1rem] text-text-muted leading-[1.8] mb-6">
        Your payment proof has been received. Our team is verifying it against the UPI transaction history. Most approvals complete within <strong className="text-text-primary">1–2 hours</strong>.
      </p>
      <div className="border border-gold/15 bg-[#18151a] p-5 mb-6 text-left">
        {[
          ["Order ID", order.id],
          ["Amount", `₹${order.payable_amount}`],
          ["Attendee", order.attendee_name],
          ["Expires in", `~${mins} min`],
        ].map(([l, v]) => (
          <div key={l} className="flex justify-between pb-2.5 border-b border-gold/[0.07] mb-2.5">
            <span className="font-body text-[0.72rem] text-text-dim">{l}</span>
            <span className="font-body text-[0.78rem] text-text-muted">{v}</span>
          </div>
        ))}
      </div>
      <p className="font-body text-[0.72rem] text-text-dim leading-[1.6]">
        Not approved yet?{" "}
        <a href={EVENT.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="text-gold-muted underline">
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
    <div className="max-w-[440px] w-full text-center">
      <div className="w-14 h-14 border border-[#e05c5c]/30 rounded-full flex items-center justify-center mx-auto mb-6 bg-[#e05c5c]/5">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="9.5" stroke="rgba(224,92,92,0.4)" strokeWidth="1" />
          <path d="M7 7l8 8M15 7l-8 8" stroke="#e05c5c" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="font-display text-[1.5rem] font-bold text-text-primary mb-3">
        Order Rejected
      </h2>
      <p className="font-serif text-[1rem] text-text-muted leading-[1.8] mb-4">
        Your order could not be verified. The reason given was:
      </p>
      {order.rejection_reason && (
        <p className="font-body text-[0.85rem] text-[#e05c5c] mb-6 py-3 px-4 border border-[#e05c5c]/20 bg-[#e05c5c]/5">
          {order.rejection_reason}
        </p>
      )}
      <p className="font-body text-[0.78rem] text-text-muted leading-[1.6] mb-6">
        If you believe this is an error, contact us on{" "}
        <a href={EVENT.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="text-gold-muted underline">
          WhatsApp
        </a>{" "}
        with your Order ID <strong className="text-gold-muted font-mono">{order.id}</strong> and UTR number.
      </p>
      <a href="/#tickets" className="relative inline-flex items-center justify-center gap-2 px-8 py-3 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-[#0b0b0d] bg-gold border border-gold hover:bg-gold-muted hover:border-gold-muted transition-colors duration-400 whitespace-nowrap">
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
    <div className="w-full max-w-[440px]">
      <div className="flex gap-2 mb-4 flex-wrap">
        {(["orderId", "phone", "email"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`font-body text-[0.68rem] tracking-[0.1em] uppercase px-3.5 py-1.5 border transition-colors duration-200 cursor-pointer ${type === t ? "bg-gold text-[#0b0b0d] border-gold" : "bg-transparent text-text-muted border-gold/20"}`}
          >
            {t === "orderId" ? "Order ID" : t === "phone" ? "Phone" : "Email"}
          </button>
        ))}
      </div>
      <div className="flex gap-3 mb-4">
        <input
          className="flex-1 px-4 py-3 bg-white/[0.03] border border-gold/20 text-text-primary font-body text-[0.9rem] outline-none transition-colors duration-300 focus:border-gold/50 focus:bg-gold/[0.03]"
          placeholder={type === "orderId" ? "VMX-XXXXXXXX" : type === "phone" ? "+91 XXXXX XXXXX" : "your@email.com"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          className={`shrink-0 relative inline-flex items-center justify-center gap-2 px-5 py-3 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-[#0b0b0d] bg-gold border border-gold transition-colors duration-400 whitespace-nowrap ${loading || !query.trim() ? "opacity-50 cursor-not-allowed" : "hover:bg-gold-muted hover:border-gold-muted cursor-pointer"}`}
          onClick={handleSearch}
          disabled={loading || !query.trim()}
        >
          {loading ? "…" : "Find"}
        </button>
      </div>
      {error && <p className="font-body text-[0.78rem] text-[#e05c5c]">{error}</p>}
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
    <div className="min-h-[100dvh] bg-[#0b0b0d] flex flex-col items-center justify-center py-8 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-10"
      >
        <a href="/" className="font-display text-[1rem] font-bold text-text-primary tracking-[0.08em] hover:text-gold transition-colors duration-200">
          ← TheVMEx
        </a>
        <h1 className="font-display text-[clamp(1.6rem,4vw,2.2rem)] font-bold text-text-primary mt-6 mb-2">
          Your Ticket
        </h1>
        <p className="font-serif text-[1rem] text-text-muted">
          Masquerade Night · 21 Aug 2026
        </p>
      </motion.div>

      {/* Lookup form (shown if no order found yet) */}
      {!latestOrder && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="mb-10 w-full max-w-[440px]">
          <LookupForm onResult={setOrders} />
        </motion.div>
      )}

      {/* Order result */}
      {latestOrder && (
        <div className="flex flex-col items-center gap-8 w-full">
          {latestOrder.status === "approved" && <TicketStub order={latestOrder} />}
          {latestOrder.status === "pending" && <PendingState order={latestOrder} />}
          {latestOrder.status === "rejected" && <RejectedState order={latestOrder} />}
          {latestOrder.status === "expired" && (
            <div className="text-center max-w-[420px]">
              <h2 className="font-display text-[1.5rem] text-text-muted mb-4">Order Expired</h2>
              <p className="font-serif text-[1rem] text-text-muted leading-[1.8] mb-6">
                This order expired before payment was verified. The seat has been released. You can rebook below.
              </p>
              <a href="/#tickets" className="relative inline-flex items-center justify-center gap-2 px-8 py-3 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-[#0b0b0d] bg-gold border border-gold hover:bg-gold-muted hover:border-gold-muted transition-colors duration-400 whitespace-nowrap">Rebook →</a>
            </div>
          )}

          {/* Search again */}
          {orders && (
            <button
              onClick={() => setOrders(null)}
              className="font-body text-[0.72rem] tracking-[0.1em] uppercase text-text-dim bg-transparent border-none cursor-pointer underline hover:text-gold transition-colors"
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
      <div className="min-h-[100dvh] bg-[#0b0b0d] flex items-center justify-center">
        <p className="font-body text-[0.8rem] text-text-dim">Loading…</p>
      </div>
    }>
      <TicketPageInner />
    </Suspense>
  );
}
