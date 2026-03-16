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
import { IconRealtime, Users, User, Radio } from '../Components/Icons';

loadFont('normal', { weights: ['300', '400', '500', '600', '700'] });

// ── Layout constants ──────────────────────────────────────────────────────────
const NODE_H = 100;
const NODE_W = 220;
const ROOT_W = 260;

const PANEL_X = 60;
const PANEL_Y = 130;

const RIGHT_CX = 1390;
const ROOT_CY  = 200;
// Three users fanned out below
const USER_A_CX = 1200;
const USER_A_CY = 480;
const USER_B_CX = 1390;
const USER_B_CY = 480;
const USER_C_CX = 1580;
const USER_C_CY = 480;
// Sync event node
const SYNC_CY   = 760;

// ── Timeline ──────────────────────────────────────────────────────────────────
// 0–22   : global fade in
// 18–45  : code panel enters
// 45     : root Presence Channel enters
// 60–200 : code lines type in
// 100    : User A enters + joins
// 130    : User B enters + joins
// 160    : User C enters + joins
// 140    : conn root→A
// 155    : conn root→B
// 170    : conn root→C
// 195    : User A glows
// 225    : User B glows
// 255    : User C glows
// 280    : sync node enters
// 290    : conn A→sync, B→sync, C→sync
// 305    : sync node glows
// 330    : dots A→sync, B→sync, C→sync
// 390–420 : hold

