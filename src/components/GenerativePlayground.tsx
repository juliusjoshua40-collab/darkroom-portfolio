"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download, RotateCcw, Sparkles, Wand2 } from "lucide-react";
import { soundEngine } from "@/utils/sound";

type BrushMode = "caustic" | "lissajous" | "chemigram";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  hue: number;
  radius: number;
}

export function GenerativePlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brushMode, setBrushMode] = useState<BrushMode>("caustic");
  const [persistence, setPersistence] = useState(0.96);
  const [intensity, setIntensity] = useState(1.2);
  const pointerRef = useRef({ x: 450, y: 260, active: false, tick: 0 });
  const particlesRef = useRef<Particle[]>([]);

  // Initialize canvas with darkroom base plate and initial light burst
  const seedCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#070707";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Seed initial abstract caustic filaments so the canvas looks alive immediately
    const cx = canvas.width * 0.5;
    const cy = canvas.height * 0.5;
    particlesRef.current = [];
    for (let i = 0; i < 95; i++) {
      const angle = (i / 95) * Math.PI * 2;
      particlesRef.current.push({
        x: cx + Math.cos(angle) * 40,
        y: cy + Math.sin(angle) * 40,
        vx: Math.cos(angle * 2) * 2.4,
        vy: Math.sin(angle * 3) * 2.4,
        life: 0,
        maxLife: 110 + (i % 60),
        hue: i % 3 === 0 ? 35 : 42,
        radius: 1.4 + (i % 3) * 0.6,
      });
    }
  };

  useEffect(() => {
    seedCanvas();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;

    const render = () => {
      pointerRef.current.tick += 0.025;
      const t = pointerRef.current.tick;

      // Subtle darkroom persistence fade
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgba(7, 7, 7, ${(1 - persistence) * 0.35})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Spawn particles when pointer moves or gently orbit center
      if (pointerRef.current.active || particlesRef.current.length < 35) {
        const px = pointerRef.current.active
          ? pointerRef.current.x
          : canvas.width * 0.5 + Math.cos(t * 1.3) * 180;
        const py = pointerRef.current.active
          ? pointerRef.current.y
          : canvas.height * 0.5 + Math.sin(t * 1.9) * 110;

        for (let i = 0; i < 3; i++) {
          const a = t * 3 + i * ((Math.PI * 2) / 3);
          particlesRef.current.push({
            x: px,
            y: py,
            vx: Math.cos(a) * 2.2 * intensity,
            vy: Math.sin(a) * 2.2 * intensity,
            life: 0,
            maxLife: 90 + Math.random() * 60,
            hue: brushMode === "chemigram" ? 28 : brushMode === "lissajous" ? 45 : 36,
            radius: 1.2 + Math.random() * 1.5,
          });
        }
      }

      // Draw silver-halide & amber safelight filaments
      ctx.globalCompositeOperation = "lighter";
      const list = particlesRef.current;
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.life += 1;
        if (p.life >= p.maxLife) {
          list.splice(i, 1);
          continue;
        }

        const prevX = p.x;
        const prevY = p.y;

        // Flow-field curl depending on brushMode
        if (brushMode === "caustic") {
          const curl =
            Math.sin(p.x * 0.012 + t) * Math.cos(p.y * 0.012 - t) * Math.PI * 2;
          p.vx += Math.cos(curl) * 0.18 * intensity;
          p.vy += Math.sin(curl) * 0.18 * intensity;
        } else if (brushMode === "lissajous") {
          p.vx += Math.sin(p.y * 0.025 + t * 2) * 0.24 * intensity;
          p.vy += Math.cos(p.x * 0.025 - t * 2) * 0.24 * intensity;
        } else {
          // Solarized chemigram rings
          const dx = p.x - canvas.width * 0.5;
          const dy = p.y - canvas.height * 0.5;
          const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
          p.vx += (-dy / dist) * 0.22 * intensity;
          p.vy += (dx / dist) * 0.22 * intensity;
        }

        p.vx *= 0.96;
        p.vy *= 0.96;
        p.x += p.vx;
        p.y += p.vy;

        const alpha = (1 - p.life / p.maxLife) * 0.42;
        ctx.strokeStyle =
          i % 4 === 0
            ? `rgba(245, 245, 245, ${alpha})`
            : `hsla(${p.hue}, 100%, 55%, ${alpha})`;
        ctx.lineWidth = p.radius;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(rafId);
  }, [brushMode, persistence, intensity]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    pointerRef.current.x = (e.clientX - rect.left) * scaleX;
    pointerRef.current.y = (e.clientY - rect.top) * scaleY;
    pointerRef.current.active = true;
  };

  const handleSavePng = () => {
    soundEngine.playShutter();
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Stamp archival film border metadata before exporting
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height + 44;
    const ectx = exportCanvas.getContext("2d");
    if (!ectx) return;

    ectx.fillStyle = "#080808";
    ectx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ectx.drawImage(canvas, 0, 0);

    ectx.fillStyle = "#FF9F1C";
    ectx.font = "12px monospace";
    ectx.fillText(
      `THE DARKROOM // CHEMIGRAM PLATE · MODE: ${brushMode.toUpperCase()} · ${new Date()
        .toISOString()
        .slice(0, 10)}`,
      20,
      canvas.height + 27
    );

    const dataUrl = exportCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `darkroom-chemigram-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <section
      id="light-playground"
      aria-labelledby="playground-heading"
      className="relative border-t border-darkroom-border bg-[#0A0A0A] py-24 px-4 sm:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-darkroom-border pb-6 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-darkroom-amber">
              <Wand2 className="h-3.5 w-3.5" />
              <span>04 // GENERATIVE DARKROOM PLAYGROUND (LIGHT-PAINTING LAB)</span>
            </div>
            <h2
              id="playground-heading"
              className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl"
            >
              INTERACTIVE CHEMIGRAM STUDIO
            </h2>
            <p className="mt-2 max-w-2xl font-mono text-xs leading-relaxed text-darkroom-muted">
              Sweep your cursor across the unexposed silver-halide emulsion plate to paint refractive caustic light trails. Customize the optical formula below and export your print as an archival PNG.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                soundEngine.playShutter();
                seedCanvas();
              }}
              className="inline-flex items-center gap-1.5 border border-darkroom-border bg-darkroom-surface px-3.5 py-2 text-darkroom-silver hover:border-darkroom-amber hover:text-darkroom-amber"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Fresh Emulsion Plate</span>
            </button>

            <button
              type="button"
              onClick={handleSavePng}
              className="inline-flex items-center gap-1.5 border border-darkroom-amber bg-darkroom-amber px-4 py-2 font-semibold text-black transition hover:bg-white"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Save as PNG</span>
            </button>
          </div>
        </div>

        {/* Control Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border border-darkroom-border bg-darkroom-surface/80 p-3 font-mono text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-darkroom-muted">OPTICAL FORMULA:</span>
            {(
              [
                { id: "caustic", label: "01. Caustic Curl" },
                { id: "lissajous", label: "02. Lissajous Harmonics" },
                { id: "chemigram", label: "03. Orbital Chemigram" },
              ] as { id: BrushMode; label: string }[]
            ).map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  soundEngine.playShutter();
                  setBrushMode(b.id);
                }}
                className={`border px-3 py-1 text-[11px] uppercase transition ${
                  brushMode === b.id
                    ? "border-darkroom-amber bg-darkroom-amber/20 text-darkroom-amber font-semibold"
                    : "border-darkroom-border bg-black text-darkroom-muted hover:text-white"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-[11px] text-darkroom-muted">
              <span>SILVER PERSISTENCE:</span>
              <input
                type="range"
                min="0.88"
                max="0.99"
                step="0.01"
                value={persistence}
                onChange={(e) => setPersistence(parseFloat(e.target.value))}
                className="w-24 accent-darkroom-amber"
              />
            </label>
            <label className="flex items-center gap-2 text-[11px] text-darkroom-muted">
              <span>PHOTON FLUX:</span>
              <input
                type="range"
                min="0.5"
                max="2.2"
                step="0.1"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                className="w-24 accent-darkroom-amber"
              />
            </label>
          </div>
        </div>

        {/* Interactive Light-Painting Canvas */}
        <div className="relative overflow-hidden border border-darkroom-border bg-[#070707] shadow-[0_0_50px_rgba(0,0,0,0.85)]">
          <canvas
            ref={canvasRef}
            width={1100}
            height={520}
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerMove}
            onPointerLeave={() => {
              pointerRef.current.active = false;
            }}
            aria-label="Interactive generative darkroom light-painting canvas"
            className="h-[360px] w-full cursor-crosshair touch-none sm:h-[480px]"
          />

          <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] text-darkroom-muted">
            <span className="bg-black/75 px-2.5 py-1 text-darkroom-amber">
              <Sparkles className="mr-1 inline h-3 w-3" />
              MOVE CURSOR OR DRAG TO EXPOSE SILVER HALIDE CRYSTALS
            </span>
            <span className="hidden bg-black/75 px-2.5 py-1 sm:inline">
              RESOLUTION: 1100×520 ARCHIVAL PLATE
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
