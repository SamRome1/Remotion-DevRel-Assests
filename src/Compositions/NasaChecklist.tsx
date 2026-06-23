import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion';

// ─── Colors ───────────────────────────────────────────────────────────────────

const BG = '#060a10';
const GREEN = '#3ECF8E';
const WHITE = '#ffffff';
const BLUE = '#3B82F6';
const DIM = 'rgba(255,255,255,0.35)';

// ─── Scene 1 timing ───────────────────────────────────────────────────────────

const S1_ORBIT_DRAW_START = 0;
const S1_ORBIT_DRAW_END = 70;
const S1_ROCKET_SCALE_START = 10;
const S1_ROCKET_SCALE_END = 35;
const S1_FADE_OUT_START = 110;
const S1_FADE_OUT_END = 130;

// ─── Scene 2 timing ───────────────────────────────────────────────────────────

const S2_FADE_IN_START = 120;
const S2_FADE_IN_END = 140;
const S2_SCREEN_FADE_START = 130;
const S2_SCREEN_FADE_END = 155;
const S2_BARS_START = 145;
const S2_BARS_END = 175;
const S2_ENGINEERS_START = 130;
const S2_DOTS_START = 200;

// ─── Scene 3 timing ───────────────────────────────────────────────────────────

const S3_WIPE_START = 255;
const S3_WIPE_END = 270;
const S3_CARD_FADE_START = 260;
const S3_CARD_FADE_END = 280;
const S3_CURSORS_START = 265;

const CHECK_FRAMES = [285, 310, 335, 358, 378, 400] as const;

// ─── Layout constants ─────────────────────────────────────────────────────────

const ROCKET_CX = 540;
const ROCKET_CY = 600;

const CARD_X = 110;
const CARD_Y = 270;
const CARD_W = 860;
const CARD_H = 1200;

const ROW_START_Y = 400;
const ROW_SPACING = 120;

const CHECKBOX_X = 130;
const LABEL_X = 210;
const PILL_X = 710;

const CHECKLIST_LABELS = ['COMMS', 'FUEL SYS', 'ABORT CHK', 'GUIDANCE', 'THERMAL', 'RANGE SAFE'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 43758.5453;
  return x - Math.floor(x);
}

function clamp(
  frame: number,
  inputRange: [number, number],
  outputRange: [number, number],
  easing?: (t: number) => number
): number {
  return interpolate(frame, inputRange, outputRange, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
}

// ─── NASA Meatball Logo ───────────────────────────────────────────────────────

const NasaLogo: React.FC<{
  cx: number; cy: number; r: number; opacity?: number; s?: number;
}> = ({ cx, cy, r, opacity = 1, s = 1 }) => {
  const id = 'nasaLogoClip';
  const pts = (coords: number[][]) =>
    coords.map(([dx, dy]) => `${cx + dx * r},${cy + dy * r}`).join(' ');

  return (
    <g
      transform={`translate(${cx},${cy}) scale(${s}) translate(${-cx},${-cy})`}
      opacity={opacity}
    >
      <defs>
        <clipPath id={id}>
          <circle cx={cx} cy={cy} r={r * 0.98} />
        </clipPath>
      </defs>
      {/* Blue sphere */}
      <circle cx={cx} cy={cy} r={r} fill="#0B3D91" />
      {/* Upper red chevron */}
      <polygon
        points={pts([[-0.05,-0.62],[0.86,-0.16],[0.80,0.07],[-0.12,-0.40]])}
        fill="#FC3D21"
        clipPath={`url(#${id})`}
      />
      {/* Lower red chevron */}
      <polygon
        points={pts([[-0.08,0.32],[0.80,0.78],[0.70,0.95],[-0.18,0.52]])}
        fill="#FC3D21"
        clipPath={`url(#${id})`}
      />
      {/* White orbital arc */}
      <ellipse
        cx={cx} cy={cy} rx={r * 0.92} ry={r * 0.27}
        fill="none" stroke={WHITE} strokeWidth={r * 0.07}
        transform={`rotate(-30,${cx},${cy})`}
        clipPath={`url(#${id})`}
      />
      {/* NASA text */}
      <text
        x={cx} y={cy + r * 0.18}
        textAnchor="middle"
        fill={WHITE}
        fontSize={r * 0.50}
        fontWeight="900"
        fontFamily="'Arial Black', Impact, Arial, sans-serif"
      >
        NASA
      </text>
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={WHITE} strokeWidth={r * 0.035} />
    </g>
  );
};

// ─── Starfield (persistent across all scenes) ─────────────────────────────────

const Starfield: React.FC<{ frame: number }> = ({ frame }) => {
  const STAR_COUNT = 120;
  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: 'absolute', top: 0, left: 0 }}
      viewBox="0 0 1080 1920"
    >
      {Array.from({ length: STAR_COUNT }).map((_, i) => {
        const cx = seededRandom(i * 3) * 1080;
        const cy = seededRandom(i * 3 + 1) * 1920;
        const r = 0.8 + seededRandom(i * 3 + 2) * 2.2;
        const opacity = 0.3 + 0.5 * Math.abs(Math.sin(frame * 0.04 + seededRandom(i) * Math.PI * 2));
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill={WHITE}
            opacity={opacity}
          />
        );
      })}
    </svg>
  );
};

