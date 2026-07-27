"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Placeholder Images ──────────────────────────────────────────────────────
const GALLERY_IMAGES = [
  { id: 1, src: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop", alt: "Event crowd dancing", span: "row" },
  { id: 2, src: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop", alt: "DJ performance", span: "col" },
  { id: 3, src: "https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=800&auto=format&fit=crop", alt: "Live music atmosphere", span: "normal" },
  { id: 4, src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop", alt: "Festival lights", span: "normal" },
  { id: 5, src: "https://images.unsplash.com/photo-1470229722913-7c092bb4ace4?q=80&w=800&auto=format&fit=crop", alt: "Concert stage", span: "large" },
  { id: 6, src: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=800&auto=format&fit=crop", alt: "People enjoying the event", span: "row" },
  { id: 7, src: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=800&auto=format&fit=crop", alt: "Musical instruments", span: "normal" },
];

export default function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Close lightbox on Escape key
  if (typeof window !== "undefined") {
    window.onkeydown = (e) => {
      if (e.key === "Escape") setSelectedImage(null);
    };
  }

  return (
    <section id="gallery" className="relative z-10 py-28 md:py-30">
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <p className="font-body text-[0.6875rem] font-semibold tracking-[0.25em] uppercase text-gold-muted mb-3">Previous Editions</p>
          <h2 className="font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-tight text-text-primary mb-6">
            Glimpses of the{" "}
            <span className="text-gold italic">Night</span>
          </h2>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] auto-rows-[240px] md:auto-rows-[280px] gap-6">
          {GALLERY_IMAGES.map((img, i) => {
            let spanClass = "";
            if (img.span === "large") spanClass = "md:col-span-2 md:row-span-2";
            else if (img.span === "row") spanClass = "md:col-span-2";
            else if (img.span === "col") spanClass = "md:row-span-2";

            return (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative overflow-hidden cursor-zoom-in border border-gold/15 group ${spanClass}`}
                onClick={() => setSelectedImage(img.src)}
              >
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-400 ease-in-out group-hover:scale-105"
                  style={{ backgroundImage: `url(${img.src})` }}
                />
                <div className="absolute inset-0 bg-[#0b0b0d]/40 flex items-center justify-center text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
              </motion.div>
            );
          })}
        </div>
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
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
            />
            
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-8 right-8 bg-gold/10 border border-gold/30 text-gold w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-gold/20 hover:scale-105"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
