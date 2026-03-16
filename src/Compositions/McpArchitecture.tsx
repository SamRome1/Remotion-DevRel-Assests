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
const CLAUDE_COLOR   = '#D4A574';
const SUPABASE_COLOR = '#3ECF8E';
const MCP_COLOR      = '#818CF8';
const FILES_COLOR    = '#60A5FA';

// ─── Canvas & geometry ───────────────────────────────────────────────────────
const CW = 1080;
const CH = 1920;

// Node centres
const HOST_CX = CW / 2;  const HOST_CY  = 320;   const HOST_R  = 130;
const MCP_CX  = CW / 2;  const MCP_CY   = 960;   const MCP_R   = 100;
const TOOL_Y  = 1620;    const TOOL_R   = 108;
const TOOL_XS = [150, 540, 930] as const;

// Key connection points
const HOST_BOT = { x: HOST_CX, y: HOST_CY + HOST_R };
const MCP_TOP  = { x: MCP_CX,  y: MCP_CY  - MCP_R  };
const MCP_BOT  = { x: MCP_CX,  y: MCP_CY  + MCP_R  };
const TOOL_TOP = TOOL_XS.map(tx => ({ x: tx, y: TOOL_Y - TOOL_R }));

// ─── Timeline (30 fps, total 600 frames = 20 s) ───────────────────────────────
const T_HOST   = 0;
const T_LINE1  = 42;
const T_MCP    = 80;
const T_LINES2 = 115;
const T_TOOLS  = 155;
const T_LABELS = 200;
const T_FLOW   = 250;
const TOTAL    = 600;

// ─── Pulse cycle ─────────────────────────────────────────────────────────────
// 120 frames per tool cycle, staggered 40 f between tools
// 0–0.25 : Host → MCP
// 0.25–0.5: MCP → Tool
// 0.5–0.75: Tool → MCP
// 0.75–1.0: MCP → Host
const CYCLE = 120;
const STAGGER = 40;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp01(v: number)                    { return Math.max(0, Math.min(1, v)); }

