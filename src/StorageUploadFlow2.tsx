import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

// ── Palette ───────────────────────────────────────────────────────────────────
const GREEN = '#3ecf8e';
const BG = '#0d1f2d';
const PANEL_BG = '#141c26';
const PANEL_BORDER = 'rgba(255,255,255,0.08)';
const TEXT_DIM = '#718096';
const TEXT_BRIGHT = '#e2e8f0';

// ── Cylinder dimensions ───────────────────────────────────────────────────────
const DB_RY = 28;
const DB_BODY_H = 180;
const DB_H = DB_RY * 2 + DB_BODY_H; // 236

// ── Layout (1080 × 1920) ──────────────────────────────────────────────────────
const PW = 740;
const PX = (1080 - PW) / 2; // 170
const PMX = 1080 / 2;       // 540

const USER_H = 160;
const CONN_H = 82;
const STOR_H = 300;
const COMP_H = 260;

const TOTAL_H   = USER_H + CONN_H + STOR_H + CONN_H + COMP_H + CONN_H + DB_H; // 1202
const TOP       = Math.round((1920 - TOTAL_H) / 2);                             // 359

const USER_TOP  = TOP;
const CONN1_TOP = USER_TOP  + USER_H;
const STOR_TOP  = CONN1_TOP + CONN_H;
const CONN2_TOP = STOR_TOP  + STOR_H;
const COMP_TOP  = CONN2_TOP + CONN_H;
const CONN3_TOP = COMP_TOP  + COMP_H;
const DB_TOP    = CONN3_TOP + CONN_H;

// ── Timing ────────────────────────────────────────────────────────────────────
const T_IN          = 22;
const T_CONTENT     = 35;
const T_FILE        = 50;
const T_SEND        = 72;
const T_FLOW1_S     = 76;
const T_FLOW1_E     = 140;
const T_STORED      = 148;
const T_FLOW2_S     = 162;
const T_FLOW2_E     = 226;
const T_COMP_IN     = 233;  // input file appears in compressor
const T_COMPRESS_S  = 246;  // compression progress starts
const T_COMPRESS_E  = 306;  // compression completes (2 s)
const T_COMP_OUT    = 314;  // compressed output appears
const T_FLOW3_S     = 328;
const T_FLOW3_E     = 390;
const T_DB_ROW      = 398;

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

// ── Cycling particles ─────────────────────────────────────────────────────────
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

