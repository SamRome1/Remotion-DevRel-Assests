import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont, fontFamily as interFont } from '@remotion/google-fonts/Inter';
import {
  BG, GREEN, FG, FG_MUTED,
  DotGrid, itp, sp, spSlow, iconColor,
} from '../tokens';
import { CodePanel } from '../Components/CodePanel';
import type { CodeLineData } from '../Components/CodePanel';
import { TreeNode, ConnectorLine, TravelingDot } from '../Components/TreeNode';
import { IconDatabase, IconAuth, Zap, CheckCircle } from '../Components/Icons';

loadFont('normal', { weights: ['300', '400', '500', '600', '700'] });

// ── Layout constants ──────────────────────────────────────────────────────────
const NODE_H = 100;
const NODE_W = 240;
const ROOT_W = 280;

const PANEL_X = 60;
const PANEL_Y = 155;

const RIGHT_CX    = 1390;
const ROOT_CY     = 190;
const TRIGGER_CY  = 410;
const HANDLER_CY  = 625;
const INSERT_CY   = 840;

// ── Timeline ──────────────────────────────────────────────────────────────────
// 0–22   : global fade in
// 18–45  : code panel enters
// 45     : root node enters
// 60–200 : code lines type in (5 lines × 28f)
// 100    : trigger node enters
// 115    : handler node enters
// 130    : insert node enters
// 155    : conn root→trigger
// 170    : conn trigger→handler
// 185    : conn handler→insert
// 200    : root glows
// 220    : trigger glows
// 240    : handler glows
// 260    : insert glows
// 280    : dot root→trigger
// 300    : dot trigger→handler
// 320    : dot handler→insert

export const TriggersExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  void useVideoConfig();

  const globalIn = itp(frame, 0, 22);

  const line2Active = itp(frame, 200, 225);
  const line3Active = itp(frame, 220, 245);
  const line4Active = itp(frame, 240, 265);

  const codeLines: CodeLineData[] = [
    {
      tokens: [
        { type: 'comment', text: '-- Fire a function after every new user' },
      ],
      startFrame: 60,
      active: 0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'keyword', text: 'CREATE' },
        { type: 'plain', text: ' TRIGGER ' },
        { type: 'table', text: 'on_user_created' },
      ],
      startFrame: 80,
      active: line2Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'keyword', text: 'AFTER' },
        { type: 'plain', text: ' ' },
        { type: 'keyword', text: 'INSERT' },
        { type: 'plain', text: ' ' },
        { type: 'keyword', text: 'ON' },
        { type: 'plain', text: ' ' },
        { type: 'table', text: 'auth.users' },
      ],
      startFrame: 108,
      active: line3Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: 'FOR EACH ROW' },
      ],
      startFrame: 136,
      active: line3Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: 'EXECUTE ' },
        { type: 'keyword', text: 'FUNCTION' },
        { type: 'plain', text: ' ' },
        { type: 'fn', text: 'handle_new_user' },
        { type: 'plain', text: '();' },
      ],
      startFrame: 164,
      active: line4Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'comment', text: '-- handle_new_user() inserts into public.profiles' },
      ],
      startFrame: 196,
      active: 0,
      showAccent: false,
    },
  ];

  // Glows
  const rootGlow    = itp(frame, 200, 225);
  const triggerGlow = itp(frame, 220, 245);
  const handlerGlow = itp(frame, 240, 265);
  const insertGlow  = itp(frame, 260, 285);

  // Connectors
  const connRootTrig    = itp(frame, 155, 180);
  const connTrigHandler = itp(frame, 170, 195);
  const connHandlerIns  = itp(frame, 185, 210);

  // Dots
  const dot1 = itp(frame, 280, 315);
  const dot2 = itp(frame, 300, 335);
  const dot3 = itp(frame, 320, 355);

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
          x2={RIGHT_CX} y2={TRIGGER_CY - NODE_H / 2}
          progress={connRootTrig} litProgress={triggerGlow}
          strokeWidth={3} arrow id="trig-root-trig"
        />
        <ConnectorLine
          x1={RIGHT_CX} y1={TRIGGER_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={HANDLER_CY - NODE_H / 2}
          progress={connTrigHandler} litProgress={handlerGlow}
          strokeWidth={3} arrow id="trig-trig-handler"
        />
        <ConnectorLine
          x1={RIGHT_CX} y1={HANDLER_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={INSERT_CY - NODE_H / 2}
          progress={connHandlerIns} litProgress={insertGlow}
          strokeWidth={3} arrow id="trig-handler-ins"
        />
        <TravelingDot
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={TRIGGER_CY - NODE_H / 2}
          progress={dot1} radius={6} color={GREEN}
        />
        <TravelingDot
          x1={RIGHT_CX} y1={TRIGGER_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={HANDLER_CY - NODE_H / 2}
          progress={dot2} radius={6} color={GREEN}
        />
        <TravelingDot
          x1={RIGHT_CX} y1={HANDLER_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={INSERT_CY - NODE_H / 2}
          progress={dot3} radius={6} color={GREEN}
        />
      </svg>

      {/* LEFT: CodePanel */}
      <div style={{ position: 'absolute', left: PANEL_X, top: PANEL_Y }}>
        <CodePanel
          filename="trigger.sql"
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
        Postgres Triggers
      </div>

      {/* Root: INSERT auth.users */}
      <TreeNode
        label="INSERT auth.users"
        sublabel="new signup"
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

      {/* Trigger fires */}
      <TreeNode
        label="Trigger fires"
        sublabel="AFTER INSERT FOR EACH ROW"
        svgIcon={<Zap size={24} strokeWidth={1.5} color={iconColor(triggerGlow)} />}
        cx={RIGHT_CX}
        cy={TRIGGER_CY}
        glow={triggerGlow}
        enterFrame={100}
        enterFrom="below"
        width={NODE_W + 40}
        height={NODE_H}
      />

      {/* handle_new_user() */}
      <TreeNode
        label="handle_new_user()"
        sublabel="plpgsql function"
        svgIcon={<IconDatabase size={24} color={iconColor(handlerGlow)} />}
        cx={RIGHT_CX}
        cy={HANDLER_CY}
        glow={handlerGlow}
        enterFrame={115}
        enterFrom="below"
        width={NODE_W + 40}
        height={NODE_H}
      />

      {/* INSERT public.profiles */}
      <TreeNode
        label="INSERT public.profiles"
        sublabel="new profile row created"
        svgIcon={<CheckCircle size={24} strokeWidth={1.5} color={iconColor(insertGlow)} />}
        cx={RIGHT_CX}
        cy={INSERT_CY}
        glow={insertGlow}
        enterFrame={130}
        enterFrom="below"
        width={NODE_W + 60}
        height={NODE_H}
      />
    </AbsoluteFill>
  );
};
