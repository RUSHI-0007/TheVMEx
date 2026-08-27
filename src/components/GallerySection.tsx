"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type FilterTab = "all" | "photos" | "videos";

// Aspect ratio drives container shape — no fixed row height
type GalleryItem = {
  id: number;
  type: "image" | "video";
  src: string;
  alt: string;
  // CSS aspect-ratio value e.g. "9/16", "16/9", "1320/2868"
  aspectRatio: string;
  // Spans 2 columns on desktop (for wide/landscape items)
  wideOnDesktop?: boolean;
};

// ─── Gallery items ─────────────────────────────────────────────────────────
// Masquerade Night 2026 — real media, each sized to its natural resolution.
//   IMG_8961.PNG : 1320×2868  → portrait  1320/2868 ≈ 1:2.17
//   Video4.MOV   : phone shot → portrait  9:16
//   Video5.MOV   : excluded (137MB > GitHub limit) — host on Cloudinary/YouTube
//   Video6.MOV   : camera     → landscape 16:9
const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    type: "image",
    src: "/images/IMG_8961.PNG",
    alt: "Masquerade Night 2026 — masked guests at PIVO GARTEN",
    aspectRatio: "1320/2868", // portrait ~1:2.17
  },
  {
    id: 2,
    type: "video",
    src: "/videos/Video4.MOV",
    alt: "Masquerade Night 2026 — crowd reel",
    aspectRatio: "9/16", // portrait
  },
  {
    id: 3,
    type: "video",
    src: "/videos/Video6.MOV",
    alt: "Masquerade Night 2026 — moments reel",
    aspectRatio: "16/9", // landscape
    wideOnDesktop: true,
  },
];

// ─── Single gallery cell ────────────────────────────────────────────────────
function GalleryCell({
  item,
  index,
  onClick,
}: {
  item: GalleryItem;
  index: number;
  onClick: (item: GalleryItem) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={`overflow-hidden cursor-zoom-in group bg-[#0b0b0d] relative w-full${
        item.wideOnDesktop ? " md:col-span-2" : ""
      }`}
      style={{ aspectRatio: item.aspectRatio }}
      onClick={() => onClick(item)}
    >
      {item.type === "image" ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${item.src})` }}
        />
      ) : (
        <video
          src={item.src}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-[#0b0b0d]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        {item.type === "video" ? (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="rgba(201,162,75,0.9)"
            className="drop-shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 20 20" fill="none"
            className="scale-90 group-hover:scale-100 transition-transform duration-300">
            <line x1="10" y1="2" x2="10" y2="18" stroke="#d4af37" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="2" y1="10" x2="18" y2="10" stroke="#d4af37" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function GallerySection() {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const filteredItems = GALLERY_ITEMS.filter((item) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "photos") return item.type === "image";
    if (activeFilter === "videos") return item.type === "video";
    return true;
  });

  const FILTER_TABS: { id: FilterTab; label: string }[] = [
    { id: "all",    label: "All" },
    { id: "photos", label: "Photos" },
    { id: "videos", label: "Videos" },
  ];

  return (
    <section id="gallery" className="bg-[#131115] py-[72px]">
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-7 gap-5"
        >
          <div>
            <p className="font-body text-[0.6875rem] font-semibold tracking-[0.25em] uppercase text-gold-muted mb-2">
              Gallery
            </p>
            <h2 className="font-display text-[clamp(1.8rem,4vw,2.75rem)] font-bold text-text-primary leading-[1.1]">
              Masquerade Night<br />
              <span className="text-gold italic">2026</span>
            </h2>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-px shrink-0">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-2 font-body text-[0.7rem] tracking-[0.15em] uppercase transition-all duration-200 ${
                  activeFilter === tab.id
                    ? "bg-gold text-[#0b0b0d] font-semibold"
                    : "border border-gold/20 text-text-dim hover:text-gold hover:border-gold/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Gallery — aspect-ratio-aware, portrait/landscape containers */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          {/*
            Grid strategy:
            Mobile  : 2 columns, items flow naturally in their aspect ratios
            Desktop : 3 columns. Portrait items = 1 col (tall). Landscape = 2 cols (wide).
            Each item self-sizes vertically via aspect-ratio — no fixed row height.
          */}
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-0.5 items-start">
              {filteredItems.map((item, i) => (
                <GalleryCell
                  key={item.id}
                  item={item}
                  index={i}
                  onClick={setSelectedItem}
                />
              ))}
            </div>
          </AnimatePresence>
        </motion.div>

        <p className="font-body text-[0.875rem] tracking-[0.15em] uppercase text-text-dim text-center pt-6">
          Tap any photo or video to view
        </p>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[#0b0b0d]/95 backdrop-blur-md z-[9999] flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-full max-h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedItem.type === "image" ? (
                <img
                  src={selectedItem.src}
                  alt={selectedItem.alt}
                  className="max-w-full max-h-[85vh] object-contain shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gold/10"
                />
              ) : (
                <video
                  src={selectedItem.src}
                  controls
                  autoPlay
                  playsInline
                  className="max-w-full max-h-[85vh] object-contain shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gold/10"
                />
              )}
            </motion.div>

            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-6 right-6 md:top-8 md:right-8 bg-gold/10 border border-gold/30 text-gold w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-gold/20 transition-colors z-50 rounded-full"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
