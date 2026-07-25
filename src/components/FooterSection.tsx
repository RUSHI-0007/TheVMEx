"use client";

import { EVENT } from "@/lib/config";

export default function FooterSection() {
  return (
    <footer style={{ background: "var(--bg-primary)", padding: "4rem 0 2rem", borderTop: "1px solid rgba(212,175,55,0.1)" }}>
      <div className="container-site">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "3rem" }}>
          <p style={{ fontFamily: "var(--font-script)", fontSize: "1.2rem", color: "var(--gold-muted)", marginBottom: "0.25rem" }}>
            TheVMEx
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.05em", marginBottom: "1.5rem" }}>
            MASQUERADE NIGHT
          </h2>
          
          <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem" }}>
            <a href={EVENT.socialLinks.instagram} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold)", textDecoration: "none" }} className="hover-lift">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href={EVENT.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold)", textDecoration: "none" }} className="hover-lift">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </a>
          </div>

          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center", fontFamily: "var(--font-body)", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <a href="#about" style={{ color: "var(--text-dim)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--gold)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}>About</a>
            <a href="#lineup" style={{ color: "var(--text-dim)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--gold)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}>Lineup</a>
            <a href="#details" style={{ color: "var(--text-dim)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--gold)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}>Details</a>
            <a href="#tickets" style={{ color: "var(--text-dim)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--gold)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}>Tickets</a>
            <a href="#gallery" style={{ color: "var(--text-dim)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--gold)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}>Gallery</a>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(212,175,55,0.1)", paddingTop: "2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--text-dim)", letterSpacing: "0.05em" }}>
            © {new Date().getFullYear()} TheVMEx. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <a href="/admin" style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", color: "var(--text-dim)", textDecoration: "none" }}>Admin Login</a>
            <span style={{ color: "var(--text-dim)" }}>·</span>
            <a href="/admin/scan" style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", color: "var(--text-dim)", textDecoration: "none" }}>Scanner</a>
          </div>
        </div>
      </div>
      <style jsx>{`
        .hover-lift {
          transition: transform 0.3s ease, color 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
          color: var(--gold-muted) !important;
        }
      `}</style>
    </footer>
  );
}
