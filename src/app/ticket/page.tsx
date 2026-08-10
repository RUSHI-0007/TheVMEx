"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { EVENT } from "@/lib/config";
import { Button } from "@/components/ui/Button";
import { OrderCountdown } from "@/components/ui/CountdownTimer";
import { formatPayableAmount, formatCurrency } from "@/lib/utils";

interface OrderResult {
  orderId: string;
  ticketId: string | null;
  attendeeName: string;
  status: string;
  payableAmount: number;
  baseAmount: number;
  quantity: number;
  tierName: string;
  expiresAt: string | null;
  rejectionReason: string | null;
  ticketQr: string | null;
  handledByName: string | null;
}

function TicketLookupContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("orderId") ?? "";
  const isSuccess = searchParams.get("success") === "true";

  const [query, setQuery] = useState(initialQuery);
  const [orders, setOrders] = useState<OrderResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) handleSearch(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleSearch = async (q?: string) => {
    const searchQuery = (q ?? query).trim();
    if (!searchQuery) { setError("Enter your order ID, phone, or email"); return; }
    setLoading(true); setError(""); setSearched(true);
    try {
      const res = await fetch(`/api/orders/lookup?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Lookup failed");
      setOrders(data.orders);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080809] text-[#ede6da] relative overflow-hidden">
      {/* Rich layered background */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(212,175,55,0.12) 0%, transparent 65%)" }} className="absolute inset-0" />
        <div style={{ background: "radial-gradient(ellipse 40% 30% at 80% 80%, rgba(180,130,30,0.05) 0%, transparent 60%)" }} className="absolute inset-0" />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(212,175,55,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top nav bar */}
        <nav className="flex items-center justify-between px-5 py-5 border-b border-[#d4af37]/10 backdrop-blur-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-body text-[0.7rem] tracking-[0.15em] uppercase text-[#9a948c] hover:text-[#d4af37] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Return to event
          </Link>
          <span className="font-display text-[1rem] font-bold text-[#d4af37]">My Ticket</span>
        </nav>

        <div className="flex-1 px-5 py-10 sm:py-16 max-w-lg mx-auto w-full">
          {/* Success hero */}
          {isSuccess && (
            <div className="text-center mb-12">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
                <div className="relative w-20 h-20 border border-emerald-500/50 bg-emerald-900/20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.2)]">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M8 16l6 6 10-10" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <h1 className="font-display text-[2.2rem] sm:text-[2.8rem] text-[#d4af37] mb-2 leading-tight">
                Payment Confirmed
              </h1>
              <p className="font-body text-[0.88rem] text-[#9a948c]">
                Your ticket is secured. See you at {EVENT.name}!
              </p>
            </div>
          )}

          {/* Search form */}
          {!isSuccess && (
            <div className="mb-10">
              <h1 className="font-display text-[2.2rem] sm:text-[2.6rem] text-[#ede6da] mb-1">
                Check Your Ticket
              </h1>
              <p className="font-body text-[0.82rem] text-[#9a948c] mb-7">
                Look up by order ID, phone number, or email
              </p>
              <div className="flex gap-2.5">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="VMX-XXXXXX or phone/email"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 px-4 py-3 bg-[#151316] border border-[#d4af37]/20 text-[#ede6da] font-body text-[0.9rem] outline-none focus:border-[#d4af37]/60 transition-colors min-w-0 rounded-sm"
                />
                <Button variant="gold" onClick={() => handleSearch()} disabled={loading} className="px-6 shrink-0">
                  {loading ? "..." : "Find"}
                </Button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="border border-[#e05c5c]/30 bg-[#e05c5c]/[0.07] px-4 py-3 mb-6 rounded-sm">
              <p className="font-body text-[0.8rem] text-[#e05c5c]">{error}</p>
            </div>
          )}

          {/* No results */}
          {searched && !loading && orders.length === 0 && !error && (
            <div className="border border-[#d4af37]/15 bg-[#151316] px-6 py-12 text-center rounded-sm">
              <div className="text-3xl mb-3">🎭</div>
              <p className="font-display text-[1.3rem] text-[#d4af37] mb-1">No orders found</p>
              <p className="font-body text-[0.82rem] text-[#9a948c]">
                Double-check your order ID or contact details
              </p>
            </div>
          )}

          {/* Results */}
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.orderId}>
                {order.status === "approved" && order.ticketId ? (
                  <DigitalTicket order={order} />
                ) : (
                  <OrderStatusCard order={order} />
                )}
              </div>
            ))}
          </div>

          {isSuccess && (
            <div className="mt-12 text-center">
              <Link
                href="/"
                className="font-body text-[0.72rem] tracking-[0.18em] uppercase text-[#9a948c] hover:text-[#d4af37] transition-colors"
              >
                Return to Home Page
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderStatusCard({ order }: { order: OrderResult }) {
  const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; message: string; icon: string }> = {
    pending_verification: {
      label: "Pending Verification",
      color: "text-[#d4af37]",
      bg: "bg-[#d4af37]/5",
      border: "border-[#d4af37]/30",
      message: "Your payment is being verified. This usually takes a few minutes.",
      icon: "⏳",
    },
    rejected: {
      label: "Payment Rejected",
      color: "text-[#e05c5c]",
      bg: "bg-[#e05c5c]/5",
      border: "border-[#e05c5c]/30",
      message: order.rejectionReason ?? "Payment could not be verified.",
      icon: "✕",
    },
    expired: {
      label: "Order Expired",
      color: "text-[#9a948c]",
      bg: "bg-[#9a948c]/5",
      border: "border-[#9a948c]/20",
      message: "This order has expired. Please create a new booking if you'd like to attend.",
      icon: "⌛",
    },
  };

  const config = statusConfig[order.status] ?? { label: order.status, color: "text-[#9a948c]", bg: "bg-transparent", border: "border-[#9a948c]/20", message: "", icon: "•" };

  return (
    <div className={`relative overflow-hidden rounded-sm border ${config.border} ${config.bg} backdrop-blur-sm`}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />

      <div className="p-6 sm:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-12 h-12 rounded-full border ${config.border} flex items-center justify-center shrink-0 text-xl`}>
            {config.icon}
          </div>
          <div>
            <p className={`font-display text-[1.5rem] ${config.color} leading-none mb-1`}>{config.label}</p>
            <p className="font-body text-[0.82rem] text-[#9a948c]">{config.message}</p>
          </div>
        </div>

        <div className="bg-[#0a080b] border border-[#d4af37]/10 rounded-sm p-4 space-y-3">
          {[
            { label: "Order ID", value: order.orderId, mono: true },
            { label: "Amount",   value: formatPayableAmount(order.payableAmount), gold: true },
            { label: "Tier",     value: `${order.tierName} × ${order.quantity}` },
          ].map(({ label, value, mono, gold }) => (
            <div key={label} className="flex justify-between items-center border-b border-[#d4af37]/[0.07] pb-3 last:border-0 last:pb-0">
              <span className="font-body text-[0.62rem] tracking-[0.2em] uppercase text-[#5e5a55]">{label}</span>
              <span className={`font-body ${mono ? "font-mono text-[0.78rem] text-[#9a948c]" : gold ? "text-[#d4af37] font-bold text-[0.9rem]" : "text-[#ede6da] text-[0.85rem]"} text-right break-all max-w-[60%]`}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {order.status === "pending_verification" && order.expiresAt && (
          <div className="mt-5 pt-4 border-t border-[#d4af37]/10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
            <p className="font-body text-[#c9a24b] text-[0.72rem] tracking-[0.12em] uppercase">
              Expires in <OrderCountdown expiresAt={order.expiresAt} />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DigitalTicket({ order }: { order: OrderResult }) {
  return (
    <div className="relative" style={{ filter: "drop-shadow(0 0 40px rgba(212,175,55,0.18))" }}>
      {/* Main ticket body */}
      <div className="relative bg-gradient-to-b from-[#110e14] to-[#0a0810] border border-[#d4af37]/40 overflow-hidden rounded-t-sm">

        {/* Decorative top band with shimmer */}
        <div className="relative h-1.5 bg-gradient-to-r from-[#8b6914] via-[#d4af37] via-[#f5e07a] via-[#d4af37] to-[#8b6914]" />

        {/* Ornate corner flourishes */}
        <div className="absolute top-4 left-4 w-12 h-12 opacity-20 pointer-events-none">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 44 L4 4 L44 4" stroke="#d4af37" strokeWidth="1" fill="none"/>
            <path d="M4 14 Q14 4 14 4" stroke="#d4af37" strokeWidth="0.8" fill="none"/>
            <circle cx="4" cy="4" r="2" fill="#d4af37"/>
          </svg>
        </div>
        <div className="absolute top-4 right-4 w-12 h-12 opacity-20 pointer-events-none" style={{ transform: "scaleX(-1)" }}>
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 44 L4 4 L44 4" stroke="#d4af37" strokeWidth="1" fill="none"/>
            <path d="M4 14 Q14 4 14 4" stroke="#d4af37" strokeWidth="0.8" fill="none"/>
            <circle cx="4" cy="4" r="2" fill="#d4af37"/>
          </svg>
        </div>

        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(212,175,55,0.07) 0%, transparent 60%)" }} />

        <div className="relative px-6 pt-8 pb-6 sm:px-8 sm:pt-10">

          {/* Header section */}
          <div className="flex items-start justify-between gap-3 mb-8">
            <div className="flex-1">
              <p className="font-body text-[0.55rem] tracking-[0.35em] uppercase text-[#c9a24b]/80 mb-2">
                ✦ TheVMEx Presents ✦
              </p>
              <h2 className="font-display text-[2rem] sm:text-[2.6rem] text-transparent bg-clip-text leading-none mb-3"
                  style={{ backgroundImage: "linear-gradient(135deg, #c9a24b 0%, #f5e07a 40%, #d4af37 60%, #a07828 100%)" }}>
                {EVENT.name}
              </h2>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[#d4af37]/60 text-xs">📅</span>
                  <p className="font-body text-[0.72rem] text-[#b8a87a] tracking-wider uppercase">
                    {EVENT.date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#d4af37]/60 text-xs">📍</span>
                  <p className="font-body text-[0.72rem] text-[#b8a87a] tracking-wider uppercase">
                    {EVENT.venue}
                  </p>
                </div>
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-2">
              <span className="font-body text-[0.55rem] tracking-[0.18em] uppercase border border-emerald-500/50 text-emerald-400 px-3 py-1.5 bg-emerald-900/20 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.15)]">
                ✓ Confirmed
              </span>
            </div>
          </div>

          {/* Decorative divider */}
          <div className="flex items-center gap-3 mb-7">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#d4af37]/30" />
            <span className="text-[#d4af37]/40 text-xs tracking-widest">✦ ✦ ✦</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#d4af37]/30" />
          </div>

          {/* Attendee info — hero */}
          <div className="mb-7 p-4 bg-[#d4af37]/[0.04] border border-[#d4af37]/15 rounded-sm relative overflow-hidden">
            <div className="absolute right-3 top-3 text-[#d4af37]/[0.06] text-6xl font-display leading-none select-none pointer-events-none">🎭</div>
            <p className="font-body text-[0.58rem] tracking-[0.25em] uppercase text-[#5e5a55] mb-1">Guest Name</p>
            <p className="font-display text-[1.5rem] sm:text-[1.8rem] text-[#ede6da] leading-tight">{order.attendeeName}</p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 mb-7">
            {[
              { label: "Ticket ID",   value: order.ticketId ?? "", gold: true },
              { label: "Tier",        value: `${order.tierName}` },
              { label: "Qty",         value: `${order.quantity} × Entry` },
              { label: "Amount Paid", value: formatCurrency(order.baseAmount), gold: true },
            ].map(({ label, value, gold }) => (
              <div key={label} className="bg-[#0a0810] border border-[#d4af37]/10 rounded-sm p-3">
                <p className="font-body text-[0.53rem] tracking-[0.22em] uppercase text-[#5e5a55] mb-1">{label}</p>
                <p className={`font-body leading-snug break-words text-[0.88rem] ${gold ? "text-[#d4af37] font-semibold" : "text-[#ede6da]"}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>

        </div>

        {/* Perforated tear line separator */}
        <div className="relative flex items-center">
          {/* Left notch */}
          <div className="absolute -left-3 w-6 h-6 rounded-full bg-[#080809] border-r border-[#d4af37]/30 z-10" />
          {/* Right notch */}
          <div className="absolute -right-3 w-6 h-6 rounded-full bg-[#080809] border-l border-[#d4af37]/30 z-10" />
          {/* Dashed line */}
          <div className="flex-1 mx-5 border-t-2 border-dashed border-[#d4af37]/25" />
        </div>

        {/* QR stub section */}
        <div className="relative bg-gradient-to-b from-[#0e0c12] to-[#080809] px-6 pt-7 pb-8 sm:px-8">
          {order.ticketQr ? (
            <div className="flex flex-col items-center">
              <p className="font-body text-[0.58rem] tracking-[0.28em] uppercase text-[#5e5a55] mb-5">
                Scan at Entry Gate
              </p>
              <div className="relative">
                {/* Glow behind QR */}
                <div className="absolute inset-0 rounded-sm blur-xl bg-[#d4af37]/20 scale-110 pointer-events-none" />
                <div className="relative border border-[#d4af37]/30 p-1 rounded-sm bg-white shadow-[0_0_40px_rgba(212,175,55,0.25)]">
                  <img
                    src={order.ticketQr}
                    alt="Ticket QR Code"
                    className="w-44 h-44 sm:w-52 sm:h-52 object-contain block rounded-sm"
                  />
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="font-body text-[0.62rem] tracking-[0.2em] uppercase text-emerald-400/70">
                  Valid for 1 entry
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-[#5e5a55]">
              <p className="font-body text-[0.72rem] tracking-widest uppercase">QR not available</p>
            </div>
          )}
        </div>

        {/* Bottom band */}
        <div className="relative h-1.5 bg-gradient-to-r from-[#8b6914] via-[#d4af37] via-[#f5e07a] via-[#d4af37] to-[#8b6914]" />
      </div>

      {/* Watermark ref footer */}
      <div className="flex items-center justify-between px-6 py-2.5 bg-[#0a0810] border border-t-0 border-[#d4af37]/20 rounded-b-sm">
        <span className="font-body text-[0.55rem] tracking-[0.2em] uppercase text-[#3a3836]">TheVMEx</span>
        <span className="font-mono text-[0.55rem] text-[#3a3836]">{order.orderId}</span>
        <span className="font-body text-[0.55rem] tracking-[0.2em] uppercase text-[#3a3836]">Official</span>
      </div>
    </div>
  );
}

export default function TicketPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080809] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin" />
            <p className="font-body text-[0.7rem] tracking-[0.25em] uppercase text-[#5e5a55]">
              Loading
            </p>
          </div>
        </div>
      }
    >
      <TicketLookupContent />
    </Suspense>
  );
}
