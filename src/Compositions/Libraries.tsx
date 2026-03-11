import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  Img,
  staticFile,
} from 'remotion';
import { loadFont, fontFamily } from '@remotion/google-fonts/Inter';

loadFont('normal', { weights: ['300', '400', '500', '600', '700', '800'] });

// ── Palette ───────────────────────────────────────────────────────────────────
const GREEN       = '#3ecf8e';
const BG          = '#0f0f0f';
const PANEL_BG    = '#141414';
const PANEL_BOR   = 'rgba(255,255,255,0.07)';
const TERM_BG     = '#0d0d0d';
const DIM         = 'rgba(255,255,255,0.4)';
const BRIGHT      = 'rgba(255,255,255,0.92)';
const FONT        = `${fontFamily}, system-ui, sans-serif`;
const MONO        = `'JetBrains Mono', 'Fira Code', 'Menlo', monospace`;

// ── Timing ────────────────────────────────────────────────────────────────────
const T_FUNC       = 10;   // edge function panel appears
const T_TERM1      = 48;   // terminal slides up
const T_TYPE1_S    = 72;   // start typing "npm install sharp"
const T_TYPE1_E    = 118;  // done typing
const T_INSTALL1_S = 122;  // install progress animates
const T_INSTALL1_E = 168;  // install done
const T_SHARP      = 178;  // sharp logo pops in
const T_CONN1      = 192;  // connection line to function

const T_TYPE2_S    = 218;  // start typing "npm install browser-image-compression"
const T_TYPE2_E    = 288;  // done typing
const T_INSTALL2_S = 292;
const T_INSTALL2_E = 336;
const T_BIC        = 346;  // browser-image-compression logo pops in
const T_CONN2      = 360;  // connection line

// ── Upload section ────────────────────────────────────────────────────────────
const T_FADE_OUT   = 390;  // library section fades out
const T_FADE_OUT_E = 415;
const T_BUCKET_IN  = 408;  // bucket zooms in
const T_FILE_IN    = 428;  // compressed file card appears
const T_FLY_S      = 452;  // file starts flying into bucket
const T_FLY_E      = 492;  // file reaches bucket
const T_PROGRESS_S = 488;
const T_PROGRESS_E = 528;
const T_SUCCESS    = 532;

const TOTAL = 560;

// ── Comparison section ────────────────────────────────────────────────────────
const T_COMP_FADE_IN  = 548;
const T_BEFORE_IN     = 562;
const T_ARROW_S       = 585;
const T_ARROW_E       = 614;
const T_AFTER_IN      = 618;
const T_FINAL_SUCCESS = 648;

