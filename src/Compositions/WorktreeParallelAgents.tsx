import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
} from 'remotion';
import { BG, GREEN, FG, FG_MUTED, FG_LIGHT, MONO, BORDER, DotGrid } from '../tokens';
import { circularFamily } from '../fonts';

// ── Timing ────────────────────────────────────────────────────────────────────

const TYPE_START      = 45;
const COMMAND         = 'claude';
const TYPE_FRAMES     = 30;                                     // 5 frames/char
const ENTER_FRAME     = TYPE_START + TYPE_FRAMES + 10;         // 85
const STARTUP_START   = ENTER_FRAME + 8;                       // 93
const READY_FRAME     = STARTUP_START + 40;                    // 133
const TRANSITION_START = READY_FRAME + 30;                     // 163

// scene 3 terminals stagger in during transition
const S3_T1 = TRANSITION_START - 5;                            // 158
const S3_T2 = S3_T1 + 14;                                     // 172
const S3_T3 = S3_T1 + 28;                                     // 186

// ── Helpers ───────────────────────────────────────────────────────────────────

const C = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

function ci(frame: number, f0: number, f1: number, v0: number, v1: number) {
  return interpolate(frame, [f0, f1], [v0, v1], C);
}

function typed(frame: number) {
  const progress = ci(frame, TYPE_START, TYPE_START + TYPE_FRAMES, 0, 1);
  return COMMAND.slice(0, Math.floor(progress * COMMAND.length));
}

const blink = (frame: number) => Math.floor(frame / 15) % 2 === 0;

// ── Shared sub-components ─────────────────────────────────────────────────────

const TitleBar: React.FC<{ title: string }> = ({ title }) => (
  <div style={{
    height: 44, backgroundColor: '#161616',
    borderBottom: `1px solid ${BORDER}`,
    display: 'flex', alignItems: 'center',
    padding: '0 16px', gap: 8, flexShrink: 0,
  }}>
    {(['#ff5f57', '#febc2e', '#28c840'] as const).map((c) => (
      <div key={c} style={{
        width: 12, height: 12, borderRadius: '50%',
        backgroundColor: c, boxShadow: `0 0 4px ${c}88`,
      }} />
    ))}
    <div style={{
      flex: 1, textAlign: 'center', marginRight: 52,
      fontFamily: MONO, fontSize: 13, color: FG_MUTED, letterSpacing: '0.02em',
    }}>
      {title}
    </div>
  </div>
);

const Cursor: React.FC<{ frame: number; active: boolean; color?: string }> = ({
  frame, active, color = GREEN,
}) => {
  if (!active) return null;
  return (
    <span style={{
      display: 'inline-block', width: 10, height: 20,
      backgroundColor: blink(frame) ? color : 'transparent',
      verticalAlign: 'middle', marginLeft: 2, borderRadius: 1,
    }} />
  );
};

// ── Scene 1 + 2: single terminal ──────────────────────────────────────────────

const SingleTerminal: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const winScale = spring({ frame, fps, config: { damping: 18, stiffness: 130 }, from: 0.92, to: 1, durationInFrames: 40 });
  const winY       = ci(frame, 0, 30, 70, 0);
  const winOpacity = ci(frame, 0, 18, 0, 1);

  const cursorActive    = frame >= TYPE_START && frame < ENTER_FRAME;
  const waitCursor      = frame >= ENTER_FRAME && frame < STARTUP_START;
  const startupOpacity  = ci(frame, STARTUP_START, STARTUP_START + 18, 0, 1);
  const line1Opacity    = ci(frame, STARTUP_START + 14, STARTUP_START + 24, 0, 1);
  const line2Opacity    = ci(frame, STARTUP_START + 26, STARTUP_START + 36, 0, 1);
  const readyOpacity    = ci(frame, READY_FRAME, READY_FRAME + 12, 0, 1);

  return (
    <div style={{
      position: 'absolute', left: 120, right: 120, top: 80, bottom: 80,
      transform: `translateY(${winY}px) scale(${winScale})`,
      opacity: winOpacity,
      transformOrigin: 'center center',
      display: 'flex', flexDirection: 'column',
      backgroundColor: '#111', borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 32px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07), 0 0 50px rgba(62,207,142,0.1)',
    }}>
      <TitleBar title="~/demo-project/feature-auth — zsh" />
      <div style={{
        flex: 1, padding: '32px 40px',
        fontFamily: MONO, fontSize: 20, lineHeight: 1.75, color: FG,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Prompt + typed command */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: GREEN }}>~/demo-project/feature-auth</span>
          <span style={{ color: FG_MUTED, margin: '0 10px' }}>$</span>
          <span>{typed(frame)}</span>
          <Cursor frame={frame} active={cursorActive} />
          <Cursor frame={frame} active={waitCursor} color={FG_MUTED} />
        </div>

        {/* Claude startup */}
        {frame >= STARTUP_START && (
          <div style={{ marginTop: 22, opacity: startupOpacity }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
              <img
                src={staticFile('claudelogo.png')}
                style={{ width: 38, height: 38, objectFit: 'contain',
                  filter: 'drop-shadow(0 0 10px rgba(212,169,106,0.5))' }}
              />
              <span style={{ fontSize: 22, fontWeight: 700, color: FG, letterSpacing: 0.3 }}>
                Claude Code
              </span>
            </div>
          </div>
        )}
        {frame >= STARTUP_START + 14 && (
          <div style={{ opacity: line1Opacity, color: FG_LIGHT, fontSize: 17, marginTop: 6 }}>
            ✓ Loaded project context
          </div>
        )}
        {frame >= STARTUP_START + 26 && (
          <div style={{ opacity: line2Opacity, color: FG_LIGHT, fontSize: 17, marginTop: 2 }}>
            ✓ Ready to assist with feature-auth
          </div>
        )}
        {frame >= READY_FRAME && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginTop: 16, opacity: readyOpacity,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              backgroundColor: GREEN, boxShadow: '0 0 10px rgba(62,207,142,0.9)',
            }} />
            <span style={{ color: GREEN, fontSize: 18 }}>Ready</span>
            <Cursor frame={frame} active color={GREEN} />
          </div>
        )}
      </div>

      {/* Bottom accent line */}
      <div style={{
        height: 2,
        background: `linear-gradient(90deg, transparent, rgba(62,207,142,${ci(frame, READY_FRAME, READY_FRAME + 20, 0, 0.6)}) 50%, transparent)`,
      }} />
    </div>
  );
};

