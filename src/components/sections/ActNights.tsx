/**
 * ActNights — ACT III: The Nights (sticky chapters).
 * Stub for Phase 1. Full sticky chapter implementation in Phase 5.
 */
export function ActNights() {
  const chapters = [
    {
      numeral: "I",
      title: "Kiki Event",
      year: "2025",
      venue: "Pune",
      tagline: "The night that started it all.",
      details: "500+ attendees",
    },
    {
      numeral: "II",
      title: "Masquerade Night",
      year: "2026",
      venue: "PIVO GARTEN · Fri 21 Aug 2026",
      tagline: "Masks On. Music Loud. Night Unforgettable.",
      details: "Poltergeist held the stage · 200+ attendees · 1 live set",
    },
    {
      numeral: "III",
      title: "In the Works",
      year: "",
      venue: "",
      tagline: "Details coming. The standard stays the same.",
      details: "",
    },
  ];

  return (
    <section
      id="nights"
      aria-label="The nights"
      style={{ backgroundColor: "transparent" }}
    >
      {chapters.map((ch, i) => (
        <article
          key={ch.numeral}
          aria-label={`Edition ${ch.numeral}: ${ch.title}`}
          style={{
            minHeight: "100svh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "clamp(80px, 12vh, 160px) clamp(20px, 8vw, 120px)",
            borderTop: i > 0 ? "1px solid var(--color-line)" : undefined,
            position: "relative",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              right: "clamp(20px, 6vw, 80px)",
              top: "50%",
              transform: "translateY(-50%)",
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(120px, 22vw, 320px)",
              lineHeight: 1,
              color: "var(--color-ink)",
              opacity: 0.04,
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            {ch.numeral}
          </span>

          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--color-gold-500)",
              marginBottom: "clamp(12px, 2vh, 20px)",
            }}
          >
            Edition {ch.numeral}{ch.year ? ` · ${ch.year}` : ""}
          </p>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(36px, 7vw, 96px)",
              lineHeight: 1.0,
              letterSpacing: "-0.01em",
              color: "var(--color-ink)",
              marginBottom: "clamp(12px, 2vh, 20px)",
            }}
          >
            {ch.title}
          </h2>

          {ch.venue && (
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-ink)",
                opacity: 0.5,
                marginBottom: "clamp(16px, 2.5vh, 24px)",
              }}
            >
              {ch.venue}
            </p>
          )}

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontStyle: "italic",
              fontSize: "clamp(16px, 1.8vw, 24px)",
              lineHeight: 1.5,
              color: "var(--color-ink)",
              opacity: 0.8,
              maxWidth: "40ch",
              marginBottom: ch.details ? "clamp(12px, 2vh, 20px)" : 0,
            }}
          >
            {ch.tagline}
          </p>

          {ch.details && (
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-ink)",
                opacity: 0.4,
              }}
            >
              {ch.details}
            </p>
          )}
        </article>
      ))}
    </section>
  );
}

