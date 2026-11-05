"use client";

/**
 * GoldDust — Subtle ambient floating gold particles in 3D space.
 *
 * Drifts organically and accelerates with scroll velocity.
 * Gated on quality tier (HIGH = 160 particles, MEDIUM = 70, LOW = disabled).
 */

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAppStore } from "@/lib/store";

export function GoldDust() {
  const qualityTier = useAppStore((s) => s.qualityTier);
  const scrollVelocity = useAppStore((s) => s.scrollVelocity);

  const count = useMemo(() => {
    if (qualityTier === "LOW") return 0;
    if (qualityTier === "MEDIUM") return 70;
    return 160;
  }, [qualityTier]);

  const pointsRef = useRef<THREE.Points>(null);

  // Generate particle positions, speeds, and initial offsets
  const [positions, speeds, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const phs = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 20; // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12; // z

      spd[i] = 0.2 + Math.random() * 0.5;
      phs[i] = Math.random() * Math.PI * 2;
    }

    return [pos, spd, phs];
  }, [count]);

  // Texture for soft circular glowing gold particle
  const particleTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(227, 197, 138, 1)");   // #E3C58A (gold-300)
    grad.addColorStop(0.35, "rgba(201, 164, 92, 0.7)"); // #C9A45C (gold-500)
    grad.addColorStop(1, "rgba(201, 164, 92, 0)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current || count === 0) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;

    // Dampened scroll velocity effect
    const velEffect = Math.min(Math.abs(scrollVelocity) * 0.0008, 0.08);

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      // Gentle drift + velocity upward push
      posArray[idx + 1] += (speeds[i] * 0.008 + velEffect) * (delta * 60);

      // Subtle horizontal sway
      posArray[idx + 0] += Math.sin(state.clock.elapsedTime * 0.4 + phases[i]) * 0.002;

      // Wrap around bounds
      if (posArray[idx + 1] > 8) {
        posArray[idx + 1] = -8;
      }
    }

    posAttr.needsUpdate = true;
  });

  if (count === 0 || !particleTexture) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        map={particleTexture}
        transparent
        opacity={0.45}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
