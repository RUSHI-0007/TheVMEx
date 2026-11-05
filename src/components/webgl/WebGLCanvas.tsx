"use client";

/**
 * WebGLCanvas — the single persistent R3F canvas for the entire site.
 *
 * Layer order (bottom → top):
 *   [0] .bg-tween-layer   fixed div   background-color tweens
 *   [1] <canvas>          fixed       WebGL visuals, pointer-events: none
 *   [2] DOM content       normal flow sections
 */

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const WebGLScene = dynamic(
  () => import("./WebGLScene").then((m) => m.WebGLScene),
  { ssr: false },
);

function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") ||
          canvas.getContext("webgl") ||
          canvas.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
}

export function WebGLCanvas() {
  const [canRenderWebGL, setCanRenderWebGL] = useState(false);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bgRef.current) {
      (window as Window & { __vmBgLayer?: HTMLElement }).__vmBgLayer =
        bgRef.current;
    }
    if (isWebGLAvailable()) {
      setCanRenderWebGL(true);
    }
  }, []);

  return (
    <>
      {/* Background color tween target — sits behind the canvas */}
      <div
        ref={bgRef}
        className="vm-bg-layer"
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          backgroundColor: "var(--color-bg)",
          pointerEvents: "none",
        }}
      />

      {/* WebGL canvas — above bg, below DOM content */}
      {canRenderWebGL && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          <WebGLScene />
        </div>
      )}
    </>
  );
}
