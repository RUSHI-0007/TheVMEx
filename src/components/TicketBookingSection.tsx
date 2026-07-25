"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import GoldDivider from "@/components/GoldDivider";
import { TICKET_TIERS, EVENT } from "@/lib/config";
import type { TicketTierId } from "@/lib/config";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AttendeeForm {
  name: string;
  phone: string;
  email: string;
  college: string;
  year: string;
}

interface Order {
  id: string;
  ticket_tier_id: string;
  ticket_tier_label: string;
  quantity: number;
  base_amount: number;
  payable_amount: string;
  attendee_name: string;
  attendee_phone: string;
  attendee_email: string;
  attendee_college: string;
  attendee_year: string;
  status: string;
  created_at: number;
  expires_at: number;
  utr: string | null;
  screenshot_path: string | null;
}

type Step =
  | "select"      // 1. Tier + qty selection
  | "form"        // 2. Attendee details
  | "summary"     // 3. Order summary confirmation
  | "payment"     // 4. UPI QR + payable amount
  | "upload"      // 5. Screenshot + UTR upload
  | "pending";    // 6. Pending verification screen

// ─── Step progress indicator ──────────────────────────────────────────────────
const STEPS: { key: Step; label: string }[] = [
  { key: "select", label: "Tickets" },
  { key: "form", label: "Details" },
  { key: "summary", label: "Review" },
  { key: "payment", label: "Pay" },
  { key: "upload", label: "Confirm" },
  { key: "pending", label: "Status" },
];

function StepIndicator({ current }: { current: Step }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        marginBottom: "3rem",
        overflowX: "auto",
        paddingBottom: "0.5rem",
      }}
    >
      {STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step.key} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  border: `1px solid ${done || active ? "var(--gold)" : "rgba(212,175,55,0.2)"}`,
                  background: done ? "var(--gold)" : active ? "rgba(212,175,55,0.1)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                  flexShrink: 0,
                }}
              >
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="var(--bg-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", fontWeight: 600, color: active ? "var(--gold)" : "var(--text-dim)" }}>
                    {i + 1}
                  </span>
                )}
              </div>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: active ? "var(--gold)" : done ? "var(--gold-dim)" : "var(--text-dim)", whiteSpace: "nowrap" }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: "clamp(1rem, 4vw, 3rem)", height: "1px", background: i < currentIdx ? "var(--gold-dim)" : "rgba(212,175,55,0.12)", margin: "0 0.25rem", marginTop: "-1rem", transition: "background 0.3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Countdown to expiry ──────────────────────────────────────────────────────
