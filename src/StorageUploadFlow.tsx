import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';

// ── Palette ───────────────────────────────────────────────────────────────────
const GREEN = '#3ecf8e';
const BG = '#0d1f2d';
const PANEL_BG = '#141c26';
const PANEL_BORDER = 'rgba(255,255,255,0.08)';
const TEXT_DIM = '#718096';
const TEXT_BRIGHT = '#e2e8f0';

// ── Cylinder dimensions ───────────────────────────────────────────────────────
const DB_RY = 32;
const DB_BODY_H = 210;
const DB_H = DB_RY * 2 + DB_BODY_H; // 274

// ── Layout (1080 × 1920) ──────────────────────────────────────────────────────
const PW = 740;
const PX = (1080 - PW) / 2; // 170
const PMX = 1080 / 2;       // 540

const USER_H  = 180;
const CONN_H  = 100;
const STOR_H  = 380;

const TOTAL_H   = USER_H + CONN_H + STOR_H + CONN_H + DB_H; // 1034
const TOP       = Math.round((1920 - TOTAL_H) / 2);          // 443

const USER_TOP  = TOP;
const CONN1_TOP = USER_TOP  + USER_H;
const STOR_TOP  = CONN1_TOP + CONN_H;
const CONN2_TOP = STOR_TOP  + STOR_H;
const DB_TOP    = CONN2_TOP + CONN_H;

// Camera targets: Y offset that centres each section at viewport midpoint (960)
const STOR_CAM_Y = 960 - (STOR_TOP + STOR_H / 2); //  47
const DB_CAM_Y   = 960 - (DB_TOP   + DB_H   / 2); // -380

// ── Timing ────────────────────────────────────────────────────────────────────
const T_IN      = 25;
const T_CONTENT = 38;
const T_FILE    = 55;
const T_SEND    = 78;
const T_FLOW1_S = 82;
const T_FLOW1_E = 160;
const T_STORED  = 170;
const T_FLOW2_S = 192;
const T_FLOW2_E = 265;
const T_DB_ROW  = 272;

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

// ── Cycling particles flowing downward ────────────────────────────────────────
const VParticles: React.FC<{ y1: number; y2: number; cycle: number; n?: number }> = ({
  y1, y2, cycle, n = 4,
}) => {
  if (cycle < 0) return null;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const t = (cycle + i / n) % 1;
        const y = y1 + (y2 - y1) * t;
        const op = t < 0.1 ? t / 0.1 : t > 0.86 ? (1 - t) / 0.14 : 1;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: PMX - 5, top: y - 5,
              width: 10, height: 10,
              borderRadius: '50%',
              backgroundColor: GREEN,
              opacity: Math.max(0, op) * 0.95,
              boxShadow: `0 0 14px 3px ${GREEN}99`,
            }}
          />
        );
      })}
    </>
  );
};

// ── Supabase bolt ─────────────────────────────────────────────────────────────
const SupabaseLogo: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.084 12.957.712 14.25 1.86 14.25h8.238l-.107 8.714c.015.986 1.26 1.41 1.874.637l9.262-11.652c.68-.907.052-2.2-1.098-2.2h-8.238l.108-8.714z"
      fill="#3ECF8E"
    />
  </svg>
);

