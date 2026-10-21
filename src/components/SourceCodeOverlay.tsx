"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Code2, Copy, Check, X, FileCode } from "lucide-react";
import { useDarkroom } from "@/context/DarkroomContext";
import { PORTFOLIO_CONTENT } from "@/config/content";
import { soundEngine } from "@/utils/sound";

const SOURCE_FILES: { filename: string; lang: string; code: string }[] = [
  {
    filename: "src/shaders/darkroomPlate.glsl",
    lang: "GLSL // WebGL2 Fragment & Vertex Shader",
    code: `// ============================================================================
// THE DARKROOM // CUSTOM GLSL CHROMATIC & CAUSTIC DISPLACEMENT SHADER
// ============================================================================
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

  // Radial ripple wave excited by pointer proximity
  float wave = sin(dist * 28.0 - uTime * 6.0) * exp(-dist * 5.0) * 0.022 * uHover;
  vec2 displacedUv = uv + normalize(toMouse + vec2(0.0001)) * wave;

  // Spectral RGB separation (chromatic aberration)
  float shift = (0.003 + 0.016 * uHover * uAberration);
  vec2 dir = normalize(toMouse + vec2(0.001));

  float r = texture2D(uTexture, clamp(displacedUv + dir * shift, 0.0, 1.0)).r;
  float g = texture2D(uTexture, clamp(displacedUv, 0.0, 1.0)).g;
  float b = texture2D(uTexture, clamp(displacedUv - dir * shift, 0.0, 1.0)).b;

  // 590nm Amber Safelight bloom around focal loupe
  vec3 color = vec3(r, g, b);
  float spot = exp(-dist * 4.2) * uHover;
  color = mix(color, color + vec3(1.0, 0.623, 0.11) * 0.28, spot);

  gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
    filename: "src/config/content.ts",
    lang: "TypeScript // Portfolio Manifest",
    code: `export const PORTFOLIO_CONTENT = ${JSON.stringify(
      {
        name: PORTFOLIO_CONTENT.name,
        role: PORTFOLIO_CONTENT.role,
        tagline: PORTFOLIO_CONTENT.tagline,
        contact: PORTFOLIO_CONTENT.contact,
        projectCount: PORTFOLIO_CONTENT.projects.length,
        projects: PORTFOLIO_CONTENT.projects.map((p) => ({
          id: p.id,
          frame: p.frameNumber,
          title: p.title,
          stack: p.stack,
        })),
      },
      null,
      2
    )};`,
  },
  {
    filename: "src/context/DarkroomContext.tsx",
    lang: "TypeScript // Time-of-Day & Chemical State Machine",
    code: `// Automatic Time-of-Day Color Grading & Live LUT Pipeline
function computeTimeOfDayGrade(date: Date): TimeOfDayGrade {
  const hour = date.getHours();
  if (hour >= 5 && hour < 9) return { period: "GOLDEN_HOUR", kelvin: "2700K WARM AMBER" };
  if (hour >= 9 && hour < 17) return { period: "DAYLIGHT_LAB", kelvin: "4800K TUNGSTEN-DAY" };
  if (hour >= 17 && hour < 21) return { period: "TWILIGHT_BATH", kelvin: "2200K SODIUM VAPOR" };
  return { period: "MIDNIGHT_SAFELIGHT", kelvin: "1850K AMBER SAFELIGHT" };
}`,
  },
];

function highlightLine(line: string): React.ReactNode {
  if (line.trim().startsWith("//")) {
    return <span className="text-emerald-400/80">{line}</span>;
  }
  const keywordRegex =
    /\b(export|const|function|return|if|uniform|varying|void|vec2|vec3|vec4|float|sampler2D)\b/g;
  const parts = line.split(keywordRegex);
  return parts.map((part, i) =>
    keywordRegex.test(part) ? (
      <span key={i} className="text-darkroom-amber font-semibold">
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
          initial={{ opacity: 0, rotateX: 8 }}
          animate={{ opacity: 1, rotateX: 0 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-[#070707]/95 pt-16 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Syntax-highlighted portfolio source code inspection"
        >
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col p-4 sm:p-6">
            {/* Top Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border border-darkroom-amber/60 bg-[#101010] px-4 py-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-darkroom-amber">
                <Code2 className="h-4 w-4" />
                <span className="font-bold uppercase tracking-wider">
                  RAW NEGATIVE SOURCE INSPECTION // SELF-REFLECTIVE ARCHITECTURE VIEW
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 border border-darkroom-border bg-black px-3 py-1 text-darkroom-silver hover:border-darkroom-amber hover:text-darkroom-amber"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy Buffer"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceView(false)}
                  className="inline-flex items-center gap-1 border border-darkroom-amber bg-darkroom-amber px-3 py-1 font-semibold text-black hover:bg-white"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Exit Source View</span>
                </button>
              </div>
            </div>

            {/* File Tabs */}
            <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs">
              {SOURCE_FILES.map((file, idx) => (
                <button
                  key={file.filename}
                  type="button"
                  onClick={() => {
                    soundEngine.playShutter();
                    setActiveTab(idx);
                  }}
                  className={`inline-flex items-center gap-2 border px-3.5 py-2 transition ${
                    activeTab === idx
                      ? "border-darkroom-amber bg-darkroom-amber/15 text-darkroom-amber font-semibold"
                      : "border-darkroom-border bg-[#0E0E0E] text-darkroom-muted hover:text-white"
                  }`}
                >
                  <FileCode className="h-3.5 w-3.5" />
                  <span>{file.filename}</span>
                </button>
              ))}
            </div>

            {/* Code Buffer with Line Numbers */}
            <div className="mt-3 flex-1 overflow-auto border border-darkroom-border bg-[#050505] p-4 font-mono text-xs leading-relaxed">
              <div className="mb-3 border-b border-darkroom-border/60 pb-2 text-[11px] text-darkroom-muted">
                {currentFile.lang}
              </div>
              <pre className="overflow-x-auto">
                <code>
                  {currentFile.code.split("\n").map((line, idx) => (
                    <div key={idx} className="table-row hover:bg-white/5">
                      <span className="table-cell select-none pr-4 text-right text-darkroom-muted/50">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="table-cell text-darkroom-silver">
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
