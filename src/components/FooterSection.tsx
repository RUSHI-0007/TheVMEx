"use client";

import { EVENT } from "@/lib/config";

export default function FooterSection() {
  return (
    <footer className="bg-[#0b0b0d] pt-16 pb-8 border-t border-gold/10">
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8">
        <div className="flex flex-col items-center text-center mb-12">
          <p className="font-script text-[1.2rem] text-gold-muted mb-1">
            TheVMEx
          </p>
          <h2 className="font-display text-[2rem] font-bold text-text-primary tracking-[0.05em] mb-6">
            MASQUERADE NIGHT
          </h2>
          
          <div className="flex gap-6 mb-8">
            <a href={EVENT.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gold transition-all duration-300 hover:-translate-y-0.5 hover:text-gold-muted">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href={EVENT.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="text-gold transition-all duration-300 hover:-translate-y-0.5 hover:text-gold-muted">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </a>
          </div>

          <div className="flex gap-6 flex-wrap justify-center font-body text-[0.75rem] tracking-[0.1em] uppercase">
            <a href="#about" className="text-text-dim hover:text-gold transition-colors duration-200">About</a>
            <a href="#lineup" className="text-text-dim hover:text-gold transition-colors duration-200">Lineup</a>
            <a href="#details" className="text-text-dim hover:text-gold transition-colors duration-200">Details</a>
            <a href="#tickets" className="text-text-dim hover:text-gold transition-colors duration-200">Tickets</a>
            <a href="#gallery" className="text-text-dim hover:text-gold transition-colors duration-200">Gallery</a>
          </div>
        </div>

        <div className="border-t border-gold/10 pt-8 flex flex-col items-center gap-4">
          <p className="font-body text-[0.7rem] text-text-dim tracking-[0.05em]">
            © {new Date().getFullYear()} TheVMEx. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="/admin" className="font-body text-[0.65rem] text-text-dim hover:text-gold transition-colors">Admin Login</a>
            <span className="text-text-dim">·</span>
            <a href="/admin/scan" className="font-body text-[0.65rem] text-text-dim hover:text-gold transition-colors">Scanner</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
