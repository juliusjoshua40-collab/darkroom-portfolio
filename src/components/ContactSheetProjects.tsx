"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ExternalLink,
  Github,
  X,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { PORTFOLIO_CONTENT, ProjectItem } from "@/config/content";
import { soundEngine } from "@/utils/sound";

function InteractiveCaseStudyPreview({ project }: { project: ProjectItem }) {
  const [paramA, setParamA] = useState(62);
  const [paramB, setParamB] = useState(38);
  const [negativeMode, setNegativeMode] = useState(false);

  return (
    <div className="rounded-md border border-neutral-800 bg-[#080808] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-2 font-mono text-xs">
        <span className="text-neutral-300">
          Interactive Preview · <span className="text-amber-400">{project.filmStock}</span>
        </span>
        <button
          type="button"
          onClick={() => {
            soundEngine.playShutter();
            setNegativeMode(!negativeMode);
          }}
          className="rounded border border-neutral-700 bg-neutral-900 px-2.5 py-0.5 text-[11px] text-neutral-300 hover:border-amber-500/60 hover:text-white"
        >
          {negativeMode ? "Positive Print" : "Invert Negative"}
        </button>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded border border-neutral-800 bg-black">
        <img
          src={project.previewImage}
          alt={project.title}
          className="h-full w-full object-cover grayscale transition-all duration-200"
          style={{
            filter: `grayscale(1) invert(${negativeMode ? 0.92 : 0}) contrast(${
              0.8 + paramA / 50
            }) brightness(${0.75 + paramB / 120})`,
            transform: `scale(${1 + paramB / 500})`,
          }}
        />
        <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex justify-between rounded bg-black/80 px-2.5 py-1 font-mono text-[11px] text-neutral-300">
          <span>Contrast: {(0.8 + paramA / 50).toFixed(2)}</span>
          <span>Exposure: {paramB}%</span>
          <span className="text-amber-400">{project.aperture}</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 font-mono text-xs">
        <label className="flex items-center justify-between gap-3 rounded border border-neutral-800 bg-neutral-900/60 px-3 py-1.5">
          <span className="text-[11px] text-neutral-400">Contrast Curve</span>
          <input
            type="range"
            min="10"
            max="100"
            value={paramA}
            onChange={(e) => setParamA(Number(e.target.value))}
            className="w-28 accent-amber-500"
          />
        </label>
        <label className="flex items-center justify-between gap-3 rounded border border-neutral-800 bg-neutral-900/60 px-3 py-1.5">
          <span className="text-[11px] text-neutral-400">Exposure Gain</span>
          <input
            type="range"
            min="5"
            max="100"
            value={paramB}
            onChange={(e) => setParamB(Number(e.target.value))}
            className="w-28 accent-amber-500"
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
      className="border-t border-neutral-900 bg-[#0A0A0A] py-24 px-4 sm:px-8"
    >
      <div className="mx-auto max-w-6xl">
        {/* Clean Developer Section Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 border-b border-neutral-800 pb-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs text-amber-500">02 / Selected Engineering Work</p>
            <h2
              id="contact-sheet-heading"
              className="mt-1 font-display text-2xl font-semibold tracking-tight text-white sm:text-4xl"
            >
              Systems, Deep Learning & WebGL Projects
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-neutral-400">
              Production engineering and research projects. Click any card to inspect the architecture, benchmarks, and problem/solution breakdown.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playShutter();
              setNegativeStripView((prev) => !prev);
            }}
            className="self-start rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 font-mono text-xs text-neutral-300 transition hover:border-neutral-700 hover:text-white md:self-auto"
          >
            {negativeStripView ? "Show Positive Thumbnails" : "Invert as Film Negatives"}
          </button>
        </div>

        {/* Clean 2-Column Developer Project Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {PORTFOLIO_CONTENT.projects.map((project) => (
            <article
              key={project.id}
              className="group flex flex-col justify-between rounded-md border border-neutral-800 bg-[#0E0E0E] p-5 transition hover:border-neutral-600"
            >
              <div>
                {/* Top Metadata Line */}
                <div className="mb-3 flex items-center justify-between font-mono text-xs text-neutral-500">
                  <span>
                    {project.frameNumber} · {project.role}
                  </span>
                  <span className="text-neutral-400">{project.aperture}</span>
                </div>

                {/* Thumbnail */}
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
                      setActiveProject(project);
                    }
                  }}
                  className="relative aspect-[16/9] w-full cursor-pointer overflow-hidden rounded border border-neutral-800 bg-black"
                >
                  <img
                    src={project.previewImage}
                    alt={project.title}
                    loading="lazy"
                    className="h-full w-full object-cover grayscale transition duration-500 group-hover:scale-[1.02]"
                    style={{
                      filter: negativeStripView
                        ? "grayscale(1) invert(0.9)"
                        : "grayscale(1) contrast(1.15)",
                    }}
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between rounded bg-black/80 px-2.5 py-1 font-mono text-[11px] text-neutral-300">
                    <span>{project.filmStock}</span>
                    <span className="text-amber-400">{project.shutterSpeed}</span>
                  </div>
                </div>

                {/* Title & Summary */}
                <h3 className="mt-4 font-display text-lg font-semibold text-white group-hover:text-amber-400">
                  {project.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">
                  {project.oneLiner}
                </p>

                {/* Key Benchmark Bullets */}
                <ul className="mt-3 space-y-1 font-mono text-xs text-neutral-300">
                  {project.impactMetrics.slice(0, 2).map((metric, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-amber-500" />
                      <span>{metric}</span>
                    </li>
                  ))}
                </ul>

                {/* Stack Pills */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded border border-neutral-800 bg-neutral-900/90 px-2 py-0.5 font-mono text-[11px] text-neutral-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 flex items-center justify-between border-t border-neutral-800/80 pt-3 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playShutter();
                    setActiveProject(project);
                  }}
                  className="inline-flex items-center gap-1 font-medium text-white hover:text-amber-400"
                >
                  <span>Read Case Study</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-center gap-3 text-neutral-400">
                  <a
                    href={project.repoLink}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${project.title} source code`}
                    className="hover:text-white"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${project.title} link`}
                    className="hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Clean Engineering Capabilities Table */}
        <div className="mt-20 border-t border-neutral-900 pt-16">
          <div className="mb-8">
            <p className="font-mono text-xs text-amber-500">03 / Technical Stack</p>
            <h3 className="mt-1 font-display text-2xl font-semibold text-white">
              Core Engineering & Deep Learning Capabilities
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {PORTFOLIO_CONTENT.skills.map((group) => (
              <div
                key={group.category}
                className="rounded-md border border-neutral-800 bg-[#0E0E0E] p-5"
              >
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5 font-mono text-xs">
                  <span className="font-semibold text-white">{group.category}</span>
                  <span className="text-amber-500">{group.chemicalCode}</span>
                </div>

                <div className="mt-4 space-y-4">
                  {group.items.map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between font-mono text-xs text-neutral-200">
                        <span>{item.name}</span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-neutral-400">
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-6"
            onClick={() => setActiveProject(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-study-title"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-md border border-neutral-700 bg-[#0E0E0E] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4 font-mono text-xs text-neutral-400">
                <span>
                  Case Study · {activeProject.role} ({activeProject.buildTime})
                </span>
                <button
                  type="button"
                  onClick={() => setActiveProject(null)}
                  aria-label="Close modal"
                  className="rounded border border-neutral-800 p-1 text-neutral-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3
                    id="case-study-title"
                    className="font-display text-2xl font-semibold text-white"
                  >
                    {activeProject.title}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-300">
                    {activeProject.oneLiner}
                  </p>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <a
                    href={activeProject.repoLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded bg-white px-3.5 py-2 font-medium text-black hover:bg-neutral-200"
                  >
                    <Github className="h-3.5 w-3.5" />
                    <span>Repository</span>
                  </a>
                </div>
              </div>

              <div className="mt-6">
                <InteractiveCaseStudyPreview project={activeProject} />
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded border border-neutral-800 bg-black/50 p-4">
                  <span className="font-mono text-xs font-semibold text-neutral-300">
                    Problem
                  </span>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                    {activeProject.problem}
                  </p>
                </div>

                <div className="rounded border border-neutral-800 bg-black/50 p-4">
                  <span className="font-mono text-xs font-semibold text-amber-400">
                    Engineering Solution
                  </span>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-300">
                    {activeProject.solution}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-neutral-800 pt-5 md:grid-cols-2">
                <div>
                  <h4 className="font-mono text-xs font-semibold text-white">
                    Benchmarks & Outcomes
                  </h4>
                  <ul className="mt-2.5 space-y-2 font-mono text-xs text-neutral-300">
                    {activeProject.impactMetrics.map((metric, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span>{metric}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-mono text-xs font-semibold text-white">
                    Architecture Stack
                  </h4>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {activeProject.stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded border border-neutral-800 bg-black px-2.5 py-1 font-mono text-xs text-neutral-300"
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
