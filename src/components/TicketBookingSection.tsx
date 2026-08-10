"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { TICKET_TIERS, EVENT, PAYMENT } from "@/lib/config";
import type { TicketTierId } from "@/lib/config";
import { OrderCountdown, EarlyBirdCountdown } from "@/components/ui/CountdownTimer";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AttendeeForm {
  attendeeName: string;
  phone: string;
  email: string;
}

interface OrderData {
  orderId: string;
  ticketTierId: string;
  quantity: number;
  baseAmount: number;
  payableAmount: number;
  expiresAt: string;
  status: string;
  ticketId?: string | null;
  attendeeName: string;
}

type Step =
  | "select"      // 1. Tier + qty selection
  | "form"        // 2. Attendee details
  | "summary"     // 3. Order summary confirmation
  | "payment"     // 4. Pay via QR and upload screenshot
  | "pending";    // 5. Success/Pending screen

// ─── Step progress indicator ──────────────────────────────────────────────────
const STEPS: { key: Step; label: string }[] = [
  { key: "select", label: "Tickets" },
  { key: "form", label: "Details" },
  { key: "summary", label: "Review" },
  { key: "payment", label: "Pay" },
  { key: "pending", label: "Done" },
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
  tiers,
  selected,
  quantity,
  onSelect,
  onQty,
  onNext,
  loading,
}: {
  tiers: any[];
  selected: TicketTierId | null;
  quantity: number;
  onSelect: (id: TicketTierId) => void;
  onQty: (n: number) => void;
  onNext: () => void;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-gold-muted animate-pulse font-body tracking-widest text-sm uppercase">
          Loading availability...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 border border-gold/20 bg-gold/[0.02] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="font-display text-lg text-gold mb-1">Early Bird Sale</h4>
          <p className="font-body text-xs text-text-muted">Grab your tickets before the price goes up!</p>
        </div>
        <EarlyBirdCountdown targetDate="2026-08-11T23:59:00+05:30" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5 mb-10">
        {tiers.map((tier) => {
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
                {tier.inclusions.map((inc: string) => (
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
              type="button"
              onClick={() => onQty(Math.max(1, quantity - 1))}
              className="w-9 h-9 border border-gold/25 bg-transparent text-gold text-lg cursor-pointer flex items-center justify-center"
            >−</button>
            <span className="font-display text-[1.25rem] font-bold text-text-primary min-w-[2rem] text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => onQty(Math.min(10, quantity + 1))}
              className="w-9 h-9 border border-gold/25 bg-transparent text-gold text-lg cursor-pointer flex items-center justify-center"
            >+</button>
          </div>
          {selected && (() => {
            const tier = tiers.find(t => t.id === selected);
            if (!tier) return null;
            return (
              <p className="font-display text-[1.1rem] font-semibold text-gold">
                Total: ₹{(tier.price * quantity).toLocaleString("en-IN")}
              </p>
            );
          })()}
        </motion.div>
      )}

      <button
        type="button"
        onClick={onNext}
        disabled={!selected}
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
      <label className="block font-body text-[0.75rem] font-bold tracking-[0.15em] uppercase text-gold-muted mb-2" htmlFor={`attendee-${key}`}>{label}</label>
      <input
        id={`attendee-${key}`}
        className={`w-full px-4 py-3 bg-[#0b0b0d]/50 border text-text-primary font-body text-[0.95rem] outline-none transition-all duration-300 rounded-sm shadow-inner ${errors[key] ? "border-[#e05c5c] focus:ring-1 focus:ring-[#e05c5c]/50 bg-[#e05c5c]/5" : "border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold/30 hover:border-gold/50"}`}
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => onChange({ [key]: e.target.value })}
      />
      {errors[key] && <p className="font-body text-[0.75rem] text-[#e05c5c] mt-2 font-semibold tracking-wide">⚠ {errors[key]}</p>}
    </div>
  );

  return (
    <div className="max-w-[520px]">
      <div className="grid gap-5 mb-8">
        {field("attendeeName", "Full Name *", "text", "As it will appear on your ticket")}
        {field("phone", "Phone Number *", "tel", "10-digit mobile")}
        {field("email", "Email Address *", "email", "you@email.com")}
      </div>

      <div className="flex gap-4 flex-wrap mt-10">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <Button variant="gold" onClick={onNext}>
          Review Order →
        </Button>
      </div>
    </div>
  );
}

// ─── Step 3: Order summary ────────────────────────────────────────────────────
function OrderSummaryStep({
  tierId,
  quantity,
  form,
  tiers,
  onConfirm,
  onBack,
  isLoading,
}: {
  tierId: TicketTierId;
  quantity: number;
  form: AttendeeForm;
  tiers: any[];
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const tier = tiers.find((t) => t.id === tierId);
  if (!tier) return null;
  const total = tier.price * quantity;
  return (
    <div className="max-w-[520px]">
      <div className="border border-gold/40 p-8 bg-[#0b0b0d] mb-8 relative overflow-hidden shadow-[0_0_25px_rgba(212,175,55,0.08)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gold/50"></div>
        <p className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-text-dim mb-6">Order Summary</p>
        {[
          ["Ticket", `${tier.label} × ${quantity}`],
          ["Price per ticket", `₹${tier.price.toLocaleString("en-IN")}`],
          ["Attendee", form.attendeeName],
          ["Phone", form.phone],
          ["Email", form.email],
          ["Event", `${EVENT.name} · ${EVENT.date}`],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 pb-3 border-b border-gold/[0.07] mb-3">
            <span className="font-body text-[0.78rem] text-text-dim">{label}</span>
            <span className="font-body text-[0.82rem] text-text-muted text-right">{value}</span>
          </div>
        ))}
        <div className="flex justify-between items-center mt-6">
          <span className="font-body text-[0.8rem] font-semibold tracking-[0.1em] uppercase text-text-muted">Total Amount</span>
          <span className="font-display text-[1.8rem] font-bold text-gold">₹{total.toLocaleString("en-IN")}</span>
        </div>
      </div>
      <div className="flex gap-4 flex-wrap mt-10">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          ← Edit
        </Button>
        <Button variant="gold" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? "Preparing Payment…" : "Proceed to Payment →"}
        </Button>
      </div>
    </div>
  );
}

// ─── Step 4: Payment via QR ──────────────────────────────────────────────────
function PaymentStep({
  order,
  upiQr,
  onSubmitPayment,
  isLoading,
}: {
  order: OrderData;
  upiQr: string;
  onSubmitPayment: (utr: string, screenshot: File) => void;
  isLoading: boolean;
}) {
  const [utr, setUtr] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, etc.)");
      return;
    }
    if (file.size > PAYMENT.maxScreenshotSizeMb * 1024 * 1024) {
      setError(`File must be under ${PAYMENT.maxScreenshotSizeMb}MB`);
      return;
    }
    setScreenshot(file);
    setError("");
  };

  const handleSubmit = () => {
    if (!utr.trim()) {
      setError("Please enter your UTR / reference number");
      return;
    }
    if (!screenshot) {
      setError("Please upload a payment screenshot");
      return;
    }
    onSubmitPayment(utr, screenshot);
  };

  return (
    <div className="max-w-[700px]">
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Left: QR Code */}
        <div className="bg-[#18151a] border border-gold/20 p-8 flex flex-col items-center justify-center text-center">
          <p className="font-body text-[0.65rem] tracking-[0.15em] uppercase text-text-dim mb-2">Scan & Pay</p>
          <p className="font-display text-[2rem] font-bold text-gold mb-6">
            ₹{order.payableAmount.toLocaleString("en-IN")}
          </p>
          <div className="bg-white p-4 rounded-xl mb-6 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
            <img src="/images/Gpay_499.jpg" alt="UPI QR Code" className="w-48 h-48 object-contain" />
          </div>

          <div className="mt-6 border-t border-gold/10 w-full pt-4">
            <OrderCountdown expiresAt={order.expiresAt} />
          </div>
        </div>

        {/* Right: Upload Form */}
        <div className="flex flex-col justify-center">
          <h3 className="font-display text-[1.5rem] text-text-primary mb-2">Verify Payment</h3>
          <p className="font-body text-[0.85rem] text-text-muted leading-[1.6] mb-8">
            Once you have completed the payment via the QR code, please enter the UTR number and upload a screenshot for verification.
          </p>

          <div className="grid gap-5 mb-6">
            <div>
              <label className="block font-body text-[0.75rem] font-bold tracking-[0.15em] uppercase text-gold-muted mb-2">UTR / Reference Number *</label>
              <input
                type="text"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="e.g. 312456789012"
                className="w-full px-4 py-3 bg-[#0b0b0d]/50 border border-gold/30 text-text-primary font-mono text-[1rem] outline-none transition-all duration-300 rounded-sm shadow-inner focus:border-gold focus:ring-1 focus:ring-gold/30 hover:border-gold/50"
              />
            </div>
            <div>
              <label className="block font-body text-[0.75rem] font-bold tracking-[0.15em] uppercase text-gold-muted mb-2">Upload Screenshot *</label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-2.5 font-body text-[0.75rem] font-bold tracking-wider uppercase text-gold bg-[#0b0b0d] border border-gold hover:bg-gold hover:text-black transition-colors duration-300 rounded-sm">
                  <span>Choose File</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleScreenshotChange}
                    className="hidden"
                  />
                </label>
                <span className="font-body text-[0.85rem] text-text-muted truncate max-w-[200px]">
                  {screenshot ? screenshot.name : "No file chosen"}
                </span>
              </div>
            </div>
          </div>
          {error && <p className="font-body text-[0.8rem] text-[#e05c5c] mb-6 font-semibold tracking-wide">⚠ {error}</p>}

          <Button variant="gold" onClick={handleSubmit} disabled={isLoading} className="w-full flex items-center justify-center py-3.5">
            {isLoading ? "Submitting..." : "Submit Verification"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 5: Confirmed/Pending ────────────────────────────────────────────────
function ConfirmedStep({ order }: { order: OrderData }) {
  return (
    <div className="max-w-[480px] text-center py-4 mx-auto">
      <div className="flex justify-center mb-8">
        <div className="w-[72px] h-[72px] bg-gold/10 border border-gold rounded-full flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
      </div>
      <p className="font-script text-[1.6rem] text-gold-muted mb-2">Pending Verification</p>
      <h3 className="font-display text-[1.8rem] font-bold text-text-primary mb-4">
        Details Received
      </h3>
      <p className="font-serif text-[0.95rem] text-text-muted leading-[1.6] mb-8">
        Your payment details are being verified manually. This usually takes 1-2 hours. Once approved, your digital pass will be active.
      </p>

      <a
        href={`/ticket?orderId=${order.orderId}`}
        className="relative inline-flex items-center justify-center gap-2 px-8 py-3 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-gold bg-transparent border border-gold/40 hover:text-[#0b0b0d] hover:border-gold hover:bg-gold transition-colors duration-400 whitespace-nowrap group w-full mb-4"
      >
        <span className="absolute inset-0 bg-gold scale-x-0 origin-left transition-transform duration-400 group-hover:scale-x-100 -z-10" />
        Track Status & View Ticket
      </a>

      <p className="font-body text-[0.72rem] text-text-dim leading-[1.6]">
        Save your Order ID: <strong className="text-gold-muted font-mono">{order.orderId}</strong>
        <br />
        Need help? Reach us on{" "}
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
  const [form, setForm] = useState<AttendeeForm>({ attendeeName: "", phone: "", email: "" });
  const [formErrors, setFormErrors] = useState<Partial<AttendeeForm>>({});
  const [order, setOrder] = useState<OrderData | null>(null);
  const [upiQr, setUpiQr] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [tiers, setTiers] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const sectionRef = useRef<HTMLElement>(null);

  const scrollToSection = () => {
    if (sectionRef.current) {
      const top = sectionRef.current.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const res = await fetch("/api/tiers");
        const data = await res.json();
        const loadedTiers = data.tiers ?? [];
        setTiers(loadedTiers);
        
        // Auto-select if there's only one tier
        if (loadedTiers.length === 1 && !tierId) {
          setTierId(loadedTiers[0].id);
        }
      } catch {
        setApiError("Failed to load ticket availability");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchTiers();
  }, [tierId]);

  // Track if this is the first render — skip scroll on initial mount
  const isMounted = useRef(false);

  // Scroll to top of section only when user navigates between steps (not on page load)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    scrollToSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const validateForm = (): boolean => {
    const errors: Partial<AttendeeForm> = {};
    if (!form.attendeeName.trim()) errors.attendeeName = "Name is required";
    if (!form.phone.trim()) errors.phone = "Phone is required";
    else if (!/^\+?[0-9\s]{10,13}$/.test(form.phone.replace(/\s/g, ""))) errors.phone = "Enter a valid 10-digit number";
    if (!form.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Enter a valid email address";
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
        body: JSON.stringify({ ticketTierId: tierId, quantity, ...form }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setApiError(data.error ?? "Failed to create order. Please try again.");
        setIsLoading(false);
        return;
      }
      
      if (data.mode === "cashfree" && data.paymentSessionId) {
        try {
          // @ts-ignore
          const { load } = await import("@cashfreepayments/cashfree-js");
          const cashfree = await load({
            mode: "sandbox", 
          });
          
          await cashfree.checkout({
            paymentSessionId: data.paymentSessionId,
            redirectTarget: "_self"
          });
        } catch (e) {
          setApiError("Failed to open Cashfree gateway.");
          setIsLoading(false);
        }
        return;
      }

      setOrder(data.order);
      setUpiQr(data.upiQr);
      setStep("payment");
      setIsLoading(false);
    } catch (err) {
      setApiError("Network error. Please check your connection.");
      setIsLoading(false);
    }
  }, [tierId, quantity, form]);

  const handleSubmitPayment = useCallback(async (utr: string, screenshot: File) => {
    if (!order) return;
    setIsLoading(true);
    setApiError(null);
    
    try {
      const formData = new FormData();
      formData.append("orderId", order.orderId);
      formData.append("utr", utr.trim());
      formData.append("screenshot", screenshot);

      const res = await fetch("/api/orders/payment", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error ?? "Failed to submit payment.");
        setIsLoading(false);
        return;
      }

      setOrder(data.order);
      setStep("pending");
      setIsLoading(false);
    } catch (e) {
      setApiError("Network error. Please check your connection.");
      setIsLoading(false);
    }
  }, [order]);

  const fadeVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.3 } },
  };

  return (
    <section ref={sectionRef} id="tickets" className="relative z-10 py-28 md:py-30 bg-[#151316]">
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <SectionHeading
            label="Secure Your Spot"
            title="Book Tickets"
            subtitle="Select your tier, complete payment via UPI, and receive your digital ticket after verification."
            align="center"
          />
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
                tiers={tiers}
                loading={initialLoading}
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
                  tiers={tiers}
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

            {step === "payment" && order && (
              <div>
                <PaymentStep 
                  order={order}
                  upiQr={upiQr}
                  onSubmitPayment={handleSubmitPayment}
                  isLoading={isLoading}
                />
                {apiError && (
                  <p className="font-body text-[0.8rem] text-[#e05c5c] mt-4 text-center max-w-[700px]">
                    ⚠ {apiError}
                  </p>
                )}
              </div>
            )}

            {step === "pending" && order && <ConfirmedStep order={order} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
