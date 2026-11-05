"use client";

/**
 * ActFounder — ACT II: The Host (Personal Brand Layer).
 *
 * Features:
 * - Parallax-enabled founder portrait with luxury gold corner accents.
 * - Fluid display typography with Cormorant Garamond.
 * - Live animated stat counters (Editions, Attendees, Standard).
 * - Direct contact channels (WhatsApp, Instagram, Email).
 * - Clear placeholder annotations [FOUNDER_NAME], [ROLE], [SHORT_BIO], [FOUNDER_PHOTO].
 * - Oversized Roman numeral "II" in background.
 */

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { EASE } from "@/lib/motion-tokens";

export function ActFounder() {
  const sectionRef = useRef<HTMLElement>(null);
  const photoContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const numeralRef = useRef<HTMLDivElement>(null);

  const stat1Ref = useRef<HTMLSpanElement>(null);
  const stat2Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // 1. Photo clip-path reveal and parallax
      if (photoContainerRef.current) {
        gsap.fromTo(
          photoContainerRef.current,
          { clipPath: "inset(15% 0% 15% 0%)", opacity: 0, x: -40 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            opacity: 1,
            x: 0,
            duration: 1.2,
            ease: EASE.vm,
            scrollTrigger: {
              trigger: photoContainerRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );

        // Slow parallax drift
        gsap.to(photoContainerRef.current, {
          y: -50,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // 2. Content entrance (slide from right)
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current.children,
          { x: 35, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.9,
            ease: EASE.vm,
            stagger: 0.12,
            scrollTrigger: {
              trigger: contentRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // 3. Stats numerical count-up on scroll entry
      if (statsRef.current) {
        const countObj = { val1: 0, val2: 0 };
        ScrollTrigger.create({
          trigger: statsRef.current,
          start: "top 85%",
          onEnter: () => {
            gsap.to(countObj, {
              val1: 2,
              val2: 700,
              duration: 1.6,
              ease: "power2.out",
              onUpdate: () => {
                if (stat1Ref.current) stat1Ref.current.textContent = `${Math.round(countObj.val1)}+`;
                if (stat2Ref.current) stat2Ref.current.textContent = `${Math.round(countObj.val2)}+`;
              },
            });
          },
        });
      }

      // 4. Parallax on Roman numeral II
      if (numeralRef.current) {
        gsap.to(numeralRef.current, {
          y: -100,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="founder"
      aria-label="Act II: The Host"
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "clamp(100px, 15vh, 180px) clamp(24px, 8vw, 140px)",
        backgroundColor: "transparent",
        overflow: "hidden",
      }}
    >
      {/* Oversized background Roman Numeral II with outlined 1px stroke */}
      <div
        ref={numeralRef}
        aria-hidden="true"
        className="vm-ghost-numeral"
        style={{
          position: "absolute",
          top: "5%",
          right: "2%",
          fontSize: "clamp(240px, 38vw, 560px)",
          zIndex: 0,
        }}
      >
        II
      </div>

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1240, margin: "0 auto", width: "100%" }}>
        {/* Act metadata */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "clamp(24px, 4vh, 48px)" }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: "var(--color-gold-500)",
              margin: 0,
            }}
          >
            Act II · The Host
          </p>
          <div style={{ width: 40, height: 1, backgroundColor: "var(--color-line)" }} />
        </div>

        {/* Asymmetrical 2-column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "clamp(40px, 7vw, 96px)",
            alignItems: "center",
          }}
        >
          {/* Left Column: Founder Photo Card */}
          <div
            ref={photoContainerRef}
            style={{
              position: "relative",
              maxWidth: 460,
              margin: "0 auto",
              width: "100%",
            }}
          >
            {/* Elegant luxury framing with gold corner accents */}
            <div
              style={{
                position: "relative",
                aspectRatio: "3 / 4",
                overflow: "hidden",
                border: "1px solid var(--color-line)",
                backgroundColor: "var(--color-smoke)",
              }}
            >
              <Image
                src="/img/founder.webp"
                alt="Manthan Manohar Khaire — Founder of TheVMEx"
                fill
                sizes="(max-width: 768px) 100vw, 460px"
                style={{
                  objectFit: "cover",
                  objectPosition: "center 20%",
                  filter: "contrast(1.05) brightness(0.95)",
                }}
              />

              {/* Dark gradient scrim at bottom of photo for role badge */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(11, 11, 13, 0.85) 0%, rgba(11, 11, 13, 0.2) 35%, transparent 60%)",
                  pointerEvents: "none",
                }}
              />

              {/* Corner accent: Top-left */}
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  width: 14,
                  height: 14,
                  borderTop: "1px solid var(--color-gold-500)",
                  borderLeft: "1px solid var(--color-gold-500)",
                  pointerEvents: "none",
                }}
              />

              {/* Corner accent: Bottom-right */}
              <div
                style={{
                  position: "absolute",
                  bottom: 12,
                  right: 12,
                  width: 14,
                  height: 14,
                  borderBottom: "1px solid var(--color-gold-500)",
                  borderRight: "1px solid var(--color-gold-500)",
                  pointerEvents: "none",
                }}
              />

              {/* Founder Tag & Photo Placeholder label */}
              <div
                style={{
                  position: "absolute",
                  bottom: 20,
                  left: 20,
                  right: 20,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "9px",
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "var(--color-gold-300)",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    Founder
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "13px",
                      letterSpacing: "0.04em",
                      color: "var(--color-ink)",
                      fontWeight: 500,
                    }}
                  >
                    Manthan Khaire
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Bio, Stats, and Quick Actions */}
          <div ref={contentRef}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--color-gold-500)",
                display: "block",
                marginBottom: 8,
              }}
            >
              The Host
            </span>

            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                fontSize: "clamp(38px, 6vw, 84px)",
                lineHeight: 0.95,
                letterSpacing: "-0.02em",
                color: "var(--color-ink)",
                margin: 0,
                marginBottom: 12,
              }}
            >
              Manthan Manohar<br />Khaire
            </h2>

            {/* Role */}
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--color-gold-300)",
                marginBottom: 28,
              }}
            >
              Founder · TheVMEx
            </p>

            {/* Bio Paragraph */}
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: "clamp(20px, 2.2vw, 28px)",
                lineHeight: 1.35,
                color: "var(--color-ink)",
                opacity: 0.9,
                maxWidth: "46ch",
                marginBottom: 36,
              }}
            >
              &ldquo;We Create Nights You Remember.&rdquo;
            </p>

            {/* Stat Counters Row */}
            <div
              ref={statsRef}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 24,
                padding: "24px 0",
                borderTop: "1px solid var(--color-line)",
                borderBottom: "1px solid var(--color-line)",
                marginBottom: 36,
                maxWidth: "400px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <span
                  ref={stat1Ref}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(32px, 4vw, 52px)",
                    fontWeight: 300,
                    lineHeight: 1,
                    color: "var(--color-gold-500)",
                    display: "block",
                    marginBottom: 6,
                    whiteSpace: "nowrap",
                  }}
                >
                  2+
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--color-ink)",
                    opacity: 0.6,
                    whiteSpace: "nowrap",
                  }}
                >
                  Editions Delivered
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <span
                  ref={stat2Ref}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(32px, 4vw, 52px)",
                    fontWeight: 300,
                    lineHeight: 1,
                    color: "var(--color-gold-500)",
                    display: "block",
                    marginBottom: 6,
                    whiteSpace: "nowrap",
                  }}
                >
                  700+
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--color-ink)",
                    opacity: 0.6,
                    whiteSpace: "nowrap",
                  }}
                >
                  Total Attendees
                </span>
              </div>
            </div>

            {/* Quick Action Contact Links */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              <a
                href="https://wa.me/918888822040"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Connect with Manthan on WhatsApp"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--color-bg)",
                  backgroundColor: "var(--color-gold-500)",
                  padding: "14px 28px",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  borderRadius: "1px",
                  fontWeight: 500,
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-gold-300)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-gold-500)";
                }}
              >
                <span>WhatsApp</span>
                <span aria-hidden="true">↗</span>
              </a>

              <a
                href="https://www.instagram.com/thevmexperience?igsh=ZTF5d3BvanFiN2c5"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow TheVMEx on Instagram"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--color-gold-500)",
                  border: "1px solid var(--color-gold-500)",
                  backgroundColor: "rgba(20, 20, 24, 0.4)",
                  padding: "14px 28px",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  borderRadius: "1px",
                  fontWeight: 500,
                  transition: "border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--color-gold-300)";
                  e.currentTarget.style.borderColor = "var(--color-gold-300)";
                  e.currentTarget.style.backgroundColor = "rgba(201, 164, 92, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--color-gold-500)";
                  e.currentTarget.style.borderColor = "var(--color-gold-500)";
                  e.currentTarget.style.backgroundColor = "rgba(20, 20, 24, 0.4)";
                }}
              >
                <span>@thevmexperience</span>
                <span aria-hidden="true">↗</span>
              </a>

              <a
                href="mailto:khairemanthan@gmail.com"
                aria-label="Email Manthan Manohar Khaire"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.14em",
                  color: "var(--color-ink)",
                  opacity: 0.6,
                  textDecoration: "none",
                  padding: "14px 16px",
                  transition: "opacity 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0.6";
                }}
              >
                khairemanthan@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
