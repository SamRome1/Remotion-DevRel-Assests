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
const RED        = '#ff5555';
const BG         = '#0f0f0f';
const BOX_BG     = '#1a1a1a';
const BOX_BORDER = '#2a2a2a';
const MONO       = '"JetBrains Mono", "Fira Code", ui-monospace, monospace';
const BLUE       = '#7c9cff';
const PINK       = '#f97583';

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

const Check: React.FC<{ op: number }> = ({ op }) => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none" style={{ opacity: op, flexShrink: 0 }}>
    <circle cx={8} cy={8} r={7} fill="rgba(62,207,142,0.15)" stroke={GREEN} strokeWidth={1.4} />
    <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke={GREEN} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Cross: React.FC<{ op: number }> = ({ op }) => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none" style={{ opacity: op, flexShrink: 0 }}>
    <circle cx={8} cy={8} r={7} fill="rgba(255,85,85,0.12)" stroke={RED} strokeWidth={1.4} />
    <path d="M5 5l6 6M11 5l-6 6" stroke={RED} strokeWidth={1.6} strokeLinecap="round" />
  </svg>
);

// ── All rows in the posts table ───────────────────────────────────────────────
const ALL_ROWS = [
  { id: 'post-1', userId: 'user-a', content: 'Hello world' },
  { id: 'post-2', userId: 'user-b', content: 'My first post' },
  { id: 'post-3', userId: 'user-a', content: 'Another post' },
  { id: 'post-4', userId: 'user-b', content: 'Great content' },
  { id: 'post-5', userId: 'user-a', content: 'Final thoughts' },
];

const USER_A_ROWS = ALL_ROWS.filter(r => r.userId === 'user-a');
const USER_B_ROWS = ALL_ROWS.filter(r => r.userId === 'user-b');

