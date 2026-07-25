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
    <section id="gallery" className="section">
      <div className="container-site">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: "3rem", textAlign: "center" }}
        >
          <p className="section-eyebrow">Previous Editions</p>
          <h2 className="section-heading">
            Glimpses of the{" "}
            <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Night</span>
          </h2>
        </motion.div>

        {/* Gallery Grid */}
        <div className="gallery-grid">
          {GALLERY_IMAGES.map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`gallery-item span-${img.span}`}
              onClick={() => setSelectedImage(img.src)}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundImage: `url(${img.src})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transition: "transform 0.4s ease",
                }}
                className="gallery-bg"
              />
              <div className="gallery-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
            </motion.div>
          ))}
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
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(11,11,13,0.95)",
              backdropFilter: "blur(10px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem",
              cursor: "zoom-out",
            }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={selectedImage}
              alt="Enlarged gallery view"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                border: "1px solid rgba(212,175,55,0.2)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
            />
            
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: "absolute",
                top: "2rem",
                right: "2rem",
                background: "rgba(212,175,55,0.1)",
                border: "1px solid rgba(212,175,55,0.3)",
                color: "var(--gold)",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          grid-auto-rows: 240px;
          gap: 1.5rem;
        }
        
        .gallery-item {
          position: relative;
          overflow: hidden;
          cursor: zoom-in;
          border: 1px solid rgba(212,175,55,0.15);
        }
        
        .gallery-item:hover .gallery-bg {
          transform: scale(1.05);
        }
        
        .gallery-overlay {
          position: absolute;
          inset: 0;
          background: rgba(11,11,13,0.4);
          display: flex;
          alignItems: center;
          justifyContent: center;
          color: var(--gold);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .gallery-item:hover .gallery-overlay {
          opacity: 1;
        }

        /* Responsive masonry-like spans */
        @media (min-width: 768px) {
          .gallery-grid {
            grid-auto-rows: 280px;
          }
          .span-large {
            grid-column: span 2;
            grid-row: span 2;
          }
          .span-row {
            grid-column: span 2;
          }
          .span-col {
            grid-row: span 2;
          }
        }
      `}</style>
    </section>
  );
}
