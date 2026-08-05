import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.thevmex.in"), 
  title: "TheVMEx | The VM Experience — Masquerade Night 2026",
  description:
    "Welcome to The VM Experience (TheVMEx). Join us for Masquerade Night — an exclusive evening of mystery, elegance, and live music featuring Poltergeist. Friday, 21st August 2026.",
  keywords: [
    "TheVMEx",
    "thevmex",
    "The VM Experience",
    "the vm experience",
    "VMEx",
    "Masquerade Night",
    "Masquerade Night Pune",
    "college event",
    "live music",
    "Poltergeist",
    "2026",
    "ticket booking",
    "exclusive events"
  ],
  authors: [{ name: "TheVMEx (The VM Experience)" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.thevmex.in",
    siteName: "TheVMEx — The VM Experience",
    title: "TheVMEx | The VM Experience — Masquerade Night 2026",
    description:
      "Welcome to The VM Experience. An exclusive evening shrouded in mystery & elegance. Live music by Poltergeist. Friday, 21st August 2026. Book now.",
    images: [
      {
        url: "/og-image.jpg", // ← Add event poster here
        width: 1200,
        height: 630,
        alt: "TheVMEx — The VM Experience | Masquerade Night 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TheVMEx | The VM Experience",
    description:
      "Welcome to The VM Experience. An exclusive evening shrouded in mystery & elegance. Live music by Poltergeist. 21 Aug 2026.",
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
      <body className="min-h-full antialiased overflow-x-hidden w-full">{children}</body>
    </html>
  );
}
