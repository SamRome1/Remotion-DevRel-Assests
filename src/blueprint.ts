/**
 * blueprint.ts — visual system for the JevConfidencePicker composition.
 * Blueprint layout (hairline panels, mono type, traveling chips, live timer)
 * on the Supabase dark canvas with green as the single accent.
 * See docs/briefs/jev-confidence-picker.md.
 */
import { loadFont, fontFamily } from '@remotion/google-fonts/JetBrainsMono';
import { interpolate } from 'remotion';
import { BG, SURFACE_100, GREEN, RED, FG, FG_LIGHT } from './tokens';

loadFont('normal', { weights: ['400', '500', '700'], subsets: ['latin'] });

export const MONO = fontFamily;

export const bp = {
  paper:      BG,
  panel:      SURFACE_100,
  ink:        FG,
  inkSoft:    'rgba(255,255,255,0.72)',
  grey:       FG_LIGHT,
  line:       'rgba(255,255,255,0.3)',
  accent:     GREEN,
  accentPale: 'rgba(62,207,142,0.18)',
  onAccent:   '#0f0f0f',
  red:        RED,
  redPale:    'rgba(240,64,64,0.2)',
  barDim:     'rgba(255,255,255,0.3)',
} as const;

export const border = `2px solid ${bp.line}`;
export const glow = `0 0 18px rgba(62,207,142,0.35)`;

/** Clamped interpolate. */
export const itp = (frame: number, from: number, to: number, a = 0, b = 1) =>
  interpolate(frame, [from, to], [a, b], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

/** Crisp stamp-in: 6-frame fade + 6px rise. The reference cuts hard; this is as soft as we go. */
export const stamp = (frame: number, at: number, len = 6) => {
  const p = itp(frame, at, at + len);
  return { opacity: p, transform: `translateY(${(1 - p) * 6}px)` };
};

/** Quick opacity-only fade out over `len` frames ending at `end`. */
export const fadeOut = (frame: number, end: number, len = 6) => itp(frame, end - len, end, 1, 0);
