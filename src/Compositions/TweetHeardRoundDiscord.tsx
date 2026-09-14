import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate, spring, random, Easing } from 'remotion';

// ─────────────────────────────────────────────────────────────────────────────
// "Tweet Heard Round Discord" — 1080×1920 vertical, 210 frames @ 30fps.
//
// Same visual world as TweetDestroysAgent (own palette, not tokens.ts): dark
// cinematic gradient (#0A0A0F → #12121A), electric-blue / teal accents, all
// action confined to the top 1080×960 safe area — the bottom half of the
// canvas is background gradient only. Tonal opposite of that scene: weight
// and stillness instead of chaos. No added text anywhere.
//
// ── ASSET NOTE ───────────────────────────────────────────────────────────────
// This scene renders a REAL screenshot via staticFile('tweet-screenshot.png').
// The tweet card chrome/avatar/name are NOT synthesized here — the screenshot
// itself is the whole card. public/tweet-screenshot.png now exists (600×239px,
// @steipete "Are we still talking loops or did we shift to graphs yet?"), and
// the constants below are tuned against that actual image. If the screenshot
// is ever swapped for a different crop/resolution, re-check HIGHLIGHT_*_PCT
// against the new image in the studio preview around frame 150 (sweep fully
// revealed) before trusting it.
// ─────────────────────────────────────────────────────────────────────────────

const FPS = 30;

// ── Layout ───────────────────────────────────────────────────────────────────
const SAFE_W = 1080;
const SAFE_H = 960;
const CENTER_X = SAFE_W / 2;
const CENTER_Y = SAFE_H / 2;

// Rendered width of the tweet screenshot, in px. Height is derived
// automatically from the image's native aspect ratio (width-only sizing) —
// do not set an explicit height, or it will distort. At the real image's
// 600×239 native aspect ratio, 760px wide renders ~303px tall.
const TWEET_WIDTH = 760;

// Highlight/underline region, expressed as PERCENTAGES of the rendered image
// box (0–100 each), so the reveal stays correctly positioned regardless of
// scale. Pixel-measured (not estimated) against the real 600×239
// public/tweet-screenshot.png: the text line "Are we still talking loops or
// did we shift to graphs yet?" occupies x 15–435px, y 86–102px, with a few px
// of padding added. Re-measure if the screenshot is re-cropped or replaced.
const HIGHLIGHT_TOP_PCT = 34.5;
const HIGHLIGHT_LEFT_PCT = 1.7;
const HIGHLIGHT_WIDTH_PCT = 72;
const HIGHLIGHT_HEIGHT_PCT = 10;

// ── Palette (same world as TweetDestroysAgent — not tokens.ts) ─────────────
const BG_TOP = '#0A0A0F';
const BG_BOTTOM = '#12121A';
const TEAL_RGB = '20, 184, 166';
const BLUE_RGB = '59, 130, 246';

// ── Timeline (frames @ 30fps) ───────────────────────────────────────────────
const ENTRANCE_START = 20;
const ENTRANCE_END = 65;
const BREATH_START = 65;
const BREATH_END = 120;
const SWEEP_START = 120;
const SWEEP_END = 160;
const ZOOM_START = 160;
const ZOOM_END = 190;

const PARTICLE_COUNT = 36;

// Clamped interpolate — the default for this file.
const itp = (
  frame: number,
  inputRange: number[],
  outputRange: number[],
  easing?: (input: number) => number,
): number =>
  interpolate(frame, inputRange, outputRange, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    ...(easing ? { easing } : {}),
  });

// ── Deterministic ambient particles / grain (seeded via remotion's random(), no Math.random) ──
interface Particle {
  baseX: number;
  baseY: number;
  driftRangeX: number;
  driftRangeY: number;
  driftSpeedX: number;
  driftSpeedY: number;
  phase: number;
  size: number;
  baseOpacity: number;
  twinkleSpeed: number;
}

function buildParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    baseX: random(`p-x-${i}`) * SAFE_W,
    baseY: random(`p-y-${i}`) * SAFE_H,
    driftRangeX: 6 + random(`p-drx-${i}`) * 14,
    driftRangeY: 6 + random(`p-dry-${i}`) * 14,
    driftSpeedX: 0.01 + random(`p-dsx-${i}`) * 0.02,
    driftSpeedY: 0.008 + random(`p-dsy-${i}`) * 0.018,
    phase: random(`p-ph-${i}`) * Math.PI * 2,
    size: 1.5 + random(`p-sz-${i}`) * 2.5,
    baseOpacity: 0.03 + random(`p-op-${i}`) * 0.07,
    twinkleSpeed: 0.03 + random(`p-tw-${i}`) * 0.04,
  }));
}

const PARTICLES: Particle[] = buildParticles(PARTICLE_COUNT);

