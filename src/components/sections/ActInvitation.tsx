/**
 * ActInvitation — ACT VI: "Planning Something?"
 * Stub for Phase 1. Marquee + magnetic buttons + full contact in Phase 7.
 */
export function ActInvitation() {
  return (
    <section
      id="invitation"
      aria-label="Book TheVMEx"
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
          marginBottom: "clamp(12px, 2vh, 20px)",
        }}
      >
        Act VI — The Invitation
      </p>

      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 300,
          fontSize: "clamp(36px, 7vw, 96px)",
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          color: "var(--color-ink)",
          marginBottom: "clamp(12px, 2vh, 20px)",
        }}
      >
        Planning Something?
      </h2>

      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(15px, 1.4vw, 18px)",
          lineHeight: 1.7,
          color: "var(--color-ink)",
          opacity: 0.65,
          maxWidth: "44ch",
          marginBottom: "clamp(24px, 4vh, 40px)",
        }}
      >
        Book TheVMEx for Your Next Night.
        Private events · College fests · Corporate nights.
      </p>

      {/* Pillars */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "clamp(16px, 2vw, 24px)",
          maxWidth: 640,
          marginBottom: "clamp(40px, 6vh, 64px)",
        }}
      >
        {["Premium Production", "Curated Lineups", "End-to-End Management"].map(
          (p) => (
            <div
              key={p}
              style={{
                borderTop: "1px solid var(--color-line)",
                paddingTop: 16,
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--color-ink)",
                  opacity: 0.7,
                }}
              >
                {p}
              </p>
            </div>
          ),
        )}
      </div>

      {/* Contact block */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <a
          href="https://wa.me/918888822040"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact TheVMEx on WhatsApp — +91 88888 22040"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            letterSpacing: "0.1em",
            color: "var(--color-gold-500)",
            textDecoration: "none",
          }}
        >
          WhatsApp → +91 88888 22040
        </a>
        <a
          href="https://www.instagram.com/thevmexperience"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TheVMEx on Instagram @thevmexperience"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            letterSpacing: "0.1em",
            color: "var(--color-gold-500)",
            textDecoration: "none",
          }}
        >
          Instagram → @thevmexperience
        </a>
        <a
          href="mailto:khairemanthan@gmail.com"
          aria-label="Email TheVMEx — khairemanthan@gmail.com"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            letterSpacing: "0.1em",
            color: "var(--color-ink)",
            opacity: 0.6,
            textDecoration: "none",
          }}
        >
          khairemanthan@gmail.com
        </a>
        <a
          href="https://maps.app.goo.gl/1cveQgwLyPs8v3fo6"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Venue location on Google Maps"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            letterSpacing: "0.1em",
            color: "var(--color-ink)",
            opacity: 0.6,
            textDecoration: "none",
          }}
        >
          View on Map →
        </a>
      </div>
    </section>
  );
}

