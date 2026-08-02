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
      {/* Background ambient glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top nav bar */}
        <nav className="flex items-center justify-between px-5 py-5 border-b border-[#d4af37]/10">
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
            <div className="text-center mb-10">
              <div className="w-16 h-16 border border-emerald-500/40 bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M7 14l5 5 9-9" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h1 className="font-display text-[2rem] sm:text-[2.6rem] text-[#d4af37] mb-2 leading-tight">
                Payment Successful
              </h1>
              <p className="font-body text-[0.88rem] text-[#9a948c]">
                Your booking is confirmed. See you at {EVENT.name}!
              </p>
            </div>
          )}

          {/* Search form */}
          {!isSuccess && (
            <div className="mb-8">
              <h1 className="font-display text-[2rem] sm:text-[2.5rem] text-[#ede6da] mb-1">
                Check Your Ticket
              </h1>
              <p className="font-body text-[0.82rem] text-[#9a948c] mb-6">
                Look up by order ID, phone number, or email
              </p>
              <div className="flex gap-2.5">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="VMX-XXXXXX or phone/email"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 px-4 py-3 bg-[#151316] border border-[#d4af37]/20 text-[#ede6da] font-body text-[0.9rem] outline-none focus:border-[#d4af37]/60 transition-colors min-w-0"
                />
                <Button variant="gold" onClick={() => handleSearch()} disabled={loading} className="px-6 shrink-0">
                  {loading ? "..." : "Find"}
                </Button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="border border-[#e05c5c]/30 bg-[#e05c5c]/[0.07] px-4 py-3 mb-6">
              <p className="font-body text-[0.8rem] text-[#e05c5c]">{error}</p>
            </div>
          )}

          {/* No results */}
          {searched && !loading && orders.length === 0 && !error && (
            <div className="border border-[#d4af37]/15 bg-[#151316] px-6 py-10 text-center">
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
            <div className="mt-10 text-center">
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
  const statusConfig: Record<string, { label: string; color: string; message: string }> = {
    pending_verification: {
      label: "Pending Verification",
      color: "text-[#d4af37]",
      message: "Your payment is being verified. This usually takes a few minutes.",
    },
    rejected: {
      label: "Rejected",
      color: "text-[#e05c5c]",
      message: order.rejectionReason ?? "Payment could not be verified.",
    },
    expired: {
      label: "Expired",
      color: "text-[#9a948c]",
      message: "This order has expired. Please create a new booking if you'd like to attend.",
    },
  };

  const config = statusConfig[order.status] ?? { label: order.status, color: "text-[#9a948c]", message: "" };

  return (
    <div className="bg-[#0f0d10] border border-[#d4af37]/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
      <div className="p-6">
        <p className={`font-display text-[1.5rem] ${config.color} mb-1`}>{config.label}</p>
        <p className="font-body text-[0.82rem] text-[#9a948c] mb-5">{config.message}</p>
        <div className="space-y-2.5 text-[0.82rem]">
          {[
            { label: "Order ID", value: order.orderId, mono: true },
            { label: "Amount",   value: formatPayableAmount(order.payableAmount), gold: true },
            { label: "Tier",     value: `${order.tierName} × ${order.quantity}` },
          ].map(({ label, value, mono, gold }) => (
            <div key={label} className="flex justify-between items-center border-b border-[#d4af37]/[0.07] pb-2.5 last:border-0 last:pb-0">
              <span className="font-body text-[0.65rem] tracking-[0.18em] uppercase text-[#5e5a55]">{label}</span>
              <span className={`font-body ${mono ? "font-mono text-[0.78rem] text-[#9a948c]" : gold ? "text-[#d4af37] font-bold" : "text-[#ede6da]"} text-right break-all max-w-[60%]`}>
                {value}
              </span>
            </div>
          ))}
        </div>
        {order.status === "pending_verification" && order.expiresAt && (
          <div className="mt-5 pt-4 border-t border-[#d4af37]/10 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
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
    <div className="relative bg-[#0f0d10] border border-[#d4af37]/40 overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.1)]">
      {/* Top shimmer bar */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <p className="font-body text-[0.6rem] tracking-[0.28em] uppercase text-[#c9a24b] mb-1">
              TheVMEx Presents
            </p>
            <h2 className="font-display text-[1.7rem] sm:text-[2.2rem] text-[#d4af37] leading-none">
              {EVENT.name}
            </h2>
            <p className="font-body text-[0.72rem] text-[#9a948c] mt-1.5 tracking-widest uppercase">
              {EVENT.date}
            </p>
          </div>
          <span className="shrink-0 font-body text-[0.58rem] tracking-[0.15em] uppercase border border-emerald-500/40 text-emerald-400 px-2.5 py-1 bg-emerald-900/20">
            Confirmed
          </span>
        </div>

        {/* Ticket details grid */}
        <div className="border-t border-b border-[#d4af37]/15 py-5 grid grid-cols-2 gap-x-4 gap-y-4 mb-6">
          {[
            { label: "Guest",       value: order.attendeeName, display: true },
            { label: "Ticket ID",   value: order.ticketId ?? "", gold: true },
            { label: "Tier",        value: `${order.tierName} × ${order.quantity}` },
            { label: "Amount Paid", value: formatCurrency(order.baseAmount) },
          ].map(({ label, value, display, gold }) => (
            <div key={label}>
              <p className="font-body text-[0.58rem] tracking-[0.2em] uppercase text-[#5e5a55] mb-1">{label}</p>
              <p className={`font-body leading-snug break-words ${display ? "font-semibold text-[1rem] text-[#ede6da]" : gold ? "font-display text-[1rem] text-[#d4af37]" : "text-[0.88rem] text-[#ede6da]"}`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* QR code */}
        {order.ticketQr && (
          <div className="text-center">
            <div className="inline-block p-4 bg-white shadow-[0_0_30px_rgba(255,255,255,0.15)]">
              <img
                src={order.ticketQr}
                alt="Ticket QR Code"
                className="w-40 h-40 sm:w-48 sm:h-48 object-contain"
              />
            </div>
            <p className="font-body text-[0.62rem] tracking-[0.2em] uppercase text-[#5e5a55] mt-4">
              Show this QR code at the entry gate
            </p>
          </div>
        )}

        {/* Footer ref */}
        <p className="text-center font-mono text-[0.6rem] text-[#3a3836] mt-6">
          REF: {order.orderId}
        </p>
      </div>

      {/* Bottom shimmer bar */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
    </div>
  );
}

export default function TicketPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080809] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin" />
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
