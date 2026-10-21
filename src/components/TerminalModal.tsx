"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Terminal as TerminalIcon, X, CornerDownLeft, Sparkles } from "lucide-react";
import { PORTFOLIO_CONTENT } from "@/config/content";
import { useDarkroom, FilterMode } from "@/context/DarkroomContext";
import { soundEngine } from "@/utils/sound";
import photosData from "../../public/photos/photos.json";

interface LogEntry {
  id: string;
  command?: string;
  output: React.ReactNode;
  isSystem?: boolean;
}

const AVAILABLE_COMMANDS = [
  "help",
  "about",
  "projects",
  "gallery",
  "expose",
  "develop",
  "focus",
  "filter glitch",
  "filter noir",
  "filter vivid",
  "filter default",
  "shuffle",
  "contact",
  "clear",
  "sudo hire-me",
];

export function TerminalModal() {
  const {
    terminalOpen,
    setTerminalOpen,
    filterMode,
    setFilterMode,
    exposureBoost,
    setExposureBoost,
    focusSharp,
    setFocusSharp,
    triggerShuffle,
    unlockSecret,
    setHireMeUnlocked,
  } = useDarkroom();

  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "boot-1",
      isSystem: true,
      output: (
        <div className="space-y-1 text-darkroom-amber">
          <p>DARKROOM OS v4.2 // SILVER-HALIDE KERNEL INITIALIZED</p>
          <p className="text-darkroom-muted">
            Type <span className="text-white">help</span> for available commands, use{" "}
            <span className="text-white">Tab</span> to autocomplete, or{" "}
            <span className="text-white">↑/↓</span> for history.
          </p>
        </div>
      ),
    },
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [terminalOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const executeCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    soundEngine.playShutter();
    unlockSecret("terminal-operator");

    setHistory((prev) => [trimmed, ...prev]);
    setHistoryIndex(-1);

    const normalized = trimmed.toLowerCase();
    const parts = normalized.split(/\s+/);
    const base = parts[0];
    const arg = parts.slice(1).join(" ");

    if (normalized === "clear") {
      setLogs([]);
      setInput("");
      return;
    }

    let responseNode: React.ReactNode = null;

    if (normalized === "sudo hire-me") {
      unlockSecret("sudo-hire");
      setHireMeUnlocked(true);
      responseNode = (
        <div className="my-2 border border-darkroom-amber bg-darkroom-amber/10 p-3 text-darkroom-amber space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <Sparkles className="h-4 w-4" />
            <span>[ROOT ACCESS GRANTED] // PRIORITY CANDIDATE DOSSIER UNLOCKED</span>
          </div>
          <p className="text-white">
            Candidate: <strong>{PORTFOLIO_CONTENT.name}</strong> — {PORTFOLIO_CONTENT.role}
          </p>
          <p className="text-darkroom-silver">
            Status: {PORTFOLIO_CONTENT.availability}
          </p>
          <p className="text-xs text-darkroom-silver">
            Direct Priority Channel:{" "}
            <a
              href={`mailto:${PORTFOLIO_CONTENT.contact.email}?subject=Priority%20Engineering%20Inquiry%20[sudo%20hire-me]`}
              className="underline text-darkroom-amber font-semibold"
            >
              {PORTFOLIO_CONTENT.contact.email}
            </a>
          </p>
        </div>
      );
    } else {
      switch (base) {
        case "help":
          responseNode = (
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 text-xs">
              <div>
                <span className="text-darkroom-amber">help</span> — Show this command manifest
              </div>
              <div>
                <span className="text-darkroom-amber">about</span> — Print bio & darkroom philosophy
              </div>
              <div>
                <span className="text-darkroom-amber">projects</span> — List contact-sheet case studies
              </div>
              <div>
                <span className="text-darkroom-amber">gallery</span> — List archival photo plates
              </div>
              <div>
                <span className="text-darkroom-amber">expose</span> — Boost safelight exposure (+15%)
              </div>
              <div>
                <span className="text-darkroom-amber">develop</span> — Reset chemical bath to calibrated 1.0x
              </div>
              <div>
                <span className="text-darkroom-amber">focus</span> — Toggle optical sharp/soft focus plane
              </div>
              <div>
                <span className="text-darkroom-amber">filter [glitch|noir|vivid|default]</span> — Live re-grade site
              </div>
              <div>
                <span className="text-darkroom-amber">shuffle</span> — Re-sequence gallery plates
              </div>
              <div>
                <span className="text-darkroom-amber">contact</span> — Display direct dispatch channels
              </div>
              <div>
                <span className="text-darkroom-amber">clear</span> — Wipe terminal buffer
              </div>
              <div className="text-darkroom-muted">
                <span>sudo ???</span> — [REDACTED ROOT DIRECTIVE]
              </div>
            </div>
          );
          break;

        case "about":
          responseNode = (
            <div className="space-y-1.5 text-darkroom-silver">
              <p className="text-darkroom-amber font-semibold">
                {PORTFOLIO_CONTENT.name} — {PORTFOLIO_CONTENT.role}
              </p>
              <p>{PORTFOLIO_CONTENT.tagline}</p>
              {PORTFOLIO_CONTENT.bioParagraphs.map((p, i) => (
                <p key={i} className="text-darkroom-muted">
                  {p}
                </p>
              ))}
            </div>
          );
          break;

        case "projects":
          responseNode = (
            <div className="space-y-2">
              {PORTFOLIO_CONTENT.projects.map((p) => (
                <div key={p.id} className="border-l-2 border-darkroom-amber pl-2.5">
                  <div className="text-white font-semibold">
                    [{p.frameNumber}] {p.title}{" "}
                    <span className="text-darkroom-amber text-[11px]">({p.role})</span>
                  </div>
                  <div className="text-darkroom-muted text-xs">{p.oneLiner}</div>
                </div>
              ))}
            </div>
          );
          break;

        case "gallery":
          responseNode = (
            <div className="space-y-1">
              <p className="text-darkroom-amber">
                LOADED {photosData.length} ARCHIVAL PLATES FROM /public/photos/photos.json:
              </p>
              {photosData.map((ph) => (
                <div key={ph.id} className="text-xs text-darkroom-silver">
                  · [{ph.frame}] <strong>{ph.title}</strong> — {ph.camera} ({ph.date})
                </div>
              ))}
            </div>
          );
          break;

        case "expose": {
          const nextExp = Math.min(1.45, Number((exposureBoost + 0.15).toFixed(2)));
          setExposureBoost(nextExp);
          responseNode = (
            <span className="text-darkroom-amber">
              ENLARGER LAMP BOOSTED → Exposure multiplier set to {nextExp}x.
            </span>
          );
          break;
        }

        case "develop":
          setExposureBoost(1);
          setFilterMode("default");
          setFocusSharp(true);
          responseNode = (
            <span className="text-darkroom-amber">
              CHEMICAL BATH CALIBRATED → Exposure 1.0x, LUT: DEFAULT, Focus: SHARP.
            </span>
          );
          break;

        case "focus": {
          const nextFocus = !focusSharp;
          setFocusSharp(nextFocus);
          responseNode = (
            <span className="text-darkroom-amber">
              ENLARGER FOCUS RING → {nextFocus ? "CRITICAL SHARP LOCK (f/8)" : "SOFT DIFFUSION (f/1.2)"}
            </span>
          );
          break;
        }

        case "filter": {
          const validModes: FilterMode[] = ["glitch", "noir", "vivid", "default"];
          if (validModes.includes(arg as FilterMode)) {
            setFilterMode(arg as FilterMode);
            responseNode = (
              <span className="text-darkroom-amber">
                GLOBAL DARKROOM COLOR GRADE UPDATED → LUT:[{arg.toUpperCase()}]
              </span>
            );
          } else {
            responseNode = (
              <span className="text-red-400">
                Usage: filter [glitch | noir | vivid | default] (Current: {filterMode})
              </span>
            );
          }
          break;
        }

        case "shuffle":
          triggerShuffle();
          responseNode = (
            <span className="text-darkroom-amber">
              LIGHT-TABLE PLATES SHUFFLED → New contact sequence applied.
            </span>
          );
          break;

        case "contact":
          responseNode = (
            <div className="space-y-1 text-xs">
              <div>
                EMAIL:{" "}
                <a
                  href={`mailto:${PORTFOLIO_CONTENT.contact.email}`}
                  className="text-darkroom-amber underline"
                >
                  {PORTFOLIO_CONTENT.contact.email}
                </a>
              </div>
              <div>
                GITHUB:{" "}
                <a
                  href={PORTFOLIO_CONTENT.contact.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-darkroom-amber underline"
                >
                  {PORTFOLIO_CONTENT.contact.github}
                </a>
              </div>
              <div>
                LINKEDIN:{" "}
                <a
                  href={PORTFOLIO_CONTENT.contact.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-darkroom-amber underline"
                >
                  {PORTFOLIO_CONTENT.contact.linkedin}
                </a>
              </div>
            </div>
          );
          break;

        default:
          responseNode = (
            <span className="text-red-400">
              Command not recognized: &quot;{trimmed}&quot;. Type{" "}
              <strong className="text-darkroom-amber">help</strong> for a list of commands.
            </span>
          );
          break;
      }
    }

    setLogs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        command: trimmed,
        output: responseNode,
      },
    ]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      executeCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = Math.min(history.length - 1, historyIndex + 1);
      setHistoryIndex(nextIdx);
      setInput(history[nextIdx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setInput("");
      } else {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const current = input.toLowerCase().trim();
      if (!current) return;
      const match = AVAILABLE_COMMANDS.find((cmd) => cmd.startsWith(current));
      if (match) {
        setInput(match);
      }
    } else if (e.key === "Escape") {
      setTerminalOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {terminalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setTerminalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Darkroom Interactive Terminal"
        >
          <motion.div
            initial={{ scale: 0.95, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 16, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="flex h-[75vh] w-full max-w-3xl flex-col border border-darkroom-amber/80 bg-[#080808] font-mono text-xs shadow-[0_0_60px_rgba(255,159,28,0.22)]"
          >
            {/* Top Terminal Titlebar */}
            <div className="flex items-center justify-between border-b border-darkroom-border bg-[#111111] px-4 py-2.5">
              <div className="flex items-center gap-2 text-darkroom-amber">
                <TerminalIcon className="h-4 w-4" />
                <span className="font-bold tracking-wider">
                  DARKROOM_CLI // root@safelight-lab:~ (LUT:{filterMode.toUpperCase()})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setTerminalOpen(false)}
                aria-label="Close Terminal"
                className="border border-darkroom-border p-1 text-darkroom-muted hover:border-darkroom-amber hover:text-darkroom-amber"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Scrollable Output Buffer */}
            <div
              className="flex-1 space-y-3 overflow-y-auto p-4"
              onClick={() => inputRef.current?.focus()}
            >
              {logs.map((entry) => (
                <div key={entry.id} className="space-y-1">
                  {entry.command && (
                    <div className="flex items-center gap-2 text-darkroom-amber">
                      <span>safelight@darkroom:~$</span>
                      <span className="text-white font-semibold">{entry.command}</span>
                    </div>
                  )}
                  <div className="pl-2 leading-relaxed">{entry.output}</div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Quick Command Chips for One-Tap Execution */}
            <div className="flex flex-wrap items-center gap-1.5 border-t border-darkroom-border/70 bg-[#0C0C0C] px-4 py-2">
              <span className="text-[10px] text-darkroom-muted mr-1">QUICK EXEC:</span>
              {[
                "help",
                "about",
                "projects",
                "filter noir",
                "filter vivid",
                "filter glitch",
                "develop",
                "shuffle",
                "sudo hire-me",
              ].map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => executeCommand(cmd)}
                  className="border border-darkroom-border bg-black px-2 py-0.5 text-[10px] text-darkroom-silver hover:border-darkroom-amber hover:text-darkroom-amber"
                >
                  {cmd}
                </button>
              ))}
            </div>

            {/* Command Input Prompt */}
            <div className="flex items-center gap-2 border-t border-darkroom-border bg-[#101010] px-4 py-3">
              <span className="text-darkroom-amber font-semibold">safelight@darkroom:~$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command (e.g. help, filter noir, expose, sudo hire-me)..."
                aria-label="Terminal command input"
                className="flex-1 bg-transparent text-white placeholder-darkroom-muted focus:outline-none"
              />
              <button
                type="button"
                onClick={() => executeCommand(input)}
                className="inline-flex items-center gap-1 border border-darkroom-amber/60 bg-darkroom-amber/15 px-2.5 py-1 text-[10px] text-darkroom-amber hover:bg-darkroom-amber hover:text-black"
              >
                <span>RUN</span>
                <CornerDownLeft className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
