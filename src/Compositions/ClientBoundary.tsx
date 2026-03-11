import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { loadFont, fontFamily } from '@remotion/google-fonts/Inter';

loadFont('normal', { weights: ['400', '500', '600', '700'] });

// ── Palette ───────────────────────────────────────────────────────────────────
const BG           = '#0f0f0f';
const SERVER_BG    = '#252525';
const SERVER_BOR   = '#3a3a3a';
const SERVER_TEXT  = 'rgba(255,255,255,0.72)';
const CLIENT_BG    = '#3b5bdb';
const CLIENT_BOR   = '#4c6ef5';
const CLIENT_TEXT  = '#ffffff';
const CONNECTOR    = '#3a3a3a';
const TEAL         = '#2dd4bf';
const PANEL_BG     = '#1a1a1a';
const PANEL_BOR    = '#2a2a2a';
const INTER        = `${fontFamily}, system-ui, sans-serif`;
const MONO         = `'JetBrains Mono', 'Fira Code', 'Menlo', monospace`;

// Code syntax colors
const S_PURPLE = '#c792ea';
const S_BLUE   = '#82aaff';
const S_RED    = '#f07178';
const S_GREEN  = '#c3e88d';
const S_DIM    = 'rgba(255,255,255,0.32)';
const S_WHITE  = 'rgba(255,255,255,0.88)';

// ── Timing ────────────────────────────────────────────────────────────────────
const T_BG        = 0;
const T_PANEL     = 30;
const T_UC        = 62;   // "use client" typewriter
const T_IMPORTS   = 94;
const T_FUNCTION  = 124;
const T_LEGEND    = 154;
const T_HOME      = 184;
const T_CONN1     = 212;  // draw connectors HomePage → Header/Content
const T_ROW2      = 233;  // Header + Content nodes appear
const T_CONN2     = 244;  // draw connectors Header → Logo/Profile
const T_ROW3      = 265;  // Logo + Profile nodes appear
const T_CONN3     = 275;  // draw connector Profile → Avatar
const T_AVATAR    = 293;  // Avatar node appears

// ── Node layout ───────────────────────────────────────────────────────────────
const NW = 180;
const NH = 52;
const NW2 = NW / 2;
const NH2 = NH / 2;

const N_HOME    = { x: 1385, y: 248 };
const N_HEADER  = { x: 1148, y: 424 };
const N_CONTENT = { x: 1635, y: 424 };
const N_LOGO    = { x: 1015, y: 600 };
const N_PROFILE = { x: 1282, y: 600 };
const N_AVATAR  = { x: 1282, y: 760 };

// Connector right-angle paths (M start V bend H target V end)
const B1 = 336; // bend y between rows 1-2
const B2 = 512; // bend y between rows 2-3

const P_HOME_HEADER  = `M ${N_HOME.x} ${N_HOME.y + NH2} V ${B1} H ${N_HEADER.x} V ${N_HEADER.y - NH2}`;
const P_HOME_CONTENT = `M ${N_HOME.x} ${N_HOME.y + NH2} V ${B1} H ${N_CONTENT.x} V ${N_CONTENT.y - NH2}`;
const P_HEAD_LOGO    = `M ${N_HEADER.x} ${N_HEADER.y + NH2} V ${B2} H ${N_LOGO.x} V ${N_LOGO.y - NH2}`;
const P_HEAD_PROF    = `M ${N_HEADER.x} ${N_HEADER.y + NH2} V ${B2} H ${N_PROFILE.x} V ${N_PROFILE.y - NH2}`;
const P_PROF_AVATAR  = `M ${N_PROFILE.x} ${N_PROFILE.y + NH2} V ${N_AVATAR.y - NH2}`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function easeOut(t: number) { return 1 - (1 - t) ** 3; }

function itp(
  frame: number, a: number, b: number,
  from = 0, to = 1,
  easing?: (t: number) => number,
) {
  return interpolate(frame, [a, b], [from, to], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing,
  });
}

function nodeSp(frame: number, t: number, fps: number) {
  return Math.min(
    spring({ frame: frame - t, fps, config: { damping: 12, stiffness: 130, mass: 0.7 } }),
    1,
  );
}

// ── Tree node ─────────────────────────────────────────────────────────────────
const TreeNode: React.FC<{
  x: number; y: number; label: string; type: 'server' | 'client';
  scale: number; opacity: number;
}> = ({ x, y, label, type, scale, opacity }) => {
  const isC = type === 'client';
  return (
    <div style={{
      position: 'absolute',
      left: x - NW2, top: y - NH2,
      width: NW, height: NH,
      backgroundColor: isC ? CLIENT_BG : SERVER_BG,
      border: `1.5px solid ${isC ? CLIENT_BOR : SERVER_BOR}`,
      borderRadius: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity,
      transform: `scale(${scale})`,
      fontFamily: INTER,
      fontSize: 15,
      fontWeight: 600,
      color: isC ? CLIENT_TEXT : SERVER_TEXT,
      letterSpacing: '-0.01em',
      boxShadow: isC
        ? '0 4px 24px rgba(59,91,219,0.4), 0 1px 4px rgba(0,0,0,0.4)'
        : '0 4px 16px rgba(0,0,0,0.5)',
    }}>
      {label}
    </div>
  );
};

