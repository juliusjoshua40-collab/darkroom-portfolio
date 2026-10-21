"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Send, Sparkles, X, Bot, User } from "lucide-react";
import { PORTFOLIO_CONTENT } from "@/config/content";
import { soundEngine } from "@/utils/sound";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
}

const SUGGESTED_PROMPTS = [
  "What projects have you built?",
  "What is your core tech stack?",
  "Tell me about your analog photography",
  "Are you available to hire?",
];

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: `Safelight AI online. Ask me anything about ${PORTFOLIO_CONTENT.name}'s WebGL & full-stack engineering projects, analog photography, or availability.`,
    },
  ]);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const sendQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || loading) return;

    soundEngine.playShutter();
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text:
            data.reply ||
            `Reach out directly at ${PORTFOLIO_CONTENT.contact.email} for full details.`,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          text: `Connection interrupted. You can reach ${PORTFOLIO_CONTENT.name} directly at ${PORTFOLIO_CONTENT.contact.email}.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 font-mono">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.95 }}
            className="mb-3 flex h-[460px] w-[340px] sm:w-[390px] flex-col border border-darkroom-amber/80 bg-[#0B0B0B] shadow-[0_0_50px_rgba(255,159,28,0.25)]"
            role="dialog"
            aria-label="Ask Me Anything AI Assistant"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-darkroom-border bg-[#121212] px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-darkroom-amber">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="font-bold tracking-wider">ASK ME ANYTHING // AI LOUPE</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close AI Chat"
                className="text-darkroom-muted hover:text-darkroom-amber"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-3.5 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.role === "assistant" && (
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-darkroom-amber/60 bg-darkroom-amber/10 text-darkroom-amber">
                      <Bot className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <div
                    className={`max-w-[82%] whitespace-pre-line border p-2.5 leading-relaxed ${
                      m.role === "user"
                        ? "border-darkroom-amber bg-darkroom-amber/15 text-white"
                        : "border-darkroom-border bg-black/70 text-darkroom-silver"
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.role === "user" && (
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-darkroom-border bg-darkroom-surface text-darkroom-muted">
                      <User className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
              ))}
              {loading && (
                <div className="text-[11px] text-darkroom-amber animate-pulse">
                  Developing response in chemical bath...
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Suggested Prompt Pills */}
            <div className="flex flex-wrap gap-1 border-t border-darkroom-border/60 bg-[#0E0E0E] px-3 py-2">
              {SUGGESTED_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendQuestion(q)}
                  className="border border-darkroom-border bg-black px-2 py-0.5 text-[10px] text-darkroom-muted hover:border-darkroom-amber hover:text-darkroom-amber"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendQuestion(input);
              }}
              className="flex items-center gap-2 border-t border-darkroom-border bg-[#121212] p-2.5"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about projects, shaders, or hiring..."
                aria-label="Ask AI assistant a question"
                className="flex-1 bg-black px-2.5 py-1.5 text-xs text-white placeholder-darkroom-muted border border-darkroom-border focus:border-darkroom-amber focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                aria-label="Send message"
                className="border border-darkroom-amber bg-darkroom-amber p-1.5 text-black hover:bg-white disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={() => {
          soundEngine.playShutter();
          setOpen((prev) => !prev);
        }}
        onMouseEnter={() => soundEngine.playHover()}
        aria-expanded={open}
        className="flex items-center gap-2 border border-darkroom-amber bg-[#0D0D0D] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-darkroom-amber shadow-[0_0_25px_rgba(255,159,28,0.28)] transition hover:bg-darkroom-amber hover:text-black"
      >
        <MessageSquare className="h-4 w-4" />
        <span>Ask AI Assistant</span>
      </button>
    </div>
  );
}
