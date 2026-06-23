import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
} from 'remotion';
import { BG, MONO, DotGrid } from '../tokens';
import { circularFamily } from '../fonts';

// ── SVG logos ─────────────────────────────────────────────────────────────────

const GeminiLogo = () => (
  <svg width={110} height={110} viewBox="0 0 80 80" fill="none">
    <path
      d="M40 4 C40 4 36 28 4 40 C36 40 40 76 40 76 C40 76 44 40 76 40 C44 40 40 4 40 4Z"
      fill="url(#gemini-grad)"
    />
    <defs>
      <linearGradient id="gemini-grad" x1="4" y1="4" x2="76" y2="76" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4285F4" />
        <stop offset="50%" stopColor="#9B72CB" />
        <stop offset="100%" stopColor="#EA4335" />
      </linearGradient>
    </defs>
  </svg>
);

const MetaLogo = () => (
  <svg width={130} height={72} viewBox="0 0 80 44" fill="none">
    <path
      d="M7.5 22C7.5 30 12 37 20 37C26 37 31 32 35 25.5L40 18L45 25.5C49 32 54 37 60 37C68 37 72.5 30 72.5 22C72.5 14 68 7 60 7C54 7 49 12 45 18.5L40 26L35 18.5C31 12 26 7 20 7C12 7 7.5 14 7.5 22Z"
      stroke="url(#meta-grad)"
      strokeWidth="5"
      strokeLinecap="round"
      fill="none"
    />
    <defs>
      <linearGradient id="meta-grad" x1="7" y1="7" x2="73" y2="37" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0082FB" />
        <stop offset="100%" stopColor="#00C6FF" />
      </linearGradient>
    </defs>
  </svg>
);

const MistralLogo = () => (
  <svg width={110} height={86} viewBox="0 0 72 56" fill="none">
    <rect x="0"  y="0"  width="20" height="20" rx="2" fill="#FF6B35" />
    <rect x="26" y="0"  width="20" height="20" rx="2" fill="#FF6B35" />
    <rect x="52" y="0"  width="20" height="20" rx="2" fill="#FF6B35" />
    <rect x="0"  y="26" width="20" height="20" rx="2" fill="#FF6B35" opacity="0.7" />
    <rect x="26" y="26" width="20" height="20" rx="2" fill="#FF6B35" opacity="0.7" />
    <rect x="52" y="26" width="20" height="20" rx="2" fill="#FF6B35" opacity="0.4" />
  </svg>
);

const GrokLogo = () => (
  <svg width={110} height={110} viewBox="0 0 72 72" fill="none">
    <path d="M10 10 L62 62 M62 10 L10 62" stroke="white" strokeWidth="7" strokeLinecap="round" />
  </svg>
);

