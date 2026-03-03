import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

// ── Palette ───────────────────────────────────────────────────────────────────
const GREEN  = '#3ecf8e';
const YELLOW = '#f59e0b';
const RED    = '#ef4444';
const BG     = '#0d1f2d';
const PANEL_BG     = '#1c1c1c';
const PANEL_BORDER = 'rgba(255,255,255,0.08)';
const TEXT_DIM     = '#718096';
const TEXT_BRIGHT  = '#e2e8f0';

// ── Data ──────────────────────────────────────────────────────────────────────
const LIMIT_MB = 1000;

const FILES = [
  { name: 'project_intro.mp4', size: 240, icon: '🎬' },
  { name: 'demo_v2.mp4',       size: 210, icon: '🎥' },
  { name: 'tutorial.mp4',      size: 220, icon: '🎞️' },
  { name: 'final_cut.mp4',     size: 200, icon: '📹' },
];
// total: 870 MB = 87% of 1 GB

const FILE_FRAMES = [42, 72, 102, 132];

// ── Timing ────────────────────────────────────────────────────────────────────
const T_IN     = 26;
const T_CONT   = 38;
const T_ZOOM_S = 158; // start zoom into usage meter
const T_ZOOM_E = 200; // zoom complete

// ── Helpers ───────────────────────────────────────────────────────────────────
function easeOut(t: number)   { return 1 - (1 - t) ** 3; }
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

// Accumulate file sizes progressively as each file appears
function getUsedMB(frame: number): number {
  let used = 0;
  FILES.forEach((file, i) => {
    used += file.size * itp(frame, FILE_FRAMES[i], FILE_FRAMES[i] + 18);
  });
  return Math.min(used, LIMIT_MB);
}

function barColor(pct: number): string {
  if (pct < 0.70) return GREEN;
  if (pct < 0.85) return YELLOW;
  return RED;
}

// ── Supabase bolt ─────────────────────────────────────────────────────────────
const SupabaseLogo: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.084 12.957.712 14.25 1.86 14.25h8.238l-.107 8.714c.015.986 1.26 1.41 1.874.637l9.262-11.652c.68-.907.052-2.2-1.098-2.2h-8.238l.108-8.714z"
      fill="#3ECF8E"
    />
  </svg>
);

