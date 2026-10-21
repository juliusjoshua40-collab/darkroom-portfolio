"use client";

import React, { useEffect, useState } from "react";
import { useDarkroom } from "@/context/DarkroomContext";

export function ApertureCursor() {
  const { reducedMotion, simpleView } = useDarkroom();
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [isInteractive, setIsInteractive] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouch(true);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = Boolean(
          target.closest("a, button, input, textarea, select, [role='button']")
        );
        setIsInteractive(interactive);
      }
    };

    const onMouseDown = () => setIsPressed(true);
    const onMouseUp = () => setIsPressed(false);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  if (reducedMotion || simpleView || isTouch) return null;

  const size = isPressed ? 64 : isInteractive ? 108 : 88;

  return (
    <>
      {/* Ambient peripheral monochrome softening mask outside the aperture lens */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-30 hidden md:block"
        style={{
          background: `radial-gradient(circle ${size * 0.72}px at ${pos.x}px ${
            pos.y
          }px, rgba(255, 159, 28, 0.06) 0%, rgba(10, 10, 10, 0.28) 100%)`,
        }}
      />

      {/* Optical Lens Cursor Element */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed z-40 hidden md:flex items-center justify-center transition-[width,height,border-radius,border-color] duration-200 ease-out"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          left: `${pos.x - size / 2}px`,
          top: `${pos.y - size / 2}px`,
          borderRadius: isInteractive ? "10px" : "9999px",
          backdropFilter: "saturate(1.95) contrast(1.16) brightness(1.12)",
          WebkitBackdropFilter: "saturate(1.95) contrast(1.16) brightness(1.12)",
          border: isInteractive
            ? "1.5px solid rgba(255, 159, 28, 0.9)"
            : "1px solid rgba(255, 159, 28, 0.45)",
          boxShadow: isInteractive
            ? "0 0 28px rgba(255, 159, 28, 0.28), inset 0 0 14px rgba(255, 159, 28, 0.15)"
            : "0 0 16px rgba(0, 0, 0, 0.55)",
        }}
      >
        {/* Inner SVG Aperture Blades / Rangefinder Reticle */}
        <svg
          viewBox="0 0 100 100"
          className={`h-full w-full transition-transform duration-300 ${
            isInteractive ? "rotate-45 scale-95" : "rotate-0 scale-100"
          }`}
        >
          {!isInteractive ? (
            <>
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="#FF9F1C"
                strokeWidth="0.75"
                strokeDasharray="4 6"
                opacity="0.7"
              />
              {/* 6 Mechanical Aperture Blades */}
              <line x1="50" y1="6" x2="68" y2="26" stroke="#FF9F1C" strokeWidth="0.7" opacity="0.45" />
              <line x1="94" y1="50" x2="74" y2="68" stroke="#FF9F1C" strokeWidth="0.7" opacity="0.45" />
              <line x1="50" y1="94" x2="32" y2="74" stroke="#FF9F1C" strokeWidth="0.7" opacity="0.45" />
              <line x1="6" y1="50" x2="26" y2="32" stroke="#FF9F1C" strokeWidth="0.7" opacity="0.45" />
              <circle cx="50" cy="50" r="2" fill="#FF9F1C" opacity="0.85" />
            </>
          ) : (
            <>
              {/* Rangefinder Focus Lock Brackets on Links & Buttons */}
              <path
                d="M 20 35 L 20 20 L 35 20 M 65 20 L 80 20 L 80 35 M 80 65 L 80 80 L 65 80 M 35 80 L 20 80 L 20 65"
                fill="none"
                stroke="#FF9F1C"
                strokeWidth="2"
              />
              <circle cx="50" cy="50" r="3" fill="#FF9F1C" />
            </>
          )}
        </svg>

        {/* Micro F-Stop & Focal Telemetry Label */}
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 px-1.5 py-0.5 font-mono text-[9px] tracking-widest text-darkroom-amber">
          {isPressed ? "SHUTTER // 1/1000s" : isInteractive ? "FOCUS LOCK // f/1.4" : "LOUPE // f/2.8"}
        </span>
      </div>
    </>
  );
}
