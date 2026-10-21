"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AnimatePresence, motion } from "framer-motion";
import {
  Aperture,
  Calendar,
  Camera,
  Maximize2,
  Shuffle,
  Sliders,
  Sparkles,
  X,
} from "lucide-react";
import photosData from "../../public/photos/photos.json";
import { useDarkroom } from "@/context/DarkroomContext";
import { soundEngine } from "@/utils/sound";

export interface PhotoRecord {
  id: string;
  frame: string;
  title: string;
  date: string;
  camera: string;
  exif: {
    iso: string;
    aperture: string;
    shutter: string;
    developer: string;
  };
  caption: string;
  src: string;
  aspect: string;
  palette: string[];
  seed: number;
}

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying float vWave;
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Distance from pointer in UV space
    float dist = distance(uv, uMouse);
    float ripple = sin(dist * 22.0 - uTime * 5.0) * exp(-dist * 4.5);
    float elevation = ripple * 0.085 * uHover;

    pos.z += elevation;
    vWave = elevation;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying float vWave;
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;
  uniform float uSeed;
  uniform float uAberration;

  void main() {
    vec2 uv = vUv;
    vec2 toMouse = uv - uMouse;
    float dist = length(toMouse);

    // Ripple UV displacement on hover
    float wave = sin(dist * 28.0 - uTime * 6.0) * exp(-dist * 5.0) * 0.022 * uHover;
    vec2 displacedUv = uv + normalize(toMouse + vec2(0.0001)) * wave;

    // Chromatic aberration shift (RGB split amplified by hover)
    float shift = (0.003 + 0.016 * uHover * uAberration) * (1.0 + sin(uTime * 2.0 + uSeed) * 0.25);
    vec2 dir = normalize(toMouse + vec2(0.001));

    float r = texture2D(uTexture, clamp(displacedUv + dir * shift, 0.0, 1.0)).r;
    float g = texture2D(uTexture, clamp(displacedUv, 0.0, 1.0)).g;
    float b = texture2D(uTexture, clamp(displacedUv - dir * shift, 0.0, 1.0)).b;

    vec3 color = vec3(r, g, b);

    // Subtle darkroom amber safelight rim near cursor
    float spot = exp(-dist * 4.2) * uHover;
    vec3 amber = vec3(1.0, 0.623, 0.11);
    color = mix(color, color + amber * 0.28, spot);

    // Fine silver grain shimmer
    float grain = fract(sin(dot(uv * (uTime * 0.05 + uSeed), vec2(12.9898, 78.233))) * 43758.5453);
    color += (grain - 0.5) * 0.045;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function ShaderPhotoPlane({
  src,
  seed,
  hovered,
  mouseUv,
  aberrationStrength,
}: {
  src: string;
  seed: number;
  hovered: boolean;
  mouseUv: { x: number; y: number };
  aberrationStrength: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let active = true;
    const loader = new THREE.TextureLoader();
    loader.load(
      src,
      (loaded) => {
        if (!active) return;
        loaded.minFilter = THREE.LinearFilter;
        loaded.magFilter = THREE.LinearFilter;
        loaded.needsUpdate = true;
        setTexture(loaded);
      },
      undefined,
      () => {
        // Fallback procedural data texture if SVG fails
      }
    );
    return () => {
      active = false;
    };
  }, [src]);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: new THREE.Texture() },
      uTime: { value: 0 },
      uHover: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uSeed: { value: seed },
      uAberration: { value: aberrationStrength },
    }),
    [seed, aberrationStrength]
  );

  useEffect(() => {
    if (texture) {
      uniforms.uTexture.value = texture;
    }
  }, [texture, uniforms]);

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
    uniforms.uHover.value = THREE.MathUtils.lerp(
      uniforms.uHover.value,
      hovered ? 1.0 : 0.0,
      0.12
    );
    uniforms.uMouse.value.lerp(new THREE.Vector2(mouseUv.x, 1.0 - mouseUv.y), 0.18);
    uniforms.uAberration.value = aberrationStrength;
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2.3, 2.85, 32, 32]} />
      <shaderMaterial
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
      />
    </mesh>
  );
}

