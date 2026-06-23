import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  Img,
  staticFile,
  useVideoConfig,
} from 'remotion';
import { loadFont, fontFamily } from '@remotion/google-fonts/Inter';

loadFont('normal', { weights: ['400', '600', '700', '800'] });

// ─── Palette ─────────────────────────────────────────────────────────────────
const CONNECTORS_COLOR = '#D4A574';
const MCP_COLOR        = '#3ECF8E';
const DB_COLOR         = '#60A5FA';
const CAL_COLOR        = '#F472B6';
const CODE_COLOR       = '#A78BFA';

// ─── Canvas ──────────────────────────────────────────────────────────────────
const W = 1080;
const H = 1920;

// ─── Card geometry (upper section, centered horizontally) ────────────────────
const CARD_W   = 760;
const CARD_H   = 200;
const CARD_GAP = 60;
const CARD_X   = (W - CARD_W) / 2;   // 160

const CONNECTOR_CARD_TOP = 260;
const MCP_CARD_TOP       = CONNECTOR_CARD_TOP + CARD_H + CARD_GAP;

// MCP card bottom-center: origin for connection lines
const MCP_ORIGIN_X = W / 2;
const MCP_ORIGIN_Y = MCP_CARD_TOP + CARD_H;

// ─── Tool nodes (lower section, evenly spaced in a row) ──────────────────────
const NODE_R  = 90;
const NODE_Y  = 1480;   // center-y for all three tool circles
const NODE_XS = [190, 540, 890] as const;

const TOOLS = [
  { emoji: '🗄️', label: 'Database', color: DB_COLOR,   cx: NODE_XS[0] },
  { emoji: '📅', label: 'Calendar', color: CAL_COLOR,  cx: NODE_XS[1] },
  { emoji: '💻', label: 'Codebase', color: CODE_COLOR, cx: NODE_XS[2] },
] as const;

// Connection targets: top edge of each tool circle
const TOOL_TARGETS = TOOLS.map(t => ({ x: t.cx, y: NODE_Y - NODE_R }));

