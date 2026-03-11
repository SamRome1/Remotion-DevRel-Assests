import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile,
} from 'remotion';
import { loadFont, fontFamily as interFont } from '@remotion/google-fonts/Inter';
import {
  GREEN,
  BG,
  MONO,
  FG_MUTED,
  DotGrid,
  itp,
} from '../tokens';
import { CodePanel } from '../Components/CodePanel';
import type { CodeLineData } from '../Components/CodePanel';
import { TreeNode, ConnectorLine, TravelingDot } from '../Components/TreeNode';

loadFont('normal', { weights: ['300', '400', '500', '600', '700'] });

// ─────────────────────────────────────────────────────────────────────────────
// Layout constants
// ─────────────────────────────────────────────────────────────────────────────

const ROOT_CX = 1280;
const ROOT_CY = 160;
const AUTH_CX = 1280;
const AUTH_CY = 310;
const S3_CX   = 1140;
const S3_CY   = 470;
const PG_CX   = 1420;
const PG_CY   = 470;
const URL_CX  = 1280;
const URL_CY  = 630;
const NODE_H  = 72;

// ─────────────────────────────────────────────────────────────────────────────
// Timeline (420 frames = 14s @ 30fps)
//
//   0–22   : global fade in
//  18–45   : code panel slides in from left (spSlow, handled by CodePanel)
//  45–75   : tree nodes enter from below (staggered)
//
//  60–88   : line 1 types in — no activation
//  90–118  : line 2 types in — supabase.storage
//  120–148 : line 3 types in — .from('avatars')
//  150–178 : line 4 types in — .upload(...)
//
//  165–187 : root node glows (storage.upload() lights up)
//  165–185 : root → auth connector draws
//  200–222 : auth check glows
//  200–220 : auth → S3 and auth → Postgres connectors draw simultaneously
//  238–260 : S3 and Postgres glow simultaneously — key visual moment
//  238–258 : S3 → URL and Postgres → URL connectors draw
//  245–260 : "happens in parallel" label fades in
//  290–312 : Public URL glows
//  390–414 : Supabase logo fades in
// ─────────────────────────────────────────────────────────────────────────────

