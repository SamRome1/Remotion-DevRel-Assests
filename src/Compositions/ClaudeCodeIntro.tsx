import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  Sequence,
} from 'remotion';
import { circularFamily } from '../fonts';

// ── Claude Code brand palette ──────────────────────────────────────────────────
const ORANGE     = '#D97757';
const ORANGE_BRT = '#f0956a';
const BG         = '#0b0805';

// ── Helpers ────────────────────────────────────────────────────────────────────
const C = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const itp = (f: number, a: number, b: number, x: number, y: number) =>
  interpolate(f, [a, b], [x, y], C);
const snap = (f: number, d = 0) =>
  spring({ frame: f - d, fps: 30, config: { damping: 11, stiffness: 420, mass: 0.45 } });
const soft = (f: number, d = 0) =>
  spring({ frame: f - d, fps: 30, config: { damping: 16, stiffness: 200, mass: 0.8 } });

// ── Shared background wrapper ──────────────────────────────────────────────────
const SceneWrap: React.FC<{ children: React.ReactNode; tint?: number }> = ({
  children,
  tint = 0,
}) => (
  <AbsoluteFill style={{ background: BG, fontFamily: circularFamily, overflow: 'hidden' }}>
    {/* Dot grid */}
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: 'radial-gradient(circle, rgba(217,119,87,0.045) 1px, transparent 1px)',
      backgroundSize: '44px 44px',
      pointerEvents: 'none',
    }} />
    {/* Optional orange tint overlay */}
    {tint > 0 && (
      <div style={{
        position: 'absolute', inset: 0,
        background: `rgba(217,119,87,${tint})`,
        pointerEvents: 'none',
      }} />
    )}
    {children}
  </AbsoluteFill>
);

// ── Cut flash at scene start ───────────────────────────────────────────────────
const CutFlash: React.FC<{ f: number; color?: string }> = ({ f, color = ORANGE }) => (
  <div style={{
    position: 'absolute', inset: 0, zIndex: 999,
    background: color,
    opacity: itp(f, 0, 6, 0.9, 0),
    pointerEvents: 'none',
  }} />
);

