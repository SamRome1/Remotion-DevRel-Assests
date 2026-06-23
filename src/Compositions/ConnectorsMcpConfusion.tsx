import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  Img,
  staticFile,
} from 'remotion';
import { loadFont, fontFamily } from '@remotion/google-fonts/Inter';

loadFont('normal', { weights: ['400', '600', '700', '800'] });

// ─── Constants ────────────────────────────────────────────────────────────────
const LOGO_SIZE = 200;
const BG = '#07070f';

// Center cluster: logos + "vs" sit at vertical center, spread horizontally
// Claude: left of center, MCP: right of center
const CENTER_X = 1920 / 2;
const CENTER_Y = 1080 / 2;
const LOGO_GAP = 280; // distance from center to each logo's center

// Comment data
const COMMENTS = [
  {
    startFrame: 70,
    initials: '1',
    avatarColor: '#60A5FA',
    username: '@user1',
    text: "Isn't this just MCP?",
    // top-left of Claude logo
    x: 420,
    y: 130,
    rotate: -2.5,
  },
  {
    startFrame: 140,
    initials: '2',
    avatarColor: '#A78BFA',
    username: '@user2',
    text: 'Why would I use a connector instead of MCP?',
    // centered above MCP logo (logo center x:1240, card 460w → x:1010)
    x: 1010,
    y: 260,
    rotate: 1.8,
  },
  {
    startFrame: 210,
    initials: '3',
    avatarColor: '#34D399',
    username: '@user3',
    text: 'Is Claude Code doing something new here??',
    // bottom middle — card is 460w so x=730 centers it at x:960
    x: 730,
    y: 740,
    rotate: -1.2,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function sp(
  frame: number,
  start: number,
  damping = 14,
  stiffness = 160,
  mass = 0.8
): number {
  if (frame < start) return 0;
  return spring({
    frame: frame - start,
    fps: 30,
    config: { damping, stiffness, mass },
  });
}

// ─── Comment Card ─────────────────────────────────────────────────────────────
function CommentCard({
  frame,
  startFrame,
  initials,
  avatarColor,
  username,
  text,
  x,
  y,
  rotate,
}: {
  frame: number;
  startFrame: number;
  initials: string;
  avatarColor: string;
  username: string;
  text: string;
  x: number;
  y: number;
  rotate: number;
}) {
  if (frame < startFrame) return null;

  const progress = sp(frame, startFrame);

  const opacity = interpolate(progress, [0, 0.4], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(progress, [0, 1], [0.6, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 460,
        opacity,
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        transformOrigin: 'top left',
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(8px)',
        padding: '22px 26px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
      }}
    >
      {/* Top row: avatar + username */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Avatar */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: avatarColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 0 14px ${avatarColor}66`,
          }}
        >
          <span
            style={{
              fontFamily,
              fontWeight: 700,
              fontSize: 18,
              color: '#07070f',
              lineHeight: 1,
            }}
          >
            {initials}
          </span>
        </div>
        {/* Username */}
        <span
          style={{
            fontFamily,
            fontWeight: 600,
            fontSize: 18,
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.01em',
          }}
        >
          {username}
        </span>
      </div>

      {/* Comment text */}
      <span
        style={{
          fontFamily,
          fontWeight: 600,
          fontSize: 26,
          color: '#ffffff',
          lineHeight: 1.35,
          letterSpacing: '-0.01em',
        }}
      >
        {text}
      </span>
    </div>
  );
}

// ─── Main Composition ─────────────────────────────────────────────────────────
export const ConnectorsMcpConfusion: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Logo entrance ─────────────────────────────────────────────────────────
  // Claude slides in from left (0 → phase2 start)
  const claudeEnterProgress = sp(frame, 0, 14, 160);
  const claudeX = interpolate(claudeEnterProgress, [0, 1], [-LOGO_SIZE - 80, CENTER_X - LOGO_GAP - LOGO_SIZE / 2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // MCP slides in from right
  const mcpEnterProgress = sp(frame, 0, 14, 160);
  const mcpX = interpolate(mcpEnterProgress, [0, 1], [1920 + 80, CENTER_X + LOGO_GAP - LOGO_SIZE / 2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const logoY = CENTER_Y - LOGO_SIZE / 2;

  // "vs" fade in
  const vsOpacity = interpolate(frame, [10, 35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const vsScale = interpolate(
    sp(frame, 10, 12, 180),
    [0, 1],
    [0.5, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden' }}>
      {/* Dot grid background */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.032) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          pointerEvents: 'none',
        }}
      />

      {/* ── Claude logo + label ── */}
      <div
        style={{
          position: 'absolute',
          left: claudeX,
          top: logoY,
          width: LOGO_SIZE,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          filter: 'drop-shadow(0 0 28px rgba(210,160,100,0.6))',
        }}
      >
        <Img
          src={staticFile('claudelogo.png')}
          style={{ width: LOGO_SIZE, height: LOGO_SIZE, objectFit: 'contain' }}
        />
        <span style={{
          fontFamily,
          fontWeight: 700,
          fontSize: 28,
          color: '#D4A574',
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap',
        }}>
          Connectors
        </span>
      </div>

      {/* ── "vs" label ── */}
      <div
        style={{
          position: 'absolute',
          left: CENTER_X,
          top: CENTER_Y,
          transform: `translate(-50%, -50%) scale(${vsScale})`,
          opacity: vsOpacity,
          fontFamily,
          fontWeight: 800,
          fontSize: 64,
          color: '#ffffff',
          letterSpacing: '-0.02em',
          textShadow: '0 0 40px rgba(255,255,255,0.18)',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        vs
      </div>

      {/* ── MCP logo + label ── */}
      <div
        style={{
          position: 'absolute',
          left: mcpX,
          top: logoY,
          width: LOGO_SIZE,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          filter: 'drop-shadow(0 0 28px rgba(62,207,142,0.6))',
        }}
      >
        <Img
          src={staticFile('mcp.png')}
          style={{
            width: LOGO_SIZE,
            height: LOGO_SIZE,
            objectFit: 'contain',
            mixBlendMode: 'multiply',
          }}
        />
        <span style={{
          fontFamily,
          fontWeight: 700,
          fontSize: 28,
          color: '#3ECF8E',
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap',
        }}>
          MCP
        </span>
      </div>

      {/* ── Comment cards ── */}
      {COMMENTS.map((c) => (
        <CommentCard
          key={c.username}
          frame={frame}
          startFrame={c.startFrame}
          initials={c.initials}
          avatarColor={c.avatarColor}
          username={c.username}
          text={c.text}
          x={c.x}
          y={c.y}
          rotate={c.rotate}
        />
      ))}
    </AbsoluteFill>
  );
};
