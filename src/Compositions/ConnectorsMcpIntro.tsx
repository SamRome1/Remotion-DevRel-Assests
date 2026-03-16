import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  Img,
  staticFile,
  interpolate,
  spring,
  useVideoConfig,
} from 'remotion';

const WIDTH = 1920;
const HEIGHT = 1080;
const LOGO_SIZE = 280;
const CENTER_X = WIDTH / 2 - LOGO_SIZE / 2;
const CENTER_Y = HEIGHT / 2 - LOGO_SIZE / 2;

// Timeline (frames at 30fps)
const CLAUDE_ENTER = 60;  // claude starts flying in
const IMPACT = 90;        // collision
const TOTAL = 210;        // end

export const ConnectorsMcpIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Android logo ──────────────────────────────────────────────
  // Gentle bob: ±18px, 0.6 cycles/sec
  const bob = Math.sin((frame / fps) * 2 * Math.PI * 0.6) * 18;

  let androidX = CENTER_X;
  let androidY = CENTER_Y + bob;
  let androidRotation = 0;
  let androidOpacity = 1;

  if (frame >= IMPACT) {
    const t = frame - IMPACT;
    // fly off to the left + downward arc
    androidX = CENTER_X - t * 90;
    androidY = CENTER_Y + t * 14;
    androidRotation = t * 18;
    androidOpacity = interpolate(t, [0, 18], [1, 0], { extrapolateRight: 'clamp' });
  }

  const androidVisible = androidOpacity > 0;

  // ── Claude logo ───────────────────────────────────────────────
  let claudeX: number;
  const claudeY = CENTER_Y;

  if (frame < CLAUDE_ENTER) {
    // off-screen right, invisible
    claudeX = WIDTH + 200;
  } else if (frame < IMPACT) {
    // fly in from right — quadratic ease-in so it accelerates
    const t = (frame - CLAUDE_ENTER) / (IMPACT - CLAUDE_ENTER); // 0→1
    const eased = t * t; // ease-in (accelerating)
    claudeX = interpolate(eased, [0, 1], [WIDTH + 200, CENTER_X]);
  } else {
    // spring settle after impact
    const s = spring({
      frame: frame - IMPACT,
      fps,
      config: { damping: 14, stiffness: 180, mass: 0.6 },
    });
    // slight left overshoot from momentum, spring back to center
    claudeX = interpolate(s, [0, 1], [CENTER_X - 40, CENTER_X]);
  }

  // Impact squish: brief horizontal squeeze on Claude
  const squishProgress = frame >= IMPACT
    ? spring({ frame: frame - IMPACT, fps, config: { damping: 8, stiffness: 280, mass: 0.3 } })
    : 1;
  const scaleX = frame >= IMPACT
    ? interpolate(squishProgress, [0, 1], [1.35, 1])
    : 1;
  const scaleY = frame >= IMPACT
    ? interpolate(squishProgress, [0, 1], [0.78, 1])
    : 1;

  // Gentle bob on Claude after settled
  const claudeBob =
    frame >= IMPACT + 30
      ? Math.sin(((frame - IMPACT - 30) / fps) * 2 * Math.PI * 0.6) * 18
      : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a', overflow: 'hidden' }}>
      {/* Dot grid background */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }}
      />

      {/* Impact flash */}
      {frame >= IMPACT && frame < IMPACT + 6 && (
        <AbsoluteFill
          style={{
            backgroundColor: `rgba(255,255,255,${interpolate(
              frame - IMPACT,
              [0, 6],
              [0.18, 0],
              { extrapolateRight: 'clamp' }
            )})`,
          }}
        />
      )}

      {/* Android logo */}
      {androidVisible && (
        <div
          style={{
            position: 'absolute',
            left: androidX,
            top: androidY,
            width: LOGO_SIZE,
            height: LOGO_SIZE,
            opacity: androidOpacity,
            transform: `rotate(${androidRotation}deg)`,
            transformOrigin: 'center center',
            filter: 'drop-shadow(0 0 24px rgba(164,198,57,0.55))',
          }}
        >
          <Img
            src={staticFile('android logo.png')}
            style={{ width: LOGO_SIZE, height: LOGO_SIZE, objectFit: 'contain' }}
          />
        </div>
      )}

      {/* Claude logo */}
      {frame >= CLAUDE_ENTER && (
        <div
          style={{
            position: 'absolute',
            left: claudeX,
            top: claudeY + claudeBob,
            width: LOGO_SIZE,
            height: LOGO_SIZE,
            transform: `scaleX(${scaleX}) scaleY(${scaleY})`,
            transformOrigin: 'center center',
            filter: 'drop-shadow(0 0 28px rgba(210,160,100,0.6))',
          }}
        >
          <Img
            src={staticFile('claudelogo.png')}
            style={{ width: LOGO_SIZE, height: LOGO_SIZE, objectFit: 'contain' }}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
