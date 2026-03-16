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
import { IconDatabase, IconAuth, ShieldCheck, Code, CheckCircle, ArrowRight } from '../Components/Icons';

loadFont('normal', { weights: ['300', '400', '500', '600', '700'] });

// ── Layout constants ──────────────────────────────────────────────────────────
const NODE_H = 100;
const NODE_W = 230;
const ROOT_W = 260;

const PANEL_X = 60;
const PANEL_Y = 140;

const RIGHT_CX   = 1370;
const ROOT_CY    = 180;
const PARSE_CY   = 365;
const RLS_CY     = 545;
// Sub-connector for auth.uid() off RLS
const UID_CX     = 1560;
const UID_CY     = 545;
const EXEC_CY    = 725;
const JSON_CY    = 905;

// ── Timeline ──────────────────────────────────────────────────────────────────
// 0–22   : global fade in
// 18–45  : code panel enters
// 45     : root enters
// 60–200 : code lines type in
// 100    : parse node enters
// 115    : rls node enters
// 125    : uid node enters
// 140    : exec node enters
// 155    : json node enters
// 160    : conn root→parse
// 170    : conn parse→rls
// 180    : conn rls→uid
// 190    : conn rls→exec (skipping over uid branch)
// 200    : conn exec→json
// 210    : root glows
// 225    : parse glows
// 245    : rls glows
// 260    : uid glows (sub-label: auth.uid())
// 280    : exec glows
// 300    : json glows
// 315    : dot root→parse
// 335    : dot parse→rls
// 355    : dot rls→exec
// 375    : dot exec→json

