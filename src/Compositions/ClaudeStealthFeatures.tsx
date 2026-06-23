import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { BG, MONO, FG, FG_LIGHT, FG_MUTED } from '../tokens';
import { circularFamily } from '../fonts';
import { EyeOff, Lock } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// PALETTE — muted, cold classified feel. Not Supabase green.
// ─────────────────────────────────────────────────────────────────────────────
const ACCENT       = '#D97757';        // Claude orange — warm terracotta
const ACCENT_DIM   = 'rgba(217, 119, 87, 0.18)';
const ACCENT_GLOW  = 'rgba(217, 119, 87, 0.22)';
const ACCENT_BORDER = 'rgba(217, 119, 87, 0.28)';
const REDACTED_BG  = '#1a1714';       // warm dark surface to complement orange
const STAMP_COLOR  = 'rgba(217, 119, 87, 0.5)';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const CLAMP = {
  extrapolateLeft:  'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const itp = (
  frame: number,
  startFrame: number,
  endFrame: number,
  from = 0,
  to   = 1,
) => interpolate(frame, [startFrame, endFrame], [from, to], CLAMP);

const sp = (frame: number, delay = 0, cfg = { damping: 18, stiffness: 130 }) =>
  spring({ frame: frame - delay, fps: 30, config: cfg });

