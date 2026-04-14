import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
} from 'remotion';
import { loadFont, fontFamily } from '@remotion/google-fonts/Inter';

loadFont('normal', { weights: ['400', '600', '700', '800', '900'] });

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG             = '#0f1117';
const NOTION_BG      = '#191919';
const LINEAR_BG      = '#5E6AD2';
const SUPABASE_BG    = '#1C1C1C';
const SUPABASE_GREEN = '#3ECF8E';
const FG             = 'rgba(255,255,255,0.92)';

// ─── Canvas ───────────────────────────────────────────────────────────────────
const W = 1080;
const H = 1080;

// ─── Card geometry (3 cards side by side in square canvas) ───────────────────
const PANEL_H      = 380;   // tech panel height (must come before CARD_TOP calc)
const CARD_W       = 310;
const CARD_H       = 340;   // face height: logo + connect button
const CARD_GAP     = 20;
const CARD_TOP     = Math.round((H - CARD_H - PANEL_H) / 2); // 180 — vertical center when expanded

const CARDS_MARGIN = Math.round((W - 3 * CARD_W - 2 * CARD_GAP) / 2); // ~55
const CARD_LEFTS = [
  CARDS_MARGIN,
  CARDS_MARGIN + CARD_W + CARD_GAP,
  CARDS_MARGIN + 2 * (CARD_W + CARD_GAP),
];

// ─── Brand data ───────────────────────────────────────────────────────────────
interface Brand {
  logoSrc: string;
  logoBg?: string;   // optional bg behind the logo if the image has transparency issues
  cardBg: string;
  accent: string;
  glowColor: string;
  nodeAccent: string;
}

const BRANDS: Brand[] = [
  {
    logoSrc:    staticFile('notion.webp'),
    cardBg:     NOTION_BG,
    accent:     'rgba(255,255,255,0.25)',
    glowColor:  'rgba(255,255,255,0.18)',
    nodeAccent: '#888',
  },
  {
    logoSrc:    staticFile('linear.jpeg'),
    cardBg:     LINEAR_BG,
    accent:     'rgba(130,148,255,0.55)',
    glowColor:  'rgba(94,106,210,0.45)',
    nodeAccent: '#a0aaff',
  },
  {
    logoSrc:    staticFile('SupabaseIcon.png'),
    cardBg:     SUPABASE_BG,
    accent:     `${SUPABASE_GREEN}55`,
    glowColor:  `${SUPABASE_GREEN}30`,
    nodeAccent: SUPABASE_GREEN,
  },
];

// ─── Timeline (30fps, 300 frames = 10s) ───────────────────────────────────────
// Scene 1: cards arrive, staggered (frames 0-89)
const T_CARD_0      = 0;
const T_CARD_1      = 22;
const T_CARD_2      = 44;
const T_CARD_STARTS = [T_CARD_0, T_CARD_1, T_CARD_2];

// Scene 2: tech panels expand (frames 90-179)
const T_PANEL_START = 95;
const T_PANEL_STAGGER = 18;

// Scene 3: panels collapse, connect button appears (frames 180-239)
const T_COLLAPSE    = 185;
const T_BTN_START   = 195;

// Scene 4: reveal / hold with pulse (frames 240-299)
const T_DIVIDER     = 242;
const T_PULSE_START = 260;

