"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Code2, Copy, Check, X, FileCode } from "lucide-react";
import { useDarkroom } from "@/context/DarkroomContext";
import { soundEngine } from "@/utils/sound";

const SOURCE_FILES: { filename: string; lang: string; code: string }[] = [
  {
    filename: "src/components/DeepLearningLab.tsx",
    lang: "TypeScript // Coordinate MLP Backpropagation & Bias-Corrected Adam",
    code: `// Analytical Forward + Backward Pass with Adam Optimizer (β1=0.9, β2=0.999)
let out = net.b2;
for (let i = 0; i < H; i++) {
  const z = freq * (W1[i * 2] * nx + W1[i * 2 + 1] * ny) + b1[i];
  const a = activation === "siren" ? Math.sin(z) : (z > 0 ? z : 0.01 * z);
  hiddenPre[i] = z;
  hiddenAct[i] = a;
  out += W2[i] * a;
}

const yHat = 1 / (1 + Math.exp(-out));
const err = yHat - target[idx];
const dOut = 2 * err * yHat * (1 - yHat);

for (let i = 0; i < H; i++) {
  dW2[i] += dOut * hiddenAct[i];
  const dAct = activation === "siren" ? Math.cos(hiddenPre[i]) : (hiddenPre[i] > 0 ? 1.0 : 0.01);
  const dH = dOut * W2[i] * dAct;
  db1[i] += dH;
  dW1[i * 2] += dH * freq * nx;
  dW1[i * 2 + 1] += dH * freq * ny;
}

// Bias-corrected Adam parameter update
net.t += 1;
const bc1 = 1 - Math.pow(0.9, net.t);
const bc2 = 1 - Math.pow(0.999, net.t);
for (let i = 0; i < H; i++) {
  const gW2 = dW2[i] * invN;
  mW2[i] = 0.9 * mW2[i] + 0.1 * gW2;
  vW2[i] = 0.999 * vW2[i] + 0.001 * gW2 * gW2;
  W2[i] -= lr * (mW2[i] / bc1) / (Math.sqrt(vW2[i] / bc2) + 1e-8);
}`,
  },
  {
    filename: "src/components/WebGLGallery.tsx",
    lang: "GLSL // On-Demand WebGL2 Chromatic Dispersion & Wave Shader",
    code: `varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uTime;
uniform float uHover;
uniform vec2 uMouse;
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
  vec3 color = mix(vec3(lum), vec3(r, g, b), uHover * 0.65);

  gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
    filename: "src/app/api/github/route.ts",
    lang: "TypeScript // Next.js Route Handler for Live GitHub Events",
    code: `export async function GET() {
  const username = process.env.GITHUB_USERNAME || "juliusjoshua40-collab";
  const res = await fetch(
    \`https://api.github.com/users/\${username}/events/public?per_page=8\`,
    {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "JuliusJoshua-Portfolio" },
      next: { revalidate: 180 },
    }
  );
  const raw = await res.json();
  return NextResponse.json({ source: "github-live", items: raw.slice(0, 5) });
}`,
  },
];

function highlightLine(line: string): React.ReactNode {
  if (line.trim().startsWith("//")) {
    return <span className="text-emerald-400/80">{line}</span>;
  }
  const keywordRegex =
    /\b(export|async|await|const|let|for|function|return|if|uniform|varying|void|vec2|vec3|vec4|float|sampler2D)\b/g;
  const parts = line.split(keywordRegex);
  return parts.map((part, i) =>
    keywordRegex.test(part) ? (
      <span key={i} className="text-amber-400 font-semibold">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export function SourceCodeOverlay() {
  const { sourceView, setSourceView } = useDarkroom();
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentFile = SOURCE_FILES[activeTab];

  const handleCopy = () => {
    soundEngine.playShutter();
    navigator.clipboard?.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <AnimatePresence>
      {sourceView && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-[#070707]/95 pt-16 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Source code inspection"
        >
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-md border border-neutral-800 bg-[#101010] px-4 py-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-white">
                <Code2 className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Source Code Inspector</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded border border-neutral-800 bg-black px-3 py-1 text-neutral-300 hover:border-neutral-700 hover:text-white"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceView(false)}
                  className="inline-flex items-center gap-1 rounded bg-white px-3 py-1 font-medium text-black hover:bg-neutral-200"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Close</span>
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs">
              {SOURCE_FILES.map((file, idx) => (
                <button
                  key={file.filename}
                  type="button"
                  onClick={() => {
                    soundEngine.playShutter();
                    setActiveTab(idx);
                  }}
                  className={`inline-flex items-center gap-2 rounded border px-3.5 py-2 transition ${
                    activeTab === idx
                      ? "border-amber-500/60 bg-amber-500/15 text-amber-400 font-medium"
                      : "border-neutral-800 bg-[#0E0E0E] text-neutral-400 hover:text-white"
                  }`}
                >
                  <FileCode className="h-3.5 w-3.5" />
                  <span>{file.filename}</span>
                </button>
              ))}
            </div>

            <div className="mt-3 flex-1 overflow-auto rounded-md border border-neutral-800 bg-[#050505] p-4 font-mono text-xs leading-relaxed">
              <div className="mb-3 border-b border-neutral-800 pb-2 text-[11px] text-neutral-500">
                {currentFile.lang}
              </div>
              <pre className="overflow-x-auto">
                <code>
                  {currentFile.code.split("\n").map((line, idx) => (
                    <div key={idx} className="table-row hover:bg-white/5">
                      <span className="table-cell select-none pr-4 text-right text-neutral-600">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="table-cell text-neutral-300">
                        {highlightLine(line)}
                      </span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
