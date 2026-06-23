import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import {
  BG,
  FG,
  FG_LIGHT,
  FG_MUTED,
  MONO,
  BORDER,
  SURFACE_100,
  DotGrid,
} from '../tokens';
import { circularFamily } from '../fonts';
import { Folder, FolderOpen, FileText } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens — Claude orange accent
// ─────────────────────────────────────────────────────────────────────────────
const ORANGE      = '#D97757';
const ORANGE_GLOW = 'rgba(217, 119, 87, 0.4)';
const ORANGE_DIM  = 'rgba(217, 119, 87, 0.12)';
const ORANGE_BDR  = 'rgba(217, 119, 87, 0.3)';

// Folder neutral accent
const FOLDER_COLOR = FG_LIGHT;
const FOLDER_OPEN  = 'rgba(255,255,255,0.7)';

// Terminal prompt colors
const PROMPT_COLOR = 'rgba(255,255,255,0.35)'; // $ glyph
const CMD_COLOR    = ORANGE;                     // /cd in orange

// ─────────────────────────────────────────────────────────────────────────────
// Timing (frames @ 30 fps)
// ─────────────────────────────────────────────────────────────────────────────
// Phase 1: Folders spring in
const F_SRC_IN  = 0;
const F_DST_IN  = 12;
// Phase 2: File appears inside source folder
const F_FILE_IN = 45;
// Phase 3: Terminal slides in + command types
const F_TERM_IN    = 60;   // terminal bar entrance
const F_TYPE_START = 80;   // typing begins
const F_TYPE_END   = 138;  // typing ends (18 chars × ~3.2 frames)
const F_ENTER      = 148;  // "enter" key flash moment
// Phase 4: File lifts and travels
const F_LIFT         = 160;
const F_TRAVEL_START = 175;
const F_TRAVEL_END   = 262;
// Phase 5: Drop + bounce + folder reacts
const F_DROP    = 262;
const F_SETTLE  = 295;
// Phase 6: Hold / pulse
const F_HOLD    = 315;

// The command to type out
const COMMAND_TEXT = '/cd ~/new-project';
// Chars split: prefix = '/cd', suffix = ' ~/new-project'
const CMD_SLASH_PART = '/cd';
const CMD_PATH_PART  = ' ~/new-project';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function clamp(frame: number, start: number, end: number, from: number, to: number): number {
  return interpolate(frame, [start, end], [from, to], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });
}

// Easing — ease-in-out cubic for the arc travel
function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// How many characters to reveal at a given frame
function charsAtFrame(frame: number): number {
  const total = COMMAND_TEXT.length;
  const progress = clamp(frame, F_TYPE_START, F_TYPE_END, 0, 1);
  return Math.floor(progress * total);
}

// ─────────────────────────────────────────────────────────────────────────────
// Claude sunburst SVG mark
// ─────────────────────────────────────────────────────────────────────────────
const ClaudeMark: React.FC<{ size?: number; color?: string; glow?: number }> = ({
  size  = 64,
  color = ORANGE,
  glow  = 0,
}) => {
  const spokes = 16;
  const cx = 50;
  const cy = 50;
  const outerR = 42;
  const innerR = 22;
  const tipW   = 3.5;
  const baseW  = 6;

  const paths: string[] = [];
  for (let i = 0; i < spokes; i++) {
    const angle = (i / spokes) * Math.PI * 2 - Math.PI / 2;
    const isLong = i % 2 === 0;
    const r = isLong ? outerR : innerR + (outerR - innerR) * 0.45;

    const tipX = cx + Math.cos(angle) * r;
    const tipY = cy + Math.sin(angle) * r;

    const perpAngle = angle + Math.PI / 2;
    const bx1 = cx + Math.cos(perpAngle) * baseW;
    const by1 = cy + Math.sin(perpAngle) * baseW;
    const bx2 = cx - Math.cos(perpAngle) * baseW;
    const by2 = cy - Math.sin(perpAngle) * baseW;

    const tx1 = tipX + Math.cos(perpAngle) * tipW;
    const ty1 = tipY + Math.sin(perpAngle) * tipW;
    const tx2 = tipX - Math.cos(perpAngle) * tipW;
    const ty2 = tipY - Math.sin(perpAngle) * tipW;

    const midR = r * 0.55;
    const ctrlX = cx + Math.cos(angle) * midR;
    const ctrlY = cy + Math.sin(angle) * midR;

    paths.push(
      `M ${bx1} ${by1} Q ${ctrlX + Math.cos(perpAngle) * tipW * 0.6} ${ctrlY + Math.sin(perpAngle) * tipW * 0.6} ${tx1} ${ty1} L ${tx2} ${ty2} Q ${ctrlX - Math.cos(perpAngle) * tipW * 0.6} ${ctrlY - Math.sin(perpAngle) * tipW * 0.6} ${bx2} ${by2} Z`
    );
  }

  const filterStr = glow > 0.05
    ? `drop-shadow(0 0 ${8 * glow}px ${ORANGE_GLOW}) drop-shadow(0 0 ${3 * glow}px ${ORANGE_GLOW})`
    : 'none';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      style={{ filter: filterStr, display: 'block' }}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} fill={color} opacity={i % 2 === 0 ? 1 : 0.7} />
      ))}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Document / file card with Claude logo badge
