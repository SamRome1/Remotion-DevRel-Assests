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
import { IconAuth, ShieldCheck, Key, KeyRound, CheckCircle, User } from '../Components/Icons';

loadFont('normal', { weights: ['300', '400', '500', '600', '700'] });

// ── Layout constants ──────────────────────────────────────────────────────────
const NODE_H = 100;
const NODE_W = 240;
const ROOT_W = 280;

const PANEL_X = 60;
const PANEL_Y = 160;

const RIGHT_CX    = 1390;
const ROOT_CY     = 180;
const VALIDATE_CY = 390;
const JWT_CY      = 570;
const COOKIE_CY   = 750;
const SESSION_CY  = 930;

// ── Timeline ──────────────────────────────────────────────────────────────────
// 0–22   : global fade in
// 18–45  : code panel enters
// 45     : root node enters
// 60–200 : code lines type in
// 100    : validate node enters
// 115    : jwt node enters
// 130    : cookie node enters
// 145    : session node enters
// 150    : conn root→validate
// 165    : conn validate→jwt
// 180    : conn jwt→cookie
// 195    : conn cookie→session
// 200    : root glows
// 220    : validate glows
// 240    : jwt glows
// 260    : cookie glows
// 280    : session glows
// 295    : dot root→validate
// 315    : dot validate→jwt
// 335    : dot jwt→cookie
// 355    : dot cookie→session

export const SignInFlowExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  void useVideoConfig();

  const globalIn = itp(frame, 0, 22);

  const line2Active = itp(frame, 200, 225);
  const line3Active = itp(frame, 215, 240);

  const codeLines: CodeLineData[] = [
    {
      tokens: [
        { type: 'comment', text: '// Sign in with email + password' },
      ],
      startFrame: 60,
      active: 0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'plain', text: 'supabase.' },
        { type: 'fn', text: 'auth' },
        { type: 'plain', text: '.' },
        { type: 'fn', text: 'signInWithPassword' },
        { type: 'plain', text: '({' },
      ],
      startFrame: 80,
      active: line2Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '  ' },
        { type: 'table', text: 'email' },
        { type: 'plain', text: ': ' },
        { type: 'string', text: "'user@example.com'" },
        { type: 'plain', text: ',' },
      ],
      startFrame: 108,
      active: line2Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '  ' },
        { type: 'table', text: 'password' },
        { type: 'plain', text: ': ' },
        { type: 'string', text: "'••••••••'" },
        { type: 'plain', text: ',' },
      ],
      startFrame: 136,
      active: line3Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '})' },
      ],
      startFrame: 155,
      active: 0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'comment', text: '// Returns: { data: { session }, error }' },
      ],
      startFrame: 175,
      active: 0,
      showAccent: false,
    },
  ];

  // Glows
  const rootGlow     = itp(frame, 200, 225);
  const validateGlow = itp(frame, 220, 245);
  const jwtGlow      = itp(frame, 240, 265);
  const cookieGlow   = itp(frame, 260, 285);
  const sessionGlow  = itp(frame, 280, 305);

  // Connectors
  const connRootVal  = itp(frame, 150, 175);
  const connValJwt   = itp(frame, 165, 190);
  const connJwtCook  = itp(frame, 180, 205);
  const connCookSess = itp(frame, 195, 220);

  // Dots
  const dot1 = itp(frame, 295, 330);
  const dot2 = itp(frame, 315, 350);
  const dot3 = itp(frame, 335, 360);

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
          x2={RIGHT_CX} y2={VALIDATE_CY - NODE_H / 2}
          progress={connRootVal} litProgress={validateGlow}
          strokeWidth={3} arrow id="signin-root-val"
        />
        <ConnectorLine
          x1={RIGHT_CX} y1={VALIDATE_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={JWT_CY - NODE_H / 2}
          progress={connValJwt} litProgress={jwtGlow}
          strokeWidth={3} arrow id="signin-val-jwt"
        />
        <ConnectorLine
          x1={RIGHT_CX} y1={JWT_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={COOKIE_CY - NODE_H / 2}
          progress={connJwtCook} litProgress={cookieGlow}
          strokeWidth={3} arrow id="signin-jwt-cook"
        />
        <ConnectorLine
          x1={RIGHT_CX} y1={COOKIE_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={SESSION_CY - NODE_H / 2}
          progress={connCookSess} litProgress={sessionGlow}
          strokeWidth={3} arrow id="signin-cook-sess"
        />
        <TravelingDot
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={VALIDATE_CY - NODE_H / 2}
          progress={dot1} radius={6} color={GREEN}
        />
        <TravelingDot
          x1={RIGHT_CX} y1={VALIDATE_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={JWT_CY - NODE_H / 2}
          progress={dot2} radius={6} color={GREEN}
        />
        <TravelingDot
          x1={RIGHT_CX} y1={JWT_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={COOKIE_CY - NODE_H / 2}
          progress={dot3} radius={6} color={GREEN}
        />
      </svg>

      {/* LEFT: CodePanel */}
      <div style={{ position: 'absolute', left: PANEL_X, top: PANEL_Y }}>
        <CodePanel
          filename="sign-in.ts"
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
        Sign-In Flow
      </div>

      {/* Root */}
      <TreeNode
        label="signInWithPassword()"
        sublabel="auth request"
        svgIcon={<IconAuth size={24} color={iconColor(rootGlow)} />}
        cx={RIGHT_CX}
        cy={ROOT_CY}
        glow={rootGlow}
        enterFrame={45}
        enterFrom="below"
        root
        width={ROOT_W}
        height={NODE_H}
      />

      {/* Validate credentials */}
      <TreeNode
        label="Validate credentials"
        sublabel="bcrypt compare"
        svgIcon={<ShieldCheck size={24} strokeWidth={1.5} color={iconColor(validateGlow)} />}
        cx={RIGHT_CX}
        cy={VALIDATE_CY}
        glow={validateGlow}
        enterFrame={100}
        enterFrom="below"
        width={NODE_W}
        height={NODE_H}
      />

      {/* Generate JWT */}
      <TreeNode
        label="Generate JWT"
        sublabel="signed token"
        svgIcon={<Key size={24} strokeWidth={1.5} color={iconColor(jwtGlow)} />}
        cx={RIGHT_CX}
        cy={JWT_CY}
        glow={jwtGlow}
        enterFrame={115}
        enterFrom="below"
        width={NODE_W}
        height={NODE_H}
      />

      {/* Set session cookie */}
      <TreeNode
        label="Set session cookie"
        sublabel="httpOnly, secure"
        svgIcon={<KeyRound size={24} strokeWidth={1.5} color={iconColor(cookieGlow)} />}
        cx={RIGHT_CX}
        cy={COOKIE_CY}
        glow={cookieGlow}
        enterFrame={130}
        enterFrom="below"
        width={NODE_W}
        height={NODE_H}
      />

      {/* Return session */}
      <TreeNode
        label="Return session"
        sublabel="{ user, access_token }"
        svgIcon={<CheckCircle size={24} strokeWidth={1.5} color={iconColor(sessionGlow)} />}
        cx={RIGHT_CX}
        cy={SESSION_CY}
        glow={sessionGlow}
        enterFrame={145}
        enterFrom="below"
        width={NODE_W + 20}
        height={NODE_H}
      />
    </AbsoluteFill>
  );
};
