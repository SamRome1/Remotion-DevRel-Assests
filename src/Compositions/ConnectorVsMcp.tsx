import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';

// ─── Canvas ──────────────────────────────────────────────────────────────────
const W = 1080;
const H = 1080;

// ─── Palette ─────────────────────────────────────────────────────────────────
const EMERALD     = '#10b981';
const PURPLE      = '#8b5cf6';
const BG_COLOR    = '#0f1117';

// ─── Intro geometry (frames 0–90) ────────────────────────────────────────────
const INTRO_END   = 90;
const BOX_W       = 460;
const BOX_H       = 340;
const BOX_X       = (W - BOX_W) / 2;       // 310
const BOX_Y       = (H - BOX_H) / 2;       // 370
const LID_W       = BOX_W + 20;
const LID_H       = 72;
const MCP_MINI_W  = 380;
const MCP_MINI_H  = 190;

// ─── Card geometry ───────────────────────────────────────────────────────────
// Two cards side by side: 2×500 + 20px gap + 30px margins = 1080 ✓
const CARD_W    = 500;
const CARD_H    = 420;
const CARD_TOP  = (H - CARD_H) / 2; // 330

const LEFT_CARD_FINAL_X  = 30;
const CENTER_CARD_X      = (W - CARD_W) / 2; // 290 — centered on canvas
const RIGHT_CARD_FINAL_X = 550; // 30 + 500 + 20 gap

// Divider
const DIVIDER_X      = 540;
const DIVIDER_TOP    = 310;
const DIVIDER_BOTTOM = 690;
const DIVIDER_HEIGHT = DIVIDER_BOTTOM - DIVIDER_TOP; // 380

// ─── Helpers ─────────────────────────────────────────────────────────────────
function sp(frame: number, start: number, damping = 14, stiffness = 120, mass = 0.8) {
  return spring({
    frame: frame - start,
    fps: 30,
    config: { damping, stiffness, mass },
  });
}

