import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';

const SUPABASE_GREEN = '#3ecf8e';
const PANEL_BG = '#1c1c1c';
const PANEL_BORDER = 'rgba(255,255,255,0.08)';

const files = [
  { name: 'project_intro.mp4', size: 128, icon: '🎬', color: '#8b5cf6' },
  { name: 'demo_recording.mov', size: 186, icon: '🎥', color: '#3b82f6' },
  { name: 'final_cut_v3.mp4', size: 210, icon: '🎞️', color: '#f59e0b' },
];

// cumulative storage after each file: 128, 314, 524 (exceeds 500)
const LIMIT_MB = 500;

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

// Upload phase timings (frames)
const UPLOAD_STARTS = [40, 110, 185];
const UPLOAD_ENDS = [100, 170, 230];

export const SupabaseStorageFull: React.FC = () => {
  const frame = useCurrentFrame();

  // --- Panel slide-in ---
  const panelY = interpolate(frame, [0, 30], [60, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOut,
  });
  const panelOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // --- Per-file upload progress ---
  const fileProgress = files.map((_, i) => {
    const start = UPLOAD_STARTS[i];
    const end = UPLOAD_ENDS[i];
    const raw = interpolate(frame, [start, end], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    // File 3 stops at the storage limit
    if (i === 2) {
      // how much of file 3 fits before hitting 500 MB?
      // used before file 3 = 128 + 186 = 314 MB, remaining = 500 - 314 = 186 MB out of 210
      const maxFill = 186 / 210; // ~0.886
      return Math.min(raw, maxFill);
    }
    return raw;
  });

  // cumulative used storage in MB
  const usedMB = Math.min(
    files[0].size * fileProgress[0] +
      files[1].size * fileProgress[1] +
      files[2].size * fileProgress[2],
    LIMIT_MB
  );
  const storagePercent = usedMB / LIMIT_MB;

  // --- Storage bar color: green → yellow → red ---
  const barColor =
    storagePercent < 0.7
      ? SUPABASE_GREEN
      : storagePercent < 0.9
      ? '#f59e0b'
      : '#ef4444';

  // --- Error toast ---
  const errorFrame = UPLOAD_ENDS[2] + 10;
  const errorScale = spring({
    frame: frame - errorFrame,
    fps: 30,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });
  const errorOpacity = interpolate(frame, [errorFrame, errorFrame + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // --- Complaint bubble ---
  const complaintFrame = errorFrame + 20;
  const complaintOpacity = interpolate(frame, [complaintFrame, complaintFrame + 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const complaintY = interpolate(frame, [complaintFrame, complaintFrame + 15], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOut,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f1419',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle at 50% 50%, rgba(62, 207, 142, 0.06) 0%, transparent 55%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Main panel */}
      <div
        style={{
          transform: `translateY(${panelY}px)`,
          opacity: panelOpacity,
          display: 'flex',
          gap: '40px',
          alignItems: 'flex-start',
        }}
      >
        {/* ─── Storage Browser Panel ─── */}
        <div
          style={{
            width: '780px',
            backgroundColor: PANEL_BG,
            borderRadius: '16px',
            border: `1px solid ${PANEL_BORDER}`,
            overflow: 'hidden',
          }}
        >
          {/* Panel header */}
          <div
            style={{
              backgroundColor: '#161616',
              padding: '20px 28px',
              borderBottom: `1px solid ${PANEL_BORDER}`,
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            {/* Supabase-style breadcrumb */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: SUPABASE_GREEN,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              🗄️
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#718096', fontSize: '22px' }}>Storage</span>
              <span style={{ color: '#4a5568', fontSize: '22px' }}>/</span>
              <span style={{ color: '#e2e8f0', fontSize: '22px', fontWeight: '600' }}>
                my-bucket
              </span>
            </div>
            {/* Upload button */}
            <div
              style={{
                marginLeft: 'auto',
                backgroundColor: SUPABASE_GREEN,
                color: '#000',
                padding: '8px 20px',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: '600',
              }}
            >
              Upload
            </div>
          </div>

          {/* Column headers */}
          <div
            style={{
              padding: '12px 28px',
              display: 'grid',
              gridTemplateColumns: '1fr 120px 180px',
              gap: '12px',
              borderBottom: `1px solid ${PANEL_BORDER}`,
            }}
          >
            {['Name', 'Size', 'Status'].map((h) => (
              <div key={h} style={{ fontSize: '16px', color: '#4a5568', fontWeight: '600' }}>
                {h}
              </div>
            ))}
          </div>

          {/* File rows */}
          <div style={{ padding: '12px 0' }}>
            {files.map((file, i) => {
              const started = frame >= UPLOAD_STARTS[i];
              const progress = fileProgress[i];
              const done =
                i < 2
                  ? progress >= 0.999
                  : false; // file 3 never completes
              const failed = i === 2 && frame >= UPLOAD_ENDS[2];

              const rowOpacity = interpolate(frame, [UPLOAD_STARTS[i] - 5, UPLOAD_STARTS[i] + 5], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });

              if (!started) return null;

              return (
                <div
                  key={file.name}
                  style={{
                    padding: '16px 28px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 120px 180px',
                    gap: '12px',
                    alignItems: 'center',
                    opacity: rowOpacity,
                    borderBottom: `1px solid ${PANEL_BORDER}`,
                  }}
                >
                  {/* Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>{file.icon}</span>
                    <span style={{ color: '#e2e8f0', fontSize: '20px', fontWeight: '500' }}>
                      {file.name}
                    </span>
                  </div>
                  {/* Size */}
                  <div style={{ color: '#718096', fontSize: '18px' }}>{file.size} MB</div>
                  {/* Status / Progress */}
                  <div>
                    {done ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: SUPABASE_GREEN,
                          fontSize: '18px',
                          fontWeight: '600',
                        }}
                      >
                        ✓ Uploaded
                      </div>
                    ) : failed ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#ef4444',
                          fontSize: '18px',
                          fontWeight: '600',
                        }}
                      >
                        ✕ Failed
                      </div>
                    ) : (
                      <div>
                        <div
                          style={{
                            height: '6px',
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            marginBottom: '6px',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${progress * 100}%`,
                              backgroundColor: i === 2 ? '#ef4444' : SUPABASE_GREEN,
                              borderRadius: '3px',
                              transition: 'width 0.1s',
                            }}
                          />
                        </div>
                        <div style={{ color: '#718096', fontSize: '15px' }}>
                          {Math.round(progress * file.size)} / {file.size} MB
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Storage Meter Panel ─── */}
        <div
          style={{
            width: '340px',
            backgroundColor: PANEL_BG,
            borderRadius: '16px',
            border: `1px solid ${PANEL_BORDER}`,
            padding: '32px',
          }}
        >
          <div style={{ fontSize: '20px', color: '#718096', fontWeight: '600', marginBottom: '24px' }}>
            Storage Usage
          </div>

          {/* Circular-ish storage visual */}
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            {/* Donut via SVG */}
            <svg width="276" height="160" viewBox="0 0 276 160">
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
                stroke={barColor}
                strokeWidth="22"
                strokeLinecap="round"
                strokeDasharray={`${storagePercent * 370} 370`}
                style={{ filter: `drop-shadow(0 0 8px ${barColor}88)` }}
              />
            </svg>

            {/* Center label */}
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '38px',
                  fontWeight: '800',
                  color: storagePercent >= 1 ? '#ef4444' : '#e2e8f0',
                  lineHeight: 1,
                }}
              >
                {Math.round(usedMB)}
              </div>
              <div style={{ fontSize: '16px', color: '#718096', marginTop: '4px' }}>
                / {LIMIT_MB} MB
              </div>
            </div>
          </div>

          {/* Bar */}
          <div
            style={{
              height: '10px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: '5px',
              overflow: 'hidden',
              marginBottom: '10px',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(storagePercent * 100, 100)}%`,
                backgroundColor: barColor,
                borderRadius: '5px',
                boxShadow: `0 0 10px ${barColor}66`,
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '15px',
              color: '#718096',
            }}
          >
            <span>{Math.round(usedMB)} MB used</span>
            <span>{Math.max(0, Math.round(LIMIT_MB - usedMB))} MB free</span>
          </div>

          {/* Tier label */}
          <div
            style={{
              marginTop: '24px',
              padding: '12px 16px',
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: '10px',
              border: `1px solid ${PANEL_BORDER}`,
              fontSize: '16px',
              color: '#718096',
            }}
          >
            <span style={{ color: '#a0aec0', fontWeight: '600' }}>Free tier</span> · 500 MB limit
          </div>
        </div>
      </div>

      {/* ─── Error Toast ─── */}
      {frame >= errorFrame && (
        <div
          style={{
            position: 'absolute',
            top: '80px',
            right: '120px',
            transform: `scale(${errorScale})`,
            opacity: errorOpacity,
            transformOrigin: 'top right',
            backgroundColor: '#1a0a0a',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 8px 32px rgba(239,68,68,0.25)',
          }}
        >
          <span style={{ fontSize: '28px' }}>🚫</span>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#ef4444' }}>
              Storage limit reached
            </div>
            <div style={{ fontSize: '16px', color: '#a0aec0', marginTop: '4px' }}>
              Upload failed — 500 MB quota exceeded
            </div>
          </div>
        </div>
      )}

      {/* ─── Complaint Bubble ─── */}
      {frame >= complaintFrame && (
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            opacity: complaintOpacity,
            transform: `translateY(${complaintY}px)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {/* Chat bubble */}
          <div
            style={{
              backgroundColor: '#1e1e2e',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '20px',
              padding: '22px 36px',
              maxWidth: '900px',
              position: 'relative',
              boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#fff',
                textAlign: 'center',
                lineHeight: 1.4,
              }}
            >
              500 MB?! I uploaded{' '}
              <span style={{ color: '#ef4444' }}>3 short videos</span> and already maxed it out 🤦
            </div>
            <div
              style={{
                fontSize: '24px',
                color: '#718096',
                textAlign: 'center',
                marginTop: '10px',
              }}
            >
              Supabase free tier storage fills up{' '}
              <span style={{ color: '#f59e0b', fontWeight: '600' }}>embarrassingly fast</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom accent */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '5px',
          background: `linear-gradient(90deg, transparent, ${barColor}, transparent)`,
          opacity: 0.6,
        }}
      />
    </AbsoluteFill>
  );
};
