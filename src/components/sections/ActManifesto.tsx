/**
 * ActManifesto — ACT I: "Where Mystery Meets Elegance"
 * Stub for Phase 1. Full implementation in Phase 4.
 */
export function ActManifesto() {
  return (
    <section
      id="manifesto"
      aria-label="Manifesto"
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "clamp(80px, 12vh, 160px) clamp(20px, 8vw, 120px)",
        backgroundColor: "transparent",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--color-gold-500)",
          marginBottom: "clamp(24px, 4vh, 48px)",
        }}
      >
        Act I — Manifesto
      </p>

      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 300,
          fontStyle: "italic",
          fontSize: "clamp(36px, 7vw, 96px)",
          lineHeight: 1.05,
          letterSpacing: "-0.01em",
          color: "var(--color-ink)",
          maxWidth: "14ch",
          marginBottom: "clamp(32px, 5vh, 64px)",
        }}
      >
        Where Mystery Meets Elegance
      </h2>

      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(16px, 1.6vw, 20px)",
          lineHeight: 1.7,
          color: "var(--color-ink)",
          opacity: 0.75,
          maxWidth: "52ch",
          marginBottom: "clamp(32px, 5vh, 56px)",
        }}
      >
        Masquerade Night is an invitation to disappear into another world.
        Behind every mask is a story. Curated live performances, atmosphere
        draped in gold and shadow.
      </p>

      {/* Dress code card */}
      <div
        style={{
          border: "1px solid var(--color-line)",
          padding: "clamp(20px, 3vw, 32px)",
          maxWidth: 400,
          marginBottom: "clamp(32px, 5vh, 56px)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--color-gold-500)",
            marginBottom: 12,
          }}
        >
          Dress Code
        </p>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(14px, 1.2vw, 16px)",
            color: "var(--color-ink)",
            opacity: 0.8,
          }}
        >
          Formal / Semi-Formal — masks encouraged.
          Masked guests receive priority entry and a special surprise.
        </p>
      </div>

      {/* Pull-quote */}
      <blockquote
        style={{
          borderLeft: "1px solid var(--color-gold-700)",
          paddingLeft: "clamp(16px, 2vw, 24px)",
          margin: 0,
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontStyle: "italic",
            fontSize: "clamp(18px, 2vw, 26px)",
            lineHeight: 1.5,
            color: "var(--color-ink)",
            opacity: 0.9,
            marginBottom: 8,
          }}
        >
          "The night is young, the masks are on, and the music never stops.
          Welcome to Masquerade Night."
        </p>
        <cite
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--color-gold-500)",
            fontStyle: "normal",
          }}
        >
          — TheVMEx
        </cite>
      </blockquote>
    </section>
  );
}

