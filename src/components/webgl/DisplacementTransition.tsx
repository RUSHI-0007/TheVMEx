"use client";

/**
 * DisplacementTransition — Liquid-gold displacement shader between chapters.
 *
 * Architecture:
 * - Hosted inside the persistent WebGLCanvas.
 * - Tracks the active chapter media DOM element ([data-chapter-media]).
 * - Synchronizes mesh position and dimensions to DOM rect each tick.
 * - Uniform uProgress is driven by ScrollTrigger between chapters.
 * - Shader creates molten liquid-gold ripples & flare along the transition wavefront.
 */

import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useAppStore } from "@/lib/store";

// Inline shader source to avoid async fetch / bundler plugin mismatches
const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform float uTime;
  uniform float uProgress;
  uniform vec2 uResolution;
  uniform sampler2D uTexture1;
  uniform sampler2D uTexture2;
  uniform vec3 uGoldColor;

  varying vec2 vUv;

  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float snoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
          dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
      mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
          dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(cos(0.55), sin(0.55), -sin(0.55), cos(0.55));
    for (int i = 0; i < 4; i++) {
      v += a * snoise(p);
      p = rot * p * 2.05 + vec2(0.12, 0.24);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;

    // Fluid distortion wave
    float n1 = fbm(uv * 3.5 + vec2(uTime * 0.12, uTime * 0.08));
    float n2 = fbm(uv * 5.0 - vec2(uTime * 0.09, uTime * 0.14));
    vec2 flow = vec2(n1, n2) * 0.35;

    float wave = sin(uProgress * 3.14159265);
    vec2 uv1 = uv + flow * wave * (1.0 - uProgress);
    vec2 uv2 = uv - flow * wave * uProgress;

    vec4 tex1 = texture2D(uTexture1, clamp(uv1, 0.0, 1.0));
    vec4 tex2 = texture2D(uTexture2, clamp(uv2, 0.0, 1.0));

    // Wavefront diagonal wipe
    float threshold = (uv.x * 0.4 + uv.y * 0.6) + n1 * 0.35;
    float split = smoothstep(uProgress - 0.12, uProgress + 0.12, threshold);

    vec4 blended = mix(tex2, tex1, split);

    // Liquid gold molten flare along the transition wavefront
    float distToFront = abs(threshold - uProgress);
    float goldBand = 1.0 - smoothstep(0.0, 0.09, distToFront);
    vec3 goldFlare = uGoldColor * goldBand * wave * 2.4;

    float specular = pow(max(0.0, n2), 3.0) * goldBand * wave * 1.5;

    gl_FragColor = vec4(blended.rgb + goldFlare + vec3(specular), 1.0);
  }
`;

export function DisplacementTransition() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size, viewport } = useThree();

  // Textures for chapters
  const texturesRef = useRef<THREE.Texture[]>([]);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const t1 = loader.load("/img/kiki-event.webp");
    const t2 = loader.load("/video/performer-hoodie-poster.jpg");
    const t3 = loader.load("/img/founder.webp"); // Fallback / Edition III texture

    t1.minFilter = THREE.LinearFilter;
    t1.generateMipmaps = false;
    t2.minFilter = THREE.LinearFilter;
    t2.generateMipmaps = false;
    t3.minFilter = THREE.LinearFilter;
    t3.generateMipmaps = false;

    texturesRef.current = [t1, t2, t3];

    return () => {
      t1.dispose();
      t2.dispose();
      t3.dispose();
    };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uTexture1: { value: null as THREE.Texture | null },
      uTexture2: { value: null as THREE.Texture | null },
      uGoldColor: { value: new THREE.Color("#E3C58A") },
    }),
    [size.width, size.height]
  );

  useFrame((state, delta) => {
    const mat = materialRef.current;
    const mesh = meshRef.current;
    if (!mat || !mesh) return;

    mat.uniforms.uTime.value += delta;

    // Check if chapter transition data attribute is present on window or DOM
    const transitionState = (
      window as Window & {
        __vmDisplacementState?: {
          visible: boolean;
          fromIdx: number;
          toIdx: number;
          progress: number;
          domRect?: DOMRect;
        };
      }
    ).__vmDisplacementState;

    if (
      !transitionState ||
      !transitionState.visible ||
      transitionState.progress <= 0 ||
      transitionState.progress >= 1
    ) {
      mesh.visible = false;
      return;
    }

    const { fromIdx, toIdx, progress, domRect } = transitionState;
    const textures = texturesRef.current;

    if (textures.length > Math.max(fromIdx, toIdx)) {
      mat.uniforms.uTexture1.value = textures[fromIdx];
      mat.uniforms.uTexture2.value = textures[toIdx];
    }

    mat.uniforms.uProgress.value = progress;

    // DOM-synced positioning
    let rect = domRect;
    if (!rect) {
      const activeEl = document.querySelector<HTMLElement>(
        `[data-chapter-media="${fromIdx}"]`
      );
      if (activeEl) rect = activeEl.getBoundingClientRect();
    }

    if (rect && rect.width > 0 && rect.height > 0) {
      mesh.visible = true;
      const pixelRatioX = viewport.width / size.width;
      const pixelRatioY = viewport.height / size.height;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      mesh.position.x = (centerX - size.width / 2) * pixelRatioX;
      mesh.position.y = -(centerY - size.height / 2) * pixelRatioY;
      mesh.position.z = 1;

      mesh.scale.x = rect.width * pixelRatioX;
      mesh.scale.y = rect.height * pixelRatioY;
    } else {
      mesh.visible = false;
    }
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
}
