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
  venue: "PIVO GARTEN",
  venueAddress: "https://maps.app.goo.gl/1cveQgwLyPs8v3fo6?g_st=aw",
  artist: "Poltergeist",
  dressCode: "Formal / Semi-Formal · Masks encouraged",
  ageRestriction: "21+",
  upiId: "khairemanthan-1@okhdfcbank",
  upiName: "TheVMEx Events",
  adminPassword: process.env.ADMIN_PASSWORD, // Set ADMIN_PASSWORD in .env.local / Vercel env vars
  pendingExpiryMinutes: 300,
  socialLinks: {
    instagram: "https://www.instagram.com/thevmexperience?igsh=ZTF5d3BvanFiN2c5",
    whatsapp: "https://wa.me/918888822040", 
  },
  rsvpNumbers: [
    { name: "Support", number: "+91 88888 22040" }, 
  ],
  pastEvents: [
    {
      name: "TheVMEx Night 2025",
      attendees: 500,
      highlight: "The night that started it all",
    },
  ],
} as const;

export const TICKET_TIERS = [
  {
    id: "female_pass",
    label: "Female Pass",
    description: "Entry pass for one female.",
    price: 799,
    inclusions: [
      "1 Entry pass",
      "Welcome drink",
      "Access to all performances"
    ],
    totalInventory: 150,
    available: 150,
    badge: "Discounted",
    highlighted: true,
  },
  {
    id: "male_pass",
    label: "Male Pass",
    description: "Entry pass for one male.",
    price: 999,
    inclusions: [
      "1 Entry pass",
      "Welcome drink",
      "Access to all performances"
    ],
    totalInventory: 150,
    available: 150,
    badge: "Limited",
    highlighted: false,
  },
  {
    id: "couple_pass",
    label: "Couple Pass",
    description: "Entry pass for one couple.",
    price: 1599,
    inclusions: [
      "Entry for a couple",
      "Welcome drinks",
      "Access to all performances"
    ],
    totalInventory: 100,
    available: 100,
    badge: "Popular",
    highlighted: true,
  },
  {
    id: "group_pass",
    label: "Group of 5",
    description: "Entry pass for a group of 5.",
    price: 3999,
    inclusions: [
      "Entry for 5 people",
      "Welcome drinks",
      "Access to all performances"
    ],
    totalInventory: 50,
    available: 50,
    badge: "Value",
    highlighted: false,
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
    a: "Doors open at 5:00 PM. The show starts at 5:00 PM onwards. Late entry subject to capacity.",
  },
  {
    q: "Is ID proof required at entry?",
    a: "Yes. A valid government-issued photo ID is mandatory for all attendees. Entry will be denied without ID proof.",
  },
  {
    q: "Is parking available?",
    a: "Parking details will be shared at the venue. We recommend using rideshare services for convenience.",
  },
  {
    q: "Do I need to wear a mask?",
    a: "Masks are strongly encouraged as part of the masquerade theme. Masked guests get priority entry and a special surprise! Masks will also be available at the venue.",
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
