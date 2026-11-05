import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Cormorant_Garamond,
  Inter,
  Space_Mono,
  Bodoni_Moda,
  JetBrains_Mono,
  Instrument_Serif,
  Inter_Tight,
  IBM_Plex_Mono,
} from "next/font/google";

export const metadata: Metadata = {
  title: "Type Specimen — TheVMEx Design System",
  robots: {
    index: false,
    follow: false,
  },
};

// ─── Font Setup for Pairing A ─────────────────────────────────────────────
const fontCormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-specimen-a-display",
});

const fontInterA = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-specimen-a-body",
});

const fontSpaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-specimen-a-mono",
});

// ─── Font Setup for Pairing B ─────────────────────────────────────────────
const fontBodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-specimen-b-display",
});

const fontInterB = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-specimen-b-body",
});

const fontJetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-specimen-b-mono",
});

// ─── Font Setup for Pairing C ─────────────────────────────────────────────
const fontInstrument = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-specimen-c-display",
});

const fontInterTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-specimen-c-body",
});

const fontIbmMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-specimen-c-mono",
});

interface PairingConfig {
  id: "A" | "B" | "C";
  name: string;
  description: string;
  displayFont: string;
  bodyFont: string;
  monoFont: string;
  variableClass: string;
}

const PAIRINGS: PairingConfig[] = [
  {
    id: "A",
    name: "Pairing A · Classical Luxury",
    description: "Cormorant Garamond + Inter + Space Mono (current, tuned). Warm, high-contrast, timeless masquerade elegance with human serif roots.",
    displayFont: "var(--font-specimen-a-display)",
    bodyFont: "var(--font-specimen-a-body)",
    monoFont: "var(--font-specimen-a-mono)",
    variableClass: `${fontCormorant.variable} ${fontInterA.variable} ${fontSpaceMono.variable}`,
  },
  {
    id: "B",
    name: "Pairing B · Fashion Editorial",
    description: "Bodoni Moda (variable optical size) + Inter + JetBrains Mono. Razor-sharp Didone serifs, Parisian editorial poise, ultra-crisp luxury.",
    displayFont: "var(--font-specimen-b-display)",
    bodyFont: "var(--font-specimen-b-body)",
    monoFont: "var(--font-specimen-b-mono)",
    variableClass: `${fontBodoni.variable} ${fontInterB.variable} ${fontJetbrains.variable}`,
  },
  {
    id: "C",
    name: "Pairing C · Modern Architectural",
    description: "Instrument Serif + Inter Tight + IBM Plex Mono. Condensed high-fashion proportions, rapid visual cadence, technical couture precision.",
    displayFont: "var(--font-specimen-c-display)",
    bodyFont: "var(--font-specimen-c-body)",
    monoFont: "var(--font-specimen-c-mono)",
    variableClass: `${fontInstrument.variable} ${fontInterTight.variable} ${fontIbmMono.variable}`,
  },
];

