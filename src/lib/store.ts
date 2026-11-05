/**
 * Global Zustand store.
 * loadedPct    — preloader progress (0–100)
 * cursorState  — drives cursor ring size/blend
 * qualityTier  — HIGH | MEDIUM | LOW
 * scrollVelocity — Lenis-fed velocity (px/s), used by shaders + marquee
 * isMenuOpen   — full-screen nav toggle
 */

import { create } from "zustand";

export type CursorState = "default" | "link" | "drag" | "view" | "play";
export type QualityTier = "HIGH" | "MEDIUM" | "LOW";

interface AppStore {
  loadedPct: number;
  setLoadedPct: (pct: number) => void;

  cursorState: CursorState;
  setCursorState: (state: CursorState) => void;

  qualityTier: QualityTier;
  setQualityTier: (tier: QualityTier) => void;

  scrollVelocity: number;
  setScrollVelocity: (v: number) => void;

  isMenuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  loadedPct: 0,
  setLoadedPct: (pct) => set({ loadedPct: pct }),

  cursorState: "default",
  setCursorState: (state) => set({ cursorState: state }),

  qualityTier: "HIGH",
  setQualityTier: (tier) => set({ qualityTier: tier }),

  scrollVelocity: 0,
  setScrollVelocity: (v) => set({ scrollVelocity: v }),

  isMenuOpen: false,
  setMenuOpen: (open) => set({ isMenuOpen: open }),
}));

