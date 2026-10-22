"use client";

import React, { useEffect, useState } from "react";
import { GitBranch, GitCommit, RefreshCw } from "lucide-react";
import { PORTFOLIO_CONTENT } from "@/config/content";
import { soundEngine } from "@/utils/sound";
import type { GitHubActivityItem } from "@/app/api/github/route";

export function LiveWidgets() {
  const [activity, setActivity] = useState<GitHubActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/github");
      const data = await res.json();
      setActivity(data.items || []);
    } catch {
      // ignore
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
                      <span className="font-medium text-white">{item.repo}</span>
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
