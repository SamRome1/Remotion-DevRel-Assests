import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';

const SUPABASE_GREEN = '#3ecf8e';

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export const StorageNotTheProblem: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Phase 1 (0-50): Scene fades in ──
  const bgOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ── Phase 2 (30-90): "If storage is not the problem..." ──
  const line1Words = ['If', 'storage', 'is', 'not', 'the', 'problem...'];
  const line1WordDelay = 8; // frames between each word
  const line1Start = 30;

  // ── Phase 3 (80-150): Storage bar shows — healthy ──
  const storageBarOpacity = interpolate(frame, [90, 115], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const storageFill = interpolate(frame, [100, 140], [0, 0.22], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOut,
  });

  // ── Phase 4 (155-210): "how are you running out of the free tier?" ──
  const line2Start = 155;
  const line2Words = ['how', 'are', 'you', 'running', 'out', 'of', 'the', 'free', 'tier?'];
  const line2WordDelay = 7;

  // Question mark pulse after all words appear
  const line2End = line2Start + line2Words.length * line2WordDelay + 10;
  const pulseScale = spring({
    frame: frame - line2End,
    fps: 30,
    config: { damping: 8, stiffness: 80 },
  });

  // ── Glow intensity builds over time ──
  const glowIntensity = interpolate(frame, [0, 200, 270], [0, 0.12, 0.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ── Subtle grid ──
  const gridOpacity = interpolate(frame, [0, 40], [0, 0.07], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Word opacity helper
  const wordOpacity = (words: string[], startFrame: number, delay: number, index: number) => {
    const wStart = startFrame + index * delay;
    return interpolate(frame, [wStart, wStart + 10], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  };

  const wordY = (startFrame: number, delay: number, index: number) => {
    const wStart = startFrame + index * delay;
    return interpolate(frame, [wStart, wStart + 14], [14, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: easeOut,
    });
  };

  // ── line2 underline ──
  const underlineWidth = interpolate(frame, [line2End + 5, line2End + 30], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f1419',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
        opacity: bgOpacity,
      }}
    >
      {/* Subtle grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(rgba(62,207,142,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(62,207,142,0.4) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          opacity: gridOpacity,
        }}
      />

      {/* Radial glow — builds in intensity */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(62,207,142,${glowIntensity}) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* ── Main content ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '64px',
          maxWidth: '1600px',
          padding: '0 80px',
        }}
      >
        {/* Line 1 */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '20px',
            overflow: 'visible',
          }}
        >
          {line1Words.map((word, i) => {
            const isStorage = word === 'storage';
            const opacity = wordOpacity(line1Words, line1Start, line1WordDelay, i);
            const y = wordY(line1Start, line1WordDelay, i);
            return (
              <span
                key={i}
                style={{
                  fontSize: '72px',
                  fontWeight: isStorage ? '800' : '400',
                  color: isStorage ? SUPABASE_GREEN : '#a0aec0',
                  opacity,
                  transform: `translateY(${y}px)`,
                  display: 'inline-block',
                  letterSpacing: '-0.01em',
                  textShadow: isStorage ? `0 0 40px ${SUPABASE_GREEN}66` : 'none',
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Storage health indicator */}
        {frame >= 90 && (
          <div
            style={{
              opacity: storageBarOpacity,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '18px',
              padding: '28px 48px',
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              width: '680px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '26px' }}>🗄️</span>
                <span style={{ fontSize: '22px', color: '#e2e8f0', fontWeight: '600' }}>
                  Storage
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    color: SUPABASE_GREEN,
                  }}
                >
                  {Math.round(storageFill * 500)} MB
                </span>
                <span style={{ fontSize: '20px', color: '#4a5568' }}>/</span>
                <span style={{ fontSize: '20px', color: '#718096' }}>500 MB</span>
                <span
                  style={{
                    marginLeft: '8px',
                    fontSize: '18px',
                    color: SUPABASE_GREEN,
                    fontWeight: '700',
                    backgroundColor: 'rgba(62,207,142,0.12)',
                    padding: '4px 12px',
                    borderRadius: '6px',
                  }}
                >
                  ✓ Fine
                </span>
              </div>
            </div>

            {/* Bar */}
            <div
              style={{
                width: '100%',
                height: '10px',
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderRadius: '5px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${storageFill * 100}%`,
                  backgroundColor: SUPABASE_GREEN,
                  borderRadius: '5px',
                  boxShadow: `0 0 12px ${SUPABASE_GREEN}66`,
                }}
              />
            </div>
          </div>
        )}

        {/* Line 2 */}
        {frame >= line2Start && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '22px',
                overflow: 'visible',
                transform: `scale(${frame >= line2End ? pulseScale : 1})`,
                transformOrigin: 'center center',
              }}
            >
              {line2Words.map((word, i) => {
                const isHighlight = word === 'free' || word === 'tier?';
                const opacity = wordOpacity(line2Words, line2Start, line2WordDelay, i);
                const y = wordY(line2Start, line2WordDelay, i);
                return (
                  <span
                    key={i}
                    style={{
                      fontSize: '88px',
                      fontWeight: '800',
                      color: isHighlight ? '#ffffff' : '#e2e8f0',
                      opacity,
                      transform: `translateY(${y}px)`,
                      display: 'inline-block',
                      letterSpacing: '-0.02em',
                      textShadow: isHighlight
                        ? '0 4px 30px rgba(255,255,255,0.15)'
                        : 'none',
                    }}
                  >
                    {word}
                  </span>
                );
              })}
            </div>

            {/* Animated underline */}
            {frame >= line2End + 5 && (
              <div
                style={{
                  height: '4px',
                  width: `${underlineWidth}%`,
                  background: `linear-gradient(90deg, transparent, ${SUPABASE_GREEN}, transparent)`,
                  borderRadius: '2px',
                  boxShadow: `0 0 16px ${SUPABASE_GREEN}88`,
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Bottom accent */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '5px',
          background: `linear-gradient(90deg, transparent, ${SUPABASE_GREEN}, transparent)`,
          opacity: interpolate(frame, [100, 160], [0, 0.5], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      />
    </AbsoluteFill>
  );
};
