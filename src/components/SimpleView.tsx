"use client";

import React from "react";
import {
  ExternalLink,
  Github,
  Mail,
  Linkedin,
  ArrowLeft,
  CheckCircle2,
  Printer,
} from "lucide-react";
import { PORTFOLIO_CONTENT } from "@/config/content";
import { useDarkroom } from "@/context/DarkroomContext";
import { soundEngine } from "@/utils/sound";

export function SimpleView() {
  const { setSimpleView } = useDarkroom();

  return (
    <div className="min-h-screen bg-[#0D0D0D] pt-24 pb-20 text-darkroom-silver">
      <div className="mx-auto max-w-4xl px-4 sm:px-8">
        {/* Top Recruiter Banner */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border border-darkroom-amber/40 bg-darkroom-amber/10 px-4 py-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-darkroom-amber">
            <span className="h-2 w-2 rounded-full bg-darkroom-amber" />
            <span>SIMPLE VIEW ACTIVE — FAST, ZERO-WEBGL RECRUITER & RESUME BRIEF</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 border border-darkroom-border bg-black/50 px-2.5 py-1 text-darkroom-silver hover:border-darkroom-amber hover:text-darkroom-amber"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playShutter();
                setSimpleView(false);
              }}
              className="inline-flex items-center gap-1.5 bg-darkroom-amber px-3 py-1 font-semibold text-black hover:bg-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Full Darkroom</span>
            </button>
          </div>
        </div>

        {/* Header Bio & Direct Contact */}
        <header className="border-b border-darkroom-border pb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-darkroom-amber">
            {PORTFOLIO_CONTENT.availability}
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold text-white sm:text-5xl">
            {PORTFOLIO_CONTENT.name}
          </h1>
          <p className="mt-2 font-mono text-base text-darkroom-amber">
            {PORTFOLIO_CONTENT.role}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-darkroom-silver/90">
            {PORTFOLIO_CONTENT.tagline}
          </p>
          <div className="mt-4 space-y-2 text-sm text-darkroom-muted">
            {PORTFOLIO_CONTENT.bioParagraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 font-mono text-xs">
            <a
              href={`mailto:${PORTFOLIO_CONTENT.contact.email}`}
              className="inline-flex items-center gap-2 border border-darkroom-amber bg-darkroom-amber px-4 py-2 font-semibold text-black hover:bg-white"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>{PORTFOLIO_CONTENT.contact.email}</span>
            </a>
            <a
              href={PORTFOLIO_CONTENT.contact.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-darkroom-border bg-darkroom-surface px-4 py-2 text-darkroom-silver hover:border-darkroom-amber hover:text-darkroom-amber"
            >
              <Github className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </a>
            <a
              href={PORTFOLIO_CONTENT.contact.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-darkroom-border bg-darkroom-surface px-4 py-2 text-darkroom-silver hover:border-darkroom-amber hover:text-darkroom-amber"
            >
              <Linkedin className="h-3.5 w-3.5" />
              <span>LinkedIn</span>
            </a>
          </div>
        </header>

        {/* Selected Engineering Projects */}
        <section className="py-10 border-b border-darkroom-border" aria-labelledby="simple-projects">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 id="simple-projects" className="font-mono text-lg font-bold uppercase tracking-wider text-white">
              01 // Selected Engineering Projects
            </h2>
            <span className="font-mono text-xs text-darkroom-muted">
              {PORTFOLIO_CONTENT.projects.length} ARCHIVAL CASE STUDIES
            </span>
          </div>

          <div className="space-y-6">
            {PORTFOLIO_CONTENT.projects.map((project) => (
              <article
                key={project.id}
                className="border border-darkroom-border bg-darkroom-surface/70 p-5 transition hover:border-darkroom-amber/50"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 font-mono text-xs text-darkroom-amber">
                      <span>[{project.frameNumber}]</span>
                      <span>·</span>
                      <span>{project.role}</span>
                      <span>·</span>
                      <span>{project.buildTime}</span>
                    </div>
                    <h3 className="mt-1 font-display text-xl font-semibold text-white">
                      {project.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 border border-darkroom-border bg-black/50 px-2.5 py-1 text-darkroom-silver hover:border-darkroom-amber hover:text-darkroom-amber"
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <a
                      href={project.repoLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 border border-darkroom-border bg-black/50 px-2.5 py-1 text-darkroom-silver hover:border-darkroom-amber hover:text-darkroom-amber"
                    >
                      <span>Source</span>
                      <Github className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <p className="mt-2 text-sm text-darkroom-silver">{project.oneLiner}</p>

                <div className="mt-4 grid grid-cols-1 gap-3 text-xs text-darkroom-muted sm:grid-cols-2">
                  <div className="border-l-2 border-darkroom-border pl-3">
                    <strong className="block font-mono text-[11px] uppercase text-darkroom-silver">
                      Problem
                    </strong>
                    {project.problem}
                  </div>
                  <div className="border-l-2 border-darkroom-amber/60 pl-3">
                    <strong className="block font-mono text-[11px] uppercase text-darkroom-amber">
                      Solution
                    </strong>
                    {project.solution}
                  </div>
                </div>

                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-darkroom-silver/90">
                  {project.impactMetrics.map((m, i) => (
                    <li key={i} className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-darkroom-amber" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="border border-darkroom-border bg-black/60 px-2 py-0.5 font-mono text-[11px] text-darkroom-amber"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Resume / Technical Skills Matrix */}
        <section id="simple-resume" className="py-10 border-b border-darkroom-border" aria-labelledby="simple-skills">
          <h2 id="simple-skills" className="mb-6 font-mono text-lg font-bold uppercase tracking-wider text-white">
            02 // Technical Capabilities & Architecture Stack
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PORTFOLIO_CONTENT.skills.map((group) => (
              <div
                key={group.category}
                className="border border-darkroom-border bg-darkroom-surface/60 p-4"
              >
                <div className="font-mono text-[11px] text-darkroom-amber">
                  {group.chemicalCode}
                </div>
                <h3 className="mt-1 font-mono text-xs font-bold uppercase text-white">
                  {group.category}
                </h3>
                <ul className="mt-4 space-y-3">
                  {group.items.map((skill) => (
                    <li key={skill.name}>
                      <div className="flex justify-between font-mono text-xs text-darkroom-silver">
                        <span>{skill.name}</span>
                        <span className="text-darkroom-amber">{skill.level}%</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-darkroom-muted">{skill.note}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Direct Contact Footer */}
        <section className="pt-10" aria-labelledby="simple-contact">
          <h2 id="simple-contact" className="font-mono text-lg font-bold uppercase tracking-wider text-white">
            03 // Direct Dispatch & Contact
          </h2>
          <p className="mt-2 text-sm text-darkroom-muted">
            Ready to collaborate on ambitious creative engineering, WebGL systems, or frontend architecture.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-xs">
            <a
              href={`mailto:${PORTFOLIO_CONTENT.contact.email}`}
              className="text-darkroom-amber underline underline-offset-4"
            >
              {PORTFOLIO_CONTENT.contact.email}
            </a>
            <span>·</span>
            <a
              href={PORTFOLIO_CONTENT.contact.github}
              target="_blank"
              rel="noreferrer"
              className="hover:text-darkroom-amber"
            >
              {PORTFOLIO_CONTENT.contact.github}
            </a>
            <span>·</span>
            <a
              href={PORTFOLIO_CONTENT.contact.linkedin}
              target="_blank"
              rel="noreferrer"
              className="hover:text-darkroom-amber"
            >
              {PORTFOLIO_CONTENT.contact.linkedin}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
