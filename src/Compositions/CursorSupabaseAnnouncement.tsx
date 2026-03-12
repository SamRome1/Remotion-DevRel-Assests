import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Img, staticFile } from 'remotion';
import { loadFont, fontFamily } from '@remotion/google-fonts/Inter';

loadFont('normal', { weights: ['400', '700', '800', '900'] });

const Word: React.FC<{
  children: React.ReactNode;
  startFrame: number;
  frame: number;
  fps: number;
  color?: string;
}> = ({ children, startFrame, frame, fps, color = '#ffffff' }) => {
  const wordSpring = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 14, stiffness: 200, mass: 0.6 },
  });
  const wordY = interpolate(wordSpring, [0, 1], [60, 0]);
  const wordOpacity = interpolate(frame, [startFrame, startFrame + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <span
      style={{
        display: 'inline-block',
        transform: `translateY(${wordY}px)`,
        opacity: wordOpacity,
        color,
      }}
    >
      {children}
    </span>
  );
};

export const CursorSupabaseAnnouncement: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Panel slides in from right
  const slideIn = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 160, mass: 1 },
  });
  const slideInX = interpolate(slideIn, [0, 1], [1960, 0]);

  // Panel slides out to left + fades (starts at frame 130)
  const slideOutProgress = interpolate(frame, [130, 180], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const slideOutX = interpolate(slideOutProgress, [0, 1], [0, -1960]);
  const exitOpacity = interpolate(slideOutProgress, [0, 0.6], [1, 0], {
    extrapolateRight: 'clamp',
  });

  const translateX = frame < 130 ? slideInX : slideOutX;
  const opacity = frame < 130 ? 1 : exitOpacity;

  // Logo scale spring
  const logoSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 12, stiffness: 180, mass: 0.8 },
  });

  // Words stagger starting at frame 28
  const words = [
    { text: 'Cursor',   start: 28,  color: '#ffffff' },
    { text: 'now',      start: 36,  color: '#ffffff' },
    { text: 'has',      start: 44,  color: '#ffffff' },
    { text: 'an',       start: 52,  color: '#ffffff' },
    { text: 'official', start: 60,  color: '#ffffff' },
    { text: 'Supabase', start: 68,  color: '#3ECF8E' },
    { text: 'plugin',   start: 76,  color: '#ffffff' },
  ];

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* BG2 background */}
      <Img
        src={staticFile('BG2.png')}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Animated content panel */}
      <AbsoluteFill
        style={{
          transform: `translateX(${translateX}px)`,
          opacity,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 120px',
          gap: '48px',
        }}
      >
        {/* Supabase logo with scale spring */}
        <div style={{ transform: `scale(${logoSpring})` }}>
          <Img
            src={staticFile('SupabaseIcon.png')}
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'contain',
              imageRendering: 'crisp-edges',
            }}
          />
        </div>

        {/* Headline — word-by-word spring entrance */}
        <div
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: '120px',
            lineHeight: 1.1,
            textAlign: 'center',
            letterSpacing: '-2px',
            textShadow: '0 4px 40px rgba(0,0,0,0.6)',
            maxWidth: '1600px',
            overflow: 'hidden',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.22em',
          }}
        >
          {words.map(({ text, start, color }) => (
            <Word key={text} startFrame={start} frame={frame} fps={fps} color={color}>
              {text}
            </Word>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
