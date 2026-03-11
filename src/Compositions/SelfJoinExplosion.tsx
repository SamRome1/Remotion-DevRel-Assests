import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const SelfJoinExplosion: React.FC = () => {
  const frame = useCurrentFrame();

  // Slow zoom effect
  const zoom = interpolate(frame, [0, 200], [1.0, 1.3], {
    extrapolateRight: 'clamp',
  });

  // Left table slides in from left (accounting for 400px width, center at -300px)
  const leftTableX = interpolate(frame, [0, 40], [-1000, -500], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Right table slides in from right (accounting for 400px width, center at +300px)
  const rightTableX = interpolate(frame, [10, 50], [2000, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Show initial table
  const tableOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Arrow connecting tables
  const arrowProgress = interpolate(frame, [60, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Row count explosion
  const rowExplosionStart = 90;
  const rowExplosionEnd = 140;

  const rowCount = frame < rowExplosionStart
    ? 1000
    : frame > rowExplosionEnd
    ? 1000000
    : Math.floor(interpolate(
        frame,
        [rowExplosionStart, rowExplosionEnd],
        [1000, 1000000],
        { extrapolateRight: 'clamp' }
      ));

  // Show explosion happening
  const showExplosion = frame >= rowExplosionStart && frame <= rowExplosionEnd;

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  // Calculate intensity of explosion effect
  const explosionIntensity = showExplosion
    ? Math.sin(frame * 0.5) * 0.5 + 0.5
    : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0e27',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Title */}
        <div
          style={{
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '42px',
            fontWeight: 'bold',
            color: '#ffffff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            opacity: tableOpacity,
            textAlign: 'center',
          }}
        >
          Cartesian Product Explosion
        </div>

        {/* Left table - Users */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(${leftTableX}px, -50%)`,
            opacity: tableOpacity,
          }}
        >
          {/* Table */}
          <div
            style={{
              width: '400px',
              backgroundColor: '#1a1f3a',
              border: '2px solid #3b4261',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Table header */}
            <div
              style={{
                backgroundColor: '#2a3150',
                padding: '16px 24px',
                borderBottom: '2px solid #3b4261',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  color: '#58a6ff',
                  fontFamily: 'Menlo, Monaco, monospace',
                  fontWeight: 'bold',
                }}
              >
                users
              </div>
              <div
                style={{
                  backgroundColor: '#58a6ff',
                  color: '#0a0e27',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                1,000 rows
              </div>
            </div>

            {/* Table content preview */}
            <div
              style={{
                padding: '20px',
                fontFamily: 'Menlo, Monaco, monospace',
                fontSize: '14px',
                color: '#c9d1d9',
              }}
            >
              <div style={{ marginBottom: '12px', color: '#8b949e' }}>
                id | name | email
              </div>
              <div style={{ marginBottom: '8px' }}>
                1 | Alice | alice@company.com
              </div>
              <div style={{ marginBottom: '8px' }}>
                2 | Bob | bob@company.com
              </div>
              <div style={{ marginBottom: '8px' }}>
                3 | Carol | carol@company.com
              </div>
              <div style={{ marginBottom: '8px', color: '#6e7681' }}>
                ... 997 more rows
              </div>
            </div>
          </div>

          {/* Label */}
          <div
            style={{
              marginTop: '20px',
              textAlign: 'center',
              color: '#8b949e',
              fontSize: '18px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            1,000 users
          </div>
        </div>

        {/* Right table - Spending */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(${rightTableX}px, -50%)`,
            opacity: tableOpacity,
          }}
        >
          {/* Table */}
          <div
            style={{
              width: '400px',
              backgroundColor: '#1a1f3a',
              border: '2px solid #3b4261',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Table header */}
            <div
              style={{
                backgroundColor: '#2a3150',
                padding: '16px 24px',
                borderBottom: '2px solid #3b4261',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  color: '#f78166',
                  fontFamily: 'Menlo, Monaco, monospace',
                  fontWeight: 'bold',
                }}
              >
                spending
              </div>
              <div
                style={{
                  backgroundColor: '#f78166',
                  color: '#0a0e27',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                1,000 rows
              </div>
            </div>

            {/* Table content preview */}
            <div
              style={{
                padding: '20px',
                fontFamily: 'Menlo, Monaco, monospace',
                fontSize: '14px',
                color: '#c9d1d9',
              }}
            >
              <div style={{ marginBottom: '12px', color: '#8b949e' }}>
                id | user_id | amount | date
              </div>
              <div style={{ marginBottom: '8px' }}>
                1 | 42 | $150.00 | 2024-01-15
              </div>
              <div style={{ marginBottom: '8px' }}>
                2 | 89 | $75.50 | 2024-01-16
              </div>
              <div style={{ marginBottom: '8px' }}>
                3 | 12 | $220.00 | 2024-01-16
              </div>
              <div style={{ marginBottom: '8px', color: '#6e7681' }}>
                ... 997 more rows
              </div>
            </div>
          </div>

          {/* Label */}
          <div
            style={{
              marginTop: '20px',
              textAlign: 'center',
              color: '#8b949e',
              fontSize: '18px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            1,000 spending records
          </div>
        </div>


        {/* Multiplication arrow/symbol */}
        {arrowProgress > 0 && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '120px',
              color: showExplosion ? '#ef4444' : '#58a6ff',
              fontWeight: 'bold',
              opacity: arrowProgress,
              textShadow: showExplosion
                ? `0 0 ${40 * explosionIntensity}px #ef4444`
                : 'none',
              animation: showExplosion ? 'pulse 0.5s ease-in-out infinite' : 'none',
            }}
          >
            ×
          </div>
        )}

        {/* Result counter - shows explosion */}
        {frame >= rowExplosionStart && (
          <div
            style={{
              position: 'absolute',
              top: '200px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: showExplosion ? '#7f1d1d' : '#1a1f3a',
              border: `3px solid ${showExplosion ? '#ef4444' : '#58a6ff'}`,
              borderRadius: '16px',
              padding: '24px 48px',
              boxShadow: showExplosion
                ? `0 0 ${60 * explosionIntensity}px rgba(239, 68, 68, 0.6)`
                : '0 10px 40px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div
              style={{
                fontSize: '20px',
                color: '#8b949e',
                marginBottom: '8px',
                textAlign: 'center',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              Result Set
            </div>
            <div
              style={{
                fontSize: '56px',
                fontWeight: 'bold',
                color: showExplosion ? '#fca5a5' : '#58a6ff',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                textAlign: 'center',
                letterSpacing: '-0.02em',
              }}
            >
              {formatNumber(rowCount)} rows
            </div>
          </div>
        )}


        {/* Explosion particles effect */}
        {showExplosion && (
          <>
            {[...Array(12)].map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const distance = interpolate(
                frame,
                [rowExplosionStart, rowExplosionEnd],
                [0, 150],
                { extrapolateRight: 'clamp' }
              );
              const x = Math.cos(angle) * distance;
              const y = Math.sin(angle) * distance;

              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#ef4444',
                    borderRadius: '50%',
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    opacity: 1 - (frame - rowExplosionStart) / (rowExplosionEnd - rowExplosionStart),
                    boxShadow: '0 0 20px #ef4444',
                  }}
                />
              );
            })}
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};
