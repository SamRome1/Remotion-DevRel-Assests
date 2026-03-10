import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Img, staticFile } from 'remotion';
import { loadFont, fontFamily } from '@remotion/google-fonts/Inter';

loadFont('normal', { weights: ['300', '400', '600', '700'] });

// ── Palette ───────────────────────────────────────────────────────────────────
const GREEN = '#3ecf8e';
const BG    = '#0f0f0f';

// ── Layout (1920 × 1080) ──────────────────────────────────────────────────────
const CX        = 960;  // horizontal center
const CY        = 360;  // logo center y
const LOGO_SIZE = 120;

// Text positions
const TITLE_Y    = CY + LOGO_SIZE / 2 + 52;  // "Optimizing Supabase"
const SUBTITLE_Y = TITLE_Y + 100;             // "for the free tier"

// ── Timing ────────────────────────────────────────────────────────────────────
const T_LOGO     = 28;
const T_FLASH    = 36;
const T_RAYS     = 52;
const T_RING     = 68;
const T_TITLE    = 96;
const T_SUBTITLE = 118;
const T_BEAM     = 136;

// ── Helpers ───────────────────────────────────────────────────────────────────
function easeOut(t: number)   { return 1 - (1 - t) ** 3; }
function easeInOut(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

function itp(
  frame: number, a: number, b: number,
  from = 0, to = 1,
  easing?: (t: number) => number,
) {
  return interpolate(frame, [a, b], [from, to], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing,
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
export const SupabaseIntro: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Logo spring: scale + slight spin ──────────────────────────────────────
  const logoSpring = spring({ frame: frame - T_LOGO, fps: 30,
    config: { damping: 11, stiffness: 105, mass: 1.1 },
  });
  const logoScale  = frame < T_LOGO ? 0.04 : 0.04 + 0.96 * logoSpring;
  const logoRotate = frame < T_LOGO ? 18 : 18 * (1 - Math.min(logoSpring, 1));

  // ── Flash bloom ───────────────────────────────────────────────────────────
  const flashBright = itp(frame, T_LOGO,  T_FLASH,      0, 1, easeOut);
  const flashDim    = itp(frame, T_FLASH, T_FLASH + 22, 1, 0, easeOut);
  const flash       = Math.max(flashBright, 1 - flashDim);
  const steadyGlow  = frame > T_TITLE + 20
    ? 0.10 + 0.03 * Math.sin((frame - T_TITLE - 20) / 22)
    : 0.10;
  const glowRadius  = 12 + flash * 38;
  const glowOpacity = steadyGlow + flash * 0.55;

  // ── Background radial glow ────────────────────────────────────────────────
  const bgGlow = itp(frame, T_LOGO, T_LOGO + 30, 0, 1, easeOut);

  // ── Burst rays ────────────────────────────────────────────────────────────
  const RAYS = Array.from({ length: 8 }, (_, i) => {
    const angle    = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const start    = T_RAYS + i * 3;
    const lenProg  = itp(frame, start, start + 18);
    const fadeProg = itp(frame, start + 15, start + 32);
    const maxLen   = i % 2 === 0 ? 88 : 55;
    return { angle, length: maxLen * lenProg, opacity: lenProg * (1 - fadeProg) };
  });

  // ── Sweep ring ────────────────────────────────────────────────────────────
  const RING_R   = 84;
  const RING_C   = 2 * Math.PI * RING_R;
  const ringProg = itp(frame, T_RING, T_RING + 30, 0, 1, easeInOut);
  const ringFade = itp(frame, T_RING + 32, T_RING + 52, 1, 0);

  // ── Title: "Optimizing Supabase" ──────────────────────────────────────────
  const titleOp    = itp(frame, T_TITLE, T_TITLE + 20, 0, 1, easeOut);
  const titleSlide = itp(frame, T_TITLE, T_TITLE + 24, 34, 0, easeOut);

  // ── Subtitle: "for the free tier" ─────────────────────────────────────────
  const subOp    = itp(frame, T_SUBTITLE, T_SUBTITLE + 20, 0, 1, easeOut);
  const subSlide = itp(frame, T_SUBTITLE, T_SUBTITLE + 22, 22, 0, easeOut);

  // ── Light beam sweep ──────────────────────────────────────────────────────
  const beamProg = itp(frame, T_BEAM, T_BEAM + 42, 0, 1, easeInOut);
  const beamOp   = Math.min(beamProg * 2.5, 1) * Math.min((1 - beamProg) * 2.5, 1);

  const RAY_INNER = LOGO_SIZE / 2 + 10;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden' }}>

      {/* ── Radial background glow ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 55% 50% at ${CX}px ${CY}px,
          rgba(62,207,142,${0.12 * bgGlow + glowOpacity * 0.06}) 0%,
          rgba(62,207,142,${0.04 * bgGlow}) 38%,
          transparent 68%)`,
        pointerEvents: 'none',
      }} />

      {/* ── SVG: rays + sweep ring ── */}
      <svg
        width={1920} height={1080}
        style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
      >
        <defs>
          <linearGradient id="boltGrad" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%"   stopColor="#6ef5b0" />
            <stop offset="100%" stopColor="#28c880" />
          </linearGradient>
        </defs>

        {/* Burst rays */}
        {RAYS.map(({ angle, length, opacity }, i) =>
          opacity > 0 ? (
            <line
              key={i}
              x1={CX + Math.cos(angle) * RAY_INNER}
              y1={CY + Math.sin(angle) * RAY_INNER}
              x2={CX + Math.cos(angle) * (RAY_INNER + length)}
              y2={CY + Math.sin(angle) * (RAY_INNER + length)}
              stroke={GREEN}
              strokeWidth={i % 2 === 0 ? 2 : 1.5}
              strokeLinecap="round"
              opacity={opacity * 0.9}
              style={{ filter: `drop-shadow(0 0 5px ${GREEN}cc)` }}
            />
          ) : null
        )}

        {/* Sweep ring */}
        {ringProg > 0 && (
          <circle
            cx={CX} cy={CY} r={RING_R}
            fill="none"
            stroke={GREEN}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeDasharray={RING_C}
            strokeDashoffset={RING_C * (1 - ringProg)}
            opacity={ringFade * 0.65}
            style={{ filter: `drop-shadow(0 0 6px ${GREEN}99)` }}
          />
        )}
      </svg>

      {/* ── Supabase bolt logo ── */}
      <div style={{
        position: 'absolute',
        left: CX - LOGO_SIZE / 2,
        top:  CY - LOGO_SIZE / 2,
        width: LOGO_SIZE, height: LOGO_SIZE,
        transform: `scale(${logoScale}) rotate(${logoRotate}deg)`,
        filter: `drop-shadow(0 0 ${glowRadius}px rgba(62,207,142,${glowOpacity}))`,
      }}>
        <Img
          src={staticFile('SupabaseIcon.png')}
          style={{ width: LOGO_SIZE, height: LOGO_SIZE, objectFit: 'contain' }}
        />
      </div>

      {/* ── Flash bloom overlay ── */}
      {flash > 0.02 && (
        <div style={{
          position: 'absolute',
          left: CX - 200, top: CY - 200,
          width: 400, height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255,255,255,${flash * 0.18}) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}

      {/* ── "Optimizing Supabase" ── */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        top: TITLE_Y,
        textAlign: 'center',
        opacity: titleOp,
        transform: `translateY(${titleSlide}px)`,
        fontFamily: `${fontFamily}, system-ui, -apple-system, sans-serif`,
        lineHeight: 1.1,
      }}>
        {/* "Optimizing" — strong, white */}
        <span style={{
          fontSize: 84,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.92)',
          letterSpacing: '-0.025em',
        }}>
          Optimizing{' '}
        </span>
        {/* "Supabase" — brand green, slightly heavier */}
        <span style={{
          fontSize: 84,
          fontWeight: 700,
          color: GREEN,
          letterSpacing: '-0.025em',
          textShadow: `0 0 60px rgba(62,207,142,0.35)`,
        }}>
          Supabase
        </span>
      </div>

      {/* ── "for the free tier" ── */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        top: SUBTITLE_Y,
        textAlign: 'center',
        opacity: subOp,
        transform: `translateY(${subSlide}px)`,
        fontFamily: `${fontFamily}, system-ui, -apple-system, sans-serif`,
        fontSize: 30,
        fontWeight: 300,
        color: 'rgba(255,255,255,0.45)',
        letterSpacing: '0.01em',
      }}>
        for the free tier
      </div>

      {/* ── Light beam sweep ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(105deg,
          transparent ${(beamProg * 110) - 12}%,
          rgba(255,255,255,0.045) ${(beamProg * 110) - 6}%,
          rgba(255,255,255,0.07) ${beamProg * 110}%,
          rgba(255,255,255,0.045) ${(beamProg * 110) + 6}%,
          transparent ${(beamProg * 110) + 12}%)`,
        opacity: beamOp,
        pointerEvents: 'none',
      }} />

    </AbsoluteFill>
  );
};
