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

const MOCK_ACTIVITY: GitHubActivityItem[] = [
  {
    id: "gh-101",
    type: "PushEvent",
    repo: "halide-webgl-lab",
    message: "feat(shaders): add Voronoi silver-halide grain clustering pass in GLSL",
    branch: "main",
    timestamp: "3h ago",
    url: "https://github.com",
  },
  {
    id: "gh-102",
    type: "PullRequestEvent",
    repo: "chronograph-dsp",
    message: "perf(worklet): zero-allocation ring buffer for 250k Lissajous vertices",
    branch: "feat/wasm-fft",
    timestamp: "1d ago",
    url: "https://github.com",
  },
  {
    id: "gh-103",
    type: "PushEvent",
    repo: "obscura-crdt",
    message: "fix(canvas): spatial-hash culling for 1,000+ high-res film plates",
    branch: "main",
    timestamp: "2d ago",
    url: "https://github.com",
  },
  {
    id: "gh-104",
    type: "ReleaseEvent",
    repo: "caustic-sdf-studio",
    message: "release: v2.4.0 — Beer-Lambert chromatic dispersion node compiler",
    branch: "tag/v2.4.0",
    timestamp: "4d ago",
    url: "https://github.com",
  },
];

export async function GET() {
  const username = process.env.GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;

  if (!username || username === "your-github-username") {
    return NextResponse.json({
      source: "mock-darkroom-telemetry",
      items: MOCK_ACTIVITY,
    });
  }

  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`https://api.github.com/users/${username}/events/public?per_page=5`, {
      headers,
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json({
        source: "mock-fallback",
        items: MOCK_ACTIVITY,
      });
    }

    const raw = await res.json();
    if (!Array.isArray(raw) || raw.length === 0) {
      return NextResponse.json({
        source: "mock-fallback",
        items: MOCK_ACTIVITY,
      });
    }

    const items: GitHubActivityItem[] = raw.slice(0, 4).map((ev: any, idx: number) => ({
      id: String(ev.id || idx),
      type: ev.type || "PushEvent",
      repo: ev.repo?.name || `${username}/darkroom-repo`,
      message:
        ev.payload?.commits?.[0]?.message ||
        ev.payload?.pull_request?.title ||
        `Updated ${ev.repo?.name || "repository"}`,
      branch: (ev.payload?.ref || "refs/heads/main").replace("refs/heads/", ""),
      timestamp: new Date(ev.created_at || Date.now()).toLocaleDateString(),
      url: `https://github.com/${ev.repo?.name || username}`,
    }));

    return NextResponse.json({
      source: "github-live",
      items,
    });
  } catch {
    return NextResponse.json({
      source: "mock-fallback",
      items: MOCK_ACTIVITY,
    });
  }
}
