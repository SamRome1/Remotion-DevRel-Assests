import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { BG, MONO } from '../tokens';
import { circularFamily } from '../fonts';
import { Lock } from 'lucide-react';

const clamp = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const itp = (f: number, s: number, e: number, from = 0, to = 1) =>
  interpolate(f, [s, e], [from, to], clamp);

const TRAFFIC_LIGHTS = ['#FF5F57', '#FEBC2E', '#28C840'] as const;

const CMD = 'build my app';

export const VibeCoding: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const svgTop = height * 0.62;

  const sceneOpacity = itp(frame, 0, 20);

  const terminalProgress = spring({
    frame: frame - 18,
    fps,
    config: { damping: 22, stiffness: 140 },
  });
  const terminalY = interpolate(terminalProgress, [0, 1], [-100, 0]);
  const terminalOpacity = itp(frame, 18, 50);

  const charCount = Math.floor(itp(frame, 45, 95, 0, CMD.length));
  const cursorVisible = Math.floor(frame / 12) % 2 === 0;

  const dotsOpacity = itp(frame, 90, 100);

  const terminalExitOpacity = itp(frame, 110, 122, 1, 0);

  const browserProgress = spring({
    frame: frame - 112,
    fps,
    config: { damping: 20, stiffness: 130 },
  });
  const browserY = interpolate(browserProgress, [0, 1], [80, 0]);
  const browserOpacity = itp(frame, 112, 130);

  const windowWidth = Math.min(860, width - 80);
  const windowLeft = (width - windowWidth) / 2;

  const fakeBlocks = [
    { delay: 128, h: 36, w: '100%' },
    { delay: 134, h: 56, w: '85%' },
    { delay: 140, h: 40, w: '60%' },
    { delay: 146, h: 44, w: '40%', green: true },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        overflow: 'hidden',
        fontFamily: circularFamily,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: svgTop - 350,
          left: width / 2 - 350,
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(62,207,142,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <svg
        width={width}
        height={600}
        viewBox={`0 0 ${width} 600`}
        style={{
          position: 'absolute',
          top: svgTop,
          left: 0,
          opacity: sceneOpacity,
          overflow: 'visible',
        }}
      >
        <line x1={280} y1={480} x2={800} y2={480} stroke="rgba(255,255,255,0.25)" strokeWidth={4} />

        <rect x={430} y={280} width={220} height={160} rx={10} fill="#1a1a1a" stroke="rgba(255,255,255,0.2)" strokeWidth={3} />
        <rect x={445} y={295} width={190} height={130} rx={6} fill="#0a0a0a" />

        <line x1={540} y1={440} x2={540} y2={480} stroke="rgba(255,255,255,0.2)" strokeWidth={6} />
        <line x1={510} y1={480} x2={570} y2={480} stroke="rgba(255,255,255,0.2)" strokeWidth={6} />

        <rect x={460} y={470} width={160} height={24} rx={4} fill="#1f1f1f" stroke="rgba(255,255,255,0.15)" strokeWidth={2} />

        <circle cx={540} cy={220} r={36} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={4} />
        <line x1={540} y1={256} x2={540} y2={370} stroke="rgba(255,255,255,0.85)" strokeWidth={4} />
        <line x1={540} y1={300} x2={480} y2={420} stroke="rgba(255,255,255,0.85)" strokeWidth={3} />
        <line x1={540} y1={300} x2={600} y2={420} stroke="rgba(255,255,255,0.85)" strokeWidth={3} />
        <line x1={540} y1={370} x2={490} y2={480} stroke="rgba(255,255,255,0.85)" strokeWidth={3} />
        <line x1={540} y1={370} x2={590} y2={480} stroke="rgba(255,255,255,0.85)" strokeWidth={3} />
      </svg>

      <div
        style={{
          position: 'absolute',
          top: height * 0.22,
          left: windowLeft,
          width: windowWidth,
          opacity: Math.min(terminalOpacity, terminalExitOpacity),
          transform: `translateY(${terminalY}px)`,
          background: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: 44,
            background: '#2a2a2a',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: 8,
          }}
        >
          {TRAFFIC_LIGHTS.map((c) => (
            <div
              key={c}
              style={{ width: 14, height: 14, borderRadius: '50%', background: c, flexShrink: 0 }}
            />
          ))}
        </div>

        <div
          style={{
            padding: '20px 24px',
            minHeight: 160,
            fontFamily: MONO,
            fontSize: 26,
            color: 'rgba(62,207,142,0.9)',
            background: '#111',
          }}
        >
          <div>
            {'$ '}
            {CMD.slice(0, charCount)}
            {frame >= 45 && frame < 110 && cursorVisible && '█'}
          </div>

          {frame >= 90 && (
            <div
              style={{
                marginTop: 20,
                display: 'flex',
                gap: 16,
                opacity: dotsOpacity,
                fontSize: 32,
              }}
            >
              {[0, 0.6, 1.2].map((phase, i) => (
                <span
                  key={i}
                  style={{
                    opacity: 0.4 + 0.6 * ((Math.sin((frame / 30) * Math.PI * 2 + phase) + 1) / 2),
                  }}
                >
                  ●
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: height * 0.20,
          left: windowLeft,
          width: windowWidth,
          opacity: browserOpacity,
          transform: `translateY(${browserY}px)`,
          background: '#1e1e1e',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: 52,
            background: '#2a2a2a',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '0 16px',
          }}
        >
          {TRAFFIC_LIGHTS.map((c) => (
            <div
              key={c}
              style={{ width: 14, height: 14, borderRadius: '50%', background: c, flexShrink: 0 }}
            />
          ))}

          <div
            style={{
              flex: 1,
              background: '#111',
              borderRadius: 999,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 12,
              gap: 6,
            }}
          >
            <Lock size={16} color="rgba(255,255,255,0.4)" strokeWidth={1.5} />
            <span
              style={{
                fontSize: 18,
                fontFamily: MONO,
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              app.com
            </span>
          </div>
        </div>

        <div
          style={{
            height: 320,
            background: '#0d0d0d',
            padding: '28px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {fakeBlocks.map((block, i) => (
            <div
              key={i}
              style={{
                height: block.h,
                width: block.w,
                borderRadius: block.green ? 8 : 6,
                background: block.green
                  ? 'rgba(62,207,142,0.15)'
                  : '#1a1a1a',
                border: block.green
                  ? '1px solid rgba(62,207,142,0.35)'
                  : 'none',
                opacity: itp(frame, block.delay, block.delay + 8),
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
