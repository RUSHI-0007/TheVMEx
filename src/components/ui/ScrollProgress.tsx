"use client";

/**
 * ScrollProgress — hairline gold bar at the top of the viewport.
 * scaleX is driven by scroll progress (0 → 1).
 * transform-origin: left so it grows from left to right.
 */

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar || typeof window === "undefined") return;

    // Scrubbed scale — no layout recalc, only transform
    const st = ScrollTrigger.create({
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        gsap.set(bar, { scaleX: self.progress });
      },
    });

    return () => st.kill();
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        zIndex: 9000,
        transformOrigin: "left center",
        pointerEvents: "none",
        backgroundColor: "var(--color-gold-500)",
        transform: "scaleX(0)",
      }}
      ref={barRef}
    />
  );
}
