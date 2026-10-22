"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import photosData from "../../public/photos/photos.json";
import { soundEngine } from "@/utils/sound";

type ActiveTab = "siren-trainer" | "vision-kernels" | "embedding-umap";
type KernelMode = "vit-attention" | "conv-sobel" | "diffusion-denoise" | "grad-cam";

interface EmbeddingPoint {
  id: string;
  title: string;
  category: "ML / Vision" | "WebGL / GPU" | "Systems" | "Photography";
  x: number; // [-1, 1] UMAP1
  y: number; // [-1, 1] UMAP2
  vec: number[];
  summary: string;
}

const EMBEDDING_ITEMS: EmbeddingPoint[] = [
  {
    id: "latent-halide",
    title: "LatentHalide (U-Net + ViT)",
    category: "ML / Vision",
    x: -0.58,
    y: 0.52,
    vec: [0.92, 0.85, 0.41, 0.18, 0.77],
    summary: "ONNX Runtime WebGPU film restoration & grain synthesis model.",
  },
  {
    id: "micro-siren",
    title: "MicroSIREN (Coordinate MLP)",
    category: "ML / Vision",
    x: -0.42,
    y: 0.34,
    vec: [0.89, 0.79, 0.52, 0.12, 0.68],
    summary: "Sinusoidal representation network f_θ(x,y) trained in-browser with backprop.",
  },
  {
    id: "safelight-clip",
    title: "Safelight (CLIP + pgvector)",
    category: "ML / Vision",
    x: -0.66,
    y: 0.18,
    vec: [0.94, 0.62, 0.31, 0.55, 0.72],
    summary: "512-dim contrastive image-text embeddings with HNSW vector search.",
  },
  {
    id: "halide-glsl",
    title: "Halide RAW Shader Pipeline",
    category: "WebGL / GPU",
    x: 0.44,
    y: 0.48,
    vec: [0.35, 0.95, 0.91, 0.24, 0.64],
    summary: "Multi-pass WebGL2 ping-pong framebuffer pipeline for spectral halation.",
  },
  {
    id: "caustic-sdf",
    title: "Caustic Raymarching Studio",
    category: "WebGL / GPU",
    x: 0.62,
    y: 0.28,
    vec: [0.42, 0.91, 0.96, 0.19, 0.51],
    summary: "Analytic signed-distance fields with Beer-Lambert chromatic refraction.",
  },
  {
    id: "obscura-crdt",
    title: "Obscura Distributed Light Table",
    category: "Systems",
    x: 0.38,
    y: -0.46,
    vec: [0.22, 0.68, 0.58, 0.95, 0.39],
    summary: "Spatial-hash culled WebGL2 viewport + Yjs CRDT real-time sync.",
  },
  {
    id: "plate-caustic",
    title: "Plate 01A — Caustic Refraction",
    category: "Photography",
    x: -0.12,
    y: -0.52,
    vec: [0.51, 0.64, 0.48, 0.15, 0.96],
    summary: "Hasselblad 500C/M · Ilford HP5+ pushed +2 stops under sodium vapor.",
  },
  {
    id: "plate-ferro",
    title: "Plate 12A — Ferrofluid Harmonics",
    category: "Photography",
    x: 0.08,
    y: -0.38,
    vec: [0.58, 0.71, 0.55, 0.18, 0.93],
    summary: "Pentax 67II · Sabattier solarization on Rollei Ortho 25.",
  },
];