// ── Scene 3: parallel agents ──────────────────────────────────────────────────

const AGENTS = [
  {
    path:  'feature-auth',
    color: GREEN,
    glow:  'rgba(62,207,142,0.18)',
    lines: [
      { text: '> Analyzing codebase...',      delay: 20 },
      { text: '> Writing auth.middleware.ts', delay: 42 },
      { text: '> Adding JWT validation',      delay: 65 },
      { text: '✓ 4 files written',            delay: 90, success: true },
    ],
  },
  {
    path:  'feature-payments',
    color: '#64B5F6',
    glow:  'rgba(100,181,246,0.18)',
    lines: [
      { text: '> Analyzing codebase...',        delay: 20 },
      { text: '> Creating stripe.service.ts',   delay: 45 },
      { text: '> Updating payment routes',      delay: 68 },
      { text: '✓ 3 files written',              delay: 95, success: true },
    ],
  },
  {
    path:  'feature-dashboard',
    color: '#CE93D8',
    glow:  'rgba(206,147,216,0.18)',
    lines: [
      { text: '> Analyzing codebase...',      delay: 20 },
      { text: '> Building Dashboard.tsx',     delay: 48 },
      { text: '> Adding chart components',    delay: 72 },
      { text: '✓ 5 files written',            delay: 100, success: true },
    ],
  },
] satisfies { path: string; color: string; glow: string; lines: { text: string; delay: number; success?: boolean }[] }[];

const TERM_STARTS = [S3_T1, S3_T2, S3_T3];

const ParallelTerminals: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <div style={{
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'stretch',
    padding: '64px 48px', gap: 22,
  }}>
    {AGENTS.map((agent, idx) => {
      const tStart     = TERM_STARTS[idx];
      const termSpring = spring({ frame: frame - tStart, fps, config: { damping: 16, stiffness: 140 }, from: 0.9, to: 1, durationInFrames: 30 });
      const termY      = ci(frame, tStart, tStart + 28, 60, 0);
      const termOpacity = ci(frame, tStart, tStart + 20, 0, 1);

      return (
        <div key={agent.path} style={{
          flex: 1,
          transform: `translateY(${termY}px) scale(${termSpring})`,
          opacity: termOpacity,
          transformOrigin: 'center bottom',
          display: 'flex', flexDirection: 'column',
          backgroundColor: '#111', borderRadius: 12, overflow: 'hidden',
          boxShadow: `0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07), 0 0 32px ${agent.glow}`,
        }}>
          <TitleBar title={`${agent.path} — claude`} />
          <div style={{
            flex: 1, padding: '22px 26px',
            fontFamily: MONO, fontSize: 15, lineHeight: 1.8,
            color: FG, display: 'flex', flexDirection: 'column',
          }}>
            {/* Prompt */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ color: agent.color, fontSize: 14 }}>~/{agent.path}</span>
              <span style={{ color: FG_MUTED, margin: '0 6px' }}>$</span>
              <span>claude</span>
            </div>

            {/* Claude logo */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
              opacity: ci(frame, tStart + 10, tStart + 22, 0, 1),
            }}>
              <img
                src={staticFile('claudelogo.png')}
                style={{ width: 22, height: 22, objectFit: 'contain' }}
              />
              <span style={{ fontSize: 14, color: FG_LIGHT }}>Claude Code</span>
            </div>

            {/* Activity lines */}
            {agent.lines.map((line, li) => {
              const lineStart = tStart + 28 + line.delay;
              if (frame < lineStart) return null;
              return (
                <div key={li} style={{
                  opacity: ci(frame, lineStart, lineStart + 10, 0, 1),
                  color: line.success ? agent.color : FG_LIGHT,
                  fontWeight: line.success ? 600 : 400,
                  fontSize: 14,
                }}>
                  {line.text}
                </div>
              );
            })}

            {/* Cursor */}
            <div style={{ marginTop: 10 }}>
              <Cursor frame={frame} active={frame >= tStart + 10} color={agent.color} />
            </div>
          </div>

          {/* Active indicator line at bottom */}
          <div style={{
            height: 2,
            background: `linear-gradient(90deg, transparent, ${agent.color}99 50%, transparent)`,
            opacity: ci(frame, tStart + 20, tStart + 35, 0, 1),
          }} />
        </div>
      );
    })}
  </div>
);

// ── Root ──────────────────────────────────────────────────────────────────────

export const WorktreeParallelAgents: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s12Opacity = ci(frame, TRANSITION_START, TRANSITION_START + 22, 1, 0);
  const s3Opacity  = ci(frame, S3_T1 - 5, S3_T1 + 20, 0, 1);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', fontFamily: circularFamily }}>
      <DotGrid />
      <div style={{ position: 'absolute', inset: 0, opacity: s12Opacity }}>
        <SingleTerminal frame={frame} fps={fps} />
      </div>
      <div style={{ position: 'absolute', inset: 0, opacity: s3Opacity }}>
        <ParallelTerminals frame={frame} fps={fps} />
      </div>
    </AbsoluteFill>
  );
};
