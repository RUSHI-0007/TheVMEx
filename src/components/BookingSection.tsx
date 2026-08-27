"use client";

import { motion } from "framer-motion";
import { NEXT_EVENT_CONTACT } from "@/lib/config";

// ─── Contact card ───────────────────────────────────────────────────────────
function ContactCard({
  icon,
  label,
  sublabel,
  href,
  id,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  href: string;
  id: string;
  delay: number;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      id={id}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col items-center gap-5 p-8 sm:p-10 border border-gold/[0.18] bg-gold/[0.025] hover:bg-gold/[0.06] hover:border-gold/40 transition-all duration-400 overflow-hidden cursor-pointer"
    >
      {/* Corner accent top-left */}
      <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-gold/30 group-hover:border-gold/60 transition-colors duration-300" />
      {/* Corner accent bottom-right */}
      <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-gold/30 group-hover:border-gold/60 transition-colors duration-300" />

      {/* Icon wrapper */}
      <div className="w-14 h-14 flex items-center justify-center border border-gold/20 group-hover:border-gold/50 bg-gold/[0.04] group-hover:bg-gold/[0.1] transition-all duration-300 text-gold">
        {icon}
      </div>

      {/* Text */}
      <div className="text-center">
        <p className="font-display text-[1.3rem] font-bold text-text-primary mb-1 group-hover:text-gold transition-colors duration-300">
          {label}
        </p>
        <p className="font-body text-[0.8rem] text-text-dim group-hover:text-text-muted transition-colors duration-200">
          {sublabel}
        </p>
      </div>

      {/* Arrow */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="text-gold-dim group-hover:text-gold transition-all duration-300 group-hover:translate-x-1"
      >
        <path
          d="M2 8h12M9 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.a>
  );
}

// ─── WhatsApp icon ──────────────────────────────────────────────────────────
function WhatsAppIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

// ─── Instagram icon ─────────────────────────────────────────────────────────
function InstagramIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function BookingSection() {
  return (
    <section id="book" className="bg-[#131115] py-[72px]">
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 max-w-[620px] mx-auto"
        >
          <p className="font-body text-[0.6875rem] font-semibold tracking-[0.25em] uppercase text-gold-muted mb-3">
            Work With Us
          </p>
          <h2 className="font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-tight text-text-primary mb-4">
            {NEXT_EVENT_CONTACT.headline}
          </h2>
          <p className="font-serif text-[clamp(1rem,2.2vw,1.15rem)] text-text-muted leading-[1.85] mb-3">
            {NEXT_EVENT_CONTACT.subline}
          </p>
          <p className="font-body text-[0.75rem] tracking-[0.15em] uppercase text-text-dim">
            {NEXT_EVENT_CONTACT.tagline}
          </p>
        </motion.div>

        {/* ── Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[700px] mx-auto mb-10">
          <ContactCard
            id="book-whatsapp-cta"
            icon={<WhatsAppIcon />}
            label="WhatsApp"
            sublabel="Chat with us directly"
            href={NEXT_EVENT_CONTACT.whatsapp}
            delay={0.1}
          />
          <ContactCard
            id="book-instagram-cta"
            icon={<InstagramIcon />}
            label="Instagram"
            sublabel="DM @thevmexperience"
            href={NEXT_EVENT_CONTACT.instagram}
            delay={0.2}
          />
        </div>

        {/* ── Tagline strip ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="flex items-center justify-center gap-4 md:gap-8 text-center"
        >
          {[
            "Premium Production",
            "Curated Lineups",
            "End-to-End Management",
          ].map((item, i) => (
            <div key={item} className="flex items-center gap-4 md:gap-8">
              {i > 0 && (
                <span className="w-1 h-1 bg-gold-dim rotate-45 shrink-0" />
              )}
              <span className="font-body text-[0.65rem] tracking-[0.18em] uppercase text-text-dim">
                {item}
              </span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
