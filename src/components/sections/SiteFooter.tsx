/**
 * SiteFooter — giant wordmark, nav links, legal, operator line.
 * Character-by-character rise animation added in Phase 7.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="footer"
      role="contentinfo"
      style={{
        position: "relative",
        backgroundColor: "transparent",
        borderTop: "1px solid var(--color-line)",
        padding:
          "clamp(60px, 10vh, 120px) clamp(20px, 8vw, 120px) clamp(32px, 5vh, 56px)",
        overflow: "hidden",
      }}
    >
      {/* Giant wordmark */}
      <p
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 300,
          fontSize: "clamp(48px, 16vw, 220px)",
          lineHeight: 0.85,
          letterSpacing: "-0.03em",
          color: "var(--color-ink)",
          opacity: 0.08,
          userSelect: "none",
          marginBottom: "clamp(32px, 6vh, 60px)",
          pointerEvents: "none",
        }}
      >
        THEVMEX
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "clamp(32px, 4vw, 48px)",
          marginBottom: "clamp(48px, 6vh, 80px)",
        }}
      >
        {/* Brand */}
        <div>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(18px, 2vw, 24px)",
              letterSpacing: "0.1em",
              color: "var(--color-ink)",
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            TheVMEx
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              lineHeight: 1.6,
              color: "var(--color-ink)",
              opacity: 0.5,
              maxWidth: "28ch",
            }}
          >
            We Create Nights You Remember
          </p>
        </div>

        {/* Navigate */}
        <nav aria-label="Footer navigation">
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--color-gold-500)",
              marginBottom: 16,
            }}
          >
            Navigate
          </p>
          <ul role="list" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Events", href: "#nights" },
              { label: "Gallery", href: "#moments" },
              { label: "Book", href: "#invitation" },
              { label: "Contact", href: "/contact" },
            ].map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "14px",
                    color: "var(--color-ink)",
                    opacity: 0.6,
                    textDecoration: "none",
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Legal */}
        <nav aria-label="Legal links">
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--color-gold-500)",
              marginBottom: 16,
            }}
          >
            Legal
          </p>
          <ul role="list" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Terms", href: "/terms" },
              { label: "Privacy", href: "/privacy" },
              { label: "Refunds & Cancellations", href: "/refunds" },
              { label: "My Ticket", href: "/ticket" },
            ].map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "14px",
                    color: "var(--color-ink)",
                    opacity: 0.6,
                    textDecoration: "none",
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Legal bottom bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          borderTop: "1px solid var(--color-line)",
          paddingTop: "clamp(16px, 2vh, 24px)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.1em",
            color: "var(--color-ink)",
            opacity: 0.35,
          }}
        >
          TheVMEx is operated by Manthan Manohar Khaire
        </p>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.1em",
            color: "var(--color-ink)",
            opacity: 0.35,
          }}
        >
          © {year} TheVMEx
        </p>
      </div>
    </footer>
  );
}

