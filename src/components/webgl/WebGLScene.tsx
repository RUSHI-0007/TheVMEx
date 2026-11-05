"use client";

/**
 * WebGLScene — the R3F Canvas that hosts all WebGL meshes.
 * frameloop="never" keeps Three.js out of the rAF loop.
 * The GSAP ticker advances it via gsap.ticker.add().
 *
 * (Temporary test mesh removed after proof of drawing)
 */

import React, { Component, useEffect, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { gsap } from "@/lib/gsap";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("WebGL initialization failed:", error.message);
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

/** Inner component that hooks into R3F and wires the GSAP tick. */
function TickBridge() {
  const { advance } = useThree();

  useEffect(() => {
    // Initial manual render call to ensure first frame is painted immediately
    advance(performance.now());
    const tick = (time: number) => advance(time * 1000);
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [advance]);

  return null;
}

export function WebGLScene() {
  return (
    <WebGLErrorBoundary>
      <Canvas
        frameloop="never"
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
        style={{ width: "100%", height: "100%" }}
      >
        <TickBridge />
        {/* Shaders and planes are mounted here in subsequent phases */}
      </Canvas>
    </WebGLErrorBoundary>
  );
}
