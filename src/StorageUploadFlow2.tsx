import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { loadFont, fontFamily } from '@remotion/google-fonts/Inter';

loadFont('normal', { weights: ['300', '400', '600', '700'] });

// ── Palette ───────────────────────────────────────────────────────────────────
const GREEN  = '#3ecf8e';
const BG     = '#0f0f0f';
const DIM    = 'rgba(255,255,255,0.4)';
const BRIGHT = 'rgba(255,255,255,0.92)';
const FONT   = `${fontFamily}, system-ui, sans-serif`;

// ── Canvas: 1080 × 1920 ───────────────────────────────────────────────────────
const CX        = 540;
const ICON_SIZE = 180;

// 4 zones + 3 gaps, centred in 1920px
const ZONE_H  = 310;
const GAP_H   = 130;
const TOP_PAD = Math.round((1920 - (4 * ZONE_H + 3 * GAP_H)) / 2); // ~115

const S1_TOP = TOP_PAD;
const G1_TOP = S1_TOP + ZONE_H;
const S2_TOP = G1_TOP + GAP_H;
const G2_TOP = S2_TOP + ZONE_H;
const S3_TOP = G2_TOP + GAP_H;
const G3_TOP = S3_TOP + ZONE_H;
const S4_TOP = G3_TOP + GAP_H;

const ICON1_CY = S1_TOP + ICON_SIZE / 2 + 15;
const ICON2_CY = S2_TOP + ICON_SIZE / 2 + 15;
const ICON3_CY = S3_TOP + ICON_SIZE / 2 + 15;
const ICON4_CY = S4_TOP + ICON_SIZE / 2 + 15;

const LBL1_Y = ICON1_CY + ICON_SIZE / 2 + 26;
const SUB1_Y = LBL1_Y + 58;
const LBL2_Y = ICON2_CY + ICON_SIZE / 2 + 26;
const SUB2_Y = LBL2_Y + 58;
const LBL3_Y = ICON3_CY + ICON_SIZE / 2 + 26;
const SUB3_Y = LBL3_Y + 58;
const LBL4_Y = ICON4_CY + ICON_SIZE / 2 + 26;
const SUB4_Y = LBL4_Y + 58;

// Arrow zones
const P1_TOP = G1_TOP + 16;
const P1_BOT = G1_TOP + GAP_H - 16;
const P2_TOP = G2_TOP + 16;
const P2_BOT = G2_TOP + GAP_H - 16;
const P3_TOP = G3_TOP + 16;
const P3_BOT = G3_TOP + GAP_H - 16;

// ── Timing ────────────────────────────────────────────────────────────────────
const T_USER       = 8;
const T_ARR1       = 38;
const T_STOR       = 78;
const T_ARR2       = 108;
const T_COMP       = 148;
const T_COMPRESS_S = 162;
const T_COMPRESS_E = 222;
const T_ARR3       = 234;
const T_DB         = 274;

// ── Helpers ───────────────────────────────────────────────────────────────────
function easeOut(t: number) { return 1 - (1 - t) ** 3; }

function itp(frame: number, a: number, b: number, from = 0, to = 1, easing?: (t: number) => number) {
  return interpolate(frame, [a, b], [from, to], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing,
  });
}

// ── Animated arrow: dashed line draws down, arrowhead fades in at end ─────────
const VArrow: React.FC<{ y1: number; y2: number; progress: number }> = ({ y1, y2, progress }) => {
  const ARROW_H  = 26;
  const lineBot  = y2 - ARROW_H;
  const totalLen = lineBot - y1;
  const drawn    = Math.min(progress * totalLen * 1.3, totalLen);
  const headOp   = Math.max(0, (progress - 0.7) / 0.3);

  return (
    <svg
      width={60} height={y2 - y1 + 4}
      style={{ position: 'absolute', left: CX - 30, top: y1, pointerEvents: 'none', overflow: 'visible' }}
    >
      {drawn > 2 && (
        <line
          x1={30} y1={0} x2={30} y2={drawn}
          stroke={GREEN} strokeOpacity={0.5} strokeWidth={2.5}
          strokeDasharray="10 7" strokeLinecap="round"
        />
      )}
      {headOp > 0 && (
        <path
          d={`M 14 ${lineBot - y1} L 30 ${y2 - y1} L 46 ${lineBot - y1}`}
          fill="none" stroke={GREEN} strokeOpacity={headOp}
          strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"
        />
      )}
    </svg>
  );
};

