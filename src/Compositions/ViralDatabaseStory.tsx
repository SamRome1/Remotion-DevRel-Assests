import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  staticFile,
} from 'remotion';

// ─── Constants ────────────────────────────────────────────────────────────────

const BG = '#0d1117';
const GREEN = '#3ECF8E';
const WHITE = '#ffffff';

// Canvas centre for 1080x1920
const CX = 540;
const CY = 960;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCount(n: number): string {
  return n.toLocaleString('en-US');
}

// Seeded pseudo-random (deterministic) — avoids Math.random() in render
function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 43758.5453123;
  return x - Math.floor(x);
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────

// X/Twitter bird — clean SVG path approximation
const BirdPath: React.FC<{ size: number; color: string; opacity?: number }> = ({
  size,
  color,
  opacity = 1,
}) => {
  const s = size / 24;
  return (
    <g transform={`scale(${s}) translate(-12,-12)`} opacity={opacity}>
      <path
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        fill={color}
      />
    </g>
  );
};

// Database cylinder icon
const DatabaseIcon: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  opacity?: number;
}> = ({ x, y, size, color, opacity = 1 }) => {
  const w = size * 0.9;
  const h = size * 1.2;
  const ry = size * 0.18; // ellipse y-radius for top/bottom caps
  return (
    <g transform={`translate(${x - w / 2}, ${y - h / 2})`} opacity={opacity}>
      {/* Body */}
      <rect x={0} y={ry} width={w} height={h - ry * 2} fill={color} rx={2} />
      {/* Bottom cap */}
      <ellipse cx={w / 2} cy={h - ry} rx={w / 2} ry={ry} fill={color} />
      {/* Top cap (slightly darker shade for depth) */}
      <ellipse
        cx={w / 2}
        cy={ry}
        rx={w / 2}
        ry={ry}
        fill="none"
        stroke={color}
        strokeWidth={2}
      />
      <ellipse cx={w / 2} cy={ry} rx={w / 2} ry={ry} fill={`${color}cc`} />
      {/* Horizontal lines on body for depth */}
      <line
        x1={2}
        y1={ry + (h - ry * 2) * 0.35}
        x2={w - 2}
        y2={ry + (h - ry * 2) * 0.35}
        stroke={`${color}55`}
        strokeWidth={1.5}
      />
      <line
        x1={2}
        y1={ry + (h - ry * 2) * 0.65}
        x2={w - 2}
        y2={ry + (h - ry * 2) * 0.65}
        stroke={`${color}55`}
        strokeWidth={1.5}
      />
    </g>
  );
};