// ─────────────────────────────────────────────────────────────────────────────
const FileCard: React.FC<{
  scale?: number;
  shadowBlur?: number;
  shadowOpacity?: number;
  logoGlow?: number;
  style?: React.CSSProperties;
}> = ({
  scale        = 1,
  shadowBlur   = 20,
  shadowOpacity = 0.4,
  logoGlow     = 0.5,
  style,
}) => (
  <div
    style={{
      width:           130,
      height:          160,
      backgroundColor: SURFACE_100,
      border:          `1.5px solid ${ORANGE_BDR}`,
      borderRadius:    14,
      display:         'flex',
      flexDirection:   'column',
      alignItems:      'center',
      justifyContent:  'center',
      gap:             10,
      boxShadow: [
        `0 ${shadowBlur}px ${shadowBlur * 2.5}px rgba(0,0,0,${shadowOpacity})`,
        `0 0 ${shadowBlur * 1.5}px ${ORANGE_GLOW.replace('0.4', String(shadowOpacity * 0.6))}`,
      ].join(', '),
      transform:    `scale(${scale})`,
      transformOrigin: 'center center',
      position:     'relative',
      overflow:     'hidden',
      ...style,
    }}
  >
    {/* Subtle top tint */}
    <div
      style={{
        position:      'absolute',
        top:           0,
        left:          0,
        right:         0,
        height:        '40%',
        background:    `linear-gradient(to bottom, ${ORANGE_DIM}, transparent)`,
        pointerEvents: 'none',
        borderRadius:  '14px 14px 0 0',
      }}
    />
    {/* File icon + Claude logo */}
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <FileText
        size={52}
        color={`rgba(217,119,87,0.35)`}
        strokeWidth={1.5}
        style={{ display: 'block' }}
      />
      <div
        style={{
          position:  'absolute',
          top:       '50%',
          left:      '50%',
          transform: 'translate(-50%, -52%)',
        }}
      >
        <ClaudeMark size={34} color={ORANGE} glow={logoGlow} />
      </div>
    </div>
    {/* Filename label */}
    <span
      style={{
        fontFamily:    MONO,
        fontSize:      11,
        color:         ORANGE,
        letterSpacing: 0.5,
        opacity:       0.85,
      }}
    >
      claude.md
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Folder panel
// ─────────────────────────────────────────────────────────────────────────────
const FolderPanel: React.FC<{
  label:       string;
  sublabel:    string;
  open?:       boolean;
  openProgress?: number;
  active?:     boolean;
  activeProgress?: number;
  children?:   React.ReactNode;
  style?:      React.CSSProperties;
}> = ({
  label,
  sublabel,
  open            = false,
  openProgress    = 0,
  active          = false,
  activeProgress  = 0,
  children,
  style,
}) => {
  const borderColor = active
    ? `rgba(217,119,87,${0.15 + activeProgress * 0.45})`
    : BORDER;
  const bgColor = active
    ? `rgba(217,119,87,${0.03 + activeProgress * 0.07})`
    : 'rgba(26,26,26,0.9)';
  const glowStr = active && activeProgress > 0.05
    ? `0 0 ${30 * activeProgress}px rgba(217,119,87,${0.2 * activeProgress})`
    : '0 8px 32px rgba(0,0,0,0.5)';

  const folderColor = open ? FOLDER_OPEN : FOLDER_COLOR;

  return (
    <div
      style={{
        width:           340,
        minHeight:       380,
        backgroundColor: bgColor,
        border:          `1.5px solid ${borderColor}`,
        borderRadius:    18,
        padding:         '28px 32px',
        display:         'flex',
        flexDirection:   'column',
        gap:             20,
        boxShadow:       glowStr,
        transition:      'none',
        ...style,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {open ? (
          <FolderOpen
            size={36}
            color={folderColor}
            strokeWidth={1.5}
            style={{
              filter: active
                ? `drop-shadow(0 0 ${10 * activeProgress}px rgba(217,119,87,${0.5 * activeProgress}))`
                : 'none',
            }}
          />
        ) : (
          <Folder
            size={36}
            color={folderColor}
            strokeWidth={1.5}
          />
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize:   18,
              color:      active ? `rgba(217,119,87,${0.7 + activeProgress * 0.3})` : FG,
              fontWeight: 600,
              letterSpacing: 0.3,
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize:   12,
              color:      FG_MUTED,
              letterSpacing: 0.5,
            }}
          >
            {sublabel}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height:          1,
          backgroundColor: active
            ? `rgba(217,119,87,${0.1 + activeProgress * 0.2})`
            : 'rgba(255,255,255,0.06)',
        }}
      />

      {/* Content area — slot for file card or empty state */}
      <div
        style={{
          flex:           1,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          minHeight:      190,
        }}
      >
        {children ?? (
          <div
            style={{
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              gap:           10,
              opacity:       0.25,
            }}
          >
            <div
              style={{
                width:           80,
                height:          96,
                border:          '1.5px dashed rgba(255,255,255,0.2)',
                borderRadius:    10,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Terminal command bar — shows the /cd command being typed
// ─────────────────────────────────────────────────────────────────────────────
const TerminalBar: React.FC<{
  frame:         number;
  slideProgress: number;     // 0→1 entrance
  enterFlash:    number;     // 0→1 flash on "enter"
}> = ({ frame, slideProgress, enterFlash }) => {
  const chars     = charsAtFrame(frame);
  const visible   = COMMAND_TEXT.slice(0, chars);
  const isDone    = chars >= COMMAND_TEXT.length;

  // Cursor blinks every 18 frames while typing, stops blinking (stays on) at done
  const cursorOn  = isDone
    ? enterFlash < 0.5  // flickers off briefly on enter
    : (Math.floor(frame / 18) % 2 === 0);

  // Split visible text into /cd (orange) + rest (light)
  const slashPart   = visible.slice(0, Math.min(chars, CMD_SLASH_PART.length));
  const pathPart    = chars > CMD_SLASH_PART.length
    ? visible.slice(CMD_SLASH_PART.length)
    : '';

  // Background flashes slightly on enter
  const bgOpacity = 0.06 + enterFlash * 0.1;
  const borderOpacity = 0.25 + enterFlash * 0.3;

  return (
    <div
      style={{
        opacity:         slideProgress,
        transform:       `translateY(${(1 - slideProgress) * -16}px)`,
        width:           860,
        backgroundColor: `rgba(217, 119, 87, ${bgOpacity})`,
        border:          `1.5px solid rgba(217, 119, 87, ${borderOpacity})`,
        borderRadius:    12,
        padding:         '18px 28px',
        display:         'flex',
        alignItems:      'center',
        gap:             14,
        boxShadow:       `0 0 ${20 + enterFlash * 30}px rgba(217,119,87,${0.12 + enterFlash * 0.15}), 0 8px 32px rgba(0,0,0,0.5)`,
      }}
    >
      {/* Prompt glyph */}
      <span
        style={{
          fontFamily:  MONO,
          fontSize:    22,
          color:       PROMPT_COLOR,
          userSelect:  'none',
          flexShrink:  0,
        }}
      >
        $
      </span>

      {/* Typed command */}
      <span
        style={{
          fontFamily:   MONO,
          fontSize:     26,
          letterSpacing: 0.5,
          display:      'flex',
          alignItems:   'center',
          gap:          0,
          whiteSpace:   'pre',
        }}
      >
        {/* /cd in orange */}
        <span style={{ color: CMD_COLOR, fontWeight: 600 }}>{slashPart}</span>
        {/* path in dim white */}
        <span style={{ color: 'rgba(255,255,255,0.75)' }}>{pathPart}</span>
        {/* blinking cursor */}
        <span
          style={{
            display:         'inline-block',
            width:           3,
            height:          28,
            backgroundColor: cursorOn ? ORANGE : 'transparent',
            borderRadius:    2,
            marginLeft:      2,
            verticalAlign:   'middle',
            boxShadow:       cursorOn
              ? `0 0 8px ${ORANGE_GLOW}`
              : 'none',
          }}
        />
      </span>

      {/* ↵ return hint — appears when typing is done */}
      {isDone && (
        <span
          style={{
            fontFamily:   MONO,
            fontSize:     13,
            color:        `rgba(217,119,87,${0.4 + enterFlash * 0.4})`,
            marginLeft:   'auto',
            letterSpacing: 1,
            textTransform: 'uppercase',
            flexShrink:    0,
          }}
        >
          ↵ enter
        </span>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Motion trail — a fading path of ghost copies
// ─────────────────────────────────────────────────────────────────────────────
const MotionTrail: React.FC<{
  positions: Array<{ x: number; y: number }>;
  opacity:   number;
}> = ({ positions, opacity }) => {
  if (opacity < 0.01 || positions.length < 2) return null;
  const pts = positions.map(p => `${p.x + 65},${p.y + 80}`).join(' ');
  return (
    <svg
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
      width="1920"
      height="1080"
    >
      <polyline
        points={pts}
        fill="none"
        stroke={ORANGE}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="6 8"
        opacity={opacity * 0.35}
      />
      {positions.slice(0, -1).map((p, i) => {
        const t = i / (positions.length - 1);
        return (
          <circle
            key={i}
            cx={p.x + 65}
            cy={p.y + 80}
            r={4 * (1 - t)}
            fill={ORANGE}
            opacity={opacity * 0.2 * (1 - t)}
          />
        );
      })}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main composition
// ─────────────────────────────────────────────────────────────────────────────
export const ClaudeFileMove: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Layout anchors ────────────────────────────────────────────────────────
  // Canvas: 1920 × 1080
  const SRC_X  = 380;   // left edge of source panel
  const DST_X  = 1200;  // left edge of destination panel
  const PANEL_Y = 290;  // top of panels

  const FILE_W = 130;
  const fileSrcCX = SRC_X + 340 / 2 - FILE_W / 2;
  const fileSrcCY = PANEL_Y + 140;

  const fileDstCX = DST_X + 340 / 2 - FILE_W / 2;
  const fileDstCY = PANEL_Y + 140;

  // ── Phase springs ─────────────────────────────────────────────────────────
  const srcIn = spring({
    frame: frame - F_SRC_IN,
    fps,
    config: { damping: 18, stiffness: 130, mass: 1 },
    from: 0,
    to: 1,
  });
  const dstIn = spring({
    frame: frame - F_DST_IN,
    fps,
    config: { damping: 18, stiffness: 130, mass: 1 },
    from: 0,
    to: 1,
  });

  const fileIn = spring({
    frame: frame - F_FILE_IN,
    fps,
    config: { damping: 18, stiffness: 130, mass: 0.9 },
    from: 0,
    to: 1,
  });

  // ── Terminal bar entrance ─────────────────────────────────────────────────
  const termSlide = spring({
    frame: frame - F_TERM_IN,
    fps,
    config: { damping: 18, stiffness: 160, mass: 0.8 },
    from: 0,
    to: 1,
  });

  // Enter key flash — fires at F_ENTER, very fast
  const enterFlash = clamp(frame, F_ENTER, F_ENTER + 12, 0, 1);
  // Terminal fades out as file lifts
  const termFadeOut = clamp(frame, F_LIFT, F_LIFT + 20, 1, 0);
  const termOpacity = termSlide * termFadeOut;

  // ── Lift phase ────────────────────────────────────────────────────────────
  const liftProgress = clamp(frame, F_LIFT, F_TRAVEL_START, 0, 1);
  const liftScale   = 1 + liftProgress * 0.12;

  // ── Travel arc ────────────────────────────────────────────────────────────
  const travelRaw = clamp(frame, F_TRAVEL_START, F_TRAVEL_END, 0, 1);
  const travelT   = easeInOut(travelRaw);

  const midX     = (fileSrcCX + fileDstCX) / 2;
  const arcPeakY = PANEL_Y - 180;

  const bezierX = (t: number) => {
    const p0 = fileSrcCX;
    const p1 = midX;
    const p2 = fileDstCX;
    return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
  };
  const bezierY = (t: number) => {
    const p0 = fileSrcCY;
    const p1 = arcPeakY;
    const p2 = fileDstCY;
    return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
  };

  const fileX = travelRaw > 0 ? bezierX(travelT) : fileSrcCX;
  const fileY = travelRaw > 0 ? bezierY(travelT) : fileSrcCY;

  const travelScale = travelRaw > 0
    ? liftScale + Math.sin(travelT * Math.PI) * 0.08
    : liftScale;

  // ── Drop phase ────────────────────────────────────────────────────────────
  const dropSpring = spring({
    frame: frame - F_DROP,
    fps,
    config: { damping: 16, stiffness: 260, mass: 0.7 },
    from: 0,
    to: 1,
  });
  const dropProgress = frame >= F_DROP ? dropSpring : 0;

  const fileScaleOnDrop = travelRaw >= 1 ? 1 + (travelScale - 1) * (1 - dropProgress) : travelScale;
  const fileScale = travelRaw > 0 ? fileScaleOnDrop : (frame >= F_LIFT ? liftScale : 1);

  const shadowBlur = travelRaw < 1
    ? 8 + liftProgress * 40 + travelRaw * 20
    : 48 - dropProgress * 36;
  const shadowOpacity = travelRaw < 1
    ? 0.25 + liftProgress * 0.5
    : 0.75 - dropProgress * 0.45;

  // ── Destination folder reaction ───────────────────────────────────────────
  const folderOpenProgress = clamp(frame, F_TRAVEL_END - 25, F_TRAVEL_END + 5, 0, 1);
  const folderOpen = folderOpenProgress > 0.3;

  const dstActiveProgress = clamp(frame, F_DROP, F_SETTLE, 0, 1);

  // ── Hold pulse ────────────────────────────────────────────────────────────
  const holdPulse = frame >= F_HOLD
    ? Math.sin(((frame - F_HOLD) / 40) * Math.PI * 2) * 0.5 + 0.5
    : 0;

  // ── File visibility states ────────────────────────────────────────────────
  const fileIsInFlight = frame >= F_LIFT && travelRaw < 1;
  const fileHasLanded  = frame >= F_DROP;
  const showFileInSrc  = frame >= F_FILE_IN && frame < F_LIFT;
  const showFileInDst  = fileHasLanded;

  // ── Motion trail ─────────────────────────────────────────────────────────
  const trailSamples: Array<{ x: number; y: number }> = [];
  if (travelRaw > 0 && travelRaw < 1) {
    const TRAIL_LEN = 8;
    for (let i = TRAIL_LEN; i >= 1; i--) {
      const sampleFrame = frame - i * 3;
      const sampleRaw = clamp(sampleFrame, F_TRAVEL_START, F_TRAVEL_END, 0, 1);
      const sampleT   = easeInOut(sampleRaw);
      trailSamples.push({ x: bezierX(sampleT), y: bezierY(sampleT) });
    }
    trailSamples.push({ x: fileX, y: fileY });
  }
  const trailOpacity = travelRaw > 0.05 && travelRaw < 0.95 ? Math.sin(travelRaw * Math.PI) : 0;

  // ── Ambient glow ──────────────────────────────────────────────────────────
  const ambientGlow = Math.min(liftProgress + travelRaw * 0.6, 1) * (1 - dropProgress * 0.6);

  // ── Slide offsets ─────────────────────────────────────────────────────────
  const srcSlide = interpolate(srcIn, [0, 1], [-120, 0], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });
  const dstSlide = interpolate(dstIn, [0, 1], [120, 0], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });

  // ── Logo glow ─────────────────────────────────────────────────────────────
  const logoGlow      = showFileInSrc ? 0.4 + fileIn * 0.3 : 0;
  const landedLogoGlow = showFileInDst ? dstActiveProgress * 0.8 + holdPulse * 0.3 : 0;

  // ── Title badge fade-in ───────────────────────────────────────────────────
  const titleIn = clamp(frame, 8, 30, 0, 1);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        overflow:        'hidden',
        fontFamily:      circularFamily,
      }}
    >
      <DotGrid />

      {/* Canvas ambient glow */}
      <div
        style={{
          position:      'absolute',
          inset:         0,
          background:    `radial-gradient(ellipse at 50% 40%, rgba(217,119,87,${0.05 * ambientGlow}) 0%, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Motion trail */}
      <MotionTrail positions={trailSamples} opacity={trailOpacity} />

      {/* ── Title badge — top centre ────────────────────────────────────────── */}
      <div
        style={{
          position:       'absolute',
          top:            48,
          left:           0,
          right:          0,
          display:        'flex',
          justifyContent: 'center',
          opacity:        titleIn,
        }}
      >
        <div
          style={{
            display:         'inline-flex',
            alignItems:      'center',
            gap:             10,
            backgroundColor: ORANGE_DIM,
            border:          `1px solid ${ORANGE_BDR}`,
            borderRadius:    999,
            padding:         '8px 20px',
          }}
        >
          <span
            style={{
              fontFamily:    MONO,
              fontSize:      15,
              color:         ORANGE,
              fontWeight:    600,
              letterSpacing: 0.3,
            }}
          >
            /cd
          </span>
          <span
            style={{
              width:           1,
              height:          14,
              backgroundColor: ORANGE_BDR,
              flexShrink:      0,
            }}
          />
          <span
            style={{
              fontFamily:    circularFamily,
              fontSize:      14,
              color:         FG_LIGHT,
              letterSpacing: 0.3,
            }}
          >
            switch working directory
          </span>
        </div>
      </div>

      {/* ── Terminal command bar — centred between folders ──────────────────── */}
      <div
        style={{
          position:       'absolute',
          top:            130,
          left:           0,
          right:          0,
          display:        'flex',
          justifyContent: 'center',
          opacity:        termOpacity,
          pointerEvents:  'none',
        }}
      >
        <TerminalBar
          frame={frame}
          slideProgress={termSlide}
          enterFlash={enterFlash}
        />
      </div>

      {/* ── Source folder ──────────────────────────────────────────────────── */}
      <div
        style={{
          position:  'absolute',
          left:      SRC_X,
          top:       PANEL_Y,
          opacity:   srcIn,
          transform: `translateX(${srcSlide}px)`,
        }}
      >
        <FolderPanel
          label="~/old-project"
          sublabel="current directory"
          open={false}
        >
          {showFileInSrc && (
            <div
              style={{
                opacity:         fileIn,
                transform:       `scale(${fileIn * 0.15 + 0.85})`,
                transformOrigin: 'center center',
              }}
            >
              <FileCard scale={1} shadowBlur={12} shadowOpacity={0.3} logoGlow={logoGlow} />
            </div>
          )}
        </FolderPanel>

        <div
          style={{
            marginTop:  14,
            textAlign:  'center',
            fontFamily: MONO,
            fontSize:   12,
            color:      FG_MUTED,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
          }}
        >
          Source
        </div>
      </div>

      {/* ── Destination folder ─────────────────────────────────────────────── */}
      <div
        style={{
          position:  'absolute',
          left:      DST_X,
          top:       PANEL_Y,
          opacity:   dstIn,
          transform: `translateX(${dstSlide}px)`,
        }}
      >
        <FolderPanel
          label="~/new-project"
          sublabel="target directory"
          open={folderOpen}
          openProgress={folderOpenProgress}
          active={dstActiveProgress > 0.05}
          activeProgress={dstActiveProgress + holdPulse * 0.15}
        >
          {showFileInDst && (
            <div
              style={{
                opacity:         dropProgress,
                transform:       `scale(${0.85 + dropProgress * 0.15})`,
                transformOrigin: 'center center',
              }}
            >
              <FileCard
                scale={1}
                shadowBlur={6 + holdPulse * 8}
                shadowOpacity={0.2 + holdPulse * 0.15}
                logoGlow={landedLogoGlow}
              />
            </div>
          )}
        </FolderPanel>

        <div
          style={{
            marginTop:  14,
            textAlign:  'center',
            fontFamily: MONO,
            fontSize:   12,
            color:      FG_MUTED,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
          }}
        >
          Destination
        </div>
      </div>

      {/* ── Arrow connector — appears at hold phase ──────────────────────────── */}
      {frame >= F_HOLD && (
        <div
          style={{
            position:   'absolute',
            left:       SRC_X + 340 + 20,
            top:        PANEL_Y + 180,
            width:      DST_X - SRC_X - 340 - 40,
            display:    'flex',
            alignItems: 'center',
            opacity:    clamp(frame, F_HOLD, F_HOLD + 20, 0, 1),
          }}
        >
          <div
            style={{
              flex:            1,
              height:          1,
              backgroundImage: `repeating-linear-gradient(90deg, rgba(217,119,87,${0.25 + holdPulse * 0.15}) 0px, rgba(217,119,87,${0.25 + holdPulse * 0.15}) 8px, transparent 8px, transparent 16px)`,
            }}
          />
          <svg width={16} height={16} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke={ORANGE}
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.5 + holdPulse * 0.3}
            />
          </svg>
        </div>
      )}

      {/* ── Flying file card — absolutely positioned, in-flight only ──────── */}
      {fileIsInFlight && (
        <div
          style={{
            position:        'absolute',
            left:            fileX,
            top:             fileY,
            transformOrigin: 'center center',
            pointerEvents:   'none',
          }}
        >
          <FileCard
            scale={fileScale}
            shadowBlur={shadowBlur}
            shadowOpacity={shadowOpacity}
            logoGlow={0.8 + Math.sin(travelRaw * Math.PI) * 0.4}
          />
        </div>
      )}

      {/* ── Bottom status badge — shows after landing ─────────────────────── */}
      {frame >= F_HOLD && (
        <div
          style={{
            position:       'absolute',
            bottom:         56,
            left:           0,
            right:          0,
            display:        'flex',
            justifyContent: 'center',
            opacity:        clamp(frame, F_HOLD, F_HOLD + 24, 0, 1),
          }}
        >
          <div
            style={{
              display:         'inline-flex',
              alignItems:      'center',
              gap:             10,
              backgroundColor: ORANGE_DIM,
              border:          `1px solid ${ORANGE_BDR}`,
              borderRadius:    999,
              padding:         '10px 24px',
              boxShadow:       `0 0 ${16 + holdPulse * 10}px rgba(217,119,87,${0.12 + holdPulse * 0.08})`,
            }}
          >
            <ClaudeMark size={18} color={ORANGE} glow={0.6 + holdPulse * 0.4} />
            <span
              style={{
                fontFamily:    circularFamily,
                fontSize:      15,
                color:         ORANGE,
                letterSpacing: 0.5,
                fontWeight:    600,
              }}
            >
              now working in ~/new-project
            </span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
