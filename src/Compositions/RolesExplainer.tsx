import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont, fontFamily as interFont } from '@remotion/google-fonts/Inter';
import {
  BG, GREEN, RED, FG, FG_MUTED, FG_LIGHT,
  DotGrid, itp, sp, spSlow, glowStyles, iconColor,
  BORDER, SURFACE_100,
} from '../tokens';
import { CodePanel } from '../Components/CodePanel';
import type { CodeLineData } from '../Components/CodePanel';
import { TreeNode, ConnectorLine, TravelingDot } from '../Components/TreeNode';
import { IconAuth, IconDatabase, ShieldCheck, Shield, Lock } from '../Components/Icons';

loadFont('normal', { weights: ['300', '400', '500', '600', '700'] });

// ── Layout constants ──────────────────────────────────────────────────────────
const NODE_H = 100;
const NODE_W = 220;
const ROOT_W = 250;

// Left panel
const PANEL_X = 80;
const PANEL_Y = 200;

// Right diagram — center column X
const RIGHT_CX = 1390;
const ROOT_CY   = 200;
const ANON_CY   = 480;
const AUTH_CY   = 650;
const SVC_CY    = 820;

// ── Timeline ──────────────────────────────────────────────────────────────────
// 0–22   : global fade in
// 18–45  : code panel enters
// 45–90  : root node enters
// 60–180 : code lines type in (4 lines × 30f)
// 90     : anon node enters
// 100    : auth node enters
// 110    : svc node enters
// 130    : connector root→anon draws
// 145    : connector root→auth draws
// 160    : connector root→svc draws
// 180    : auth node glows (authenticated grant)
// 210    : anon node dims to denied
// 240    : traveling dot root→auth

