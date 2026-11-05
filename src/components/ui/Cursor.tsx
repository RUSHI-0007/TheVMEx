"use client";

/**
 * Cursor — custom dot + lagging ring cursor.
 *
 * States: default | link | drag | view | play
 * - Dot follows pointer with no lag
 * - Ring follows with ~0.15s inertia (gsap.quickTo)
 * - Hidden on touch devices
 * - mix-blend-difference over media elements
 * - Respects prefers-reduced-motion (hidden entirely)
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useAppStore, type CursorState } from "@/lib/store";

const RING_SIZE: Record<CursorState, number> = {
  default: 32,
  link: 48,
  drag: 56,
  view: 64,
  play: 56,
};

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const cursorState = useAppStore((s) => s.cursorState);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Hide on touch-primary devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    // Respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Show cursors
    dot.style.opacity = "1";
    ring.style.opacity = "1";
    document.body.style.cursor = "none";

    // QuickTo functions for performant x/y animation
    const dotX = gsap.quickTo(dot, "x", { duration: 0.05, ease: "none" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.05, ease: "none" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.15, ease: "power2.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.15, ease: "power2.out" });

    const onMove = (e: MouseEvent) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.body.style.cursor = "";
    };
  }, []);

  // Animate ring size on state change
  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    const size = RING_SIZE[cursorState];
    gsap.to(ring, {
      width: size,
      height: size,
      duration: 0.35,
      ease: "power2.out",
    });
  }, [cursorState]);

  return (
    <>
      {/* Dot — no lag */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: "var(--color-ink)",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 9999,
          opacity: 0,
          mixBlendMode: "difference",
        }}
      />
      {/* Ring — lagging */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: RING_SIZE.default,
          height: RING_SIZE.default,
          borderRadius: "50%",
          border: "1px solid var(--color-ink)",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 9998,
          opacity: 0,
          mixBlendMode: "difference",
        }}
      />
    </>
  );
}