export default function SpecimenPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div
      style={{
        backgroundColor: "#0B0B0D",
        color: "#F2EDE4",
        minHeight: "100vh",
        padding: "clamp(24px, 4vw, 64px) clamp(16px, 4vw, 48px)",
      }}
    >
      {/* Dev Header */}
      <header
        style={{
          borderBottom: "1px solid rgba(201, 164, 92, 0.2)",
          paddingBottom: 24,
          marginBottom: 48,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#C9A45C",
              display: "block",
              marginBottom: 8,
            }}
          >
            Dev-Only · Design System Specimen
          </span>
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Typography Comparison
          </h1>
          <p
            style={{
              color: "rgba(242, 237, 228, 0.6)",
              fontSize: 14,
              maxWidth: "60ch",
              marginTop: 8,
              lineHeight: 1.5,
            }}
          >
            Live side-by-side specimen showing real headings, manifesto paragraphs with drop caps,
            stat tabular figures, and labels on the real #0B0B0D background.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <a
            href="#pairing-A"
            style={{
              padding: "8px 14px",
              border: "1px solid rgba(201, 164, 92, 0.4)",
              color: "#C9A45C",
              fontSize: 12,
              fontFamily: "monospace",
              textDecoration: "none",
              borderRadius: 2,
            }}
          >
            Jump to A
          </a>
          <a
            href="#pairing-B"
            style={{
              padding: "8px 14px",
              border: "1px solid rgba(201, 164, 92, 0.4)",
              color: "#C9A45C",
              fontSize: 12,
              fontFamily: "monospace",
              textDecoration: "none",
              borderRadius: 2,
            }}
          >
            Jump to B
          </a>
          <a
            href="#pairing-C"
            style={{
              padding: "8px 14px",
              border: "1px solid rgba(201, 164, 92, 0.4)",
              color: "#C9A45C",
              fontSize: 12,
              fontFamily: "monospace",
              textDecoration: "none",
              borderRadius: 2,
            }}
          >
            Jump to C
          </a>
        </div>
      </header>

      {/* 3 Pairings Stacked for direct comparison */}
      <div style={{ display: "flex", flexDirection: "column", gap: 80 }}>
        {PAIRINGS.map((p) => (
          <section
            key={p.id}
            id={`pairing-${p.id}`}
            className={p.variableClass}
            style={{
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 4,
              padding: "clamp(24px, 4vw, 48px)",
              backgroundColor: "rgba(16, 15, 17, 0.7)",
              position: "relative",
            }}
          >
            {/* Header Badge */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: 12,
                borderBottom: "1px solid rgba(201, 164, 92, 0.2)",
                paddingBottom: 16,
                marginBottom: 36,
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: p.monoFont,
                    fontSize: 11,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#C9A45C",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  OPTION {p.id}
                </span>
                <h2
                  style={{
                    fontFamily: p.displayFont,
                    fontSize: "clamp(24px, 3vw, 36px)",
                    fontWeight: 400,
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {p.name}
                </h2>
              </div>
              <p
                style={{
                  fontFamily: p.bodyFont,
                  fontSize: 13,
                  color: "rgba(242, 237, 228, 0.6)",
                  maxWidth: "50ch",
                  margin: 0,
                }}
              >
                {p.description}
              </p>
            </div>

            {/* Specimen Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "clamp(32px, 4vw, 56px)",
              }}
            >
              {/* Column 1: Display XL, House Headline & Pull-Quote */}
              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                {/* Display XL Wordmark */}
                <div>
                  <span
                    style={{
                      fontFamily: p.monoFont,
                      fontSize: 10,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "rgba(242, 237, 228, 0.4)",
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    DISPLAY-XL (HERO / FOOTER WORDMARK)
                  </span>
                  <div
                    style={{
                      fontFamily: p.displayFont,
                      fontSize: "clamp(48px, 9vw, 92px)",
                      fontWeight: 300,
                      lineHeight: 0.92,
                      letterSpacing: "-0.025em",
                      textTransform: "uppercase",
                    }}
                  >
                    THE VM<br />EXPERIENCE
                  </div>
                </div>

                {/* House Headline Style: Roman + Italic + Gold Accent */}
                <div>
                  <span
                    style={{
                      fontFamily: p.monoFont,
                      fontSize: 10,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "rgba(242, 237, 228, 0.4)",
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    HOUSE HEADLINE STYLE (ROMAN + ITALIC + GOLD)
                  </span>
                  <h3
                    style={{
                      fontFamily: p.displayFont,
                      fontSize: "clamp(34px, 5vw, 60px)",
                      fontWeight: 300,
                      lineHeight: 1.05,
                      letterSpacing: "-0.02em",
                      margin: 0,
                      textWrap: "balance",
                    }}
                  >
                    Where <em style={{ fontStyle: "italic", color: "#E3C58A" }}>Mystery</em> Meets <em style={{ fontStyle: "italic" }}>Elegance</em>
                  </h3>
                </div>

                {/* Pull-Quote with Hanging Punctuation */}
                <div
                  style={{
                    borderLeft: "2px solid #C9A45C",
                    paddingLeft: 20,
                    marginTop: 8,
                  }}
                >
                  <blockquote
                    style={{
                      fontFamily: p.displayFont,
                      fontStyle: "italic",
                      fontSize: "clamp(19px, 2.2vw, 26px)",
                      lineHeight: 1.35,
                      margin: "0 0 10px 0",
                      color: "#F2EDE4",
                    }}
                  >
                    “The night is young, the masks are on, and the music never stops.”
                  </blockquote>
                  <cite
                    style={{
                      fontFamily: p.monoFont,
                      fontSize: 10,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      fontStyle: "normal",
                      color: "#C9A45C",
                    }}
                  >
                    — TheVMEx
                  </cite>
                </div>
              </div>

              {/* Column 2: Drop Cap Paragraph, Founder Bio, and Tabular Stats */}
              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                {/* Manifesto Paragraph with Real Drop Cap */}
                <div>
                  <span
                    style={{
                      fontFamily: p.monoFont,
                      fontSize: 10,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "rgba(242, 237, 228, 0.4)",
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    BODY WITH DROP CAP (LINE-HEIGHT ~1.7, MAX 62CH)
                  </span>
                  <p
                    style={{
                      fontFamily: p.bodyFont,
                      fontSize: "clamp(15px, 1.2vw, 17px)",
                      lineHeight: 1.7,
                      color: "rgba(242, 237, 228, 0.82)",
                      maxWidth: "62ch",
                      margin: 0,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: p.displayFont,
                        fontSize: "3.6em",
                        lineHeight: 0.8,
                        float: "left",
                        paddingRight: "0.12em",
                        paddingTop: "0.06em",
                        color: "#C9A45C",
                        fontStyle: "italic",
                      }}
                    >
                      M
                    </span>
                    asquerade Night is an invitation to disappear into another world. Behind every mask is a story. Curated live performances, atmosphere draped in gold and shadow. Every event should feel premium, not just planned. We weave sound, light, and atmosphere into an evening you carry long after the music stops.
                  </p>
                </div>

                {/* Founder Bio */}
                <div>
                  <span
                    style={{
                      fontFamily: p.monoFont,
                      fontSize: 10,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "rgba(242, 237, 228, 0.4)",
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    FOUNDER TITLE &amp; BIO
                  </span>
                  <div
                    style={{
                      fontFamily: p.displayFont,
                      fontSize: "clamp(26px, 3.2vw, 42px)",
                      fontWeight: 300,
                      lineHeight: 1.1,
                      marginBottom: 6,
                    }}
                  >
                    Manthan Manohar Khaire
                  </div>
                  <div
                    style={{
                      fontFamily: p.monoFont,
                      fontSize: 11,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "#C9A45C",
                      marginBottom: 12,
                    }}
                  >
                    Founder · TheVMEx
                  </div>
                  <p
                    style={{
                      fontFamily: p.bodyFont,
                      fontSize: 15,
                      fontStyle: "italic",
                      color: "rgba(242, 237, 228, 0.75)",
                      margin: 0,
                    }}
                  >
                    “We Create Nights You Remember.”
                  </p>
                </div>

                {/* Tabular Figures Stat Blocks */}
                <div>
                  <span
                    style={{
                      fontFamily: p.monoFont,
                      fontSize: 10,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "rgba(242, 237, 228, 0.4)",
                      display: "block",
                      marginBottom: 12,
                    }}
                  >
                    TABULAR STAT COUNTERS (FONT-VARIANT-NUMERIC: TABULAR-NUMS)
                  </span>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 16,
                      borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                      padding: "16px 0",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontFamily: p.displayFont,
                          fontSize: "clamp(26px, 3vw, 40px)",
                          fontWeight: 300,
                          lineHeight: 1,
                          color: "#C9A45C",
                          display: "block",
                          fontVariantNumeric: "tabular-nums",
                          marginBottom: 4,
                        }}
                      >
                        500+
                      </span>
                      <span
                        style={{
                          fontFamily: p.monoFont,
                          fontSize: 9,
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: "rgba(242, 237, 228, 0.5)",
                        }}
                      >
                        Attendees
                      </span>
                    </div>

                    <div>
                      <span
                        style={{
                          fontFamily: p.displayFont,
                          fontSize: "clamp(26px, 3vw, 40px)",
                          fontWeight: 300,
                          lineHeight: 1,
                          color: "#C9A45C",
                          display: "block",
                          fontVariantNumeric: "tabular-nums",
                          marginBottom: 4,
                        }}
                      >
                        200+
                      </span>
                      <span
                        style={{
                          fontFamily: p.monoFont,
                          fontSize: 9,
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: "rgba(242, 237, 228, 0.5)",
                        }}
                      >
                        Attendees
                      </span>
                    </div>

                    <div>
                      <span
                        style={{
                          fontFamily: p.displayFont,
                          fontSize: "clamp(26px, 3vw, 40px)",
                          fontWeight: 300,
                          lineHeight: 1,
                          color: "#C9A45C",
                          display: "block",
                          fontVariantNumeric: "tabular-nums",
                          marginBottom: 4,
                        }}
                      >
                        700+
                      </span>
                      <span
                        style={{
                          fontFamily: p.monoFont,
                          fontSize: 9,
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: "rgba(242, 237, 228, 0.5)",
                        }}
                      >
                        Total Crowd
                      </span>
                    </div>
                  </div>
                </div>

                {/* Eyebrows, Labels & Outlined Ghost Numerals */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 12,
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontFamily: p.monoFont,
                        fontSize: 10,
                        letterSpacing: "0.24em",
                        textTransform: "uppercase",
                        color: "#C9A45C",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      ACT I · THE MANIFESTO
                    </span>
                    <span
                      style={{
                        fontFamily: p.monoFont,
                        fontSize: 10,
                        letterSpacing: "0.24em",
                        textTransform: "uppercase",
                        color: "rgba(242, 237, 228, 0.5)",
                      }}
                    >
                      PUNE · 2026
                    </span>
                  </div>

                  {/* Outlined Ghost Numeral */}
                  <div
                    aria-hidden="true"
                    style={{
                      fontFamily: p.displayFont,
                      fontSize: 84,
                      lineHeight: 0.8,
                      WebkitTextStroke: "1px rgba(201, 164, 92, 0.28)",
                      color: "transparent",
                      userSelect: "none",
                    }}
                  >
                    II
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
