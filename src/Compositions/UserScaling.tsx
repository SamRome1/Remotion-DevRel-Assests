import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { BG, GREEN, MONO } from '../tokens';
import { circularFamily } from '../fonts';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const itp = (f: number, s: number, e: number, from = 0, to = 1) =>
  interpolate(f, [s, e], [from, to], clamp);

// S-curve normalised control points [x, y] — y=0 is bottom (0 users), y=1 is top (1M)
const CURVE_POINTS: [number, number][] = [
  [0,    0   ],
  [0.15, 0.01],
  [0.3,  0.04],
  [0.45, 0.12],
  [0.55, 0.28],
  [0.65, 0.52],
  [0.75, 0.75],
  [0.85, 0.90],
  [0.95, 0.97],
  [1.0,  1.0 ],
];

// Catmull-Rom → cubic bezier conversion
function catmullRomToCubic(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  tension = 0.5,
): { cp1: [number, number]; cp2: [number, number] } {
  return {
    cp1: [p1[0] + (p2[0] - p0[0]) * tension / 3, p1[1] + (p2[1] - p0[1]) * tension / 3],
    cp2: [p2[0] - (p3[0] - p1[0]) * tension / 3, p2[1] - (p3[1] - p1[1]) * tension / 3],
  };
}

function buildSVGPath(points: [number, number][], cw: number, ch: number): string {
  // Convert normalised coords → SVG px (y is inverted)
  const px = (p: [number, number]): [number, number] => [
    p[0] * cw,
    ch - p[1] * ch,
  ];

  const pts = points.map(px);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const { cp1, cp2 } = catmullRomToCubic(p0, p1, p2, p3, 0.5);
    d += ` C ${cp1[0]} ${cp1[1]}, ${cp2[0]} ${cp2[1]}, ${p2[0]} ${p2[1]}`;
  }

  return d;
}

function buildAreaPath(points: [number, number][], cw: number, ch: number): string {
  const line = buildSVGPath(points, cw, ch);
  // Close at bottom-right then bottom-left
  const lastX = points[points.length - 1][0] * cw;
  return `${line} L ${lastX} ${ch} L 0 ${ch} Z`;
}

// Get the SVG y coordinate for a given normalised x (for placing milestone dots)
function getYAtX(normX: number, cw: number, ch: number): number {
  // Find the two bracketing points and lerp
  for (let i = 0; i < CURVE_POINTS.length - 1; i++) {
    const [x0, y0] = CURVE_POINTS[i];
    const [x1, y1] = CURVE_POINTS[i + 1];
    if (normX >= x0 && normX <= x1) {
      const t = (normX - x0) / (x1 - x0);
      const y = y0 + (y1 - y0) * t;
      return ch - y * ch;
    }
  }
  return ch;
}

const MILESTONES = [
  { label: '1K',   x: 0.30 },
  { label: '10K',  x: 0.45 },
  { label: '100K', x: 0.65 },
  { label: '1M',   x: 1.0  },
];

