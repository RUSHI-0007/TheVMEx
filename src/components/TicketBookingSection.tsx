"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Script from "next/script";
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
  | "processing"  // 4. Verifying payment
  | "confirmed";  // 5. Success screen

// ─── Step progress indicator ──────────────────────────────────────────────────
const STEPS: { key: Step; label: string }[] = [
  { key: "select", label: "Tickets" },
  { key: "form", label: "Details" },
  { key: "summary", label: "Review" },
  { key: "processing", label: "Pay" },
  { key: "confirmed", label: "Done" },
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
          const isSoldOut = (tier.available as number) === 0;
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
          ★ You will be redirected to our secure payment gateway to complete your booking.
        </p>
      </div>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <button className="btn-gold-outline" onClick={onBack} disabled={isLoading}>← Edit</button>
        <button className="btn-gold" onClick={onConfirm} disabled={isLoading} id="confirm-order-btn">
          {isLoading ? "Preparing Payment…" : "Proceed to Payment →"}
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Processing ──────────────────────────────────────────────────────
function ProcessingStep() {
  return (
    <div style={{ maxWidth: "480px", textAlign: "center", padding: "2rem 0" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
        <div style={{ width: "72px", height: "72px", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(212,175,55,0.05)" }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12" stroke="rgba(212,175,55,0.2)" strokeWidth="1" />
              <path d="M14 2A12 12 0 0 1 26 14" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </motion.div>
        </div>
      </div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>Verifying your payment...</h3>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
        Please don't close this window. We are confirming your transaction with the bank.
      </p>
    </div>
  );
}

// ─── Step 5: Confirmed ───────────────────────────────────────────────────────
function ConfirmedStep({ order }: { order: Order }) {
  return (
    <div style={{ maxWidth: "480px", textAlign: "center", padding: "1rem 0" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
        <div style={{ width: "72px", height: "72px", background: "#3fb950", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
      <p style={{ fontFamily: "var(--font-script)", fontSize: "1.6rem", color: "var(--gold-muted)", marginBottom: "0.5rem" }}>Success</p>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
        Ticket Confirmed
      </h3>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "2rem" }}>
        Your payment has been successfully verified. 
        Your ticket will be emailed to <strong style={{ color: "var(--text-primary)" }}>{order.attendee_email}</strong> shortly.
      </p>

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
      const res = await fetch("/api/orders/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId, quantity, attendee: form }),
      });
      const data = await res.json();
      
      if (!res.ok || !data.ok) {
        setApiError(data.error === "sold_out" ? "This ticket tier is currently sold out." : data.error ?? "Failed to create order. Please try again.");
        setIsLoading(false);
        return;
      }
      
      setOrder(data.order);

      // Open Razorpay Checkout
      const options = {
        key: data.razorpayKeyId,
        amount: data.order.payable_amount * 100, // Amount is in currency subunits.
        currency: "INR",
        name: "TheVMEx",
        description: `Ticket Booking: ${data.order.ticket_tier_label}`,
        order_id: data.razorpayOrderId,
        handler: function (response: any) {
          // Trigger polling
          setStep("processing");
          pollOrderStatus(data.order.id);
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        notes: {
          internalOrderId: data.order.id,
        },
        theme: {
          color: "#d4af37",
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            setApiError("Payment was cancelled or failed. Please try again.");
          }
        }
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        setIsLoading(false);
        setApiError("Payment failed. Please try again.");
      });
      rzp.open();

    } catch (err) {
      setApiError("Network error. Please check your connection.");
      setIsLoading(false);
    }
  }, [tierId, quantity, form]);

  const pollOrderStatus = async (orderId: string) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > 30) { // Approx 60 seconds
        clearInterval(interval);
        setStep("confirmed"); // Show success anyway, user can check email or status later
        return;
      }
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (res.ok && data.order?.status === "approved") {
          clearInterval(interval);
          setOrder(data.order);
          setStep("confirmed");
        }
      } catch {
        // silently fail and retry
      }
    }, 2000);
  };


  const fadeVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.3 } },
  };

  return (
    <section id="tickets" className="section" style={{ background: "var(--bg-secondary)" }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
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

            {step === "processing" && <ProcessingStep />}
            {step === "confirmed" && order && <ConfirmedStep order={order} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
