import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Img, staticFile } from 'remotion';

export const SupabaseCursorPlugin: React.FC = () => {
  const frame = useCurrentFrame();

  // Background grid fade in
  const gridOpacity = interpolate(frame, [0, 30], [0, 0.25], { extrapolateRight: 'clamp' });

  // Supabase logo slides in from top
  const supabaseY = interpolate(frame, [10, 45], [-350, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const supabaseScale = spring({ frame: frame - 10, fps: 30, config: { damping: 12, mass: 0.5 } });

  // Cursor logo slides in from bottom
  const cursorY = interpolate(frame, [20, 55], [350, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cursorScale = spring({ frame: frame - 20, fps: 30, config: { damping: 12, mass: 0.5 } });

  // Vertical connection line grows from center outward
  const lineProgress = interpolate(frame, [55, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Spark burst at merge point
  const sparkScale = spring({ frame: frame - 80, fps: 30, config: { damping: 8, mass: 0.4 } });
  const sparkOpacity = interpolate(frame, [80, 125], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Glitch effect when spark fires
  const glitchActive = frame >= 80 && frame < 92 && frame % 4 < 2;

  // Plug/link pixel icon bounce (appears at center when line completes)
  const plugScale = spring({ frame: frame - 75, fps: 30, config: { damping: 10, mass: 0.6 } });

  // Text box slide-up + fade
  const boxY = interpolate(frame, [88, 110], [50, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const boxOpacity = interpolate(frame, [88, 108], [0, 1], { extrapolateRight: 'clamp' });

  // Word-by-word text reveal
  const word1Opacity = interpolate(frame, [95, 110], [0, 1], { extrapolateRight: 'clamp' });
  const word2Opacity = interpolate(frame, [110, 125], [0, 1], { extrapolateRight: 'clamp' });
  const word3Opacity = interpolate(frame, [125, 140], [0, 1], { extrapolateRight: 'clamp' });
  const word4Opacity = interpolate(frame, [140, 155], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#060a1a',
        fontFamily: '"Press Start 2P", monospace',
        overflow: 'hidden',
      }}
    >
      {/* Pixel grid background */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(#1a2040 ${glitchActive ? '2px' : '1px'}, transparent 1px),
            linear-gradient(90deg, #1a2040 ${glitchActive ? '2px' : '1px'}, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          opacity: gridOpacity,
        }}
      />

      {/* Moving scanline */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '3px',
          background: 'linear-gradient(transparent, rgba(0, 180, 255, 0.18), transparent)',
          top: `${(frame * 8) % 1920}px`,
          pointerEvents: 'none',
        }}
      />

      {/* Ambient glow — top (Supabase green) */}
      <div
        style={{
          position: 'absolute',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(62,207,142,0.09) 0%, transparent 70%)',
          left: '50%',
          top: '150px',
          transform: 'translateX(-50%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Ambient glow — bottom (Cursor blue) */}
      <div
        style={{
          position: 'absolute',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,180,255,0.09) 0%, transparent 70%)',
          left: '50%',
          bottom: '300px',
          transform: 'translateX(-50%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Main content — vertically stacked */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: '0px',
          padding: '60px 40px',
        }}
      >
        {/* ── Supabase Logo (top) ── */}
        <div
          style={{
            transform: `translateY(${supabaseY}px) scale(${supabaseScale})`,
            filter: glitchActive ? 'hue-rotate(90deg) brightness(1.3)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '240px',
              height: '240px',
              background: 'linear-gradient(135deg, #3ECF8E 0%, #1a8a5c 100%)',
              border: '8px solid #1a1a1a',
              boxShadow: `
                0 0 0 4px #3ECF8E,
                4px 8px 0 0 #0a0a0a,
                0 0 50px rgba(62, 207, 142, 0.45),
                inset 0 4px 0 rgba(255,255,255,0.15)
              `,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              imageRendering: 'pixelated',
              padding: '22px',
            }}
          >
            <Img
              src={staticFile('screenshot-supabase.png')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(3px 3px 0 #0a0a0a)',
              }}
            />
            {/* Pixel corner ornaments */}
            {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => (
              <div
                key={pos}
                style={{
                  position: 'absolute',
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#FFD700',
                  top: pos.startsWith('t') ? '10px' : undefined,
                  bottom: pos.startsWith('b') ? '10px' : undefined,
                  left: pos.endsWith('l') ? '10px' : undefined,
                  right: pos.endsWith('r') ? '10px' : undefined,
                  boxShadow: '2px 2px 0 #000',
                }}
              />
            ))}
          </div>
          <div
            style={{
              marginTop: '20px',
              fontSize: '22px',
              color: '#3ECF8E',
              textAlign: 'center',
              textShadow: '3px 3px 0 #000',
              letterSpacing: '4px',
            }}
          >
            SUPABASE
          </div>
        </div>

        {/* ── Vertical connection zone ── */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '200px',
            width: '100%',
            justifyContent: 'center',
          }}
        >
          {/* Top half of line (green → blue) */}
          {frame >= 55 && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '10px',
                height: `${lineProgress * 80}px`,
                transform: 'translate(-50%, -100%)',
                background: 'linear-gradient(180deg, #3ECF8E, #00b4ff)',
                boxShadow: '0 0 18px #3ECF8E, 0 0 36px rgba(62,207,142,0.4)',
                imageRendering: 'pixelated',
              }}
            />
          )}
          {/* Bottom half of line (blue → dark blue) */}
          {frame >= 55 && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '10px',
                height: `${lineProgress * 80}px`,
                transform: 'translate(-50%, 0%)',
                background: 'linear-gradient(180deg, #00b4ff, #0066ff)',
                boxShadow: '0 0 18px #0066ff, 0 0 36px rgba(0,102,255,0.4)',
                imageRendering: 'pixelated',
              }}
            />
          )}

          {/* Pixel plug icon at center */}
          {frame >= 75 && (
            <div
              style={{
                transform: `scale(${plugScale})`,
                position: 'absolute',
                top: '50%',
                left: '50%',
                translate: '-50% -50%',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 14px)',
                gridTemplateRows: 'repeat(6, 14px)',
                gap: '2px',
              }}
            >
              {[
                [0,1,0,0],
                [1,1,1,1],
                [1,1,1,1],
                [1,1,1,1],
                [0,1,1,0],
                [0,1,1,0],
              ].map((row, r) =>
                row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    style={{
                      width: '14px',
                      height: '14px',
                      backgroundColor: cell ? '#FFD700' : 'transparent',
                      boxShadow: cell ? '0 0 8px #FFD700, 0 0 16px rgba(255,215,0,0.5)' : 'none',
                    }}
                  />
                ))
              )}
            </div>
          )}

          {/* Spark burst on merge */}
          {frame >= 80 && frame < 130 && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) scale(${sparkScale}) rotate(${frame * 6}deg)`,
                opacity: sparkOpacity,
              }}
            >
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  background: 'conic-gradient(#FFD700, #3ECF8E, #00b4ff, #FFD700)',
                  clipPath:
                    'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                  filter: 'brightness(2) drop-shadow(0 0 20px #FFD700)',
                }}
              />
            </div>
          )}
        </div>

        {/* ── Cursor Logo (bottom) ── */}
        <div
          style={{
            transform: `translateY(${cursorY}px) scale(${cursorScale})`,
            filter: glitchActive ? 'hue-rotate(-90deg) brightness(1.3)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '240px',
              height: '240px',
              background: 'linear-gradient(135deg, #1a1a2e 0%, #0d0d1a 100%)',
              border: '8px solid #1a1a1a',
              boxShadow: `
                0 0 0 4px #00b4ff,
                4px 8px 0 0 #0a0a0a,
                0 0 50px rgba(0, 180, 255, 0.45),
                inset 0 4px 0 rgba(255,255,255,0.08)
              `,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              imageRendering: 'pixelated',
              padding: '22px',
            }}
          >
            <Img
              src={staticFile('screenshot-curosr.png')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(3px 3px 0 #0a0a0a)',
              }}
            />
            {/* Pixel corner ornaments */}
            {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => (
              <div
                key={pos}
                style={{
                  position: 'absolute',
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#FFD700',
                  top: pos.startsWith('t') ? '10px' : undefined,
                  bottom: pos.startsWith('b') ? '10px' : undefined,
                  left: pos.endsWith('l') ? '10px' : undefined,
                  right: pos.endsWith('r') ? '10px' : undefined,
                  boxShadow: '2px 2px 0 #000',
                }}
              />
            ))}
          </div>
          <div
            style={{
              marginTop: '20px',
              fontSize: '22px',
              color: '#00b4ff',
              textAlign: 'center',
              textShadow: '3px 3px 0 #000',
              letterSpacing: '4px',
            }}
          >
            CURSOR
          </div>
        </div>

        {/* ── Text message box ── */}
        {frame >= 88 && (
          <div
            style={{
              opacity: boxOpacity,
              transform: `translateY(${boxY}px)`,
              marginTop: '60px',
              width: '90%',
              maxWidth: '900px',
              textAlign: 'center',
              padding: '44px 48px',
              backgroundColor: 'rgba(6, 10, 26, 0.95)',
              border: '6px solid #FFD700',
              position: 'relative',
              boxShadow: `
                0 0 0 2px #0a0a0a,
                6px 10px 0 0 #0a0a0a,
                inset 0 0 60px rgba(255, 215, 0, 0.06),
                0 0 80px rgba(255, 215, 0, 0.12)
              `,
              imageRendering: 'pixelated',
            }}
          >
            {/* Top label */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '28px',
                backgroundColor: '#FFD700',
                color: '#000',
                fontSize: '13px',
                padding: '5px 14px',
                letterSpacing: '2px',
                transform: 'translateY(-100%)',
              }}
            >
              ANNOUNCEMENT
            </div>

            <div
              style={{
                fontSize: '30px',
                lineHeight: '2.1',
                color: '#ffffff',
                textShadow: '3px 3px 0 #000',
                letterSpacing: '1px',
              }}
            >
              <span style={{ opacity: word1Opacity, color: '#FFD700' }}>
                Developers,
              </span>
              <br />
              <span style={{ opacity: word2Opacity, color: '#ffffff' }}>
                you can now
              </span>
              <br />
              <span style={{ opacity: word3Opacity, color: '#00b4ff' }}>
                connect to Cursor
              </span>
              <br />
              <span style={{ opacity: word4Opacity, color: '#3ECF8E' }}>
                with a plugin
              </span>
            </div>

            {/* Blinking block cursor */}
            {frame >= 155 && frame % 30 < 15 && (
              <span
                style={{
                  display: 'inline-block',
                  width: '24px',
                  height: '30px',
                  backgroundColor: '#FFD700',
                  marginLeft: '10px',
                  verticalAlign: 'middle',
                  boxShadow: '0 0 10px #FFD700',
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Floating pixel particles */}
      {frame >= 80 &&
        [1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
          const speed = 2 + (i % 3);
          const py = ((frame - 80 + i * 28) * speed) % 2100 - 100;
          const px = 30 + i * 130 + Math.sin(frame * 0.07 + i * 1.3) * 40;
          const color = i % 3 === 0 ? '#3ECF8E' : i % 3 === 1 ? '#00b4ff' : '#FFD700';
          const size = 8 + (i % 3) * 4;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${px}px`,
                top: `${py}px`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: color,
                opacity: 0.5,
                boxShadow: `0 0 ${size * 1.5}px ${color}`,
                imageRendering: 'pixelated',
              }}
            />
          );
        })}

      {/* CRT scanlines overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `repeating-linear-gradient(
            0deg,
            rgba(0,0,0,0.12),
            rgba(0,0,0,0.12) 1px,
            transparent 1px,
            transparent 2px
          )`,
          pointerEvents: 'none',
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
