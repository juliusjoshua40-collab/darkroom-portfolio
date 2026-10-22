"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, Github, Mail, Terminal as TerminalIcon } from "lucide-react";
import { PORTFOLIO_CONTENT } from "@/config/content";
import { useDarkroom } from "@/context/DarkroomContext";
import { soundEngine } from "@/utils/sound";

gsap.registerPlugin(ScrollTrigger);

export function DevelopIntro() {
  const { reducedMotion, setTerminalOpen, exposureBoost } = useDarkroom();
  const containerRef = useRef<HTMLDivElement>(null);
  const [devProgress, setDevProgress] = useState(reducedMotion ? 1 : 0.35);
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
        scrub: 0.25,
        onUpdate: (self) => {
          const p = Math.min(1, Math.max(0.35, 0.35 + self.progress * 0.65));
          setDevProgress(p);
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [reducedMotion, manualOverride]);

  const invertAmount = Math.max(0, (1 - devProgress) * 0.85);
  const brightnessAmount = (0.45 + devProgress * 0.55) * exposureBoost;
  const contrastAmount = 1.45 - devProgress * 0.35;
  const blurAmount = Math.max(0, (1 - devProgress) * 4);

  return (
    <section
      id="develop-intro"
      ref={containerRef}
      aria-label="Introduction"
      className="relative min-h-[145vh] w-full bg-[#0A0A0A]"
    >
      <div className="sticky top-0 flex min-h-screen w-full flex-col justify-between px-4 pt-24 pb-10 sm:px-8">
        <div className="mx-auto my-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left 7 Cols: Clean Developer Introduction */}
          <div className="space-y-6 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1 font-mono text-xs text-neutral-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>{PORTFOLIO_CONTENT.availability}</span>
            </div>

            <div
              style={{
                opacity: 0.4 + devProgress * 0.6,
                transform: `translateY(${(1 - devProgress) * 10}px)`,
                transition: manualOverride ? "all 0.4s ease-out" : "none",
              }}
            >
              <h1 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-6xl">
                {PORTFOLIO_CONTENT.name}
              </h1>
              <p className="mt-2 font-mono text-sm text-amber-500 sm:text-base">
                {PORTFOLIO_CONTENT.role} · {PORTFOLIO_CONTENT.location}
              </p>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-200 sm:text-lg">
                {PORTFOLIO_CONTENT.tagline}
              </p>
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-neutral-400 max-w-xl">
              {PORTFOLIO_CONTENT.bioParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Clean Developer Links */}
            <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs">
              <a
                href="#contact-sheets"
                onClick={() => soundEngine.playShutter()}
                className="rounded bg-white px-4 py-2.5 font-medium text-black transition hover:bg-neutral-200"
              >
                View Engineering Work
              </a>

              <a
                href="#neural-darkroom"
                onClick={() => soundEngine.playShutter()}
                className="rounded border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-neutral-200 transition hover:border-neutral-700 hover:text-white"
              >
                Deep Learning Lab
              </a>

              <a
                href={PORTFOLIO_CONTENT.contact.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded border border-neutral-800 bg-transparent px-3.5 py-2.5 text-neutral-400 transition hover:border-neutral-700 hover:text-white"
              >
                <Github className="h-3.5 w-3.5" />
                <span>GitHub</span>
              </a>

              <a
                href={`mailto:${PORTFOLIO_CONTENT.contact.email}`}
                className="inline-flex items-center gap-1.5 rounded border border-neutral-800 bg-transparent px-3.5 py-2.5 text-neutral-400 transition hover:border-neutral-700 hover:text-white"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Email</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playShutter();
                  setTerminalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded border border-neutral-800 bg-transparent px-3.5 py-2.5 text-neutral-400 transition hover:border-neutral-700 hover:text-white"
              >
                <TerminalIcon className="h-3.5 w-3.5" />
                <span>Terminal</span>
              </button>
            </div>
          </div>

          {/* Right 5 Cols: Developing Silver-Gelatin Frame */}
          <div className="lg:col-span-5">
            <div className="mx-auto max-w-md rounded-md border border-neutral-800 bg-[#0D0D0D] p-3.5">
              <div className="mb-2.5 flex items-center justify-between font-mono text-[11px] text-neutral-400">
                <span>Ilford HP5 Plus · 120 Medium Format</span>
                <button
                  type="button"
                  onClick={() => {
                    setManualOverride(true);
                    setDevProgress(1);
                  }}
                  className="text-amber-500 hover:underline"
                >
                  {devProgress < 0.95
                    ? `Developing ${Math.round(devProgress * 100)}%`
                    : "Developed"}
                </button>
              </div>

              <div className="relative aspect-[4/3] w-full overflow-hidden rounded border border-neutral-800 bg-black">
                <img
                  src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80"
                  alt="Monochrome architectural light study"
                  className="h-full w-full object-cover grayscale"
                  style={{
                    filter: `grayscale(1) invert(${invertAmount.toFixed(
                      2
                    )}) brightness(${brightnessAmount.toFixed(
                      2
                    )}) contrast(${contrastAmount.toFixed(2)}) blur(${blurAmount.toFixed(1)}px)`,
                  }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-neutral-500">
                <span>Hasselblad 500C/M · 80mm f/2.8</span>
                <span>Lagos, NG</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Bottom Bar */}
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between border-t border-neutral-900 pt-4 font-mono text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <ArrowDown className="h-3.5 w-3.5 text-neutral-400" />
            <span>Scroll to explore engineering projects, live neural networks, and film plates</span>
          </div>
          <span className="hidden sm:inline">TypeScript · PyTorch · WebGL2</span>
        </div>
      </div>
    </section>
  );
}