// File document icon (rectangle with folded corner)
const FileIcon: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  opacity?: number;
}> = ({ x, y, size, color, opacity = 1 }) => {
  const w = size * 0.75;
  const h = size;
  const fold = size * 0.22;
  return (
    <g transform={`translate(${x - w / 2}, ${y - h / 2})`} opacity={opacity}>
      <path
        d={`M0,0 L${w - fold},0 L${w},${fold} L${w},${h} L0,${h} Z`}
        fill={`${color}22`}
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* Folded corner triangle */}
      <path
        d={`M${w - fold},0 L${w - fold},${fold} L${w},${fold} Z`}
        fill={`${color}55`}
        stroke={color}
        strokeWidth={1.5}
      />
      {/* Lines representing text */}
      {[0.38, 0.52, 0.66, 0.8].map((frac, i) => (
        <line
          key={i}
          x1={w * 0.18}
          y1={h * frac}
          x2={w * (i === 3 ? 0.6 : 0.82)}
          y2={h * frac}
          stroke={`${color}88`}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
};

// Brain / neural node — organic blob with radiating connectors
const BrainIcon: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  opacity?: number;
}> = ({ x, y, size, color, opacity = 1 }) => {
  const r = size / 2;
  // Organic shape via SVG path around a circle
  const nodeRadius = r * 0.22;
  const nodePositions = [
    { angle: -90, dist: r * 0.48 },
    { angle: -30, dist: r * 0.52 },
    { angle: 30, dist: r * 0.55 },
    { angle: 90, dist: r * 0.48 },
    { angle: 150, dist: r * 0.52 },
    { angle: 210, dist: r * 0.55 },
  ];
  return (
    <g transform={`translate(${x}, ${y})`} opacity={opacity}>
      {/* Outer glow ring */}
      <circle cx={0} cy={0} r={r} fill="none" stroke={`${color}33`} strokeWidth={r * 0.15} />
      {/* Main circle */}
      <circle cx={0} cy={0} r={r * 0.62} fill={`${color}18`} stroke={color} strokeWidth={2.5} />
      {/* Connector lines to nodes */}
      {nodePositions.map((n, i) => {
        const rad = (n.angle * Math.PI) / 180;
        const nx = Math.cos(rad) * n.dist;
        const ny = Math.sin(rad) * n.dist;
        return (
          <line
            key={i}
            x1={0}
            y1={0}
            x2={nx}
            y2={ny}
            stroke={`${color}66`}
            strokeWidth={2}
          />
        );
      })}
      {/* Outer nodes */}
      {nodePositions.map((n, i) => {
        const rad = (n.angle * Math.PI) / 180;
        const nx = Math.cos(rad) * n.dist;
        const ny = Math.sin(rad) * n.dist;
        return (
          <circle key={i} cx={nx} cy={ny} r={nodeRadius} fill={color} opacity={0.85} />
        );
      })}
      {/* Center dot */}
      <circle cx={0} cy={0} r={r * 0.15} fill={color} />
    </g>
  );
};

// Lock / padlock icon (inside brain)
const LockIcon: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  opacity?: number;
}> = ({ x, y, size, color, opacity = 1 }) => {
  const bw = size * 0.6;
  const bh = size * 0.45;
  const archR = size * 0.22;
  return (
    <g transform={`translate(${x - bw / 2}, ${y - size * 0.5})`} opacity={opacity}>
      {/* Shackle arc */}
      <path
        d={`M${bw * 0.25},${size * 0.42} L${bw * 0.25},${size * 0.22} A${archR},${archR} 0 0,1 ${bw * 0.75},${size * 0.22} L${bw * 0.75},${size * 0.42}`}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
      {/* Body */}
      <rect
        x={0}
        y={size * 0.4}
        width={bw}
        height={bh}
        rx={size * 0.06}
        fill={`${color}33`}
        stroke={color}
        strokeWidth={2}
      />
      {/* Keyhole */}
      <circle cx={bw / 2} cy={size * 0.4 + bh * 0.4} r={size * 0.07} fill={color} />
      <rect
        x={bw / 2 - size * 0.04}
        y={size * 0.4 + bh * 0.44}
        width={size * 0.08}
        height={bh * 0.3}
        fill={color}
        rx={1}
      />
    </g>
  );
};

// Human person / Stan silhouette
const PersonIcon: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  opacity?: number;
}> = ({ x, y, size, color, opacity = 1 }) => {
  const headR = size * 0.19;
  const shoulderY = headR * 2.4;
  const hipY = size * 0.55;
  const sw = size * 0.065; // stroke width
  return (
    <g transform={`translate(${x}, ${y - size * 0.28})`} opacity={opacity}>
      {/* Head */}
      <circle cx={0} cy={0} r={headR} fill={color} />
      {/* Neck + torso */}
      <line x1={0} y1={headR} x2={0} y2={hipY}
        stroke={color} strokeWidth={sw} strokeLinecap="round" />
      {/* Arms */}
      <line x1={-size * 0.32} y1={shoulderY + size * 0.06} x2={size * 0.32} y2={shoulderY + size * 0.06}
        stroke={color} strokeWidth={sw * 0.9} strokeLinecap="round" />
      {/* Legs */}
      <line x1={0} y1={hipY} x2={-size * 0.22} y2={size * 1.0}
        stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={0} y1={hipY} x2={size * 0.22} y2={size * 1.0}
        stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </g>
  );
};

// Sparkle / star burst
const Sparkle: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  opacity?: number;
  rotation?: number;
}> = ({ x, y, size, color, opacity = 1, rotation = 0 }) => {
  const r1 = size;
  const r2 = size * 0.4;
  const pts = 4;
  const points = Array.from({ length: pts * 2 }, (_, i) => {
    const angle = (i * Math.PI) / pts - Math.PI / 2 + (rotation * Math.PI) / 180;
    const r = i % 2 === 0 ? r1 : r2;
    return `${x + Math.cos(angle) * r},${y + Math.sin(angle) * r}`;
  }).join(' ');
  return <polygon points={points} fill={color} opacity={opacity} />;
};

// ─── Scene 1: Viral Tweet → Databases ────────────────────────────────────────

