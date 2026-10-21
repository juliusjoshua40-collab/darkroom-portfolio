import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        darkroom: {
          bg: "#0A0A0A",
          surface: "#121212",
          border: "#242424",
          amber: "#FF9F1C",
          amberDim: "rgba(255, 159, 28, 0.18)",
          crimson: "#D90429",
          silver: "#E5E5E5",
          muted: "#8A8A8A",
        },
      },
      fontFamily: {
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        display: ["var(--font-space-grotesk)", "sans-serif"],
      },
      backgroundImage: {
        "safelight-radial": "radial-gradient(circle at 50% 0%, rgba(255, 159, 28, 0.14), transparent 70%)",
      },
    },
  },
  plugins: [],
};
export default config;
