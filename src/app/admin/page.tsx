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
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          border: "1px solid rgba(212,175,55,0.2)",
          background: "var(--bg-card)",
          padding: "2.5rem",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p style={{ fontFamily: "var(--font-script)", fontSize: "1rem", color: "var(--gold-muted)", marginBottom: "0.25rem" }}>TheVMEx</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Admin Panel
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "0.3rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Masquerade Night 2026
          </p>
        </div>

        <div style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <label className="input-label" htmlFor="admin-member">Team Member</label>
            <select
              id="admin-member"
              className="input-field"
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
            <label className="input-label" htmlFor="admin-pin">PIN</label>
            <input
              id="admin-pin"
              className="input-field"
              type="password"
              placeholder="Enter your PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
        </div>

        {error && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "#e05c5c", marginBottom: "1rem" }}>
            ⚠ {error}
          </p>
        )}

        <button
          className="btn-gold"
          onClick={handleLogin}
          disabled={!memberId || !pin || loading}
          style={{ width: "100%", opacity: (!memberId || !pin) ? 0.5 : 1, cursor: (!memberId || !pin) ? "not-allowed" : "pointer" }}
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
  const colors: Record<string, { bg: string; color: string }> = {
    pending:  { bg: "rgba(212,175,55,0.12)", color: "var(--gold)" },
    approved: { bg: "rgba(46,160,67,0.12)",  color: "#3fb950" },
    rejected: { bg: "rgba(224,92,92,0.12)",  color: "#e05c5c" },
    expired:  { bg: "rgba(120,120,120,0.1)", color: "var(--text-dim)" },
    refunded: { bg: "rgba(180,100,220,0.12)", color: "#b464dc" },
  };
  const c = colors[status] ?? colors.pending;
  return (
    <span style={{
      padding: "0.2rem 0.6rem",
      fontFamily: "var(--font-body)",
      fontSize: "0.6rem",
      letterSpacing: "0.15em",
      textTransform: "uppercase",
      fontWeight: 600,
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.color}33`,
    }}>
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
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(11,11,13,0.85)",
        backdropFilter: "blur(4px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        style={{
          width: "100%",
          maxWidth: "440px",
          border: "1px solid rgba(224,92,92,0.2)",
          background: "var(--bg-card)",
          padding: "2rem",
        }}
      >
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
          Reject Order
        </h3>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--text-dim)", marginBottom: "1.5rem" }}>
          {orderId}
        </p>

        <div style={{ display: "grid", gap: "0.5rem", marginBottom: "1rem" }}>
          {REJECT_REASONS.map((r) => (
            <label
              key={r}
              style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "0.82rem", color: reason === r ? "var(--text-primary)" : "var(--text-muted)", lineHeight: 1.4 }}
            >
              <input
                type="radio"
                name="reject-reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
                style={{ marginTop: "2px", accentColor: "var(--gold)" }}
              />
              {r}
            </label>
          ))}
          <label style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--text-muted)" }}>
            <input
              type="radio"
              name="reject-reason"
              value="__custom__"
              checked={reason === "__custom__"}
              onChange={() => setReason("__custom__")}
              style={{ marginTop: "2px", accentColor: "var(--gold)" }}
            />
            Other (type below)
          </label>
          {reason === "__custom__" && (
            <input
              className="input-field"
              placeholder="Describe the rejection reason"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              style={{ marginLeft: "1.5rem" }}
              autoFocus
            />
          )}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button className="btn-gold-outline" onClick={onCancel} style={{ flex: 1 }}>Cancel</button>
          <button
            onClick={() => finalReason && onConfirm(finalReason)}
            disabled={!finalReason.trim()}
            style={{
              flex: 1,
              fontFamily: "var(--font-body)",
              fontSize: "0.8rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "0.75rem 1rem",
              background: !finalReason.trim() ? "rgba(224,92,92,0.2)" : "#c0392b",
              color: !finalReason.trim() ? "#e05c5c88" : "#fff",
              border: "none",
              cursor: !finalReason.trim() ? "not-allowed" : "pointer",
            }}
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
  if (remaining === 0) return <span style={{ color: "#e05c5c", fontSize: "0.72rem", fontFamily: "var(--font-body)" }}>Expired</span>;
  return (
    <span style={{ color: urgent ? "#e05c5c" : "var(--gold-muted)", fontFamily: "monospace", fontSize: "0.8rem" }}>
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
    <div style={{ border: "1px solid rgba(212,175,55,0.12)", background: "var(--bg-card)", marginBottom: "1px" }}>
      {/* Header row */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", padding: "1rem 1.25rem", cursor: "pointer", alignItems: "center" }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
          <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--gold-muted)", letterSpacing: "0.05em" }}>{order.id}</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--text-primary)", fontWeight: 600 }}>
            ₹{order.payable_amount}
          </span>
          <StatusBadge status={order.status} />
          {order.status === "approved" && (
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", color: order.email_sent ? "#3fb950" : "#e05c5c", border: `1px solid ${order.email_sent ? "#3fb95044" : "#e05c5c44"}`, padding: "0.15rem 0.4rem", borderRadius: "10px" }}>
              {order.email_sent ? "✓ Email Sent" : "⚠ Email Failed"}
            </span>
          )}
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--text-muted)" }}>{order.attendee_name}</span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--text-dim)" }}>{order.ticket_tier_label} × {order.quantity}</span>
          {order.status === "pending" && <ExpiryTimer expiresAt={order.expires_at} />}
        </div>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.25s", flexShrink: 0 }}>
          <path d="M3 5l4 4 4-4" stroke="var(--text-dim)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "1.25rem", borderTop: "1px solid rgba(212,175,55,0.08)", display: "grid", gap: "1.5rem" }}>
              {/* Attendee info */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
                {[
                  ["Phone", order.attendee_phone],
                  ["Email", order.attendee_email],
                  ["College", order.attendee_college],
                  ["Year", order.attendee_year],
                  ["UTR", order.utr ?? "—"],
                  ["Created", new Date(order.created_at * 1000).toLocaleTimeString("en-IN")],
                ].map(([l, v]) => (
                  <div key={l}>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.2rem" }}>{l}</p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--text-muted)" }}>{v}</p>
                  </div>
                ))}
              </div>

              {/* Screenshot */}
              {order.screenshot_path && (
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.5rem" }}>Payment Screenshot</p>
                  <a href={order.screenshot_path} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={order.screenshot_path}
                      alt="Payment screenshot"
                      style={{ maxWidth: "220px", maxHeight: "200px", objectFit: "cover", border: "1px solid rgba(212,175,55,0.15)" }}
                    />
                  </a>
                </div>
              )}

              {/* Handled by info */}
              {order.handled_by_name && (
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--text-dim)" }}>
                  {order.status === "approved" ? "Approved" : "Rejected"} by <strong style={{ color: "var(--gold-muted)" }}>{order.handled_by_name}</strong>
                  {order.rejection_reason && ` · Reason: ${order.rejection_reason}`}
                </p>
              )}

              {/* Action buttons */}
              {order.status === "pending" && (
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <button
                    id={`approve-${order.id}`}
                    onClick={() => onApprove(order.id)}
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      padding: "0.6rem 1.5rem",
                      background: "rgba(46,160,67,0.15)",
                      color: "#3fb950",
                      border: "1px solid rgba(46,160,67,0.3)",
                      cursor: "pointer",
                    }}
                  >
                    ✓ Approve
                  </button>
                  <button
                    id={`reject-${order.id}`}
                    onClick={() => onReject(order.id)}
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      padding: "0.6rem 1.5rem",
                      background: "rgba(224,92,92,0.12)",
                      color: "#e05c5c",
                      border: "1px solid rgba(224,92,92,0.25)",
                      cursor: "pointer",
                    }}
                  >
                    ✕ Reject
                  </button>
                </div>
              )}

              {/* Resend email button for approved orders */}
              {order.status === "approved" && (
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                  <button
                    onClick={async () => {
                      setResending(true);
                      await onResendEmail(order.id);
                      setResending(false);
                    }}
                    disabled={resending}
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      padding: "0.5rem 1rem",
                      background: "rgba(212,175,55,0.1)",
                      color: "var(--gold)",
                      border: "1px solid rgba(212,175,55,0.3)",
                      cursor: resending ? "not-allowed" : "pointer",
                      opacity: resending ? 0.5 : 1
                    }}
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
    <div style={{ minHeight: "100dvh", background: "var(--bg-primary)", fontFamily: "var(--font-body)" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(212,175,55,0.12)", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-secondary)", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>TheVMEx Admin</p>
          <p style={{ fontSize: "0.68rem", color: "var(--text-dim)", letterSpacing: "0.1em" }}>Logged in as <strong style={{ color: "var(--gold-muted)" }}>{adminName}</strong></p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {pendingCount > 0 && (
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(212,175,55,0.15)", color: "var(--gold)", padding: "0.25rem 0.65rem", border: "1px solid rgba(212,175,55,0.25)" }}>
              {pendingCount} pending
            </span>
          )}
          <button onClick={fetchOrders} style={{ background: "none", border: "1px solid rgba(212,175,55,0.2)", padding: "0.4rem 0.85rem", color: "var(--text-muted)", fontSize: "0.72rem", cursor: "pointer", letterSpacing: "0.1em" }}>
            Refresh
          </button>
          <button onClick={handleLogout} style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: "0.72rem", cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </header>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Status message */}
        <AnimatePresence>
          {statusMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ padding: "0.85rem 1.25rem", marginBottom: "1.5rem", border: `1px solid ${statusMsg.ok ? "rgba(46,160,67,0.3)" : "rgba(224,92,92,0.3)"}`, background: statusMsg.ok ? "rgba(46,160,67,0.08)" : "rgba(224,92,92,0.08)", fontFamily: "var(--font-body)", fontSize: "0.82rem", color: statusMsg.ok ? "#3fb950" : "#e05c5c" }}
            >
              {statusMsg.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {(["pending", "approved", "rejected", "expired", "refunded", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.68rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "0.4rem 0.9rem",
                background: filter === f ? "var(--gold)" : "transparent",
                color: filter === f ? "var(--bg-primary)" : "var(--text-muted)",
                border: `1px solid ${filter === f ? "var(--gold)" : "rgba(212,175,55,0.2)"}`,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {loading ? (
          <p style={{ color: "var(--text-dim)", fontSize: "0.82rem", textAlign: "center", padding: "3rem" }}>Loading orders…</p>
        ) : filteredOrders.length === 0 ? (
          <p style={{ color: "var(--text-dim)", fontSize: "0.82rem", textAlign: "center", padding: "3rem" }}>No {filter} orders.</p>
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
      <div style={{ minHeight: "100dvh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--text-dim)" }}>Loading…</p>
      </div>
    );
  }

  if (!adminName) {
    return <AdminLogin onLogin={setAdminName} />;
  }

  return <AdminDashboard adminName={adminName} />;
}
