import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Img, staticFile } from 'remotion';

export const V0SupabaseIntro: React.FC = () => {
  const frame = useCurrentFrame();

  // Hexagon grid background animation
  const gridOpacity = interpolate(frame, [0, 30], [0, 0.4], { extrapolateRight: 'clamp' });
  const gridRotation = frame * 0.5;

  // V0 logo animation (zoom in with rotation)
  const v0Scale = spring({
    frame: frame - 10,
    fps: 30,
    config: { damping: 15, mass: 0.8, stiffness: 100 }
  });
  const v0Rotation = interpolate(
    frame,
    [10, 40],
    [180, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Supabase logo animation (zoom in with rotation)
  const supabaseScale = spring({
    frame: frame - 25,
    fps: 30,
    config: { damping: 15, mass: 0.8, stiffness: 100 }
  });
  const supabaseRotation = interpolate(
    frame,
    [25, 55],
    [-180, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Energy beam animation
  const beamIntensity = interpolate(
    frame,
    [55, 75],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Pulse effect at connection
  const pulseScale = spring({
    frame: frame - 75,
    fps: 30,
    config: { damping: 5 }
  });

  // Text animation (glitch fade-in)
  const text1Opacity = interpolate(frame, [85, 100], [0, 1], { extrapolateRight: 'clamp' });
  const text2Opacity = interpolate(frame, [100, 115], [0, 1], { extrapolateRight: 'clamp' });
  const text3Opacity = interpolate(frame, [115, 130], [0, 1], { extrapolateRight: 'clamp' });

  // Digital glitch effect
  const glitchActive = frame > 75 && frame < 85 && frame % 3 < 1;
  const glitchOffset = glitchActive ? Math.sin(frame * 10) * 5 : 0;

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0d0221 0%, #1a0b2e 50%, #0d0221 100%)',
        fontFamily: '"Press Start 2P", monospace',
        overflow: 'hidden',
      }}
    >
      {/* Animated hexagon pattern background */}
      <div
        style={{
          position: 'absolute',
          width: '200%',
          height: '200%',
          left: '-50%',
          top: '-50%',
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(62, 207, 142, 0.03) 50px, rgba(62, 207, 142, 0.03) 51px),
            repeating-linear-gradient(60deg, transparent, transparent 50px, rgba(255, 255, 255, 0.03) 50px, rgba(255, 255, 255, 0.03) 51px),
            repeating-linear-gradient(120deg, transparent, transparent 50px, rgba(62, 207, 142, 0.03) 50px, rgba(62, 207, 142, 0.03) 51px)
          `,
          opacity: gridOpacity,
          transform: `rotate(${gridRotation}deg)`,
        }}
      />

      {/* Neon scan effect */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '8px',
          background: 'linear-gradient(transparent, rgba(62, 207, 142, 0.3), transparent)',
          boxShadow: '0 0 20px rgba(62, 207, 142, 0.5)',
          top: `${(frame * 10) % 1920}px`,
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
          gap: '80px',
          padding: '40px',
        }}
      >
        {/* Logos section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '120px',
            position: 'relative',
          }}
        >
          {/* V0 Logo (Black Hexagon) */}
          <div
            style={{
              transform: `scale(${v0Scale}) rotate(${v0Rotation}deg)`,
              filter: glitchActive ? `brightness(1.3)` : 'none',
            }}
          >
            <div
              style={{
                width: '240px',
                height: '240px',
                background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 50%, #ffffff 100%)',
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: `
                  0 0 40px rgba(255, 255, 255, 0.3),
                  0 0 80px rgba(255, 255, 255, 0.2),
                  inset 0 0 60px rgba(0, 0, 0, 0.1)
                `,
                animation: frame > 40 ? `pulse 2s ease-in-out infinite` : 'none',
              }}
            >
              {/* Inner hexagon */}
              <div
                style={{
                  width: '210px',
                  height: '210px',
                  background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* V0 Logo */}
                <div
                  style={{
                    fontSize: '70px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    textShadow: `
                      0 0 10px #ffffff,
                      0 0 20px #ffffff,
                      4px 4px 0 rgba(0, 0, 0, 0.8)
                    `,
                    fontFamily: '"Press Start 2P", monospace',
                  }}
                >
                  v0
                </div>
              </div>

              {/* Rotating corner dots */}
              {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <div
                  key={angle}
                  style={{
                    position: 'absolute',
                    width: '12px',
                    height: '12px',
                    background: '#ffffff',
                    borderRadius: '50%',
                    boxShadow: '0 0 10px #ffffff, 0 0 20px rgba(255, 255, 255, 0.5)',
                    transform: `rotate(${angle}deg) translateY(-125px)`,
                    opacity: frame > 40 ? 1 : 0,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                marginTop: '30px',
                fontSize: '18px',
                color: '#ffffff',
                textAlign: 'center',
                textShadow: '0 0 10px #ffffff, 2px 2px 0 #000',
                letterSpacing: '4px',
              }}
            >
              V0
            </div>
          </div>

          {/* Energy beam connection */}
          {frame >= 55 && (
            <>
              {/* Main energy beam (vertical) */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: '6px',
                  height: '200px',
                  background: `linear-gradient(180deg,
                    rgba(255, 255, 255, ${beamIntensity}),
                    rgba(62, 207, 142, ${beamIntensity}),
                    rgba(62, 207, 142, ${beamIntensity}),
                    rgba(62, 207, 142, ${beamIntensity})
                  )`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: `
                    0 0 20px rgba(255, 255, 255, ${beamIntensity}),
                    0 0 40px rgba(62, 207, 142, ${beamIntensity}),
                    0 0 60px rgba(62, 207, 142, ${beamIntensity * 0.5})
                  `,
                  filter: glitchActive ? 'brightness(1.5)' : 'none',
                }}
              />

              {/* Secondary beam pulses */}
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: '2px',
                    height: '200px',
                    background: `rgba(62, 207, 142, ${beamIntensity * 0.3})`,
                    transform: `translate(${-10 + i * 10}px, -50%)`,
                    boxShadow: `0 0 10px rgba(62, 207, 142, ${beamIntensity * 0.3})`,
                    opacity: Math.sin((frame - 55 + i * 10) * 0.2) * 0.5 + 0.5,
                  }}
                />
              ))}

              {/* Energy pulse at center */}
              {frame >= 75 && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) scale(${pulseScale})`,
                  }}
                >
                  {/* Outer ring */}
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      border: '4px solid #3ECF8E',
                      boxShadow: `
                        0 0 30px #3ECF8E,
                        0 0 60px #3ECF8E,
                        inset 0 0 30px rgba(62, 207, 142, 0.3)
                      `,
                      position: 'relative',
                    }}
                  >
                    {/* Inner core */}
                    <div
                      style={{
                        position: 'absolute',
                        width: '40px',
                        height: '40px',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'radial-gradient(circle, #ffffff, #3ECF8E)',
                        borderRadius: '50%',
                        boxShadow: '0 0 40px #ffffff, 0 0 80px #3ECF8E',
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Supabase Logo (Green Circle) */}
          <div
            style={{
              transform: `scale(${supabaseScale}) rotate(${supabaseRotation}deg)`,
              filter: glitchActive ? `brightness(1.3)` : 'none',
            }}
          >
            {/* Outer rotating rings */}
            {[0, 1, 2].map((ring) => (
              <div
                key={ring}
                style={{
                  position: 'absolute',
                  width: `${260 + ring * 20}px`,
                  height: `${260 + ring * 20}px`,
                  border: '2px solid rgba(62, 207, 142, 0.3)',
                  borderRadius: '50%',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${frame * (2 + ring)}deg)`,
                  boxShadow: `0 0 ${10 + ring * 5}px rgba(62, 207, 142, 0.2)`,
                  opacity: frame > 55 ? 1 : 0,
                }}
              />
            ))}

            <div
              style={{
                width: '240px',
                height: '240px',
                background: 'linear-gradient(135deg, #3ECF8E 0%, #2ea370 50%, #3ECF8E 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: `
                  0 0 40px rgba(62, 207, 142, 0.6),
                  0 0 80px rgba(62, 207, 142, 0.4),
                  inset 0 0 60px rgba(255, 255, 255, 0.1)
                `,
              }}
            >
              {/* Inner circle */}
              <div
                style={{
                  width: '210px',
                  height: '210px',
                  background: 'linear-gradient(135deg, #0d0221 0%, #1a0b2e 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid rgba(62, 207, 142, 0.3)',
                }}
              >
                {/* Supabase Logo Image */}
                <Img
                  src={staticFile('screenshot-supabase.png')}
                  style={{
                    width: '140px',
                    height: '140px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 10px rgba(62, 207, 142, 0.5))',
                  }}
                />
              </div>

              {/* Orbiting particles */}
              {[0, 90, 180, 270].map((angle, i) => (
                <div
                  key={angle}
                  style={{
                    position: 'absolute',
                    width: '10px',
                    height: '10px',
                    background: '#3ECF8E',
                    borderRadius: '50%',
                    boxShadow: '0 0 15px #3ECF8E, 0 0 30px rgba(62, 207, 142, 0.5)',
                    transform: `rotate(${angle + frame * 3}deg) translateY(-125px)`,
                    opacity: frame > 55 ? 1 : 0,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                marginTop: '30px',
                fontSize: '18px',
                color: '#3ECF8E',
                textAlign: 'center',
                textShadow: '0 0 10px #3ECF8E, 2px 2px 0 #000',
                letterSpacing: '4px',
              }}
            >
              SUPABASE
            </div>
          </div>
        </div>

        {/* Text message with neon styling */}
        {frame >= 85 && (
          <div
            style={{
              width: '90%',
              maxWidth: '950px',
              textAlign: 'center',
              padding: '35px 40px',
              background: 'linear-gradient(135deg, rgba(26, 11, 46, 0.9), rgba(13, 2, 33, 0.9))',
              border: '3px solid #3ECF8E',
              borderRadius: '15px',
              position: 'relative',
              boxShadow: `
                0 0 30px rgba(62, 207, 142, 0.4),
                0 0 60px rgba(62, 207, 142, 0.3),
                inset 0 0 50px rgba(62, 207, 142, 0.1)
              `,
              transform: glitchActive ? `translate(${glitchOffset}px, ${-glitchOffset}px)` : 'none',
            }}
          >
            {/* Corner accents */}
            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
              <div
                key={corner}
                style={{
                  position: 'absolute',
                  width: '25px',
                  height: '25px',
                  border: '3px solid #ffffff',
                  ...{
                    'top-left': { top: '-3px', left: '-3px', borderRight: 'none', borderBottom: 'none' },
                    'top-right': { top: '-3px', right: '-3px', borderLeft: 'none', borderBottom: 'none' },
                    'bottom-left': { bottom: '-3px', left: '-3px', borderRight: 'none', borderTop: 'none' },
                    'bottom-right': { bottom: '-3px', right: '-3px', borderLeft: 'none', borderTop: 'none' },
                  }[corner],
                  boxShadow: '0 0 10px #ffffff',
                }}
              />
            ))}

            <div
              style={{
                fontSize: '28px',
                lineHeight: '1.8',
                color: '#ffffff',
                letterSpacing: '1px',
              }}
            >
              <span
                style={{
                  opacity: text1Opacity,
                  color: '#ffffff',
                  textShadow: glitchActive ? `
                    2px 2px 0 #3ECF8E,
                    -2px -2px 0 #ffffff,
                    0 0 20px #ffffff
                  ` : '0 0 10px #ffffff, 3px 3px 0 #000',
                }}
              >
                Use
              </span>{' '}
              <span
                style={{
                  opacity: text1Opacity,
                  color: '#3ECF8E',
                  textShadow: '0 0 20px #3ECF8E, 0 0 40px #3ECF8E, 3px 3px 0 #000',
                }}
              >
                Supabase
              </span>{' '}
              <span style={{ opacity: text1Opacity, color: '#ffffff', textShadow: '0 0 10px #ffffff, 3px 3px 0 #000' }}>
                for
              </span>
              <br />
              <span
                style={{
                  opacity: text2Opacity,
                  color: '#ffffff',
                  textShadow: '0 0 20px #ffffff, 0 0 40px #ffffff, 3px 3px 0 #000',
                }}
              >
                auth, storage,
              </span>
              <br />
              <span
                style={{
                  opacity: text2Opacity,
                  color: '#ffffff',
                  textShadow: '0 0 20px #ffffff, 0 0 40px #ffffff, 3px 3px 0 #000',
                }}
              >
                and data
              </span>
              <br />
              <span style={{ opacity: text3Opacity, color: '#ffffff', textShadow: '0 0 10px #ffffff, 3px 3px 0 #000' }}>
                then instantly
              </span>
              <br />
              <span style={{ opacity: text3Opacity, color: '#ffffff', textShadow: '0 0 10px #ffffff, 3px 3px 0 #000' }}>
                deploy with
              </span>{' '}
              <span
                style={{
                  opacity: text3Opacity,
                  color: '#ffffff',
                  textShadow: '0 0 20px #ffffff, 0 0 40px #ffffff, 3px 3px 0 #000',
                }}
              >
                v0
              </span>
            </div>

            {/* Glitch cursor */}
            {frame >= 130 && frame % 25 < 12 && (
              <span
                style={{
                  display: 'inline-block',
                  width: '24px',
                  height: '36px',
                  background: 'linear-gradient(180deg, #ffffff, #3ECF8E)',
                  marginLeft: '12px',
                  verticalAlign: 'middle',
                  boxShadow: '0 0 20px #ffffff, 0 0 40px #3ECF8E',
                }}
              />
            )}
          </div>
        )}

        {/* Neon particles floating */}
        {frame >= 75 && [1, 2, 3, 4, 5, 6].map((i) => {
          const particleY = ((frame - 75 + i * 25) * 4) % 2000 - 100;
          const particleX = 100 + i * 160 + Math.sin(frame * 0.15 + i) * 60;
          const particleRotation = (frame * (2 + i * 0.5)) % 360;
          const colors = ['#ffffff', '#3ECF8E', '#ffffff', '#3ECF8E'];
          const color = colors[i % colors.length];
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${particleX}px`,
                top: `${particleY}px`,
                width: i % 3 === 0 ? '8px' : '6px',
                height: i % 3 === 0 ? '8px' : '6px',
                background: color,
                opacity: 0.7,
                boxShadow: `0 0 15px ${color}, 0 0 30px ${color}`,
                borderRadius: i % 2 === 0 ? '50%' : '0%',
                transform: `rotate(${particleRotation}deg)`,
              }}
            />
          );
        })}

        {/* Energy streaks */}
        {frame >= 75 && [1, 2, 3].map((i) => {
          const streakY = ((frame - 75 + i * 60) * 8) % 2000 - 100;
          const streakX = 200 + i * 350;
          return (
            <div
              key={`streak-${i}`}
              style={{
                position: 'absolute',
                left: `${streakX}px`,
                top: `${streakY}px`,
                width: '3px',
                height: '60px',
                background: `linear-gradient(180deg, transparent, ${i % 2 === 0 ? '#ffffff' : '#3ECF8E'}, transparent)`,
                opacity: 0.5,
                boxShadow: `0 0 10px ${i % 2 === 0 ? '#ffffff' : '#3ECF8E'}`,
              }}
            />
          );
        })}
      </div>

      {/* Holographic scan lines overlay */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(62, 207, 142, 0.03) 2px,
              rgba(62, 207, 142, 0.03) 4px
            )
          `,
          pointerEvents: 'none',
        }}
      />

      {/* Digital noise overlay */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: glitchActive ? `
            repeating-linear-gradient(
              90deg,
              transparent,
              rgba(62, 207, 142, 0.1) 1px,
              transparent 2px
            )
          ` : 'transparent',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
