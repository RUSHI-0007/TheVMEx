"use client";

import { motion, type Variants } from "framer-motion";
import GoldDivider from "@/components/GoldDivider";
import { EVENT } from "@/lib/config";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

// ── Stat pill ─────────────────────────────────────────────────────────────
function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-5 px-8 border border-gold/15 bg-gold/[0.03]">
      <span className="font-display text-[clamp(1.8rem,4vw,2.5rem)] font-bold text-gold leading-none">
        {value}
      </span>
      <span className="font-body text-[0.65rem] tracking-[0.18em] uppercase text-text-dim">
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
      className="mb-4 opacity-35"
    >
      <path
        d="M0 28V16C0 7.163 5.373 2.093 16.12 0l1.88 3.36C12.507 4.64 9.6 7.48 9 12h7V28H0zm19 0V16C19 7.163 24.373 2.093 35.12 0L37 3.36C31.507 4.64 28.6 7.48 28 12h7V28H19z"
        fill="#d4af37"
      />
    </svg>
  );
}

export default function AboutSection() {
  return (
    <section id="about" className="relative z-10 py-28 md:py-30">
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8">

        {/* ── Part 1: About the Event ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.p variants={fadeUp} className="font-body text-[0.6875rem] font-semibold tracking-[0.25em] uppercase text-gold-muted mb-3">
              About the Event
            </motion.p>

            <motion.h2 variants={fadeUp} className="font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-tight text-text-primary mb-6">
              Where Mystery Meets{" "}
              <span className="text-gold italic">Elegance</span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="font-serif text-[clamp(1.05rem,2.2vw,1.2rem)] text-text-muted leading-[1.9] mb-6 max-w-[600px]"
            >
              Masquerade Night is not an event — it is an invitation to
              disappear into another world. Behind every mask is a story
              waiting to unfold: strangers become characters, the night
              becomes a stage, and the music ties it all together.
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="font-serif text-[clamp(1.05rem,2.2vw,1.2rem)] text-text-muted leading-[1.9] mb-10 max-w-[600px]"
            >
              Expect an evening of curated live performances, an
              atmosphere draped in gold and shadow, and the kind of night
              that gets talked about long after the masks come off.
            </motion.p>

            {/* Dress code callout */}
            <motion.div
              variants={fadeUp}
              className="inline-flex items-start gap-4 py-5 px-6 border border-gold/20 bg-gold/[0.03] max-w-[480px]"
            >
              <span className="text-xl mt-0.5">🎭</span>
              <div>
                <p className="font-body text-[0.65rem] tracking-[0.2em] uppercase text-gold-muted mb-1">
                  Dress Code
                </p>
                <p className="font-body text-[0.875rem] text-text-primary leading-relaxed">
                  {EVENT.dressCode}
                </p>
                <p className="font-body text-xs text-text-dim mt-1">
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
            className="p-10 border border-gold/[0.12] bg-gold/[0.025] relative"
          >
            {/* Corner accents */}
            {["top-0 left-0 border-t border-l", "top-0 right-0 border-t border-r", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map((pos, i) => (
              <div
                key={i}
                aria-hidden="true"
                className={`absolute w-3.5 h-3.5 border-gold ${pos} ${pos.includes("top") ? "-top-px" : "-bottom-px"} ${pos.includes("left") ? "-left-px" : "-right-px"}`}
              />
            ))}

            <QuoteMark />
            <blockquote className="font-serif text-[clamp(1.1rem,2.5vw,1.4rem)] italic font-light text-text-primary leading-[1.8] mb-6">
              The night is young, the masks are on, and the music never
              stops. Welcome to Masquerade Night.
            </blockquote>
            <p className="font-script text-[1.1rem] text-gold-muted">
              — TheVMEx
            </p>
          </motion.div>
        </div>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <div className="my-20">
          <GoldDivider />
        </div>

        {/* ── Part 2: About TheVMEx ─────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="text-center max-w-[700px] mx-auto"
        >
          <motion.p variants={fadeUp} className="font-body text-[0.6875rem] font-semibold tracking-[0.25em] uppercase text-gold-muted mb-3">
            About TheVMEx
          </motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-tight text-text-primary mb-6">
            We Create Nights You{" "}
            <span className="text-gold italic">Remember</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="font-serif text-[clamp(1rem,2.2vw,1.15rem)] text-text-muted leading-[1.9] mb-12"
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
            className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-px bg-gold/10 border border-gold/10 mb-10"
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
            id="about-instagram-cta"
            className="relative inline-flex items-center justify-center gap-2 px-8 py-3 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-gold bg-transparent border border-gold/40 hover:text-[#0b0b0d] hover:border-gold hover:bg-gold transition-all duration-300 whitespace-nowrap group"
          >
            <span className="absolute inset-0 bg-gold scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100 -z-10" />
            Follow @thevmex
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
