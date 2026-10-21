"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, Sparkles, Terminal as TerminalIcon, Eye } from "lucide-react";
import { PORTFOLIO_CONTENT } from "@/config/content";
import { useDarkroom } from "@/context/DarkroomContext";
import { soundEngine } from "@/utils/sound";

gsap.registerPlugin(ScrollTrigger);

export function DevelopIntro() {
  const { reducedMotion, setTerminalOpen, exposureBoost } = useDarkroom();
  const containerRef = useRef<HTMLDivElement>(null);
  const [devProgress, setDevProgress] = useState(reducedMotion ? 1 : 0.08);
  const [manualOverride, setManualOverride] = useState(false);

  useEffect(() => {
    if (reducedMotion || manualOverride) {
      setDevProgress(1);
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.35,
        onUpdate: (self) => {
          // Starts nearly black (0.08) and develops smoothly to 1.0 as visitor scrolls
          const p = Math.min(1, Math.max(0.08, 0.08 + self.progress * 0.92));
          setDevProgress(p);
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [reducedMotion, manualOverride]);

  // Chemical development stages derived from scroll progress
  const stageLabel =
    devProgress < 0.28
      ? "STAGE 01 // LATENT NEGATIVE EXPOSURE (SUBMERGED)"
      : devProgress < 0.65
      ? "STAGE 02 // SILVER HALIDE REDUCTION (AGITATING D-76)"
      : devProgress < 0.9
      ? "STAGE 03 // STOP BATH & TONAL INVERSION"
      : "STAGE 04 // ARCHIVAL FIXER COMPLETE (D-MAX LOCKED)";

  // Dynamic CSS filter simulating darkroom silver gelatin emergence from near-black negative
  const invertAmount = Math.max(0, 1 - devProgress * 1.35);
  const brightnessAmount = (0.14 + Math.pow(devProgress, 1.15) * 0.92) * exposureBoost;
  const contrastAmount = 2.2 - devProgress * 1.05;
  const blurAmount = Math.max(0, (1 - devProgress) * 10);
  const sepiaAmount = Math.max(0.15, (1 - devProgress) * 0.85);

  const handleInstantDevelop = () => {
    soundEngine.playShutter();
    setManualOverride(true);
    setDevProgress(1);
  };

  return (
    <section
      id="develop-intro"
      ref={containerRef}
      aria-label="Darkroom Chemical Development Intro"
      className="relative min-h-[210vh] w-full bg-[#0A0A0A]"
    >
      {/* Sticky Darkroom Enlarger Viewport */}
      <div className="sticky top-0 flex min-h-screen w-full flex-col justify-between overflow-hidden px-4 pt-20 pb-8 sm:px-8">
        {/* Ambient Safelight Radial Glow that intensifies as print develops */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at 50% 42%, rgba(255, 159, 28, ${
              0.05 + devProgress * 0.16
            }), rgba(10, 10, 10, 0.98) 72%)`,
          }}
        />

        {/* Top Enlarger Telemetry Strip */}
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 border-b border-darkroom-border/70 pb-3 font-mono text-[11px] uppercase tracking-widest text-darkroom-muted">
          <div className="flex items-center gap-3">
            <span className="inline-block h-2 w-2 rounded-full bg-darkroom-amber animate-pulse" />
            <span className="text-darkroom-amber">{stageLabel}</span>
          </div>

          <div className="flex items-center gap-4">
            <span>
              DENSITY:{" "}
              <strong className="text-darkroom-silver">
                {(devProgress * 2.4).toFixed(2)} D-MAX
              </strong>
            </span>
            <span>
              BATH TEMP: <strong className="text-darkroom-silver">20.0°C</strong>
            </span>
            {devProgress < 0.95 && (
              <button
                type="button"
                onClick={handleInstantDevelop}
                className="border border-darkroom-amber/60 bg-darkroom-amber/10 px-2.5 py-0.5 text-[10px] font-semibold text-darkroom-amber transition hover:bg-darkroom-amber hover:text-black"
              >
                [QUICK DEVELOP]
              </button>
            )}
          </div>
        </div>

        {/* Center Hero Composition: Developing Negative Plate + Typography */}
        <div className="relative z-10 mx-auto my-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 py-6 lg:grid-cols-12">
          {/* Left 7 Cols: Developing Typography & Bio */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 border border-darkroom-border bg-darkroom-surface/90 px-3 py-1 font-mono text-xs uppercase tracking-widest text-darkroom-amber">
              <span>PLATE 00 // ARCHIVAL PORTFOLIO NEGATIVE</span>
              <span className="text-darkroom-muted">|</span>
              <span>{ Math.round(devProgress * 100) }% DEVELOPED</span>
            </div>

            {/* Name & Role that emerge out of near-black chemical bath */}
            <div
              style={{
                opacity: 0.12 + devProgress * 0.88,
                filter: `blur(${Math.max(0, (1 - devProgress) * 6)}px) contrast(${
                  1 + (1 - devProgress) * 0.8
                })`,
                transform: `translateY(${(1 - devProgress) * 18}px)`,
                transition: manualOverride ? "all 0.6s ease-out" : "none",
              }}
            >
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-darkroom-amber/90 mb-2">
                {PORTFOLIO_CONTENT.location}
              </p>
              <h1 className="font-display text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
                {PORTFOLIO_CONTENT.name}
              </h1>
              <p className="mt-3 font-mono text-sm sm:text-base text-darkroom-amber tracking-wide">
                {PORTFOLIO_CONTENT.role}
              </p>
              <p className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-darkroom-silver/90">
                {PORTFOLIO_CONTENT.tagline}
              </p>
            </div>

            {/* Secondary bio + CTAs reveal as silver gelatin settles */}
            <div
              className="space-y-5 pt-2"
              style={{
                opacity: Math.max(0.08, (devProgress - 0.15) / 0.85),
                filter: `blur(${Math.max(0, (0.85 - devProgress) * 4)}px)`,
              }}
            >
              <p className="max-w-xl font-mono text-xs leading-relaxed text-darkroom-muted">
                {PORTFOLIO_CONTENT.bioParagraphs[0]}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="#contact-sheets"
                  onClick={() => soundEngine.playShutter()}
                  className="inline-flex items-center gap-2 border border-darkroom-amber bg-darkroom-amber px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-widest text-black transition hover:bg-transparent hover:text-darkroom-amber"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Inspect Contact Sheets</span>
                </a>

                <a
                  href="#webgl-gallery"
                  onClick={() => soundEngine.playShutter()}
                  className="inline-flex items-center gap-2 border border-darkroom-border bg-darkroom-surface px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-darkroom-silver transition hover:border-darkroom-amber hover:text-darkroom-amber"
                >
                  <Sparkles className="h-3.5 w-3.5 text-darkroom-amber" />
                  <span>Enter WebGL Darkroom</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playShutter();
                    setTerminalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 border border-darkroom-border bg-black/60 px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-darkroom-muted transition hover:border-darkroom-amber/60 hover:text-darkroom-amber"
                >
                  <TerminalIcon className="h-3.5 w-3.5" />
                  <span>Launch CLI (Ctrl+K)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Developing Hero Film Plate inside Developing Tray */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md overflow-hidden border border-darkroom-border bg-[#070707] p-3 shadow-[0_0_50px_rgba(0,0,0,0.9)]">
              {/* Film edge markings */}
              <div className="mb-2 flex items-center justify-between font-mono text-[10px] tracking-widest text-darkroom-amber/80">
                <span>▷ ILFORD HP5 PLUS 400</span>
                <span>FRAME 00A // HERO PLATE</span>
              </div>

              {/* Developing Image Container with Chemical Ripple & Tonal Inversion */}
              <div className="relative aspect-[4/3] w-full overflow-hidden border border-darkroom-border/80 bg-[#050505]">
                <img
                  src="/photos/hero-negative.svg"
                  alt="Abstract high-contrast darkroom hero exposure"
                  className="h-full w-full object-cover"
                  style={{
                    filter: `invert(${invertAmount.toFixed(2)}) brightness(${brightnessAmount.toFixed(
                      2
                    )}) contrast(${contrastAmount.toFixed(2)}) sepia(${sepiaAmount.toFixed(
                      2
                    )}) blur(${blurAmount.toFixed(1)}px)`,
                    transform: `scale(${(1.08 - devProgress * 0.08).toFixed(3)})`,
                    transition: manualOverride ? "all 0.6s ease-out" : "none",
                  }}
                />

                {/* Chemical bath meniscus scanline during scroll development */}
                {devProgress < 0.97 && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-darkroom-amber/30 via-darkroom-amber/10 to-transparent"
                    style={{
                      top: `${devProgress * 100}%`,
                    }}
                  />
                )}

                {/* Corner optical reticle */}
                <div className="pointer-events-none absolute inset-3 border border-darkroom-amber/25">
                  <div className="absolute -top-1 -left-1 h-2.5 w-2.5 border-t border-l border-darkroom-amber" />
                  <div className="absolute -top-1 -right-1 h-2.5 w-2.5 border-t border-r border-darkroom-amber" />
                  <div className="absolute -bottom-1 -left-1 h-2.5 w-2.5 border-b border-l border-darkroom-amber" />
                  <div className="absolute -bottom-1 -right-1 h-2.5 w-2.5 border-b border-r border-darkroom-amber" />
                </div>

                {/* Live Exposure Readout Overlay */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-black/75 px-2.5 py-1 font-mono text-[10px] text-darkroom-silver backdrop-blur-sm">
                  <span>EXP: {(devProgress * 100).toFixed(0)}%</span>
                  <span className="text-darkroom-amber">
                    {devProgress < 0.45
                      ? "NEG_LATENT"
                      : devProgress < 0.85
                      ? "EMULSION_DEVELOPING"
                      : "POSITIVE_LOCKED"}
                  </span>
                </div>
              </div>

              {/* Chemical Progress Bar */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between font-mono text-[10px] text-darkroom-muted">
                  <span>DEVELOPER AGITATION PROGRESS</span>
                  <span className="text-darkroom-amber">{Math.round(devProgress * 100)}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden bg-darkroom-surface">
                  <div
                    className="h-full bg-darkroom-amber transition-all duration-75"
                    style={{ width: `${devProgress * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Scroll Prompt */}
        <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between border-t border-darkroom-border/60 pt-3 font-mono text-xs text-darkroom-muted">
          <div className="flex items-center gap-2">
            <ArrowDown className="h-3.5 w-3.5 animate-bounce text-darkroom-amber" />
            <span>
              {devProgress < 0.9
                ? "SCROLL DOWN TO DEVELOP NEGATIVE IN CHEMICAL BATH"
                : "PRINT DEVELOPED — CONTINUE SCROLLING TO ARCHIVE PLATES"}
            </span>
          </div>
          <span className="hidden sm:inline text-darkroom-amber/80">
            SAFELIGHT WAVELENGTH: 590nm AMBER
          </span>
        </div>
      </div>
    </section>
  );
}
