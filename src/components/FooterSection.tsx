"use client";

import { EVENT } from "@/lib/config";

export default function FooterSection() {
  return (
    <footer className="bg-[#131115] pt-14 pb-8 border-t border-gold/[0.08]">
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8">

        {/* Brand */}
        <div className="text-center mb-10">
          <span className="font-script text-[2.25rem] text-gold-dim block leading-none mb-1">TheVMEx</span>
          <div className="font-body text-[0.875rem] font-bold tracking-[0.2em] uppercase text-text-dim">
            Masquerade Night · Aug 2026
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-wrap justify-center gap-5 mb-8">
          {[
            { label: "About", href: "#about" },
            { label: "Lineup", href: "#lineup" },
            { label: "Details", href: "#details" },
            { label: "Tickets", href: "#tickets" },
            { label: "Gallery", href: "#gallery" },
            { label: "Contact", href: "#contact" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-body text-[0.875rem] tracking-[0.15em] uppercase text-text-dim hover:text-gold transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Socials */}
        <div className="flex justify-center gap-4 mb-10">
          <a
            href={EVENT.socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 border border-gold/15 flex items-center justify-center text-gold-dim hover:text-gold hover:border-gold/30 transition-colors duration-200"
            aria-label="Instagram"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
            </svg>
          </a>
          <a
            href={EVENT.socialLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 border border-gold/15 flex items-center justify-center text-gold-dim hover:text-gold hover:border-gold/30 transition-colors duration-200"
            aria-label="WhatsApp"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
          </a>
        </div>

        {/* Copyright */}
        <div className="border-t border-gold/[0.06] pt-6 text-center">
          <p className="font-body text-[0.875rem] tracking-[0.06em] text-text-dim mb-3">
            © {new Date().getFullYear()} TheVMEx. All rights reserved.
          </p>
          <div className="flex justify-center gap-4">
            <a href="/admin" className="font-body text-[0.75rem] tracking-[0.08em] text-text-dim hover:text-gold transition-colors duration-200">Admin</a>
            <span className="text-text-dim">·</span>
            <a href="/admin/scan" className="font-body text-[0.75rem] tracking-[0.08em] text-text-dim hover:text-gold transition-colors duration-200">Scanner</a>
            <span className="text-text-dim">·</span>
            <a href="/ticket" className="font-body text-[0.75rem] tracking-[0.08em] text-text-dim hover:text-gold transition-colors duration-200">My Ticket</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
