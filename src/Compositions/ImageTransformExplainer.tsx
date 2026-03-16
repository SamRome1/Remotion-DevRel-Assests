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
import { IconStorage, HardDrive, Zap, CheckCircle, ArrowRight } from '../Components/Icons';

loadFont('normal', { weights: ['300', '400', '500', '600', '700'] });

// ── Layout constants ──────────────────────────────────────────────────────────
const NODE_H = 100;
const NODE_W = 230;
const ROOT_W = 260;

const PANEL_X = 60;
const PANEL_Y = 130;

const RIGHT_CX   = 1390;
const ROOT_CY    = 180;
const TRANS_CY   = 390;
const CDN_CY     = 600;
const OPT_CY     = 810;

// ── Timeline ──────────────────────────────────────────────────────────────────
// 0–22   : global fade in
// 18–45  : code panel enters
// 45–90  : root node enters
// 60–200 : code lines type in (5 lines × 28f gap)
// 100    : transform node enters
// 120    : cdn node enters
// 140    : opt node enters
// 150    : conn root→transform
// 165    : conn transform→cdn
// 180    : conn cdn→opt
// 190    : root glows (getPublicUrl active)
// 210    : transform node glows
// 230    : cdn node glows
// 250    : opt node glows
// 280    : dot root→transform
// 305    : dot transform→cdn
// 330    : dot cdn→opt

export const ImageTransformExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  void useVideoConfig();

  const globalIn = itp(frame, 0, 22);

  const line2Active = itp(frame, 190, 215);
  const line3Active = itp(frame, 210, 235);
  const line4Active = itp(frame, 230, 255);

  const codeLines: CodeLineData[] = [
    {
      tokens: [
        { type: 'comment', text: '// Transform image on fetch' },
      ],
      startFrame: 60,
      active: 0,
      showAccent: false,
    },
    {
      tokens: [
        { type: 'plain', text: 'supabase.' },
        { type: 'fn', text: 'storage' },
        { type: 'plain', text: '.' },
        { type: 'fn', text: 'from' },
        { type: 'plain', text: '(' },
        { type: 'string', text: "'avatars'" },
        { type: 'plain', text: ')' },
      ],
      startFrame: 80,
      active: line2Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '  .' },
        { type: 'fn', text: 'getPublicUrl' },
        { type: 'plain', text: '(' },
        { type: 'string', text: "'photo.jpg'" },
        { type: 'plain', text: ', {' },
      ],
      startFrame: 108,
      active: line2Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '    ' },
        { type: 'table', text: 'transform' },
        { type: 'plain', text: ': {' },
      ],
      startFrame: 136,
      active: line3Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '      ' },
        { type: 'table', text: 'width' },
        { type: 'plain', text: ': 200, ' },
        { type: 'table', text: 'height' },
        { type: 'plain', text: ': 200,' },
      ],
      startFrame: 164,
      active: line4Active,
      showAccent: true,
    },
    {
      tokens: [
        { type: 'plain', text: '      ' },
        { type: 'table', text: 'resize' },
        { type: 'plain', text: ': ' },
        { type: 'string', text: "'cover'" },
        { type: 'plain', text: ' } })' },
      ],
      startFrame: 192,
      active: line4Active,
      showAccent: true,
    },
  ];

  // Node glows
  const rootGlow   = itp(frame, 55, 80);
  const transGlow  = itp(frame, 210, 235);
  const cdnGlow    = itp(frame, 230, 255);
  const optGlow    = itp(frame, 250, 275);

  // Connector progresses
  const connRootTrans = itp(frame, 150, 175);
  const connTransCdn  = itp(frame, 165, 190);
  const connCdnOpt    = itp(frame, 180, 205);

  // Dots
  const dot1Prog = itp(frame, 280, 315);
  const dot2Prog = itp(frame, 305, 340);
  const dot3Prog = itp(frame, 330, 360);

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
          x2={RIGHT_CX} y2={TRANS_CY - NODE_H / 2}
          progress={connRootTrans}
          litProgress={transGlow}
          strokeWidth={3}
          arrow
          id="img-root-trans"
        />
        <ConnectorLine
          x1={RIGHT_CX} y1={TRANS_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={CDN_CY - NODE_H / 2}
          progress={connTransCdn}
          litProgress={cdnGlow}
          strokeWidth={3}
          arrow
          id="img-trans-cdn"
        />
        <ConnectorLine
          x1={RIGHT_CX} y1={CDN_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={OPT_CY - NODE_H / 2}
          progress={connCdnOpt}
          litProgress={optGlow}
          strokeWidth={3}
          arrow
          id="img-cdn-opt"
        />
        <TravelingDot
          x1={RIGHT_CX} y1={ROOT_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={TRANS_CY - NODE_H / 2}
          progress={dot1Prog}
          radius={6}
          color={GREEN}
        />
        <TravelingDot
          x1={RIGHT_CX} y1={TRANS_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={CDN_CY - NODE_H / 2}
          progress={dot2Prog}
          radius={6}
          color={GREEN}
        />
        <TravelingDot
          x1={RIGHT_CX} y1={CDN_CY + NODE_H / 2}
          x2={RIGHT_CX} y2={OPT_CY - NODE_H / 2}
          progress={dot3Prog}
          radius={6}
          color={GREEN}
        />
      </svg>

      {/* LEFT: CodePanel */}
      <div style={{ position: 'absolute', left: PANEL_X, top: PANEL_Y }}>
        <CodePanel
          filename="image-transform.ts"
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
        Image Transforms
      </div>

      {/* Root: getPublicUrl() */}
      <TreeNode
        label="getPublicUrl()"
        sublabel="with transform params"
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

      {/* Transform node */}
      <TreeNode
        label="Transform"
        sublabel="width:200 height:200 cover"
        svgIcon={<Zap size={24} strokeWidth={1.5} color={iconColor(transGlow)} />}
        cx={RIGHT_CX}
        cy={TRANS_CY}
        glow={transGlow}
        enterFrame={100}
        enterFrom="below"
        width={NODE_W + 20}
        height={NODE_H}
      />

      {/* CDN Cache node */}
      <TreeNode
        label="CDN Cache"
        sublabel="edge-cached response"
        svgIcon={<HardDrive size={24} strokeWidth={1.5} color={iconColor(cdnGlow)} />}
        cx={RIGHT_CX}
        cy={CDN_CY}
        glow={cdnGlow}
        enterFrame={120}
        enterFrom="below"
        width={NODE_W}
        height={NODE_H}
      />

      {/* Optimized Image leaf */}
      <TreeNode
        label="Optimized Image"
        sublabel="200×200 JPEG/WebP"
        svgIcon={<CheckCircle size={24} strokeWidth={1.5} color={iconColor(optGlow)} />}
        cx={RIGHT_CX}
        cy={OPT_CY}
        glow={optGlow}
        enterFrame={140}
        enterFrom="below"
        width={NODE_W + 20}
        height={NODE_H}
      />
    </AbsoluteFill>
  );
};
