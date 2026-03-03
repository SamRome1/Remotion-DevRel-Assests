import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

const SupabaseLogo: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.084 12.957.712 14.25 1.86 14.25h8.238l-.107 8.714c.015.986 1.26 1.41 1.874.637l9.262-11.652c.68-.907.052-2.2-1.098-2.2h-8.238l.108-8.714z"
      fill="#3ECF8E"
    />
  </svg>
);

const SUPABASE_GREEN = '#3ecf8e';
const PANEL_BG = '#1c1c1c';
const PANEL_BORDER = 'rgba(255,255,255,0.08)';

const files = [
  { name: 'project_intro.mp4', size: 380, icon: '🎬', color: '#8b5cf6' },
  { name: 'demo_recording.mov', size: 460, icon: '🎥', color: '#3b82f6' },
  { name: 'final_cut_v3.mp4', size: 310, icon: '🎞️', color: '#f59e0b' },
];

// cumulative storage after each file: 380, 840, 1150 (exceeds 1000)
const LIMIT_MB = 1000;

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
      // how much of file 3 fits before hitting 1 GB?
      // used before file 3 = 380 + 460 = 840 MB, remaining = 1000 - 840 = 160 MB out of 310
      const maxFill = 160 / 310; // ~0.516
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


  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0d1f2d',
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
          background: `radial-gradient(circle at 50% 50%, rgba(62, 207, 142, 0.14) 0%, rgba(13, 31, 45, 0.0) 65%)`,
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
            {/* Supabase logo */}
            <SupabaseLogo size={34} />
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
                / 1 GB
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
            <span style={{ color: '#a0aec0', fontWeight: '600' }}>Free tier</span> · 1 GB limit
          </div>
        </div>
      </div>

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
