# TheVMEx — The VM Experience

> **We Create Nights You Remember.**  
> Pune’s premiere curated nocturnal events, immersive nightlife productions, and private celebrations.

---

## ✦ Overview

**TheVMEx** is a high-craft cinematic web experience built for Pune's signature event brand. Featuring a 7-Act narrative architecture, physical scroll choreography, frame-scrubbed hero visuals, fluid optical-size typography, and verified WCAG AA accessible contrast tiers draped in shadow and gold.

- **Production URL:** [thevmex.in](https://thevmex.in)
- **Host & Founder:** Manthan Manohar Khaire
- **Signature Events:** *Kiki Event '25*, *Masquerade Night '26*, *Act III (Next Chapter)*

---

## ✦ Design & Engineering System

- **Framework:** Next.js 16 (App Router + React Server Components + Turbopack)
- **Typography Engine (Option B — Editorial Luxe):**
  - **Display:** `Bodoni Moda` (Variable optical size `opsz` 6–96, fluid `clamp()` tokens, tabular numerals)
  - **Body / Prose:** `Inter` (Variable 100–900, text-wrap `pretty`, hanging punctuation)
  - **Technical / Labels:** `JetBrains Mono` (Uppercase, tracking `0.22em`, minimum `0.72rem`)
- **Colour & Contrast Architecture (WCAG 2.1 AA Compliant):**
  - `--ink-100` (`#F2EDE4`): Headlines & high-emphasis display (AAA 16.86:1)
  - `--ink-80` (`#C8C3BA`): Lead paragraphs & subheads (AAA 11.21:1)
  - `--ink-60` (`#99948C`): Body copy & small technical labels (AA 6.53:1 base, 5.18:1 spotlight)
  - `--ink-40` (`#66635D`): Strictly for large decorative numerals & meta hairlines
  - **Per-Chapter Accent Tints:**
    - Chapter I: *Ember Coral-Red* (`#FF6B57` — 7.02:1 base, 5.57:1 spotlight)
    - Chapter II: *Amber Gold* (`#E3C58A` — 11.82:1 base, 9.38:1 spotlight)
    - Chapter III: *Moonlight Silver-Blue* (`#A2B7CC` — 9.53:1 base, 7.57:1 spotlight)
- **Motion & Smooth Scroll:**
  - GSAP 3 + ScrollTrigger + SplitText
  - Single RAF clock via Lenis smooth scroll
  - Liquid gold WebGL displacement transitions
  - Strict `prefers-reduced-motion` zero-jump compliance

---

## ✦ Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
git clone git@github.com:RUSHI-0007/TheVMEx.git
cd TheVMEx
npm install
```

### Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the experience.

### Production Build

```bash
npm run build
npm run start
```

---

## ✦ Contact & Inquiries

- **WhatsApp:** [+91 88888 22040](https://wa.me/918888822040)
- **Instagram:** [@thevmexperience](https://www.instagram.com/thevmexperience)
- **Email:** [khairemanthan@gmail.com](mailto:khairemanthan@gmail.com)

---

&copy; TheVMEx. Operated by Manthan Manohar Khaire. All rights reserved.