// ─── Scene 1 ──────────────────────────────────────────────────────────────────

const Scene1: React.FC<{ frame: number }> = ({ frame }) => {
  // Orbit ring draw-in
  const orbitDash = clamp(
    frame,
    [S1_ORBIT_DRAW_START, S1_ORBIT_DRAW_END],
    [2200, 0],
    Easing.out(Easing.cubic)
  );
  const orbitOpacity = clamp(frame, [S1_FADE_OUT_START, S1_FADE_OUT_END], [1, 0]);

  // NASA logo scale
  const logoScale = clamp(
    frame,
    [S1_ROCKET_SCALE_START, S1_ROCKET_SCALE_END],
    [0, 1],
    Easing.out(Easing.back(1.4))
  );
  const logoOpacity = clamp(frame, [S1_FADE_OUT_START, S1_FADE_OUT_END], [1, 0]);

  // Orbit dot — rotate unrotated ellipse point by -20° to match the tilted ellipse
  const dotAngle = (frame / 120) * Math.PI * 2;
  const TILT = -20 * Math.PI / 180;
  const ux = 340 * Math.cos(dotAngle);
  const uy = 120 * Math.sin(dotAngle);
  const dotX = ROCKET_CX + ux * Math.cos(TILT) - uy * Math.sin(TILT);
  const dotY = ROCKET_CY + ux * Math.sin(TILT) + uy * Math.cos(TILT);
  const dotOpacity = clamp(frame, [S1_FADE_OUT_START, S1_FADE_OUT_END], [1, 0]);

  // Scene fade-out overlay
  const fadeOut = clamp(frame, [S1_FADE_OUT_START, S1_FADE_OUT_END], [0, 1]);

  return (
    <>
      <svg
        width={1080}
        height={1920}
        style={{ position: 'absolute', top: 0, left: 0 }}
        viewBox="0 0 1080 1920"
      >
        {/* Orbit ring */}
        <ellipse
          cx={ROCKET_CX}
          cy={ROCKET_CY}
          rx={340}
          ry={120}
          fill="none"
          stroke={WHITE}
          strokeOpacity={0.12}
          strokeWidth={1.5}
          strokeDasharray="2200"
          strokeDashoffset={orbitDash}
          transform={`rotate(-20, ${ROCKET_CX}, ${ROCKET_CY})`}
          opacity={orbitOpacity}
        />

        {/* Orbit dot */}
        {frame >= 10 && (
          <circle
            cx={dotX}
            cy={dotY}
            r={7}
            fill={GREEN}
            opacity={dotOpacity}
          />
        )}

        {/* NASA meatball logo */}
        {frame >= S1_ROCKET_SCALE_START && (
          <NasaLogo
            cx={ROCKET_CX}
            cy={ROCKET_CY}
            r={130}
            opacity={logoOpacity}
            s={logoScale}
          />
        )}

        {/* Fade to black */}
        {frame >= S1_FADE_OUT_START && (
          <rect x={0} y={0} width={1080} height={1920} fill={BG} opacity={fadeOut} />
        )}
      </svg>

    </>
  );
};

