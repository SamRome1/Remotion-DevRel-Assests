import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Img, staticFile } from 'remotion';

export const GeminiSupabaseIntro: React.FC = () => {
  const frame = useCurrentFrame();

  // Pixel grid background animation
  const gridOpacity = interpolate(frame, [0, 30], [0, 0.3], { extrapolateRight: 'clamp' });

  // Gemini logo animation (slides in from left)
  const geminiX = interpolate(
    frame,
    [10, 40],
    [-300, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const geminiScale = spring({
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

  // Headline animation
  const headline1Opacity = interpolate(frame, [80, 95], [0, 1], { extrapolateRight: 'clamp' });
  const headline2Opacity = interpolate(frame, [95, 110], [0, 1], { extrapolateRight: 'clamp' });

  // Paragraph animation (word-group by word-group)
  const para1Opacity = interpolate(frame, [125, 138], [0, 1], { extrapolateRight: 'clamp' });
  const para2Opacity = interpolate(frame, [138, 151], [0, 1], { extrapolateRight: 'clamp' });
  const para3Opacity = interpolate(frame, [151, 164], [0, 1], { extrapolateRight: 'clamp' });

  // Tool icon row stagger
  const toolIcons = [
    { key: 'github', src: 'github-icon.svg', label: 'GITHUB', start: 178 },
    { key: 'linear', src: 'linear-icon.svg', label: 'LINEAR', start: 186 },
    { key: 'jira', src: 'jira-icon.svg', label: 'JIRA', start: 194 },
  ];

  // Learn more / link
  const learnMoreOpacity = interpolate(frame, [215, 230], [0, 1], { extrapolateRight: 'clamp' });
  const linkOpacity = interpolate(frame, [230, 245], [0, 1], { extrapolateRight: 'clamp' });

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
          gap: '70px',
          paddingTop: '20px',
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
          {/* Gemini Logo (Pixel Art) */}
          <div
            style={{
              transform: `translateX(${geminiX}px) scale(${geminiScale})`,
              filter: glitchActive ? 'hue-rotate(180deg)' : 'none',
            }}
          >
            <div
              style={{
                width: '200px',
                height: '200px',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #0d0d1a 100%)',
                borderRadius: '20px',
                border: '6px solid #2a2a2a',
                boxShadow: `
                  0 0 0 6px #4893FC,
                  0 8px 0 0 #1a1a1a,
                  0 8px 20px rgba(0,0,0,0.8),
                  inset 0 4px 0 rgba(255,255,255,0.1)
                `,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                imageRendering: 'pixelated',
                padding: '30px',
              }}
            >
              {/* Gemini Logo Image */}
              <Img
                src={staticFile('gemini-icon.svg')}
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
                color: '#4893FC',
                textAlign: 'center',
                textShadow: '2px 2px 0 #000',
              }}
            >
              GEMINI
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
                  background: 'linear-gradient(90deg, #4893FC, #3ECF8E)',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: `
                    0 0 20px #4893FC,
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

        {/* Headline */}
        {frame >= 80 && (
          <div
            style={{
              maxWidth: '1500px',
              textAlign: 'center',
              fontSize: '34px',
              lineHeight: '1.6',
              letterSpacing: '2px',
              textShadow: '3px 3px 0 #000',
            }}
          >
            <span style={{ opacity: headline1Opacity, color: '#3ECF8E' }}>
              ✨ SUPABASE
            </span>{' '}
            <span style={{ opacity: headline1Opacity, color: '#ffffff' }}>
              IS NOW A CONNECTOR IN
            </span>
            <br />
            <span style={{ opacity: headline2Opacity, color: '#4893FC' }}>
              GEMINI ENTERPRISE
            </span>
          </div>
        )}

        {/* Paragraph */}
        {frame >= 125 && (
          <div
            style={{
              maxWidth: '1300px',
              textAlign: 'center',
              padding: '32px 44px',
              backgroundColor: 'rgba(26, 31, 58, 0.8)',
              border: '6px solid #4893FC',
              boxShadow: `
                0 0 0 2px #2a2a2a,
                0 8px 0 0 #1a1a1a,
                inset 0 0 40px rgba(72, 147, 252, 0.1)
              `,
              imageRendering: 'pixelated',
            }}
          >
            <div
              style={{
                fontSize: '22px',
                lineHeight: '1.9',
                color: '#ffffff',
                textShadow: '2px 2px 0 #000',
                letterSpacing: '1px',
              }}
            >
              <span style={{ opacity: para1Opacity }}>
                Query your{' '}
              </span>
              <span style={{ opacity: para1Opacity, color: '#3ECF8E' }}>
                Supabase
              </span>{' '}
              <span style={{ opacity: para1Opacity }}>
                projects and take action
              </span>
              <br />
              <span style={{ opacity: para2Opacity }}>
                in natural language, right alongside the tools
              </span>
              <br />
              <span style={{ opacity: para3Opacity }}>
                your team already uses
              </span>
            </div>
          </div>
        )}

        {/* Tool icons row */}
        {frame >= 178 && (
          <div
            style={{
              display: 'flex',
              gap: '48px',
              alignItems: 'center',
            }}
          >
            {toolIcons.map((tool) => {
              const iconScale = spring({
                frame: frame - tool.start,
                fps: 30,
                config: { damping: 12, mass: 0.5 },
              });
              const iconOpacity = interpolate(
                frame,
                [tool.start, tool.start + 8],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              );
              return (
                <div
                  key={tool.key}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    opacity: iconOpacity,
                    transform: `scale(${iconScale})`,
                  }}
                >
                  <div
                    style={{
                      width: '76px',
                      height: '76px',
                      background: '#1a1f3a',
                      border: '4px solid #ffffff',
                      boxShadow: '0 4px 0 0 #1a1a1a, 0 4px 12px rgba(0,0,0,0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '16px',
                    }}
                  >
                    <Img
                      src={staticFile(tool.src)}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.6)',
                      letterSpacing: '1px',
                      textShadow: '1px 1px 0 #000',
                    }}
                  >
                    {tool.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Learn more + link */}
        {frame >= 215 && (
          <div
            style={{
              textAlign: 'center',
              opacity: learnMoreOpacity,
            }}
          >
            <div
              style={{
                fontSize: '20px',
                color: '#FFD700',
                letterSpacing: '2px',
                textShadow: '2px 2px 0 #000',
                marginBottom: '14px',
              }}
            >
              LEARN MORE ↓
            </div>
            <div
              style={{
                fontSize: '15px',
                color: '#4893FC',
                letterSpacing: '0.5px',
                textShadow: '2px 2px 0 #000',
                opacity: linkOpacity,
              }}
            >
              supabase.com/blog/supabase-is-now-available-in-gemini-enterprise
            </div>
          </div>
        )}
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
