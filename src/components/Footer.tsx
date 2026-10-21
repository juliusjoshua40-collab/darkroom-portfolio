"use client";

import React, { useEffect, useRef } from "react";
import { Github, Linkedin, Mail, Terminal, Sparkles, ArrowUp } from "lucide-react";
import { PORTFOLIO_CONTENT } from "@/config/content";
import { useDarkroom } from "@/context/DarkroomContext";
import { soundEngine } from "@/utils/sound";

export function Footer() {
  const {
    unlockSecret,
    unlockedSecrets,
    setTerminalOpen,
    hireMeUnlocked,
    timeGrade,
  } = useDarkroom();
  const footerRef = useRef<HTMLElement>(null);

  // Trigger "darkroom-alchemist" secret when visitor reaches the footer colophon
  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          unlockSecret("darkroom-alchemist");
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [unlockSecret]);

  return (
    <footer
      ref={footerRef}
      id="colophon-footer"
      className="relative border-t border-darkroom-border bg-[#060606] pt-20 pb-24 px-4 sm:px-8 font-mono"
    >
      <div className="mx-auto max-w-7xl">
        {/* Secret Root Clearance Banner if unlocked via sudo hire-me */}
        {hireMeUnlocked && (
          <div className="mb-10 border border-darkroom-amber bg-darkroom-amber/10 p-5 text-xs">
            <div className="flex items-center gap-2 font-bold text-darkroom-amber">
              <Sparkles className="h-4 w-4" />
              <span>ROOT CLEARANCE ACTIVE // PRIORITY ENGINEERING CHANNEL UNLOCKED</span>
            </div>
            <p className="mt-1 text-darkroom-silver">
              You unlocked the classified dossier via <code className="text-darkroom-amber">sudo hire-me</code>. Direct priority line:{" "}
              <a
                href={`mailto:${PORTFOLIO_CONTENT.contact.email}?subject=Priority%20Role%20Inquiry`}
                className="font-bold text-darkroom-amber underline"
              >
                {PORTFOLIO_CONTENT.contact.email}
              </a>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-10 border-b border-darkroom-border pb-12 lg:grid-cols-12">
          {/* Left 7 Cols: Call to Action */}
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs uppercase tracking-widest text-darkroom-amber">
              06 // END OF ROLL · ARCHIVAL FIXER COMPLETE
            </span>
            <h2 className="font-display text-3xl font-bold text-white sm:text-5xl">
              LET&apos;S DEVELOP SOMETHING EXTRAORDINARY.
            </h2>
            <p className="max-w-xl text-xs leading-relaxed text-darkroom-muted">
              {PORTFOLIO_CONTENT.availability}. Reach out directly via email, inspect my repositories on GitHub, or open the Darkroom CLI terminal.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <a
                href={`mailto:${PORTFOLIO_CONTENT.contact.email}`}
                onClick={() => soundEngine.playShutter()}
                className="inline-flex items-center gap-2 border border-darkroom-amber bg-darkroom-amber px-5 py-2.5 font-semibold uppercase tracking-wider text-black transition hover:bg-white"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>{PORTFOLIO_CONTENT.contact.email}</span>
              </a>

              <a
                href={PORTFOLIO_CONTENT.contact.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-darkroom-border bg-darkroom-surface px-4 py-2.5 text-darkroom-silver hover:border-darkroom-amber hover:text-darkroom-amber"
              >
                <Github className="h-3.5 w-3.5" />
                <span>GitHub</span>
              </a>

              <a
                href={PORTFOLIO_CONTENT.contact.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-darkroom-border bg-darkroom-surface px-4 py-2.5 text-darkroom-silver hover:border-darkroom-amber hover:text-darkroom-amber"
              >
                <Linkedin className="h-3.5 w-3.5" />
                <span>LinkedIn</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playShutter();
                  setTerminalOpen(true);
                }}
                className="inline-flex items-center gap-2 border border-darkroom-border bg-black px-4 py-2.5 text-darkroom-muted hover:border-darkroom-amber hover:text-darkroom-amber"
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Terminal</span>
              </button>
            </div>
          </div>

          {/* Right 5 Cols: Darkroom Colophon & Secrets Telemetry */}
          <div className="lg:col-span-5 flex flex-col justify-between border border-darkroom-border bg-[#0B0B0B] p-5 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between border-b border-darkroom-border pb-2 text-[11px] text-darkroom-amber">
                <span>DARKROOM COLOPHON</span>
                <span>{timeGrade.kelvin}</span>
              </div>
              <p className="text-darkroom-muted leading-relaxed">
                Built with Next.js App Router, TypeScript, Tailwind CSS, React Three Fiber + Custom GLSL Shaders, GSAP ScrollTrigger + Lenis, Framer Motion, and Howler.js.
              </p>
              <p className="text-darkroom-silver pt-1">
                Secrets Discovered:{" "}
                <strong className="text-darkroom-amber">
                  {unlockedSecrets.length} / {PORTFOLIO_CONTENT.secrets.length}
                </strong>{" "}
                (saved in localStorage)
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-darkroom-border pt-3 text-[11px] text-darkroom-muted">
              <span>© {new Date().getFullYear()} {PORTFOLIO_CONTENT.name}</span>
              <a
                href="#develop-intro"
                onClick={() => soundEngine.playShutter()}
                className="inline-flex items-center gap-1 text-darkroom-amber hover:underline"
              >
                <span>Rewind Roll</span>
                <ArrowUp className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