// ─── Scene 2 ──────────────────────────────────────────────────────────────────

const Scene2: React.FC<{ frame: number }> = ({ frame }) => {
  const fadeIn = clamp(frame, [S2_FADE_IN_START, S2_FADE_IN_END], [0, 1]);
  const screenOpacity = clamp(frame, [S2_SCREEN_FADE_START, S2_SCREEN_FADE_END], [0, 1]);

  // Scanline
  const scanY = 130 + ((frame * 3) % 550);

  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: 'absolute', top: 0, left: 0 }}
      viewBox="0 0 1080 1920"
      opacity={fadeIn}
    >
      {/* Desk lines */}
      <line x1={80} y1={1270} x2={1000} y2={1270} stroke="rgba(255,255,255,0.15)" strokeWidth={2} />
      <line x1={80} y1={1440} x2={1000} y2={1440} stroke="rgba(255,255,255,0.15)" strokeWidth={2} />
      <line x1={80} y1={1610} x2={1000} y2={1610} stroke="rgba(255,255,255,0.15)" strokeWidth={2} />

      {/* 30 engineer silhouettes — 3 rows of 10 */}
      {Array.from({ length: 30 }).map((_, i) => {
        const row = Math.floor(i / 10);
        const col = i % 10;
        const rowY = [1350, 1530, 1700][row];
        const px = 120 + col * ((960 - 120) / 9);

        const spawnFrame = S2_ENGINEERS_START + row * 12 + col * 3;
        const elapsed = Math.max(0, frame - spawnFrame);
        const personScale = elapsed <= 0
          ? 0
          : clamp(elapsed, [0, 15], [0, 1], Easing.out(Easing.back(1.2)));

        // Attention dot (frames 200–260)
        const dotOpacity =
          frame >= S2_DOTS_START
            ? clamp(frame, [S2_DOTS_START + i, S2_DOTS_START + i + 8], [0, 1]) *
              (0.7 + 0.3 * Math.sin(frame * 0.2 + i * 0.5))
            : 0;

        return (
          <g
            key={i}
            transform={`translate(${px}, ${rowY}) scale(${personScale}) translate(${-px}, ${-rowY})`}
          >
            {/* Monitor */}
            <rect
              x={px - 14}
              y={rowY - 56}
              width={28}
              height={20}
              rx={3}
              fill="rgba(62,207,142,0.15)"
              stroke={GREEN}
              strokeWidth={1}
            />

            {/* Person body */}
            <circle cx={px} cy={rowY - 18} r={18} fill="rgba(255,255,255,0.7)" />
            <rect
              x={px - 16}
              y={rowY + 2}
              width={32}
              height={40}
              rx={8}
              fill="rgba(255,255,255,0.7)"
            />

            {/* Status dot */}
            {frame >= S2_DOTS_START && (
              <circle
                cx={px}
                cy={rowY - 42}
                r={5}
                fill={GREEN}
                opacity={dotOpacity}
              />
            )}
          </g>
        );
      })}

      {/* Large mission screen frame */}
      <g opacity={screenOpacity}>
        <rect
          x={100}
          y={100}
          width={880}
          height={600}
          rx={24}
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={2}
        />

        {/* Status bars */}
        {Array.from({ length: 6 }).map((_, i) => {
          const barW = (0.3 + seededRandom(i * 7 + 5) * 0.6) * 780;
          const barY = 160 + i * 70;
          const barStart = S2_BARS_START + i * 8;
          const barEnd = S2_BARS_END + i * 8;
          const animW = clamp(frame, [barStart, barEnd], [0, barW]);
          const barColor = i % 2 === 0 ? GREEN : BLUE;
          return (
            <rect
              key={i}
              x={150}
              y={barY}
              width={animW}
              height={16}
              rx={6}
              fill={barColor}
              opacity={0.6}
            />
          );
        })}

        {/* Scanline */}
        <line
          x1={100}
          y1={scanY}
          x2={980}
          y2={scanY}
          stroke={GREEN}
          strokeOpacity={0.08}
          strokeWidth={1}
        />
      </g>
    </svg>
  );
};

