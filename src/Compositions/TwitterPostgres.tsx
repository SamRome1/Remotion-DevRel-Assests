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
import { loadFont, fontFamily as interFont } from '@remotion/google-fonts/Inter';

loadFont('normal', { weights: ['300', '400', '500', '600', '700'] });

const GREEN      = '#3ecf8e';
const BG         = '#0f0f0f';
const BOX_BG     = '#1a1a1a';
const BOX_BORDER = '#2a2a2a';
const MONO       = '"JetBrains Mono", "Fira Code", ui-monospace, monospace';
const DIM        = 'rgba(255,255,255,0.18)';

const C  = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const itp = (f: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(f, [a, b], [from, to], C);
const sp = (f: number, delay = 0) =>
  spring({ frame: f - delay, fps: 30, config: { damping: 18, stiffness: 200, mass: 0.8 } });

const DotGrid: React.FC = () => (
  <div style={{
    position: 'absolute', inset: 0,
    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1.5px, transparent 1.5px)',
    backgroundSize: '36px 36px', pointerEvents: 'none',
  }} />
);

// ── Node icons ────────────────────────────────────────────────────────────────
const icons: Record<string, string> = {
  Database: '🗄️',
  Auth:     '🔑',
  Storage:  '📦',
  Realtime: '⚡',
};

// ── Code lines ────────────────────────────────────────────────────────────────
// Each line: { code: JSX, activates: node name }
const CODE_LINES: { label: string; activates: string }[] = [
  { label: 'CREATE TABLE posts (id uuid, ...);', activates: 'Database' },
  { label: 'USING (auth.uid() = user_id);',      activates: 'Auth'     },
  { label: 'SELECT * FROM storage.objects;',     activates: 'Storage'  },
  { label: "SELECT pg_notify('changes', '{}');", activates: 'Realtime' },
];

// keyword highlights per line
const highlight = (line: string) => {
  const kw = ['CREATE TABLE', 'USING', 'SELECT', 'FROM', 'pg_notify'];
  const fn = ['auth.uid()', 'pg_notify'];
  const tbl = ['posts', 'storage.objects', "'changes'", "'{}'"  ];

  let parts: { text: string; color: string }[] = [{ text: line, color: 'rgba(255,255,255,0.8)' }];

  const split = (arr: { text: string; color: string }[], word: string, color: string) =>
    arr.flatMap(p => {
      if (p.color !== 'rgba(255,255,255,0.8)') return [p];
      const segs = p.text.split(word);
      return segs.flatMap((s, i) => [
        { text: s, color: 'rgba(255,255,255,0.8)' },
        ...(i < segs.length - 1 ? [{ text: word, color }] : []),
      ]).filter(s => s.text !== '' || s.color !== 'rgba(255,255,255,0.8)');
    });

  kw.forEach(w  => { parts = split(parts, w, '#ff9f7f'); });
  fn.forEach(w  => { parts = split(parts, w, GREEN);     });
  tbl.forEach(w => { parts = split(parts, w, '#7c9cff'); });

  return parts;
};

// ── Tree node positions (absolute, right panel) ───────────────────────────────
// Root: Supabase Project  cx=1340 cy=200
// Children: evenly spaced at cy=420
const ROOT  = { cx: 1340, cy: 210 };
const NODES = [
  { name: 'Database', cx: 1060, cy: 430 },
  { name: 'Auth',     cx: 1220, cy: 430 },
  { name: 'Storage',  cx: 1380, cy: 430 },
  { name: 'Realtime', cx: 1540, cy: 430 },
];
const NODE_W = 130;
const NODE_H = 72;

// ─────────────────────────────────────────────────────────────────────────────
// Timeline (420 frames = 14s @ 30fps)
//
//   0–22   : global fade in
//  18–45   : code panel slides in from left
//  40–68   : tree slides in from right — root node + 4 dim child nodes
//
//  Per code line (staggered ~55f apart):
//  Line 0 (Database):  types in at 75,  node lights at 105
//  Line 1 (Auth):      types in at 130, node lights at 160
//  Line 2 (Storage):   types in at 185, node lights at 215
//  Line 3 (Realtime):  types in at 240, node lights at 270
//
//  295–330 : all connector lines pulse green simultaneously
//  330–370 : root node glows green, label swaps to "Postgres"
//  370–420 : hold final
// ─────────────────────────────────────────────────────────────────────────────

