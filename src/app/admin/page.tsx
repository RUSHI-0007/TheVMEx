"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ADMIN_TEAM_MEMBERS } from "@/lib/config";
import type { Order } from "@/lib/db";

// ─── Admin Login ──────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }: { onLogin: (name: string) => void }) {
  const [memberId, setMemberId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError("Invalid credentials. Check your ID and PIN.");
      } else {
        onLogin(data.name);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0b0b0d] flex items-center justify-center p-8">
      <div className="w-full max-w-[380px] border border-gold/20 bg-[#18151a] p-10">
        <div className="text-center mb-8">
          <p className="font-script text-[1rem] text-gold-muted mb-1">TheVMEx</p>
          <h1 className="font-display text-[1.4rem] font-bold text-text-primary">
            Admin Panel
          </h1>
          <p className="font-body text-[0.72rem] text-text-dim mt-1 tracking-[0.1em] uppercase">
            Masquerade Night 2026
          </p>
        </div>

        <div className="grid gap-4 mb-6">
          <div>
            <label className="block font-body text-[0.75rem] font-semibold tracking-[0.1em] uppercase text-text-muted mb-1.5" htmlFor="admin-member">Team Member</label>
            <select
              id="admin-member"
              className="w-full px-4 py-3 bg-white/[0.03] border border-gold/20 text-text-primary font-body text-[0.9rem] outline-none transition-colors duration-300 focus:border-gold/50 focus:bg-gold/[0.03]"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            >
              <option value="">Select your name</option>
              {ADMIN_TEAM_MEMBERS.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-body text-[0.75rem] font-semibold tracking-[0.1em] uppercase text-text-muted mb-1.5" htmlFor="admin-pin">PIN</label>
            <input
              id="admin-pin"
              className="w-full px-4 py-3 bg-white/[0.03] border border-gold/20 text-text-primary font-body text-[0.9rem] outline-none transition-colors duration-300 focus:border-gold/50 focus:bg-gold/[0.03]"
              type="password"
              placeholder="Enter your PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
        </div>

        {error && (
          <p className="font-body text-[0.78rem] text-[#e05c5c] mb-4">
            ⚠ {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={!memberId || !pin || loading}
          className={`relative inline-flex items-center justify-center gap-2 w-full py-3 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-[#0b0b0d] bg-gold border border-gold transition-colors duration-400 whitespace-nowrap ${(!memberId || !pin) ? "opacity-50 cursor-not-allowed" : "hover:bg-gold-muted hover:border-gold-muted cursor-pointer"}`}
          id="admin-login-btn"
        >
          {loading ? "Logging in…" : "Login"}
        </button>
      </div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string; border: string }> = {
    pending:  { bg: "bg-gold/[0.12]", color: "text-gold", border: "border-gold/20" },
    approved: { bg: "bg-[#2ea043]/[0.12]",  color: "text-[#3fb950]", border: "border-[#3fb950]/20" },
    rejected: { bg: "bg-[#e05c5c]/[0.12]",  color: "text-[#e05c5c]", border: "border-[#e05c5c]/20" },
    expired:  { bg: "bg-white/[0.05]", color: "text-text-dim", border: "border-text-dim/20" },
    refunded: { bg: "bg-[#b464dc]/[0.12]", color: "text-[#b464dc]", border: "border-[#b464dc]/20" },
  };
  const c = colors[status] ?? colors.pending;
  return (
    <span className={`px-2.5 py-1 font-body text-[0.6rem] tracking-[0.15em] uppercase font-semibold border ${c.bg} ${c.color} ${c.border}`}>
      {status}
    </span>
  );
}

// ─── Rejection dialog ─────────────────────────────────────────────────────────
const REJECT_REASONS = [
  "Amount mismatch — different amount received",
  "No matching transaction found",
  "Duplicate UTR — already used for another order",
  "Transaction not found in UPI history",
  "Screenshot unclear / unreadable",
];

function RejectDialog({
  orderId,
  onConfirm,
  onCancel,
}: {
  orderId: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  const [custom, setCustom] = useState("");
  const finalReason = reason === "__custom__" ? custom : reason;

  return (
    <div
      className="fixed inset-0 bg-[#0b0b0d]/85 backdrop-blur-sm z-[200] flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="w-full max-w-[440px] border border-[#e05c5c]/20 bg-[#18151a] p-8"
      >
        <h3 className="font-display text-[1.15rem] font-bold text-text-primary mb-1">
          Reject Order
        </h3>
        <p className="font-body text-[0.75rem] text-text-dim mb-6">
          {orderId}
        </p>

        <div className="grid gap-2 mb-4">
          {REJECT_REASONS.map((r) => (
            <label
              key={r}
              className={`flex gap-3 items-start cursor-pointer font-body text-[0.82rem] leading-[1.4] ${reason === r ? "text-text-primary" : "text-text-muted"}`}
            >
              <input
                type="radio"
                name="reject-reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
                className="mt-0.5 accent-gold"
              />
              {r}
            </label>
          ))}
          <label className="flex gap-3 items-start cursor-pointer font-body text-[0.82rem] text-text-muted">
            <input
              type="radio"
              name="reject-reason"
              value="__custom__"
              checked={reason === "__custom__"}
              onChange={() => setReason("__custom__")}
              className="mt-0.5 accent-gold"
            />
            Other (type below)
          </label>
          {reason === "__custom__" && (
            <input
              className="w-[calc(100%-1.5rem)] ml-6 px-4 py-3 bg-white/[0.03] border border-gold/20 text-text-primary font-body text-[0.9rem] outline-none transition-colors duration-300 focus:border-gold/50 focus:bg-gold/[0.03] mt-2"
              placeholder="Describe the rejection reason"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              autoFocus
            />
          )}
        </div>

        <div className="flex gap-3 flex-wrap mt-6">
          <button className="flex-1 relative inline-flex items-center justify-center gap-2 px-4 py-3 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-gold bg-transparent border border-gold/40 hover:text-[#0b0b0d] hover:border-gold hover:bg-gold transition-colors duration-400 whitespace-nowrap group" onClick={onCancel}>
            <span className="absolute inset-0 bg-gold scale-x-0 origin-left transition-transform duration-400 group-hover:scale-x-100 -z-10" />
            Cancel
          </button>
          <button
            onClick={() => finalReason && onConfirm(finalReason)}
            disabled={!finalReason.trim()}
            className={`flex-1 font-body text-[0.8rem] font-semibold tracking-[0.1em] uppercase py-3 border-none transition-colors duration-200 ${!finalReason.trim() ? "bg-[#e05c5c]/20 text-[#e05c5c]/50 cursor-not-allowed" : "bg-[#c0392b] text-white cursor-pointer hover:bg-[#a93226]"}`}
          >
            Confirm Reject
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Order Row ────────────────────────────────────────────────────────────────
function ExpiryTimer({ expiresAt }: { expiresAt: number }) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, expiresAt - Math.floor(Date.now() / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const urgent = remaining < 300;
  if (remaining === 0) return <span className="text-[#e05c5c] text-[0.72rem] font-body">Expired</span>;
  return (
    <span className={`font-mono text-[0.8rem] ${urgent ? "text-[#e05c5c]" : "text-gold-muted"}`}>
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </span>
  );
}

function OrderCard({
  order,
  onApprove,
  onReject,
  onResendEmail,
}: {
  order: Order;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onResendEmail: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [resending, setResending] = useState(false);

  return (
    <div className="border border-gold/[0.12] bg-[#18151a] mb-px">
      {/* Header row */}
      <div
        className="grid grid-cols-[1fr_auto] gap-4 p-4 md:px-5 cursor-pointer items-center hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-wrap gap-4 items-center">
          <span className="font-mono text-[0.8rem] text-gold-muted tracking-[0.05em]">{order.id}</span>
          <span className="font-display text-[1rem] text-text-primary font-semibold">
            ₹{order.payable_amount}
          </span>
          <StatusBadge status={order.status} />
          {order.status === "approved" && (
            <span className={`font-body text-[0.6rem] px-2 py-0.5 rounded-full border ${order.email_sent ? "text-[#3fb950] border-[#3fb950]/30 bg-[#3fb950]/5" : "text-[#e05c5c] border-[#e05c5c]/30 bg-[#e05c5c]/5"}`}>
              {order.email_sent ? "✓ Email Sent" : "⚠ Email Failed"}
            </span>
          )}
          <span className="font-body text-[0.75rem] text-text-muted">{order.attendee_name}</span>
          <span className="font-body text-[0.72rem] text-text-dim">{order.ticket_tier_label} × {order.quantity}</span>
          {order.status === "pending" && <ExpiryTimer expiresAt={order.expires_at} />}
        </div>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`shrink-0 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}>
          <path d="M3 5l4 4 4-4" stroke="#8a8a93" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-5 border-t border-gold/[0.08] grid gap-6 bg-[#0b0b0d]/30">
              {/* Attendee info */}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
                {[
                  ["Phone", order.attendee_phone],
                  ["Email", order.attendee_email],
                  ["College", order.attendee_college],
                  ["Year", order.attendee_year],
                  ["UTR", order.utr ?? "—"],
                  ["Created", new Date(order.created_at * 1000).toLocaleTimeString("en-IN")],
                ].map(([l, v]) => (
                  <div key={l}>
                    <p className="font-body text-[0.58rem] tracking-[0.15em] uppercase text-text-dim mb-1">{l}</p>
                    <p className="font-body text-[0.82rem] text-text-muted">{v}</p>
                  </div>
                ))}
              </div>

              {/* Screenshot */}
              {order.screenshot_path && (
                <div>
                  <p className="font-body text-[0.6rem] tracking-[0.15em] uppercase text-text-dim mb-2">Payment Screenshot</p>
                  <a href={order.screenshot_path} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={order.screenshot_path}
                      alt="Payment screenshot"
                      className="max-w-[220px] max-h-[200px] object-cover border border-gold/15"
                    />
                  </a>
                </div>
              )}

              {/* Handled by info */}
              {order.handled_by_name && (
                <p className="font-body text-[0.72rem] text-text-dim">
                  {order.status === "approved" ? "Approved" : "Rejected"} by <strong className="text-gold-muted">{order.handled_by_name}</strong>
                  {order.rejection_reason && ` · Reason: ${order.rejection_reason}`}
                </p>
              )}

              {/* Action buttons */}
              {order.status === "pending" && (
                <div className="flex gap-3 flex-wrap">
                  <button
                    id={`approve-${order.id}`}
                    onClick={() => onApprove(order.id)}
                    className="font-body text-[0.75rem] font-semibold tracking-[0.1em] uppercase px-6 py-2.5 bg-[#2ea043]/15 text-[#3fb950] border border-[#2ea043]/30 cursor-pointer hover:bg-[#2ea043]/25 transition-colors"
                  >
                    ✓ Approve
                  </button>
                  <button
                    id={`reject-${order.id}`}
                    onClick={() => onReject(order.id)}
                    className="font-body text-[0.75rem] font-semibold tracking-[0.1em] uppercase px-6 py-2.5 bg-[#e05c5c]/15 text-[#e05c5c] border border-[#e05c5c]/30 cursor-pointer hover:bg-[#e05c5c]/25 transition-colors"
                  >
                    ✕ Reject
                  </button>
                </div>
              )}

              {/* Resend email button for approved orders */}
              {order.status === "approved" && (
                <div className="flex gap-3 flex-wrap mt-2">
                  <button
                    onClick={async () => {
                      setResending(true);
                      await onResendEmail(order.id);
                      setResending(false);
                    }}
                    disabled={resending}
                    className={`font-body text-[0.75rem] font-semibold tracking-[0.05em] uppercase px-4 py-2 bg-gold/10 text-gold border border-gold/30 transition-colors ${resending ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gold/20"}`}
                  >
                    {resending ? "Sending..." : "Resend Email"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
function AdminDashboard({ adminName }: { adminName: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected" | "expired" | "refunded">("pending");

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) return;
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll every 8 seconds for live updates
  useEffect(() => {
    fetchOrders();
    const id = setInterval(fetchOrders, 8000);
    return () => clearInterval(id);
  }, [fetchOrders]);

  const handleApprove = async (orderId: string) => {
    const res = await fetch(`/api/admin/orders/${orderId}/approve`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setStatusMsg({ text: `Order ${orderId} approved ✓`, ok: true });
      fetchOrders();
    } else {
      setStatusMsg({ text: `Failed to approve order: ${data.error}`, ok: false });
    }
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const handleResendEmail = async (orderId: string) => {
    const res = await fetch(`/api/admin/orders/${orderId}/resend-email`, { method: "POST" });
    const data = await res.json();
    if (res.ok && data.ok) {
      setStatusMsg({ text: `Email resent for order ${orderId} ✓`, ok: true });
      fetchOrders();
    } else {
      setStatusMsg({ text: `Failed to resend email: ${data.error}`, ok: false });
    }
    setTimeout(() => setStatusMsg(null), 5000);
  };


  const handleReject = async (orderId: string, reason: string) => {
    setRejectTarget(null);
    const res = await fetch(`/api/admin/orders/${orderId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatusMsg({ text: `Order ${orderId} rejected.`, ok: true });
      fetchOrders();
    } else if (data.error === "already_handled") {
      setStatusMsg({ text: "This order was already handled.", ok: false });
      fetchOrders();
    } else {
      setStatusMsg({ text: `Error: ${data.error}`, ok: false });
    }
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.reload();
  };

  const filteredOrders = orders.filter((o) => filter === "all" || o.status === filter);
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="min-h-[100dvh] bg-[#0b0b0d] font-body text-text-primary">
      {/* Header */}
      <header className="border-b border-gold/[0.12] p-4 px-6 flex items-center justify-between bg-[#151316] sticky top-0 z-50">
        <div>
          <p className="font-display text-[1rem] font-bold text-text-primary">TheVMEx Admin</p>
          <p className="text-[0.68rem] text-text-dim tracking-[0.1em]">Logged in as <strong className="text-gold-muted">{adminName}</strong></p>
        </div>
        <div className="flex items-center gap-4">
          {pendingCount > 0 && (
            <span className="font-body text-[0.65rem] tracking-[0.1em] uppercase bg-gold/15 text-gold px-2.5 py-1 border border-gold/25">
              {pendingCount} pending
            </span>
          )}
          <button onClick={fetchOrders} className="bg-transparent border border-gold/20 px-3.5 py-1.5 text-text-muted text-[0.72rem] cursor-pointer tracking-[0.1em] hover:bg-gold/5 hover:text-gold transition-colors">
            Refresh
          </button>
          <button onClick={handleLogout} className="bg-transparent border-none text-text-dim text-[0.72rem] cursor-pointer hover:text-white transition-colors">
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-[1100px] mx-auto p-8 px-6">
        {/* Status message */}
        <AnimatePresence>
          {statusMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`px-5 py-3 mb-6 border font-body text-[0.82rem] ${statusMsg.ok ? "border-[#3fb950]/30 bg-[#3fb950]/10 text-[#3fb950]" : "border-[#e05c5c]/30 bg-[#e05c5c]/10 text-[#e05c5c]"}`}
            >
              {statusMsg.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["pending", "approved", "rejected", "expired", "refunded", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-body text-[0.68rem] tracking-[0.12em] uppercase px-3.5 py-1.5 border transition-colors duration-200 cursor-pointer ${filter === f ? "bg-gold text-[#0b0b0d] border-gold" : "bg-transparent text-text-muted border-gold/20 hover:border-gold/50"}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {loading ? (
          <p className="text-text-dim text-[0.82rem] text-center p-12">Loading orders…</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-text-dim text-[0.82rem] text-center p-12">No {filter} orders.</p>
        ) : (
          <div>
            {filteredOrders.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                onApprove={handleApprove}
                onReject={(id) => setRejectTarget(id)}
                onResendEmail={handleResendEmail}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reject dialog */}
      <AnimatePresence>
        {rejectTarget && (
          <RejectDialog
            orderId={rejectTarget}
            onConfirm={(reason) => handleReject(rejectTarget, reason)}
            onCancel={() => setRejectTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [adminName, setAdminName] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  // Check if already logged in (session cookie exists)
  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => {
        if (r.ok) {
          // Session valid — but we don't have the name from cookie directly
          // so just set a placeholder that triggers dashboard
          const session = document.cookie.includes("vmex_admin_session");
          if (session) setAdminName("Admin");
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-[100dvh] bg-[#0b0b0d] flex items-center justify-center">
        <p className="font-body text-[0.8rem] text-text-dim">Loading…</p>
      </div>
    );
  }

  if (!adminName) {
    return <AdminLogin onLogin={setAdminName} />;
  }

  return <AdminDashboard adminName={adminName} />;
}
