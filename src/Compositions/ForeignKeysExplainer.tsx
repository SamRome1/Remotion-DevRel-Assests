import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont, fontFamily as interFont } from '@remotion/google-fonts/Inter';
import {
  BG, GREEN, RED, FG, FG_MUTED, SYN_TABLE, SYN_STRING,
  DotGrid, itp, sp, spSlow, iconColor,
} from '../tokens';
import { CodePanel } from '../Components/CodePanel';
import type { CodeLineData } from '../Components/CodePanel';
import { Table } from '../Components/Table';
import type { ColumnDef, RowData } from '../Components/Table';

loadFont('normal', { weights: ['300', '400', '500', '600', '700'] });

// ── Layout constants ──────────────────────────────────────────────────────────
const PANEL_X = 60;
const PANEL_Y = 145;

// Tables positioned on the right side
const PROFILES_X = 1020;
const PROFILES_Y = 180;
const POSTS_X    = 1020;
const POSTS_Y    = 500;

// ── Timeline ──────────────────────────────────────────────────────────────────
// 0–22   : global fade in
// 18–45  : code panel enters
// 60–200 : code lines type in
// 90     : profiles table enters
// 130    : posts table enters
// 200    : profile row 1 highlights
// 230    : matching post rows highlight
// 270    : profile row 2 highlighted (alternate user)
// 300    : matching posts for user 2 highlight
// 360    : hold

const PROFILE_HL_1 = 200;
const POSTS_HL_1   = 230;
const PROFILE_HL_2 = 270;
const POSTS_HL_2   = 300;

