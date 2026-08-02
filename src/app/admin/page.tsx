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
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-bg-secondary border border-gold/20 p-8"
        >
          <h1 className="font-display text-2xl text-gold mb-6 text-center">
            Admin Login
          </h1>
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">
                Team Member
              </label>
              <select
                value={loginForm.name}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, name: e.target.value })
                }
                required
              >
                <option value="">Select name</option>
                {ADMIN_TEAM.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">
                PIN
              </label>
              <input
                type="password"
                value={loginForm.pin}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, pin: e.target.value })
                }
                placeholder="Enter PIN"
                required
              />
            </div>
          </div>
          {loginError && (
            <p className="text-red-400 text-sm mt-4">{loginError}</p>
          )}
          <Button type="submit" className="w-full mt-6">
            Login
          </Button>
          <Link
            href="/"
            className="block text-center text-text-muted text-xs mt-4 hover:text-gold"
          >
            ← Back to site
          </Link>
        </form>
      </div>
    );
  }

  const filteredOrders =
    filter === "mine"
      ? orders.filter((o) => o.claimedBy === session.id)
      : orders;

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="border-b border-gold/10 bg-bg-secondary px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl text-gold">Admin Panel</h1>
            <p className="text-text-muted text-xs">
              {session.name} · {orders.length} pending · auto-refresh 5s
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Export */}
            <div className="flex items-center gap-2">
              <select
                value={exportStatus}
                onChange={(e) => setExportStatus(e.target.value as "approved" | "all")}
                className="text-xs py-1 px-2 border border-gold/20 bg-bg-primary text-text-muted"
              >
                <option value="approved">Approved only</option>
                <option value="all">All statuses</option>
              </select>
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="text-xs py-1 px-3 border border-gold/40 text-gold hover:bg-gold/10 transition-colors disabled:opacity-50"
              >
                {exporting ? "Downloading..." : "Export CSV"}
              </button>
            </div>
            <Link href="/" className="text-text-muted text-sm hover:text-gold">
              Site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-text-muted text-sm hover:text-gold"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Live stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-3 mt-4">
            {[
              { label: "Total Orders", value: stats.total },
              { label: "✓ Approved", value: stats.approved },
              { label: "⏳ Pending", value: stats.pending },
              { label: "Revenue", value: `₹${Number(stats.totalRevenue ?? 0).toLocaleString("en-IN")}` },
            ].map((s) => (
              <div key={s.label} className="bg-bg-primary border border-gold/10 px-3 py-2">
                <p className="text-text-muted text-xs">{s.label}</p>
                <p className="font-display text-lg text-gold">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* View toggle */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <button
            type="button"
            onClick={() => setView("queue")}
            className={`px-4 py-1 text-xs uppercase tracking-widest border ${
              view === "queue" ? "border-gold text-gold" : "border-gold/20 text-text-muted"
            }`}
          >
            Verification Queue ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setView("attendees")}
            className={`px-4 py-1 text-xs uppercase tracking-widest border ${
              view === "attendees" ? "border-gold text-gold" : "border-gold/20 text-text-muted"
            }`}
          >
            All Attendees {stats ? `(${stats.approved} approved)` : ""}
          </button>
          <button
            type="button"
            onClick={() => setView("scanner")}
            className={`px-4 py-1 text-xs uppercase tracking-widest border ${
              view === "scanner" ? "border-gold text-gold" : "border-gold/20 text-text-muted"
            }`}
          >
            📷 Entry Scanner
          </button>
        </div>
      </header>

      {view === "scanner" ? (
        <TicketScanner />
      ) : view === "attendees" ? (
        <div className="p-4 md:p-8">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-text-muted text-sm">
              Showing approved attendees. Use Export CSV above for full data.
            </p>
            <button
              type="button"
              onClick={handleExport}
              className="text-xs py-1 px-3 border border-gold/40 text-gold hover:bg-gold/10 transition-colors"
            >
              Download CSV
            </button>
          </div>
          <p className="text-text-muted text-sm">
            Download the CSV to see the full attendee list with name, phone, email, college, ticket ID and payment details.
          </p>
          <div className="mt-4 border border-gold/10 p-6 text-center">
            <p className="font-display text-4xl text-gold mb-2">{stats?.approved ?? "—"}</p>
            <p className="text-text-muted text-sm">Approved tickets</p>
            <p className="text-text-muted text-xs mt-1">Click &quot;Export CSV&quot; in the header to download the full list</p>
          </div>
        </div>
      ) : (
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-65px)]">
        <aside className="lg:w-96 border-r border-gold/10 p-4 overflow-y-auto">
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`flex-1 py-2 text-xs uppercase tracking-widest border ${
                filter === "all"
                  ? "border-gold text-gold"
                  : "border-gold/20 text-text-muted"
              }`}
            >
              All ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("mine")}
              className={`flex-1 py-2 text-xs uppercase tracking-widest border ${
                filter === "mine"
                  ? "border-gold text-gold"
                  : "border-gold/20 text-text-muted"
              }`}
            >
              Mine
            </button>
          </div>

          {filteredOrders.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-8">
              No pending orders
            </p>
          ) : (
            <div className="space-y-2">
              {filteredOrders.map((order) => (
                <button
                  key={order.orderId}
                  type="button"
                  onClick={() => openOrder(order)}
                  className={`w-full text-left p-4 border transition-colors ${
                    selectedOrder?.orderId === order.orderId
                      ? "border-gold bg-gold/5"
                      : "border-gold/10 hover:border-gold/30"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <p className="font-display text-lg text-gold tabular-nums">
                      {formatPayableAmount(order.payableAmount)}
                    </p>
                    {order.claimedByName &&
                      order.claimedBy !== session.id && (
                        <span className="text-xs text-bronze">
                          {order.claimedByName}
                        </span>
                      )}
                  </div>
                  <p className="text-text-primary text-sm mt-1">
                    {order.attendeeName}
                  </p>
                  <p className="text-text-muted text-xs mt-1">
                    {order.orderId} · {order.tierName} × {order.quantity}
                  </p>
                  {order.expiresAt && (
                    <p className="text-text-muted text-xs mt-1">
                      Expires{" "}
                      <OrderCountdown expiresAt={order.expiresAt} />
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </aside>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {!selectedOrder ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-text-muted">
                Select an order to verify · Sorted by amount
              </p>
            </div>
          ) : (
            <div className="max-w-2xl">
              <div className="bg-gold/10 border-2 border-gold p-6 mb-6 text-center">
                <p className="text-xs uppercase tracking-widest text-gold mb-1">
                  Match this amount in UPI
                </p>
                <p className="font-display text-5xl text-gold tabular-nums">
                  {formatPayableAmount(selectedOrder.payableAmount)}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
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
                  label="UTR"
                  value={selectedOrder.utr ?? "Not submitted"}
                  highlight
                />
              </div>

              {selectedOrder.screenshotPath && (
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-widest text-text-muted mb-2">
                    Payment Screenshot (supporting evidence)
                  </p>
                  <img
                    src={selectedOrder.screenshotPath}
                    alt="Payment screenshot"
                    className="max-w-full border border-gold/20 max-h-96 object-contain"
                  />
                </div>
              )}

              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-text-muted mb-2">
                  Rejection Reason
                </p>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="mb-2"
                >
                  {REJECT_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                  <option value="Custom">Custom reason</option>
                </select>
                {rejectReason === "Custom" && (
                  <input
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter reason"
                  />
                )}
              </div>

              {actionError && (
                <p className="text-red-400 text-sm mb-4">{actionError}</p>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1"
                >
                  {actionLoading ? "..." : "Approve (A)"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex-1"
                >
                  {actionLoading ? "..." : "Reject (R)"}
                </Button>
              </div>

              {auditLog.length > 0 && (
                <div className="mt-8 border-t border-gold/10 pt-6">
                  <p className="text-xs uppercase tracking-widest text-text-muted mb-4">
                    Audit Log
                  </p>
                  <div className="space-y-2">
                    {auditLog.map((entry, i) => (
                      <p key={i} className="text-text-muted text-xs">
                        {new Date(entry.createdAt).toLocaleString()} —{" "}
                        {entry.action}
                        {entry.adminName && ` by ${entry.adminName}`}
                        {entry.details && `: ${entry.details}`}
                      </p>
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
    <div>
      <p className="text-xs uppercase tracking-widest text-text-muted mb-1">
        {label}
      </p>
      <p
        className={`text-sm ${highlight ? "text-gold font-display text-lg" : "text-text-primary"}`}
      >
        {value}
      </p>
    </div>
  );
}
