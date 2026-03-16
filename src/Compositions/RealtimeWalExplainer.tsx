import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont, fontFamily as interFont } from '@remotion/google-fonts/Inter';
import {
  BG, GREEN, FG, FG_MUTED, FG_LIGHT,
  DotGrid, itp, sp, spSlow, glowStyles, iconColor,
  BORDER, SURFACE_100, MONO,
} from '../tokens';
import { CodePanel } from '../Components/CodePanel';
import type { CodeLineData } from '../Components/CodePanel';
import { TreeNode, ConnectorLine, TravelingDot } from '../Components/TreeNode';
import { IconDatabase, IconRealtime, Radio, Zap, User } from '../Components/Icons';

loadFont('normal', { weights: ['300', '400', '500', '600', '700'] });

// ── Layout constants ──────────────────────────────────────────────────────────
const NODE_H = 100;
const NODE_W = 230;
const ROOT_W = 260;

const PANEL_X = 60;
const PANEL_Y = 130;

const RIGHT_CX   = 1390;
const ROOT_CY    = 180;
const WAL_CY     = 390;
const RT_CY      = 600;
const CLIENT_CY  = 810;

// ── Timeline ──────────────────────────────────────────────────────────────────
// 0–22   : global fade in
// 18–45  : code panel enters
// 45     : root node enters
// 60–200 : code lines type in staggered
// 100    : WAL node enters
// 120    : Realtime node enters
// 140    : Client node enters
// 155    : conn root→WAL
// 170    : conn WAL→Realtime
// 185    : conn Realtime→Client
// 200    : root glows
// 220    : WAL glows
// 240    : Realtime glows
// 260    : Client glows
// 275    : dot 1: root→WAL
// 305    : dot 2: WAL→Realtime
// 335    : dot 3: Realtime→Client
// 365–420: hold

