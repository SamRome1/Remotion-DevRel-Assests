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
  DotGrid,
  itp,
  iconColor,
} from '../tokens';
import { CodePanel } from '../Components/CodePanel';
import type { CodeLineData } from '../Components/CodePanel';
import { TreeNode, ConnectorLine, TravelingDot } from '../Components/TreeNode';
import { IconDatabase, IconAuth, IconStorage, HardDrive, Link } from '../Components/Icons';

loadFont('normal', { weights: ['300', '400', '500', '600', '700'] });

// ─────────────────────────────────────────────────────────────────────────────
// Layout constants
// ─────────────────────────────────────────────────────────────────────────────

// Tree centered at cx=1440 (center of right half: 960–1920)
// Nodes fill the full right half — split pair spread to cx=1200 / cx=1680
const ROOT_CX = 1440;
const ROOT_CY = 170;
const AUTH_CX = 1440;
const AUTH_CY = 330;
const S3_CX   = 1200;
const S3_CY   = 500;
const PG_CX   = 1680;
const PG_CY   = 500;
const URL_CX  = 1440;
const URL_CY  = 670;
const NODE_H  = 80;

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
          x1={AUTH_CX} y1={AUTH_CY + NODE_H / 2}
          x2={S3_CX}   y2={S3_CY   - NODE_H / 2}
          progress={conn1}
          litProgress={s3Glow}
          id="auth-s3"
        />
        <TravelingDot
          x1={AUTH_CX} y1={AUTH_CY + NODE_H / 2}
          x2={S3_CX}   y2={S3_CY   - NODE_H / 2}
          progress={dot1}
        />

        {/* 3. Auth Check → Postgres (diagonal right) — same frame as conn1 */}
        <ConnectorLine
          x1={AUTH_CX} y1={AUTH_CY + NODE_H / 2}
          x2={PG_CX}   y2={PG_CY   - NODE_H / 2}
          progress={conn2}
          litProgress={pgGlow}
          id="auth-pg"
        />
        <TravelingDot
          x1={AUTH_CX} y1={AUTH_CY + NODE_H / 2}
          x2={PG_CX}   y2={PG_CY   - NODE_H / 2}
          progress={dot2}
        />

        {/* 4. S3 → URL (diagonal right back to center) */}
        <ConnectorLine
          x1={S3_CX}  y1={S3_CY  + NODE_H / 2}
          x2={URL_CX} y2={URL_CY - NODE_H / 2}
          progress={conn3}
          litProgress={urlGlow}
          id="s3-url"
        />
        <TravelingDot
          x1={S3_CX}  y1={S3_CY  + NODE_H / 2}
          x2={URL_CX} y2={URL_CY - NODE_H / 2}
          progress={dot3}
        />

        {/* 5. Postgres → URL (diagonal left back to center) — same frame as conn3 */}
        <ConnectorLine
          x1={PG_CX}  y1={PG_CY  + NODE_H / 2}
          x2={URL_CX} y2={URL_CY - NODE_H / 2}
          progress={conn4}
          litProgress={urlGlow}
          id="pg-url"
        />
        <TravelingDot
          x1={PG_CX}  y1={PG_CY  + NODE_H / 2}
          x2={URL_CX} y2={URL_CY - NODE_H / 2}
          progress={dot4}
        />
      </svg>

      {/* ══ LEFT: Code panel ════════════════════════════════════════════════ */}
      <CodePanel
        filename="upload.ts"
        lines={lines}
        enterFrame={18}
        enterFrom="left"
        width={760}
        style={{ position: 'absolute', left: 80, top: 300 }}
      />

      {/* ══ RIGHT: Tree diagram (vertical stack) ════════════════════════════ */}

      {/* Root — storage.upload() */}
      <TreeNode
        label="storage.upload()"
        svgIcon={<IconStorage size={22} color={iconColor(rootGlow)} />}
        cx={ROOT_CX}
        cy={ROOT_CY}
        glow={rootGlow}
        enterFrame={45}
        enterFrom="below"
        root
        width={190}
        height={NODE_H}
      />

      {/* Node 1 — Auth Check */}
      <TreeNode
        label="Auth Check"
        sublabel="auth.uid() = owner"
        svgIcon={<IconAuth size={20} color={iconColor(authGlow)} />}
        cx={AUTH_CX}
        cy={AUTH_CY}
        glow={authGlow}
        enterFrame={55}
        enterFrom="below"
        width={160}
        height={NODE_H}
      />

      {/* Node 2a — S3 Storage */}
      <TreeNode
        label="S3 Storage"
        sublabel="file stored"
        svgIcon={<HardDrive size={20} strokeWidth={1.5} color={iconColor(s3Glow)} />}
        cx={S3_CX}
        cy={S3_CY}
        glow={s3Glow}
        enterFrame={65}
        enterFrom="below"
        width={160}
        height={NODE_H}
      />

      {/* Node 2b — Postgres (lights at exactly the same frame as S3) */}
      <TreeNode
        label="Postgres"
        sublabel="metadata saved"
        svgIcon={<IconDatabase size={20} color={iconColor(pgGlow)} />}
        cx={PG_CX}
        cy={PG_CY}
        glow={pgGlow}
        enterFrame={65}
        enterFrom="below"
        width={160}
        height={NODE_H}
      />

      {/* Node 3 — Public URL */}
      <TreeNode
        label="Public URL"
        sublabel="data.path returned"
        svgIcon={<Link size={20} strokeWidth={1.5} color={iconColor(urlGlow)} />}
        cx={URL_CX}
        cy={URL_CY}
        glow={urlGlow}
        enterFrame={75}
        enterFrom="below"
        width={160}
        height={NODE_H}
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