// ── Icon wrapper ──────────────────────────────────────────────────────────────
const Icon: React.FC<{ cy: number; scale: number; opacity: number; glow: boolean; children: React.ReactNode }> = ({
  cy, scale, opacity, glow, children,
}) => (
  <div style={{
    position: 'absolute',
    left: CX - ICON_SIZE / 2,
    top:  cy  - ICON_SIZE / 2,
    width: ICON_SIZE, height: ICON_SIZE,
    opacity, transform: `scale(${scale})`,
    filter: glow ? `drop-shadow(0 0 32px ${GREEN}99)` : undefined,
  }}>
    {children}
  </div>
);

// ── Text label ────────────────────────────────────────────────────────────────
const Lbl: React.FC<{ y: number; text: string; size: number; weight: number; color: string; opacity: number }> = ({
  y, text, size, weight, color, opacity,
}) => (
  <div style={{
    position: 'absolute', left: 0, right: 0, top: y,
    textAlign: 'center', opacity,
    fontFamily: FONT, fontSize: size, fontWeight: weight,
    color, letterSpacing: '-0.02em', lineHeight: 1,
  }}>
    {text}
  </div>
);

// ── Official Supabase Auth icon (User) — flat green ───────────────────────────
const AuthIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 115 115">
    <rect width="113.52" height="113.52" x=".5" y=".729" fill="#1a1a1a" rx="22.19"/>
    <path fill={GREEN} fillRule="evenodd" d="M43.17 31.583c0-7.306 5.923-13.23 13.23-13.23 7.306 0 13.23 5.924 13.23 13.23v6.23h2.647c5.523 0 10 4.477 10 10v32.035c0 5.523-4.477 10-10 10H40.242c-5.523 0-10-4.477-10-10V47.813c0-5.523 4.477-10 10-10h2.927zm6 6.23h14.46v-6.23a7.23 7.23 0 0 0-14.46 0zm-8.928 6a4 4 0 0 0-4 4v5.215h22.685a3 3 0 0 1 3 3v20.46a3 3 0 0 1-3 3H36.242v.36a4 4 0 0 0 4 4h32.035a4 4 0 0 0 4-4V47.813a4 4 0 0 0-4-4zm-3.89 29.675h19.575v-4.23H36.352zm0-10.23h19.575v-4.23H36.352z" clipRule="evenodd"/>
    <rect width="111.655" height="111.655" x="1.432" y="1.661" stroke={GREEN} strokeOpacity=".15" strokeWidth="1.864" rx="21.258"/>
  </svg>
);

// ── Official Supabase Storage icon — flat green ───────────────────────────────
const StorageIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 114 115">
    <rect width="113.52" height="113.52" x=".348" y=".729" fill="#1a1a1a" rx="22.19"/>
    <path fill={GREEN} fillRule="evenodd" d="M41.617 34.565a3 3 0 0 0-3 3v8.281h2.541a9 9 0 0 1 6.312 2.585l3.124 3.073a3 3 0 0 0 2.104.862h23.125v-2.314H64.185a4 4 0 0 1-4-4V34.565zm38.208 9.397a9 9 0 0 0-.653-.724l-12.11-12.052a9 9 0 0 0-6.348-2.62H41.617a9 9 0 0 0-9 9v9.523a9 9 0 0 0-4.433 7.757v22.565a9 9 0 0 0 9 9h39.848a9 9 0 0 0 9-9V61.366c0-3.21-1.68-6.027-4.209-7.62v-4.128a9 9 0 0 0-1.136-4.379 3.6 3.6 0 0 0-.808-1.223zm-13.64-5.155v5.245h5.244zM37.183 51.846a3 3 0 0 0-3 3v22.565a3 3 0 0 0 3 3h39.848a3 3 0 0 0 3-3V61.366a3 3 0 0 0-3-3H52.698a9 9 0 0 1-6.312-2.585l-3.124-3.073a3 3 0 0 0-2.104-.862z" clipRule="evenodd"/>
    <rect width="111.655" height="111.655" x="1.28" y="1.661" stroke={GREEN} strokeOpacity=".15" strokeWidth="1.864" rx="21.258"/>
  </svg>
);

