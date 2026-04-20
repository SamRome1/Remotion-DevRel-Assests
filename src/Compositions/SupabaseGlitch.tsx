import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

// Deterministic pseudo-random from a seed (no Math.random())
function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 43758.5453123;
  return x - Math.floor(x);
}

// Pixel rain column configuration
interface RainColumn {
  x: number;
  speed: number; // pixels per frame
  offset: number; // starting vertical offset (in pixels)
  opacity: number;
  pixelSize: number;
}

function buildRainColumns(count: number, width: number): RainColumn[] {
  const cols: RainColumn[] = [];
  for (let i = 0; i < count; i++) {
    const r1 = seededRandom(i * 7 + 1);
    const r2 = seededRandom(i * 7 + 2);
    const r3 = seededRandom(i * 7 + 3);
    const r4 = seededRandom(i * 7 + 4);
    cols.push({
      x: Math.floor((r1 * width) / 8) * 8,
      speed: 4 + r2 * 8,
      offset: r3 * 1080,
      opacity: 0.12 + r4 * 0.22,
      pixelSize: 8,
    });
  }
  return cols;
}

const RAIN_COLUMNS = buildRainColumns(80, 1920);
const SUPABASE_GREEN = "#3ECF8E";

// Glitch slices — define fixed slice regions, offset them per glitch event
interface GlitchSlice {
  y: number;
  height: number;
}

const GLITCH_SLICES: GlitchSlice[] = [
  { y: 290, height: 14 },
  { y: 380, height: 8 },
  { y: 460, height: 20 },
  { y: 540, height: 10 },
  { y: 620, height: 18 },
  { y: 700, height: 6 },
  { y: 780, height: 12 },
];

// Returns the glitch "event index" for the current frame (changes every 8-12 frames)
function getGlitchEvent(frame: number): number {
  // Use varying intervals by treating it as a coarse time bucket
  return Math.floor(frame / 9);
}

function getSliceOffset(
  sliceIdx: number,
  eventIdx: number,
  active: boolean
): number {
  if (!active) return 0;
  const r = seededRandom(sliceIdx * 31 + eventIdx * 17);
  // Most slices have a small offset, occasionally a larger one
  const magnitude = r > 0.8 ? 40 + r * 60 : 8 + r * 24;
  return (seededRandom(sliceIdx * 53 + eventIdx * 7) > 0.5 ? 1 : -1) * magnitude;
}

function isGlitchActive(frame: number, eventIdx: number): boolean {
  // Glitch is active for ~3-4 frames out of each 9-frame window
  const frameInWindow = frame - eventIdx * 9;
  const r = seededRandom(eventIdx * 99 + 1);
  const glitchDuration = 2 + Math.floor(r * 3); // 2-4 frames
  return frameInWindow < glitchDuration;
}

