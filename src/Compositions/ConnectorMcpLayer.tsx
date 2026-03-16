import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  Img,
  staticFile,
  useVideoConfig,
} from 'remotion';
import { loadFont, fontFamily } from '@remotion/google-fonts/Inter';

loadFont('normal', { weights: ['400', '600', '700', '800'] });

// ─── Palette ──────────────────────────────────────────────────────────────────
const CLAUDE_COLOR = '#D4A574';
const MCP_COLOR    = '#818CF8';

// ─── Canvas ───────────────────────────────────────────────────────────────────
const W = 1920;
const H = 1080;

// ─── Card dimensions ──────────────────────────────────────────────────────────
const CARD_W = 420;
const CARD_H = 400;
const STACK_GAP = 60;

// ─── Side-by-side positions ───────────────────────────────────────────────────
const SBS_LEFT_X  = W / 2 - CARD_W - 80;
const SBS_RIGHT_X = W / 2 + 80;
const SBS_Y       = (H - CARD_H) / 2;

// ─── Stack positions (Connector on top, MCP below) ────────────────────────────
const STACK_X        = (W - CARD_W) / 2;
const STACK_TOTAL_H  = CARD_H * 2 + STACK_GAP;
const CONNECTOR_Y    = (H - STACK_TOTAL_H) / 2;
const MCP_Y          = CONNECTOR_Y + CARD_H + STACK_GAP;

