import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
  Img,
} from 'remotion';
import { BG } from '../tokens';
import { circularFamily } from '../fonts';

const FIREBASE_ORANGE = '#FFA000';
const LOCK_BODY_W = 140;
const LOCK_BODY_H = 110;
const SHACKLE_W = 80;
const SHACKLE_H = 65;

const clamp = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const itp = (frame: number, s: number, e: number, from = 0, to = 1) =>
  interpolate(frame, [s, e], [from, to], clamp);

function Padlock() {
  return (
    <div style={{ position: 'relative', width: LOCK_BODY_W, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        style={{
          width: SHACKLE_W,
          height: SHACKLE_H,
          border: '10px solid #555',
          borderBottom: 'none',
          borderRadius: '40px 40px 0 0',
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
      />
      <div
        style={{
          width: LOCK_BODY_W,
          height: LOCK_BODY_H,
          borderRadius: 18,
          background: 'linear-gradient(160deg, #7a7a7a 0%, #484848 50%, #6a6a6a 100%)',
          border: '3px solid #333',
          boxSizing: 'border-box',
          position: 'relative',
          flexShrink: 0,
          boxShadow: '0 12px 48px rgba(0,0,0,0.7)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#1a1a1a' }} />
          <div style={{ width: 9, height: 14, background: '#1a1a1a', borderRadius: '0 0 4px 4px', marginTop: -3 }} />
        </div>
      </div>
    </div>
  );
}

export const FirebaseLockIn: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // Logo entrance
  const logoScale = interpolate(frame, [0, 28], [0.75, 1.0], clamp);
  const logoOpacity = itp(frame, 0, 22);

  // Lock drop — starts frame 35
  const lockDrop = spring({ frame: frame - 35, fps, config: { damping: 26, stiffness: 180, mass: 1.2 } });
  const lockY = -320 + 320 * lockDrop;
  const lockOpacity = itp(frame, 35, 46);

  // Dim the logo once lock is mostly down
  const logoDim = itp(frame, 55, 68, 1, 0.35);

  // Orange tint that flashes on lock slam (around frame 60)
  const flashIn = itp(frame, 58, 62, 0, 0.18);
  const flashOut = itp(frame, 62, 72, 0.18, 0);
  const flashOpacity = frame < 62 ? flashIn : flashOut;

  // Text reveal
  const line1 = itp(frame, 68, 82);
  const line2 = itp(frame, 74, 88);

  const logoCenterY = height * 0.44;
  const lockFinalY = logoCenterY - 130;
  const textY = height * 0.70;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', fontFamily: circularFamily }}>

      {/* Background orange bloom */}
      <div
        style={{
          position: 'absolute',
          left: width / 2 - 400,
          top: logoCenterY - 400,
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255,160,0,${0.10 * logoOpacity}) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Firebase logo */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: logoCenterY,
          transform: `translate(-50%, -50%) scale(${logoScale})`,
          opacity: logoOpacity * logoDim,
          filter: 'drop-shadow(0 0 48px rgba(255,160,0,0.45)) drop-shadow(0 0 16px rgba(255,100,0,0.3))',
        }}
      >
        <Img src={staticFile('Firebase.png')} style={{ width: 660, height: 660, objectFit: 'contain' }} />
      </div>

      {/* Padlock */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: lockFinalY + lockY,
          transform: 'translateX(-50%)',
          opacity: lockOpacity,
          filter: `drop-shadow(0 0 ${24 * lockDrop}px rgba(0,0,0,0.8))`,
        }}
      >
        <Padlock />
      </div>

      {/* Flash on slam */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `rgba(255, 140, 0, ${flashOpacity})`,
          pointerEvents: 'none',
        }}
      />

      {/* Text */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: textY,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <div
          style={{
            fontSize: 54,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.9)',
            lineHeight: 1,
            letterSpacing: -1,
            opacity: line1,
            transform: `translateY(${(1 - line1) * 28}px)`,
          }}
        >
          Proprietary Lock-In
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.45)',
            lineHeight: 1,
            opacity: line2,
            transform: `translateY(${(1 - line2) * 28}px)`,
          }}
        >
          Your data. Their rules.
        </div>
      </div>

    </AbsoluteFill>
  );
};
