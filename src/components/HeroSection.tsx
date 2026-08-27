"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { EVENT } from "@/lib/config";

// ─── Countdown ─────────────────────────────────────────────────────────────
function useCountdown(targetISO: string) {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const target = new Date(targetISO).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setT({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setT({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetISO]);
  return t;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-[clamp(1.8rem,5vw,2.8rem)] font-bold text-[#d4af37] leading-none tabular-nums tracking-tighter">
        {String(value).padStart(2, "0")}
      </span>
      <span className="font-body text-[0.5rem] tracking-[0.22em] uppercase text-[#5e5a55] mt-1.5">
        {label}
      </span>
    </div>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      if (menuOpen) setMenuOpen(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  const links = [
    { label: "About",  href: "#about" },
    { label: "Events", href: "#events" },
    { label: "Lineup", href: "#lineup" },
    { label: "Gallery", href: "#gallery" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-[64px] flex items-center justify-between px-5 md:px-8 transition-all duration-500 ${
        scrolled
          ? "bg-[#0b0b0d]/95 backdrop-blur-md border-b border-[#d4af37]/10 shadow-[0_1px_20px_rgba(0,0,0,0.4)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* Wordmark */}
      <a href="#" className="flex flex-col gap-[1px] shrink-0" aria-label="TheVMEx home">
        <span className="font-script text-[0.72rem] text-[#c9a24b] leading-none">presents</span>
        <span className="font-display text-[1.1rem] font-bold text-[#ede6da] tracking-wider">TheVMEx</span>
      </a>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="font-body text-[0.72rem] tracking-[0.14em] uppercase text-[#9a948c] hover:text-[#d4af37] transition-colors duration-200"
          >
            {l.label}
          </a>
        ))}
        <a
          href="#book"
          className="btn-gold py-2 px-5 text-[0.75rem]"
        >
          Book an Event
        </a>
      </nav>

      {/* Mobile hamburger */}
      <button
        type="button"
        id="mobile-menu-toggle"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden p-2 text-[#d4af37] -mr-1"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          {menuOpen ? (
            <>
              <line x1="4" y1="4" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="18" y1="4" x2="4" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <line x1="3" y1="6"  x2="19" y2="6"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="3" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[64px] bg-[#0b0b0d]/98 backdrop-blur-md border-b border-[#d4af37]/10 px-6 py-6 flex flex-col gap-4 z-40">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="font-body text-[0.85rem] tracking-[0.14em] uppercase text-[#9a948c] hover:text-[#d4af37] transition-colors py-1"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#book"
            onClick={() => setMenuOpen(false)}
            className="btn-gold mt-2 justify-center"
          >
            Book an Event
          </a>
        </div>
      )}
    </header>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────
export default function HeroSection() {
  const countdown = useCountdown(EVENT.dateISO);
  const eventPast = new Date(EVENT.dateISO).getTime() < Date.now();

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: i * 0.13, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    }),
  };

  return (
    <>
      <Navbar />

      <section
        id="hero"
        className="relative min-h-[100dvh] flex flex-col items-center justify-center text-center px-5 sm:px-8 pt-24 pb-16 overflow-hidden"
      >
        {/* Ambient glow */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 55% at 50% 38%, rgba(212,175,55,0.07) 0%, transparent 70%)" }}
        />
        {/* Scan lines */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(212,175,55,0.008) 3px, rgba(212,175,55,0.008) 4px)" }}
        />

        {/* Content */}
        <div className="relative z-10 w-full max-w-[820px] mx-auto">

          {/* Script label */}
          <motion.p
            custom={0} initial="hidden" animate="show" variants={fadeUp}
            className="font-script text-[clamp(1.1rem,3vw,1.5rem)] text-[#c9a24b] mb-1 leading-none"
          >
            TheVMEx presents
          </motion.p>

          {/* Title */}
          <motion.h1
            custom={1} initial="hidden" animate="show" variants={fadeUp}
            className="font-display font-black tracking-wide leading-[0.92] text-[#ede6da] mb-3"
            style={{ fontSize: "clamp(2.6rem, 11vw, 7rem)" }}
          >
            MASQUERADE
            <br />
            <span className="text-[#d4af37]">NIGHT</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            custom={2} initial="hidden" animate="show" variants={fadeUp}
            className="font-serif italic text-[#9a948c] mb-8 leading-relaxed"
            style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.2rem)" }}
          >
            An Evening Shrouded in Mystery &amp; Elegance
          </motion.p>

          {/* Info chips */}
          <motion.div
            custom={3} initial="hidden" animate="show" variants={fadeUp}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            {[
              { icon: "calendar", text: EVENT.date },
              { icon: "pin",      text: EVENT.venue },
              { icon: "music",    text: `Ft. ${EVENT.artist}` },
            ].map(({ icon, text }) => (
              <div
                key={text}
                className="inline-flex items-center gap-2 px-3.5 py-2 border border-[#d4af37]/18 bg-[#d4af37]/[0.04] backdrop-blur-sm"
              >
                {icon === "calendar" && (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#c9a24b" strokeWidth="1.2" strokeLinecap="round">
                    <rect x="1" y="2" width="10" height="9" rx="1"/><line x1="1" y1="5" x2="11" y2="5"/><line x1="4" y1="1" x2="4" y2="3"/><line x1="8" y1="1" x2="8" y2="3"/>
                  </svg>
                )}
                {icon === "pin" && (
                  <svg width="10" height="12" viewBox="0 0 10 12" fill="none" stroke="#c9a24b" strokeWidth="1.2" strokeLinecap="round">
                    <path d="M5 1C3.07 1 1.5 2.57 1.5 4.5c0 2.83 3.5 6.5 3.5 6.5s3.5-3.67 3.5-6.5C8.5 2.57 6.93 1 5 1z"/><circle cx="5" cy="4.5" r="1.2"/>
                  </svg>
                )}
                {icon === "music" && (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#c9a24b" strokeWidth="1.2" strokeLinecap="round">
                    <path d="M4.5 9V3l6-1v6"/><circle cx="3" cy="9" r="1.5"/><circle cx="9" cy="8" r="1.5"/>
                  </svg>
                )}
                <span className="font-body text-[0.72rem] font-medium tracking-wide text-[#9a948c]">{text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            custom={4} initial="hidden" animate="show" variants={fadeUp}
            className="flex flex-col sm:flex-row justify-center gap-3 mb-12"
          >
            <a href="#events" id="hero-events-cta" className="btn-gold px-9 py-3.5">
              See Our Events
            </a>
            <a href="#book" id="hero-book-cta" className="btn-gold-outline px-9 py-3.5">
              Book an Event
            </a>
          </motion.div>

          {/* Countdown / Event Complete */}
          <motion.div
            custom={5} initial="hidden" animate="show" variants={fadeUp}
          >
            {eventPast ? (
              /* Post-event state */
              <div className="flex flex-col items-center gap-4">
                <div className="inline-flex items-center gap-2.5 px-5 py-2.5 border border-gold/30 bg-gold/[0.06] backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                  <span className="font-body text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-gold">
                    Event Complete
                  </span>
                </div>
                <a
                  href="#events"
                  className="inline-flex items-center gap-2 font-body text-[0.75rem] font-semibold tracking-[0.12em] uppercase text-gold-muted hover:text-gold transition-colors duration-200 group"
                >
                  See the Recap
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform duration-200 group-hover:translate-x-1">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            ) : (
              /* Countdown (shown before event date) */
              <>
                <p className="font-body text-[0.55rem] tracking-[0.28em] uppercase text-[#5e5a55] mb-4">
                  Event begins in
                </p>
                <div className="flex items-start justify-center gap-3 sm:gap-5">
                  <CountdownUnit value={countdown.days}    label="Days" />
                  <span className="font-display text-[clamp(1.5rem,4vw,2.2rem)] text-[#8a6f24] leading-none self-start pt-0.5">:</span>
                  <CountdownUnit value={countdown.hours}   label="Hours" />
                  <span className="font-display text-[clamp(1.5rem,4vw,2.2rem)] text-[#8a6f24] leading-none self-start pt-0.5">:</span>
                  <CountdownUnit value={countdown.minutes} label="Mins" />
                  <span className="font-display text-[clamp(1.5rem,4vw,2.2rem)] text-[#8a6f24] leading-none self-start pt-0.5">:</span>
                  <CountdownUnit value={countdown.seconds} label="Secs" />
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          aria-hidden
        >
          <span className="font-body text-[0.5rem] tracking-[0.22em] uppercase text-[#5e5a55]">Scroll</span>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M4 9l4 4 4-4" stroke="#8a6f24" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Gold divider built inline to avoid import */}
      <div className="relative flex items-center justify-center py-6 overflow-hidden">
        <div className="flex-1 max-w-[220px] h-px opacity-50 bg-[linear-gradient(to_right,transparent,var(--color-gold-muted),var(--color-gold),var(--color-gold-muted),transparent)]" />
        <div className="mx-4 flex items-center gap-2">
          <span className="w-1 h-1 bg-[#8a6f24] rotate-45" />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-60">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" stroke="#d4af37" strokeWidth="1" fill="rgba(212,175,55,0.15)" />
          </svg>
          <span className="w-1 h-1 bg-[#8a6f24] rotate-45" />
        </div>
        <div className="flex-1 max-w-[220px] h-px opacity-50 bg-[linear-gradient(to_right,transparent,var(--color-gold-muted),var(--color-gold),var(--color-gold-muted),transparent)]" />
      </div>
    </>
  );
}
