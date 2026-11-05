"use client";

/**
 * MaskIris — The Signature Masquerade Mask Iris Wipe.
 *
 * Towards the end of the hero scrub (progress 0.65 -> 1.0):
 * A sculpted Venetian masquerade mask silhouette iris (with almond eyeholes,
 * pointed cheek wings, and glowing liquid-gold perimeter) emerges and expands
 * exponentially from the center, wiping the hero video into Act I (Manifesto).
 */

import {
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";

export interface MaskIrisHandle {
  setProgress: (progress: number) => void;
}

// Venetian mask path geometry (viewBox: -300 -150 600 300)
// Outer wing contours + two almond eyeholes
const MASK_OUTER_PATH =
  "M 0,-15 C 25,-48 80,-80 155,-80 C 205,-80 250,-60 270,-20 C 275,15 235,60 180,75 C 125,90 65,68 28,30 C 14,16 6,14 0,16 C -6,14 -14,16 -28,30 C -65,68 -125,90 -180,75 C -235,60 -275,15 -270,-20 C -250,-60 -205,-80 -155,-80 C -80,-80 -25,-48 0,-15 Z";

const LEFT_EYE_PATH =
  "M -145,-5 C -122,-30 -68,-30 -48,-5 C -68,20 -122,20 -145,-5 Z";

const RIGHT_EYE_PATH =
  "M 48,-5 C 68,-30 122,-30 145,-5 C 122,20 68,20 48,-5 Z";

export const MaskIris = forwardRef<MaskIrisHandle>(function MaskIris(_, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const maskGroupRef = useRef<SVGGElement>(null);
  const glowOutlineRef = useRef<SVGPathElement>(null);

  useImperativeHandle(ref, () => ({
    setProgress: (progress: number) => {
      // progress: 0.0 (idle/invisible) -> 1.0 (fully expanded past viewport)
      const p = Math.max(0, Math.min(1, progress));
      if (!containerRef.current) return;

      if (p <= 0.001) {
        containerRef.current.style.opacity = "0";
        containerRef.current.style.pointerEvents = "none";
        return;
      }

      containerRef.current.style.pointerEvents = "none";

      // Exponential scale expansion curve
      // scale from ~0.2 to ~32.0 so it completely clears a 4K viewport
      const scale = 0.2 + Math.pow(p, 2.8) * 32;
      const opacity = Math.min(1, p * 3.5);

      if (maskGroupRef.current) {
        maskGroupRef.current.style.transform = `scale(${scale})`;
      }

      // Contour glow intensity peaks around p = 0.5 - 0.8
      const glowOpacity = Math.sin(p * Math.PI) * 0.95;
      if (glowOutlineRef.current) {
        glowOutlineRef.current.style.opacity = String(glowOpacity);
      }

      containerRef.current.style.opacity = String(opacity);
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
        overflow: "hidden",
        pointerEvents: "none",
        opacity: 0,
        willChange: "opacity",
      }}
    >
      <svg
        viewBox="-300 -150 600 300"
        style={{
          width: "100%",
          height: "100%",
          overflow: "visible",
        }}
      >
        <defs>
          {/* Glowing liquid-gold filter for the mask perimeter */}
          <filter id="gold-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur1" />
            <feGaussianBlur stdDeviation="16" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g
          ref={maskGroupRef}
          style={{
            transformOrigin: "0 0",
            transform: "scale(0.2)",
            transition: "transform 0.05s linear",
            willChange: "transform",
          }}
        >
          {/* Solid smoke backdrop with mask aperture cut out */}
          <path
            d={`M -2000,-2000 L 2000,-2000 L 2000,2000 L -2000,2000 Z ${MASK_OUTER_PATH} ${LEFT_EYE_PATH} ${RIGHT_EYE_PATH}`}
            fill="var(--color-bg)"
            fillRule="evenodd"
          />

          {/* Liquid gold glowing contour outlining the mask edge */}
          <path
            ref={glowOutlineRef}
            d={MASK_OUTER_PATH}
            fill="none"
            stroke="var(--color-gold-500)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#gold-glow)"
            style={{ opacity: 0 }}
          />

          {/* Golden eyes contour */}
          <path
            d={`${LEFT_EYE_PATH} ${RIGHT_EYE_PATH}`}
            fill="none"
            stroke="var(--color-gold-300)"
            strokeWidth="2"
            opacity="0.75"
          />
        </g>
      </svg>
    </div>
  );
});
