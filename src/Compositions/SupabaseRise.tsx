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

// Final resting Y position as a fraction from top (35%)
const FINAL_Y_FRACTION = 0.35;

// Logo size for vertical format
const LOGO_SIZE = 120;
const LOGO_TEXT_GAP = 32;

export const SupabaseRise: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // ── Rise spring ───────────────────────────────────────────────────────────────
  // spring(0→1) drives translateY from off-screen bottom to final position
  const riseProgress = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 90, mass: 1 },
  });

  // Starting Y: below the bottom edge of the canvas
  // Final Y: ~35% from the top, centered horizontally
  const finalY = height * FINAL_Y_FRACTION;
  // Group height (logo + gap + text line height ~130px)
  const groupHeight = LOGO_SIZE + LOGO_TEXT_GAP + 140;
  // Center the group vertically at finalY (finalY = top of group)
  const groupTop = finalY - groupHeight / 2;

  // Off-screen start position (below canvas)
  const startOffsetY = height - groupTop + 80;
  const translateY = startOffsetY * (1 - riseProgress);

  // ── Fade in ───────────────────────────────────────────────────────────────────
  const opacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ── Post-arrival glow breath ──────────────────────────────────────────────────
  // Arrival is essentially complete by frame ~45 (spring settles fast at stiffness 90)
  // Breathing kicks in after frame 40, slow sine oscillation
  const breathPhase = Math.max(0, frame - 40);
  const breathCycle = Math.sin((breathPhase / fps) * Math.PI * 1.2); // ~0.6 Hz
  // Normalise to 0-1 range for alpha calculations (0.45 → 0.55 midpoint)
  const breathNorm = 0.5 + breathCycle * 0.1; // ±10% amplitude

  // Glow intensity: spring-driven arrival + breathing pulse after
  const glowArrival = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80, mass: 1.2 },
  });
  const glowIntensity = glowArrival * breathNorm;

  // ── Radial background bloom ───────────────────────────────────────────────────
  // Blooms in sync with the arrival spring, centered at the final resting position
  const bloomRadius = 420 + glowIntensity * 160;
  const bloomOpacity = glowIntensity * 0.55;
  const bloomCenterX = width / 2;
  const bloomCenterY = finalY;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        overflow: 'hidden',
        fontFamily: circularFamily,
      }}
    >
      {/* ── Radial green bloom on background ──────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: bloomCenterY - bloomRadius,
          left: bloomCenterX - bloomRadius,
          width: bloomRadius * 2,
          height: bloomRadius * 2,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(62, 207, 142, ${0.18 * bloomOpacity}) 0%, rgba(62, 207, 142, ${0.06 * bloomOpacity}) 55%, transparent 80%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Wider, softer secondary bloom layer */}
      <div
        style={{
          position: 'absolute',
          top: bloomCenterY - bloomRadius * 1.6,
          left: bloomCenterX - bloomRadius * 1.6,
          width: bloomRadius * 3.2,
          height: bloomRadius * 3.2,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(62, 207, 142, ${0.06 * glowIntensity}) 0%, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />

      {/* ── Rising logo + text group ───────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: groupTop,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: LOGO_TEXT_GAP,
          opacity,
          transform: `translateY(${translateY}px)`,
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: LOGO_SIZE,
            height: LOGO_SIZE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            filter: [
              `drop-shadow(0 0 ${28 + glowIntensity * 32}px rgba(62, 207, 142, ${0.35 + glowIntensity * 0.3}))`,
              `drop-shadow(0 0 ${8 + glowIntensity * 12}px rgba(62, 207, 142, ${0.55 + glowIntensity * 0.2}))`,
              `drop-shadow(0 ${16 + glowIntensity * 8}px ${40 + glowIntensity * 20}px rgba(62, 207, 142, ${0.25 * glowIntensity}))`,
            ].join(' '),
          }}
        >
          <Img
            src={staticFile('SupabaseIcon.png')}
            style={{
              width: LOGO_SIZE,
              height: LOGO_SIZE,
              objectFit: 'contain',
            }}
          />
        </div>

        {/* Text */}
        <div
          style={{
            fontSize: 120,
            fontWeight: 700,
            fontFamily: circularFamily,
            color: 'rgba(255, 255, 255, 0.95)',
            lineHeight: 1,
            letterSpacing: -2,
            textShadow: [
              `0 0 ${40 + glowIntensity * 40}px rgba(62, 207, 142, ${0.22 * glowIntensity})`,
              `0 0 ${100 + glowIntensity * 80}px rgba(62, 207, 142, ${0.1 * glowIntensity})`,
              `0 ${4 + glowIntensity * 2}px ${24 + glowIntensity * 16}px rgba(0, 0, 0, 0.6)`,
            ].join(', '),
          }}
        >
          Supabase
        </div>
      </div>
    </AbsoluteFill>
  );
};
