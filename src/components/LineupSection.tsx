"use client";

import { motion } from "framer-motion";

// ─── Types ─────────────────────────────────────────────────────────────────
interface Performer {
  id: string;
  name: string;
  role: string;           // e.g. "Live Artist", "DJ", "Guest Performer"
  bio: string;
  genre?: string;
  instagramHandle?: string;
  instagramUrl?: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  isHeadliner?: boolean;
}

// ─── Data: add more performers here as lineup expands ──────────────────────
const PERFORMERS: Performer[] = [
  {
    id: "poltergeist",
    name: "Poltergeist",
    role: "Live Artist",
    bio: "An electrifying live act known for blurring the line between the seen and unseen — Poltergeist brings raw energy, haunting melodies, and an on-stage presence that stays with you long after the night ends.",
    genre: "Alternative · Indie · Electronic",
    instagramHandle: "@poltergeistttttttttttt",
    instagramUrl: "https://www.instagram.com/poltergeistttttttttttt?igsh=dXh6M2V0MzZxMXQ=",
    isHeadliner: true,
  },
];

// ─── Social icon helpers ───────────────────────────────────────────────────
function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function SpotifyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
    </svg>
  );
}

// ─── Headliner card ────────────────────────────────────────────────────────
function HeadlinerCard({ performer }: { performer: Performer }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative border border-gold/[0.22] bg-[#18151a] p-0 overflow-hidden max-w-[800px] mx-auto"
    >
      {/* Gold top bar */}
      <div className="h-[2px] bg-[linear-gradient(90deg,transparent,var(--color-gold),var(--color-gold-muted),transparent)]" />

      <div className="flex flex-col">
        {/* Visual panel */}
        <div className="bg-[#0f0d10] h-[400px] md:h-[500px] flex flex-col items-center justify-center relative overflow-hidden border-b border-gold/10">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-90 transition-transform duration-[10s] hover:scale-105"
            style={{ backgroundImage: "url('/images/poltergeist.jpg')" }}
          />
          {/* Gradient overlay to seamlessly blend image to the background color below */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#18151a] via-transparent to-[#18151a]/20 opacity-90" />
          
          {/* Headliner badge */}
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 inline-block px-4 py-1.5 font-body text-[0.625rem] font-bold tracking-[0.15em] uppercase text-[#0b0b0d] bg-gold">
            Headliner
          </span>
        </div>

        {/* Info panel */}
        <div className="p-10 flex flex-col items-center text-center">
          <p className="font-body text-[0.6rem] tracking-[0.25em] uppercase text-gold-muted mb-2">
            {performer.role}
          </p>
          <h3 className="font-display text-[clamp(2rem,5vw,2.8rem)] font-bold text-text-primary leading-[1.1] mb-3">
            {performer.name}
          </h3>

          {performer.genre && (
            <p className="font-body text-[0.72rem] tracking-[0.12em] text-gold-dim mb-6">
              {performer.genre}
            </p>
          )}

          <p className="font-serif text-[clamp(1rem,2vw,1.1rem)] text-text-muted leading-[1.85] mb-8 max-w-[520px]">
            {performer.bio}
          </p>

          {/* Social links */}
          <div className="flex gap-3 flex-wrap justify-center">
            {performer.instagramUrl && (
              <a
                href={performer.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex items-center justify-center gap-2 px-4 py-2 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-gold bg-transparent border border-gold/40 hover:text-[#0b0b0d] hover:border-gold hover:bg-gold transition-colors duration-400 whitespace-nowrap group"
                aria-label={`${performer.name} on Instagram`}
              >
                <InstagramIcon />
                {performer.instagramHandle}
              </a>
            )}
            {performer.spotifyUrl && (
              <a
                href={performer.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex items-center justify-center gap-2 px-4 py-2 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-gold bg-transparent border border-gold/40 hover:text-[#0b0b0d] hover:border-gold hover:bg-gold transition-colors duration-400 whitespace-nowrap group"
                aria-label={`${performer.name} on Spotify`}
              >
                <SpotifyIcon />
                Spotify
              </a>
            )}
            {performer.youtubeUrl && (
              <a
                href={performer.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex items-center justify-center gap-2 px-4 py-2 font-body text-[0.8125rem] font-semibold tracking-wider uppercase text-gold bg-transparent border border-gold/40 hover:text-[#0b0b0d] hover:border-gold hover:bg-gold transition-colors duration-400 whitespace-nowrap group"
                aria-label={`${performer.name} on YouTube`}
              >
                <YoutubeIcon />
                YouTube
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────
export default function LineupSection() {
  const headliner = PERFORMERS.find((p) => p.isHeadliner);

  return (
    <section id="lineup" className="relative z-10 py-28 md:py-30 bg-[#151316]">
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 flex flex-col items-center"
        >
          <p className="font-body text-[0.6875rem] font-semibold tracking-[0.25em] uppercase text-gold-muted mb-3">The Lineup</p>
          <h2 className="font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-tight text-text-primary mb-0">
            Featuring{" "}
            <span className="text-gold italic">Live Music</span>
          </h2>
        </motion.div>

        {/* Headliner */}
        {headliner && (
          <div className="mb-12">
            <HeadlinerCard performer={headliner} />
          </div>
        )}
      </div>
    </section>
  );
}