// Generate a deterministic scattered grid of database positions
const DB_COUNT = 52;
const DB_POSITIONS = Array.from({ length: DB_COUNT }, (_, i) => {
  const col = i % 8;
  const row = Math.floor(i / 8);
  const cols = 8;
  const rows = Math.ceil(DB_COUNT / 8);
  const marginX = 90;
  const marginY = 280;
  const spacingX = (1080 - marginX * 2) / (cols - 1);
  const spacingY = (1920 - marginY * 2) / (rows - 1);
  // Add deterministic jitter
  const jx = (seededRandom(i * 7 + 1) - 0.5) * spacingX * 0.45;
  const jy = (seededRandom(i * 7 + 3) - 0.5) * spacingY * 0.45;
  return {
    x: marginX + col * spacingX + jx,
    y: marginY + row * spacingY + jy,
  };
});

const Scene1: React.FC<{ frame: number }> = ({ frame }) => {
  // Bird: present from frame 0, glow pulses
  const birdScale = interpolate(frame, [0, 20], [0.4, 1], {
    easing: Easing.out(Easing.back(1.4)),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Bird fades out as databases arrive
  const birdOpacity = interpolate(frame, [50, 90], [1, 0.18], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Ripple rings — 3 staggered rings
  const rippleRings = [0, 18, 36].map((delay) => {
    const t = Math.max(0, frame - delay);
    const scale = interpolate(t, [0, 80], [0.1, 2.8], {
      easing: Easing.out(Easing.quad),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const opacity = interpolate(t, [0, 80], [0.9, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return { scale, opacity };
  });

  // Counter
  const count = Math.round(
    interpolate(frame, [60, 140], [0, 5247], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );

  const counterOpacity = interpolate(frame, [60, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Counter scale pop at end
  const counterScale = interpolate(frame, [138, 148], [1, 1.1], {
    easing: Easing.out(Easing.back(2)),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <>
      {/* Ripple rings from bird */}
      <svg
        width={1080}
        height={1920}
        style={{ position: 'absolute', top: 0, left: 0 }}
        viewBox="0 0 1080 1920"
      >
        {rippleRings.map((ring, i) => (
          <circle
            key={i}
            cx={CX}
            cy={CY * 0.52}
            r={140}
            fill="none"
            stroke={WHITE}
            strokeWidth={3}
            opacity={ring.opacity}
            transform={`scale(${ring.scale})`}
            style={{ transformOrigin: `${CX}px ${CY * 0.52}px` }}
          />
        ))}

        {/* Database icons */}
        {DB_POSITIONS.map((pos, i) => {
          // Stagger: each DB has a delay proportional to index
          const spawnStart = 30 + i * 1.8;
          const t = Math.max(0, frame - spawnStart);
          const progress = interpolate(t, [0, 22], [0, 1], {
            easing: Easing.out(Easing.back(1.1)),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          // Fly from center to final position
          const startX = CX;
          const startY = CY * 0.52;
          const currentX = startX + (pos.x - startX) * progress;
          const currentY = startY + (pos.y - startY) * progress;
          const dbOpacity = interpolate(t, [0, 8], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const dbScale = interpolate(t, [0, 22], [0.3, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          if (frame < spawnStart) return null;

          return (
            <DatabaseIcon
              key={i}
              x={currentX}
              y={currentY}
              size={52 * dbScale}
              color={GREEN}
              opacity={dbOpacity}
            />
          );
        })}

        {/* Bird icon in center */}
        <g
          transform={`translate(${CX}, ${CY * 0.52}) scale(${birdScale})`}
          style={{ transformOrigin: `${CX}px ${CY * 0.52}px` }}
          opacity={birdOpacity}
        >
          <circle cx={0} cy={0} r={68} fill="rgba(255,255,255,0.08)" />
          <circle cx={0} cy={0} r={50} fill="rgba(255,255,255,0.12)" />
          <BirdPath size={80} color={WHITE} />
        </g>

        {/* Glow beneath bird */}
        <circle
          cx={CX}
          cy={CY * 0.52}
          r={90}
          fill="none"
          stroke={WHITE}
          strokeWidth={1}
          opacity={interpolate(frame, [0, 30, 60], [0, 0.3, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })}
        />
      </svg>

      {/* Counter: large numerals, no label */}
      <div
        style={{
          position: 'absolute',
          bottom: 180,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: counterOpacity,
          transform: `scale(${counterScale})`,
        }}
      >
        <span
          style={{
            color: WHITE,
            fontSize: 200,
            fontWeight: 800,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            letterSpacing: '-6px',
            lineHeight: 1,
          }}
        >
          {formatCount(count)}
        </span>
      </div>
    </>
  );
};

// ─── Scene 2: Building in an Afternoon ───────────────────────────────────────

// File positions (left/right alternating, flowing into center)
const FILE_DEFS = [
  { x: 120, y: 680, side: 'left' },
  { x: 960, y: 780, side: 'right' },
  { x: 100, y: 940, side: 'left' },
  { x: 980, y: 960, side: 'right' },
  { x: 130, y: 1120, side: 'left' },
  { x: 950, y: 1140, side: 'right' },
] as const;

const BRAIN_X = CX;
const BRAIN_Y = 980;

// Key orbit parameters
const KEY_ORBIT_R = 200;

// Sparkle positions around bird in stage D
const SPARKLE_DEFS = Array.from({ length: 18 }, (_, i) => ({
  angle: (i * 360) / 18,
  dist: 180 + seededRandom(i * 13) * 200,
  size: 20 + seededRandom(i * 5) * 28,
  delay: i * 3,
}));

const Scene2: React.FC<{ frame: number }> = ({ frame }) => {
  // Relative frame within scene 2 (starts at frame 180)
  const f = frame - 180;

  // Stage B: brain + lock + key (f 70–140)
  const stageBActive = f >= 70 && f <= 140;
  // Stage D: bird burst (f 190–240)
  const stageDActive = f >= 190 && f <= 240;

  // Brain opacity — present from stage A onward
  const brainOpacity = interpolate(f, [0, 20], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Brain pulse in stage B
  const brainPulseScale = stageBActive
    ? 1 +
      0.1 *
        Math.sin(
          interpolate(f, [70, 140], [0, Math.PI * 6], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        )
    : 1;

  // Lock appears in stage B
  const lockOpacity = interpolate(f, [75, 95], [0, 1], {
    easing: Easing.out(Easing.back(1.2)),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Key orbit in stage B
  const keyAngle = interpolate(f, [70, 140], [0, Math.PI * 2.5], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const keyX = BRAIN_X + Math.cos(keyAngle) * KEY_ORBIT_R;
  const keyY = BRAIN_Y + Math.sin(keyAngle) * KEY_ORBIT_R;
  const keyOpacity = interpolate(f, [72, 88], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const keyFadeOut = interpolate(f, [130, 142], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Stage C: GitHub octocat
  const octocatOpacity = interpolate(f, [140, 162], [0, 1], {
    easing: Easing.out(Easing.back(1.1)),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Up arrow for push — animates upward
  const arrowOffsetY = interpolate(f, [148, 185], [0, -90], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const arrowOpacity = interpolate(f, [148, 162, 183, 190], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Progress bar fill
  const progressFill = interpolate(f, [148, 188], [0, 1], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const progressOpacity = interpolate(f, [146, 160, 188, 196], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Stage D: Bird reappears + sparkles
  const stageDOpacity = interpolate(f, [190, 208], [0, 1], {
    easing: Easing.out(Easing.back(1.2)),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Octocat and brain fade out in stage D
  const prevStagesFade = interpolate(f, [190, 210], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const octocatFinal = stageDActive ? prevStagesFade : 1;
  // Brain fades out as GitHub logo appears in Stage C, then again in Stage D
  const brainStageCFade = interpolate(f, [140, 162], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const brainFinalOpacity =
    f > 190 ? brainOpacity * prevStagesFade
    : f >= 140 ? brainOpacity * brainStageCFade
    : brainOpacity;

  return (
    <>
      <svg
        width={1080}
        height={1920}
        style={{ position: 'absolute', top: 0, left: 0 }}
        viewBox="0 0 1080 1920"
      >
        {/* ── Stage A: Files flowing to brain ── */}
        {FILE_DEFS.map((fd, i) => {
          const delay = i * 9;
          const t = Math.max(0, f - delay);
          const fileOpacity = interpolate(t, [0, 14], [0, 1], {
            easing: Easing.out(Easing.cubic),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const fileFade = interpolate(f, [65, 80], [1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          if (f < delay) return null;

          // Dotted arrow from file to brain
          const arrowProgress = interpolate(t, [8, 30], [0, 1], {
            easing: Easing.inOut(Easing.cubic),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const ax = fd.x + (BRAIN_X - fd.x) * arrowProgress;
          const ay = fd.y + (BRAIN_Y - fd.y) * arrowProgress;

          return (
            <g key={i} opacity={fileOpacity * fileFade}>
              <FileIcon x={fd.x} y={fd.y} size={88} color={WHITE} />
              {/* Dotted path toward brain */}
              <line
                x1={fd.x}
                y1={fd.y}
                x2={ax}
                y2={ay}
                stroke={`${GREEN}88`}
                strokeWidth={2.5}
                strokeDasharray="8 6"
                strokeLinecap="round"
              />
              {/* Arrow head */}
              <circle cx={ax} cy={ay} r={5} fill={GREEN} opacity={0.8} />
            </g>
          );
        })}

        {/* ── Brain (stages A–C) ── */}
        <g opacity={brainFinalOpacity}>
          <BrainIcon
            x={BRAIN_X}
            y={BRAIN_Y}
            size={260 * brainPulseScale}
            color={GREEN}
          />
        </g>

        {/* ── Lock inside brain (stage B) ── */}
        <g opacity={lockOpacity * (f > 190 ? prevStagesFade : 1)}>
          <LockIcon x={BRAIN_X} y={BRAIN_Y - 10} size={90} color={WHITE} />
        </g>

        {/* ── Key orbiting brain (stage B) ── */}
        {f >= 70 && f < 145 && (
          <g opacity={keyOpacity * keyFadeOut}>
            {/* Key body */}
            <circle cx={keyX} cy={keyY} r={18} fill="none" stroke={GREEN} strokeWidth={3} />
            <line
              x1={keyX + 18}
              y1={keyY}
              x2={keyX + 46}
              y2={keyY}
              stroke={GREEN}
              strokeWidth={3}
              strokeLinecap="round"
            />
            <line
              x1={keyX + 36}
              y1={keyY}
              x2={keyX + 36}
              y2={keyY + 10}
              stroke={GREEN}
              strokeWidth={3}
              strokeLinecap="round"
            />
            <line
              x1={keyX + 44}
              y1={keyY}
              x2={keyX + 44}
              y2={keyY + 8}
              stroke={GREEN}
              strokeWidth={3}
              strokeLinecap="round"
            />
          </g>
        )}

        {/* ── Stage C: GitHub logo (centered, replaces brain) ── */}
        {f >= 140 && (
          <g opacity={octocatOpacity * octocatFinal}>
            {/* Logo centered on screen */}
            <image
              href={staticFile('github.png')}
              x={CX - 110}
              y={CY - 110}
              width={220}
              height={220}
              style={{ filter: 'invert(1)' }}
            />

            {/* Progress bar — below the logo */}
            <g opacity={progressOpacity}>
              <rect
                x={CX - 220}
                y={CY + 148}
                width={440}
                height={12}
                rx={6}
                fill="rgba(255,255,255,0.12)"
              />
              <rect
                x={CX - 220}
                y={CY + 148}
                width={440 * progressFill}
                height={12}
                rx={6}
                fill={GREEN}
              />
            </g>
          </g>
        )}

        {/* ── Stage D: Bird + sparkle burst ── */}
        {f >= 190 && (
          <g opacity={stageDOpacity}>
            {/* Bird center */}
            <circle cx={CX} cy={CY * 0.75} r={80} fill="rgba(255,255,255,0.07)" />
            <circle cx={CX} cy={CY * 0.75} r={58} fill="rgba(255,255,255,0.10)" />
            <g transform={`translate(${CX}, ${CY * 0.75})`}>
              <BirdPath size={90} color={WHITE} />
            </g>

            {/* Sparkles radiating outward */}
            {SPARKLE_DEFS.map((sp, i) => {
              const t2 = Math.max(0, f - 190 - sp.delay);
              const spProgress = interpolate(t2, [0, 30], [0, 1], {
                easing: Easing.out(Easing.quad),
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              const spOpacity = interpolate(t2, [0, 8, 25, 34], [0, 1, 0.8, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              const rad = (sp.angle * Math.PI) / 180;
              const sx = CX + Math.cos(rad) * sp.dist * spProgress;
              const sy = CY * 0.75 + Math.sin(rad) * sp.dist * spProgress;

              return (
                <Sparkle
                  key={i}
                  x={sx}
                  y={sy}
                  size={sp.size * (0.5 + spProgress * 0.5)}
                  color={i % 3 === 0 ? GREEN : WHITE}
                  opacity={spOpacity}
                  rotation={sp.angle}
                />
              );
            })}
          </g>
        )}
      </svg>
    </>
  );
};

// ─── Transition: Flash + Fade to Black ───────────────────────────────────────

const Transition: React.FC<{ frame: number }> = ({ frame }) => {
  // White flash at frame 150
  const flashOpacity = interpolate(frame, [150, 153, 162], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fade to black 150→180
  const blackOpacity = interpolate(frame, [150, 180], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fade in from black 180→205
  const fadeIn = interpolate(frame, [180, 205], [1, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <>
      {frame >= 150 && frame <= 180 && (
        <AbsoluteFill style={{ background: '#000000', opacity: blackOpacity }} />
      )}
      {frame > 180 && frame <= 210 && (
        <AbsoluteFill style={{ background: '#000000', opacity: fadeIn }} />
      )}
      {frame >= 150 && frame <= 162 && (
        <AbsoluteFill style={{ background: '#ffffff', opacity: flashOpacity }} />
      )}
    </>
  );
};

// ─── Background Grid ─────────────────────────────────────────────────────────

const BackgroundGrid: React.FC = () => (
  <svg
    width={1080}
    height={1920}
    style={{ position: 'absolute', top: 0, left: 0 }}
    viewBox="0 0 1080 1920"
  >
    <defs>
      <pattern id="grid" width={80} height={80} patternUnits="userSpaceOnUse">
        <path
          d="M 80 0 L 0 0 0 80"
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={1}
        />
      </pattern>
    </defs>
    <rect width={1080} height={1920} fill="url(#grid)" />
  </svg>
);

// ─── Main Composition ─────────────────────────────────────────────────────────

export const ViralDatabaseStory: React.FC = () => {
  const frame = useCurrentFrame();
  useVideoConfig(); // ensures Remotion context is active

  const isScene1 = frame < 150;
  const isScene2 = frame >= 180;

  // Stan appears on black during transition, then dissolves into the brain
  const stanFadeIn = interpolate(frame, [158, 172], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const stanFadeOut = interpolate(frame, [174, 196], [1, 0], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const stanOpacity = Math.min(stanFadeIn, stanFadeOut);

  // Color shifts white → Supabase green as he dissolves
  const stanGlow = interpolate(frame, [168, 194], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const stanR = Math.round(255 - stanGlow * (255 - 62));
  const stanG = Math.round(255 - stanGlow * (255 - 207));
  const stanB = Math.round(255 - stanGlow * (255 - 142));
  const stanColor = `rgb(${stanR},${stanG},${stanB})`;

  // Glow ring that expands as Stan dissolves into the brain
  const glowR = interpolate(frame, [168, 196], [30, 180], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const glowOpacity = stanGlow * stanFadeOut * 0.55;

  return (
    <AbsoluteFill
      style={{
        background: BG,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Subtle dot-grid background */}
      <BackgroundGrid />

      {/* Scene 1 */}
      {isScene1 && <Scene1 frame={frame} />}

      {/* Scene 2 */}
      {isScene2 && <Scene2 frame={frame} />}

      {/* Transition overlay (covers transition + scene boundaries) */}
      <Transition frame={frame} />

      {/* Stan: appears on the black transition, dissolves into Scene 2 brain */}
      {frame >= 155 && frame <= 200 && (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          <svg
            width={1080}
            height={1920}
            viewBox="0 0 1080 1920"
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <defs>
              <radialGradient id="stanGlowGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={GREEN} stopOpacity={glowOpacity * 1.4} />
                <stop offset="55%" stopColor={GREEN} stopOpacity={glowOpacity * 0.5} />
                <stop offset="100%" stopColor={GREEN} stopOpacity={0} />
              </radialGradient>
            </defs>
            {/* Expanding green glow — same center as the brain in Scene 2 */}
            <circle cx={CX} cy={CY} r={glowR} fill="url(#stanGlowGrad)" />
            {/* Stan silhouette */}
            <PersonIcon
              x={CX}
              y={CY}
              size={280}
              color={stanColor}
              opacity={stanOpacity}
            />
          </svg>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