// ── Official Supabase Edge Functions icon — flat green ────────────────────────
const EdgeFunctionsIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 114 115">
    <rect width="113.52" height="113.52" y=".729" fill="#1a1a1a" rx="22.19"/>
    <path fill={GREEN} fillRule="evenodd" d="M56.5 31C41.865 31 30 42.865 30 57.5c0 3.213.57 6.289 1.616 9.134a11.4 11.4 0 0 1 4.36-1.296 21.9 21.9 0 0 1-1.44-7.838c0-12.13 9.834-21.964 21.964-21.964 2.933 0 5.732.575 8.29 1.618a11.4 11.4 0 0 1 1.329-4.355A26.4 26.4 0 0 0 56.5 31m14.153-2.764A32.4 32.4 0 0 0 56.5 25C38.55 25 24 39.55 24 57.5c0 4.876 1.076 9.507 3.004 13.664a11.4 11.4 0 0 0-1.44 5.558c0 6.311 5.117 11.428 11.429 11.428 1.957 0 3.8-.492 5.41-1.36A32.4 32.4 0 0 0 56.5 90C74.45 90 89 75.45 89 57.5c0-4.822-1.052-9.404-2.94-13.526a11.4 11.4 0 0 0 1.535-5.725c0-6.312-5.117-11.429-11.428-11.429-2 0-3.88.514-5.514 1.416M81.4 48.41a11.4 11.4 0 0 1-4.383 1.235 21.9 21.9 0 0 1 1.446 7.854c0 12.13-9.833 21.964-21.964 21.964-2.876 0-5.623-.552-8.14-1.557A11.4 11.4 0 0 1 47 82.247 26.4 26.4 0 0 0 56.5 84C71.135 84 83 72.135 83 57.5c0-3.197-.565-6.257-1.599-9.09M40.688 72.745q.165.171.336.34a5.429 5.429 0 1 1-.336-.341m4.65-3.831a15.9 15.9 0 0 0 11.162 4.55c8.817 0 15.964-7.147 15.964-15.964S65.317 41.536 56.5 41.536 40.536 48.683 40.536 57.5c0 4.26 1.668 8.13 4.386 10.992q.214.206.416.422M76.167 32.82a5.429 5.429 0 1 0 0 10.857 5.429 5.429 0 0 0 0-10.857" clipRule="evenodd"/>
    <rect width="111.655" height="111.655" x=".932" y="1.661" stroke={GREEN} strokeOpacity=".15" strokeWidth="1.864" rx="21.258"/>
  </svg>
);

// ── Official Supabase Database icon — flat green ──────────────────────────────
const DatabaseIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 115 115">
    <rect width="113.52" height="113.52" x=".5" y=".729" fill="#1a1a1a" rx="22.19"/>
    <path fill={GREEN} fillRule="evenodd" d="M33.834 36.973a7 7 0 0 1 7-7h32.854a7 7 0 0 1 7 7v8.341a7 7 0 0 1-4.196 6.416v11.517a7 7 0 0 1 4.196 6.416v8.341a7 7 0 0 1-7 7H40.834a7 7 0 0 1-7-7v-8.341a7 7 0 0 1 4.048-6.35v-11.65a7 7 0 0 1-4.048-6.349zm10.048 15.341v10.349h26.61V52.314zm-3.048-16.341a1 1 0 0 0-1 1v8.341a1 1 0 0 0 1 1h32.854a1 1 0 0 0 1-1v-8.341a1 1 0 0 0-1-1zm0 32.69a1 1 0 0 0-1 1v8.341a1 1 0 0 0 1 1h32.854a1 1 0 0 0 1-1v-8.341a1 1 0 0 0-1-1z" clipRule="evenodd"/>
    <rect width="111.655" height="111.655" x="1.432" y="1.661" stroke={GREEN} strokeOpacity=".15" strokeWidth="1.864" rx="21.258"/>
  </svg>
);

