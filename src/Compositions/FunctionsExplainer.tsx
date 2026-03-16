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
import { IconEdgeFunctions, IconDatabase, Terminal, Zap, ArrowRight, CheckCircle } from '../Components/Icons';

loadFont('normal', { weights: ['300', '400', '500', '600', '700'] });

// ── Layout constants ──────────────────────────────────────────────────────────
const NODE_H = 100;
const NODE_W = 230;
const ROOT_W = 260;

const PANEL_X = 60;
const PANEL_Y = 130;

// Main chain: Root → Deno → Handler → Response
const RIGHT_CX   = 1290;
const ROOT_CY    = 180;
const DENO_CY    = 380;
const HANDLER_CY = 580;
const RESP_CY    = 780;

// Second path: Root → Supabase Client → Postgres
const DB_CX       = 1560;
const SBCLIENT_CY = 480;
const POSTGRES_CY = 680;

// ── Timeline ──────────────────────────────────────────────────────────────────
// 0–22   : global fade in
// 18–45  : code panel enters
// 45     : root enters
// 60–200 : code lines type in
// 95     : Deno Runtime enters
// 110    : Handler enters
// 120    : Response enters
// 130    : Supabase Client enters (right branch)
// 140    : Postgres enters (right branch)
// 150    : conn root→deno
// 160    : conn deno→handler
// 170    : conn handler→response
// 175    : conn root→supa-client (diagonal)
// 185    : conn supa-client→postgres
// 195    : root glows
// 215    : deno glows
// 235    : handler glows
// 255    : response glows
// 265    : supa-client glows
// 285    : postgres glows
// 300    : dot root→deno
// 320    : dot deno→handler
// 340    : dot handler→response
// 360    : dot root→supa-client
// 380    : dot supa-client→postgres

