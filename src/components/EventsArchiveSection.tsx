"use client";

import { motion } from "framer-motion";
import { EVENTS_ARCHIVE } from "@/lib/config";

// ─── Timeline node ──────────────────────────────────────────────────────────
function TimelineNode({ isLast = false }: { isLast?: boolean }) {
  return (
    <div className="hidden md:flex flex-col items-center shrink-0 w-[40px]">
      <div className="w-3 h-3 bg-gold border-2 border-gold/40 rotate-45 shrink-0 z-10 mt-[28px]" />
      {!isLast && (
        <div className="flex-1 w-px bg-gradient-to-b from-gold/40 via-gold/15 to-transparent mt-2 min-h-[60px]" />
      )}
    </div>
  );
}

// ─── Stat chip ──────────────────────────────────────────────────────────────
function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center px-5 py-3 border border-gold/15 bg-gold/[0.03]">
      <span className="font-display text-[clamp(1.4rem,3vw,1.9rem)] font-bold text-gold leading-none">
        {value}
      </span>
      <span className="font-body text-[0.6rem] tracking-[0.18em] uppercase text-text-dim mt-1 text-center">
        {label}
      </span>
    </div>
  );
}

// ─── Event card ─────────────────────────────────────────────────────────────
function EventCard({
  event,
  index,
}: {
  event: (typeof EVENTS_ARCHIVE)[number];
  index: number;
}) {
  const hasCover = Boolean(event.coverImage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.9,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex flex-col md:flex-row gap-0 w-full"
    >
      {/* ── Cover ────────────────────────────────────────────────────── */}
      <div className="relative w-full md:w-[340px] lg:w-[420px] shrink-0 h-[220px] md:h-auto overflow-hidden bg-[#18151a] border border-gold/[0.12]">
        {hasCover ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: `url(${event.coverImage})` }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
              <path
                d="M18 2l4.33 8.77L32 12.2l-7 6.82 1.65 9.63L18 24.27l-8.65 4.38L11 19.02 4 12.2l9.67-1.43z"
                stroke="#d4af37"
                strokeWidth="1"
                fill="rgba(212,175,55,0.08)"
              />
            </svg>
            <span className="font-body text-[0.65rem] tracking-[0.2em] uppercase text-text-dim">
              Photos coming soon
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#131115]/60 hidden md:block" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#131115]/60 md:hidden" />

        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="font-body text-[0.58rem] font-bold tracking-[0.2em] uppercase text-[#0b0b0d] bg-gold px-2.5 py-1">
            Edition {event.edition}
          </span>
          <span className="font-body text-[0.58rem] font-bold tracking-[0.15em] uppercase text-gold border border-gold/40 px-2.5 py-1 bg-[#131115]/80 backdrop-blur-sm">
            {event.year}
          </span>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 border border-gold/[0.12] bg-[#18151a] p-6 sm:p-8 flex flex-col justify-between gap-6 md:border-l-0">
        <div>
          <p className="font-body text-[0.6rem] tracking-[0.25em] uppercase text-gold-muted mb-2">
            {event.date} · {event.venue}
          </p>
          <h3 className="font-display text-[clamp(1.6rem,4vw,2.4rem)] font-bold text-text-primary leading-[1.1] mb-2">
            {event.name}
          </h3>
          <p className="font-serif italic text-[0.95rem] text-gold-dim mb-4 leading-[1.5]">
            {event.highlight}
          </p>
          <p className="font-serif text-[clamp(0.9rem,2vw,1rem)] text-text-muted leading-[1.85] max-w-[520px]">
            {event.recap}
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-px">
            {event.stats.map((stat) => (
              <StatChip key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>

          {event.galleryAnchor && (
            <div>
              <a
                href={event.galleryAnchor}
                className="inline-flex items-center gap-2 font-body text-[0.75rem] font-semibold tracking-[0.12em] uppercase text-gold hover:text-gold-muted transition-colors duration-200 group"
              >
                View Gallery
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                >
                  <path
                    d="M2 7h10M8 3l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Coming soon stub ───────────────────────────────────────────────────────
function ComingSoonCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.9,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="w-full border border-dashed border-gold/20 bg-gold/[0.015] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6"
    >
      <div>
        <p className="font-body text-[0.6rem] tracking-[0.25em] uppercase text-gold-muted mb-2">
          Next Chapter
        </p>
        <h3 className="font-display text-[clamp(1.4rem,3vw,2rem)] font-bold text-text-primary leading-tight mb-2">
          TheVMEx · Edition III
        </h3>
        <p className="font-serif italic text-[0.9rem] text-text-dim leading-relaxed max-w-[380px]">
          Something is being planned. Details are coming. The standard stays the same.
        </p>
      </div>

      <div className="flex flex-col items-center md:items-end gap-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-40" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
          </span>
          <span className="font-body text-[0.65rem] tracking-[0.2em] uppercase text-gold">
            In The Works
          </span>
        </div>

        <a href="#book" className="btn-gold-outline px-7 py-2.5 text-[0.75rem]">
          Book for Your Event
        </a>
      </div>
    </motion.div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function EventsArchiveSection() {
  return (
    <section id="events" className="relative z-10 py-28 md:py-32">
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <p className="font-body text-[0.6875rem] font-semibold tracking-[0.25em] uppercase text-gold-muted mb-3">
            Our Events
          </p>
          <h2 className="font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-tight text-text-primary mb-4">
            Every Night{" "}
            <span className="text-gold italic">Tells a Story</span>
          </h2>
          <p className="font-serif text-[clamp(1rem,2.2vw,1.15rem)] text-text-muted leading-[1.85] max-w-[560px]">
            Two events. Two chapters. Each one proof that premium experiences
            can be built anywhere — if you care enough to do it right.
          </p>
        </motion.div>

        {/* ── Timeline ───────────────────────────────────────────────── */}
        <div className="flex flex-col gap-0">
          {EVENTS_ARCHIVE.map((event, i) => (
            <div key={event.slug} className="flex gap-0 md:gap-6 mb-8">
              <TimelineNode isLast={false} />
              <div className="flex-1 min-w-0">
                <EventCard event={event} index={i} />
              </div>
            </div>
          ))}

          <div className="flex gap-0 md:gap-6">
            <TimelineNode isLast />
            <div className="flex-1 min-w-0">
              <ComingSoonCard index={EVENTS_ARCHIVE.length} />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
