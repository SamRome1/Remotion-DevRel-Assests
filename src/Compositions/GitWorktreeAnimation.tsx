import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import {
  BG,
  GREEN,
  FG,
  FG_LIGHT,
  FG_MUTED,
  MONO,
  BORDER,
  DotGrid,
} from '../tokens';
import { circularFamily } from '../fonts';
import { GitBranch, CheckCircle2 } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Timing constants (frames @ 30 fps)
// ─────────────────────────────────────────────────────────────────────────────
const WINDOW_IN_START = 0;
const WINDOW_IN_END = 40;

const TYPE_START = 40;
const COMMAND = 'git worktree add ./feature-auth';
// ~2 chars per frame → 30 chars / 2 = ~40 frames of typing (comfortable pace)
const TYPE_DURATION = 80;
const ENTER_FRAME = 150;

const OUTPUT_START = 150;
const OUTPUT_LINE_1 = "Preparing worktree (checking out 'feature-auth')";
const OUTPUT_LINE_2 = 'HEAD is now at a3f8c21 Initial commit';
const OUTPUT_STAGGER = 18;

const FETCH_INDICATOR_START = 195;
const FETCH_INDICATOR_END = 230;

const SUCCESS_START = 230;
const SPLIT_VIEW_START = 255;

const HOLD_START = 270;