// ── Animated SVG connector ────────────────────────────────────────────────────
const Connector: React.FC<{ d: string; progress: number }> = ({ d, progress }) => (
  <path
    d={d}
    fill="none"
    stroke={CONNECTOR}
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    pathLength={1}
    strokeDasharray={1}
    strokeDashoffset={1 - progress}
  />
);

// ── Code line renderer ────────────────────────────────────────────────────────
type Token = { t: string; c: string };

function CodeLine({ tokens }: { tokens: Token[] }) {
  if (tokens.length === 0) return <div style={{ height: '1.75em' }} />;
  return (
    <div style={{ whiteSpace: 'pre' }}>
      {tokens.map((tok, i) => <span key={i} style={{ color: tok.c }}>{tok.t}</span>)}
    </div>
  );
}

const IMPORT_LINES: Token[][] = [
  [
    { t: 'import ', c: S_PURPLE }, { t: 'Logo', c: S_WHITE },
    { t: ' from ', c: S_PURPLE }, { t: "'./Logo'", c: S_GREEN }, { t: ';', c: S_DIM },
  ],
  [
    { t: 'import ', c: S_PURPLE }, { t: 'Profile', c: S_WHITE },
    { t: ' from ', c: S_PURPLE }, { t: "'./Profile'", c: S_GREEN }, { t: ';', c: S_DIM },
  ],
];

const FUNC_LINES: Token[][] = [
  [],
  [{ t: 'function ', c: S_PURPLE }, { t: 'Header', c: S_BLUE }, { t: '() {', c: S_DIM }],
  [{ t: '  ', c: '' }, { t: 'return', c: S_PURPLE }, { t: ' (', c: S_DIM }],
  [{ t: '    ', c: '' }, { t: '<', c: S_DIM }, { t: 'header', c: S_RED }, { t: '>', c: S_DIM }],
  [{ t: '      ', c: '' }, { t: '<', c: S_DIM }, { t: 'Logo', c: S_BLUE }, { t: ' />', c: S_DIM }],
  [{ t: '      ', c: '' }, { t: '<', c: S_DIM }, { t: 'Profile', c: S_BLUE }, { t: ' />', c: S_DIM }],
  [{ t: '    ', c: '' }, { t: '</', c: S_DIM }, { t: 'header', c: S_RED }, { t: '>', c: S_DIM }],
  [{ t: '  );', c: S_DIM }],
  [{ t: '}', c: S_DIM }],
];

