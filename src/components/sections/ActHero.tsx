/**
 * ActHero — ACT 0: Hero section stub.
 * Full implementation in Phase 3 (FrameCanvas, shader, title choreography, preloader, iris).
 */
export function ActHero() {
  return (
    <section
      id="hero"
      aria-label="Hero"
      style={{
        position: "relative",
        height: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: "transparent",
      }}
    >
      {/* Skip to content target */}
      <a id="main-content" tabIndex={-1} style={{ position: "absolute", opacity: 0 }} />

      <div style={{ textAlign: "center", zIndex: 10, position: "relative" }}>
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
          Welcome to
        </p>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontSize: "clamp(48px, 14vw, 180px)",
            lineHeight: 0.9,
            letterSpacing: "-0.02em",
            color: "var(--color-ink)",
            marginBottom: "clamp(16px, 3vh, 32px)",
          }}
        >
          THE VM<br />EXPERIENCE
        </h1>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(14px, 1.4vw, 18px)",
            color: "var(--color-ink)",
            opacity: 0.6,
            letterSpacing: "0.04em",
            marginBottom: "clamp(32px, 5vh, 56px)",
          }}
        >
          Crafting Premium Event Experiences in Pune
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="#nights"
            aria-label="See our events"
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
              minWidth: 44,
              minHeight: 44,
            }}
          >
            See Our Events
          </a>
          <a
            href="#invitation"
            aria-label="Book an event with TheVMEx"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--color-gold-500)",
              border: "1px solid var(--color-gold-500)",
              padding: "14px 32px",
              textDecoration: "none",
              display: "inline-block",
              minWidth: 44,
              minHeight: 44,
            }}
          >
            Book an Event
          </a>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "clamp(24px, 4vh, 40px)",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          opacity: 0.4,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--color-ink)",
          }}
        >
          Scroll
        </span>
        <div
          style={{
            width: 1,
            height: 32,
            backgroundColor: "var(--color-ink)",
            opacity: 0.5,
          }}
        />
      </div>
    </section>
  );
}

