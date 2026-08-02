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
    if (initialQuery) {
      handleSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleSearch = async (q?: string) => {
    const searchQuery = (q ?? query).trim();
    if (!searchQuery) {
      setError("Enter your order ID, phone, or email");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const res = await fetch(
        `/api/orders/lookup?q=${encodeURIComponent(searchQuery)}`
      );
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
    <div className="min-h-screen bg-[#151316] px-4 py-16 md:py-24 relative overflow-hidden text-text-primary selection:bg-gold/30 selection:text-gold">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at center, #d4af37 0%, transparent 40%)" }} />
      
      <div className="max-w-xl mx-auto relative z-10">
        {!isSuccess && (
          <Link
            href="/"
            className="text-gold-muted text-[0.75rem] uppercase tracking-[0.2em] hover:text-gold mb-8 inline-block transition-colors"
          >
            ← Back to event
          </Link>
        )}

        {isSuccess ? (
          <div className="text-center mb-10">
            <h1 className="font-display text-[2.5rem] md:text-[3.2rem] text-gold mb-3 leading-none">
              Payment Successful!
            </h1>
            <p className="font-body text-[0.95rem] text-text-muted">
              Your ticket has been confirmed. See you at {EVENT.name}!
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-3xl md:text-4xl text-text-primary mb-2">
              Check Your Ticket
            </h1>
            <p className="font-body text-[0.85rem] text-text-muted mb-8">
              Look up by order ID, phone number, or email
            </p>

            <div className="flex gap-3 mb-8">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="VMX-XXXXXX or phone/email"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 px-4 py-3 bg-[#0b0b0d] border border-gold/30 text-text-primary font-body text-[0.95rem] outline-none transition-all duration-300 rounded-sm shadow-inner focus:border-gold focus:ring-1 focus:ring-gold/30 hover:border-gold/50"
              />
              <Button variant="gold" onClick={() => handleSearch()} disabled={loading} className="px-8">
                {loading ? "..." : "Search"}
              </Button>
            </div>
          </>
        )}

        {error && (
          <div className="border border-[#e05c5c]/40 bg-[#e05c5c]/5 p-4 mb-6 rounded-sm text-center">
            <p className="font-body text-[0.8rem] text-[#e05c5c] font-semibold tracking-wide">⚠ {error}</p>
          </div>
        )}

        {searched && !loading && orders.length === 0 && !error && (
          <div className="border border-gold/20 bg-[#0b0b0d] p-10 text-center shadow-[0_0_20px_rgba(212,175,55,0.05)] rounded-sm">
            <p className="font-display text-[1.5rem] text-gold mb-2">
              No orders found
            </p>
            <p className="font-body text-[0.85rem] text-text-muted">
              Double-check your order ID or contact details
            </p>
          </div>
        )}

        <div className="space-y-8">
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
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-gold-muted text-[0.75rem] uppercase tracking-[0.2em] hover:text-gold transition-colors"
            >
              ← Return to Home Page
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderStatusCard({ order }: { order: OrderResult }) {
  const statusConfig: Record<
    string,
    { label: string; color: string; message: string }
  > = {
    pending_verification: {
      label: "Pending Verification",
      color: "text-gold",
      message:
        "Your payment is being verified. This usually takes a few minutes.",
    },
    rejected: {
      label: "Rejected",
      color: "text-[#e05c5c]",
      message: order.rejectionReason ?? "Payment could not be verified.",
    },
    expired: {
      label: "Expired",
      color: "text-text-muted",
      message:
        "This order has expired. Please create a new booking if you'd like to attend.",
    },
  };

  const config = statusConfig[order.status] ?? {
    label: order.status,
    color: "text-text-muted",
    message: "",
  };

  return (
    <div className="bg-[#0b0b0d] border border-gold/30 p-8 shadow-[0_0_25px_rgba(212,175,55,0.08)] rounded-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gold/30"></div>
      <p className={`font-display text-[1.8rem] ${config.color} mb-2`}>
        {config.label}
      </p>
      <p className="font-body text-[0.85rem] text-text-muted mb-6">{config.message}</p>
      <div className="space-y-3 font-body text-[0.85rem]">
        <p className="flex justify-between border-b border-gold/10 pb-2">
          <span className="text-gold-muted uppercase tracking-widest text-[0.7rem]">Order ID</span>
          <span className="text-text-primary font-mono">{order.orderId}</span>
        </p>
        <p className="flex justify-between border-b border-gold/10 pb-2">
          <span className="text-gold-muted uppercase tracking-widest text-[0.7rem]">Amount</span>
          <span className="text-gold font-bold">
            {formatPayableAmount(order.payableAmount)}
          </span>
        </p>
        <p className="flex justify-between pb-2">
          <span className="text-gold-muted uppercase tracking-widest text-[0.7rem]">Tier</span>
          <span className="text-text-primary text-right">
            {order.tierName} <span className="text-gold-muted mx-1">×</span> {order.quantity}
          </span>
        </p>
      </div>
      {order.status === "pending_verification" && order.expiresAt && (
        <div className="mt-6 pt-4 border-t border-gold/20 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></span>
          <p className="font-body text-gold-muted text-[0.75rem] uppercase tracking-widest">
            Expires in <OrderCountdown expiresAt={order.expiresAt} />
          </p>
        </div>
      )}
    </div>
  );
}

function DigitalTicket({ order }: { order: OrderResult }) {
  return (
    <div className="relative border border-gold/50 bg-[#0b0b0d] shadow-[0_0_30px_rgba(212,175,55,0.15)] rounded-sm overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold/30 via-gold to-gold/30" />

      <div className="p-8 md:p-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="font-body text-[0.65rem] uppercase tracking-[0.3em] text-gold-muted mb-1">
              TheVMEx Presents
            </p>
            <h2 className="font-display text-[2rem] md:text-[2.5rem] text-gold leading-none">
              {EVENT.name}
            </h2>
            <p className="font-body text-[0.8rem] text-text-muted mt-2 uppercase tracking-widest">{EVENT.date}</p>
          </div>
          <span className="font-body text-[0.65rem] uppercase tracking-widest px-3 py-1.5 border border-gold/40 text-gold rounded-sm bg-gold/10">Confirmed</span>
        </div>

        <div className="border-t border-b border-gold/20 py-6 my-6 grid grid-cols-2 gap-y-6 gap-x-4 bg-[#151316]/50 -mx-8 md:-mx-10 px-8 md:px-10">
          <div>
            <p className="font-body text-[0.65rem] uppercase tracking-[0.2em] text-gold-muted mb-1">
              Guest
            </p>
            <p className="font-display text-[1.4rem] text-text-primary">
              {order.attendeeName}
            </p>
          </div>
          <div>
            <p className="font-body text-[0.65rem] uppercase tracking-[0.2em] text-gold-muted mb-1">
              Ticket ID
            </p>
            <p className="font-display text-[1.4rem] text-gold">{order.ticketId}</p>
          </div>
          <div>
            <p className="font-body text-[0.65rem] uppercase tracking-[0.2em] text-gold-muted mb-1">
              Tier
            </p>
            <p className="font-body text-[0.95rem] text-text-primary">
              {order.tierName} <span className="text-gold-muted mx-1">×</span> {order.quantity}
            </p>
          </div>
          <div>
            <p className="font-body text-[0.65rem] uppercase tracking-[0.2em] text-gold-muted mb-1">
              Amount Paid
            </p>
            <p className="font-body text-[0.95rem] text-text-primary">
              {formatCurrency(order.baseAmount)}
            </p>
          </div>
        </div>

        {order.ticketQr && (
          <div className="text-center mt-8">
            <div className="inline-block p-4 bg-white rounded-sm shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <img
                src={order.ticketQr}
                alt="Ticket QR Code"
                className="w-40 h-40 object-contain"
              />
            </div>
            <p className="font-body text-[0.7rem] uppercase tracking-[0.2em] text-gold-muted mt-4">
              Scan this QR code at entry
            </p>
          </div>
        )}

        <p className="text-center font-mono text-[0.7rem] text-text-dim mt-8 opacity-50">
          ORDER REF: {order.orderId}
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold/30 via-gold to-gold/30" />
    </div>
  );
}

export default function TicketPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#151316] flex items-center justify-center">
          <p className="font-body text-[0.8rem] uppercase tracking-[0.3em] text-gold animate-pulse">Loading Ticket...</p>
        </div>
      }
    >
      <TicketLookupContent />
    </Suspense>
  );
}
