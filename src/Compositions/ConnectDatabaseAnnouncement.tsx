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

// Phrase 1: "Connect your database with the click of a button"
const PHRASE1 = [
  { text: 'Connect',  start: 28, color: '#ffffff' },
  { text: 'your',     start: 34, color: '#ffffff' },
  { text: 'database', start: 40, color: '#3ECF8E' },
  { text: 'with',     start: 46, color: '#ffffff' },
  { text: 'the',      start: 52, color: '#ffffff' },
  { text: 'click',    start: 58, color: '#ffffff' },
  { text: 'of',       start: 64, color: '#ffffff' },
  { text: 'a',        start: 70, color: '#ffffff' },
  { text: 'button',   start: 76, color: '#ffffff' },
];

// Phrase 2: "Supabase"
const PHRASE2 = [
  { text: 'Supabase', start: 128, color: '#3ECF8E' },
];

export const ConnectDatabaseAnnouncement: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Panel slides in from right
  const slideIn = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 160, mass: 1 },
  });
  const slideInX = interpolate(slideIn, [0, 1], [1960, 0]);

  // Panel slides out to left + fades (starts at frame 230)
  const slideOutProgress = interpolate(frame, [230, 270], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const slideOutX = interpolate(slideOutProgress, [0, 1], [0, -1960]);
  const exitOpacity = interpolate(slideOutProgress, [0, 0.6], [1, 0], {
    extrapolateRight: 'clamp',
  });

  const translateX = frame < 230 ? slideInX : slideOutX;
  const panelOpacity = frame < 230 ? 1 : exitOpacity;

  // Logo scale spring
  const logoSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 12, stiffness: 180, mass: 0.8 },
  });

  // Phrase 1: fades out upward between frames 100-125
  const phrase1Opacity = interpolate(frame, [100, 122], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const phrase1Y = interpolate(frame, [100, 122], [0, -50], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Phrase 2: fades in from below starting at frame 120
  const phrase2Opacity = interpolate(frame, [120, 135], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const phrase2Y = interpolate(frame, [120, 140], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const textStyle: React.CSSProperties = {
    fontFamily,
    fontWeight: 900,
    fontSize: '110px',
    lineHeight: 1.1,
    textAlign: 'center',
    letterSpacing: '-2px',
    textShadow: '0 4px 40px rgba(0,0,0,0.6)',
    maxWidth: '1600px',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '0.22em',
  };

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
          opacity: panelOpacity,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 120px',
          gap: '48px',
        }}
      >
        {/* Supabase logo */}
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

        {/* Text swap area — fixed height so layout doesn't jump */}
        <div style={{ position: 'relative', width: '100%', height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

          {/* Phrase 1 */}
          <div
            style={{
              ...textStyle,
              position: 'absolute',
              opacity: phrase1Opacity,
              transform: `translateY(${phrase1Y}px)`,
            }}
          >
            {PHRASE1.map(({ text, start, color }) => (
              <Word key={text} startFrame={start} frame={frame} fps={fps} color={color}>
                {text}
              </Word>
            ))}
          </div>

          {/* Phrase 2 */}
          <div
            style={{
              ...textStyle,
              position: 'absolute',
              opacity: phrase2Opacity,
              transform: `translateY(${phrase2Y}px)`,
            }}
          >
            {PHRASE2.map(({ text, start, color }) => (
              <Word key={text} startFrame={start} frame={frame} fps={fps} color={color}>
                {text}
              </Word>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