export const FunctionsExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  void useVideoConfig();

  const globalIn = itp(frame, 0, 22);

  const line2Active = itp(frame, 195, 220);
  const line3Active = itp(frame, 215, 240);

  const codeLines: CodeLineData[] = [
    {
      tokens: [
        { type: 'comment', text: '// Deno Edge Function handler' },
      ],
      startFrame: 60,
      active: 0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'fn', text: 'serve' },
        { type: 'plain', text: '(async (req) => {' },
      ],
      startFrame: 78,
      active: line2Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '  const { name } = await req.' },
        { type: 'fn', text: 'json' },
        { type: 'plain', text: '()' },
      ],
      startFrame: 106,
      active: line2Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '  return new ' },
        { type: 'fn', text: 'Response' },
        { type: 'plain', text: '(' },
      ],
      startFrame: 134,
      active: line3Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '    JSON.' },
        { type: 'fn', text: 'stringify' },
        { type: 'plain', text: '({' },
        { type: 'table', text: 'message' },
        { type: 'plain', text: ': ' },
        { type: 'string', text: "'Hello '" },
        { type: 'plain', text: ' + name' },
      ],
      startFrame: 162,
      active: line3Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '  })' },
      ],
      startFrame: 183,
      active: 0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'plain', text: '})' },
      ],
      startFrame: 192,
      active: 0,
      showAccent: false,
    },
  ];

  // Glows
  const rootGlow    = itp(frame, 195, 220);
  const denoGlow    = itp(frame, 215, 240);
  const handlerGlow = itp(frame, 235, 260);
  const respGlow    = itp(frame, 255, 280);
  const supaGlow    = itp(frame, 265, 290);
  const pgGlow      = itp(frame, 285, 310);

  // Connectors
  const connRootDeno    = itp(frame, 150, 175);
  const connDenoHandler = itp(frame, 160, 185);
  const connHandlerResp = itp(frame, 170, 195);
  const connRootSupa    = itp(frame, 175, 200);
  const connSupaPg      = itp(frame, 185, 210);

  // Dots
  const dot1 = itp(frame, 300, 335);
  const dot2 = itp(frame, 320, 355);
  const dot3 = itp(frame, 340, 375);
  const dot4 = itp(frame, 360, 395);
  const dot5 = itp(frame, 380, 415);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', opacity: globalIn }}>
      <DotGrid />

      <svg
        width={1920}
        height={1080}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
      >
        {/* Main chain */}
        <ConnectorLine
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={DENO_CY - NODE_H / 2}
          progress={connRootDeno} litProgress={denoGlow}
          strokeWidth={3} arrow id="fn-root-deno"
        />
        <ConnectorLine
          x1={RIGHT_CX} y1={DENO_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={HANDLER_CY - NODE_H / 2}
          progress={connDenoHandler} litProgress={handlerGlow}
          strokeWidth={3} arrow id="fn-deno-handler"
        />
        <ConnectorLine
          x1={RIGHT_CX} y1={HANDLER_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={RESP_CY - NODE_H / 2}
          progress={connHandlerResp} litProgress={respGlow}
          strokeWidth={3} arrow id="fn-handler-resp"
        />
        {/* Second path: root → Supabase Client */}
        <ConnectorLine
          x1={RIGHT_CX + ROOT_W / 2} y1={ROOT_CY}
          x2={DB_CX - NODE_W / 2} y2={SBCLIENT_CY}
          progress={connRootSupa} litProgress={supaGlow}
          strokeWidth={3} arrow id="fn-root-supa"
        />
        {/* Supabase Client → Postgres */}
        <ConnectorLine
          x1={DB_CX} y1={SBCLIENT_CY + NODE_H / 2}
          x2={DB_CX} y2={POSTGRES_CY - NODE_H / 2}
          progress={connSupaPg} litProgress={pgGlow}
          strokeWidth={3} arrow id="fn-supa-pg"
        />
        {/* Dots main chain */}
        <TravelingDot
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={DENO_CY - NODE_H / 2}
          progress={dot1} radius={6} color={GREEN}
        />
        <TravelingDot
          x1={RIGHT_CX} y1={DENO_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={HANDLER_CY - NODE_H / 2}
          progress={dot2} radius={6} color={GREEN}
        />
        <TravelingDot
          x1={RIGHT_CX} y1={HANDLER_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={RESP_CY - NODE_H / 2}
          progress={dot3} radius={6} color={GREEN}
        />
        {/* Dots DB path */}
        <TravelingDot
          x1={RIGHT_CX + ROOT_W / 2} y1={ROOT_CY}
          x2={DB_CX - NODE_W / 2} y2={SBCLIENT_CY}
          progress={dot4} radius={6} color={GREEN}
        />
        <TravelingDot
          x1={DB_CX} y1={SBCLIENT_CY + NODE_H / 2}
          x2={DB_CX} y2={POSTGRES_CY - NODE_H / 2}
          progress={dot5} radius={6} color={GREEN}
        />
      </svg>

      {/* LEFT: CodePanel */}
      <div style={{ position: 'absolute', left: PANEL_X, top: PANEL_Y }}>
        <CodePanel
          filename="edge-function.ts"
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
          left: RIGHT_CX - 100,
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
        Edge Functions
      </div>

      {/* Root: Edge Function */}
      <TreeNode
        label="Edge Function"
        sublabel="Deno Deploy"
        svgIcon={<IconEdgeFunctions size={24} color={iconColor(rootGlow)} />}
        cx={RIGHT_CX}
        cy={ROOT_CY}
        glow={rootGlow}
        enterFrame={45}
        enterFrom="below"
        root
        width={ROOT_W}
        height={NODE_H}
      />

      {/* Deno Runtime */}
      <TreeNode
        label="Deno Runtime"
        sublabel="V8 isolate"
        svgIcon={<Terminal size={24} strokeWidth={1.5} color={iconColor(denoGlow)} />}
        cx={RIGHT_CX}
        cy={DENO_CY}
        glow={denoGlow}
        enterFrame={95}
        enterFrom="below"
        width={NODE_W}
        height={NODE_H}
      />

      {/* Request handler */}
      <TreeNode
        label="Request handler"
        sublabel="async (req)"
        svgIcon={<Zap size={24} strokeWidth={1.5} color={iconColor(handlerGlow)} />}
        cx={RIGHT_CX}
        cy={HANDLER_CY}
        glow={handlerGlow}
        enterFrame={110}
        enterFrom="below"
        width={NODE_W}
        height={NODE_H}
      />

      {/* Response */}
      <TreeNode
        label="Response"
        sublabel='{ message: "Hello ..." }'
        svgIcon={<CheckCircle size={24} strokeWidth={1.5} color={iconColor(respGlow)} />}
        cx={RIGHT_CX}
        cy={RESP_CY}
        glow={respGlow}
        enterFrame={120}
        enterFrom="below"
        width={NODE_W + 20}
        height={NODE_H}
      />

      {/* Supabase Client (right branch) */}
      <TreeNode
        label="Supabase Client"
        sublabel="DB access"
        svgIcon={<IconDatabase size={24} color={iconColor(supaGlow)} />}
        cx={DB_CX}
        cy={SBCLIENT_CY}
        glow={supaGlow}
        enterFrame={130}
        enterFrom="right"
        width={NODE_W}
        height={NODE_H}
      />

      {/* Postgres */}
      <TreeNode
        label="Postgres"
        sublabel="query + RLS"
        svgIcon={<IconDatabase size={24} color={iconColor(pgGlow)} />}
        cx={DB_CX}
        cy={POSTGRES_CY}
        glow={pgGlow}
        enterFrame={140}
        enterFrom="right"
        width={NODE_W}
        height={NODE_H}
      />
    </AbsoluteFill>
  );
};