// ─── Timeline (30fps, 510 frames = 17s) ──────────────────────────────────────
const T_MCP        = 0;
const T_CONNECTORS = 50;
const T_SEPARATOR  = 100;
const T_TOOLS      = 130;
const T_LINES      = 200;
const T_PULSE      = 260;
const T_HIGHLIGHT  = 300; // 10s — sequential tool spotlights, 70f apart

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fi(frame: number, a: number, b: number) {
  return interpolate(frame, [a, b], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

function sp(frame: number, start: number, d = 14, s = 140, m = 0.7) {
  return spring({ frame: frame - start, fps: 30, config: { damping: d, stiffness: s, mass: m } });
}

function pathLen(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Smooth bell curve: ramp up 20f, hold 30f, ramp down 20f
function highlight(frame: number, start: number): number {
  if (frame < start) return 0;
  const t = frame - start;
  if (t < 20)  return t / 20;
  if (t < 50)  return 1;
  if (t < 70)  return 1 - (t - 50) / 20;
  return 0;
}

// Cubic bezier evaluation — matches the SVG "C" command
function cubicBez(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

// ─── Small pill badge ─────────────────────────────────────────────────────────
function PillBadge({ label, color }: { label: string; color: string }) {
  return (
    <div style={{
      padding: '5px 16px',
      borderRadius: 100,
      backgroundColor: `${color}18`,
      border: `1.5px solid ${color}50`,
      fontSize: 14,
      fontWeight: 700,
      color,
      letterSpacing: 2,
      fontFamily,
      whiteSpace: 'nowrap' as const,
    }}>
      {label}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export const ConnectorsArchitecture: React.FC = () => {
  const frame = useCurrentFrame();
  useVideoConfig();

  // ── Card entrance: slide in from top ─────────────────────────────────────
  const mcpSlide        = sp(frame, T_MCP, 14, 140);
  const connectorsSlide = sp(frame, T_CONNECTORS, 14, 140);

  const mcpTranslateY        = interpolate(mcpSlide,        [0, 1], [-300, 0]);
  const connectorsTranslateY = interpolate(connectorsSlide, [0, 1], [-300, 0]);

  // ── Separator fade ────────────────────────────────────────────────────────
  const separatorOp = fi(frame, T_SEPARATOR, T_SEPARATOR + 30);

  // ── Tool node entrance: spring up from below, staggered ──────────────────
  const toolSprings = TOOLS.map((_, i) => sp(frame, T_TOOLS + i * 20, 14, 140));
  const toolTransY  = toolSprings.map(s => interpolate(s, [0, 1], [200, 0]));

  // ── Line draw progress ────────────────────────────────────────────────────
  const lineLengths = TOOLS.map(t =>
    pathLen(MCP_ORIGIN_X, MCP_ORIGIN_Y, t.cx, NODE_Y - NODE_R)
  );
  const lineProgress = TOOLS.map((_, i) =>
    fi(frame, T_LINES + i * 15, T_LINES + i * 15 + 60)
  );

  // ── Tool highlights (sequential, 70f apart from T_HIGHLIGHT) ─────────────
  const highlightVals = TOOLS.map((_, i) =>
    highlight(frame, T_HIGHLIGHT + i * 70)
  );

  // ── Pulse dots ────────────────────────────────────────────────────────────
  const PULSE_CYCLE   = 90;
  const PULSE_STAGGER = 30;

  const pulseDots = TOOLS.map((tool, i) => {
    if (frame < T_PULSE) return null;
    const elapsed = frame - T_PULSE + i * PULSE_STAGGER;
    if (elapsed < 0) return null;
    const t = (elapsed % PULSE_CYCLE) / PULSE_CYCLE;

    const target = TOOL_TARGETS[i];
    // Mirror the SVG bezier: C MCP_ORIGIN_X cpY  target.x cpY  target.x target.y
    const cpY = (MCP_ORIGIN_Y + target.y) / 2;
    const px = cubicBez(t, MCP_ORIGIN_X, MCP_ORIGIN_X, target.x, target.x);
    const py = cubicBez(t, MCP_ORIGIN_Y, cpY, cpY, target.y);

    const alpha = t < 0.15 ? t / 0.15 : t > 0.85 ? (1 - t) / 0.15 : 1;

    return { px, py, color: tool.color, alpha };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#07070f', overflow: 'hidden', fontFamily }}>

      {/* Dot grid */}
      <AbsoluteFill style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.032) 1px, transparent 1px)',
        backgroundSize: '52px 52px',
        pointerEvents: 'none',
      }} />

      {/* ── SVG: connection lines + pulse dots ─────────────────────────────── */}
      <svg
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
        width={W} height={H}
        viewBox={`0 0 ${W} ${H}`}
      >
        {TOOLS.map((tool, i) => {
          const target = TOOL_TARGETS[i];
          const len    = lineLengths[i];
          const prog   = lineProgress[i];
          const offset = len * (1 - prog);

          // Bezier: fan out from MCP bottom-center down to each tool
          const cpY = (MCP_ORIGIN_Y + target.y) / 2;

          return frame >= T_LINES + i * 15 ? (
            <path
              key={i}
              d={`M ${MCP_ORIGIN_X} ${MCP_ORIGIN_Y} C ${MCP_ORIGIN_X} ${cpY} ${target.x} ${cpY} ${target.x} ${target.y}`}
              stroke={`${tool.color}59`}
              strokeWidth={4}
              fill="none"
              strokeDasharray={len * 2}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          ) : null;
        })}

        {pulseDots.map((p, i) => {
          if (!p) return null;
          return (
            <g key={i} opacity={p.alpha}>
              <circle cx={p.px} cy={p.py} r={20} fill={`${p.color}28`} />
              <circle cx={p.px} cy={p.py} r={12} fill={`${p.color}55`} />
              <circle cx={p.px} cy={p.py} r={7}  fill={p.color} />
            </g>
          );
        })}
      </svg>

      {/* ── CONNECTORS CARD ──────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: CARD_X,
        top:  CONNECTOR_CARD_TOP + connectorsTranslateY,
        width:  CARD_W,
        height: CARD_H,
        borderRadius: 24,
        backgroundColor: 'rgba(212,165,116,0.08)',
        border: `2px solid rgba(212,165,116,0.4)`,
        boxShadow: `0 0 60px rgba(212,165,116,0.2)`,
        display: 'flex',
        alignItems: 'center',
        gap: 28,
        padding: '0 40px',
        overflow: 'hidden',
      }}>
        <Img
          src={staticFile('claudelogo.png')}
          style={{ width: 72, height: 72, objectFit: 'contain', flexShrink: 0 }}
        />
        <div style={{ width: 1, height: 90, backgroundColor: 'rgba(212,165,116,0.25)', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: CONNECTORS_COLOR, lineHeight: 1, marginBottom: 8 }}>
            Connectors
          </div>
          <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.42)' }}>
            Claude's product layer
          </div>
        </div>
      </div>

      {/* ── SEPARATOR ────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: CARD_X,
        top:  CONNECTOR_CARD_TOP + CARD_H,
        width: CARD_W,
        height: CARD_GAP,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        opacity: separatorOp,
      }}>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.12))' }} />
        <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.32)', letterSpacing: 1, whiteSpace: 'nowrap' as const }}>
          built on top of
        </div>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.12))' }} />
      </div>

      {/* ── MCP CARD ─────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: CARD_X,
        top:  MCP_CARD_TOP + mcpTranslateY,
        width:  CARD_W,
        height: CARD_H,
        borderRadius: 24,
        backgroundColor: 'rgba(62,207,142,0.08)',
        border: `2px solid rgba(62,207,142,0.4)`,
        boxShadow: `0 0 60px rgba(62,207,142,0.2)`,
        display: 'flex',
        alignItems: 'center',
        gap: 28,
        padding: '0 40px',
        overflow: 'hidden',
      }}>
        <div style={{
          fontSize: 64,
          fontWeight: 800,
          color: MCP_COLOR,
          letterSpacing: 3,
          lineHeight: 1,
          filter: `drop-shadow(0 0 18px ${MCP_COLOR}60)`,
          flexShrink: 0,
        }}>
          MCP
        </div>
        <div style={{ width: 1, height: 90, backgroundColor: 'rgba(62,207,142,0.25)', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: MCP_COLOR, lineHeight: 1.2, marginBottom: 10 }}>
            Model Context Protocol
          </div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.42)', marginBottom: 14 }}>
            The protocol layer underneath
          </div>
          <PillBadge label="OPEN STANDARD" color={MCP_COLOR} />
        </div>
      </div>

      {/* ── TOOL NODES ───────────────────────────────────────────────────────── */}
      {TOOLS.map((tool, i) => {
        if (frame < T_TOOLS + i * 20) return null;
        const ty = toolTransY[i];
        const hl = highlightVals[i];

        const scale     = 1 + 0.18 * hl;
        const bgAlpha   = Math.round((0x1a + 0x20 * hl)).toString(16).padStart(2, '0');
        const borderAlp = Math.round((0x59 + 0x66 * hl)).toString(16).padStart(2, '0');
        const glowAmt   = 60 + 80 * hl;
        const glowAlpha = Math.round((0x28 + 0x88 * hl)).toString(16).padStart(2, '0');
        const labelSize = 26 + 6 * hl;

        return (
          <React.Fragment key={i}>
            <div style={{
              position: 'absolute',
              left: tool.cx - NODE_R,
              top:  NODE_Y - NODE_R + ty,
              width:  NODE_R * 2,
              height: NODE_R * 2,
              borderRadius: '50%',
              backgroundColor: `${tool.color}${bgAlpha}`,
              border: `2px solid ${tool.color}${borderAlp}`,
              boxShadow: `0 0 ${glowAmt}px ${tool.color}${glowAlpha}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
            }}>
              <span style={{ fontSize: 52, lineHeight: 1 }}>{tool.emoji}</span>
            </div>
            <div style={{
              position: 'absolute',
              left: tool.cx - 100,
              top:  NODE_Y + NODE_R + 18 + ty,
              width: 200,
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: labelSize,
                fontWeight: 700,
                color: tool.color,
                filter: hl > 0 ? `drop-shadow(0 0 ${8 * hl}px ${tool.color})` : 'none',
              }}>
                {tool.label}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
