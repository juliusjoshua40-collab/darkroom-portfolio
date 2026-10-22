"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download, RotateCcw } from "lucide-react";
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
  const pointerRef = useRef({ x: 450, y: 240, active: false, tick: 0 });
  const particlesRef = useRef<Particle[]>([]);

  const seedCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#080808";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width * 0.5;
    const cy = canvas.height * 0.5;
    particlesRef.current = [];
    for (let i = 0; i < 80; i++) {
      const angle = (i / 80) * Math.PI * 2;
      particlesRef.current.push({
        x: cx + Math.cos(angle) * 40,
        y: cy + Math.sin(angle) * 40,
        vx: Math.cos(angle * 2) * 2.2,
        vy: Math.sin(angle * 3) * 2.2,
        life: 0,
        maxLife: 100 + (i % 50),
        hue: 36,
        radius: 1.2,
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
      pointerRef.current.tick += 0.02;
      const t = pointerRef.current.tick;

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgba(8, 8, 8, ${(1 - persistence) * 0.35})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (pointerRef.current.active || particlesRef.current.length < 30) {
        const px = pointerRef.current.active
          ? pointerRef.current.x
          : canvas.width * 0.5 + Math.cos(t * 1.2) * 160;
        const py = pointerRef.current.active
          ? pointerRef.current.y
          : canvas.height * 0.5 + Math.sin(t * 1.7) * 95;

        for (let i = 0; i < 2; i++) {
          const a = t * 3 + i * Math.PI;
          particlesRef.current.push({
            x: px,
            y: py,
            vx: Math.cos(a) * 2.0 * intensity,
            vy: Math.sin(a) * 2.0 * intensity,
            life: 0,
            maxLife: 85 + Math.random() * 55,
            hue: 36,
            radius: 1.1 + Math.random() * 1.2,
          });
        }
      }

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

        if (brushMode === "caustic") {
          const curl =
            Math.sin(p.x * 0.012 + t) * Math.cos(p.y * 0.012 - t) * Math.PI * 2;
          p.vx += Math.cos(curl) * 0.16 * intensity;
          p.vy += Math.sin(curl) * 0.16 * intensity;
        } else if (brushMode === "lissajous") {
          p.vx += Math.sin(p.y * 0.025 + t * 2) * 0.22 * intensity;
          p.vy += Math.cos(p.x * 0.025 - t * 2) * 0.22 * intensity;
        } else {
          const dx = p.x - canvas.width * 0.5;
          const dy = p.y - canvas.height * 0.5;
          const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
          p.vx += (-dy / dist) * 0.2 * intensity;
          p.vy += (dx / dist) * 0.2 * intensity;
        }

        p.vx *= 0.96;
        p.vy *= 0.96;
        p.x += p.vx;
        p.y += p.vy;

        const alpha = (1 - p.life / p.maxLife) * 0.38;
        ctx.strokeStyle =
          i % 3 === 0
            ? `rgba(235, 235, 235, ${alpha})`
            : `rgba(255, 159, 28, ${alpha})`;
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
    pointerRef.current.x = (e.clientX - rect.left) * (canvas.width / rect.width);
    pointerRef.current.y = (e.clientY - rect.top) * (canvas.height / rect.height);
    pointerRef.current.active = true;
  };

  const handleSavePng = () => {
    soundEngine.playShutter();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `flow-field-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <section
      id="light-playground"
      aria-labelledby="playground-heading"
      className="border-t border-neutral-900 bg-[#0A0A0A] py-24 px-4 sm:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-neutral-800 pb-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs text-amber-500">05 / Vector Field Study</p>
            <h2
              id="playground-heading"
              className="mt-1 font-display text-2xl font-semibold tracking-tight text-white sm:text-4xl"
            >
              Interactive Flow-Field Canvas
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-neutral-400">
              Drag across the canvas to perturb the 2D curl-noise velocity field and export high-contrast frames as PNG.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={seedCanvas}
              className="inline-flex items-center gap-1.5 rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-neutral-300 hover:border-neutral-700 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={handleSavePng}
              className="inline-flex items-center gap-1.5 rounded bg-white px-3.5 py-1.5 font-medium text-black hover:bg-neutral-200"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export PNG</span>
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-md border border-neutral-800 bg-[#0E0E0E] p-3 font-mono text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: "caustic", label: "Curl Noise" },
                { id: "lissajous", label: "Harmonic Phase" },
                { id: "chemigram", label: "Orbital Field" },
              ] as { id: BrushMode; label: string }[]
            ).map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBrushMode(b.id)}
                className={`rounded px-2.5 py-1 transition ${
                  brushMode === b.id
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                    : "bg-neutral-900 text-neutral-400 border border-neutral-800"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-neutral-400">
            <label className="flex items-center gap-2">
              <span>Decay</span>
              <input
                type="range"
                min="0.88"
                max="0.99"
                step="0.01"
                value={persistence}
                onChange={(e) => setPersistence(parseFloat(e.target.value))}
                className="w-20 accent-amber-500"
              />
            </label>
            <label className="flex items-center gap-2">
              <span>Velocity</span>
              <input
                type="range"
                min="0.5"
                max="2.2"
                step="0.1"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                className="w-20 accent-amber-500"
              />
            </label>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-neutral-800 bg-[#080808]">
          <canvas
            ref={canvasRef}
            width={1100}
            height={460}
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerMove}
            onPointerLeave={() => {
              pointerRef.current.active = false;
            }}
            aria-label="Interactive flow-field canvas"
            className="h-[320px] w-full cursor-crosshair touch-none sm:h-[420px]"
          />
        </div>
      </div>
    </section>
  );
}