export const PresenceExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  void useVideoConfig();

  const globalIn = itp(frame, 0, 22);

  const line2Active = itp(frame, 195, 220);
  const line3Active = itp(frame, 225, 250);

  const codeLines: CodeLineData[] = [
    {
      tokens: [
        { type: 'comment', text: '// Track user presence in a channel' },
      ],
      startFrame: 60,
      active: 0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'plain', text: 'channel.' },
        { type: 'fn', text: 'track' },
        { type: 'plain', text: '({' },
      ],
      startFrame: 80,
      active: line2Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '  ' },
        { type: 'table', text: 'user_id' },
        { type: 'plain', text: ': userId,' },
      ],
      startFrame: 108,
      active: line2Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '  ' },
        { type: 'table', text: 'online_at' },
        { type: 'plain', text: ': ' },
        { type: 'fn', text: 'new Date()' },
        { type: 'plain', text: '.toISOString()' },
      ],
      startFrame: 136,
      active: line2Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '})' },
      ],
      startFrame: 152,
      active: 0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'comment', text: '// React to sync events' },
      ],
      startFrame: 170,
      active: 0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'plain', text: 'channel.' },
        { type: 'fn', text: 'on' },
        { type: 'plain', text: '(' },
        { type: 'string', text: "'presence'" },
        { type: 'plain', text: ', { event: ' },
        { type: 'string', text: "'sync'" },
        { type: 'plain', text: ' },' },
      ],
      startFrame: 185,
      active: line3Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '  () => state.' },
        { type: 'fn', text: 'presenceState' },
        { type: 'plain', text: '())' },
      ],
      startFrame: 210,
      active: line3Active,
      showAccent: true,
    },
  ];

  // Glows
  const rootGlow  = itp(frame, 55, 80);
  const userAGlow = itp(frame, 195, 220);
  const userBGlow = itp(frame, 225, 250);
  const userCGlow = itp(frame, 255, 280);
  const syncGlow  = itp(frame, 305, 330);

  // Connectors
  const connRootA  = itp(frame, 140, 165);
  const connRootB  = itp(frame, 155, 180);
  const connRootC  = itp(frame, 170, 195);
  const connASync  = itp(frame, 290, 315);
  const connBSync  = itp(frame, 295, 320);
  const connCSync  = itp(frame, 300, 325);

  // Dots
  const dotASync = itp(frame, 330, 365);
  const dotBSync = itp(frame, 345, 380);
  const dotCSync = itp(frame, 360, 395);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', opacity: globalIn }}>
      <DotGrid />

      <svg
        width={1920}
        height={1080}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
      >
        {/* Root → users */}
        <ConnectorLine
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={USER_A_CX} y2={USER_A_CY - NODE_H / 2}
          progress={connRootA} litProgress={userAGlow}
          strokeWidth={3} arrow id="pres-root-a"
        />
        <ConnectorLine
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={USER_B_CX} y2={USER_B_CY - NODE_H / 2}
          progress={connRootB} litProgress={userBGlow}
          strokeWidth={3} arrow id="pres-root-b"
        />
        <ConnectorLine
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={USER_C_CX} y2={USER_C_CY - NODE_H / 2}
          progress={connRootC} litProgress={userCGlow}
          strokeWidth={3} arrow id="pres-root-c"
        />
        {/* Users → sync */}
        <ConnectorLine
          x1={USER_A_CX} y1={USER_A_CY + NODE_H / 2}
          x2={(USER_A_CX + RIGHT_CX) / 2} y2={SYNC_CY - NODE_H / 2}
          progress={connASync} litProgress={syncGlow}
          strokeWidth={3} arrow id="pres-a-sync"
        />
        <ConnectorLine
          x1={USER_B_CX} y1={USER_B_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={SYNC_CY - NODE_H / 2}
          progress={connBSync} litProgress={syncGlow}
          strokeWidth={3} arrow id="pres-b-sync"
        />
        <ConnectorLine
          x1={USER_C_CX} y1={USER_C_CY + NODE_H / 2}
          x2={(USER_C_CX + RIGHT_CX) / 2} y2={SYNC_CY - NODE_H / 2}
          progress={connCSync} litProgress={syncGlow}
          strokeWidth={3} arrow id="pres-c-sync"
        />
        {/* Traveling dots */}
        <TravelingDot
          x1={USER_A_CX} y1={USER_A_CY + NODE_H / 2}
          x2={(USER_A_CX + RIGHT_CX) / 2} y2={SYNC_CY - NODE_H / 2}
          progress={dotASync} radius={6} color={GREEN}
        />
        <TravelingDot
          x1={USER_B_CX} y1={USER_B_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={SYNC_CY - NODE_H / 2}
          progress={dotBSync} radius={6} color={GREEN}
        />
        <TravelingDot
          x1={USER_C_CX} y1={USER_C_CY + NODE_H / 2}
          x2={(USER_C_CX + RIGHT_CX) / 2} y2={SYNC_CY - NODE_H / 2}
          progress={dotCSync} radius={6} color={GREEN}
        />
      </svg>

      {/* LEFT: CodePanel */}
      <div style={{ position: 'absolute', left: PANEL_X, top: PANEL_Y }}>
        <CodePanel
          filename="presence.ts"
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
        Realtime Presence
      </div>

      {/* Root: Presence Channel */}
      <TreeNode
        label="Presence Channel"
        sublabel="shared state"
        svgIcon={<IconRealtime size={24} color={iconColor(rootGlow)} />}
        cx={RIGHT_CX}
        cy={ROOT_CY}
        glow={rootGlow}
        enterFrame={45}
        enterFrom="below"
        root
        width={ROOT_W}
        height={NODE_H}
      />

      {/* User A */}
      <TreeNode
        label="User A"
        sublabel="track() called"
        svgIcon={<User size={24} strokeWidth={1.5} color={iconColor(userAGlow)} />}
        cx={USER_A_CX}
        cy={USER_A_CY}
        glow={userAGlow}
        enterFrame={100}
        enterFrom="below"
        width={NODE_W}
        height={NODE_H}
      />

      {/* User B */}
      <TreeNode
        label="User B"
        sublabel="track() called"
        svgIcon={<User size={24} strokeWidth={1.5} color={iconColor(userBGlow)} />}
        cx={USER_B_CX}
        cy={USER_B_CY}
        glow={userBGlow}
        enterFrame={130}
        enterFrom="below"
        width={NODE_W}
        height={NODE_H}
      />

      {/* User C */}
      <TreeNode
        label="User C"
        sublabel="track() called"
        svgIcon={<User size={24} strokeWidth={1.5} color={iconColor(userCGlow)} />}
        cx={USER_C_CX}
        cy={USER_C_CY}
        glow={userCGlow}
        enterFrame={160}
        enterFrom="below"
        width={NODE_W}
        height={NODE_H}
      />

      {/* Sync event node */}
      <TreeNode
        label="'sync' event"
        sublabel="presenceState()"
        svgIcon={<Radio size={24} strokeWidth={1.5} color={iconColor(syncGlow)} />}
        cx={RIGHT_CX}
        cy={SYNC_CY}
        glow={syncGlow}
        enterFrame={280}
        enterFrom="below"
        width={NODE_W + 10}
        height={NODE_H}
      />
    </AbsoluteFill>
  );
};
