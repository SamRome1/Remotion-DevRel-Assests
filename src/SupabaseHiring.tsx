import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';

const GREEN = '#3ECF8E';
const DARK_BG = '#0f1419';
const CARD_BG = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(62,207,142,0.25)';

const ROLES = [
  { label: 'Engineering', icon: '⚙️' },
  { label: 'Sales', icon: '📈' },
  { label: 'Support', icon: '🎧' },
  { label: 'Marketing', icon: '📣' },
  { label: 'Legal', icon: '⚖️' },
];

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export const SupabaseHiring: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // ── Background gradient pulse ──────────────────────────────────────────────
  const bgPulse = 0.06 + 0.02 * Math.sin(frame * 0.04);

  // ── Scene 1: headline ──────────────────────────────────────────────────────
  // "WE'RE HIRING AT SUPABASE" drops in from top
  const headlineY = interpolate(
    spring({ frame: frame - 5, fps, config: { damping: 14, mass: 0.6 } }),
    [0, 1],
    [-120, 0]
  );
  const headlineOpacity = interpolate(frame, [5, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ── Scene 2: counter "30+" ─────────────────────────────────────────────────
  const counterRaw = interpolate(frame, [35, 65], [0, 30], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOut,
  });
  const counterValue = Math.round(counterRaw);
  const counterScale = spring({ frame: frame - 65, fps, config: { damping: 10, mass: 0.4 } });
  const counterOpacity = interpolate(frame, [30, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ── Scene 3: role badges ───────────────────────────────────────────────────
  const BADGE_START = 75;
  const BADGE_STEP = 14;

  // ── Scene 4: CTA ──────────────────────────────────────────────────────────
  const CTA_START = BADGE_START + ROLES.length * BADGE_STEP + 10;
  const ctaScale = spring({ frame: frame - CTA_START, fps, config: { damping: 12, mass: 0.5 } });
  const ctaOpacity = interpolate(frame, [CTA_START, CTA_START + 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ── Floating particles ─────────────────────────────────────────────────────
  const particles = Array.from({ length: 18 }, (_, i) => {
    const speed = 0.8 + (i % 4) * 0.3;
    const startY = (i * 70) % 1200;
    const x = 80 + (i * 117) % 1760;
    const y = (startY + frame * speed) % 1150;
    const size = 4 + (i % 3) * 3;
    const opacity = 0.08 + (i % 5) * 0.04;
    return { x, y, size, opacity };
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: DARK_BG,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Radial glow background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 70% 55% at 50% 40%, rgba(62,207,142,${bgPulse}) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: GREEN,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Top accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, transparent, ${GREEN}, transparent)`,
          opacity: interpolate(frame, [0, 20], [0, 0.7], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      />

      {/* Main layout */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 48,
          padding: '0 120px',
        }}
      >
        {/* ── HEADLINE ─────────────────────────────────────────────────────── */}
        <div
          style={{
            transform: `translateY(${headlineY}px)`,
            opacity: headlineOpacity,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: GREEN,
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            Supabase
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              textShadow: `0 0 60px rgba(62,207,142,0.3)`,
            }}
          >
            We're Hiring
          </div>
        </div>

        {/* ── COUNTER ──────────────────────────────────────────────────────── */}
        <div
          style={{
            opacity: counterOpacity,
            transform: `scale(${counterScale})`,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: 0,
              background: CARD_BG,
              border: `2px solid ${BORDER}`,
              borderRadius: 24,
              padding: '28px 60px',
            }}
          >
            <span
              style={{
                fontSize: 110,
                fontWeight: 900,
                color: GREEN,
                lineHeight: 1,
                textShadow: `0 0 40px rgba(62,207,142,0.5)`,
              }}
            >
              {counterValue}
            </span>
            <span
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: GREEN,
                lineHeight: 1,
                opacity: frame >= 65 ? 1 : 0,
              }}
            >
              +
            </span>
            <span
              style={{
                fontSize: 32,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.6)',
                marginLeft: 20,
                alignSelf: 'flex-end',
                paddingBottom: 14,
              }}
            >
              open positions
            </span>
          </div>
        </div>

        {/* ── ROLE BADGES ──────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 20,
            justifyContent: 'center',
            maxWidth: 1200,
          }}
        >
          {ROLES.map((role, i) => {
            const badgeFrame = frame - (BADGE_START + i * BADGE_STEP);
            const badgeScale = spring({ frame: badgeFrame, fps, config: { damping: 12, mass: 0.4 } });
            const badgeOpacity = interpolate(badgeFrame, [0, 12], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <div
                key={role.label}
                style={{
                  transform: `scale(${badgeScale})`,
                  opacity: badgeOpacity,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: CARD_BG,
                  border: `1.5px solid ${BORDER}`,
                  borderRadius: 50,
                  padding: '18px 36px',
                  fontSize: 26,
                  fontWeight: 600,
                  color: '#ffffff',
                }}
              >
                <span style={{ fontSize: 28 }}>{role.icon}</span>
                {role.label}
              </div>
            );
          })}
        </div>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <div
          style={{
            opacity: ctaOpacity,
            transform: `scale(${ctaScale})`,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 30,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 24,
            }}
          >
            Whatever your background — there's a role for you.
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 16,
              backgroundColor: GREEN,
              borderRadius: 16,
              padding: '24px 56px',
              fontSize: 32,
              fontWeight: 700,
              color: '#0f1419',
              boxShadow: `0 0 40px rgba(62,207,142,0.4), 0 4px 20px rgba(0,0,0,0.4)`,
              letterSpacing: '-0.01em',
            }}
          >
            <span>Check Our Careers Page</span>
            <span style={{ fontSize: 30 }}>→</span>
          </div>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, transparent, ${GREEN}, transparent)`,
          opacity: 0.4,
        }}
      />
    </AbsoluteFill>
  );
};
