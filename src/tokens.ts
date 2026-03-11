import React from 'react';
import { interpolate, spring } from 'remotion';

// ─────────────────────────────────────────────────────────────────────────────
// SUPABASE REMOTION TOKEN SYSTEM
// Source: supabase.com/design-system
// ─────────────────────────────────────────────────────────────────────────────

// ── Backgrounds & surfaces ────────────────────────────────────────────────────
export const BG           = '#0f0f0f';   // canvas background
export const SURFACE_75   = '#141414';   // table headers, deepest panels
export const SURFACE_100  = '#1a1a1a';   // code panels, node boxes (default)
export const SURFACE_200  = '#1f1f1f';   // hover / secondary surface
export const SURFACE_300  = '#242424';   // elevated modals

// ── Borders ───────────────────────────────────────────────────────────────────
export const BORDER         = '#2a2a2a';                    // rest
export const BORDER_STRONG  = '#3a3a3a';                    // hover / focus
export const BORDER_BRAND   = 'rgba(62, 207, 142, 0.35)';  // active / lit

// ── Brand ─────────────────────────────────────────────────────────────────────
export const GREEN    = '#3ecf8e';   // brand-500 — primary active color
export const GREEN_LT = '#5cd9a0';  // brand-400 — lighter highlight
export const GREEN_DK = '#29b073';  // brand-600 — pressed / deep state

// ── Semantic ──────────────────────────────────────────────────────────────────
export const RED     = '#f04040';   // destructive — deny / error
export const WARNING = '#f5a623';   // warning — use sparingly

// ── Syntax highlighting (matches Supabase docs code theme) ───────────────────
export const SYN_KEYWORD = '#ff9f7f';  // SELECT, FROM, CREATE, USING
export const SYN_FN      = GREEN;      // auth.uid(), pg_notify()
export const SYN_TABLE   = '#7c9cff';  // table / column names, User A
export const SYN_STRING  = '#f97583';  // string values, User B
export const SYN_COMMENT = 'rgba(255,255,255,0.28)';
export const SYN_DEFAULT = 'rgba(255,255,255,0.82)';

// ── Foreground / text ─────────────────────────────────────────────────────────
export const FG         = 'rgba(255,255,255,0.92)';  // primary labels
export const FG_LIGHT   = 'rgba(255,255,255,0.55)';  // secondary labels
export const FG_MUTED   = 'rgba(255,255,255,0.28)';  // dim / inactive
export const FG_SUBTLE  = 'rgba(255,255,255,0.12)';  // placeholder

// ── Typography ────────────────────────────────────────────────────────────────
export const MONO = '"JetBrains Mono", "Fira Code", ui-monospace, monospace';
// Inter is loaded via @remotion/google-fonts/Inter in each composition:
// import { loadFont, fontFamily as interFont } from '@remotion/google-fonts/Inter'
// loadFont('normal', { weights: ['300', '400', '500', '600', '700'] })

// ── Dot grid background ───────────────────────────────────────────────────────
export const DOT_GRID_STYLE: React.CSSProperties = {
  position:        'absolute',
  inset:           0,
  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1.5px, transparent 1.5px)',
  backgroundSize:  '36px 36px',
  pointerEvents:   'none',
};

// ── Base box style ────────────────────────────────────────────────────────────
export const boxBase: React.CSSProperties = {
  background:   SURFACE_100,
  border:       `1.5px solid ${BORDER}`,
  borderRadius: 14,
  boxShadow:    '0 6px 24px rgba(0,0,0,0.5)',
};