// ── Compression progress bar (shown under Edge Functions icon) ────────────────
const CompressBar: React.FC<{ progress: number; opacity: number }> = ({ progress, opacity }) => {
  const stage =
    progress < 0.33 ? 'Analyzing…'
    : progress < 0.66 ? 'Encoding…'
    : progress < 1 ? 'Optimizing…'
    : '↓ 85% smaller';

  return (
    <div style={{
      position: 'absolute', left: 120, right: 120,
      top: SUB3_Y + 48,
      opacity,
      fontFamily: FONT,
    }}>
      <div style={{
        height: 6, backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 3, overflow: 'hidden', marginBottom: 10,
      }}>
        <div style={{
          height: '100%',
          width: `${Math.round(progress * 100)}%`,
          backgroundColor: progress >= 1 ? GREEN : 'rgba(62,207,142,0.6)',
          borderRadius: 3,
          boxShadow: `0 0 10px ${GREEN}66`,
        }} />
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 28, color: progress >= 1 ? GREEN : DIM, fontWeight: progress >= 1 ? 600 : 400,
        letterSpacing: '-0.01em',
      }}>
        <span>{stage}</span>
        <span>{Math.round(progress * 100)}%</span>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export const StorageUploadFlow2: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = itp(frame, 0, 22);

  // User
  const userSp = spring({ frame: frame - T_USER, fps: 30, config: { damping: 14, stiffness: 140, mass: 0.9 } });
  const userSc = frame < T_USER ? 0 : Math.min(userSp, 1);
  const userOp = itp(frame, T_USER, T_USER + 14);

  // Arrow 1
  const arr1Op = itp(frame, T_ARR1, T_ARR1 + 35, 0, 1, easeOut);

  // Storage
  const storSp = spring({ frame: frame - T_STOR, fps: 30, config: { damping: 12, stiffness: 130, mass: 1.0 } });
  const storSc = frame < T_STOR ? 0 : Math.min(storSp, 1.05);
  const storOp = itp(frame, T_STOR, T_STOR + 14);

  // Arrow 2
  const arr2Op = itp(frame, T_ARR2, T_ARR2 + 35, 0, 1, easeOut);

  // Edge Functions / Compressor
  const compSp = spring({ frame: frame - T_COMP, fps: 30, config: { damping: 12, stiffness: 130, mass: 1.0 } });
  const compSc = frame < T_COMP ? 0 : Math.min(compSp, 1.05);
  const compOp = itp(frame, T_COMP, T_COMP + 14);
  const compressProgress = itp(frame, T_COMPRESS_S, T_COMPRESS_E, 0, 1);
  const barOp  = itp(frame, T_COMPRESS_S, T_COMPRESS_S + 14);

  // Arrow 3
  const arr3Op = itp(frame, T_ARR3, T_ARR3 + 35, 0, 1, easeOut);

  // Database
  const dbSp = spring({ frame: frame - T_DB, fps: 30, config: { damping: 12, stiffness: 130, mass: 1.0 } });
  const dbSc = frame < T_DB ? 0 : Math.min(dbSp, 1.05);
  const dbOp = itp(frame, T_DB, T_DB + 14);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden' }}>

      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 80% 60% at 50% 50%, rgba(62,207,142,0.05) 0%, transparent 70%)`,
        pointerEvents: 'none', opacity: fadeIn,
      }} />

      {/* Arrows */}
      <VArrow y1={P1_TOP} y2={P1_BOT} progress={arr1Op} />
      <VArrow y1={P2_TOP} y2={P2_BOT} progress={arr2Op} />
      <VArrow y1={P3_TOP} y2={P3_BOT} progress={arr3Op} />

      {/* Section 1: User */}
      <Icon cy={ICON1_CY} scale={userSc} opacity={userOp} glow={false}>
        <AuthIcon size={ICON_SIZE} />
      </Icon>
      <Lbl y={LBL1_Y} text="User" size={46} weight={700} color={BRIGHT} opacity={userOp} />
      <Lbl y={SUB1_Y} text="demo_video.mp4  ·  3 MB" size={30} weight={400} color={DIM} opacity={userOp} />

      {/* Section 2: Storage */}
      <Icon cy={ICON2_CY} scale={storSc} opacity={storOp} glow={frame >= T_STOR + 20}>
        <StorageIcon size={ICON_SIZE} />
      </Icon>
      <Lbl y={LBL2_Y} text="Storage" size={46} weight={700} color={BRIGHT} opacity={storOp} />
      <Lbl y={SUB2_Y} text="Supabase Storage" size={30} weight={400} color={DIM} opacity={storOp} />

      {/* Section 3: Edge Functions */}
      <Icon cy={ICON3_CY} scale={compSc} opacity={compOp} glow={frame >= T_COMP + 20}>
        <EdgeFunctionsIcon size={ICON_SIZE} />
      </Icon>
      <Lbl y={LBL3_Y} text="Edge Functions" size={46} weight={700} color={BRIGHT} opacity={compOp} />
      <Lbl y={SUB3_Y} text="compress video" size={30} weight={400} color={DIM} opacity={compOp} />
      <CompressBar progress={compressProgress} opacity={barOp} />

      {/* Section 4: Database */}
      <Icon cy={ICON4_CY} scale={dbSc} opacity={dbOp} glow={frame >= T_DB + 20}>
        <DatabaseIcon size={ICON_SIZE} />
      </Icon>
      <Lbl y={LBL4_Y} text="Database" size={46} weight={700} color={BRIGHT} opacity={dbOp} />
      <Lbl y={SUB4_Y} text="Postgres" size={30} weight={400} color={DIM} opacity={dbOp} />

      {/* Bottom accent */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, transparent, ${GREEN}66, transparent)`,
        opacity: fadeIn * 0.8,
      }} />

    </AbsoluteFill>
  );
};
