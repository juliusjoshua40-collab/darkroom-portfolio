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
      id: "latent-halide",
      frameNumber: "01",
      title: "LatentHalide — Client-Side Neural Film Restoration",
      oneLiner:
        "Quantized U-Net & Vision Transformer running in the browser via ONNX Runtime WebGPU for real-time film grain synthesis and dust removal.",
      link: "https://github.com/juliusjoshua40-collab/darkroom-portfolio",
      repoLink: "https://github.com/juliusjoshua40-collab/darkroom-portfolio",
      role: "ML & Graphics Engineer",
      buildTime: "2026",
      isoRating: "FP16 / INT8",
      aperture: "14ms / frame",
      shutterSpeed: "31.4 dB PSNR",
      filmStock: "PyTorch → ONNX",
      stack: ["PyTorch", "ONNX Runtime Web", "WebGPU", "ViT-B/16", "TypeScript"],
      problem:
        "Standard bilateral or median filters strip high-frequency silver-halide grain structure when cleaning scanned analog negatives, while cloud GPU inference adds network latency and cost.",
      solution:
        "Trained a lightweight U-Net with cross-attention on paired 120mm drum scans using perceptual LPIPS + L1 loss, then exported and quantized the graph to INT8/FP16 for zero-server execution in WebGPU.",
      impactMetrics: [
        "31.4 dB PSNR on held-out analog restoration test set",
        "14.2ms average inference latency on integrated laptop GPUs",
        "Zero backend GPU cost — runs entirely client-side",
      ],
      previewImage:
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80",
      demoType: "neural-diffusion",
    },
    {
      id: "siren-inr",
      frameNumber: "02",
      title: "MicroSIREN — Implicit Neural Representations in TypeScript",
      oneLiner:
        "Zero-dependency sinusoidal neural field (f_θ(x,y) → RGB) with manual backpropagation and Adam optimizer running at 60fps on HTML5 Canvas.",
      link: "#neural-darkroom",
      repoLink: "https://github.com/juliusjoshua40-collab/darkroom-portfolio",
      role: "Author",
      buildTime: "2026",
      isoRating: "ω₀ = 30.0",
      aperture: "Adam lr=1e-2",
      shutterSpeed: "60 FPS",
      filmStock: "Coordinate MLP",
      stack: ["TypeScript", "Linear Algebra", "Backpropagation", "TypedArrays", "Canvas 2D"],
      problem:
        "Standard ReLU coordinate networks suffer from spectral bias, failing to learn high-frequency spatial derivatives in images and signed distance fields.",
      solution:
        "Implemented periodic sinusoidal activations sin(ω₀ · Wx + b) with principled weight initialization and an in-browser Adam optimizer using flat Float32Array memory buffers.",
      impactMetrics: [
        "Converges on 2D high-contrast targets in < 250 steps",
        "Zero GC allocations during forward/backward pass via pre-allocated Float32Arrays",
        "Interactive live trainer embedded directly on this page",
      ],
      previewImage:
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
      demoType: "shader-optics",
    },
    {
      id: "clip-index",
      frameNumber: "03",
      title: "Safelight — Multi-Modal CLIP Archive & Vector Search",
      oneLiner:
        "Semantic search engine for unlabelled photography archives using contrastive vision-language embeddings and pgvector.",
      link: "https://github.com/juliusjoshua40-collab/darkroom-portfolio",
      repoLink: "https://github.com/juliusjoshua40-collab/darkroom-portfolio",
      role: "Full-Stack & ML Engineer",
      buildTime: "2026",
      isoRating: "512-d Cosine",
      aperture: "HNSW Index",
      shutterSpeed: "18ms query",
      filmStock: "CLIP ViT-B/32",
      stack: ["Next.js", "TypeScript", "CLIP", "PostgreSQL", "pgvector"],
      problem:
        "Film scans and raw engineering diagrams rarely contain descriptive metadata, making natural-language retrieval ('high contrast concrete shadow') impossible with keyword search.",
      solution:
        "Built an ingestion pipeline that computes normalized 512-dimensional CLIP embeddings for every image and indexes them with HNSW in PostgreSQL (`pgvector`) for sub-20ms cosine similarity queries.",
      impactMetrics: [
        "18ms p95 query latency across 25,000 indexed frames",
        "89.4% Recall@5 on zero-shot compositional queries",
        "Includes 2D UMAP projection explorer for visual cluster inspection",
      ],
      previewImage:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
      demoType: "raw-pipeline",
    },
    {
      id: "obscura-canvas",
      frameNumber: "04",
      title: "Obscura — Spatial-Hash WebGL Light Table",
      oneLiner:
        "Collaborative infinite canvas capable of rendering 1,000+ high-resolution film plates at 60fps with CRDT state synchronization.",
      link: "https://github.com/juliusjoshua40-collab/darkroom-portfolio",
      repoLink: "https://github.com/juliusjoshua40-collab/darkroom-portfolio",
      role: "Frontend Systems Engineer",
      buildTime: "2025",
      isoRating: "60 FPS",
      aperture: "Yjs CRDT",
      shutterSpeed: "12ms sync",
      filmStock: "WebGL2 Instanced",
      stack: ["TypeScript", "WebGL2", "Three.js", "Yjs", "WebSockets"],
      problem:
        "DOM-based moodboards degrade severely beyond ~150 high-res images due to layout thrashing and GPU texture memory exhaustion.",
      solution:
        "Replaced DOM nodes with a single instanced WebGL2 draw call backed by a 2D spatial hash grid for frustum culling and progressive MIP-mapped texture streaming.",
      impactMetrics: [
        "Renders 1,000+ plates at a locked 60fps pan/zoom",
        "Reduces browser heap memory by 68% compared to DOM elements",
        "Real-time multi-cursor presence via Yjs WebSockets",
      ],
      previewImage:
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80",
      demoType: "distributed-canvas",
    },
  ] as ProjectItem[],

  skills: [
    {
      category: "Deep Learning & Computer Vision",
      chemicalCode: "ML / Vision",
      purity: "Core",
      items: [
        {
          name: "PyTorch, TorchVision & Custom Autograd Kernels",
          level: 92,
          note: "CNNs, Vision Transformers (ViT), U-Net, perceptual & contrastive losses",
        },
        {
          name: "Implicit Neural Representations (SIREN / NeRF) & Diffusion",
          level: 89,
          note: "Coordinate MLPs, score-based denoising, LoRA fine-tuning",
        },
        {
          name: "Browser & Edge Inference (ONNX Runtime Web, WebGPU, TF.js)",
          level: 94,
          note: "Post-training quantization (INT8/FP16), client-side tensor execution",
        },
        {
          name: "Vector Embeddings (CLIP) & Semantic Retrieval",
          level: 91,
          note: "Cosine similarity search, HNSW indexing, UMAP/PCA dimensionality reduction",
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
          note: "Server components, streaming, zero-allocation typed array pipelines",
        },
        {
          name: "WebGL2, Three.js, React Three Fiber & GLSL",
          level: 93,
          note: "Custom vertex/fragment shaders, instanced rendering, post-processing",
        },
        {
          name: "Performance Profiling & Browser Internals",
          level: 94,
          note: "Frame-budget optimization, WebWorkers, OffscreenCanvas",
        },
        {
          name: "Design Systems, Tailwind CSS & Motion Choreography",
          level: 95,
          note: "Accessible keyboard-first interfaces, GSAP, Framer Motion",
        },
      ],
    },
    {
      category: "Backend Systems & Infrastructure",
      chemicalCode: "Systems",
      purity: "Core",
      items: [
        {
          name: "Python (FastAPI, NumPy, SciPy) & Node.js",
          level: 93,
          note: "Model serving endpoints, async workers, streaming responses",
        },
        {
          name: "PostgreSQL, pgvector & Redis",
          level: 90,
          note: "Relational schema design, vector similarity indices, caching",
        },
        {
          name: "Git, Docker, CI/CD & Vercel Edge Deployment",
          level: 92,
          note: "Reproducible builds, automated testing, telemetry",
        },
        {
          name: "Analog Medium-Format & 35mm Photography",
          level: 95,
          note: "Optical physics, silver-gelatin darkroom printing, drum scanning",
        },
      ],
    },
  ] as SkillGroup[],

  currentlyLearning: [
    {
      topic: "WebGPU Compute Shaders (WGSL) for Matrix Multiplication",
      status: "Active Research",
      detail:
        "Writing tiled shared-memory SGEMM and FlashAttention kernels in WGSL to benchmark browser-native transformer inference against WASM SIMD.",
      updatedAt: "Oct 2026",
    },
    {
      topic: "2-Step Latent Consistency Models (LCM)",
      status: "Training",
      detail:
        "Distilling 50-step diffusion trajectories into 2-step consistency evaluations for interactive real-time image generation.",
      updatedAt: "Oct 2026",
    },
    {
      topic: "Sub-Linear HNSW Vector Pruning",
      status: "Benchmarking",
      detail:
        "Testing scalar quantization (SQ8) on 512-dim CLIP image embeddings to fit 100k vectors in browser IndexedDB.",
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
      description: "Clicked the top-left monogram 5 times.",
      hint: "Click the top-left monogram 5 times.",
    },
    {
      id: "terminal-operator",
      code: "03",
      title: "CLI Operator",
      description: "Executed a command in the developer terminal.",
      hint: "Open the terminal (Ctrl+K) and run a command.",
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
      description: "Inspected the raw shader & TypeScript source overlay.",
      hint: "Toggle the 'Source' view in the header.",
    },
    {
      id: "darkroom-alchemist",
      code: "06",
      title: "Full Scroll",
      description: "Read all the way down to the footer colophon.",
      hint: "Scroll to the bottom footer.",
    },
  ] as SecretAchievement[],
};