// ── Main component ────────────────────────────────────────────────────────────
export const StorageLimitWarning: React.FC = () => {
  const frame = useCurrentFrame();

  // Entrance
  const slideY  = itp(frame, 0, T_IN, 60, 0, easeOut);
  const fadeIn  = itp(frame, 0, T_IN);
  const contOp  = itp(frame, T_CONT, T_CONT + 14);

  // Storage state
  const usedMB = getUsedMB(frame);
  const pct    = usedMB / LIMIT_MB;
  const color  = barColor(pct);

  // Zoom — scales around the usage meter (positioned at ~72% of canvas width)
  const zoomScale  = itp(frame, T_ZOOM_S, T_ZOOM_E, 1, 1.45, easeInOut);
  // Fade the file browser out as we zoom in
  const browserOp  = itp(frame, T_ZOOM_S, T_ZOOM_E, 1, 0);

  // Pulse glow on usage meter after warning state
  const pulseIntensity = frame >= T_ZOOM_E && pct >= 0.85
    ? 0.25 + 0.12 * Math.sin(frame / 9)
    : pct >= 0.85 ? 0.2 : 0;

  return (
    <AbsoluteFill style={{
      backgroundColor: BG,
      fontFamily: 'Inter, system-ui, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Background — glow shifts color as storage fills */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 72% 50%, ${color}14 0%, transparent 55%)`,
        pointerEvents: 'none',
      }} />

      {/* Entrance wrapper */}
      <div style={{
        position: 'absolute', inset: 0,
        transform: `translateY(${slideY}px)`,
        opacity: fadeIn,
      }}>
        {/* Zoom wrapper — origin anchored at centre of usage meter */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: `scale(${zoomScale})`,
          transformOrigin: '72.4% 50%',
        }}>

          {/* ── Storage Browser Panel ─────────────────────── */}
          <div style={{
            width: 820,
            backgroundColor: PANEL_BG,
            borderRadius: 16,
            border: `1px solid ${PANEL_BORDER}`,
            overflow: 'hidden',
            marginRight: 40,
            flexShrink: 0,
            opacity: browserOp,
          }}>
            {/* Header */}
            <div style={{
              backgroundColor: '#161616',
              padding: '18px 24px',
              borderBottom: `1px solid ${PANEL_BORDER}`,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <SupabaseLogo size={30} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: TEXT_DIM, fontSize: 18 }}>Storage</span>
                <span style={{ color: '#4a5568', fontSize: 18 }}>/</span>
                <span style={{ color: TEXT_BRIGHT, fontSize: 18, fontWeight: '600' }}>videos</span>
              </div>
            </div>

            {/* Column headers */}
            <div style={{
              padding: '10px 24px',
              display: 'grid', gridTemplateColumns: '1fr 100px 140px',
              gap: 8,
              borderBottom: `1px solid ${PANEL_BORDER}`,
              opacity: contOp,
            }}>
              {['Name', 'Size', 'Status'].map(h => (
                <div key={h} style={{
                  fontSize: 13, color: '#4a5568', fontWeight: '700',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {h}
                </div>
              ))}
            </div>

            {/* File rows */}
            {FILES.map((file, i) => {
              if (frame < FILE_FRAMES[i]) return null;
              const rowOp    = itp(frame, FILE_FRAMES[i], FILE_FRAMES[i] + 12);
              const rowSlide = itp(frame, FILE_FRAMES[i], FILE_FRAMES[i] + 12, 12, 0, easeOut);
              return (
                <div
                  key={file.name}
                  style={{
                    padding: '16px 24px',
                    display: 'grid', gridTemplateColumns: '1fr 100px 140px',
                    gap: 8, alignItems: 'center',
                    opacity: rowOp,
                    transform: `translateY(${rowSlide}px)`,
                    borderBottom: `1px solid ${PANEL_BORDER}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 22 }}>{file.icon}</span>
                    <span style={{ color: TEXT_BRIGHT, fontSize: 16, fontWeight: '500' }}>
                      {file.name}
                    </span>
                  </div>
                  <div style={{ color: TEXT_DIM, fontSize: 15 }}>{file.size} MB</div>
                  <div style={{
                    color: GREEN, fontSize: 15, fontWeight: '600',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    ✓ Uploaded
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Storage Usage Meter ───────────────────────── */}
          <div style={{
            width: 380,
            backgroundColor: PANEL_BG,
            borderRadius: 16,
            border: `1px solid ${pct >= 0.85 ? RED + '66' : PANEL_BORDER}`,
            padding: '28px',
            flexShrink: 0,
            boxShadow: pct >= 0.85
              ? `0 0 ${40 + 20 * pulseIntensity}px rgba(239,68,68,${pulseIntensity})`
              : 'none',
          }}>
            <div style={{
              fontSize: 16, color: TEXT_DIM, fontWeight: '600', marginBottom: 20,
            }}>
              Storage Usage
            </div>

            {/* Donut arc gauge */}
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <svg width={276} height={160} viewBox="0 0 276 160">
                {/* Track */}
                <path
                  d="M 20 140 A 118 118 0 0 1 256 140"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="22"
                  strokeLinecap="round"
                />
                {/* Fill */}
                <path
                  d="M 20 140 A 118 118 0 0 1 256 140"
                  fill="none"
                  stroke={color}
                  strokeWidth="22"
                  strokeLinecap="round"
                  strokeDasharray={`${pct * 370} 370`}
                  style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
                />
              </svg>

              {/* Center label */}
              <div style={{
                position: 'absolute', bottom: 10, left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: 36, fontWeight: '800',
                  color: pct >= 0.85 ? RED : TEXT_BRIGHT,
                  lineHeight: 1,
                }}>
                  {Math.round(usedMB)}
                </div>
                <div style={{ fontSize: 13, color: TEXT_DIM, marginTop: 3 }}>/ 1 GB</div>
              </div>
            </div>

            {/* Linear bar */}
            <div style={{
              height: 8,
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: 4, overflow: 'hidden',
              marginBottom: 8,
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(pct * 100, 100)}%`,
                backgroundColor: color,
                borderRadius: 4,
                boxShadow: `0 0 10px ${color}66`,
              }} />
            </div>

            {/* Used / free labels */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 13, color: TEXT_DIM,
              marginBottom: 20,
            }}>
              <span>{Math.round(usedMB)} MB used</span>
              <span>{Math.max(0, Math.round(LIMIT_MB - usedMB))} MB free</span>
            </div>

            {/* Tier badge */}
            <div style={{
              padding: '10px 14px',
              backgroundColor: pct >= 0.85
                ? `rgba(239,68,68,0.10)`
                : 'rgba(255,255,255,0.04)',
              borderRadius: 8,
              border: `1px solid ${pct >= 0.85 ? RED + '44' : PANEL_BORDER}`,
              fontSize: 14, color: TEXT_DIM,
            }}>
              <span style={{
                color: pct >= 0.85 ? RED : '#a0aec0',
                fontWeight: '600',
              }}>
                Free tier
              </span>
              {' '}· 1 GB limit
            </div>
          </div>

        </div>
      </div>

      {/* Bottom accent */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px',
        background: `linear-gradient(90deg, transparent, ${color}77, transparent)`,
        opacity: fadeIn * 0.8,
      }} />
    </AbsoluteFill>
  );
};