function ExpiryCountdown({ expiresAt }: { expiresAt: number }) {
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

  return (
    <span style={{ color: urgent ? "#e05c5c" : "var(--gold)", fontWeight: 600, fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </span>
  );
}

// ─── Step 1: Tier + quantity selection ───────────────────────────────────────
function TierSelectionStep({
  selected,
  quantity,
  onSelect,
  onQty,
  onNext,
}: {
  selected: TicketTierId | null;
  quantity: number;
  onSelect: (id: TicketTierId) => void;
  onQty: (n: number) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2.5rem",
        }}
      >
        {TICKET_TIERS.map((tier) => {
          const isSoldOut = tier.available === 0;
          const isSelected = selected === tier.id;
          return (
            <motion.div
              key={tier.id}
              whileHover={isSoldOut ? {} : { scale: 1.01 }}
              transition={{ duration: 0.2 }}
              onClick={() => !isSoldOut && onSelect(tier.id as TicketTierId)}
              style={{
                position: "relative",
                border: `1px solid ${isSelected ? "var(--gold)" : "rgba(212,175,55,0.15)"}`,
                background: isSelected ? "rgba(212,175,55,0.06)" : "var(--bg-card)",
                padding: "1.75rem",
                cursor: isSoldOut ? "not-allowed" : "pointer",
                opacity: isSoldOut ? 0.5 : 1,
                transition: "border-color 0.25s, background 0.25s",
              }}
            >
              {tier.highlighted && !isSoldOut && (
                <span className="badge-gold" style={{ position: "absolute", top: -1, left: "1.25rem", transform: "translateY(-50%)" }}>
                  {tier.badge}
                </span>
              )}
              {isSoldOut && (
                <span style={{ position: "absolute", top: 12, right: 12, fontFamily: "var(--font-body)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#e05c5c", border: "1px solid rgba(224,92,92,0.3)", padding: "0.2rem 0.5rem" }}>
                  Sold Out
                </span>
              )}
              {isSelected && (
                <div style={{ position: "absolute", top: 12, right: 12, width: 20, height: 20, background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M1.5 5.5l3 3 5-5" stroke="var(--bg-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              <p style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.3rem" }}>{tier.label}</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem", lineHeight: 1.5 }}>{tier.description}</p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700, color: "var(--gold)", marginBottom: "1rem" }}>
                ₹{tier.price.toLocaleString("en-IN")}
              </p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1rem" }}>
                {tier.inclusions.map((inc) => (
                  <li key={inc} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    <span style={{ color: "var(--gold)", marginTop: "1px" }}>✦</span> {inc}
                  </li>
                ))}
              </ul>
              {tier.available <= 40 && tier.available > 0 && (
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "#c9813a", letterSpacing: "0.05em" }}>
                  Only {tier.available} left
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem", flexWrap: "wrap" }}
        >
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)" }}>
            Quantity
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={() => onQty(Math.max(1, quantity - 1))}
              style={{ width: 36, height: 36, border: "1px solid rgba(212,175,55,0.25)", background: "none", color: "var(--gold)", fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >−</button>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", minWidth: "2rem", textAlign: "center" }}>{quantity}</span>
            <button
              onClick={() => onQty(Math.min(10, quantity + 1))}
              style={{ width: 36, height: 36, border: "1px solid rgba(212,175,55,0.25)", background: "none", color: "var(--gold)", fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >+</button>
          </div>
          {selected && (() => {
            const tier = TICKET_TIERS.find(t => t.id === selected)!;
            return (
              <p style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 600, color: "var(--gold)" }}>
                Total: ₹{(tier.price * quantity).toLocaleString("en-IN")}
              </p>
            );
          })()}
        </motion.div>
      )}

      <button
        className="btn-gold"
        onClick={onNext}
        disabled={!selected}
        style={{ opacity: selected ? 1 : 0.4, cursor: selected ? "pointer" : "not-allowed" }}
        id="ticket-next-btn"
      >
        Continue to Details →
      </button>
    </div>
  );
}

// ─── Step 2: Attendee details form ────────────────────────────────────────────
const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Alumni", "Other"];

function AttendeeFormStep({
  form,
  errors,
  onChange,
  onNext,
  onBack,
}: {
  form: AttendeeForm;
  errors: Partial<AttendeeForm>;
  onChange: (f: Partial<AttendeeForm>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const field = (key: keyof AttendeeForm, label: string, type = "text", placeholder = "") => (
    <div>
      <label className="input-label" htmlFor={`attendee-${key}`}>{label}</label>
      <input
        id={`attendee-${key}`}
        className={`input-field ${errors[key] ? "input-error" : ""}`}
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => onChange({ [key]: e.target.value })}
      />
      {errors[key] && <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "#e05c5c", marginTop: "0.3rem" }}>{errors[key]}</p>}
    </div>
  );

  return (
    <div style={{ maxWidth: "520px" }}>
      <div style={{ display: "grid", gap: "1.25rem", marginBottom: "2rem" }}>
        {field("name", "Full Name *", "text", "As it will appear on your ticket")}
        {field("phone", "Phone Number *", "tel", "+91 XXXXX XXXXX")}
        {field("email", "Email Address *", "email", "For ticket confirmation")}
        {field("college", "College / Institution *", "text", "e.g. VJTI Mumbai")}
        <div>
          <label className="input-label" htmlFor="attendee-year">Year / Category *</label>
          <select
            id="attendee-year"
            className={`input-field ${errors.year ? "input-error" : ""}`}
            value={form.year}
            onChange={(e) => onChange({ year: e.target.value })}
          >
            <option value="">Select year</option>
            {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          {errors.year && <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "#e05c5c", marginTop: "0.3rem" }}>{errors.year}</p>}
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <button className="btn-gold-outline" onClick={onBack}>← Back</button>
        <button className="btn-gold" onClick={onNext} id="form-next-btn">Review Order →</button>
      </div>
    </div>
  );
}

// ─── Step 3: Order summary ────────────────────────────────────────────────────
function OrderSummaryStep({
  tierId,
  quantity,
  form,
  onConfirm,
  onBack,
  isLoading,
}: {
  tierId: TicketTierId;
  quantity: number;
  form: AttendeeForm;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const tier = TICKET_TIERS.find((t) => t.id === tierId)!;
  const total = tier.price * quantity;
  return (
    <div style={{ maxWidth: "520px" }}>
      <div style={{ border: "1px solid rgba(212,175,55,0.2)", padding: "2rem", background: "var(--bg-card)", marginBottom: "2rem" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "1.5rem" }}>Order Summary</p>
        {[
          ["Ticket", `${tier.label} × ${quantity}`],
          ["Price per ticket", `₹${tier.price.toLocaleString("en-IN")}`],
          ["Attendee", form.name],
          ["Phone", form.phone],
          ["Email", form.email],
          ["College", form.college],
          ["Year", form.year],
          ["Event", `${EVENT.name} · ${EVENT.date}`],
        ].map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(212,175,55,0.07)", marginBottom: "0.75rem" }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--text-dim)" }}>{label}</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--text-muted)", textAlign: "right" }}>{value}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Base Total</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "var(--gold)" }}>₹{total.toLocaleString("en-IN")}</span>
        </div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--text-dim)", marginTop: "0.5rem" }}>
          ★ Your actual payable amount will have a unique paise value added (e.g. ₹{total}.37) — this is shown on the next screen.
        </p>
      </div>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <button className="btn-gold-outline" onClick={onBack} disabled={isLoading}>← Edit</button>
        <button className="btn-gold" onClick={onConfirm} disabled={isLoading} id="confirm-order-btn">
          {isLoading ? "Creating order…" : "Proceed to Payment →"}
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: UPI QR payment screen ───────────────────────────────────────────
function PaymentStep({
  order,
  onPaid,
}: {
  order: Order;
  onPaid: () => void;
}) {
  const upiUrl = `upi://pay?pa=${encodeURIComponent(EVENT.upiId)}&pn=${encodeURIComponent(EVENT.upiName)}&am=${encodeURIComponent(order.payable_amount)}&cu=INR&tn=${encodeURIComponent(order.id)}`;
  const rupees = order.payable_amount.split(".")[0];
  const paise = order.payable_amount.split(".")[1];

  return (
    <div style={{ maxWidth: "480px" }}>
      {/* Warning banner */}
      <div style={{ border: "1px solid rgba(212,175,55,0.3)", background: "rgba(212,175,55,0.05)", padding: "1rem 1.25rem", marginBottom: "2rem", display: "flex", gap: "0.75rem" }}>
        <span style={{ fontSize: "1rem", flexShrink: 0 }}>⚠️</span>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--text-primary)", lineHeight: 1.6 }}>
          You <strong>MUST</strong> pay the exact amount shown below including the paise. This unique amount is used to match your payment — do not round it or pay a different amount.
        </p>
      </div>

      {/* Amount display */}
      <div style={{ textAlign: "center", marginBottom: "2rem", padding: "1.75rem", border: "1px solid rgba(212,175,55,0.25)", background: "var(--bg-card)" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.5rem" }}>Pay Exactly</p>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 8vw, 3rem)", fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>
          ₹{rupees}
          <span style={{ fontSize: "0.55em", color: "var(--gold-muted)" }}>.{paise}</span>
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--text-dim)", marginTop: "0.4rem" }}>Order ID: {order.id}</p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--text-dim)" }}>UPI ID: {EVENT.upiId}</p>
      </div>

      {/* QR Code */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
        <div style={{ padding: "1.25rem", background: "#fff", display: "inline-flex" }}>
          <QRCode value={upiUrl} size={180} fgColor="#0B0B0D" />
        </div>
      </div>

      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", marginBottom: "0.5rem" }}>
        Scan with any UPI app (PhonePe, GPay, Paytm)
      </p>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--text-dim)", textAlign: "center", marginBottom: "2rem" }}>
        If QR scan fails, send manually to <strong style={{ color: "var(--gold-muted)" }}>{EVENT.upiId}</strong>
      </p>

      {/* Expiry */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "2rem", padding: "0.75rem", border: "1px solid rgba(212,175,55,0.1)" }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6.25" stroke="var(--text-dim)" strokeWidth="1" />
          <line x1="7" y1="3.5" x2="7" y2="7" stroke="var(--text-dim)" strokeWidth="1" strokeLinecap="round" />
          <line x1="7" y1="7" x2="10" y2="9" stroke="var(--text-dim)" strokeWidth="1" strokeLinecap="round" />
        </svg>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--text-dim)" }}>
          This order is held for <ExpiryCountdown expiresAt={order.expires_at} /> — pay before it expires
        </p>
      </div>

      <button className="btn-gold" onClick={onPaid} style={{ width: "100%" }} id="i-have-paid-btn">
        I&apos;ve Paid — Upload Proof →
      </button>
    </div>
  );
}

