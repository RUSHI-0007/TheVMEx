"use client";

import { motion } from "framer-motion";
import GoldDivider from "@/components/GoldDivider";

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
    instagramHandle: "@poltergeist",
    instagramUrl: "https://instagram.com/poltergeist",
    isHeadliner: true,
  },
  // ← Add more performers here — each renders as a card automatically
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
      style={{
        position: "relative",
        border: "1px solid rgba(212,175,55,0.22)",
        background: "var(--bg-card)",
        padding: "0",
        overflow: "hidden",
      }}
    >
      {/* Gold top bar */}
      <div
        style={{
          height: "2px",
          background: "linear-gradient(90deg, transparent, var(--gold), var(--gold-muted), transparent)",
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "0",
        }}
        className="headliner-inner"
      >
        {/* Monogram / visual panel */}
        <div
          style={{
            background: "linear-gradient(135deg, #0f0d10 0%, #1a1520 50%, #0f0d10 100%)",
            minHeight: "280px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            borderBottom: "1px solid rgba(212,175,55,0.1)",
          }}
        >
          {/* Background radial */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(212,175,55,0.07) 0%, transparent 70%)",
            }}
          />

          {/* Monogram circle */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              width: "110px",
              height: "110px",
              borderRadius: "50%",
              border: "1px solid rgba(212,175,55,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.25rem",
              background: "rgba(212,175,55,0.05)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2.5rem",
                fontWeight: 700,
                color: "var(--gold)",
                lineHeight: 1,
              }}
            >
              {performer.name[0]}
            </span>
          </div>

          {/* Headliner badge */}
          <span
            className="badge-gold"
            style={{ position: "relative", zIndex: 1 }}
          >
            Headliner
          </span>

          {/* Decorative corner lines */}
          {[
            { top: 16, left: 16, borderTop: 1, borderLeft: 1 },
            { top: 16, right: 16, borderTop: 1, borderRight: 1 },
            { bottom: 16, left: 16, borderBottom: 1, borderLeft: 1 },
            { bottom: 16, right: 16, borderBottom: 1, borderRight: 1 },
          ].map((style, i) => (
            <div
              key={i}
              aria-hidden="true"
              style={{
                position: "absolute",
                width: 20,
                height: 20,
                borderColor: "rgba(212,175,55,0.25)",
                borderStyle: "solid",
                borderWidth: 0,
                ...style,
              }}
            />
          ))}
        </div>

        {/* Info panel */}
        <div style={{ padding: "2.5rem" }}>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.6rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "var(--gold-muted)",
              marginBottom: "0.5rem",
            }}
          >
            {performer.role}
          </p>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 2.8rem)",
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1.1,
              marginBottom: "0.75rem",
            }}
          >
            {performer.name}
          </h3>

          {performer.genre && (
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.72rem",
                letterSpacing: "0.12em",
                color: "var(--gold-dim)",
                marginBottom: "1.5rem",
              }}
            >
              {performer.genre}
            </p>
          )}

          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1rem, 2vw, 1.1rem)",
              color: "var(--text-muted)",
              lineHeight: 1.85,
              marginBottom: "2rem",
              maxWidth: "520px",
            }}
          >
            {performer.bio}
          </p>

          {/* Social links */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {performer.instagramUrl && (
              <a
                href={performer.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold-outline"
                style={{ padding: "0.55rem 1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
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
                className="btn-gold-outline"
                style={{ padding: "0.55rem 1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
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
                className="btn-gold-outline"
                style={{ padding: "0.55rem 1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
                aria-label={`${performer.name} on YouTube`}
              >
                <YoutubeIcon />
                YouTube
              </a>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          .headliner-inner {
            grid-template-columns: 320px 1fr !important;
          }
          .headliner-inner > div:first-child {
            border-bottom: none !important;
            border-right: 1px solid rgba(212,175,55,0.1) !important;
            min-height: 360px !important;
          }
        }
      `}</style>
    </motion.div>
  );
}

// ─── Supporting performer card ─────────────────────────────────────────────
function PerformerCard({ performer, index }: { performer: Performer; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="card-base"
      style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      {/* Monogram */}
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          border: "1px solid rgba(212,175,55,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(212,175,55,0.05)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--gold)",
          }}
        >
          {performer.name[0]}
        </span>
      </div>

      <div>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--gold-muted)",
            marginBottom: "0.3rem",
          }}
        >
          {performer.role}
        </p>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.3rem",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          {performer.name}
        </h3>
        {performer.genre && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              color: "var(--text-dim)",
              marginTop: "0.25rem",
            }}
          >
            {performer.genre}
          </p>
        )}
      </div>

      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "0.95rem",
          color: "var(--text-muted)",
          lineHeight: 1.75,
          flex: 1,
        }}
      >
        {performer.bio}
      </p>

      {performer.instagramUrl && (
        <a
          href={performer.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontFamily: "var(--font-body)",
            fontSize: "0.72rem",
            letterSpacing: "0.1em",
            color: "var(--gold-muted)",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--gold-muted)")}
        >
          <InstagramIcon />
          {performer.instagramHandle}
        </a>
      )}
    </motion.div>
  );
}

// ─── "More coming soon" placeholder card ──────────────────────────────────
function ComingSoonCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      style={{
        border: "1px dashed rgba(212,175,55,0.15)",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        minHeight: "180px",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "1px dashed rgba(212,175,55,0.25)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <line x1="8" y1="2" x2="8" y2="14" stroke="var(--gold-dim)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="2" y1="8" x2="14" y2="8" stroke="var(--gold-dim)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.65rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--text-dim)",
          textAlign: "center",
        }}
      >
        More Performers
        <br />
        <span style={{ color: "var(--gold-dim)" }}>To be announced</span>
      </p>
    </motion.div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────
export default function LineupSection() {
  const headliner = PERFORMERS.find((p) => p.isHeadliner);
  const supporting = PERFORMERS.filter((p) => !p.isHeadliner);

  return (
    <section id="lineup" className="section" style={{ background: "var(--bg-secondary)" }}>
      <div className="container-site">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center", marginBottom: "4rem" }}
        >
          <p className="section-eyebrow">The Lineup</p>
          <h2 className="section-heading" style={{ marginBottom: "0" }}>
            Featuring{" "}
            <span style={{ color: "var(--gold)", fontStyle: "italic" }}>
              Live Music
            </span>
          </h2>
        </motion.div>

        {/* Headliner */}
        {headliner && (
          <div style={{ marginBottom: "3rem" }}>
            <HeadlinerCard performer={headliner} />
          </div>
        )}

        {/* Supporting performers grid */}
        {(supporting.length > 0 || true) && (
          <>
            <div
              style={{
                marginBottom: "2rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: "rgba(212,175,55,0.1)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  whiteSpace: "nowrap",
                }}
              >
                Also Performing
              </span>
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: "rgba(212,175,55,0.1)",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {supporting.map((p, i) => (
                <PerformerCard key={p.id} performer={p} index={i} />
              ))}
              <ComingSoonCard />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