// ── Vertical connector with downward V-chevron arrow ──────────────────────────
const VConnector: React.FC<{
  topY: number;
  label: string;
  stepNum: number;
  progress: number;
  stepDone: boolean;
}> = ({ topY, label, stepNum, progress, stepDone }) => {
  const lineLen = CONN_H - 26;
  const drawn   = progress * lineLen;
  const fadeIn  = itp(progress, 0.5, 0.9);
  const cx      = 10;
  const lineTop = 10;
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
          width: 26, height: 26, borderRadius: '50%',
          backgroundColor: stepDone ? GREEN : 'transparent',
          border: `2px solid ${stepDone ? GREEN : GREEN + '66'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, color: stepDone ? '#000' : GREEN,
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
        {drawn > 12 && (
          <path
            d={`M ${cx - 9} ${lineTip - 11} L ${cx} ${lineTip} L ${cx + 9} ${lineTip - 11}`}
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
        fontSize: 12, fontWeight: '700', color: GREEN,
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
}> = ({ contentOp, newRowOp, newRowSlide, glow }) => {
  const RX   = PW / 2;
  const RY   = DB_RY;
  const BODY = DB_BODY_H;
  const SVGH = RY * 2 + BODY;

  const border    = glow ? `${GREEN}55` : PANEL_BORDER;
  const CONTENT_Y = RY * 2 + 5; // start below top ellipse
  const ROW_H     = 44;
  const R1Y = CONTENT_Y;
  const R2Y = R1Y + ROW_H;
  const R3Y = R2Y + ROW_H;

  return (
    <div style={{ position: 'absolute', left: PX, top: DB_TOP, width: PW, height: SVGH }}>
      <svg width={PW} height={SVGH}>
        {/* Body */}
        <rect x={0} y={RY} width={PW} height={BODY} fill={PANEL_BG} />
        <line x1={0.75}      y1={RY} x2={0.75}      y2={RY + BODY} stroke={border} strokeWidth={1.5} />
        <line x1={PW - 0.75} y1={RY} x2={PW - 0.75} y2={RY + BODY} stroke={border} strokeWidth={1.5} />

        {/* Row dividers */}
        <line x1={16} y1={R2Y} x2={PW - 16} y2={R2Y} stroke={PANEL_BORDER} strokeWidth={1} opacity={contentOp} />
        <line x1={16} y1={R3Y} x2={PW - 16} y2={R3Y} stroke={PANEL_BORDER} strokeWidth={1} opacity={contentOp} />

        {/* Existing rows (dim) */}
        <g opacity={contentOp * 0.4} fontFamily="Inter, system-ui, sans-serif">
          <text x={30}      y={R1Y + 24} fontSize={13} fill={TEXT_DIM}>1</text>
          <text x={76}      y={R1Y + 24} fontSize={13} fill={TEXT_DIM}>banner.jpg</text>
          <text x={PW - 24} y={R1Y + 24} fontSize={12} fill="#4a5568" textAnchor="end">2.4 MB</text>

          <text x={30}      y={R2Y + 24} fontSize={13} fill={TEXT_DIM}>2</text>
          <text x={76}      y={R2Y + 24} fontSize={13} fill={TEXT_DIM}>thumb.png</text>
          <text x={PW - 24} y={R2Y + 24} fontSize={12} fill="#4a5568" textAnchor="end">840 KB</text>
        </g>

        {/* New row (animated) */}
        <g
          opacity={newRowOp}
          transform={`translate(0, ${newRowSlide})`}
          fontFamily="Inter, system-ui, sans-serif"
        >
          <rect x={0} y={R3Y} width={PW} height={ROW_H - 1} fill="rgba(62,207,142,0.09)" />
          <rect x={0} y={R3Y} width={3}  height={ROW_H - 1} fill={GREEN} />
          <text x={30}      y={R3Y + 24} fontSize={13} fill={GREEN} fontWeight="bold">3</text>
          <text x={76}      y={R3Y + 24} fontSize={14} fill={TEXT_BRIGHT} fontWeight="600">demo_video.mp4</text>
          <text x={PW - 24} y={R3Y + 24} fontSize={12} fill={GREEN} textAnchor="end">300 KB</text>
        </g>

        {/* Bottom ellipse */}
        <ellipse
          cx={RX} cy={RY + BODY}
          rx={RX - 0.75} ry={RY}
          fill="#0f1a24" stroke={border} strokeWidth={1.5}
        />

        {/* Top ellipse — drawn last */}
        <ellipse
          cx={RX} cy={RY}
          rx={RX - 0.75} ry={RY}
          fill="#1a2738" stroke={border} strokeWidth={1.5}
        />

        <text
          x={RX} y={RY + 7}
          textAnchor="middle"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize={12} fontWeight="700" fill={GREEN}
        >
          videos
        </text>
      </svg>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export const StorageUploadFlow2: React.FC = () => {
  const frame = useCurrentFrame();

  // Entrance
  const slideY    = itp(frame, 0, T_IN, 60, 0, easeOut);
  const fadeIn    = itp(frame, 0, T_IN);
  const contentOp = itp(frame, T_CONTENT, T_CONTENT + 15);

  // File card
  const fileOp     = itp(frame, T_FILE, T_FILE + 14);
  const fileScale  = itp(frame, T_FILE, T_FILE + 14, 0.7, 1, easeOut);
  const fileSendOp = frame >= T_SEND ? itp(frame, T_SEND, T_SEND + 16, 1, 0) : 1;
  const fileSendY  = frame >= T_SEND ? itp(frame, T_SEND, T_SEND + 16, 0, -18, easeOut) : 0;

  // Connector 1 (user → storage)
  const arrow1  = itp(frame, T_FLOW1_S, T_FLOW1_S + 22, 0, 1, easeInOut);
  const p1cycle = frame >= T_FLOW1_S && frame < T_FLOW1_E
    ? ((frame - T_FLOW1_S) % 36) / 36 : -1;

  // Storage
  const storedOp    = itp(frame, T_STORED, T_STORED + 14);
  const storedSlide = itp(frame, T_STORED, T_STORED + 14, 12, 0, easeOut);

  // Connector 2 (storage → compressor)
  const arrow2  = itp(frame, T_FLOW2_S, T_FLOW2_S + 22, 0, 1, easeInOut);
  const p2cycle = frame >= T_FLOW2_S && frame < T_FLOW2_E
    ? ((frame - T_FLOW2_S) % 36) / 36 : -1;

  // Compressor panel
  const compInOp    = itp(frame, T_COMP_IN, T_COMP_IN + 14);
  const compInSlide = itp(frame, T_COMP_IN, T_COMP_IN + 14, 10, 0, easeOut);
  const compressProgress = itp(frame, T_COMPRESS_S, T_COMPRESS_E, 0, 1, easeInOut);
  const compOutOp   = itp(frame, T_COMP_OUT, T_COMP_OUT + 14);
  const compOutSlide = itp(frame, T_COMP_OUT, T_COMP_OUT + 14, 10, 0, easeOut);

  const compressStage =
    compressProgress < 0.33 ? 'Analyzing…'
    : compressProgress < 0.66 ? 'Encoding…'
    : compressProgress < 1 ? 'Optimizing…'
    : 'Done';

  // Connector 3 (compressor → database)
  const arrow3  = itp(frame, T_FLOW3_S, T_FLOW3_S + 22, 0, 1, easeInOut);
  const p3cycle = frame >= T_FLOW3_S && frame < T_FLOW3_E
    ? ((frame - T_FLOW3_S) % 36) / 36 : -1;

  // DB row
  const dbOp    = itp(frame, T_DB_ROW, T_DB_ROW + 14);
  const dbSlide = itp(frame, T_DB_ROW, T_DB_ROW + 14, 12, 0, easeOut);

  const step1Done    = frame >= T_STORED;
  const step2Done    = frame >= T_COMP_OUT;
  const step3Done    = frame >= T_DB_ROW;
  const storageGlow  = frame >= T_FLOW1_S;
  const compGlow     = frame >= T_COMP_IN;
  const dbGlow       = frame >= T_DB_ROW;

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

      {/* ── Single sliding container ── */}
      <div style={{
        position: 'absolute', left: 0, top: 0, width: 1080, height: 1920,
        transform: `translateY(${slideY}px)`,
        opacity: fadeIn,
      }}>

        {/* ── USER SECTION ──────────────────────────────────── */}
        <div style={{
          position: 'absolute',
          left: PX, top: USER_TOP,
          width: PW,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 12,
          opacity: contentOp,
        }}>
          <svg width={72} height={80} viewBox="0 0 72 80">
            <circle cx={36} cy={24} r={20} fill="none" stroke={GREEN} strokeWidth={2.5} />
            <path d="M 4 76 C 4 52 68 52 68 76" fill={`${GREEN}20`} stroke={GREEN} strokeWidth={2.5} />
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
              <span style={{ fontSize: 20 }}>🎬</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: '600', color: TEXT_BRIGHT }}>demo_video.mp4</div>
                <div style={{ fontSize: 11, color: TEXT_DIM }}>310 MB</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── CONNECTOR 1: user → storage ───────────────────── */}
        {arrow1 > 0 && (
          <VConnector
            topY={CONN1_TOP}
            label="HTTP Upload"
            stepNum={1}
            progress={arrow1}
            stepDone={step1Done}
          />
        )}
        <VParticles y1={CONN1_TOP + 10} y2={STOR_TOP - 12} cycle={p1cycle} />

        {/* ── STORAGE PANEL ─────────────────────────────────── */}
        <div style={{
          position: 'absolute', left: PX, top: STOR_TOP,
          width: PW, height: STOR_H,
          backgroundColor: PANEL_BG,
          borderRadius: 16,
          border: `1px solid ${storageGlow ? GREEN + '55' : PANEL_BORDER}`,
          overflow: 'hidden',
          boxShadow: storageGlow ? `0 0 40px ${GREEN}18` : '0 4px 28px rgba(0,0,0,0.3)',
        }}>
          <div style={{
            backgroundColor: '#0d1117',
            padding: '13px 20px',
            borderBottom: `1px solid ${PANEL_BORDER}`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <SupabaseLogo size={22} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: TEXT_DIM, fontSize: 14 }}>Storage</span>
              <span style={{ color: '#4a5568', fontSize: 14 }}>/</span>
              <span style={{ color: TEXT_BRIGHT, fontSize: 14, fontWeight: '600' }}>uploads</span>
            </div>
          </div>

          <div style={{
            padding: '9px 20px',
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
                padding: '11px 20px',
                display: 'grid', gridTemplateColumns: '1fr 88px', alignItems: 'center',
                borderBottom: `1px solid ${PANEL_BORDER}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <span style={{ fontSize: 13, color: TEXT_DIM }}>{name}</span>
                </div>
                <span style={{ fontSize: 12, color: '#4a5568' }}>{size}</span>
              </div>
            ))}
          </div>

          {frame >= T_STORED && (
            <div style={{
              padding: '11px 20px',
              display: 'grid', gridTemplateColumns: '1fr 88px', alignItems: 'center',
              opacity: storedOp,
              transform: `translateY(${storedSlide}px)`,
              backgroundColor: 'rgba(62,207,142,0.09)',
              borderLeft: `3px solid ${GREEN}`,
              borderBottom: `1px solid ${PANEL_BORDER}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>🎬</span>
                <span style={{ fontSize: 13, color: TEXT_BRIGHT, fontWeight: '600' }}>demo_video.mp4</span>
              </div>
              <span style={{ fontSize: 12, color: GREEN, fontWeight: '600' }}>310 MB</span>
            </div>
          )}
        </div>

        {/* ── CONNECTOR 2: storage → compressor ─────────────── */}
        {arrow2 > 0 && (
          <VConnector
            topY={CONN2_TOP}
            label="Send to Compressor"
            stepNum={2}
            progress={arrow2}
            stepDone={step2Done}
          />
        )}
        <VParticles y1={CONN2_TOP + 10} y2={COMP_TOP - 12} cycle={p2cycle} />

        {/* ── COMPRESSOR PANEL ──────────────────────────────── */}
        <div style={{
          position: 'absolute', left: PX, top: COMP_TOP,
          width: PW, height: COMP_H,
          backgroundColor: PANEL_BG,
          borderRadius: 16,
          border: `1px solid ${compGlow ? GREEN + '55' : PANEL_BORDER}`,
          overflow: 'hidden',
          boxShadow: compGlow ? `0 0 40px ${GREEN}18` : '0 4px 28px rgba(0,0,0,0.3)',
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#0d1117',
            padding: '13px 20px',
            borderBottom: `1px solid ${PANEL_BORDER}`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <SupabaseLogo size={22} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: TEXT_DIM, fontSize: 14 }}>Edge Functions</span>
              <span style={{ color: '#4a5568', fontSize: 14 }}>/</span>
              <span style={{ color: TEXT_BRIGHT, fontSize: 14, fontWeight: '600' }}>compress</span>
            </div>
          </div>

          <div style={{ padding: '16px 20px 0' }}>

            {/* Input file */}
            {frame >= T_COMP_IN && (
              <div style={{
                opacity: compInOp,
                transform: `translateY(${compInSlide}px)`,
                marginBottom: 14,
              }}>
                <div style={{ fontSize: 10, color: '#4a5568', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  Input
                </div>
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: 8,
                  border: `1px solid ${PANEL_BORDER}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>🎬</span>
                    <span style={{ fontSize: 13, color: TEXT_DIM }}>demo_video.mp4</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#4a5568' }}>310 MB</span>
                </div>
              </div>
            )}

            {/* Compression progress */}
            {frame >= T_COMPRESS_S && (
              <div style={{ marginBottom: 14, opacity: compressProgress < 1 ? 1 : itp(frame, T_COMP_OUT, T_COMP_OUT + 10, 1, 0.4) }}>
                <div style={{
                  height: 6,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  marginBottom: 6,
                }}>
                  <div style={{
                    height: '100%',
                    width: `${compressProgress * 100}%`,
                    backgroundColor: compressProgress >= 1 ? GREEN : '#3b82f6',
                    borderRadius: 3,
                    boxShadow: `0 0 8px ${compressProgress >= 1 ? GREEN : '#3b82f6'}88`,
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: TEXT_DIM }}>{compressStage}</span>
                  <span style={{ fontSize: 12, color: compressProgress >= 1 ? GREEN : TEXT_DIM, fontWeight: '600' }}>
                    {Math.round(compressProgress * 100)}%
                  </span>
                </div>
              </div>
            )}

            {/* Output file */}
            {frame >= T_COMP_OUT && (
              <div style={{
                opacity: compOutOp,
                transform: `translateY(${compOutSlide}px)`,
              }}>
                <div style={{ fontSize: 10, color: '#4a5568', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  Output
                </div>
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: 'rgba(62,207,142,0.08)',
                  borderRadius: 8,
                  border: `1px solid ${GREEN}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>🎬</span>
                    <span style={{ fontSize: 13, color: TEXT_BRIGHT, fontWeight: '600' }}>demo_video.mp4</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontSize: 11, fontWeight: '700', color: GREEN,
                      backgroundColor: 'rgba(62,207,142,0.12)',
                      padding: '2px 7px', borderRadius: 4,
                    }}>
                      ↓ 85%
                    </span>
                    <span style={{ fontSize: 12, color: GREEN, fontWeight: '600' }}>300 KB</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── CONNECTOR 3: compressor → database ────────────── */}
        {arrow3 > 0 && (
          <VConnector
            topY={CONN3_TOP}
            label="Save Metadata"
            stepNum={3}
            progress={arrow3}
            stepDone={step3Done}
          />
        )}
        <VParticles y1={CONN3_TOP + 10} y2={DB_TOP - 12} cycle={p3cycle} />

        {/* ── DATABASE CYLINDER ─────────────────────────────── */}
        <DatabaseCylinder
          contentOp={contentOp}
          newRowOp={dbOp}
          newRowSlide={dbSlide}
          glow={dbGlow}
        />

      </div>

      {/* Bottom accent */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px',
        background: `linear-gradient(90deg, transparent, ${GREEN}77, transparent)`,
        opacity: fadeIn * 0.8,
      }} />
    </AbsoluteFill>
  );
};
