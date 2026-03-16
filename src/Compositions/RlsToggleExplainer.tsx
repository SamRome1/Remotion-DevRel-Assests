import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont, fontFamily as interFont } from '@remotion/google-fonts/Inter';
import {
  BG, GREEN, RED, FG, FG_MUTED, FG_LIGHT,
  DotGrid, itp, sp, spSlow, glowStyles, iconColor,
  BORDER, SURFACE_100, MONO,
} from '../tokens';
import { CodePanel } from '../Components/CodePanel';
import type { CodeLineData } from '../Components/CodePanel';
import { Table } from '../Components/Table';
import type { ColumnDef, RowData } from '../Components/Table';

loadFont('normal', { weights: ['300', '400', '500', '600', '700'] });

// ── Layout constants ──────────────────────────────────────────────────────────
// Left panel
const PANEL_X = 60;
const PANEL_Y = 160;

// Right table
const TABLE_X = 1020;
const TABLE_Y = 180;

// ── Timeline ──────────────────────────────────────────────────────────────────
// 0–22    : global fade in
// 18–45   : code panel enters
// 45–120  : first code line (ALTER TABLE) types in
// 90      : table enters from right
// 90–175  : rows stagger in — Phase 1 RLS OFF (all allow)
// 175–215 : Phase 2: RLS ON, no policy — all rows flip to deny
// 215     : badge "RLS ON" appears
// 260     : Phase 3: policy line types in, rows owned by user flip to allow
// 360–420 : hold final state

const PHASE1_END   = 175; // all allow → all deny
const PHASE2_END   = 260; // deny → policy typed → partial allow
const POLICY_START = 240; // when policy code line appears

