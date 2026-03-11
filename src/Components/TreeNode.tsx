import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import {
  GREEN,
  MONO,
  FG,
  FG_MUTED,
  boxBase,
  itp,
  sp,
  glowStyles,
} from '../tokens';
import { loadFont, fontFamily as interFont } from '@remotion/google-fonts/Inter';

loadFont('normal', { weights: ['400', '600', '700'] });

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface TreeNodeProps {
  /** Display label below the icon */
  label: string;
  /** Optional sublabel — shown smaller below label */
  sublabel?: string;
  /** Emoji or text icon rendered above the label */
  icon?: string;
  /** Custom SVG icon — if provided, renders instead of emoji */
  svgIcon?: React.ReactNode;
  /** Center X position (absolute, relative to parent) */
  cx: number;
  /** Center Y position (absolute, relative to parent) */
  cy: number;
  /** Glow progress 0–1. 0 = dim/rest, 1 = fully lit */
  glow?: number;
  /** Global frame at which this node enters */
  enterFrame?: number;
  /** Enter from direction */
  enterFrom?: 'below' | 'above' | 'left' | 'right' | 'none';
  /** Whether this is the root node (slightly larger) */
  root?: boolean;
  /** Width override. Default 130 (root: 143) */
  width?: number;
  /** Height override. Default 72 */
  height?: number;
  /** If set, label morphs to this string when glow > 0.5 */
  morphLabel?: string;
  /** Color of the morph label. Defaults to GREEN */
  morphLabelColor?: string;
  /** Extra style overrides */
  style?: React.CSSProperties;
  /** onClick handler */
  onClick?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// TreeNode
// ─────────────────────────────────────────────────────────────────────────────

export const TreeNode: React.FC<TreeNodeProps> = ({
  label,
  sublabel,
  icon,
  svgIcon,
  cx,
  cy,
  glow          = 0,
  enterFrame    = 0,
  enterFrom     = 'below',
  root          = false,
  width,
  height        = 72,
  morphLabel,
  morphLabelColor = GREEN,
  style,
  onClick,
}) => {
  const frame = useCurrentFrame();

  const w = width ?? (root ? 143 : 130);

  // ── Entrance spring ──
  const enterSpring = sp(frame, enterFrame);
  const enterOp     = Math.min(enterSpring * 1.8, 1);

  const enterOffset = interpolate(enterSpring, [0, 1], [20, 0]);
  const enterTransform = (() => {
    switch (enterFrom) {
      case 'below':  return `translateY(${enterOffset}px)`;
      case 'above':  return `translateY(${-enterOffset}px)`;
      case 'left':   return `translateX(${-enterOffset}px)`;
      case 'right':  return `translateX(${enterOffset}px)`;
      case 'none':   return 'none';
    }
  })();

  // ── Glow ──
  // Derive box styles from glow progress
  const glowBg     = `rgba(62,207,142,${0.06 + glow * 0.12})`;
  const glowBorder = `rgba(62,207,142,${0.2  + glow * 0.6})`;
  const glowShadow = glow > 0.05
    ? `0 0 ${20 * glow}px rgba(62,207,142,${0.25 * glow}), 0 6px 24px rgba(0,0,0,0.5)`
    : '0 6px 24px rgba(0,0,0,0.5)';

  // ── Label morph ──
  const activeLabel = morphLabel && glow > 0.5 ? morphLabel : label;
  const labelColor  = morphLabel && glow > 0.5
    ? morphLabelColor
    : glow > 0.1
      ? GREEN
      : FG_MUTED;

  return (
    <div
      onClick={onClick}
      style={{
        position:       'absolute',
        left:           cx - w / 2,
        top:            cy - height / 2,
        width:          w,
        height,
        ...boxBase,
        background:     glow > 0.05 ? glowBg    : boxBase.background,
        border:         glow > 0.05 ? `1.5px solid ${glowBorder}` : boxBase.border,
        boxShadow:      glowShadow,
        borderRadius:   14,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            4,
        opacity:        enterOp,
        transform:      enterTransform,
        transition:     'background 0.35s, border 0.35s, box-shadow 0.35s',
        cursor:         onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {/* Icon */}
      {svgIcon
        ? <div style={{ lineHeight: 0 }}>{svgIcon}</div>
        : icon
          ? <span style={{ fontSize: root ? 22 : 20, lineHeight: 1 }}>{icon}</span>
          : null
      }

      {/* Primary label */}
      <span
        style={{
          fontFamily:    `${interFont}, sans-serif`,
          fontSize:      root ? 14 : 12,
          fontWeight:    root ? 700 : 600,
          color:         labelColor,
          letterSpacing: '0.01em',
          transition:    'color 0.35s',
          textAlign:     'center',
          lineHeight:    1.2,
          paddingInline: 6,
        }}
      >
        {activeLabel}
      </span>

      {/* Sublabel */}
      {sublabel && (
        <span
          style={{
            fontFamily: MONO,
            fontSize:   10,
            color:      `rgba(62,207,142,${0.3 + glow * 0.5})`,
            transition: 'color 0.35s',
            textAlign:  'center',
            paddingInline: 6,
          }}
        >
          {sublabel}
        </span>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ConnectorLine
// ─────────────────────────────────────────────────────────────────────────────

export interface ConnectorLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Draw-in progress 0–1 */
  progress: number;
  /** Whether this line is lit (green) */
  lit?: boolean;
  /** Lit progress 0–1 — controls color intensity separately from draw */
  litProgress?: number;
  /** Stroke width. Default 1.8 */
  strokeWidth?: number;
  /** Whether to show an arrowhead at x2/y2 */
  arrow?: boolean;
  /** Unique id suffix for the arrowhead marker */
  id?: string;
}

export const ConnectorLine: React.FC<ConnectorLineProps> = ({
  x1, y1, x2, y2,
  progress,
  lit          = false,
  litProgress,
  strokeWidth  = 1.8,
  arrow        = false,
  id           = 'cl',
}) => {
  const lp     = litProgress ?? (lit ? 1 : 0);
  const color  = lp > 0.05
    ? `rgba(62,207,142,${0.3 + lp * 0.55})`
    : 'rgba(255,255,255,0.08)';

  const totalLen = Math.hypot(x2 - x1, y2 - y1);
  const cx2      = x1 + (x2 - x1) * progress;
  const cy2      = y1 + (y2 - y1) * progress;

  const markerId = `arrow-${id}`;

  return (
    <g>
      {arrow && progress >= 0.98 && (
        <defs>
          <marker
            id={markerId}
            markerWidth={8} markerHeight={6}
            refX={7} refY={3}
            orient="auto"
          >
            <polygon points="0 0,8 3,0 6" fill={color} />
          </marker>
        </defs>
      )}
      <line
        x1={x1} y1={y1}
        x2={cx2} y2={cy2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        markerEnd={arrow && progress >= 0.98 ? `url(#${markerId})` : undefined}
        style={lp > 0.1 ? { filter: `drop-shadow(0 0 4px rgba(62,207,142,${lp * 0.5}))` } : undefined}
      />
    </g>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TravelingDot
// Animated dot that travels along a line — used for request flow animations
// ─────────────────────────────────────────────────────────────────────────────

export interface TravelingDotProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Travel progress 0–1 */
  progress: number;
  radius?: number;
  color?: string;
}

export const TravelingDot: React.FC<TravelingDotProps> = ({
  x1, y1, x2, y2,
  progress,
  radius = 5,
  color  = GREEN,
}) => {
  if (progress <= 0 || progress >= 1) return null;

  const cx = x1 + (x2 - x1) * progress;
  const cy = y1 + (y2 - y1) * progress;

  return (
    <circle
      cx={cx} cy={cy} r={radius}
      fill={color}
      style={{ filter: 'drop-shadow(0 0 8px rgba(62,207,142,0.9))' }}
    />
  );
};