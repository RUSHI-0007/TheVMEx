"use client";

/**
 * LenisProvider — initialises Lenis smooth scroll and wires it to the
 * single GSAP ticker so Lenis, ScrollTrigger and the WebGL canvas all
 * advance from one clock. No competing rAF loops.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { LENIS_CONFIG } from "@/lib/motion-tokens";
import { useAppStore } from "@/lib/store";

const LenisContext = createContext<Lenis | null>(null);

export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const setScrollVelocity = useAppStore((s) => s.setScrollVelocity);

  useEffect(() => {
    const lenis = new Lenis(LENIS_CONFIG);
    lenisRef.current = lenis;

    // Bridge Lenis scroll events to ScrollTrigger
    lenis.on("scroll", (e: { velocity: number }) => {
      ScrollTrigger.update();
      setScrollVelocity(e.velocity);
    });

    // Single GSAP ticker drives Lenis — no rAF loop
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [setScrollVelocity]);

  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  );
}

/** Returns the Lenis instance. Must be called inside LenisProvider. */
export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

