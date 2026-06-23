import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion';

// ─── Constants ────────────────────────────────────────────────────────────────

const BG = '#0d1117';
const GREEN = '#3ECF8E';
const WHITE = '#ffffff';
const RED = '#FF5555';

const CX = 540; // canvas center x (1080 wide)

// Scene 1 timing
const S1_COUNT_START = 0;
const S1_COUNT_END = 50;
const S1_SLASH_START = 55;
const S1_SLASH_END = 90;
const S1_GREEN_SLIDE_START = 80;
const S1_GREEN_COUNT_START = 85;
const S1_GREEN_COUNT_END = 140;
const S1_ARROW_START = 90;

// Scene 2 timing
const S2_START = 150;
const S2_WIPE_END = 165;
const S2_LEFT_CARD_START = 160;
const S2_LEFT_CARD_END = 190;
const S2_LEFT_COUNT_START = 175;
const S2_LEFT_COUNT_END = 210;
const S2_RIGHT_CARD_START = 200;
const S2_RIGHT_CARD_END = 230;
const S2_RIGHT_COUNT_START = 215;
const S2_RIGHT_COUNT_END = 270;
const S2_EQUALS_START = 270;

// Card geometry
const CARD_W = 440;
const CARD_H = 560;
const LEFT_CX = 270;
const RIGHT_CX = 810;
const CARD_CY = 860; // vertical center of both cards

// ─── Helpers ─────────────────────────────────────────────────────────────────