// ─── Step 5: Screenshot + UTR upload ─────────────────────────────────────────
function UploadStep({
  order,
  onSubmit,
  isLoading,
  uploadError,
}: {
  order: Order;
  onSubmit: (utr: string, file: File) => void;
  isLoading: boolean;
  uploadError: string | null;
}) {
  const [utr, setUtr] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"];

  const handleFile = (f: File) => {
    setFileError(null);
    if (!ALLOWED.includes(f.type)) {
      setFileError("Please upload a JPG, PNG, or WebP image only.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setFileError("File too large — maximum 5 MB.");
      return;
    }
    setFile(f);
  };

  const handleSubmit = () => {
    if (!utr.trim() || utr.trim().length < 6) return;
    if (!file) return;
    onSubmit(utr.trim(), file);
  };

  return (
    <div style={{ maxWidth: "520px" }}>
      <div style={{ border: "1px solid rgba(212,175,55,0.15)", background: "var(--bg-card)", padding: "1.5rem", marginBottom: "2rem" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.75rem" }}>Order</p>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--text-primary)" }}>{order.id} · ₹{order.payable_amount}</p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Held for: <ExpiryCountdown expiresAt={order.expires_at} /></p>
      </div>

      <div style={{ display: "grid", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* UTR */}
        <div>
          <label className="input-label" htmlFor="utr-input">UTR / Transaction Reference Number *</label>
          <input
            id="utr-input"
            className="input-field"
            placeholder="12-digit UTR from your UPI app"
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
          />
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "var(--text-dim)", marginTop: "0.3rem" }}>Find this in your UPI app under the transaction receipt.</p>
        </div>

        {/* Screenshot upload */}
        <div>
          <label className="input-label">Payment Screenshot *</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => document.getElementById("screenshot-input")?.click()}
            style={{
              border: `1px dashed ${dragOver ? "var(--gold)" : file ? "rgba(212,175,55,0.4)" : "rgba(212,175,55,0.2)"}`,
              background: dragOver ? "rgba(212,175,55,0.04)" : "rgba(255,255,255,0.01)",
              padding: "2rem",
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.25s",
            }}
          >
            <input
              id="screenshot-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {file ? (
              <div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--gold)", marginBottom: "0.25rem" }}>✓ {file.name}</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--text-dim)" }}>{(file.size / 1024).toFixed(0)} KB · Click to change</p>
              </div>
            ) : (
              <div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Drop screenshot here or click to upload</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--text-dim)" }}>JPG, PNG, WebP · Max 5 MB</p>
              </div>
            )}
          </div>
          {fileError && <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "#e05c5c", marginTop: "0.4rem" }}>{fileError}</p>}
        </div>
      </div>

      {uploadError && (
        <div style={{ border: "1px solid rgba(224,92,92,0.3)", background: "rgba(224,92,92,0.05)", padding: "1rem", marginBottom: "1.5rem" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "#e05c5c" }}>
            {uploadError === "duplicate_utr"
              ? "This UTR has already been used for another order. Please check your transaction details."
              : uploadError === "order_expired"
              ? "This order has expired. Please start a new booking."
              : "Something went wrong. Please try again."}
          </p>
        </div>
      )}

      <button
        className="btn-gold"
        onClick={handleSubmit}
        disabled={!utr.trim() || utr.trim().length < 6 || !file || isLoading}
        style={{ width: "100%", opacity: (!utr.trim() || !file || isLoading) ? 0.5 : 1, cursor: (!utr.trim() || !file || isLoading) ? "not-allowed" : "pointer" }}
        id="submit-proof-btn"
      >
        {isLoading ? "Submitting…" : "Submit Payment Proof →"}
      </button>
    </div>
  );
}

