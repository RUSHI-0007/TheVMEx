"use client";

/**
 * Nav — site navigation.
 *
 * Behaviours:
 * - Hides on scroll-down, shows on scroll-up (using Lenis velocity)
 * - mix-blend-mode: difference over media/dark backgrounds
 * - Wordmark links back to hero (#hero)
 * - Full-screen menu with clip-path expand (Phase 7 implementation)
 * - ScrambleText on nav link hover (Phase 7 implementation)
 * - hamburger always 44×44px tap target on mobile
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "@/lib/gsap";
import { useAppStore } from "@/lib/store";

const NAV_LINKS = [
  { label: "Events", href: "#nights" },
  { label: "Gallery", href: "#moments" },
  { label: "Book", href: "#invitation" },
  { label: "Contact", href: "/contact" },
];

export function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const isMenuOpen = useAppStore((s) => s.isMenuOpen);
  const setMenuOpen = useAppStore((s) => s.setMenuOpen);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Hide/show on scroll direction
  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY.current;
        if (Math.abs(delta) > 4) {
          setVisible(delta < 0 || currentY < 80);
        }
        lastScrollY.current = currentY;
        ticking.current = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Animate nav visibility
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    gsap.to(nav, {
      y: visible ? 0 : -80,
      opacity: visible ? 1 : 0,
      duration: 0.45,
      ease: "power2.out",
    });
  }, [visible]);

  return (
    <>
      <header
        ref={navRef}
        role="banner"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 8000,
          mixBlendMode: "difference",
          pointerEvents: "auto",
        }}
      >
        <nav
          aria-label="Main navigation"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "clamp(16px, 2.5vw, 24px) clamp(20px, 5vw, 60px)",
          }}
        >
          {/* Wordmark */}
          <Link
            href="/#hero"
            aria-label="TheVMEx — back to top"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              letterSpacing: "0.18em",
              fontSize: "clamp(13px, 1.2vw, 15px)",
              color: "var(--color-ink)",
              textDecoration: "none",
              textTransform: "uppercase",
            }}
          >
            TheVMEx
          </Link>

          {/* Desktop nav links — hidden on mobile */}
          <ul
            role="list"
            className="hidden md:flex items-center list-none m-0 p-0"
            style={{
              gap: "clamp(24px, 3vw, 48px)",
            }}
          >
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--color-ink)",
                    textDecoration: "none",
                    opacity: 0.8,
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Hamburger — visible on mobile, accessible button */}
          <button
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="full-screen-menu"
            onClick={() => setMenuOpen(!isMenuOpen)}
            className="md:hidden flex flex-col items-center justify-center"
            style={{
              width: 44,
              height: 44,
              gap: 5,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-ink)",
            }}
          >
            <span
              style={{
                display: "block",
                width: 22,
                height: 1,
                backgroundColor: "currentColor",
                transformOrigin: "center",
                transition: "transform 0.3s",
                transform: isMenuOpen ? "translateY(3px) rotate(45deg)" : "none",
              }}
            />
            <span
              style={{
                display: "block",
                width: 22,
                height: 1,
                backgroundColor: "currentColor",
                transition: "transform 0.3s, opacity 0.3s",
                transform: isMenuOpen ? "translateY(-3px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </nav>
      </header>

      {/* Full-screen menu — implemented fully in Phase 7 */}
      <div
        id="full-screen-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!isMenuOpen}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 7999,
          backgroundColor: "var(--color-bg)",
          clipPath: isMenuOpen ? "inset(0%)" : "inset(0% 0% 100% 0%)",
          transition: "clip-path 0.6s cubic-bezier(.16,1,.3,1)",
          pointerEvents: isMenuOpen ? "auto" : "none",
          display: "flex",
          alignItems: "center",
          padding: "clamp(20px, 5vw, 60px)",
        }}
      >
        <nav aria-label="Full-screen menu navigation">
          <ul role="list" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {NAV_LINKS.map((link) => (
              <li key={link.href} style={{ marginBottom: "clamp(16px, 3vh, 32px)" }}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(32px, 8vw, 96px)",
                    fontWeight: 300,
                    color: "var(--color-ink)",
                    textDecoration: "none",
                    letterSpacing: "-0.01em",
                    display: "block",
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}