export const TweetHeardRoundDiscord: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Entrance: one soft spring drives scale, upward drift, opacity, and shadow together ──
  const entranceSpring =
    frame >= ENTRANCE_START
      ? spring({
          frame: frame - ENTRANCE_START,
          fps: FPS,
          config: { damping: 20, stiffness: 120, mass: 0.9 },
          durationInFrames: ENTRANCE_END - ENTRANCE_START,
        })
      : 0;
  const entranceProgress = itp(entranceSpring, [0, 1], [0, 1]); // clamp any tiny overshoot
  const entranceScale = interpolate(entranceProgress, [0, 1], [0.85, 1]);
  const entranceTranslateY = interpolate(entranceProgress, [0, 1], [20, 0]);
  const entranceOpacity = entranceProgress;
  const shadowIntensity = entranceProgress;

  // ── Breathing loop: one slow scale bump across 65 → 120, then flat ─────────
  const breathT = itp(frame, [BREATH_START, BREATH_END], [0, 1]);
  const breathScale = 1 + Math.sin(breathT * Math.PI) * 0.015;

  // ── Border glow: a single slow pulse pass over the same window ────────────
  const glowT = itp(frame, [BREATH_START, BREATH_END], [0, 1]);
  const glowOpacity = Math.sin(glowT * Math.PI) * 0.35;

  // ── Highlight sweep: left → right reveal under the text line, read-aloud pace ──
  const sweepT = itp(frame, [SWEEP_START, SWEEP_END], [0, 1], Easing.inOut(Easing.cubic));
  const insetRight = interpolate(sweepT, [0, 1], [100, 0]);
  const highlightVisible = frame >= SWEEP_START;

  // ── Subtle whole-card zoom, 160 → 190 (can't scale just the text inside a bitmap) ──
  const zoomT = itp(frame, [ZOOM_START, ZOOM_END], [0, 1], Easing.inOut(Easing.cubic));
  const zoomScale = interpolate(zoomT, [0, 1], [1, 1.05]);

  const totalScale = entranceScale * breathScale * zoomScale;

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BG_TOP} 0%, ${BG_BOTTOM} 100%)`, overflow: 'hidden' }}>
      {/* Safe area — all action confined to the top 1080×960. Left un-clipped
          (no overflow:hidden) so an oversized real screenshot is obviously
          wrong rather than silently cropped before TWEET_WIDTH is tuned. */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: SAFE_W, height: SAFE_H }}>
        {/* Ambient drifting particles / grain — runs the whole scene, low opacity */}
        {PARTICLES.map((p, i) => {
          const x = p.baseX + Math.sin(frame * p.driftSpeedX + p.phase) * p.driftRangeX;
          const y = p.baseY + Math.cos(frame * p.driftSpeedY + p.phase) * p.driftRangeY;
          const twinkle = 0.6 + 0.4 * Math.sin(frame * p.twinkleSpeed + p.phase);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                background: '#FFFFFF',
                opacity: p.baseOpacity * twinkle,
              }}
            />
          );
        })}

        {/* Tweet screenshot card — centered via translate(-50%,-50%) rather than
            fixed pixel offsets because the image's height is intentionally
            left auto (unknown until the real screenshot loads). */}
        <div
          style={{
            position: 'absolute',
            left: CENTER_X,
            top: CENTER_Y + entranceTranslateY,
            width: TWEET_WIDTH,
            transform: `translate(-50%, -50%) scale(${totalScale})`,
            opacity: entranceOpacity,
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              borderRadius: 20,
              boxShadow: `0 ${10 + shadowIntensity * 20}px ${30 + shadowIntensity * 40}px rgba(0,0,0,${0.35 + shadowIntensity * 0.25}), 0 0 ${glowOpacity * 55}px rgba(${TEAL_RGB}, ${glowOpacity * 0.6}), 0 0 ${glowOpacity * 30}px rgba(${BLUE_RGB}, ${glowOpacity * 0.3})`,
            }}
          >
            {/* The screenshot IS the tweet — no synthesized chrome/avatar/name */}
            <Img
              src={staticFile('tweet-screenshot.png')}
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
                borderRadius: 20,
              }}
            />

            {/* Highlight / underline sweep, positioned by HIGHLIGHT_*_PCT — tune once the real screenshot is in */}
            {highlightVisible && (
              <div
                style={{
                  position: 'absolute',
                  top: `${HIGHLIGHT_TOP_PCT}%`,
                  left: `${HIGHLIGHT_LEFT_PCT}%`,
                  width: `${HIGHLIGHT_WIDTH_PCT}%`,
                  height: `${HIGHLIGHT_HEIGHT_PCT}%`,
                  borderRadius: 8,
                  background: `linear-gradient(90deg, rgba(${TEAL_RGB}, 0.28), rgba(${BLUE_RGB}, 0.22))`,
                  boxShadow: `0 0 16px rgba(${TEAL_RGB}, 0.3)`,
                  clipPath: `inset(0 ${insetRight}% 0 0)`,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