// ─── Step 6: Pending verification ─────────────────────────────────────────────
function PendingStep({ order }: { order: Order }) {
  return (
    <div style={{ maxWidth: "520px", textAlign: "center" }}>
      {/* Calm status icon */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
        <div style={{ width: "72px", height: "72px", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(212,175,55,0.05)" }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12" stroke="rgba(212,175,55,0.2)" strokeWidth="1" />
              <path d="M14 2A12 12 0 0 1 26 14" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </motion.div>
        </div>
      </div>

      <p style={{ fontFamily: "var(--font-script)", fontSize: "1.6rem", color: "var(--gold-muted)", marginBottom: "0.5rem" }}>Payment received</p>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem, 4vw, 1.8rem)", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
        Verification in Progress
      </h3>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "2rem" }}>
        Our team is matching your payment against the UPI transaction history. Most verifications complete within <strong style={{ color: "var(--text-primary)" }}>1–2 hours</strong>. You&apos;ll receive a confirmation once approved.
      </p>

      {/* Order details box */}
      <div style={{ border: "1px solid rgba(212,175,55,0.15)", background: "var(--bg-card)", padding: "1.5rem", marginBottom: "2rem", textAlign: "left" }}>
        {[
          ["Order ID", order.id],
          ["Ticket", `${order.ticket_tier_label} × ${order.quantity}`],
          ["Amount Paid", `₹${order.payable_amount}`],
          ["Attendee", order.attendee_name],
        ].map(([l, v]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", paddingBottom: "0.65rem", borderBottom: "1px solid rgba(212,175,55,0.07)", marginBottom: "0.65rem" }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--text-dim)", letterSpacing: "0.05em" }}>{l}</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--text-muted)", textAlign: "right" }}>{v}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--text-dim)" }}>Order expires in</span>
          <ExpiryCountdown expiresAt={order.expires_at} />
        </div>
      </div>

      <a
        href={`/ticket?orderId=${order.id}`}
        className="btn-gold-outline"
        style={{ display: "block", textAlign: "center", marginBottom: "1rem" }}
        id="check-ticket-btn"
      >
        Check Ticket Status
      </a>

      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--text-dim)", lineHeight: 1.6 }}>
        Save your Order ID: <strong style={{ color: "var(--gold-muted)", fontFamily: "monospace" }}>{order.id}</strong>
        <br />
        Questions? Reach us on{" "}
        <a href={EVENT.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-muted)", textDecoration: "underline" }}>
          WhatsApp
        </a>
      </p>
    </div>
  );
}

