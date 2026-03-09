import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Img, staticFile } from 'remotion';

const GREEN = '#3ecf8e';
const DARK_BG = '#0d1f2d';
const CARD_BG = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(62,207,142,0.2)';
const PRO_COST = 25;
const PRICE_PER_USER = 5;

const T_IN = 20;

function itp(
  frame: number, a: number, b: number,
  from = 0, to = 1,
  easing?: (t: number) => number,
) {
  return interpolate(frame, [a, b], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
}

const USERS = [
  { color: '#8b5cf6', emoji: '👩‍💻', name: 'Sarah' },
  { color: '#3b82f6', emoji: '👨‍💼', name: 'Marcus' },
  { color: '#f59e0b', emoji: '👩‍🎨', name: 'Priya' },
  { color: '#ec4899', emoji: '👨‍🔬', name: 'James' },
  { color: '#10b981', emoji: '👩‍🚀', name: 'Leila' },
];

// Frame at which each user appears
const USER_FRAMES = [85, 112, 139, 166, 193];
const COVERED_FRAME = USER_FRAMES[4] + 18;

function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }

export const ProTierCovered: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Entrance
  const slideY = itp(frame, 0, T_IN, 60, 0, easeOut);
  const fadeIn = itp(frame, 0, T_IN);

  // How many users have fully appeared
  const usersVisible = USER_FRAMES.filter((f) => frame >= f).length;
  const revenueCents = usersVisible * PRICE_PER_USER;
  const coveragePct = Math.min(revenueCents / PRO_COST, 1);

  // Animate coverage bar width smoothly
  const coverageWidth = interpolate(
    frame,
    [
      ...USER_FRAMES.flatMap((f) => [f, f + 20]),
    ],
    [
      ...USER_FRAMES.flatMap((_, i) => [i / USERS.length, (i + 1) / USERS.length]),
    ],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut }
  );

  // Background glow intensifies when covered
  const bgPulse = frame >= COVERED_FRAME
    ? 0.12 + 0.04 * Math.sin(frame * 0.15)
    : 0.05 + 0.01 * Math.sin(frame * 0.04);

  // Pro card springs in
  const cardScale = spring({ frame: frame - 20, fps, config: { damping: 14, mass: 0.6 } });
  const cardOpacity = interpolate(frame, [18, 38], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Coverage bar container
  const barOpacity = interpolate(frame, [60, 78], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // COVERED badge
  const coveredScale = spring({
    frame: frame - COVERED_FRAME,
    fps,
    config: { damping: 9, stiffness: 130, mass: 0.5 },
  });
  const coveredOpacity = interpolate(frame, [COVERED_FRAME, COVERED_FRAME + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Tagline
  const taglineOpacity = interpolate(frame, [COVERED_FRAME + 25, COVERED_FRAME + 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const taglineY = interpolate(frame, [COVERED_FRAME + 25, COVERED_FRAME + 40], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOut,
  });

  // Bar color: green throughout, bright green at 100%
  const barColor = coverageWidth >= 0.999 ? GREEN : GREEN;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: DARK_BG,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 45%, rgba(62,207,142,${bgPulse}) 0%, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Entrance wrapper */}
      <div style={{
        position: 'absolute', inset: 0,
        transform: `translateY(${slideY}px)`,
        opacity: fadeIn,
      }}>

      {/* ── Main layout ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 52,
          padding: '0 120px',
        }}
      >
        {/* ── Pro Plan Card ── */}
        <div
          style={{
            transform: `scale(${cardScale})`,
            opacity: cardOpacity,
            display: 'flex',
            alignItems: 'center',
            gap: 32,
            backgroundColor: CARD_BG,
            border: `1.5px solid ${BORDER}`,
            borderRadius: 20,
            padding: '28px 56px',
          }}
        >
          {/* Supabase logo mark */}
          <Img
            src={staticFile('screenshot-supabase.png')}
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              flexShrink: 0,
              objectFit: 'cover',
            }}
          />
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: '0.14em',
                color: GREEN,
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Supabase
            </div>
            <div
              style={{
                fontSize: 38,
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              Pro Tier
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              width: 1,
              height: 56,
              backgroundColor: 'rgba(255,255,255,0.1)',
              margin: '0 8px',
            }}
          />

          {/* Price */}
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: 58,
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              $25
            </div>
            <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
              per month
            </div>
          </div>
        </div>

        {/* ── Coverage bar ── */}
        <div
          style={{
            opacity: barOpacity,
            width: '900px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
              Your revenue
            </span>
            <span
              style={{
                fontSize: 34,
                fontWeight: 800,
                color: coverageWidth >= 1 ? GREEN : '#ffffff',
                letterSpacing: '-0.02em',
                transition: 'color 0.2s',
                textShadow: coverageWidth >= 1 ? `0 0 24px ${GREEN}88` : 'none',
              }}
            >
              ${Math.round(coverageWidth * PRO_COST)}{' '}
              <span style={{ fontSize: 22, fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>
                / ${PRO_COST} needed
              </span>
            </span>
          </div>

          {/* Track */}
          <div
            style={{
              width: '100%',
              height: 18,
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: 9,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${coverageWidth * 100}%`,
                background: `linear-gradient(90deg, #2ea370, ${GREEN})`,
                borderRadius: 9,
                boxShadow: coverageWidth >= 1
                  ? `0 0 24px ${GREEN}88, 0 0 8px ${GREEN}44`
                  : `0 0 12px ${GREEN}44`,
              }}
            />
          </div>

          {/* Tick marks at each $5 increment */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: 0 }}>
            {[0, 5, 10, 15, 20, 25].map((v) => (
              <div
                key={v}
                style={{
                  fontSize: 16,
                  color:
                    Math.round(coverageWidth * PRO_COST) >= v
                      ? GREEN
                      : 'rgba(255,255,255,0.2)',
                  fontWeight: v === 25 ? 700 : 400,
                  transition: 'color 0.3s',
                }}
              >
                ${v}
              </div>
            ))}
          </div>
        </div>

        {/* ── Users row ── */}
        <div
          style={{
            display: 'flex',
            gap: 36,
            alignItems: 'flex-start',
            opacity: barOpacity,
          }}
        >
          {USERS.map((user, i) => {
            const userFrame = USER_FRAMES[i];
            const appeared = frame >= userFrame;
            const uScale = spring({
              frame: frame - userFrame,
              fps,
              config: { damping: 12, mass: 0.5 },
            });
            const uOpacity = interpolate(frame, [userFrame, userFrame + 10], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            // "+$5" float-up animation
            const tagFrame = userFrame;
            const tagY = interpolate(frame, [tagFrame, tagFrame + 28], [0, -68], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: easeOut,
            });
            const tagOpacity = interpolate(
              frame,
              [tagFrame, tagFrame + 8, tagFrame + 24, tagFrame + 32],
              [0, 1, 1, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );

            return (
              <div
                key={user.name}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  opacity: appeared ? uOpacity : 0,
                  transform: `scale(${appeared ? uScale : 0})`,
                  position: 'relative',
                }}
              >
                {/* "+$5" floating tag */}
                {appeared && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -8,
                      left: '50%',
                      transform: `translateX(-50%) translateY(${tagY}px)`,
                      opacity: tagOpacity,
                      fontSize: 22,
                      fontWeight: 800,
                      color: GREEN,
                      textShadow: `0 0 16px ${GREEN}88`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    +${PRICE_PER_USER}/mo
                  </div>
                )}

                {/* Avatar */}
                <div
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    backgroundColor: user.color,
                    border: `3px solid rgba(255,255,255,0.15)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 40,
                    boxShadow: `0 8px 24px rgba(0,0,0,0.4), 0 0 0 2px ${user.color}44`,
                  }}
                >
                  {user.emoji}
                </div>

                {/* Name */}
                <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                  {user.name}
                </div>

                {/* Subscription badge */}
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#0f1419',
                    backgroundColor: GREEN,
                    padding: '4px 12px',
                    borderRadius: 20,
                  }}
                >
                  $5/mo
                </div>
              </div>
            );
          })}
        </div>

        {/* ── COVERED badge ── */}
        {frame >= COVERED_FRAME && (
          <div
            style={{
              transform: `scale(${coveredScale})`,
              opacity: coveredOpacity,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                backgroundColor: 'rgba(62,207,142,0.12)',
                border: `2px solid ${GREEN}`,
                borderRadius: 24,
                padding: '24px 60px',
                boxShadow: `0 0 60px rgba(62,207,142,0.25), 0 0 120px rgba(62,207,142,0.1)`,
              }}
            >
              <span style={{ fontSize: 44 }}>✅</span>
              <span
                style={{
                  fontSize: 52,
                  fontWeight: 900,
                  color: GREEN,
                  letterSpacing: '-0.02em',
                  textShadow: `0 0 40px ${GREEN}88`,
                }}
              >
                Pro Tier Covered
              </span>
            </div>
          </div>
        )}

        {/* ── Tagline ── */}
        {frame >= COVERED_FRAME + 25 && (
          <div
            style={{
              opacity: taglineOpacity,
              transform: `translateY(${taglineY}px)`,
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
              Just{' '}
            </span>
            <span style={{ fontSize: 28, color: '#ffffff', fontWeight: 700 }}>
              5 paying users at $5/mo
            </span>
            <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
              {' '}covers your entire Supabase Pro plan
            </span>
          </div>
        )}
      </div>

      </div>{/* end entrance wrapper */}

      {/* Bottom accent */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px',
        background: `linear-gradient(90deg, transparent, ${GREEN}77, transparent)`,
        opacity: fadeIn * 0.8,
      }} />
    </AbsoluteFill>
  );
};