// ── Reusable table row ────────────────────────────────────────────────────────
const TableRow: React.FC<{
  id: string; userId: string; content: string;
  highlight?: 'allow' | 'deny' | 'none';
  colWidths: number[];
  compact?: boolean;
}> = ({ id, userId, content, highlight = 'none', colWidths, compact }) => {
  const bg     = highlight === 'allow' ? 'rgba(62,207,142,0.08)'
               : highlight === 'deny'  ? 'rgba(255,85,85,0.06)'
               : BOX_BG;
  const border = highlight === 'allow' ? 'rgba(62,207,142,0.3)'
               : highlight === 'deny'  ? 'rgba(255,85,85,0.25)'
               : BOX_BORDER;
  const op     = highlight === 'deny' ? 0.35 : 1;
  const h      = compact ? 36 : 42;

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: bg, border: `1px solid ${border}`,
      borderRadius: 7, overflow: 'hidden', height: h, opacity: op,
      transition: 'all 0.35s ease',
    }}>
      <div style={{ width: colWidths[0], flexShrink: 0, padding: '0 14px', fontFamily: MONO, fontSize: compact ? 12 : 13, color: 'rgba(255,255,255,0.45)', borderRight: `1px solid ${BOX_BORDER}` }}>{id}</div>
      <div style={{ width: colWidths[1], flexShrink: 0, padding: '0 14px', fontFamily: MONO, fontSize: compact ? 12 : 13, color: userId === 'user-a' ? BLUE : PINK, borderRight: `1px solid ${BOX_BORDER}` }}>{userId}</div>
      <div style={{ flex: 1, padding: '0 14px', fontFamily: MONO, fontSize: compact ? 12 : 13, color: 'rgba(255,255,255,0.65)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{content}</div>
      {highlight !== 'none' && (
        <div style={{ width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Check op={highlight === 'allow' ? 1 : 0} />
          <Cross op={highlight === 'deny'  ? 1 : 0} />
        </div>
      )}
    </div>
  );
};

// ── Table header ──────────────────────────────────────────────────────────────
const TableHeader: React.FC<{ colWidths: number[]; showCheck?: boolean; compact?: boolean }> = ({ colWidths, showCheck, compact }) => (
  <div style={{
    display: 'flex', alignItems: 'center',
    background: '#141414', border: `1px solid ${BOX_BORDER}`,
    borderRadius: '8px 8px 0 0', height: compact ? 30 : 34, overflow: 'hidden',
  }}>
    {['id','user_id','content'].map((l, i) => (
      <div key={l} style={{
        width: i < 2 ? colWidths[i] : undefined, flex: i === 2 ? 1 : undefined,
        flexShrink: 0, padding: '0 14px',
        fontFamily: MONO, fontSize: 10, fontWeight: 600,
        color: i === 1 ? BLUE : 'rgba(255,255,255,0.28)',
        letterSpacing: '0.07em', textTransform: 'uppercase' as const,
        borderRight: i < 2 ? `1px solid ${BOX_BORDER}` : 'none',
      }}>{l}</div>
    ))}
    {showCheck && <div style={{ width: 36, flexShrink: 0 }} />}
  </div>
);

// ── Syntax-highlighted RLS policy ─────────────────────────────────────────────
const Policy: React.FC = () => (
  <div style={{ fontFamily: MONO, fontSize: 18, lineHeight: 1.9, color: 'rgba(255,255,255,0.85)' }}>
    <div><span style={{ color: '#ff9f7f' }}>CREATE POLICY</span></div>
    <div style={{ paddingLeft: 16 }}><span style={{ color: 'rgba(255,255,255,0.45)' }}>"users can see own rows"</span></div>
    <div><span style={{ color: '#ff9f7f' }}>ON</span> <span style={{ color: 'rgba(255,255,255,0.85)' }}>posts</span> <span style={{ color: '#ff9f7f' }}>FOR SELECT</span></div>
    <div><span style={{ color: '#ff9f7f' }}>USING</span> {'('}</div>
    <div style={{ paddingLeft: 16 }}>
      <span style={{ color: GREEN }}>auth.uid()</span>
      <span style={{ color: 'rgba(255,255,255,0.5)' }}> = </span>
      <span style={{ color: BLUE }}>user_id</span>
    </div>
    <div>{')'};</div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Timeline (480 frames = 16s @ 30fps)
//
//   0–25   : fade in
//  20–45   : RLS panel slides in from left
//  35–65   : full table slides in from right, rows stagger
//  65–130  : hold — both visible together
// 128–158  : RLS panel slides OUT left
// 128–158  : full table slides LEFT to center-left position
// 155–185  : terminal box slides in from right (User A query)
// 185–230  : User A result rows stagger in
// 230–270  : hold User A
// 268–298  : terminal swaps to User B (query line fades, uid annotation swaps)
// 295–340  : User B result rows stagger in
// 340–390  : hold User B
// 368–400  : payoff text fades in
// 400–480  : hold final
// ─────────────────────────────────────────────────────────────────────────────

export const AuthUidExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  void useVideoConfig();

  const globalIn    = itp(frame, 0, 22);

  // Phase 1 — both panels enter
  const rlsIn       = sp(frame, 20);
  const tableIn     = sp(frame, 35);

  // Phase 2 — RLS exits, table shifts left, terminal enters
  const rlsOut      = itp(frame, 128, 155, 0, 1);       // 0=visible 1=gone
  const tableShift  = itp(frame, 128, 158, 0, 1);       // 0=right pos 1=left pos
  const termIn      = sp(frame, 158);

  // Phase 3 — User A results
  const showUserA   = frame >= 185;
  const userARowIn  = (i: number) => sp(frame, 188 + i * 8);

  // Phase 4 — swap to User B
  const swapToBIn   = itp(frame, 268, 292);             // 0=A 1=B
  const showUserB   = swapToBIn > 0.5;
  const userBRowIn  = (i: number) => sp(frame, 298 + i * 8);

  // Payoff
  const payoffIn    = itp(frame, 368, 392);
  const logoIn      = itp(frame, 400, 424);

  // Full table: highlight state
  // Before terminal: neutral. After terminal: highlight rows matching current user
  const highlightActive = frame >= 195;
  const currentUser     = showUserB ? 'user-b' : 'user-a';
  const getHighlight = (userId: string): 'allow' | 'deny' | 'none' => {
    if (!highlightActive) return 'none';
    return userId === currentUser ? 'allow' : 'deny';
  };

  // Layout constants
  const TABLE_LEFT_INIT  = 1000;  // starting x (right side)
  const TABLE_LEFT_FINAL = 80;    // shifted x (center-left)
  const tableLeft = interpolate(tableShift, [0,1], [TABLE_LEFT_INIT, TABLE_LEFT_FINAL], C);
  const tableWidth = 840;

  const TERM_LEFT  = 980;
  const TERM_WIDTH = 860;

  const CW = [80, 190]; // colWidths for full table

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', opacity: globalIn }}>
      <DotGrid />

      {/* ══ RLS Policy panel ════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute',
        left: 80,
        top: 200,
        width: 840,
        background: BOX_BG,
        border: `1.5px solid ${BOX_BORDER}`,
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
        padding: '28px 32px',
        opacity: Math.min(rlsIn * 1.5, 1) * (1 - rlsOut),
        transform: `translateX(${interpolate(rlsIn, [0,1], [-60,0])}px) translateX(${interpolate(rlsOut, [0,1], [0,-680])}px)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
          {['#ff5f57','#ffbd2e','#28c840'].map(c => (
            <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />
          ))}
          <span style={{ fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.22)', marginLeft: 8 }}>rls_policy.sql</span>
        </div>
        <Policy />
      </div>

      {/* ══ Full posts table (shifts left in phase 2) ═══════════════════════ */}
      <div style={{
        position: 'absolute',
        left: tableLeft,
        top: 160,
        width: tableWidth,
        opacity: Math.min(tableIn * 1.5, 1),
        transform: `translateX(${interpolate(tableIn, [0,1], [60,0])}px)`,
      }}>
        {/* Table label */}
        <div style={{
          fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.25)',
          marginBottom: 8, letterSpacing: '0.06em',
        }}>
          posts
        </div>

        <TableHeader colWidths={CW} showCheck={highlightActive} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 3 }}>
          {ALL_ROWS.map((row, i) => {
            const enter = sp(frame, 40 + i * 7);
            return (
              <div key={row.id} style={{
                opacity: Math.min(enter * 1.5, 1),
                transform: `translateX(${interpolate(enter, [0,1], [16,0])}px)`,
              }}>
                <TableRow
                  {...row}
                  highlight={getHighlight(row.userId)}
                  colWidths={CW}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ Terminal / results panel ═════════════════════════════════════════ */}
      <div style={{
        position: 'absolute',
        left: TERM_LEFT,
        top: 160,
        width: TERM_WIDTH,
        opacity: Math.min(termIn * 1.5, 1),
        transform: `translateX(${interpolate(termIn, [0,1], [60,0])}px)`,
      }}>
        {/* Terminal box */}
        <div style={{
          background: BOX_BG,
          border: `1.5px solid ${BOX_BORDER}`,
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
          padding: '22px 28px',
          marginBottom: 14,
        }}>
          {/* Traffic lights */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 18 }}>
            {['#ff5f57','#ffbd2e','#28c840'].map(c => (
              <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />
            ))}
            <span style={{ fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.22)', marginLeft: 8 }}>psql</span>
          </div>

          {/* Query */}
          <div style={{ fontFamily: MONO, fontSize: 17, lineHeight: 1.8 }}>
            <div style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 4, transition: 'color 0.3s' }}>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>-- authenticated as </span>
              <span style={{
                color: showUserB ? PINK : BLUE,
                transition: 'color 0.35s',
              }}>
                {showUserB ? 'user-b' : 'user-a'}
              </span>
            </div>
            <div>
              <span style={{ color: '#ff9f7f' }}>SELECT</span>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}> * </span>
              <span style={{ color: '#ff9f7f' }}>FROM</span>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}> posts;</span>
            </div>
          </div>
        </div>

        {/* Results mini-table */}
        {showUserA && (
          <div style={{ opacity: itp(frame, 185, 200) }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.22)', marginBottom: 6, letterSpacing: '0.05em' }}>
              {showUserB ? '2 rows' : '3 rows'}
            </div>

            <TableHeader colWidths={[70, 160]} compact />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 3 }}>
              {(showUserB ? USER_B_ROWS : USER_A_ROWS).map((row, i) => {
                const prog = showUserB ? userBRowIn(i) : userARowIn(i);
                return (
                  <div key={row.id + (showUserB ? '-b' : '-a')} style={{
                    opacity: Math.min(prog * 2, 1),
                    transform: `translateY(${interpolate(prog, [0,1], [8,0])}px)`,
                  }}>
                    <TableRow {...row} highlight="allow" colWidths={[70, 160]} compact />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ══ Payoff ══════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute', bottom: 100, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        opacity: payoffIn, pointerEvents: 'none',
        transform: `translateY(${interpolate(payoffIn, [0,1], [12,0])}px)`,
      }}>
        <div style={{ fontFamily: MONO, fontSize: 26, fontWeight: 700, textAlign: 'center' }}>
          <span style={{ color: GREEN }}>auth.uid()</span>
          <span style={{ color: 'rgba(255,255,255,0.9)' }}> makes every policy personal.</span>
        </div>
        <div style={{ fontFamily: `${interFont}, sans-serif`, fontSize: 17, color: 'rgba(255,255,255,0.32)', textAlign: 'center' }}>
          Same policy. Same table. Different identity — different data.
        </div>
      </div>

      {/* ══ Supabase logo ═══════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute', bottom: 40, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
        opacity: logoIn, pointerEvents: 'none',
      }}>
        <Img src={staticFile('SupabaseIcon.png')} style={{ width: 22, height: 22, objectFit: 'contain' }} />
        <span style={{ fontFamily: `${interFont}, sans-serif`, fontSize: 15, fontWeight: 700, color: GREEN }}>
          Supabase
        </span>
      </div>
    </AbsoluteFill>
  );
};