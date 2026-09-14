import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, random } from 'remotion';
import { Bot } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// "Tweet Destroys Agent" — 1080×1920 vertical, 120 frames @ 30fps.
//
// Deliberate deviation from the shared Supabase token system (tokens.ts):
// per explicit spec this scene uses its own palette — dark cinematic gradient
// background (#0A0A0F → #12121A) with an electric-blue / teal accent — not
// Supabase green. Everything else (Lucide icons, spring entrances, clamped
// interpolate, deterministic seeded randomness) follows house conventions.
//
// All action happens inside the top 1080×960 "safe area". The bottom half of
// the 1920-tall canvas is background gradient only — reserved as a clean cut
// point for whatever scene follows.
//
// No text/words anywhere — the tweet's content is represented purely by
// blurred placeholder shapes (avatar circle + rounded-rect lines).
// ─────────────────────────────────────────────────────────────────────────────

const FPS = 30;

// ── Layout ───────────────────────────────────────────────────────────────────
const SAFE_W = 1080;
const SAFE_H = 960;
const CENTER_X = SAFE_W / 2; // 540
const CENTER_Y = SAFE_H / 2; // 480

// ── Palette (own — not tokens.ts) ───────────────────────────────────────────
const BG_TOP = '#0A0A0F';
const BG_BOTTOM = '#12121A';
const AGENT_BLUE = '#3B82F6';
const TEAL = '#14B8A6';
const TWEET_BG = '#181D27';
const TWEET_BORDER = 'rgba(148, 163, 184, 0.16)';
const BLUR_FILL_STRONG = 'rgba(226, 232, 240, 0.16)';
const BLUR_FILL_SOFT = 'rgba(226, 232, 240, 0.09)';

// ── Timeline (frames @ 30fps) ───────────────────────────────────────────────
const DROP_START = 20;
const START_Y = -340;
const IMPACT_FRAME = 57;
const SHAKE_START = 55;
const SHAKE_END = 62;
const SHATTER_DURATION = 15; // shards active 57 → 72
const SHOCKWAVE_DURATION = 20; // ring active 57 → 77
const SETTLE_FRAME = 90;

const SHARD_COUNT = 8;

// Clamped interpolate — the default for this file.
const itp = (frame: number, inputRange: number[], outputRange: number[]): number =>
  interpolate(frame, inputRange, outputRange, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

// ── Deterministic shard geometry (seeded via remotion's random(), no Math.random()) ──
function shardClipPath(seed: number): string {
  const pointCount = 5 + Math.floor(random(`shard-pts-${seed}`) * 2); // 5–6 sided
  const pts: string[] = [];
  for (let p = 0; p < pointCount; p++) {
    const baseAngle = (p / pointCount) * 360;
    const jitter = (random(`shard-ang-${seed}-${p}`) - 0.5) * 34;
    const angle = ((baseAngle + jitter) * Math.PI) / 180;
    const radius = 34 + random(`shard-rad-${seed}-${p}`) * 26; // 34%–60%
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius;
    pts.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
  }
  return `polygon(${pts.join(', ')})`;
}

interface ShardParams {
  angle: number;
  distance: number;
  totalRotation: number;
  spinSign: 1 | -1;
  size: number;
  clipPath: string;
  blueMix: number;
}

function buildShards(count: number): ShardParams[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (random(`shard-a-${i}`) - 0.5) * 0.9;
    const distance = 130 + random(`shard-d-${i}`) * 250;
    const totalRotation = 160 + random(`shard-r-${i}`) * 520;
    const spinSign: 1 | -1 = random(`shard-s-${i}`) > 0.5 ? 1 : -1;
    const size = 34 + random(`shard-sz-${i}`) * 64;
    const blueMix = 90 + Math.round(random(`shard-sh-${i}`) * 90);
    return { angle, distance, totalRotation, spinSign, size, clipPath: shardClipPath(i), blueMix };
  });
}

const SHARDS: ShardParams[] = buildShards(SHARD_COUNT);

