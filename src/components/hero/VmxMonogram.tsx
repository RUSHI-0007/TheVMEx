"use client";

/**
 * VmxMonogram — Cinematic brand handoff between Act 0 (Hero) and Act I (Manifesto).
 *
 * Replaces the mask silhouette with a clean, ultra-luxury editorial "VMX" monogram:
 * Cormorant Garamond display serif, hairline gold accents, and a smooth smoke dissolve.
 */

import { forwardRef, useImperativeHandle, useRef } from "react";

export interface VmxMonogramHandle {
  setProgress: (progress: number) => void;
}

export const VmxMonogram = forwardRef<VmxMonogramHandle>(function VmxMonogram(_, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const smokeOverlayRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    setProgress: (progress: number) => {
      // progress: 0.0 (idle) -> 1.0 (unpin into Act I)
      const p = Math.max(0, Math.min(1, progress));
      if (!containerRef.current) return;

      if (p <= 0.01) {
        containerRef.current.style.opacity = "0";
        containerRef.current.style.pointerEvents = "none";
        return;
      }

      containerRef.current.style.pointerEvents = "none";
      containerRef.current.style.opacity = "1";

      // 1. Dark smoke backdrop fade in over the video
      if (smokeOverlayRef.current) {
        smokeOverlayRef.current.style.opacity = String(Math.min(1, p * 1.8));
      }

      // 2. VMX Monogram peaks around p = 0.4 - 0.75, then fades out as Act I enters
      let monogramOpacity = 0;
      if (p < 0.5) {
        monogramOpacity = Math.max(0, (p - 0.1) / 0.4);
      } else {
        monogramOpacity = Math.max(0, 1 - (p - 0.5) / 0.45);
      }

      const scale = 0.95 + p * 0.12;
      const yOffset = -30 * p;

      if (textRef.current) {
        textRef.current.style.opacity = String(monogramOpacity);
        textRef.current.style.transform = `translate3d(0, ${yOffset}px, 0) scale(${scale})`;
      }
    },
  }));

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        opacity: 0,
      }}
    >
      {/* Dark smoke overlay that smoothly covers the scrubbed video */}
      <div
        ref={smokeOverlayRef}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "var(--color-bg)",
          opacity: 0,
          transition: "opacity 0.05s linear",
        }}
      />

      {/* Luxury VMX Monogram */}
      <div
        ref={textRef}
        style={{
          position: "relative",
          zIndex: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          opacity: 0,
          willChange: "transform, opacity",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--color-gold-500)",
            opacity: 0.85,
          }}
        >
          Edition II
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: "clamp(30px, 5vw, 60px)",
              height: "1px",
              backgroundColor: "var(--color-gold-500)",
              opacity: 0.4,
            }}
          />
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontStyle: "italic",
              fontSize: "clamp(64px, 14vw, 160px)",
              letterSpacing: "0.15em",
              color: "var(--color-ink)",
              margin: 0,
              lineHeight: 1,
              textShadow: "0 0 40px rgba(201, 164, 92, 0.25)",
            }}
          >
            VMX
          </h2>
          <div
            style={{
              width: "clamp(30px, 5vw, 60px)",
              height: "1px",
              backgroundColor: "var(--color-gold-500)",
              opacity: 0.4,
            }}
          />
        </div>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--color-ink)",
            opacity: 0.5,
          }}
        >
          The Experience Begins
        </p>
      </div>
    </div>
  );
});
