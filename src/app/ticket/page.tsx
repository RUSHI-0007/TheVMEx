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
    <div className="min-h-screen bg-bg-primary px-4 py-16 md:py-24">
      <div className="max-w-lg mx-auto">
        <Link
          href="/"
          className="text-gold-muted text-sm uppercase tracking-widest hover:text-gold mb-8 inline-block"
        >
          ← Back to event
        </Link>

        <h1 className="font-display text-3xl md:text-4xl text-text-primary mb-2">
          Check Your Ticket
        </h1>
        <p className="text-text-muted mb-8">
          Look up by order ID, phone number, or email
        </p>

        <div className="flex gap-2 mb-8">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="VMX-XXXXXX or phone/email"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={() => handleSearch()} disabled={loading}>
            {loading ? "..." : "Search"}
          </Button>
        </div>

        {error && (
          <div className="border border-red-400/30 bg-red-400/5 p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {searched && !loading && orders.length === 0 && !error && (
          <div className="border border-gold/20 bg-bg-secondary p-8 text-center">
            <p className="font-display text-xl text-text-primary mb-2">
              No orders found
            </p>
            <p className="text-text-muted text-sm">
              Double-check your order ID or contact details
            </p>
          </div>
        )}

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
      color: "text-red-400",
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
    <div className="bg-bg-secondary border border-gold/20 p-6 md:p-8">
      <p className={`font-display text-xl ${config.color} mb-2`}>
        {config.label}
      </p>
      <p className="text-text-muted text-sm mb-4">{config.message}</p>
      <div className="space-y-2 text-sm">
        <p>
          <span className="text-text-muted">Order: </span>
          <span className="text-text-primary">{order.orderId}</span>
        </p>
        <p>
          <span className="text-text-muted">Amount: </span>
          <span className="text-gold">
            {formatPayableAmount(order.payableAmount)}
          </span>
        </p>
        <p>
          <span className="text-text-muted">Tier: </span>
          {order.tierName} × {order.quantity}
        </p>
      </div>
      {order.status === "pending_verification" && order.expiresAt && (
        <p className="text-text-muted text-xs mt-4">
          Expires in <OrderCountdown expiresAt={order.expiresAt} />
        </p>
      )}
    </div>
  );
}

function DigitalTicket({ order }: { order: OrderResult }) {
  return (
    <div className="relative border-2 border-gold bg-bg-secondary overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold-muted">
              TheVMEx Presents
            </p>
            <h2 className="font-display text-2xl md:text-3xl text-text-primary mt-1">
              {EVENT.name}
            </h2>
            <p className="text-text-muted text-sm mt-1">{EVENT.date}</p>
          </div>
          <span className="chip text-xs">Confirmed</span>
        </div>

        <div className="border-t border-b border-gold/20 py-4 my-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-text-muted">
              Guest
            </p>
            <p className="font-display text-lg text-text-primary">
              {order.attendeeName}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-text-muted">
              Ticket
            </p>
            <p className="font-display text-lg text-gold">{order.ticketId}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-text-muted">
              Tier
            </p>
            <p className="text-text-primary">
              {order.tierName} × {order.quantity}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-text-muted">
              Paid
            </p>
            <p className="text-text-primary">
              {formatCurrency(order.baseAmount)}
            </p>
          </div>
        </div>

        {order.ticketQr && (
          <div className="text-center">
            <img
              src={order.ticketQr}
              alt="Ticket QR Code"
              className="mx-auto w-40 h-40 border border-gold/20"
            />
            <p className="text-text-muted text-xs mt-2">
              Show this QR code at entry
            </p>
          </div>
        )}

        <p className="text-center text-text-muted text-xs mt-6">
          Order {order.orderId}
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
    </div>
  );
}

export default function TicketPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg-primary flex items-center justify-center">
          <p className="text-text-muted animate-pulse-subtle">Loading...</p>
        </div>
      }
    >
      <TicketLookupContent />
    </Suspense>
  );
}