const LINE_FRAMES  = [75,  130, 185, 240];
const NODE_FRAMES  = [105, 160, 215, 270];
const PULSE_START  = 295;
const ROOT_GLOW    = 330;

export const SupabasePostgresExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  void useVideoConfig();

  const globalIn = itp(frame, 0, 22);
  const codeIn   = sp(frame, 18);
  const treeIn   = sp(frame, 40);

  // Which lines are visible
  const lineVisible = LINE_FRAMES.map(f => frame >= f);
  // Which nodes are lit
  const nodeGlow    = NODE_FRAMES.map(f => itp(frame, f, f + 22));
  // Connector line draw progress per node
  const lineDrawn   = NODE_FRAMES.map(f => itp(frame, f - 18, f + 2));
  // Global pulse (all lines + nodes flash brighter)
  const pulse       = itp(frame, PULSE_START, PULSE_START + 28);
  // Root glow + label swap
  const rootGlow    = itp(frame, ROOT_GLOW, ROOT_GLOW + 30);

  // Typing effect per line: reveals characters progressively
  const typed = LINE_FRAMES.map((startF, i) => {
    const full = CODE_LINES[i].label;
    const prog = itp(frame, startF, startF + 28);
    return full.slice(0, Math.floor(prog * full.length));
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', opacity: globalIn }}>
      <DotGrid />

      {/* ══ SVG: connector lines root→children ══════════════════════════════ */}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
        {NODES.map((node, i) => {
          const prog  = lineDrawn[i];
          const lit   = nodeGlow[i];
          const color = lit > 0.1
            ? `rgba(62,207,142,${0.3 + (lit + pulse * 0.4) * 0.55})`
            : `rgba(255,255,255,0.08)`;
          const x2 = ROOT.cx  + (node.cx - ROOT.cx)  * prog;
          const y2 = ROOT.cy + NODE_H / 2 + (node.cy - ROOT.cy - NODE_H / 2) * prog;
          return (
            <line key={node.name}
              x1={ROOT.cx} y1={ROOT.cy + NODE_H / 2}
              x2={x2} y2={y2}
              stroke={color} strokeWidth={1.8} strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* ══ LEFT: Code panel ════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute', left: 100, top: 250, width: 660,
        background: BOX_BG, border: `1.5px solid ${BOX_BORDER}`,
        borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
        padding: '28px 32px',
        opacity: Math.min(codeIn * 1.5, 1),
        transform: `translateX(${interpolate(codeIn, [0,1], [-60,0])}px)`,
      }}>
        {/* Traffic lights */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 22 }}>
          {['#ff5f57','#ffbd2e','#28c840'].map(c => (
            <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />
          ))}
          <span style={{ fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.2)', marginLeft: 8 }}>
            query.sql
          </span>
        </div>

        {/* Code lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {CODE_LINES.map((line, i) => {
            if (!lineVisible[i]) return null;
            const isLatest = lineVisible[i] && (i === CODE_LINES.length - 1 || !lineVisible[i + 1]);
            const fullTyped = typed[i].length === line.label.length;
            const segments  = fullTyped ? highlight(line.label) : [{ text: typed[i], color: 'rgba(255,255,255,0.8)' }];
            const lit       = nodeGlow[i] + pulse * 0.35;

            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                opacity: itp(frame, LINE_FRAMES[i], LINE_FRAMES[i] + 10),
              }}>
                {/* Left accent bar */}
                <div style={{
                  width: 2, height: 20, borderRadius: 2, flexShrink: 0, marginTop: 2,
                  background: lit > 0.05 ? GREEN : 'rgba(255,255,255,0.12)',
                  boxShadow: lit > 0.1 ? `0 0 8px rgba(62,207,142,${lit * 0.6})` : 'none',
                  transition: 'background 0.3s',
                }} />
                <div style={{ fontFamily: MONO, fontSize: 15, lineHeight: 1.5 }}>
                  {segments.map((seg, j) => (
                    <span key={j} style={{ color: seg.color }}>{seg.text}</span>
                  ))}
                  {/* blinking cursor on latest line while typing */}
                  {isLatest && !fullTyped && (
                    <span style={{
                      display: 'inline-block', width: 2, height: 14,
                      background: GREEN, marginLeft: 2, verticalAlign: 'middle',
                      opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                    }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ RIGHT: Tree ═════════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: Math.min(treeIn * 1.5, 1),
        transform: `translateX(${interpolate(treeIn, [0,1], [60,0])}px)`,
        pointerEvents: 'none',
      }}>
        {/* Root node — Supabase Project → morphs to "Postgres" */}
        <div style={{
          position: 'absolute',
          left: ROOT.cx - NODE_W * 1.1 / 2,
          top:  ROOT.cy - NODE_H / 2,
          width: NODE_W * 1.1,
          height: NODE_H,
          background: rootGlow > 0.05
            ? `rgba(62,207,142,${0.07 + rootGlow * 0.1})`
            : BOX_BG,
          border: `1.5px solid ${rootGlow > 0.05
            ? `rgba(62,207,142,${0.25 + rootGlow * 0.6})`
            : BOX_BORDER}`,
          borderRadius: 14,
          boxShadow: rootGlow > 0.1
            ? `0 0 ${32 * rootGlow}px rgba(62,207,142,${0.25 * rootGlow})`
            : '0 4px 16px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 4,
          transition: 'all 0.3s',
        }}>
          <span style={{
            fontFamily: `${interFont}, sans-serif`,
            fontSize: 13, fontWeight: 700,
            color: rootGlow > 0.5
              ? GREEN
              : 'rgba(255,255,255,0.75)',
            letterSpacing: '0.01em',
            transition: 'color 0.4s',
          }}>
            {rootGlow > 0.5 ? 'Postgres' : 'Supabase'}
          </span>
          {rootGlow <= 0.5 && (
            <span style={{ fontFamily: `${interFont}, sans-serif`, fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
              PROJECT
            </span>
          )}
        </div>

        {/* Child nodes */}
        {NODES.map((node, i) => {
          const lit   = nodeGlow[i];
          const glow  = lit + pulse * 0.4;
          const enter = sp(frame, 48 + i * 6);

          return (
            <div key={node.name} style={{
              position: 'absolute',
              left: node.cx - NODE_W / 2,
              top:  node.cy - NODE_H / 2,
              width: NODE_W,
              height: NODE_H,
              background: glow > 0.05
                ? `rgba(62,207,142,${0.06 + glow * 0.1})`
                : BOX_BG,
              border: `1.5px solid ${glow > 0.05
                ? `rgba(62,207,142,${0.2 + glow * 0.6})`
                : BOX_BORDER}`,
              borderRadius: 14,
              boxShadow: glow > 0.1
                ? `0 0 ${20 * glow}px rgba(62,207,142,${0.2 * glow})`
                : '0 4px 16px rgba(0,0,0,0.4)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 5,
              opacity: Math.min(enter * 1.5, 1),
              transform: `translateY(${interpolate(enter, [0,1], [20,0])}px)`,
              transition: 'background 0.3s, border 0.3s, box-shadow 0.3s',
            }}>
              <span style={{ fontSize: 20 }}>{icons[node.name]}</span>
              <span style={{
                fontFamily: `${interFont}, sans-serif`,
                fontSize: 12, fontWeight: 600,
                color: glow > 0.1 ? GREEN : DIM,
                transition: 'color 0.3s',
              }}>
                {node.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* ══ Supabase logo ═══════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute', bottom: 44, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
        opacity: itp(frame, 370, 395), pointerEvents: 'none',
      }}>
        <Img src={staticFile('SupabaseIcon.png')} style={{ width: 22, height: 22, objectFit: 'contain' }} />
        <span style={{ fontFamily: `${interFont}, sans-serif`, fontSize: 15, fontWeight: 700, color: GREEN }}>
          Supabase
        </span>
      </div>
    </AbsoluteFill>
  );
};