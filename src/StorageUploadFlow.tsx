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
const ICON_SIZE = 220;

// Three section zones
const ZONE_H  = 420;
const GAP_H   = 165;
const TOP_PAD = 105;

const S1_TOP = TOP_PAD;
const G1_TOP = S1_TOP + ZONE_H;
const S2_TOP = G1_TOP + GAP_H;
const G2_TOP = S2_TOP + ZONE_H;
const S3_TOP = G2_TOP + GAP_H;

const ICON1_CY = S1_TOP + ICON_SIZE / 2 + 20;
const ICON2_CY = S2_TOP + ICON_SIZE / 2 + 20;
const ICON3_CY = S3_TOP + ICON_SIZE / 2 + 20;

const LBL1_Y = ICON1_CY + ICON_SIZE / 2 + 30;
const SUB1_Y = LBL1_Y + 66;
const LBL2_Y = ICON2_CY + ICON_SIZE / 2 + 30;
const SUB2_Y = LBL2_Y + 66;
const LBL3_Y = ICON3_CY + ICON_SIZE / 2 + 30;
const SUB3_Y = LBL3_Y + 66;

const ARR1_CY = (G1_TOP + G1_TOP + GAP_H) / 2;
const ARR2_CY = (G2_TOP + G2_TOP + GAP_H) / 2;
const P1_TOP  = G1_TOP + 20;
const P1_BOT  = G1_TOP + GAP_H - 20;
const P2_TOP  = G2_TOP + 20;
const P2_BOT  = G2_TOP + GAP_H - 20;

// ── Timing ────────────────────────────────────────────────────────────────────
const T_USER = 8;
const T_ARR1 = 40;
const T_STOR = 85;
const T_ARR2 = 115;
const T_DB   = 160;

// ── Helpers ───────────────────────────────────────────────────────────────────
function easeOut(t: number) { return 1 - (1 - t) ** 3; }

function itp(frame: number, a: number, b: number, from = 0, to = 1, easing?: (t: number) => number) {
  return interpolate(frame, [a, b], [from, to], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing,
  });
}

// ── Animated arrow: dashed line draws down, arrowhead appears at the end ──────
const VArrow: React.FC<{ y1: number; y2: number; progress: number }> = ({ y1, y2, progress }) => {
  const ARROW_H  = 28;
  const lineBot  = y2 - ARROW_H;
  const totalLen = lineBot - y1;
  const drawn    = Math.min(progress * totalLen * 1.3, totalLen); // line draws first
  const headOp   = Math.max(0, (progress - 0.7) / 0.3);          // arrowhead fades in at end

  return (
    <svg
      width={60} height={y2 - y1 + 4}
      style={{ position: 'absolute', left: CX - 30, top: y1, pointerEvents: 'none', overflow: 'visible' }}
    >
      {/* Dashed line — stops before arrowhead */}
      {drawn > 2 && (
        <line
          x1={30} y1={0}
          x2={30} y2={drawn}
          stroke={GREEN}
          strokeOpacity={0.5}
          strokeWidth={2.5}
          strokeDasharray="10 7"
          strokeLinecap="round"
        />
      )}
      {/* Arrowhead — appears only after line is drawn */}
      {headOp > 0 && (
        <path
          d={`M 14 ${lineBot - y1} L 30 ${y2 - y1} L 46 ${lineBot - y1}`}
          fill="none"
          stroke={GREEN}
          strokeOpacity={headOp}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
};

// ── Official Supabase Auth icon — flat green, no gradients ────────────────────
const AuthIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 115 115">
    <rect width="113.52" height="113.52" x=".5" y=".729" fill="#1a1a1a" rx="22.19"/>
    <path fill={GREEN} fillRule="evenodd" d="M43.17 31.583c0-7.306 5.923-13.23 13.23-13.23 7.306 0 13.23 5.924 13.23 13.23v6.23h2.647c5.523 0 10 4.477 10 10v32.035c0 5.523-4.477 10-10 10H40.242c-5.523 0-10-4.477-10-10V47.813c0-5.523 4.477-10 10-10h2.927zm6 6.23h14.46v-6.23a7.23 7.23 0 0 0-14.46 0zm-8.928 6a4 4 0 0 0-4 4v5.215h22.685a3 3 0 0 1 3 3v20.46a3 3 0 0 1-3 3H36.242v.36a4 4 0 0 0 4 4h32.035a4 4 0 0 0 4-4V47.813a4 4 0 0 0-4-4zm-3.89 29.675h19.575v-4.23H36.352zm0-10.23h19.575v-4.23H36.352z" clipRule="evenodd"/>
    <rect width="111.655" height="111.655" x="1.432" y="1.661" stroke={GREEN} strokeOpacity=".15" strokeWidth="1.864" rx="21.258"/>
  </svg>
);

// ── Official Supabase Storage icon — flat green, no gradients ────────────────
const StorageIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 114 115">
    <rect width="113.52" height="113.52" x=".348" y=".729" fill="#1a1a1a" rx="22.19"/>
    <path fill={GREEN} fillRule="evenodd" d="M41.617 34.565a3 3 0 0 0-3 3v8.281h2.541a9 9 0 0 1 6.312 2.585l3.124 3.073a3 3 0 0 0 2.104.862h23.125v-2.314H64.185a4 4 0 0 1-4-4V34.565zm38.208 9.397a9 9 0 0 0-.653-.724l-12.11-12.052a9 9 0 0 0-6.348-2.62H41.617a9 9 0 0 0-9 9v9.523a9 9 0 0 0-4.433 7.757v22.565a9 9 0 0 0 9 9h39.848a9 9 0 0 0 9-9V61.366c0-3.21-1.68-6.027-4.209-7.62v-4.128a9 9 0 0 0-1.136-4.379 3.6 3.6 0 0 0-.808-1.223zm-13.64-5.155v5.245h5.244zM37.183 51.846a3 3 0 0 0-3 3v22.565a3 3 0 0 0 3 3h39.848a3 3 0 0 0 3-3V61.366a3 3 0 0 0-3-3H52.698a9 9 0 0 1-6.312-2.585l-3.124-3.073a3 3 0 0 0-2.104-.862z" clipRule="evenodd"/>
    <rect width="111.655" height="111.655" x="1.28" y="1.661" stroke={GREEN} strokeOpacity=".15" strokeWidth="1.864" rx="21.258"/>
  </svg>
);

// ── Official Supabase Database icon — flat green, no gradients ───────────────
const DatabaseIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 115 115">
    <rect width="113.52" height="113.52" x=".5" y=".729" fill="#1a1a1a" rx="22.19"/>
    <path fill={GREEN} fillRule="evenodd" d="M33.834 36.973a7 7 0 0 1 7-7h32.854a7 7 0 0 1 7 7v8.341a7 7 0 0 1-4.196 6.416v11.517a7 7 0 0 1 4.196 6.416v8.341a7 7 0 0 1-7 7H40.834a7 7 0 0 1-7-7v-8.341a7 7 0 0 1 4.048-6.35v-11.65a7 7 0 0 1-4.048-6.349zm10.048 15.341v10.349h26.61V52.314zm-3.048-16.341a1 1 0 0 0-1 1v8.341a1 1 0 0 0 1 1h32.854a1 1 0 0 0 1-1v-8.341a1 1 0 0 0-1-1zm0 32.69a1 1 0 0 0-1 1v8.341a1 1 0 0 0 1 1h32.854a1 1 0 0 0 1-1v-8.341a1 1 0 0 0-1-1z" clipRule="evenodd"/>
    <rect width="111.655" height="111.655" x="1.432" y="1.661" stroke={GREEN} strokeOpacity=".15" strokeWidth="1.864" rx="21.258"/>
  </svg>
);