// ── Vertical connector with explicit downward V-chevron arrow ─────────────────
const VConnector: React.FC<{
  topY: number;
  label: string;
  stepNum: number;
  progress: number;
  stepDone: boolean;
}> = ({ topY, label, stepNum, progress, stepDone }) => {
  const lineLen = CONN_H - 30;
  const drawn   = progress * lineLen;
  const fadeIn  = itp(progress, 0.5, 0.9);
  const cx      = 10;
  const lineTop = 12;
  const lineTip = lineTop + drawn;

  return (
    <div style={{
      position: 'absolute', left: 0, top: topY,
      width: 1080, height: CONN_H,
      pointerEvents: 'none',
    }}>
      {/* Step circle — left */}
      <div style={{
        position: 'absolute', left: PX + 10, top: '50%',
        transform: 'translateY(-50%)',
        opacity: fadeIn,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          backgroundColor: stepDone ? GREEN : 'transparent',
          border: `2px solid ${stepDone ? GREEN : GREEN + '66'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, color: stepDone ? '#000' : GREEN,
          fontWeight: '800', fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          {stepDone ? '✓' : stepNum}
        </div>
      </div>

      {/* Dashed line + downward V-chevron */}
      <svg
        width={20} height={CONN_H}
        style={{ position: 'absolute', left: PMX - 10, top: 0, overflow: 'visible' }}
      >
        {drawn > 2 && (
          <line
            x1={cx} y1={lineTop}
            x2={cx} y2={lineTip}
            stroke={`rgba(62,207,142,${Math.min(progress * 1.4, 0.65)})`}
            strokeWidth={2.5}
            strokeDasharray="8 5"
          />
        )}
        {drawn > 14 && (
          <path
            d={`M ${cx - 9} ${lineTip - 12} L ${cx} ${lineTip} L ${cx + 9} ${lineTip - 12}`}
            fill="none"
            stroke={`rgba(62,207,142,${Math.min(progress * 1.8, 0.8)})`}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>

      {/* Label — right */}
      <div style={{
        position: 'absolute', right: PX + 10, top: '50%',
        transform: 'translateY(-50%)',
        fontSize: 13, fontWeight: '700', color: GREEN,
        opacity: fadeIn, whiteSpace: 'nowrap', letterSpacing: '0.05em',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        {label}
      </div>
    </div>
  );
};

// ── Database cylinder (pure SVG) ──────────────────────────────────────────────
const DatabaseCylinder: React.FC<{
  contentOp: number;
  newRowOp: number;
  newRowSlide: number;
  glow: boolean;
  scale: number;
}> = ({ contentOp, newRowOp, newRowSlide, glow, scale }) => {
  const RX   = PW / 2;
  const RY   = DB_RY;
  const BODY = DB_BODY_H;
  const SVGH = RY * 2 + BODY;

  const border = glow ? `${GREEN}55` : PANEL_BORDER;

  const CONTENT_Y = RY * 2 + 6;
  const ROW_H = 47;
  const R1Y = CONTENT_Y;
  const R2Y = R1Y + ROW_H;
  const R3Y = R2Y + ROW_H;

  return (
    <div style={{
      position: 'absolute', left: PX, top: DB_TOP, width: PW, height: SVGH,
      transform: `scale(${scale})`,
    }}>
      <svg width={PW} height={SVGH}>
        {/* Body fill + side borders */}
        <rect x={0} y={RY} width={PW} height={BODY} fill={PANEL_BG} />
        <line x1={0.75}      y1={RY} x2={0.75}      y2={RY + BODY} stroke={border} strokeWidth={1.5} />
        <line x1={PW - 0.75} y1={RY} x2={PW - 0.75} y2={RY + BODY} stroke={border} strokeWidth={1.5} />

        {/* Row dividers */}
        <line x1={16} y1={R2Y} x2={PW - 16} y2={R2Y} stroke={PANEL_BORDER} strokeWidth={1} opacity={contentOp} />
        <line x1={16} y1={R3Y} x2={PW - 16} y2={R3Y} stroke={PANEL_BORDER} strokeWidth={1} opacity={contentOp} />

        {/* Existing rows (dim) */}
        <g opacity={contentOp * 0.4} fontFamily="Inter, system-ui, sans-serif">
          <text x={30}       y={R1Y + 26} fontSize={14} fill={TEXT_DIM}>1</text>
          <text x={76}       y={R1Y + 26} fontSize={14} fill={TEXT_DIM}>banner.jpg</text>
          <text x={PW - 24}  y={R1Y + 26} fontSize={13} fill="#4a5568" textAnchor="end">2.4 MB</text>

          <text x={30}       y={R2Y + 26} fontSize={14} fill={TEXT_DIM}>2</text>
          <text x={76}       y={R2Y + 26} fontSize={14} fill={TEXT_DIM}>thumb.png</text>
          <text x={PW - 24}  y={R2Y + 26} fontSize={13} fill="#4a5568" textAnchor="end">840 KB</text>
        </g>

        {/* New row (animated) */}
        <g
          opacity={newRowOp}
          transform={`translate(0, ${newRowSlide})`}
          fontFamily="Inter, system-ui, sans-serif"
        >
          <rect x={0} y={R3Y} width={PW} height={ROW_H - 1} fill="rgba(62,207,142,0.09)" />
          <rect x={0} y={R3Y} width={3}  height={ROW_H - 1} fill={GREEN} />
          <text x={30}      y={R3Y + 26} fontSize={14} fill={GREEN} fontWeight="bold">3</text>
          <text x={76}      y={R3Y + 26} fontSize={15} fill={TEXT_BRIGHT} fontWeight="600">demo_video.mp4</text>
          <text x={PW - 24} y={R3Y + 26} fontSize={13} fill={GREEN} textAnchor="end">310 MB</text>
        </g>

        {/* Bottom ellipse */}
        <ellipse
          cx={RX} cy={RY + BODY}
          rx={RX - 0.75} ry={RY}
          fill="#0f1a24" stroke={border} strokeWidth={1.5}
        />

        {/* Top ellipse — drawn last so it sits on top of body content */}
        <ellipse
          cx={RX} cy={RY}
          rx={RX - 0.75} ry={RY}
          fill="#1a2738" stroke={border} strokeWidth={1.5}
        />

        {/* Label on top disk */}
        <text
          x={RX} y={RY + 7}
          textAnchor="middle"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize={13} fontWeight="700" fill={GREEN}
        >
          videos
        </text>
      </svg>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export const StorageUploadFlow: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Entrance ─────────────────────────────────────────────────────────────
  const slideY    = itp(frame, 0, T_IN, 60, 0, easeOut);
  const fadeIn    = itp(frame, 0, T_IN);
  const contentOp = itp(frame, T_CONTENT, T_CONTENT + 15);

  // ── Camera zoom: follows the active section ───────────────────────────────
  // scale(S) translateY(T) with origin at viewport centre (540, 960)
  // formula: final_y = 960 + S*(original_y + T - 960)
  // setting T = target_cam_y centres the desired section at 960
  const toStorageT  = itp(frame, T_FLOW1_S, T_FLOW1_S + 28, 0, 1, easeInOut);
  const toDatabaseT = itp(frame, T_FLOW2_S, T_FLOW2_S + 28, 0, 1, easeInOut);

  const cameraScale = 1.0 + 0.05 * toStorageT + 0.04 * toDatabaseT;
  const cameraY     = STOR_CAM_Y * toStorageT + (DB_CAM_Y - STOR_CAM_Y) * toDatabaseT;

  // ── User section: spring scale-in ────────────────────────────────────────
  const userSpring = spring({ frame: frame - T_CONTENT, fps: 30,
    config: { damping: 14, stiffness: 150, mass: 1.0 } });
  const userScale = frame < T_CONTENT ? 0.65 : Math.min(0.65 + 0.35 * userSpring, 1.12);

  // ── Storage panel: pop scale when upload begins ───────────────────────────
  const storagePop = frame < T_FLOW1_S ? 1
    : frame < T_FLOW1_S + 10 ? itp(frame, T_FLOW1_S, T_FLOW1_S + 10, 1, 1.06, easeOut)
    : itp(frame, T_FLOW1_S + 10, T_FLOW1_S + 28, 1.06, 1.0, easeInOut);

  // ── DB cylinder: punch scale when row arrives ─────────────────────────────
  const dbPop = frame < T_DB_ROW ? 1
    : frame < T_DB_ROW + 10 ? itp(frame, T_DB_ROW, T_DB_ROW + 10, 1, 1.07, easeOut)
    : itp(frame, T_DB_ROW + 10, T_DB_ROW + 28, 1.07, 1.0, easeInOut);

  // ── File card ─────────────────────────────────────────────────────────────
  const fileOp     = itp(frame, T_FILE, T_FILE + 14);
  const fileScale  = itp(frame, T_FILE, T_FILE + 14, 0.7, 1, easeOut);
  const fileSendOp = frame >= T_SEND ? itp(frame, T_SEND, T_SEND + 16, 1, 0) : 1;
  const fileSendY  = frame >= T_SEND ? itp(frame, T_SEND, T_SEND + 16, 0, -18, easeOut) : 0;

  // ── Connector 1 ───────────────────────────────────────────────────────────
  const arrow1  = itp(frame, T_FLOW1_S, T_FLOW1_S + 25, 0, 1, easeInOut);
  const p1cycle = frame >= T_FLOW1_S && frame < T_FLOW1_E
    ? ((frame - T_FLOW1_S) % 38) / 38 : -1;

  // ── Storage ───────────────────────────────────────────────────────────────
  const storedOp    = itp(frame, T_STORED, T_STORED + 16);
  const storedSlide = itp(frame, T_STORED, T_STORED + 16, 14, 0, easeOut);

  // ── Connector 2 ───────────────────────────────────────────────────────────
  const arrow2  = itp(frame, T_FLOW2_S, T_FLOW2_S + 25, 0, 1, easeInOut);
  const p2cycle = frame >= T_FLOW2_S && frame < T_FLOW2_E
    ? ((frame - T_FLOW2_S) % 38) / 38 : -1;

  // ── DB row ────────────────────────────────────────────────────────────────
  const dbOp    = itp(frame, T_DB_ROW, T_DB_ROW + 16);
  const dbSlide = itp(frame, T_DB_ROW, T_DB_ROW + 16, 14, 0, easeOut);

  const step1Done   = frame >= T_STORED;
  const step2Done   = frame >= T_DB_ROW;
  const storageGlow = frame >= T_FLOW1_S;
  const dbGlow      = frame >= T_DB_ROW;

  return (
    <AbsoluteFill style={{
      backgroundColor: BG,
      fontFamily: 'Inter, system-ui, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 45%, rgba(62,207,142,0.08) 0%, transparent 60%)`,
        pointerEvents: 'none',
      }} />

      {/* ── Camera wrapper — zooms into each section as the story progresses ── */}
      <div style={{
        position: 'absolute', inset: 0,
        transform: `scale(${cameraScale}) translateY(${cameraY}px)`,
        // transform-origin defaults to 50% 50% = (540px, 960px) for this full-canvas div
      }}>

        {/* ── Entrance slide ── */}
        <div style={{
          position: 'absolute', left: 0, top: 0, width: 1080, height: 1920,
          transform: `translateY(${slideY}px)`,
          opacity: fadeIn,
        }}>

          {/* ── USER SECTION ──────────────────────────────────── */}
          <div style={{
            position: 'absolute',
            left: PX, top: USER_TOP,
            width: PW, height: USER_H,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 14,
            opacity: contentOp,
            transform: `scale(${userScale})`,
          }}>
            <svg width={80} height={88} viewBox="0 0 80 88">
              <circle cx={40} cy={27} r={22} fill="none" stroke={GREEN} strokeWidth={2.5} />
              <path d="M 6 84 C 6 58 74 58 74 84" fill={`${GREEN}20`} stroke={GREEN} strokeWidth={2.5} />
            </svg>

            <div style={{ transform: `translateY(${fileSendY}px)`, opacity: fileOp * fileSendOp }}>
              <div style={{
                transform: `scale(${fileScale})`,
                backgroundColor: 'rgba(62,207,142,0.08)',
                border: `1px solid ${GREEN}55`,
                borderRadius: 10,
                padding: '8px 18px',
                display: 'flex', alignItems: 'center', gap: 10,
                whiteSpace: 'nowrap',
              }}>
                <span style={{ fontSize: 22 }}>🎬</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: '600', color: TEXT_BRIGHT }}>demo_video.mp4</div>
                  <div style={{ fontSize: 12, color: TEXT_DIM }}>310 MB</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── CONNECTOR 1 ───────────────────────────────────── */}
          {arrow1 > 0 && (
            <VConnector
              topY={CONN1_TOP}
              label="HTTP Upload"
              stepNum={1}
              progress={arrow1}
              stepDone={step1Done}
            />
          )}
          <VParticles y1={CONN1_TOP + 12} y2={STOR_TOP - 14} cycle={p1cycle} />

          {/* ── STORAGE PANEL ─────────────────────────────────── */}
          <div style={{
            position: 'absolute', left: PX, top: STOR_TOP,
            width: PW, height: STOR_H,
            backgroundColor: PANEL_BG,
            borderRadius: 16,
            border: `1px solid ${storageGlow ? GREEN + '55' : PANEL_BORDER}`,
            overflow: 'hidden',
            boxShadow: storageGlow ? `0 0 40px ${GREEN}18` : '0 4px 28px rgba(0,0,0,0.3)',
            transform: `scale(${storagePop})`,
          }}>
            <div style={{
              backgroundColor: '#0d1117',
              padding: '14px 20px',
              borderBottom: `1px solid ${PANEL_BORDER}`,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <SupabaseLogo size={24} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: TEXT_DIM, fontSize: 15 }}>Storage</span>
                <span style={{ color: '#4a5568', fontSize: 15 }}>/</span>
                <span style={{ color: TEXT_BRIGHT, fontSize: 15, fontWeight: '600' }}>uploads</span>
              </div>
            </div>

            <div style={{
              padding: '10px 20px',
              display: 'grid', gridTemplateColumns: '1fr 88px',
              borderBottom: `1px solid ${PANEL_BORDER}`,
              opacity: contentOp,
            }}>
              <span style={{ fontSize: 11, color: '#4a5568', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</span>
              <span style={{ fontSize: 11, color: '#4a5568', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Size</span>
            </div>

            <div style={{ opacity: contentOp * 0.38 }}>
              {[['🖼️', 'banner.jpg', '2.4 MB'], ['📄', 'thumb.png', '840 KB']].map(([icon, name, size]) => (
                <div key={name as string} style={{
                  padding: '13px 20px',
                  display: 'grid', gridTemplateColumns: '1fr 88px', alignItems: 'center',
                  borderBottom: `1px solid ${PANEL_BORDER}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <span style={{ fontSize: 14, color: TEXT_DIM }}>{name}</span>
                  </div>
                  <span style={{ fontSize: 13, color: '#4a5568' }}>{size}</span>
                </div>
              ))}
            </div>

            {frame >= T_STORED && (
              <div style={{
                padding: '13px 20px',
                display: 'grid', gridTemplateColumns: '1fr 88px', alignItems: 'center',
                opacity: storedOp,
                transform: `translateY(${storedSlide}px)`,
                backgroundColor: 'rgba(62,207,142,0.09)',
                borderLeft: `3px solid ${GREEN}`,
                borderBottom: `1px solid ${PANEL_BORDER}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>🎬</span>
                  <span style={{ fontSize: 14, color: TEXT_BRIGHT, fontWeight: '600' }}>demo_video.mp4</span>
                </div>
                <span style={{ fontSize: 13, color: GREEN, fontWeight: '600' }}>310 MB</span>
              </div>
            )}

            {frame >= T_STORED && (
              <div style={{
                margin: '14px 20px 0',
                padding: '11px 14px',
                backgroundColor: 'rgba(62,207,142,0.05)',
                borderRadius: 8,
                border: `1px solid ${GREEN}33`,
                opacity: storedOp,
              }}>
                <div style={{ fontSize: 10, color: TEXT_DIM, marginBottom: 4 }}>Public URL</div>
                <div style={{
                  fontSize: 12, color: GREEN,
                  fontFamily: 'monospace',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  *.supabase.co/storage/v1/object/public/uploads/demo_video.mp4
                </div>
              </div>
            )}
          </div>

          {/* ── CONNECTOR 2 ───────────────────────────────────── */}
          {arrow2 > 0 && (
            <VConnector
              topY={CONN2_TOP}
              label="Save Metadata"
              stepNum={2}
              progress={arrow2}
              stepDone={step2Done}
            />
          )}
          <VParticles y1={CONN2_TOP + 12} y2={DB_TOP - 14} cycle={p2cycle} />

          {/* ── DATABASE CYLINDER ─────────────────────────────── */}
          <DatabaseCylinder
            contentOp={contentOp}
            newRowOp={dbOp}
            newRowSlide={dbSlide}
            glow={dbGlow}
            scale={dbPop}
          />

        </div>{/* end entrance slide */}
      </div>{/* end camera wrapper */}

      {/* Bottom accent */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px',
        background: `linear-gradient(90deg, transparent, ${GREEN}77, transparent)`,
        opacity: fadeIn * 0.8,
      }} />
    </AbsoluteFill>
  );
};
