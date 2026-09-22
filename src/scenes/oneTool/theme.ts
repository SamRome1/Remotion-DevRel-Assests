/**
 * OneTool — light "YouTube explainer" system.
 * Deliberate one-off: white canvas (sanctioned exception to the dark default).
 * Single accent: Supabase green. Circular Std for UI, JetBrains Mono for code.
 */
import { Easing, interpolate, spring } from 'remotion';
import { loadFont as loadJetBrains } from '@remotion/google-fonts/JetBrainsMono';
import { circularFamily } from '../../fonts';
import { MONO } from '../../tokens';

loadJetBrains('normal', { weights: ['400', '500', '700'], subsets: ['latin'] });

export const W = 1920;
export const H = 1080;
export const FPS = 30;
export const CX = W / 2;
export const CY = H / 2;

// ── Palette (light) ───────────────────────────────────────────────────────────
export const PAPER = '#FFFFFF';
export const INK = '#111111';
export const INK_2 = '#5C5C5C';
export const INK_3 = '#9A9A9A';
export const LINE = '#E6E6E6';
export const LINE_2 = '#D4D4D4';
export const FILL = '#F4F4F5';
export const FILL_2 = '#EBEBEC';
export const GREEN = '#3ECF8E';
export const GREEN_INK = '#1D9A63'; // readable green for text on white
export const GREEN_TINT = 'rgba(62,207,142,0.14)';
export const GREEN_LINE = 'rgba(62,207,142,0.5)';
export const RED = '#E5484D';
export const RED_TINT = 'rgba(229,72,77,0.12)';

export const SHADOW = '0 18px 50px rgba(0,0,0,0.09), 0 2px 6px rgba(0,0,0,0.05)';
export const UI = circularFamily;
export const CODE = MONO;

export const DOT_GRID: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.085) 1.5px, transparent 1.5px)',
  backgroundSize: '36px 36px',
  pointerEvents: 'none',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

export const itp = (frame: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(frame, [a, b], [from, to], CLAMP);

/** Standard entrance spring — damping 18 / stiffness 130 (CLAUDE.md). */
export const sp = (frame: number, delay = 0) =>
  spring({ frame: frame - delay, fps: FPS, config: { damping: 18, stiffness: 130 } });

/** Heavier spring for large elements. */
export const spHeavy = (frame: number, delay = 0) =>
  spring({ frame: frame - delay, fps: FPS, config: { damping: 16, stiffness: 90, mass: 1.1 } });

export const easeInOut = Easing.inOut(Easing.cubic);
export const easeIn = Easing.in(Easing.cubic);
export const easeOut = Easing.out(Easing.cubic);

/** Deterministic pseudo-random in [0,1). */
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Entrance style: opacity + 28px rise + 0.94→1 scale. */
export const enterStyle = (frame: number, delay: number): React.CSSProperties => {
  const p = sp(frame, delay);
  return {
    opacity: frame < delay ? 0 : Math.min(1, p * 1.4),
    transform: `translateY(${(1 - p) * 28}px) scale(${0.94 + 0.06 * p})`,
  };
};

// ── Beat timeline (frames @30fps), synced to the VO ───────────────────────────
export const T = {
  WRITE: 0,      // "We write code with it."
  DEBUG: 70,     // "We debug the code with it."
  APP: 140,      // "We build entire apps with it,"
  SQL: 210,      // "generate the SQL,"
  ARGUE: 265,    // "We argue with it in the middle of the night,"
  ANY: 345,      // "basically anything you can do with it."
  ONE: 405,      // "One tool,"
  YEARS: 465,    // "and in three years"
  JOBS: 545,     // "it swallowed basically every job in software."
  END: 600,
} as const;

export const ONE_TOOL_DURATION = T.END;
