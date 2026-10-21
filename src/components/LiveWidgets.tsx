"use client";

import React, { useEffect, useState } from "react";
import { GitBranch, GitCommit, FlaskConical, RefreshCw, Radio } from "lucide-react";
import { PORTFOLIO_CONTENT } from "@/config/content";
import { soundEngine } from "@/utils/sound";
import type { GitHubActivityItem } from "@/app/api/github/route";

export function LiveWidgets() {
  const [activity, setActivity] = useState<GitHubActivityItem[]>([]);
  const [sourceLabel, setSourceLabel] = useState<string>("SYNCING...");
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/github");
      const data = await res.json();
      setActivity(data.items || []);
      setSourceLabel(
        data.source === "github-live" ? "LIVE GITHUB API" : "DARKROOM TELEMETRY FEED"
      );
    } catch {
      setSourceLabel("OFFLINE ARCHIVE");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  return (
    <section
      id="live-telemetry"
      aria-labelledby="telemetry-heading"
      className="relative border-t border-darkroom-border bg-[#080808] py-24 px-4 sm:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 flex flex-col justify-between gap-4 border-b border-darkroom-border pb-6 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-darkroom-amber">
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              <span>05 // LIVE TELEMETRY & EXPERIMENTAL LAB LOGS</span>
            </div>
            <h2
              id="telemetry-heading"
              className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl"
            >
              SIGNAL FEED & CURRENT R&D
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playShutter();
              fetchActivity();
            }}
            className="inline-flex items-center gap-2 self-start border border-darkroom-border bg-darkroom-surface px-3.5 py-1.5 font-mono text-xs text-darkroom-silver hover:border-darkroom-amber hover:text-darkroom-amber lg:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-darkroom-amber" : ""}`} />
            <span>Refresh Feed</span>
          </button>
        </div>

        {/* Two-Column Widget Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left 7 Cols: GitHub Recent-Activity Feed */}
          <div className="border border-darkroom-border bg-[#0C0C0C] p-6 lg:col-span-7">
            <div className="flex items-center justify-between border-b border-darkroom-border pb-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-darkroom-amber">
                <GitCommit className="h-4 w-4" />
                <span className="font-bold uppercase tracking-wider">
                  GITHUB RECENT ACTIVITY STREAM
                </span>
              </div>
              <span className="border border-darkroom-amber/40 bg-darkroom-amber/10 px-2 py-0.5 text-[10px] text-darkroom-amber">
                {sourceLabel}
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {activity.map((item) => (
                <div
                  key={item.id}
                  className="group border border-darkroom-border/80 bg-black/50 p-4 transition hover:border-darkroom-amber/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                    <div className="flex items-center gap-2 text-darkroom-amber">
                      <span className="font-semibold">{item.repo}</span>
                      <span className="text-darkroom-muted">//</span>
                      <span className="inline-flex items-center gap-1 text-darkroom-muted">
                        <GitBranch className="h-3 w-3" />
                        {item.branch}
                      </span>
                    </div>
                    <span className="text-darkroom-muted">{item.timestamp}</span>
                  </div>

                  <p className="mt-2 font-mono text-xs text-darkroom-silver group-hover:text-white">
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right 5 Cols: Currently Learning / R&D Card */}
          <div className="border border-darkroom-border bg-[#0C0C0C] p-6 lg:col-span-5">
            <div className="flex items-center justify-between border-b border-darkroom-border pb-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-darkroom-amber">
                <FlaskConical className="h-4 w-4" />
                <span className="font-bold uppercase tracking-wider">
                  CURRENTLY DEVELOPING // R&D BATH
                </span>
              </div>
              <span className="text-[10px] text-darkroom-muted">ACTIVE TRIALS</span>
            </div>

            <div className="mt-5 space-y-4">
              {PORTFOLIO_CONTENT.currentlyLearning.map((entry) => (
                <div
                  key={entry.topic}
                  className="border border-darkroom-border/80 bg-black/50 p-4"
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-darkroom-amber font-semibold">{entry.status}</span>
                    <span className="text-darkroom-muted">{entry.updatedAt}</span>
                  </div>
                  <h3 className="mt-1.5 font-display text-base font-bold text-white">
                    {entry.topic}
                  </h3>
                  <p className="mt-1 font-mono text-xs leading-relaxed text-darkroom-muted">
                    {entry.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
