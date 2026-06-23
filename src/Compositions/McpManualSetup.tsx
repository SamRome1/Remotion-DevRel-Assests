import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
} from 'remotion';
import { loadFont, fontFamily } from '@remotion/google-fonts/Inter';

loadFont('normal', { weights: ['400', '600', '700', '800'] });

// ─── Constants ────────────────────────────────────────────────────────────────
const BG = '#07070f';
const MONO = "'Menlo', 'Monaco', monospace";

const TERMINAL_BG    = '#0d0d0d';
const TERMINAL_TEXT  = 'rgba(255,255,255,0.85)';
const TERMINAL_MUTED = 'rgba(255,255,255,0.35)';
const TERMINAL_STR   = '#FBBF24';
const TERMINAL_KW    = '#3ECF8E';

// Column geometry — 1080×1080 square
const LEFT_X   = 40;
const RIGHT_X  = 520;
const RIGHT_W  = 720;
const COL_H    = 1080;

// Step timing: frame when each step row + terminal swap fires
const STEP_STARTS = [60, 120, 190, 260] as const;

// Footer caption start
const FOOTER_START = 400;

// Terminal panel entrance
const TERMINAL_ENTER = 40;

// ─── Step definitions ─────────────────────────────────────────────────────────
interface StepDef {
  color: string;
  title: string;
  subtitle: string;
  terminal: TerminalLine[];
}

interface TerminalLine {
  text: string;
  type: 'cmd' | 'output' | 'comment' | 'json' | 'blank' | 'kw';
}

