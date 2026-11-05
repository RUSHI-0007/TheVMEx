"use client";

/**
 * ActManifesto — ACT I: "Where Mystery Meets Elegance"
 *
 * Features:
 * - Line-masked title reveal via GSAP ScrollTrigger.
 * - Word-by-word scroll fill on the core manifesto paragraph.
 * - Luxury glassmorphism Dress Code card with gold accents.
 * - Editorial serif pull-quote ("The night is young...").
 * - Background color tween from #0B0B0D to #141418 (smoke).
 * - Oversized Roman numeral "I" in background.
 */

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { EASE } from "@/lib/motion-tokens";

const MANIFESTO_TEXT =
  "Masquerade Night is an invitation to disappear into another world. Behind every mask is a story. Curated live performances, atmosphere draped in gold and shadow.";

// Words to highlight in gold when illuminated
const GOLD_HIGHLIGHT_WORDS = new Set([
  "invitation",
  "disappear",
  "another",
  "world.",
  "mask",
  "story.",
  "gold",
  "shadow.",
]);

export function ActManifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const dressCodeCardRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const numeralRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // 1. Background color tween into #141418 (smoke)
      const bgLayer =
        (window as Window & { __vmBgLayer?: HTMLElement }).__vmBgLayer ||
        document.querySelector<HTMLElement>(".vm-bg-layer");

      if (bgLayer) {
        ScrollTrigger.create({
          trigger: section,
          start: "top 80%",
          end: "top 20%",
          scrub: true,
          onUpdate: (self) => {
            // Interpolate from #0B0B0D (rgb 11,11,13) to #141418 (rgb 20,20,24)
            const p = self.progress;
            const r = Math.round(11 + (20 - 11) * p);
            const g = Math.round(11 + (20 - 11) * p);
            const b = Math.round(13 + (24 - 13) * p);
            bgLayer.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
          },
        });
      }

      // 2. Heading line-mask reveal
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: EASE.vm,
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // 3. Word-by-word scroll fill
      if (paragraphRef.current) {
        const words = paragraphRef.current.querySelectorAll<HTMLSpanElement>(".vm-word");
        gsap.fromTo(
          words,
          { opacity: 0.2, y: 0 },
          {
            opacity: 1,
            stagger: 0.05,
            ease: "none",
            scrollTrigger: {
              trigger: paragraphRef.current,
              start: "top 78%",
              end: "bottom 45%",
              scrub: 0.5,
            },
          }
        );
      }

      // 4. Dress Code card slide & fade up
      if (dressCodeCardRef.current) {
        gsap.fromTo(
          dressCodeCardRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.0,
            ease: EASE.vm,
            scrollTrigger: {
              trigger: dressCodeCardRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // 5. Pull quote entrance
      if (quoteRef.current) {
        gsap.fromTo(
          quoteRef.current,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: EASE.vm,
            scrollTrigger: {
              trigger: quoteRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // 6. Subtle parallax on background numeral
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

  const words = MANIFESTO_TEXT.split(" ");

  return (
    <section
      ref={sectionRef}
      id="manifesto"
      aria-label="Act I: The Manifesto"
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
      {/* Oversized background Roman Numeral I */}
      <div
        ref={numeralRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "10%",
          right: "5%",
          fontFamily: "var(--font-display)",
          fontSize: "clamp(240px, 38vw, 560px)",
          lineHeight: 0.8,
          color: "var(--color-ink)",
          opacity: 0.025,
          userSelect: "none",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        I
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100 }}>
        {/* Act metadata */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "clamp(20px, 3vh, 36px)" }}>
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
            Act I · The Manifesto
          </p>
          <div style={{ width: 40, height: 1, backgroundColor: "var(--color-line)" }} />
        </div>

        {/* Headline */}
        <h2
          ref={headingRef}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontStyle: "italic",
            fontSize: "clamp(42px, 7.5vw, 106px)",
            lineHeight: 1.02,
            letterSpacing: "-0.015em",
            color: "var(--color-ink)",
            maxWidth: "16ch",
            marginBottom: "clamp(36px, 6vh, 68px)",
          }}
        >
          Where Mystery Meets Elegance
        </h2>

        {/* Word-by-word scroll fill paragraph */}
        <p
          ref={paragraphRef}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(20px, 2.5vw, 36px)",
            lineHeight: 1.45,
            letterSpacing: "-0.01em",
            maxWidth: "34ch",
            marginBottom: "clamp(56px, 8vh, 88px)",
          }}
        >
          {words.map((word, i) => {
            const isGold = GOLD_HIGHLIGHT_WORDS.has(word);
            return (
              <span
                key={i}
                className="vm-word"
                style={{
                  display: "inline-block",
                  marginRight: "0.28em",
                  color: isGold ? "var(--color-gold-300)" : "var(--color-ink)",
                  opacity: 0.2,
                  transition: "color 0.3s ease",
                  willChange: "opacity",
                }}
              >
                {word}
              </span>
            );
          })}
        </p>

        {/* Two-column layout for Dress Code and Brand Statement */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "clamp(32px, 5vw, 64px)",
            alignItems: "start",
            marginBottom: "clamp(56px, 8vh, 88px)",
          }}
        >
          {/* Dress Code Card */}
          <div
            ref={dressCodeCardRef}
            style={{
              backgroundColor: "rgba(20, 20, 24, 0.4)",
              border: "1px solid var(--color-line)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              padding: "clamp(28px, 4vw, 40px)",
              position: "relative",
            }}
          >
            {/* Top gold accent line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 48,
                height: 2,
                backgroundColor: "var(--color-gold-500)",
              }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: "var(--color-gold-500)",
                }}
              >
                Dress Code
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--color-gold-300)",
                  backgroundColor: "rgba(201, 164, 92, 0.12)",
                  padding: "4px 8px",
                  borderRadius: "2px",
                }}
              >
                Priority Entry
              </span>
            </div>

            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(15px, 1.3vw, 17px)",
                lineHeight: 1.6,
                color: "var(--color-ink)",
                opacity: 0.9,
                margin: 0,
                marginBottom: 16,
              }}
            >
              <strong>Formal / Semi-Formal</strong> — masks encouraged.
            </p>

            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                lineHeight: 1.6,
                color: "var(--color-ink)",
                opacity: 0.65,
                margin: 0,
              }}
            >
              Masked guests receive priority entry and a special surprise upon arrival.
            </p>
          </div>

          {/* Brand Philosophy Pillar */}
          <div style={{ paddingTop: 8 }}>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "var(--color-gold-500)",
                marginBottom: 16,
              }}
            >
              Our Philosophy
            </p>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                fontSize: "clamp(26px, 3.2vw, 42px)",
                lineHeight: 1.2,
                color: "var(--color-ink)",
                margin: 0,
                marginBottom: 16,
              }}
            >
              We Create Nights You Remember
            </h3>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(14px, 1.2vw, 16px)",
                lineHeight: 1.7,
                color: "var(--color-ink)",
                opacity: 0.65,
                margin: 0,
              }}
            >
              Every event should feel premium, not just planned. We weave sound, light, and
              atmosphere into an evening you carry long after the music stops.
            </p>
          </div>
        </div>

        {/* Editorial Pull-Quote */}
        <div
          ref={quoteRef}
          style={{
            position: "relative",
            borderLeft: "2px solid var(--color-gold-500)",
            paddingLeft: "clamp(24px, 4vw, 48px)",
            marginTop: "clamp(24px, 4vh, 48px)",
          }}
        >
          <blockquote
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontStyle: "italic",
              fontSize: "clamp(22px, 2.6vw, 36px)",
              lineHeight: 1.35,
              color: "var(--color-ink)",
              margin: 0,
              marginBottom: 16,
            }}
          >
            &ldquo;The night is young, the masks are on, and the music never stops. Welcome to
            Masquerade Night.&rdquo;
          </blockquote>
          <cite
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontStyle: "normal",
              color: "var(--color-gold-500)",
            }}
          >
            — TheVMEx
          </cite>
        </div>
      </div>
    </section>
  );
}