// ─── Timeline ─────────────────────────────────────────────────────────────────
// T_CARDS   0   – cards slide in from sides
// T_SCAN   80   – x-ray scan sweeps Connector card, MCP glows through
// T_STACK  180  – cards glide into vertical stack
// T_LABELS 290  – layer labels + separator appear
// TOTAL    450  = 15 s
const T_CARDS  = 0;
const T_SCAN   = 80;
const T_STACK  = 185;
const T_LABELS = 295;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fi(frame: number, a: number, b: number) {
  return interpolate(frame, [a, b], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
}
function sp(frame: number, start: number, d = 14, s = 150, m = 0.7) {
  return spring({ frame: frame - start, fps: 30, config: { damping: d, stiffness: s, mass: m } });
}

// ─── Small badge component ────────────────────────────────────────────────────
function Badge({ label, color }: { label: string; color: string }) {
  return (
    <div style={{
      padding: '5px 16px',
      borderRadius: 100,
      backgroundColor: `${color}20`,
      border: `1.5px solid ${color}55`,
      fontSize: 13,
      fontWeight: 700,
      color,
      letterSpacing: 2,
      fontFamily,
    }}>
      {label}
    </div>
  );
}

// ─── Tag row ──────────────────────────────────────────────────────────────────
function TagRow({ tags, color }: { tags: string[]; color: string }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
      {tags.map(t => (
        <span key={t} style={{
          padding: '4px 12px',
          borderRadius: 8,
          backgroundColor: `${color}14`,
          border: `1px solid ${color}30`,
          fontSize: 14,
          fontWeight: 600,
          color: `${color}bb`,
          fontFamily,
        }}>{t}</span>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export const ConnectorMcpLayer: React.FC = () => {
  const frame = useCurrentFrame();
  useVideoConfig();

  // ── Card entrance springs ──────────────────────────────────────────────────
  const connectorEnter = sp(frame, T_CARDS, 14, 140);
  const mcpEnter       = sp(frame, T_CARDS + 8, 14, 140);

  // ── X-ray scan ────────────────────────────────────────────────────────────
  const scanDuration = 55;
  const scanY        = interpolate(frame, [T_SCAN, T_SCAN + scanDuration], [-10, CARD_H + 10], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const scanActive      = frame >= T_SCAN && frame < T_SCAN + scanDuration;
  const xrayReveal      = fi(frame, T_SCAN + scanDuration - 10, T_SCAN + scanDuration + 30);
  const mcpGhostOpacity = fi(frame, T_SCAN + scanDuration + 5, T_SCAN + scanDuration + 35) * 0.22;
  const borderGlowMCP   = fi(frame, T_SCAN + 20, T_SCAN + scanDuration + 20);

  // ── Stack movement ─────────────────────────────────────────────────────────
  const stackSp = sp(frame, T_STACK, 13, 130, 0.8);

  const connectorX = frame < T_STACK
    ? interpolate(connectorEnter, [0, 1], [SBS_LEFT_X - 350, SBS_LEFT_X])
    : interpolate(stackSp, [0, 1], [SBS_LEFT_X, STACK_X]);

  const connectorTop = frame < T_STACK
    ? SBS_Y
    : interpolate(stackSp, [0, 1], [SBS_Y, CONNECTOR_Y]);

  const mcpX = frame < T_STACK
    ? interpolate(mcpEnter, [0, 1], [SBS_RIGHT_X + 350, SBS_RIGHT_X])
    : interpolate(stackSp, [0, 1], [SBS_RIGHT_X, STACK_X]);

  const mcpTop = frame < T_STACK
    ? SBS_Y
    : interpolate(stackSp, [0, 1], [SBS_Y, MCP_Y]);

  // ── Label / separator fade ─────────────────────────────────────────────────
  const labelOp     = fi(frame, T_LABELS, T_LABELS + 22);
  const sepOp       = fi(frame, T_LABELS + 10, T_LABELS + 30);
  const rightLabelOp = fi(frame, T_LABELS + 20, T_LABELS + 40);

  // ── Connector card border: blends from Claude to MCP glow after scan ───────
  const connectorGlow = frame < T_SCAN
    ? `0 0 50px ${CLAUDE_COLOR}22`
    : `0 0 50px ${CLAUDE_COLOR}${Math.round((1 - borderGlowMCP) * 0x22).toString(16).padStart(2, '0')}, 0 0 60px ${MCP_COLOR}${Math.round(borderGlowMCP * 0x30).toString(16).padStart(2, '0')}`;

  const connectorBorderColor = frame < T_SCAN
    ? `${CLAUDE_COLOR}55`
    : `color-mix(in srgb, ${CLAUDE_COLOR}88 ${Math.round((1 - borderGlowMCP) * 100)}%, ${MCP_COLOR}88)`;

  // Stacked state: are we fully in stack?
  const inStack = frame >= T_STACK + 30;

  return (
    <AbsoluteFill style={{ backgroundColor: '#07070f', overflow: 'hidden', fontFamily }}>

      {/* Dot grid */}
      <AbsoluteFill style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.032) 1px, transparent 1px)',
        backgroundSize: '52px 52px',
        pointerEvents: 'none',
      }} />

      {/* ── CONNECTOR CARD ──────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: connectorX,
        top: connectorTop,
        width: CARD_W,
        height: CARD_H,
        borderRadius: 24,
        backgroundColor: 'rgba(212,165,116,0.07)',
        border: `2px solid ${connectorBorderColor}`,
        boxShadow: connectorGlow,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        padding: '32px 28px',
        overflow: 'hidden',
        position: 'absolute',
      } as React.CSSProperties}>

        {/* PRODUCT badge */}
        <div style={{ position: 'absolute', top: 18, right: 18 }}>
          <Badge label="PRODUCT" color={CLAUDE_COLOR} />
        </div>

        {/* Claude logo */}
        <Img
          src={staticFile('claudelogo.png')}
          style={{ width: 76, height: 76, objectFit: 'contain' }}
        />

        {/* Title */}
        <div style={{ fontSize: 36, fontWeight: 800, color: CLAUDE_COLOR, lineHeight: 1 }}>
          Connectors
        </div>

        {/* Divider */}
        <div style={{ width: '75%', height: 1, backgroundColor: `${CLAUDE_COLOR}28` }} />

        {/* Tagline */}
        <div style={{ fontSize: 17, color: 'rgba(255,255,255,0.42)', textAlign: 'center', lineHeight: 1.55 }}>
          Tools, ready to plug in
        </div>

        {/* Feature tags */}
        <TagRow tags={['1-click install', 'No setup', 'Branded']} color={CLAUDE_COLOR} />

        {/* ── X-ray scan line (sweeps top → bottom) */}
        {scanActive && (
          <>
            {/* Glow trail behind scan */}
            <div style={{
              position: 'absolute', left: 0, right: 0,
              top: 0, height: Math.max(0, scanY),
              background: `linear-gradient(to bottom, transparent 80%, ${MCP_COLOR}18)`,
              pointerEvents: 'none',
            }} />
            {/* Scan line itself */}
            <div style={{
              position: 'absolute', left: 0, right: 0,
              top: scanY, height: 3,
              background: `linear-gradient(90deg, transparent, ${MCP_COLOR}cc, ${MCP_COLOR}, ${MCP_COLOR}cc, transparent)`,
              boxShadow: `0 0 16px ${MCP_COLOR}, 0 0 32px ${MCP_COLOR}88`,
              pointerEvents: 'none',
            }} />
          </>
        )}

        {/* ── Post-scan: ghostly MCP text visible "underneath" */}
        {frame >= T_SCAN + scanDuration - 10 && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
            opacity: mcpGhostOpacity,
          }}>
            <span style={{
              fontSize: 110,
              fontWeight: 800,
              color: MCP_COLOR,
              letterSpacing: 6,
              filter: `blur(1px) drop-shadow(0 0 20px ${MCP_COLOR})`,
            }}>
              MCP
            </span>
          </div>
        )}

        {/* Post-scan purple inner tint */}
        {frame >= T_SCAN && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 24,
            backgroundColor: `${MCP_COLOR}${Math.round(xrayReveal * 0.08 * 255).toString(16).padStart(2, '0')}`,
            pointerEvents: 'none',
          }} />
        )}
      </div>

      {/* ── MCP CARD ────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: mcpX,
        top: mcpTop,
        width: CARD_W,
        height: CARD_H,
        borderRadius: 24,
        backgroundColor: 'rgba(129,140,248,0.07)',
        border: `2px solid ${MCP_COLOR}55`,
        boxShadow: `0 0 50px ${MCP_COLOR}20`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        padding: '32px 28px',
        overflow: 'hidden',
      }}>

        {/* PROTOCOL badge */}
        <div style={{ position: 'absolute', top: 18, right: 18 }}>
          <Badge label="PROTOCOL" color={MCP_COLOR} />
        </div>

        {/* MCP big text */}
        <div style={{
          fontSize: 72,
          fontWeight: 800,
          color: MCP_COLOR,
          letterSpacing: 5,
          lineHeight: 1,
          filter: `drop-shadow(0 0 20px ${MCP_COLOR}60)`,
        }}>
          MCP
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 16, fontWeight: 600, color: `${MCP_COLOR}99`, letterSpacing: 1 }}>
          Model Context Protocol
        </div>

        {/* Divider */}
        <div style={{ width: '75%', height: 1, backgroundColor: `${MCP_COLOR}28` }} />

        {/* Tagline */}
        <div style={{ fontSize: 17, color: 'rgba(255,255,255,0.42)', textAlign: 'center', lineHeight: 1.55 }}>
          Open standard for AI tool connectivity
        </div>

        {/* Technical tags */}
        <TagRow tags={['JSON-RPC', 'Transport', 'Open Source']} color={MCP_COLOR} />
      </div>

      {/* ── SEPARATOR (only shown in stacked state) ───────────────────────── */}
      {inStack && (
        <div style={{
          position: 'absolute',
          left: STACK_X,
          top: CONNECTOR_Y + CARD_H,
          width: CARD_W,
          height: STACK_GAP,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          opacity: sepOp,
        }}>
          {/* left line */}
          <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          {/* arrow indicator */}
          <div style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.28)',
            letterSpacing: 1,
            whiteSpace: 'nowrap',
          }}>
            ↑ built on top of ↓
          </div>
          {/* right line */}
          <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        </div>
      )}

      {/* ── RIGHT-SIDE LAYER LABELS ─────────────────────────────────────────── */}
      {inStack && frame >= T_LABELS && (
        <>
          {/* Connector → Product Layer */}
          <div style={{
            position: 'absolute',
            left: STACK_X + CARD_W + 36,
            top: CONNECTOR_Y + CARD_H / 2 - 28,
            opacity: rightLabelOp,
          }}>
            {/* bracket line */}
            <div style={{
              position: 'absolute',
              left: -20, top: 0, bottom: 0,
              width: 3, borderRadius: 2,
              backgroundColor: `${CLAUDE_COLOR}55`,
            }} />
            <div style={{ fontSize: 26, fontWeight: 700, color: CLAUDE_COLOR, lineHeight: 1 }}>
              Product Layer
            </div>
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.32)', marginTop: 6 }}>
              User-facing · Branded · Marketed
            </div>
          </div>

          {/* MCP → Protocol Layer */}
          <div style={{
            position: 'absolute',
            left: STACK_X + CARD_W + 36,
            top: MCP_Y + CARD_H / 2 - 28,
            opacity: rightLabelOp,
          }}>
            {/* bracket line */}
            <div style={{
              position: 'absolute',
              left: -20, top: 0, bottom: 0,
              width: 3, borderRadius: 2,
              backgroundColor: `${MCP_COLOR}55`,
            }} />
            <div style={{ fontSize: 26, fontWeight: 700, color: MCP_COLOR, lineHeight: 1 }}>
              Protocol Layer
            </div>
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.32)', marginTop: 6 }}>
              Technical foundation · Open standard
            </div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