function countUp(frame: number, start: number, end: number, target: number): number {
  return Math.round(
    interpolate(frame, [start, end], [0, target], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
}

function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

// ─── Background grid ─────────────────────────────────────────────────────────

const BackgroundGrid: React.FC = () => (
  <svg
    width={1080}
    height={1920}
    style={{ position: 'absolute', top: 0, left: 0 }}
    viewBox="0 0 1080 1920"
  >
    <defs>
      <pattern id="dbgrid" width={80} height={80} patternUnits="userSpaceOnUse">
        <path
          d="M 80 0 L 0 0 0 80"
          fill="none"
          stroke="rgba(255,255,255,0.035)"
          strokeWidth={1}
        />
      </pattern>
    </defs>
    <rect width={1080} height={1920} fill="url(#dbgrid)" />
  </svg>
);

// ─── Server Rack Icon ─────────────────────────────────────────────────────────

const ServerRackIcon: React.FC<{
  cx: number;
  cy: number;
  scale?: number;
  color?: string;
}> = ({ cx, cy, scale = 1, color = WHITE }) => {
  const W = 160 * scale;
  const H = 180 * scale;
  const unitH = 40 * scale;
  const rx = 8 * scale;
  const ledR = 5 * scale;
  const x = cx - W / 2;
  const y = cy - H / 2;

  return (
    <g>
      {/* Outer chassis */}
      <rect
        x={x}
        y={y}
        width={W}
        height={H}
        rx={rx}
        fill="rgba(255,255,255,0.04)"
        stroke={`${color}55`}
        strokeWidth={2 * scale}
      />
      {/* Three rack units */}
      {[0, 1, 2].map((i) => {
        const uy = y + 18 * scale + i * (unitH + 8 * scale);
        const ledColor = i === 0 ? GREEN : `${color}88`;
        return (
          <g key={i}>
            <rect
              x={x + 10 * scale}
              y={uy}
              width={W - 20 * scale}
              height={unitH}
              rx={4 * scale}
              fill="rgba(255,255,255,0.07)"
              stroke={`${color}33`}
              strokeWidth={1.5 * scale}
            />
            {/* LED dots */}
            <circle cx={x + 24 * scale} cy={uy + unitH / 2} r={ledR} fill={ledColor} opacity={0.9} />
            <circle cx={x + 38 * scale} cy={uy + unitH / 2} r={ledR * 0.7} fill={`${color}55`} />
            {/* Horizontal vent lines */}
            {[0.3, 0.55, 0.7].map((frac, j) => (
              <line
                key={j}
                x1={x + 52 * scale}
                y1={uy + unitH * frac}
                x2={x + W - 16 * scale}
                y2={uy + unitH * frac}
                stroke={`${color}30`}
                strokeWidth={1.5 * scale}
                strokeLinecap="round"
              />
            ))}
          </g>
        );
      })}
    </g>
  );
};

// ─── Scene 1 ──────────────────────────────────────────────────────────────────

const Scene1: React.FC<{ frame: number }> = ({ frame }) => {
  // Receipt card behind the number
  const cardOpacity = interpolate(frame, [0, 20], [0, 0.55], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // $12,000 count up
  const bigCount = countUp(frame, S1_COUNT_START, S1_COUNT_END, 12000);

  // After slash, $12k dims
  const bigOpacity = interpolate(frame, [80, 110], [1, 0.4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Slash stroke animation — dasharray must exceed actual line length (~617px)
  const slashProgress = interpolate(frame, [S1_SLASH_START, S1_SLASH_END], [700, 0], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const slashOpacity = interpolate(frame, [S1_SLASH_START, S1_SLASH_START + 5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // $2,000 slides up
  const greenSlideY = interpolate(frame, [S1_GREEN_SLIDE_START, S1_GREEN_SLIDE_START + 30], [120, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const greenOpacity = interpolate(frame, [S1_GREEN_SLIDE_START, S1_GREEN_SLIDE_START + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const greenCount = countUp(frame, S1_GREEN_COUNT_START, S1_GREEN_COUNT_END, 2000);

  // Down arrow between numbers
  const arrowProgress = interpolate(frame, [S1_ARROW_START, S1_ARROW_START + 25], [0, 60], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const arrowOpacity = interpolate(frame, [S1_ARROW_START, S1_ARROW_START + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Positions: $12k at ~40% of 1920 = y 768; $2k at ~57% = y 1094
  const bigY = 720;
  const greenY = 1060;
  const arrowTopY = bigY + 80;

  return (
    <>
      <svg
        width={1080}
        height={1920}
        style={{ position: 'absolute', top: 0, left: 0 }}
        viewBox="0 0 1080 1920"
      >
        {/* Receipt card background */}
        <g opacity={cardOpacity}>
          <rect
            x={CX - 320}
            y={bigY - 120}
            width={640}
            height={240}
            rx={24}
            fill="rgba(255,255,255,0.04)"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth={1.5}
          />
          {/* Faint horizontal lines on receipt */}
          {[0.35, 0.5, 0.65, 0.8].map((frac, i) => (
            <line
              key={i}
              x1={CX - 280}
              y1={bigY - 120 + 240 * frac}
              x2={CX + 280}
              y2={bigY - 120 + 240 * frac}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth={1.5}
              strokeDasharray="12 6"
            />
          ))}
        </g>

        {/* Slash line over $12k */}
        {frame >= S1_SLASH_START && (
          <line
            x1={CX - 300}
            y1={bigY - 70}
            x2={CX + 300}
            y2={bigY + 70}
            stroke={RED}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray="700"
            strokeDashoffset={slashProgress}
            opacity={slashOpacity}
          />
        )}

        {/* Down arrow */}
        {frame >= S1_ARROW_START && (
          <g opacity={arrowOpacity}>
            <line
              x1={CX}
              y1={arrowTopY}
              x2={CX}
              y2={arrowTopY + arrowProgress}
              stroke={GREEN}
              strokeWidth={6}
              strokeLinecap="round"
            />
            {/* Arrowhead — only show when arrow has grown enough */}
            {arrowProgress > 30 && (
              <polygon
                points={`${CX},${arrowTopY + arrowProgress + 18} ${CX - 18},${arrowTopY + arrowProgress - 8} ${CX + 18},${arrowTopY + arrowProgress - 8}`}
                fill={GREEN}
              />
            )}
          </g>
        )}
      </svg>

      {/* $12,000 number */}
      <div
        style={{
          position: 'absolute',
          top: bigY - 60,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: bigOpacity,
        }}
      >
        <span
          style={{
            color: RED,
            fontSize: 160,
            fontWeight: 800,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            letterSpacing: '-4px',
            lineHeight: 1,
          }}
        >
          ${fmt(bigCount)}
        </span>
      </div>

      {/* $2,000 number */}
      <div
        style={{
          position: 'absolute',
          top: greenY - 70,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: greenOpacity,
          transform: `translateY(${greenSlideY}px)`,
        }}
      >
        <span
          style={{
            color: GREEN,
            fontSize: 160,
            fontWeight: 800,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            letterSpacing: '-4px',
            lineHeight: 1,
          }}
        >
          ${fmt(greenCount)}
        </span>
      </div>
    </>
  );
};

// ─── Scene 2 ──────────────────────────────────────────────────────────────────

const ServerCard: React.FC<{
  cx: number;
  cy: number;
  label: string;
  price: string;
  priceColor: string;
  iconScale: number;
  opacity: number;
  glowColor?: string;
  glowOpacity?: number;
  dimOpacity?: number;
  markType?: 'check' | 'x' | null;
  markOpacity?: number;
}> = ({
  cx,
  cy,
  label,
  price,
  priceColor,
  iconScale,
  opacity,
  glowColor,
  glowOpacity = 0,
  dimOpacity = 1,
  markType = null,
  markOpacity = 0,
}) => {
  const x = cx - CARD_W / 2;
  const y = cy - CARD_H / 2;

  return (
    <g opacity={opacity * dimOpacity}>
      <defs>
        {glowOpacity > 0.01 && glowColor && (
          <filter id={`glow-${label}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="18" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* Green halo behind card */}
      {glowOpacity > 0.01 && glowColor && (
        <rect
          x={x - 20}
          y={y - 20}
          width={CARD_W + 40}
          height={CARD_H + 40}
          rx={32}
          fill="none"
          stroke={glowColor}
          strokeWidth={12}
          opacity={glowOpacity}
          filter={`url(#glow-${label})`}
        />
      )}

      {/* Card body */}
      <rect
        x={x}
        y={y}
        width={CARD_W}
        height={CARD_H}
        rx={24}
        fill="rgba(255,255,255,0.04)"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={1.5}
      />

      {/* Server rack icon */}
      <ServerRackIcon cx={cx} cy={y + 140} scale={iconScale} color={WHITE} />

      {/* Label */}
      <text
        x={cx}
        y={y + 290}
        textAnchor="middle"
        fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        fontSize={36}
        fontWeight={700}
        fill={WHITE}
        letterSpacing="4"
        opacity={0.85}
      >
        {label}
      </text>

      {/* Price */}
      <text
        x={cx}
        y={y + 430}
        textAnchor="middle"
        fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        fontSize={100}
        fontWeight={800}
        fill={priceColor}
        letterSpacing="-2"
      >
        {price}
      </text>

      {/* /mo subscript */}
      <text
        x={cx}
        y={y + 490}
        textAnchor="middle"
        fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        fontSize={32}
        fontWeight={400}
        fill={WHITE}
        opacity={0.4}
      >
        /mo
      </text>

      {/* Checkmark */}
      {markType === 'check' && markOpacity > 0.01 && (
        <g opacity={markOpacity}>
          <circle cx={cx} cy={y + 560} r={36} fill={GREEN} />
          <polyline
            points={`${cx - 18},${y + 560} ${cx - 6},${y + 572} ${cx + 20},${y + 546}`}
            fill="none"
            stroke={BG}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* X mark */}
      {markType === 'x' && markOpacity > 0.01 && (
        <g opacity={markOpacity}>
          <circle cx={cx} cy={y + 560} r={36} fill={RED} />
          <line
            x1={cx - 16}
            y1={y + 544}
            x2={cx + 16}
            y2={y + 576}
            stroke={BG}
            strokeWidth={5}
            strokeLinecap="round"
          />
          <line
            x1={cx + 16}
            y1={y + 544}
            x2={cx - 16}
            y2={y + 576}
            stroke={BG}
            strokeWidth={5}
            strokeLinecap="round"
          />
        </g>
      )}
    </g>
  );
};

const Scene2: React.FC<{ frame: number }> = ({ frame }) => {
  const f = frame; // absolute frame (scene 2 starts at 150)

  // Wipe transition: white line sweeps left→right
  const wipeX = interpolate(f, [S2_START, S2_WIPE_END], [0, 1080], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const wipeOpacity = interpolate(f, [S2_START, S2_START + 5, S2_WIPE_END - 5, S2_WIPE_END], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Left card entrance
  const leftCardOpacity = interpolate(f, [S2_LEFT_CARD_START, S2_LEFT_CARD_END], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const leftCardY = interpolate(f, [S2_LEFT_CARD_START, S2_LEFT_CARD_END], [CARD_CY + 80, CARD_CY], {
    easing: Easing.out(Easing.back(1.2)),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Left card count ($100)
  const leftCount = countUp(f, S2_LEFT_COUNT_START, S2_LEFT_COUNT_END, 100);

  // Right card entrance
  const rightCardOpacity = interpolate(f, [S2_RIGHT_CARD_START, S2_RIGHT_CARD_END], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rightCardY = interpolate(f, [S2_RIGHT_CARD_START, S2_RIGHT_CARD_END], [CARD_CY + 80, CARD_CY], {
    easing: Easing.out(Easing.back(1.2)),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Right card count ($12,000)
  const rightCount = countUp(f, S2_RIGHT_COUNT_START, S2_RIGHT_COUNT_END, 12000);

  // Equals indicator
  const equalsOpacity = interpolate(f, [S2_EQUALS_START, S2_EQUALS_START + 20], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });


  return (
    <>
      <svg
        width={1080}
        height={1920}
        style={{ position: 'absolute', top: 0, left: 0 }}
        viewBox="0 0 1080 1920"
      >
        {/* Left card */}
        {f >= S2_LEFT_CARD_START && (
          <ServerCard
            cx={LEFT_CX}
            cy={leftCardY}
            label="STAGING"
            price={`$${fmt(leftCount)}`}
            priceColor={GREEN}
            iconScale={1.0}
            opacity={leftCardOpacity}
          />
        )}

        {/* Right card */}
        {f >= S2_RIGHT_CARD_START && (
          <ServerCard
            cx={RIGHT_CX}
            cy={rightCardY}
            label="PROD"
            price={`$${fmt(rightCount)}`}
            priceColor={RED}
            iconScale={1.4}
            opacity={rightCardOpacity}
          />
        )}

        {/* Equals / same-load indicator: two parallel horizontal lines (≡) */}
        {f >= S2_EQUALS_START && (
          <g opacity={equalsOpacity}>
            {/* Double arrow ←→ using two lines with arrowheads, centered vertically between cards */}
            <line
              x1={LEFT_CX + CARD_W / 2 + 16}
              y1={CARD_CY - 16}
              x2={RIGHT_CX - CARD_W / 2 - 16}
              y2={CARD_CY - 16}
              stroke={WHITE}
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.55}
            />
            <line
              x1={LEFT_CX + CARD_W / 2 + 16}
              y1={CARD_CY + 16}
              x2={RIGHT_CX - CARD_W / 2 - 16}
              y2={CARD_CY + 16}
              stroke={WHITE}
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.55}
            />
            {/* Left arrow tip */}
            <polygon
              points={`${LEFT_CX + CARD_W / 2 + 16},${CARD_CY} ${LEFT_CX + CARD_W / 2 + 36},${CARD_CY - 18} ${LEFT_CX + CARD_W / 2 + 36},${CARD_CY + 18}`}
              fill={WHITE}
              opacity={0.4}
            />
            {/* Right arrow tip */}
            <polygon
              points={`${RIGHT_CX - CARD_W / 2 - 16},${CARD_CY} ${RIGHT_CX - CARD_W / 2 - 36},${CARD_CY - 18} ${RIGHT_CX - CARD_W / 2 - 36},${CARD_CY + 18}`}
              fill={WHITE}
              opacity={0.4}
            />
          </g>
        )}

        {/* Wipe line */}
        {f >= S2_START && f <= S2_WIPE_END + 5 && (
          <line
            x1={wipeX}
            y1={0}
            x2={wipeX}
            y2={1920}
            stroke={WHITE}
            strokeWidth={4}
            opacity={wipeOpacity}
          />
        )}
      </svg>
    </>
  );
};

// ─── Main Composition ─────────────────────────────────────────────────────────

export const DatabaseBillCut: React.FC = () => {
  const frame = useCurrentFrame();

  const isScene1 = frame < S2_START;
  const isScene2 = frame >= S2_START;

  return (
    <AbsoluteFill
      style={{
        background: BG,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        overflow: 'hidden',
      }}
    >
      <BackgroundGrid />

      {isScene1 && <Scene1 frame={frame} />}
      {isScene2 && <Scene2 frame={frame} />}
    </AbsoluteFill>
  );
};
