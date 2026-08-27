"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type FilterTab = "all" | "photos" | "videos";

type GalleryItem = {
  id: number;
  type: "image" | "video";
  src: string;
  alt: string;
  className: string;
};

// ─── Gallery items ─────────────────────────────────────────────────────────
// Masquerade Night 2026 — real media only.
// MOV files play natively on Safari/iOS. Convert to mp4 for full cross-browser support.
const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    type: "image",
    src: "/images/IMG_8961.PNG",
    alt: "Masquerade Night 2026 — masked guests at PIVO GARTEN",
    className: "col-span-2 row-span-2", // hero frame
  },
  {
    id: 2,
    type: "video",
    src: "/videos/Video4.MOV",
    alt: "Masquerade Night 2026 — crowd reel",
    className: "col-span-1 row-span-1",
  },
  {
    id: 3,
    type: "video",
    src: "/videos/Video5.MOV",
    alt: "Masquerade Night 2026 — stage reel",
    className: "col-span-1 row-span-1",
  },
  {
    id: 4,
    type: "video",
    src: "/videos/Video6.MOV",
    alt: "Masquerade Night 2026 — moments reel",
    className: "col-span-2 md:col-span-3 row-span-1",
  },
];



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

        {/* Gallery grid */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 auto-rows-[180px] md:auto-rows-[220px] gap-0.5 mb-5"
        >
          <AnimatePresence mode="popLayout">
          {filteredItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className={`relative overflow-hidden cursor-zoom-in group bg-[#0b0b0d] ${item.className}`}
              onClick={() => setSelectedItem(item)}
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

              {/* Overlay with play/view icon */}
              <div className="absolute inset-0 bg-[#0b0b0d]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                {item.type === "video" ? (
                  // Play icon for videos
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(201,162,75,0.9)" className="drop-shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                ) : (
                  // Zoom icon for images
                  <svg width="24" height="24" viewBox="0 0 20 20" fill="none" className="scale-90 group-hover:scale-100 transition-transform duration-300">
                    <line x1="10" y1="2" x2="10" y2="18" stroke="#d4af37" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="2" y1="10" x2="18" y2="10" stroke="#d4af37" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                )}
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        </motion.div>

        <p className="font-body text-[0.875rem] tracking-[0.15em] uppercase text-text-dim text-center pt-4">
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
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking media
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
