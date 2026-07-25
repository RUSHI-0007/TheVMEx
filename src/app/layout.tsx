import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://masqueradenight.thevmex.com"), // ← update when deployed
  title: "Masquerade Night 2026 — TheVMEx | Ft. Poltergeist · 21 Aug",
  description:
    "TheVMEx presents Masquerade Night — an evening of mystery, elegance, and live music. Ft. Poltergeist. Friday, 21st August 2026. Book your tickets now.",
  keywords: [
    "Masquerade Night",
    "TheVMEx",
    "college event",
    "live music",
    "Poltergeist",
    "2026",
    "ticket booking",
  ],
  authors: [{ name: "TheVMEx" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://masqueradenight.thevmex.com",
    siteName: "TheVMEx — Masquerade Night",
    title: "Masquerade Night 2026 — TheVMEx | Ft. Poltergeist",
    description:
      "An evening shrouded in mystery & elegance. Live music by Poltergeist. Friday, 21st August 2026. Book now.",
    images: [
      {
        url: "/og-image.jpg", // ← Add event poster here
        width: 1200,
        height: 630,
        alt: "TheVMEx — Masquerade Night 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Masquerade Night 2026 — TheVMEx",
    description:
      "An evening shrouded in mystery & elegance. Live music by Poltergeist. 21 Aug 2026.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Google Fonts — preconnect + full font stack */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&family=Playfair+Display:ital,wght@0,400;0,500;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600&family=Manrope:wght@300;400;500;600;700&family=Alex+Brush&display=swap"
          rel="stylesheet"
        />
        {/* Analytics slot — add GA/Plausible script here */}
        {/* <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX" /> */}
      </head>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
