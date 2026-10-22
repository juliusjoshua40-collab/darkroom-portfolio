"use client";

import React, { useEffect, useState } from "react";
import { useDarkroom } from "@/context/DarkroomContext";

export function ApertureCursor() {
  const { reducedMotion, simpleView } = useDarkroom();
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
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
      setHasMoved(true);
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

  if (reducedMotion || simpleView || isTouch || !hasMoved) return null;

  const size = isPressed ? 28 : isInteractive ? 44 : 32;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-40 hidden md:flex items-center justify-center transition-[width,height,border-radius,border-color] duration-150 ease-out"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: `${pos.x - size / 2}px`,
        top: `${pos.y - size / 2}px`,
        borderRadius: isInteractive ? "6px" : "9999px",
        border: isInteractive
          ? "1.5px solid rgba(255, 159, 28, 0.85)"
          : "1px solid rgba(255, 255, 255, 0.25)",
      }}
    >
      <span
        className={`h-1 w-1 rounded-full transition-colors ${
          isInteractive ? "bg-amber-400" : "bg-white/50"
        }`}
      />
    </div>
  );
}