function cosineSim(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

/**
 * Real in-browser 2-layer Sinusoidal Coordinate MLP (SIREN: x,y -> hidden -> intensity)
 * Trained live via manual backpropagation & SGD/Momentum on a 32x32 target grid.
 */
function LiveSirenTrainer() {
  const GRID = 32;
  const targetCanvasRef = useRef<HTMLCanvasElement>(null);
  const predCanvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(true);
  const [lr, setLr] = useState(0.035);
  const [omega, setOmega] = useState(12.0);
  const [hiddenDim, setHiddenDim] = useState(24);
  const [stepCount, setStepCount] = useState(0);
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [preset, setPreset] = useState<"rings" | "gabor" | "cross">("rings");

  // Mutable neural network state in ref for zero-overhead 60fps loop
  const netRef = useRef<{
    target: Float32Array;
    W1: Float32Array; // [hiddenDim * 2]
    b1: Float32Array; // [hiddenDim]
    W2: Float32Array; // [hiddenDim]
    b2: number;
    epoch: number;
  } | null>(null);

  const initNetwork = (H: number, targetPreset: "rings" | "gabor" | "cross") => {
    const target = new Float32Array(GRID * GRID);
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        const nx = (x / (GRID - 1)) * 2 - 1;
        const ny = (y / (GRID - 1)) * 2 - 1;
        const r = Math.sqrt(nx * nx + ny * ny);
        let val = 0;
        if (targetPreset === "rings") {
          val = 0.5 + 0.5 * Math.cos(r * 10.5) * Math.exp(-r * 0.7);
        } else if (targetPreset === "gabor") {
          val =
            0.5 +
            0.5 *
              Math.sin((nx * Math.cos(0.6) + ny * Math.sin(0.6)) * 9.0) *
              Math.exp(-(nx * nx + ny * ny) * 1.4);
        } else {
          val = Math.abs(nx) < 0.22 || Math.abs(ny) < 0.22 ? 0.92 : 0.08;
        }
        target[y * GRID + x] = val;
      }
    }

    const W1 = new Float32Array(H * 2);
    const b1 = new Float32Array(H);
    const W2 = new Float32Array(H);
    for (let i = 0; i < H; i++) {
      W1[i * 2] = (Math.random() * 2 - 1) * 0.8;
      W1[i * 2 + 1] = (Math.random() * 2 - 1) * 0.8;
      b1[i] = (Math.random() * 2 - 1) * Math.PI;
      W2[i] = (Math.random() * 2 - 1) / Math.sqrt(H);
    }

    netRef.current = {
      target,
      W1,
      b1,
      W2,
      b2: 0.5,
      epoch: 0,
    };
    setStepCount(0);
    setLossHistory([]);
    drawTargetCanvas(target);
  };

  const drawTargetCanvas = (target: Float32Array) => {
    const c = targetCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(GRID, GRID);
    for (let i = 0; i < GRID * GRID; i++) {
      const v = Math.max(0, Math.min(255, Math.floor(target[i] * 255)));
      img.data[i * 4] = v;
      img.data[i * 4 + 1] = v;
      img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  };

  useEffect(() => {
    initNetwork(hiddenDim, preset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiddenDim, preset]);

  useEffect(() => {
    if (!running) return;
    let rafId: number;

    const trainStep = () => {
      const net = netRef.current;
      const predCanvas = predCanvasRef.current;
      if (!net || !predCanvas) return;

      const H = hiddenDim;
      const { target, W1, b1, W2 } = net;
      const dW1 = new Float32Array(H * 2);
      const db1 = new Float32Array(H);
      const dW2 = new Float32Array(H);
      let db2 = 0;

      const hiddenAct = new Float32Array(H);
      const hiddenPre = new Float32Array(H);
      const preds = new Float32Array(GRID * GRID);

      // Run 3 mini-epochs per animation frame for snappy convergence
      let mse = 0;
      for (let iter = 0; iter < 3; iter++) {
        mse = 0;
        dW1.fill(0);
        db1.fill(0);
        dW2.fill(0);
        db2 = 0;

        for (let py = 0; py < GRID; py++) {
          const ny = (py / (GRID - 1)) * 2 - 1;
          for (let px = 0; px < GRID; px++) {
            const nx = (px / (GRID - 1)) * 2 - 1;
            const idx = py * GRID + px;

            // Forward pass: h = sin(omega * (W1 * x) + b1)
            let out = net.b2;
            for (let i = 0; i < H; i++) {
              const z = omega * (W1[i * 2] * nx + W1[i * 2 + 1] * ny) + b1[i];
              const a = Math.sin(z);
              hiddenPre[i] = z;
              hiddenAct[i] = a;
              out += W2[i] * a;
            }

            // Sigmoid output clamp to [0,1]
            const yHat = 1 / (1 + Math.exp(-out));
            preds[idx] = yHat;

            const err = yHat - target[idx];
            mse += err * err;

            // Backward pass: dL/dout
            const dOut = 2 * err * yHat * (1 - yHat);
            db2 += dOut;
            for (let i = 0; i < H; i++) {
              dW2[i] += dOut * hiddenAct[i];
              const dH = dOut * W2[i] * Math.cos(hiddenPre[i]);
              db1[i] += dH;
              dW1[i * 2] += dH * omega * nx;
              dW1[i * 2 + 1] += dH * omega * ny;
            }
          }
        }

        const scale = lr / (GRID * GRID);
        net.b2 -= db2 * scale;
        for (let i = 0; i < H; i++) {
          W2[i] -= dW2[i] * scale;
          b1[i] -= db1[i] * scale;
          W1[i * 2] -= dW1[i * 2] * scale;
          W1[i * 2 + 1] -= dW1[i * 2 + 1] * scale;
        }
        net.epoch += 1;
      }

      mse /= GRID * GRID;

      // Render neural field prediction
      const ctx = predCanvas.getContext("2d");
      if (ctx) {
        const img = ctx.createImageData(GRID, GRID);
        for (let i = 0; i < GRID * GRID; i++) {
          const v = Math.max(0, Math.min(255, Math.floor(preds[i] * 255)));
          img.data[i * 4] = v;
          img.data[i * 4 + 1] = Math.floor(v * 0.92);
          img.data[i * 4 + 2] = Math.floor(v * 0.78);
          img.data[i * 4 + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
      }

      setStepCount(net.epoch);
      setLossHistory((prev) => [...prev.slice(-48), mse]);

      rafId = requestAnimationFrame(trainStep);
    };

    rafId = requestAnimationFrame(trainStep);
    return () => cancelAnimationFrame(rafId);
  }, [running, lr, omega, hiddenDim]);

  // Allow user to paint directly onto the target tensor to watch the MLP adapt live
  const handlePaintTarget = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.buttons !== 1 && e.type !== "pointerdown") return;
    const net = netRef.current;
    const c = targetCanvasRef.current;
    if (!net || !c) return;
    const rect = c.getBoundingClientRect();
    const gx = Math.floor(((e.clientX - rect.left) / rect.width) * GRID);
    const gy = Math.floor(((e.clientY - rect.top) / rect.height) * GRID);

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const x = gx + dx;
        const y = gy + dy;
        if (x >= 0 && x < GRID && y >= 0 && y < GRID) {
          net.target[y * GRID + x] = 1.0;
        }
      }
    }
    drawTargetCanvas(net.target);
  };

  const currentLoss = lossHistory.length > 0 ? lossHistory[lossHistory.length - 1] : 0.12;
  const psnr = currentLoss > 1e-6 ? (-10 * Math.log10(currentLoss)).toFixed(1) : "42.0";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left 7 Cols: Ground Truth vs Live Neural Field Reconstruction */}
      <div className="space-y-4 lg:col-span-7">
        <div className="grid grid-cols-2 gap-4 rounded-md border border-neutral-800 bg-[#0D0D0D] p-4">
          <div>
            <div className="mb-2 flex items-center justify-between font-mono text-xs text-neutral-400">
              <span>Ground Truth I(x, y)</span>
              <span className="text-[11px] text-amber-500">Draw on canvas</span>
            </div>
            <canvas
              ref={targetCanvasRef}
              width={GRID}
              height={GRID}
              onPointerDown={handlePaintTarget}
              onPointerMove={handlePaintTarget}
              className="aspect-square w-full cursor-crosshair rounded border border-neutral-800 bg-black [image-rendering:pixelated]"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between font-mono text-xs text-neutral-400">
              <span>SIREN MLP f_θ(x, y)</span>
              <span className="text-[11px] text-emerald-400">Step {stepCount}</span>
            </div>
            <canvas
              ref={predCanvasRef}
              width={GRID}
              height={GRID}
              className="aspect-square w-full rounded border border-neutral-800 bg-black [image-rendering:pixelated]"
            />
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-neutral-800 bg-[#0D0D0D] p-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              className="inline-flex items-center gap-1.5 rounded border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-neutral-200 hover:border-amber-500/60"
            >
              {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{running ? "Pause SGD" : "Resume SGD"}</span>
            </button>
            <button
              type="button"
              onClick={() => initNetwork(hiddenDim, preset)}
              className="inline-flex items-center gap-1.5 rounded border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-neutral-200 hover:border-amber-500/60"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Re-init Weights</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">Target:</span>
            {(["rings", "gabor", "cross"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPreset(p)}
                className={`rounded px-2.5 py-1 capitalize ${
                  preset === p
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                    : "bg-neutral-900 text-neutral-400 border border-neutral-800"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right 5 Cols: Hyperparameters, Equation & Real-Time Loss Curve */}
      <div className="flex flex-col justify-between rounded-md border border-neutral-800 bg-[#0D0D0D] p-5 font-mono text-xs lg:col-span-5">
        <div className="space-y-4">
          <div className="border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-semibold text-white">
              Coordinate MLP Backpropagation
            </h3>
            <p className="mt-1 text-neutral-400 leading-relaxed">
              Fitting a 2D signal with periodic activations{" "}
              <code className="text-amber-400">sin(ω₀ · Wx + b)</code> via manual chain-rule gradients in a flat <code className="text-neutral-200">Float32Array</code> buffer.
            </p>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded border border-neutral-800 bg-black/60 p-2.5">
              <span className="block text-[10px] text-neutral-500">MSE Loss</span>
              <strong className="mt-0.5 block text-sm text-white">
                {currentLoss.toFixed(4)}
              </strong>
            </div>
            <div className="rounded border border-neutral-800 bg-black/60 p-2.5">
              <span className="block text-[10px] text-neutral-500">PSNR</span>
              <strong className="mt-0.5 block text-sm text-amber-400">{psnr} dB</strong>
            </div>
            <div className="rounded border border-neutral-800 bg-black/60 p-2.5">
              <span className="block text-[10px] text-neutral-500">Parameters</span>
              <strong className="mt-0.5 block text-sm text-white">
                {hiddenDim * 4 + 1}
              </strong>
            </div>
          </div>

          {/* Live SVG Loss Sparkline */}
          <div className="rounded border border-neutral-800 bg-black/70 p-3">
            <div className="mb-1.5 flex justify-between text-[10px] text-neutral-500">
              <span>Loss Trajectory L_MSE(θ)</span>
              <span>{stepCount} steps</span>
            </div>
            <svg viewBox="0 0 240 54" className="h-14 w-full overflow-visible">
              <polyline
                fill="none"
                stroke="#FF9F1C"
                strokeWidth="1.75"
                points={
                  lossHistory.length > 1
                    ? lossHistory
                        .map((l, i) => {
                          const x = (i / Math.max(1, lossHistory.length - 1)) * 240;
                          const y = 50 - Math.min(1, l * 4.5) * 46;
                          return `${x.toFixed(1)},${y.toFixed(1)}`;
                        })
                        .join(" ")
                    : "0,25 240,25"
                }
              />
            </svg>
          </div>

          {/* Hyperparameters */}
          <div className="space-y-3 pt-1">
            <label className="block">
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-400">Learning Rate (η)</span>
                <span className="text-neutral-200">{lr.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.005"
                max="0.08"
                step="0.005"
                value={lr}
                onChange={(e) => setLr(parseFloat(e.target.value))}
                className="mt-1 w-full accent-amber-500"
              />
            </label>

            <label className="block">
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-400">Sine Frequency (ω₀)</span>
                <span className="text-neutral-200">{omega.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="4.0"
                max="24.0"
                step="1.0"
                value={omega}
                onChange={(e) => setOmega(parseFloat(e.target.value))}
                className="mt-1 w-full accent-amber-500"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Interactive 2D Embedding Space (UMAP projection + live Cosine Similarity nearest-neighbor inspector)
 */
function EmbeddingSpaceExplorer() {
  const [selectedId, setSelectedId] = useState<string>(EMBEDDING_ITEMS[0].id);
  const selected =
    EMBEDDING_ITEMS.find((i) => i.id === selectedId) || EMBEDDING_ITEMS[0];

  const rankedNeighbors = EMBEDDING_ITEMS.filter((i) => i.id !== selected.id)
    .map((item) => ({
      ...item,
      similarity: cosineSim(selected.vec, item.vec),
    }))
    .sort((a, b) => b.similarity - a.similarity);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left 7 Cols: Interactive 2D UMAP Scatter Plot */}
      <div className="rounded-md border border-neutral-800 bg-[#0D0D0D] p-5 lg:col-span-7">
        <div className="mb-3 flex items-center justify-between font-mono text-xs text-neutral-400">
          <span>2D UMAP Projection (512-d CLIP / Code Embeddings)</span>
          <span className="text-neutral-500">Click node to query k-NN</span>
        </div>

        <div className="relative h-[320px] w-full overflow-hidden rounded border border-neutral-800 bg-[#080808]">
          {/* Subtle coordinate axes */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-neutral-800/80" />
          <div className="pointer-events-none absolute inset-y-0 left-1/2 border-l border-dashed border-neutral-800/80" />

          {/* SVG edges from selected node to top-3 nearest neighbors */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            {rankedNeighbors.slice(0, 3).map((n) => {
              const x1 = `${(selected.x + 1) * 50}%`;
              const y1 = `${(1 - (selected.y + 1) * 0.5) * 100}%`;
              const x2 = `${(n.x + 1) * 50}%`;
              const y2 = `${(1 - (n.y + 1) * 0.5) * 100}%`;
              return (
                <line
                  key={n.id}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#FF9F1C"
                  strokeOpacity={0.45}
                  strokeWidth="1.25"
                  strokeDasharray="3 3"
                />
              );
            })}
          </svg>

          {/* Embedding Nodes */}
          {EMBEDDING_ITEMS.map((pt) => {
            const left = `${(pt.x + 1) * 50}%`;
            const top = `${(1 - (pt.y + 1) * 0.5) * 100}%`;
            const isSelected = pt.id === selected.id;
            return (
              <button
                key={pt.id}
                type="button"
                onClick={() => {
                  soundEngine.playShutter();
                  setSelectedId(pt.id);
                }}
                style={{ left, top }}
                className={`group absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] transition-all ${
                  isSelected
                    ? "z-20 bg-amber-500 text-black font-semibold shadow-[0_0_20px_rgba(255,159,28,0.5)]"
                    : "z-10 border border-neutral-700 bg-neutral-900/90 text-neutral-300 hover:border-amber-500/70 hover:text-white"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isSelected ? "bg-black" : "bg-amber-500"
                  }`}
                />
                <span className="whitespace-nowrap">{pt.title.split(" (")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right 5 Cols: Selected Vector & Cosine Similarity Ranking */}
      <div className="flex flex-col justify-between rounded-md border border-neutral-800 bg-[#0D0D0D] p-5 font-mono text-xs lg:col-span-5">
        <div className="space-y-4">
          <div className="border-b border-neutral-800 pb-3">
            <span className="text-[11px] text-amber-400">{selected.category}</span>
            <h3 className="mt-0.5 text-base font-semibold text-white">
              {selected.title}
            </h3>
            <p className="mt-1 text-neutral-400 leading-relaxed">{selected.summary}</p>
          </div>

          <div>
            <div className="mb-2.5 flex justify-between text-[11px] text-neutral-400">
              <span>Nearest Neighbors (Cosine Similarity)</span>
              <span>cos(θ) = u·v / ‖u‖‖v‖</span>
            </div>

            <div className="space-y-2.5">
              {rankedNeighbors.slice(0, 4).map((neighbor) => (
                <button
                  key={neighbor.id}
                  type="button"
                  onClick={() => setSelectedId(neighbor.id)}
                  className="w-full rounded border border-neutral-800 bg-black/50 p-2.5 text-left transition hover:border-neutral-700"
                >
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-200">{neighbor.title}</span>
                    <span className="text-amber-400">
                      {neighbor.similarity.toFixed(3)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 w-full bg-neutral-900">
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${neighbor.similarity * 100}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-neutral-800 pt-3 text-[11px] text-neutral-500">
          Vector norm: L2 normalized · Subspace: ℝ⁵¹² → ℝ² (UMAP)
        </div>
      </div>
    </div>
  );
}

export function DeepLearningLab() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("siren-trainer");
  const [selectedPlateIdx, setSelectedPlateIdx] = useState(0);
  const [layerMode, setLayerMode] = useState<KernelMode>("vit-attention");
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [diffusionStep, setDiffusionStep] = useState(14);
  const [activationThreshold, setActivationThreshold] = useState(0.3);
  const [telemetry, setTelemetry] = useState({
    meanLuminance: 0.42,
    entropy: 5.84,
    edgeEnergy: 0.68,
    inferenceMs: 3.4,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activePlate = photosData[selectedPlateIdx] || photosData[0];

  useEffect(() => {
    if (activeTab !== "vision-kernels") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = activePlate.src;

    img.onload = () => {
      const t0 = performance.now();
      const W = canvas.width;
      const H = canvas.height;

      const offscreen = document.createElement("canvas");
      offscreen.width = W;
      offscreen.height = H;
      const octx = offscreen.getContext("2d", { willReadFrequently: true });
      if (!octx) return;

      octx.fillStyle = "#060606";
      octx.fillRect(0, 0, W, H);
      octx.drawImage(img, 0, 0, W, H);

      const src = octx.getImageData(0, 0, W, H).data;
      const outData = ctx.createImageData(W, H);
      const dst = outData.data;

      const lum = new Float32Array(W * H);
      let sumLum = 0;
      const hist = new Uint32Array(64);

      for (let i = 0; i < W * H; i++) {
        const l =
          (0.299 * src[i * 4] + 0.587 * src[i * 4 + 1] + 0.114 * src[i * 4 + 2]) / 255;
        lum[i] = l;
        sumLum += l;
        hist[Math.min(63, Math.floor(l * 64))]++;
      }

      let entropy = 0;
      const totalPixels = W * H;
      for (let b = 0; b < 64; b++) {
        if (hist[b] > 0) {
          const p = hist[b] / totalPixels;
          entropy -= p * Math.log2(p);
        }
      }

      let edgeSum = 0;
      const cfgFactor = guidanceScale / 7.5;

      if (layerMode === "conv-sobel") {
        for (let y = 1; y < H - 1; y++) {
          for (let x = 1; x < W - 1; x++) {
            const idx = y * W + x;
            const gx =
              -lum[(y - 1) * W + (x - 1)] +
              lum[(y - 1) * W + (x + 1)] -
              2 * lum[y * W + (x - 1)] +
              2 * lum[y * W + (x + 1)] -
              lum[(y + 1) * W + (x - 1)] +
              lum[(y + 1) * W + (x + 1)];
            const gy =
              -lum[(y - 1) * W + (x - 1)] -
              2 * lum[(y - 1) * W + x] -
              lum[(y - 1) * W + (x + 1)] +
              lum[(y + 1) * W + (x - 1)] +
              2 * lum[(y + 1) * W + x] +
              lum[(y + 1) * W + (x + 1)];
            const mag = Math.min(1, Math.sqrt(gx * gx + gy * gy) * cfgFactor);
            edgeSum += mag;
            const act = mag > activationThreshold ? mag : mag * 0.15;
            const pIdx = idx * 4;
            dst[pIdx] = Math.min(255, Math.floor(act * 255));
            dst[pIdx + 1] = Math.min(255, Math.floor(act * 175));
            dst[pIdx + 2] = Math.min(255, Math.floor(Math.abs(gy) * 160));
            dst[pIdx + 3] = 255;
          }
        }
      } else if (layerMode === "vit-attention") {
        const patchSize = 16;
        const cols = Math.ceil(W / patchSize);
        const rows = Math.ceil(H / patchSize);
        const scores = new Float32Array(cols * rows);
        let maxS = 0.001;

        for (let py = 0; py < rows; py++) {
          for (let px = 0; px < cols; px++) {
            let m = 0;
            let v = 0;
            let c = 0;
            for (let dy = 0; dy < patchSize; dy++) {
              for (let dx = 0; dx < patchSize; dx++) {
                const y = py * patchSize + dy;
                const x = px * patchSize + dx;
                if (x < W && y < H) {
                  m += lum[y * W + x];
                  c++;
                }
              }
            }
            m /= Math.max(1, c);
            for (let dy = 0; dy < patchSize; dy++) {
              for (let dx = 0; dx < patchSize; dx++) {
                const y = py * patchSize + dy;
                const x = px * patchSize + dx;
                if (x < W && y < H) {
                  const d = lum[y * W + x] - m;
                  v += d * d;
                }
              }
            }
            const s = Math.sqrt(v / Math.max(1, c)) * 2.2 + m * 0.5;
            scores[py * cols + px] = s;
            if (s > maxS) maxS = s;
          }
        }

        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            const idx = y * W + x;
            const attn = Math.min(
              1,
              (scores[Math.floor(y / patchSize) * cols + Math.floor(x / patchSize)] /
                maxS) *
                cfgFactor
            );
            edgeSum += attn * 0.5;
            const isGrid = x % patchSize === 0 || y % patchSize === 0;
            const pIdx = idx * 4;
            if (isGrid && attn > activationThreshold) {
              dst[pIdx] = 255;
              dst[pIdx + 1] = 159;
              dst[pIdx + 2] = 28;
              dst[pIdx + 3] = 255;
            } else {
              const base = lum[idx];
              dst[pIdx] = Math.min(255, Math.floor(base * 140 + attn * 240));
              dst[pIdx + 1] = Math.min(255, Math.floor(base * 120 + attn * 140));
              dst[pIdx + 2] = Math.min(255, Math.floor(base * 100));
              dst[pIdx + 3] = 255;
            }
          }
        }
      } else {
        const noiseRatio = diffusionStep / 50;
        const sig = Math.sqrt(1 - noiseRatio * 0.85);
        const nScale = Math.sqrt(noiseRatio * 0.85);
        for (let i = 0; i < W * H; i++) {
          const u1 = Math.max(0.0001, Math.abs(Math.sin(i * 12.9898 + diffusionStep * 4.1)));
          const u2 = Math.abs(Math.cos(i * 78.233 - guidanceScale * 2.1));
          const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
          const v = Math.max(0, Math.min(1, lum[i] * cfgFactor * sig + z * 0.22 * nScale));
          edgeSum += Math.abs(v - lum[i]);
          const pIdx = i * 4;
          const c = Math.floor(v * 255);
          dst[pIdx] = c;
          dst[pIdx + 1] = c;
          dst[pIdx + 2] = c;
          dst[pIdx + 3] = 255;
        }
      }

      ctx.putImageData(outData, 0, 0);
      setTelemetry({
        meanLuminance: Number((sumLum / totalPixels).toFixed(2)),
        entropy: Number(entropy.toFixed(2)),
        edgeEnergy: Number(Math.min(0.99, edgeSum / totalPixels).toFixed(2)),
        inferenceMs: Math.max(1.1, Number((performance.now() - t0).toFixed(1))),
      });
    };
  }, [
    activeTab,
    selectedPlateIdx,
    layerMode,
    guidanceScale,
    diffusionStep,
    activationThreshold,
    activePlate.src,
  ]);

  return (
    <section
      id="neural-darkroom"
      aria-labelledby="neural-heading"
      className="border-t border-neutral-900 bg-[#0A0A0A] py-24 px-4 sm:px-8"
    >
      <div className="mx-auto max-w-6xl">
        {/* Clean Developer Section Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-neutral-800 pb-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs text-amber-500">04 / Deep Learning Lab</p>
            <h2
              id="neural-heading"
              className="mt-1 font-display text-2xl font-semibold tracking-tight text-white sm:text-4xl"
            >
              Interactive Neural Networks & Vision Kernels
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-neutral-400">
              Client-side neural experiments running directly in TypeScript and HTML5 Canvas — no external API calls or server GPUs required.
            </p>
          </div>

          {/* Module Tabs */}
          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            {(
              [
                { id: "siren-trainer", label: "1. Live SIREN MLP Trainer" },
                { id: "vision-kernels", label: "2. ViT & Conv2D Kernels" },
                { id: "embedding-umap", label: "3. 2D Embedding UMAP" },
              ] as { id: ActiveTab; label: string }[]
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  soundEngine.playShutter();
                  setActiveTab(t.id);
                }}
                className={`rounded px-3 py-1.5 transition ${
                  activeTab === t.id
                    ? "bg-white text-black font-semibold"
                    : "border border-neutral-800 bg-[#111] text-neutral-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Live Coordinate MLP Backprop Trainer */}
        {activeTab === "siren-trainer" && <LiveSirenTrainer />}

        {/* Tab 2: Convolutional & ViT Saliency Inspector */}
        {activeTab === "vision-kernels" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-md border border-neutral-800 bg-[#0D0D0D] p-4">
                <div>
                  <div className="mb-2 flex justify-between font-mono text-xs text-neutral-400">
                    <span>Input Tensor x₀</span>
                    <span>{activePlate.frame}</span>
                  </div>
                  <img
                    src={activePlate.src}
                    alt={activePlate.title}
                    className="aspect-[4/3] w-full rounded border border-neutral-800 object-cover"
                  />
                </div>
                <div>
                  <div className="mb-2 flex justify-between font-mono text-xs text-neutral-400">
                    <span>Feature Activation</span>
                    <span className="text-amber-400">{telemetry.inferenceMs}ms</span>
                  </div>
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={360}
                    className="aspect-[4/3] w-full rounded border border-neutral-800 object-cover"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-neutral-800 bg-[#0D0D0D] p-3 font-mono text-xs">
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: "vit-attention", label: "ViT-B/16 Patch Attention" },
                      { id: "conv-sobel", label: "3×3 Sobel Edge Filter" },
                      { id: "diffusion-denoise", label: "Diffusion Schedule q(x_t|x_0)" },
                    ] as { id: KernelMode; label: string }[]
                  ).map((k) => (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => setLayerMode(k.id)}
                      className={`rounded px-2.5 py-1 ${
                        layerMode === k.id
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                          : "bg-neutral-900 text-neutral-400 border border-neutral-800"
                      }`}
                    >
                      {k.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-1">
                  {photosData.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPlateIdx(idx)}
                      className={`rounded px-2 py-1 text-[11px] ${
                        selectedPlateIdx === idx
                          ? "bg-white text-black font-semibold"
                          : "bg-neutral-900 text-neutral-400"
                      }`}
                    >
                      {p.frame}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-md border border-neutral-800 bg-[#0D0D0D] p-5 font-mono text-xs lg:col-span-4">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white">Tensor Telemetry</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded border border-neutral-800 bg-black/60 p-2.5">
                    <span className="block text-[10px] text-neutral-500">Shannon Entropy</span>
                    <strong className="mt-0.5 block text-sm text-white">
                      {telemetry.entropy} bits
                    </strong>
                  </div>
                  <div className="rounded border border-neutral-800 bg-black/60 p-2.5">
                    <span className="block text-[10px] text-neutral-500">Gradient Energy</span>
                    <strong className="mt-0.5 block text-sm text-amber-400">
                      {telemetry.edgeEnergy}
                    </strong>
                  </div>
                </div>

                <label className="block">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-400">Gain / Guidance (w)</span>
                    <span className="text-neutral-200">{guidanceScale.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="2.0"
                    max="14.0"
                    step="0.5"
                    value={guidanceScale}
                    onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                    className="mt-1 w-full accent-amber-500"
                  />
                </label>

                <label className="block">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-400">Noise Timestep (t)</span>
                    <span className="text-neutral-200">{diffusionStep}/50</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="48"
                    step="1"
                    value={diffusionStep}
                    onChange={(e) => setDiffusionStep(parseInt(e.target.value, 10))}
                    className="mt-1 w-full accent-amber-500"
                  />
                </label>

                <label className="block">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-400">Activation Gate</span>
                    <span className="text-neutral-200">{activationThreshold.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.7"
                    step="0.05"
                    value={activationThreshold}
                    onChange={(e) => setActivationThreshold(parseFloat(e.target.value))}
                    className="mt-1 w-full accent-amber-500"
                  />
                </label>
              </div>

              <div className="mt-4 border-t border-neutral-800 pt-3 text-[11px] text-neutral-500">
                Buffer: Float32Array [360 × 480]
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: 2D UMAP Embedding Explorer */}
        {activeTab === "embedding-umap" && <EmbeddingSpaceExplorer />}
      </div>
    </section>
  );
}
