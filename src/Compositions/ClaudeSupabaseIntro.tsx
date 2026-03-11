import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Img, staticFile } from 'remotion';

export const ClaudeSupabaseIntro: React.FC = () => {
  const frame = useCurrentFrame();

  // Pixel grid background animation
  const gridOpacity = interpolate(frame, [0, 30], [0, 0.3], { extrapolateRight: 'clamp' });

  // Claude logo animation (slides in from left)
  const claudeX = interpolate(
    frame,
    [10, 40],
    [-300, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const claudeScale = spring({
    frame: frame - 10,
    fps: 30,
    config: { damping: 12, mass: 0.5 }
  });

  // Supabase logo animation (slides in from right)
  const supabaseX = interpolate(
    frame,
    [20, 50],
    [300, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const supabaseScale = spring({
    frame: frame - 20,
    fps: 30,
    config: { damping: 12, mass: 0.5 }
  });

  // Connection line animation
  const lineWidth = interpolate(
    frame,
    [50, 70],
    [0, 100],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Spark effect at connection
  const sparkScale = spring({
    frame: frame - 70,
    fps: 30,
    config: { damping: 8 }
  });

  // Text animation (word by word)
  const text1Opacity = interpolate(frame, [80, 95], [0, 1], { extrapolateRight: 'clamp' });
  const text2Opacity = interpolate(frame, [95, 110], [0, 1], { extrapolateRight: 'clamp' });
  const text3Opacity = interpolate(frame, [110, 125], [0, 1], { extrapolateRight: 'clamp' });

  // Pixel glitch effect
  const glitchActive = frame > 70 && frame < 80 && frame % 4 < 2;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0e27',
        fontFamily: '"Press Start 2P", monospace',
        overflow: 'hidden',
      }}
    >
      {/* Animated pixel grid background */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(#1a1f3a ${glitchActive ? '2px' : '1px'}, transparent 1px),
            linear-gradient(90deg, #1a1f3a ${glitchActive ? '2px' : '1px'}, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          opacity: gridOpacity,
          animation: frame > 0 ? 'scroll 20s linear infinite' : 'none',
        }}
      />

      {/* Scanline effect */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '4px',
          background: 'linear-gradient(transparent, rgba(255,255,255,0.1), transparent)',
          top: `${(frame * 8) % 1080}px`,
          pointerEvents: 'none',
        }}
      />

      {/* Main content container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: '100px',
        }}
      >
        {/* Logos section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '80px',
            position: 'relative',
          }}
        >
          {/* Claude Logo (Pixel Art) */}
          <div
            style={{
              transform: `translateX(${claudeX}px) scale(${claudeScale})`,
              filter: glitchActive ? 'hue-rotate(180deg)' : 'none',
            }}
          >
            <div
              style={{
                width: '200px',
                height: '200px',
                background: 'linear-gradient(135deg, #CC9B7A 0%, #8B6F47 100%)',
                borderRadius: '20px',
                border: '6px solid #2a2a2a',
                boxShadow: `
                  0 0 0 6px #CC9B7A,
                  0 8px 0 0 #1a1a1a,
                  0 8px 20px rgba(0,0,0,0.8),
                  inset 0 4px 0 rgba(255,255,255,0.2)
                `,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                imageRendering: 'pixelated',
                padding: '20px',
              }}
            >
              {/* Claude Logo Image */}
              <Img
                src={staticFile('screenshot-claude.png')}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(3px 3px 0 #2a2a2a)',
                }}
              />

              {/* Pixel corners decoration */}
              {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
                <div
                  key={corner}
                  style={{
                    position: 'absolute',
                    width: '16px',
                    height: '16px',
                    backgroundColor: '#FFD700',
                    ...{
                      'top-left': { top: '10px', left: '10px' },
                      'top-right': { top: '10px', right: '10px' },
                      'bottom-left': { bottom: '10px', left: '10px' },
                      'bottom-right': { bottom: '10px', right: '10px' },
                    }[corner],
                  }}
                />
              ))}
            </div>
            <div
              style={{
                marginTop: '20px',
                fontSize: '16px',
                color: '#CC9B7A',
                textAlign: 'center',
                textShadow: '2px 2px 0 #000',
              }}
            >
              CLAUDE
            </div>
          </div>

          {/* Connection line and spark */}
          {frame >= 50 && (
            <>
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: `${lineWidth}px`,
                  height: '8px',
                  background: 'linear-gradient(90deg, #CC9B7A, #3ECF8E)',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: `
                    0 0 20px #CC9B7A,
                    0 0 40px #3ECF8E
                  `,
                  imageRendering: 'pixelated',
                }}
              />

              {/* Spark/Star effect */}
              {frame >= 70 && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) scale(${sparkScale}) rotate(${frame * 8}deg)`,
                  }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      background: '#FFD700',
                      clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                      boxShadow: '0 0 30px #FFD700, 0 0 60px #FFD700',
                      filter: 'brightness(1.5)',
                    }}
                  />
                </div>
              )}
            </>
          )}

          {/* Supabase Logo (Pixel Art) */}
          <div
            style={{
              transform: `translateX(${supabaseX}px) scale(${supabaseScale})`,
              filter: glitchActive ? 'hue-rotate(180deg)' : 'none',
            }}
          >
            <div
              style={{
                width: '200px',
                height: '200px',
                background: 'linear-gradient(135deg, #3ECF8E 0%, #2ea370 100%)',
                borderRadius: '20px',
                border: '6px solid #2a2a2a',
                boxShadow: `
                  0 0 0 6px #3ECF8E,
                  0 8px 0 0 #1a1a1a,
                  0 8px 20px rgba(0,0,0,0.8),
                  inset 0 4px 0 rgba(255,255,255,0.2)
                `,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                imageRendering: 'pixelated',
                padding: '20px',
              }}
            >
              {/* Supabase Logo Image */}
              <Img
                src={staticFile('screenshot-supabase.png')}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(3px 3px 0 #2a2a2a)',
                }}
              />

              {/* Pixel corners decoration */}
              {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
                <div
                  key={corner}
                  style={{
                    position: 'absolute',
                    width: '16px',
                    height: '16px',
                    backgroundColor: '#FFD700',
                    ...{
                      'top-left': { top: '10px', left: '10px' },
                      'top-right': { top: '10px', right: '10px' },
                      'bottom-left': { bottom: '10px', left: '10px' },
                      'bottom-right': { bottom: '10px', right: '10px' },
                    }[corner],
                  }}
                />
              ))}
            </div>
            <div
              style={{
                marginTop: '20px',
                fontSize: '16px',
                color: '#3ECF8E',
                textAlign: 'center',
                textShadow: '2px 2px 0 #000',
              }}
            >
              SUPABASE
            </div>
          </div>
        </div>

        {/* Text message */}
        {frame >= 80 && (
          <div
            style={{
              maxWidth: '1400px',
              textAlign: 'center',
              padding: '40px',
              backgroundColor: 'rgba(26, 31, 58, 0.8)',
              border: '6px solid #FFD700',
              borderRadius: '0',
              boxShadow: `
                0 0 0 2px #2a2a2a,
                0 8px 0 0 #1a1a1a,
                inset 0 0 40px rgba(255, 215, 0, 0.1)
              `,
              imageRendering: 'pixelated',
            }}
          >
            <div
              style={{
                fontSize: '38px',
                lineHeight: '1.8',
                color: '#ffffff',
                textShadow: '3px 3px 0 #000',
                letterSpacing: '2px',
              }}
            >
              <span style={{ opacity: text1Opacity, color: '#FFD700' }}>
                DEVELOPERS:
              </span>
              <br />
              <span style={{ opacity: text2Opacity, color: '#ffffff' }}>
                work on your
              </span>{' '}
              <span style={{ opacity: text2Opacity, color: '#3ECF8E' }}>
                Supabase
              </span>
              <br />
              <span style={{ opacity: text3Opacity, color: '#ffffff' }}>
                project inside
              </span>{' '}
              <span style={{ opacity: text3Opacity, color: '#CC9B7A' }}>
                Claude
              </span>
            </div>

            {/* Blinking cursor */}
            {frame >= 125 && frame % 30 < 15 && (
              <span
                style={{
                  display: 'inline-block',
                  width: '24px',
                  height: '48px',
                  backgroundColor: '#FFD700',
                  marginLeft: '10px',
                  verticalAlign: 'middle',
                }}
              />
            )}
          </div>
        )}

        {/* Pixel particles floating */}
        {frame >= 70 && [1, 2, 3, 4, 5, 6].map((i) => {
          const particleY = ((frame - 70 + i * 20) * 3) % 1200 - 100;
          const particleX = 200 + i * 250 + Math.sin(frame * 0.1 + i) * 50;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${particleX}px`,
                top: `${particleY}px`,
                width: '12px',
                height: '12px',
                backgroundColor: i % 2 === 0 ? '#CC9B7A' : '#3ECF8E',
                opacity: 0.6,
                boxShadow: `0 0 10px ${i % 2 === 0 ? '#CC9B7A' : '#3ECF8E'}`,
              }}
            />
          );
        })}
      </div>

      {/* CRT screen effect overlay */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `
            repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.15),
              rgba(0, 0, 0, 0.15) 1px,
              transparent 1px,
              transparent 2px
            )
          `,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
