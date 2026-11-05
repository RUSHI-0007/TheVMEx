"use client";

/**
 * ActMoments — ACT IV: The gallery.
 * Full masonry + drag + lightbox in Phase 6.
 * Features:
 * - Alternating cinematic headline reveal via GSAP ScrollTrigger.
 * - Filter bar placeholder with smooth tab styling.
 */

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { EASE } from "@/lib/motion-tokens";

export function ActMoments() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { x: -40, opacity: 0 },
          {
            x: 0,
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

      if (filterRef.current) {
        gsap.fromTo(
          filterRef.current,
          { x: 30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.0,
            ease: EASE.vm,
            scrollTrigger: {
              trigger: filterRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="moments"
      aria-label="Gallery — Masquerade Night '26 | Kiki Event '25"
      style={{
        position: "relative",
        minHeight: "100svh",
        padding: "clamp(80px, 12vh, 160px) clamp(20px, 8vw, 120px)",
        backgroundColor: "var(--color-bg)",
        zIndex: 5,
      }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto", width: "100%" }}>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--color-gold-500)",
            marginBottom: "clamp(12px, 2vh, 20px)",
          }}
        >
          Act IV — Moments
        </p>

        <h2
          ref={headingRef}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontSize: "clamp(36px, 6vw, 80px)",
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            color: "var(--color-ink)",
            marginBottom: "clamp(48px, 8vh, 80px)",
          }}
        >
          Masquerade Night ’26<br />
          <span style={{ opacity: 0.5 }}>Kiki Event ’25</span>
        </h2>

        {/* Filter bar placeholder */}
        <div
          ref={filterRef}
          role="tablist"
          aria-label="Gallery filter"
          style={{
            display: "flex",
            gap: 24,
            marginBottom: "clamp(32px, 5vh, 56px)",
          }}
        >
          {["All", "Photos", "Videos"].map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={f === "All"}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: f === "All" ? "var(--color-gold-500)" : "var(--color-ink)",
                background: "none",
                border: "none",
                padding: "8px 0",
                cursor: "pointer",
                opacity: f === "All" ? 1 : 0.4,
                borderBottom: f === "All" ? "1px solid var(--color-gold-500)" : "1px solid transparent",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Gallery grid placeholder */}
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--color-ink)",
            opacity: 0.3,
          }}
        >
          [Gallery — full masonry + lightbox in Phase 6]
        </p>
      </div>
    </section>
  );
}
