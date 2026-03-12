import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Img, staticFile } from 'remotion';
import { loadFont, fontFamily } from '@remotion/google-fonts/Inter';

loadFont('normal', { weights: ['400', '500', '600'] });

export const SupabaseBrandRevealBG4: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // BG fades in
  const bgOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Brand lockup rises from bottom
  const brandSpring = spring({
    frame: frame - 25,
    fps,
    config: { damping: 18, stiffness: 130, mass: 1 },
  });
  const brandY = interpolate(brandSpring, [0, 1], [100, 0]);
  const brandOpacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Dissolve content at end, BG stays
  const exitOpacity = interpolate(frame, [140, 170], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#ffffff' }}>
      {/* BG4 */}
      <Img
        src={staticFile('BG4.png')}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: bgOpacity,
        }}
      />

      {/* Brand lockup — logo + wordmark side by side */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            transform: `translateY(${brandY}px)`,
            opacity: brandOpacity * exitOpacity,
          }}
        >
          <Img
            src={staticFile('SupabaseIcon.png')}
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'contain',
              imageRendering: 'crisp-edges',
            }}
          />
          <span
            style={{
              fontFamily,
              fontWeight: 600,
              fontSize: '96px',
              color: '#1a1a1a',
              letterSpacing: '-2px',
              lineHeight: 1,
            }}
          >
            Supabase
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