// ─────────────────────────────────────────────────────────────────────────────
// REDACTED TEXT ROW — a line of "blurred" faux-text blocks
// ─────────────────────────────────────────────────────────────────────────────
const RedactedLine: React.FC<{
  width: string | number;
  height?: number;
  blur: number;
  opacity?: number;
}> = ({ width, height = 18, blur, opacity = 1 }) => (
  <div
    style={{
      width,
      height,
      borderRadius: 4,
      backgroundColor: 'rgba(255,255,255,0.55)',
      filter: `blur(${blur}px)`,
      opacity,
      flexShrink: 0,
    }}
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE CARD
// ─────────────────────────────────────────────────────────────────────────────
interface CardProps {
  index: number;      // 0, 1, 2
  enterFrame: number;
  frame: number;
  blurAmount: number; // animated from outside
  cardWidth: number;
}

const FeatureCard: React.FC<CardProps> = ({
  index,
  enterFrame,
  frame,
  blurAmount,
  cardWidth,
}) => {
  const enterProgress = sp(frame, enterFrame);
  const slideY = interpolate(enterProgress, [0, 1], [60, 0], CLAMP);
  const opacity = itp(frame, enterFrame, enterFrame + 20);

  const label = `FEATURE 0${index + 1}`;

  // Three rows of redacted content with varied widths
  const rowWidths = [
    ['72%', '55%', '40%'],
    ['80%', '62%', '30%'],
    ['68%', '75%', '45%'],
  ][index];

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${slideY}px)`,
        background: REDACTED_BG,
        border: `1px solid ${ACCENT_BORDER}`,
        borderRadius: 20,
        padding: '40px 48px',
        boxShadow: `0 0 40px ${ACCENT_GLOW}, 0 12px 40px rgba(0,0,0,0.6)`,
        width: cardWidth,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Corner stamp — "CLASSIFIED" feel */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 20,
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: 3,
          color: STAMP_COLOR,
          fontWeight: 600,
          textTransform: 'uppercase',
        }}
      >
        ███ REDACTED
      </div>

      {/* Feature label */}
      <div
        style={{
          fontFamily: MONO,
          fontSize: 34,
          letterSpacing: 4,
          color: ACCENT,
          fontWeight: 700,
          textTransform: 'uppercase',
          marginBottom: 28,
        }}
      >
        {label}
      </div>

      {/* Redacted title — wide single thick bar */}
      <RedactedLine
        width="85%"
        height={36}
        blur={blurAmount}
        opacity={0.75}
      />

      {/* Redacted description lines */}
      <div
        style={{
          marginTop: 18,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {rowWidths.map((w, i) => (
          <RedactedLine
            key={i}
            width={w}
            height={18}
            blur={blurAmount}
            opacity={0.45}
          />
        ))}
      </div>

      {/* Eye-off icon — faint, bottom right */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 24,
          opacity: 0.2,
        }}
      >
        <EyeOff
          size={20}
          color={ACCENT}
          strokeWidth={1.5}
        />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPOSITION
// ─────────────────────────────────────────────────────────────────────────────
export const ClaudeStealthFeatures: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  // ── Global fade in/out ──────────────────────────────────────────────────────
  const globalFadeIn  = itp(frame, 0, 12);
  const globalFadeOut = itp(frame, 450, 475, 1, 0);
  const globalOpacity = Math.min(globalFadeIn, globalFadeOut);

  // ── Opening text ────────────────────────────────────────────────────────────
  // Line 1: "Claude just shipped 3 features."
  const line1Opacity = itp(frame, 8, 30);
  const line1Y       = interpolate(itp(frame, 8, 28), [0, 1], [14, 0], CLAMP);

  // Line 2: "and said nothing."
  const line2Opacity = itp(frame, 38, 58);
  const line2Y       = interpolate(itp(frame, 38, 56), [0, 1], [14, 0], CLAMP);

  // ── Cards ───────────────────────────────────────────────────────────────────
  const CARD_ENTER = [80, 100, 120] as const;

  // ── Glitch / blur flicker ───────────────────────────────────────────────────
  // Each card briefly drops blur at slightly staggered times
  // Glitch is a brief window where blur dips toward 0 then snaps back
  const computeBlur = (cardIdx: number): number => {
    const BASE_BLUR = 12;
    // Each card glitches at a different frame
    const glitchCenters = [195, 210, 203] as const;
    const gc = glitchCenters[cardIdx];
    const GLITCH_HALF = 8; // frames each side of center

    if (frame >= gc - GLITCH_HALF && frame <= gc + GLITCH_HALF) {
      const t = (frame - (gc - GLITCH_HALF)) / (GLITCH_HALF * 2);
      // Sharp dip in the middle: sin curve peaks at 0 then comes back
      const dip = Math.sin(t * Math.PI); // 0 → 1 → 0
      // Blur goes from BASE down to 1.5 at peak, then back up
      return interpolate(dip, [0, 1], [BASE_BLUR, 1.5], CLAMP);
    }
    return BASE_BLUR;
  };

  // ── Closing section ─────────────────────────────────────────────────────────
  const CLOSE_START = 265;
  const closeIconProgress = sp(frame, CLOSE_START);
  const closeIconY        = interpolate(closeIconProgress, [0, 1], [20, 0], CLAMP);
  const closeIconOpacity  = itp(frame, CLOSE_START, CLOSE_START + 18);

  const closeTextOpacity = itp(frame, CLOSE_START + 20, CLOSE_START + 38);
  const closeTextY       = interpolate(itp(frame, CLOSE_START + 20, CLOSE_START + 38), [0, 1], [12, 0], CLAMP);

  const closeSubOpacity = itp(frame, CLOSE_START + 45, CLOSE_START + 60);

  // ── Layout ──────────────────────────────────────────────────────────────────
  const cardWidth = width - 120; // 960px at 1080 wide
  const horizontalPad = (width - cardWidth) / 2;

  // Ambient vignette glow at center
  const ambientPulse = (Math.sin((frame / 30) * Math.PI * 0.4) + 1) / 2;
  const ambientOpacity = 0.04 + ambientPulse * 0.025;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        overflow: 'hidden',
        fontFamily: circularFamily,
        opacity: globalOpacity,
      }}
    >
      {/* Ambient radial glow — centered, very subtle */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(217,119,87,${ambientOpacity.toFixed(3)}) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Dot grid — faint */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1.5px, transparent 1.5px)',
          backgroundSize: '36px 36px',
          pointerEvents: 'none',
        }}
      />

      {/* ── OPENING TEXT block ── */}
      <div
        style={{
          position: 'absolute',
          top: 148,
          left: horizontalPad,
          width: cardWidth,
        }}
      >
        {/* Pre-label */}
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: 3,
            color: ACCENT,
            textTransform: 'uppercase',
            marginBottom: 22,
            opacity: line1Opacity,
          }}
        >
          · · · LEAKED INTEL · · ·
        </div>

        {/* Line 1 */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: FG,
            lineHeight: 1.05,
            opacity: line1Opacity,
            transform: `translateY(${line1Y}px)`,
          }}
        >
          Claude just shipped
          <br />
          3 features.
        </div>

        {/* Line 2 — punch word */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: ACCENT,
            lineHeight: 1.0,
            marginTop: 16,
            opacity: line2Opacity,
            transform: `translateY(${line2Y}px)`,
            letterSpacing: -1,
          }}
        >
          Silently.
        </div>
      </div>

      {/* ── FEATURE CARDS ── */}
      <div
        style={{
          position: 'absolute',
          top: 550,
          left: horizontalPad,
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
        }}
      >
        {([0, 1, 2] as const).map((idx) => (
          <FeatureCard
            key={idx}
            index={idx}
            enterFrame={CARD_ENTER[idx]}
            frame={frame}
            blurAmount={computeBlur(idx)}
            cardWidth={cardWidth}
          />
        ))}
      </div>

      {/* ── CLOSING SECTION ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 130,
          left: horizontalPad,
          width: cardWidth,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {/* Lock icon */}
        <div
          style={{
            opacity: closeIconOpacity,
            transform: `translateY(${closeIconY}px)`,
            background: ACCENT_DIM,
            border: `1px solid ${ACCENT_BORDER}`,
            borderRadius: 999,
            width: 64,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 28px ${ACCENT_GLOW}`,
          }}
        >
          <Lock
            size={28}
            color={ACCENT}
            strokeWidth={1.5}
          />
        </div>

        {/* "Find out soon." */}
        <div
          style={{
            fontSize: 42,
            fontWeight: 700,
            color: FG,
            textAlign: 'center',
            opacity: closeTextOpacity,
            transform: `translateY(${closeTextY}px)`,
          }}
        >
          Find out soon.
        </div>

        {/* Sub-line */}
        <div
          style={{
            fontSize: 20,
            fontWeight: 400,
            color: FG_LIGHT,
            textAlign: 'center',
            opacity: closeSubOpacity,
            letterSpacing: 0.5,
          }}
        >
          if they let it slip.
        </div>
      </div>
    </AbsoluteFill>
  );
};
