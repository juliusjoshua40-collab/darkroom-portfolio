/**
 * Central Portfolio Configuration
 * Clean, developer-focused content configuration for Julius Joshua.
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
  demoType:
    | "shader-optics"
    | "audio-synth"
    | "raymarch-engine"
    | "distributed-canvas"
    | "raw-pipeline"
    | "neural-diffusion";
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
  name: "Julius Joshua",
  monogram: "jj.",
  role: "Software & Deep Learning Engineer",
  tagline:
    "I build fast web systems, train computer vision models, and shoot medium-format black-and-white film.",
  location: "Lagos · Remote",
  availability: "Open to Software Engineering, ML/Vision & Creative Frontend roles",
  bioParagraphs: [
    "I focus on the overlap between machine learning systems, GPU-accelerated graphics, and clean frontend engineering. Most of my work involves taking heavy compute—whether neural network inference, real-time shaders, or collaborative state—and making it run at 60fps in the browser.",
    "Outside of writing TypeScript, Python, and GLSL, I shoot and develop analog monochrome photography. This site serves as both an index of my engineering work and a live sandbox for my in-browser deep learning and graphics experiments.",
  ],

  contact: {
    email: "juliusjoshua40@gmail.com",
    github: "https://github.com/juliusjoshua40-collab",
    linkedin: "https://linkedin.com/in/juliusjoshua",
    resumeUrl: "#simple-resume",
  },

  projects: [
    {
      id: "micro-siren",
      frameNumber: "01",
      title: "MicroSIREN — In-Browser Neural Field & Spectral Bias Benchmark",
      oneLiner:
        "Zero-dependency sinusoidal coordinate MLP (f_θ(x,y) → I) with custom backpropagation and Adam optimizer running at 60fps in TypeScript.",
      link: "#neural-darkroom",
      repoLink: "https://github.com/juliusjoshua40-collab/darkroom-portfolio",
      role: "Author & ML Engineer",
      buildTime: "2026",
      isoRating: "Adam β₁=0.9",
      aperture: "ω₀ = 12.0",
      shutterSpeed: "60 FPS",
      filmStock: "SIREN vs ReLU",
      stack: ["TypeScript", "Backpropagation", "Adam Optimizer", "Float32Array", "Canvas 2D"],
      problem:
        "Standard ReLU coordinate networks suffer from severe spectral bias, converging rapidly on low-frequency averages while failing to represent high-frequency spatial geometry.",
      solution:
        "Implemented periodic sinusoidal activations sin(ω₀ · Wx + b) with analytical chain-rule derivatives and bias-corrected Adam moments (m_t, v_t) inside pre-allocated Float32Array buffers.",
      impactMetrics: [
        "Demonstrates SIREN vs ReLU spectral bias live in the browser",
        "Zero garbage-collection pauses during 60fps gradient descent",
        "Supports interactive user drawing on the ground-truth tensor",
      ],
      previewImage:
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
      demoType: "neural-diffusion",
    },
    {
      id: "sonicflow",
      frameNumber: "02",
      title: "SonicFlow — Real-Time Audio DSP & Reactive Visualizer",
      oneLiner:
        "Low-latency browser audio processing pipeline pairing spectral FFT analysis with GPU-accelerated visual synthesis.",
      link: "https://github.com/juliusjoshua40-collab/SonicFlow",
      repoLink: "https://github.com/juliusjoshua40-collab/SonicFlow",
      role: "Lead Engineer",
      buildTime: "2026",
      isoRating: "WebAudio DSP",
      aperture: "Sub-4ms FFT",
      shutterSpeed: "60 FPS",
      filmStock: "Audio + WebGL",
      stack: ["TypeScript", "WebAudio API", "React", "Canvas / WebGL", "Tailwind CSS"],
      problem:
        "Main-thread audio spectrum extraction and DOM updates cause frame drops when rendering high-density frequency visualizations.",
      solution:
        "Decoupled the FFT frequency analyzer and smoothing envelopes from React state updates, driving canvas and shader uniforms directly inside a synchronized requestAnimationFrame loop.",
      impactMetrics: [
        "Sub-4ms audio-to-visual frame latency",
        "Smooth 60fps rendering across desktop and mobile viewports",
        "Clean modular architecture for audio source switching",
      ],
      previewImage:
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80",
      demoType: "audio-synth",
    },
    {
      id: "lagoslife",
      frameNumber: "03",
      title: "LagosLife — Interactive Urban Simulation & State Engine",
      oneLiner:
        "High-concurrency interactive web application modeling dynamic urban events, state transitions, and real-time UI feedback.",
      link: "https://github.com/juliusjoshua40-collab/lagoslife",
      repoLink: "https://github.com/juliusjoshua40-collab/lagoslife",
      role: "Full-Stack Developer",
      buildTime: "2026",
      isoRating: "Deterministic",
      aperture: "State Machine",
      shutterSpeed: "Zero-Lag UI",
      filmStock: "Full-Stack Web",
      stack: ["JavaScript / TypeScript", "React", "State Machines", "CSS Grid", "REST APIs"],
      problem:
        "Complex interactive simulations quickly become brittle when state transitions, timers, and UI renders are tightly coupled.",
      solution:
        "Architected a deterministic state reducer and event loop that cleanly separates simulation logic from presentation components.",
      impactMetrics: [
        "Predictable state transitions with zero race conditions",
        "Responsive mobile-first interface",
        "Modular event catalog for rapid content expansion",
      ],
      previewImage:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
      demoType: "distributed-canvas",
    },
    {
      id: "darkroom-webgl",
      frameNumber: "04",
      title: "The Darkroom — WebGL2 Shader Gallery & Vision Workbench",
      oneLiner:
        "This portfolio: single-context on-demand GLSL chromatic dispersion gallery, Gabor/Sobel tensor inspector, and interactive CLI.",
      link: "https://github.com/juliusjoshua40-collab/darkroom-portfolio",
      repoLink: "https://github.com/juliusjoshua40-collab/darkroom-portfolio",
      role: "Sole Creator",
      buildTime: "2026",
      isoRating: "Single Context",
      aperture: "GLSL + 2D CNN",
      shutterSpeed: "Lighthouse 95+",
      filmStock: "Next.js 14",
      stack: ["Next.js App Router", "TypeScript", "Three.js / R3F", "GLSL", "GSAP"],
      problem:
        "Most WebGL portfolios mount dozens of simultaneous Three.js contexts, exhausting GPU memory and failing on mobile or integrated graphics.",
      solution:
        "Engineered an on-demand WebGL2 context lifecycle that mounts custom GLSL shaders only on the active frame, paired with a zero-WebGL Recruiter Resume View.",
      impactMetrics: [
        "1 active WebGL context max — ~80% lower GPU memory footprint",
        "Includes live Gabor/Sobel vision kernels and semantic cosine search",
        "Instant keyboard navigation & full CLI terminal (⌘K)",
      ],
      previewImage:
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80",
      demoType: "shader-optics",
    },
  ] as ProjectItem[],

  skills: [
    {
      category: "Deep Learning & Computer Vision",
      chemicalCode: "ML / Vision",
      purity: "Core",
      items: [
        {
          name: "PyTorch, Neural Architectures (CNNs, ViTs, Coordinate MLPs)",
          level: 92,
          note: "Custom autograd, sinusoidal representation networks (SIREN), perceptual losses",
        },
        {
          name: "Spatial Filtering & Feature Extraction (Gabor, Sobel, Patch Attention)",
          level: 91,
          note: "2D convolution kernels, gradient orientation histograms, self-similarity matrices",
        },
        {
          name: "Browser & Edge Inference (ONNX Runtime Web, WebGPU, Float32Arrays)",
          level: 94,
          note: "Zero-allocation typed array math, INT8/FP16 quantization, client-side execution",
        },
        {
          name: "Vector Embeddings & Cosine Similarity Search",
          level: 90,
          note: "Contrastive representations, k-NN retrieval, 2D UMAP projections",
        },
      ],
    },
    {
      category: "Frontend Architecture & Graphics",
      chemicalCode: "UI / GPU",
      purity: "Core",
      items: [
        {
          name: "TypeScript, React 18 & Next.js (App Router)",
          level: 97,
          note: "Server components, route handlers, performance-critical state management",
        },
        {
          name: "WebGL2, Three.js, React Three Fiber & Custom GLSL",
          level: 93,
          note: "Vertex displacement, chromatic dispersion shaders, GPU lifecycle management",
        },
        {
          name: "HTML5 Canvas 2D, WebAudio DSP & Interactive Systems",
          level: 94,
          note: "Pixel-buffer manipulation, flow fields, low-latency audio visualizers",
        },
        {
          name: "Tailwind CSS, GSAP & Accessible UI Engineering",
          level: 95,
          note: "Keyboard-first workflows, reduced-motion support, clean design systems",
        },
      ],
    },
    {
      category: "Backend Systems & Workflow",
      chemicalCode: "Systems",
      purity: "Core",
      items: [
        {
          name: "Python & Node.js API Engineering",
          level: 92,
          note: "REST endpoints, LLM orchestration, GitHub & third-party integrations",
        },
        {
          name: "PostgreSQL, Vector Indexing (pgvector) & Data Modeling",
          level: 89,
          note: "Relational schemas, similarity search, caching strategies",
        },
        {
          name: "Git, CI/CD & Vercel Cloud Deployment",
          level: 93,
          note: "Automated builds, environment configuration, production telemetry",
        },
        {
          name: "Analog Medium-Format & 35mm Photography",
          level: 95,
          note: "Optical physics, monochrome tonal grading, darkroom craft",
        },
      ],
    },
  ] as SkillGroup[],

  currentlyLearning: [
    {
      topic: "Spectral Bias in Coordinate MLPs (SIREN vs ReLU + Positional Encoding)",
      status: "Live Experiment",
      detail:
        "Benchmarking convergence speed of periodic sin(ω₀x) activations against ReLU with Fourier feature mappings on 2D high-frequency targets.",
      updatedAt: "Oct 2026",
    },
    {
      topic: "WebGPU Compute Shaders (WGSL) for Client-Side Matrix Multiplication",
      status: "Active Research",
      detail:
        "Writing tiled shared-memory SGEMM kernels in WGSL to accelerate in-browser transformer attention layers.",
      updatedAt: "Oct 2026",
    },
    {
      topic: "Quantized Vision Encoders in WebWorkers",
      status: "Prototyping",
      detail:
        "Running 4-bit quantized vision backbones off the main thread for zero-jank semantic image indexing.",
      updatedAt: "Sep 2026",
    },
  ],

  secrets: [
    {
      id: "konami",
      code: "01",
      title: "Konami Sequence",
      description: "Entered ↑ ↑ ↓ ↓ ← → ← → B A on the keyboard.",
      hint: "Try the classic arcade sequence on your keyboard.",
    },
    {
      id: "logo-clicks",
      code: "02",
      title: "Overclocked Monogram",
      description: "Clicked the top-left name 5 times.",
      hint: "Click the top-left name 5 times.",
    },
    {
      id: "terminal-operator",
      code: "03",
      title: "CLI Operator",
      description: "Executed a command in the developer terminal.",
      hint: "Open the terminal (⌘K) and run a command.",
    },
    {
      id: "sudo-hire",
      code: "04",
      title: "Root Clearance (sudo hire-me)",
      description: "Executed 'sudo hire-me' in the terminal.",
      hint: "Run 'sudo hire-me' in the terminal.",
    },
    {
      id: "source-inspector",
      code: "05",
      title: "Source Inspector",
      description: "Inspected the live TypeScript & GLSL source overlay.",
      hint: "Toggle the 'Source' button in the header.",
    },
    {
      id: "darkroom-alchemist",
      code: "06",
      title: "Full Scroll",
      description: "Scrolled all the way down to the footer colophon.",
      hint: "Scroll to the bottom footer.",
    },
  ] as SecretAchievement[],
};
