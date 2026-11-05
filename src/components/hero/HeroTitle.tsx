"use client";

/**
 * HeroTitle — Typography and CTA choreography for Act 0.
 *
 * Features:
 * - SplitText character reveal with masked rise and 3D tilt.
 * - Fluid display typography with Cormorant Garamond.
 * - Scroll-linked upward drift, subtle scale expansion, and fade out.
 * - Magnetic hover on primary and secondary buttons (desktop).
 * - Automatic SplitText revert/re-split on resize and document.fonts.ready.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { gsap, SplitText } from "@/lib/gsap";
import { useAppStore } from "@/lib/store";
import { EASE } from "@/lib/motion-tokens";

export interface HeroTitleHandle {
  setProgress: (progress: number) => void;
}

export const HeroTitle = forwardRef<HeroTitleHandle>(function HeroTitle(_, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaGroupRef = useRef<HTMLDivElement>(null);

  const btnPrimaryRef = useRef<HTMLAnchorElement>(null);
  const btnSecondaryRef = useRef<HTMLAnchorElement>(null);

  const splitInstanceRef = useRef<SplitText | null>(null);
  const hasAnimatedInRef = useRef<boolean>(false);

  const isPreloaded = useAppStore((s) => s.isPreloaded);

  // Expose scroll progress handler to parent
  useImperativeHandle(ref, () => ({
    setProgress: (progress: number) => {
      // progress: 0.0 (fully visible) -> 1.0 (fully faded and drifted away)
      const p = Math.max(0, Math.min(1, progress));
      if (!containerRef.current) return;

      const yOffset = -70 * p;
      const scale = 1 + 0.05 * p;
      const opacity = Math.max(0, 1 - p * 1.25);

      containerRef.current.style.transform = `translate3d(0, ${yOffset}px, 0) scale(${scale})`;
      containerRef.current.style.opacity = String(opacity);
      containerRef.current.style.pointerEvents = p > 0.1 ? "none" : "auto";
    },
  }));

  // Character entrance animation
  const playEntranceAnimation = useCallback(() => {
    if (hasAnimatedInRef.current || !titleRef.current) return;
    hasAnimatedInRef.current = true;

    // Clean up previous split if any
    if (splitInstanceRef.current) {
      splitInstanceRef.current.revert();
    }

    // Split text into characters
    gsap.set(titleRef.current, { opacity: 1 });
    const split = new SplitText(titleRef.current, {
      type: "chars,words",
      charsClass: "vm-char",
    });
    splitInstanceRef.current = split;

    // Set initial 3D perspective and clip styling on chars
    gsap.set(split.chars, {
      yPercent: 115,
      opacity: 0,
      rotateX: 25,
      transformOrigin: "50% 100%",
    });

    const tl = gsap.timeline({ delay: 0.1 });

    // 1. Badge entrance
    tl.fromTo(
      badgeRef.current,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: EASE.vm }
    );

    // 2. Chars cascade reveal
    tl.to(
      split.chars,
      {
        yPercent: 0,
        opacity: 1,
        rotateX: 0,
        duration: 1.1,
        ease: EASE.vm,
        stagger: 0.018,
      },
      "-=0.55"
    );

    // 3. Subtitle & CTAs fade up
    tl.fromTo(
      subtitleRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 0.75, duration: 0.85, ease: EASE.vm },
      "-=0.6"
    );

    tl.fromTo(
      ctaGroupRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.85, ease: EASE.vm },
      "-=0.6"
    );
  }, []);

  // Listen for preloader completion or immediate start if already loaded
  useEffect(() => {
    if (isPreloaded || useAppStore.getState().isPreloaded) {
      playEntranceAnimation();
    }
  }, [isPreloaded, playEntranceAnimation]);

  // Handle font ready & resize re-splitting
  useEffect(() => {
    const handleReSplit = () => {
      if (document.fonts) {
        document.fonts.ready.then(() => {
          if (hasAnimatedInRef.current && titleRef.current) {
            splitInstanceRef.current?.revert();
            const newSplit = new SplitText(titleRef.current, {
              type: "chars,words",
              charsClass: "vm-char",
            });
            splitInstanceRef.current = newSplit;
            gsap.set(titleRef.current, { opacity: 1 });
            gsap.set(newSplit.chars, { yPercent: 0, opacity: 1, rotateX: 0 });
          }
        });
      }
    };

    window.addEventListener("resize", handleReSplit);
    return () => {
      window.removeEventListener("resize", handleReSplit);
      splitInstanceRef.current?.revert();
    };
  }, []);

  // Magnetic button hover effect for desktop
  useEffect(() => {
    const setupMagnetic = (btn: HTMLElement | null) => {
      if (!btn || window.matchMedia("(hover: none)").matches) return () => {};

      const onMouseMove = (e: MouseEvent) => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = (e.clientX - centerX) * 0.35;
        const dy = (e.clientY - centerY) * 0.35;

        gsap.to(btn, {
          x: dx,
          y: dy,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      const onMouseLeave = () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.4)",
          overwrite: "auto",
        });
      };

      btn.addEventListener("mousemove", onMouseMove);
      btn.addEventListener("mouseleave", onMouseLeave);

      return () => {
        btn.removeEventListener("mousemove", onMouseMove);
        btn.removeEventListener("mouseleave", onMouseLeave);
      };
    };

    const cleanup1 = setupMagnetic(btnPrimaryRef.current);
    const cleanup2 = setupMagnetic(btnSecondaryRef.current);

    return () => {
      cleanup1();
      cleanup2();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        zIndex: 10,
        textAlign: "center",
        padding: "0 24px",
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transformOrigin: "center center",
        willChange: "transform, opacity",
      }}
    >
      {/* Category / Welcome badge */}
      <p
        ref={badgeRef}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(11px, 1.2vw, 13px)",
          letterSpacing: "0.26em",
          textTransform: "uppercase",
          color: "var(--color-gold-500)",
          marginBottom: "clamp(14px, 2.5vh, 24px)",
          opacity: 0,
        }}
      >
        Welcome to
      </p>

      {/* Main Brand Title */}
      <h1
        ref={titleRef}
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 300,
          fontSize: "clamp(44px, 12vw, 160px)",
          lineHeight: 0.94,
          letterSpacing: "-0.02em",
          color: "var(--color-ink)",
          margin: 0,
          marginBottom: "clamp(18px, 3vh, 32px)",
          textTransform: "uppercase",
          perspective: 1000,
        }}
      >
        THE VM<br />EXPERIENCE
      </h1>

      {/* Subtitle / Promise */}
      <p
        ref={subtitleRef}
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(14px, 1.4vw, 19px)",
          color: "var(--color-ink)",
          letterSpacing: "0.04em",
          maxWidth: "560px",
          margin: "0 auto",
          marginBottom: "clamp(32px, 5vh, 48px)",
          opacity: 0,
          lineHeight: 1.5,
        }}
      >
        We Create Nights You Remember.
      </p>

      {/* Action Buttons */}
      <div
        ref={ctaGroupRef}
        style={{
          display: "flex",
          gap: "18px",
          justifyContent: "center",
          flexWrap: "wrap",
          opacity: 0,
        }}
      >
        <a
          ref={btnPrimaryRef}
          href="#nights"
          aria-label="See our events"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--color-bg)",
            backgroundColor: "var(--color-gold-500)",
            padding: "16px 36px",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 44,
            minHeight: 44,
            borderRadius: "1px",
            fontWeight: 500,
            boxShadow: "0 4px 24px rgba(201, 164, 92, 0.2)",
            transition: "background-color 0.25s ease, transform 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-gold-300)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-gold-500)";
          }}
        >
          See Our Events
        </a>

        <a
          ref={btnSecondaryRef}
          href="#invitation"
          aria-label="Book an event with TheVMEx"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--color-gold-500)",
            border: "1px solid var(--color-gold-500)",
            backgroundColor: "rgba(11, 11, 13, 0.4)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            padding: "16px 36px",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 44,
            minHeight: 44,
            borderRadius: "1px",
            fontWeight: 500,
            transition: "border-color 0.25s ease, background-color 0.25s ease, color 0.25s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(201, 164, 92, 0.15)";
            e.currentTarget.style.color = "var(--color-gold-300)";
            e.currentTarget.style.borderColor = "var(--color-gold-300)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(11, 11, 13, 0.4)";
            e.currentTarget.style.color = "var(--color-gold-500)";
            e.currentTarget.style.borderColor = "var(--color-gold-500)";
          }}
        >
          Book an Event
        </a>
      </div>
    </div>
  );
});