// ─── Scene 3 ──────────────────────────────────────────────────────────────────

const Scene3: React.FC<{ frame: number }> = ({ frame }) => {
  const cardOpacity = clamp(frame, [S3_CARD_FADE_START, S3_CARD_FADE_END], [0, 1]);

  // Horizontal wipe (white line sweeps top to bottom)
  const wipeY = clamp(frame, [S3_WIPE_START, S3_WIPE_END], [0, 1920]);

  // Cursor configurations
  const cursors = [
    { color: '#60A5FA', baseX: 260, baseY: 420, freqX: 0.07, freqY: 0.05, ampX: 30, ampY: 15, phaseX: 1.2, phaseY: 0.8, spawnFrame: S3_CURSORS_START },
    { color: '#F472B6', baseX: 680, baseY: 660, freqX: 0.06, freqY: 0.08, ampX: 25, ampY: 20, phaseX: 2.1, phaseY: 1.5, spawnFrame: S3_CURSORS_START + 10 },
    { color: '#34D399', baseX: 180, baseY: 780, freqX: 0.09, freqY: 0.06, ampX: 20, ampY: 18, phaseX: 0.5, phaseY: 3.1, spawnFrame: S3_CURSORS_START + 18 },
    { color: '#FBBF24', baseX: 760, baseY: 540, freqX: 0.05, freqY: 0.07, ampX: 35, ampY: 12, phaseX: 1.8, phaseY: 2.4, spawnFrame: S3_CURSORS_START + 26 },
  ];

  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: 'absolute', top: 0, left: 0 }}
      viewBox="0 0 1080 1920"
    >
      {/* Wipe: mask unrevealed bottom portion during transition */}
      {frame >= S3_WIPE_START && frame <= S3_WIPE_END && (
        <>
          <line
            x1={0}
            y1={wipeY}
            x2={1080}
            y2={wipeY}
            stroke={WHITE}
            strokeWidth={2}
          />
          <rect x={0} y={wipeY} width={1080} height={Math.max(0, 1920 - wipeY)} fill={BG} opacity={1} />
        </>
      )}

      {/* Checklist card */}
      <g opacity={cardOpacity}>
        <rect
          x={CARD_X}
          y={CARD_Y}
          width={CARD_W}
          height={CARD_H}
          rx={28}
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1.5}
        />

        {/* LIVE indicator */}
        <circle
          cx={CARD_X + 36}
          cy={CARD_Y + 44}
          r={6}
          fill={GREEN}
          opacity={0.6 + 0.4 * Math.abs(Math.sin(frame * 0.15))}
        />
        <text
          x={CARD_X + 52}
          y={CARD_Y + 44}
          fontSize={24}
          fill={GREEN}
          fontWeight={700}
          dominantBaseline="middle"
          fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        >
          LIVE
        </text>

        {/* Checklist rows */}
        {CHECKLIST_LABELS.map((label, i) => {
          const rowY = ROW_START_Y + i * ROW_SPACING;
          const checkFrame = CHECK_FRAMES[i];
          const isChecked = frame >= checkFrame;
          const elapsed = isChecked ? frame - checkFrame : 0;

          // Row highlight flash
          const flashOpacity = isChecked && elapsed < 20
            ? clamp(elapsed, [0, 20], [0.15, 0])
            : 0;

          // Checkbox pop scale
          const boxScale = isChecked
            ? 1 + 0.2 * Math.max(0, 1 - elapsed / 10)
            : 1;

          // Checkmark dash animation
          const checkDashOffset = isChecked
            ? clamp(elapsed, [0, 12], [60, 0])
            : 60;

          // Checkbox center
          const boxCX = CHECKBOX_X + 22;
          const boxCY = rowY;

          return (
            <g key={i}>
              {/* Row flash highlight */}
              {flashOpacity > 0 && (
                <rect
                  x={CARD_X + 8}
                  y={rowY - 36}
                  width={CARD_W - 16}
                  height={72}
                  rx={12}
                  fill={GREEN}
                  opacity={flashOpacity}
                />
              )}

              {/* Checkbox */}
              <rect
                x={boxCX - 22}
                y={boxCY - 22}
                width={44}
                height={44}
                rx={10}
                fill={isChecked ? GREEN : 'none'}
                stroke={isChecked ? GREEN : 'rgba(255,255,255,0.35)'}
                strokeWidth={2}
                transform={`scale(${boxScale}) translate(${boxCX * (1 - boxScale)}, ${boxCY * (1 - boxScale)})`}
                style={{ transformOrigin: `${boxCX}px ${boxCY}px` }}
              />

              {/* Checkmark */}
              {isChecked && (
                <polyline
                  points={`${boxCX - 10},${boxCY} ${boxCX - 2},${boxCY + 8} ${boxCX + 12},${boxCY - 8}`}
                  fill="none"
                  stroke={WHITE}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="60"
                  strokeDashoffset={checkDashOffset}
                />
              )}

              {/* Row label */}
              <text
                x={LABEL_X}
                y={rowY}
                fontSize={36}
                fill={WHITE}
                fontWeight={600}
                dominantBaseline="middle"
                fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                letterSpacing="2"
              >
                {label}
              </text>

              {/* Status pill */}
              <rect
                x={PILL_X}
                y={rowY - 18}
                width={120}
                height={36}
                rx={16}
                fill={isChecked ? GREEN : 'rgba(255,255,255,0.08)'}
              />
              <text
                x={PILL_X + 60}
                y={rowY}
                fontSize={20}
                fill={isChecked ? BG : DIM}
                fontWeight={700}
                dominantBaseline="middle"
                textAnchor="middle"
                fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
              >
                {isChecked ? 'OK' : '---'}
              </text>
            </g>
          );
        })}
      </g>

      {/* Live cursors */}
      {cursors.map((cursor, i) => {
        if (frame < cursor.spawnFrame) return null;
        const spawnElapsed = frame - cursor.spawnFrame;
        const cursorOpacity = clamp(spawnElapsed, [0, 10], [0, 1]);

        const cx = cursor.baseX + Math.sin(frame * cursor.freqX + cursor.phaseX) * cursor.ampX;
        const cy = cursor.baseY + Math.cos(frame * cursor.freqY + cursor.phaseY) * cursor.ampY;

        return (
          <g key={i} transform={`translate(${cx}, ${cy})`} opacity={cursorOpacity}>
            {/* Label dot behind cursor */}
            <circle cx={4} cy={4} r={8} fill={cursor.color} opacity={0.5} />
            {/* Mouse cursor arrow */}
            <polygon
              points="0,0 0,16 4,12 8,20 11,18 7,10 12,10"
              fill={cursor.color}
              stroke={BG}
              strokeWidth={0.8}
            />
          </g>
        );
      })}

    </svg>
  );
};

// ─── Main Composition ─────────────────────────────────────────────────────────

export const NasaChecklist: React.FC = () => {
  const frame = useCurrentFrame();

  const isScene1 = frame < S2_FADE_IN_START;
  const isScene2 = frame >= S2_FADE_IN_START && frame < S3_WIPE_START;
  const isScene3 = frame >= S3_WIPE_START;

  return (
    <AbsoluteFill
      style={{
        background: BG,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Starfield persists across all scenes */}
      <Starfield frame={frame} />

      {isScene1 && <Scene1 frame={frame} />}
      {isScene2 && <Scene2 frame={frame} />}
      {isScene3 && <Scene3 frame={frame} />}
    </AbsoluteFill>
  );
};
