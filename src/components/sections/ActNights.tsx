"use client";

/**
 * ActNights — ACT III: The Nights (Sticky Chapter Stacks).
 *
 * Features:
 * - Chapter I: Kiki Event '25 with the Hero and Co-Founder portrait (public/img/kiki-event.webp).
 *              Layout: Photo on LEFT, Story on RIGHT.
 * - Chapter II: Masquerade Night '26 with performer in hoodie & mask video clip
 *               (public/video/performer-hoodie.mp4 + .webm, 30fps clean frame).
 *               Layout: Story on LEFT, Performer Video on RIGHT (Alternating!).
 * - Chapter III: "In the Works" — purely decorative living teaser with rotating gold halo and seal.
 * - Fixed overlap bug: Final card pinned with pinSpacing so Act IV Moments never collides into it.
 * - Liquid-gold WebGL displacement: Updates __vmDisplacementState during chapter scroll transitions.
 * - Floating Chapter Navigation Index (I / II / III) with cursor-following hover preview card,
 *   visible ONLY while Act III is on screen.
 * - Breakpoint-aware jump navigation (desktop pinned offsets vs tablet/mobile document scroll).
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useLenis } from "@/lib/lenis/LenisProvider";
import { registerManagedVideo } from "@/lib/video-controller";

interface ChapterData {
  id: string;
  numeral: string;
  roman: string;
  title: string;
  year: string;
  venue: string;
  tagline: string;
  description: string;
  stats: { label: string; value: string }[];
  imageSrc?: string;
  imageAlt?: string;
  videoSrc?: string;
  videoWebm?: string;
  videoPoster?: string;
  isTeaser?: boolean;
}

const CHAPTERS: ChapterData[] = [
  {
    id: "chapter-1",
    numeral: "01",
    roman: "I",
    title: "Kiki Event",
    year: "2025",
    venue: "Pune · 2025",
    tagline: "The night that started it all.",
    description: "The first TheVMEx night. 500+ attendees.",
    stats: [
      { label: "Attendees", value: "500+" },
      { label: "Edition", value: "01" },
      { label: "City", value: "Pune" },
    ],
    imageSrc: "/img/kiki-event.webp",
    imageAlt: "TheVMEx Founder and Co-Founder at Kiki Event 2025",
  },
  {
    id: "chapter-2",
    numeral: "02",
    roman: "II",
    title: "Masquerade Night",
    year: "2026",
    venue: "PIVO GARTEN · Fri 21 Aug 2026",
    tagline: "Masks On. Music Loud. Night Unforgettable.",
    description:
      "A dark, elegant spectacle where mystery met high-voltage energy. Poltergeist held the stage, while masked attendees filled the venue draped in gold and shadow.",
    stats: [
      { label: "Attendees", value: "200+" },
      { label: "Headliner", value: "Poltergeist Live" },
      { label: "Live Set", value: "1 Set" },
    ],
    videoSrc: "/video/performer-hoodie.mp4",
    videoWebm: "/video/performer-hoodie.webm",
    videoPoster: "/video/performer-hoodie-poster.jpg",
    imageAlt: "Poltergeist performing in hoodie and mask at Masquerade Night 2026",
  },
  {
    id: "chapter-3",
    numeral: "03",
    roman: "III",
    title: "In the Works",
    year: "",
    venue: "",
    tagline: "",
    description: "",
    stats: [],
    isTeaser: true,
  },
];

export function ActNights() {
  const containerRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLElement | null)[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeChapter, setActiveChapter] = useState<number>(0);
  const [hoveredChapter, setHoveredChapter] = useState<number | null>(null);
  const [previewY, setPreviewY] = useState<number>(0);
  const navRef = useRef<HTMLElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const cards = cardsRef.current.filter(Boolean) as HTMLElement[];
    if (cards.length === 0) return;

    // Register video auto-pause when off-screen
    let cleanupVideo: (() => void) | undefined;
    if (videoRef.current) {
      cleanupVideo = registerManagedVideo(videoRef.current);
    }

    const ctx = gsap.context(() => {
      // 1. Background color tween: #141418 -> warm #100F0D
      const bgLayer =
        (window as Window & { __vmBgLayer?: HTMLElement }).__vmBgLayer ||
        document.querySelector<HTMLElement>(".vm-bg-layer");

      if (bgLayer) {
        ScrollTrigger.create({
          trigger: container,
          start: "top 60%",
          end: "bottom 80%",
          scrub: true,
          onUpdate: (self) => {
            const p = self.progress;
            const r = Math.round(20 + (16 - 20) * p);
            const g = Math.round(20 + (15 - 20) * p);
            const b = Math.round(24 + (13 - 24) * p);
            bgLayer.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
          },
        });
      }

      // 2. Side Chapter Navigation: Visible ONLY while Act III is on screen
      if (navRef.current) {
        ScrollTrigger.create({
          trigger: container,
          start: "top 70%",
          end: "bottom 30%",
          onEnter: () => {
            if (navRef.current) {
              navRef.current.style.opacity = "1";
              navRef.current.style.pointerEvents = "auto";
            }
          },
          onLeave: () => {
            if (navRef.current) {
              navRef.current.style.opacity = "0";
              navRef.current.style.pointerEvents = "none";
            }
          },
          onEnterBack: () => {
            if (navRef.current) {
              navRef.current.style.opacity = "1";
              navRef.current.style.pointerEvents = "auto";
            }
          },
          onLeaveBack: () => {
            if (navRef.current) {
              navRef.current.style.opacity = "0";
              navRef.current.style.pointerEvents = "none";
            }
          },
        });
      }

      // 3. Responsive Stacking Cards
      // Pinning applies to desktop (width >= 1024px)
      if (window.innerWidth >= 1024) {
        cards.forEach((card, i) => {
          // Pinned cards before the last one
          if (i < cards.length - 1) {
            ScrollTrigger.create({
              trigger: card,
              start: "top top",
              end: "+=100%",
              pin: true,
              pinSpacing: false,
              anticipatePin: 1,
              onToggle: (self) => {
                if (self.isActive) setActiveChapter(i);
              },
              onUpdate: (self) => {
                const p = self.progress;
                // Track active media element for liquid-gold WebGL displacement
                const mediaEl = card.querySelector<HTMLElement>("[data-chapter-media]");
                const rect = mediaEl ? mediaEl.getBoundingClientRect() : undefined;

                (
                  window as Window & {
                    __vmDisplacementState?: {
                      visible: boolean;
                      fromIdx: number;
                      toIdx: number;
                      progress: number;
                      domRect?: DOMRect;
                    };
                  }
                ).__vmDisplacementState = {
                  visible: p > 0.05 && p < 0.95,
                  fromIdx: i,
                  toIdx: i + 1,
                  progress: p,
                  domRect: rect,
                };
              },
            });
          } else {
            // Last card (Chapter III): Pin WITH pinSpacing so Act IV Moments waits until Chapter III is viewed!
            ScrollTrigger.create({
              trigger: card,
              start: "top top",
              end: "+=100%",
              pin: true,
              pinSpacing: true,
              anticipatePin: 1,
              onToggle: (self) => {
                if (self.isActive) {
                  setActiveChapter(i);
                  (
                    window as Window & {
                      __vmDisplacementState?: { visible: boolean };
                    }
                  ).__vmDisplacementState = { visible: false };
                }
              },
            });
          }
        });
      } else {
        // Tablet / Mobile (< 1024px): Natural touch scroll flow
        cards.forEach((card, i) => {
          ScrollTrigger.create({
            trigger: card,
            start: "top center",
            end: "bottom center",
            onToggle: (self) => {
              if (self.isActive) setActiveChapter(i);
            },
          });
        });
      }
    }, container);

    return () => {
      ctx.revert();
      if (cleanupVideo) cleanupVideo();
    };
  }, []);

  const scrollToChapter = (index: number) => {
    const container = containerRef.current;
    if (!container) return;

    if (window.innerWidth >= 1024) {
      // On desktop with pinned stack, calculate exact scroll position
      const containerTop =
        container.getBoundingClientRect().top + window.scrollY;
      const targetScroll = containerTop + index * window.innerHeight;

      if (lenis) {
        lenis.scrollTo(targetScroll, { duration: 1.2 });
      } else {
        window.scrollTo({ top: targetScroll, behavior: "smooth" });
      }
    } else {
      // On tablet/mobile, scroll directly to target card
      const target = cardsRef.current[index];
      if (target) {
        if (lenis) {
          lenis.scrollTo(target, { duration: 1.2, offset: -60 });
        } else {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  return (
    <section
      ref={containerRef}
      id="nights"
      aria-label="Act III: The Nights"
      style={{
        position: "relative",
        backgroundColor: "transparent",
      }}
    >
      {/* Anchor alias for #events */}
      <span id="events" style={{ position: "absolute", top: 0, pointerEvents: "none" }} />

      {/* Floating Side Chapter Index with Cursor-Following Hover Preview (Desktop only) */}
      <nav
        ref={navRef}
        aria-label="Chapter quick navigation"
        className="hidden lg:flex"
        style={{
          position: "fixed",
          right: "clamp(24px, 3.5vw, 48px)",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 40,
          flexDirection: "column",
          gap: 16,
          opacity: 0,
          pointerEvents: "none",
          transition: "opacity 0.4s ease",
        }}
        onMouseLeave={() => setHoveredChapter(null)}
      >
        {/* Cursor-Following Hover Preview Card (P5-07) */}
        {hoveredChapter !== null && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              right: "calc(100% + 24px)",
              top: previewY,
              transform: "translateY(-50%)",
              width: 220,
              backgroundColor: "rgba(20, 20, 24, 0.92)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid var(--color-line)",
              borderRadius: "2px",
              padding: 12,
              pointerEvents: "none",
              boxShadow: "0 16px 40px rgba(0, 0, 0, 0.7)",
              transition: "top 0.15s ease-out, opacity 0.2s ease",
            }}
          >
            {/* Top gold accent line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 32,
                height: 2,
                backgroundColor: "var(--color-gold-500)",
              }}
            />

            {/* Thumbnail */}
            <div
              style={{
                width: "100%",
                height: 100,
                position: "relative",
                overflow: "hidden",
                borderRadius: "1px",
                marginBottom: 8,
                backgroundColor: "var(--color-bg)",
              }}
            >
              {CHAPTERS[hoveredChapter].imageSrc ? (
                <Image
                  src={CHAPTERS[hoveredChapter].imageSrc!}
                  alt=""
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="220px"
                />
              ) : CHAPTERS[hoveredChapter].videoPoster ? (
                <Image
                  src={CHAPTERS[hoveredChapter].videoPoster!}
                  alt=""
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="220px"
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px dashed var(--color-line)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic",
                      color: "var(--color-gold-300)",
                      fontSize: "20px",
                    }}
                  >
                    III
                  </span>
                </div>
              )}
            </div>

            {/* Title & Metadata */}
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "15px",
                color: "var(--color-ink)",
                margin: 0,
                marginBottom: 2,
              }}
            >
              {CHAPTERS[hoveredChapter].title}
            </p>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-gold-500)",
                margin: 0,
              }}
            >
              {CHAPTERS[hoveredChapter].isTeaser
                ? "The Next Chapter"
                : `Edition ${CHAPTERS[hoveredChapter].roman} · ${CHAPTERS[hoveredChapter].year}`}
            </p>
          </div>
        )}

        {CHAPTERS.map((ch, idx) => {
          const isActive = activeChapter === idx;
          return (
            <button
              key={ch.id}
              onClick={() => scrollToChapter(idx)}
              onMouseEnter={(e) => {
                setHoveredChapter(idx);
                const rect = e.currentTarget.getBoundingClientRect();
                const navRect = navRef.current?.getBoundingClientRect();
                if (navRect) {
                  setPreviewY(rect.top - navRect.top + rect.height / 2);
                }
              }}
              aria-label={`Jump to ${ch.title}`}
              style={{
                background: "none",
                border: "none",
                padding: "6px 0",
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  width: isActive ? 24 : 12,
                  height: 1,
                  backgroundColor: isActive
                    ? "var(--color-gold-500)"
                    : "rgba(242, 237, 228, 0.3)",
                  transition: "width 0.25s ease, background-color 0.25s ease",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                  color: isActive ? "var(--color-gold-500)" : "var(--color-ink)",
                  opacity: isActive ? 1 : 0.45,
                  transition: "color 0.25s ease, opacity 0.25s ease",
                }}
              >
                {ch.roman}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Chapters Stack */}
      {CHAPTERS.map((ch, idx) => {
        // Alternating layout: Ch1 = Left media / Right story; Ch2 = Left story / Right media
        const isAlternate = idx % 2 === 1;

        return (
          <article
            key={ch.id}
            ref={(el) => {
              cardsRef.current[idx] = el;
            }}
            id={`chapter-${ch.numeral}`}
            aria-label={`${ch.title} — Edition ${ch.roman}`}
            style={{
              position: "relative",
              minHeight: "100svh",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "clamp(80px, 10vh, 120px) clamp(24px, 7vw, 120px)",
              backgroundColor: "var(--color-bg)",
              overflow: "hidden",
              boxShadow: idx > 0 ? "0 -25px 60px rgba(0, 0, 0, 0.85)" : "none",
              transformOrigin: "center top",
              willChange: "transform, opacity",
            }}
          >
            {/* Oversized background Roman numeral positioned away from text column */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                right: isAlternate ? "3%" : "auto",
                left: isAlternate ? "auto" : "3%",
                top: "5%",
                fontFamily: "var(--font-display)",
                fontSize: "clamp(260px, 40vw, 620px)",
                lineHeight: 0.8,
                color: "var(--color-ink)",
                opacity: 0.02,
                userSelect: "none",
                pointerEvents: "none",
                zIndex: 0,
              }}
            >
              {ch.roman}
            </div>

            <div
              style={{
                position: "relative",
                zIndex: 2,
                maxWidth: 1240,
                margin: "0 auto",
                width: "100%",
              }}
            >
              {/* Act & Edition Metadata */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isAlternate ? "flex-end" : "flex-start",
                  gap: 16,
                  marginBottom: "clamp(24px, 4vh, 48px)",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    letterSpacing: "0.26em",
                    textTransform: "uppercase",
                    color: "var(--color-gold-500)",
                    margin: 0,
                  }}
                >
                  {ch.isTeaser ? "Act III · Next Chapter" : `Act III · Edition ${ch.roman} · ${ch.year}`}
                </p>
                <div
                  style={{
                    width: 48,
                    height: 1,
                    backgroundColor: "var(--color-line)",
                  }}
                />
              </div>

              {/* Chapter Layout:
                  - Chapter 1: Media Left (col 5), Story Right (col 7)
                  - Chapter 2: Story Left (col 7), Performer Video Right (col 5) [Alternating!]
                  - Chapter 3: Decorative living teaser
              */}
              {!ch.isTeaser ? (
                <div
                  className="grid grid-cols-1 lg:grid-cols-12"
                  style={{
                    gap: "clamp(32px, 5vw, 64px)",
                    alignItems: "center",
                  }}
                >
                  {/* Media Column (Left on Ch1, Right on Ch2) */}
                  <div
                    className={`lg:col-span-5 ${
                      isAlternate ? "lg:order-2" : "lg:order-1"
                    }`}
                  >
                    <div
                      data-chapter-media={idx}
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "3 / 4",
                        maxHeight: "68vh",
                        margin: "0 auto",
                        borderRadius: "2px",
                        overflow: "hidden",
                        border: "1px solid var(--color-line)",
                        backgroundColor: "var(--color-smoke)",
                        boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7)",
                      }}
                    >
                      {/* Luxury gold corner accents */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: 14,
                          height: 14,
                          borderTop: "2px solid var(--color-gold-500)",
                          borderLeft: "2px solid var(--color-gold-500)",
                          zIndex: 2,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          width: 14,
                          height: 14,
                          borderTop: "2px solid var(--color-gold-500)",
                          borderRight: "2px solid var(--color-gold-500)",
                          zIndex: 2,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          width: 14,
                          height: 14,
                          borderBottom: "2px solid var(--color-gold-500)",
                          borderLeft: "2px solid var(--color-gold-500)",
                          zIndex: 2,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          width: 14,
                          height: 14,
                          borderBottom: "2px solid var(--color-gold-500)",
                          borderRight: "2px solid var(--color-gold-500)",
                          zIndex: 2,
                        }}
                      />

                      {/* Video vs Image Rendering */}
                      {ch.videoSrc ? (
                        <video
                          ref={videoRef}
                          poster={ch.videoPoster}
                          preload="none"
                          muted
                          playsInline
                          loop
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                          aria-label={ch.imageAlt}
                        >
                          {ch.videoWebm && (
                            <source src={ch.videoWebm} type="video/webm" />
                          )}
                          <source src={ch.videoSrc} type="video/mp4" />
                        </video>
                      ) : (
                        ch.imageSrc && (
                          <Image
                            src={ch.imageSrc}
                            alt={ch.imageAlt || ch.title}
                            fill
                            style={{
                              objectFit: "cover",
                              objectPosition: "center 25%",
                            }}
                            sizes="(max-width: 1024px) 100vw, 45vw"
                            priority={idx === 0}
                          />
                        )
                      )}

                      {/* Scrim Overlay */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(180deg, rgba(11,11,13,0.1) 0%, rgba(11,11,13,0.55) 100%)",
                          pointerEvents: "none",
                        }}
                      />

                      {/* Venue / City Badge */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: 16,
                          left: 16,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          zIndex: 2,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            backgroundColor: "var(--color-gold-500)",
                            boxShadow: "0 0 8px var(--color-gold-500)",
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "10px",
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: "var(--color-ink)",
                          }}
                        >
                          {ch.venue}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Story & Details Column (Right on Ch1, Left on Ch2) */}
                  <div
                    className={`lg:col-span-7 ${
                      isAlternate ? "lg:order-1 text-left" : "lg:order-2 text-left"
                    }`}
                  >
                    <h2
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 300,
                        fontSize: "clamp(40px, 6.2vw, 82px)",
                        lineHeight: 0.96,
                        letterSpacing: "-0.02em",
                        color: "var(--color-ink)",
                        margin: 0,
                        marginBottom: 16,
                      }}
                    >
                      {ch.title}
                    </h2>

                    {/* Venue & Tagline */}
                    <p
                      style={{
                        fontFamily: "var(--font-display)",
                        fontStyle: "italic",
                        fontSize: "clamp(20px, 2.2vw, 28px)",
                        lineHeight: 1.3,
                        color: "var(--color-gold-300)",
                        margin: 0,
                        marginBottom: 20,
                      }}
                    >
                      &ldquo;{ch.tagline}&rdquo;
                    </p>

                    {/* Description */}
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "clamp(15px, 1.25vw, 17px)",
                        lineHeight: 1.75,
                        color: "var(--color-ink)",
                        opacity: 0.75,
                        maxWidth: "52ch",
                        marginBottom: 32,
                      }}
                    >
                      {ch.description}
                    </p>

                    {/* Stats Grid with consistent horizontal baseline */}
                    {ch.stats.length > 0 && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: `repeat(${ch.stats.length}, 1fr)`,
                          gap: 16,
                          padding: "20px 0",
                          borderTop: "1px solid var(--color-line)",
                          borderBottom: "1px solid var(--color-line)",
                          marginBottom: 32,
                          maxWidth: "52ch",
                        }}
                      >
                        {ch.stats.map((s, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "flex-end",
                              minHeight: 64,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "clamp(24px, 3.2vw, 38px)",
                                fontWeight: 300,
                                lineHeight: 1,
                                color: "var(--color-gold-500)",
                                display: "block",
                                marginBottom: 6,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {s.value}
                            </span>
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "9px",
                                letterSpacing: "0.14em",
                                textTransform: "uppercase",
                                color: "var(--color-ink)",
                                opacity: 0.6,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {s.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Gallery jump link */}
                    <a
                      href="#moments"
                      aria-label={`View gallery moments for ${ch.title}`}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "var(--color-ink)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        textDecoration: "none",
                        padding: "8px 0",
                        transition: "color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--color-gold-500)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--color-ink)";
                      }}
                    >
                      <span>Explore Moments</span>
                      <span aria-hidden="true">↓</span>
                    </a>
                  </div>
                </div>
              ) : (
                /* Chapter III: Decorative Living Teaser */
                <div
                  className="grid grid-cols-1 lg:grid-cols-12"
                  style={{
                    gap: "clamp(32px, 5vw, 64px)",
                    alignItems: "center",
                  }}
                >
                  {/* Left Column: Living Teaser Card with Rotating Gold Halo */}
                  <div className="lg:col-span-5">
                    <div
                      data-chapter-media={idx}
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "3 / 4",
                        maxHeight: "68vh",
                        margin: "0 auto",
                        borderRadius: "2px",
                        border: "1px solid rgba(201, 164, 92, 0.25)",
                        backgroundColor: "rgba(16, 16, 20, 0.7)",
                        boxShadow: "0 25px 60px rgba(0, 0, 0, 0.75)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 32,
                        textAlign: "center",
                        overflow: "hidden",
                      }}
                    >
                      {/* Luxury gold corner accents */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: 14,
                          height: 14,
                          borderTop: "2px solid var(--color-gold-500)",
                          borderLeft: "2px solid var(--color-gold-500)",
                          zIndex: 2,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          width: 14,
                          height: 14,
                          borderBottom: "2px solid var(--color-gold-500)",
                          borderRight: "2px solid var(--color-gold-500)",
                          zIndex: 2,
                        }}
                      />

                      {/* Rotating Gold Liquid Halo */}
                      <div
                        className="vm-halo-rotate"
                        style={{
                          position: "absolute",
                          width: 280,
                          height: 280,
                          borderRadius: "50%",
                          background:
                            "conic-gradient(from 0deg, transparent 0%, rgba(201, 164, 92, 0.12) 35%, rgba(255, 241, 204, 0.18) 50%, rgba(201, 164, 92, 0.12) 65%, transparent 100%)",
                          filter: "blur(24px)",
                          pointerEvents: "none",
                        }}
                      />

                      {/* Centered Decorative Seal */}
                      <div
                        style={{
                          width: 110,
                          height: 110,
                          borderRadius: "50%",
                          border: "1px solid rgba(201, 164, 92, 0.4)",
                          backgroundColor: "rgba(11, 11, 13, 0.75)",
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 24,
                          boxShadow: "0 0 40px rgba(201, 164, 92, 0.15)",
                          position: "relative",
                          zIndex: 2,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-display)",
                            fontStyle: "italic",
                            fontSize: "36px",
                            color: "var(--color-gold-300)",
                            letterSpacing: "0.06em",
                          }}
                        >
                          III
                        </span>
                      </div>

                      {/* Subtle Ambient Status Pill */}
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 14px",
                          borderRadius: "20px",
                          backgroundColor: "rgba(201, 164, 92, 0.08)",
                          border: "1px solid rgba(201, 164, 92, 0.2)",
                          position: "relative",
                          zIndex: 2,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            backgroundColor: "var(--color-gold-500)",
                            boxShadow: "0 0 8px var(--color-gold-500)",
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "9px",
                            letterSpacing: "0.22em",
                            textTransform: "uppercase",
                            color: "var(--color-gold-300)",
                          }}
                        >
                          In the Works
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Decorative Title and CTA */}
                  <div className="lg:col-span-7">
                    <h2
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 300,
                        fontSize: "clamp(40px, 6.2vw, 82px)",
                        lineHeight: 0.96,
                        letterSpacing: "-0.02em",
                        color: "var(--color-ink)",
                        margin: 0,
                        marginBottom: 16,
                      }}
                    >
                      In the Works
                    </h2>

                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "var(--color-gold-500)",
                        margin: 0,
                        marginBottom: 32,
                      }}
                    >
                      The Next Chapter
                    </p>

                    <a
                      href="#invitation"
                      aria-label="Inquire about upcoming events"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "var(--color-ink)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        textDecoration: "none",
                        padding: "8px 0",
                        transition: "color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--color-gold-500)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--color-ink)";
                      }}
                    >
                      <span>Inquire for Upcoming</span>
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
