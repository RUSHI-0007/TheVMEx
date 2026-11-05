"use client";

/**
 * ActHero — ACT 0: The Hero.
 *
 * Signature Moments:
 * 1. Full-bleed hero video scrubbed frame-by-frame via ScrollTrigger with
 *    coarse-to-fine loading and sliding-window ImageBitmap decoding.
 * 2. Cormorant Garamond display typography with SplitText char reveal
 *    and scroll-linked drift/fade.
 * 3. Editorial VMX Monogram handoff that blooms into Act I
 *    with glowing liquid-gold edge.
 */

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { FrameCanvas, type FrameCanvasHandle } from "@/components/hero/FrameCanvas";
import { HeroTitle, type HeroTitleHandle } from "@/components/hero/HeroTitle";
import { VmxMonogram, type VmxMonogramHandle } from "@/components/hero/VmxMonogram";
import { PIN_DESKTOP_VH, PIN_MOBILE_VH } from "@/lib/motion-tokens";

export function ActHero() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);

  const frameCanvasRef = useRef<FrameCanvasHandle>(null);
  const heroTitleRef = useRef<HeroTitleHandle>(null);
  const vmxMonogramRef = useRef<VmxMonogramHandle>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const pinned = pinnedRef.current;
    if (!wrapper || !pinned) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // Reduced motion: static display without scroll scrub
      frameCanvasRef.current?.drawImmediate();
      return;
    }

    const isMobile = window.innerWidth <= 768;
    const scrollDistance = isMobile
      ? (window.innerHeight * PIN_MOBILE_VH) / 100
      : (window.innerHeight * PIN_DESKTOP_VH) / 100;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrapper,
        pin: pinned,
        start: "top top",
        end: `+=${scrollDistance}`,
        scrub: 0.4,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;

          // 1. Video frame scrub (0.00 -> 0.75)
          const frameProgress = Math.min(1, p / 0.75);
          frameCanvasRef.current?.setProgress(frameProgress);

          // 2. Title drift & fade out (0.00 -> 0.35)
          const titleProgress = Math.min(1, p / 0.35);
          heroTitleRef.current?.setProgress(titleProgress);

          // 3. VMX Monogram handoff (0.65 -> 1.00)
          const monogramProgress = Math.max(0, (p - 0.65) / 0.35);
          vmxMonogramRef.current?.setProgress(monogramProgress);

          // 4. Scroll cue fade out (0.00 -> 0.15)
          if (scrollCueRef.current) {
            scrollCueRef.current.style.opacity = String(Math.max(0, 0.65 - p * 4.5));
          }
        },
      });
    }, wrapper);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={wrapperRef}
      id="hero"
      aria-label="Hero — The VM Experience"
      style={{
        position: "relative",
        width: "100%",
        backgroundColor: "transparent",
      }}
    >
      {/* Skip-to-content anchor */}
      <a
        href="#manifesto"
        tabIndex={-1}
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        Skip hero
      </a>

      {/* Pinned 100svh viewport */}
      <div
        ref={pinnedRef}
        style={{
          position: "relative",
          width: "100%",
          height: "100svh",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Layer 1: Frame Canvas (scrubbed video + scrim + vignette) */}
        <FrameCanvas ref={frameCanvasRef} />

        {/* Layer 2: Editorial VMX Monogram handoff into Act I */}
        <VmxMonogram ref={vmxMonogramRef} />

        {/* Layer 3: Typography and CTAs */}
        <HeroTitle ref={heroTitleRef} />

        {/* Layer 4: Floating Scroll Cue */}
        <div
          ref={scrollCueRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "clamp(16px, 2.5vh, 28px)",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            zIndex: 12,
            pointerEvents: "none",
            transition: "opacity 0.25s ease",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: "var(--color-ink)",
              opacity: 0.65,
            }}
          >
            Scroll
          </span>
          <div
            style={{
              width: "1px",
              height: "28px",
              backgroundColor: "rgba(242, 237, 228, 0.2)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              className="vm-scroll-indicator-pulse"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "40%",
                backgroundColor: "var(--color-gold-500)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
