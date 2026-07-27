"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Script from "next/script";
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
    <div className="flex items-center justify-center gap-0 mb-12 overflow-x-auto pb-2">
      {STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-7 h-7 border flex items-center justify-center transition-all duration-300 shrink-0 ${done || active ? "border-gold" : "border-gold/20"} ${done ? "bg-gold" : active ? "bg-gold/10" : "bg-transparent"}`}
              >
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#0b0b0d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span className={`font-body text-[0.65rem] font-semibold ${active ? "text-gold" : "text-text-dim"}`}>
                    {i + 1}
                  </span>
                )}
              </div>
              <span className={`font-body text-[0.55rem] tracking-[0.12em] uppercase whitespace-nowrap ${active ? "text-gold" : done ? "text-gold-dim" : "text-text-dim"}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-[clamp(1rem,4vw,3rem)] h-px mx-1 -mt-4 transition-colors duration-300 ${i < currentIdx ? "bg-gold-dim" : "bg-gold/[0.12]"}`} />
            )}
          </div>
        );
      })}
    </div>
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
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5 mb-10">
        {TICKET_TIERS.map((tier) => {
          const isSoldOut = (tier.available as number) === 0;
          const isSelected = selected === tier.id;
          return (
            <motion.div
              key={tier.id}
              whileHover={isSoldOut ? {} : { scale: 1.01 }}
              transition={{ duration: 0.2 }}
              onClick={() => !isSoldOut && onSelect(tier.id as TicketTierId)}
              className={`relative border p-7 transition-all duration-250 ${isSelected ? "border-gold bg-gold/[0.06]" : "border-gold/15 bg-[#18151a]"} ${isSoldOut ? "cursor-not-allowed opacity-50" : "cursor-pointer opacity-100"}`}
            >
              {tier.highlighted && !isSoldOut && (
                <span className="inline-block px-3 py-1 font-body text-[0.625rem] font-bold tracking-[0.15em] uppercase text-[#0b0b0d] bg-gold absolute top-[-1px] left-5 -translate-y-1/2">
                  {tier.badge}
                </span>
              )}
              {isSoldOut && (
                <span className="absolute top-3 right-3 font-body text-[0.6rem] tracking-[0.15em] uppercase text-[#e05c5c] border border-[#e05c5c]/30 px-2 py-[0.2rem]">
                  Sold Out
                </span>
              )}
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-gold flex items-center justify-center">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M1.5 5.5l3 3 5-5" stroke="#0b0b0d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              <p className="font-display text-[1.3rem] font-bold text-text-primary mb-1">{tier.label}</p>
              <p className="font-body text-[0.8rem] text-text-muted mb-4 leading-relaxed">{tier.description}</p>
              <p className="font-display text-[1.6rem] font-bold text-gold mb-4">
                ₹{tier.price.toLocaleString("en-IN")}
              </p>
              <ul className="list-none flex flex-col gap-1.5 mb-4">
                {tier.inclusions.map((inc) => (
                  <li key={inc} className="flex items-start gap-2 font-body text-[0.78rem] text-text-muted">
                    <span className="text-gold mt-px">✦</span> {inc}
                  </li>
                ))}
              </ul>
              {tier.available <= 40 && tier.available > 0 && (
                <p className="font-body text-[0.68rem] text-[#c9813a] tracking-[0.05em]">
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
          className="flex items-center gap-6 mb-8 flex-wrap"
        >
          <p className="font-body text-[0.75rem] tracking-[0.12em] uppercase text-text-muted">
            Quantity
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onQty(Math.max(1, quantity - 1))}
              className="w-9 h-9 border border-gold/25 bg-transparent text-gold text-lg cursor-pointer flex items-center justify-center"
            >−</button>
            <span className="font-display text-[1.25rem] font-bold text-text-primary min-w-[2rem] text-center">{quantity}</span>
            <button
              onClick={() => onQty(Math.min(10, quantity + 1))}
              className="w-9 h-9 border border-gold/25 bg-transparent text-gold text-lg cursor-pointer flex items-center justify-center"
            >+</button>
          </div>
          {selected && (() => {
            const tier = TICKET_TIERS.find(t => t.id === selected)!;
            return (
              <p className="font-display text-[1.1rem] font-semibold text-gold">
                Total: ₹{(tier.price * quantity).toLocaleString("en-IN")}
              </p>
            );
          })()}
        </motion.div>
      )}

      <button
        onClick={onNext}
        disabled={!selected}
        id="ticket-next-btn"
        className={`relative inline-flex items-center justify-center gap-2 px-8 py-3 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-[#0b0b0d] bg-gold border border-gold transition-colors duration-400 whitespace-nowrap ${selected ? "opacity-100 hover:bg-gold-muted hover:border-gold-muted cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
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
      <label className="block font-body text-[0.75rem] font-semibold tracking-[0.1em] uppercase text-text-muted mb-1.5" htmlFor={`attendee-${key}`}>{label}</label>
      <input
        id={`attendee-${key}`}
        className={`w-full px-4 py-3 bg-white/[0.03] border text-text-primary font-body text-[0.9rem] outline-none transition-colors duration-300 focus:bg-gold/[0.03] ${errors[key] ? "border-[#e05c5c]/50 bg-[#e05c5c]/5 focus:border-[#e05c5c]/80" : "border-gold/20 focus:border-gold/50"}`}
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => onChange({ [key]: e.target.value })}
      />
      {errors[key] && <p className="font-body text-[0.7rem] text-[#e05c5c] mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="max-w-[520px]">
      <div className="grid gap-5 mb-8">
        {field("name", "Full Name *", "text", "As it will appear on your ticket")}
        {field("phone", "Phone Number *", "tel", "+91 XXXXX XXXXX")}
        {field("email", "Email Address *", "email", "For ticket confirmation")}
        {field("college", "College / Institution *", "text", "e.g. VJTI Mumbai")}
        <div>
          <label className="block font-body text-[0.75rem] font-semibold tracking-[0.1em] uppercase text-text-muted mb-1.5" htmlFor="attendee-year">Year / Category *</label>
          <select
            id="attendee-year"
            className={`w-full px-4 py-3 bg-white/[0.03] border text-text-primary font-body text-[0.9rem] outline-none transition-colors duration-300 focus:bg-gold/[0.03] ${errors.year ? "border-[#e05c5c]/50 bg-[#e05c5c]/5 focus:border-[#e05c5c]/80" : "border-gold/20 focus:border-gold/50"}`}
            value={form.year}
            onChange={(e) => onChange({ year: e.target.value })}
          >
            <option value="">Select year</option>
            {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          {errors.year && <p className="font-body text-[0.7rem] text-[#e05c5c] mt-1">{errors.year}</p>}
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <button className="relative inline-flex items-center justify-center gap-2 px-8 py-3 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-gold bg-transparent border border-gold/40 hover:text-[#0b0b0d] hover:border-gold hover:bg-gold transition-colors duration-400 whitespace-nowrap group" onClick={onBack}>
          <span className="absolute inset-0 bg-gold scale-x-0 origin-left transition-transform duration-400 group-hover:scale-x-100 -z-10" />
          ← Back
        </button>
        <button className="relative inline-flex items-center justify-center gap-2 px-8 py-3 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-[#0b0b0d] bg-gold border border-gold hover:bg-gold-muted hover:border-gold-muted transition-colors duration-400 whitespace-nowrap" onClick={onNext} id="form-next-btn">Review Order →</button>
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
    <div className="max-w-[520px]">
      <div className="border border-gold/20 p-8 bg-[#18151a] mb-8">
        <p className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-text-dim mb-6">Order Summary</p>
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
          <div key={label} className="flex justify-between gap-4 pb-3 border-b border-gold/[0.07] mb-3">
            <span className="font-body text-[0.78rem] text-text-dim">{label}</span>
            <span className="font-body text-[0.82rem] text-text-muted text-right">{value}</span>
          </div>
        ))}
        <div className="flex justify-between items-center mt-3">
          <span className="font-body text-[0.8rem] font-semibold tracking-[0.1em] uppercase text-text-muted">Base Total</span>
          <span className="font-display text-[1.5rem] font-bold text-gold">₹{total.toLocaleString("en-IN")}</span>
        </div>
        <p className="font-body text-[0.7rem] text-text-dim mt-2">
          ★ You will be redirected to our secure payment gateway to complete your booking.
        </p>
      </div>
      <div className="flex gap-4 flex-wrap">
        <button className="relative inline-flex items-center justify-center gap-2 px-8 py-3 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-gold bg-transparent border border-gold/40 hover:text-[#0b0b0d] hover:border-gold hover:bg-gold transition-colors duration-400 whitespace-nowrap group" onClick={onBack} disabled={isLoading}>
          <span className="absolute inset-0 bg-gold scale-x-0 origin-left transition-transform duration-400 group-hover:scale-x-100 -z-10" />
          ← Edit
        </button>
        <button className={`relative inline-flex items-center justify-center gap-2 px-8 py-3 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-[#0b0b0d] bg-gold border border-gold transition-colors duration-400 whitespace-nowrap ${isLoading ? "opacity-70 cursor-wait" : "hover:bg-gold-muted hover:border-gold-muted cursor-pointer"}`} onClick={onConfirm} disabled={isLoading} id="confirm-order-btn">
          {isLoading ? "Preparing Payment…" : "Proceed to Payment →"}
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Processing ──────────────────────────────────────────────────────
function ProcessingStep() {
  return (
    <div className="max-w-[480px] text-center py-8">
      <div className="flex justify-center mb-8">
        <div className="w-[72px] h-[72px] border border-gold/30 rounded-full flex items-center justify-center bg-gold/5">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12" stroke="rgba(212,175,55,0.2)" strokeWidth="1" />
              <path d="M14 2A12 12 0 0 1 26 14" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </motion.div>
        </div>
      </div>
      <h3 className="font-display text-[1.5rem] text-text-primary mb-2">Verifying your payment...</h3>
      <p className="font-body text-[0.85rem] text-text-muted leading-[1.6]">
        Please don't close this window. We are confirming your transaction with the bank.
      </p>
    </div>
  );
}

