"use client";

import React, { useEffect, useRef } from "react";
import { Github, Linkedin, Mail, Terminal, ArrowUp } from "lucide-react";
import { PORTFOLIO_CONTENT } from "@/config/content";
import { useDarkroom } from "@/context/DarkroomContext";
import { soundEngine } from "@/utils/sound";

export function Footer() {
  const { unlockSecret, unlockedSecrets, setTerminalOpen, hireMeUnlocked } =
    useDarkroom();
  const footerRef = useRef<HTMLElement>(null);

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
      className="border-t border-neutral-900 bg-[#080808] py-20 px-4 sm:px-8 font-mono text-xs"
    >
      <div className="mx-auto max-w-6xl">
        {hireMeUnlocked && (
          <div className="mb-8 rounded border border-amber-500/50 bg-amber-500/10 p-4">
            <p className="font-semibold text-amber-400">
              Priority Channel Unlocked (sudo hire-me)
            </p>
            <p className="mt-1 text-neutral-300">
              Direct contact:{" "}
              <a
                href={`mailto:${PORTFOLIO_CONTENT.contact.email}`}
                className="underline text-white"
              >
                {PORTFOLIO_CONTENT.contact.email}
              </a>
            </p>
          </div>
        )}

        <div className="flex flex-col justify-between gap-8 border-b border-neutral-800 pb-10 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold text-white">
              {PORTFOLIO_CONTENT.name}
            </h2>
            <p className="mt-1 text-neutral-400">{PORTFOLIO_CONTENT.availability}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${PORTFOLIO_CONTENT.contact.email}`}
              className="inline-flex items-center gap-2 rounded bg-white px-4 py-2 font-medium text-black hover:bg-neutral-200"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>{PORTFOLIO_CONTENT.contact.email}</span>
            </a>
            <a
              href={PORTFOLIO_CONTENT.contact.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-neutral-300 hover:border-neutral-700 hover:text-white"
            >
              <Github className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </a>
            <a
              href={PORTFOLIO_CONTENT.contact.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-neutral-300 hover:border-neutral-700 hover:text-white"
            >
              <Linkedin className="h-3.5 w-3.5" />
              <span>LinkedIn</span>
            </a>
            <button
              type="button"
              onClick={() => setTerminalOpen(true)}
              className="inline-flex items-center gap-2 rounded border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-neutral-300 hover:border-neutral-700 hover:text-white"
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>CLI</span>
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-neutral-500">
          <span>
            Built with Next.js, TypeScript, WebGL2 & PyTorch/ONNX · Easter eggs:{" "}
            {unlockedSecrets.length}/{PORTFOLIO_CONTENT.secrets.length}
          </span>
          <a
            href="#develop-intro"
            onClick={() => soundEngine.playShutter()}
            className="inline-flex items-center gap-1 text-neutral-400 hover:text-white"
          >
            <span>Back to top</span>
            <ArrowUp className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
