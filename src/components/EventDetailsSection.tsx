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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subvalue?: string;
  isTba?: boolean;
}) {
  return (
    <div
      className="card-base"
      style={{
        padding: "1.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "1px solid rgba(212,175,55,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--gold)",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--text-dim)",
            marginBottom: "0.35rem",
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1rem",
            fontWeight: 600,
            color: isTba ? "var(--text-muted)" : "var(--text-primary)",
            lineHeight: 1.3,
          }}
        >
          {value}
        </p>
        {subvalue && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              color: "var(--text-dim)",
              marginTop: "0.3rem",
              lineHeight: 1.5,
            }}
          >
            {subvalue}
          </p>
        )}
        {isTba && (
          <span
            style={{
              display: "inline-block",
              marginTop: "0.5rem",
              padding: "0.2rem 0.6rem",
              border: "1px solid rgba(212,175,55,0.2)",
              fontFamily: "var(--font-body)",
              fontSize: "0.55rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--gold-dim)",
            }}
          >
            Stay tuned
          </span>
        )}
      </div>
    </div>
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
      style={{ borderBottom: "1px solid rgba(212,175,55,0.1)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        id={`faq-btn-${index}`}
        aria-controls={`faq-panel-${index}`}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
          padding: "1.4rem 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            fontWeight: 500,
            color: open ? "var(--gold)" : "var(--text-primary)",
            lineHeight: 1.5,
            transition: "color 0.25s ease",
          }}
        >
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          style={{ flexShrink: 0 }}
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
              stroke={open ? "var(--gold)" : "var(--text-dim)"}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <line
              x1="2"
              y1="9"
              x2="16"
              y2="9"
              stroke={open ? "var(--gold)" : "var(--text-dim)"}
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
            style={{ overflow: "hidden" }}
          >
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "0.975rem",
                color: "var(--text-muted)",
                lineHeight: 1.85,
                paddingBottom: "1.4rem",
                maxWidth: "680px",
              }}
            >
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
    <li
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        fontFamily: "var(--font-body)",
        fontSize: "0.875rem",
        color: "var(--text-muted)",
        lineHeight: 1.6,
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        style={{ marginTop: "3px", flexShrink: 0 }}
      >
        <polygon points="7,0 14,7 7,14 0,7" fill="var(--gold)" opacity="0.7" />
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
          style={{ marginBottom: "4rem" }}
        >
          <p className="section-eyebrow">Event Details</p>
          <h2 className="section-heading">
            Everything You Need to{" "}
            <span style={{ color: "var(--gold)", fontStyle: "italic" }}>
              Know
            </span>
          </h2>
        </motion.div>

        {/* Detail cards grid */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1px",
            background: "rgba(212,175,55,0.07)",
            border: "1px solid rgba(212,175,55,0.07)",
            marginBottom: "5rem",
          }}
        >
          <DetailCard
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
        </motion.div>

        {/* What's included */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "4rem",
            marginBottom: "5rem",
          }}
          className="details-split"
        >
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "1.5rem",
              }}
            >
              What&apos;s Included
            </h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
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
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "1.5rem",
              }}
            >
              Entry Rules
            </h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
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
        <div style={{ marginBottom: "5rem" }}>
          <GoldDivider label="FAQ" />
        </div>

        {/* FAQ header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: "2.5rem" }}
        >
          <h2 className="section-heading" style={{ marginBottom: "0.5rem" }}>
            Frequently Asked{" "}
            <span style={{ color: "var(--gold)", fontStyle: "italic" }}>
              Questions
            </span>
          </h2>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1rem",
              color: "var(--text-muted)",
            }}
          >
            Still have questions? Reach us on{" "}
            <a
              href={EVENT.socialLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--gold-muted)",
                textDecoration: "underline",
                textDecorationColor: "rgba(212,175,55,0.3)",
              }}
            >
              WhatsApp
            </a>
            .
          </p>
        </motion.div>

        {/* FAQ accordion */}
        <div style={{ maxWidth: "780px" }}>
          {FAQS.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 900px) {
          .details-split {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
