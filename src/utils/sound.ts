"use client";

import { Howl, Howler } from "howler";

/**
 * Generates an inline WAV Data URI from a procedural sample generator so Howler.js
 * can play authentic mechanical shutter clicks, aperture ticks, and ambient darkroom hum
 * with zero external network requests.
 */
function createWavDataUri(
  durationSec: number,
  sampleFn: (t: number, i: number, sampleRate: number) => number,
  sampleRate = 22050
): string {
  const numSamples = Math.floor(durationSec * sampleRate);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, numSamples * 2, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const raw = Math.max(-1, Math.min(1, sampleFn(t, i, sampleRate)));
    view.setInt16(44 + i * 2, raw < 0 ? raw * 0x8000 : raw * 0x7fff, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:audio/wav;base64,${typeof window !== "undefined" ? window.btoa(binary) : ""}`;
}

class DarkroomSoundEngine {
  private initialized = false;
  private enabled = false;
  private shutterHowl: Howl | null = null;
  private hoverHowl: Howl | null = null;
  private unlockHowl: Howl | null = null;
  private ambientHowl: Howl | null = null;

  private init() {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;

    // 1. Mechanical SLR shutter click (double transient + damped spring)
    const shutterUri = createWavDataUri(0.14, (t) => {
      const click1 = t < 0.018 ? (Math.random() * 2 - 1) * Math.exp(-t * 220) : 0;
      const click2 =
        t > 0.045 && t < 0.085
          ? (Math.random() * 2 - 1) * Math.exp(-(t - 0.045) * 190) * 0.75
          : 0;
      const body = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 65) * 0.35;
      return (click1 + click2 + body) * 0.65;
    });

    // 2. Subtle aperture ring detent tick on hover
    const hoverUri = createWavDataUri(0.035, (t) => {
      const tick = Math.sin(2 * Math.PI * 1450 * t) * Math.exp(-t * 260);
      const noise = (Math.random() * 2 - 1) * Math.exp(-t * 400) * 0.3;
      return (tick + noise) * 0.25;
    });

    // 3. Darkroom timer chime on secret achievement unlock
    const unlockUri = createWavDataUri(0.55, (t) => {
      const f1 = Math.sin(2 * Math.PI * 528 * t) * Math.exp(-t * 5.5);
      const f2 =
        t > 0.09 ? Math.sin(2 * Math.PI * 792 * (t - 0.09)) * Math.exp(-(t - 0.09) * 4.5) : 0;
      return (f1 + f2) * 0.3;
    });

    // 4. Low warm analog safelight / enlarger transformer hum (seamless 2s loop)
    const ambientUri = createWavDataUri(2.0, (t) => {
      const env = Math.sin(Math.PI * (t / 2.0)); // smooth loop envelope
      const hum60 = Math.sin(2 * Math.PI * 60 * t) * 0.12;
      const harmonic120 = Math.sin(2 * Math.PI * 120 * t) * 0.05;
      const warmAir = (Math.random() * 2 - 1) * 0.012;
      return (hum60 + harmonic120 + warmAir) * (0.4 + 0.6 * env);
    });

    this.shutterHowl = new Howl({ src: [shutterUri], volume: 0.45 });
    this.hoverHowl = new Howl({ src: [hoverUri], volume: 0.2 });
    this.unlockHowl = new Howl({ src: [unlockUri], volume: 0.4 });
    this.ambientHowl = new Howl({ src: [ambientUri], loop: true, volume: 0.18 });
  }

  public setEnabled(next: boolean) {
    this.init();
    this.enabled = next;
    Howler.mute(!next);
    if (next) {
      if (this.ambientHowl && !this.ambientHowl.playing()) {
        this.ambientHowl.play();
      }
      this.playShutter();
    } else {
      this.ambientHowl?.pause();
    }
  }

  public isEnabled() {
    return this.enabled;
  }

  public playShutter() {
    if (!this.enabled) return;
    this.init();
    this.shutterHowl?.play();
  }

  public playHover() {
    if (!this.enabled) return;
    this.init();
    this.hoverHowl?.play();
  }

  public playUnlock() {
    if (!this.enabled) return;
    this.init();
    this.unlockHowl?.play();
  }
}

export const soundEngine = new DarkroomSoundEngine();
