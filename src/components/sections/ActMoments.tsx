/**
 * ActMoments — ACT IV: The gallery.
 * Stub for Phase 1. Full masonry + drag + lightbox in Phase 6.
 * Gallery images: poltergeist.jpg, IMG_8961.PNG only (Gpay_* excluded).
 * Videos: video1.mp4, video2.mp4, video3.mp4 (MP4); video4 + video6 after Phase 2 conversion.
 */
export function ActMoments() {
  return (
    <section
      id="moments"
      aria-label="Gallery — Masquerade Night '26 | Kiki Event '25"
      style={{
        position: "relative",
        minHeight: "100svh",
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
        Act IV — Moments
      </p>

      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 300,
          fontSize: "clamp(36px, 6vw, 80px)",
          lineHeight: 1.05,
          letterSpacing: "-0.01em",
          color: "var(--color-ink)",
          marginBottom: "clamp(48px, 8vh, 80px)",
        }}
      >
        Masquerade Night '26<br />
        <span style={{ opacity: 0.5 }}>Kiki Event '25</span>
      </h2>

      {/* Filter bar placeholder */}
      <div
        role="tablist"
        aria-label="Gallery filter"
        style={{
          display: "flex",
          gap: 24,
          marginBottom: "clamp(32px, 5vh, 56px)",
        }}
      >
        {["All", "Photos", "Videos"].map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={f === "All"}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: f === "All" ? "var(--color-gold-500)" : "var(--color-ink)",
              background: "none",
              border: "none",
              padding: "8px 0",
              cursor: "pointer",
              opacity: f === "All" ? 1 : 0.4,
              borderBottom: f === "All" ? "1px solid var(--color-gold-500)" : "1px solid transparent",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Gallery grid placeholder */}
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--color-ink)",
          opacity: 0.3,
        }}
      >
        [Gallery — full masonry + lightbox in Phase 6]
      </p>
    </section>
  );
}

