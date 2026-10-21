"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Film,
  ExternalLink,
  Github,
  Clock,
  UserCheck,
  Cpu,
  X,
  Play,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { PORTFOLIO_CONTENT, ProjectItem } from "@/config/content";
import { soundEngine } from "@/utils/sound";

/**
 * Interactive mini-simulation inside the Case Study Modal so visitors can test
 * each project's optical/DSP concept directly inside the portfolio.
 */
function InteractiveCaseStudyPreview({ project }: { project: ProjectItem }) {
  const [paramA, setParamA] = useState(62);
  const [paramB, setParamB] = useState(38);
  const [negativeMode, setNegativeMode] = useState(false);

  return (
    <div className="border border-darkroom-border bg-[#060606] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-darkroom-border/70 pb-2 font-mono text-[11px]">
        <div className="flex items-center gap-2 text-darkroom-amber">
          <Play className="h-3.5 w-3.5 fill-darkroom-amber" />
          <span>INTERACTIVE SANDBOX // {project.demoType.toUpperCase()}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            soundEngine.playShutter();
            setNegativeMode(!negativeMode);
          }}
          className="border border-darkroom-amber/50 bg-darkroom-amber/10 px-2 py-0.5 text-[10px] text-darkroom-amber hover:bg-darkroom-amber hover:text-black"
        >
          {negativeMode ? "MODE: SILVER POSITIVE" : "MODE: RAW NEGATIVE"}
        </button>
      </div>

      {/* Live Visual Viewport */}
      <div className="relative aspect-video w-full overflow-hidden border border-darkroom-border bg-black">
        <img
          src={project.previewImage}
          alt={project.title}
          className="h-full w-full object-cover transition-all duration-200"
          style={{
            filter: `invert(${negativeMode ? 0.92 : 0}) contrast(${
              0.8 + paramA / 50
            }) saturate(${paramB / 30}) hue-rotate(${(paramA - 50) * 1.5}deg)`,
            transform: `scale(${1 + paramB / 400})`,
          }}
        />
        {/* Live Telemetry HUD Overlay */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 font-mono text-[10px]">
          <div className="flex justify-between text-darkroom-amber">
            <span>KERNEL: {project.id}</span>
            <span>FPS: 120.0 LOCKED</span>
          </div>
          <div className="flex justify-between bg-black/75 px-2.5 py-1 text-darkroom-silver">
            <span>HALATION GAIN: {paramA}%</span>
            <span>GRAIN DENSITY: {paramB}%</span>
            <span>STOCK: {project.filmStock}</span>
          </div>
        </div>
      </div>

      {/* Interactive Parameter Sliders */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 font-mono text-xs">
        <label className="flex items-center justify-between gap-3 border border-darkroom-border bg-darkroom-surface px-3 py-1.5">
          <span className="text-[11px] text-darkroom-muted">HALATION CURVE:</span>
          <input
            type="range"
            min="10"
            max="100"
            value={paramA}
            onChange={(e) => setParamA(Number(e.target.value))}
            className="w-28 accent-darkroom-amber"
          />
        </label>
        <label className="flex items-center justify-between gap-3 border border-darkroom-border bg-darkroom-surface px-3 py-1.5">
          <span className="text-[11px] text-darkroom-muted">EMULSION FLUX:</span>
          <input
            type="range"
            min="5"
            max="100"
            value={paramB}
            onChange={(e) => setParamB(Number(e.target.value))}
            className="w-28 accent-darkroom-amber"
          />
        </label>
      </div>
    </div>
  );
}