// X (Twitter) logo — lucide has no X mark, so inline the official glyph path.
const XLogo: React.FC<{ size: number; color: string; style?: React.CSSProperties }> = ({ size, color, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

export const TweetDestroysAgent: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Idle breathing loop — drives agent glow/scale and the tweet's settle pulse ──
  const breathe = Math.sin(frame / 14) * 0.5 + 0.5; // continuous, 0..1

  // ── Agent entrance pop-in ───────────────────────────────────────────────────
  const entrance = spring({ frame, fps: FPS, config: { damping: 18, stiffness: 130, mass: 0.8 } });
  const agentScale = interpolate(entrance, [0, 1], [0.85, 1]) * (1 + breathe * 0.025);
  const agentAlive = frame < IMPACT_FRAME;

  // ── Screen shake on impact (2–3px, quick decay) ────────────────────────────
  const shakeEnv = itp(frame, [SHAKE_START, SHAKE_START + 1, SHAKE_END], [0, 3, 0]);
  const shakeX = (random(`shakex-${frame}`) - 0.5) * 2 * shakeEnv;
  const shakeY = (random(`shakey-${frame}`) - 0.5) * 2 * shakeEnv;

  // ── Single-frame white flash — triangular so it reads as an instant pop, not a hold ──
  const flashOpacity = itp(frame, [IMPACT_FRAME - 1, IMPACT_FRAME, IMPACT_FRAME + 1], [0, 1, 0]);

  // ── Tweet fall: monotonic ease-in (gravity) up to contact, then a small ──────
  // spring recoil for the post-impact settle. Kept as two explicit phases
  // (rather than one continuous spring) so the "impact" is a single, clean
  // first contact rather than the natural multi-bounce oscillation a lone
  // underdamped spring would produce over this distance.
  const fallT = itp(frame, [DROP_START, IMPACT_FRAME], [0, 1]);
  const fallEase = fallT * fallT * fallT; // cubic ease-in
  // Note: this specific mapping is intentionally left unclamped (default
  // 'extend') so the spring recoil below can carry the value slightly past
  // CENTER_Y — clamping here would flatten the settle bounce.
  const preImpactY = interpolate(fallEase, [0, 1], [START_Y, CENTER_Y]);
  const recoil =
    frame >= IMPACT_FRAME
      ? spring({ frame: frame - IMPACT_FRAME, fps: FPS, config: { damping: 12, stiffness: 170, mass: 0.7 } })
      : 0;
  const bounceOffset = frame >= IMPACT_FRAME ? (1 - recoil) * 16 : 0;
  const tweetY = frame < IMPACT_FRAME ? preImpactY : CENTER_Y + bounceOffset;

  const tweetWobble = frame < IMPACT_FRAME ? Math.sin(frame * 0.6) * 6 * (1 - fallT) : 0;
  const tweetX = CENTER_X + tweetWobble;
  const tweetVisible = frame >= DROP_START;

  // ── Tweet settle glow: ramps in after impact, breathes once settled ────────
  const settleGlow = itp(frame, [IMPACT_FRAME, SETTLE_FRAME], [0.12, 0.5]);
  const settleBreathe = frame >= SETTLE_FRAME ? Math.sin((frame - SETTLE_FRAME) / 16) * 0.5 + 0.5 : 0;
  const tweetGlow = settleGlow + settleBreathe * 0.15;

  // ── Radial shockwave ring ───────────────────────────────────────────────────
  const shockActive = frame >= IMPACT_FRAME && frame <= IMPACT_FRAME + SHOCKWAVE_DURATION;
  const shockScale = itp(frame, [IMPACT_FRAME, IMPACT_FRAME + SHOCKWAVE_DURATION], [1, 3]);
  const shockOpacity = itp(frame, [IMPACT_FRAME, IMPACT_FRAME + SHOCKWAVE_DURATION], [0.6, 0]);

  // ── Agent shatter — angular shards fly outward, spin, shrink, and fade ────
  const shatterActive = frame >= IMPACT_FRAME && frame <= IMPACT_FRAME + SHATTER_DURATION;
  const shatterT = itp(frame, [IMPACT_FRAME, IMPACT_FRAME + SHATTER_DURATION], [0, 1]);
  const shatterEase = 1 - Math.pow(1 - shatterT, 3); // ease-out cubic

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BG_TOP} 0%, ${BG_BOTTOM} 100%)`, overflow: 'hidden' }}>
      {/* Shaken scene contents — confined to the top 1080×960 safe area */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: SAFE_W,
          height: SAFE_H,
          transform: `translate(${shakeX}px, ${shakeY}px)`,
        }}
      >
        {/* AI agent card */}
        {agentAlive && (
          <div
            style={{
              position: 'absolute',
              left: CENTER_X - 130,
              top: CENTER_Y - 130,
              width: 260,
              height: 260,
              borderRadius: 32,
              background: 'rgba(59, 130, 246, 0.08)',
              border: `1.5px solid rgba(59, 130, 246, ${0.35 + breathe * 0.35})`,
              boxShadow: `0 0 ${40 + breathe * 30}px rgba(59, 130, 246, ${0.22 + breathe * 0.2}), 0 10px 30px rgba(0,0,0,0.45)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${agentScale})`,
            }}
          >
            <Bot
              size={140}
              color={AGENT_BLUE}
              strokeWidth={1.5}
              style={{ filter: `drop-shadow(0 0 ${18 + breathe * 14}px rgba(59, 130, 246, 0.6))` }}
            />
          </div>
        )}

        {/* Shatter shards */}
        {shatterActive &&
          SHARDS.map((s, i) => {
            const dist = s.distance * shatterEase;
            const x = CENTER_X + Math.cos(s.angle) * dist;
            const y = CENTER_Y + Math.sin(s.angle) * dist;
            const rot = s.spinSign * s.totalRotation * shatterT;
            const scale = interpolate(shatterT, [0, 1], [1, 0.12]);
            const opacity = itp(shatterT, [0, 0.65, 1], [1, 0.9, 0]);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x - s.size / 2,
                  top: y - s.size / 2,
                  width: s.size,
                  height: s.size,
                  background: `linear-gradient(135deg, rgba(59,130,246,0.9), rgba(${s.blueMix - 30},${s.blueMix},246,0.5))`,
                  clipPath: s.clipPath,
                  boxShadow: '0 0 14px rgba(59,130,246,0.5)',
                  opacity,
                  transform: `rotate(${rot}deg) scale(${scale})`,
                }}
              />
            );
          })}

        {/* Radial shockwave ring */}
        {shockActive && (
          <div
            style={{
              position: 'absolute',
              left: CENTER_X - 140,
              top: CENTER_Y - 140,
              width: 280,
              height: 280,
              borderRadius: '50%',
              border: `2px solid ${TEAL}`,
              boxShadow: `0 0 40px rgba(20, 184, 166, ${shockOpacity * 0.6})`,
              opacity: shockOpacity,
              transform: `scale(${shockScale})`,
            }}
          />
        )}

        {/* Tweet card — X-style, all content represented by blurred placeholder shapes */}
        {tweetVisible && (
          <div
            style={{
              position: 'absolute',
              left: tweetX - 310,
              top: tweetY - 150,
              width: 620,
              height: 300,
              borderRadius: 26,
              background: TWEET_BG,
              border: `1px solid ${TWEET_BORDER}`,
              boxShadow: `0 20px 50px rgba(0,0,0,0.55), 0 0 ${tweetGlow * 60}px rgba(20, 184, 166, ${tweetGlow * 0.55})`,
              padding: '28px 32px',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 30%, #64748B, #2B3444)',
                  filter: 'blur(3px)',
                  flexShrink: 0,
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ width: 150, height: 14, borderRadius: 7, background: BLUR_FILL_STRONG, filter: 'blur(3px)' }} />
                <div style={{ width: 100, height: 11, borderRadius: 6, background: BLUR_FILL_SOFT, filter: 'blur(3px)' }} />
              </div>
              {/* Crisp X logo, top-right — the one unblurred element, so the card reads as a tweet */}
              <XLogo
                size={34}
                color="rgba(255,255,255,0.9)"
                style={{ marginLeft: 'auto', alignSelf: 'flex-start', flexShrink: 0 }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ width: '92%', height: 16, borderRadius: 8, background: BLUR_FILL_STRONG, filter: 'blur(3px)' }} />
              <div style={{ width: '78%', height: 16, borderRadius: 8, background: BLUR_FILL_STRONG, filter: 'blur(3px)' }} />
              <div style={{ width: '55%', height: 16, borderRadius: 8, background: BLUR_FILL_STRONG, filter: 'blur(3px)' }} />
            </div>
          </div>
        )}
      </div>

      {/* Full-canvas single-frame impact flash — outside the shaken container so it stays full-bleed */}
      <AbsoluteFill style={{ background: '#FFFFFF', opacity: flashOpacity, pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};