export const ForeignKeysExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  void useVideoConfig();

  const globalIn = itp(frame, 0, 22);

  // Phase 1: highlight user-abc profile and its posts
  const phase1Prog = itp(frame, PROFILE_HL_1, PROFILE_HL_1 + 20);
  // Phase 2: switch to user-xyz highlight
  const phase2Prog = itp(frame, PROFILE_HL_2, PROFILE_HL_2 + 20);

  // Profiles table
  const profileColumns: ColumnDef[] = [
    { label: 'id',    width: 160, color: SYN_TABLE, mono: true },
    { label: 'email', mono: true },
  ];

  const profileRows: RowData[] = [
    {
      id: 'p1',
      cells: ['user-abc', 'alice@example.com'],
      highlight: phase2Prog > 0.5 ? 'neutral' : phase1Prog > 0.5 ? 'allow' : 'neutral',
      enterFrame: 95,
    },
    {
      id: 'p2',
      cells: ['user-xyz', 'bob@example.com'],
      highlight: phase2Prog > 0.5 ? 'allow' : 'neutral',
      enterFrame: 110,
    },
  ];

  // Posts table — user_id FK references profiles(id)
  const postsColumns: ColumnDef[] = [
    { label: 'id',      width: 50,  color: FG_MUTED, mono: true },
    { label: 'user_id', width: 160, color: SYN_TABLE, mono: true },
    { label: 'content', mono: true },
  ];

  const getPostHighlight = (userId: string): 'allow' | 'neutral' => {
    if (phase2Prog > 0.5 && userId === 'user-xyz') return 'allow';
    if (phase2Prog <= 0.5 && phase1Prog > 0.5 && userId === 'user-abc') return 'allow';
    return 'neutral';
  };

  const postRows: RowData[] = [
    { id: 'r1', cells: ['1', 'user-abc', 'Hello world'],      highlight: getPostHighlight('user-abc'), enterFrame: 135 },
    { id: 'r2', cells: ['2', 'user-xyz', 'Second post'],       highlight: getPostHighlight('user-xyz'), enterFrame: 148 },
    { id: 'r3', cells: ['3', 'user-abc', 'Third post'],        highlight: getPostHighlight('user-abc'), enterFrame: 161 },
  ];

  // Code lines showing the schema
  const line2Active = itp(frame, 200, 225);
  const line3Active = itp(frame, 225, 250);

  const codeLines: CodeLineData[] = [
    {
      tokens: [
        { type: 'comment', text: '-- profiles: primary key' },
      ],
      startFrame: 60,
      active: 0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'keyword', text: 'CREATE' },
        { type: 'plain', text: ' ' },
        { type: 'keyword', text: 'TABLE' },
        { type: 'plain', text: ' ' },
        { type: 'table', text: 'profiles' },
        { type: 'plain', text: ' (' },
      ],
      startFrame: 78,
      active: line2Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '  ' },
        { type: 'table', text: 'id' },
        { type: 'plain', text: ' uuid PRIMARY KEY' },
        { type: 'plain', text: ' );' },
      ],
      startFrame: 106,
      active: line2Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'comment', text: '-- posts: foreign key to profiles' },
      ],
      startFrame: 140,
      active: 0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'keyword', text: 'CREATE' },
        { type: 'plain', text: ' ' },
        { type: 'keyword', text: 'TABLE' },
        { type: 'plain', text: ' ' },
        { type: 'table', text: 'posts' },
        { type: 'plain', text: ' (' },
      ],
      startFrame: 158,
      active: line3Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '  ' },
        { type: 'table', text: 'user_id' },
        { type: 'plain', text: ' uuid REFERENCES ' },
        { type: 'fn', text: 'profiles' },
        { type: 'plain', text: '(id)' },
        { type: 'plain', text: ' );' },
      ],
      startFrame: 186,
      active: line3Active,
      showAccent: true,
    },
  ];

  // Relationship annotation label
  const fkAnnotationOp = itp(frame, POSTS_HL_1, POSTS_HL_1 + 25);
  const fkAnnotation2Op = itp(frame, POSTS_HL_2, POSTS_HL_2 + 25);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', opacity: globalIn }}>
      <DotGrid />

      {/* SVG layer for FK relationship arrow */}
      <svg
        width={1920}
        height={1080}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
      >
        {/* Arrow showing FK relationship from posts.user_id to profiles.id */}
        {fkAnnotationOp > 0.05 && (
          <line
            x1={POSTS_X + 90} y1={POSTS_Y - 10}
            x2={PROFILES_X + 90} y2={PROFILES_Y + 130}
            stroke={`rgba(62,207,142,${fkAnnotationOp * 0.6})`}
            strokeWidth={2}
            strokeDasharray="6 4"
          />
        )}
      </svg>

      {/* LEFT: CodePanel */}
      <div style={{ position: 'absolute', left: PANEL_X, top: PANEL_Y }}>
        <CodePanel
          filename="schema.sql"
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
          left: PROFILES_X,
          top: 90,
          fontFamily: `${interFont}, sans-serif`,
          fontSize: 15,
          fontWeight: 600,
          color: FG_MUTED,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          opacity: itp(frame, 45, 65),
        }}
      >
        Foreign Key Relationships
      </div>

      {/* RIGHT: profiles table */}
      <div style={{ position: 'absolute', left: PROFILES_X, top: PROFILES_Y }}>
        <Table
          tableName="public.profiles"
          columns={profileColumns}
          rows={profileRows}
          showStatus={false}
          enterFrame={90}
          enterFrom="right"
        />
      </div>

      {/* FK label between tables */}
      <div
        style={{
          position: 'absolute',
          left: PROFILES_X + 60,
          top: POSTS_Y - 52,
          fontFamily: `${interFont}, sans-serif`,
          fontSize: 13,
          fontWeight: 500,
          color: GREEN,
          opacity: itp(frame, 90, 115),
          letterSpacing: '0.03em',
          background: 'rgba(62,207,142,0.08)',
          border: '1px solid rgba(62,207,142,0.25)',
          borderRadius: 6,
          padding: '4px 12px',
        }}
      >
        posts.user_id REFERENCES profiles(id)
      </div>

      {/* RIGHT: posts table */}
      <div style={{ position: 'absolute', left: POSTS_X, top: POSTS_Y }}>
        <Table
          tableName="public.posts"
          columns={postsColumns}
          rows={postRows}
          showStatus={false}
          enterFrame={130}
          enterFrom="right"
        />
      </div>

      {/* Highlight explanation label */}
      {phase1Prog > 0.3 && phase2Prog < 0.5 && (
        <div
          style={{
            position: 'absolute',
            left: POSTS_X,
            top: POSTS_Y + 240,
            fontFamily: `${interFont}, sans-serif`,
            fontSize: 14,
            color: GREEN,
            opacity: Math.min(phase1Prog * 2, 1) * (1 - phase2Prog),
            letterSpacing: '0.02em',
          }}
        >
          user-abc posts highlighted — FK match
        </div>
      )}
      {phase2Prog > 0.3 && (
        <div
          style={{
            position: 'absolute',
            left: POSTS_X,
            top: POSTS_Y + 240,
            fontFamily: `${interFont}, sans-serif`,
            fontSize: 14,
            color: GREEN,
            opacity: phase2Prog,
            letterSpacing: '0.02em',
          }}
        >
          user-xyz posts highlighted — FK match
        </div>
      )}
    </AbsoluteFill>
  );
};