// Pop-down button: appears below each card after its panel collapses
const T_POP_BTN = 220;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function clamp(v: number): { extrapolateLeft: 'clamp'; extrapolateRight: 'clamp' } {
  return { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
}

function fi(frame: number, a: number, b: number) {
  return interpolate(frame, [a, b], [0, 1], clamp(0));
}

function sp(frame: number, start: number, damping = 14, stiffness = 140, mass = 0.7) {
  return spring({
    frame: frame - start,
    fps: 30,
    config: { damping, stiffness, mass },
  });
}

// ─── Tech node cluster (circuit board aesthetic) ──────────────────────────────
// Node x scaled to fit within 310px card width (~0.52x of 575px layout)
const NODE_CONFIGS = [
  { x: 27,  y: 90,  w: 54, h: 54, isLock: false },
  { x: 77,  y: 60,  w: 44, h: 44, isLock: false },
  { x: 131, y: 106, w: 50, h: 50, isLock: true  },
  { x: 177, y: 75,  w: 48, h: 48, isLock: false },
  { x: 220, y: 120, w: 42, h: 42, isLock: false },
  { x: 254, y: 82,  w: 52, h: 52, isLock: false },
] as const;

const WIRE_PATHS = [
  'M 55 117 L 77 82',
  'M 100 82 L 131 131',
  'M 157 131 L 177 99',
  'M 202 99 L 220 141',
  'M 242 141 L 254 108',
  'M 41 117 L 41 210 L 131 210 L 131 156',
  'M 189 99 L 189 210 L 220 210 L 220 141',
] as const;

// Lock icon path (padlock SVG)
const LOCK_PATH = 'M10 14v-3a6 6 0 1 1 12 0v3m-1 8H9a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2z';

// Plug/chain icon path for the connect button (two-link chain)
const PLUG_PATH = 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71';

// ─── Tech Panel component ─────────────────────────────────────────────────────
function TechPanel({
  progress,
  nodeAccent,
  lineAccent,
}: {
  progress: number;
  nodeAccent: string;
  lineAccent: string;
}) {
  const panelHeight = PANEL_H * progress;
  const opacity = progress;

  return (
    <div style={{
      position: 'absolute',
      left: 0,
      bottom: 0,
      width: CARD_W,
      height: PANEL_H,
      overflow: 'hidden',
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
    }}>
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: CARD_W,
        height: panelHeight,
        backgroundColor: '#111520',
        borderTop: `1.5px solid rgba(255,255,255,0.07)`,
        overflow: 'hidden',
        opacity,
      }}>
        {/* SVG circuit board wiring */}
        <svg
          width={CARD_W}
          height={PANEL_H}
          viewBox={`0 0 ${CARD_W} ${PANEL_H}`}
          style={{ position: 'absolute', inset: 0 }}
        >
          {/* Background dim nodes */}
          {NODE_CONFIGS.map((node, i) => (
            <rect
              key={i}
              x={node.x}
              y={node.y}
              width={node.w}
              height={node.h}
              rx={8}
              fill="#1e2236"
              stroke={node.isLock ? nodeAccent + '80' : 'rgba(255,255,255,0.08)'}
              strokeWidth={node.isLock ? 1.5 : 1}
            />
          ))}

          {/* Connecting wires */}
          {WIRE_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              stroke={i % 2 === 0 ? lineAccent + '55' : 'rgba(255,255,255,0.1)'}
              strokeWidth={1.5}
              fill="none"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
          ))}

          {/* Lock icon in the "isLock" node */}
          {NODE_CONFIGS.map((node, i) =>
            node.isLock ? (
              <g key={`lock-${i}`} transform={`translate(${node.x + node.w / 2 - 12}, ${node.y + node.h / 2 - 12})`}>
                <path
                  d={LOCK_PATH}
                  stroke={nodeAccent}
                  strokeWidth={1.8}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="scale(0.95)"
                />
              </g>
            ) : null
          )}

          {/* Small accent dots at wire intersections */}
          {[
            { x: 134, y: 87,  color: lineAccent },
            { x: 460, y: 98,  color: lineAccent },
            { x: 580, y: 101, color: 'rgba(255,255,255,0.25)' },
          ].map((dot, i) => (
            <circle key={i} cx={dot.x} cy={dot.y} r={3.5} fill={dot.color} />
          ))}
        </svg>
      </div>
    </div>
  );
}

// ─── Connect button icon ──────────────────────────────────────────────────────
function ConnectIcon({ color, scale = 1 }: { color: string; scale?: number }) {
  return (
    <div style={{
      width: 80 * scale,
      height: 80 * scale,
      borderRadius: 20 * scale,
      backgroundColor: 'rgba(255,255,255,0.96)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 4px 24px ${color}50, 0 0 0 1.5px rgba(255,255,255,0.3)`,
      flexShrink: 0,
    }}>
      <svg
        width={44 * scale}
        height={44 * scale}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={PLUG_PATH} />
      </svg>
    </div>
  );
}

