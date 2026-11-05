/**
 * ActFounder — ACT II: The Host (personal brand).
 * Full implementation in Phase 4. Placeholders clearly marked.
 */
export function ActFounder() {
  return (
    <section
      id="founder"
      aria-label="The host"
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
        Act II — The Host
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* Photo placeholder */}
        <div
          aria-label="[FOUNDER_PHOTO — placeholder]"
          style={{
            width: "clamp(160px, 25vw, 320px)",
            height: "clamp(200px, 32vw, 400px)",
            backgroundColor: "var(--color-smoke)",
            border: "1px dashed var(--color-line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--color-ink)",
              opacity: 0.3,
            }}
          >
            [FOUNDER_PHOTO]
          </span>
        </div>

        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(48px, 10vw, 140px)",
              lineHeight: 0.9,
              letterSpacing: "-0.02em",
              color: "var(--color-ink)",
              marginBottom: "clamp(8px, 1vh, 12px)",
            }}
          >
            [FOUNDER_NAME]
          </h2>

          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--color-gold-500)",
              marginBottom: "clamp(16px, 2vh, 24px)",
            }}
          >
            [ROLE]
          </p>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(15px, 1.4vw, 18px)",
              lineHeight: 1.7,
              color: "var(--color-ink)",
              opacity: 0.75,
              maxWidth: "48ch",
              marginBottom: "clamp(24px, 4vh, 40px)",
            }}
          >
            [SHORT_BIO]
          </p>

          {/* Stat counters */}
          <div
            style={{
              display: "flex",
              gap: "clamp(24px, 5vw, 60px)",
              flexWrap: "wrap",
              marginBottom: "clamp(24px, 4vh, 40px)",
            }}
          >
            {[
              { value: "2", label: "Events delivered" },
              { value: "500+", label: "Edition I attendees" },
              { value: "200+", label: "Edition II attendees" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 300,
                    fontSize: "clamp(40px, 6vw, 80px)",
                    lineHeight: 1,
                    color: "var(--color-gold-300)",
                    marginBottom: 4,
                  }}
                >
                  {value}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--color-ink)",
                    opacity: 0.5,
                  }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div style={{ display: "flex", gap: 16 }}>
            <a
              href="https://www.instagram.com/thevmexperience"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TheVMEx on Instagram"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-gold-500)",
                textDecoration: "none",
                borderBottom: "1px solid var(--color-gold-700)",
                paddingBottom: 2,
              }}
            >
              Instagram ↗
            </a>
            <a
              href="https://wa.me/918888822040"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact TheVMEx on WhatsApp"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-gold-500)",
                textDecoration: "none",
                borderBottom: "1px solid var(--color-gold-700)",
                paddingBottom: 2,
              }}
            >
              WhatsApp ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