const PerplexityLogo = () => (
  <svg width={110} height={110} viewBox="0 0 72 72" fill="none">
    <line x1="36" y1="4"  x2="36" y2="68" stroke="#20B2AA" strokeWidth="5" strokeLinecap="round" />
    <line x1="4"  y1="36" x2="68" y2="36" stroke="#20B2AA" strokeWidth="5" strokeLinecap="round" />
    <line x1="12" y1="12" x2="60" y2="60" stroke="#20B2AA" strokeWidth="5" strokeLinecap="round" />
    <line x1="60" y1="12" x2="12" y2="60" stroke="#20B2AA" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

// ── Fan arc positions ─────────────────────────────────────────────────────────
// Origin: (640, 1160), radius: 660. 7 logos at angles -45° to +45° from vertical.
// x = 640 + R*sin(θ),  y = 1160 - R*cos(θ)

const ARC_ORIGIN_X = 640;
const ARC_ORIGIN_Y = 1160;
const ARC_RADIUS   = 660;

function arcPos(angleDeg: number) {
  const r = (angleDeg * Math.PI) / 180;
  return {
    x: ARC_ORIGIN_X + ARC_RADIUS * Math.sin(r),
    y: ARC_ORIGIN_Y - ARC_RADIUS * Math.cos(r),
  };
}

// 7 logos spread evenly from -45° to +45°
const ARC_ANGLES = [-45, -30, -15, 0, 15, 30, 45];

const COMPANIES = [
  {
    name: 'OpenAI',
    glowColor: 'rgba(255,255,255,0.4)',
    logo: () => <img src={staticFile('chatgpt.png')} style={{ width: 110, height: 110, objectFit: 'contain' }} />,
    ...arcPos(ARC_ANGLES[0]),
  },
  {
    name: 'Gemini',
    glowColor: 'rgba(66,133,244,0.5)',
    logo: () => <GeminiLogo />,
    ...arcPos(ARC_ANGLES[1]),
  },
  {
    name: 'Meta AI',
    glowColor: 'rgba(0,130,251,0.5)',
    logo: () => <MetaLogo />,
    ...arcPos(ARC_ANGLES[2]),
  },
  {
    name: 'Claude',
    glowColor: 'rgba(212,169,106,0.5)',
    logo: () => <img src={staticFile('claudelogo.png')} style={{ width: 110, height: 110, objectFit: 'contain' }} />,
    ...arcPos(ARC_ANGLES[3]),
  },
  {
    name: 'Mistral',
    glowColor: 'rgba(255,107,53,0.5)',
    logo: () => <MistralLogo />,
    ...arcPos(ARC_ANGLES[4]),
  },
  {
    name: 'Grok',
    glowColor: 'rgba(255,255,255,0.35)',
    logo: () => <GrokLogo />,
    ...arcPos(ARC_ANGLES[5]),
  },
  {
    name: 'Perplexity',
    glowColor: 'rgba(32,178,170,0.5)',
    logo: () => <PerplexityLogo />,
    ...arcPos(ARC_ANGLES[6]),
  },
];

const MYSTERY_POS = { x: 640, y: 260 };

// ── Timing ────────────────────────────────────────────────────────────────────
const STAGGER        = 10;  // frames between each logo
const MYSTERY_FRAME  = COMPANIES.length * STAGGER + 20;

export const AIRace: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mysteryOpacity = interpolate(frame, [MYSTERY_FRAME, MYSTERY_FRAME + 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', fontFamily: circularFamily }}>
      <DotGrid />

      {/* ── Known company logos fanning out ──────────────────────────────────── */}
      {COMPANIES.map((company, i) => {
        const startFrame = i * STAGGER;
        const progress = spring({
          frame: frame - startFrame,
          fps,
          config: { damping: 16, stiffness: 140 },
        });

        // Translate from fan origin to final arc position
        const dx = interpolate(progress, [0, 1], [ARC_ORIGIN_X - company.x, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const dy = interpolate(progress, [0, 1], [ARC_ORIGIN_Y - company.y, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const opacity = interpolate(progress, [0, 0.2, 1], [0, 1, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const LogoEl = company.logo;

        return (
          <div
            key={company.name}
            style={{
              position: 'absolute',
              left: company.x,
              top: company.y,
              transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`,
              opacity,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                filter: `drop-shadow(0 0 18px ${company.glowColor}) drop-shadow(0 0 6px ${company.glowColor})`,
              }}
            >
              <LogoEl />
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 13,
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: 2,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              {company.name}
            </div>
          </div>
        );
      })}

      {/* ── Mystery ? — top center, fades in ────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          left: MYSTERY_POS.x,
          top: MYSTERY_POS.y,
          transform: 'translate(-50%, -50%)',
          opacity: mysteryOpacity,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: 180,
            fontWeight: 800,
            color: 'rgba(255,255,255,0.55)',
            fontFamily: circularFamily,
            lineHeight: 1,
            filter: 'drop-shadow(0 0 40px rgba(255,255,255,0.4)) drop-shadow(0 0 80px rgba(255,255,255,0.2))',
          }}
        >
          ?
        </span>
      </div>
    </AbsoluteFill>
  );
};
