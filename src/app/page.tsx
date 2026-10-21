"use client";

import React from "react";
import { useDarkroom } from "@/context/DarkroomContext";
import { Navbar } from "@/components/Navbar";
import { DevelopIntro } from "@/components/DevelopIntro";
import { WebGLGallery } from "@/components/WebGLGallery";
import { ContactSheetProjects } from "@/components/ContactSheetProjects";
import { ApertureCursor } from "@/components/ApertureCursor";
import { TerminalModal } from "@/components/TerminalModal";
import { GenerativePlayground } from "@/components/GenerativePlayground";
import { LiveWidgets } from "@/components/LiveWidgets";
import { AIChatWidget } from "@/components/AIChatWidget";
import { SourceCodeOverlay } from "@/components/SourceCodeOverlay";
import { AchievementToast } from "@/components/AchievementToast";
import { Footer } from "@/components/Footer";
import { SimpleView } from "@/components/SimpleView";

export default function HomePage() {
  const { simpleView } = useDarkroom();

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-darkroom-silver">
      {/* Accessible Skip-to-Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:border focus:border-darkroom-amber focus:bg-black focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:text-darkroom-amber"
      >
        Skip to main content
      </a>

      <ApertureCursor />
      <Navbar />
      <TerminalModal />
      <SourceCodeOverlay />
      <AchievementToast />
      <AIChatWidget />

      {simpleView ? (
        <main id="main-content">
          <SimpleView />
        </main>
      ) : (
        <main id="main-content">
          <DevelopIntro />
          <WebGLGallery />
          <ContactSheetProjects />
          <GenerativePlayground />
          <LiveWidgets />
          <Footer />
        </main>
      )}
    </div>
  );
}
