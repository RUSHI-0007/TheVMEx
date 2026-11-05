import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LenisProvider } from "@/lib/lenis/LenisProvider";
import { WebGLCanvas } from "@/components/webgl/WebGLCanvas";
import { AppBootstrap } from "@/components/AppBootstrap";
import { Cursor } from "@/components/ui/Cursor";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { Nav } from "@/components/ui/Nav";

/* ─── Option B: Fashion Editorial Typography ───────────────────────── */
/* Bodoni Moda (variable optical size) + Inter + JetBrains Mono         */

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--next-font-display",
  fallback: ["Didot", "Bodoni MT", "Georgia", "serif"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--next-font-body",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--next-font-mono",
  fallback: ["Courier New", "monospace"],
});

/* ─── SEO Metadata (preserved from original) ───────────────────────── */

export const metadata: Metadata = {
  metadataBase: new URL("https://www.thevmex.in"),
  title: "TheVMEx | Premium Event Experiences — Pune",
  description:
    "TheVMEx (The VM Experience) is Pune's premium event brand. Two events delivered. Masquerade Night 2026 — done. Follow us for what's next.",
  keywords: [
    "TheVMEx",
    "thevmex",
    "The VM Experience",
    "the vm experience",
    "VMEx",
    "Masquerade Night",
    "Masquerade Night Pune",
    "premium events Pune",
    "event management Pune",
    "live music events",
    "Poltergeist",
    "college events Pune",
    "private event organizer",
  ],
  authors: [{ name: "TheVMEx (The VM Experience)" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.thevmex.in",
    siteName: "TheVMEx — The VM Experience",
    title: "TheVMEx | Premium Event Experiences — Pune",
    description:
      "TheVMEx — premium event experiences in Pune. Two events. Two chapters. Each one crafted to feel like something different. See our events portfolio.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TheVMEx — The VM Experience | Premium Events Pune",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TheVMEx | The VM Experience",
    description:
      "TheVMEx — premium event experiences in Pune. Masquerade Night 2026 complete. Follow for what's next.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0D",
  width: "device-width",
  initialScale: 1,
};

/* ─── Root Layout ───────────────────────────────────────────────────── */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodoniModa.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      style={{ height: "100%", scrollBehavior: "auto" }}
    >
      <head>
        {/* JSON-LD structured data — Phase 7 will add Event schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "TheVMEx",
              alternateName: "The VM Experience",
              url: "https://www.thevmex.in",
              logo: "https://www.thevmex.in/og-image.jpg",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+91-88888-22040",
                contactType: "customer service",
              },
              sameAs: [
                "https://www.instagram.com/thevmexperience",
              ],
            }),
          }}
        />
      </head>
      <body
        style={{
          minHeight: "100dvh",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          overflowX: "hidden",
          width: "100%",
          /* font-family picks up the CSS vars set in globals.css,
             which reference --next-font-* variables injected by next/font */
          fontFamily: "var(--font-body)",
        }}
      >
        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          style={{
            position: "absolute",
            left: -9999,
            top: "auto",
            width: 1,
            height: 1,
            overflow: "hidden",
          }}
          className="focus:static focus:w-auto focus:h-auto focus:overflow-visible focus:p-4 focus:z-50"
        >
          Skip to content
        </a>

        {/* Client-only bootstrap: GSAP register + quality tier + reduced-motion */}
        <AppBootstrap />

        {/* Smooth scroll provider + single-clock bridge */}
        <LenisProvider>
          {/* Fixed background colour tween layer + persistent WebGL canvas */}
          <WebGLCanvas />

          {/* Film grain overlay */}
          <div className="vm-grain" aria-hidden="true" />

          {/* Vignette overlay */}
          <div className="vm-vignette" aria-hidden="true" />

          {/* Navigation */}
          <Nav />

          {/* Scroll progress hairline */}
          <ScrollProgress />

          {/* Custom cursor (desktop only) */}
          <Cursor />

          {/* Page content — relative z-index above WebGL */}
          <div style={{ position: "relative", zIndex: 2 }}>
            {children}
          </div>
        </LenisProvider>
      </body>
    </html>
  );
}