export function ContactSheetProjects() {
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);
  const [negativeStripView, setNegativeStripView] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveProject(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section
      id="contact-sheets"
      aria-labelledby="contact-sheet-heading"
      className="relative border-t border-darkroom-border bg-[#080808] py-24 px-4 sm:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 flex flex-col justify-between gap-4 border-b border-darkroom-border pb-6 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-darkroom-amber">
              <Film className="h-3.5 w-3.5" />
              <span>03 // 35MM ARCHIVAL CONTACT SHEETS (ENGINEERING CASE STUDIES)</span>
            </div>
            <h2
              id="contact-sheet-heading"
              className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl"
            >
              CODE AS FILM NEGATIVES
            </h2>
            <p className="mt-2 max-w-2xl font-mono text-xs leading-relaxed text-darkroom-muted">
              Each software project is cataloged on a perforated 35mm contact sheet with full EXIF build telemetry (stack, build duration, role, and exposure metrics). Click any frame to inspect the problem/solution case study and interactive sandbox.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playShutter();
              setNegativeStripView((prev) => !prev);
            }}
            aria-pressed={negativeStripView}
            className={`self-start border px-4 py-2 font-mono text-xs uppercase tracking-wider transition lg:self-auto ${
              negativeStripView
                ? "border-darkroom-amber bg-darkroom-amber text-black font-semibold"
                : "border-darkroom-border bg-darkroom-surface text-darkroom-silver hover:border-darkroom-amber hover:text-darkroom-amber"
            }`}
          >
            {negativeStripView ? "Invert to Positive Prints" : "Inspect as Uncut Film Negatives"}
          </button>
        </div>

        {/* 35mm Contact Sheet Strip Container */}
        <div className="border-y-2 border-darkroom-border bg-[#111111] py-3">
          {/* Top 35mm Sprocket Perforations */}
          <div className="mb-3 flex items-center justify-between overflow-hidden px-2 py-1">
            {Array.from({ length: 28 }).map((_, idx) => (
              <span
                key={idx}
                aria-hidden="true"
                className="h-3 w-4 rounded-[2px] border border-darkroom-border/80 bg-[#050505]"
              />
            ))}
          </div>

          {/* Film Frame Cards Grid */}
          <div className="grid grid-cols-1 gap-6 px-3 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
            {PORTFOLIO_CONTENT.projects.map((project, index) => (
              <article
                key={project.id}
                onMouseEnter={() => soundEngine.playHover()}
                className="group relative flex flex-col justify-between border border-darkroom-border bg-[#0A0A0A] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-darkroom-amber hover:shadow-[0_0_35px_rgba(255,159,28,0.16)]"
              >
                {/* Film Edge Frame Code & Red Grease-Pencil Loupe Circle */}
                <div>
                  <div className="mb-3 flex items-center justify-between border-b border-darkroom-border/70 pb-2 font-mono text-[10px] tracking-widest">
                    <span className="font-bold text-darkroom-amber">
                      ▶ {project.filmStock} // {project.frameNumber}
                    </span>
                    <span className="border border-darkroom-amber/40 bg-darkroom-amber/10 px-1.5 py-0.5 text-darkroom-amber">
                      SELECT #{index + 1}
                    </span>
                  </div>

                  {/* Frame Thumbnail with Grease Pencil Crop Marks on Hover */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      soundEngine.playShutter();
                      setActiveProject(project);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        soundEngine.playShutter();
                        setActiveProject(project);
                      }
                    }}
                    className="relative aspect-[16/10] w-full cursor-pointer overflow-hidden border border-darkroom-border bg-black"
                  >
                    <img
                      src={project.previewImage}
                      alt={project.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                      style={{
                        filter: negativeStripView ? "invert(0.92) hue-rotate(180deg)" : "none",
                      }}
                    />

                    {/* Amber grease-pencil editorial circle that draws in on hover */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="border-2 border-darkroom-amber bg-black/85 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-widest text-darkroom-amber shadow-lg">
                        Open Case Study
                      </span>
                    </div>

                    {/* Fake EXIF Exposure Strip */}
                    <div className="absolute bottom-0 inset-x-0 flex items-center justify-between bg-black/85 px-2.5 py-1 font-mono text-[10px] text-darkroom-muted">
                      <span>{project.isoRating}</span>
                      <span>{project.aperture}</span>
                      <span>{project.shutterSpeed}</span>
                    </div>
                  </div>

                  {/* Title & One-liner */}
                  <h3 className="mt-4 font-display text-xl font-bold text-white group-hover:text-darkroom-amber">
                    {project.title}
                  </h3>
                  <p className="mt-1.5 font-mono text-xs leading-relaxed text-darkroom-muted">
                    {project.oneLiner}
                  </p>

                  {/* Fake EXIF Metadata Table (Role, Build Time, Stack) */}
                  <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-darkroom-border/60 pt-3 font-mono text-[11px]">
                    <div>
                      <dt className="flex items-center gap-1 text-[10px] text-darkroom-muted">
                        <UserCheck className="h-3 w-3 text-darkroom-amber" />
                        <span>EXIF:ROLE</span>
                      </dt>
                      <dd className="mt-0.5 truncate text-darkroom-silver">{project.role}</dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-1 text-[10px] text-darkroom-muted">
                        <Clock className="h-3 w-3 text-darkroom-amber" />
                        <span>EXIF:BUILD_TIME</span>
                      </dt>
                      <dd className="mt-0.5 text-darkroom-silver">{project.buildTime}</dd>
                    </div>
                  </dl>

                  {/* Tech Stack Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="border border-darkroom-border bg-darkroom-surface px-2 py-0.5 font-mono text-[10px] text-darkroom-amber"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-darkroom-border pt-3 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playShutter();
                      setActiveProject(project);
                    }}
                    className="font-semibold uppercase tracking-wider text-darkroom-amber hover:underline"
                  >
                    [Inspect Case Study →]
                  </button>
                  <div className="flex items-center gap-2">
                    <a
                      href={project.repoLink}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${project.title} GitHub repository`}
                      className="p-1 text-darkroom-muted hover:text-darkroom-amber"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${project.title} live deployment`}
                      className="p-1 text-darkroom-muted hover:text-darkroom-amber"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Bottom 35mm Sprocket Perforations */}
          <div className="mt-3 flex items-center justify-between overflow-hidden px-2 py-1">
            {Array.from({ length: 28 }).map((_, idx) => (
              <span
                key={idx}
                aria-hidden="true"
                className="h-3 w-4 rounded-[2px] border border-darkroom-border/80 bg-[#050505]"
              />
            ))}
          </div>
        </div>

        {/* Chemical Skills & Darkroom Capabilities Ledger */}
        <div className="mt-20">
          <div className="mb-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-darkroom-amber">
                CHEMICAL FORMULARY // TECHNICAL ARCHITECTURE MATRIX
              </span>
              <h3 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
                DEVELOPER, STOP BATH & ARCHIVAL FIXER STACK
              </h3>
            </div>
            <span className="font-mono text-xs text-darkroom-muted">
              CALIBRATED AT 20°C · CONTINUOUS AGITATION
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {PORTFOLIO_CONTENT.skills.map((group) => (
              <div
                key={group.category}
                className="border border-darkroom-border bg-[#0D0D0D] p-5"
              >
                <div className="flex items-center justify-between border-b border-darkroom-border pb-2 font-mono text-[11px]">
                  <span className="text-darkroom-amber">{group.chemicalCode}</span>
                  <span className="text-darkroom-muted">PURITY: {group.purity}</span>
                </div>
                <h4 className="mt-3 font-mono text-xs font-bold uppercase tracking-wider text-white">
                  {group.category}
                </h4>

                <div className="mt-4 space-y-4">
                  {group.items.map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between font-mono text-xs">
                        <span className="text-darkroom-silver">{item.name}</span>
                        <span className="text-darkroom-amber">{item.level}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full bg-black">
                        <div
                          className="h-full bg-darkroom-amber"
                          style={{ width: `${item.level}%` }}
                        />
                      </div>
                      <p className="mt-1 font-mono text-[10px] text-darkroom-muted">
                        {item.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Case Study Modal */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md sm:p-6"
            onClick={() => setActiveProject(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-study-title"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-4xl overflow-y-auto border border-darkroom-amber/70 bg-[#0C0C0C] p-6 shadow-[0_0_80px_rgba(255,159,28,0.22)]"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between border-b border-darkroom-border pb-4">
                <div className="flex items-center gap-2 font-mono text-xs text-darkroom-amber">
                  <Sparkles className="h-4 w-4" />
                  <span>
                    CONTACT SHEET CASE STUDY // {activeProject.id} (FRAME {activeProject.frameNumber})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveProject(null)}
                  aria-label="Close case study modal"
                  className="border border-darkroom-border p-1.5 text-darkroom-muted hover:border-darkroom-amber hover:text-darkroom-amber"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Title + EXIF Summary Pills */}
              <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3
                    id="case-study-title"
                    className="font-display text-2xl font-bold text-white sm:text-3xl"
                  >
                    {activeProject.title}
                  </h3>
                  <p className="mt-1 font-mono text-xs text-darkroom-silver/90">
                    {activeProject.oneLiner}
                  </p>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <a
                    href={activeProject.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 border border-darkroom-amber bg-darkroom-amber px-3.5 py-2 font-semibold text-black hover:bg-white"
                  >
                    <span>Launch Live Demo</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href={activeProject.repoLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 border border-darkroom-border bg-darkroom-surface px-3.5 py-2 text-darkroom-silver hover:border-darkroom-amber hover:text-darkroom-amber"
                  >
                    <Github className="h-3.5 w-3.5" />
                    <span>GitHub</span>
                  </a>
                </div>
              </div>

              {/* Interactive Live Demo Preview */}
              <div className="mt-6">
                <InteractiveCaseStudyPreview project={activeProject} />
              </div>

              {/* Problem / Solution Grid */}
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="border border-darkroom-border bg-darkroom-surface/70 p-4">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-darkroom-muted">
                    01 // THE ENGINEERING PROBLEM
                  </span>
                  <p className="mt-2 font-mono text-xs leading-relaxed text-darkroom-silver">
                    {activeProject.problem}
                  </p>
                </div>

                <div className="border border-darkroom-amber/40 bg-darkroom-amber/5 p-4">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-darkroom-amber">
                    02 // THE OPTICAL & SYSTEMS SOLUTION
                  </span>
                  <p className="mt-2 font-mono text-xs leading-relaxed text-darkroom-silver">
                    {activeProject.solution}
                  </p>
                </div>
              </div>

              {/* Impact Metrics & Full Stack */}
              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-darkroom-border pt-5 md:grid-cols-2">
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-wider text-darkroom-amber">
                    VERIFIED BENCHMARKS & OUTCOMES
                  </h4>
                  <ul className="mt-2.5 space-y-2 font-mono text-xs text-darkroom-silver">
                    {activeProject.impactMetrics.map((metric, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-darkroom-amber shrink-0" />
                        <span>{metric}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-mono text-xs uppercase tracking-wider text-darkroom-amber">
                    EXIF ARCHITECTURE STACK ({activeProject.buildTime} · {activeProject.role})
                  </h4>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {activeProject.stack.map((tech) => (
                      <span
                        key={tech}
                        className="border border-darkroom-border bg-black px-2.5 py-1 font-mono text-xs text-darkroom-amber"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
