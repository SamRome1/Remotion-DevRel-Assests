import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  useVideoConfig,
  spring,
} from 'remotion';
import { BG, GREEN, DotGrid } from '../tokens';
import { circularFamily } from '../fonts';

export const EasierWay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const line1Opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const line2Opacity = interpolate(frame, [22, 42], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const line3Progress = spring({
    frame: frame - 55,
    fps,
    config: { damping: 18, stiffness: 120 },
  });
  const line3Y = interpolate(line3Progress, [0, 1], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const line3Opacity = interpolate(line3Progress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Soft green bloom that grows in behind the hero line
  const bloomOpacity = interpolate(frame, [55, 100], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', fontFamily: circularFamily }}>
      <DotGrid />

      {/* Green radial bloom behind hero text */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 60% 35% at 50% 58%, rgba(62,207,142,0.12) 0%, transparent 70%)`,
          opacity: bloomOpacity,
          pointerEvents: 'none',
        }}
      />

      {/* Centered text stack */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        {/* Setup lines */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontSize: 30,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.35)',
              opacity: line1Opacity,
              letterSpacing: 0.5,
            }}
          >
            but what if instead
          </span>
          <span
            style={{
              fontSize: 30,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.35)',
              opacity: line2Opacity,
              letterSpacing: 0.5,
            }}
          >
            there was
          </span>
        </div>

        {/* Hero line */}
        <span
          style={{
            fontSize: 100,
            fontWeight: 800,
            color: GREEN,
            opacity: line3Opacity,
            transform: `translateY(${line3Y}px)`,
            lineHeight: 1,
            letterSpacing: -2,
            textShadow: `0 0 60px rgba(62,207,142,0.5), 0 0 120px rgba(62,207,142,0.25)`,
          }}
        >
          a much easier way
        </span>
      </div>
    </AbsoluteFill>
  );
};