const STEPS: StepDef[] = [
  {
    color: '#60A5FA',
    title: 'Find the right MCP server',
    subtitle: 'Browse GitHub or the MCP registry',
    terminal: [
      { text: '$ open https://github.com/modelcontextprotocol/servers', type: 'cmd' },
      { text: '', type: 'blank' },
      { text: '# 150+ community servers...', type: 'comment' },
      { text: '# database, calendar, GitHub, Slack...', type: 'comment' },
      { text: '# Which one is right for you?', type: 'comment' },
    ],
  },
  {
    color: '#A78BFA',
    title: 'Clone the repo',
    subtitle: 'Download it to your machine',
    terminal: [
      { text: '$ git clone https://github.com/modelcontextprotocol/servers', type: 'cmd' },
      { text: "Cloning into 'servers'...", type: 'output' },
      { text: 'remote: Enumerating objects: 4821, done.', type: 'output' },
      { text: 'remote: Counting objects: 100% (4821/4821), done.', type: 'output' },
      { text: 'Receiving objects: 100% (4821/4821), 12.3 MB', type: 'output' },
    ],
  },
  {
    color: '#FBBF24',
    title: 'Write config files',
    subtitle: 'Edit claude_desktop_config.json',
    terminal: [
      { text: '{', type: 'json' },
      { text: '  "mcpServers": {', type: 'json' },
      { text: '    "my-database": {', type: 'json' },
      { text: '      "command": "node",', type: 'json' },
      { text: '      "args": ["/path/to/server/dist/index.js"],', type: 'json' },
      { text: '      "env": {', type: 'json' },
      { text: '        "DATABASE_URL": "..."', type: 'json' },
      { text: '      }', type: 'json' },
      { text: '    }', type: 'json' },
      { text: '  }', type: 'json' },
      { text: '}', type: 'json' },
    ],
  },
  {
    color: '#F472B6',
    title: 'Handle your own auth',
    subtitle: 'API keys, tokens, env vars',
    terminal: [
      { text: '$ export GITHUB_TOKEN=ghp_xxxxxxxxxxxx', type: 'cmd' },
      { text: '$ export DATABASE_URL=postgresql://...', type: 'cmd' },
      { text: '$ export SLACK_BOT_TOKEN=xoxb-...', type: 'cmd' },
      { text: '', type: 'blank' },
      { text: "# Don't forget to add these to your shell profile", type: 'comment' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sp(frame: number, start: number, damping = 14, stiffness = 160, mass = 0.8): number {
  if (frame < start) return 0;
  return spring({ frame: frame - start, fps: 30, config: { damping, stiffness, mass } });
}

function fadeIn(frame: number, start: number, dur = 18): number {
  return interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

function typewriter(text: string, frame: number, startFrame: number, durationFrames = 50): string {
  const progress = interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return text.slice(0, Math.floor(progress * text.length));
}

// ─── Terminal line rendering ──────────────────────────────────────────────────
function getLineColor(type: string): string {
  if (type === 'comment') return TERMINAL_MUTED;
  if (type === 'cmd') return TERMINAL_KW;
  if (type === 'json') return TERMINAL_STR;
  if (type === 'kw') return TERMINAL_KW;
  return TERMINAL_TEXT;
}

// ─── JSON line colorizer ──────────────────────────────────────────────────────
function JsonLine({ text }: { text: string }) {
  // Color keys in white, string values in amber, punctuation in muted
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let idx = 0;

  // Simple: detect "key": "value" or "key": [, {, etc.
  const keyMatch = remaining.match(/^(\s*)("(?:[^"\\]|\\.)*")(\s*:\s*)(.*)/);
  if (keyMatch) {
    const [, indent, key, colon, rest] = keyMatch;
    parts.push(<span key={idx++} style={{ color: TERMINAL_MUTED }}>{indent}</span>);
    parts.push(<span key={idx++} style={{ color: 'rgba(255,255,255,0.75)' }}>{key}</span>);
    parts.push(<span key={idx++} style={{ color: TERMINAL_MUTED }}>{colon}</span>);
    // Value coloring
    if (rest.startsWith('"')) {
      parts.push(<span key={idx++} style={{ color: TERMINAL_STR }}>{rest}</span>);
    } else {
      parts.push(<span key={idx++} style={{ color: TERMINAL_TEXT }}>{rest}</span>);
    }
  } else {
    parts.push(<span key={idx++} style={{ color: TERMINAL_MUTED }}>{text}</span>);
  }

  return <>{parts}</>;
}

// ─── Terminal content block ───────────────────────────────────────────────────
function TerminalContent({
  lines,
  frame,
  contentStartFrame,
}: {
  lines: TerminalLine[];
  frame: number;
  contentStartFrame: number;
}) {
  // Each line types in sequentially. Spread them across ~70 frames total.
  const totalDuration = 70;
  const perLine = totalDuration / Math.max(lines.length, 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {lines.map((line, i) => {
        const lineStart = contentStartFrame + i * perLine;
        const lineEnd   = lineStart + perLine * 0.85;

        const typed = line.type === 'blank'
          ? ''
          : typewriter(line.text, frame, lineStart, lineEnd - lineStart);

        const color = getLineColor(line.type);

        return (
          <div
            key={i}
            style={{
              fontFamily: MONO,
              fontSize: 15,
              lineHeight: 1.7,
              minHeight: line.type === 'blank' ? 10 : undefined,
              color,
              whiteSpace: 'pre',
              letterSpacing: '-0.01em',
            }}
          >
            {line.type === 'json' ? <JsonLine text={typed} /> : typed}
            {/* blinking cursor on last visible line */}
            {typed.length > 0 && typed.length < line.text.length && (
              <span style={{ color: TERMINAL_KW, opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0 }}>█</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step row ─────────────────────────────────────────────────────────────────
function StepRow({
  step,
  index,
  frame,
  startFrame,
  isActive,
}: {
  step: StepDef;
  index: number;
  frame: number;
  startFrame: number;
  isActive: boolean;
}) {
  const progress = sp(frame, startFrame, 14, 160, 0.8);
  const translateX = interpolate(progress, [0, 1], [-140, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = interpolate(progress, [0, 0.35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        transform: `translateX(${translateX}px)`,
        opacity,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '14px 18px',
        borderRadius: 14,
        backgroundColor: isActive
          ? `${step.color}12`
          : 'rgba(255,255,255,0.025)',
        border: `1.5px solid ${isActive ? step.color + '40' : 'rgba(255,255,255,0.06)'}`,
        transition: 'background-color 0.3s',
        boxShadow: isActive ? `0 0 32px ${step.color}18` : 'none',
      }}
    >
      {/* Number badge */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: `${step.color}22`,
          border: `2px solid ${step.color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: isActive ? `0 0 14px ${step.color}55` : 'none',
        }}
      >
        <span
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: 17,
            color: step.color,
            lineHeight: 1,
          }}
        >
          {index + 1}
        </span>
      </div>

      {/* Text */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div
          style={{
            fontFamily,
            fontWeight: 700,
            fontSize: 19,
            color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
            letterSpacing: '-0.015em',
            lineHeight: 1.15,
          }}
        >
          {step.title}
        </div>
        <div
          style={{
            fontFamily,
            fontWeight: 400,
            fontSize: 13,
            color: 'rgba(255,255,255,0.38)',
            letterSpacing: '0.005em',
          }}
        >
          {step.subtitle}
        </div>
      </div>
    </div>
  );
}

// ─── Main composition ──────────────────────────────────────────────────────────
export const McpManualSetup: React.FC = () => {
  const frame = useCurrentFrame();

  // Determine active step
  const activeStep = (() => {
    for (let i = STEP_STARTS.length - 1; i >= 0; i--) {
      if (frame >= STEP_STARTS[i]) return i;
    }
    return -1;
  })();

  // ── Header animation ──────────────────────────────────────────────────────
  const headerProgress = sp(frame, 0, 12, 140, 0.7);
  const headerY = interpolate(headerProgress, [0, 1], [28, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const headerOpacity = interpolate(headerProgress, [0, 0.4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ── Terminal panel entrance ───────────────────────────────────────────────
  const terminalProgress = sp(frame, TERMINAL_ENTER, 14, 160, 0.8);
  const terminalX = interpolate(terminalProgress, [0, 1], [220, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const terminalOpacity = interpolate(terminalProgress, [0, 0.4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ── Terminal content swap: fade between steps ─────────────────────────────
  // For each step, content fades in over 12 frames, fades out before next step starts
  function terminalContentOpacity(stepIdx: number): number {
    const start = STEP_STARTS[stepIdx];
    const nextStart = stepIdx < STEP_STARTS.length - 1 ? STEP_STARTS[stepIdx + 1] : 999;
    const fadeInEnd = start + 12;
    const fadeOutStart = nextStart - 10;
    const fadeOutEnd = nextStart + 2;

    if (frame < start) return 0;
    if (frame < fadeInEnd) return interpolate(frame, [start, fadeInEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    if (frame < fadeOutStart) return 1;
    if (stepIdx === STEP_STARTS.length - 1) return 1; // last step stays
    return interpolate(frame, [fadeOutStart, fadeOutEnd], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerOpacity = fadeIn(frame, FOOTER_START, 25);

  // Terminal header row
  const terminalColor = activeStep >= 0 ? STEPS[activeStep].color : '#60A5FA';

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden' }}>

      {/* Dot-grid background */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.032) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          pointerEvents: 'none',
        }}
      />

      {/* ── Left column ──────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          left: LEFT_X,
          top: 0,
          width: RIGHT_X - LEFT_X - 40,
          height: COL_H,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 0,
          paddingTop: 20,
          paddingBottom: 20,
        }}
      >
        {/* Header text */}
        <div
          style={{
            transform: `translateY(${headerY}px)`,
            opacity: headerOpacity,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              fontFamily,
              fontWeight: 400,
              fontSize: 22,
              color: 'rgba(255,255,255,0.38)',
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
              marginBottom: 8,
            }}
          >
            You still have to
          </div>
          <div
            style={{
              fontFamily,
              fontWeight: 800,
              fontSize: 34,
              color: '#ffffff',
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
            }}
          >
            do the wiring
            <br />
            yourself.
          </div>
        </div>

        {/* Step rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {STEPS.map((step, i) => {
            const visible = frame >= STEP_STARTS[i];
            if (!visible) return null;
            return (
              <StepRow
                key={i}
                step={step}
                index={i}
                frame={frame}
                startFrame={STEP_STARTS[i]}
                isActive={activeStep === i}
              />
            );
          })}
        </div>

        {/* Footer caption */}
        {frame >= FOOTER_START && (
          <div
            style={{
              opacity: footerOpacity,
              marginTop: 36,
              fontFamily,
              fontWeight: 400,
              fontSize: 18,
              color: 'rgba(255,255,255,0.28)',
              letterSpacing: '0.01em',
              lineHeight: 1.5,
            }}
          >
            If you know what you're doing... a couple of minutes.
          </div>
        )}
      </div>

      {/* ── Right column: terminal panel ─────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          left: RIGHT_X,
          top: 60,
          width: RIGHT_W,
          height: COL_H - 120,
          transform: `translateX(${terminalX}px)`,
          opacity: terminalOpacity,
          backgroundColor: TERMINAL_BG,
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow:
            '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Terminal title bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            backgroundColor: 'rgba(255,255,255,0.025)',
            flexShrink: 0,
          }}
        >
          {/* Traffic lights */}
          <div style={{ width: 13, height: 13, borderRadius: '50%', backgroundColor: '#FF5F57' }} />
          <div style={{ width: 13, height: 13, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
          <div style={{ width: 13, height: 13, borderRadius: '50%', backgroundColor: '#28CA41' }} />
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 14,
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.04em',
              }}
            >
              {activeStep >= 0 ? STEPS[activeStep].title : 'Terminal'}
            </span>
          </div>
          {/* Active step color indicator */}
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: terminalColor,
              boxShadow: `0 0 8px ${terminalColor}`,
            }}
          />
        </div>

        {/* Terminal content area */}
        <div
          style={{
            flex: 1,
            padding: '24px 28px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {STEPS.map((step, i) => {
            const stepStart = STEP_STARTS[i];
            if (frame < stepStart) return null;

            const contentOpacity = terminalContentOpacity(i);
            if (contentOpacity <= 0) return null;

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: 24,
                  left: 28,
                  right: 28,
                  opacity: contentOpacity,
                }}
              >
                {/* Prompt line label */}
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 13,
                    color: `${step.color}88`,
                    marginBottom: 16,
                    letterSpacing: '0.08em',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  Step {i + 1}
                </div>
                <TerminalContent
                  lines={step.terminal}
                  frame={frame}
                  contentStartFrame={stepStart + 8}
                />
              </div>
            );
          })}

          {/* Pre-step placeholder */}
          {activeStep < 0 && (
            <div
              style={{
                fontFamily: MONO,
                fontSize: 22,
                color: TERMINAL_MUTED,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                height: '100%',
              }}
            >
              <span style={{ color: TERMINAL_KW, opacity: Math.floor(frame / 10) % 2 === 0 ? 1 : 0.3 }}>█</span>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
