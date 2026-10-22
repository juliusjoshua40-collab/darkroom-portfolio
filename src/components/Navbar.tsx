"use client";

import React, { useState } from "react";
import {
  Terminal,
  Code2,
  Volume2,
  VolumeX,
  FileText,
  SlidersHorizontal,
} from "lucide-react";
import { PORTFOLIO_CONTENT } from "@/config/content";
import { useDarkroom, FilterMode } from "@/context/DarkroomContext";
import { soundEngine } from "@/utils/sound";

export function Navbar() {
  const {
    simpleView,
    setSimpleView,
    sourceView,
    setSourceView,
    terminalOpen,
    setTerminalOpen,
    filterMode,
    setFilterMode,
    soundEnabled,
    toggleSound,
    unlockedSecrets,
    unlockSecret,
    setSecretsModalOpen,
  } = useDarkroom();

  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoClick = () => {
    soundEngine.playShutter();
    const next = logoClicks + 1;
    setLogoClicks(next);
    if (next >= 5) {
      unlockSecret("logo-clicks");
    }
  };

  const cycleFilter = () => {
    soundEngine.playShutter();
    const modes: FilterMode[] = ["default", "noir", "vivid", "glitch"];
    const nextIdx = (modes.indexOf(filterMode) + 1) % modes.length;
    setFilterMode(modes[nextIdx]);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-900 bg-[#0A0A0A]/85 backdrop-blur-md"
      role="banner"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-8">
        {/* Left: Clean Developer Identity */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 text-left font-mono text-sm text-white transition hover:text-amber-400"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
            <span className="font-semibold tracking-tight">{PORTFOLIO_CONTENT.name}</span>
          </button>
          <span className="hidden text-neutral-700 sm:inline">/</span>
          <span className="hidden font-mono text-xs text-neutral-400 sm:inline">
            {PORTFOLIO_CONTENT.role}
          </span>
        </div>

        {/* Center Navigation Links */}
        {!simpleView && (
          <nav
            aria-label="Primary Navigation"
            className="hidden items-center gap-6 font-mono text-xs text-neutral-400 md:flex"
          >
            <a href="#contact-sheets" className="transition hover:text-white">
              Projects
            </a>
            <a href="#neural-darkroom" className="transition hover:text-white">
              Deep Learning
            </a>
            <a href="#webgl-gallery" className="transition hover:text-white">
              Photography
            </a>
            <a href="#light-playground" className="transition hover:text-white">
              Canvas
            </a>
            <a href="#live-telemetry" className="transition hover:text-white">
              Activity
            </a>
          </nav>
        )}

        {/* Right: Minimal Developer Controls */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              soundEngine.playShutter();
              setSimpleView(!simpleView);
            }}
            aria-pressed={simpleView}
            className={`flex items-center gap-1.5 rounded border px-2.5 py-1 transition ${
              simpleView
                ? "border-white bg-white text-black font-medium"
                : "border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:border-neutral-700 hover:text-white"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>{simpleView ? "Full Site" : "Resume View"}</span>
          </button>

          <button
            type="button"
            onClick={cycleFilter}
            title="Cycle color grade"
            className="hidden items-center gap-1.5 rounded border border-neutral-800 bg-neutral-900/80 px-2.5 py-1 text-neutral-400 transition hover:border-neutral-700 hover:text-white sm:flex"
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span className="capitalize">{filterMode}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playShutter();
              setTerminalOpen(!terminalOpen);
            }}
            aria-pressed={terminalOpen}
            title="Open CLI (Ctrl+K)"
            className="flex items-center gap-1.5 rounded border border-neutral-800 bg-neutral-900/80 px-2.5 py-1 text-neutral-300 transition hover:border-neutral-700 hover:text-white"
          >
            <Terminal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">⌘K</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playShutter();
              setSourceView(!sourceView);
            }}
            aria-pressed={sourceView}
            title="Inspect source code"
            className="flex items-center gap-1 rounded border border-neutral-800 bg-neutral-900/80 px-2 py-1 text-neutral-400 transition hover:border-neutral-700 hover:text-white"
          >
            <Code2 className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundEnabled}
            title={soundEnabled ? "Mute audio" : "Enable subtle UI sound"}
            className="flex items-center rounded border border-neutral-800 bg-neutral-900/80 p-1.5 text-neutral-400 transition hover:border-neutral-700 hover:text-white"
          >
            {soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <VolumeX className="h-3.5 w-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setSecretsModalOpen(true)}
            title="Easter eggs discovered"
            className="rounded border border-neutral-800 bg-neutral-900/80 px-2 py-1 text-[11px] text-neutral-400 transition hover:border-neutral-700 hover:text-amber-400"
          >
            {unlockedSecrets.length}/{PORTFOLIO_CONTENT.secrets.length}
          </button>
        </div>
      </div>
    </header>
  );
}