// ── Radial glow blob ───────────────────────────────────────────────────────────
const GlowBlob: React.FC<{ top: number; opacity: number; size?: number }> = ({
  top,
  opacity,
  size = 900,
}) => (
  <div style={{
    position: 'absolute', top, left: 540,
    transform: 'translate(-50%, -50%)',
    width: size, height: size * 0.75, borderRadius: '50%',
    background: `radial-gradient(ellipse, rgba(217,119,87,${opacity}) 0%, transparent 65%)`,
    filter: 'blur(70px)',
    pointerEvents: 'none',
  }} />
);

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 1 — CLAUDE slam (0 → 38 frames)
// Large "CLAUDE" text hammers down from top with spring bounce
// ══════════════════════════════════════════════════════════════════════════════
const S1Claude: React.FC = () => {
  const f  = useCurrentFrame();
  const enterY = itp(f, 0, 16, -400, 0);
  const bounce  = snap(f);
  const glow    = itp(f, 5, 28, 0, 1);
  const codeIn  = itp(f, 22, 34, 0, 1);
  const pulse   = 1 + Math.sin(f * 0.45) * 0.007;

  return (
    <SceneWrap>
      <CutFlash f={f} />
      <GlowBlob top={800} opacity={0.35 * glow} />

      {/* CLAUDE */}
      <div style={{
        position: 'absolute', top: 640, left: '50%',
        transform: `translateX(-50%) translateY(${enterY}px) scale(${(0.5 + bounce * 0.5) * pulse})`,
        fontSize: 230, fontWeight: 800, color: '#fff',
        letterSpacing: -7, lineHeight: 1,
        textAlign: 'center', whiteSpace: 'nowrap',
        textShadow: `0 0 ${55 * glow}px rgba(217,119,87,0.85), 0 0 ${110 * glow}px rgba(217,119,87,0.4)`,
      }}>
        CLAUDE
      </div>

      {/* CODE pill */}
      <div style={{
        position: 'absolute', top: 900, left: '50%',
        transform: 'translateX(-50%)',
        opacity: codeIn,
        background: 'rgba(217,119,87,0.12)',
        border: `2px solid rgba(217,119,87,0.6)`,
        borderRadius: 10, padding: '8px 32px',
        fontSize: 64, fontWeight: 700, color: ORANGE,
        letterSpacing: 18,
        textShadow: `0 0 28px ${ORANGE}`,
      }}>
        CODE
      </div>

      {/* Horizontal speed lines */}
      {[-1, 1].map((dir, i) => (
        <div key={i} style={{
          position: 'absolute', top: 795,
          left: dir === -1 ? 0 : 540,
          width: itp(f, 2, 22, 0, 540),
          height: 2,
          background: `linear-gradient(${dir === -1 ? 270 : 90}deg, transparent, rgba(217,119,87,${0.35 * glow}))`,
          opacity: itp(f, 15, 30, 1, 0),
        }} />
      ))}
    </SceneWrap>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 2 — CODE punch (38 → 73 frames)
// "CODE" explodes in from scale-0 with orange underline sweep
// ══════════════════════════════════════════════════════════════════════════════
const S2CodePunch: React.FC = () => {
  const f = useCurrentFrame();
  const scale  = snap(f);
  const glow   = itp(f, 0, 22, 0, 1);
  const lineW  = itp(f, 4, 24, 0, 900);
  const subIn  = itp(f, 20, 32, 0, 1);

  return (
    <SceneWrap>
      <CutFlash f={f} color="#ffffff" />
      <GlowBlob top={870} opacity={0.3 * glow} size={1000} />

      {/* Underline sweep */}
      <div style={{
        position: 'absolute', top: 1050, left: 90,
        width: lineW, height: 4,
        background: ORANGE,
        boxShadow: `0 0 18px ${ORANGE}, 0 0 40px rgba(217,119,87,0.5)`,
      }} />

      {/* CODE */}
      <div style={{
        position: 'absolute', top: 700, left: '50%',
        transform: `translateX(-50%) scale(${0.2 + scale * 0.8})`,
        fontSize: 270, fontWeight: 800, color: ORANGE,
        letterSpacing: -5, lineHeight: 1,
        textAlign: 'center', whiteSpace: 'nowrap',
        textShadow: `0 0 ${70 * glow}px rgba(217,119,87,0.7)`,
      }}>
        CODE
      </div>

      {/* Tagline */}
      <div style={{
        position: 'absolute', top: 1090, left: '50%',
        transform: 'translateX(-50%)',
        opacity: subIn, whiteSpace: 'nowrap',
        fontSize: 36, fontWeight: 500,
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 3, textAlign: 'center',
      }}>
        AI CODING AGENT FOR YOUR TERMINAL
      </div>
    </SceneWrap>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 3 — Terminal (73 → 113 frames)
// Terminal window slides up, "claude" types fast, banner appears
// ══════════════════════════════════════════════════════════════════════════════
const S3Terminal: React.FC = () => {
  const f = useCurrentFrame();
  const winY  = itp(f, 0, 18, 240, 0);
  const winOp = itp(f, 0, 12, 0, 1);

  const COMMAND = 'claude';
  const typed = COMMAND.slice(0, Math.floor(itp(f, 10, 22, 0, COMMAND.length + 0.99)));
  const showCursor = f < 26;

  const bannerLines = [
    '╭──────────────────────────────────────╮',
    '│  ✻ Claude Code                       │',
    '│  /help for help, /status for plan    │',
    '╰──────────────────────────────────────╯',
    '',
    '  cwd: ~/my-app',
  ];
  const bannerVisible = Math.floor(itp(f, 22, 38, 0, bannerLines.length + 0.99));

  return (
    <SceneWrap>
      <CutFlash f={f} />

      <div style={{
        position: 'absolute', top: 340, left: 48, right: 48,
        transform: `translateY(${winY}px)`,
        opacity: winOp,
        background: '#180f0c',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: [
          '0 60px 120px rgba(0,0,0,0.85)',
          '0 0 0 1.5px rgba(217,119,87,0.35)',
          '0 0 60px rgba(217,119,87,0.08)',
        ].join(', '),
      }}>
        {/* Title bar */}
        <div style={{
          height: 52, background: '#201510',
          borderBottom: '1px solid #2e1f16',
          display: 'flex', alignItems: 'center', padding: '0 22px', gap: 10,
        }}>
          {['#ff5f57', '#febc2e', '#28c840'].map(c => (
            <div key={c} style={{ width: 14, height: 14, borderRadius: '50%', background: c }} />
          ))}
          <div style={{
            flex: 1, textAlign: 'center',
            fontFamily: 'Menlo, monospace', fontSize: 14,
            color: '#5a4030', letterSpacing: 0.3,
          }}>
            claude — zsh — 160×40
          </div>
          <div style={{ width: 52 }} />
        </div>

        {/* Body */}
        <div style={{
          padding: '28px 34px 36px',
          fontFamily: 'Menlo, Monaco, monospace',
          fontSize: 28, lineHeight: 1.65,
        }}>
          <div style={{ color: '#7a5a46', marginBottom: 8 }}>~/my-app</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#4e3426' }}>$</span>
            <span style={{ color: '#e8ddd8' }}>{typed}</span>
            {showCursor && (
              <div style={{
                width: 13, height: 28,
                background: Math.floor(f / 10) % 2 === 0 ? ORANGE : 'transparent',
                borderRadius: 2, flexShrink: 0,
              }} />
            )}
          </div>

          {bannerLines.slice(0, bannerVisible).map((line, i) => (
            <div key={i} style={{
              color: line.includes('Claude Code') ? ORANGE_BRT : ORANGE,
              fontSize: 22, whiteSpace: 'pre',
              marginTop: i === 0 ? 16 : 0,
              textShadow: line.includes('─') || line.includes('│') || line.includes('╭') || line.includes('╰')
                ? `0 0 10px rgba(217,119,87,0.4)` : 'none',
              opacity: line === '' ? 1 : itp(f, 22 + i * 2.5, 28 + i * 2.5, 0, 1),
            }}>
              {line}
            </div>
          ))}
        </div>

        {/* Bottom glow bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, transparent, rgba(217,119,87,0.5), rgba(240,149,106,0.8), rgba(217,119,87,0.5), transparent)`,
        }} />
      </div>
    </SceneWrap>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 4 — "Build complete apps" (113 → 148 frames)
// Scale-punch entrance, massive centered text
// ══════════════════════════════════════════════════════════════════════════════
const S4Build: React.FC = () => {
  const f = useCurrentFrame();
  const scale = 0.55 + snap(f) * 0.45;
  const op    = itp(f, 0, 8, 0, 1);

  return (
    <SceneWrap>
      <CutFlash f={f} color="#ffffff" />
      <GlowBlob top={940} opacity={itp(f, 5, 25, 0, 0.18)} />

      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity: op, textAlign: 'center',
      }}>
        <div style={{
          fontSize: 46, fontWeight: 700, color: ORANGE,
          letterSpacing: 7, marginBottom: 18,
        }}>
          BUILD
        </div>
        <div style={{
          fontSize: 140, fontWeight: 800, color: 'white',
          lineHeight: 1, letterSpacing: -5,
        }}>
          Complete
        </div>
        <div style={{
          fontSize: 140, fontWeight: 800, color: 'white',
          lineHeight: 1, letterSpacing: -5,
        }}>
          Apps
        </div>
      </div>
    </SceneWrap>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 5 — "Fix entire codebases" (148 → 183 frames)
// Slides in hard from the left
// ══════════════════════════════════════════════════════════════════════════════
const S5Fix: React.FC = () => {
  const f = useCurrentFrame();
  const textX = itp(f, 0, 16, -560, 0);
  const op    = itp(f, 0, 10, 0, 1);

  return (
    <SceneWrap>
      <CutFlash f={f} />
      <GlowBlob top={960} opacity={itp(f, 5, 25, 0, 0.2)} />

      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: `translate(-50%, -50%) translateX(${textX}px)`,
        opacity: op, textAlign: 'center',
      }}>
        <div style={{
          fontSize: 46, fontWeight: 700,
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: 7, marginBottom: 18,
        }}>
          FIX
        </div>
        <div style={{
          fontSize: 130, fontWeight: 800, color: 'white',
          lineHeight: 1, letterSpacing: -5,
        }}>
          Entire
        </div>
        <div style={{
          fontSize: 130, fontWeight: 800, color: ORANGE,
          lineHeight: 1.05, letterSpacing: -5,
          textShadow: `0 0 40px rgba(217,119,87,0.4)`,
        }}>
          Codebases
        </div>
      </div>
    </SceneWrap>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 6 — "Runs autonomously" (183 → 218 frames)
// Drops from above with glow pulse
// ══════════════════════════════════════════════════════════════════════════════
const S6Auto: React.FC = () => {
  const f = useCurrentFrame();
  const scale  = 0.6 + soft(f) * 0.4;
  const op     = itp(f, 0, 10, 0, 1);
  const pulse  = 0.55 + Math.sin(f * 0.28) * 0.25;

  return (
    <SceneWrap>
      <CutFlash f={f} color="#ffffff" />
      <GlowBlob top={960} opacity={0.32 * pulse} />

      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity: op, textAlign: 'center',
      }}>
        <div style={{
          fontSize: 46, fontWeight: 700, color: ORANGE,
          letterSpacing: 7, marginBottom: 18,
        }}>
          RUNS
        </div>
        <div style={{
          fontSize: 140, fontWeight: 800, color: 'white',
          lineHeight: 1, letterSpacing: -5,
        }}>
          Autono-
        </div>
        <div style={{
          fontSize: 140, fontWeight: 800, color: 'white',
          lineHeight: 1, letterSpacing: -5,
        }}>
          mously
        </div>
      </div>
    </SceneWrap>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 7 — CTA (218 → 290 frames)
// Logo reveal, URL, pulsing "Try for free" button
// ══════════════════════════════════════════════════════════════════════════════
const S7CTA: React.FC = () => {
  const f = useCurrentFrame();
  const logoIn  = soft(f);
  const textIn  = itp(f, 18, 34, 0, 1);
  const ctaIn   = itp(f, 30, 46, 0, 1);
  const pulse   = 0.5 + Math.sin(f * 0.18) * 0.3;
  const starRot = f * 1.8;

  return (
    <SceneWrap>
      <CutFlash f={f} />

      {/* Big radial glow */}
      <div style={{
        position: 'absolute', top: 880, left: 540,
        transform: 'translate(-50%, -50%)',
        width: 1000, height: 1000, borderRadius: '50%',
        background: `radial-gradient(ellipse, rgba(217,119,87,${pulse * 0.42}) 0%, transparent 60%)`,
        filter: 'blur(80px)',
      }} />

      {/* Spinning ✻ */}
      <div style={{
        position: 'absolute', top: 520, left: '50%',
        transform: `translateX(-50%) translateY(${itp(f, 0, 20, 100, 0)}px) scale(${0.3 + logoIn * 0.7}) rotate(${starRot}deg)`,
        fontSize: 120, color: ORANGE,
        textShadow: `0 0 50px rgba(217,119,87,0.85), 0 0 20px rgba(217,119,87,0.5)`,
        opacity: itp(f, 0, 12, 0, 1),
        lineHeight: 1,
      }}>
        ✻
      </div>

      {/* Claude Code wordmark */}
      <div style={{
        position: 'absolute', top: 700, left: '50%',
        transform: `translateX(-50%) scale(${0.45 + logoIn * 0.55})`,
        textAlign: 'center',
        opacity: itp(f, 0, 14, 0, 1),
      }}>
        <div style={{
          fontSize: 110, fontWeight: 800, color: 'white',
          letterSpacing: -4, lineHeight: 1,
        }}>
          Claude
        </div>
        <div style={{
          fontSize: 110, fontWeight: 800, color: ORANGE,
          letterSpacing: -4, lineHeight: 1.05,
          textShadow: `0 0 45px rgba(217,119,87,0.55)`,
        }}>
          Code
        </div>
      </div>

      {/* URL */}
      <div style={{
        position: 'absolute', top: 1060, left: '50%',
        transform: 'translateX(-50%)',
        opacity: textIn, textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'Menlo, Monaco, monospace',
          fontSize: 34, color: 'rgba(255,255,255,0.4)',
          letterSpacing: 0.5, marginBottom: 32,
        }}>
          claude.ai/code
        </div>

        {/* CTA button */}
        <div style={{
          display: 'inline-block',
          opacity: ctaIn,
          fontSize: 38, fontWeight: 700, color: ORANGE_BRT,
          padding: '18px 68px',
          border: `2px solid ${ORANGE}`,
          borderRadius: 100,
          boxShadow: [
            `0 0 ${28 * pulse}px rgba(217,119,87,${0.38 * pulse})`,
            `inset 0 0 ${18 * pulse}px rgba(217,119,87,0.06)`,
          ].join(', '),
          letterSpacing: 0.5, whiteSpace: 'nowrap',
        }}>
          Try for free →
        </div>
      </div>
    </SceneWrap>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ROOT COMPOSITION
// 290 frames @ 30fps = 9.67 seconds  |  1080 × 1920 (9:16 vertical)
// ══════════════════════════════════════════════════════════════════════════════
export const ClaudeCodeIntro: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0}   durationInFrames={38}><S1Claude /></Sequence>
    <Sequence from={38}  durationInFrames={35}><S2CodePunch /></Sequence>
    <Sequence from={73}  durationInFrames={40}><S3Terminal /></Sequence>
    <Sequence from={113} durationInFrames={35}><S4Build /></Sequence>
    <Sequence from={148} durationInFrames={35}><S5Fix /></Sequence>
    <Sequence from={183} durationInFrames={35}><S6Auto /></Sequence>
    <Sequence from={218} durationInFrames={72}><S7CTA /></Sequence>
  </AbsoluteFill>
);
