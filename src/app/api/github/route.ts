import { NextResponse } from "next/server";

export interface GitHubActivityItem {
  id: string;
  type: string;
  repo: string;
  message: string;
  branch: string;
  timestamp: string;
  url: string;
}

const FALLBACK_ACTIVITY: GitHubActivityItem[] = [
  {
    id: "gh-101",
    type: "PushEvent",
    repo: "juliusjoshua40-collab/darkroom-portfolio",
    message:
      "refactor: redesign UI for authentic developer craft and add live SIREN MLP trainer + UMAP embedding explorer",
    branch: "main",
    timestamp: "Today",
    url: "https://github.com/juliusjoshua40-collab/darkroom-portfolio",
  },
  {
    id: "gh-102",
    type: "PushEvent",
    repo: "juliusjoshua40-collab/darkroom-portfolio",
    message:
      "feat: add interactive Deep Learning & Computer Vision Lab (ViT, Conv2D, Latent Diffusion)",
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

export async function GET() {
  const rawUser = process.env.GITHUB_USERNAME;
  const username =
    !rawUser || rawUser === "your-github-username"
      ? "juliusjoshua40-collab"
      : rawUser;
  const token = process.env.GITHUB_TOKEN;

  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "JuliusJoshua-Portfolio",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(
      `https://api.github.com/users/${username}/events/public?per_page=8`,
      {
        headers,
        next: { revalidate: 180 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({
        source: "fallback",
        items: FALLBACK_ACTIVITY,
      });
    }

    const raw = await res.json();
    if (!Array.isArray(raw) || raw.length === 0) {
      return NextResponse.json({
        source: "fallback",
        items: FALLBACK_ACTIVITY,
      });
    }

    const items: GitHubActivityItem[] = raw.slice(0, 5).map((ev: any, idx: number) => ({
      id: String(ev.id || idx),
      type: ev.type || "PushEvent",
      repo: ev.repo?.name || `${username}/darkroom-portfolio`,
      message:
        ev.payload?.commits?.[0]?.message ||
        ev.payload?.pull_request?.title ||
        `Activity (${ev.type || "Update"}) on ${ev.repo?.name || "repository"}`,
      branch: (ev.payload?.ref || "refs/heads/main").replace("refs/heads/", ""),
      timestamp: new Date(ev.created_at || Date.now()).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      url: `https://github.com/${ev.repo?.name || username}`,
    }));

    return NextResponse.json({
      source: "github-live",
      items,
    });
  } catch {
    return NextResponse.json({
      source: "fallback",
      items: FALLBACK_ACTIVITY,
    });
  }
}
