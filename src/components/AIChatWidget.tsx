"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Send, X, Bot, User } from "lucide-react";
import { PORTFOLIO_CONTENT } from "@/config/content";
import { soundEngine } from "@/utils/sound";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
}

const SUGGESTED_PROMPTS = [
  "How does the Adam SIREN trainer work?",
  "What projects have you built?",
  "What is your core tech stack?",
  "How can I contact or hire you?",
];

function localTechnicalReply(question: string): string {
  const q = question.toLowerCase();

  for (const proj of PORTFOLIO_CONTENT.projects) {
    const firstWord = proj.title.split(" ")[0].toLowerCase();
    if (q.includes(firstWord) || q.includes(proj.id.toLowerCase())) {
      return `${proj.title} (${proj.role})\n\n• Summary: ${proj.oneLiner}\n• Problem: ${proj.problem}\n• Solution: ${proj.solution}\n• Stack: ${proj.stack.join(", ")}`;
    }
  }

  if (
    q.includes("deep learning") ||
    q.includes("neural") ||
    q.includes("siren") ||
    q.includes("adam") ||
    q.includes("backprop") ||
    q.includes("ml")
  ) {
    return `${PORTFOLIO_CONTENT.name}'s Deep Learning Lab (Section 04) runs 100% client-side in TypeScript:\n• Coordinate MLP: Trains a 2-layer network f_θ(x,y) → I at 60fps using analytical chain-rule backpropagation and bias-corrected Adam (β₁=0.9, β₂=0.999).\n• Spectral Bias: Switch between SIREN sin(ω₀z), Leaky ReLU, and Tanh to watch why periodic activations converge on high-frequency rings.\n• 2D Kernels: Live 3×3 Sobel and 5×5 oriented Gabor convolutions.`;
  }

  if (q.includes("project") || q.includes("built") || q.includes("work")) {
    return PORTFOLIO_CONTENT.projects
      .map((p) => `• ${p.title}: ${p.oneLiner}`)
      .join("\n\n");
  }

  if (q.includes("stack") || q.includes("skill") || q.includes("tech")) {
    return `Core Stack:\n• ML & Vision: PyTorch, Coordinate MLPs (SIREN), 2D Gabor/Sobel kernels, ONNX Runtime Web, Vector Embeddings\n• Frontend & GPU: TypeScript, React 18, Next.js, WebGL2 / Three.js, GLSL, HTML5 Canvas\n• Systems: Python, Node.js, PostgreSQL (pgvector), Git`;
  }

  if (q.includes("hire") || q.includes("contact") || q.includes("email")) {
    return `${PORTFOLIO_CONTENT.name} is ${PORTFOLIO_CONTENT.availability.toLowerCase()}.\n• Email: ${PORTFOLIO_CONTENT.contact.email}\n• GitHub: ${PORTFOLIO_CONTENT.contact.github}\n• Tip: Open the CLI (⌘K) and run 'sudo hire-me'.`;
  }

  return `${PORTFOLIO_CONTENT.name} is a ${PORTFOLIO_CONTENT.role} (${PORTFOLIO_CONTENT.location}). Ask about MicroSIREN, SonicFlow, LagosLife, WebGL shaders, or contact details (${PORTFOLIO_CONTENT.contact.email}).`;
}

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: `Hi — ask me anything about ${PORTFOLIO_CONTENT.name}'s deep learning experiments, WebGL projects, or engineering background.`,
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
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            text: data.reply || localTechnicalReply(trimmed),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            text: localTechnicalReply(trimmed),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          text: localTechnicalReply(trimmed),
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
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.96 }}
            className="mb-3 flex h-[440px] w-[340px] sm:w-[380px] flex-col rounded-md border border-neutral-700 bg-[#0E0E0E] shadow-2xl"
            role="dialog"
            aria-label="Ask AI Assistant"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 bg-[#141414] px-4 py-3">
              <span className="text-xs font-medium text-white">
                Engineering Assistant
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close AI Chat"
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-3.5 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.role === "assistant" && (
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-neutral-700 bg-neutral-900 text-amber-400">
                      <Bot className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <div
                    className={`max-w-[82%] whitespace-pre-line rounded border p-2.5 leading-relaxed ${
                      m.role === "user"
                        ? "border-neutral-700 bg-neutral-800 text-white"
                        : "border-neutral-800 bg-black/70 text-neutral-200"
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.role === "user" && (
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-neutral-800 bg-neutral-900 text-neutral-400">
                      <User className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
              ))}
              {loading && (
                <div className="text-[11px] text-neutral-400 animate-pulse">
                  Thinking...
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="flex flex-wrap gap-1 border-t border-neutral-800 bg-[#111] px-3 py-2">
              {SUGGESTED_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendQuestion(q)}
                  className="rounded border border-neutral-800 bg-black px-2 py-0.5 text-[10px] text-neutral-400 hover:border-neutral-700 hover:text-white"
                >
                  {q}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendQuestion(input);
              }}
              className="flex items-center gap-2 border-t border-neutral-800 bg-[#141414] p-2.5"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                aria-label="Ask AI assistant a question"
                className="flex-1 rounded border border-neutral-800 bg-black px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                aria-label="Send message"
                className="rounded bg-white p-1.5 text-black hover:bg-neutral-200 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => {
          soundEngine.playShutter();
          setOpen((prev) => !prev);
        }}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-md border border-neutral-700 bg-[#111] px-4 py-2.5 text-xs font-medium text-white shadow-lg transition hover:border-neutral-500"
      >
        <MessageSquare className="h-4 w-4 text-amber-500" />
        <span>Ask AI</span>
      </button>
    </div>
  );
}