// ─── Single brand card ────────────────────────────────────────────────────────
function BrandCard({
  brand,
  cardLeft,
  frame,
  cardEnterStart,
  panelStart,
  collapseStart,
  btnStart,
  dividerStart,
  pulseStart,
  popBtnStart,
  index,
}: {
  brand: Brand;
  cardLeft: number;
  frame: number;
  cardEnterStart: number;
  panelStart: number;
  collapseStart: number;
  btnStart: number;
  dividerStart: number;
  pulseStart: number;
  popBtnStart: number;
  index: number;
}) {
  // ── Card slide-in from top ─────────────────────────────────────────────────
  const cardSpring = sp(frame, cardEnterStart, 16, 150, 0.8);
  const slideY     = interpolate(cardSpring, [0, 1], [-(CARD_H + PANEL_H + CARD_TOP + 40), 0], clamp(0));
  const cardOpacity = fi(frame, cardEnterStart, cardEnterStart + 12);

  // ── Glow appears after card settles (after ~20 extra frames) ──────────────
  const glowOpacity = fi(frame, cardEnterStart + 25, cardEnterStart + 45);

  // ── Tech panel expand ─────────────────────────────────────────────────────
  const panelProgress = fi(frame, panelStart, panelStart + 35);

  // ── Panel collapse (Scene 3) ───────────────────────────────────────────────
  // collapseProgress: 0 = panel visible, 1 = panel gone
  const collapseProgress = fi(frame, collapseStart, collapseStart + 28);
  const panelVisible     = panelProgress * (1 - collapseProgress);

  // ── Connect button appears ─────────────────────────────────────────────────
  const btnSpring  = sp(frame, btnStart, 18, 160, 0.6);
  const btnOpacity = fi(frame, btnStart, btnStart + 18);
  const btnScale   = interpolate(btnSpring, [0, 1], [0.4, 1], clamp(0));

  // ── Divider line draws across ─────────────────────────────────────────────
  const dividerProgress = fi(frame, dividerStart, dividerStart + 25);

  // ── Button pulse (Scene 4) ────────────────────────────────────────────────
  const PULSE_PERIOD = 75;
  const pulseT       = frame >= pulseStart ? ((frame - pulseStart + index * 20) % PULSE_PERIOD) / PULSE_PERIOD : 0;
  const pulseScale   = frame >= pulseStart
    ? 1 + 0.06 * Math.sin(pulseT * Math.PI * 2)
    : 1;

  // ── Pop-down connect button ────────────────────────────────────────────────
  const popBtnSpring  = sp(frame, popBtnStart, 18, 240, 0.6);
  const popBtnY       = interpolate(popBtnSpring, [0, 1], [-24, 0], clamp(0));
  const popBtnOpacity = fi(frame, popBtnStart, popBtnStart + 10);

  // Height expansion for tech panel: card grows downward
  const extraH = PANEL_H * panelVisible;
  const totalH = CARD_H + extraH;

  // Determine the line accent color per brand
  const lineAccents = ['rgba(255,255,255,0.35)', '#8890ff', SUPABASE_GREEN];
  const lineAccent  = lineAccents[index];

  // Pick an icon color for the connect button from the brand
  const iconColors = ['#191919', LINEAR_BG, SUPABASE_GREEN];
  const iconColor  = iconColors[index];

  return (
    <>
    <div
      style={{
        position: 'absolute',
        left:    cardLeft,
        top:     CARD_TOP + slideY,
        width:   CARD_W,
        height:  totalH,
        opacity: cardOpacity,
        borderRadius: 28,
        overflow: 'hidden',
        boxShadow: [
          `0 0 0 1.5px ${brand.accent}`,
          `0 0 80px ${brand.glowColor}`,
          `0 32px 64px rgba(0,0,0,0.4)`,
          `inset 0 1px 0 rgba(255,255,255,0.06)`,
        ].join(', '),
        transition: 'height 0s',
      }}
    >
      {/* Card background */}
      <div style={{
        position:        'absolute',
        inset:           0,
        backgroundColor: brand.cardBg,
      }} />

      {/* Brand glow overlay */}
      <div style={{
        position:        'absolute',
        inset:           0,
        background:      `radial-gradient(ellipse at 30% 50%, ${brand.glowColor} 0%, transparent 65%)`,
        opacity:         glowOpacity,
        pointerEvents:   'none',
      }} />

      {/* ── Card face: lettermark + connect button row ─────────────────────── */}
      <div style={{
        position:       'absolute',
        left:           0,
        top:            0,
        width:          CARD_W,
        height:         CARD_H,
        display:        'flex',
        alignItems:     'center',
        padding:        '0 20px',
        gap:            16,
        boxSizing:      'border-box',
      }}>
        {/* Logo */}
        <Img
          src={brand.logoSrc}
          style={{
            width:        90,
            height:       90,
            objectFit:    'contain',
            borderRadius: 14,
            flexShrink:   0,
          }}
        />

        {/* Vertical divider (appears with the divider progress) */}
        <div style={{
          width:           2,
          height:          CARD_H * 0.5 * dividerProgress,
          backgroundColor: brand.accent,
          flexShrink:      0,
          borderRadius:    2,
          opacity:         0.7,
        }} />

        {/* Connect button zone */}
        <div style={{
          flex:          1,
          display:       'flex',
          alignItems:    'center',
          justifyContent: 'center',
          opacity:       btnOpacity,
          transform:     `scale(${btnScale * pulseScale})`,
          transformOrigin: 'center center',
        }}>
          <ConnectIcon color={iconColor} scale={0.85} />
        </div>
      </div>

      {/* ── Tech panel ────────────────────────────────────────────────────────── */}
      {panelVisible > 0.01 && (
        <div style={{
          position:  'absolute',
          left:      0,
          top:       CARD_H,
          width:     CARD_W,
          height:    PANEL_H,
          transform: `translateY(${-PANEL_H * (1 - panelVisible)}px)`,
          opacity:   Math.min(panelVisible * 2, 1),
        }}>
          <TechPanel
            progress={1}
            nodeAccent={brand.nodeAccent}
            lineAccent={lineAccent}
          />
        </div>
      )}
    </div>

    {/* ── Pop-down connect button — rendered outside card to avoid clip ─────── */}
    {popBtnOpacity > 0.01 && (
      <div
        style={{
          position:        'absolute',
          left:            cardLeft,
          top:             CARD_TOP + CARD_H + 12,
          width:           CARD_W,
          transform:       `translateY(${popBtnY}px)`,
          opacity:         popBtnOpacity,
          display:         'flex',
          justifyContent:  'center',
        }}
      >
        <div
          style={{
            width:           CARD_W,
            height:          52,
            borderRadius:    12,
            backgroundColor: brand.cardBg,
            border:          `1.5px solid ${brand.accent}`,
            boxShadow:       `0 8px 28px ${brand.glowColor}, 0 0 0 1px rgba(255,255,255,0.05)`,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
          }}
        >
          <span style={{
            fontFamily,
            fontSize:    20,
            fontWeight:  700,
            color:       'rgba(255,255,255,0.92)',
            letterSpacing: '0.04em',
          }}>Connect</span>
        </div>
      </div>
    )}
    </>
  );
}

