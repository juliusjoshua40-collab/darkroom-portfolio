"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { PORTFOLIO_CONTENT, SecretAchievement } from "@/config/content";
import { soundEngine } from "@/utils/sound";

export type FilterMode = "default" | "glitch" | "noir" | "vivid";

export interface TimeOfDayGrade {
  period: "GOLDEN_HOUR" | "DAYLIGHT_LAB" | "TWILIGHT_BATH" | "MIDNIGHT_SAFELIGHT";
  label: string;
  kelvin: string;
  accentHex: string;
  ambientGlow: string;
  hour: number;
}

interface DarkroomContextValue {
  simpleView: boolean;
  setSimpleView: (v: boolean) => void;
  sourceView: boolean;
  setSourceView: (v: boolean) => void;
  terminalOpen: boolean;
  setTerminalOpen: (v: boolean) => void;
  filterMode: FilterMode;
  setFilterMode: (m: FilterMode) => void;
  exposureBoost: number;
  setExposureBoost: (n: number) => void;
  focusSharp: boolean;
  setFocusSharp: (v: boolean) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  timeGrade: TimeOfDayGrade;
  unlockedSecrets: string[];
  unlockSecret: (id: string) => boolean;
  activeToast: SecretAchievement | null;
  dismissToast: () => void;
  secretsModalOpen: boolean;
  setSecretsModalOpen: (v: boolean) => void;
  shuffleKey: number;
  triggerShuffle: () => void;
  hireMeUnlocked: boolean;
  setHireMeUnlocked: (v: boolean) => void;
  reducedMotion: boolean;
}

const DarkroomContext = createContext<DarkroomContextValue | null>(null);

const STORAGE_KEY = "darkroom_secrets_v1";

function computeTimeOfDayGrade(date: Date): TimeOfDayGrade {
  const hour = date.getHours();
  if (hour >= 5 && hour < 9) {
    return {
      period: "GOLDEN_HOUR",
      label: "DAWN SAFELIGHT",
      kelvin: "2700K WARM AMBER",
      accentHex: "#FFAE34",
      ambientGlow: "rgba(255, 174, 52, 0.16)",
      hour,
    };
  }
  if (hour >= 9 && hour < 17) {
    return {
      period: "DAYLIGHT_LAB",
      label: "INSPECTION LOUPE",
      kelvin: "4800K TUNGSTEN-DAY",
      accentHex: "#FF9F1C",
      ambientGlow: "rgba(255, 159, 28, 0.13)",
      hour,
    };
  }
  if (hour >= 17 && hour < 21) {
    return {
      period: "TWILIGHT_BATH",
      label: "DUSK DEVELOPER",
      kelvin: "2200K SODIUM VAPOR",
      accentHex: "#FF851B",
      ambientGlow: "rgba(255, 133, 27, 0.18)",
      hour,
    };
  }
  return {
    period: "MIDNIGHT_SAFELIGHT",
    label: "DEEP DARKROOM",
    kelvin: "1850K AMBER SAFELIGHT",
    accentHex: "#FF9F1C",
    ambientGlow: "rgba(255, 159, 28, 0.22)",
    hour,
  };
}

export function DarkroomProvider({ children }: { children: React.ReactNode }) {
  const [simpleView, setSimpleView] = useState(false);
  const [sourceView, setSourceViewState] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>("default");
  const [exposureBoost, setExposureBoost] = useState(1);
  const [focusSharp, setFocusSharp] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [timeGrade, setTimeGrade] = useState<TimeOfDayGrade>(() =>
    computeTimeOfDayGrade(new Date())
  );
  const [unlockedSecrets, setUnlockedSecrets] = useState<string[]>([]);
  const [activeToast, setActiveToast] = useState<SecretAchievement | null>(null);
  const [secretsModalOpen, setSecretsModalOpen] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [hireMeUnlocked, setHireMeUnlocked] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Load saved secrets & check prefers-reduced-motion
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setUnlockedSecrets(parsed);
      }
    } catch {
      // ignore storage errors
    }

    setTimeGrade(computeTimeOfDayGrade(new Date()));

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const unlockSecret = useCallback((id: string): boolean => {
    const secretObj = PORTFOLIO_CONTENT.secrets.find((s) => s.id === id);
    if (!secretObj) return false;

    let newlyUnlocked = false;
    setUnlockedSecrets((prev) => {
      if (prev.includes(id)) return prev;
      newlyUnlocked = true;
      const updated = [...prev, id];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    if (newlyUnlocked) {
      soundEngine.playUnlock();
      setActiveToast(secretObj);
    }
    return newlyUnlocked;
  }, []);

  // Konami code global listener: ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight b a
  useEffect(() => {
    const sequence = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];
    let index = 0;

    const onKeyDown = (e: KeyboardEvent) => {
      // Quick shortcut: backtick or Ctrl+K toggles Terminal
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setTerminalOpen((prev) => !prev);
        return;
      }

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const expected = sequence[index];
      if (key === expected) {
        index += 1;
        if (index === sequence.length) {
          unlockSecret("konami");
          setFilterMode((prev) => (prev === "vivid" ? "default" : "vivid"));
          index = 0;
        }
      } else {
        index = key === sequence[0] ? 1 : 0;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [unlockSecret]);

  // Apply live CSS variables for time-of-day grading and live filter mode
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--safelight-accent", timeGrade.accentHex);
    root.style.setProperty("--safelight-glow", timeGrade.ambientGlow);
    root.style.setProperty("--exposure-multiplier", String(exposureBoost));
    root.dataset.filterMode = filterMode;
    root.dataset.focusState = focusSharp ? "sharp" : "soft";
  }, [timeGrade, filterMode, exposureBoost, focusSharp]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      soundEngine.setEnabled(next);
      return next;
    });
  }, []);

  const setSourceView = useCallback(
    (v: boolean) => {
      setSourceViewState(v);
      if (v) {
        unlockSecret("source-inspector");
      }
    },
    [unlockSecret]
  );

  const triggerShuffle = useCallback(() => {
    setShuffleKey((prev) => prev + 1);
    soundEngine.playShutter();
  }, []);

  const dismissToast = useCallback(() => setActiveToast(null), []);

  return (
    <DarkroomContext.Provider
      value={{
        simpleView,
        setSimpleView,
        sourceView,
        setSourceView,
        terminalOpen,
        setTerminalOpen,
        filterMode,
        setFilterMode,
        exposureBoost,
        setExposureBoost,
        focusSharp,
        setFocusSharp,
        soundEnabled,
        toggleSound,
        timeGrade,
        unlockedSecrets,
        unlockSecret,
        activeToast,
        dismissToast,
        secretsModalOpen,
        setSecretsModalOpen,
        shuffleKey,
        triggerShuffle,
        hireMeUnlocked,
        setHireMeUnlocked,
        reducedMotion,
      }}
    >
      {children}
    </DarkroomContext.Provider>
  );
}

export function useDarkroom() {
  const ctx = useContext(DarkroomContext);
  if (!ctx) {
    throw new Error("useDarkroom must be used inside a DarkroomProvider");
  }
  return ctx;
}
