import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Img, staticFile } from 'remotion';
import { loadFont, fontFamily } from '@remotion/google-fonts/Inter';

loadFont('normal', { weights: ['300', '400', '500'] });

const Word: React.FC<{
  children: React.ReactNode;
  startFrame: number;
  frame: number;
  fps: number;
}> = ({ children, startFrame, frame, fps }) => {
  const wordSpring = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 16, stiffness: 140, mass: 0.9 },
  });
  const wordY = interpolate(wordSpring, [0, 1], [80, 0]);
  const wordOpacity = interpolate(frame, [startFrame, startFrame + 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <span
      style={{
        display: 'inline-block',
        transform: `translateY(${wordY}px)`,
        opacity: wordOpacity,
      }}
    >
      {children}
    </span>
  );
};

// "announcing Built-in Edge Function testing"
const WORDS = [
  { text: 'Announcing',  start: 45 },
  { text: 'Built-in',    start: 55 },
  { text: 'Edge',        start: 65 },
  { text: 'Function',    start: 75 },
  { text: 'Testing',     start: 85 },
];

export const EdgeFunctionAnnouncement: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // BG fades in first
  const bgOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Logo rises from bottom
  const logoSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 16, stiffness: 140, mass: 0.9 },
  });
  const logoY = interpolate(logoSpring, [0, 1], [120, 0]);
  const logoOpacity = interpolate(frame, [20, 38], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fade out at the end
  const exitOpacity = interpolate(frame, [160, 190], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#ffffff' }}>
      {/* BG3 background fades in */}
      <Img
        src={staticFile('BG3.png')}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: bgOpacity,
        }}
      />

      {/* Content */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '40px',
          padding: '80px 160px',
        }}
      >
        {/* Supabase logo rises from bottom */}
        <div
          style={{
            transform: `translateY(${logoY}px)`,
            opacity: logoOpacity * exitOpacity,
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
        </div>

        {/* Text — word by word from bottom */}
        <div
          style={{
            fontFamily,
            fontWeight: 400,
            fontSize: '108px',
            lineHeight: 1.1,
            textAlign: 'center',
            letterSpacing: '-1px',
            color: '#000000',
            maxWidth: '1500px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.25em',
            overflow: 'hidden',
            opacity: exitOpacity,
          }}
        >
          {WORDS.map(({ text, start }) => (
            <Word key={text} startFrame={start} frame={frame} fps={fps}>
              {text}
            </Word>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