// ─── Main composition ─────────────────────────────────────────────────────────
export const ConnectButton: React.FC = () => {
  const frame = useCurrentFrame();
  useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', fontFamily }}>

      {/* Dot grid background */}
      <AbsoluteFill style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.028) 1.5px, transparent 1.5px)',
        backgroundSize:  '48px 48px',
        pointerEvents:   'none',
      }} />

      {/* Ambient glow at center */}
      <AbsoluteFill style={{
        background:    'radial-gradient(ellipse 70% 45% at 50% 50%, rgba(94,106,210,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Brand cards */}
      {BRANDS.map((brand, i) => {
        const panelStart    = T_PANEL_START + i * T_PANEL_STAGGER;
        const collapseStart = T_COLLAPSE    + i * 10;
        const btnStart      = T_BTN_START   + i * 12;
        const dividerStart  = T_DIVIDER     + i * 10;
        const popBtnStart   = T_POP_BTN     + i * 12;

        return (
          <BrandCard
            key={i}
            brand={brand}
            cardLeft={CARD_LEFTS[i]}
            frame={frame}
            cardEnterStart={T_CARD_STARTS[i]}
            panelStart={panelStart}
            collapseStart={collapseStart}
            btnStart={btnStart}
            dividerStart={dividerStart}
            pulseStart={T_PULSE_START}
            popBtnStart={popBtnStart}
            index={i}
          />
        );
      })}
    </AbsoluteFill>
  );
};
