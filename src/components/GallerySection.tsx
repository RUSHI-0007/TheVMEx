"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GALLERY_IMAGES = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
    alt: "Event crowd dancing",
    className: "col-span-1 row-span-2", // tall
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop",
    alt: "DJ performance",
    className: "col-span-1 row-span-1",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=800&auto=format&fit=crop",
    alt: "Live music atmosphere",
    className: "col-span-1 row-span-1",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop",
    alt: "Festival lights",
    className: "col-span-2 row-span-1", // wide
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1470229722913-7c092bb4ace4?q=80&w=800&auto=format&fit=crop",
    alt: "Concert stage",
    className: "col-span-1 row-span-1",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=800&auto=format&fit=crop",
    alt: "People enjoying the event",
    className: "col-span-1 row-span-1",
  },
];

export default function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section id="gallery" className="bg-[#131115] py-[72px]">
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8 }}
          className="flex items-end justify-between mb-7 gap-4"
        >
          <h2 className="font-display text-[clamp(1.8rem,4vw,2.75rem)] font-bold text-text-primary leading-[1.1]">
            Glimpses<br />of the Night
          </h2>
          <p className="font-body text-[0.875rem] tracking-[0.2em] uppercase text-text-dim pb-1 shrink-0">
            Freshers Party 2025
          </p>
        </motion.div>

        {/* Gallery grid matching the HTML layout */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 auto-rows-[200px] md:auto-rows-[240px] gap-0.5 mb-5"
        >
          {GALLERY_IMAGES.map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`relative overflow-hidden cursor-zoom-in group ${img.className}`}
              onClick={() => setSelectedImage(img.src)}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${img.src})` }}
              />
              {/* Gold overlay on hover */}
              <div className="absolute inset-0 bg-gold/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <line x1="10" y1="2" x2="10" y2="18" stroke="#d4af37" strokeWidth="1.2" strokeLinecap="round"/>
                  <line x1="2" y1="10" x2="18" y2="10" stroke="#d4af37" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <p className="font-body text-[0.875rem] tracking-[0.15em] uppercase text-text-dim text-center pt-4">
          Tap any photo to view · Reels &amp; photos from past events
        </p>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[#0b0b0d]/95 backdrop-blur-md z-[9999] flex items-center justify-center p-8 cursor-zoom-out"
            onClick={() => setSelectedImage(null)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={selectedImage}
              alt="Enlarged gallery view"
              className="max-w-full max-h-full object-contain border border-gold/20 shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-8 right-8 bg-gold/10 border border-gold/30 text-gold w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-gold/20 transition-colors"
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