// ── Helpers ───────────────────────────────────────────────────────────────────
function easeOut(t: number) { return 1 - (1 - t) ** 3; }
function easeInOut(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

function itp(
  frame: number, a: number, b: number,
  from = 0, to = 1,
  easing?: (t: number) => number,
) {
  return interpolate(frame, [a, b], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
}

// Typewriter: returns how many chars to show
function typewriter(frame: number, start: number, end: number, text: string): string {
  const progress = itp(frame, start, end, 0, 1);
  return text.slice(0, Math.floor(progress * text.length));
}


// ── Sharp logo ─────────────────────────────────────────────────────────────
const SharpLogo: React.FC<{ size: number }> = ({ size }) => (
  <Img
    src={staticFile('sharpLogo.svg')}
    style={{ width: size, height: size, objectFit: 'contain' }}
  />
);

// ── browser-image-compression logo ────────────────────────────────────────
const BICLogo: React.FC<{ size: number }> = ({ size }) => (
  <div style={{
    width: size,
    height: size,
    backgroundColor: '#1a1a1a',
    borderRadius: size * 0.2,
    border: `1.5px solid rgba(255,255,255,0.1)`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  }}>
    {/* Compression icon: two arrows pointing inward */}
    <svg width={size * 0.46} height={size * 0.46} viewBox="0 0 64 64" fill="none">
      {/* Top-left arrow pointing down-right */}
      <polyline points="6,6 6,22 22,22" stroke="#4f9cf9" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <line x1="6" y1="6" x2="26" y2="26" stroke="#4f9cf9" strokeWidth="6" strokeLinecap="round"/>
      {/* Bottom-right arrow pointing up-left */}
      <polyline points="58,58 58,42 42,42" stroke="#4f9cf9" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <line x1="58" y1="58" x2="38" y2="38" stroke="#4f9cf9" strokeWidth="6" strokeLinecap="round"/>
    </svg>
    <span style={{
      fontFamily: FONT,
      fontSize: size * 0.12,
      fontWeight: 700,
      color: '#4f9cf9',
      letterSpacing: '-0.01em',
      textAlign: 'center',
      lineHeight: 1.2,
      padding: '0 6px',
    }}>
      browser-image{'\n'}compression
    </span>
  </div>
);

// ── L-shaped connection line: goes straight up then 90° to the function side ─
const ConnectLine: React.FC<{
  startX: number; startY: number; // top of library logo
  endX: number;   endY: number;   // point on the side of the function panel
  progress: number; color: string;
}> = ({ startX, startY, endX, endY, progress, color }) => {
  // Vertical segment: straight up from logo top to endY
  const vertLen  = startY - endY;
  // Horizontal segment: across to the function panel side
  const horizLen = Math.abs(endX - startX);
  const totalLen = vertLen + horizLen;
  const drawn    = progress * totalLen;

  const vertDrawn  = Math.min(drawn, vertLen);
  const horizDrawn = Math.max(0, drawn - vertLen);
  const horizDir   = endX > startX ? 1 : -1;

  const STROKE = { stroke: color, strokeWidth: 2, strokeOpacity: 0.55, strokeDasharray: '8 5', strokeLinecap: 'round' as const };

  return (
    <svg
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
      width={1920} height={1080}
    >
      {/* Vertical leg */}
      {vertDrawn > 1 && (
        <line x1={startX} y1={startY} x2={startX} y2={startY - vertDrawn} {...STROKE} />
      )}
      {/* Horizontal leg */}
      {horizDrawn > 1 && (
        <line x1={startX} y1={endY} x2={startX + horizDir * horizDrawn} y2={endY} {...STROKE} />
      )}
      {/* Arrival dot */}
      {progress > 0.88 && (
        <circle cx={endX} cy={endY} r={4} fill={color} opacity={(progress - 0.88) / 0.12} />
      )}
    </svg>
  );
};

// ── Install progress bar ───────────────────────────────────────────────────
const InstallBar: React.FC<{ progress: number; color: string }> = ({ progress, color }) => (
  <div style={{
    marginTop: 6,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  }}>
    <div style={{
      height: '100%',
      width: `${progress * 100}%`,
      backgroundColor: color,
      borderRadius: 2,
      boxShadow: `0 0 8px ${color}88`,
      transition: 'width 0.05s linear',
    }} />
  </div>
);

// ── Edge Function code panel ───────────────────────────────────────────────
const CODE_LINES = [
  { indent: 0, tokens: [{ t: 'serve', c: '#c792ea' }, { t: '(async (req) => {', c: DIM }] },
  { indent: 1, tokens: [{ t: 'const', c: '#c792ea' }, { t: ' { file } = ', c: DIM }, { t: 'await', c: '#c792ea' }, { t: ' req.json()', c: DIM }] },
  { indent: 1, tokens: [] },
  { indent: 1, tokens: [{ t: '// compress the image', c: 'rgba(255,255,255,0.25)' }] },
  { indent: 1, tokens: [{ t: 'const', c: '#c792ea' }, { t: ' compressed = ', c: DIM }, { t: 'await', c: '#c792ea' }, { t: ' compress(file)', c: GREEN }] },
  { indent: 1, tokens: [] },
  { indent: 1, tokens: [{ t: 'return', c: '#c792ea' }, { t: ' new ', c: DIM }, { t: 'Response', c: '#82aaff' }, { t: '(compressed)', c: DIM }] },
  { indent: 0, tokens: [{ t: '})', c: DIM }] },
];

const EdgeFunctionPanel: React.FC<{ opacity: number; scale: number }> = ({ opacity, scale }) => (
  <div style={{
    opacity,
    transform: `scale(${scale})`,
    backgroundColor: PANEL_BG,
    border: `1px solid ${PANEL_BOR}`,
    borderRadius: 16,
    overflow: 'hidden',
    width: 560,
    flexShrink: 0,
  }}>
    {/* Title bar */}
    <div style={{
      backgroundColor: '#111111',
      padding: '14px 20px',
      borderBottom: `1px solid ${PANEL_BOR}`,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <Img src={staticFile('SupabaseIcon.png')} style={{ width: 26, height: 26, objectFit: 'contain' }} />
      <span style={{ color: DIM, fontSize: 14, fontFamily: FONT, fontWeight: 400 }}>Edge Function</span>
      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>/</span>
      <span style={{ color: BRIGHT, fontSize: 14, fontFamily: FONT, fontWeight: 600, letterSpacing: '-0.01em' }}>compress-image</span>
    </div>

    {/* Code */}
    <div style={{ padding: '20px 24px', fontFamily: MONO, fontSize: 15, lineHeight: 1.7 }}>
      {CODE_LINES.map((line, i) => (
        <div key={i} style={{ paddingLeft: line.indent * 24, minHeight: '1.7em' }}>
          {line.tokens.map((tok, j) => (
            <span key={j} style={{ color: tok.c }}>{tok.t}</span>
          ))}
        </div>
      ))}
    </div>
  </div>
);

// ── Terminal panel ─────────────────────────────────────────────────────────
const TerminalPanel: React.FC<{
  slideY: number;
  opacity: number;
  typed1: string;
  install1Progress: number;
  install1Done: boolean;
  typed2: string;
  install2Progress: number;
  install2Done: boolean;
  showPrompt2: boolean;
  cursorVisible: boolean;
}> = ({
  slideY, opacity, typed1, install1Progress, install1Done,
  typed2, install2Progress, install2Done, showPrompt2, cursorVisible,
}) => (
  <div style={{
    opacity,
    transform: `translateY(${slideY}px)`,
    backgroundColor: TERM_BG,
    border: `1px solid rgba(255,255,255,0.1)`,
    borderRadius: 14,
    overflow: 'hidden',
    width: 560,
    flexShrink: 0,
  }}>
    {/* Terminal title bar */}
    <div style={{
      backgroundColor: '#181818',
      padding: '10px 16px',
      borderBottom: `1px solid rgba(255,255,255,0.06)`,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f57' }} />
      <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#febc2e' }} />
      <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#28c840' }} />
      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, fontFamily: MONO, marginLeft: 8 }}>
        terminal
      </span>
    </div>

    {/* Terminal body */}
    <div style={{ padding: '18px 20px', fontFamily: MONO, fontSize: 14, lineHeight: 1.8, minHeight: 200 }}>
      {/* First command */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
        <span style={{ color: GREEN, fontWeight: 600 }}>$</span>
        <span style={{ color: BRIGHT }}>{typed1}</span>
        {!install1Done && typed1.length > 0 && typed1.length < 'npm install sharp'.length && cursorVisible && (
          <span style={{ color: GREEN, fontWeight: 300 }}>▋</span>
        )}
      </div>

      {/* First install output */}
      {install1Progress > 0 && (
        <div style={{ marginBottom: 4, paddingLeft: 16 }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            {install1Done ? (
              <span style={{ color: GREEN }}>✓ added 1 package in 1.2s</span>
            ) : (
              <span>npm warn deprecated...</span>
            )}
          </div>
          {!install1Done && <InstallBar progress={install1Progress} color={GREEN} />}
        </div>
      )}

      {/* Second command */}
      {showPrompt2 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 2 }}>
            <span style={{ color: GREEN, fontWeight: 600 }}>$</span>
            <span style={{ color: BRIGHT }}>{typed2}</span>
            {!install2Done && typed2.length > 0 && typed2.length < 'npm install browser-image-compression'.length && cursorVisible && (
              <span style={{ color: GREEN, fontWeight: 300 }}>▋</span>
            )}
          </div>

          {install2Progress > 0 && (
            <div style={{ paddingLeft: 16 }}>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                {install2Done ? (
                  <span style={{ color: GREEN }}>✓ added 1 package in 0.8s</span>
                ) : (
                  <span>npm warn deprecated...</span>
                )}
              </div>
              {!install2Done && <InstallBar progress={install2Progress} color="#4f9cf9" />}
            </div>
          )}
        </>
      )}

      {/* Idle cursor after all done */}
      {install2Done && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <span style={{ color: GREEN, fontWeight: 600 }}>$</span>
          {cursorVisible && <span style={{ color: GREEN, fontWeight: 300 }}>▋</span>}
        </div>
      )}
    </div>
  </div>
);

// ── Supabase Storage bucket icon (flat green, official path) ──────────────
const StorageBucketIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 114 115">
    <rect width="113.52" height="113.52" x=".348" y=".729" fill="#1a1a1a" rx="22.19"/>
    <path fill={GREEN} fillRule="evenodd" d="M41.617 34.565a3 3 0 0 0-3 3v8.281h2.541a9 9 0 0 1 6.312 2.585l3.124 3.073a3 3 0 0 0 2.104.862h23.125v-2.314H64.185a4 4 0 0 1-4-4V34.565zm38.208 9.397a9 9 0 0 0-.653-.724l-12.11-12.052a9 9 0 0 0-6.348-2.62H41.617a9 9 0 0 0-9 9v9.523a9 9 0 0 0-4.433 7.757v22.565a9 9 0 0 0 9 9h39.848a9 9 0 0 0 9-9V61.366c0-3.21-1.68-6.027-4.209-7.62v-4.128a9 9 0 0 0-1.136-4.379 3.6 3.6 0 0 0-.808-1.223zm-13.64-5.155v5.245h5.244zM37.183 51.846a3 3 0 0 0-3 3v22.565a3 3 0 0 0 3 3h39.848a3 3 0 0 0 3-3V61.366a3 3 0 0 0-3-3H52.698a9 9 0 0 1-6.312-2.585l-3.124-3.073a3 3 0 0 0-2.104-.862z" clipRule="evenodd"/>
    <rect width="111.655" height="111.655" x="1.28" y="1.661" stroke={GREEN} strokeOpacity=".15" strokeWidth="1.864" rx="21.258"/>
  </svg>
);

// ── Supabase-style video file icon ────────────────────────────────────────
const VideoFileIcon: React.FC<{ size: number; dimmed?: boolean }> = ({ size, dimmed }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 114 115">
    <rect width="113.52" height="113.52" x=".348" y=".729" fill="#1a1a1a" rx="22.19"/>
    {/* Document body */}
    <path fill={dimmed ? 'rgba(62,207,142,0.45)' : GREEN} fillRule="evenodd"
      d="M38 28.729h24a6 6 0 0 1 4.243 1.757l12 12A6 6 0 0 1 80 46.729v40a6 6 0 0 1-6 6H38a6 6 0 0 1-6-6v-52a6 6 0 0 1 6-6zm24 4v12a2 2 0 0 0 2 2h12L62 32.729z"
      clipRule="evenodd"
    />
    {/* Play triangle */}
    <path fill={dimmed ? 'rgba(62,207,142,0.45)' : GREEN} d="M49 58.729l16 9-16 9v-18z"/>
    <rect width="111.655" height="111.655" x="1.28" y="1.661" stroke={dimmed ? 'rgba(62,207,142,0.3)' : GREEN} strokeOpacity=".15" strokeWidth="1.864" rx="21.258"/>
  </svg>
);

// ── Compressed file card ───────────────────────────────────────────────────
const FileCard: React.FC<{ opacity: number; scale: number; x: number; y: number }> = ({ opacity, scale, x, y }) => (
  <div style={{
    position: 'absolute',
    left: x,
    top: y,
    transform: `translate(-50%, -50%) scale(${scale})`,
    opacity,
    backgroundColor: PANEL_BG,
    border: `1px solid ${PANEL_BOR}`,
    borderRadius: 14,
    padding: '18px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    width: 280,
    pointerEvents: 'none',
  }}>
    <div style={{ fontSize: 32, flexShrink: 0 }}>🖼️</div>
    <div>
      <div style={{ fontSize: 15, fontWeight: 600, color: BRIGHT, letterSpacing: '-0.02em', fontFamily: FONT }}>
        optimized.jpg
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
        <span style={{ fontSize: 13, color: DIM, fontFamily: FONT }}>45 KB</span>
        <span style={{
          fontSize: 11, fontWeight: 700,
          color: '#0f0f0f', backgroundColor: GREEN,
          padding: '2px 7px', borderRadius: 10,
          fontFamily: FONT, letterSpacing: '0.02em',
        }}>↓ 85%</span>
      </div>
    </div>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────
export const Libraries: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Edge function panel
  const funcSp = spring({ frame: frame - T_FUNC, fps, config: { damping: 14, stiffness: 120, mass: 0.9 } });
  const funcScale = frame < T_FUNC ? 0 : Math.min(funcSp, 1);
  const funcOp = itp(frame, T_FUNC, T_FUNC + 16);

  // Terminal
  const termSlideY = itp(frame, T_TERM1, T_TERM1 + 22, 40, 0, easeOut);
  const termOp = itp(frame, T_TERM1, T_TERM1 + 18);

  // Typing
  const CMD1 = 'npm install sharp';
  const CMD2 = 'npm install browser-image-compression';
  const typed1 = typewriter(frame, T_TYPE1_S, T_TYPE1_E, CMD1);
  const typed2 = frame >= T_TYPE2_S ? typewriter(frame, T_TYPE2_S, T_TYPE2_E, CMD2) : '';

  // Install progress
  const install1Progress = itp(frame, T_INSTALL1_S, T_INSTALL1_E, 0, 1, easeInOut);
  const install1Done = frame >= T_INSTALL1_E;

  const install2Progress = itp(frame, T_INSTALL2_S, T_INSTALL2_E, 0, 1, easeInOut);
  const install2Done = frame >= T_INSTALL2_E;

  const showPrompt2 = frame >= T_INSTALL1_E + 10;

  // Blinking cursor (every 20 frames)
  const cursorVisible = Math.floor(frame / 14) % 2 === 0;

  // Sharp logo
  const sharpSp = spring({ frame: frame - T_SHARP, fps, config: { damping: 11, stiffness: 130, mass: 0.8 } });
  const sharpScale = frame < T_SHARP ? 0 : Math.min(sharpSp, 1);
  const sharpOp = itp(frame, T_SHARP, T_SHARP + 14);

  // Connection line 1 (sharp → function)
  const conn1Progress = itp(frame, T_CONN1, T_CONN1 + 30, 0, 1, easeOut);

  // BIC logo
  const bicSp = spring({ frame: frame - T_BIC, fps, config: { damping: 11, stiffness: 130, mass: 0.8 } });
  const bicScale = frame < T_BIC ? 0 : Math.min(bicSp, 1);
  const bicOp = itp(frame, T_BIC, T_BIC + 14);

  // Connection line 2 (BIC → function)
  const conn2Progress = itp(frame, T_CONN2, T_CONN2 + 30, 0, 1, easeOut);

  // ── Upload section ─────────────────────────────────────────────────────────
  // Fade out library section
  const librarySectionOp = itp(frame, T_FADE_OUT, T_FADE_OUT_E, 1, 0);

  // Bucket zooms in from small
  const bucketSp = spring({ frame: frame - T_BUCKET_IN, fps, config: { damping: 12, stiffness: 110, mass: 1.0 } });
  const bucketScale = frame < T_BUCKET_IN ? 0 : Math.min(bucketSp, 1);
  const bucketOp = itp(frame, T_BUCKET_IN, T_BUCKET_IN + 20);

  // File card appears
  const fileCardOp = itp(frame, T_FILE_IN, T_FILE_IN + 16);
  const fileCardSc = frame < T_FILE_IN ? 0 : Math.min(
    spring({ frame: frame - T_FILE_IN, fps, config: { damping: 13, stiffness: 120, mass: 0.8 } }), 1
  );

  // File flies toward bucket (x: 380 → 960 center, arc up then down)
  const flyProgress = itp(frame, T_FLY_S, T_FLY_E, 0, 1, easeInOut);
  const flyX = interpolate(flyProgress, [0, 1], [380, 960]);
  const flyY = interpolate(flyProgress, [0, 0.5, 1], [540, 440, 480]); // arc up then down
  const flyScale = interpolate(flyProgress, [0, 0.8, 1], [1, 0.9, 0.4]);
  const flyOp = interpolate(flyProgress, [0, 0.85, 1], [1, 1, 0]);

  // Bucket glow pulse on receipt
  const bucketReceived = frame >= T_FLY_E;
  const bucketGlowPulse = bucketReceived
    ? 0.35 + 0.15 * Math.sin((frame - T_FLY_E) * 0.2)
    : 0;

  // Upload progress bar
  const uploadProgress = itp(frame, T_PROGRESS_S, T_PROGRESS_E, 0, 1, easeInOut);
  const uploadBarOp = itp(frame, T_PROGRESS_S - 5, T_PROGRESS_S + 10);

  // Success badge
  const successSp = spring({ frame: frame - T_SUCCESS, fps, config: { damping: 10, stiffness: 140, mass: 0.6 } });
  const successScale = frame < T_SUCCESS ? 0 : Math.min(successSp, 1);
  const successOp = itp(frame, T_SUCCESS, T_SUCCESS + 12);

  // ── Comparison section ──────────────────────────────────────────────────────
  const compSectionOp   = itp(frame, T_COMP_FADE_IN, T_COMP_FADE_IN + 18);
  const uploadSectionOp2 = itp(frame, T_COMP_FADE_IN, T_COMP_FADE_IN + 16, 1, 0);

  // Before card (3 MB)
  const beforeSp = spring({ frame: frame - T_BEFORE_IN, fps, config: { damping: 13, stiffness: 120, mass: 0.9 } });
  const beforeScale = frame < T_BEFORE_IN ? 0 : Math.min(beforeSp, 1);
  const beforeOp = itp(frame, T_BEFORE_IN, T_BEFORE_IN + 16);

  // Compression arrow progress
  const arrowProgress = itp(frame, T_ARROW_S, T_ARROW_E, 0, 1, easeOut);

  // After card (300 KB)
  const afterSp = spring({ frame: frame - T_AFTER_IN, fps, config: { damping: 11, stiffness: 130, mass: 0.7 } });
  const afterScale = frame < T_AFTER_IN ? 0 : Math.min(afterSp, 1);
  const afterOp = itp(frame, T_AFTER_IN, T_AFTER_IN + 14);

  // Final badge
  const finalSp = spring({ frame: frame - T_FINAL_SUCCESS, fps, config: { damping: 10, stiffness: 140, mass: 0.6 } });
  const finalScale = frame < T_FINAL_SUCCESS ? 0 : Math.min(finalSp, 1);
  const finalOp = itp(frame, T_FINAL_SUCCESS, T_FINAL_SUCCESS + 12);

  // Background glow
  const bgGlow = frame >= T_FADE_OUT
    ? 0.06 + 0.03 * Math.sin(frame * 0.06) + bucketGlowPulse * 0.4
    : 0.04 + 0.02 * Math.sin(frame * 0.05);

  // Layout anchor points (approximate pixel positions in 1920×1080)
  const SHARP_CX      = 550;  // sharp logo horizontal center
  const SHARP_TOP     = 428;  // top of sharp logo
  const BIC_CX        = 1370; // bic logo horizontal center
  const BIC_TOP       = 428;  // top of bic logo
  // Function panel: 560px wide, centered at x=960 → left=680, right=1240
  // Connect at ~1/3 down the panel (below the header, into the code area)
  const FUNC_LEFT_X   = 680;  // left edge of function panel
  const FUNC_RIGHT_X  = 1240; // right edge of function panel
  const FUNC_SIDE_Y   = 330;  // y where lines meet the sides (within code area)

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT, overflow: 'hidden' }}>

      {/* Background glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 70% 55% at 50% 45%, rgba(62,207,142,${bgGlow}) 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />

      {/* ── Library section (fades out) ── */}
      <div style={{ opacity: librarySectionOp, position: 'absolute', inset: 0 }}>

        {/* Connection lines */}
        {conn1Progress > 0 && (
          <ConnectLine
            startX={SHARP_CX}  startY={SHARP_TOP}
            endX={FUNC_LEFT_X} endY={FUNC_SIDE_Y}
            progress={conn1Progress}
            color="rgba(255,255,255,0.5)"
          />
        )}
        {conn2Progress > 0 && (
          <ConnectLine
            startX={BIC_CX}     startY={BIC_TOP}
            endX={FUNC_RIGHT_X} endY={FUNC_SIDE_Y}
            progress={conn2Progress}
            color="#4f9cf9"
          />
        )}

        {/* Main layout */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 60,
          padding: '0 120px',
        }}>
          {/* Left: Sharp logo */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            opacity: sharpOp, transform: `scale(${sharpScale})`, flexShrink: 0,
          }}>
            <SharpLogo size={128} />
            <div style={{ fontSize: 15, fontWeight: 600, color: BRIGHT, letterSpacing: '-0.01em', fontFamily: FONT }}>sharp</div>
            <div style={{ fontSize: 13, color: DIM, fontFamily: FONT, letterSpacing: '-0.01em' }}>Node.js</div>
          </div>

          {/* Center: Edge function + terminal */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, flexShrink: 0 }}>
            <EdgeFunctionPanel opacity={funcOp} scale={funcScale} />
            <TerminalPanel
              slideY={termSlideY} opacity={termOp}
              typed1={typed1} install1Progress={install1Progress} install1Done={install1Done}
              typed2={typed2} install2Progress={install2Progress} install2Done={install2Done}
              showPrompt2={showPrompt2} cursorVisible={cursorVisible}
            />
          </div>

          {/* Right: BIC logo */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            opacity: bicOp, transform: `scale(${bicScale})`, flexShrink: 0,
          }}>
            <BICLogo size={128} />
            <div style={{ fontSize: 15, fontWeight: 600, color: '#4f9cf9', letterSpacing: '0.01em', fontFamily: FONT, textAlign: 'center' }}>
              browser-image
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#4f9cf9', letterSpacing: '0.01em', fontFamily: FONT }}>
              compression
            </div>
            <div style={{ fontSize: 13, color: DIM, fontFamily: FONT, letterSpacing: '-0.01em' }}>Browser</div>
          </div>
        </div>
      </div>{/* end library section */}

      {/* ── Upload section ── */}
      {frame >= T_BUCKET_IN && (
        <div style={{ position: 'absolute', inset: 0, opacity: frame >= T_COMP_FADE_IN ? uploadSectionOp2 : 1 }}>

          {/* Bucket — centered */}
          <div style={{
            position: 'absolute',
            left: 960, top: 480,
            transform: `translate(-50%, -50%) scale(${bucketScale})`,
            opacity: bucketOp,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
          }}>
            <div style={{
              filter: bucketReceived ? `drop-shadow(0 0 40px ${GREEN}99)` : undefined,
              transition: 'filter 0.1s',
            }}>
              <StorageBucketIcon size={180} />
            </div>
            <div style={{ fontSize: 15, color: DIM, fontFamily: FONT, letterSpacing: '-0.01em' }}>
              <span style={{ color: BRIGHT, fontWeight: 600 }}>videos/</span> bucket
            </div>

            {/* Upload progress bar */}
            {uploadBarOp > 0 && (
              <div style={{ opacity: uploadBarOp, width: 220 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 12, color: DIM, fontFamily: FONT, marginBottom: 6,
                }}>
                  <span>Uploading…</span>
                  <span style={{ color: uploadProgress >= 1 ? GREEN : DIM }}>
                    {Math.round(uploadProgress * 100)}%
                  </span>
                </div>
                <div style={{
                  height: 4, backgroundColor: 'rgba(255,255,255,0.06)',
                  borderRadius: 2, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${uploadProgress * 100}%`,
                    backgroundColor: GREEN,
                    borderRadius: 2,
                    boxShadow: `0 0 8px ${GREEN}88`,
                  }} />
                </div>
              </div>
            )}
          </div>

          {/* Compressed file card — starts left, flies right into bucket */}
          {frame >= T_FILE_IN && (
            <FileCard
              opacity={frame >= T_FLY_S ? flyOp : fileCardOp}
              scale={frame >= T_FLY_S ? flyScale : fileCardSc}
              x={frame >= T_FLY_S ? flyX : 380}
              y={frame >= T_FLY_S ? flyY : 540}
            />
          )}

          {/* Success badge */}
          {frame >= T_SUCCESS && (
            <div style={{
              position: 'absolute',
              left: 960, top: 820,
              transform: `translate(-50%, -50%) scale(${successScale})`,
              opacity: successOp,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              backgroundColor: 'rgba(62,207,142,0.1)',
              border: `1.5px solid ${GREEN}`,
              borderRadius: 16,
              padding: '14px 36px',
              boxShadow: `0 0 40px rgba(62,207,142,0.2)`,
            }}>
              <span style={{ fontSize: 28 }}>✓</span>
              <span style={{
                fontSize: 24, fontWeight: 700, color: GREEN,
                letterSpacing: '-0.02em', fontFamily: FONT,
              }}>
                Uploaded to Storage
              </span>
            </div>
          )}

        </div>
      )}{/* end upload section */}

      {/* ── Comparison section ── */}
      {frame >= T_COMP_FADE_IN && (
        <div style={{ position: 'absolute', inset: 0, opacity: compSectionOp }}>

          {/* Centered row: before | arrow | after */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48,
          }}>

            {/* Before card — 3 MB */}
            <div style={{
              opacity: beforeOp,
              transform: `scale(${beforeScale})`,
              backgroundColor: PANEL_BG,
              border: `1px solid rgba(239,68,68,0.25)`,
              borderRadius: 20,
              padding: '32px 36px',
              width: 340,
              flexShrink: 0,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: FONT, marginBottom: 20 }}>Before</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <VideoFileIcon size={72} dimmed />
                <div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: BRIGHT, letterSpacing: '-0.02em', fontFamily: FONT }}>raw.jpg</div>
                  <div style={{ fontSize: 42, fontWeight: 800, color: '#ef4444', letterSpacing: '-0.04em', fontFamily: FONT, lineHeight: 1.1, marginTop: 6 }}>3 MB</div>
                </div>
              </div>
            </div>

            {/* Arrow + compress() label */}
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              {arrowProgress > 0.45 && (
                <div style={{
                  fontSize: 14, fontWeight: 600, color: GREEN,
                  fontFamily: FONT, letterSpacing: '-0.01em',
                  opacity: Math.min((arrowProgress - 0.45) / 0.2, 1),
                }}>
                  compress()
                </div>
              )}
              <svg width={160} height={20} style={{ overflow: 'visible' }}>
                <line
                  x1={0} y1={10}
                  x2={arrowProgress * 140} y2={10}
                  stroke={GREEN} strokeWidth={2.5} strokeOpacity={0.55}
                  strokeDasharray="10 6" strokeLinecap="round"
                />
                {arrowProgress > 0.88 && (
                  <path
                    d={`M 128 2 L 144 10 L 128 18`}
                    fill="none" stroke={GREEN}
                    strokeOpacity={(arrowProgress - 0.88) / 0.12}
                    strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
                  />
                )}
              </svg>
            </div>

            {/* After card — 300 KB */}
            <div style={{
              opacity: afterOp,
              transform: `scale(${afterScale})`,
              backgroundColor: PANEL_BG,
              border: `1px solid rgba(62,207,142,0.25)`,
              borderRadius: 20,
              padding: '32px 36px',
              width: 340,
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: GREEN, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: FONT }}>After</div>
                <div style={{
                  fontSize: 11, fontWeight: 700,
                  color: '#0f0f0f', backgroundColor: GREEN,
                  padding: '3px 10px', borderRadius: 10,
                  fontFamily: FONT, letterSpacing: '0.02em',
                }}>↓ 90%</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <VideoFileIcon size={72} />
                <div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: BRIGHT, letterSpacing: '-0.02em', fontFamily: FONT }}>optimized.jpg</div>
                  <div style={{ fontSize: 42, fontWeight: 800, color: GREEN, letterSpacing: '-0.04em', fontFamily: FONT, lineHeight: 1.1, marginTop: 6, textShadow: `0 0 30px ${GREEN}66` }}>300 KB</div>
                </div>
              </div>
            </div>

          </div>

          {/* Final badge — centered below cards */}
          {frame >= T_FINAL_SUCCESS && (
            <div style={{
              position: 'absolute', left: 960, top: 780,
              transform: `translate(-50%, -50%) scale(${finalScale})`,
              opacity: finalOp,
              display: 'flex', alignItems: 'center', gap: 12,
              backgroundColor: 'rgba(62,207,142,0.08)',
              border: `1.5px solid ${GREEN}44`,
              borderRadius: 14, padding: '12px 30px',
            }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: DIM, fontFamily: FONT, letterSpacing: '-0.01em' }}>
                10× smaller before it ever hits your bucket
              </span>
            </div>
          )}

        </div>
      )}{/* end comparison section */}

      {/* Bottom accent */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, transparent, ${GREEN}77, transparent)`,
        opacity: funcOp * 0.8,
      }} />

    </AbsoluteFill>
  );
};
