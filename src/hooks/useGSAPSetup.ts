"use client";

/**
 * useGSAPSetup — registers GSAP plugins and applies global ScrollTrigger defaults.
 * Must be called once, inside a Client Component near the app root.
 * The single-clock bridge (Lenis ↔ GSAP ticker) lives in LenisProvider.
 */

import { useEffect } from "react";
import { registerGSAP, ScrollTrigger } from "@/lib/gsap";

export function useGSAPSetup() {
  useEffect(() => {
    registerGSAP();

    // Refresh ScrollTrigger once fonts and images have settled
    const onFontsReady = () => {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    };
    onFontsReady();

    return () => {
      // Kill all ScrollTrigger instances on unmount (route change)
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);
}

