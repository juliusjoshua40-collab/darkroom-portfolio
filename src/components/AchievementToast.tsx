"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Trophy, Lock, CheckCircle2, X } from "lucide-react";
import { useDarkroom } from "@/context/DarkroomContext";
import { PORTFOLIO_CONTENT } from "@/config/content";

export function AchievementToast() {
  const {
    activeToast,
    dismissToast,
    unlockedSecrets,
    secretsModalOpen,
    setSecretsModalOpen,
  } = useDarkroom();

  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 5000);
    return () => clearTimeout(timer);
  }, [activeToast, dismissToast]);

  return (
    <>
      {/* Live Toast on Secret Unlock */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.95 }}
            className="fixed top-20 right-5 z-50 w-80 border border-darkroom-amber bg-[#0E0E0E] p-4 font-mono text-xs shadow-[0_0_40px_rgba(255,159,28,0.35)]"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-darkroom-amber font-bold">
                <Trophy className="h-4 w-4 shrink-0" />
                <span>SECRET UNLOCKED ({unlockedSecrets.length}/{PORTFOLIO_CONTENT.secrets.length})</span>
              </div>
              <button
                type="button"
                onClick={dismissToast}
                aria-label="Dismiss achievement notification"
                className="text-darkroom-muted hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-2 font-semibold text-white">{activeToast.title}</p>
            <p className="mt-1 text-[11px] text-darkroom-muted">{activeToast.description}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secrets Ledger Modal (when clicking X/6 counter in Navbar) */}
      <AnimatePresence>
        {secretsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            onClick={() => setSecretsModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Darkroom Hidden Achievements Ledger"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl border border-darkroom-amber/70 bg-[#0B0B0B] p-6 font-mono text-xs shadow-[0_0_60px_rgba(255,159,28,0.2)]"
            >
              <div className="flex items-center justify-between border-b border-darkroom-border pb-3">
                <div className="flex items-center gap-2 text-darkroom-amber font-bold">
                  <Sparkles className="h-4 w-4" />
                  <span>
                    DARKROOM SECRETS LEDGER // {unlockedSecrets.length}/
                    {PORTFOLIO_CONTENT.secrets.length} FOUND
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSecretsModalOpen(false)}
                  className="border border-darkroom-border p-1 text-darkroom-muted hover:border-darkroom-amber hover:text-darkroom-amber"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {PORTFOLIO_CONTENT.secrets.map((sec) => {
                  const isUnlocked = unlockedSecrets.includes(sec.id);
                  return (
                    <div
                      key={sec.id}
                      className={`flex items-start gap-3 border p-3 ${
                        isUnlocked
                          ? "border-darkroom-amber/60 bg-darkroom-amber/10"
                          : "border-darkroom-border bg-black/50 opacity-75"
                      }`}
                    >
                      {isUnlocked ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-darkroom-amber" />
                      ) : (
                        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-darkroom-muted" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-darkroom-amber">{sec.code}</span>
                          <strong className="text-white">
                            {isUnlocked ? sec.title : "UNEXPOSED NEGATIVE"}
                          </strong>
                        </div>
                        <p className="mt-1 text-[11px] text-darkroom-muted">
                          {isUnlocked ? sec.description : `HINT: ${sec.hint}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
