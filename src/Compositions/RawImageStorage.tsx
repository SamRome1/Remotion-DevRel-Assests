import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, staticFile } from 'remotion';

// ── Palette (matches StorageWorkflow) ────────────────────────────────────────
const DARK = '#1e1e2e';
const ARROW_C = '#9a9a9a';
const GREEN_F = '#c8e6c9';
const GREEN_S = '#43a870';
const ORANGE = '#f59e0b';
const ORANGE_F = '#fef3c7';
const RED = '#ef4444';
const RED_F = '#fee2e2';
const FONT = "'Caveat', cursive";
const FPS = 30;

// ── Helpers ───────────────────────────────────────────────────────────────────
const itp = (
  frame: number,
  a: number,
  b: number,
  from = 0,
  to = 1,
  easing?: (t: number) => number
) =>
  interpolate(frame, [a, b], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

const sp = (frame: number, start: number, damping = 13, stiffness = 115) =>
  spring({ frame: frame - start, fps: FPS, config: { damping, stiffness } });

const easeOut = (t: number) => 1 - (1 - t) ** 3;

// ── Photo data ─────────────────────────────────────────────────────────────────
const PHOTOS = [
  { file: 'photo_001.jpg', size: '3.2 MB', startFrame: 4 },
  { file: 'photo_002.jpg', size: '4.1 MB', startFrame: 20 },
  { file: 'photo_003.jpg', size: '2.9 MB', startFrame: 36 },
];
const PHOTO_W = 260;
const PHOTO_H = 192;
const PHOTO_Y = 96;
// x positions (3 photos centered in 1080px with 22px gaps)
// total = 3*260 + 2*22 = 824, margin = (1080-824)/2 = 128
const PHOTO_XS = [128, 410, 692];

// ── Fork geometry ──────────────────────────────────────────────────────────────
const FORK_CX = 540;
const FORK_V_Y1 = 1152;
const FORK_V_Y2 = 1230;
const FORK_LX = 200;  // left drop x
const FORK_RX = 880;  // right drop x
const BOX_Y = 1378;
const BOX_W = 360;
const BOX_H = 294;

export const RawImageStorage: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Photo entrances ───────────────────────────────────────────────────────
  const photos = PHOTOS.map(({ file, size, startFrame }) => ({
    file,
    size,
    s: sp(frame, startFrame, 11, 108),
    op: itp(frame, startFrame, startFrame + 18),
  }));

  // ── "Each photo: 3–4 MB" label ────────────────────────────────────────────
  const labelS = sp(frame, 58, 9, 148);
  const labelOp = itp(frame, 58, 74);

  // ── Arrow 1 (photos → storage) ────────────────────────────────────────────
  const a1 = itp(frame, 74, 114);
  const A1_Y1 = 370;
  const A1_LEN = 144;

  // ── Supabase cylinder ─────────────────────────────────────────────────────
  const stS = sp(frame, 108, 10, 108);
  const stOp = itp(frame, 108, 130);
  const stSlide = (1 - stS) * 72;

  // Storage fills 0 → 1 (fast — to show how quick it runs out)
  const fill = itp(frame, 132, 246, 0, 1, easeOut);

  // Color shifts: green → orange → red as it fills
  const fillStroke = fill < 0.55 ? GREEN_S : fill < 0.80 ? ORANGE : RED;
  const fillBody = fill < 0.55 ? GREEN_F : fill < 0.80 ? ORANGE_F : RED_F;

  // Glow pulse on the fill level ring
  const levelPulse = fill > 0.04 ? 0.45 + 0.2 * Math.sin(frame * 0.2) : 0;

  // ── "Storage Full" badge ──────────────────────────────────────────────────
  const fullS = sp(frame, 242, 8, 162);
  const fullOp = itp(frame, 242, 256);

  // ── Fork ──────────────────────────────────────────────────────────────────
  const forkOp = itp(frame, 260, 284, 0, 1, easeOut);
  const delS = sp(frame, 270, 11, 112);
  const delOp = itp(frame, 270, 290);
  const upS = sp(frame, 284, 11, 112);
  const upOp = itp(frame, 284, 304);

  return (
    <AbsoluteFill style={{ backgroundColor: '#ffffff' }}>
      <svg
        viewBox="0 0 1080 1920"
        width={1080}
        height={1920}
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          {/* Hand-drawn roughness filter */}
          <filter id="sk" x="-6%" y="-6%" width="112%" height="112%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.038"
              numOctaves="4"
              seed="7"
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale="2.2"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          {/* Dot-grid background */}
          <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="14" cy="14" r="0.72" fill="#c0c0c0" />
          </pattern>
        </defs>

        {/* Background */}
        <rect width="1080" height="1920" fill="url(#dots)" />

        {/* ════════════════════════════════════════════════════ */}
        {/*  PHOTO TILES                                         */}
        {/* ════════════════════════════════════════════════════ */}
        {photos.map(({ file, size, s, op }, i) => {
          const x = PHOTO_XS[i];
          const slideY = (1 - s) * -62;
          return (
            <g key={i} opacity={op} transform={`translate(0, ${slideY})`} filter="url(#sk)">
              {/* Frame */}
              <rect
                x={x} y={PHOTO_Y} width={PHOTO_W} height={PHOTO_H} rx="7"
                fill="white" stroke={DARK} strokeWidth="2.5"
              />
              {/* Sky */}
              <rect
                x={x + 3} y={PHOTO_Y + 3} width={PHOTO_W - 6} height={112} rx="5"
                fill="#dbeafe"
              />
              {/* Sun */}
              <circle
                cx={x + 46} cy={PHOTO_Y + 34} r={20}
                fill="#fde68a" stroke={DARK} strokeWidth="1.6"
              />
              {/* Mountains */}
              <path
                d={`M ${x + 3} ${PHOTO_Y + 113}
                    L ${x + 70} ${PHOTO_Y + 68}
                    L ${x + 122} ${PHOTO_Y + 92}
                    L ${x + 188} ${PHOTO_Y + 56}
                    L ${x + 257} ${PHOTO_Y + 96}
                    L ${x + 257} ${PHOTO_Y + 113} Z`}
                fill="#9ca3af" stroke={DARK} strokeWidth="1.5"
              />
              {/* Ground */}
              <rect
                x={x + 3} y={PHOTO_Y + 113} width={PHOTO_W - 6} height={PHOTO_H - 116} rx="0"
                fill="#d1fae5"
              />
              {/* Filename */}
              <text
                x={x + PHOTO_W / 2} y={PHOTO_Y + PHOTO_H + 28}
                textAnchor="middle" fontSize="17" fontFamily={FONT} fill={DARK}
              >
                {file}
              </text>
              {/* Size badge — top-right, prominent red */}
              <rect
                x={x + PHOTO_W - 94} y={PHOTO_Y + 7} width={86} height={32} rx="6"
                fill={RED_F} stroke={RED} strokeWidth="2.2"
              />
              <text
                x={x + PHOTO_W - 51} y={PHOTO_Y + 30}
                textAnchor="middle" fontSize="20" fontWeight="bold" fontFamily={FONT} fill={RED}
              >
                {size}
              </text>
            </g>
          );
        })}

        {/* "Each photo: 3–4 MB" label — pops in with bounce */}
        <g
          opacity={labelOp}
          transform={`translate(540, 346) scale(${0.5 + 0.5 * labelS}) translate(-540, -346)`}
          filter="url(#sk)"
        >
          <text
            x="540" y="346"
            textAnchor="middle" fontSize="30" fontWeight="bold"
            fontFamily={FONT} fill={RED}
          >
            Each photo: 3 – 4 MB
          </text>
        </g>

        {/* ════════════════════════════════════════════════════ */}
        {/*  ARROW 1  (photos → storage)                        */}
        {/* ════════════════════════════════════════════════════ */}
        <g filter="url(#sk)">
          {a1 > 0 && (
            <line
              x1={FORK_CX} y1={A1_Y1}
              x2={FORK_CX} y2={A1_Y1 + A1_LEN * a1}
              stroke={ARROW_C} strokeWidth="7.5" strokeLinecap="round"
            />
          )}
          {a1 > 0.88 && (
            <path
              d={`M ${FORK_CX - 18} ${A1_Y1 + A1_LEN * a1 - 26}
                  L ${FORK_CX}      ${A1_Y1 + A1_LEN * a1}
                  L ${FORK_CX + 18} ${A1_Y1 + A1_LEN * a1 - 26}`}
              fill="none" stroke={ARROW_C} strokeWidth="7"
              strokeLinecap="round" strokeLinejoin="round"
            />
          )}
        </g>

        {/* ════════════════════════════════════════════════════ */}
        {/*  SUPABASE STORAGE CYLINDER                           */}
        {/* ════════════════════════════════════════════════════ */}
        <g opacity={stOp} transform={`translate(0, ${stSlide})`}>
          {/* Label row: text + logo */}
          <text
            x="508" y="544"
            textAnchor="middle" fontSize="34" fontWeight="bold"
            fontFamily={FONT} fill={DARK} filter="url(#sk)"
          >
            Supabase Storage
          </text>
          <image
            href={staticFile('screenshot-supabase.png')}
            x="630" y="510" width="44" height="44"
          />

          <g transform="translate(0, 40)">
          <g filter="url(#sk)">
            {/* Top ellipse */}
            <ellipse cx="540" cy="582" rx="152" ry="40"
              fill={fillBody} stroke={fillStroke} strokeWidth="2.8" />

            {/* Body background */}
            <rect x="388" y="582" width="304" height="312" fill={fillBody} />

            {/* Rising fill (animates bottom-up) */}
            <rect
              x="388"
              y={582 + 312 * (1 - fill)}
              width="304"
              height={312 * fill}
              fill={`${fillStroke}44`}
            />

            {/* Side walls */}
            <line x1="388" y1="582" x2="388" y2="894" stroke={fillStroke} strokeWidth="2.8" />
            <line x1="692" y1="582" x2="692" y2="894" stroke={fillStroke} strokeWidth="2.8" />

            {/* Bottom ellipse */}
            <ellipse cx="540" cy="894" rx="152" ry="40"
              fill={fillBody} stroke={fillStroke} strokeWidth="2.8" />

            {/* Fill level glow ring */}
            {fill > 0.04 && (
              <ellipse
                cx="540"
                cy={582 + 312 * (1 - fill)}
                rx="152" ry="40"
                fill="none" stroke={fillStroke} strokeWidth="2.5"
                opacity={levelPulse}
              />
            )}

            {/* Horizontal dividers */}
            <path d="M 388 686  Q 540 706, 692 686"
              fill="none" stroke={fillStroke} strokeWidth="1.6" strokeDasharray="7 3" />
            <path d="M 388 790  Q 540 810, 692 790"
              fill="none" stroke={fillStroke} strokeWidth="1.6" strokeDasharray="7 3" />

            {/* Side knobs */}
            <circle cx="680" cy="638" r="9" fill="none" stroke={fillStroke} strokeWidth="1.8" />
            <circle cx="680" cy="738" r="9" fill="none" stroke={fillStroke} strokeWidth="1.8" />
            <circle cx="680" cy="840" r="9" fill="none" stroke={fillStroke} strokeWidth="1.8" />
          </g>

          {/* Storage bar */}
          <g filter="url(#sk)">
            <rect x="388" y="916" width="304" height="22" rx="5"
              fill="#e8e8e8" stroke={DARK} strokeWidth="1.6" />
            <rect x="388" y="916" width={304 * fill} height="22" rx="5"
              fill={fillStroke} />
          </g>

          {/* Usage % and tier */}
          <text x="540" y="962" textAnchor="middle"
            fontSize="22" fontFamily={FONT} fill={DARK} filter="url(#sk)">
            {Math.round(fill * 100)}% used
          </text>
          <text x="540" y="996" textAnchor="middle"
            fontSize="20" fontFamily={FONT} fill="#6b7280" filter="url(#sk)">
            1 GB Free Tier
          </text>
          </g>{/* end translate(0,40) */}
        </g>

        {/* ════════════════════════════════════════════════════ */}
        {/*  "STORAGE FULL" badge                                */}
        {/* ════════════════════════════════════════════════════ */}
        <g
          opacity={fullOp}
          transform={`translate(540, 1068) scale(${0.4 + 0.6 * fullS}) translate(-540, -1068)`}
        >
          <rect x="298" y="1044" width="484" height="54" rx="10"
            fill={RED_F} stroke={RED} strokeWidth="2.6" filter="url(#sk)" />
          <text x="540" y="1079" textAnchor="middle"
            fontSize="30" fontWeight="bold" fontFamily={FONT} fill={RED} filter="url(#sk)">
            🚫  Storage Full
          </text>
        </g>

        {/* ════════════════════════════════════════════════════ */}
        {/*  FORK  (two bad options)                             */}
        {/* ════════════════════════════════════════════════════ */}

        {/* Fork lines */}
        <g opacity={forkOp} filter="url(#sk)">
          {/* Vertical stem */}
          <line
            x1={FORK_CX} y1={FORK_V_Y1}
            x2={FORK_CX} y2={FORK_V_Y2}
            stroke={ARROW_C} strokeWidth="5.5" strokeLinecap="round"
          />
          {/* Horizontal crossbar */}
          <line
            x1={FORK_LX} y1={FORK_V_Y2}
            x2={FORK_RX} y2={FORK_V_Y2}
            stroke={ARROW_C} strokeWidth="5.5" strokeLinecap="round"
          />
          {/* Left drop + arrowhead */}
          <line
            x1={FORK_LX} y1={FORK_V_Y2}
            x2={FORK_LX} y2={BOX_Y - 12}
            stroke={ARROW_C} strokeWidth="5.5" strokeLinecap="round"
          />
          <path
            d={`M ${FORK_LX - 16} ${BOX_Y - 34} L ${FORK_LX} ${BOX_Y - 12} L ${FORK_LX + 16} ${BOX_Y - 34}`}
            fill="none" stroke={ARROW_C} strokeWidth="5.5"
            strokeLinecap="round" strokeLinejoin="round"
          />
          {/* Right drop + arrowhead */}
          <line
            x1={FORK_RX} y1={FORK_V_Y2}
            x2={FORK_RX} y2={BOX_Y - 12}
            stroke={ARROW_C} strokeWidth="5.5" strokeLinecap="round"
          />
          <path
            d={`M ${FORK_RX - 16} ${BOX_Y - 34} L ${FORK_RX} ${BOX_Y - 12} L ${FORK_RX + 16} ${BOX_Y - 34}`}
            fill="none" stroke={ARROW_C} strokeWidth="5.5"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </g>

        {/* ── Option A: Delete Files ── */}
        <g
          opacity={delOp}
          transform={`translate(${FORK_LX}, ${BOX_Y + BOX_H / 2})
                      scale(${0.4 + 0.6 * delS})
                      translate(-${FORK_LX}, -${BOX_Y + BOX_H / 2})`}
        >
          {/* Box */}
          <rect
            x={FORK_LX - BOX_W / 2} y={BOX_Y} width={BOX_W} height={BOX_H} rx="8"
            fill="white" stroke={DARK} strokeWidth="2.5" strokeDasharray="12 5"
            filter="url(#sk)"
          />

          {/* Trash can icon */}
          <g filter="url(#sk)">
            {/* Handle */}
            <rect x={FORK_LX - 16} y={BOX_Y + 24} width={32} height={14} rx="5"
              fill="none" stroke={DARK} strokeWidth="2.2" />
            {/* Lid */}
            <rect x={FORK_LX - 34} y={BOX_Y + 38} width={68} height={14} rx="3"
              fill="#f3f4f6" stroke={DARK} strokeWidth="2.2" />
            {/* Body */}
            <rect x={FORK_LX - 28} y={BOX_Y + 52} width={56} height={68} rx="4"
              fill="#f3f4f6" stroke={DARK} strokeWidth="2.2" />
            {/* Lines inside */}
            {[-10, 0, 10].map((dx) => (
              <line key={dx}
                x1={FORK_LX + dx} y1={BOX_Y + 62} x2={FORK_LX + dx} y2={BOX_Y + 112}
                stroke={DARK} strokeWidth="1.6"
              />
            ))}
          </g>

          {/* Text */}
          <text x={FORK_LX} y={BOX_Y + 158}
            textAnchor="middle" fontSize="27" fontWeight="bold"
            fontFamily={FONT} fill={DARK} filter="url(#sk)">
            Delete Files
          </text>
          <text x={FORK_LX} y={BOX_Y + 190}
            textAnchor="middle" fontSize="20"
            fontFamily={FONT} fill="#6b7280" filter="url(#sk)">
            sort through it manually
          </text>
          <text x={FORK_LX} y={BOX_Y + 232}
            textAnchor="middle" fontSize="38"
            fontFamily={FONT} filter="url(#sk)">😤</text>
          <text x={FORK_LX} y={BOX_Y + 272}
            textAnchor="middle" fontSize="18"
            fontFamily={FONT} fill="#9ca3af" filter="url(#sk)">
            which files tho??
          </text>
        </g>

        {/* ── Option B: Upgrade ── */}
        <g
          opacity={upOp}
          transform={`translate(${FORK_RX}, ${BOX_Y + BOX_H / 2})
                      scale(${0.4 + 0.6 * upS})
                      translate(-${FORK_RX}, -${BOX_Y + BOX_H / 2})`}
        >
          {/* Box */}
          <rect
            x={FORK_RX - BOX_W / 2} y={BOX_Y} width={BOX_W} height={BOX_H} rx="8"
            fill="white" stroke={DARK} strokeWidth="2.5" strokeDasharray="12 5"
            filter="url(#sk)"
          />

          {/* Supabase logo */}
          <image
            href={staticFile('screenshot-supabase.png')}
            x={FORK_RX - 28} y={BOX_Y + 18} width={56} height={56}
          />

          {/* Text */}
          <text x={FORK_RX} y={BOX_Y + 118}
            textAnchor="middle" fontSize="27" fontWeight="bold"
            fontFamily={FONT} fill={DARK} filter="url(#sk)">
            Upgrade Plan
          </text>
          <text x={FORK_RX} y={BOX_Y + 168}
            textAnchor="middle" fontSize="50" fontWeight="bold"
            fontFamily={FONT} fill={DARK} filter="url(#sk)">
            $25/mo
          </text>
          <text x={FORK_RX} y={BOX_Y + 210}
            textAnchor="middle" fontSize="22" fontWeight="bold"
            fontFamily={FONT} fill={ORANGE} filter="url(#sk)">
            way too early
          </text>
          <text x={FORK_RX} y={BOX_Y + 256}
            textAnchor="middle" fontSize="38"
            fontFamily={FONT} filter="url(#sk)">😬</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
