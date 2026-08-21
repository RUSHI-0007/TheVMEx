"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MaskOrder {
  id: string;
  guestName: string;
  source: string;
  maskCount: number;
  amountDue: number;
  status: "pending" | "paid";
  createdAt: string;
  paidAt: string | null;
}

// ─── Source accent colors (shared with guestlist) ─────────────────────────────
const SOURCE_ACCENTS = [
  "#d4af37", // gold
  "#9ab0c4", // steel blue
  "#c4a98a", // warm sand
  "#a89ac4", // dusty lavender
  "#8ab5a2", // sage
  "#c49a8a", // terracotta
  "#8aac8a", // muted olive
  "#c4b48a", // khaki
];

function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function sourceAccent(source: string): string {
  return SOURCE_ACCENTS[hashString(source.trim().toLowerCase()) % SOURCE_ACCENTS.length];
}

// ─── Relative time ────────────────────────────────────────────────────────────
function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diffMs / 1000);
  if (secs < 5)  return "just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

// ─── Single pending card ──────────────────────────────────────────────────────
function PendingCard({
  order,
  isNew,
  onMarkPaid,
  paying,
}: {
  order: MaskOrder;
  isNew: boolean;
  onMarkPaid: (id: string) => void;
  paying: boolean;
}) {
  const accent = sourceAccent(order.source);
  const [now, setNow] = useState(Date.now());

  // Tick every 15s to update relative time
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className={`relative border px-5 py-4 transition-all duration-500 ${
        isNew
          ? "border-gold/60 bg-gold/[0.06] animate-[maskNewEntry_0.6s_ease-out]"
          : "border-gold/15 bg-[#101012] hover:border-gold/30"
      }`}
    >
      {isNew && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-80" />
      )}

      <div className="flex items-start gap-4">
        {/* Source badge */}
        <div
          className="shrink-0 mt-0.5 px-2.5 py-1 text-[0.6rem] font-body font-bold tracking-[0.14em] uppercase border"
          style={{ borderColor: `${accent}50`, color: accent, background: `${accent}12` }}
        >
          {order.source}
        </div>

        {/* Guest info */}
        <div className="flex-1 min-w-0">
          <p className="font-display text-[1.1rem] font-bold text-text-primary leading-tight truncate">
            {order.guestName}
          </p>
          <div className="flex items-baseline gap-3 mt-0.5">
            <p className="font-body text-[0.8rem] text-text-muted">
              {order.maskCount} {order.maskCount === 1 ? "mask" : "masks"}
            </p>
            <p className="font-display text-[1rem] font-bold text-gold tabular-nums">
              ₹{order.amountDue}
            </p>
          </div>
          <p className="font-body text-[0.65rem] text-text-dim mt-1 tracking-wide">
            {relativeTime(order.createdAt)}
          </p>
        </div>

        {/* Mark paid button */}
        <button
          type="button"
          id={`mask-pay-${order.id}`}
          onClick={() => onMarkPaid(order.id)}
          disabled={paying}
          className="shrink-0 flex flex-col items-center justify-center w-20 h-16 bg-gold text-[#0b0b0d] font-body font-bold text-[0.72rem] tracking-[0.08em] uppercase hover:bg-gold/90 active:scale-95 transition-all disabled:opacity-40"
        >
          {paying ? (
            <span className="text-[0.65rem] animate-pulse">…</span>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="mb-1">
                <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Paid
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Completed row ─────────────────────────────────────────────────────────────
function PaidRow({ order }: { order: MaskOrder }) {
  const accent = sourceAccent(order.source);
  return (
    <div className="flex items-center gap-3 px-4 py-3 border border-white/[0.04] bg-white/[0.015] opacity-60">
      <span
        className="shrink-0 px-2 py-0.5 text-[0.55rem] font-body font-bold tracking-[0.12em] uppercase border"
        style={{ borderColor: `${accent}30`, color: accent }}
      >
        {order.source}
      </span>
      <span className="flex-1 font-body text-[0.82rem] text-text-muted truncate">{order.guestName}</span>
      <span className="font-body text-[0.78rem] text-text-dim">
        ×{order.maskCount}
      </span>
      <span className="font-display text-[0.88rem] text-text-muted tabular-nums">₹{order.amountDue}</span>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 opacity-50">
        <circle cx="7" cy="7" r="6" stroke="#8ab5a2" strokeWidth="1.2" />
        <path d="M4.5 7l2 2 3-3" stroke="#8ab5a2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ─── Live indicator ────────────────────────────────────────────────────────────
function LiveIndicator({ status }: { status: "live" | "connecting" | "error" }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-2 h-2 rounded-full ${
          status === "live"
            ? "bg-emerald-500"
            : status === "connecting"
            ? "bg-amber-400 animate-pulse"
            : "bg-[#e05c5c] animate-pulse"
        }`}
      />
      <span className="font-body text-[0.62rem] uppercase tracking-[0.15em] text-text-dim">
        {status === "live" ? "Live" : status === "connecting" ? "Connecting…" : "Disconnected"}
      </span>
    </div>
  );
}

// ─── Root page ─────────────────────────────────────────────────────────────────
export default function MasksPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  // Orders state
  const [pending, setPending] = useState<MaskOrder[]>([]);
  const [paid, setPaid]       = useState<MaskOrder[]>([]);
  const [newIds, setNewIds]   = useState<Set<string>>(new Set());
  const [payingId, setPayingId] = useState<string | null>(null);

  // Realtime state
  const [rtStatus, setRtStatus] = useState<"connecting" | "live" | "error">("connecting");
  const channelRef = useRef<RealtimeChannel | null>(null);

  // ─── Auth check ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/admin/health")
      .then((res) => { if (res.ok) setAuthed(true); else router.replace("/admin"); })
      .catch(() => router.replace("/admin"))
      .finally(() => setAuthChecked(true));
  }, [router]);

  // ─── Initial data load ───────────────────────────────────────────────────────
  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/masks");
      if (!res.ok) return;
      const data = await res.json();
      setPending(data.pending ?? []);
      setPaid(data.paid ?? []);
    } catch { /* silent */ }
  }, []);

  // ─── Realtime subscription ───────────────────────────────────────────────────
  useEffect(() => {
    if (!authed) return;

    loadOrders();

    const supabase = getSupabaseClient();

    const channel = supabase
      .channel("mask_orders_live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mask_orders" },
        (payload) => {
          const row = payload.new as MaskOrder;

          if (payload.eventType === "INSERT") {
            // New order — prepend to pending, flash glow
            setPending((prev) => [row, ...prev]);
            setNewIds((prev) => new Set([...prev, row.id]));
            setTimeout(() => {
              setNewIds((prev) => {
                const next = new Set(prev);
                next.delete(row.id);
                return next;
              });
            }, 3000);
          } else if (payload.eventType === "UPDATE") {
            if (row.status === "paid") {
              // Move from pending → paid
              setPending((prev) => prev.filter((o) => o.id !== row.id));
              setPaid((prev) => [row, ...prev]);
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setRtStatus("live");
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setRtStatus("error");
        else setRtStatus("connecting");
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authed, loadOrders]);

  // ─── Mark paid handler ───────────────────────────────────────────────────────
  const handleMarkPaid = async (id: string) => {
    setPayingId(id);
    try {
      await fetch(`/api/admin/masks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_paid" }),
      });
      // Realtime will handle the state update via UPDATE event
    } catch {
      // On failure, reload to stay consistent
      loadOrders();
    } finally {
      setPayingId(null);
    }
  };

  // ─── Derived totals ──────────────────────────────────────────────────────────
  const totalMasksGiven = paid.reduce((sum, o) => sum + o.maskCount, 0);
  const totalCash       = paid.reduce((sum, o) => sum + o.amountDue, 0);

  // ─── Auth gate ───────────────────────────────────────────────────────────────
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] flex items-center justify-center">
        <p className="font-body text-[0.72rem] tracking-[0.2em] uppercase text-text-dim animate-pulse">Verifying…</p>
      </div>
    );
  }
  if (!authed) return null;

  return (
    <div className="min-h-screen bg-[#0b0b0d] flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="px-5 py-4 border-b border-gold/10 sticky top-0 z-20 bg-[#0b0b0d]/95 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="inline-flex items-center gap-2 font-body text-[0.72rem] tracking-[0.12em] uppercase text-text-muted hover:text-gold transition-colors py-1"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </button>
          <LiveIndicator status={rtStatus} />
        </div>

        <div className="flex items-end justify-between mt-3">
          <div>
            <h1 className="font-display text-[1.4rem] font-bold text-text-primary">Mask Counter</h1>
            <p className="font-body text-[0.62rem] tracking-[0.15em] uppercase text-text-dim mt-0.5">
              Person 2 station · ₹300/mask
            </p>
          </div>
          {pending.length > 0 && (
            <span className="font-body text-[0.7rem] bg-gold/10 border border-gold/20 text-gold px-3 py-1 tabular-nums">
              {pending.length} pending
            </span>
          )}
        </div>
      </header>

      {/* ── Running totals bar ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 border-b border-gold/10">
        <div className="px-5 py-3.5 border-r border-gold/10">
          <p className="font-body text-[0.58rem] tracking-[0.18em] uppercase text-text-dim mb-0.5">Masks Given</p>
          <p className="font-display text-[1.8rem] font-bold tabular-nums text-text-primary leading-none">
            {totalMasksGiven}
          </p>
        </div>
        <div className="px-5 py-3.5">
          <p className="font-body text-[0.58rem] tracking-[0.18em] uppercase text-text-dim mb-0.5">Cash Collected</p>
          <p className="font-display text-[1.8rem] font-bold tabular-nums text-gold leading-none">
            ₹{totalCash.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* ── Pending queue ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {pending.length > 0 && (
          <div>
            <p className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-text-dim px-5 pt-4 pb-2">
              Pending — serve in order ↓
            </p>
            <div className="divide-y divide-gold/[0.07]">
              {pending.map((order) => (
                <PendingCard
                  key={order.id}
                  order={order}
                  isNew={newIds.has(order.id)}
                  onMarkPaid={handleMarkPaid}
                  paying={payingId === order.id}
                />
              ))}
            </div>
          </div>
        )}

        {pending.length === 0 && paid.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="w-12 h-px bg-gold/20 mb-5" />
            <p className="font-body text-[0.75rem] tracking-[0.18em] uppercase text-text-dim">
              Queue is empty
            </p>
            <p className="font-body text-[0.68rem] text-text-dim mt-2 opacity-60">
              Waiting for Person 1 to send orders…
            </p>
          </div>
        )}

        {pending.length === 0 && paid.length > 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-8 h-px bg-gold/20 mb-3" />
            <p className="font-body text-[0.7rem] tracking-[0.15em] uppercase text-text-dim">
              All caught up!
            </p>
          </div>
        )}

        {/* ── Completed section ───────────────────────────────────────────── */}
        {paid.length > 0 && (
          <div className="mt-4 border-t border-white/[0.04]">
            <p className="font-body text-[0.58rem] tracking-[0.2em] uppercase text-text-dim px-5 pt-3 pb-2">
              Completed ({paid.length})
            </p>
            <div className="divide-y divide-white/[0.03]">
              {paid.map((order) => (
                <PaidRow key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}

        <div className="h-8" />
      </div>

      <style>{`
        @keyframes maskNewEntry {
          0%   { opacity: 0; transform: translateY(-8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
