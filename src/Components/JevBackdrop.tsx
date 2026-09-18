import React from 'react';
import { DotGrid } from '../tokens';

/** Dot grid + a slow drifting glow blob — keeps the canvas alive, never static. */
export const JevBackdrop: React.FC<{ frame: number; tint: string }> = ({ frame, tint }) => {
  const x = 50 + Math.sin(frame * 0.015) * 22;
  const y = 42 + Math.cos(frame * 0.012) * 20;

  return (
    <>
      <DotGrid />
      <div
        style={{
          position:      'absolute',
          left:          `${x}%`,
          top:           `${y}%`,
          width:         900,
          height:        900,
          marginLeft:    -450,
          marginTop:     -450,
          background:    `radial-gradient(circle, ${tint} 0%, transparent 70%)`,
          filter:        'blur(10px)',
          pointerEvents: 'none',
        }}
      />
    </>
  );
};
