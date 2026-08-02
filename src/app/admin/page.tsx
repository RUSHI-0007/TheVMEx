"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_TEAM_MEMBERS as ADMIN_TEAM } from "@/lib/config";
import { formatPayableAmount } from "@/lib/utils";
import { OrderCountdown } from "@/components/ui/CountdownTimer";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AdminOrder {
  orderId: string;
  attendeeName: string;
  phone: string;
  email: string;
  college: string;
  year: string;
  ticketTierId: string;
  tierName: string;
  quantity: number;
  payableAmount: number;
  baseAmount: number;
  utr: string | null;
  screenshotPath: string | null;
  expiresAt: string | null;
  claimedBy: string | null;
  claimedByName: string | null;
  createdAt: string;
  status: string;
  ticketId: string | null;
  handledAt: string | null;
  handledByName: string | null;
  paymentMode: string | null;
}

interface DbStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  totalRevenue: number;
}

interface AdminSession {
  id: string;
  name: string;
}

const REJECT_REASONS = [
  "Amount mismatch",
  "No matching transaction found",
  "Duplicate UTR",
  "Screenshot unclear",
  "Payment not received",
];

type Screen = "dashboard" | "queue" | "detail" | "attendees";

// ─── Shared back button ───────────────────────────────────────────────────────
function BackButton({ onClick, label = "Back" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 font-body text-[0.75rem] tracking-[0.12em] uppercase text-text-muted hover:text-gold transition-colors duration-200 py-1"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="bg-[#0b0b0d] border border-gold/15 p-4 flex flex-col gap-1">
      <p className="font-body text-[0.6rem] uppercase tracking-[0.18em] text-text-dim">{label}</p>
      <p className={`font-display text-[1.6rem] font-bold tabular-nums leading-none ${accent ? "text-gold" : "text-text-primary"}`}>
        {value}
      </p>
    </div>
  );
}

// ─── Login screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (session: AdminSession) => void }) {
  const [form, setForm] = useState({ name: "", pin: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      onLogin(data.admin);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0d] flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-[360px]">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="font-body text-[0.65rem] tracking-[0.25em] uppercase text-text-dim mb-3">TheVMEx</p>
          <h1 className="font-display text-[2rem] font-bold text-text-primary">Admin Panel</h1>
          <div className="w-12 h-px bg-gold/40 mx-auto mt-3" />
        </div>

        <div className="space-y-5 mb-8">
          <div>
            <label className="block font-body text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-gold-muted mb-2">
              Name
            </label>
            <select
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-4 py-3.5 bg-[#151316] border border-gold/20 text-text-primary font-body text-[0.95rem] outline-none focus:border-gold/60 transition-colors appearance-none"
            >
              <option value="">Select your name</option>
              {ADMIN_TEAM.map((m) => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-body text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-gold-muted mb-2">
              PIN
            </label>
            <input
              type="password"
              value={form.pin}
              onChange={(e) => setForm({ ...form, pin: e.target.value })}
              required
              placeholder="••••••"
              className="w-full px-4 py-3.5 bg-[#151316] border border-gold/20 text-text-primary font-body text-[0.95rem] outline-none focus:border-gold/60 transition-colors"
            />
          </div>
        </div>

        {error && (
          <p className="font-body text-[0.78rem] text-[#e05c5c] mb-5 text-center tracking-wide">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gold text-[#0b0b0d] font-body font-bold text-[0.85rem] tracking-[0.15em] uppercase transition-colors hover:bg-gold/90 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Enter Dashboard"}
        </button>
      </form>
    </div>
  );
}

// ─── Dashboard home screen ────────────────────────────────────────────────────
function DashboardScreen({
  session,
  stats,
  pendingCount,
  onNavigate,
  onLogout,
  exporting,
  onExport,
}: {
  session: AdminSession;
  stats: DbStats | null;
  pendingCount: number;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  exporting: boolean;
  onExport: () => void;
}) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#0b0b0d] flex flex-col">
      {/* Top bar */}
      <header className="px-5 py-4 border-b border-gold/10 flex items-center justify-between">
        <div>
          <p className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-text-dim">TheVMEx Admin</p>
          <p className="font-display text-[1.1rem] font-bold text-text-primary mt-0.5">{session.name}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="font-body text-[0.7rem] tracking-[0.12em] uppercase text-text-dim hover:text-[#e05c5c] transition-colors border border-gold/15 px-3 py-2"
        >
          Sign Out
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Stats grid */}
        {stats && (
          <div>
            <p className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-text-dim mb-3">Live Statistics</p>
            <div className="grid grid-cols-2 gap-2.5">
              <StatCard label="Total Bookings" value={stats.total} />
              <StatCard label="Confirmed" value={stats.approved} accent />
              <StatCard label="Pending Review" value={stats.pending} />
              <StatCard label="Revenue" value={`₹${Number(stats.totalRevenue ?? 0).toLocaleString("en-IN")}`} accent />
            </div>
          </div>
        )}

        {/* Primary actions */}
        <div>
          <p className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-text-dim mb-3">Actions</p>
          <div className="space-y-2.5">
            {/* Verification Queue */}
            <button
              type="button"
              onClick={() => onNavigate("queue")}
              className="w-full flex items-center justify-between px-5 py-5 bg-[#151316] border border-gold/20 hover:border-gold/50 hover:bg-[#1a1720] transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-gold/30 flex items-center justify-center group-hover:border-gold/60 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M2 5h14M2 9h14M2 13h8" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-body text-[0.9rem] font-semibold text-text-primary">Verification Queue</p>
                  <p className="font-body text-[0.72rem] text-text-muted mt-0.5">Review pending payments</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {pendingCount > 0 && (
                  <span className="w-6 h-6 rounded-full bg-gold text-[#0b0b0d] font-body font-bold text-[0.7rem] flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 12l4-4-4-4" stroke="#9a948c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>

            {/* Scanner */}
            <button
              type="button"
              onClick={() => router.push("/admin/scanner")}
              className="w-full flex items-center justify-between px-5 py-5 bg-[#151316] border border-gold/20 hover:border-gold/50 hover:bg-[#1a1720] transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-gold/30 flex items-center justify-center group-hover:border-gold/60 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M2 2h5v5H2zM11 2h5v5h-5zM2 11h5v5H2z" stroke="#d4af37" strokeWidth="1.5" strokeLinejoin="round" />
                    <rect x="12" y="12" width="2" height="2" fill="#d4af37" />
                    <rect x="15" y="12" width="2" height="2" fill="#d4af37" />
                    <rect x="12" y="15" width="2" height="2" fill="#d4af37" />
                    <rect x="15" y="15" width="2" height="2" fill="#d4af37" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-body text-[0.9rem] font-semibold text-text-primary">Ticket Scanner</p>
                  <p className="font-body text-[0.72rem] text-text-muted mt-0.5">Scan QR codes at entry gate</p>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12l4-4-4-4" stroke="#9a948c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Guest list / export */}
            <button
              type="button"
              onClick={() => onNavigate("attendees")}
              className="w-full flex items-center justify-between px-5 py-5 bg-[#151316] border border-gold/20 hover:border-gold/50 hover:bg-[#1a1720] transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-gold/30 flex items-center justify-center group-hover:border-gold/60 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="7" cy="5" r="3" stroke="#d4af37" strokeWidth="1.5" />
                    <path d="M1 16c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M13 8l2 2 3-3" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-body text-[0.9rem] font-semibold text-text-primary">Guest List</p>
                  <p className="font-body text-[0.72rem] text-text-muted mt-0.5">
                    {stats ? `${stats.approved} confirmed attendees` : "View & export attendees"}
                  </p>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12l4-4-4-4" stroke="#9a948c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Queue list screen ─────────────────────────────────────────────────────────
function QueueScreen({
  orders,
  session,
  onSelect,
  onBack,
}: {
  orders: AdminOrder[];
  session: AdminSession;
  onSelect: (order: AdminOrder) => void;
  onBack: () => void;
}) {
  const [filter, setFilter] = useState<"all" | "mine">("all");
  const filtered = filter === "mine" ? orders.filter((o) => o.claimedBy === session.id) : orders;

  return (
    <div className="min-h-screen bg-[#0b0b0d] flex flex-col">
      <header className="px-5 py-4 border-b border-gold/10">
        <BackButton onClick={onBack} />
        <div className="flex items-center justify-between mt-3">
          <h1 className="font-display text-[1.3rem] font-bold text-text-primary">Verification Queue</h1>
          <span className="font-body text-[0.7rem] bg-gold/10 border border-gold/20 text-gold px-3 py-1">
            {orders.length} pending
          </span>
        </div>
      </header>

      {/* Filter tabs */}
      <div className="flex border-b border-gold/10 bg-[#0b0b0d]">
        {(["all", "mine"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`flex-1 py-3 font-body text-[0.72rem] tracking-[0.12em] uppercase transition-colors ${
              filter === f
                ? "text-gold border-b-2 border-gold bg-gold/5"
                : "text-text-dim hover:text-text-muted"
            }`}
          >
            {f === "all" ? `All (${orders.length})` : `Mine`}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 px-6 text-center">
            <div className="w-10 h-px bg-gold/20 mb-4" />
            <p className="font-body text-[0.8rem] tracking-[0.15em] uppercase text-text-dim">Queue is empty</p>
          </div>
        ) : (
          <div className="divide-y divide-gold/[0.07]">
            {filtered.map((order) => (
              <button
                key={order.orderId}
                type="button"
                onClick={() => onSelect(order)}
                className="w-full text-left px-5 py-4 hover:bg-[#151316] transition-colors duration-150 active:bg-[#1a1720]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-[1.2rem] font-bold text-gold tabular-nums">
                      {formatPayableAmount(order.payableAmount)}
                    </p>
                    <p className="font-body text-[0.9rem] font-semibold text-text-primary mt-0.5 truncate">
                      {order.attendeeName}
                    </p>
                    <p className="font-body text-[0.72rem] text-text-muted mt-0.5">
                      {order.tierName} × {order.quantity}
                    </p>
                    {order.expiresAt && (
                      <p className="font-body text-[0.68rem] text-text-dim mt-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold/60 animate-pulse" />
                        Expires in <OrderCountdown expiresAt={order.expiresAt} />
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {order.claimedByName && order.claimedBy !== session.id && (
                      <span className="font-body text-[0.6rem] uppercase tracking-wider px-2 py-1 bg-[#2a1f0e] text-[#c9813a] border border-[#c9813a]/20">
                        {order.claimedByName}
                      </span>
                    )}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-30 mt-1">
                      <path d="M5 10.5l3.5-3.5L5 3.5" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Order detail screen ───────────────────────────────────────────────────────
function OrderDetailScreen({
  order,
  onBack,
  onApprove,
  onReject,
  loading,
  error,
}: {
  order: AdminOrder;
  onBack: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  loading: boolean;
  error: string;
}) {
  const [showRejectSheet, setShowRejectSheet] = useState(false);
  const [rejectReason, setRejectReason] = useState(REJECT_REASONS[0]);
  const [customReason, setCustomReason] = useState("");

  const handleRejectConfirm = () => {
    const reason = rejectReason === "Custom" ? customReason.trim() : rejectReason;
    if (!reason) return;
    onReject(reason);
    setShowRejectSheet(false);
  };

  return (
    <div className="min-h-screen bg-[#151316] flex flex-col">
      <header className="px-5 py-4 border-b border-gold/10 bg-[#0b0b0d]">
        <BackButton onClick={onBack} label="Back to Queue" />
      </header>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Amount hero */}
        <div className="bg-[#0b0b0d] border-b border-gold/10 px-5 py-8 text-center">
          <p className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-text-dim mb-2">
            Verify this exact amount in UPI history
          </p>
          <p className="font-display text-[3.5rem] font-bold text-gold tabular-nums leading-none">
            {formatPayableAmount(order.payableAmount)}
          </p>
        </div>

        {/* Key info */}
        <div className="px-5 py-5 space-y-3">
          <Row label="Guest Name" value={order.attendeeName} large />
          <Row label="Phone" value={order.phone} />
          <Row label="UTR Number" value={order.utr ?? "Not submitted"} highlight />
          <Row label="Order ID" value={order.orderId} mono />
          <Row label="Tier" value={`${order.tierName} × ${order.quantity}`} />
          <Row label="College" value={order.college} />
          <Row label="Year" value={order.year} />
          <Row label="Email" value={order.email} />
        </div>

        {/* Screenshot */}
        {order.screenshotPath && (
          <div className="px-5 pb-5">
            <p className="font-body text-[0.6rem] tracking-[0.18em] uppercase text-text-dim mb-3">
              Payment Screenshot
            </p>
            <img
              src={order.screenshotPath}
              alt="Payment screenshot"
              className="w-full max-h-[60vh] object-contain border border-gold/10"
            />
          </div>
        )}

        {error && (
          <div className="mx-5 mb-4 px-4 py-3 bg-[#e05c5c]/10 border border-[#e05c5c]/30">
            <p className="font-body text-[0.8rem] text-[#e05c5c]">{error}</p>
          </div>
        )}
      </div>

      {/* Fixed action bar at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0b0b0d] border-t border-gold/10 p-4 grid grid-cols-2 gap-3 safe-area-inset-bottom">
        <button
          type="button"
          onClick={() => setShowRejectSheet(true)}
          disabled={loading}
          className="py-4 border border-[#e05c5c]/50 text-[#e05c5c] font-body font-semibold text-[0.82rem] tracking-[0.1em] uppercase hover:bg-[#e05c5c]/10 transition-colors disabled:opacity-40"
        >
          Reject
        </button>
        <button
          type="button"
          onClick={onApprove}
          disabled={loading}
          className="py-4 bg-gold text-[#0b0b0d] font-body font-bold text-[0.82rem] tracking-[0.1em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-40"
        >
          {loading ? "Processing..." : "Approve"}
        </button>
      </div>

      {/* Reject bottom sheet */}
      {showRejectSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowRejectSheet(false)}
          />
          {/* Sheet */}
          <div className="relative bg-[#151316] border-t border-gold/20 rounded-t-xl p-6 pb-10">
            <div className="w-10 h-1 bg-gold/20 rounded-full mx-auto mb-6" />
            <p className="font-body text-[0.7rem] tracking-[0.18em] uppercase text-text-dim mb-4">
              Select Rejection Reason
            </p>
            <div className="space-y-2 mb-5">
              {[...REJECT_REASONS, "Custom"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRejectReason(r)}
                  className={`w-full text-left px-4 py-3.5 font-body text-[0.88rem] border transition-colors ${
                    rejectReason === r
                      ? "border-[#e05c5c]/60 bg-[#e05c5c]/10 text-[#e05c5c]"
                      : "border-gold/10 text-text-muted hover:border-gold/30 hover:text-text-primary"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            {rejectReason === "Custom" && (
              <input
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Type reason..."
                className="w-full px-4 py-3 bg-[#0b0b0d] border border-gold/20 text-text-primary font-body text-[0.9rem] outline-none mb-4 focus:border-gold/50"
              />
            )}
            <button
              type="button"
              onClick={handleRejectConfirm}
              disabled={loading || (rejectReason === "Custom" && !customReason.trim())}
              className="w-full py-4 bg-[#e05c5c] text-white font-body font-bold text-[0.82rem] tracking-[0.12em] uppercase hover:bg-[#c94a4a] transition-colors disabled:opacity-40"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Row helper ───────────────────────────────────────────────────────────────
function Row({
  label,
  value,
  highlight,
  large,
  mono,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  large?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-gold/[0.07]">
      <p className="font-body text-[0.68rem] tracking-[0.15em] uppercase text-text-dim shrink-0 pt-0.5">{label}</p>
      <p
        className={`text-right font-body break-all ${
          highlight
            ? "text-gold font-bold text-[1rem] font-mono"
            : large
            ? "text-text-primary font-semibold text-[0.95rem]"
            : mono
            ? "text-text-muted text-[0.78rem] font-mono"
            : "text-text-primary text-[0.88rem]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ─── Attendees / export screen ─────────────────────────────────────────────────
function AttendeesScreen({
  stats,
  onBack,
}: {
  stats: DbStats | null;
  onBack: () => void;
}) {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    const link = document.createElement("a");
    link.href = "/api/admin/export?status=approved";
    link.click();
    setTimeout(() => setExporting(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0d] flex flex-col">
      <header className="px-5 py-4 border-b border-gold/10">
        <BackButton onClick={onBack} />
        <h1 className="font-display text-[1.3rem] font-bold text-text-primary mt-3">Guest List</h1>
      </header>
      <div className="flex-1 p-5">
        <div className="border border-gold/20 bg-[#151316] p-8 text-center mb-6">
          <p className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-text-dim mb-3">Confirmed Tickets</p>
          <p className="font-display text-[4rem] font-bold text-gold tabular-nums leading-none">
            {stats?.approved ?? "—"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="w-full py-4 bg-gold text-[#0b0b0d] font-body font-bold text-[0.85rem] tracking-[0.15em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-50"
        >
          {exporting ? "Preparing CSV..." : "Download Guest List (CSV)"}
        </button>
        <p className="font-body text-[0.7rem] text-text-dim text-center mt-4">
          Exports all confirmed attendees with name, phone, ticket ID, and college.
        </p>
      </div>
    </div>
  );
}

// ─── Root page ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [stats, setStats] = useState<DbStats | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.status === 401) { setSession(null); return; }
      const data = await res.json();
      setSession(data.admin);
      setOrders(data.orders ?? []);
    } catch { /* silent polling failure */ }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/health");
      const data = await res.json();
      if (data.ok) setStats(data.stats);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchStats();
    pollRef.current = setInterval(() => {
      fetchOrders();
      fetchStats();
    }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchOrders, fetchStats]);

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    setSession(null);
    setScreen("dashboard");
  };

  const handleSelectOrder = async (order: AdminOrder) => {
    setActionError("");
    setSelectedOrder(order);
    setScreen("detail");
    try {
      await fetch(`/api/admin/orders/${order.orderId}/claim`, { method: "POST" });
      fetchOrders();
    } catch { /* claim optional */ }
  };

  const handleApprove = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.orderId}/approve`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Approve failed");
      setSelectedOrder(null);
      setScreen("queue");
      fetchOrders();
      fetchStats();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedOrder) return;
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.orderId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Reject failed");
      setSelectedOrder(null);
      setScreen("queue");
      fetchOrders();
      fetchStats();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Reject failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (!session) {
    return <LoginScreen onLogin={(s) => { setSession(s); fetchOrders(); }} />;
  }

  if (screen === "queue") {
    return (
      <QueueScreen
        orders={orders}
        session={session}
        onSelect={handleSelectOrder}
        onBack={() => setScreen("dashboard")}
      />
    );
  }

  if (screen === "detail" && selectedOrder) {
    return (
      <OrderDetailScreen
        order={selectedOrder}
        onBack={() => { setSelectedOrder(null); setScreen("queue"); }}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={actionLoading}
        error={actionError}
      />
    );
  }

  if (screen === "attendees") {
    return (
      <AttendeesScreen
        stats={stats}
        onBack={() => setScreen("dashboard")}
      />
    );
  }

  return (
    <DashboardScreen
      session={session}
      stats={stats}
      pendingCount={orders.length}
      onNavigate={setScreen}
      onLogout={handleLogout}
      exporting={false}
      onExport={() => {}}
    />
  );
}
