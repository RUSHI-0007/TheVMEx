"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
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
    <div className="flex flex-col items-center min-w-[60px]">
      <span className="font-display text-[clamp(2rem,5vw,3rem)] font-bold text-[#d4af37] leading-none tracking-tighter">
        {String(value).padStart(2, "0")}
      </span>
      <span className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-[#5e5a55] mt-1.5">
        {label}
      </span>
    </div>
  );
}

function CountdownSeparator() {
  return (
    <span className="font-display text-[clamp(1.5rem,4vw,2.5rem)] text-[#8a6f24] leading-none self-start pt-1">
      :
    </span>
  );
}

// ─── Info chip ─────────────────────────────────────────────────────────────
function InfoChip({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#d4af37]/20 bg-[#d4af37]/5">
      <span className="text-xs">{icon}</span>
      <span className="font-body text-xs font-medium tracking-wide text-[#9a948c]">
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
    <header className={`fixed top-0 left-0 right-0 z-50 px-8 h-[70px] flex items-center justify-between transition-all duration-500 ease-in-out ${scrolled ? "bg-[#0b0b0d]/90 backdrop-blur-md border-b border-[#d4af37]/10" : "bg-transparent border-b border-transparent"}`}>
      {/* Wordmark */}
      <a href="#" className="flex flex-col gap-[1px]">
        <span className="font-script text-[0.78rem] text-[#c9a24b] leading-none">presents</span>
        <span className="font-display text-[1.2rem] font-bold text-[#ede6da] tracking-wider">TheVMEx</span>
      </a>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-10" aria-label="Main navigation">
        {navLinks.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="font-body text-[0.72rem] tracking-[0.14em] uppercase text-[#9a948c] hover:text-[#d4af37] transition-colors duration-200"
          >
            {l.label}
          </a>
        ))}
        <a href="#tickets" className="relative inline-flex items-center justify-center gap-2 px-5 py-2 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-[#0b0b0d] bg-[#d4af37] border border-[#d4af37] hover:bg-[#c9a24b] hover:border-[#c9a24b] transition-colors duration-300 whitespace-nowrap">
          Book Tickets
        </a>
      </nav>

      {/* Mobile hamburger */}
      <button
        id="mobile-menu-toggle"
        aria-label="Toggle menu"
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden p-1 text-[#d4af37]"
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
        <div className="md:hidden fixed top-[70px] left-0 right-0 bg-[#0b0b0d]/95 border-b border-[#d4af37]/10 px-8 pt-6 pb-8 flex flex-col gap-5">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="font-body text-[0.85rem] tracking-[0.14em] uppercase text-[#9a948c]"
            >
              {l.label}
            </a>
          ))}
          <a href="#tickets" className="relative inline-flex items-center justify-center gap-2 px-6 py-3 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-[#0b0b0d] bg-[#d4af37] border border-[#d4af37] transition-colors duration-300 whitespace-nowrap" onClick={() => setMenuOpen(false)}>
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
        className="relative min-h-[100dvh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 overflow-hidden"
      >
        {/* Ambient background glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(212,175,55,0.06) 0%, transparent 70%)" }}
        />

        {/* Subtle horizontal scan lines texture overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(212,175,55,0.012) 3px, rgba(212,175,55,0.012) 4px)" }}
        />

        {/* Content */}
        <div className="relative z-10 w-full max-w-[860px]">

          {/* "presents" script accent */}
          <motion.p
            custom={0}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="font-script text-[clamp(1.2rem,3vw,1.6rem)] text-[#c9a24b] mb-1 leading-none"
          >
            TheVMEx presents
          </motion.p>

          {/* Event title */}
          <motion.h1
            custom={1}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="font-display text-[clamp(2.8rem,9vw,6.5rem)] font-black tracking-wide leading-none text-[#ede6da] mb-2"
          >
            MASQUERADE
            <br />
            <span className="text-[#d4af37]">NIGHT</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            custom={2}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="font-serif text-[clamp(1rem,2.5vw,1.3rem)] italic text-[#9a948c] mb-10 leading-relaxed"
          >
            An Evening Shrouded in Mystery &amp; Elegance
          </motion.p>

          {/* Info chips */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="flex flex-wrap justify-center gap-3 mb-10"
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
            className="flex flex-wrap justify-center gap-4 mb-16"
          >
            <a href="#tickets" id="hero-book-cta" className="relative inline-flex items-center justify-center gap-2 px-8 py-3 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-[#0b0b0d] bg-[#d4af37] border border-[#d4af37] hover:bg-[#c9a24b] hover:border-[#c9a24b] transition-colors duration-300 whitespace-nowrap">
              Book Your Ticket
            </a>
            <a href="#about" id="hero-details-cta" className="relative inline-flex items-center justify-center gap-2 px-8 py-3 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-[#d4af37] bg-transparent border border-[#d4af37]/40 hover:text-[#0b0b0d] hover:border-[#d4af37] hover:bg-[#d4af37] transition-all duration-300 whitespace-nowrap group">
              <span className="absolute inset-0 bg-[#d4af37] scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100 -z-10" />
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
            <p className="font-body text-[0.6rem] tracking-[0.25em] uppercase text-[#5e5a55] mb-4">
              Event begins in
            </p>
            <div className="flex items-start justify-center gap-4">
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
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          aria-hidden="true"
        >
          <span className="font-body text-[0.55rem] tracking-[0.2em] uppercase text-[#5e5a55]">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 3v12M4 10l5 5 5-5" stroke="#8a6f24" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      <GoldDivider />
    </>
  );
}
