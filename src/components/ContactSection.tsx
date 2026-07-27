"use client";

import { motion } from "framer-motion";
import { EVENT } from "@/lib/config";

function ContactItem({ label, value, icon, link }: { label: string; value: string; icon: React.ReactNode; link?: string }) {
  const content = (
    <div className="flex items-start gap-4">
      <div className="w-9 h-9 border border-gold/20 flex items-center justify-center text-gold shrink-0 bg-gold/5">
        {icon}
      </div>
      <div>
        <p className="font-body text-[0.6rem] tracking-[0.15em] uppercase text-text-dim mb-1">
          {label}
        </p>
        <p className="font-display text-[1rem] text-text-primary">
          {value}
        </p>
      </div>
    </div>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="block transition-transform duration-300 hover:-translate-y-1">
        {content}
      </a>
    );
  }

  return <div>{content}</div>;
}

export default function ContactSection() {
  return (
    <section id="contact" className="relative z-10 py-28 md:py-30 bg-[#151316]">
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: Info */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-body text-[0.6875rem] font-semibold tracking-[0.25em] uppercase text-gold-muted mb-3">Get in Touch</p>
            <h2 className="font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-tight text-text-primary mb-10">
              Need <span className="text-gold italic">Help?</span>
            </h2>
            <p className="font-serif text-[1.1rem] text-text-muted leading-[1.8] mb-12 max-w-[480px]">
              Our team is here to assist you with any questions regarding tickets, entry rules, or VIP reservations.
            </p>
            
            <div className="grid gap-8">
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
            className="flex flex-col justify-center"
          >
            <div className="w-full h-[400px] border border-gold/20 bg-[#18151a] flex items-center justify-center flex-col gap-4">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8a6f24" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                 <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                 <line x1="9" y1="3" x2="9" y2="18" />
                 <line x1="15" y1="6" x2="15" y2="21" />
               </svg>
               <p className="font-body text-[0.8rem] text-text-dim tracking-[0.1em] uppercase">
                 Venue Location Map
               </p>
               <p className="font-body text-[0.7rem] text-gold-dim">
                 (To be added once venue is confirmed)
               </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
