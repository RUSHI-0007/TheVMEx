"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import MaskIllustration from "@/components/MaskIllustration";
import GoldDivider from "@/components/GoldDivider";
import { EVENT } from "@/lib/config";

// ─── Countdown timer ───────────────────────────────────────────────────────
function useCountdown(targetISO: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(targetISO).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetISO]);

  return timeLeft;
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "60px" }}>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: 700,
          color: "var(--gold)",
          lineHeight: 1,
          letterSpacing: "-0.01em",
        }}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.6rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--text-dim)",
          marginTop: "0.4rem",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function CountdownSeparator() {
  return (
    <span
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
        color: "var(--gold-dim)",
        lineHeight: 1,
        alignSelf: "flex-start",
        paddingTop: "0.15rem",
      }}
    >
      :
    </span>
  );
}

// ─── Info chip ─────────────────────────────────────────────────────────────
function InfoChip({ icon, text }: { icon: string; text: string }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.45rem 1rem",
        border: "1px solid rgba(212,175,55,0.2)",
        background: "rgba(212,175,55,0.04)",
      }}
    >
      <span style={{ fontSize: "0.75rem" }}>{icon}</span>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.75rem",
          fontWeight: 500,
          letterSpacing: "0.06em",
          color: "var(--text-muted)",
        }}
      >
        {text}
      </span>
    </div>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "About", href: "#about" },
    { label: "Lineup", href: "#lineup" },
    { label: "Details", href: "#details" },
    { label: "Gallery", href: "#gallery" },
  ];

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 2rem",
        height: "70px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease",
        background: scrolled ? "rgba(11,11,13,0.9)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(212,175,55,0.1)" : "1px solid transparent",
      }}
    >
      {/* Wordmark */}
      <a href="#" style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: "1px" }}>
        <span style={{ fontFamily: "var(--font-script)", fontSize: "0.78rem", color: "var(--gold-muted)", lineHeight: 1 }}>
          presents
        </span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.08em" }}>
          TheVMEx
        </span>
      </a>

      {/* Desktop nav */}
      <nav style={{ display: "flex", alignItems: "center", gap: "2.5rem" }} aria-label="Main navigation">
        {navLinks.map((l) => (
          <a
            key={l.href}
            href={l.href}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            {l.label}
          </a>
        ))}
        <a href="#tickets" className="btn-gold" style={{ padding: "0.5rem 1.25rem" }}>
          Book Tickets
        </a>
      </nav>

      {/* Mobile hamburger */}
      <button
        id="mobile-menu-toggle"
        aria-label="Toggle menu"
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          display: "none",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0.25rem",
          color: "var(--gold)",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          {menuOpen ? (
            <>
              <line x1="3" y1="3" x2="19" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="19" y1="3" x2="3" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="19" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="3" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </>
          )}
        </svg>
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: "70px",
            left: 0,
            right: 0,
            background: "rgba(11,11,13,0.97)",
            borderBottom: "1px solid rgba(212,175,55,0.12)",
            padding: "1.5rem 2rem 2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.85rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                textDecoration: "none",
              }}
            >
              {l.label}
            </a>
          ))}
          <a href="#tickets" className="btn-gold" style={{ textAlign: "center", padding: "0.7rem 1.5rem" }} onClick={() => setMenuOpen(false)}>
            Book Tickets
          </a>
        </div>
      )}
    </header>
  );
}

// ─── Hero Section ──────────────────────────────────────────────────────────
export default function HeroSection() {
  const countdown = useCountdown(EVENT.dateISO);

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 28 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: i * 0.14, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    }),
  };

  return (
    <>
      <Navbar />

      <section
        id="hero"
        style={{
          position: "relative",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "8rem 1.5rem 5rem",
          overflow: "hidden",
        }}
      >
        {/* Ambient background glow */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(212,175,55,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Subtle horizontal scan lines texture overlay */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(212,175,55,0.012) 3px, rgba(212,175,55,0.012) 4px)",
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: "860px", width: "100%" }}>

          {/* Mask illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginBottom: "1rem" }}
          >
            <MaskIllustration size={320} className="hero-mask" />
          </motion.div>

          {/* "presents" script accent */}
          <motion.p
            custom={0}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            style={{
              fontFamily: "var(--font-script)",
              fontSize: "clamp(1.2rem, 3vw, 1.6rem)",
              color: "var(--gold-muted)",
              marginBottom: "0.25rem",
              lineHeight: 1,
            }}
          >
            TheVMEx presents
          </motion.p>

          {/* Event title */}
          <motion.h1
            custom={1}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.8rem, 9vw, 6.5rem)",
              fontWeight: 900,
              letterSpacing: "0.04em",
              lineHeight: 1,
              color: "var(--text-primary)",
              marginBottom: "0.5rem",
            }}
          >
            MASQUERADE
            <br />
            <span style={{ color: "var(--gold)" }}>NIGHT</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            custom={2}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
              fontStyle: "italic",
              color: "var(--text-muted)",
              marginBottom: "2.5rem",
              lineHeight: 1.6,
            }}
          >
            An Evening Shrouded in Mystery &amp; Elegance
          </motion.p>

          {/* Info chips */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              justifyContent: "center",
              marginBottom: "2.5rem",
            }}
          >
            <InfoChip icon="🗓" text={EVENT.date} />
            <InfoChip icon="📍" text={EVENT.venue} />
            <InfoChip icon="🎵" text={`Ft. ${EVENT.artist}`} />
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "4rem" }}
          >
            <a href="#tickets" className="btn-gold" id="hero-book-cta">
              Book Your Ticket
            </a>
            <a href="#about" className="btn-gold-outline" id="hero-details-cta">
              View Details
            </a>
          </motion.div>

          {/* Countdown */}
          <motion.div
            custom={5}
            initial="hidden"
            animate="show"
            variants={fadeUp}
          >
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.6rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "var(--text-dim)",
                marginBottom: "1rem",
              }}
            >
              Event begins in
            </p>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", justifyContent: "center" }}>
              <CountdownBlock value={countdown.days} label="Days" />
              <CountdownSeparator />
              <CountdownBlock value={countdown.hours} label="Hours" />
              <CountdownSeparator />
              <CountdownBlock value={countdown.minutes} label="Minutes" />
              <CountdownSeparator />
              <CountdownBlock value={countdown.seconds} label="Seconds" />
            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          style={{
            position: "absolute",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.4rem",
          }}
          aria-hidden="true"
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.55rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--text-dim)",
            }}
          >
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 3v12M4 10l5 5 5-5" stroke="var(--gold-dim)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      <GoldDivider />
    </>
  );
}
