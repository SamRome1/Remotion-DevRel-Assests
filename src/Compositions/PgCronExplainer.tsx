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
import { IconDatabase, Zap, CheckCircle } from '../Components/Icons';

loadFont('normal', { weights: ['300', '400', '500', '600', '700'] });

// ── Layout constants ──────────────────────────────────────────────────────────
const NODE_H = 100;
const NODE_W = 240;
const ROOT_W = 260;

const PANEL_X = 60;
const PANEL_Y = 160;

const RIGHT_CX   = 1390;
const ROOT_CY    = 200;
const SCHED_CY   = 430;
const EXEC_CY    = 645;
const DELETE_CY  = 860;

// ── Timeline ──────────────────────────────────────────────────────────────────
// 0–22   : global fade in
// 18–45  : code panel enters
// 45     : root node enters
// 60–180 : code lines type in (5 lines × 25f)
// 100    : schedule node enters
// 115    : executor node enters
// 130    : delete leaf enters
// 145    : conn root→schedule
// 160    : conn schedule→executor
// 175    : conn executor→delete
// 190    : root glows
// 210    : schedule glows
// 230    : executor glows
// 250    : delete glows
// 265    : dot root→schedule
// 285    : dot schedule→executor
// 300    : end

export const PgCronExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  void useVideoConfig();

  const globalIn = itp(frame, 0, 22);

  const line2Active = itp(frame, 190, 215);
  const line3Active = itp(frame, 210, 235);
  const line4Active = itp(frame, 230, 255);

  const codeLines: CodeLineData[] = [
    {
      tokens: [
        { type: 'comment', text: '-- Schedule a nightly cleanup job' },
      ],
      startFrame: 60,
      active: 0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'keyword', text: 'SELECT' },
        { type: 'plain', text: ' ' },
        { type: 'fn', text: 'cron.schedule' },
        { type: 'plain', text: '(' },
      ],
      startFrame: 78,
      active: line2Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '  ' },
        { type: 'string', text: "'nightly-cleanup'" },
        { type: 'plain', text: ',' },
      ],
      startFrame: 103,
      active: line2Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '  ' },
        { type: 'string', text: "'0 0 * * *'" },
        { type: 'plain', text: ',' },
      ],
      startFrame: 128,
      active: line3Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '  $$' },
        { type: 'plain', text: ' ' },
        { type: 'keyword', text: 'DELETE' },
        { type: 'plain', text: ' ' },
        { type: 'keyword', text: 'FROM' },
        { type: 'plain', text: ' ' },
        { type: 'table', text: 'logs' },
      ],
      startFrame: 153,
      active: line4Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'keyword', text: 'WHERE' },
        { type: 'plain', text: ' created_at < ' },
        { type: 'fn', text: 'now()' },
        { type: 'plain', text: " - interval '30 days' $$);" },
      ],
      startFrame: 178,
      active: line4Active,
      showAccent: true,
    },
  ];

  // Glows
  const rootGlow   = itp(frame, 190, 215);
  const schedGlow  = itp(frame, 210, 235);
  const execGlow   = itp(frame, 230, 255);
  const deleteGlow = itp(frame, 250, 275);

  // Connectors
  const connRootSched  = itp(frame, 145, 170);
  const connSchedExec  = itp(frame, 160, 185);
  const connExecDelete = itp(frame, 175, 200);

  // Dots
  const dot1 = itp(frame, 265, 297);
  const dot2 = itp(frame, 285, 300);

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
          x2={RIGHT_CX} y2={SCHED_CY - NODE_H / 2}
          progress={connRootSched} litProgress={schedGlow}
          strokeWidth={3} arrow id="cron-root-sched"
        />
        <ConnectorLine
          x1={RIGHT_CX} y1={SCHED_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={EXEC_CY - NODE_H / 2}
          progress={connSchedExec} litProgress={execGlow}
          strokeWidth={3} arrow id="cron-sched-exec"
        />
        <ConnectorLine
          x1={RIGHT_CX} y1={EXEC_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={DELETE_CY - NODE_H / 2}
          progress={connExecDelete} litProgress={deleteGlow}
          strokeWidth={3} arrow id="cron-exec-delete"
        />
        <TravelingDot
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={SCHED_CY - NODE_H / 2}
          progress={dot1} radius={6} color={GREEN}
        />
        <TravelingDot
          x1={RIGHT_CX} y1={SCHED_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={EXEC_CY - NODE_H / 2}
          progress={dot2} radius={6} color={GREEN}
        />
      </svg>

      {/* LEFT: CodePanel */}
      <div style={{ position: 'absolute', left: PANEL_X, top: PANEL_Y }}>
        <CodePanel
          filename="pg-cron.sql"
          lines={codeLines}
          enterFrame={18}
          enterFrom="left"
          width={880}
          codeFontSize={18}
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
        pg_cron Jobs
      </div>

      {/* Root: pg_cron */}
      <TreeNode
        label="pg_cron"
        sublabel="Postgres scheduler"
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

      {/* Schedule node */}
      <TreeNode
        label="Schedule"
        sublabel="0 0 * * *  — daily midnight"
        svgIcon={<Zap size={24} strokeWidth={1.5} color={iconColor(schedGlow)} />}
        cx={RIGHT_CX}
        cy={SCHED_CY}
        glow={schedGlow}
        enterFrame={100}
        enterFrom="below"
        width={NODE_W + 60}
        height={NODE_H}
      />

      {/* Job executor */}
      <TreeNode
        label="Job executor"
        sublabel="runs in Postgres"
        svgIcon={<Zap size={24} strokeWidth={1.5} color={iconColor(execGlow)} />}
        cx={RIGHT_CX}
        cy={EXEC_CY}
        glow={execGlow}
        enterFrame={115}
        enterFrom="below"
        width={NODE_W}
        height={NODE_H}
      />

      {/* DELETE logs leaf */}
      <TreeNode
        label="DELETE logs"
        sublabel="rows older than 30 days"
        svgIcon={<CheckCircle size={24} strokeWidth={1.5} color={iconColor(deleteGlow)} />}
        cx={RIGHT_CX}
        cy={DELETE_CY}
        glow={deleteGlow}
        enterFrame={130}
        enterFrom="below"
        width={NODE_W + 40}
        height={NODE_H}
      />
    </AbsoluteFill>
  );
};
