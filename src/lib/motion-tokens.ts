/**
 * Motion tokens — single source of truth for all animation timings and easings.
 * Edit here to tune any motion globally.
 */

// ─── Durations (seconds) ────────────────────────────────────────────────────
export const DURATION = {
  micro: 0.35,
  reveal: 1.0,
  transition: 1.4,
  scrubSmooth: 0.4, // proxy easing for frame scrub
} as const;

// ─── GSAP Easings ───────────────────────────────────────────────────────────
// "vm" CustomEase is registered in lib/gsap/index.ts as cubic-bezier(.16,1,.3,1)
export const EASE = {
  vm: "vm",                // primary reveal ease
  inOut: "power3.inOut",   // scene transitions
  scrub: "none",           // scrubbed timelines
  out: "power2.out",       // subtle settles
} as const;

// ─── Staggers (seconds) ─────────────────────────────────────────────────────
export const STAGGER = {
  chars: 0.018,
  words: 0.06,
  lines: 0.12,
  items: 0.08,
} as const;

// ─── Lenis config ───────────────────────────────────────────────────────────
export const LENIS_CONFIG = {
  duration: 1.1,
  smoothWheel: true,
  // native touch on mobile — syncTouch kept false
  syncTouch: false,
  touchMultiplier: 1.5,
} as const;

// ─── Scroll pin lengths (vh) ────────────────────────────────────────────────
export const PIN_DESKTOP_VH = 350;
export const PIN_MOBILE_VH = 250;

