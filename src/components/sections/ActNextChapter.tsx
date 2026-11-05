/**
 * ActNextChapter — ACT V: Edition III teaser.
 * Stub for Phase 1. Ambient shader + full reveal in Phase 7.
 */
export function ActNextChapter() {
  return (
    <section
      id="next-chapter"
      aria-label="Next chapter — Edition III"
      style={{
        position: "relative",
        minHeight: "80svh",
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
          marginBottom: "clamp(12px, 2vh, 20px)",
        }}
      >
        Act V — Edition III
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
          marginBottom: "clamp(24px, 4vh, 40px)",
        }}
      >
        In the Works.
      </h2>

      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(15px, 1.4vw, 18px)",
          lineHeight: 1.7,
          color: "var(--color-ink)",
          opacity: 0.65,
          maxWidth: "44ch",
          marginBottom: "clamp(32px, 5vh, 56px)",
        }}
      >
        Details coming. The standard stays the same.
      </p>

      <a
        href="#invitation"
        aria-label="Book TheVMEx for your next event"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--color-bg)",
          backgroundColor: "var(--color-gold-500)",
          padding: "14px 32px",
          textDecoration: "none",
          display: "inline-block",
          alignSelf: "flex-start",
          minHeight: 44,
        }}
      >
        Book for Your Event
      </a>
    </section>
  );
}

