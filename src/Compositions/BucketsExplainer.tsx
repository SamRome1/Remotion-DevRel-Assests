import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont, fontFamily as interFont } from '@remotion/google-fonts/Inter';
import {
  BG, GREEN, FG, FG_MUTED, FG_LIGHT, WARNING,
  DotGrid, itp, sp, spSlow, glowStyles, iconColor,
  BORDER, SURFACE_100, MONO,
} from '../tokens';
import { CodePanel } from '../Components/CodePanel';
import type { CodeLineData } from '../Components/CodePanel';
import { TreeNode, ConnectorLine, TravelingDot } from '../Components/TreeNode';
import { IconStorage, FolderOpen, HardDrive, ExternalLink, Lock } from '../Components/Icons';

loadFont('normal', { weights: ['300', '400', '500', '600', '700'] });

// ── Layout constants ──────────────────────────────────────────────────────────
const NODE_H = 100;
const NODE_W = 230;
const ROOT_W = 260;

const PANEL_X = 60;
const PANEL_Y = 155;

// Right tree — two buckets side by side below root
const RIGHT_CX   = 1380;
const ROOT_CY    = 180;
// Avatars branch (left)
const AVATAR_CX  = 1230;
const AVATAR_CY  = 430;
const PUB_URL_CX = 1230;
const PUB_URL_CY = 680;
// Documents branch (right)
const DOCS_CX    = 1540;
const DOCS_CY    = 430;
const SIGN_CX    = 1540;
const SIGN_CY    = 680;

// ── Timeline ──────────────────────────────────────────────────────────────────
// 0–22   : global fade in
// 18–45  : code panel enters
// 45–90  : root "Storage" node enters
// 60     : code line 1 types
// 90     : code line 2 types
// 120    : code line 3 types
// 100    : avatars bucket node enters
// 115    : documents bucket node enters
// 130    : conn root→avatars
// 145    : conn root→documents
// 155    : public-url node enters
// 165    : signed-url node enters
// 170    : conn avatars→pub-url
// 185    : conn docs→sign-url
// 200    : avatars bucket glows (upload code active)
// 220    : pub-url node glows
// 250    : dot root→avatars
// 280    : dot avatars→pub-url