// ── Traffic lights (macOS window chrome) ─────────────────────────────────────
export const TRAFFIC_LIGHTS = ['#ff5f57', '#ffbd2e', '#28c840'] as const;

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const CLAMP = {
  extrapolateLeft:  'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

// Shorthand interpolate with clamp
export const itp = (
  frame: number,
  startFrame: number,
  endFrame: number,
  from = 0,
  to = 1,
) => interpolate(frame, [startFrame, endFrame], [from, to], CLAMP);

// Shorthand spring — snappy config used across all compositions
export const sp = (frame: number, delay = 0) =>
  spring({
    frame:  frame - delay,
    fps:    30,
    config: { damping: 18, stiffness: 200, mass: 0.8 },
  });

// Slow spring — for larger elements that need more weight
export const spSlow = (frame: number, delay = 0) =>
  spring({
    frame:  frame - delay,
    fps:    30,
    config: { damping: 14, stiffness: 120, mass: 1 },
  });

// ─────────────────────────────────────────────────────────────────────────────
// GLOW SYSTEM
// Apply all three properties together when a node/element becomes active.
// progress: 0–1 value from itp() or sp()
// ─────────────────────────────────────────────────────────────────────────────
export const glowStyles = (progress: number): React.CSSProperties => ({
  background: `rgba(62, 207, 142, ${0.06 + progress * 0.12})`,
  border:     `1.5px solid rgba(62, 207, 142, ${0.2 + progress * 0.6})`,
  boxShadow:  progress > 0.05
    ? `0 0 ${20 * progress}px rgba(62, 207, 142, ${0.25 * progress})`
    : '0 6px 24px rgba(0,0,0,0.5)',
});

// Text glow — for code tokens inside lit nodes
export const glowText = (progress: number): React.CSSProperties => ({
  color:      GREEN,
  opacity:    0.35 + progress * 0.65,
  textShadow: progress > 0.1
    ? `0 0 ${16 * progress}px rgba(62, 207, 142, 0.55)`
    : 'none',
});

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// Dot grid background — always render as first child of AbsoluteFill
export const DotGrid: React.FC = () =>
  React.createElement('div', { style: DOT_GRID_STYLE });

// Traffic lights row — used at top of every code panel
export const TrafficLights: React.FC<{ filename?: string }> = ({ filename }) =>
  React.createElement(
    'div',
    { style: { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 22 } },
    ...TRAFFIC_LIGHTS.map(c =>
      React.createElement('div', {
        key: c,
        style: { width: 11, height: 11, borderRadius: '50%', background: c },
      }),
    ),
    filename
      ? React.createElement('span', {
          style: {
            fontFamily:  MONO,
            fontSize:    12,
            color:       FG_SUBTLE,
            marginLeft:  8,
          },
        }, filename)
      : null,
  );

// Check icon
export const CheckIcon: React.FC<{ progress: number; size?: number }> = ({
  progress,
  size = 18,
}) =>
  React.createElement(
    'svg',
    { width: size, height: size, viewBox: '0 0 18 18', fill: 'none', style: { opacity: progress, flexShrink: 0 } },
    React.createElement('circle', { cx: 9, cy: 9, r: 8, fill: 'rgba(62,207,142,0.15)', stroke: GREEN, strokeWidth: 1.4 }),
    React.createElement('path', {
      d: 'M4.5 9l3 3 6-6',
      stroke:          GREEN,
      strokeWidth:     1.6,
      strokeLinecap:   'round',
      strokeLinejoin:  'round',
      strokeDasharray: 20,
      strokeDashoffset: 20 * (1 - progress),
    }),
  );

// Cross icon
export const CrossIcon: React.FC<{ opacity: number; size?: number }> = ({
  opacity,
  size = 18,
}) =>
  React.createElement(
    'svg',
    { width: size, height: size, viewBox: '0 0 18 18', fill: 'none', style: { opacity, flexShrink: 0 } },
    React.createElement('circle', { cx: 9, cy: 9, r: 8, fill: 'rgba(255,64,64,0.12)', stroke: RED, strokeWidth: 1.4 }),
    React.createElement('path', { d: 'M5 5l8 8M13 5l-8 8', stroke: RED, strokeWidth: 1.6, strokeLinecap: 'round' }),
  );

// Lock icon — open prop animates shackle open
export const LockIcon: React.FC<{ color?: string; size?: number; open?: boolean }> = ({
  color = GREEN,
  size  = 20,
  open  = false,
}) =>
  React.createElement(
    'svg',
    { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' },
    React.createElement('rect', {
      x: 4, y: 11, width: 16, height: 11, rx: 2,
      fill:        `${color}18`,
      stroke:      color,
      strokeWidth: 1.5,
    }),
    React.createElement('path', {
      d:           open ? 'M8 11V8a4 4 0 017.95-.5' : 'M8 11V7a4 4 0 018 0v4',
      stroke:      color,
      strokeWidth: 1.5,
      strokeLinecap: 'round',
    }),
    React.createElement('circle', { cx: 12, cy: 16, r: 1.5, fill: color }),
  );