/**
 * theme.ts — single source of truth for the short-form motion system.
 *
 * Visual system:
 *  - pure black canvas, no gradients / vignettes / noise
 *  - Inter for UI + headlines (500–700), JetBrains Mono for code / labels
 *  - one accent color per project (ACCENT)
 *  - generous negative space, content in the center 80% safe zone
 *  - entrances: opacity 0→1 + 12px rise + 0.98→1 scale, damping-200 spring
 *  - exits: quick 6–8 frame opacity fades
 */
import { loadFont as loadInter, fontFamily as interFamily } from '@remotion/google-fonts/Inter';
import {
  loadFont as loadJetBrains,
  fontFamily as jetBrainsFamily,
} from '@remotion/google-fonts/JetBrainsMono';
import type { CSSProperties } from 'react';
import { interpolate, spring, Easing } from 'remotion';

loadInter('normal', { weights: ['500', '600', '700'], subsets: ['latin'] });
loadJetBrains('normal', { weights: ['400', '500', '700'], subsets: ['latin'] });

// ---------------------------------------------------------------------------
// Canvas
// ---------------------------------------------------------------------------
export const CANVAS = {
  width: 1080,
  height: 1080,
  fps: 30,
} as const;

/** Center 80% safe zone — content never leaves this box. */
export const SAFE_INSET = Math.round(CANVAS.width * 0.1); // 108px per side

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------
/** One accent per project. Swap this single value to re-theme every scene. */
export const ACCENT = '#336791'; // Postgres blue — this project's single accent

export const colors = {
  bg: '#000000',
  text: '#FFFFFF',
  textSecondary: '#A1A1AA', // zinc-400
  textTertiary: '#71717A', // zinc-500 — use sparingly, e.g. dividers / captions
  accent: ACCENT,
  /** 1px border glow for highlight moments (never size changes). */
  accentBorder: `${ACCENT}66`, // 40%
  accentGlow: `0 0 0 1px ${ACCENT}, 0 0 24px ${ACCENT}40`,
  border: 'rgba(255,255,255,0.10)',
  surface: 'rgba(255,255,255,0.04)',
  zinc400: '#A1A1AA',
  zinc500: '#71717A',
  zinc600: '#52525B',
  zinc700: '#3F3F46',
  zinc800: '#27272A',
} as const;

/** Third-party brand colors used only where the brief calls for them. */
export const brand = {
  typescript: '#3178C6',
  rust: '#DEA584',
  postgres: '#336791',
  denied: 'rgba(239,68,68,0.9)', // #EF4444 @ 90%
} as const;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------
export const fonts = {
  ui: interFamily, // 'Inter'
  mono: jetBrainsFamily, // 'JetBrains Mono'
} as const;

export const type = {
  headline: { fontFamily: fonts.ui, fontSize: 72, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1.5 },
  subhead: { fontFamily: fonts.ui, fontSize: 40, fontWeight: 600, lineHeight: 1.15, letterSpacing: -0.5 },
  body: { fontFamily: fonts.ui, fontSize: 28, fontWeight: 500, lineHeight: 1.4, letterSpacing: 0 },
  monoLabel: { fontFamily: fonts.mono, fontSize: 20, fontWeight: 500, lineHeight: 1, letterSpacing: 2 },
  code: { fontFamily: fonts.mono, fontSize: 24, fontWeight: 400, lineHeight: 1.6, letterSpacing: 0 },
  stat: { fontFamily: fonts.ui, fontSize: 160, fontWeight: 700, lineHeight: 1, letterSpacing: -6 },
} as const;

// ---------------------------------------------------------------------------
// Spacing (8px grid)
// ---------------------------------------------------------------------------
export const space = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 40,
  xl: 64,
  xxl: 96,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------
export const springs = {
  /** The only entrance spring: no bounce, no overshoot. */
  enter: { damping: 200 },
} as const;

export const timing = {
  /** Frames between sibling entrances. */
  stagger: 4,
  /** Exit fade length. */
  exit: 7,
  /** Minimum hold after a composition finishes animating in. */
  hold: 20,
  /** Frames the entrance spring needs to visibly settle. */
  enterDuration: 24,
  /** Rise distance in px for entrances. */
  rise: 12,
  /** Entry scale start. */
  scaleFrom: 0.98,
} as const;

/**
 * Standard entrance: returns opacity / translateY / scale for an element
 * whose animation begins at `delay` frames into the current sequence.
 */
export const enter = (frame: number, fps: number, delay = 0) => {
  const p = spring({ fps, frame: frame - delay, config: springs.enter });
  return {
    progress: p,
    opacity: p,
    translateY: (1 - p) * timing.rise,
    scale: timing.scaleFrom + (1 - timing.scaleFrom) * p,
  };
};

/**
 * Quick opacity exit. `endFrame` is the last frame of the sequence;
 * the fade occupies the final `timing.exit` frames.
 */
export const exitFade = (frame: number, endFrame: number, length: number = timing.exit) =>
  interpolate(frame, [endFrame - length, endFrame], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

/** Compose entrance + exit into a single style object. */
export const enterStyle = (
  frame: number,
  fps: number,
  delay = 0,
  durationInFrames?: number,
): CSSProperties => {
  const e = enter(frame, fps, delay);
  const out = durationInFrames ? exitFade(frame, durationInFrames) : 1;
  return {
    opacity: e.opacity * out,
    transform: `translateY(${e.translateY}px) scale(${e.scale})`,
  };
};

/** Clamped linear interpolate shorthand. */
export const itp = (frame: number, from: number, to: number, a = 0, b = 1) =>
  interpolate(frame, [from, to], [a, b], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

/**
 * Typewriter reveal. Returns the visible prefix of `text` given the frame the
 * typing starts and how many frames each character takes.
 */
export const typeOut = (text: string, frame: number, start: number, framesPerChar = 2) => {
  const n = Math.max(0, Math.min(text.length, Math.floor((frame - start) / framesPerChar) + 1));
  return frame < start ? '' : text.slice(0, n);
};

/** Linear interpolation. */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Slow deliberate spring with a fixed duration — same damping-200 feel,
 * stretched to `durationInFrames`.
 */
export const slowSpring = (frame: number, fps: number, delay: number, durationInFrames: number) =>
  spring({ fps, frame: frame - delay, config: springs.enter, durationInFrames });
