import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, staticFile } from 'remotion';

// ── Palette ──────────────────────────────────────────────────────────────────
const DARK = '#1e1e2e';
const ARROW_C = '#9a9a9a';
const GREEN_F = '#c8e6c9';
const GREEN_S = '#43a870';
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

// Dots traveling along a vertical line
function VParticles({
  x,
  y1,
  len,
  cycle,
  n = 4,
}: {
  x: number;
  y1: number;
  len: number;
  cycle: number;
  n?: number;
}) {
  if (cycle < 0) return null;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const t = (cycle + i / n) % 1;
        const y = y1 + len * t;
        const op = t < 0.1 ? t / 0.1 : t > 0.88 ? (1 - t) / 0.12 : 0.9;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={6}
            fill={GREEN_S}
            opacity={Math.max(0, op)}
            filter="url(#glow)"
          />
        );
      })}
    </>
  );
}

// Dots traveling along a horizontal line
function HParticles({
  y,
  x1,
  len,
  cycle,
  n = 3,
}: {
  y: number;
  x1: number;
  len: number;
  cycle: number;
  n?: number;
}) {
  if (cycle < 0) return null;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const t = (cycle + i / n) % 1;
        const x = x1 + len * t;
        const op = t < 0.1 ? t / 0.1 : t > 0.88 ? (1 - t) / 0.12 : 0.9;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={6}
            fill={GREEN_S}
            opacity={Math.max(0, op)}
            filter="url(#glow)"
          />
        );
      })}
    </>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export const StorageWorkflow: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Title ──────────────────────────────────────────
  const titleOp = itp(frame, 0, 24);

  // ── App browser ────────────────────────────────────
  const appS = sp(frame, 8, 11, 105);
  const appOp = itp(frame, 8, 32);
  const appSlide = (1 - appS) * -70; // drops in from above

  // ── Arrow 1 (down: app → upload) ─────────────────
  const a1 = itp(frame, 42, 84);
  const A1_X = 540;
  const A1_Y1 = 468;
  const A1_LEN = 132;

  // ── Upload interface ──────────────────────────────
  const upS = sp(frame, 78, 11, 105);
  const upOp = itp(frame, 78, 100);
  const upSlide = (1 - upS) * 70; // rises up

  // Files appear inside upload interface
  const f1 = itp(frame, 102, 122, 0, 1, easeOut);
  const f2 = itp(frame, 126, 146, 0, 1, easeOut);
  const f3 = itp(frame, 150, 170, 0, 1, easeOut);
  const btnOp = itp(frame, 165, 182);

  // Upload button pulse (scale up-down once)
  const btnPulse = 1 + 0.08 * Math.sin(itp(frame, 165, 195) * Math.PI);

  // ── Arrow 2 (down: upload → supabase) ────────────
  const a2 = itp(frame, 164, 204);
  const A2_X = 540;
  const A2_Y1 = 940;
  const A2_LEN = 130;

  // ── Supabase ──────────────────────────────────────
  const stS = sp(frame, 198, 10, 105);
  const stOp = itp(frame, 198, 222);
  const stSlide = (1 - stS) * 80; // bounces up

  const fill = itp(frame, 220, 290, 0, 0.57, easeOut);

  // Fill level glow pulse (once data arrives)
  const fillGlow = fill > 0.05 ? 0.3 + 0.15 * Math.sin(frame * 0.18) : 0;

  // ── "1 GB LIMIT" badge ─────────────────────────────
  const limitS = sp(frame, 262, 8, 155); // very bouncy
  const limitOp = itp(frame, 262, 278);

  // ── Users ────────────────────────────────────────
  const uS = sp(frame, 210, 11, 105);
  const uOp = itp(frame, 210, 232);
  const uSlide = (1 - uS) * -70; // slides in from left

  // ── Arrow 3 (users → supabase, horizontal) ───────
  const a3 = itp(frame, 236, 278);
  const A3_Y = 1362;
  const A3_X1 = 392;
  const A3_LEN = 196;

  // ── Particle cycles ───────────────────────────────
  const p1 = frame >= 86 ? ((frame - 86) % 46) / 46 : -1;
  const p2 = frame >= 206 ? ((frame - 206) % 42) / 42 : -1;
  const p3 = frame >= 280 ? ((frame - 280) % 50) / 50 : -1;

  return (
    <AbsoluteFill style={{ backgroundColor: '#ffffff' }}>
      <svg
        viewBox="0 0 1080 1920"
        width={1080}
        height={1920}
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          {/* ── Rough hand-drawn filter ── */}
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

          {/* ── Particle glow ── */}
          <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* ── Dot-grid background ── */}
          <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="14" cy="14" r="0.72" fill="#c0c0c0" />
          </pattern>
        </defs>

        {/* Background */}
        <rect width="1080" height="1920" fill="url(#dots)" />

        {/* ── TITLE ─────────────────────────────────────────── */}
        <text
          x="540"
          y="88"
          textAnchor="middle"
          fontSize="44"
          fontWeight="bold"
          fontFamily={FONT}
          fill={DARK}
          opacity={titleOp}
          filter="url(#sk)"
        >
          Storage Workflow
        </text>

        {/* ════════════════════════════════════════════════════ */}
        {/*  APP BROWSER                                        */}
        {/* ════════════════════════════════════════════════════ */}
        <g opacity={appOp} transform={`translate(0, ${appSlide})`} filter="url(#sk)">
          {/* Outer frame */}
          <rect x="150" y="118" width="780" height="294" rx="10"
            fill="white" stroke={DARK} strokeWidth="2.8" />

          {/* Browser chrome */}
          <rect x="160" y="128" width="760" height="38" rx="5"
            fill="#f3f3f3" stroke={DARK} strokeWidth="1.6" />
          <circle cx="182" cy="147" r="7.5" fill="#ff6059" />
          <circle cx="204" cy="147" r="7.5" fill="#ffbd2e" />
          <circle cx="226" cy="147" r="7.5" fill="#28c840" />
          <rect x="244" y="136" width="330" height="20" rx="4"
            fill="white" stroke="#c8c8c8" strokeWidth="1" />
          <text x="409" y="151" textAnchor="middle"
            fontSize="15" fontFamily={FONT} fill="#aaa">SimpleApp.com</text>

          {/* Nav links */}
          <text x="634" y="152" fontSize="15" fontFamily={FONT} fill="#aaa">Home</text>
          <text x="690" y="152" fontSize="15" fontFamily={FONT} fill={GREEN_S} fontWeight="bold">Upload</text>
          <text x="756" y="152" fontSize="15" fontFamily={FONT} fill="#aaa">Gallery</text>

          {/* Fake page content */}
          <rect x="160" y="182" width="640" height="13" rx="3" fill="#e2e2e2" />
          <rect x="160" y="203" width="560" height="11" rx="3" fill="#ebebeb" />
          <rect x="160" y="222" width="600" height="11" rx="3" fill="#ebebeb" />
          <rect x="160" y="241" width="490" height="11" rx="3" fill="#ebebeb" />

          {/* Upload CTA button (prominent) */}
          <rect x="160" y="272" width="232" height="42" rx="8"
            fill={GREEN_F} stroke={GREEN_S} strokeWidth="2.4" />
          <text x="276" y="300" textAnchor="middle"
            fontSize="27" fontWeight="bold" fontFamily={FONT} fill="#1b5e3a">↑ Upload</text>

          {/* Gallery button */}
          <rect x="408" y="276" width="140" height="34" rx="6"
            fill="#efefef" stroke={DARK} strokeWidth="1.6" />
          <text x="478" y="299" textAnchor="middle"
            fontSize="20" fontFamily={FONT} fill={DARK}>Gallery</text>
        </g>

        <text x="540" y="456" textAnchor="middle"
          fontSize="30" fontFamily={FONT} fill={DARK}
          opacity={appOp} filter="url(#sk)">Simple App</text>

        {/* ════════════════════════════════════════════════════ */}
        {/*  ARROW 1  (app → upload, vertical)                  */}
        {/* ════════════════════════════════════════════════════ */}
        <g filter="url(#sk)">
          {a1 > 0 && (
            <line
              x1={A1_X} y1={A1_Y1}
              x2={A1_X} y2={A1_Y1 + A1_LEN * a1}
              stroke={ARROW_C} strokeWidth="7.5" strokeLinecap="round"
            />
          )}
          {a1 > 0.88 && (
            <path
              d={`M ${A1_X - 18} ${A1_Y1 + A1_LEN * a1 - 26}
                  L ${A1_X}      ${A1_Y1 + A1_LEN * a1}
                  L ${A1_X + 18} ${A1_Y1 + A1_LEN * a1 - 26}`}
              fill="none" stroke={ARROW_C} strokeWidth="7"
              strokeLinecap="round" strokeLinejoin="round"
            />
          )}
        </g>

        <VParticles x={A1_X} y1={A1_Y1} len={A1_LEN} cycle={p1} />

        {/* ════════════════════════════════════════════════════ */}
        {/*  UPLOAD INTERFACE                                    */}
        {/* ════════════════════════════════════════════════════ */}
        <g opacity={upOp} transform={`translate(0, ${upSlide})`} filter="url(#sk)">
          {/* Dashed border box */}
          <rect x="150" y="604" width="780" height="328" rx="9"
            fill="white" stroke={DARK} strokeWidth="2.8" strokeDasharray="14 6" />

          {/* Header strip */}
          <rect x="160" y="616" width="760" height="40" rx="5"
            fill="#f5f5f5" stroke={DARK} strokeWidth="1.6" />
          <text x="210" y="643" textAnchor="middle"
            fontSize="24" fontFamily={FONT} fill={DARK}>↑</text>
          <text x="330" y="643" fontSize="23" fontWeight="bold"
            fontFamily={FONT} fill={DARK}>Upload Media</text>

          {/* ─ Video icon (play circle) ─ */}
          <circle cx="232" cy="724" r="46" fill="#f0f0f0" stroke={DARK} strokeWidth="2.2" />
          <circle cx="232" cy="724" r="29" fill="#e0e0e0" stroke={DARK} strokeWidth="1.6" />
          <polygon points="223,715 223,733 250,724" fill={DARK} />
          <text x="232" y="791" textAnchor="middle"
            fontSize="19" fontFamily={FONT} fill={DARK}>Video 1</text>

          {/* ─ Image icon ─ */}
          <rect x="308" y="688" width="96" height="76" rx="5"
            fill="#f0f0f0" stroke={DARK} strokeWidth="2.2" />
          <path d="M 316 756  L 340 728  L 364 744  L 388 726  L 396 756 Z" fill="#d0d0d0" />
          <circle cx="390" cy="698" r="10" fill="#fde68a" stroke={DARK} strokeWidth="1.6" />
          <text x="356" y="791" textAnchor="middle"
            fontSize="19" fontFamily={FONT} fill={DARK}>Image 1</text>

          {/* ─ Add More ─ */}
          <rect x="438" y="688" width="80" height="76" rx="5"
            fill="#f0f0f0" stroke={DARK} strokeWidth="1.6" strokeDasharray="5 3" />
          <text x="478" y="734" textAnchor="middle"
            fontSize="42" fontFamily={FONT} fill={DARK}>+</text>
          <text x="478" y="791" textAnchor="middle"
            fontSize="19" fontFamily={FONT} fill={DARK}>Add More</text>

          {/* ─ File list (appears one by one) ─ */}
          <g opacity={f1} transform={`translate(${(1 - f1) * -28}, 0)`}>
            <text x="542" y="704" fontSize="20" fontFamily={FONT} fill="#555">
              🖼  vacation_beach.jpg · 2.4 MB
            </text>
          </g>
          <g opacity={f2} transform={`translate(${(1 - f2) * -28}, 0)`}>
            <text x="542" y="732" fontSize="20" fontFamily={FONT} fill="#555">
              📸  birthday_party.jpg · 3.1 MB
            </text>
          </g>
          <g opacity={f3} transform={`translate(${(1 - f3) * -28}, 0)`}>
            <text x="542" y="760" fontSize="20" fontFamily={FONT} fill="#555">
              🎥  wedding_video.mp4 · 45 MB
            </text>
          </g>

          {/* ─ PHOTO / VIDEO tab buttons ─ */}
          <rect x="160" y="814" width="178" height="48" rx="5"
            fill="#e2e2e2" stroke={DARK} strokeWidth="2.2" />
          <text x="249" y="845" textAnchor="middle"
            fontSize="26" fontWeight="bold" fontFamily={FONT} fill={DARK}>PHOTO</text>
          <rect x="356" y="814" width="178" height="48" rx="5"
            fill="#e2e2e2" stroke={DARK} strokeWidth="2.2" />
          <text x="445" y="845" textAnchor="middle"
            fontSize="26" fontWeight="bold" fontFamily={FONT} fill={DARK}>VIDEO</text>

          {/* ─ Upload button (pulses before arrow 2 fires) ─ */}
          <g
            opacity={btnOp}
            transform={`translate(540, 898) scale(${btnPulse}) translate(-540, -898)`}
          >
            <rect x="168" y="876" width="300" height="52" rx="26"
              fill={GREEN_F} stroke={GREEN_S} strokeWidth="2.8" />
            <text x="318" y="910" textAnchor="middle"
              fontSize="30" fontWeight="bold" fontFamily={FONT} fill="#1b5e3a">Upload</text>
          </g>
        </g>

        {/* ════════════════════════════════════════════════════ */}
        {/*  ARROW 2  (upload → supabase, vertical)             */}
        {/* ════════════════════════════════════════════════════ */}
        <g filter="url(#sk)">
          {a2 > 0 && (
            <line
              x1={A2_X} y1={A2_Y1}
              x2={A2_X} y2={A2_Y1 + A2_LEN * a2}
              stroke={ARROW_C} strokeWidth="7.5" strokeLinecap="round"
            />
          )}
          {a2 > 0.88 && (
            <path
              d={`M ${A2_X - 18} ${A2_Y1 + A2_LEN * a2 - 26}
                  L ${A2_X}      ${A2_Y1 + A2_LEN * a2}
                  L ${A2_X + 18} ${A2_Y1 + A2_LEN * a2 - 26}`}
              fill="none" stroke={ARROW_C} strokeWidth="7"
              strokeLinecap="round" strokeLinejoin="round"
            />
          )}
        </g>

        <VParticles x={A2_X} y1={A2_Y1} len={A2_LEN} cycle={p2} />

        {/* ════════════════════════════════════════════════════ */}
        {/*  SUPABASE CYLINDER                                   */}
        {/* ════════════════════════════════════════════════════ */}
        <g opacity={stOp} transform={`translate(0, ${stSlide})`}>
          {/* Label */}
          <text x="734" y="1104" textAnchor="middle"
            fontSize="36" fontWeight="bold" fontFamily={FONT} fill={DARK} filter="url(#sk)">
            SUPABASE
          </text>
          <image
            href={staticFile('screenshot-supabase.png')}
            x="838" y="1070" width="42" height="42"
            style={{ borderRadius: 8 }}
          />

          <g filter="url(#sk)">
            {/* Top ellipse */}
            <ellipse cx="758" cy="1148" rx="144" ry="38"
              fill={GREEN_F} stroke={GREEN_S} strokeWidth="2.8" />

            {/* Body background */}
            <rect x="614" y="1148" width="288" height="308" fill={GREEN_F} />

            {/* Rising water fill (animates from bottom up) */}
            <rect
              x="614"
              y={1148 + 308 * (1 - fill)}
              width="288"
              height={308 * fill}
              fill={`${GREEN_S}44`}
            />

            {/* Side outlines */}
            <line x1="614" y1="1148" x2="614" y2="1456" stroke={GREEN_S} strokeWidth="2.8" />
            <line x1="902" y1="1148" x2="902" y2="1456" stroke={GREEN_S} strokeWidth="2.8" />

            {/* Bottom ellipse */}
            <ellipse cx="758" cy="1456" rx="144" ry="38"
              fill={GREEN_F} stroke={GREEN_S} strokeWidth="2.8" />

            {/* Fill level glow ring */}
            {fill > 0.04 && (
              <ellipse
                cx="758"
                cy={1148 + 308 * (1 - fill)}
                rx="144"
                ry="38"
                fill="none"
                stroke={GREEN_S}
                strokeWidth="2.5"
                opacity={fillGlow + 0.4}
              />
            )}

            {/* Horizontal divider arcs */}
            <path d="M 614 1250  Q 758 1270, 902 1250"
              fill="none" stroke={GREEN_S} strokeWidth="1.6" strokeDasharray="7 3" />
            <path d="M 614 1352  Q 758 1372, 902 1352"
              fill="none" stroke={GREEN_S} strokeWidth="1.6" strokeDasharray="7 3" />

            {/* Right-side knob circles */}
            <circle cx="890" cy="1206" r="9" fill="none" stroke={GREEN_S} strokeWidth="1.8" />
            <circle cx="890" cy="1306" r="9" fill="none" stroke={GREEN_S} strokeWidth="1.8" />
            <circle cx="890" cy="1406" r="9" fill="none" stroke={GREEN_S} strokeWidth="1.8" />
          </g>

          {/* Storage bar below cylinder */}
          <g filter="url(#sk)">
            <rect x="614" y="1478" width="288" height="22" rx="5"
              fill="#e8e8e8" stroke={DARK} strokeWidth="1.6" />
            <rect x="614" y="1478" width={288 * fill} height="22" rx="5"
              fill={GREEN_S} />
          </g>

          <text x="758" y="1526" textAnchor="middle"
            fontSize="22" fontFamily={FONT} fill={DARK} filter="url(#sk)">
            {Math.round(fill * 100)}% used
          </text>

          {/* "1 GB LIMIT" badge — bouncy entrance */}
          <g
            opacity={limitOp}
            transform={`translate(758, 1564) scale(${0.4 + 0.6 * limitS}) translate(-758, -1564)`}
          >
            <rect x="648" y="1545" width="220" height="40" rx="7"
              fill="#ffeaea" stroke="#c0392b" strokeWidth="2" filter="url(#sk)" />
            <text x="758" y="1572" textAnchor="middle"
              fontSize="26" fontFamily={FONT} fill="#c0392b" fontWeight="bold" filter="url(#sk)">
              1 GB LIMIT
            </text>
          </g>
        </g>

        {/* ════════════════════════════════════════════════════ */}
        {/*  USERS GROUP                                         */}
        {/* ════════════════════════════════════════════════════ */}
        <g opacity={uOp} transform={`translate(${uSlide}, 0)`}>
          {/* Speech bubble */}
          <path
            d="M 68 1208  Q 68 1188, 90 1188  L 376 1188
               Q 398 1188, 398 1208  L 398 1252
               Q 398 1274, 376 1274  L 218 1274
               L 196 1300  L 206 1274
               Q 68 1274, 68 1252 Z"
            fill="#fde68a" stroke={DARK} strokeWidth="2.2" filter="url(#sk)"
          />

          <g filter="url(#sk)">
            {/* Back-left person */}
            <circle cx="146" cy="1356" r="30" fill="#d4d4d4" stroke={DARK} strokeWidth="2.2" />
            <path d="M 122 1388  Q 146 1406, 170 1388  L 167 1462  Q 146 1478, 125 1462 Z"
              fill="#d4d4d4" stroke={DARK} strokeWidth="2.2" />

            {/* Back-right person */}
            <circle cx="310" cy="1356" r="30" fill="#d4d4d4" stroke={DARK} strokeWidth="2.2" />
            <path d="M 286 1388  Q 310 1406, 334 1388  L 331 1462  Q 310 1478, 289 1462 Z"
              fill="#d4d4d4" stroke={DARK} strokeWidth="2.2" />

            {/* Front center (larger) */}
            <circle cx="228" cy="1362" r="36" fill="#b8b8b8" stroke={DARK} strokeWidth="2.6" />
            <path d="M 200 1400  Q 228 1420, 256 1400  L 253 1480  Q 228 1498, 203 1480 Z"
              fill="#b8b8b8" stroke={DARK} strokeWidth="2.6" />
            {/* Crosshatch on body */}
            {[-18, -9, 0, 9, 18].map((dx, j) => (
              <line key={j}
                x1={228 + dx} y1={1403} x2={228 + dx} y2={1477}
                stroke={DARK} strokeWidth="0.9" opacity="0.22"
              />
            ))}
          </g>

          {/* Label */}
          <text x="228" y="1538" textAnchor="middle"
            fontSize="38" fontFamily={FONT} fill={DARK} filter="url(#sk)">Users</text>
        </g>

        {/* ════════════════════════════════════════════════════ */}
        {/*  ARROW 3  (users → supabase, horizontal)            */}
        {/* ════════════════════════════════════════════════════ */}
        <g filter="url(#sk)">
          {a3 > 0 && (
            <line
              x1={A3_X1} y1={A3_Y}
              x2={A3_X1 + A3_LEN * a3} y2={A3_Y}
              stroke={ARROW_C} strokeWidth="7.5" strokeLinecap="round"
            />
          )}
          {a3 > 0.88 && (
            <path
              d={`M ${A3_X1 + A3_LEN * a3 - 26} ${A3_Y - 18}
                  L ${A3_X1 + A3_LEN * a3}       ${A3_Y}
                  L ${A3_X1 + A3_LEN * a3 - 26}  ${A3_Y + 18}`}
              fill="none" stroke={ARROW_C} strokeWidth="7"
              strokeLinecap="round" strokeLinejoin="round"
            />
          )}
        </g>

        <HParticles y={A3_Y} x1={A3_X1} len={A3_LEN} cycle={p3} />

      </svg>
    </AbsoluteFill>
  );
};
