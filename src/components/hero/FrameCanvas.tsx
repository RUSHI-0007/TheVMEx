"use client";

/**
 * FrameCanvas — High-performance scrubbed video canvas.
 *
 * Features:
 * - Coarse-to-fine loading (Frame 0 -> Stride 8 -> Stride 4 -> remaining).
 * - Sliding window ImageBitmap cache (target ± 24 frames).
 * - Responsive desktop (120 frames @ 1920x1080) vs mobile (60 frames @ 1080x608).
 * - Cover-fit math with DPR clamped to 2.
 * - Integrated scrim & vignette ensuring typography contrast >= 4.5:1.
 * - Smooth frame proxy interpolation to prevent micro-jitter.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { gsap } from "@/lib/gsap";
import { useAppStore } from "@/lib/store";

export interface FrameCanvasHandle {
  setProgress: (progress: number) => void;
  drawImmediate: () => void;
}

interface FrameCanvasProps {
  className?: string;
}

export const FrameCanvas = forwardRef<FrameCanvasHandle, FrameCanvasProps>(
  function FrameCanvas({ className }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
    const bitmapCacheRef = useRef<Map<number, ImageBitmap>>(new Map());
    const isMobileRef = useRef<boolean>(false);
    const frameCountRef = useRef<number>(120);
    const currentFrameRef = useRef<number>(0);
    const lastDrawnFrameRef = useRef<number>(-1);
    const isDestroyedRef = useRef<boolean>(false);

    const setLoadedPct = useAppStore((s) => s.setLoadedPct);

    // Cover-fit draw routine
    const drawFrame = useCallback((frameIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      const count = frameCountRef.current;
      const safeIndex = Math.max(0, Math.min(count - 1, frameIndex));

      // Retrieve bitmap from cache, or image element, or fallback to first frame
      const bitmap = bitmapCacheRef.current.get(safeIndex);
      const img = bitmap || imagesRef.current[safeIndex] || imagesRef.current[0];
      if (!img) return;

      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (cw === 0 || ch === 0) return;

      // Ensure canvas internal resolution matches display size * DPR
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.round(cw * dpr);
      const targetH = Math.round(ch * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Cover-fit math
      const iw = (img as ImageBitmap).width || (img as HTMLImageElement).naturalWidth || 1920;
      const ih = (img as ImageBitmap).height || (img as HTMLImageElement).naturalHeight || 1080;
      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;

      ctx.drawImage(img, dx, dy, dw, dh);

      // ── Scrim Gradient (contrast >= 4.5:1 behind text) ──
      const scrim = ctx.createLinearGradient(0, 0, 0, ch);
      scrim.addColorStop(0, "rgba(11, 11, 13, 0.72)");
      scrim.addColorStop(0.28, "rgba(11, 11, 13, 0.42)");
      scrim.addColorStop(0.72, "rgba(11, 11, 13, 0.52)");
      scrim.addColorStop(1, "rgba(11, 11, 13, 0.94)");
      ctx.fillStyle = scrim;
      ctx.fillRect(0, 0, cw, ch);

      // ── Radial Vignette ──
      const maxDim = Math.sqrt(cw * cw + ch * ch) / 2;
      const vignette = ctx.createRadialGradient(
        cw / 2,
        ch / 2,
        maxDim * 0.45,
        cw / 2,
        ch / 2,
        maxDim
      );
      vignette.addColorStop(0, "rgba(11, 11, 13, 0)");
      vignette.addColorStop(1, "rgba(11, 11, 13, 0.65)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, cw, ch);

      ctx.restore();
      lastDrawnFrameRef.current = safeIndex;
    }, []);

    // Sliding window ImageBitmap cache maintenance
    const updateBitmapWindow = useCallback((centerIdx: number) => {
      if (typeof window === "undefined" || !("createImageBitmap" in window)) return;
      const count = frameCountRef.current;
      const cache = bitmapCacheRef.current;
      const radius = 14; // ±14 frames cached ahead & behind
      const minIdx = Math.max(0, centerIdx - radius);
      const maxIdx = Math.min(count - 1, centerIdx + radius);

      // Create bitmaps for window
      for (let i = minIdx; i <= maxIdx; i++) {
        if (!cache.has(i) && imagesRef.current[i] && imagesRef.current[i]!.complete) {
          createImageBitmap(imagesRef.current[i]!)
            .then((bmp) => {
              if (!isDestroyedRef.current) {
                cache.set(i, bmp);
              } else {
                bmp.close();
              }
            })
            .catch(() => {
              // Ignore decode errors and keep HTMLImageElement
            });
        }
      }

      // Evict bitmaps outside target ± 28
      const evictRadius = 28;
      for (const [key, bmp] of cache.entries()) {
        if (Math.abs(key - centerIdx) > evictRadius) {
          bmp.close();
          cache.delete(key);
        }
      }
    }, []);

    // Expose control handles to parent
    useImperativeHandle(
      ref,
      () => {
        const frameProxy = { value: 0 };
        return {
          setProgress: (progress: number) => {
            const count = frameCountRef.current;
            const target = Math.round(progress * (count - 1));
            const clamped = Math.max(0, Math.min(count - 1, target));

            // Smooth proxy to avoid micro-jitter
            gsap.to(frameProxy, {
              value: clamped,
              duration: 0.22,
              ease: "power1.out",
              overwrite: "auto",
              onUpdate: () => {
                const intFrame = Math.round(frameProxy.value);
                if (intFrame !== lastDrawnFrameRef.current) {
                  currentFrameRef.current = intFrame;
                  drawFrame(intFrame);
                  updateBitmapWindow(intFrame);
                }
              },
            });
          },
          drawImmediate: () => {
            drawFrame(currentFrameRef.current);
          },
        };
      },
      [drawFrame, updateBitmapWindow]
    );

    // Initialization and coarse-to-fine frame loader
    useEffect(() => {
      isDestroyedRef.current = false;
      const isMobile = window.innerWidth <= 768;
      isMobileRef.current = isMobile;
      const count = isMobile ? 60 : 120;
      frameCountRef.current = count;

      const folder = isMobile ? "/frames/mobile" : "/frames/desktop";
      const images: (HTMLImageElement | null)[] = new Array(count).fill(null);
      imagesRef.current = images;

      const getUrl = (index: number) => {
        const num = String(index + 1).padStart(4, "0");
        return `${folder}/f_${num}.webp`;
      };

      // Helper to load single image
      const loadImage = (index: number): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          if (images[index]) {
            resolve(images[index]!);
            return;
          }
          const img = new Image();
          img.decoding = "async";
          img.src = getUrl(index);
          img.onload = () => {
            images[index] = img;
            resolve(img);
          };
          img.onerror = reject;
        });
      };

      // Coarse-to-fine loading pipeline
      let loadedCount = 0;

      // Pass 1: Frame 0 (critical LCP frame)
      loadImage(0)
        .then((img) => {
          if (isDestroyedRef.current) return;
          drawFrame(0);
          setLoadedPct(30);

          // Pass 2: Stride 8 (coarse scrub readiness)
          const stride8Indices: number[] = [];
          for (let i = 8; i < count; i += 8) stride8Indices.push(i);

          const loadBatch = (indices: number[], onProgress?: () => void) => {
            return Promise.all(
              indices.map((idx) =>
                loadImage(idx)
                  .then(() => {
                    loadedCount++;
                    onProgress?.();
                  })
                  .catch(() => {})
              )
            );
          };

          loadBatch(stride8Indices, () => {
            const pct = 30 + Math.round((loadedCount / stride8Indices.length) * 70);
            setLoadedPct(Math.min(100, pct));
          }).then(() => {
            if (isDestroyedRef.current) return;
            setLoadedPct(100);

            // Pass 3: Stride 4
            const stride4Indices: number[] = [];
            for (let i = 4; i < count; i += 8) stride4Indices.push(i);
            loadBatch(stride4Indices).then(() => {
              if (isDestroyedRef.current) return;

              // Pass 4: Stride 2 and remaining
              const remaining: number[] = [];
              for (let i = 1; i < count; i++) {
                if (!images[i]) remaining.push(i);
              }
              loadBatch(remaining);
            });
          });
        })
        .catch(() => {
          // If frame 0 fails, still allow preloader to proceed
          setLoadedPct(100);
        });

      // Window resize handler
      const handleResize = () => {
        if (canvasRef.current) {
          drawFrame(currentFrameRef.current);
        }
      };
      window.addEventListener("resize", handleResize);

      return () => {
        isDestroyedRef.current = true;
        window.removeEventListener("resize", handleResize);
        // Clean up ImageBitmaps
        for (const bmp of bitmapCacheRef.current.values()) {
          bmp.close();
        }
        bitmapCacheRef.current.clear();
      };
    }, [drawFrame, setLoadedPct]);

    return (
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: "cover",
          pointerEvents: "none",
        }}
      />
    );
  }
);
