"use client";

import { motion } from "framer-motion";
import GoldDivider from "@/components/GoldDivider";
import { EVENT } from "@/lib/config";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ── Stat pill ─────────────────────────────────────────────────────────────
function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.25rem",
        padding: "1.25rem 2rem",
        border: "1px solid rgba(212,175,55,0.15)",
        background: "rgba(212,175,55,0.03)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
          fontWeight: 700,
          color: "var(--gold)",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.65rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--text-dim)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Decorative quote mark ─────────────────────────────────────────────────
function QuoteMark() {
  return (
    <svg
      width="36"
      height="28"
      viewBox="0 0 36 28"
      fill="none"
      aria-hidden="true"
      style={{ marginBottom: "1rem", opacity: 0.35 }}
    >
      <path
        d="M0 28V16C0 7.163 5.373 2.093 16.12 0l1.88 3.36C12.507 4.64 9.6 7.48 9 12h7V28H0zm19 0V16C19 7.163 24.373 2.093 35.12 0L37 3.36C31.507 4.64 28.6 7.48 28 12h7V28H19z"
        fill="var(--gold)"
      />
    </svg>
  );
}

export default function AboutSection() {
  return (
    <section id="about" className="section">
      <div className="container-site">

        {/* ── Part 1: About the Event ──────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "4rem",
            alignItems: "center",
          }}
          className="about-grid"
        >
          {/* Left: text */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.p variants={fadeUp} className="section-eyebrow">
              About the Event
            </motion.p>

            <motion.h2 variants={fadeUp} className="section-heading">
              Where Mystery Meets{" "}
              <span style={{ color: "var(--gold)", fontStyle: "italic" }}>
                Elegance
              </span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.05rem, 2.2vw, 1.2rem)",
                color: "var(--text-muted)",
                lineHeight: 1.9,
                marginBottom: "1.5rem",
                maxWidth: "600px",
              }}
            >
              Masquerade Night is not an event — it is an invitation to
              disappear into another world. Behind every mask is a story
              waiting to unfold: strangers become characters, the night
              becomes a stage, and the music ties it all together.
            </motion.p>

            <motion.p
              variants={fadeUp}
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.05rem, 2.2vw, 1.2rem)",
                color: "var(--text-muted)",
                lineHeight: 1.9,
                marginBottom: "2.5rem",
                maxWidth: "600px",
              }}
            >
              Expect an evening of curated live performances, an
              atmosphere draped in gold and shadow, and the kind of night
              that gets talked about long after the masks come off.
            </motion.p>

            {/* Dress code callout */}
            <motion.div
              variants={fadeUp}
              style={{
                display: "inline-flex",
                alignItems: "flex-start",
                gap: "1rem",
                padding: "1.25rem 1.5rem",
                border: "1px solid rgba(212,175,55,0.2)",
                background: "rgba(212,175,55,0.03)",
                maxWidth: "480px",
              }}
            >
              <span style={{ fontSize: "1.25rem", marginTop: "2px" }}>🎭</span>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "var(--gold-muted)",
                    marginBottom: "0.3rem",
                  }}
                >
                  Dress Code
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.875rem",
                    color: "var(--text-primary)",
                    lineHeight: 1.5,
                  }}
                >
                  {EVENT.dressCode}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.75rem",
                    color: "var(--text-dim)",
                    marginTop: "0.3rem",
                  }}
                >
                  Masked guests receive priority entry &amp; a special surprise
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: decorative quote */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              padding: "2.5rem",
              border: "1px solid rgba(212,175,55,0.12)",
              background: "rgba(212,175,55,0.025)",
              position: "relative",
            }}
          >
            {/* Corner accents */}
            {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos, i) => (
              <div
                key={i}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  width: "14px",
                  height: "14px",
                  borderColor: "var(--gold)",
                  borderStyle: "solid",
                  borderWidth: 0,
                  ...(pos.includes("top") && pos.includes("left") ? { top: -1, left: -1, borderTopWidth: 1, borderLeftWidth: 1 } : {}),
                  ...(pos.includes("top") && pos.includes("right") ? { top: -1, right: -1, borderTopWidth: 1, borderRightWidth: 1 } : {}),
                  ...(pos.includes("bottom") && pos.includes("left") ? { bottom: -1, left: -1, borderBottomWidth: 1, borderLeftWidth: 1 } : {}),
                  ...(pos.includes("bottom") && pos.includes("right") ? { bottom: -1, right: -1, borderBottomWidth: 1, borderRightWidth: 1 } : {}),
                }}
              />
            ))}

            <QuoteMark />
            <blockquote
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
                fontStyle: "italic",
                fontWeight: 300,
                color: "var(--text-primary)",
                lineHeight: 1.8,
                marginBottom: "1.5rem",
              }}
            >
              The night is young, the masks are on, and the music never
              stops. Welcome to Masquerade Night.
            </blockquote>
            <p
              style={{
                fontFamily: "var(--font-script)",
                fontSize: "1.1rem",
                color: "var(--gold-muted)",
              }}
            >
              — TheVMEx
            </p>
          </motion.div>
        </div>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <div style={{ margin: "5rem 0" }}>
          <GoldDivider />
        </div>

        {/* ── Part 2: About TheVMEx ─────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto" }}
        >
          <motion.p variants={fadeUp} className="section-eyebrow">
            About TheVMEx
          </motion.p>
          <motion.h2 variants={fadeUp} className="section-heading">
            We Create Nights You{" "}
            <span style={{ color: "var(--gold)", fontStyle: "italic" }}>
              Remember
            </span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1rem, 2.2vw, 1.15rem)",
              color: "var(--text-muted)",
              lineHeight: 1.9,
              marginBottom: "3rem",
            }}
          >
            TheVMEx is a college event brand built on one principle: every
            event should feel premium, not just planned. Our debut — the
            Freshers Party 2025 — proved that college nights can be crafted
            with the same care as the finest productions. Masquerade Night
            is our next chapter.
          </motion.p>

          {/* Stats */}
          <motion.div
            variants={fadeUp}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "1px",
              background: "rgba(212,175,55,0.08)",
              border: "1px solid rgba(212,175,55,0.08)",
              marginBottom: "2.5rem",
            }}
          >
            <StatPill value="500+" label="Attendees · Freshers Party" />
            <StatPill value="1st" label="Flagship Event · 2025" />
            <StatPill value="2nd" label="Edition · Masquerade 2026" />
          </motion.div>

          <motion.a
            variants={fadeUp}
            href={EVENT.socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold-outline"
            id="about-instagram-cta"
          >
            Follow @thevmex
          </motion.a>
        </motion.div>
      </div>

      <style jsx>{`
        @media (min-width: 900px) {
          .about-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
