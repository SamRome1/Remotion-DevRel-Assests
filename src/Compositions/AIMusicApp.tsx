import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion';

// ─── Constants ────────────────────────────────────────────────────────────────

const BG = '#0d1117';
const GREEN = '#3ECF8E';
const WHITE = '#ffffff';
const PURPLE = '#A855F7';
const PINK = '#EC4899';

const CX = 540;
const CY = 960;

// Scene 1 timing
const S1_COUNT_START = 10;
const S1_COUNT_END = 75;
const S1_ICONS_FADE = 20;
const S1_PULSE_START = 90;
const S1_PULSE_END = 130;
const S1_DOTS_SPAWN_START = 30;
const S1_DOTS_FADE_START = 100;
const S1_DOTS_FADE_END = 130;
const S1_COUNTER_FADE_START = 90;
const S1_COUNTER_FADE_END = 115;

// Scene 2 timing
const S2_START = 130;
const S2_CURTAIN_GROW_END = 145;
const S2_CURTAIN_EXIT_END = 160;
const S2_PHONE_FADE_START = 145;
const S2_PHONE_FADE_END = 165;
const S2_NOTES_START = 160;

const P1_TYPE_START = 168;
const P1_TYPE_END = 203;
const P1_HOLD_END = 230;
const P1_FADE_END = 240;
const P1_BURST = 205;

const P2_TYPE_START = 245;
const P2_TYPE_END = 265;
const P2_HOLD_END = 285;
const P2_FADE_END = 295;
const P2_BURST = 268;

const P3_TYPE_START = 300;
const P3_TYPE_END = 328;
const P3_HOLD_END = 360; // hold for ~1 second after fully typed
const P3_FADE_END = 373;
const P3_BURST = 318;

// Scene 3 timing
const S3_START = 368;
const S3_FLASH_END = 378;
const S3_BARS_START = 373;
const S3_PLAY_START = 398;
const S3_PLAY_END = 423;
const S3_NOTES_START = 368;

// Dot grid
const DOT_COLS = 20;
const DOT_ROWS = 10;
const DOT_COUNT = DOT_COLS * DOT_ROWS;
const GRID_MARGIN = 80;

// Phone UI
const PHONE_W = 780;
const PHONE_H = 1400;
const PHONE_X = CX - PHONE_W / 2;
const PHONE_Y = CY - PHONE_H / 2;

// Input box
const INPUT_W = 680;
const INPUT_H = 88;
const INPUT_X = CX - INPUT_W / 2;
const INPUT_Y = 1300;

// Waveform (inside phone)
const WAVE_Y_TOP = PHONE_Y + 200;
const WAVE_BAR_COUNT = 60;
const WAVE_BAR_W = 8;
const WAVE_BAR_GAP = 4;
const WAVE_TOTAL_W = WAVE_BAR_COUNT * (WAVE_BAR_W + WAVE_BAR_GAP) - WAVE_BAR_GAP;
const WAVE_START_X = CX - WAVE_TOTAL_W / 2;
const WAVE_MID_Y = WAVE_Y_TOP + 200;