// ── Icon wrapper ──────────────────────────────────────────────────────────────
const Icon: React.FC<{
  cy: number; scale: number; opacity: number; glow: boolean;
  children: React.ReactNode;
}> = ({ cy, scale, opacity, glow, children }) => (
  <div style={{
    position: 'absolute',
    left: CX - ICON_SIZE / 2,
    top:  cy  - ICON_SIZE / 2,
    width: ICON_SIZE, height: ICON_SIZE,
    opacity,
    transform: `scale(${scale})`,
    filter: glow ? `drop-shadow(0 0 40px ${GREEN}88)` : undefined,
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
    fontFamily: FONT,
    fontSize: size, fontWeight: weight, color,
    letterSpacing: '-0.02em', lineHeight: 1,
  }}>
    {text}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export const StorageUploadFlow: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = itp(frame, 0, 22);

  const userSp  = spring({ frame: frame - T_USER, fps: 30, config: { damping: 14, stiffness: 140, mass: 0.9 } });
  const userSc  = frame < T_USER ? 0 : Math.min(userSp, 1);
  const userOp  = itp(frame, T_USER, T_USER + 14);

  const arr1Op  = itp(frame, T_ARR1, T_ARR1 + 35, 0, 1, easeOut);

  const storSp  = spring({ frame: frame - T_STOR, fps: 30, config: { damping: 12, stiffness: 130, mass: 1.0 } });
  const storSc  = frame < T_STOR ? 0 : Math.min(storSp, 1.05);
  const storOp  = itp(frame, T_STOR, T_STOR + 14);

  const arr2Op  = itp(frame, T_ARR2, T_ARR2 + 35, 0, 1, easeOut);

  const dbSp    = spring({ frame: frame - T_DB, fps: 30, config: { damping: 12, stiffness: 130, mass: 1.0 } });
  const dbSc    = frame < T_DB ? 0 : Math.min(dbSp, 1.05);
  const dbOp    = itp(frame, T_DB, T_DB + 14);

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

      {/* Section 1: User / Auth */}
      <Icon cy={ICON1_CY} scale={userSc} opacity={userOp} glow={false}>
        <AuthIcon size={ICON_SIZE} />
      </Icon>
      <Lbl y={LBL1_Y} text="User" size={52} weight={700} color={BRIGHT} opacity={userOp} />
      <Lbl y={SUB1_Y} text="demo_video.mp4" size={34} weight={400} color={DIM} opacity={userOp} />

      {/* Section 2: Storage */}
      <Icon cy={ICON2_CY} scale={storSc} opacity={storOp} glow={frame >= T_STOR + 20}>
        <StorageIcon size={ICON_SIZE} />
      </Icon>
      <Lbl y={LBL2_Y} text="Storage" size={52} weight={700} color={BRIGHT} opacity={storOp} />
      <Lbl y={SUB2_Y} text="Supabase Storage" size={34} weight={400} color={DIM} opacity={storOp} />

      {/* Section 3: Database */}
      <Icon cy={ICON3_CY} scale={dbSc} opacity={dbOp} glow={frame >= T_DB + 20}>
        <DatabaseIcon size={ICON_SIZE} />
      </Icon>
      <Lbl y={LBL3_Y} text="Database" size={52} weight={700} color={BRIGHT} opacity={dbOp} />
      <Lbl y={SUB3_Y} text="Postgres" size={34} weight={400} color={DIM} opacity={dbOp} />

      {/* Bottom accent */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, transparent, ${GREEN}66, transparent)`,
        opacity: fadeIn * 0.8,
      }} />

    </AbsoluteFill>
  );
};
