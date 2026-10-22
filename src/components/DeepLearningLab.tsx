"use client";

import React, { useEffect, useRef, useState } from "react";
import { BrainCircuit, Cpu, Layers, Activity, Sparkles, Play } from "lucide-react";
import photosData from "../../public/photos/photos.json";
import { soundEngine } from "@/utils/sound";

type NeuralLayerMode = "conv-sobel" | "vit-attention" | "diffusion-denoise" | "grad-cam";

interface TensorTelemetry {
  meanLuminance: number;
  entropy: number;
  edgeEnergy: number;
  inferenceMs: number;
  classifications: { label: string; prob: number }[];
}

export function DeepLearningLab() {
  const [selectedPlateIdx, setSelectedPlateIdx] = useState(0);
  const [layerMode, setLayerMode] = useState<NeuralLayerMode>("vit-attention");
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [diffusionStep, setDiffusionStep] = useState(18); // out of 50 steps (lower = cleaner)
  const [activationThreshold, setActivationThreshold] = useState(0.32);
  const [telemetry, setTelemetry] = useState<TensorTelemetry>({
    meanLuminance: 0.42,
    entropy: 6.84,
    edgeEnergy: 0.76,
    inferenceMs: 4.2,
    classifications: [
      { label: "High-Contrast Chiaroscuro Emulsion", prob: 0.64 },
      { label: "Refractive Caustic Interferometry", prob: 0.21 },
      { label: "Sabattier Solarized Silver Halide", prob: 0.11 },
      { label: "Sub-Surface Halation Scatter", prob: 0.04 },
    ],
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activePlate = photosData[selectedPlateIdx] || photosData[0];

  useEffect(() => {
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

      // Offscreen buffer to sample raw input tensor [H, W, 4]
      const offscreen = document.createElement("canvas");
      offscreen.width = W;
      offscreen.height = H;
      const octx = offscreen.getContext("2d", { willReadFrequently: true });
      if (!octx) return;

      octx.fillStyle = "#060606";
      octx.fillRect(0, 0, W, H);
      octx.drawImage(img, 0, 0, W, H);

      const srcData = octx.getImageData(0, 0, W, H);
      const src = srcData.data;
      const outData = ctx.createImageData(W, H);
      const dst = outData.data;

      // Grayscale luminance tensor
      const lum = new Float32Array(W * H);
      let sumLum = 0;
      const hist = new Uint32Array(64);

      for (let i = 0; i < W * H; i++) {
        const r = src[i * 4] / 255;
        const g = src[i * 4 + 1] / 255;
        const b = src[i * 4 + 2] / 255;
        const l = 0.299 * r + 0.587 * g + 0.114 * b;
        lum[i] = l;
        sumLum += l;
        const bin = Math.min(63, Math.floor(l * 64));
        hist[bin]++;
      }

      // Compute Shannon entropy over 64-bin luminance distribution
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
        // 3x3 Sobel Convolutional Filter Bank + ReLU threshold
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

            // Apply ReLU with activationThreshold
            const act = mag > activationThreshold ? mag : mag * 0.18;
            const pIdx = idx * 4;
            // Amber Safelight + Silver Cyan directional encoding
            dst[pIdx] = Math.min(255, Math.floor(act * 255 * 1.1));
            dst[pIdx + 1] = Math.min(255, Math.floor(act * 159 + Math.abs(gx) * 60));
            dst[pIdx + 2] = Math.min(255, Math.floor(Math.abs(gy) * 185));
            dst[pIdx + 3] = 255;
          }
        }
      } else if (layerMode === "vit-attention") {
        // 16x16 Patch Self-Attention Saliency Map
        const patchSize = 16;
        const cols = Math.ceil(W / patchSize);
        const rows = Math.ceil(H / patchSize);
        const patchScores = new Float32Array(cols * rows);
        let maxScore = 0.001;

        for (let py = 0; py < rows; py++) {
          for (let px = 0; px < cols; px++) {
            let pMean = 0;
            let pVar = 0;
            let count = 0;
            for (let dy = 0; dy < patchSize; dy++) {
              for (let dx = 0; dx < patchSize; dx++) {
                const y = py * patchSize + dy;
                const x = px * patchSize + dx;
                if (x < W && y < H) {
                  pMean += lum[y * W + x];
                  count++;
                }
              }
            }
            pMean /= Math.max(1, count);
            for (let dy = 0; dy < patchSize; dy++) {
              for (let dx = 0; dx < patchSize; dx++) {
                const y = py * patchSize + dy;
                const x = px * patchSize + dx;
                if (x < W && y < H) {
                  const diff = lum[y * W + x] - pMean;
                  pVar += diff * diff;
                }
              }
            }
            const score = Math.sqrt(pVar / Math.max(1, count)) * 2.2 + pMean * 0.55;
            patchScores[py * cols + px] = score;
            if (score > maxScore) maxScore = score;
          }
        }

        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            const idx = y * W + x;
            const py = Math.floor(y / patchSize);
            const px = Math.floor(x / patchSize);
            const attn = Math.pow(
              Math.min(1, (patchScores[py * cols + px] / maxScore) * cfgFactor),
              1.15
            );
            edgeSum += attn * 0.5;

            const isGridBorder = x % patchSize === 0 || y % patchSize === 0;
            const baseL = lum[idx];
            const pIdx = idx * 4;

            if (isGridBorder && attn > activationThreshold) {
              dst[pIdx] = 255;
              dst[pIdx + 1] = 159;
              dst[pIdx + 2] = 28;
              dst[pIdx + 3] = 255;
            } else {
              dst[pIdx] = Math.min(255, Math.floor(baseL * 140 + attn * 255));
              dst[pIdx + 1] = Math.min(255, Math.floor(baseL * 110 + attn * 145));
              dst[pIdx + 2] = Math.min(255, Math.floor(baseL * 95 + (1 - attn) * 45));
              dst[pIdx + 3] = 255;
            }
          }
        }
      } else if (layerMode === "diffusion-denoise") {
        // Latent Diffusion Forward/Reverse Schedule Simulation
        const noiseRatio = diffusionStep / 50; // 0 = clean, 1 = pure latent Gaussian noise
        const signalScale = Math.sqrt(1 - noiseRatio * 0.85);
        const noiseScale = Math.sqrt(noiseRatio * 0.85);

        for (let i = 0; i < W * H; i++) {
          // Box-Muller deterministic-ish pseudo Gaussian per pixel
          const u1 = Math.max(0.0001, Math.abs(Math.sin(i * 12.9898 + diffusionStep * 4.13)));
          const u2 = Math.abs(Math.cos(i * 78.233 - guidanceScale * 2.17));
          const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

          const base = lum[i] * cfgFactor;
          const denoised = Math.max(0, Math.min(1, base * signalScale + z * 0.22 * noiseScale));
          edgeSum += Math.abs(denoised - lum[i]);

          const pIdx = i * 4;
          dst[pIdx] = Math.min(255, Math.floor(denoised * 255));
          dst[pIdx + 1] = Math.min(255, Math.floor(denoised * 215));
          dst[pIdx + 2] = Math.min(255, Math.floor(denoised * 165));
          dst[pIdx + 3] = 255;
        }
      } else {
        // GRAD-CAM Class Activation Heatmap
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            const idx = y * W + x;
            const cx = (x / W - 0.5) * 2;
            const cy = (y / H - 0.5) * 2;
            const spatialPrior = Math.exp(-(cx * cx + cy * cy) * 1.1);
            const cam = Math.min(1, lum[idx] * spatialPrior * cfgFactor * 1.5);
            edgeSum += cam;

            const pIdx = idx * 4;
            // Jet/Safelight Grad-CAM colormap
            dst[pIdx] = Math.min(255, Math.floor(cam * 255 * 1.25));
            dst[pIdx + 1] = Math.min(255, Math.floor(Math.sin(cam * Math.PI) * 190));
            dst[pIdx + 2] = Math.min(255, Math.floor((1 - cam) * 120 * lum[idx]));
            dst[pIdx + 3] = 255;
          }
        }
      }

      ctx.putImageData(outData, 0, 0);

      const elapsed = Math.max(1.2, Number((performance.now() - t0).toFixed(1)));
      const meanL = Number((sumLum / totalPixels).toFixed(2));
      const normEdge = Number(Math.min(0.99, edgeSum / totalPixels).toFixed(2));

      // Compute dynamic softmax classification scores from tensor telemetry
      const rawLogits = [
        2.1 + normEdge * 1.8 + (selectedPlateIdx === 0 ? 0.6 : 0),
        1.7 + meanL * 1.5 + (selectedPlateIdx === 2 ? 0.7 : 0),
        1.4 + (entropy / 6) * 1.2 + (selectedPlateIdx === 3 ? 0.65 : 0),
        1.1 + (guidanceScale / 15) * 0.9,
      ];
      const expLogits = rawLogits.map((v) => Math.exp(v));
      const sumExp = expLogits.reduce((a, b) => a + b, 0);
      const probs = expLogits.map((e) => Number((e / sumExp).toFixed(2)));

      setTelemetry({
        meanLuminance: meanL,
        entropy: Number(entropy.toFixed(2)),
        edgeEnergy: normEdge,
        inferenceMs: elapsed,
        classifications: [
          { label: "Caustic Silver-Halide Refraction", prob: probs[0] },
          { label: "Chiaroscuro Brutalist Geometry", prob: probs[1] },
          { label: "Sabattier Solarized Harmonic Wave", prob: probs[2] },
          { label: "Sub-Surface Sodium Vapor Halation", prob: probs[3] },
        ].sort((a, b) => b.prob - a.prob),
      });
    };
  }, [selectedPlateIdx, layerMode, guidanceScale, diffusionStep, activationThreshold, activePlate.src]);

  return (
    <section
      id="neural-darkroom"
      aria-labelledby="neural-heading"
      className="relative border-t border-darkroom-border bg-[#070707] py-24 px-4 sm:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 border-b border-darkroom-border pb-6 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-darkroom-amber">
              <BrainCircuit className="h-3.5 w-3.5" />
              <span>04 // DEEP LEARNING & COMPUTER VISION LAB (IN-BROWSER TENSOR ENGINE)</span>
            </div>
            <h2
              id="neural-heading"
              className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl"
            >
              NEURAL DARKROOM // LATENT INSPECTOR
            </h2>
            <p className="mt-2 max-w-2xl font-mono text-xs leading-relaxed text-darkroom-muted">
              Inspect how convolutional kernels, Vision Transformer (`ViT-B/16`) self-attention heads, and denoising diffusion schedules perceive archival darkroom negatives in real time.
            </p>
          </div>

          {/* Architecture Pill */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="border border-darkroom-amber/50 bg-darkroom-amber/10 px-3 py-1.5 text-darkroom-amber">
              TENSOR SHAPE: [1, 3, 360, 480] · FP32
            </span>
            <span className="border border-darkroom-border bg-darkroom-surface px-3 py-1.5 text-darkroom-silver">
              FORWARD PASS: {telemetry.inferenceMs}ms
            </span>
          </div>
        </div>

        {/* Main Interactive Deep Learning Workbench */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left 7 Cols: Live Neural Feature Map Viewport + Layer Controls */}
          <div className="space-y-4 lg:col-span-7">
            {/* Layer Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 font-mono text-xs">
              {(
                [
                  { id: "vit-attention", label: "ViT Self-Attention" },
                  { id: "conv-sobel", label: "Conv2D Edge Bank" },
                  { id: "diffusion-denoise", label: "Latent Diffusion" },
                  { id: "grad-cam", label: "Grad-CAM Saliency" },
                ] as { id: NeuralLayerMode; label: string }[]
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playShutter();
                    setLayerMode(m.id);
                  }}
                  className={`border px-3 py-2 text-left text-[11px] uppercase transition ${
                    layerMode === m.id
                      ? "border-darkroom-amber bg-darkroom-amber text-black font-bold"
                      : "border-darkroom-border bg-darkroom-surface text-darkroom-silver hover:border-darkroom-amber/60"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Dual Comparison: Raw Input Tensor vs Neural Layer Activation */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border border-darkroom-border bg-[#0C0C0C] p-4">
              {/* Input Plate Tensor */}
              <div>
                <div className="mb-2 flex items-center justify-between font-mono text-[10px] text-darkroom-muted">
                  <span>INPUT TENSOR // x₀</span>
                  <span className="text-darkroom-amber">{activePlate.id}</span>
                </div>
                <div className="relative aspect-[4/3] w-full overflow-hidden border border-darkroom-border bg-black">
                  <img
                    src={activePlate.src}
                    alt={activePlate.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 font-mono text-[10px] text-darkroom-silver">
                    {activePlate.title}
                  </div>
                </div>
              </div>

              {/* Live Computed Feature Map Canvas */}
              <div>
                <div className="mb-2 flex items-center justify-between font-mono text-[10px] text-darkroom-muted">
                  <span>ACTIVATION // f_θ(x₀)</span>
                  <span className="text-darkroom-amber">{layerMode.toUpperCase()}</span>
                </div>
                <div className="relative aspect-[4/3] w-full overflow-hidden border border-darkroom-amber/60 bg-black">
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={360}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 font-mono text-[10px] text-darkroom-amber">
                    {telemetry.inferenceMs}ms · GELU+LN
                  </div>
                </div>
              </div>
            </div>

            {/* Plate Selector Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 border border-darkroom-border bg-darkroom-surface/70 p-3 font-mono text-xs">
              <span className="text-[11px] text-darkroom-muted">SELECT INPUT NEGATIVE:</span>
              <div className="flex flex-wrap gap-1.5">
                {photosData.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playShutter();
                      setSelectedPlateIdx(idx);
                    }}
                    className={`border px-2.5 py-1 text-[11px] transition ${
                      selectedPlateIdx === idx
                        ? "border-darkroom-amber bg-darkroom-amber/20 text-darkroom-amber font-semibold"
                        : "border-darkroom-border bg-black text-darkroom-muted hover:text-white"
                    }`}
                  >
                    {p.frame}
                  </button>
                ))}
              </div>
            </div>

            {/* Hyperparameter Sliders */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 font-mono text-xs">
              <label className="border border-darkroom-border bg-[#0C0C0C] p-3">
                <div className="flex justify-between text-[11px]">
                  <span className="text-darkroom-muted">CFG GUIDANCE (w):</span>
                  <span className="text-darkroom-amber">{guidanceScale.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="15.0"
                  step="0.5"
                  value={guidanceScale}
                  onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                  className="mt-2 w-full accent-darkroom-amber"
                />
              </label>

              <label className="border border-darkroom-border bg-[#0C0C0C] p-3">
                <div className="flex justify-between text-[11px]">
                  <span className="text-darkroom-muted">DIFFUSION STEP (t):</span>
                  <span className="text-darkroom-amber">{diffusionStep}/50</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="48"
                  step="1"
                  value={diffusionStep}
                  onChange={(e) => setDiffusionStep(parseInt(e.target.value, 10))}
                  className="mt-2 w-full accent-darkroom-amber"
                />
              </label>

              <label className="border border-darkroom-border bg-[#0C0C0C] p-3">
                <div className="flex justify-between text-[11px]">
                  <span className="text-darkroom-muted">ReLU THRESHOLD:</span>
                  <span className="text-darkroom-amber">{activationThreshold.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.75"
                  step="0.05"
                  value={activationThreshold}
                  onChange={(e) => setActivationThreshold(parseFloat(e.target.value))}
                  className="mt-2 w-full accent-darkroom-amber"
                />
              </label>
            </div>
          </div>

          {/* Right 5 Cols: Zero-Shot CLIP Classifier + Neural Telemetry & Architecture */}
          <div className="flex flex-col justify-between border border-darkroom-border bg-[#0C0C0C] p-6 lg:col-span-5 font-mono">
            <div className="space-y-6">
              {/* Top Telemetry Header */}
              <div className="flex items-center justify-between border-b border-darkroom-border pb-3 text-xs">
                <div className="flex items-center gap-2 text-darkroom-amber">
                  <Activity className="h-4 w-4" />
                  <span className="font-bold uppercase">CLIP ZERO-SHOT SOFTMAX HEAD</span>
                </div>
                <span className="text-[10px] text-darkroom-muted">ViT-B/16 EMBEDDING</span>
              </div>

              {/* Softmax Probability Bars */}
              <div className="space-y-3.5">
                {telemetry.classifications.map((item, idx) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs">
                      <span className={idx === 0 ? "text-white font-semibold" : "text-darkroom-silver"}>
                        {idx === 0 ? "▶ " : ""}
                        {item.label}
                      </span>
                      <span className="text-darkroom-amber">
                        {(item.prob * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full bg-black">
                      <div
                        className="h-full bg-darkroom-amber transition-all duration-300"
                        style={{ width: `${item.prob * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* 4-Cell Tensor Statistics */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="border border-darkroom-border bg-black/60 p-3">
                  <span className="block text-[10px] text-darkroom-muted">SHANNON ENTROPY H(X)</span>
                  <strong className="mt-1 block text-base text-white">
                    {telemetry.entropy} bits
                  </strong>
                </div>
                <div className="border border-darkroom-border bg-black/60 p-3">
                  <span className="block text-[10px] text-darkroom-muted">GRADIENT L2 ENERGY</span>
                  <strong className="mt-1 block text-base text-darkroom-amber">
                    {telemetry.edgeEnergy}
                  </strong>
                </div>
                <div className="border border-darkroom-border bg-black/60 p-3">
                  <span className="block text-[10px] text-darkroom-muted">MEAN LUMINANCE (μ)</span>
                  <strong className="mt-1 block text-base text-white">
                    {telemetry.meanLuminance}
                  </strong>
                </div>
                <div className="border border-darkroom-border bg-black/60 p-3">
                  <span className="block text-[10px] text-darkroom-muted">LATENT BOTTLENECK</span>
                  <strong className="mt-1 block text-base text-darkroom-amber">
                    z ∈ ℝ⁵¹²
                  </strong>
                </div>
              </div>

              {/* Pipeline Topology Diagram */}
              <div className="border border-darkroom-border bg-black/70 p-4 text-[11px]">
                <div className="mb-2 flex items-center gap-1.5 text-darkroom-amber font-semibold">
                  <Layers className="h-3.5 w-3.5" />
                  <span>ACTIVE NEURAL GRAPH TOPOLOGY</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-darkroom-muted">
                  <span className="border border-darkroom-border bg-darkroom-surface px-2 py-0.5 text-white">
                    x₀ [3×360×480]
                  </span>
                  <span>→</span>
                  <span className="border border-darkroom-amber/40 bg-darkroom-amber/10 px-2 py-0.5 text-darkroom-amber">
                    Conv3×3 / Patch16
                  </span>
                  <span>→</span>
                  <span className="border border-darkroom-border bg-darkroom-surface px-2 py-0.5 text-white">
                    MHSA (8 Heads)
                  </span>
                  <span>→</span>
                  <span className="border border-darkroom-amber/40 bg-darkroom-amber/10 px-2 py-0.5 text-darkroom-amber">
                    Softmax / U-Net
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-6 border-t border-darkroom-border pt-3 flex items-center justify-between text-[11px] text-darkroom-muted">
              <span className="inline-flex items-center gap-1.5 text-darkroom-amber">
                <Cpu className="h-3.5 w-3.5" />
                <span>100% Client-Side Tensor Execution</span>
              </span>
              <span>PyTorch → ONNX / Canvas Kernel</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
