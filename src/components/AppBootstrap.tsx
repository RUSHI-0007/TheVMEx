"use client";

/**
 * AppBootstrap — client-only setup that runs at the app root:
 *   1. Registers GSAP plugins + single-clock
 *   2. Runs GPU quality-tier detection
 *   3. Marks prefers-reduced-motion on <html> for CSS + JS guards
 *
 * This component renders nothing visible.
 */

import { useEffect } from "react";
import { useGSAPSetup } from "@/hooks/useGSAPSetup";
import { useQualityTier } from "@/hooks/useQualityTier";

export function AppBootstrap() {
  useGSAPSetup();
  useQualityTier();

  useEffect(() => {
    // Mark reduced-motion on <html> so CSS [data-reduced-motion] selectors work
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = (reduced: boolean) => {
      document.documentElement.dataset.reducedMotion = reduced ? "true" : "false";
    };
    apply(mq.matches);
    mq.addEventListener("change", (e) => apply(e.matches));
    return () => mq.removeEventListener("change", (e) => apply(e.matches));
  }, []);

  return null;
}