export const StorageUploadExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  void useVideoConfig();

  const globalIn = itp(frame, 0, 22);

  // ── Glow progresses ───────────────────────────────────────────────────────
  const rootGlow = itp(frame, 165, 187);
  const authGlow = itp(frame, 200, 222);
  const s3Glow   = itp(frame, 238, 260);
  const pgGlow   = itp(frame, 238, 260);
  const urlGlow  = itp(frame, 290, 312);

  // ── Connector draw progresses ─────────────────────────────────────────────
  const conn0 = itp(frame, 165, 185); // root → auth
  const conn1 = itp(frame, 200, 220); // auth → S3
  const conn2 = itp(frame, 200, 220); // auth → Postgres (same frame as conn1)
  const conn3 = itp(frame, 238, 258); // S3 → URL
  const conn4 = itp(frame, 238, 258); // Postgres → URL (same frame as conn3)

  // ── Traveling dot progresses (5f after connector, 35f travel) ─────────────
  const dot0 = itp(frame, 170, 205); // root → auth
  const dot1 = itp(frame, 205, 240); // auth → S3
  const dot2 = itp(frame, 205, 240); // auth → Postgres
  const dot3 = itp(frame, 243, 278); // S3 → URL
  const dot4 = itp(frame, 243, 278); // Postgres → URL

  // ── "happens in parallel" label ───────────────────────────────────────────
  const parallelOp = itp(frame, 245, 260);

  // ── Logo ──────────────────────────────────────────────────────────────────
  const logoOp = itp(frame, 390, 414);

  // ── Code lines ────────────────────────────────────────────────────────────
  const lines: CodeLineData[] = [
    {
      tokens: [
        { type: 'keyword', text: 'const' },
        { type: 'plain',   text: ' { data, error } = await' },
      ],
      startFrame: 60,
      active:     0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'plain',  text: '  ' },
        { type: 'table',  text: 'supabase' },
        { type: 'plain',  text: '.' },
        { type: 'fn',     text: 'storage' },
      ],
      startFrame: 90,
      active:     rootGlow,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain',  text: '  .' },
        { type: 'fn',     text: 'from' },
        { type: 'plain',  text: '(' },
        { type: 'string', text: "'avatars'" },
        { type: 'plain',  text: ')' },
      ],
      startFrame: 120,
      active:     0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'plain',  text: '  .' },
        { type: 'fn',     text: 'upload' },
        { type: 'plain',  text: '(' },
        { type: 'string', text: "'avatar.png'" },
        { type: 'plain',  text: ', file);' },
      ],
      startFrame: 150,
      active:     rootGlow,
      showAccent: true,
    },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', opacity: globalIn }}>
      <DotGrid />

      {/* ══ SVG: connector lines & traveling dots ═══════════════════════════ */}
      <svg
        width={1920}
        height={1080}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
      >
        {/* 1. Root → Auth Check */}
        <ConnectorLine
          x1={ROOT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={AUTH_CX} y2={AUTH_CY - NODE_H / 2}
          progress={conn0}
          litProgress={authGlow}
          id="root-auth"
        />
        <TravelingDot
          x1={ROOT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={AUTH_CX} y2={AUTH_CY - NODE_H / 2}
          progress={dot0}
        />

        {/* 2. Auth Check → S3 (diagonal left) */}
        <ConnectorLine
          x1={1280} y1={346}
          x2={1140} y2={434}
          progress={conn1}
          litProgress={s3Glow}
          id="auth-s3"
        />
        <TravelingDot
          x1={1280} y1={346}
          x2={1140} y2={434}
          progress={dot1}
        />

        {/* 3. Auth Check → Postgres (diagonal right) — same frame as conn1 */}
        <ConnectorLine
          x1={1280} y1={346}
          x2={1420} y2={434}
          progress={conn2}
          litProgress={pgGlow}
          id="auth-pg"
        />
        <TravelingDot
          x1={1280} y1={346}
          x2={1420} y2={434}
          progress={dot2}
        />

        {/* 4. S3 → URL (diagonal right back to center) */}
        <ConnectorLine
          x1={1140} y1={506}
          x2={1280} y2={594}
          progress={conn3}
          litProgress={urlGlow}
          id="s3-url"
        />
        <TravelingDot
          x1={1140} y1={506}
          x2={1280} y2={594}
          progress={dot3}
        />

        {/* 5. Postgres → URL (diagonal left back to center) — same frame as conn3 */}
        <ConnectorLine
          x1={1420} y1={506}
          x2={1280} y2={594}
          progress={conn4}
          litProgress={urlGlow}
          id="pg-url"
        />
        <TravelingDot
          x1={1420} y1={506}
          x2={1280} y2={594}
          progress={dot4}
        />
      </svg>

      {/* ══ LEFT: Code panel ════════════════════════════════════════════════ */}
      <CodePanel
        filename="upload.ts"
        lines={lines}
        enterFrame={18}
        enterFrom="left"
        width={580}
        style={{ position: 'absolute', left: 100, top: 300 }}
      />

      {/* ══ RIGHT: Tree diagram (vertical stack) ════════════════════════════ */}

      {/* Root — storage.upload() */}
      <TreeNode
        label="storage.upload()"
        icon="📦"
        cx={ROOT_CX}
        cy={ROOT_CY}
        glow={rootGlow}
        enterFrame={45}
        enterFrom="below"
        root
        width={160}
      />

      {/* Node 1 — Auth Check */}
      <TreeNode
        label="Auth Check"
        sublabel="auth.uid() = owner"
        icon="🔑"
        cx={AUTH_CX}
        cy={AUTH_CY}
        glow={authGlow}
        enterFrame={55}
        enterFrom="below"
      />

      {/* Node 2a — S3 Storage */}
      <TreeNode
        label="S3 Storage"
        sublabel="file stored"
        icon="🗄️"
        cx={S3_CX}
        cy={S3_CY}
        glow={s3Glow}
        enterFrame={65}
        enterFrom="below"
      />

      {/* Node 2b — Postgres (lights at exactly the same frame as S3) */}
      <TreeNode
        label="Postgres"
        sublabel="metadata saved"
        icon="🐘"
        cx={PG_CX}
        cy={PG_CY}
        glow={pgGlow}
        enterFrame={65}
        enterFrom="below"
      />

      {/* "happens in parallel" — centered between S3 and Postgres */}
      {parallelOp > 0 && (
        <div
          style={{
            position:      'absolute',
            left:          PG_CX,
            top:           S3_CY,
            transform:     'translate(-50%, -50%)',
            opacity:       parallelOp,
            pointerEvents: 'none',
            whiteSpace:    'nowrap',
          }}
        >
          <span
            style={{
              fontFamily:    `${interFont}, sans-serif`,
              fontSize:      12,
              color:         FG_MUTED,
              letterSpacing: '0.04em',
            }}
          >
            happens in parallel
          </span>
        </div>
      )}

      {/* Node 3 — Public URL */}
      <TreeNode
        label="Public URL"
        sublabel="data.path returned"
        icon="🔗"
        cx={URL_CX}
        cy={URL_CY}
        glow={urlGlow}
        enterFrame={75}
        enterFrom="below"
      />

      {/* ══ Supabase logo ═══════════════════════════════════════════════════ */}
      <div
        style={{
          position:       'absolute',
          bottom:         44,
          left:           0,
          right:          0,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            9,
          opacity:        logoOp,
          pointerEvents:  'none',
        }}
      >
        <Img
          src={staticFile('SupabaseIcon.png')}
          style={{ width: 22, height: 22, objectFit: 'contain' }}
        />
        <span
          style={{
            fontFamily: `${interFont}, sans-serif`,
            fontSize:   15,
            fontWeight: 700,
            color:      GREEN,
          }}
        >
          Supabase
        </span>
      </div>
    </AbsoluteFill>
  );
};
