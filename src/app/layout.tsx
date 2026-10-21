import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { PORTFOLIO_CONTENT } from "@/config/content";
import { DarkroomProvider } from "@/context/DarkroomContext";
import { SmoothScroll } from "@/components/SmoothScroll";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${PORTFOLIO_CONTENT.name} // THE DARKROOM — Creative Engineering & Abstract Photography`,
  description: PORTFOLIO_CONTENT.tagline,
  keywords: [
    "Creative Frontend Engineer",
    "WebGL Portfolio",
    "GLSL Shaders",
    "Abstract Photography",
    "Next.js TypeScript Portfolio",
    "Darkroom Concept",
  ],
  openGraph: {
    title: `${PORTFOLIO_CONTENT.name} — THE DARKROOM`,
    description: PORTFOLIO_CONTENT.tagline,
    type: "website",
    images: ["/photos/hero-negative.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${PORTFOLIO_CONTENT.name} — THE DARKROOM`,
    description: PORTFOLIO_CONTENT.tagline,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${spaceGrotesk.variable} dark`}
      suppressHydrationWarning
    >
      <body className="bg-darkroom-bg font-mono text-darkroom-silver antialiased selection:bg-darkroom-amber/30 selection:text-white">
        <DarkroomProvider>
          <SmoothScroll>
            <div className="film-grain-overlay" aria-hidden="true" />
            {children}
          </SmoothScroll>
        </DarkroomProvider>
      </body>
    </html>
  );
}