export const PostgrestExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  void useVideoConfig();

  const globalIn = itp(frame, 0, 22);

  const line2Active = itp(frame, 210, 235);
  const line3Active = itp(frame, 230, 255);
  const line4Active = itp(frame, 250, 275);

  const codeLines: CodeLineData[] = [
    {
      tokens: [
        { type: 'comment', text: '// PostgREST auto-generates REST from Postgres' },
      ],
      startFrame: 60,
      active: 0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'plain', text: 'supabase.' },
        { type: 'fn', text: 'from' },
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
        { type: 'fn', text: 'select' },
        { type: 'plain', text: '(' },
        { type: 'string', text: "'id, title, user_id'" },
        { type: 'plain', text: ')' },
      ],
      startFrame: 108,
      active: line2Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '  .' },
        { type: 'fn', text: 'eq' },
        { type: 'plain', text: '(' },
        { type: 'string', text: "'user_id'" },
        { type: 'plain', text: ', userId)' },
      ],
      startFrame: 136,
      active: line3Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '  .' },
        { type: 'fn', text: 'order' },
        { type: 'plain', text: '(' },
        { type: 'string', text: "'created_at'" },
        { type: 'plain', text: ', {' },
      ],
      startFrame: 164,
      active: line4Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '    ' },
        { type: 'table', text: 'ascending' },
        { type: 'plain', text: ': ' },
        { type: 'keyword', text: 'false' },
        { type: 'plain', text: ' })' },
      ],
      startFrame: 190,
      active: line4Active,
      showAccent: true,
    },
  ];

  // Glows
  const rootGlow  = itp(frame, 210, 235);
  const parseGlow = itp(frame, 225, 250);
  const rlsGlow   = itp(frame, 245, 270);
  const uidGlow   = itp(frame, 260, 285);
  const execGlow  = itp(frame, 280, 305);
  const jsonGlow  = itp(frame, 300, 325);

  // Connectors
  const connRootParse = itp(frame, 160, 185);
  const connParseRls  = itp(frame, 170, 195);
  const connRlsUid    = itp(frame, 180, 205);
  const connRlsExec   = itp(frame, 190, 215);
  const connExecJson  = itp(frame, 200, 225);

  // Dots
  const dot1 = itp(frame, 315, 350);
  const dot2 = itp(frame, 335, 370);
  const dot3 = itp(frame, 355, 390);
  const dot4 = itp(frame, 375, 410);

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
          x2={RIGHT_CX} y2={PARSE_CY - NODE_H / 2}
          progress={connRootParse} litProgress={parseGlow}
          strokeWidth={3} arrow id="pg-root-parse"
        />
        <ConnectorLine
          x1={RIGHT_CX} y1={PARSE_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={RLS_CY - NODE_H / 2}
          progress={connParseRls} litProgress={rlsGlow}
          strokeWidth={3} arrow id="pg-parse-rls"
        />
        {/* RLS → auth.uid() side branch */}
        <ConnectorLine
          x1={RIGHT_CX + NODE_W / 2} y1={RLS_CY}
          x2={UID_CX - NODE_W / 2} y2={UID_CY}
          progress={connRlsUid} litProgress={uidGlow}
          strokeWidth={2.5} arrow id="pg-rls-uid"
        />
        {/* RLS → Execute SQL */}
        <ConnectorLine
          x1={RIGHT_CX} y1={RLS_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={EXEC_CY - NODE_H / 2}
          progress={connRlsExec} litProgress={execGlow}
          strokeWidth={3} arrow id="pg-rls-exec"
        />
        <ConnectorLine
          x1={RIGHT_CX} y1={EXEC_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={JSON_CY - NODE_H / 2}
          progress={connExecJson} litProgress={jsonGlow}
          strokeWidth={3} arrow id="pg-exec-json"
        />
        <TravelingDot
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={PARSE_CY - NODE_H / 2}
          progress={dot1} radius={6} color={GREEN}
        />
        <TravelingDot
          x1={RIGHT_CX} y1={PARSE_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={RLS_CY - NODE_H / 2}
          progress={dot2} radius={6} color={GREEN}
        />
        <TravelingDot
          x1={RIGHT_CX} y1={RLS_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={EXEC_CY - NODE_H / 2}
          progress={dot3} radius={6} color={GREEN}
        />
        <TravelingDot
          x1={RIGHT_CX} y1={EXEC_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={JSON_CY - NODE_H / 2}
          progress={dot4} radius={6} color={GREEN}
        />
      </svg>

      {/* LEFT: CodePanel */}
      <div style={{ position: 'absolute', left: PANEL_X, top: PANEL_Y }}>
        <CodePanel
          filename="postgrest-query.ts"
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
          left: RIGHT_CX - 120,
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
        PostgREST Pipeline
      </div>

      {/* Root: PostgREST */}
      <TreeNode
        label="PostgREST"
        sublabel="REST → SQL"
        svgIcon={<IconDatabase size={24} color={iconColor(rootGlow)} />}
        cx={RIGHT_CX}
        cy={ROOT_CY}
        glow={rootGlow}
        enterFrame={45}
        enterFrom="below"
        root
        width={ROOT_W}
        height={NODE_H}
      />

      {/* Parse query */}
      <TreeNode
        label="Parse query"
        sublabel=".select().eq().order()"
        svgIcon={<Code size={24} strokeWidth={1.5} color={iconColor(parseGlow)} />}
        cx={RIGHT_CX}
        cy={PARSE_CY}
        glow={parseGlow}
        enterFrame={100}
        enterFrom="below"
        width={NODE_W + 20}
        height={NODE_H}
      />

      {/* RLS check */}
      <TreeNode
        label="RLS check"
        sublabel="policy evaluated"
        svgIcon={<ShieldCheck size={24} strokeWidth={1.5} color={iconColor(rlsGlow)} />}
        cx={RIGHT_CX}
        cy={RLS_CY}
        glow={rlsGlow}
        enterFrame={115}
        enterFrom="below"
        width={NODE_W}
        height={NODE_H}
      />

      {/* auth.uid() side node */}
      <TreeNode
        label="auth.uid()"
        sublabel="from JWT claim"
        svgIcon={<IconAuth size={24} color={iconColor(uidGlow)} />}
        cx={UID_CX}
        cy={UID_CY}
        glow={uidGlow}
        enterFrame={125}
        enterFrom="right"
        width={NODE_W}
        height={NODE_H}
      />

      {/* Execute SQL */}
      <TreeNode
        label="Execute SQL"
        sublabel="filtered rows"
        svgIcon={<IconDatabase size={24} color={iconColor(execGlow)} />}
        cx={RIGHT_CX}
        cy={EXEC_CY}
        glow={execGlow}
        enterFrame={140}
        enterFrom="below"
        width={NODE_W}
        height={NODE_H}
      />

      {/* JSON response */}
      <TreeNode
        label="JSON response"
        sublabel="[ { id, title, user_id } ]"
        svgIcon={<CheckCircle size={24} strokeWidth={1.5} color={iconColor(jsonGlow)} />}
        cx={RIGHT_CX}
        cy={JSON_CY}
        glow={jsonGlow}
        enterFrame={155}
        enterFrom="below"
        width={NODE_W + 30}
        height={NODE_H}
      />
    </AbsoluteFill>
  );
};
