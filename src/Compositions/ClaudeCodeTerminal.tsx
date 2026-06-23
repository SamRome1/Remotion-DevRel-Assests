import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';

// ---------------------------------------------------------------------------
// Timing constants (frames @ 30 fps)
// ---------------------------------------------------------------------------
const WINDOW_ENTER_START = 0;
const WINDOW_ENTER_END = 25;

const PROMPT_APPEAR = 30;
const COMMAND_TYPE_START = 38;
const COMMAND = 'claude';
const COMMAND_TYPE_DURATION = 14;

const ENTER_HIT = COMMAND_TYPE_START + COMMAND_TYPE_DURATION + 6; // 58

const BANNER_START = ENTER_HIT + 8;  // 66
const BANNER_DURATION = 22;

const USER_PROMPT_START = BANNER_START + BANNER_DURATION + 12; // 100
const USER_MESSAGE = 'Build me a landing page';
const USER_TYPE_DURATION = 26;

const CLAUDE_RESPONSE_START = USER_PROMPT_START + USER_TYPE_DURATION + 10; // 136
const RESPONSE_LINES = [
  { text: "I'll create a landing page for you. Let me set that up...", color: '#e2c9b8' },
  { text: '', color: '' },
  { text: 'Creating index.html...', color: '#d4956a', icon: true },
  { text: 'Writing styles.css...', color: '#d4956a', icon: true },
  { text: 'Adding hero section...', color: '#d4956a', icon: true },
  { text: 'Building navigation...', color: '#d4956a', icon: true },
  { text: 'Optimising for mobile...', color: '#d4956a', icon: true },
  { text: '', color: '' },
  { text: 'Done! Landing page ready.', color: '#e8a87c', bold: true },
];
const FRAMES_PER_RESPONSE_LINE = 9;

const GLOW_START = CLAUDE_RESPONSE_START + RESPONSE_LINES.length * FRAMES_PER_RESPONSE_LINE + 6;
const TOTAL_FRAMES = 360;

// Claude Code orange — matches Anthropic's brand orange
const ORANGE = '#D97757';
const ORANGE_DIM = '#a85c3a';
const ORANGE_BRIGHT = '#f0956a';

// ---------------------------------------------------------------------------
// Real Claude Code startup banner (orange box-drawing style)
// ---------------------------------------------------------------------------
const BANNER_LINES = [
  `╭──────────────────────────────────────────────╮`,
  `│                                              │`,
  `│   ✻ Claude Code                              │`,
  `│                                              │`,
  `│     /help for help, /status for your plan    │`,
  `│                                              │`,
  `╰──────────────────────────────────────────────╯`,
  ``,
  ` cwd: ~/projects/my-landing-page`,
];

// ---------------------------------------------------------------------------
// Helper: typed substring at a given frame
// ---------------------------------------------------------------------------
function typedText(full: string, startFrame: number, durationFrames: number, frame: number): string {
  const progress = interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return full.slice(0, Math.floor(progress * full.length));
}

