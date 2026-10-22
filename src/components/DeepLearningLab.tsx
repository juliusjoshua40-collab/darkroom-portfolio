"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Search } from "lucide-react";
import photosData from "../../public/photos/photos.json";
import { soundEngine } from "@/utils/sound";

type ActiveTab = "siren-trainer" | "vision-kernels" | "embedding-umap";
type ActivationType = "siren" | "relu" | "tanh";
type KernelMode = "sobel-3x3" | "gabor-filter" | "patch-similarity";

interface EmbeddingPoint {
  id: string;
  title: string;
  category: "ML / Vision" | "WebGL / GPU" | "Systems" | "Photography";
  x: number;
  y: number;
  // 6-dimensional semantic feature vector: [ml, gpu, audio, systems, optics, architecture]
  vec: number[];
  keywords: string[];
  summary: string;
}

const EMBEDDING_ITEMS: EmbeddingPoint[] = [
  {
    id: "micro-siren",
    title: "MicroSIREN (Coordinate MLP)",
    category: "ML / Vision",
    x: -0.52,
    y: 0.44,
    vec: [0.96, 0.72, 0.15, 0.42, 0.58, 0.31],
    keywords: ["siren", "mlp", "neural", "backprop", "adam", "relu", "spectral", "pytorch", "ml"],
    summary: "Sinusoidal representation network f_θ(x,y) trained in-browser with Adam & analytical backprop.",
  },
  {
    id: "vision-gabor",
    title: "2D Gabor & Sobel Tensor Kernels",
    category: "ML / Vision",
    x: -0.64,
    y: 0.18,
    vec: [0.91, 0.68, 0.12, 0.35, 0.82, 0.44],
    keywords: ["gabor", "sobel", "convolution", "cnn", "kernel", "edge", "vision", "entropy"],
    summary: "Spatial frequency and directional gradient feature extraction on monochrome plates.",
  },
  {
    id: "sonicflow-dsp",
    title: "SonicFlow (WebAudio FFT + GPU)",
    category: "WebGL / GPU",
    x: 0.42,
    y: 0.52,
    vec: [0.32, 0.88, 0.98, 0.64, 0.45, 0.25],
    keywords: ["sonicflow", "audio", "dsp", "fft", "synthesizer", "music", "visualizer", "webgl"],
    summary: "Sub-4ms FFT spectral audio analyzer coupled to a 60fps reactive canvas visualizer.",
  },
  {
    id: "darkroom-glsl",
    title: "WebGL2 Chromatic Dispersion Shader",
    category: "WebGL / GPU",
    x: 0.58,
    y: 0.24,
    vec: [0.38, 0.96, 0.35, 0.52, 0.89, 0.48],
    keywords: ["webgl", "glsl", "shader", "three", "dispersion", "aberration", "gpu", "ripple"],
    summary: "On-demand single-context GLSL vertex wave displacement and RGB spectral shift.",
  },
  {
    id: "lagoslife-sim",
    title: "LagosLife (Deterministic State Engine)",
    category: "Systems",
    x: 0.36,
    y: -0.44,
    vec: [0.24, 0.45, 0.22, 0.96, 0.31, 0.68],
    keywords: ["lagos", "lagoslife", "state", "simulation", "fullstack", "react", "systems"],
    summary: "Deterministic state machine and high-concurrency urban simulation interface.",
  },
  {
    id: "plate-concrete",
    title: "Plate 01A — Brutalist Concrete",
    category: "Photography",
    x: -0.18,
    y: -0.48,
    vec: [0.42, 0.54, 0.1, 0.22, 0.95, 0.94],
    keywords: ["photo", "concrete", "brutalist", "hasselblad", "ilford", "film", "architecture"],
    summary: "Hasselblad 500C/M · Ilford HP5+ pushed +2 stops under sodium streetlamps.",
  },
  {
    id: "plate-caustic",
    title: "Plate 12A — Refractive Caustics",
    category: "Photography",
    x: 0.06,
    y: -0.34,
    vec: [0.55, 0.68, 0.18, 0.25, 0.97, 0.62],
    keywords: ["caustic", "glass", "refraction", "optics", "pentax", "ortho", "light"],
    summary: "Pentax 67II · Collimated light refracted through fluted industrial glass.",
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
 * Embeds a free-text developer query into our 6-D semantic feature space
 * [ml, gpu, audio, systems, optics, architecture]
 */
function embedTextQuery(query: string): number[] | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;
  const vec = [0.15, 0.15, 0.15, 0.15, 0.15, 0.15];

  if (/ml|neural|siren|adam|backprop|relu|pytorch|vision|gabor|sobel|cnn|ai/.test(q)) {
    vec[0] += 0.85;
  }
  if (/webgl|glsl|shader|gpu|three|canvas|dispersion|fps/.test(q)) {
    vec[1] += 0.85;
  }
  if (/audio|sonic|sonicflow|fft|dsp|sound|music|synth/.test(q)) {
    vec[2] += 0.9;
    vec[1] += 0.4;
  }
  if (/system|state|lagos|lagoslife|react|next|typescript|backend|api/.test(q)) {
    vec[3] += 0.85;
  }
  if (/photo|film|camera|hasselblad|leica|ilford|caustic|light|optics|darkroom/.test(q)) {
    vec[4] += 0.85;
  }
  if (/concrete|brutalist|architecture|building|geometry|cantilever/.test(q)) {
    vec[5] += 0.85;
    vec[4] += 0.4;
  }
  return vec;
}

/**
 * Real in-browser 2-layer Coordinate MLP trained with Bias-Corrected Adam Optimizer (β1=0.9, β2=0.999)
 * Lets engineers switch between SIREN sin(ω0·x), ReLU, and Tanh to observe Spectral Bias live.
 */
function LiveSirenTrainer() {
  const GRID = 36;
  const targetCanvasRef = useRef<HTMLCanvasElement>(null);
  const predCanvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(true);
  const [activation, setActivation] = useState<ActivationType>("siren");
  const [lr, setLr] = useState(0.015);
  const [omega, setOmega] = useState(12.0);
  const [hiddenDim] = useState(28);
  const [stepCount, setStepCount] = useState(0);
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [preset, setPreset] = useState<"rings" | "gabor" | "cross">("rings");

  const netRef = useRef<{
    target: Float32Array;
    W1: Float32Array;
    b1: Float32Array;
    W2: Float32Array;
    b2: number;
    // Adam first (m) and second (v) moment buffers
    mW1: Float32Array;
    vW1: Float32Array;
    mb1: Float32Array;
    vb1: Float32Array;
    mW2: Float32Array;
    vW2: Float32Array;
    mb2: number;
    vb2: number;
    t: number;
  } | null>(null);

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

  const initNetwork = (H: number, targetPreset: "rings" | "gabor" | "cross") => {
    const target = new Float32Array(GRID * GRID);
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        const nx = (x / (GRID - 1)) * 2 - 1;
        const ny = (y / (GRID - 1)) * 2 - 1;
        const r = Math.sqrt(nx * nx + ny * ny);
        let val = 0;
        if (targetPreset === "rings") {
          val = 0.5 + 0.5 * Math.cos(r * 11.0) * Math.exp(-r * 0.65);
        } else if (targetPreset === "gabor") {
          val =
            0.5 +
            0.5 *
              Math.sin((nx * Math.cos(0.6) + ny * Math.sin(0.6)) * 9.5) *
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
      W1[i * 2] = (Math.random() * 2 - 1) * 0.85;
      W1[i * 2 + 1] = (Math.random() * 2 - 1) * 0.85;
      b1[i] = (Math.random() * 2 - 1) * 1.5;
      W2[i] = (Math.random() * 2 - 1) / Math.sqrt(H);
    }

    netRef.current = {
      target,
      W1,
      b1,
      W2,
      b2: 0.0,
      mW1: new Float32Array(H * 2),
      vW1: new Float32Array(H * 2),
      mb1: new Float32Array(H),
      vb1: new Float32Array(H),
      mW2: new Float32Array(H),
      vW2: new Float32Array(H),
      mb2: 0,
      vb2: 0,
      t: 0,
    };
    setStepCount(0);
    setLossHistory([]);
    drawTargetCanvas(target);
  };

  useEffect(() => {
    initNetwork(hiddenDim, preset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiddenDim, preset, activation]);

  useEffect(() => {
    if (!running) return;
    let rafId: number;

    const trainStep = () => {
      const net = netRef.current;
      const predCanvas = predCanvasRef.current;
      if (!net || !predCanvas) return;

      const H = hiddenDim;
      const { target, W1, b1, W2, mW1, vW1, mb1, vb1, mW2, vW2 } = net;
      const dW1 = new Float32Array(H * 2);
      const db1 = new Float32Array(H);
      const dW2 = new Float32Array(H);
      let db2 = 0;

      const hiddenAct = new Float32Array(H);
      const hiddenPre = new Float32Array(H);
      const preds = new Float32Array(GRID * GRID);

      const beta1 = 0.9;
      const beta2 = 0.999;
      const eps = 1e-8;
      const freq = activation === "siren" ? omega : 2.5;

      let mse = 0;
      for (let iter = 0; iter < 2; iter++) {
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

            let out = net.b2;
            for (let i = 0; i < H; i++) {
              const z = freq * (W1[i * 2] * nx + W1[i * 2 + 1] * ny) + b1[i];
              let a = 0;
              if (activation === "siren") {
                a = Math.sin(z);
              } else if (activation === "relu") {
                a = z > 0 ? z : 0.01 * z;
              } else {
                a = Math.tanh(z);
              }
              hiddenPre[i] = z;
              hiddenAct[i] = a;
              out += W2[i] * a;
            }

            const yHat = 1 / (1 + Math.exp(-out));
            preds[idx] = yHat;

            const err = yHat - target[idx];
            mse += err * err;

            const dOut = 2 * err * yHat * (1 - yHat);
            db2 += dOut;
            for (let i = 0; i < H; i++) {
              dW2[i] += dOut * hiddenAct[i];
              let dAct = 0;
              const z = hiddenPre[i];
              if (activation === "siren") {
                dAct = Math.cos(z);
              } else if (activation === "relu") {
                dAct = z > 0 ? 1.0 : 0.01;
              } else {
                const th = hiddenAct[i];
                dAct = 1 - th * th;
              }
              const dH = dOut * W2[i] * dAct;
              db1[i] += dH;
              dW1[i * 2] += dH * freq * nx;
              dW1[i * 2 + 1] += dH * freq * ny;
            }
          }
        }

        // Adam Optimizer Step with Bias Correction
        net.t += 1;
        const invN = 1 / (GRID * GRID);
        const bc1 = 1 - Math.pow(beta1, net.t);
        const bc2 = 1 - Math.pow(beta2, net.t);

        const g_b2 = db2 * invN;
        net.mb2 = beta1 * net.mb2 + (1 - beta1) * g_b2;
        net.vb2 = beta2 * net.vb2 + (1 - beta2) * g_b2 * g_b2;
        net.b2 -= lr * (net.mb2 / bc1) / (Math.sqrt(net.vb2 / bc2) + eps);

        for (let i = 0; i < H; i++) {
          const gW2 = dW2[i] * invN;
          mW2[i] = beta1 * mW2[i] + (1 - beta1) * gW2;
          vW2[i] = beta2 * vW2[i] + (1 - beta2) * gW2 * gW2;
          W2[i] -= lr * (mW2[i] / bc1) / (Math.sqrt(vW2[i] / bc2) + eps);

          const gb1 = db1[i] * invN;
          mb1[i] = beta1 * mb1[i] + (1 - beta1) * gb1;
          vb1[i] = beta2 * vb1[i] + (1 - beta2) * gb1 * gb1;
          b1[i] -= lr * (mb1[i] / bc1) / (Math.sqrt(vb1[i] / bc2) + eps);

          for (let k = 0; k < 2; k++) {
            const j = i * 2 + k;
            const gW1 = dW1[j] * invN;
            mW1[j] = beta1 * mW1[j] + (1 - beta1) * gW1;
            vW1[j] = beta2 * vW1[j] + (1 - beta2) * gW1 * gW1;
            W1[j] -= lr * (mW1[j] / bc1) / (Math.sqrt(vW1[j] / bc2) + eps);
          }
        }
      }

      mse /= GRID * GRID;

      const ctx = predCanvas.getContext("2d");
      if (ctx) {
        const img = ctx.createImageData(GRID, GRID);
        for (let i = 0; i < GRID * GRID; i++) {
          const v = Math.max(0, Math.min(255, Math.floor(preds[i] * 255)));
          img.data[i * 4] = v;
          img.data[i * 4 + 1] = Math.floor(v * 0.94);
          img.data[i * 4 + 2] = Math.floor(v * 0.82);
          img.data[i * 4 + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
      }

      setStepCount(net.t);
      setLossHistory((prev) => [...prev.slice(-48), mse]);

      rafId = requestAnimationFrame(trainStep);
    };

    rafId = requestAnimationFrame(trainStep);
    return () => cancelAnimationFrame(rafId);
  }, [running, lr, omega, hiddenDim, activation]);

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
              <span>MLP Reconstruction f_θ(x, y)</span>
              <span className="text-[11px] text-emerald-400">Adam Step {stepCount}</span>
            </div>
            <canvas
              ref={predCanvasRef}
              width={GRID}
              height={GRID}
              className="aspect-square w-full rounded border border-neutral-800 bg-black [image-rendering:pixelated]"
            />
          </div>
        </div>

        {/* Activation & Target Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-neutral-800 bg-[#0D0D0D] p-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              className="inline-flex items-center gap-1.5 rounded border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-neutral-200 hover:border-amber-500/60"
            >
              {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{running ? "Pause Adam" : "Resume Adam"}</span>
            </button>
            <button
              type="button"
              onClick={() => initNetwork(hiddenDim, preset)}
              className="inline-flex items-center gap-1.5 rounded border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-neutral-200 hover:border-amber-500/60"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Weights</span>
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

      {/* Right 5 Cols: Activation Benchmark, Adam Telemetry & Loss Curve */}
      <div className="flex flex-col justify-between rounded-md border border-neutral-800 bg-[#0D0D0D] p-5 font-mono text-xs lg:col-span-5">
        <div className="space-y-4">
          <div className="border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-semibold text-white">
              Spectral Bias Benchmark (Adam β₁=0.9, β₂=0.999)
            </h3>
            <p className="mt-1 text-neutral-400 leading-relaxed">
              Switch between{" "}
              <code className="text-amber-400">SIREN sin(ω₀x)</code> and{" "}
              <code className="text-neutral-200">ReLU</code> to see why standard ReLU networks struggle to fit high-frequency rings.
            </p>
          </div>

          {/* Activation Function Switcher */}
          <div>
            <span className="block text-[11px] text-neutral-400 mb-1.5">
              Hidden Layer Activation σ(z):
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: "siren", label: "SIREN sin(ω₀z)" },
                  { id: "relu", label: "Leaky ReLU" },
                  { id: "tanh", label: "Tanh(z)" },
                ] as { id: ActivationType; label: string }[]
              ).map((act) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => setActivation(act.id)}
                  className={`rounded py-1.5 text-center text-[11px] transition ${
                    activation === act.id
                      ? "bg-white text-black font-semibold"
                      : "border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white"
                  }`}
                >
                  {act.label}
                </button>
              ))}
            </div>
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
              <span className="block text-[10px] text-neutral-500">Resolution</span>
              <strong className="mt-0.5 block text-sm text-white">
                {GRID}×{GRID}
              </strong>
            </div>
          </div>

          {/* Live SVG Loss Sparkline */}
          <div className="rounded border border-neutral-800 bg-black/70 p-3">
            <div className="mb-1.5 flex justify-between text-[10px] text-neutral-500">
              <span>Loss Trajectory L_MSE(θ)</span>
              <span>{stepCount} Adam steps</span>
            </div>
            <svg viewBox="0 0 240 50" className="h-12 w-full overflow-visible">
              <polyline
                fill="none"
                stroke="#FF9F1C"
                strokeWidth="1.75"
                points={
                  lossHistory.length > 1
                    ? lossHistory
                        .map((l, i) => {
                          const x = (i / Math.max(1, lossHistory.length - 1)) * 240;
                          const y = 46 - Math.min(1, l * 4.5) * 42;
                          return `${x.toFixed(1)},${y.toFixed(1)}`;
                        })
                        .join(" ")
                    : "0,25 240,25"
                }
              />
            </svg>
          </div>

          {/* Hyperparameters */}
          <div className="space-y-2.5 pt-1">
            <label className="block">
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-400">Adam Learning Rate (η)</span>
                <span className="text-neutral-200">{lr.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.002"
                max="0.04"
                step="0.002"
                value={lr}
                onChange={(e) => setLr(parseFloat(e.target.value))}
                className="mt-1 w-full accent-amber-500"
              />
            </label>

            {activation === "siren" && (
              <label className="block">
                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-400">SIREN Frequency (ω₀)</span>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Interactive 2D Embedding Space with Live Text Query Embedding & Cosine Similarity Ranking
 */
function EmbeddingSpaceExplorer() {
  const [selectedId, setSelectedId] = useState<string>(EMBEDDING_ITEMS[0].id);
  const [queryText, setQueryText] = useState<string>("");

  const queryVec = embedTextQuery(queryText);
  const selected =
    EMBEDDING_ITEMS.find((i) => i.id === selectedId) || EMBEDDING_ITEMS[0];

  const referenceVec = queryVec || selected.vec;

  const rankedItems = EMBEDDING_ITEMS.map((item) => ({
    ...item,
    similarity: cosineSim(referenceVec, item.vec),
  })).sort((a, b) => b.similarity - a.similarity);

  const topMatch = rankedItems[0];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left 7 Cols: Interactive 2D UMAP Scatter Plot + Search Bar */}
      <div className="space-y-4 rounded-md border border-neutral-800 bg-[#0D0D0D] p-5 lg:col-span-7">
        {/* Live Semantic Search Box */}
        <div className="relative font-mono text-xs">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
          <input
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Query embedding space (e.g. 'audio fft', 'adam backprop', 'glsl shader', 'concrete')..."
            aria-label="Semantic search query"
            className="w-full rounded border border-neutral-800 bg-black py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="relative h-[300px] w-full overflow-hidden rounded border border-neutral-800 bg-[#080808]">
          <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-neutral-800/80" />
          <div className="pointer-events-none absolute inset-y-0 left-1/2 border-l border-dashed border-neutral-800/80" />

          {/* SVG edges from active anchor to top-3 nearest neighbors */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            {rankedItems.slice(1, 4).map((n) => {
              const x1 = `${(topMatch.x + 1) * 50}%`;
              const y1 = `${(1 - (topMatch.y + 1) * 0.5) * 100}%`;
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

          {EMBEDDING_ITEMS.map((pt) => {
            const left = `${(pt.x + 1) * 50}%`;
            const top = `${(1 - (pt.y + 1) * 0.5) * 100}%`;
            const isHighlighted = pt.id === topMatch.id;
            return (
              <button
                key={pt.id}
                type="button"
                onClick={() => {
                  soundEngine.playShutter();
                  setQueryText("");
                  setSelectedId(pt.id);
                }}
                style={{ left, top }}
                className={`group absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] transition-all ${
                  isHighlighted
                    ? "z-20 bg-amber-500 text-black font-semibold shadow-[0_0_20px_rgba(255,159,28,0.5)]"
                    : "z-10 border border-neutral-700 bg-neutral-900/90 text-neutral-300 hover:border-amber-500/70 hover:text-white"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isHighlighted ? "bg-black" : "bg-amber-500"
                  }`}
                />
                <span className="whitespace-nowrap">{pt.title.split(" (")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right 5 Cols: Cosine Similarity Ranking */}
      <div className="flex flex-col justify-between rounded-md border border-neutral-800 bg-[#0D0D0D] p-5 font-mono text-xs lg:col-span-5">
        <div className="space-y-4">
          <div className="border-b border-neutral-800 pb-3">
            <span className="text-[11px] text-amber-400">
              {queryVec ? `Query Match: "${queryText}"` : topMatch.category}
            </span>
            <h3 className="mt-0.5 text-base font-semibold text-white">
              {topMatch.title}
            </h3>
            <p className="mt-1 text-neutral-400 leading-relaxed">{topMatch.summary}</p>
          </div>

          <div>
            <div className="mb-2.5 flex justify-between text-[11px] text-neutral-400">
              <span>Cosine Similarity Ranking</span>
              <span>cos(θ) = u·v / ‖u‖‖v‖</span>
            </div>

            <div className="space-y-2">
              {rankedItems.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setQueryText("");
                    setSelectedId(item.id);
                  }}
                  className="w-full rounded border border-neutral-800 bg-black/50 p-2 text-left transition hover:border-neutral-700"
                >
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-200">{item.title}</span>
                    <span className="text-amber-400">
                      {item.similarity.toFixed(3)}
                    </span>
                  </div>
                  <div className="mt-1 h-1 w-full bg-neutral-900">
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${Math.max(5, item.similarity * 100)}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-neutral-800 pt-3 text-[11px] text-neutral-500">
          L2-normalized feature vectors · Real-time cosine inner product
        </div>
      </div>
    </div>
  );
}

export function DeepLearningLab() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("siren-trainer");
  const [selectedPlateIdx, setSelectedPlateIdx] = useState(0);
  const [layerMode, setLayerMode] = useState<KernelMode>("sobel-3x3");
  const [gaborTheta, setGaborTheta] = useState(0.78); // radians
  const [gain, setGain] = useState(1.4);
  const [threshold, setThreshold] = useState(0.25);
  const [telemetry, setTelemetry] = useState({
    meanLuminance: 0.42,
    entropy: 5.84,
    edgeEnergy: 0.68,
    inferenceMs: 3.2,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activePlate = (photosData as any[])[selectedPlateIdx] || photosData[0];

  useEffect(() => {
    if (activeTab !== "vision-kernels") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const runKernelOnImage = (img: HTMLImageElement) => {
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

      let energySum = 0;

      if (layerMode === "sobel-3x3") {
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
            const mag = Math.min(1, Math.sqrt(gx * gx + gy * gy) * gain);
            energySum += mag;
            const act = mag > threshold ? mag : mag * 0.12;
            const pIdx = idx * 4;
            dst[pIdx] = Math.min(255, Math.floor(act * 255));
            dst[pIdx + 1] = Math.min(255, Math.floor(act * 175));
            dst[pIdx + 2] = Math.min(255, Math.floor(Math.abs(gy) * 165));
            dst[pIdx + 3] = 255;
          }
        }
      } else if (layerMode === "gabor-filter") {
        // Real 5x5 Oriented 2D Gabor Kernel
        const kernel = new Float32Array(25);
        const cosT = Math.cos(gaborTheta);
        const sinT = Math.sin(gaborTheta);
        const sigma = 1.6;
        const lambd = 3.0;
        for (let ky = -2; ky <= 2; ky++) {
          for (let kx = -2; kx <= 2; kx++) {
            const xp = kx * cosT + ky * sinT;
            const yp = -kx * sinT + ky * cosT;
            const env = Math.exp(-(xp * xp + yp * yp) / (2 * sigma * sigma));
            const carrier = Math.cos((2 * Math.PI * xp) / lambd);
            kernel[(ky + 2) * 5 + (kx + 2)] = env * carrier;
          }
        }

        for (let y = 2; y < H - 2; y++) {
          for (let x = 2; x < W - 2; x++) {
            let acc = 0;
            for (let ky = -2; ky <= 2; ky++) {
              const rowOffset = (y + ky) * W;
              const kRow = (ky + 2) * 5;
              for (let kx = -2; kx <= 2; kx++) {
                acc += lum[rowOffset + (x + kx)] * kernel[kRow + (kx + 2)];
              }
            }
            const resp = Math.min(1, Math.abs(acc) * gain);
            energySum += resp;
            const pIdx = (y * W + x) * 4;
            const v = resp > threshold ? Math.floor(resp * 255) : Math.floor(resp * 45);
            dst[pIdx] = v;
            dst[pIdx + 1] = Math.floor(v * 0.85);
            dst[pIdx + 2] = Math.floor(v * 0.45);
            dst[pIdx + 3] = 255;
          }
        }
      } else {
        // 16x16 Patch Variance & Self-Similarity Saliency
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
            const s = Math.sqrt(v / Math.max(1, c)) * 2.2 + m * 0.45;
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
                (gain / 1.4)
            );
            energySum += attn * 0.5;
            const isGrid = x % patchSize === 0 || y % patchSize === 0;
            const pIdx = idx * 4;
            if (isGrid && attn > threshold) {
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
      }

      ctx.putImageData(outData, 0, 0);
      setTelemetry({
        meanLuminance: Number((sumLum / totalPixels).toFixed(2)),
        entropy: Number(entropy.toFixed(2)),
        edgeEnergy: Number(Math.min(0.99, energySum / totalPixels).toFixed(2)),
        inferenceMs: Math.max(1.1, Number((performance.now() - t0).toFixed(1))),
      });
    };

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = activePlate.src;
    img.onload = () => runKernelOnImage(img);
    img.onerror = () => {
      if (activePlate.fallbackSrc) {
        const fbImg = new Image();
        fbImg.src = activePlate.fallbackSrc;
        fbImg.onload = () => runKernelOnImage(fbImg);
      }
    };
  }, [
    activeTab,
    selectedPlateIdx,
    layerMode,
    gaborTheta,
    gain,
    threshold,
    activePlate.src,
    activePlate.fallbackSrc,
  ]);

  return (
    <section
      id="neural-darkroom"
      aria-labelledby="neural-heading"
      className="border-t border-neutral-900 bg-[#0A0A0A] py-24 px-4 sm:px-8"
    >
      <div className="mx-auto max-w-6xl">
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
              Client-side neural experiments running in TypeScript and Float32Array buffers — compare SIREN vs ReLU spectral bias, run 2D Gabor/Sobel convolutions, or query vector embeddings.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            {(
              [
                { id: "siren-trainer", label: "1. Adam Coordinate MLP" },
                { id: "vision-kernels", label: "2. 2D Gabor & Sobel Kernels" },
                { id: "embedding-umap", label: "3. Semantic Vector Search" },
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

        {activeTab === "siren-trainer" && <LiveSirenTrainer />}

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
                    onError={(e) => {
                      if (activePlate.fallbackSrc) {
                        (e.currentTarget as HTMLImageElement).src = activePlate.fallbackSrc;
                      }
                    }}
                    alt={activePlate.title}
                    className="aspect-[4/3] w-full rounded border border-neutral-800 object-cover grayscale"
                  />
                </div>
                <div>
                  <div className="mb-2 flex justify-between font-mono text-xs text-neutral-400">
                    <span>Convolutional Activation</span>
                    <span className="text-amber-400">{telemetry.inferenceMs}ms</span>
                  </div>
                  <canvas
                    ref={canvasRef}
                    width={420}
                    height={315}
                    className="aspect-[4/3] w-full rounded border border-neutral-800 object-cover"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-neutral-800 bg-[#0D0D0D] p-3 font-mono text-xs">
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: "sobel-3x3", label: "3×3 Sobel Gradient" },
                      { id: "gabor-filter", label: "5×5 Oriented Gabor" },
                      { id: "patch-similarity", label: "16×16 Patch Saliency" },
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
                <h3 className="text-sm font-semibold text-white">Kernel Parameters</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded border border-neutral-800 bg-black/60 p-2.5">
                    <span className="block text-[10px] text-neutral-500">Shannon Entropy</span>
                    <strong className="mt-0.5 block text-sm text-white">
                      {telemetry.entropy} bits
                    </strong>
                  </div>
                  <div className="rounded border border-neutral-800 bg-black/60 p-2.5">
                    <span className="block text-[10px] text-neutral-500">Response Energy</span>
                    <strong className="mt-0.5 block text-sm text-amber-400">
                      {telemetry.edgeEnergy}
                    </strong>
                  </div>
                </div>

                <label className="block">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-400">Filter Gain</span>
                    <span className="text-neutral-200">{gain.toFixed(1)}×</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={gain}
                    onChange={(e) => setGain(parseFloat(e.target.value))}
                    className="mt-1 w-full accent-amber-500"
                  />
                </label>

                {layerMode === "gabor-filter" && (
                  <label className="block">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-neutral-400">Gabor Orientation (θ)</span>
                      <span className="text-neutral-200">
                        {Math.round((gaborTheta * 180) / Math.PI)}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3.14"
                      step="0.15"
                      value={gaborTheta}
                      onChange={(e) => setGaborTheta(parseFloat(e.target.value))}
                      className="mt-1 w-full accent-amber-500"
                    />
                  </label>
                )}

                <label className="block">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-400">Activation Gate</span>
                    <span className="text-neutral-200">{threshold.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.7"
                    step="0.05"
                    value={threshold}
                    onChange={(e) => setThreshold(parseFloat(e.target.value))}
                    className="mt-1 w-full accent-amber-500"
                  />
                </label>
              </div>

              <div className="mt-4 border-t border-neutral-800 pt-3 text-[11px] text-neutral-500">
                Buffer: Float32Array [315 × 420]
              </div>
            </div>
          </div>
        )}

        {activeTab === "embedding-umap" && <EmbeddingSpaceExplorer />}
      </div>
    </section>
  );
}
