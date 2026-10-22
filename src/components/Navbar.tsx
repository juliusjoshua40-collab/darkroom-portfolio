"use client";

import React, { useState } from "react";
import {
  Terminal,
  Code2,
  Volume2,
  VolumeX,
  Sparkles,
  FileText,
  Aperture,
  SunMedium,
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
    timeGrade,
    unlockedSecrets,
    unlockSecret,
    setSecretsModalOpen,
  } = useDarkroom();

  const [logoClicks, setLogoClicks] = useState(0);
  const [logoPulse, setLogoPulse] = useState(false);

  const handleLogoClick = () => {
    soundEngine.playShutter();
    const next = logoClicks + 1;
    setLogoClicks(next);
    setLogoPulse(true);
    setTimeout(() => setLogoPulse(false), 350);
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
      className="fixed top-0 left-0 right-0 z-50 border-b border-darkroom-border/80 bg-[#0A0A0A]/85 backdrop-blur-md"
      role="banner"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: Monogram & Safelight Status */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLogoClick}
            onMouseEnter={() => soundEngine.playHover()}
            aria-label="Darkroom Monogram — click 5 times to surge safelight"
            className={`group relative flex items-center gap-2.5 border border-darkroom-border bg-darkroom-surface px-3 py-1.5 font-mono text-xs tracking-widest transition-all ${
              logoPulse
                ? "border-darkroom-amber shadow-[0_0_24px_rgba(255,159,28,0.65)] scale-95"
                : "hover:border-darkroom-amber/60"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-darkroom-amber opacity-75" />
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ backgroundColor: timeGrade.accentHex }}
              />
            </span>
            <span className="font-semibold text-darkroom-silver group-hover:text-darkroom-amber">
              {PORTFOLIO_CONTENT.monogram}
            </span>
            <span className="hidden text-[10px] text-darkroom-muted sm:inline">
              [{PORTFOLIO_CONTENT.name}]
            </span>
          </button>

          {/* Time-of-day grading telemetry */}
          <div
            className="hidden items-center gap-2 border border-darkroom-border/60 bg-black/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-darkroom-muted lg:flex"
            title="Automatic time-of-day darkroom color temperature"
          >
            <SunMedium className="h-3 w-3 text-darkroom-amber" />
            <span>{timeGrade.label}</span>
            <span className="text-darkroom-amber/80">· {timeGrade.kelvin}</span>
          </div>
        </div>

        {/* Center section anchor links (hidden when in Simple View) */}
        {!simpleView && (
          <nav
            aria-label="Darkroom Sections"
            className="hidden items-center gap-5 font-mono text-xs tracking-wider text-darkroom-muted md:flex"
          >
            <a
              href="#develop-intro"
              onMouseEnter={() => soundEngine.playHover()}
              className="transition-colors hover:text-darkroom-amber"
            >
              01.DEVELOP
            </a>
            <a
              href="#webgl-gallery"
              onMouseEnter={() => soundEngine.playHover()}
              className="transition-colors hover:text-darkroom-amber"
            >
              02.PLATES
            </a>
            <a
              href="#contact-sheets"
              onMouseEnter={() => soundEngine.playHover()}
              className="transition-colors hover:text-darkroom-amber"
            >
              03.SHEETS
            </a>
            <a
              href="#neural-darkroom"
              onMouseEnter={() => soundEngine.playHover()}
              className="transition-colors hover:text-darkroom-amber"
            >
              04.NEURAL
            </a>
            <a
              href="#light-playground"
              onMouseEnter={() => soundEngine.playHover()}
              className="transition-colors hover:text-darkroom-amber"
            >
              05.LAB
            </a>
            <a
              href="#live-telemetry"
              onMouseEnter={() => soundEngine.playHover()}
              className="transition-colors hover:text-darkroom-amber"
            >
              06.SIGNAL
            </a>
          </nav>
        )}

        {/* Right: Interactive Mode Switches */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Simple View Toggle (Recruiter-Friendly Fast Layout) */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playShutter();
              setSimpleView(!simpleView);
            }}
            onMouseEnter={() => soundEngine.playHover()}
            aria-pressed={simpleView}
            className={`flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all ${
              simpleView
                ? "border-darkroom-amber bg-darkroom-amber text-black font-semibold shadow-[0_0_16px_rgba(255,159,28,0.4)]"
                : "border-darkroom-border bg-darkroom-surface text-darkroom-silver hover:border-darkroom-amber/60 hover:text-darkroom-amber"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>{simpleView ? "Darkroom View" : "Simple View"}</span>
          </button>

          {/* Filter Grade Cycler */}
          <button
            type="button"
            onClick={cycleFilter}
            onMouseEnter={() => soundEngine.playHover()}
            title="Cycle live color grading (Default / Noir / Vivid / Glitch)"
            className={`hidden items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all sm:flex ${
              filterMode !== "default"
                ? "border-darkroom-amber/80 bg-darkroom-amber/15 text-darkroom-amber"
                : "border-darkroom-border bg-darkroom-surface text-darkroom-muted hover:border-darkroom-amber/50 hover:text-darkroom-silver"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>LUT:{filterMode.toUpperCase()}</span>
          </button>

          {/* Terminal Mode Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playShutter();
              setTerminalOpen(!terminalOpen);
            }}
            onMouseEnter={() => soundEngine.playHover()}
            aria-pressed={terminalOpen}
            aria-label="Toggle Darkroom CLI Terminal"
            className={`flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all ${
              terminalOpen
                ? "border-darkroom-amber bg-darkroom-amber/20 text-darkroom-amber"
                : "border-darkroom-border bg-darkroom-surface text-darkroom-silver hover:border-darkroom-amber/60 hover:text-darkroom-amber"
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span className="hidden md:inline">CLI</span>
          </button>

          {/* Source Code Toggle */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playShutter();
              setSourceView(!sourceView);
            }}
            onMouseEnter={() => soundEngine.playHover()}
            aria-pressed={sourceView}
            aria-label="Toggle syntax-highlighted Source View"
            className={`flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all ${
              sourceView
                ? "border-darkroom-amber bg-darkroom-amber text-black font-semibold"
                : "border-darkroom-border bg-darkroom-surface text-darkroom-silver hover:border-darkroom-amber/60 hover:text-darkroom-amber"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Source</span>
          </button>

          {/* Sound Toggle (Muted by default) */}
          <button
            type="button"
            onClick={toggleSound}
            onMouseEnter={() => soundEngine.playHover()}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? "Mute Darkroom Audio" : "Unmute Darkroom Audio"}
            className={`flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all ${
              soundEnabled
                ? "border-darkroom-amber bg-darkroom-amber/20 text-darkroom-amber"
                : "border-darkroom-border bg-darkroom-surface text-darkroom-muted hover:border-darkroom-amber/60 hover:text-darkroom-silver"
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5 text-darkroom-amber" />
            ) : (
              <VolumeX className="h-3.5 w-3.5" />
            )}
            <span className="hidden xl:inline">{soundEnabled ? "SFX:ON" : "MUTED"}</span>
          </button>

          {/* Hidden Secrets Counter */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playShutter();
              setSecretsModalOpen(true);
            }}
            onMouseEnter={() => soundEngine.playHover()}
            aria-label={`Darkroom secrets found: ${unlockedSecrets.length} of ${PORTFOLIO_CONTENT.secrets.length}`}
            className="flex items-center gap-1 border border-darkroom-border bg-black/70 px-2.5 py-1.5 font-mono text-[11px] tracking-wider text-darkroom-amber transition-all hover:border-darkroom-amber"
          >
            <Sparkles className="h-3 w-3" />
            <span>
              {unlockedSecrets.length}/{PORTFOLIO_CONTENT.secrets.length}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