function fi(frame: number, a: number, b: number) {           // fade-in helper
  return interpolate(frame, [a, b], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
}

function sp(frame: number, start: number, d = 14, s = 155, m = 0.7) {
  return spring({ frame: frame - start, fps: 30, config: { damping: d, stiffness: s, mass: m } });
}

function lineLen(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// ─── Tool definitions ─────────────────────────────────────────────────────────
const TOOLS = [
  { cx: TOOL_XS[0], color: SUPABASE_COLOR, label: 'Supabase', sub: 'Database',    logo: 'SupabaseIcon.png' },
  { cx: TOOL_XS[1], color: CLAUDE_COLOR,   label: 'Claude',   sub: 'API / Tools', logo: 'claudelogo.png'   },
  { cx: TOOL_XS[2], color: FILES_COLOR,    label: 'Files',    sub: 'Local Storage', emoji: '📁'              },
] as const;

// ─── Component ───────────────────────────────────────────────────────────────
export const McpArchitecture: React.FC = () => {
  const frame = useCurrentFrame();
  useVideoConfig();

  // ── Entrance springs ───────────────────────────────────────────────────────
  const hostScale   = sp(frame, T_HOST);
  const mcpScale    = sp(frame, T_MCP);
  const toolScales  = TOOLS.map((_, i) => sp(frame, T_TOOLS + i * 20));

  // ── Line 1: Host → MCP draw ────────────────────────────────────────────────
  const L1_LEN = lineLen(HOST_BOT.x, HOST_BOT.y, MCP_TOP.x, MCP_TOP.y);
  const l1p    = fi(frame, T_LINE1, T_LINE1 + 38);

  // ── Lines 2: MCP → each tool draw ─────────────────────────────────────────
  const l2Lens = TOOLS.map(t => lineLen(MCP_BOT.x, MCP_BOT.y, t.cx, TOOL_TOP[TOOLS.indexOf(t)].y));
  const l2p    = TOOLS.map((_, i) => fi(frame, T_LINES2 + i * 15, T_LINES2 + i * 15 + 38));

  // ── Label opacity ──────────────────────────────────────────────────────────
  const labelOp  = fi(frame, T_LABELS, T_LABELS + 22);
  const sideTagOp = fi(frame, T_LABELS + 20, T_LABELS + 40);

  // ── Pulse positions ────────────────────────────────────────────────────────
  const pulses = TOOLS.map((tool, i) => {
    if (frame < T_FLOW) return null;
    const cf = frame - T_FLOW + i * STAGGER;
    if (cf < 0) return null;
    const t = ((cf % CYCLE) / CYCLE);               // 0 → 1 within cycle

    let px: number, py: number, returning: boolean;
    const { cx } = tool;
    const ttop = TOOL_TOP[i];

    if (t < 0.25) {
      const u = clamp01(t / 0.25);
      px = lerp(HOST_BOT.x, MCP_TOP.x, u);
      py = lerp(HOST_BOT.y, MCP_TOP.y, u);
      returning = false;
    } else if (t < 0.5) {
      const u = clamp01((t - 0.25) / 0.25);
      px = lerp(MCP_BOT.x, cx,      u);
      py = lerp(MCP_BOT.y, ttop.y,  u);
      returning = false;
    } else if (t < 0.75) {
      const u = clamp01((t - 0.5) / 0.25);
      px = lerp(cx,      MCP_BOT.x, u);
      py = lerp(ttop.y,  MCP_BOT.y, u);
      returning = true;
    } else {
      const u = clamp01((t - 0.75) / 0.25);
      px = lerp(MCP_TOP.x, HOST_BOT.x, u);
      py = lerp(MCP_TOP.y, HOST_BOT.y, u);
      returning = true;
    }

    return { px, py, returning, color: tool.color };
  });

  // Glow on MCP node when a pulse is near it
  const mcpGlowing = pulses.some(p => {
    if (!p) return false;
    const d = Math.sqrt((p.px - MCP_CX) ** 2 + (p.py - MCP_CY) ** 2);
    return d < MCP_R + 50;
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#07070f', overflow: 'hidden', fontFamily }}>

      {/* Dot grid */}
      <AbsoluteFill style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        pointerEvents: 'none',
      }} />

      {/* ── SVG: lines + pulse dots ──────────────────────────────────────────── */}
      <svg
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
        width={CW} height={CH}
        viewBox={`0 0 ${CW} ${CH}`}
      >
        {/* Line 1: Host → MCP */}
        {frame >= T_LINE1 && (
          <line
            x1={HOST_BOT.x} y1={HOST_BOT.y}
            x2={MCP_TOP.x}  y2={MCP_TOP.y}
            stroke={`${MCP_COLOR}50`}
            strokeWidth={4}
            strokeDasharray={L1_LEN}
            strokeDashoffset={L1_LEN * (1 - l1p)}
            strokeLinecap="round"
          />
        )}

        {/* Lines 2: MCP → tools */}
        {TOOLS.map((tool, i) => frame >= T_LINES2 + i * 15 ? (
          <line
            key={i}
            x1={MCP_BOT.x}    y1={MCP_BOT.y}
            x2={tool.cx}      y2={TOOL_TOP[i].y}
            stroke={`${tool.color}40`}
            strokeWidth={4}
            strokeDasharray={l2Lens[i]}
            strokeDashoffset={l2Lens[i] * (1 - l2p[i])}
            strokeLinecap="round"
          />
        ) : null)}

        {/* Pulse dots */}
        {pulses.map((p, i) => {
          if (!p) return null;
          return (
            <g key={i}>
              {/* outer glow */}
              <circle cx={p.px} cy={p.py} r={22} fill={`${p.color}28`} />
              {/* mid ring */}
              <circle cx={p.px} cy={p.py} r={13} fill={`${p.color}55`} />
              {/* core */}
              <circle cx={p.px} cy={p.py} r={7}  fill={p.color} />
            </g>
          );
        })}
      </svg>

      {/* ── HOST NODE (Claude) ───────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: HOST_CX - HOST_R,
        top:  HOST_CY - HOST_R,
        width:  HOST_R * 2,
        height: HOST_R * 2,
        borderRadius: '50%',
        backgroundColor: `${CLAUDE_COLOR}18`,
        border: `3px solid ${CLAUDE_COLOR}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: `scale(${hostScale})`,
        boxShadow: `0 0 70px ${CLAUDE_COLOR}30`,
      }}>
        <Img
          src={staticFile('claudelogo.png')}
          style={{ width: 168, height: 168, objectFit: 'contain' }}
        />
      </div>

      {/* Host label */}
      {frame >= T_LABELS && (
        <div style={{
          position: 'absolute',
          left: HOST_CX - 200, top: HOST_CY + HOST_R + 20,
          width: 400, textAlign: 'center', opacity: labelOp,
        }}>
          <div style={{ fontSize: 40, fontWeight: 700, color: CLAUDE_COLOR, lineHeight: 1 }}>Claude</div>
          <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.38)', marginTop: 7 }}>MCP Host / AI Client</div>
        </div>
      )}

      {/* ── MCP HUB NODE ─────────────────────────────────────────────────────── */}
      {frame >= T_MCP && (
        <>
          <div style={{
            position: 'absolute',
            left: MCP_CX - MCP_R,
            top:  MCP_CY - MCP_R,
            width:  MCP_R * 2,
            height: MCP_R * 2,
            borderRadius: '50%',
            backgroundColor: `${MCP_COLOR}${mcpGlowing ? '28' : '16'}`,
            border: `3px solid ${MCP_COLOR}${mcpGlowing ? '88' : '55'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `scale(${mcpScale})`,
            boxShadow: mcpGlowing
              ? `0 0 80px ${MCP_COLOR}60, 0 0 36px ${MCP_COLOR}40`
              : `0 0 50px ${MCP_COLOR}25`,
            transition: 'box-shadow 0.1s',
          }}>
            <span style={{
              fontSize: 36, fontWeight: 800, color: MCP_COLOR,
              letterSpacing: 3,
              filter: mcpGlowing ? `drop-shadow(0 0 12px ${MCP_COLOR})` : 'none',
            }}>
              MCP
            </span>
          </div>

          {/* MCP label */}
          {frame >= T_LABELS && (
            <div style={{
              position: 'absolute',
              left: MCP_CX + MCP_R + 26, top: MCP_CY - 34,
              opacity: sideTagOp,
            }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: MCP_COLOR, lineHeight: 1 }}>
                Model Context Protocol
              </div>
              <div style={{ fontSize: 19, color: 'rgba(255,255,255,0.32)', marginTop: 7 }}>
                Routes requests between Claude & tools
              </div>
            </div>
          )}
        </>
      )}

      {/* ── TOOL NODES ───────────────────────────────────────────────────────── */}
      {TOOLS.map((tool, i) => {
        if (frame < T_TOOLS + i * 20) return null;
        const ts = toolScales[i];

        // Glow tool when a pulse is near it
        const glowing = pulses[i] && (() => {
          const p = pulses[i]!;
          const d = Math.sqrt((p.px - tool.cx) ** 2 + (p.py - TOOL_Y) ** 2);
          return d < TOOL_R + 50;
        })();

        return (
          <React.Fragment key={i}>
            <div style={{
              position: 'absolute',
              left: tool.cx - TOOL_R,
              top:  TOOL_Y  - TOOL_R,
              width:  TOOL_R * 2,
              height: TOOL_R * 2,
              borderRadius: '50%',
              backgroundColor: `${tool.color}${glowing ? '22' : '14'}`,
              border: `3px solid ${tool.color}${glowing ? '80' : '44'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: `scale(${ts})`,
              boxShadow: glowing
                ? `0 0 70px ${tool.color}50, 0 0 28px ${tool.color}38`
                : `0 0 40px ${tool.color}20`,
            }}>
              {'logo' in tool ? (
                <Img
                  src={staticFile(tool.logo)}
                  style={{ width: 132, height: 132, objectFit: 'contain' }}
                />
              ) : (
                <span style={{ fontSize: 72 }}>{tool.emoji}</span>
              )}
            </div>

            {/* Tool label */}
            {frame >= T_LABELS && (
              <div style={{
                position: 'absolute',
                left:  tool.cx - 150,
                top:   TOOL_Y + TOOL_R + 18,
                width: 300, textAlign: 'center', opacity: labelOp,
              }}>
                <div style={{ fontSize: 34, fontWeight: 700, color: tool.color, lineHeight: 1 }}>
                  {tool.label}
                </div>
                <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>
                  {tool.sub}
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* ── Side label: "MCP Servers" ────────────────────────────────────────── */}
      {frame >= T_LABELS + 30 && (
        <div style={{
          position: 'absolute',
          left: 0, top: TOOL_Y - TOOL_R - 66,
          width: CW, textAlign: 'center',
          opacity: fi(frame, T_LABELS + 30, T_LABELS + 50),
        }}>
          <div style={{
            display: 'inline-block',
            padding: '10px 36px',
            borderRadius: 100,
            border: '1px solid rgba(255,255,255,0.12)',
            backgroundColor: 'rgba(255,255,255,0.04)',
            fontSize: 20, fontWeight: 600,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: 3,
          }}>
            MCP SERVERS
          </div>
        </div>
      )}

      {/* ── Flow direction labels (request / response) ──────────────────────── */}
      {frame >= T_FLOW + 15 && (
        <>
          {/* "request" going down */}
          <div style={{
            position: 'absolute',
            left: MCP_CX + 24,
            top: lerp(HOST_BOT.y, MCP_TOP.y, 0.5) - 16,
            opacity: fi(frame, T_FLOW + 15, T_FLOW + 35) * 0.65,
            fontSize: 20, fontWeight: 600,
            color: MCP_COLOR,
            letterSpacing: 1,
          }}>
            request ↓
          </div>
          {/* "response" going up */}
          <div style={{
            position: 'absolute',
            left: MCP_CX - 130,
            top: lerp(HOST_BOT.y, MCP_TOP.y, 0.5) - 16,
            opacity: fi(frame, T_FLOW + 15, T_FLOW + 35) * 0.65,
            fontSize: 20, fontWeight: 600,
            color: MCP_COLOR,
            letterSpacing: 1,
          }}>
            ↑ response
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