export const RlsToggleExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  void useVideoConfig();

  const globalIn = itp(frame, 0, 22);

  // Phase transitions
  const phase2Prog = itp(frame, PHASE1_END, PHASE1_END + 20); // 0→1 flip to deny
  const phase3Prog = itp(frame, PHASE2_END, PHASE2_END + 25); // 0→1 partial allow

  // Row highlight helper
  // user_id values: row 0,2 = 'user-abc' (current user), row 1,3 = 'user-xyz'
  const getHighlight = (rowIdx: number): 'allow' | 'deny' | 'neutral' => {
    const isCurrentUser = rowIdx === 0 || rowIdx === 2;
    if (phase2Prog < 0.5) {
      // Phase 1: RLS off, all allow
      return 'allow';
    } else if (phase3Prog < 0.5) {
      // Phase 2: RLS on no policy — all deny
      return 'deny';
    } else {
      // Phase 3: policy applied — current user rows allow
      return isCurrentUser ? 'allow' : 'deny';
    }
  };

  const columns: ColumnDef[] = [
    { label: 'id',      width: 70,  color: FG_MUTED, mono: true },
    { label: 'user_id', width: 190, mono: true },
    { label: 'content', mono: true },
  ];

  const rows: RowData[] = [
    { id: 'r1', cells: ['1', 'user-abc', 'Hello world'],      highlight: getHighlight(0), enterFrame: 95  },
    { id: 'r2', cells: ['2', 'user-xyz', 'Second post'],       highlight: getHighlight(1), enterFrame: 110 },
    { id: 'r3', cells: ['3', 'user-abc', 'Third post'],        highlight: getHighlight(2), enterFrame: 125 },
    { id: 'r4', cells: ['4', 'user-xyz', 'Another entry'],     highlight: getHighlight(3), enterFrame: 140 },
  ];

  // Active states for code lines
  const altLineActive  = itp(frame, 130, 155);
  const rlsOnActive    = itp(frame, PHASE1_END, PHASE1_END + 20);
  const policyActive   = itp(frame, POLICY_START, POLICY_START + 30);

  const codeLines: CodeLineData[] = [
    {
      tokens: [
        { type: 'comment', text: '-- Step 1: Enable RLS on posts table' },
      ],
      startFrame: 60,
      active: 0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'keyword', text: 'ALTER' },
        { type: 'plain', text: ' ' },
        { type: 'keyword', text: 'TABLE' },
        { type: 'plain', text: ' ' },
        { type: 'table', text: 'posts' },
        { type: 'plain', text: ' ' },
        { type: 'keyword', text: 'ENABLE' },
        { type: 'plain', text: ' ROW LEVEL SECURITY;' },
      ],
      startFrame: 80,
      active: altLineActive,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'comment', text: '-- Step 2: Create a policy for the owner' },
      ],
      startFrame: POLICY_START,
      active: 0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'keyword', text: 'CREATE' },
        { type: 'plain', text: ' ' },
        { type: 'keyword', text: 'POLICY' },
        { type: 'plain', text: ' ' },
        { type: 'string', text: "'owner_only'" },
        { type: 'plain', text: ' ' },
        { type: 'keyword', text: 'ON' },
        { type: 'plain', text: ' ' },
        { type: 'table', text: 'posts' },
      ],
      startFrame: POLICY_START + 10,
      active: policyActive,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'keyword', text: 'USING' },
        { type: 'plain', text: ' (' },
        { type: 'fn', text: 'auth.uid()' },
        { type: 'plain', text: ' = ' },
        { type: 'table', text: 'user_id' },
        { type: 'plain', text: ');' },
      ],
      startFrame: POLICY_START + 30,
      active: policyActive,
      showAccent: true,
    },
  ];

  // RLS badge visibility
  const rlsBadgeOp = itp(frame, PHASE1_END, PHASE1_END + 25);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', opacity: globalIn }}>
      <DotGrid />

      {/* SVG layer — no connectors needed for this composition */}
      <svg
        width={1920}
        height={1080}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
      />

      {/* LEFT: CodePanel */}
      <div style={{ position: 'absolute', left: PANEL_X, top: PANEL_Y }}>
        <CodePanel
          filename="rls.sql"
          lines={codeLines}
          enterFrame={18}
          enterFrom="left"
          width={880}
          codeFontSize={19}
        />
      </div>

      {/* Phase label — RLS OFF / ON */}
      <div
        style={{
          position: 'absolute',
          left: TABLE_X,
          top: TABLE_Y - 60,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            fontFamily: `${interFont}, sans-serif`,
            fontSize: 13,
            fontWeight: 700,
            color: phase2Prog > 0.5 ? RED : GREEN,
            letterSpacing: '0.06em',
            opacity: itp(frame, 85, 105),
            transition: 'color 0.3s',
            padding: '5px 14px',
            borderRadius: 8,
            border: `1.5px solid ${phase2Prog > 0.5 ? RED : GREEN}`,
            background: phase2Prog > 0.5 ? 'rgba(240,64,64,0.08)' : 'rgba(62,207,142,0.08)',
          }}
        >
          RLS {phase2Prog > 0.5 ? 'ON' : 'OFF'}
        </div>

        {/* Policy indicator */}
        {phase3Prog > 0.1 && (
          <div
            style={{
              fontFamily: `${interFont}, sans-serif`,
              fontSize: 13,
              fontWeight: 700,
              color: GREEN,
              letterSpacing: '0.06em',
              opacity: phase3Prog,
              padding: '5px 14px',
              borderRadius: 8,
              border: `1.5px solid ${GREEN}`,
              background: 'rgba(62,207,142,0.08)',
            }}
          >
            Policy active
          </div>
        )}
      </div>

      {/* RIGHT: Table */}
      <div style={{ position: 'absolute', left: TABLE_X, top: TABLE_Y }}>
        <Table
          tableName="public.posts"
          columns={columns}
          rows={rows}
          showStatus
          enterFrame={90}
          enterFrom="right"
        />
      </div>

      {/* No-policy warning */}
      {phase2Prog > 0.5 && phase3Prog < 0.3 && (
        <div
          style={{
            position: 'absolute',
            left: TABLE_X,
            top: TABLE_Y + 280,
            fontFamily: `${interFont}, sans-serif`,
            fontSize: 14,
            color: RED,
            opacity: Math.min(phase2Prog * 2 - 1, 1) * (1 - phase3Prog * 3),
            letterSpacing: '0.02em',
          }}
        >
          No policy = all rows blocked
        </div>
      )}

      {/* Policy result label */}
      {phase3Prog > 0.5 && (
        <div
          style={{
            position: 'absolute',
            left: TABLE_X,
            top: TABLE_Y + 280,
            fontFamily: `${interFont}, sans-serif`,
            fontSize: 14,
            color: GREEN,
            opacity: itp(frame, PHASE2_END + 12, PHASE2_END + 30),
            letterSpacing: '0.02em',
          }}
        >
          auth.uid() = user_id → owner rows visible
        </div>
      )}
    </AbsoluteFill>
  );
};