function formatCount(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

export const UserScaling: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // ── Layout constants ──────────────────────────────────────────────────────
  const CHART_LEFT   = 72;
  const CHART_RIGHT  = 72;
  const CHART_WIDTH  = width - CHART_LEFT - CHART_RIGHT; // 936
  const CHART_TOP    = height * 0.28;
  const CHART_HEIGHT = height * 0.54;

  // ── Animation values ──────────────────────────────────────────────────────
  const headerOpacity  = itp(frame, 0, 20);
  const axisOpacity    = itp(frame, 10, 30);
  const drawProgress   = itp(frame, 15, 155);
  const counterValue   = itp(frame, 20, 160, 0, 1_000_000);

  // ── SVG paths ─────────────────────────────────────────────────────────────
  const linePath = buildSVGPath(CURVE_POINTS, CHART_WIDTH, CHART_HEIGHT);
  const areaPath = buildAreaPath(CURVE_POINTS, CHART_WIDTH, CHART_HEIGHT);

  // strokeDasharray trick — 3000 is safely larger than the path length
  const DASH = 3000;
  const dashOffset = DASH * (1 - drawProgress);

  // ── Grid ──────────────────────────────────────────────────────────────────
  const hGridLines = [0, 0.25, 0.5, 0.75, 1.0];
  const vGridLines = [0, 0.2, 0.4, 0.6, 0.8, 1.0];

  const yAxisLabels = ['0', '250K', '500K', '750K', '1M'];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        fontFamily: circularFamily,
        overflow: 'hidden',
      }}
    >
      {/* Background radial bloom */}
      <div
        style={{
          position: 'absolute',
          left: width / 2 - 700,
          top: CHART_TOP + CHART_HEIGHT / 2 - 700,
          width: 1400,
          height: 1400,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(62,207,142,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Counter block ──────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          opacity: headerOpacity,
        }}
      >
        <div
          style={{
            fontSize: 128,
            fontWeight: 800,
            color: GREEN,
            fontVariantNumeric: 'tabular-nums',
            textShadow: '0 0 80px rgba(62,207,142,0.3)',
            lineHeight: 1,
            letterSpacing: -2,
          }}
        >
          {formatCount(counterValue)}
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          Active Users
        </div>
      </div>

      {/* ── Chart SVG ──────────────────────────────────────────────────────── */}
      <svg
        style={{
          position: 'absolute',
          left: CHART_LEFT,
          top: CHART_TOP,
          overflow: 'visible',
        }}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(62,207,142,0.25)" />
            <stop offset="100%" stopColor="rgba(62,207,142,0.0)" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {hGridLines.map((t, i) => {
          const y = CHART_HEIGHT - t * CHART_HEIGHT;
          return (
            <line
              key={`hg-${i}`}
              x1={0}
              y1={y}
              x2={CHART_WIDTH}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          );
        })}

        {/* Vertical grid lines */}
        {vGridLines.map((t, i) => {
          const x = t * CHART_WIDTH;
          return (
            <line
              key={`vg-${i}`}
              x1={x}
              y1={0}
              x2={x}
              y2={CHART_HEIGHT}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={1}
            />
          );
        })}

        {/* Area fill */}
        <path
          d={areaPath}
          fill="url(#areaGradient)"
          opacity={drawProgress}
          clipPath="url(#drawClip)"
        />

        {/* Clip mask that reveals the path left-to-right */}
        <defs>
          <clipPath id="drawClip">
            <rect
              x={0}
              y={-10}
              width={CHART_WIDTH * drawProgress}
              height={CHART_HEIGHT + 20}
            />
          </clipPath>
        </defs>

        {/* Growth line — drawn via strokeDashoffset */}
        <path
          d={linePath}
          fill="none"
          stroke={GREEN}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={DASH}
          strokeDashoffset={dashOffset}
        />

        {/* Y-axis labels (right side) */}
        {hGridLines.map((t, i) => {
          const y = CHART_HEIGHT - t * CHART_HEIGHT;
          return (
            <text
              key={`yl-${i}`}
              x={CHART_WIDTH + 18}
              y={y + 6}
              fontSize={20}
              fill="rgba(255,255,255,0.3)"
              fontFamily={MONO}
              opacity={axisOpacity}
            >
              {yAxisLabels[i]}
            </text>
          );
        })}

        {/* Milestone markers */}
        {MILESTONES.map((ms) => {
          const dotX   = ms.x * CHART_WIDTH;
          const dotY   = getYAtX(ms.x, CHART_WIDTH, CHART_HEIGHT);
          const isVisible = drawProgress >= ms.x - 0.01;
          const triggerFrame = 15 + ms.x * (155 - 15);
          const popScale = isVisible
            ? spring({
                frame: frame - triggerFrame,
                fps,
                config: { damping: 14, stiffness: 200 },
              })
            : 0;

          const PILL_W = ms.label.length <= 2 ? 72 : ms.label.length <= 3 ? 88 : 104;
          const PILL_H = 40;
          const PILL_X = dotX - PILL_W / 2;
          const PILL_Y = dotY - 72;

          return (
            <g
              key={ms.label}
              transform={`translate(${dotX}, ${dotY}) scale(${popScale}) translate(${-dotX}, ${-dotY})`}
            >
              {/* Glowing dot */}
              <circle
                cx={dotX}
                cy={dotY}
                r={10}
                fill={GREEN}
                style={{
                  filter:
                    'drop-shadow(0 0 12px rgba(62,207,142,0.8)) drop-shadow(0 0 4px rgba(62,207,142,0.9))',
                }}
              />
              {/* Connector stem */}
              <line
                x1={dotX}
                y1={dotY - 10}
                x2={dotX}
                y2={PILL_Y + PILL_H}
                stroke="rgba(62,207,142,0.35)"
                strokeWidth={1.5}
              />
              {/* Pill background */}
              <rect
                x={PILL_X}
                y={PILL_Y}
                width={PILL_W}
                height={PILL_H}
                rx={10}
                fill="rgba(62,207,142,0.15)"
                stroke="rgba(62,207,142,0.4)"
                strokeWidth={1}
              />
              {/* Pill label */}
              <text
                x={PILL_X + PILL_W / 2}
                y={PILL_Y + PILL_H / 2 + 7}
                textAnchor="middle"
                fontSize={22}
                fontWeight={700}
                fill={GREEN}
                fontFamily={MONO}
              >
                {ms.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* ── X-axis labels ──────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          left: CHART_LEFT,
          right: CHART_RIGHT,
          top: CHART_TOP + CHART_HEIGHT + 24,
          display: 'flex',
          justifyContent: 'space-between',
          opacity: axisOpacity,
        }}
      >
        {['Day 1', 'Month 3', 'Month 6', 'Month 12'].map((label) => (
          <span
            key={label}
            style={{
              fontSize: 22,
              color: 'rgba(255,255,255,0.3)',
              fontFamily: MONO,
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
