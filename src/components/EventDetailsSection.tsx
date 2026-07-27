"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EVENT, FAQS } from "@/lib/config";

// ── FAQ Item ───────────────────────────────────────────────────────────────
function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="border-b border-gold/[0.08]"
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 py-[18px] bg-transparent border-none cursor-pointer text-left"
      >
        <span className={`font-body text-[0.9rem] font-normal leading-[1.5] transition-colors duration-200 ${open ? "text-gold" : "text-text-primary"}`}>
          {q}
        </span>
        {/* Plus/X icon */}
        <span className="relative w-[18px] h-[18px] shrink-0">
          <span className={`absolute left-1/2 top-0 -translate-x-1/2 w-px h-full bg-gold-dim transition-transform duration-250 ${open ? "rotate-90" : ""}`} />
          <span className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-px bg-gold-dim" />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="font-serif text-[0.9rem] text-text-muted leading-[1.85] pb-[18px] font-light">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────
export default function EventDetailsSection() {
  const details = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="rgba(201,162,75,1)" strokeWidth="1.2">
          <rect x="1" y="3" width="16" height="14" rx="1"/>
          <line x1="1" y1="7" x2="17" y2="7"/>
          <line x1="5" y1="1" x2="5" y2="5" strokeLinecap="round"/>
          <line x1="13" y1="1" x2="13" y2="5" strokeLinecap="round"/>
        </svg>
      ),
      label: "Date & Time",
      value: EVENT.date,
      sub: "Doors 7:30 PM · Show 8:00 PM",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="rgba(201,162,75,1)" strokeWidth="1.2">
          <path d="M9 1C6.24 1 4 3.24 4 6c0 4.25 5 11 5 11s5-6.75 5-11c0-2.76-2.24-5-5-5z"/>
          <circle cx="9" cy="6" r="1.75"/>
        </svg>
      ),
      label: "Venue",
      value: EVENT.venue,
      isTba: true,
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="rgba(201,162,75,1)" strokeWidth="1.2">
          <path d="M9 2l2.09 4.26L16 7.27l-3.5 3.41.83 4.82L9 13.18l-4.33 2.32.83-4.82L2 7.27l4.91-.01z" strokeLinejoin="round"/>
        </svg>
      ),
      label: "Performing",
      value: "Poltergeist",
      sub: "Live · Alternative · Indie · Electronic",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="rgba(201,162,75,1)" strokeWidth="1.2">
          <rect x="1" y="6" width="16" height="10" rx="1"/>
          <path d="M5 6V4a4 4 0 018 0v2" strokeLinecap="round"/>
          <circle cx="9" cy="11" r="1.5"/>
        </svg>
      ),
      label: "Age Restriction",
      value: `${EVENT.ageRestriction} only`,
      sub: "Valid govt. ID mandatory at entry",
    },
  ];

  return (
    <section id="details" className="bg-[#131115] py-[72px]">
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8 }}
          className="mb-10"
        >
          <span className="font-serif text-[0.85rem] italic text-gold-dim mb-3 block font-light">
            Everything you need to know
          </span>
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.25rem)] font-bold text-text-primary leading-[1.1]">
            Event<br />Details
          </h2>
        </motion.div>

        {/* Details list */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="border border-gold/10 mb-10"
        >
          {details.map((d, i) => (
            <div key={i} className={`flex items-stretch ${i < details.length - 1 ? "border-b border-gold/[0.08]" : ""}`}>
              {/* Icon column */}
              <div className="w-[52px] border-r border-gold/[0.08] flex items-center justify-center py-4 shrink-0 opacity-70">
                {d.icon}
              </div>
              {/* Content */}
              <div className="px-4 py-3.5 flex flex-col justify-center flex-1">
                <p className="font-body text-[0.6rem] tracking-[0.22em] uppercase text-text-dim mb-1">
                  {d.label}
                </p>
                <p className={`font-serif text-[0.95rem] leading-[1.4] ${d.isTba ? "text-text-muted" : "text-text-primary"}`}>
                  {d.value}
                </p>
                {d.sub && (
                  <p className="font-body text-[0.72rem] text-text-dim mt-0.5">{d.sub}</p>
                )}
                {d.isTba && (
                  <span className="inline-block mt-1 font-body text-[0.55rem] tracking-[0.2em] uppercase text-gold border border-gold/25 px-2 py-0.5 w-fit">
                    Stay tuned
                  </span>
                )}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Two-column: What's Included + Entry Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="font-display text-[1.25rem] font-bold text-text-primary mb-4">What&apos;s Included</h3>
            <ul className="flex flex-col gap-2.5">
              {[
                "Entry to the venue for the full duration",
                "Welcome drink on arrival",
                "Live performance by Poltergeist",
                "Access to all curated music sets",
                "Digital QR ticket for entry",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 font-serif text-[0.9rem] text-text-muted leading-[1.6] font-light">
                  <span className="mt-[7px] w-1 h-1 bg-gold-dim shrink-0 rotate-45" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="font-display text-[1.25rem] font-bold text-text-primary mb-4">Entry Rules</h3>
            <ul className="flex flex-col gap-2.5">
              {[
                `Strictly ${EVENT.ageRestriction} — no exceptions`,
                "Valid photo ID mandatory — Aadhaar, Passport or Driving Licence",
                "Name on ticket must match ID at entry",
                "Tickets are non-transferable once confirmed",
                "Late entry subject to capacity at that time",
                "Management reserves the right of admission",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 font-serif text-[0.9rem] text-text-muted leading-[1.6] font-light">
                  <span className="mt-[7px] w-1 h-1 bg-gold-dim shrink-0 rotate-45" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* FAQ Divider */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
          <span className="w-[5px] h-[5px] bg-gold-dim rotate-45 shrink-0" />
          <span className="font-body text-[0.55rem] tracking-[0.25em] uppercase text-text-dim">FAQ</span>
          <span className="w-[5px] h-[5px] bg-gold-dim rotate-45 shrink-0" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        </div>

        {/* FAQ */}
        <div className="max-w-[780px]">
          {FAQS.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