// ---------------------------------------------------------------------------
// Blinking cursor
// ---------------------------------------------------------------------------
function BlinkingCursor({ frame, visibleFrom, color = ORANGE }: { frame: number; visibleFrom: number; color?: string }) {
  if (frame < visibleFrom) return null;
  const blink = Math.floor((frame - visibleFrom) / 15) % 2 === 0;
  return (
    <span
      style={{
        display: 'inline-block',
        width: 14,
        height: 28,
        backgroundColor: blink ? color : 'transparent',
        verticalAlign: 'middle',
        marginLeft: 2,
        borderRadius: 2,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Main composition
// ---------------------------------------------------------------------------
export const ClaudeCodeTerminal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Window spring entrance ---
  const windowScale = spring({
    frame: frame - WINDOW_ENTER_START,
    fps,
    config: { damping: 14, stiffness: 160, mass: 0.9 },
    from: 0.55,
    to: 1,
    durationInFrames: 35,
  });

  const windowY = interpolate(
    frame,
    [WINDOW_ENTER_START, WINDOW_ENTER_END],
    [60, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const windowOpacity = interpolate(
    frame,
    [WINDOW_ENTER_START, WINDOW_ENTER_START + 8],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // --- Prompt ---
  const promptOpacity = interpolate(frame, [PROMPT_APPEAR, PROMPT_APPEAR + 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // --- Typed command ---
  const typedCommand = typedText(COMMAND, COMMAND_TYPE_START, COMMAND_TYPE_DURATION, frame);
  const showCommandCursor = frame >= COMMAND_TYPE_START && frame < ENTER_HIT;
  const commandDone = frame >= ENTER_HIT;

  // --- Banner ---
  const bannerProgress = interpolate(frame, [BANNER_START, BANNER_START + BANNER_DURATION], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bannerLinesVisible = Math.floor(bannerProgress * BANNER_LINES.length);

  // --- User prompt typing ---
  const typedUserMsg = typedText(USER_MESSAGE, USER_PROMPT_START, USER_TYPE_DURATION, frame);
  const showUserCursor = frame >= USER_PROMPT_START && frame < CLAUDE_RESPONSE_START - 4;

  // --- Response lines ---
  const responseLineVisible = (lineIndex: number) => {
    return frame >= CLAUDE_RESPONSE_START + lineIndex * FRAMES_PER_RESPONSE_LINE;
  };

  // --- Glow effect ---
  const glowIntensity = interpolate(
    frame,
    [GLOW_START, GLOW_START + 30, GLOW_START + 60, TOTAL_FRAMES],
    [0, 1, 0.6, 0.8],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const glowPulse = Math.sin(((frame - GLOW_START) / 25) * Math.PI * 2) * 0.3 + 0.7;
  const effectiveGlow = glowIntensity * glowPulse;

  const showFinalCursor =
    frame >= CLAUDE_RESPONSE_START + (RESPONSE_LINES.length - 1) * FRAMES_PER_RESPONSE_LINE + 12;

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(ellipse at 40% 40%, #1a0e08 0%, #0d0804 60%, #000000 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Ambient orange glow behind terminal */}
      <div
        style={{
          position: 'absolute',
          width: 1600,
          height: 900,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(217, 119, 87, ${0.09 * effectiveGlow}) 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(60px)',
        }}
      />

      {/* Terminal window */}
      <div
        style={{
          transform: `scale(${windowScale}) translateY(${windowY}px)`,
          opacity: windowOpacity,
          width: 1760,
          height: 970,
          backgroundColor: '#1a1412',
          borderRadius: 16,
          boxShadow: [
            '0 60px 120px rgba(0,0,0,0.85)',
            `0 0 0 1px rgba(217, 119, 87, ${0.2 + 0.4 * effectiveGlow})`,
            `0 0 80px rgba(217, 119, 87, ${0.1 * effectiveGlow})`,
          ].join(', '),
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 10,
          position: 'relative',
        }}
      >
        {/* Title bar */}
        <div
          style={{
            height: 52,
            backgroundColor: '#211a16',
            borderBottom: '1px solid #2e2218',
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            flexShrink: 0,
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#ff5f57', boxShadow: '0 0 6px rgba(255,95,87,0.6)' }} />
            <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#febc2e', boxShadow: '0 0 6px rgba(254,188,46,0.6)' }} />
            <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#28c840', boxShadow: '0 0 6px rgba(40,200,64,0.6)' }} />
          </div>

          {/* Title */}
          <div
            style={{
              flex: 1,
              textAlign: 'center',
              color: '#6e5c4e',
              fontSize: 15,
              fontFamily: 'Menlo, Monaco, "Courier New", monospace',
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            claude — zsh — 220×54
          </div>

          <div style={{ width: 56 }} />
        </div>

        {/* Terminal body */}
        <div
          style={{
            flex: 1,
            padding: '32px 40px 28px',
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            fontSize: 22,
            lineHeight: '1.65',
            color: '#d4c5ba',
            overflowY: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}
        >
          {/* Shell prompt line */}
          <div style={{ opacity: promptOpacity, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
            <span style={{ color: ORANGE_DIM }}>~/projects</span>
            <span style={{ color: '#5a4a3e' }}>$</span>
            <span style={{ color: '#e8ddd8' }}>{typedCommand}</span>
            {showCommandCursor && !commandDone && (
              <BlinkingCursor frame={frame} visibleFrom={COMMAND_TYPE_START} color={ORANGE} />
            )}
          </div>

          {/* Claude Code startup banner */}
          {frame >= BANNER_START && (
            <div style={{ marginTop: 16, marginBottom: 4 }}>
              {BANNER_LINES.slice(0, bannerLinesVisible).map((line, i) => {
                const isBox = i < 7;   // box-drawing lines
                const isMeta = i >= 8; // cwd / info lines
                const isTitle = line.includes('Claude Code');
                return (
                  <div
                    key={i}
                    style={{
                      whiteSpace: 'pre',
                      color: isTitle
                        ? ORANGE_BRIGHT
                        : isBox
                        ? ORANGE
                        : '#8a7060',
                      fontSize: isBox ? 22 : 20,
                      lineHeight: '1.5',
                      fontWeight: isTitle ? '600' : 'normal',
                      textShadow: isBox
                        ? `0 0 18px rgba(217, 119, 87, 0.45)`
                        : 'none',
                    }}
                  >
                    {line}
                  </div>
                );
              })}
            </div>
          )}

          {/* User message prompt — matches Claude Code's ">" prompt */}
          {frame >= USER_PROMPT_START && (
            <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: ORANGE, fontWeight: 'bold', fontSize: 24 }}>{'>'}</span>
              <span style={{ color: '#e8ddd8' }}>{typedUserMsg}</span>
              {showUserCursor && (
                <BlinkingCursor frame={frame} visibleFrom={USER_PROMPT_START} color={ORANGE} />
              )}
            </div>
          )}

          {/* Claude response */}
          {frame >= CLAUDE_RESPONSE_START && (
            <div style={{ marginTop: 16 }}>
              {/* "Claude" label — orange, matching actual Claude Code */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span
                  style={{
                    color: ORANGE_BRIGHT,
                    fontWeight: 'bold',
                    fontSize: 22,
                    background: `rgba(217, 119, 87, 0.12)`,
                    padding: '2px 12px',
                    borderRadius: 6,
                    border: `1px solid rgba(217, 119, 87, 0.25)`,
                    flexShrink: 0,
                    textShadow: `0 0 12px rgba(217, 119, 87, 0.4)`,
                  }}
                >
                  Claude
                </span>
              </div>

              {RESPONSE_LINES.map((line, i) => {
                if (!responseLineVisible(i)) return null;
                if (line.text === '') return <div key={i} style={{ height: 10 }} />;

                const lineOpacity = interpolate(
                  frame,
                  [
                    CLAUDE_RESPONSE_START + i * FRAMES_PER_RESPONSE_LINE,
                    CLAUDE_RESPONSE_START + i * FRAMES_PER_RESPONSE_LINE + 6,
                  ],
                  [0, 1],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );

                const lineX = interpolate(
                  frame,
                  [
                    CLAUDE_RESPONSE_START + i * FRAMES_PER_RESPONSE_LINE,
                    CLAUDE_RESPONSE_START + i * FRAMES_PER_RESPONSE_LINE + 8,
                  ],
                  [-20, 0],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );

                return (
                  <div
                    key={i}
                    style={{
                      opacity: lineOpacity,
                      transform: `translateX(${lineX}px)`,
                      color: line.color,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 2,
                    }}
                  >
                    {line.icon && (
                      <span style={{ color: ORANGE, fontSize: 18, flexShrink: 0 }}>+</span>
                    )}
                    <span style={{ fontWeight: (line as any).bold ? 'bold' : 'normal' }}>
                      {line.text}
                    </span>
                  </div>
                );
              })}

              {/* Final shell prompt */}
              {showFinalCursor && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: ORANGE, fontWeight: 'bold', fontSize: 24 }}>{'>'}</span>
                  <BlinkingCursor frame={frame} visibleFrom={GLOW_START} color={ORANGE} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom glow bar — orange */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, transparent, rgba(217,119,87,${0.6 * effectiveGlow}), rgba(240,149,106,${0.9 * effectiveGlow}), rgba(217,119,87,${0.6 * effectiveGlow}), transparent)`,
            borderRadius: '0 0 16px 16px',
          }}
        />
      </div>

      {/* Corner glow dots */}
      {effectiveGlow > 0.1 && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: `rgba(217,119,87,${0.5 * effectiveGlow})`,
              boxShadow: `0 0 20px rgba(217,119,87,${effectiveGlow})`,
              zIndex: 30,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: `rgba(240,149,106,${0.5 * effectiveGlow})`,
              boxShadow: `0 0 20px rgba(240,149,106,${effectiveGlow})`,
              zIndex: 30,
            }}
          />
        </>
      )}
    </AbsoluteFill>
  );
};
