/**
 * blueprint.ts — visual system for the JevConfidencePicker composition.
 * Cream "paper" canvas, black hairline panels, mono type, yellow highlight.
 * Deliberately NOT the Supabase dark system — see docs/briefs/jev-confidence-picker.md.
 */
import { loadFont, fontFamily } from '@remotion/google-fonts/JetBrainsMono';
import { interpolate } from 'remotion';

loadFont('normal', { weights: ['400', '500', '700'], subsets: ['latin'] });

export const MONO = fontFamily;

export const bp = {
  paper:      '#f6f5ee',
  panel:      '#ffffff',
  ink:        '#1a1a1a',
  inkSoft:    '#4a4a46',
  grey:       '#8a8a85',
  hairline:   '#c9c7bf',
  yellow:     '#f4c740',
  yellowPale: '#fdf0c8',
  red:        '#d9483b',
  redPale:    '#f8d3cf',
  barTrack:   '#ffffff',
} as const;

export const border = `2px solid ${bp.ink}`;

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
