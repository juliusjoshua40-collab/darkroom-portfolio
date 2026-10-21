/**
 * CENTRAL PORTFOLIO CONFIGURATION — "THE DARKROOM"
 * Edit this single file (along with /public/photos/photos.json) to customize
 * your name, bio, tagline, projects, skills, contact links, and darkroom secrets.
 */

export interface ProjectItem {
  id: string;
  frameNumber: string;
  title: string;
  oneLiner: string;
  link: string;
  repoLink: string;
  role: string;
  buildTime: string;
  isoRating: string;
  aperture: string;
  shutterSpeed: string;
  filmStock: string;
  stack: string[];
  problem: string;
  solution: string;
  impactMetrics: string[];
  previewImage: string;
  demoType: "shader-optics" | "audio-synth" | "raymarch-engine" | "distributed-canvas" | "raw-pipeline";
}

export interface SkillGroup {
  category: string;
  chemicalCode: string;
  purity: string;
  items: { name: string; level: number; note: string }[];
}

export interface SecretAchievement {
  id: string;
  code: string;
  title: string;
  description: string;
  hint: string;
}

export const PORTFOLIO_CONTENT = {
  name: "[YOUR NAME]",
  monogram: "DR//01",
  role: "Programmer with a passion for creativity and abstract photography",
  tagline: "Developing software like silver gelatin prints — engineered in the dark, brought to light through code and optics.",
  location: "LAT 37.7749° N // LON 122.4194° W",
  availability: "AVAILABLE FOR SELECT CREATIVE ENGINEERING & FRONTEND ARCHITECTURE ROLES",
  bioParagraphs: [
    "I operate at the intersection of deterministic systems engineering and experimental analog optics. By day, I architect resilient full-stack and WebGL interfaces; by night, I push medium-format silver halide film in an amber-lit darkroom.",
    "Both crafts share the same obsession: controlling how raw signal turns into perceptible form. Whether writing custom GLSL fragment shaders, tuning sub-millisecond state pipelines, or agitating Ilford HP5 in Microphen developer, every frame is deliberate."
  ],

  contact: {
    email: "hello@yourdomain.dev",
    github: "https://github.com/yourusername",
    linkedin: "https://linkedin.com/in/yourusername",
    resumeUrl: "#simple-resume",
  },

  projects: [
    {
      id: "PROJ-01",
      frameNumber: "01A",
      title: "HALIDE // WebGL RAW Film Lab",
      oneLiner: "Real-time GPU spectral film emulation and chemical grain synthesizer running at 120fps in the browser.",
      link: "https://halide-lab.example.com",
      repoLink: "https://github.com/yourusername/halide-webgl-lab",
      role: "Lead Creative Technologist",
      buildTime: "6 Weeks",
      isoRating: "ISO 1600",
      aperture: "f/1.4",
      shutterSpeed: "1/1000s",
      filmStock: "KODAK TRI-X 400",
      stack: ["TypeScript", "WebGL2", "GLSL", "React Three Fiber", "WebAssembly", "Tailwind CSS"],
      problem: "Browser-based image editors apply flat LUT overlays that fail to model true silver halide crystal clustering, halation scatter, or D-log characteristic curves.",
      solution: "Engineered a multi-pass ping-pong framebuffer pipeline in GLSL that simulates photon exposure, red-layer halation bounce, and Voronoi-seeded silver grain clumping in real time.",
      impactMetrics: [
        "0.8ms frame time on 4K viewports via half-float textures",
        "Featured on WebGL Showcase & 4.2k GitHub Stars",
        "Zero external image processing dependencies"
      ],
      previewImage: "/photos/photo-01.svg",
      demoType: "shader-optics",
    },
    {
      id: "PROJ-02",
      frameNumber: "02B",
      title: "CHRONOGRAPH // Generative Audio-Visual Loom",
      oneLiner: "Polyphonic modular synth & oscilloscope vector engine synchronizing WebAudio DSP with GPU particles.",
      link: "https://chronograph-synth.example.com",
      repoLink: "https://github.com/yourusername/chronograph-dsp",
      role: "Sole Creator & DSP Engineer",
      buildTime: "8 Weeks",
      isoRating: "ISO 800",
      aperture: "f/2.0",
      shutterSpeed: "1/60s",
      filmStock: "CINESTILL 800T",
      stack: ["Next.js", "AudioWorklet", "Three.js", "Custom GLSL", "Framer Motion", "Rust/WASM"],
      problem: "Main-thread JavaScript audio analysis introduces jitter and dropped frames when driving high-density 3D particle topologies.",
      solution: "Moved the FFT spectral solver and oscillator bank into a lock-free Rust AudioWorklet ring buffer, streaming frequency uniforms directly to a custom vertex displacement shader.",
      impactMetrics: [
        "< 2.4ms audio-to-photon latency",
        "Supports 250,000 simultaneous Lissajous vertices",
        "Used live in 3 underground audiovisual installations"
      ],
      previewImage: "/photos/photo-04.svg",
      demoType: "audio-synth",
    },
    {
      id: "PROJ-03",
      frameNumber: "03A",
      title: "OBSCURA // Zero-Latency Distributed Canvas",
      oneLiner: "CRDT-powered collaborative light-table for photographers and creative directors to sequence contact sheets live.",
      link: "https://obscura-table.example.com",
      repoLink: "https://github.com/yourusername/obscura-crdt",
      role: "Principal Frontend Architect",
      buildTime: "10 Weeks",
      isoRating: "ISO 400",
      aperture: "f/2.8",
      shutterSpeed: "1/250s",
      filmStock: "ILFORD HP5+",
      stack: ["Next.js App Router", "TypeScript", "Yjs CRDT", "WebSockets", "Canvas 2D / WebGL", "GSAP"],
      problem: "Remote editorial teams struggled with sluggish DOM-heavy moodboards that choked once more than 150 high-res negatives were placed on screen.",
      solution: "Built a custom spatial-hash viewport culled canvas with MIP-mapped texture streaming and sub-15ms peer-to-peer grease-pencil annotations.",
      impactMetrics: [
        "1,000+ high-res plates pan & zoom at locked 60fps",
        "99.98% state convergence across 40 concurrent editors",
        "Reduced memory footprint by 68% vs DOM nodes"
      ],
      previewImage: "/photos/photo-02.svg",
      demoType: "distributed-canvas",
    },
    {
      id: "PROJ-04",
      frameNumber: "04C",
      title: "CAUSTIC // Signed-Distance Raymarching Studio",
      oneLiner: "Node-based procedural 3D boolean modeling and refractive glass rendering directly in a single fragment shader.",
      link: "https://caustic-sdf.example.com",
      repoLink: "https://github.com/yourusername/caustic-sdf-studio",
      role: "Graphics Programmer",
      buildTime: "5 Weeks",
      isoRating: "ISO 100",
      aperture: "f/5.6",
      shutterSpeed: "1/125s",
      filmStock: "ROLLEI ORTHO 25",
      stack: ["TypeScript", "GLSL", "React Three Fiber", "Zustand", "Tailwind CSS"],
      problem: "Traditional polygon meshes struggle with smooth organic boolean blends and dispersion caustics without expensive offline path-tracing.",
      solution: "Designed a live AST-to-GLSL compiler that converts visual node graphs into analytic Signed Distance Fields with chromatic dispersion and Beer-Lambert absorption.",
      impactMetrics: [
        "Compiles node changes to GPU shader in < 4ms",
        "Exports standalone 4KB embeddable shader bundles",
        "120+ community-created optical presets"
      ],
      previewImage: "/photos/photo-03.svg",
      demoType: "raymarch-engine",
    },
    {
      id: "PROJ-05",
      frameNumber: "05D",
      title: "SAFELIGHT // AI EXIF & Archival Indexer",
      oneLiner: "Semantic visual search and automated darkroom print recipe logger for analog film archives.",
      link: "https://safelight-archive.example.com",
      repoLink: "https://github.com/yourusername/safelight-indexer",
      role: "Full-Stack Engineer",
      buildTime: "4 Weeks",
      isoRating: "ISO 3200",
      aperture: "f/4.0",
      shutterSpeed: "1/500s",
      filmStock: "ILFORD DELTA 3200",
      stack: ["Next.js", "TypeScript", "Vector Embeddings", "PostgreSQL / pgvector", "Server Actions"],
      problem: "Analog photographers accumulate thousands of scanned negatives with zero EXIF metadata, making tonal or compositional search impossible.",
      solution: "Combined vision embeddings with a structured darkroom recipe log (developer dilution, agitation cadence, enlarger height) for instant natural-language retrieval.",
      impactMetrics: [
        "Indexes 500 scans in under 18 seconds",
        "Sub-40ms vector similarity search across 25k frames",
        "Open-source CLI + web companion"
      ],
      previewImage: "/photos/photo-05.svg",
      demoType: "raw-pipeline",
    }
  ] as ProjectItem[],

  skills: [
    {
      category: "DEVELOPER BATH // CREATIVE FRONTEND & GRAPHICS",
      chemicalCode: "D-76 // AGITATION: CONTINUOUS",
      purity: "99.4%",
      items: [
        { name: "TypeScript / JavaScript (ES2025)", level: 98, note: "Type-safe architecture, compilers, state machines" },
        { name: "Next.js (App Router) & React 18", level: 96, note: "SSR, streaming, RSC, custom hooks, performance tuning" },
        { name: "WebGL / Three.js / React Three Fiber", level: 94, note: "Custom GLSL shaders, post-processing, FBO pipelines" },
        { name: "GSAP (ScrollTrigger) & Lenis / Framer Motion", level: 95, note: "Physics-based choreography, FLIP, timeline orchestration" },
      ]
    },
    {
      category: "STOP BATH // SYSTEMS, BACKEND & AI",
      chemicalCode: "SB-1 // ACIDIC HALT",
      purity: "98.8%",
      items: [
        { name: "Node.js / Edge Route Handlers / REST & WebSockets", level: 92, note: "Low-latency streaming, CRDT sync, rate-limited APIs" },
        { name: "LLM Orchestration & Vector Search", level: 90, note: "Tool calling, RAG pipelines, semantic image indexing" },
        { name: "Rust / WebAssembly & WebAudio DSP", level: 84, note: "Off-main-thread compute, ring buffers, pixel kernels" },
        { name: "PostgreSQL / Redis / Vercel Edge Infrastructure", level: 89, note: "Zero-downtime deploys, caching, observability" },
      ]
    },
    {
      category: "FIXER // OPTICS, DESIGN & ANALOG CRAFT",
      chemicalCode: "FX-4 // ARCHIVAL PERMANENCE",
      purity: "100%",
      items: [
        { name: "Medium Format & 35mm Silver Gelatin Printing", level: 95, note: "Push processing, split-grade printing, chemigrams" },
        { name: "Design Systems & Accessibility (WCAG AAA)", level: 94, note: "Keyboard choreography, ARIA, reduced-motion fallbacks" },
        { name: "Shader Art & Procedural Generative Systems", level: 93, note: "Signed distance fields, flow fields, reaction-diffusion" },
        { name: "Technical Direction & Performance Auditing", level: 92, note: "Core Web Vitals, 60/120fps frame-budget profiling" },
      ]
    }
  ] as SkillGroup[],

  currentlyLearning: [
    {
      topic: "WebGPU Compute Shaders (WGSL)",
      status: "IN DEVELOPER BATH — 78%",
      detail: "Porting multi-pass silver halide reaction-diffusion simulations from WebGL2 fragment ping-pong buffers to native WebGPU compute workgroups.",
      updatedAt: "2h ago"
    },
    {
      topic: "Sabattier Solarization & Mordancage Printmaking",
      status: "DARKROOM TRIALS — 65%",
      detail: "Testing copper-bleach emulsion lifting on warmtone fiber paper and modeling its physical edge curling in vertex shaders.",
      updatedAt: "1d ago"
    },
    {
      topic: "Local Small-Model Vision Embeddings in WASM",
      status: "FIXING STAGE — 85%",
      detail: "Running quantized CLIP vision encoders directly in a WebWorker for zero-server negative clustering.",
      updatedAt: "3d ago"
    }
  ],

  secrets: [
    {
      id: "konami",
      code: "SEC-01",
      title: "CHEMIGRAM OVERRIDE (Konami Code)",
      description: "Entered ↑ ↑ ↓ ↓ ← → ← → B A in the darkroom.",
      hint: "Try the classic arcade sequence on your keyboard."
    },
    {
      id: "logo-clicks",
      code: "SEC-02",
      title: "SAFELIGHT OVERLOAD (5x Monogram Click)",
      description: "Clicked the top-left darkroom monogram 5 times to pulse the amber bulb.",
      hint: "Tap the top-left brand emblem 5 times."
    },
    {
      id: "terminal-operator",
      code: "SEC-03",
      title: "SHELL OPERATOR (Terminal Command)",
      description: "Executed a command inside the Darkroom CLI terminal.",
      hint: "Open the Terminal and run any command."
    },
    {
      id: "sudo-hire",
      code: "SEC-04",
      title: "ROOT CLEARANCE (sudo hire-me)",
      description: "Found and executed the classified 'sudo hire-me' directive.",
      hint: "Try elevating privileges in the Terminal with sudo hire-me."
    },
    {
      id: "source-inspector",
      code: "SEC-05",
      title: "NEGATIVE INSPECTOR (Source View)",
      description: "Flipped the portfolio into raw syntax-highlighted source inspection mode.",
      hint: "Toggle the 'Source' button in the top navigation bar."
    },
    {
      id: "darkroom-alchemist",
      code: "SEC-06",
      title: "FIXER COMPLETE (Reached Colophon Footer)",
      description: "Developed the entire roll of film all the way to the bottom colophon.",
      hint: "Scroll all the way to the bottom darkroom footer."
    }
  ] as SecretAchievement[],
};
