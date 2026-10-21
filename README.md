# THE DARKROOM — Creative Engineering & Abstract Photography Portfolio

An original, darkroom-inspired portfolio website where **abstract photography is the hero** and **code projects are presented as 35mm film negatives and contact sheets**.

Built with **Next.js (App Router) + TypeScript**, **Tailwind CSS**, **React Three Fiber + Custom GLSL Shaders**, **GSAP (ScrollTrigger) + Lenis**, **Framer Motion**, and **Howler.js**.

---

## Quick Start

```bash
cd darkroom-portfolio
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How to Customize All Content from One Config File

Everything on the site is driven by **two files**:

1. **`src/config/content.ts`** — Edit your:
   - `name`, `monogram`, `role`, `tagline`, `location`, `availability`, and `bioParagraphs`
   - `contact` (`email`, `github`, `linkedin`, `resumeUrl`)
   - `projects` (3–5+ contact-sheet frames with `frameNumber`, `title`, `oneLiner`, `link`, `repoLink`, `role`, `buildTime`, `isoRating`, `aperture`, `shutterSpeed`, `filmStock`, `stack`, `problem`, `solution`, and `impactMetrics`)
   - `skills` (categorized as Developer Bath, Stop Bath, and Archival Fixer)
   - `currentlyLearning` (live R&D cards)
   - `secrets` (6 hidden achievements saved in `localStorage`)

2. **`public/photos/photos.json`** — Add or update your photography plates:
   - Drop your WebP/AVIF/SVG/JPG photos into `public/photos/`
   - Add an entry in `public/photos/photos.json` with `id`, `frame`, `title`, `date`, `camera`, `exif` (`iso`, `aperture`, `shutter`, `developer`), `caption`, and `src`.

---

## Environment Variables (Optional)

Copy `.env.example` to `.env.local`:

```env
OPENAI_API_KEY=your_openai_key_optional
GEMINI_API_KEY=your_gemini_key_optional
GITHUB_TOKEN=your_github_token_optional
GITHUB_USERNAME=your_github_username
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

> **Zero-Key Fallback:** If no API keys are provided, `/api/chat` automatically uses the built-in context-aware Darkroom AI engine (powered by `src/config/content.ts`), and `/api/github` serves realistic darkroom repository telemetry.

---

## Core Features Checklist

1. **Develop Intro (`src/components/DevelopIntro.tsx`)**: Starts nearly pitch-black in the chemical bath and develops your name, bio, and hero negative into positive view as the visitor scrolls (with a `[QUICK DEVELOP]` override button).
2. **WebGL Shader Gallery (`src/components/WebGLGallery.tsx`)**: React Three Fiber + custom GLSL vertex/fragment shaders with hover ripple displacement, chromatic aberration RGB split, dispersion slider, plate shuffle, ECO toggle for low-power devices, and a fullscreen EXIF inspection lightbox.
3. **Projects as 35mm Contact Sheets (`src/components/ContactSheetProjects.tsx`)**: Perforated 35mm film strip cards with fake EXIF metadata (`role`, `buildTime`, `stack`, `ISO`, `aperture`), positive/negative strip toggle, and a full Case Study modal featuring an interactive live sandbox.
4. **Aperture Lens Cursor (`src/components/ApertureCursor.tsx`)**: Circular optical loupe that reveals a high-saturation sharp focal area and morphs into a rangefinder focus-lock reticle over links and buttons.
5. **Darkroom CLI Terminal (`src/components/TerminalModal.tsx`)**: Supports `help`, `about`, `projects`, `gallery`, `expose`, `develop`, `focus`, `filter [glitch|noir|vivid|default]`, `shuffle`, `contact`, `clear`, and the hidden `sudo hire-me` directive, with `↑`/`↓` command history and `Tab` autocomplete.
6. **Generative Chemigram Playground (`src/components/GenerativePlayground.tsx`)**: Mouse-driven silver-halide light-painting canvas with 3 optical formulas and one-click **Save as PNG** export with an archival film border stamp.
7. **Time-of-Day Color Grading (`src/context/DarkroomContext.tsx`)**: Automatically shifts color temperature (`2700K Dawn`, `4800K Inspection Loupe`, `2200K Sodium Vapor`, `1850K Deep Darkroom Safelight`) based on the visitor's local clock.
8. **Source Code Toggle (`src/components/SourceCodeOverlay.tsx`)**: Flips the page into a syntax-highlighted inspection view of its own GLSL shaders and TypeScript architecture.
9. **6 Hidden Achievements (`src/components/AchievementToast.tsx`)**: Konami code, 5x monogram click, terminal operator, `sudo hire-me`, source inspector, and reaching the footer colophon — persisted in `localStorage` with toast notifications and an `X/6` ledger modal.
10. **Live Telemetry Widgets (`src/components/LiveWidgets.tsx`)**: GitHub recent activity feed + "Currently Developing" R&D cards.
11. **AI "Ask Me Anything" Chat (`src/components/AIChatWidget.tsx` + `src/app/api/chat/route.ts`)**: Floating darkroom assistant backed by Next.js route handler.
12. **Howler.js Sound Design (`src/utils/sound.ts`)**: Synthesized mechanical SLR shutter click, aperture detent hover ticks, achievement chime, and 60Hz darkroom transformer hum — muted by default with a clear navbar toggle.
13. **Recruiter "Simple View" (`src/components/SimpleView.tsx`)**: One-click switch in the top bar for a fast, zero-WebGL resume & projects briefing with print/PDF support.