function fi(frame: number, from: number, to: number, outFrom = 0, outTo = 1) {
  return interpolate(frame, [from, to], [outFrom, outTo], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  label: string;
  color: string;
  frame: number;
  startFrame: number;
}

const Badge: React.FC<BadgeProps> = ({ label, color, frame, startFrame }) => {
  const s = sp(frame, startFrame, 16, 130, 0.75);
  const translateY = interpolate(s, [0, 1], [20, 0]);
  const scale      = interpolate(s, [0, 1], [0.8, 1]);
  const opacity    = fi(frame, startFrame, startFrame + 8);

  return (
    <div
      style={{
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
        width: 280,
        height: 64,
        borderRadius: 100,
        backgroundColor: color === EMERALD
          ? 'rgba(16,185,129,0.12)'
          : 'rgba(139,92,246,0.12)',
        border: `2px solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        fontWeight: 700,
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        letterSpacing: '0.02em',
      }}
    >
      {label}
    </div>
  );
};

// ─── Card ────────────────────────────────────────────────────────────────────
interface CardProps {
  title: string;
  color: string;
  badge1: string;
  badge2: string;
  badge1Frame: number;
  badge2Frame: number;
  frame: number;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({
  title,
  color,
  badge1,
  badge2,
  badge1Frame,
  badge2Frame,
  frame,
  style,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        width: CARD_W,
        height: CARD_H,
        borderRadius: 28,
        backgroundColor: color === EMERALD ? '#0d1f18' : '#130d1f',
        border: `2px solid ${color}`,
        boxShadow: `0 0 80px ${color}22, 0 0 120px ${color}11, inset 0 0 60px ${color}08`,
        backgroundImage: `radial-gradient(ellipse at 50% 0%, ${color}14 0%, transparent 65%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        padding: '40px 36px',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          color,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '0.01em',
          lineHeight: 1,
          filter: `drop-shadow(0 0 24px ${color}66)`,
          textAlign: 'center',
        }}
      >
        {title}
      </div>

      {/* Badges */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        {frame >= badge1Frame && (
          <Badge label={badge1} color={color} frame={frame} startFrame={badge1Frame} />
        )}
        {frame >= badge2Frame && (
          <Badge label={badge2} color={color} frame={frame} startFrame={badge2Frame} />
        )}
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export const ConnectorVsMcp: React.FC = () => {
  const frame = useCurrentFrame();
  useVideoConfig();

  // ── Intro: box + MCP card animation (frames 0–90) ───────────────────────
  const boxSpring      = sp(frame, 0, 16, 140, 0.8);
  const boxScale       = interpolate(boxSpring, [0, 1], [0.75, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const boxOpacity     = fi(frame, 0, 14);
  const cardSlide      = sp(frame, 28, 14, 100, 0.9);
  const cardInsideTop  = interpolate(cardSlide, [0, 1], [-MCP_MINI_H, (BOX_H - MCP_MINI_H) / 2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const lidSpring      = sp(frame, 62, 12, 200, 0.65);
  const lidTop         = interpolate(lidSpring, [0, 1], [-LID_H - 260, -LID_H + 4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const introOpacity   = fi(frame, 78, 90, 1, 0); // fade out intro at the end

  // ── Act 1: Connector center entrance (frames 90–170) ────────────────────
  const connEntranceSpring = sp(frame, 90, 14, 120, 0.8);
  const connEntranceScale   = interpolate(connEntranceSpring, [0, 1], [0.8, 1]);
  const connEntranceOpacity = fi(frame, 90, 102);
  const connEntranceY       = interpolate(connEntranceSpring, [0, 1], [60, 0]);

  // ── Act 1: Connector slides left (frames 170–225) ───────────────────────
  const slideProgress = fi(frame, 175, 225);
  const slideEased = slideProgress < 0.5
    ? 2 * slideProgress * slideProgress
    : 1 - Math.pow(-2 * slideProgress + 2, 2) / 2;

  const connX = interpolate(slideEased, [0, 1], [CENTER_CARD_X, LEFT_CARD_FINAL_X]);
  const connScaleSlide = interpolate(slideEased, [0, 1], [1, 0.88]);

  const connFinalX     = frame < 175 ? CENTER_CARD_X : connX;
  const connFinalScale = frame < 175
    ? connEntranceScale
    : connEntranceScale * connScaleSlide;

  // ── Act 2: MCP entrance (frames 230–310) ────────────────────────────────
  const mcpEntranceSpring  = sp(frame, 230, 14, 120, 0.8);
  const mcpEntranceScale   = interpolate(mcpEntranceSpring, [0, 1], [0.8, 1]);
  const mcpEntranceOpacity = fi(frame, 230, 242);
  const mcpEntranceY       = interpolate(mcpEntranceSpring, [0, 1], [60, 0]);
  // After both badges are done (badge2Frame=278), MCP settles to match Connector's 0.88 scale
  const mcpSettleScale     = fi(frame, 290, 318, 1, 0.88);
  const mcpFinalScale      = mcpEntranceScale * mcpSettleScale;

  // ── Act 2: Divider draws up (frames 312–358) ─────────────────────────────
  const dividerProgress = fi(frame, 312, 358);
  const dividerHeight   = interpolate(dividerProgress, [0, 1], [0, DIVIDER_HEIGHT]);

  // ── Hold: ambient pulse on cards (frames 360–390) ────────────────────────
  const pulseSine     = Math.sin((frame / 30) * Math.PI * 1.2) * 0.5 + 0.5;
  const connGlowExtra = frame >= 360 ? pulseSine * 30 : 0;
  const mcpGlowExtra  = frame >= 360 ? (1 - pulseSine) * 30 : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG_COLOR,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Dot grid background */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.03) 1.5px, transparent 1.5px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }}
      />

      {/* ── INTRO: MCP card going into a box ──────────────────────────────── */}
      {frame < INTRO_END && (
        <div style={{ position: 'absolute', left: BOX_X, top: BOX_Y, opacity: introOpacity }}>
          {/* Box body — overflow:hidden clips the card as it slides in */}
          <div
            style={{
              position:     'absolute',
              left:         0,
              top:          0,
              width:        BOX_W,
              height:       BOX_H,
              overflow:     'hidden',
              background:   '#1a1d27',
              border:       `3px solid #4b5568`,
              borderRadius: 16,
              boxShadow:    `0 0 40px rgba(0,0,0,0.5), inset 0 0 30px rgba(255,255,255,0.02)`,
              transform:    `scale(${boxScale})`,
              transformOrigin: 'center center',
              opacity:      boxOpacity,
            }}
          >
            {/* MCP mini-card slides down through the open top */}
            <div
              style={{
                position:     'absolute',
                left:         (BOX_W - MCP_MINI_W) / 2,
                top:          cardInsideTop,
                width:        MCP_MINI_W,
                height:       MCP_MINI_H,
                borderRadius: 14,
                background:   '#1a0d2e',
                border:       `2.5px solid ${PURPLE}`,
                boxShadow:    `0 0 32px ${PURPLE}44`,
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                fontSize:     48,
                fontWeight:   700,
                color:        PURPLE,
                fontFamily:   'system-ui, -apple-system, sans-serif',
                letterSpacing: '0.02em',
                filter:       `drop-shadow(0 0 16px ${PURPLE}88)`,
              }}
            >
              MCP
            </div>
          </div>

          {/* Lid — slides down from above to seal the box */}
          <div
            style={{
              position:     'absolute',
              left:         -10,
              top:          lidTop,
              width:        LID_W,
              height:       LID_H,
              background:   `linear-gradient(180deg, #2a2d3a 0%, #1a1d27 100%)`,
              border:       `3px solid #4b5568`,
              borderRadius: '12px 12px 4px 4px',
              boxShadow:    `0 0 20px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.5)`,
              transform:    `scale(${boxScale})`,
              transformOrigin: 'center bottom',
              opacity:      boxOpacity,
            }}
          />
        </div>
      )}

      {/* ── CONNECTOR CARD ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          left: connFinalX,
          top: CARD_TOP,
          transform: `translateY(${frame < 85 ? connEntranceY : 0}px) scale(${connFinalScale})`,
          transformOrigin: 'center center',
          opacity: connEntranceOpacity,
          boxShadow: `0 0 ${80 + connGlowExtra}px ${EMERALD}22`,
        }}
      >
        <Card
          title="Connector"
          color={EMERALD}
          badge1="Zero Setup"
          badge2="Instant Access"
          badge1Frame={120}
          badge2Frame={142}
          frame={frame}
          style={{ width: CARD_W, height: CARD_H }}
        />
      </div>

      {/* ── MCP CARD ───────────────────────────────────────────────────────── */}
      {frame >= 230 && (
        <div
          style={{
            position: 'absolute',
            left: RIGHT_CARD_FINAL_X,
            top: CARD_TOP,
            transform: `translateY(${mcpEntranceY}px) scale(${mcpFinalScale})`,
            transformOrigin: 'center center',
            opacity: mcpEntranceOpacity,
            boxShadow: `0 0 ${80 + mcpGlowExtra}px ${PURPLE}22`,
          }}
        >
          <Card
            title="MCP"
            color={PURPLE}
            badge1="Full Control"
            badge2="Works Your Way"
            badge1Frame={255}
            badge2Frame={278}
            frame={frame}
            style={{ width: CARD_W, height: CARD_H }}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
