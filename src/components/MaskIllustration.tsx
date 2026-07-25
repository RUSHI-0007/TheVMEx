"use client";

// Elegant masquerade mask SVG illustration — used in Hero section
// Drawn with pure SVG paths; no raster dependency

interface MaskIllustrationProps {
  className?: string;
  size?: number;
}

export default function MaskIllustration({
  className = "",
  size = 280,
}: MaskIllustrationProps) {
  return (
    <svg
      width={size}
      height={size * 0.6}
      viewBox="0 0 560 336"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="maskGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#C9A24B" stopOpacity="1" />
          <stop offset="100%" stopColor="#8C5A2B" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="maskFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1510" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0b0b0d" stopOpacity="0.95" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Main mask body ── */}
      {/* Left side of mask */}
      <path
        d="M 280 60
           C 220 40, 120 50, 60 100
           C 20 130, 10 165, 20 195
           C 35 230, 80 240, 120 235
           C 150 230, 175 215, 195 200
           C 215 185, 230 175, 250 170
           L 280 168"
        fill="url(#maskFill)"
        stroke="url(#maskGold)"
        strokeWidth="1.5"
        filter="url(#glow)"
      />
      {/* Right side of mask */}
      <path
        d="M 280 60
           C 340 40, 440 50, 500 100
           C 540 130, 550 165, 540 195
           C 525 230, 480 240, 440 235
           C 410 230, 385 215, 365 200
           C 345 185, 330 175, 310 170
           L 280 168"
        fill="url(#maskFill)"
        stroke="url(#maskGold)"
        strokeWidth="1.5"
        filter="url(#glow)"
      />

      {/* ── Eye holes ── */}
      {/* Left eye */}
      <ellipse
        cx="175"
        cy="145"
        rx="45"
        ry="28"
        fill="none"
        stroke="url(#maskGold)"
        strokeWidth="1.2"
        transform="rotate(-8 175 145)"
      />
      <ellipse
        cx="175"
        cy="145"
        rx="38"
        ry="21"
        fill="#0b0b0d"
        transform="rotate(-8 175 145)"
      />
      {/* Right eye */}
      <ellipse
        cx="385"
        cy="145"
        rx="45"
        ry="28"
        fill="none"
        stroke="url(#maskGold)"
        strokeWidth="1.2"
        transform="rotate(8 385 145)"
      />
      <ellipse
        cx="385"
        cy="145"
        rx="38"
        ry="21"
        fill="#0b0b0d"
        transform="rotate(8 385 145)"
      />

      {/* ── Decorative filigree above eyes ── */}
      {/* Left */}
      <path
        d="M 130 125 Q 155 105 175 118"
        fill="none"
        stroke="url(#maskGold)"
        strokeWidth="1"
        strokeOpacity="0.7"
      />
      <path
        d="M 145 112 Q 165 95 182 110"
        fill="none"
        stroke="url(#maskGold)"
        strokeWidth="0.7"
        strokeOpacity="0.5"
      />
      {/* Right */}
      <path
        d="M 430 125 Q 405 105 385 118"
        fill="none"
        stroke="url(#maskGold)"
        strokeWidth="1"
        strokeOpacity="0.7"
      />
      <path
        d="M 415 112 Q 395 95 378 110"
        fill="none"
        stroke="url(#maskGold)"
        strokeWidth="0.7"
        strokeOpacity="0.5"
      />

      {/* ── Center nose bridge ── */}
      <path
        d="M 245 168 Q 265 178, 280 180 Q 295 178, 315 168"
        fill="none"
        stroke="url(#maskGold)"
        strokeWidth="1"
        strokeOpacity="0.5"
      />

      {/* ── Top flourish / crown feathers ── */}
      {/* Center */}
      <path
        d="M 280 60 Q 278 20, 280 -10 Q 282 20, 280 60"
        fill="none"
        stroke="url(#maskGold)"
        strokeWidth="1.2"
        strokeOpacity="0.6"
      />
      {/* Left feather sweep */}
      <path
        d="M 270 65 Q 220 -10, 180 -20 Q 215 10, 265 68"
        fill="none"
        stroke="url(#maskGold)"
        strokeWidth="1"
        strokeOpacity="0.5"
      />
      <path
        d="M 258 72 Q 195 -5, 150 -15 Q 192 18, 252 76"
        fill="none"
        stroke="url(#maskGold)"
        strokeWidth="0.8"
        strokeOpacity="0.35"
      />
      {/* Right feather sweep */}
      <path
        d="M 290 65 Q 340 -10, 380 -20 Q 345 10, 295 68"
        fill="none"
        stroke="url(#maskGold)"
        strokeWidth="1"
        strokeOpacity="0.5"
      />
      <path
        d="M 302 72 Q 365 -5, 410 -15 Q 368 18, 308 76"
        fill="none"
        stroke="url(#maskGold)"
        strokeWidth="0.8"
        strokeOpacity="0.35"
      />

      {/* ── Gold accent dots ── */}
      <circle cx="175" cy="145" r="2" fill="#D4AF37" opacity="0.8" />
      <circle cx="385" cy="145" r="2" fill="#D4AF37" opacity="0.8" />
      <circle cx="280" cy="70" r="2.5" fill="#D4AF37" opacity="0.9" />

      {/* ── Bottom mask edge ornament ── */}
      <path
        d="M 195 200 Q 220 220, 250 225 Q 265 228, 280 228 Q 295 228, 310 225 Q 340 220, 365 200"
        fill="none"
        stroke="url(#maskGold)"
        strokeWidth="0.8"
        strokeOpacity="0.4"
      />

      {/* ── Side ribbons / ties ── */}
      {/* Left */}
      <path
        d="M 20 195 Q 5 210, 10 240 Q 25 265, 50 250"
        fill="none"
        stroke="url(#maskGold)"
        strokeWidth="0.8"
        strokeOpacity="0.4"
        strokeDasharray="3 4"
      />
      {/* Right */}
      <path
        d="M 540 195 Q 555 210, 550 240 Q 535 265, 510 250"
        fill="none"
        stroke="url(#maskGold)"
        strokeWidth="0.8"
        strokeOpacity="0.4"
        strokeDasharray="3 4"
      />
    </svg>
  );
}
