// ============================================================
// THEVMEX — MASQUERADE NIGHT
// Single source of truth: update event data / ticket prices here
// ============================================================

export const BRAND = {
  name: "TheVMEx",
  legalName: "Manthan Manohar Khaire",
} as const;

export const EVENT = {
  name: "Masquerade Night",
  brand: BRAND.name,
  tagline: "An Evening Shrouded in Mystery & Elegance",
  date: "Friday, 21st August 2026",
  dateISO: "2026-08-21T20:00:00+05:30", // 8 PM IST
  venue: "Venue to be announced",
  venueAddress: null as string | null, // Set when confirmed
  artist: "Poltergeist",
  dressCode: "Formal / Semi-Formal · Masks encouraged",
  ageRestriction: "21+",
  upiId: "khairemanthan-1@okhdfcbank",
  upiName: "TheVMEx Events",
  adminPassword: process.env.ADMIN_PASSWORD, // Set ADMIN_PASSWORD in .env.local / Vercel env vars
  pendingExpiryMinutes: 60,
  socialLinks: {
    instagram: "https://www.instagram.com/thevmexperience?igsh=ZTF5d3BvanFiN2c5",
    whatsapp: "https://wa.me/918888822040", 
  },
  rsvpNumbers: [
    { name: "Support", number: "+91 88888 22040" }, 
  ],
  pastEvents: [
    {
      name: "Freshers Party 2025",
      attendees: 500,
      highlight: "The night that started it all",
    },
  ],
} as const;

export const TICKET_TIERS = [
  {
    id: "earlybird",
    label: "Early Bird",
    description: "Limited time early bird ticket for Masquerade Night.",
    price: 499,
    inclusions: [
      "1 Entry pass",
      "Welcome drink",
      "Access to all performances"
    ],
    totalInventory: 100,
    available: 100, // This should come from DB in real usage
    badge: "Ends Aug 7",
    highlighted: true,
  }
] as const;

export type TicketTierId = (typeof TICKET_TIERS)[number]["id"];

export const FAQS = [
  {
    q: "What is the refund policy?",
    a: "Tickets are non-refundable once the payment is verified and confirmed. In case of event cancellation by TheVMEx, a full refund will be processed within 7 working days.",
  },
  {
    q: "When does entry open?",
    a: "Doors open at 7:30 PM. The show starts at 8:00 PM sharp. Late entry may be subject to availability.",
  },
  {
    q: "Is ID proof required at entry?",
    a: "Yes. A valid government-issued photo ID is mandatory for all attendees. Entry will be denied without ID proof.",
  },
  {
    q: "Is parking available?",
    a: "Parking details will be shared once the venue is confirmed. We recommend using rideshare services for convenience.",
  },
  {
    q: "Do I need to wear a mask?",
    a: "Masks are strongly encouraged as part of the masquerade theme. Masked guests get priority entry and a special surprise!",
  },
  {
    q: "How long does payment verification take?",
    a: "Most payments are verified within 1–2 hours during business hours. During peak booking windows (48 hours before the event), verification may take slightly longer. You'll receive a confirmation notification once approved.",
  },
  {
    q: "What if my payment is not verified?",
    a: "If your order expires before verification, your seat is released and you can rebook. If you believe there is an error, contact us via WhatsApp with your Order ID and UTR number.",
  },
  {
    q: "Can I transfer my ticket to someone else?",
    a: "Tickets are non-transferable. The name on the ticket must match the ID presented at entry.",
  },
];

// NOTE: PINs are intentionally NOT stored here.
// They are kept in ADMIN_CREDENTIALS env var (server-side only).
// This array is used only for the client-side name dropdown in /admin.
export const ADMIN_TEAM_MEMBERS = [
  { id: "a1", name: "Manthan" },
// ← Add names here; add matching credentials to ADMIN_CREDENTIALS env var
] as const;

export const PAYMENT = {
  upiId: EVENT.upiId,
  upiName: EVENT.upiName,
  maxScreenshotSizeMb: 5,
} as const;

export const CONTACT = {
  email: "khairemanthan@gmail.com",
  phone: "+91 88888 22040",
  rsvp: [{ name: "Support", phone: "+91 88888 22040" }],
} as const;

export const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "default_secret_for_development";