// ─── Main TicketBookingSection ────────────────────────────────────────────────
export default function TicketBookingSection() {
  const [step, setStep] = useState<Step>("select");
  const [tierId, setTierId] = useState<TicketTierId | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState<AttendeeForm>({ name: "", phone: "", email: "", college: "", year: "" });
  const [formErrors, setFormErrors] = useState<Partial<AttendeeForm>>({});
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const errors: Partial<AttendeeForm> = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.phone.trim()) errors.phone = "Phone is required";
    else if (!/^\+?[0-9\s]{10,13}$/.test(form.phone.replace(/\s/g, ""))) errors.phone = "Enter a valid 10-digit number";
    if (!form.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Enter a valid email address";
    if (!form.college.trim()) errors.college = "College name is required";
    if (!form.year) errors.year = "Please select your year";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateOrder = useCallback(async () => {
    if (!tierId) return;
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId, quantity, attendee: form }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setApiError(data.error ?? "Failed to create order. Please try again.");
        setIsLoading(false);
        return;
      }
      setOrder(data.order);
      setStep("payment");
    } catch {
      setApiError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, [tierId, quantity, form]);

  const handleUploadProof = useCallback(async (utr: string, file: File) => {
    if (!order) return;
    setIsLoading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("utr", utr);
      fd.append("screenshot", file);
      const res = await fetch(`/api/orders/${order.id}/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setUploadError(data.error ?? "upload_failed");
        setIsLoading(false);
        return;
      }
      setStep("pending");
    } catch {
      setUploadError("network_error");
    } finally {
      setIsLoading(false);
    }
  }, [order]);

  const fadeVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.3 } },
  };

  return (
    <section id="tickets" className="section" style={{ background: "var(--bg-secondary)" }}>
      <div className="container-site">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: "3rem" }}
        >
          <p className="section-eyebrow">Tickets</p>
          <h2 className="section-heading">
            Book Your{" "}
            <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Spot</span>
          </h2>
          <p className="section-subheading">
            Seats are limited. Secure yours before they&apos;re gone.
          </p>
        </motion.div>

        <StepIndicator current={step} />

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={fadeVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            {step === "select" && (
              <TierSelectionStep
                selected={tierId}
                quantity={quantity}
                onSelect={setTierId}
                onQty={setQuantity}
                onNext={() => tierId && setStep("form")}
              />
            )}

            {step === "form" && (
              <AttendeeFormStep
                form={form}
                errors={formErrors}
                onChange={(f) => setForm((prev) => ({ ...prev, ...f }))}
                onNext={() => { if (validateForm()) setStep("summary"); }}
                onBack={() => setStep("select")}
              />
            )}

            {step === "summary" && tierId && (
              <div>
                <OrderSummaryStep
                  tierId={tierId}
                  quantity={quantity}
                  form={form}
                  onConfirm={handleCreateOrder}
                  onBack={() => setStep("form")}
                  isLoading={isLoading}
                />
                {apiError && (
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "#e05c5c", marginTop: "1rem" }}>
                    ⚠ {apiError}
                  </p>
                )}
              </div>
            )}

            {step === "payment" && order && (
              <PaymentStep order={order} onPaid={() => setStep("upload")} />
            )}

            {step === "upload" && order && (
              <UploadStep
                order={order}
                onSubmit={handleUploadProof}
                isLoading={isLoading}
                uploadError={uploadError}
              />
            )}

            {step === "pending" && order && <PendingStep order={order} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
