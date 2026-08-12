"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { TICKET_TIERS, EVENT } from "@/lib/config";
import type { TicketTierId } from "@/lib/config";
import { EarlyBirdCountdown } from "@/components/ui/CountdownTimer";
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
  status: string;
  ticketId?: string | null;
  attendeeName: string;
}

type Step =
  | "select"    // 1. Tier + qty selection
  | "details"   // 2. Details
  | "pending";  // 3. Done

// ─── Step progress indicator ──────────────────────────────────────────────────
const STEPS: { key: Step; label: string }[] = [
  { key: "select", label: "Tickets" },
  { key: "details", label: "Details & Pay" },
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
                ₹{tier.price.toLocaleString("en-IN")} INR
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
                Total: ₹{(tier.price * quantity).toLocaleString("en-IN")} INR
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
        Continue →
      </button>
    </div>
  );
}

// ─── Step 2: Details ──────────────────────────────────
function DetailsAndPayStep({
  tiers,
  tierId,
  quantity,
  onSubmit,
  onBack,
  isLoading,
  apiError,
}: {
  tiers: any[];
  tierId: TicketTierId;
  quantity: number;
  onSubmit: (form: AttendeeForm) => void;
  onBack: () => void;
  isLoading: boolean;
  apiError: string | null;
}) {
  const tier = tiers.find((t) => t.id === tierId);
  const total = tier ? tier.price * quantity : 0;

  const [form, setForm] = useState<AttendeeForm>({ attendeeName: "", phone: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.attendeeName.trim()) e.attendeeName = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    else if (!/^\+?[0-9\s]{10,13}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Enter a valid 10-digit number";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSubmit(form);
  };

  const inputClass = (key: string) =>
    `w-full px-4 py-3 bg-[#0b0b0d]/50 border text-text-primary font-body text-[0.95rem] outline-none transition-all duration-300 rounded-sm shadow-inner ${errors[key] ? "border-[#e05c5c] focus:ring-1 focus:ring-[#e05c5c]/50 bg-[#e05c5c]/5" : "border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold/30 hover:border-gold/50"}`;

  const label = (text: string) => (
    <label className="block font-body text-[0.75rem] font-bold tracking-[0.15em] uppercase text-gold-muted mb-2">{text}</label>
  );

  return (
    <div className="max-w-[700px] mx-auto">
      <div className="bg-[#18151a] border border-gold/20 p-8 flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <div>
          <p className="font-body text-[0.65rem] tracking-[0.15em] uppercase text-text-dim mb-1">Total Amount</p>
          <p className="font-display text-[2.2rem] font-bold text-gold">
            ₹{total.toLocaleString("en-IN")} <span className="text-sm font-body text-gold/60">INR</span>
          </p>
          <p className="font-body text-[0.8rem] text-text-muted mt-1">
            {tier?.label} × {quantity}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          {label("Full Name *")}
          <input id="attendee-name" className={inputClass("attendeeName")} type="text" placeholder="As it appears on your ID" value={form.attendeeName} onChange={(e) => setForm(p => ({ ...p, attendeeName: e.target.value }))} />
          {errors.attendeeName && <p className="font-body text-[0.75rem] text-[#e05c5c] mt-1">⚠ {errors.attendeeName}</p>}
        </div>
        <div>
          {label("Phone Number *")}
          <input id="attendee-phone" className={inputClass("phone")} type="tel" placeholder="10-digit mobile" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} />
          {errors.phone && <p className="font-body text-[0.75rem] text-[#e05c5c] mt-1">⚠ {errors.phone}</p>}
        </div>
        <div>
          {label("Email Address *")}
          <input id="attendee-email" className={inputClass("email")} type="email" placeholder="you@email.com" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} />
          {errors.email && <p className="font-body text-[0.75rem] text-[#e05c5c] mt-1">⚠ {errors.email}</p>}
        </div>

        {apiError && <p className="font-body text-[0.8rem] text-[#e05c5c] font-semibold">⚠ {apiError}</p>}

        <div className="flex gap-4 flex-wrap pt-4">
          <Button variant="outline" onClick={onBack} disabled={isLoading}>← Back</Button>
          <Button variant="gold" onClick={handleSubmit} disabled={isLoading} className="flex-1 flex items-center justify-center py-3.5 text-[0.9rem]">
            {isLoading ? "Redirecting securely..." : "Proceed to Payment 🔒"}
          </Button>
        </div>
        
        <p className="text-center font-body text-[0.65rem] text-text-dim mt-2 tracking-widest uppercase">
          Secured by Cashfree Payments
        </p>
      </div>
    </div>
  );
}

// ─── Step 3: Confirmed/Pending ────────────────────────────────────────────────
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
        Booking Received!
      </h3>
      <p className="font-serif text-[0.95rem] text-text-muted leading-[1.6] mb-8">
        Your payment is being verified manually. This usually takes 1-2 hours. Once approved, your digital ticket will be sent to your email.
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

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TicketBookingSection() {
  const [step, setStep] = useState<Step>("select");
  const [tierId, setTierId] = useState<TicketTierId | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [order, setOrder] = useState<OrderData | null>(null);
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
        if (loadedTiers.length === 1 && !tierId) setTierId(loadedTiers[0].id);
      } catch {
        setApiError("Failed to load ticket availability");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchTiers();
  }, [tierId]);

  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    scrollToSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handleSubmit = useCallback(async (form: AttendeeForm) => {
    if (!tierId) return;
    setIsLoading(true);
    setApiError(null);

    try {
      const res = await fetch("/api/orders", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketTierId: tierId,
          quantity,
          attendeeName: form.attendeeName,
          phone: form.phone,
          email: form.email,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error ?? "Failed to submit booking. Please try again.");
        setIsLoading(false);
        return;
      }

      if (data.mode === "cashfree" && data.paymentSessionId) {
        try {
          // @ts-ignore
          const { load } = await import("@cashfreepayments/cashfree-js");
          // Initialize Cashfree in production mode by default for real payments
          const cashfree = await load({
            mode: process.env.NEXT_PUBLIC_CASHFREE_ENV || "production", 
          });
          
          await cashfree.checkout({
            paymentSessionId: data.paymentSessionId,
            redirectTarget: "_self"
          });
        } catch (e) {
          setApiError("Failed to open Cashfree gateway. Ensure you have network connectivity.");
          setIsLoading(false);
        }
        return;
      }

      setOrder(data.order);
      setStep("pending");
    } catch {
      setApiError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, [tierId, quantity]);

  const fadeVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.3 } },
  };

  return (
    <section ref={sectionRef} id="tickets" className="relative z-10 py-28 md:py-30 bg-[#151316]">
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8">
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
            subtitle="Select your tier, enter your details, and proceed to secure payment."
            align="center"
          />
        </motion.div>

        <StepIndicator current={step} />

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
                onNext={() => tierId && setStep("details")}
              />
            )}

            {step === "details" && tierId && (
              <DetailsAndPayStep
                tiers={tiers}
                tierId={tierId}
                quantity={quantity}
                onSubmit={handleSubmit}
                onBack={() => setStep("select")}
                isLoading={isLoading}
                apiError={apiError}
              />
            )}

            {step === "pending" && order && <ConfirmedStep order={order} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
