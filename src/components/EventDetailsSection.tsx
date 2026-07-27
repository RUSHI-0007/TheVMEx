"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GoldDivider from "@/components/GoldDivider";
import { EVENT, FAQS } from "@/lib/config";

// ── Detail card ────────────────────────────────────────────────────────────
function DetailCard({
  icon,
  label,
  value,
  subvalue,
  isTba = false,
  index = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subvalue?: string;
  isTba?: boolean;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="group relative bg-[#18151a] border border-gold/10 hover:border-gold/35 p-7 flex flex-col gap-3.5 overflow-hidden transition-shadow duration-300 hover:shadow-[0_8px_40px_rgba(212,175,55,0.1)] cursor-default"
    >
      {/* Animated top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-[linear-gradient(90deg,transparent,var(--color-gold),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      {/* Subtle background shimmer on hover */}
      <div className="absolute inset-0 bg-gold/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />

      <div className="relative z-10 w-10 h-10 border border-gold/20 group-hover:border-gold/50 flex items-center justify-center text-gold shrink-0 transition-colors duration-300">
        {icon}
      </div>
      <div className="relative z-10">
        <p className="font-body text-[0.6rem] tracking-[0.22em] uppercase text-text-dim mb-1.5">
          {label}
        </p>
        <p className={`font-display text-[1rem] font-semibold leading-[1.3] ${isTba ? "text-text-muted" : "text-text-primary"}`}>
          {value}
        </p>
        {subvalue && (
          <p className="font-body text-[0.78rem] text-text-dim mt-1.5 leading-[1.5]">
            {subvalue}
          </p>
        )}
        {isTba && (
          <span className="inline-block mt-2 px-2.5 py-1 border border-gold/20 font-body text-[0.55rem] tracking-[0.2em] uppercase text-gold-dim">
            Stay tuned
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ── FAQ item ───────────────────────────────────────────────────────────────
function FAQItem({
  q,
  a,
  index,
}: {
  q: string;
  a: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="border-b border-gold/10"
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        id={`faq-btn-${index}`}
        aria-controls={`faq-panel-${index}`}
        className="w-full flex items-center justify-between gap-6 py-5.5 bg-transparent border-none cursor-pointer text-left"
      >
        <span className={`font-body text-[0.9rem] font-medium leading-[1.5] transition-colors duration-250 ${open ? "text-gold" : "text-text-primary"}`}>
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="shrink-0"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
          >
            <line
              x1="9"
              y1="2"
              x2="9"
              y2="16"
              stroke={open ? "#d4af37" : "#8a8a93"}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <line
              x1="2"
              y1="9"
              x2="16"
              y2="9"
              stroke={open ? "#d4af37" : "#8a8a93"}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`faq-panel-${index}`}
            role="region"
            aria-labelledby={`faq-btn-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="font-serif text-[0.975rem] text-text-muted leading-[1.85] pb-5.5 max-w-[680px]">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── What's included list ───────────────────────────────────────────────────
function IncludedItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 font-body text-[0.875rem] text-text-muted leading-[1.6]">
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        className="mt-[3px] shrink-0"
      >
        <polygon points="7,0 14,7 7,14 0,7" fill="#d4af37" opacity="0.7" />
      </svg>
      {text}
    </li>
  );
}

// ── Main export ────────────────────────────────────────────────────────────
export default function EventDetailsSection() {
  return (
    <section id="details" className="section">
      <div className="container-site">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <p className="section-eyebrow">Event Details</p>
          <h2 className="section-heading">
            Everything You Need to{" "}
            <span className="text-gold italic">
              Know
            </span>
          </h2>
        </motion.div>

        {/* Detail cards grid — individual staggered animated cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-20 max-w-[1000px] mx-auto">
          <DetailCard
            index={0}
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="1" y="3" width="16" height="14" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                <line x1="1" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="1.2"/>
                <line x1="5" y1="1" x2="5" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="13" y1="1" x2="13" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            }
            label="Date"
            value={EVENT.date}
            subvalue="Doors open 7:30 PM · Show starts 8:00 PM"
          />
          <DetailCard
            index={1}
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1C6.24 1 4 3.24 4 6c0 4.25 5 11 5 11s5-6.75 5-11c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.2"/>
                <circle cx="9" cy="6" r="1.75" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
            }
            label="Venue"
            value={EVENT.venue}
            isTba
          />
          <DetailCard
            index={2}
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.2"/>
                <line x1="9" y1="4" x2="9" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="9" y1="9" x2="13" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            }
            label="Age Restriction"
            value={EVENT.ageRestriction}
            subvalue="Valid government ID mandatory at entry"
          />
          <DetailCard
            index={3}
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2l2.09 4.26L16 7.27l-3.5 3.41.83 4.82L9 13.18l-4.33 2.32.83-4.82L2 7.27l4.91-.01z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
            }
            label="Dress Code"
            value="Formal / Semi-Formal"
            subvalue="Masks encouraged — priority entry for masked guests"
          />
          <DetailCard
            index={4}
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="1" y="6" width="16" height="10" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M5 6V4a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <circle cx="9" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
            }
            label="Artist"
            value="Poltergeist"
            subvalue="Live performance · Alternative · Indie · Electronic"
          />
          <DetailCard
            index={5}
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 16l4-4m0 0l8-8M6 12l2-2m6-6l2-2M6 6l6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            }
            label="Parking"
            value="Details TBA"
            subvalue="Rideshare recommended"
            isTba
          />
        </div>


        {/* What's included */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20 max-w-[900px] mx-auto text-left">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h3 className="font-display text-[1.4rem] font-bold text-text-primary mb-6">
              What&apos;s Included
            </h3>
            <ul className="list-none flex flex-col gap-3.5">
              {[
                "Entry to the venue for the full duration of the event",
                "Welcome drink on arrival",
                "Live performance by Poltergeist",
                "Access to all curated music sets throughout the evening",
                "Digital ticket confirmation (QR code for entry)",
              ].map((item) => (
                <IncludedItem key={item} text={item} />
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h3 className="font-display text-[1.4rem] font-bold text-text-primary mb-6">
              Entry Rules
            </h3>
            <ul className="list-none flex flex-col gap-3.5">
              {[
                `Strictly ${EVENT.ageRestriction} — no exceptions`,
                "Valid photo ID is mandatory — Aadhaar, Passport, or Driving Licence",
                "Name on ticket must match ID presented at entry",
                "Tickets are non-transferable once confirmed",
                "Late entry subject to queue and capacity at that time",
                "Management reserves the right of admission",
              ].map((item) => (
                <IncludedItem key={item} text={item} />
              ))}
            </ul>
          </motion.div>
        </div>

        {/* ── Divider ─────────────────────────────────────────────────── */}
        <div className="mb-20 max-w-[1000px] mx-auto">
          <GoldDivider label="FAQ" />
        </div>

        {/* FAQ header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 max-w-[780px] mx-auto text-left"
        >
          <h2 className="section-heading mb-2">
            Frequently Asked{" "}
            <span className="text-gold italic">
              Questions
            </span>
          </h2>
          <p className="font-serif text-[1rem] text-text-muted">
            Still have questions? Reach us on{" "}
            <a
              href={EVENT.socialLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-muted underline decoration-gold/30"
            >
              WhatsApp
            </a>
            .
          </p>
        </motion.div>

        {/* FAQ accordion */}
        <div className="max-w-[780px] mx-auto">
          {FAQS.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