export const RealtimeWalExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  void useVideoConfig();

  const globalIn = itp(frame, 0, 22);

  const line2Active = itp(frame, 200, 225);
  const line3Active = itp(frame, 210, 235);
  const line4Active = itp(frame, 220, 245);

  const codeLines: CodeLineData[] = [
    {
      tokens: [
        { type: 'comment', text: '// Subscribe to INSERT events via Realtime' },
      ],
      startFrame: 60,
      active: 0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'plain', text: 'supabase.' },
        { type: 'fn', text: 'channel' },
        { type: 'plain', text: '(' },
        { type: 'string', text: "'posts'" },
        { type: 'plain', text: ')' },
      ],
      startFrame: 80,
      active: line2Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '  .' },
        { type: 'fn', text: 'on' },
        { type: 'plain', text: '(' },
        { type: 'string', text: "'postgres_changes'" },
        { type: 'plain', text: ',' },
      ],
      startFrame: 108,
      active: line3Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '    { event: ' },
        { type: 'string', text: "'INSERT'" },
        { type: 'plain', text: ',' },
      ],
      startFrame: 136,
      active: line3Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '      schema: ' },
        { type: 'string', text: "'public'" },
        { type: 'plain', text: ', table: ' },
        { type: 'string', text: "'posts'" },
        { type: 'plain', text: ' },' },
      ],
      startFrame: 164,
      active: line4Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '    handler)' },
        { type: 'plain', text: '.' },
        { type: 'fn', text: 'subscribe' },
        { type: 'plain', text: '()' },
      ],
      startFrame: 192,
      active: line4Active,
      showAccent: true,
    },
  ];

  // Node glows
  const rootGlow    = itp(frame, 200, 225);
  const walGlow     = itp(frame, 220, 245);
  const rtGlow      = itp(frame, 240, 265);
  const clientGlow  = itp(frame, 260, 285);

  // Node enter
  const rootEnter   = 45;

  // Connector progresses
  const connRootWal  = itp(frame, 155, 180);
  const connWalRt    = itp(frame, 170, 195);
  const connRtClient = itp(frame, 185, 210);

  // Dots (2 cycles)
  const dot1a = itp(frame, 275, 310);
  const dot2a = itp(frame, 305, 340);
  const dot3a = itp(frame, 335, 370);
  // second pass
  const dot1b = itp(frame, 360, 395);
  const dot2b = itp(frame, 390, 420);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', opacity: globalIn }}>
      <DotGrid />

      <svg
        width={1920}
        height={1080}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
      >
        <ConnectorLine
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={WAL_CY - NODE_H / 2}
          progress={connRootWal}
          litProgress={walGlow}
          strokeWidth={3}
          arrow
          id="wal-root-wal"
        />
        <ConnectorLine
          x1={RIGHT_CX} y1={WAL_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={RT_CY - NODE_H / 2}
          progress={connWalRt}
          litProgress={rtGlow}
          strokeWidth={3}
          arrow
          id="wal-wal-rt"
        />
        <ConnectorLine
          x1={RIGHT_CX} y1={RT_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={CLIENT_CY - NODE_H / 2}
          progress={connRtClient}
          litProgress={clientGlow}
          strokeWidth={3}
          arrow
          id="wal-rt-client"
        />
        {/* Dots pass 1 */}
        <TravelingDot
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={WAL_CY - NODE_H / 2}
          progress={dot1a} radius={6} color={GREEN}
        />
        <TravelingDot
          x1={RIGHT_CX} y1={WAL_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={RT_CY - NODE_H / 2}
          progress={dot2a} radius={6} color={GREEN}
        />
        <TravelingDot
          x1={RIGHT_CX} y1={RT_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={CLIENT_CY - NODE_H / 2}
          progress={dot3a} radius={6} color={GREEN}
        />
        {/* Dots pass 2 */}
        <TravelingDot
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={WAL_CY - NODE_H / 2}
          progress={dot1b} radius={6} color={GREEN}
        />
        <TravelingDot
          x1={RIGHT_CX} y1={WAL_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={RT_CY - NODE_H / 2}
          progress={dot2b} radius={6} color={GREEN}
        />
      </svg>

      {/* LEFT: CodePanel */}
      <div style={{ position: 'absolute', left: PANEL_X, top: PANEL_Y }}>
        <CodePanel
          filename="realtime-subscribe.ts"
          lines={codeLines}
          enterFrame={18}
          enterFrom="left"
          width={880}
          codeFontSize={19}
        />
      </div>

      {/* Section label */}
      <div
        style={{
          position: 'absolute',
          left: RIGHT_CX - 160,
          top: 80,
          fontFamily: `${interFont}, sans-serif`,
          fontSize: 15,
          fontWeight: 600,
          color: FG_MUTED,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          opacity: itp(frame, 45, 65),
        }}
      >
        Realtime via WAL
      </div>

      {/* Root: INSERT into posts */}
      <TreeNode
        label="INSERT into posts"
        sublabel="postgres write"
        svgIcon={<IconDatabase size={24} color={iconColor(rootGlow)} />}
        cx={RIGHT_CX}
        cy={ROOT_CY}
        glow={rootGlow}
        enterFrame={rootEnter}
        enterFrom="below"
        root
        width={ROOT_W}
        height={NODE_H}
      />

      {/* WAL node */}
      <TreeNode
        label="WAL"
        sublabel="Write-Ahead Log"
        svgIcon={<Zap size={24} strokeWidth={1.5} color={iconColor(walGlow)} />}
        cx={RIGHT_CX}
        cy={WAL_CY}
        glow={walGlow}
        enterFrame={100}
        enterFrom="below"
        width={NODE_W}
        height={NODE_H}
      />

      {/* Realtime Server node */}
      <TreeNode
        label="Realtime Server"
        sublabel="broadcast event"
        svgIcon={<IconRealtime size={24} color={iconColor(rtGlow)} />}
        cx={RIGHT_CX}
        cy={RT_CY}
        glow={rtGlow}
        enterFrame={120}
        enterFrom="below"
        width={NODE_W}
        height={NODE_H}
      />

      {/* Client node */}
      <TreeNode
        label="Client"
        sublabel="handler() fires"
        svgIcon={<User size={24} strokeWidth={1.5} color={iconColor(clientGlow)} />}
        cx={RIGHT_CX}
        cy={CLIENT_CY}
        glow={clientGlow}
        enterFrame={140}
        enterFrom="below"
        width={NODE_W}
        height={NODE_H}
      />
    </AbsoluteFill>
  );
};
