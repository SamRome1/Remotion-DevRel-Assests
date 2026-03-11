import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Img, staticFile, Easing } from 'remotion';

export const StripeSupabaseIntro: React.FC = () => {
  const frame = useCurrentFrame();

  const gridOpacity = interpolate(frame, [0, 30], [0, 0.3], { extrapolateRight: 'clamp' });

  const stripeX = interpolate(frame, [10, 40], [-300, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const stripeScale = spring({ frame: frame - 10, fps: 30, config: { damping: 12, mass: 0.5 } });

  const supabaseX = interpolate(frame, [20, 50], [300, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const supabaseScale = spring({ frame: frame - 20, fps: 30, config: { damping: 12, mass: 0.5 } });

  const lineWidth = interpolate(frame, [50, 70], [0, 120], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const sparkScale = spring({ frame: frame - 70, fps: 30, config: { damping: 8 } });

  // Logos slide up smoothly to make room for the text panel
  // Start offset +170px (visually centered) → 0 (flex position)
  const logosY = interpolate(frame, [72, 115], [170, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Text panel rises up and fades in together
  const panelOpacity = interpolate(frame, [80, 100], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const panelY = interpolate(frame, [80, 115], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const text1Opacity = interpolate(frame, [85, 100], [0, 1], { extrapolateRight: 'clamp' });
  const text2Opacity = interpolate(frame, [100, 115], [0, 1], { extrapolateRight: 'clamp' });
  const text3Opacity = interpolate(frame, [115, 130], [0, 1], { extrapolateRight: 'clamp' });

  const glitchActive = frame > 70 && frame < 80 && frame % 4 < 2;

  const stripePurple = '#635BFF';
  const supabaseGreen = '#3ECF8E';

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0e27',
        fontFamily: '"Press Start 2P", monospace',
        overflow: 'hidden',
      }}
    >
      {/* Pixel grid */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(#1a1f3a 1px, transparent 1px),
            linear-gradient(90deg, #1a1f3a 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          opacity: gridOpacity,
        }}
      />

      {/* Scanline sweep */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '4px',
          background: 'linear-gradient(transparent, rgba(255,255,255,0.06), transparent)',
          top: `${(frame * 8) % 1080}px`,
          pointerEvents: 'none',
        }}
      />

      {/* Main layout — text panel always in DOM so flex is stable */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: '90px',
        }}
      >
        {/* Logos row — translateY starts +170 (visually centered) and eases to 0 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '100px',
            position: 'relative',
            transform: `translateY(${logosY}px)`,
          }}
        >
          {/* Stripe badge */}
          <div
            style={{
              transform: `translateX(${stripeX}px) scale(${stripeScale})`,
              filter: glitchActive ? 'hue-rotate(90deg)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '18px',
            }}
          >
            <div
              style={{
                width: '180px',
                height: '180px',
                backgroundColor: stripePurple,
                border: '4px solid #000',
                boxShadow: '6px 6px 0 #000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                imageRendering: 'pixelated',
                padding: '22px',
              }}
            >
              <Img
                src={staticFile('stripe.png')}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  imageRendering: 'pixelated',
                }}
              />
            </div>
            <div
              style={{
                fontSize: '15px',
                color: stripePurple,
                textShadow: '2px 2px 0 #000',
                letterSpacing: '2px',
              }}
            >
              STRIPE
            </div>
          </div>

          {/* Connection line + spark */}
          {frame >= 50 && (
            <>
              {Array.from({ length: 8 }).map((_, i) => {
                const progress = lineWidth / 100;
                const visible = i / 8 < progress;
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: `calc(50% + ${(i - 3.5) * 14}px)`,
                      top: '50%',
                      width: '10px',
                      height: '6px',
                      backgroundColor: i < 4 ? stripePurple : supabaseGreen,
                      transform: 'translate(-50%, -50%)',
                      opacity: visible ? 1 : 0,
                      imageRendering: 'pixelated',
                    }}
                  />
                );
              })}

              {frame >= 70 && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) scale(${sparkScale}) rotate(${frame * 8}deg)`,
                  }}
                >
                  <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                    <div style={{
                      position: 'absolute',
                      left: '0', top: '16px',
                      width: '48px', height: '16px',
                      backgroundColor: '#FFD700',
                      imageRendering: 'pixelated',
                    }} />
                    <div style={{
                      position: 'absolute',
                      left: '16px', top: '0',
                      width: '16px', height: '48px',
                      backgroundColor: '#FFD700',
                      imageRendering: 'pixelated',
                    }} />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Supabase badge */}
          <div
            style={{
              transform: `translateX(${supabaseX}px) scale(${supabaseScale})`,
              filter: glitchActive ? 'hue-rotate(180deg)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '18px',
            }}
          >
            <div
              style={{
                width: '180px',
                height: '180px',
                backgroundColor: supabaseGreen,
                border: '4px solid #000',
                boxShadow: '6px 6px 0 #000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
                  imageRendering: 'pixelated',
                }}
              />
            </div>
            <div
              style={{
                fontSize: '15px',
                color: supabaseGreen,
                textShadow: '2px 2px 0 #000',
                letterSpacing: '2px',
              }}
            >
              SUPABASE
            </div>
          </div>
        </div>

        {/* Text panel — always in DOM, eases up and fades in */}
        <div
          style={{
            opacity: panelOpacity,
            transform: `translateY(${panelY}px)`,
            textAlign: 'center',
            padding: '36px 20px',
            backgroundColor: '#12183a',
            border: '4px solid #FFD700',
            boxShadow: '6px 6px 0 #000',
          }}
        >
          <div
            style={{
              fontSize: '36px',
              lineHeight: '1.9',
              color: '#ffffff',
              textShadow: '3px 3px 0 #000',
              letterSpacing: '2px',
            }}
          >
            <span style={{ opacity: text1Opacity, color: '#FFD700' }}>
              DEVELOPERS:
            </span>
            <br />
            <span style={{ opacity: text2Opacity }}>integrate </span>
            <span style={{ opacity: text2Opacity, color: stripePurple }}>Stripe</span>
            <span style={{ opacity: text2Opacity }}> payments</span>
            <br />
            <span style={{ opacity: text3Opacity }}>into your </span>
            <span style={{ opacity: text3Opacity, color: supabaseGreen }}>Supabase</span>
            <span style={{ opacity: text3Opacity }}> project</span>
          </div>

          <span
            style={{
              display: 'inline-block',
              width: '22px',
              height: '44px',
              backgroundColor: '#FFD700',
              marginLeft: '10px',
              verticalAlign: 'middle',
              visibility: frame >= 130 && frame % 30 < 15 ? 'visible' : 'hidden',
            }}
          />
        </div>
      </div>

      {/* Floating pixel particles */}
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
              width: '10px',
              height: '10px',
              backgroundColor: i % 2 === 0 ? stripePurple : supabaseGreen,
              opacity: 0.7,
              imageRendering: 'pixelated',
            }}
          />
        );
      })}

      {/* CRT scanlines */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
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
    </AbsoluteFill>
  );
};
