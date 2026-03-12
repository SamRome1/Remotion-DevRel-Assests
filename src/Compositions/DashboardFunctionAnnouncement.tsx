import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Img, staticFile } from 'remotion';
import { loadFont, fontFamily } from '@remotion/google-fonts/Inter';

loadFont('normal', { weights: ['400', '500'] });

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

// Dancing Supabase character
const DancingLogo: React.FC<{ frame: number; opacity: number; arrivalY: number }> = ({
  frame,
  opacity,
  arrivalY,
}) => {
  const dancing = frame > 42;
  const t = dancing ? frame : 0;

  // Body bounce & sway
  const bounceY = Math.sin(t * 0.22) * 11;
  const sway = Math.sin(t * 0.14) * 7;

  // Legs swing alternating
  const leftLegAngle = Math.sin(t * 0.26) * 38;
  const rightLegAngle = -Math.sin(t * 0.26) * 38;

  // Eye blink: sharp dip to near-zero every ~90 frames
  const blinkCycle = Math.abs(Math.sin(t * 0.035));
  const eyeScaleY = blinkCycle < 0.06 ? 0.08 : 1;

  // Mouth happy open on beat
  const mouthOpen = 4 + Math.abs(Math.sin(t * 0.22)) * 8;

  const S = 90; // logo display size
  const LEG_W = 16;
  const LEG_H = 34;

  return (
    <div
      style={{
        transform: `translateY(${arrivalY + bounceY}px) rotate(${sway}deg)`,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Logo + face */}
      <div style={{ position: 'relative', width: S, height: S }}>
        <Img
          src={staticFile('SupabaseIcon.png')}
          style={{
            width: S,
            height: S,
            objectFit: 'contain',
            imageRendering: 'crisp-edges',
          }}
        />
        {/* Face overlay */}
        <svg
          width={S}
          height={S}
          style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}
        >
          {/* Left eye white */}
          <ellipse cx={27} cy={34} rx={8} ry={8 * eyeScaleY} fill="white" />
          {/* Left pupil */}
          <ellipse cx={28} cy={35} rx={4} ry={4 * eyeScaleY} fill="#1a1a1a" />

          {/* Right eye white */}
          <ellipse cx={63} cy={34} rx={8} ry={8 * eyeScaleY} fill="white" />
          {/* Right pupil */}
          <ellipse cx={64} cy={35} rx={4} ry={4 * eyeScaleY} fill="#1a1a1a" />

          {/* Mouth */}
          <path
            d={`M 26 60 Q 45 ${60 + mouthOpen} 64 60`}
            fill="none"
            stroke="white"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Legs */}
      <svg
        width={80}
        height={50}
        style={{ overflow: 'visible', display: 'block' }}
      >
        {/* Left leg */}
        <g transform={`rotate(${leftLegAngle}, 24, 2)`}>
          <rect x={16} y={2} width={LEG_W} height={LEG_H} rx={8} fill="#3ECF8E" stroke="#1a1a1a" strokeWidth={2.5} />
          {/* Foot */}
          <ellipse cx={24} cy={LEG_H + 8} rx={10} ry={6} fill="#3ECF8E" stroke="#1a1a1a" strokeWidth={2.5} />
        </g>
        {/* Right leg */}
        <g transform={`rotate(${rightLegAngle}, 56, 2)`}>
          <rect x={48} y={2} width={LEG_W} height={LEG_H} rx={8} fill="#3ECF8E" stroke="#1a1a1a" strokeWidth={2.5} />
          {/* Foot */}
          <ellipse cx={56} cy={LEG_H + 8} rx={10} ry={6} fill="#3ECF8E" stroke="#1a1a1a" strokeWidth={2.5} />
        </g>
      </svg>
    </div>
  );
};

const WORDS = [
  { text: 'and',       start: 45 },
  { text: 'view',      start: 53 },
  { text: 'your',      start: 61 },
  { text: 'function',  start: 69 },
  { text: 'code',      start: 77 },
  { text: 'in',        start: 85 },
  { text: 'the',       start: 93 },
  { text: 'dashboard', start: 101 },
];

export const DashboardFunctionAnnouncement: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // BG fades in
  const bgOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Logo/character rises from bottom
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

  // Content dissolves at end, BG stays
  const exitOpacity = interpolate(frame, [165, 195], [1, 0], {
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

      {/* Content */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '32px',
          padding: '80px 160px',
        }}
      >
        {/* Dancing character */}
        <DancingLogo
          frame={frame}
          opacity={logoOpacity * exitOpacity}
          arrivalY={logoY}
        />

        {/* Text */}
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
