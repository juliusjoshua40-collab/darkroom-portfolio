"use client";

import React, { useEffect, useState } from "react";
import { GitBranch, GitCommit, RefreshCw } from "lucide-react";
import { PORTFOLIO_CONTENT } from "@/config/content";
import { soundEngine } from "@/utils/sound";
import type { GitHubActivityItem } from "@/app/api/github/route";

const CLIENT_FALLBACK_ACTIVITY: GitHubActivityItem[] = [
  {
    id: "gh-101",
    type: "PushEvent",
    repo: "juliusjoshua40-collab/darkroom-portfolio",
    message:
      "fix: resolve 01A image URL, optimize single-context WebGL, connect live GitHub API, and add Adam + Gabor kernels",
    branch: "main",
    timestamp: "Today",
    url: "https://github.com/juliusjoshua40-collab/darkroom-portfolio",
  },
  {
    id: "gh-102",
    type: "PushEvent",
    repo: "juliusjoshua40-collab/darkroom-portfolio",
    message:
      "refactor: redesign UI for authentic developer craft and add live SIREN MLP trainer + UMAP embedding explorer",
    branch: "main",
    timestamp: "Today",
    url: "https://github.com/juliusjoshua40-collab/darkroom-portfolio",
  },
  {
    id: "gh-103",
    type: "PushEvent",
    repo: "juliusjoshua40-collab/SonicFlow",
    message: "feat: audio DSP pipeline and real-time reactive visualizer",
    branch: "main",
    timestamp: "Recent",
    url: "https://github.com/juliusjoshua40-collab/SonicFlow",
  },
  {
    id: "gh-104",
    type: "PushEvent",
    repo: "juliusjoshua40-collab/lagoslife",
    message: "perf: optimize interactive state and viewport rendering",
    branch: "main",
    timestamp: "Recent",
    url: "https://github.com/juliusjoshua40-collab/lagoslife",
  },
];

export function LiveWidgets() {
  const [activity, setActivity] = useState<GitHubActivityItem[]>(CLIENT_FALLBACK_ACTIVITY);
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      // Try public GitHub API directly first (works on both localhost, Vercel, and static GitHub Pages)
      const ghRes = await fetch(
        "https://api.github.com/users/juliusjoshua40-collab/events/public?per_page=6"
      );
      if (ghRes.ok) {
        const raw = await ghRes.json();
        if (Array.isArray(raw) && raw.length > 0) {
          const items: GitHubActivityItem[] = raw.slice(0, 5).map((ev: any, idx: number) => ({
            id: String(ev.id || idx),
            type: ev.type || "PushEvent",
            repo: ev.repo?.name || "juliusjoshua40-collab/darkroom-portfolio",
            message:
              ev.payload?.commits?.[0]?.message ||
              ev.payload?.pull_request?.title ||
              `Updated ${ev.repo?.name || "repository"}`,
            branch: (ev.payload?.ref || "refs/heads/main").replace("refs/heads/", ""),
            timestamp: new Date(ev.created_at || Date.now()).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            url: `https://github.com/${ev.repo?.name || "juliusjoshua40-collab"}`,
          }));
          setActivity(items);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Fall back to /api/github or static fallback
    }

    try {
      const res = await fetch("/api/github");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items) && data.items.length > 0) {
          setActivity(data.items);
        }
      }
    } catch {
      // Keep CLIENT_FALLBACK_ACTIVITY
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
      className="border-t border-neutral-900 bg-[#0A0A0A] py-24 px-4 sm:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col justify-between gap-4 border-b border-neutral-800 pb-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs text-amber-500">06 / Engineering Log</p>
            <h2
              id="telemetry-heading"
              className="mt-1 font-display text-2xl font-semibold tracking-tight text-white sm:text-4xl"
            >
              Recent Commits & Ongoing Research
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playShutter();
              fetchActivity();
            }}
            className="inline-flex items-center gap-2 self-start rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 font-mono text-xs text-neutral-300 hover:border-neutral-700 hover:text-white md:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left 7 Cols: GitHub Activity */}
          <div className="rounded-md border border-neutral-800 bg-[#0E0E0E] p-5 lg:col-span-7">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-white font-medium">
                <GitCommit className="h-4 w-4 text-amber-500" />
                <span>GitHub Activity</span>
              </div>
              <a
                href={PORTFOLIO_CONTENT.contact.github}
                target="_blank"
                rel="noreferrer"
                className="text-neutral-400 hover:text-white"
              >
                @juliusjoshua40-collab →
              </a>
            </div>

            <div className="mt-4 divide-y divide-neutral-800/70">
              {activity.map((item) => (
                <div key={item.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                    <div className="flex items-center gap-2 text-neutral-300">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-white hover:text-amber-400"
                      >
                        {item.repo}
                      </a>
                      <span className="inline-flex items-center gap-1 text-neutral-500">
                        <GitBranch className="h-3 w-3" />
                        {item.branch}
                      </span>
                    </div>
                    <span className="text-neutral-500">{item.timestamp}</span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-neutral-400">
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right 5 Cols: Research Notes */}
          <div className="rounded-md border border-neutral-800 bg-[#0E0E0E] p-5 lg:col-span-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 font-mono text-xs">
              <span className="font-medium text-white">Current Research & Benchmarks</span>
              <span className="text-neutral-500">Lab Notes</span>
            </div>

            <div className="mt-4 space-y-4">
              {PORTFOLIO_CONTENT.currentlyLearning.map((entry) => (
                <div
                  key={entry.topic}
                  className="rounded border border-neutral-800/90 bg-black/40 p-3.5"
                >
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-amber-500">{entry.status}</span>
                    <span className="text-neutral-500">{entry.updatedAt}</span>
                  </div>
                  <h3 className="mt-1 font-display text-sm font-semibold text-white">
                    {entry.topic}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-400">
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
