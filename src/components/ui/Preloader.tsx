"use client";

/**
 * Preloader — Luxury curtain preloader for TheVMEx.
 *
 * Tracks:
 * 1. Frame 1 + Stride-8 frames loaded and decoded.
 * 2. Document fonts ready (Cormorant Garamond, Inter, Space Mono).
 * 3. 2.2s safety fallback so visitor is never blocked.
 *
 * Entrance/Exit:
 * Once 100% reached, curtain slides up with CustomEase "vm" and unblocks
 * the hero title staggered entrance.
 */

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useAppStore } from "@/lib/store";
import { EASE } from "@/lib/motion-tokens";

export function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const [isDismissed, setIsDismissed] = useState(false);
  const setPreloaded = useAppStore((s) => s.setPreloaded);

  useEffect(() => {
    let currentPct = 0;
    let targetPct = 0;
    let animFrame: number;
    let isExiting = false;

    // Listen to global store loadedPct
    const unsubscribe = useAppStore.subscribe((state) => {
      targetPct = Math.max(targetPct, state.loadedPct);
    });

    // Safety timeout — ensure we exit after 2.2s even on slow connections
    const safetyTimer = setTimeout(() => {
      targetPct = 100;
    }, 2200);

    // Also check fonts ready
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        targetPct = Math.max(targetPct, 40);
      });
    }

    const updateCounter = () => {
      if (currentPct < targetPct) {
        // Smoothly interpolate towards target
        currentPct += Math.max(1, (targetPct - currentPct) * 0.15);
        if (currentPct >= 99.5) currentPct = 100;

        const rounded = Math.round(currentPct);
        if (numberRef.current) {
          numberRef.current.textContent = `${String(rounded).padStart(2, "0")}%`;
        }
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${currentPct / 100})`;
        }
      }

      if (currentPct >= 100 && !isExiting) {
        isExiting = true;
        // Hold for a brief beat, then slide up the curtain
        gsap.timeline({
          delay: 0.1,
          onComplete: () => {
            setIsDismissed(true);
          },
        })
          .to([numberRef.current, titleRef.current, barRef.current?.parentElement], {
            opacity: 0,
            y: -20,
            duration: 0.35,
            ease: "power2.in",
            stagger: 0.04,
          })
          .to(
            containerRef.current,
            {
              yPercent: -100,
              duration: 0.85,
              ease: EASE.vm,
              onStart: () => {
                setPreloaded(true);
              },
            },
            "-=0.15"
          );
      }

      if (!isDismissed) {
        animFrame = requestAnimationFrame(updateCounter);
      }
    };

    animFrame = requestAnimationFrame(updateCounter);

    return () => {
      unsubscribe();
      clearTimeout(safetyTimer);
      cancelAnimationFrame(animFrame);
    };
  }, [setPreloaded, isDismissed]);

  if (isDismissed) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "var(--color-bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        pointerEvents: "auto",
      }}
    >
      {/* Brand monogram / subtitle */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "var(--color-gold-500)",
            marginBottom: 12,
            opacity: 0.85,
          }}
        >
          Edition II · Pune
        </p>
        <h2
          ref={titleRef}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontSize: "clamp(24px, 4vw, 42px)",
            letterSpacing: "0.08em",
            color: "var(--color-ink)",
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          The VM Experience
        </h2>
      </div>

      {/* Numerical percentage counter */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <span
          ref={numberRef}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            letterSpacing: "0.18em",
            color: "var(--color-ink)",
            opacity: 0.75,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          00%
        </span>

        {/* Hairline progress bar */}
        <div
          style={{
            width: "clamp(120px, 18vw, 220px)",
            height: "1px",
            backgroundColor: "rgba(242, 237, 228, 0.12)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            ref={barRef}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "var(--color-gold-500)",
              transformOrigin: "left center",
              transform: "scaleX(0)",
              transition: "transform 0.05s linear",
            }}
          />
        </div>
      </div>
    </div>
  );
}
