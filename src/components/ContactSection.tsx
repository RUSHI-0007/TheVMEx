"use client";

import { motion } from "framer-motion";
import { EVENT } from "@/lib/config";

function ContactItem({ label, value, icon, link }: { label: string; value: string; icon: React.ReactNode; link?: string }) {
  const content = (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
      <div style={{ width: "36px", height: "36px", border: "1px solid rgba(212,175,55,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)", flexShrink: 0, background: "rgba(212,175,55,0.05)" }}>
        {icon}
      </div>
      <div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.25rem" }}>
          {label}
        </p>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--text-primary)" }}>
          {value}
        </p>
      </div>
    </div>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }} className="hover-lift">
        {content}
      </a>
    );
  }

  return <div>{content}</div>;
}

export default function ContactSection() {
  return (
    <section id="contact" className="section" style={{ background: "var(--bg-secondary)" }}>
      <div className="container-site">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4rem" }} className="contact-grid">
          {/* Left: Info */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
          >
            <p className="section-eyebrow">Get in Touch</p>
            <h2 className="section-heading" style={{ marginBottom: "2.5rem" }}>
              Need <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Help?</span>
            </h2>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "3rem", maxWidth: "480px" }}>
              Our team is here to assist you with any questions regarding tickets, entry rules, or VIP reservations.
            </p>
            
            <div style={{ display: "grid", gap: "2rem" }}>
              <ContactItem
                label="WhatsApp (Priority Support)"
                value="Message Us"
                link={EVENT.socialLinks.whatsapp}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                }
              />
              <ContactItem
                label="Instagram"
                value="@thevmex"
                link={EVENT.socialLinks.instagram}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                }
              />
              <ContactItem
                label="Venue"
                value={EVENT.venue}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                }
              />
            </div>
          </motion.div>

          {/* Right: Map/Form Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
            style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}
          >
            <div style={{ width: "100%", height: "400px", border: "1px solid rgba(212,175,55,0.2)", background: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dim)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                 <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                 <line x1="9" y1="3" x2="9" y2="18" />
                 <line x1="15" y1="6" x2="15" y2="21" />
               </svg>
               <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                 Venue Location Map
               </p>
               <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--gold-dim)" }}>
                 (To be added once venue is confirmed)
               </p>
            </div>
          </motion.div>
        </div>
      </div>
      <style jsx>{`
        .hover-lift {
          transition: transform 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
        }
        @media (min-width: 900px) {
          .contact-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
