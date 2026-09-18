import React from 'react';
import { Img, staticFile } from 'remotion';

const ASPECT = 298 / 206; // height / width, from the cropped mark asset

/** TypeSafe/Jev brand mark. `glow` (0-1) drives a white or green drop-shadow. */
export const JevMark: React.FC<{
  variant: 'white' | 'green' | 'black';
  size?: number;
  glow?: number;
  style?: React.CSSProperties;
}> = ({ variant, size = 160, glow = 0, style }) => {
  const src = `assets/jev-mark-${variant}.png`;
  const rgb = variant === 'green' ? '62,207,142' : '255,255,255';

  return (
    <Img
      src={staticFile(src)}
      style={{
        width:  size,
        height: size * ASPECT,
        objectFit: 'contain',
        filter: glow > 0
          ? `drop-shadow(0 0 ${22 * glow}px rgba(${rgb},${(0.35 * glow).toFixed(2)})) drop-shadow(0 0 ${6 * glow}px rgba(${rgb},${(0.5 * glow).toFixed(2)}))`
          : undefined,
        ...style,
      }}
    />
  );
};