// ─── Step 5: Confirmed ───────────────────────────────────────────────────────
function ConfirmedStep({ order }: { order: Order }) {
  return (
    <div className="max-w-[480px] text-center py-4">
      <div className="flex justify-center mb-8">
        <div className="w-[72px] h-[72px] bg-[#3fb950] rounded-full flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
      <p className="font-script text-[1.6rem] text-gold-muted mb-2">Success</p>
      <h3 className="font-display text-[1.8rem] font-bold text-text-primary mb-4">
        Ticket Confirmed
      </h3>
      <p className="font-serif text-[0.95rem] text-text-muted leading-[1.6] mb-8">
        Your payment has been successfully verified. 
        Your ticket will be emailed to <strong className="text-text-primary">{order.attendee_email}</strong> shortly.
      </p>

      <a
        href={`/ticket?orderId=${order.id}`}
        id="check-ticket-btn"
        className="relative inline-flex items-center justify-center gap-2 px-8 py-3 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-gold bg-transparent border border-gold/40 hover:text-[#0b0b0d] hover:border-gold hover:bg-gold transition-colors duration-400 whitespace-nowrap group w-full mb-4"
      >
        <span className="absolute inset-0 bg-gold scale-x-0 origin-left transition-transform duration-400 group-hover:scale-x-100 -z-10" />
        Check Ticket Status
      </a>

      <p className="font-body text-[0.72rem] text-text-dim leading-[1.6]">
        Save your Order ID: <strong className="text-gold-muted font-mono">{order.id}</strong>
        <br />
        Questions? Reach us on{" "}
        <a href={EVENT.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="text-gold-muted underline hover:text-gold transition-colors">
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
    <section id="tickets" className="relative z-10 py-28 md:py-30 bg-[#151316]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <p className="font-body text-[0.6875rem] font-semibold tracking-[0.25em] uppercase text-gold-muted mb-3">Tickets</p>
          <h2 className="font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-tight text-text-primary mb-6">
            Book Your{" "}
            <span className="text-gold italic">Spot</span>
          </h2>
          <p className="font-serif text-[clamp(1rem,2.5vw,1.25rem)] text-text-muted leading-[1.8] max-w-[640px]">
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
                  <p className="font-body text-[0.8rem] text-[#e05c5c] mt-4">
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
