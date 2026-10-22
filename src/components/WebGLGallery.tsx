"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, Shuffle, Sliders, X } from "lucide-react";
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
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float dist = distance(uv, uMouse);
    float ripple = sin(dist * 20.0 - uTime * 4.5) * exp(-dist * 4.5);
    pos.z += ripple * 0.065 * uHover;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  varying vec2 vUv;
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

    float wave = sin(dist * 26.0 - uTime * 5.5) * exp(-dist * 5.0) * 0.018 * uHover;
    vec2 displacedUv = uv + normalize(toMouse + vec2(0.0001)) * wave;

    float shift = 0.012 * uHover * uAberration;
    vec2 dir = normalize(toMouse + vec2(0.001));

    float r = texture2D(uTexture, clamp(displacedUv + dir * shift, 0.0, 1.0)).r;
    float g = texture2D(uTexture, clamp(displacedUv, 0.0, 1.0)).g;
    float b = texture2D(uTexture, clamp(displacedUv - dir * shift, 0.0, 1.0)).b;

    float lum = dot(vec3(r, g, b), vec3(0.299, 0.587, 0.114));
    vec3 mono = vec3(lum);
    vec3 color = mix(mono, vec3(r, g, b), uHover * 0.65);

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
    loader.setCrossOrigin("anonymous");
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
      () => {}
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
      <planeGeometry args={[2.3, 2.85, 28, 28]} />
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
    <article className="group flex flex-col rounded-md border border-neutral-800 bg-[#0E0E0E] p-3.5 transition hover:border-neutral-600">
      <div className="mb-2.5 flex items-center justify-between font-mono text-[11px] text-neutral-500">
        <span>Frame {photo.frame}</span>
        <span>
          ISO {photo.exif.iso} · {photo.exif.aperture}
        </span>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label={`Inspect ${photo.title}`}
        onClick={() => {
          soundEngine.playShutter();
          onSelect(photo);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(photo);
          }
        }}
        onMouseEnter={() => {
          setHovered(true);
          soundEngine.playHover();
        }}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={handlePointerMove}
        className="relative aspect-[4/5] w-full cursor-pointer overflow-hidden rounded border border-neutral-800 bg-black"
      >
        <img
          src={photo.src}
          alt={photo.title}
          loading="lazy"
          className={`h-full w-full object-cover grayscale transition-transform duration-700 ${
            hovered ? "scale-[1.03]" : "scale-100"
          }`}
        />

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

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 font-mono text-[11px]">
          <span className="text-neutral-300">{photo.exif.shutter}</span>
          <span className="inline-flex items-center gap-1 rounded bg-black/70 px-2 py-0.5 text-neutral-300 group-hover:text-white">
            <Maximize2 className="h-3 w-3" />
            <span>Inspect</span>
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div>
          <h3 className="font-display text-base font-medium text-white">
            {photo.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-400">
            {photo.caption}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-neutral-800/80 pt-2 font-mono text-[11px] text-neutral-500">
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
  const [aberrationStrength, setAberrationStrength] = useState(1.0);

  useEffect(() => {
    const isLowPower =
      reducedMotion ||
      (typeof navigator !== "undefined" &&
        navigator.hardwareConcurrency &&
        navigator.hardwareConcurrency <= 2);
    if (isLowPower) {
      setWebglEnabled(false);
    }
  }, [reducedMotion]);

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
    return list.sort((a, b) => {
      const hashA = Math.sin(a.seed * (shuffleKey + 1)) * 1000;
      const hashB = Math.sin(b.seed * (shuffleKey + 1)) * 1000;
      return hashA - Math.floor(hashA) - (hashB - Math.floor(hashB));
    });
  }, [shuffleKey]);

  return (
    <section
      id="webgl-gallery"
      aria-labelledby="gallery-heading"
      className="border-t border-neutral-900 bg-[#0A0A0A] py-24 px-4 sm:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-neutral-800 pb-6 lg:flex-row lg:items-end">
          <div>
            <p className="font-mono text-xs text-amber-500">01 / Photography & Shaders</p>
            <h2
              id="gallery-heading"
              className="mt-1 font-display text-2xl font-semibold tracking-tight text-white sm:text-4xl"
            >
              Monochrome Film Archive (WebGL2)
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-neutral-400">
              Medium-format and 35mm black-and-white studies rendered through a custom GLSL displacement and chromatic dispersion shader.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-2 rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5">
              <Sliders className="h-3.5 w-3.5 text-neutral-400" />
              <label htmlFor="aberration-slider" className="text-[11px] text-neutral-400">
                Dispersion
              </label>
              <input
                id="aberration-slider"
                type="range"
                min="0"
                max="2.5"
                step="0.1"
                value={aberrationStrength}
                onChange={(e) => setAberrationStrength(parseFloat(e.target.value))}
                className="w-20 accent-amber-500 cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={triggerShuffle}
              className="inline-flex items-center gap-1.5 rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-neutral-300 transition hover:border-neutral-700 hover:text-white"
            >
              <Shuffle className="h-3.5 w-3.5" />
              <span>Shuffle</span>
            </button>

            <button
              type="button"
              onClick={() => setWebglEnabled((prev) => !prev)}
              aria-pressed={webglEnabled}
              className="rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-neutral-300 transition hover:border-neutral-700"
            >
              {webglEnabled ? "WebGL: On" : "WebGL: Off"}
            </button>
          </div>
        </div>

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

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-8"
            onClick={() => setSelectedPhoto(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lightbox-title"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="grid max-h-[90vh] w-full max-w-4xl grid-cols-1 overflow-y-auto rounded-md border border-neutral-800 bg-[#0E0E0E] lg:grid-cols-12"
            >
              <div className="flex items-center justify-center bg-black p-6 lg:col-span-7">
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.title}
                  className="max-h-[70vh] w-auto rounded object-contain grayscale"
                />
              </div>

              <div className="flex flex-col justify-between p-6 lg:col-span-5">
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3 font-mono text-xs text-neutral-400">
                    <span>Frame {selectedPhoto.frame}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedPhoto(null)}
                      aria-label="Close"
                      className="rounded border border-neutral-800 p-1 text-neutral-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <h3
                    id="lightbox-title"
                    className="mt-4 font-display text-xl font-semibold text-white"
                  >
                    {selectedPhoto.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                    {selectedPhoto.caption}
                  </p>

                  <dl className="mt-5 space-y-2 border-t border-neutral-800 pt-4 font-mono text-xs">
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Camera & Film</dt>
                      <dd className="text-right text-neutral-200">
                        {selectedPhoto.camera.split("·")[0]}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Exposure</dt>
                      <dd className="text-neutral-200">
                        ISO {selectedPhoto.exif.iso} · {selectedPhoto.exif.aperture} ·{" "}
                        {selectedPhoto.exif.shutter}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Developer</dt>
                      <dd className="text-neutral-200">{selectedPhoto.exif.developer}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Date</dt>
                      <dd className="text-neutral-200">{selectedPhoto.date}</dd>
                    </div>
                  </dl>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="mt-6 w-full rounded bg-white py-2 font-mono text-xs font-medium text-black hover:bg-neutral-200"
                >
                  Close (Esc)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