export const RolesExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  void useVideoConfig();

  const globalIn = itp(frame, 0, 22);

  // Code line active states
  const line1Active = itp(frame, 180, 200);
  const line2Active = itp(frame, 190, 210);
  const line3Active = itp(frame, 200, 220);
  const line4Active = itp(frame, 210, 230);

  const codeLines: CodeLineData[] = [
    {
      tokens: [
        { type: 'comment', text: '-- Grant SELECT on posts to authenticated role' },
      ],
      startFrame: 60,
      active: 0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'keyword', text: 'GRANT' },
        { type: 'plain', text: ' ' },
        { type: 'keyword', text: 'SELECT' },
        { type: 'plain', text: ' ' },
        { type: 'keyword', text: 'ON' },
        { type: 'plain', text: ' ' },
        { type: 'table', text: 'posts' },
      ],
      startFrame: 90,
      active: line2Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'keyword', text: 'TO' },
        { type: 'plain', text: ' ' },
        { type: 'fn', text: 'authenticated' },
        { type: 'plain', text: ';' },
      ],
      startFrame: 120,
      active: line3Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'comment', text: '-- anon role: access denied (no GRANT)' },
      ],
      startFrame: 150,
      active: 0,
      showAccent: false,
    },
  ];

  // Node glows
  const rootGlow  = itp(frame, 55, 80);
  const anonGlow  = itp(frame, 210, 230, 0.6, 0); // dims out
  const authGlow  = itp(frame, 180, 210);
  const svcGlow   = itp(frame, 110, 130, 0, 0.3);

  // Connector progress
  const conn1Progress = itp(frame, 130, 155);
  const conn2Progress = itp(frame, 145, 170);
  const conn3Progress = itp(frame, 160, 185);

  // Traveling dot — root to auth
  const dotProgress = itp(frame, 245, 285);

  // Denied overlay on anon node
  const denyProg = itp(frame, 215, 235);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', opacity: globalIn }}>
      <DotGrid />

      {/* SVG layer */}
      <svg
        width={1920}
        height={1080}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
      >
        {/* Root → anon */}
        <ConnectorLine
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={ANON_CY - NODE_H / 2}
          progress={conn1Progress}
          litProgress={anonGlow}
          strokeWidth={3}
          arrow
          id="roles-root-anon"
        />
        {/* Root → authenticated */}
        <ConnectorLine
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={AUTH_CY - NODE_H / 2}
          progress={conn2Progress}
          litProgress={authGlow}
          strokeWidth={3}
          arrow
          id="roles-root-auth"
        />
        {/* Root → service_role */}
        <ConnectorLine
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={SVC_CY - NODE_H / 2}
          progress={conn3Progress}
          litProgress={svcGlow}
          strokeWidth={3}
          arrow
          id="roles-root-svc"
        />
        {/* Traveling dot: root → auth */}
        <TravelingDot
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={AUTH_CY - NODE_H / 2}
          progress={dotProgress}
          radius={6}
          color={GREEN}
        />
      </svg>

      {/* LEFT: CodePanel */}
      <div
        style={{
          position: 'absolute',
          left: PANEL_X,
          top: PANEL_Y,
        }}
      >
        <CodePanel
          filename="roles.sql"
          lines={codeLines}
          enterFrame={18}
          enterFrom="left"
          width={860}
          codeFontSize={19}
        />
      </div>

      {/* RIGHT: TreeNode diagram */}

      {/* Root: Request */}
      <TreeNode
        label="Request"
        sublabel="incoming query"
        icon="🔐"
        cx={RIGHT_CX}
        cy={ROOT_CY}
        glow={rootGlow}
        enterFrame={45}
        enterFrom="below"
        root
        width={ROOT_W}
        height={NODE_H}
      />

      {/* anon node */}
      <TreeNode
        label="anon"
        sublabel="unauthenticated"
        svgIcon={<Shield size={24} strokeWidth={1.5} color={iconColor(anonGlow)} />}
        cx={RIGHT_CX}
        cy={ANON_CY}
        glow={anonGlow}
        enterFrame={90}
        enterFrom="below"
        width={NODE_W}
        height={NODE_H}
        morphLabel="DENIED"
        morphLabelColor={RED}
      />

      {/* denied badge on anon */}
      {denyProg > 0.01 && (
        <div
          style={{
            position: 'absolute',
            left: RIGHT_CX - NODE_W / 2 - 10,
            top: ANON_CY - 20,
            background: `rgba(240,64,64,${0.12 * denyProg})`,
            border: `1.5px solid rgba(240,64,64,${0.5 * denyProg})`,
            borderRadius: 8,
            padding: '4px 12px',
            fontFamily: `${interFont}, sans-serif`,
            fontSize: 13,
            fontWeight: 700,
            color: RED,
            opacity: denyProg,
            letterSpacing: '0.05em',
          }}
        >
          NO GRANT
        </div>
      )}

      {/* authenticated node */}
      <TreeNode
        label="authenticated"
        sublabel="logged-in user"
        svgIcon={<ShieldCheck size={24} strokeWidth={1.5} color={iconColor(authGlow)} />}
        cx={RIGHT_CX}
        cy={AUTH_CY}
        glow={authGlow}
        enterFrame={100}
        enterFrom="below"
        width={NODE_W}
        height={NODE_H}
        morphLabel="SELECT ✓"
        morphLabelColor={GREEN}
      />

      {/* service_role node */}
      <TreeNode
        label="service_role"
        sublabel="admin bypass"
        svgIcon={<Lock size={24} strokeWidth={1.5} color={iconColor(svcGlow)} />}
        cx={RIGHT_CX}
        cy={SVC_CY}
        glow={svcGlow}
        enterFrame={110}
        enterFrom="below"
        width={NODE_W}
        height={NODE_H}
      />

      {/* Right side label */}
      <div
        style={{
          position: 'absolute',
          left: RIGHT_CX - 130,
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
        Postgres Roles
      </div>

      {/* Grant success label */}
      <div
        style={{
          position: 'absolute',
          left: RIGHT_CX - 130,
          top: AUTH_CY + NODE_H / 2 + 20,
          fontFamily: `${interFont}, sans-serif`,
          fontSize: 14,
          fontWeight: 500,
          color: GREEN,
          opacity: authGlow,
          letterSpacing: '0.02em',
        }}
      >
        SELECT granted via GRANT statement
      </div>
    </AbsoluteFill>
  );
};