// ─────────────────────────────────────────────────────────────────────────────
// Colors
// ─────────────────────────────────────────────────────────────────────────────
const TITLE_BAR_BG = '#161616';
const TERMINAL_BG = '#111111';
const OUTPUT_DIM = FG_LIGHT;
const GREEN_GLOW = 'rgba(62, 207, 142, 0.35)';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function clamp(frame: number, start: number, end: number, from: number, to: number): number {
  return interpolate(frame, [start, end], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

function typedText(full: string, frame: number, start: number, duration: number): string {
  const progress = clamp(frame, start, start + duration, 0, 1);
  return full.slice(0, Math.floor(progress * full.length));
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const TrafficLightsCustom: React.FC<{ title: string }> = ({ title }) => (
  <div
    style={{
      height: 52,
      backgroundColor: TITLE_BAR_BG,
      borderBottom: `1px solid ${BORDER}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      flexShrink: 0,
      gap: 10,
    }}
  >
    {(['#ff5f57', '#febc2e', '#28c840'] as const).map((c) => (
      <div
        key={c}
        style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          backgroundColor: c,
          boxShadow: `0 0 5px ${c}88`,
          flexShrink: 0,
        }}
      />
    ))}
    <div
      style={{
        flex: 1,
        textAlign: 'center',
        color: FG_MUTED,
        fontSize: 14,
        fontFamily: MONO,
        letterSpacing: '0.02em',
        marginRight: 56,
      }}
    >
      {title}
    </div>
  </div>
);

const BlinkingCursor: React.FC<{ frame: number; active: boolean; color?: string }> = ({
  frame,
  active,
  color = GREEN,
}) => {
  if (!active) return null;
  const blink = Math.floor(frame / 15) % 2 === 0;
  return (
    <span
      style={{
        display: 'inline-block',
        width: 11,
        height: 22,
        backgroundColor: blink ? color : 'transparent',
        verticalAlign: 'middle',
        marginLeft: 3,
        borderRadius: 1,
      }}
    />
  );
};


// Branch pill
const BranchPill: React.FC<{ label: string; opacity: number; scale: number }> = ({
  label,
  opacity,
  scale,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      backgroundColor: 'rgba(62, 207, 142, 0.10)',
      border: '1px solid rgba(62, 207, 142, 0.30)',
      borderRadius: 999,
      padding: '6px 16px',
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'left center',
    }}
  >
    <GitBranch size={16} color={GREEN} strokeWidth={1.5} />
    <span
      style={{
        fontFamily: MONO,
        fontSize: 15,
        color: GREEN,
        fontWeight: 600,
        letterSpacing: 0.5,
      }}
    >
      {label}
    </span>
  </div>
);

// Dot spinner for fetch
const FetchDots: React.FC<{ frame: number; progress: number }> = ({ frame, progress }) => {
  const dots = [0, 1, 2];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 12 }}>
      {dots.map((i) => {
        const pulse = Math.sin(((frame - i * 8) / 12) * Math.PI * 2) * 0.5 + 0.5;
        return (
          <div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: GREEN,
              opacity: progress * (0.3 + pulse * 0.7),
              boxShadow: `0 0 ${6 * pulse}px ${GREEN_GLOW}`,
            }}
          />
        );
      })}
    </div>
  );
};

// Progress bar for fetch
const FetchProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div
    style={{
      width: 220,
      height: 3,
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderRadius: 99,
      overflow: 'hidden',
      marginLeft: 12,
    }}
  >
    <div
      style={{
        width: `${progress * 100}%`,
        height: '100%',
        backgroundColor: GREEN,
        borderRadius: 99,
        boxShadow: `0 0 8px ${GREEN_GLOW}`,
        transition: 'none',
      }}
    />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main composition
// ─────────────────────────────────────────────────────────────────────────────
export const GitWorktreeAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Window entrance ──────────────────────────────────────────────────────
  const windowY = clamp(frame, WINDOW_IN_START, WINDOW_IN_END, 80, 0);
  const windowOpacity = clamp(frame, WINDOW_IN_START, WINDOW_IN_START + 15, 0, 1);
  const windowScale = spring({
    frame: frame - WINDOW_IN_START,
    fps,
    config: { damping: 14, stiffness: 140, mass: 0.9 },
    from: 0.92,
    to: 1,
    durationInFrames: 40,
  });

  // ── Typing ───────────────────────────────────────────────────────────────
  const typed = typedText(COMMAND, frame, TYPE_START, TYPE_DURATION);
  const isCursorActive = frame >= TYPE_START && frame < ENTER_FRAME;
  // After Enter, cursor disappears
  const showWaitCursor = frame >= ENTER_FRAME && frame < OUTPUT_START;

  // ── Output lines ─────────────────────────────────────────────────────────
  const line1Opacity = clamp(frame, OUTPUT_START, OUTPUT_START + 10, 0, 1);
  const line2Opacity = clamp(frame, OUTPUT_START + OUTPUT_STAGGER, OUTPUT_START + OUTPUT_STAGGER + 10, 0, 1);

  // ── Fetch indicator ──────────────────────────────────────────────────────
  const fetchProgress = clamp(frame, FETCH_INDICATOR_START, FETCH_INDICATOR_END, 0, 1);
  const fetchBarProgress = clamp(frame, FETCH_INDICATOR_START, FETCH_INDICATOR_END - 5, 0, 1);

  // ── Success state ─────────────────────────────────────────────────────────
  const checkOpacity = clamp(frame, SUCCESS_START, SUCCESS_START + 12, 0, 1);
  const checkScale = spring({
    frame: frame - SUCCESS_START,
    fps,
    config: { damping: 16, stiffness: 180, mass: 0.7 },
    from: 0.4,
    to: 1,
    durationInFrames: 20,
  });

  // Split view for the two directories
  const splitOpacity = clamp(frame, SPLIT_VIEW_START, SPLIT_VIEW_START + 18, 0, 1);
  const splitScale = spring({
    frame: frame - SPLIT_VIEW_START,
    fps,
    config: { damping: 18, stiffness: 130, mass: 0.8 },
    from: 0.88,
    to: 1,
    durationInFrames: 25,
  });

  // ── Hold pulse ────────────────────────────────────────────────────────────
  const holdPulse = frame >= HOLD_START
    ? Math.sin(((frame - HOLD_START) / 30) * Math.PI * 2) * 0.5 + 0.5
    : 0;

  // ── Green glow on terminal during success ─────────────────────────────────
  const terminalGlow = clamp(frame, SUCCESS_START, SUCCESS_START + 30, 0, 1);
  const terminalGlowIntensity = terminalGlow * (0.6 + holdPulse * 0.4);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        overflow: 'hidden',
        fontFamily: circularFamily,
      }}
    >
      <DotGrid />

      {/* Ambient canvas glow — green, appears at success */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, rgba(62,207,142,${0.04 * terminalGlowIntensity}) 0%, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />

      {/* ── Main terminal window ────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 60,
          top: 60,
          bottom: frame >= SPLIT_VIEW_START ? 280 : 60,
          transform: `translateY(${windowY}px) scale(${windowScale})`,
          opacity: windowOpacity,
          transformOrigin: 'center center',
          backgroundColor: TERMINAL_BG,
          borderRadius: 14,
          boxShadow: [
            '0 40px 80px rgba(0,0,0,0.75)',
            `0 0 0 1px rgba(255,255,255,${0.06 + 0.08 * terminalGlowIntensity})`,
            frame >= SUCCESS_START
              ? `0 0 60px rgba(62,207,142,${0.12 * terminalGlowIntensity})`
              : '0 0 0 transparent',
          ].join(', '),
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Title bar */}
        <TrafficLightsCustom title="demo-project — zsh" />

        {/* Terminal body */}
        <div
          style={{
            flex: 1,
            padding: '32px 40px',
            fontFamily: MONO,
            fontSize: 20,
            lineHeight: '1.7',
            color: FG,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Prompt + typed command */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'nowrap' }}>
            <span style={{ color: GREEN, marginRight: 4 }}>~/demo-project</span>
            <span style={{ color: FG_MUTED, marginRight: 10 }}> $</span>
            <span style={{ color: FG }}>{typed}</span>
            <BlinkingCursor frame={frame} active={isCursorActive} />
            {/* Waiting cursor after enter, before output */}
            {showWaitCursor && (
              <BlinkingCursor frame={frame} active={true} color={FG_MUTED} />
            )}
          </div>

          {/* Output line 1 */}
          {frame >= OUTPUT_START && (
            <div
              style={{
                opacity: line1Opacity,
                color: OUTPUT_DIM,
                fontSize: 18,
                marginTop: 4,
              }}
            >
              {OUTPUT_LINE_1}
            </div>
          )}

          {/* Output line 2 */}
          {frame >= OUTPUT_START + OUTPUT_STAGGER && (
            <div
              style={{
                opacity: line2Opacity,
                color: OUTPUT_DIM,
                fontSize: 18,
              }}
            >
              {OUTPUT_LINE_2}
            </div>
          )}

          {/* GitHub / origin fetch indicator */}
          {frame >= FETCH_INDICATOR_START && (
            <div
              style={{
                marginTop: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 0,
                opacity: fetchProgress,
              }}
            >
              <BranchPill
                label="origin/feature-auth"
                opacity={1}
                scale={0.9 + fetchProgress * 0.1}
              />
              <FetchDots frame={frame} progress={fetchProgress} />
              <FetchProgressBar progress={fetchBarProgress} />
            </div>
          )}

          {/* Success checkmark + message */}
          {frame >= SUCCESS_START && (
            <div
              style={{
                marginTop: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                opacity: checkOpacity,
                transform: `scale(${checkScale})`,
                transformOrigin: 'left center',
              }}
            >
              <CheckCircle2
                size={28}
                color={GREEN}
                strokeWidth={1.5}
                style={{
                  filter: `drop-shadow(0 0 10px rgba(62,207,142,0.5))`,
                }}
              />
              <span
                style={{
                  color: GREEN,
                  fontSize: 20,
                  fontWeight: 600,
                  textShadow: `0 0 16px rgba(62,207,142,0.35)`,
                }}
              >
                Worktree created at ./feature-auth
              </span>
            </div>
          )}

          {/* New prompt ready */}
          {frame >= SUCCESS_START + 20 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 0,
                marginTop: 14,
                opacity: clamp(frame, SUCCESS_START + 20, SUCCESS_START + 30, 0, 1),
              }}
            >
              <span style={{ color: GREEN, marginRight: 4 }}>~/demo-project</span>
              <span style={{ color: FG_MUTED, marginRight: 10 }}> $</span>
              <BlinkingCursor frame={frame} active={true} />
            </div>
          )}
        </div>

        {/* Bottom accent line — pulses on hold */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg, transparent 0%, rgba(62,207,142,${0.4 * terminalGlowIntensity}) 30%, rgba(62,207,142,${0.8 * terminalGlowIntensity}) 50%, rgba(62,207,142,${0.4 * terminalGlowIntensity}) 70%, transparent 100%)`,
            borderRadius: '0 0 14px 14px',
          }}
        />
      </div>

      {/* ── Split view — two worktree cards ────────────────────────────────── */}
      {frame >= SPLIT_VIEW_START && (
        <div
          style={{
            position: 'absolute',
            left: 60,
            right: 60,
            bottom: 60,
            height: 200,
            display: 'flex',
            gap: 20,
            opacity: splitOpacity,
            transform: `scale(${splitScale})`,
            transformOrigin: 'center bottom',
          }}
        >
          {/* Original worktree card */}
          <div
            style={{
              flex: 1,
              backgroundColor: 'rgba(26,26,26,0.9)',
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              padding: '20px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              overflow: 'hidden',
            }}
          >
            {/* Card header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: FG_MUTED,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  color: FG_MUTED,
                  letterSpacing: 0.5,
                }}
              >
                worktree
              </span>
            </div>

            <div
              style={{
                fontFamily: MONO,
                fontSize: 18,
                color: FG,
                fontWeight: 600,
              }}
            >
              ~/demo-project
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: `1px solid ${BORDER}`,
                borderRadius: 999,
                padding: '4px 12px',
                width: 'fit-content',
              }}
            >
              <GitBranch size={13} color={FG_LIGHT} strokeWidth={1.5} />
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  color: FG_LIGHT,
                }}
              >
                main
              </span>
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 13,
                color: FG_MUTED,
                marginTop: 4,
              }}
            >
              HEAD → a3f8c21
            </div>
          </div>

          {/* Arrow divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              width: 40,
            }}
          >
            <svg width={32} height={32} viewBox="0 0 32 32" fill="none">
              <path
                d="M4 16h24M20 8l8 8-8 8"
                stroke={`rgba(62,207,142,${0.3 + holdPulse * 0.4})`}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* New worktree card */}
          <div
            style={{
              flex: 1,
              backgroundColor: 'rgba(62, 207, 142, 0.06)',
              border: `1px solid rgba(62, 207, 142, ${0.25 + holdPulse * 0.15})`,
              borderRadius: 12,
              padding: '20px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              overflow: 'hidden',
              boxShadow: `0 0 ${20 + holdPulse * 20}px rgba(62,207,142,${0.08 + holdPulse * 0.06})`,
            }}
          >
            {/* Card header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: GREEN,
                  boxShadow: `0 0 8px rgba(62,207,142,0.6)`,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  color: GREEN,
                  letterSpacing: 0.5,
                }}
              >
                worktree — new
              </span>
            </div>

            <div
              style={{
                fontFamily: MONO,
                fontSize: 18,
                color: GREEN,
                fontWeight: 600,
                textShadow: `0 0 12px rgba(62,207,142,0.3)`,
              }}
            >
              ~/demo-project/feature-auth
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                backgroundColor: 'rgba(62, 207, 142, 0.12)',
                border: '1px solid rgba(62, 207, 142, 0.30)',
                borderRadius: 999,
                padding: '4px 12px',
                width: 'fit-content',
              }}
            >
              <GitBranch size={13} color={GREEN} strokeWidth={1.5} />
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  color: GREEN,
                }}
              >
                feature-auth
              </span>
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 13,
                color: FG_LIGHT,
                marginTop: 4,
              }}
            >
              HEAD → a3f8c21 · clean working tree
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
