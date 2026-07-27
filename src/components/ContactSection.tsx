"use client";

import { motion } from "framer-motion";
import { EVENT } from "@/lib/config";

function ContactRow({
  icon,
  label,
  value,
  href,
  muted,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  muted?: boolean;
}) {
  const inner = (
    <div className="flex items-center gap-4 px-5 py-[18px]">
      <div className="w-9 h-9 border border-gold/20 flex items-center justify-center text-gold-dim shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-body text-[0.8125rem] tracking-[0.2em] uppercase text-text-dim mb-0.5">{label}</p>
        <p className={`font-serif text-[1.25rem] ${muted ? "text-text-muted" : "text-text-primary"}`}>{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block border-b border-gold/[0.08] last:border-b-0 hover:bg-gold/[0.02] transition-colors duration-200"
      >
        {inner}
      </a>
    );
  }

  return (
    <div className="border-b border-gold/[0.08] last:border-b-0">
      {inner}
    </div>
  );
}

export default function ContactSection() {
  return (
    <section id="contact" className="bg-[#0b0b0d] py-[72px]">
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <span className="font-serif text-[clamp(2.5rem,6vw,4rem)] font-light text-gold/[0.07] leading-none block mb-[-1.5rem]">
            Questions?
          </span>
          <h2 className="font-display text-[clamp(1.8rem,4vw,2.75rem)] font-bold text-text-primary leading-[1.1] relative z-10">
            We&apos;re here<br />to help.
          </h2>
          <p className="font-serif text-[1.125rem] text-text-muted leading-[1.7] font-light mt-3 max-w-[480px]">
            Reach our team for anything — tickets, entry, or VIP queries. We&apos;ll get back to you fast.
          </p>
        </motion.div>

        {/* Contact rows */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="border border-gold/10 mb-8 max-w-[600px]"
        >
          <ContactRow
            label="WhatsApp · Priority"
            value="Message Us"
            href={EVENT.socialLinks.whatsapp}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            }
          />
          <ContactRow
            label="Instagram"
            value="@thevmex"
            href={EVENT.socialLinks.instagram}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
              </svg>
            }
          />
          <ContactRow
            label="Venue"
            value={EVENT.venue}
            muted
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            }
          />
        </motion.div>

        {/* Venue map placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="border border-gold/[0.08] py-10 px-6 text-center max-w-[600px]"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(201,162,75,0.35)" strokeWidth="1" className="mx-auto mb-3">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
            <line x1="9" y1="3" x2="9" y2="18"/>
            <line x1="15" y1="6" x2="15" y2="21"/>
          </svg>
          <p className="font-body text-[0.875rem] tracking-[0.2em] uppercase text-text-dim mb-1">
            Venue map coming soon
          </p>
          <p className="font-serif text-[1rem] text-text-dim font-light italic">
            Once confirmed, we&apos;ll drop the location right here
          </p>
        </motion.div>

      </div>
    </section>
  );
}