// ── Main component ────────────────────────────────────────────────────────────
export const ClientBoundary: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Background
  const bgOp = itp(frame, T_BG, T_BG + 24);

  // Code panel slides in from left
  const panelX  = itp(frame, T_PANEL, T_PANEL + 28, -760, 0, easeOut);
  const panelOp = itp(frame, T_PANEL, T_PANEL + 18);

  // "use client" typewriter
  const UC_TEXT = '"use client";';
  const ucLen   = Math.floor(itp(frame, T_UC, T_UC + 26, 0, UC_TEXT.length + 0.99));
  const ucStr   = UC_TEXT.slice(0, Math.min(ucLen, UC_TEXT.length));
  const ucMain  = ucStr.slice(0, 12); // "use client"
  const ucSemi  = ucStr.length >= 13 ? ';' : '';
  const showCursor = frame >= T_UC && frame < T_UC + 34;
  const cursorOn   = Math.floor(frame / 10) % 2 === 0;

  // Imports
  const impOp = itp(frame, T_IMPORTS, T_IMPORTS + 22);
  const impDY = itp(frame, T_IMPORTS, T_IMPORTS + 26, 12, 0, easeOut);

  // Function block
  const fnOp = itp(frame, T_FUNCTION, T_FUNCTION + 22);
  const fnDY = itp(frame, T_FUNCTION, T_FUNCTION + 26, 14, 0, easeOut);

  // Legend
  const legOp = itp(frame, T_LEGEND, T_LEGEND + 20);
  const legDY = itp(frame, T_LEGEND, T_LEGEND + 22, -10, 0, easeOut);

  // Node springs + opacities
  const sc = (t: number) => frame < t ? 0 : nodeSp(frame, t, fps);
  const op = (t: number) => itp(frame, t, t + 14);

  // Connector progress
  const cn1 = itp(frame, T_CONN1,     T_CONN1 + 22, 0, 1, easeOut);
  const cn2 = itp(frame, T_CONN1 + 6, T_CONN1 + 28, 0, 1, easeOut);
  const cn3 = itp(frame, T_CONN2,     T_CONN2 + 22, 0, 1, easeOut);
  const cn4 = itp(frame, T_CONN2 + 6, T_CONN2 + 28, 0, 1, easeOut);
  const cn5 = itp(frame, T_CONN3,     T_CONN3 + 20, 0, 1, easeOut);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', fontFamily: INTER }}>

      {/* ── Dot grid ── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.13) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        opacity: bgOp,
        pointerEvents: 'none',
      }} />

      {/* Subtle center glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 55% 65% at 58% 52%, rgba(59,91,219,0.07) 0%, transparent 65%)',
        opacity: bgOp, pointerEvents: 'none',
      }} />

      {/* ── Code panel ── */}
      <div style={{
        position: 'absolute',
        left: 72, top: 150,
        width: 660,
        opacity: panelOp,
        transform: `translateX(${panelX}px)`,
        backgroundColor: PANEL_BG,
        border: `1px solid ${PANEL_BOR}`,
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.65), 0 4px 16px rgba(0,0,0,0.4)',
      }}>

        {/* macOS traffic lights */}
        <div style={{
          backgroundColor: '#111111',
          padding: '12px 16px',
          borderBottom: `1px solid #222222`,
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f57' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#febc2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#28c840' }} />
          <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 12, fontFamily: MONO, marginLeft: 10, letterSpacing: '0.02em' }}>
            Header.tsx
          </span>
        </div>

        {/* Code body */}
        <div style={{ padding: '22px 28px', fontFamily: MONO, fontSize: 15, lineHeight: 1.75 }}>

          {/* "use client" line with teal highlight */}
          <div style={{
            marginLeft: -28,
            paddingLeft: 25,
            borderLeft: ucStr.length > 0 ? `3px solid ${TEAL}44` : '3px solid transparent',
            backgroundColor: ucStr.length > 0 ? `rgba(45,212,191,0.07)` : 'transparent',
            minHeight: '1.75em',
            display: 'flex', alignItems: 'center',
          }}>
            <span style={{ color: TEAL }}>{ucMain}</span>
            {ucSemi && <span style={{ color: S_DIM }}>{ucSemi}</span>}
            {showCursor && cursorOn && (
              <span style={{ color: TEAL, opacity: 0.9 }}>▋</span>
            )}
          </div>

          <div style={{ height: '1.75em' }} />

          {/* Import lines */}
          <div style={{ opacity: impOp, transform: `translateY(${impDY}px)` }}>
            {IMPORT_LINES.map((line, i) => <CodeLine key={i} tokens={line} />)}
          </div>

          {/* Function block */}
          <div style={{ opacity: fnOp, transform: `translateY(${fnDY}px)` }}>
            {FUNC_LINES.map((line, i) => <CodeLine key={i} tokens={line} />)}
          </div>

        </div>
      </div>

      {/* ── Legend ── */}
      <div style={{
        position: 'absolute',
        left: 1390, top: 96,
        transform: `translate(-50%, 0) translateY(${legDY}px)`,
        opacity: legOp,
        display: 'flex', alignItems: 'center', gap: 24,
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10,
        padding: '9px 18px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 11, height: 11, borderRadius: '50%',
            backgroundColor: SERVER_BG, border: `2px solid ${SERVER_BOR}`,
          }} />
          <span style={{ fontSize: 13, color: SERVER_TEXT, fontFamily: INTER, fontWeight: 500 }}>
            Server Component
          </span>
        </div>
        <div style={{ width: 1, height: 14, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 11, height: 11, borderRadius: '50%',
            backgroundColor: CLIENT_BG, border: `2px solid ${CLIENT_BOR}`,
          }} />
          <span style={{ fontSize: 13, color: SERVER_TEXT, fontFamily: INTER, fontWeight: 500 }}>
            Client Component
          </span>
        </div>
      </div>

      {/* ── Connector lines SVG ── */}
      <svg
        style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
        width={1920} height={1080}
      >
        {cn1 > 0 && <Connector d={P_HOME_HEADER}  progress={cn1} />}
        {cn2 > 0 && <Connector d={P_HOME_CONTENT} progress={cn2} />}
        {cn3 > 0 && <Connector d={P_HEAD_LOGO}    progress={cn3} />}
        {cn4 > 0 && <Connector d={P_HEAD_PROF}    progress={cn4} />}
        {cn5 > 0 && <Connector d={P_PROF_AVATAR}  progress={cn5} />}
      </svg>

      {/* ── Tree nodes ── */}
      {frame >= T_HOME && (
        <TreeNode {...N_HOME} label="HomePage" type="server"
          scale={sc(T_HOME)} opacity={op(T_HOME)} />
      )}
      {frame >= T_ROW2 && (<>
        <TreeNode {...N_HEADER}  label="Header"  type="client" scale={sc(T_ROW2)} opacity={op(T_ROW2)} />
        <TreeNode {...N_CONTENT} label="Content" type="server" scale={sc(T_ROW2)} opacity={op(T_ROW2)} />
      </>)}
      {frame >= T_ROW3 && (<>
        <TreeNode {...N_LOGO}    label="Logo"    type="client" scale={sc(T_ROW3)} opacity={op(T_ROW3)} />
        <TreeNode {...N_PROFILE} label="Profile" type="client" scale={sc(T_ROW3)} opacity={op(T_ROW3)} />
      </>)}
      {frame >= T_AVATAR && (
        <TreeNode {...N_AVATAR} label="Avatar" type="client"
          scale={sc(T_AVATAR)} opacity={op(T_AVATAR)} />
      )}

    </AbsoluteFill>
  );
};
