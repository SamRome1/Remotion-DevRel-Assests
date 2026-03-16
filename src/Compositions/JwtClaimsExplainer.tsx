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
import { IconAuth, IconDatabase, Key, KeyRound } from '../Components/Icons';

loadFont('normal', { weights: ['300', '400', '500', '600', '700'] });

// ── Layout constants ──────────────────────────────────────────────────────────
const NODE_H = 100;
const NODE_W = 240;
const ROOT_W = 260;

const PANEL_X = 60;
const PANEL_Y = 160;

const RIGHT_CX = 1390;
const ROOT_CY  = 190;
const UID_CY   = 430;
const ROLE_CY  = 620;
const EMAIL_CY = 810;

// ── Timeline ──────────────────────────────────────────────────────────────────
// 0–22   : global fade in
// 18–45  : code panel enters
// 45–90  : root node enters
// 60     : line 1 types (JWT header comment)
// 90     : line 2 types (sub)
// 120    : line 3 types (role)
// 150    : line 4 types (email)
// 130    : uid node enters
// 140    : role node enters
// 150    : email node enters
// 160    : connector root→uid
// 170    : connector root→role
// 180    : connector root→email
// 190    : uid node glows (sub field active)
// 220    : role node glows
// 250    : email node glows
// 280    : dot root→uid
// 310    : dot root→role
// 340    : dot root→email

export const JwtClaimsExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  void useVideoConfig();

  const globalIn = itp(frame, 0, 22);

  const line1Active = itp(frame, 190, 215);
  const line2Active = itp(frame, 220, 245);
  const line3Active = itp(frame, 250, 275);

  const codeLines: CodeLineData[] = [
    {
      tokens: [
        { type: 'comment', text: '// JWT payload — decoded' },
      ],
      startFrame: 60,
      active: 0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'plain', text: '{' },
      ],
      startFrame: 75,
      active: 0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'plain', text: '  ' },
        { type: 'table', text: '"sub"' },
        { type: 'plain', text: ': ' },
        { type: 'string', text: '"a1b2-c3d4-uuid"' },
        { type: 'plain', text: ',' },
      ],
      startFrame: 90,
      active: line1Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '  ' },
        { type: 'table', text: '"role"' },
        { type: 'plain', text: ': ' },
        { type: 'string', text: '"authenticated"' },
        { type: 'plain', text: ',' },
      ],
      startFrame: 120,
      active: line2Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '  ' },
        { type: 'table', text: '"email"' },
        { type: 'plain', text: ': ' },
        { type: 'string', text: '"user@example.com"' },
      ],
      startFrame: 150,
      active: line3Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '}' },
      ],
      startFrame: 175,
      active: 0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'comment', text: '-- Inside RLS policy:' },
      ],
      startFrame: 200,
      active: 0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'keyword', text: 'USING' },
        { type: 'plain', text: ' (' },
        { type: 'fn', text: 'auth.uid()' },
        { type: 'plain', text: ' = ' },
        { type: 'table', text: 'user_id' },
        { type: 'plain', text: ')' },
      ],
      startFrame: 215,
      active: itp(frame, 215, 240),
      showAccent: true,
    },
  ];

  // Node glows
  const rootGlow  = itp(frame, 55, 80);
  const uidGlow   = itp(frame, 190, 215);
  const roleGlow  = itp(frame, 220, 245);
  const emailGlow = itp(frame, 250, 275);

  // Connector progresses
  const conn1Prog = itp(frame, 160, 185);
  const conn2Prog = itp(frame, 170, 195);
  const conn3Prog = itp(frame, 180, 205);

  // Dot progresses
  const dot1Prog = itp(frame, 280, 315);
  const dot2Prog = itp(frame, 310, 345);
  const dot3Prog = itp(frame, 340, 360);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', opacity: globalIn }}>
      <DotGrid />

      <svg
        width={1920}
        height={1080}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
      >
        {/* Root → auth.uid() */}
        <ConnectorLine
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={UID_CY - NODE_H / 2}
          progress={conn1Prog}
          litProgress={uidGlow}
          strokeWidth={3}
          arrow
          id="jwt-root-uid"
        />
        {/* Root → auth.role() */}
        <ConnectorLine
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={ROLE_CY - NODE_H / 2}
          progress={conn2Prog}
          litProgress={roleGlow}
          strokeWidth={3}
          arrow
          id="jwt-root-role"
        />
        {/* Root → auth.jwt()->'email' */}
        <ConnectorLine
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={EMAIL_CY - NODE_H / 2}
          progress={conn3Prog}
          litProgress={emailGlow}
          strokeWidth={3}
          arrow
          id="jwt-root-email"
        />
        {/* Traveling dots */}
        <TravelingDot
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={UID_CY - NODE_H / 2}
          progress={dot1Prog}
          radius={6}
          color={GREEN}
        />
        <TravelingDot
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={ROLE_CY - NODE_H / 2}
          progress={dot2Prog}
          radius={6}
          color={GREEN}
        />
        <TravelingDot
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={EMAIL_CY - NODE_H / 2}
          progress={dot3Prog}
          radius={6}
          color={GREEN}
        />
      </svg>

      {/* LEFT: CodePanel */}
      <div style={{ position: 'absolute', left: PANEL_X, top: PANEL_Y }}>
        <CodePanel
          filename="jwt-payload.ts"
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
          left: RIGHT_CX - 140,
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
        JWT → Postgres Claims
      </div>

      {/* Root: JWT Token */}
      <TreeNode
        label="JWT Token"
        sublabel="decoded payload"
        svgIcon={<KeyRound size={24} strokeWidth={1.5} color={iconColor(rootGlow)} />}
        cx={RIGHT_CX}
        cy={ROOT_CY}
        glow={rootGlow}
        enterFrame={45}
        enterFrom="below"
        root
        width={ROOT_W}
        height={NODE_H}
      />

      {/* auth.uid() node */}
      <TreeNode
        label="auth.uid()"
        sublabel={`sub: "a1b2-c3d4"`}
        svgIcon={<Key size={24} strokeWidth={1.5} color={iconColor(uidGlow)} />}
        cx={RIGHT_CX}
        cy={UID_CY}
        glow={uidGlow}
        enterFrame={130}
        enterFrom="below"
        width={NODE_W}
        height={NODE_H}
      />

      {/* auth.role() node */}
      <TreeNode
        label="auth.role()"
        sublabel={`role: "authenticated"`}
        svgIcon={<IconAuth size={24} color={iconColor(roleGlow)} />}
        cx={RIGHT_CX}
        cy={ROLE_CY}
        glow={roleGlow}
        enterFrame={140}
        enterFrom="below"
        width={NODE_W}
        height={NODE_H}
      />

      {/* auth.jwt()->'email' node */}
      <TreeNode
        label="auth.jwt()->'email'"
        sublabel="user@example.com"
        cx={RIGHT_CX}
        cy={EMAIL_CY}
        glow={emailGlow}
        enterFrame={150}
        enterFrom="below"
        width={NODE_W + 20}
        height={NODE_H}
      />
    </AbsoluteFill>
  );
};