export const SupabaseGlitch: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const eventIdx = getGlitchEvent(frame);
  const glitchActive = isGlitchActive(frame, eventIdx);

  // RGB channel split amount — pulses with the glitch
  const channelSplit = glitchActive
    ? 4 + seededRandom(eventIdx * 13 + frame) * 10
    : 1;

  // Real Supabase logo: viewBox="0 0 109 113" — two overlapping bolts
  const PATH_BOTTOM =
    "M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z";
  const PATH_TOP =
    "M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z";

  const LOGO_HEIGHT = 650;
  const LOGO_WIDTH = Math.round(LOGO_HEIGHT * (109 / 113));
  const logoX = (width - LOGO_WIDTH) / 2;
  const logoY = (height - LOGO_HEIGHT) / 2;

  // Scanline SVG (full canvas overlay)
  const scanlineRows = Math.ceil(height / 2);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000", overflow: "hidden" }}>
      {/* ── Pixel Rain ── */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
          imageRendering: "pixelated",
        }}
        width={width}
        height={height}
      >
        {RAIN_COLUMNS.map((col, colIdx) => {
          const { x, speed, offset, opacity, pixelSize } = col;
          // Each column is a repeating stream. We figure out which pixel squares
          // are visible at this frame by using a modulo on the column height.
          const totalHeight = height + pixelSize * 12; // extended so it loops
          const travel = ((frame * speed + offset) % totalHeight) - pixelSize * 6;

          // Render a trail of 8-10 pixels per column
          const trailLength = 8 + Math.floor(seededRandom(colIdx * 3) * 5);
          const pixels: React.ReactNode[] = [];
          for (let t = 0; t < trailLength; t++) {
            const py = travel - t * pixelSize;
            if (py < -pixelSize || py > height) continue;
            // Head pixel is brightest
            const fadeOpacity = opacity * (1 - t / trailLength);
            pixels.push(
              <rect
                key={t}
                x={x}
                y={Math.round(py)}
                width={pixelSize}
                height={pixelSize}
                fill={SUPABASE_GREEN}
                opacity={fadeOpacity}
              />
            );
          }
          return <g key={colIdx}>{pixels}</g>;
        })}
      </svg>

      {/* ── Supabase Logo with Glitch ── */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
          imageRendering: "pixelated",
          overflow: "visible",
        }}
        width={width}
        height={height}
      >
        <defs>
          {/* Official Supabase gradients (coords are in the 0 0 109 113 viewBox space) */}
          <linearGradient
            id="supabase-grad"
            x1="53.9738"
            y1="54.974"
            x2="94.1635"
            y2="71.8295"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#249361" />
            <stop offset="1" stopColor="#3ECF8E" />
          </linearGradient>
          <linearGradient
            id="supabase-overlay"
            x1="36.1558"
            y1="30.578"
            x2="54.4844"
            y2="65.0806"
            gradientUnits="userSpaceOnUse"
          >
            <stop />
            <stop offset="1" stopOpacity="0" />
          </linearGradient>

          {/* Base clip: full canvas minus glitch slice bands */}
          <clipPath id="logo-base-clip">
            {(() => {
              let segments: Array<[number, number]> = [[0, height]];
              GLITCH_SLICES.forEach((s) => {
                const next: Array<[number, number]> = [];
                segments.forEach(([a, b]) => {
                  if (s.y + s.height <= a || s.y >= b) {
                    next.push([a, b]);
                  } else {
                    if (a < s.y) next.push([a, s.y]);
                    if (s.y + s.height < b) next.push([s.y + s.height, b]);
                  }
                });
                segments = next;
              });
              return segments.map(([a, b], i) => (
                <rect key={i} x={0} y={a} width={width} height={b - a} />
              ));
            })()}
          </clipPath>

          {/* Per-slice clip paths */}
          {GLITCH_SLICES.map((slice, sIdx) => (
            <clipPath key={sIdx} id={`slice-clip-${sIdx}`}>
              <rect x={0} y={slice.y} width={width} height={slice.height} />
            </clipPath>
          ))}
        </defs>

        {/* Red channel ghost */}
        <svg
          x={logoX - channelSplit}
          y={logoY}
          width={LOGO_WIDTH}
          height={LOGO_HEIGHT}
          viewBox="0 0 109 113"
          opacity={glitchActive ? 0.55 : 0.12}
        >
          <path d={PATH_BOTTOM} fill="red" />
          <path d={PATH_TOP} fill="red" />
        </svg>

        {/* Blue channel ghost */}
        <svg
          x={logoX + channelSplit}
          y={logoY}
          width={LOGO_WIDTH}
          height={LOGO_HEIGHT}
          viewBox="0 0 109 113"
          opacity={glitchActive ? 0.55 : 0.12}
        >
          <path d={PATH_BOTTOM} fill="#00bfff" />
          <path d={PATH_TOP} fill="#00bfff" />
        </svg>

        {/* Base logo (non-slice regions) */}
        <g clipPath="url(#logo-base-clip)">
          <svg
            x={logoX}
            y={logoY}
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
            viewBox="0 0 109 113"
          >
            <path d={PATH_BOTTOM} fill="url(#supabase-grad)" />
            <path d={PATH_BOTTOM} fill="url(#supabase-overlay)" fillOpacity={0.2} />
            <path d={PATH_TOP} fill={SUPABASE_GREEN} />
          </svg>
        </g>

        {/* Displaced slice bands */}
        {GLITCH_SLICES.map((slice, sIdx) => {
          const dx = getSliceOffset(sIdx, eventIdx, glitchActive);
          return (
            <g key={sIdx} clipPath={`url(#slice-clip-${sIdx})`}>
              <svg
                x={logoX + dx}
                y={logoY}
                width={LOGO_WIDTH}
                height={LOGO_HEIGHT}
                viewBox="0 0 109 113"
              >
                <path d={PATH_BOTTOM} fill="url(#supabase-grad)" />
                <path d={PATH_BOTTOM} fill="url(#supabase-overlay)" fillOpacity={0.2} />
                <path d={PATH_TOP} fill={SUPABASE_GREEN} />
              </svg>
            </g>
          );
        })}

        {/* Glitch scanline tears */}
        {glitchActive &&
          [0, 1, 2].map((tearIdx) => {
            const r = seededRandom(eventIdx * 41 + tearIdx * 13 + frame);
            const tearY = Math.floor(r * height);
            const tearW = 60 + seededRandom(tearIdx * 7 + eventIdx) * 200;
            const tearX = seededRandom(tearIdx * 11 + frame) * (width - tearW);
            return (
              <rect
                key={tearIdx}
                x={tearX}
                y={tearY}
                width={tearW}
                height={2}
                fill={SUPABASE_GREEN}
                opacity={0.7}
              />
            );
          })}
      </svg>

      {/* ── CRT Scanlines overlay ── */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
          pointerEvents: "none",
        }}
        width={width}
        height={height}
      >
        {Array.from({ length: scanlineRows }).map((_, i) => (
          <rect
            key={i}
            x={0}
            y={i * 2}
            width={width}
            height={1}
            fill="#000000"
            opacity={0.18}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
