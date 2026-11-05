"use client";

/**
 * useQualityTier — detects GPU tier and device capabilities,
 * then writes a QualityTier ("HIGH" | "MEDIUM" | "LOW") to the global store.
 * Also respects prefers-reduced-motion by forcing LOW.
 *
 * Run once at app mount (called from layout).
 */

import { useEffect } from "react";
import { useAppStore, type QualityTier } from "@/lib/store";

function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") ||
          canvas.getContext("webgl") ||
          canvas.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
}

export function useQualityTier() {
  const setQualityTier = useAppStore((s) => s.setQualityTier);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Respect reduced-motion immediately — no GPU check needed
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      setQualityTier("LOW");
      return;
    }

    // Data-saver degrades to LOW
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) {
      setQualityTier("LOW");
      return;
    }

    // Check if WebGL context can even be created
    if (!isWebGLAvailable()) {
      setQualityTier("LOW");
      return;
    }

    // Async GPU detection
    const run = async () => {
      try {
        const { getGPUTier } = await import("detect-gpu");
        const gpuTier = await getGPUTier();
        const cores = navigator.hardwareConcurrency ?? 4;
        const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;

        let tier: QualityTier;
        if (gpuTier.tier >= 2 && cores >= 8 && mem >= 4) {
          tier = "HIGH";
        } else if (gpuTier.tier >= 1 || mem >= 2) {
          tier = "MEDIUM";
        } else {
          tier = "LOW";
        }
        setQualityTier(tier);
      } catch {
        // If detection fails, fall back to MEDIUM safe tier
        setQualityTier("MEDIUM");
      }
    };

    run();
  }, [setQualityTier]);
}
