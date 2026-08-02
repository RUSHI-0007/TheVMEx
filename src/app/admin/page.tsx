"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ADMIN_TEAM_MEMBERS as ADMIN_TEAM } from "@/lib/config";
import { Button } from "@/components/ui/Button";
import { formatPayableAmount } from "@/lib/utils";
import { OrderCountdown } from "@/components/ui/CountdownTimer";
import { TicketScanner } from "@/components/admin/TicketScanner";

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

export default function AdminPage() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loginForm, setLoginForm] = useState({ name: "", pin: "" });
  const [loginError, setLoginError] = useState("");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [auditLog, setAuditLog] = useState<
    Array<{ action: string; adminName: string | null; details: string | null; createdAt: string }>
  >([]);
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState(REJECT_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [filter, setFilter] = useState<"all" | "mine">("all");
  const [view, setView] = useState<"queue" | "attendees" | "scanner">("queue");
  const [stats, setStats] = useState<DbStats | null>(null);
  const [exportStatus, setExportStatus] = useState<"approved" | "all">("approved");
  const [exporting, setExporting] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.status === 401) {
        setSession(null);
        return;
      }
      const data = await res.json();
      setSession(data.admin);
      setOrders(data.orders ?? []);
    } catch {
      /* polling failure — silent retry */
    }
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
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchOrders, fetchStats]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      setSession(data.admin);
      fetchOrders();
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : "Login failed");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    setSession(null);
    setSelectedOrder(null);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const url = `/api/admin/export?status=${exportStatus}`;
      const link = document.createElement("a");
      link.href = url;
      link.click();
    } finally {
      setTimeout(() => setExporting(false), 1500);
    }
  };

  const openOrder = async (order: AdminOrder) => {
    setActionError("");
    setSelectedOrder(order);

    try {
      await fetch(`/api/admin/orders/${order.orderId}/claim`, {
        method: "POST",
      });
      fetchOrders();

      const res = await fetch(`/api/admin/orders/${order.orderId}`);
      const data = await res.json();
      if (data.auditLog) setAuditLog(data.auditLog);
    } catch {
      /* claim optional */
    }
  };

  const handleApprove = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(
        `/api/admin/orders/${selectedOrder.orderId}/approve`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Approve failed");
      setSelectedOrder(null);
      fetchOrders();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedOrder) return;
    const reason =
      rejectReason === "Custom" ? customReason.trim() : rejectReason;
    if (!reason) {
      setActionError("Please provide a rejection reason");
      return;
    }

    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(
        `/api/admin/orders/${selectedOrder.orderId}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Reject failed");
      setSelectedOrder(null);
      fetchOrders();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Reject failed");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!selectedOrder) return;
      if (e.key === "a" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleApprove();
      }
      if (e.key === "r" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleReject();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrder]);

  if (!session) {
    return (
      <div className="min-h-screen bg-[#151316] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at center, #d4af37 0%, transparent 40%)" }} />
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-[#0b0b0d]/90 backdrop-blur-md border border-gold/40 p-10 shadow-[0_0_30px_rgba(212,175,55,0.1)] relative z-10"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gold/50"></div>
          <h1 className="font-display text-[2.2rem] font-bold text-text-primary mb-8 text-center">
            Admin <span className="text-gold italic">Login</span>
          </h1>
          <div className="space-y-6">
            <div>
              <label className="block font-body text-[0.75rem] font-bold tracking-[0.15em] uppercase text-gold-muted mb-2">
                Team Member
              </label>
              <select
                value={loginForm.name}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#0b0b0d] border border-gold/30 text-text-primary font-body text-[0.95rem] outline-none transition-all duration-300 rounded-sm shadow-inner focus:border-gold focus:ring-1 focus:ring-gold/30 hover:border-gold/50 appearance-none"
              >
                <option value="">Select your name</option>
                {ADMIN_TEAM.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-body text-[0.75rem] font-bold tracking-[0.15em] uppercase text-gold-muted mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={loginForm.pin}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, pin: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#0b0b0d]/50 border border-gold/30 text-text-primary font-body text-[0.95rem] outline-none transition-all duration-300 rounded-sm shadow-inner focus:border-gold focus:ring-1 focus:ring-gold/30 hover:border-gold/50"
              />
            </div>
          </div>
          {loginError && (
            <p className="font-body text-[0.75rem] text-[#e05c5c] mt-4 font-semibold tracking-wide text-center">⚠ {loginError}</p>
          )}
          <div className="mt-8">
            <Button type="submit" variant="gold" className="w-full justify-center">
              Enter Dashboard →
            </Button>
          </div>
        </form>
      </div>
    );
  }

  const filteredOrders =
    filter === "mine"
      ? orders.filter((o) => o.claimedBy === session.id)
      : orders;

  return (
    <div className="min-h-screen bg-[#151316] flex flex-col text-text-primary selection:bg-gold/30 selection:text-gold">
      <header className="border-b border-gold/20 p-6 md:px-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0b0b0d]">
        <div>
          <h1 className="font-display text-[1.8rem] font-bold tracking-wide">
            Masquerade <span className="text-gold italic">Admin</span>
          </h1>
          <p className="font-body text-[0.8rem] text-text-muted mt-1">
            Logged in as <strong className="text-gold">{session.name}</strong>
          </p>
        </div>

        <div className="flex gap-4 items-center">
          <Button variant="outline" onClick={handleLogout} className="text-xs py-2 px-4">
            Logout
          </Button>
        </div>
      </header>

      <div className="bg-[#0b0b0d] border-b border-gold/10 px-6 py-4 flex items-center justify-between flex-wrap gap-4">
        {stats && (
          <div className="flex gap-6 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {[
              { label: "Total Bookings", value: stats.total },
              { label: "Approved Tickets", value: stats.approved },
              { label: "⏳ Pending", value: stats.pending },
              { label: "Revenue", value: `₹${Number(stats.totalRevenue ?? 0).toLocaleString("en-IN")}` },
            ].map((s) => (
              <div key={s.label} className="min-w-fit">
                <p className="font-body text-[0.65rem] uppercase tracking-[0.15em] text-text-muted mb-1">{s.label}</p>
                <p className="font-display text-[1.4rem] font-bold text-gold">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 rounded-sm p-1 bg-[#151316] border border-gold/10">
          <button
            type="button"
            onClick={() => setView("queue")}
            className={`px-5 py-2 font-body text-[0.75rem] uppercase tracking-wider transition-colors rounded-sm ${
              view === "queue" ? "bg-gold/10 text-gold font-bold" : "text-text-muted hover:text-text-primary hover:bg-white/5"
            }`}
          >
            Verification Queue ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setView("attendees")}
            className={`px-5 py-2 font-body text-[0.75rem] uppercase tracking-wider transition-colors rounded-sm ${
              view === "attendees" ? "bg-gold/10 text-gold font-bold" : "text-text-muted hover:text-text-primary hover:bg-white/5"
            }`}
          >
            All Attendees
          </button>
          <button
            type="button"
            onClick={() => setView("scanner")}
            className={`px-5 py-2 font-body text-[0.75rem] uppercase tracking-wider transition-colors rounded-sm ${
              view === "scanner" ? "bg-gold/10 text-gold font-bold" : "text-text-muted hover:text-text-primary hover:bg-white/5"
            }`}
          >
            📷 Scanner
          </button>
        </div>
      </div>

      {view === "scanner" ? (
        <TicketScanner />
      ) : view === "attendees" ? (
        <div className="p-6 md:p-10 max-w-[1200px] mx-auto w-full">
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4 border-b border-gold/10 pb-6">
            <div>
              <h2 className="font-display text-[1.5rem] text-gold mb-1">Approved Attendees</h2>
              <p className="font-body text-[0.8rem] text-text-muted max-w-[600px]">
                These are the guests whose tickets have been successfully paid and verified. Download the CSV to see the full list with contact details and ticket IDs.
              </p>
            </div>
            <Button variant="gold" onClick={handleExport} className="whitespace-nowrap">
              Download CSV
            </Button>
          </div>
          <div className="mt-8 border border-gold/20 bg-[#0b0b0d] p-10 text-center shadow-[0_0_20px_rgba(212,175,55,0.05)]">
            <p className="font-display text-[3.5rem] text-gold mb-2 font-bold">{stats?.approved ?? "—"}</p>
            <p className="font-body text-[0.85rem] uppercase tracking-[0.2em] text-gold-muted mb-4">Total Confirmed Tickets</p>
            <p className="font-body text-[0.8rem] text-text-dim max-w-[400px] mx-auto">Click "Download CSV" to export the full verified guest list for the entry desk or marketing.</p>
          </div>
        </div>
      ) : (
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-140px)]">
        <aside className="lg:w-[400px] border-r border-gold/10 p-6 overflow-y-auto bg-[#0b0b0d]/50">
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`flex-1 py-3 font-body text-[0.75rem] uppercase tracking-wider transition-colors rounded-sm ${
                filter === "all"
                  ? "bg-gold text-black font-bold"
                  : "bg-[#151316] border border-gold/20 text-text-muted hover:border-gold/50 hover:text-gold-muted"
              }`}
            >
              All ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("mine")}
              className={`flex-1 py-3 font-body text-[0.75rem] uppercase tracking-wider transition-colors rounded-sm ${
                filter === "mine"
                  ? "bg-gold text-black font-bold"
                  : "bg-[#151316] border border-gold/20 text-text-muted hover:border-gold/50 hover:text-gold-muted"
              }`}
            >
              Mine
            </button>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 opacity-50">
              <p className="font-body text-[0.8rem] text-gold uppercase tracking-[0.15em]">
                Queue Empty
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <button
                  key={order.orderId}
                  type="button"
                  onClick={() => openOrder(order)}
                  className={`w-full text-left p-5 border transition-all duration-300 rounded-sm relative overflow-hidden group ${
                    selectedOrder?.orderId === order.orderId
                      ? "border-gold bg-[#151316] shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                      : "border-gold/10 bg-[#0b0b0d] hover:border-gold/40 hover:bg-[#151316]"
                  }`}
                >
                  {selectedOrder?.orderId === order.orderId && <div className="absolute top-0 left-0 w-1 h-full bg-gold" />}
                  <div className="flex justify-between items-start">
                    <p className="font-display text-[1.4rem] font-bold text-gold tabular-nums">
                      {formatPayableAmount(order.payableAmount)}
                    </p>
                    {order.claimedByName &&
                      order.claimedBy !== session.id && (
                        <span className="font-body text-[0.65rem] uppercase tracking-wider px-2 py-1 bg-bronze/10 text-bronze rounded-sm">
                          Claimed: {order.claimedByName}
                        </span>
                      )}
                  </div>
                  <p className="font-body text-[0.95rem] text-text-primary mt-2 font-semibold">
                    {order.attendeeName}
                  </p>
                  <p className="font-body text-[0.75rem] text-text-muted mt-1 tracking-wide">
                    {order.orderId} · {order.tierName} × {order.quantity}
                  </p>
                  {order.expiresAt && (
                    <p className="font-body text-[0.7rem] text-text-dim mt-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></span>
                      Expires in <OrderCountdown expiresAt={order.expiresAt} />
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </aside>

        <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-[#151316]">
          {!selectedOrder ? (
            <div className="flex items-center justify-center h-full opacity-50">
              <p className="font-body text-[0.85rem] uppercase tracking-[0.2em] text-gold">
                Select an order from the queue
              </p>
            </div>
          ) : (
            <div className="max-w-[700px] mx-auto">
              <div className="bg-[#0b0b0d] border border-gold/40 p-8 mb-8 text-center shadow-[0_0_20px_rgba(212,175,55,0.08)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gold/50"></div>
                <p className="font-body text-[0.7rem] uppercase tracking-[0.2em] text-gold-muted mb-2">
                  Match this exact amount in UPI history
                </p>
                <p className="font-display text-[4rem] font-bold text-gold tabular-nums">
                  {formatPayableAmount(selectedOrder.payableAmount)}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <InfoBlock label="Order ID" value={selectedOrder.orderId} />
                <InfoBlock label="Guest" value={selectedOrder.attendeeName} />
                <InfoBlock label="Phone" value={selectedOrder.phone} />
                <InfoBlock label="Email" value={selectedOrder.email} />
                <InfoBlock label="College" value={selectedOrder.college} />
                <InfoBlock label="Year" value={selectedOrder.year} />
                <InfoBlock
                  label="Tier"
                  value={`${selectedOrder.tierName} × ${selectedOrder.quantity}`}
                />
                <InfoBlock
                  label="UTR Number"
                  value={selectedOrder.utr ?? "Not submitted"}
                  highlight
                />
              </div>

              {selectedOrder.screenshotPath && (
                <div className="mb-8 p-6 bg-[#0b0b0d] border border-gold/20 rounded-sm">
                  <p className="font-body text-[0.7rem] uppercase tracking-[0.15em] text-gold-muted mb-4">
                    Payment Screenshot Evidence
                  </p>
                  <img
                    src={selectedOrder.screenshotPath}
                    alt="Payment screenshot"
                    className="max-w-full rounded-sm max-h-[500px] object-contain border border-white/5"
                  />
                </div>
              )}

              <div className="mb-8 p-6 bg-[#0b0b0d] border border-gold/20 rounded-sm">
                <p className="font-body text-[0.7rem] uppercase tracking-[0.15em] text-gold-muted mb-4">
                  Rejection Reason (If Applicable)
                </p>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-4 py-3 bg-[#151316] border border-gold/30 text-text-primary font-body text-[0.95rem] outline-none transition-all duration-300 rounded-sm mb-3 appearance-none"
                >
                  {REJECT_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                  <option value="Custom">Other (Custom reason)</option>
                </select>
                {rejectReason === "Custom" && (
                  <input
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter custom rejection reason"
                    className="w-full px-4 py-3 bg-[#151316] border border-gold/30 text-text-primary font-body text-[0.95rem] outline-none transition-all duration-300 rounded-sm"
                  />
                )}
              </div>

              {actionError && (
                <p className="font-body text-[0.8rem] text-[#e05c5c] mb-6 font-semibold tracking-wide">⚠ {actionError}</p>
              )}

              <div className="flex gap-4 mb-10">
                <Button
                  variant="gold"
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 py-4 text-[0.9rem]"
                >
                  {actionLoading ? "Processing..." : "Approve Order (A)"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex-1 py-4 text-[0.9rem] border-[#e05c5c] text-[#e05c5c] hover:bg-[#e05c5c] hover:text-black focus:ring-[#e05c5c]/30"
                >
                  {actionLoading ? "Processing..." : "Reject Order (R)"}
                </Button>
              </div>

              {auditLog.length > 0 && (
                <div className="mt-12 border-t border-gold/10 pt-8">
                  <p className="font-body text-[0.75rem] font-bold tracking-[0.15em] uppercase text-gold-muted mb-6">
                    Order Audit Log
                  </p>
                  <div className="space-y-4">
                    {auditLog.map((entry, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="w-2 h-2 rounded-full bg-gold/50 mt-1.5" />
                        <div>
                          <p className="font-body text-[0.85rem] text-text-primary">
                            <span className="font-bold text-gold">{entry.action.toUpperCase()}</span>
                            {entry.adminName && <span className="text-text-muted"> by {entry.adminName}</span>}
                          </p>
                          {entry.details && <p className="font-body text-[0.8rem] text-text-muted mt-0.5">{entry.details}</p>}
                          <p className="font-mono text-[0.65rem] text-text-dim mt-1">{new Date(entry.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      )}
    </div>
  );
}

function InfoBlock({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-[#151316] p-4 border border-gold/10 rounded-sm">
      <p className="font-body text-[0.65rem] uppercase tracking-[0.15em] text-gold-muted mb-1.5">
        {label}
      </p>
      <p
        className={`font-body ${highlight ? "text-gold font-mono text-[1.1rem] font-bold" : "text-text-primary text-[0.95rem]"}`}
      >
        {value}
      </p>
    </div>
  );
}
