import React from 'react';
import { colors } from '../theme';

/** Stroke-drawn status glyphs (not emoji). `progress` 0→1 draws the stroke. */
type GlyphProps = { progress: number; size?: number; color?: string };

export const CheckGlyph: React.FC<GlyphProps> = ({ progress, size = 28, color = colors.zinc400 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M4 12.5l5 5L20 6.5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - progress}
    />
  </svg>
);

export const CrossGlyph: React.FC<GlyphProps> = ({ progress, size = 28, color = colors.zinc400 }) => {
  const a = Math.min(1, progress * 2);
  const b = Math.max(0, progress * 2 - 1);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12" stroke={color} strokeWidth={1.5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - a} />
      <path d="M18 6L6 18" stroke={color} strokeWidth={1.5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - b} />
    </svg>
  );
};

/** Generic database cylinder, stroke-drawn. Not a brand mark. */
export const CylinderGlyph: React.FC<GlyphProps> = ({ progress, size = 64, color = colors.zinc400 }) => {
  const p = Math.max(0, Math.min(1, progress));
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 64 80" fill="none">
      <ellipse cx={32} cy={14} rx={26} ry={10} stroke={color} strokeWidth={1.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, p * 1.6)} />
      <path d="M6 14v52c0 5.5 11.6 10 26 10s26-4.5 26-10V14" stroke={color} strokeWidth={1.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.max(0, (p - 0.3) / 0.7)} />
      <path d="M6 40c0 5.5 11.6 10 26 10s26-4.5 26-10" stroke={color} strokeWidth={1.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.max(0, (p - 0.6) / 0.4)} opacity={0.6} />
    </svg>
  );
};