// Full waveform (scene 3)
const FULL_BAR_COUNT = 80;
const FULL_BAR_W = 10;
const FULL_BAR_GAP = 3;
const FULL_TOTAL_W = FULL_BAR_COUNT * (FULL_BAR_W + FULL_BAR_GAP) - FULL_BAR_GAP;
const FULL_START_X = CX - FULL_TOTAL_W / 2;

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function fmt(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

// ─── Background grid ─────────────────────────────────────────────────────────

const BackgroundGrid: React.FC = () => (
  <svg
    width={1080}
    height={1920}
    style={{ position: 'absolute', top: 0, left: 0 }}
    viewBox="0 0 1080 1920"
  >
    <defs>
      <pattern id="amgrid" width={80} height={80} patternUnits="userSpaceOnUse">
        <path
          d="M 80 0 L 0 0 0 80"
          fill="none"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth={1}
        />
      </pattern>
    </defs>
    <rect width={1080} height={1920} fill="url(#amgrid)" />
  </svg>
);

// ─── Person silhouette icon ───────────────────────────────────────────────────

const PersonIcon: React.FC<{ cx: number; cy: number; size: number; color: string }> = ({
  cx,
  cy,
  size,
  color,
}) => {
  const headR = size * 0.22;
  const bodyH = size * 0.45;
  const bodyW = size * 0.28;
  const headCy = cy - size * 0.25;
  const bodyTop = headCy + headR + size * 0.04;
  return (
    <g>
      <circle cx={cx} cy={headCy} r={headR} fill={color} />
      <path
        d={`M ${cx - bodyW / 2} ${bodyTop + bodyH} Q ${cx - bodyW / 2} ${bodyTop} ${cx} ${bodyTop} Q ${cx + bodyW / 2} ${bodyTop} ${cx + bodyW / 2} ${bodyTop + bodyH} Z`}
        fill={color}
      />
    </g>
  );
};

// ─── Scene 1 ──────────────────────────────────────────────────────────────────

const Scene1: React.FC<{ frame: number }> = ({ frame }) => {
  // Counter
  const counterValue = clamp(frame, [S1_COUNT_START, S1_COUNT_END], [0, 1000000], Easing.out(Easing.cubic));
  const counterOpacity = clamp(frame, [S1_COUNTER_FADE_START, S1_COUNTER_FADE_END], [1, 0]);

  // Person icons row
  const iconsOpacity = clamp(frame, [S1_ICONS_FADE, S1_ICONS_FADE + 20], [0, 1]);

  // Dot grid
  const dotsGlobalOpacity = clamp(frame, [S1_DOTS_FADE_START, S1_DOTS_FADE_END], [1, 0.15]);

  // Pulse ring
  const pulseR = clamp(frame, [S1_PULSE_START, S1_PULSE_END], [0, 700]);
  const pulseOpacity = interpolate(
    frame,
    [S1_PULSE_START, S1_PULSE_START + 10, S1_PULSE_END - 10, S1_PULSE_END],
    [0, 0.4, 0.4, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Build dot data
  const cellW = (1080 - GRID_MARGIN * 2) / DOT_COLS;
  const cellH = (1920 - GRID_MARGIN * 2) / DOT_ROWS;

  return (
    <>
      {/* SVG layer: dots, pulse */}
      <svg
        width={1080}
        height={1920}
        style={{ position: 'absolute', top: 0, left: 0 }}
        viewBox="0 0 1080 1920"
      >
        {/* User dots */}
        <g opacity={dotsGlobalOpacity}>
          {Array.from({ length: DOT_COUNT }).map((_, i) => {
            const col = i % DOT_COLS;
            const row = Math.floor(i / DOT_COLS);
            const baseX = GRID_MARGIN + col * cellW + cellW / 2;
            const baseY = GRID_MARGIN + row * cellH + cellH / 2;
            const jx = (seededRandom(i * 3 + 0) - 0.5) * 30;
            const jy = (seededRandom(i * 3 + 1) - 0.5) * 30;
            const x = baseX + jx;
            const y = baseY + jy;

            const spawnFrame = S1_DOTS_SPAWN_START + i * 0.45;
            const elapsed = Math.max(0, frame - spawnFrame);
            const scale = elapsed <= 0
              ? 0
              : clamp(elapsed, [0, 12], [0, 1], Easing.out(Easing.back(1.5)));

            const color = i % 5 === 0 ? GREEN : 'rgba(255,255,255,0.55)';
            const opacity = i % 5 === 0 ? 0.9 : 0.6;

            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={5}
                fill={color}
                opacity={scale * opacity}
                transform={`scale(${scale})`}
                style={{ transformOrigin: `${x}px ${y}px` }}
              />
            );
          })}
        </g>

        {/* Pulse ring */}
        {frame >= S1_PULSE_START && (
          <circle
            cx={CX}
            cy={CY}
            r={pulseR}
            fill="none"
            stroke={GREEN}
            strokeWidth={3}
            opacity={pulseOpacity}
          />
        )}

        {/* Person icons */}
        {frame >= S1_ICONS_FADE && (
          <g opacity={iconsOpacity * counterOpacity}>
            {[-72, -36, 0, 36, 72].map((offset, i) => (
              <PersonIcon
                key={i}
                cx={CX + offset}
                cy={780}
                size={28}
                color={GREEN}
              />
            ))}
          </g>
        )}
      </svg>

      {/* Counter number */}
      <div
        style={{
          position: 'absolute',
          top: 640,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: counterOpacity,
        }}
      >
        <span
          style={{
            color: WHITE,
            fontSize: 180,
            fontWeight: 800,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            letterSpacing: '-6px',
            lineHeight: 1,
          }}
        >
          {fmt(counterValue)}
        </span>
      </div>
    </>
  );
};

// ─── Music notes ─────────────────────────────────────────────────────────────

interface NoteConfig {
  spawnFrame: number;
  x: number;
  color: string;
  fontSize: number;
  floatHeight: number;
  driftAmp: number;
  driftFreq: number;
  driftPhase: number;
}

const FloatingNotes: React.FC<{ frame: number; notes: NoteConfig[] }> = ({ frame, notes }) => (
  <>
    {notes.map((n, i) => {
      const elapsed = frame - n.spawnFrame;
      if (elapsed < 0) return null;

      const totalDuration = 80;
      const progress = Math.min(elapsed / totalDuration, 1);
      const floatY = 1800 - progress * n.floatHeight;
      const driftX = n.x + Math.sin(elapsed * n.driftFreq + n.driftPhase) * n.driftAmp;

      const opacity =
        elapsed < 10
          ? elapsed / 10
          : elapsed > totalDuration - 15
          ? Math.max(0, (totalDuration - elapsed) / 15)
          : 1;

      return (
        <text
          key={i}
          x={driftX}
          y={floatY}
          fontSize={n.fontSize}
          fill={n.color}
          opacity={opacity}
          textAnchor="middle"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
        >
          ♪
        </text>
      );
    })}
  </>
);

// ─── Scene 2 ──────────────────────────────────────────────────────────────────

const Scene2: React.FC<{ frame: number }> = ({ frame }) => {
  // Curtain wipe
  const curtainH = clamp(frame, [S2_START, S2_CURTAIN_GROW_END], [0, 1920], Easing.inOut(Easing.quad));
  const curtainOffsetY = clamp(frame, [S2_CURTAIN_GROW_END, S2_CURTAIN_EXIT_END], [0, 1920], Easing.inOut(Easing.quad));

  // Phone opacity
  const phoneOpacity = clamp(frame, [S2_PHONE_FADE_START, S2_PHONE_FADE_END], [0, 1]);

  // Prompt 1
  const p1CharsRaw = clamp(frame, [P1_TYPE_START, P1_TYPE_END], [0, 29]);
  const p1Chars = Math.floor(p1CharsRaw);
  const p1Opacity =
    frame < P1_TYPE_START
      ? 0
      : frame <= P1_HOLD_END
      ? clamp(frame, [P1_TYPE_START, P1_TYPE_START + 8], [0, 1])
      : clamp(frame, [P1_HOLD_END, P1_FADE_END], [1, 0]);

  // Prompt 2
  const p2Text = 'moody jazz';
  const p2CharsRaw = clamp(frame, [P2_TYPE_START, P2_TYPE_END], [0, p2Text.length]);
  const p2Chars = Math.floor(p2CharsRaw);
  const p2Opacity =
    frame < P2_TYPE_START
      ? 0
      : frame <= P2_HOLD_END
      ? clamp(frame, [P2_TYPE_START, P2_TYPE_START + 8], [0, 1])
      : clamp(frame, [P2_HOLD_END, P2_FADE_END], [1, 0]);

  // Prompt 3
  const p3Text = 'opera in a shrek voice';
  const p3CharsRaw = clamp(frame, [P3_TYPE_START, P3_TYPE_END], [0, p3Text.length]);
  const p3Chars = Math.floor(p3CharsRaw);
  const p3Opacity =
    frame < P3_TYPE_START
      ? 0
      : frame <= P3_HOLD_END
      ? clamp(frame, [P3_TYPE_START, P3_TYPE_START + 8], [0, 1])
      : clamp(frame, [P3_HOLD_END, P3_FADE_END], [1, 0]);

  // Active prompt text and opacity
  let activeText = '';
  let activeOpacity = 0;
  let activeCursor = false;

  if (frame >= P3_TYPE_START) {
    activeText = p3Text.slice(0, p3Chars);
    activeOpacity = p3Opacity;
    activeCursor = frame <= P3_HOLD_END;
  } else if (frame >= P2_TYPE_START) {
    activeText = p2Text.slice(0, p2Chars);
    activeOpacity = p2Opacity;
    activeCursor = frame <= P2_HOLD_END;
  } else if (frame >= P1_TYPE_START) {
    const p1Text = 'a country song about your cat';
    activeText = p1Text.slice(0, p1Chars);
    activeOpacity = p1Opacity;
    activeCursor = frame <= P1_HOLD_END;
  }

  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  // Waveform burst: bars snap high on burst frames
  const isBurst =
    (frame >= P1_BURST && frame < P1_BURST + 8) ||
    (frame >= P2_BURST && frame < P2_BURST + 8) ||
    (frame >= P3_BURST && frame < P3_BURST + 8);

  // Floating notes config
  const noteColors = [GREEN, PURPLE, PINK];
  const scene2Notes: NoteConfig[] = Array.from({ length: 12 }).map((_, i) => ({
    spawnFrame: i * 14 + S2_NOTES_START,
    x: PHONE_X + 60 + seededRandom(i * 7 + 3) * (PHONE_W - 120),
    color: noteColors[i % 3],
    fontSize: 36,
    floatHeight: 600 + seededRandom(i * 5 + 1) * 300,
    driftAmp: 15 + seededRandom(i * 5 + 2) * 20,
    driftFreq: 0.06 + seededRandom(i * 5 + 4) * 0.04,
    driftPhase: seededRandom(i * 5 + 5) * Math.PI * 2,
  }));

  return (
    <>
      <svg
        width={1080}
        height={1920}
        style={{ position: 'absolute', top: 0, left: 0 }}
        viewBox="0 0 1080 1920"
      >
        {/* Phone frame */}
        <g opacity={phoneOpacity}>
          {/* Phone body */}
          <rect
            x={PHONE_X}
            y={PHONE_Y}
            width={PHONE_W}
            height={PHONE_H}
            rx={48}
            fill="rgba(255,255,255,0.03)"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth={1.5}
          />

          {/* Waveform bars */}
          {Array.from({ length: WAVE_BAR_COUNT }).map((_, i) => {
            const maxH = 60 + seededRandom(i * 3 + 7) * 120;
            const oscillate = Math.abs(Math.sin(frame * 0.12 + i * 0.4)) * maxH;
            const barH = isBurst ? maxH * (1 - clamp(frame - (frame >= P1_BURST && frame < P1_BURST + 8 ? P1_BURST : frame >= P2_BURST && frame < P2_BURST + 8 ? P2_BURST : P3_BURST), [0, 8], [0, 1])) + oscillate * clamp(frame - (frame >= P1_BURST && frame < P1_BURST + 8 ? P1_BURST : frame >= P2_BURST && frame < P2_BURST + 8 ? P2_BURST : P3_BURST), [0, 8], [0, 1]) : oscillate;
            const h = Math.max(4, barH);
            const bx = WAVE_START_X + i * (WAVE_BAR_W + WAVE_BAR_GAP);
            return (
              <rect
                key={i}
                x={bx}
                y={WAVE_MID_Y - h / 2}
                width={WAVE_BAR_W}
                height={h}
                rx={3}
                fill={GREEN}
                opacity={0.7}
              />
            );
          })}

          {/* Input box */}
          <rect
            x={INPUT_X}
            y={INPUT_Y - INPUT_H / 2}
            width={INPUT_W}
            height={INPUT_H}
            rx={20}
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={1.5}
          />

          {/* Prompt text inside input */}
          <text
            x={INPUT_X + 24}
            y={INPUT_Y + 12}
            fontSize={34}
            fill={WHITE}
            opacity={activeOpacity}
            fontFamily="'SF Mono', 'Courier New', monospace"
            dominantBaseline="middle"
          >
            {activeText}
            {activeCursor && cursorVisible ? '|' : ''}
          </text>
        </g>

        {/* Floating notes */}
        <FloatingNotes frame={frame} notes={scene2Notes} />

        {/* Curtain wipe */}
        {frame >= S2_START && frame <= S2_CURTAIN_EXIT_END + 5 && (
          <rect
            x={0}
            y={curtainOffsetY}
            width={1080}
            height={curtainH}
            fill={GREEN}
          />
        )}
      </svg>
    </>
  );
};

// ─── Scene 3 ──────────────────────────────────────────────────────────────────

const Scene3: React.FC<{ frame: number }> = ({ frame }) => {
  // White flash
  const flashOpacity = clamp(frame, [S3_START, S3_FLASH_END], [1, 0]);

  // Play button scale
  const playScale = clamp(
    frame,
    [S3_PLAY_START, S3_PLAY_END],
    [0, 1],
    Easing.out(Easing.back(1.3))
  );

  // Floating notes for scene 3
  const noteColors = [GREEN, PURPLE, PINK];
  const scene3Notes: NoteConfig[] = Array.from({ length: 8 }).map((_, i) => ({
    spawnFrame: S3_NOTES_START + i * 10,
    x: 120 + seededRandom(i * 9 + 6) * 840,
    color: noteColors[i % 3],
    fontSize: 60,
    floatHeight: 700 + seededRandom(i * 7 + 3) * 400,
    driftAmp: 20 + seededRandom(i * 7 + 4) * 30,
    driftFreq: 0.08 + seededRandom(i * 7 + 5) * 0.05,
    driftPhase: seededRandom(i * 7 + 6) * Math.PI * 2,
  }));

  return (
    <>
      <svg
        width={1080}
        height={1920}
        style={{ position: 'absolute', top: 0, left: 0 }}
        viewBox="0 0 1080 1920"
      >
        {/* Full waveform bars */}
        {Array.from({ length: FULL_BAR_COUNT }).map((_, i) => {
          const activeAt = S3_BARS_START + i * 0.6;
          if (frame < activeAt) return null;
          const barH = 80 + seededRandom(i + 200) * 180;
          const barOpacity = clamp(Math.max(0, frame - activeAt), [0, 12], [0, 1]);
          const bx = FULL_START_X + i * (FULL_BAR_W + FULL_BAR_GAP);
          const color = i < 27 ? PURPLE : i < 54 ? GREEN : PINK;
          return (
            <rect
              key={i}
              x={bx}
              y={CY - barH / 2}
              width={FULL_BAR_W}
              height={barH}
              rx={4}
              fill={color}
              opacity={barOpacity}
            />
          );
        })}

        {/* Play button */}
        {frame >= S3_PLAY_START && (
          <g
            transform={`translate(${CX}, ${CY}) scale(${playScale}) translate(${-CX}, ${-CY})`}
          >
            <circle
              cx={CX}
              cy={CY}
              r={90}
              fill="rgba(255,255,255,0.08)"
              stroke={WHITE}
              strokeWidth={2}
            />
            {/* Play triangle pointing right */}
            <polygon
              points={`${CX - 26},${CY - 36} ${CX - 26},${CY + 36} ${CX + 44},${CY}`}
              fill={WHITE}
            />
          </g>
        )}

        {/* Floating notes */}
        <FloatingNotes frame={frame} notes={scene3Notes} />

        {/* White flash */}
        {frame <= S3_FLASH_END && (
          <rect
            x={0}
            y={0}
            width={1080}
            height={1920}
            fill={WHITE}
            opacity={flashOpacity}
          />
        )}
      </svg>
    </>
  );
};

// ─── Main Composition ─────────────────────────────────────────────────────────

export const AIMusicApp: React.FC = () => {
  const frame = useCurrentFrame();

  const isScene1 = frame < S2_START;
  const isScene2 = frame >= S2_START && frame < S3_START;
  const isScene3 = frame >= S3_START;

  return (
    <AbsoluteFill
      style={{
        background: BG,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        overflow: 'hidden',
      }}
    >
      <BackgroundGrid />

      {isScene1 && <Scene1 frame={frame} />}
      {isScene2 && <Scene2 frame={frame} />}
      {isScene3 && <Scene3 frame={frame} />}
    </AbsoluteFill>
  );
};
