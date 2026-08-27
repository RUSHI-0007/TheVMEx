import type { Metadata, Viewport } from "next";
import "./globals.css";

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
    "private event organizer"
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
      "TheVMEx — premium event experiences in Pune. Masquerade Night 2026 complete. Follow for what’s next.",
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