export const BucketsExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  void useVideoConfig();

  const globalIn = itp(frame, 0, 22);

  const line1Active = itp(frame, 200, 225);
  const line2Active = itp(frame, 210, 235);

  const codeLines: CodeLineData[] = [
    {
      tokens: [
        { type: 'comment', text: '// Upload a file to the avatars bucket' },
      ],
      startFrame: 60,
      active: 0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'plain', text: 'supabase' },
        { type: 'plain', text: '.' },
        { type: 'fn', text: 'storage' },
        { type: 'plain', text: '.' },
        { type: 'fn', text: 'from' },
        { type: 'plain', text: '(' },
        { type: 'string', text: "'avatars'" },
        { type: 'plain', text: ')' },
      ],
      startFrame: 80,
      active: line1Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '  .' },
        { type: 'fn', text: 'upload' },
        { type: 'plain', text: '(path, file)' },
      ],
      startFrame: 110,
      active: line2Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'comment', text: '// Buckets: avatars (public), documents (private)' },
      ],
      startFrame: 155,
      active: 0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'comment', text: '// Public bucket → getPublicUrl()' },
      ],
      startFrame: 185,
      active: 0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'comment', text: '// Private bucket → createSignedUrl()' },
      ],
      startFrame: 210,
      active: 0,
      showAccent: false,
    },
  ];

  // Node glows
  const rootGlow    = itp(frame, 55, 80);
  const avatarGlow  = itp(frame, 200, 225);
  const docsGlow    = itp(frame, 115, 140, 0, 0.3);
  const pubUrlGlow  = itp(frame, 220, 245);
  const signUrlGlow = itp(frame, 165, 190, 0, 0.3);

  // Connector progresses
  const connRootAvatar = itp(frame, 130, 155);
  const connRootDocs   = itp(frame, 145, 170);
  const connAvatarPub  = itp(frame, 170, 195);
  const connDocsSign   = itp(frame, 185, 210);

  // Dots
  const dot1Prog = itp(frame, 250, 285);
  const dot2Prog = itp(frame, 280, 315);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', opacity: globalIn }}>
      <DotGrid />

      <svg
        width={1920}
        height={1080}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
      >
        {/* Root → avatars */}
        <ConnectorLine
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={AVATAR_CX} y2={AVATAR_CY - NODE_H / 2}
          progress={connRootAvatar}
          litProgress={avatarGlow}
          strokeWidth={3}
          arrow
          id="buck-root-avatar"
        />
        {/* Root → documents */}
        <ConnectorLine
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={DOCS_CX} y2={DOCS_CY - NODE_H / 2}
          progress={connRootDocs}
          litProgress={docsGlow}
          strokeWidth={3}
          arrow
          id="buck-root-docs"
        />
        {/* avatars → public URL */}
        <ConnectorLine
          x1={AVATAR_CX} y1={AVATAR_CY + NODE_H / 2}
          x2={PUB_URL_CX} y2={PUB_URL_CY - NODE_H / 2}
          progress={connAvatarPub}
          litProgress={pubUrlGlow}
          strokeWidth={3}
          arrow
          id="buck-avatar-pub"
        />
        {/* documents → signed URL */}
        <ConnectorLine
          x1={DOCS_CX} y1={DOCS_CY + NODE_H / 2}
          x2={SIGN_CX} y2={SIGN_CY - NODE_H / 2}
          progress={connDocsSign}
          litProgress={signUrlGlow}
          strokeWidth={3}
          arrow
          id="buck-docs-sign"
        />
        {/* Dots */}
        <TravelingDot
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={AVATAR_CX} y2={AVATAR_CY - NODE_H / 2}
          progress={dot1Prog}
          radius={6}
          color={GREEN}
        />
        <TravelingDot
          x1={AVATAR_CX} y1={AVATAR_CY + NODE_H / 2}
          x2={PUB_URL_CX} y2={PUB_URL_CY - NODE_H / 2}
          progress={dot2Prog}
          radius={6}
          color={GREEN}
        />
      </svg>

      {/* LEFT: CodePanel */}
      <div style={{ position: 'absolute', left: PANEL_X, top: PANEL_Y }}>
        <CodePanel
          filename="storage-upload.ts"
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
        Storage Buckets
      </div>

      {/* Root: Storage */}
      <TreeNode
        label="Storage"
        sublabel="supabase.storage"
        svgIcon={<IconStorage size={24} color={iconColor(rootGlow)} />}
        cx={RIGHT_CX}
        cy={ROOT_CY}
        glow={rootGlow}
        enterFrame={45}
        enterFrom="below"
        root
        width={ROOT_W}
        height={NODE_H}
      />

      {/* avatars bucket */}
      <TreeNode
        label="avatars"
        sublabel="public bucket"
        svgIcon={<FolderOpen size={24} strokeWidth={1.5} color={iconColor(avatarGlow)} />}
        cx={AVATAR_CX}
        cy={AVATAR_CY}
        glow={avatarGlow}
        enterFrame={100}
        enterFrom="below"
        width={NODE_W}
        height={NODE_H}
      />

      {/* documents bucket */}
      <TreeNode
        label="documents"
        sublabel="private bucket"
        svgIcon={<Lock size={24} strokeWidth={1.5} color={iconColor(docsGlow)} />}
        cx={DOCS_CX}
        cy={DOCS_CY}
        glow={docsGlow}
        enterFrame={115}
        enterFrom="below"
        width={NODE_W}
        height={NODE_H}
      />

      {/* public URL leaf */}
      <TreeNode
        label="Public URL"
        sublabel="getPublicUrl()"
        svgIcon={<ExternalLink size={24} strokeWidth={1.5} color={iconColor(pubUrlGlow)} />}
        cx={PUB_URL_CX}
        cy={PUB_URL_CY}
        glow={pubUrlGlow}
        enterFrame={155}
        enterFrom="below"
        width={NODE_W}
        height={NODE_H}
      />

      {/* signed URL leaf */}
      <TreeNode
        label="Signed URL"
        sublabel="createSignedUrl()"
        svgIcon={<Lock size={24} strokeWidth={1.5} color={iconColor(signUrlGlow)} />}
        cx={SIGN_CX}
        cy={SIGN_CY}
        glow={signUrlGlow}
        enterFrame={165}
        enterFrom="below"
        width={NODE_W}
        height={NODE_H}
      />
    </AbsoluteFill>
  );
};