function PhotoCard({
  photo,
  onSelect,
  webglEnabled,
  aberrationStrength,
}: {
  photo: PhotoRecord;
  onSelect: (p: PhotoRecord) => void;
  webglEnabled: boolean;
  aberrationStrength: number;
}) {
  const [hovered, setHovered] = useState(false);
  const [mouseUv, setMouseUv] = useState({ x: 0.5, y: 0.5 });

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMouseUv({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
  };

  return (
    <article className="group relative flex flex-col border border-darkroom-border bg-[#0D0D0D] p-3 transition-all duration-300 hover:border-darkroom-amber/80 hover:shadow-[0_0_32px_rgba(255,159,28,0.14)]">
      {/* Top negative frame header */}
      <div className="mb-2 flex items-center justify-between font-mono text-[10px] tracking-widest text-darkroom-muted">
        <span className="text-darkroom-amber font-semibold">FRAME // {photo.frame}</span>
        <span>{photo.id}</span>
        <span>ISO {photo.exif.iso}</span>
      </div>

      {/* Interactive WebGL Shader Viewport + Fallback Image Layer */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Inspect ${photo.title} in fullscreen darkroom loupe`}
        onClick={() => {
          soundEngine.playShutter();
          onSelect(photo);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            soundEngine.playShutter();
            onSelect(photo);
          }
        }}
        onMouseEnter={() => {
          setHovered(true);
          soundEngine.playHover();
        }}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={handlePointerMove}
        className="relative aspect-[4/5] w-full cursor-pointer overflow-hidden border border-darkroom-border/80 bg-[#050505]"
      >
        {/* Base Optimized Image (always present for instant paint, SEO, and fallback) */}
        <img
          src={photo.src}
          alt={photo.title}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-700 ${
            hovered ? "scale-105" : "scale-100"
          }`}
        />

        {/* WebGL GLSL Shader Canvas Overlay */}
        {webglEnabled && (
          <div className="pointer-events-none absolute inset-0">
            <Canvas
              camera={{ position: [0, 0, 2.15], fov: 50 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            >
              <ShaderPhotoPlane
                src={photo.src}
                seed={photo.seed}
                hovered={hovered}
                mouseUv={mouseUv}
                aberrationStrength={aberrationStrength}
              />
            </Canvas>
          </div>
        )}

        {/* Hover EXIF & Shader Telemetry Badge */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 font-mono text-[10px]">
          <span className="text-darkroom-amber">
            {hovered ? "GLSL // RIPPLE + RGB SHIFT ACTIVE" : `${photo.exif.aperture} · ${photo.exif.shutter}`}
          </span>
          <span className="inline-flex items-center gap-1 border border-darkroom-amber/40 bg-black/70 px-2 py-0.5 text-darkroom-silver group-hover:border-darkroom-amber group-hover:text-darkroom-amber">
            <Maximize2 className="h-2.5 w-2.5" />
            <span>EXIF LOUPE</span>
          </span>
        </div>
      </div>

      {/* Caption & Camera Footer */}
      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div>
          <h3 className="font-display text-base font-bold tracking-wide text-white group-hover:text-darkroom-amber">
            {photo.title}
          </h3>
          <p className="mt-1 line-clamp-2 font-mono text-[11px] leading-relaxed text-darkroom-muted">
            {photo.caption}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-darkroom-border/60 pt-2 font-mono text-[10px] text-darkroom-muted">
          <span className="truncate max-w-[75%]">{photo.camera.split("·")[0]}</span>
          <span>{photo.date}</span>
        </div>
      </div>
    </article>
  );
}

export function WebGLGallery() {
  const { reducedMotion, shuffleKey, triggerShuffle } = useDarkroom();
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoRecord | null>(null);
  const [webglEnabled, setWebglEnabled] = useState(true);
  const [aberrationStrength, setAberrationStrength] = useState(1.2);

  useEffect(() => {
    // Respect reduced motion or low-power mobile devices automatically
    const isLowPower =
      reducedMotion ||
      (typeof navigator !== "undefined" &&
        navigator.hardwareConcurrency &&
        navigator.hardwareConcurrency <= 2);
    if (isLowPower) {
      setWebglEnabled(false);
    }
  }, [reducedMotion]);

  // Close modal on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedPhoto(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const orderedPhotos = useMemo(() => {
    const list = [...(photosData as PhotoRecord[])];
    if (shuffleKey === 0) return list;
    // Deterministic shuffle based on shuffleKey
    return list.sort((a, b) => {
      const hashA = Math.sin(a.seed * (shuffleKey + 1)) * 1000;
      const hashB = Math.sin(b.seed * (shuffleKey + 1)) * 1000;
      return (hashA - Math.floor(hashA)) - (hashB - Math.floor(hashB));
    });
  }, [shuffleKey]);

  return (
    <section
      id="webgl-gallery"
      aria-labelledby="gallery-heading"
      className="relative border-t border-darkroom-border bg-[#0A0A0A] py-24 px-4 sm:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header & Shader Controls */}
        <div className="mb-12 flex flex-col justify-between gap-6 border-b border-darkroom-border pb-6 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-darkroom-amber">
              <Sparkles className="h-3.5 w-3.5" />
              <span>02 // ARCHIVAL SILVER GELATIN PLATES (WEBGL GLSL GALLERY)</span>
            </div>
            <h2
              id="gallery-heading"
              className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl"
            >
              ABSTRACT OPTICS & SHADER PLATES
            </h2>
            <p className="mt-2 max-w-2xl font-mono text-xs leading-relaxed text-darkroom-muted">
              Hover any negative plate to excite the custom GLSL displacement & chromatic aberration shader. Click a plate to open the fullscreen darkroom loupe and inspect full EXIF chemical telemetry.
            </p>
          </div>

          {/* Interactive Shader & Shuffle Controls */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-2 border border-darkroom-border bg-darkroom-surface px-3 py-1.5">
              <Sliders className="h-3.5 w-3.5 text-darkroom-amber" />
              <label htmlFor="aberration-slider" className="text-[11px] text-darkroom-muted">
                DISPERSION:
              </label>
              <input
                id="aberration-slider"
                type="range"
                min="0"
                max="2.5"
                step="0.1"
                value={aberrationStrength}
                onChange={(e) => setAberrationStrength(parseFloat(e.target.value))}
                className="w-20 accent-darkroom-amber cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={triggerShuffle}
              className="inline-flex items-center gap-1.5 border border-darkroom-border bg-darkroom-surface px-3 py-1.5 text-xs text-darkroom-silver transition hover:border-darkroom-amber hover:text-darkroom-amber"
            >
              <Shuffle className="h-3.5 w-3.5 text-darkroom-amber" />
              <span>Shuffle Plates</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playShutter();
                setWebglEnabled((prev) => !prev);
              }}
              aria-pressed={webglEnabled}
              className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs transition ${
                webglEnabled
                  ? "border-darkroom-amber/70 bg-darkroom-amber/15 text-darkroom-amber"
                  : "border-darkroom-border bg-darkroom-surface text-darkroom-muted"
              }`}
            >
              <span>{webglEnabled ? "GLSL SHADERS: ON" : "GLSL SHADERS: ECO"}</span>
            </button>
          </div>
        </div>

        {/* 6-Plate Responsive Contact Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {orderedPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onSelect={setSelectedPhoto}
              webglEnabled={webglEnabled}
              aberrationStrength={aberrationStrength}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen EXIF Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md sm:p-8"
            onClick={() => setSelectedPhoto(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lightbox-title"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              transition={{ type: "spring", damping: 24, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="relative grid max-h-[90vh] w-full max-w-5xl grid-cols-1 overflow-y-auto border border-darkroom-amber/60 bg-[#0C0C0C] shadow-[0_0_70px_rgba(255,159,28,0.2)] lg:grid-cols-12"
            >
              {/* Left 7 Cols: High-Contrast Plate Inspection */}
              <div className="relative flex items-center justify-center border-b border-darkroom-border bg-[#050505] p-6 lg:col-span-7 lg:border-b-0 lg:border-r">
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.title}
                  className="max-h-[72vh] w-auto object-contain border border-darkroom-border"
                />
                <div className="absolute top-3 left-3 bg-black/80 px-2.5 py-1 font-mono text-[10px] tracking-widest text-darkroom-amber">
                  LOUPE MAGNIFICATION // 4.0x OPTICAL
                </div>
              </div>

              {/* Right 5 Cols: EXIF Metadata & Darkroom Concept Panel */}
              <div className="flex flex-col justify-between p-6 lg:col-span-5">
                <div>
                  <div className="flex items-center justify-between border-b border-darkroom-border pb-3">
                    <span className="font-mono text-xs text-darkroom-amber">
                      NEGATIVE ID // {selectedPhoto.id} (FRAME {selectedPhoto.frame})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playShutter();
                        setSelectedPhoto(null);
                      }}
                      aria-label="Close EXIF inspection modal"
                      className="border border-darkroom-border p-1.5 text-darkroom-muted transition hover:border-darkroom-amber hover:text-darkroom-amber"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <h3
                    id="lightbox-title"
                    className="mt-4 font-display text-2xl font-bold text-white"
                  >
                    {selectedPhoto.title}
                  </h3>

                  <div className="mt-4 space-y-2 border border-darkroom-border bg-black/50 p-3.5 font-mono text-xs">
                    <div className="flex items-center gap-2 text-darkroom-silver">
                      <Camera className="h-3.5 w-3.5 text-darkroom-amber shrink-0" />
                      <span>{selectedPhoto.camera}</span>
                    </div>
                    <div className="flex items-center gap-2 text-darkroom-muted">
                      <Calendar className="h-3.5 w-3.5 text-darkroom-amber shrink-0" />
                      <span>EXPOSED ON: {selectedPhoto.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-darkroom-muted">
                      <Aperture className="h-3.5 w-3.5 text-darkroom-amber shrink-0" />
                      <span>DEVELOPER: {selectedPhoto.exif.developer}</span>
                    </div>
                  </div>

                  {/* 4-Cell EXIF Telemetry Matrix */}
                  <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-xs">
                    <div className="border border-darkroom-border bg-darkroom-surface p-2.5">
                      <span className="block text-[10px] text-darkroom-muted">ISO RATING</span>
                      <strong className="text-darkroom-amber">{selectedPhoto.exif.iso}</strong>
                    </div>
                    <div className="border border-darkroom-border bg-darkroom-surface p-2.5">
                      <span className="block text-[10px] text-darkroom-muted">APERTURE</span>
                      <strong className="text-darkroom-amber">{selectedPhoto.exif.aperture}</strong>
                    </div>
                    <div className="border border-darkroom-border bg-darkroom-surface p-2.5">
                      <span className="block text-[10px] text-darkroom-muted">SHUTTER</span>
                      <strong className="text-darkroom-amber">{selectedPhoto.exif.shutter}</strong>
                    </div>
                  </div>

                  {/* Concept Note */}
                  <div className="mt-5">
                    <h4 className="font-mono text-[11px] uppercase tracking-widest text-darkroom-amber">
                      DARKROOM CONCEPT NOTE //
                    </h4>
                    <p className="mt-2 font-mono text-xs leading-relaxed text-darkroom-silver/90">
                      {selectedPhoto.caption}
                    </p>
                  </div>
                </div>

                {/* Spectral Swatches & Close Action */}
                <div className="mt-6 border-t border-darkroom-border pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-darkroom-muted">TONAL SWATCH:</span>
                    {selectedPhoto.palette.map((hex) => (
                      <span
                        key={hex}
                        className="h-4 w-4 border border-white/20"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(null)}
                    className="border border-darkroom-amber bg-darkroom-amber px-4 py-1.5 font-mono text-xs font-semibold uppercase text-black transition hover:bg-white"
                  >
                    Close Loupe [ESC]
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
