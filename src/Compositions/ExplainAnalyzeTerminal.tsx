import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const ExplainAnalyzeTerminal: React.FC = () => {
  const frame = useCurrentFrame();

  // Slow zoom effect - starts at 1.0 and slowly zooms to 1.15 over the entire animation
  const zoom = interpolate(frame, [0, 180], [1.0, 1.15], {
    extrapolateRight: 'clamp',
  });

  // SQL code that's already in the terminal
  const sqlQuery = 'SELECT * FROM users WHERE created_at > NOW() - INTERVAL \'30 days\';';

  // EXPLAIN ANALYZE box animation - slides in from the top
  const explainBoxY = interpolate(frame, [30, 60], [-200, 150], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Arrow animation - draws from top to bottom
  const arrowProgress = interpolate(frame, [70, 100], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Show output after arrow animation completes
  const showOutput = frame >= 110;
  const outputOpacity = interpolate(frame, [110, 130], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Terminal output rows
  const outputLines = [
    '                                                    QUERY PLAN',
    '─────────────────────────────────────────────────────────────────────────────────────────────',
    ' Seq Scan on users  (cost=0.00..1847.50 rows=12450 width=156) (actual time=0.012..8.234 rows=12384 loops=1)',
    '   Filter: (created_at > (now() - \'30 days\'::interval))',
    '   Rows Removed by Filter: 37616',
    ' Planning Time: 0.142 ms',
    ' Execution Time: 8.891 ms',
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0d1117',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* EXPLAIN ANALYZE box */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: `${explainBoxY}px`,
            transform: 'translateX(-50%)',
            backgroundColor: '#58a6ff',
            color: '#0d1117',
            padding: '24px 32px',
            borderRadius: '12px',
            fontSize: '32px',
            fontWeight: 'bold',
            fontFamily: 'Menlo, Monaco, monospace',
            boxShadow: '0 10px 40px rgba(88, 166, 255, 0.3)',
            border: '2px solid #79c0ff',
            zIndex: 10,
          }}
        >
          EXPLAIN ANALYZE
        </div>

        {/* Arrow */}
        {arrowProgress > 0 && (
          <svg
            style={{
              position: 'absolute',
              left: '50%',
              top: '250px',
              transform: 'translateX(-50%)',
              zIndex: 5,
            }}
            width="10"
            height="120"
          >
            {/* Arrow line */}
            <line
              x1="5"
              y1="0"
              x2="5"
              y2={120 * arrowProgress}
              stroke="#58a6ff"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Arrow head */}
            {arrowProgress > 0.9 && (
              <polygon
                points={`5,${120 * arrowProgress} 0,${120 * arrowProgress - 10} 10,${120 * arrowProgress - 10}`}
                fill="#58a6ff"
              />
            )}
          </svg>
        )}

        {/* Terminal window */}
        <div
          style={{
            position: 'absolute',
            top: '380px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '900px',
            backgroundColor: '#161b22',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            border: '1px solid #30363d',
          }}
        >
        {/* Terminal header */}
        <div
          style={{
            height: '44px',
            backgroundColor: '#21262d',
            borderBottom: '1px solid #30363d',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: '8px',
          }}
        >
          {/* Traffic light buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#ff5f57',
              }}
            />
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#febc2e',
              }}
            />
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#28c840',
              }}
            />
          </div>

          {/* Terminal title */}
          <div
            style={{
              flex: 1,
              textAlign: 'center',
              color: '#8b949e',
              fontSize: '13px',
              fontFamily: 'Menlo, Monaco, monospace',
              fontWeight: '500',
            }}
          >
            postgres@localhost:5432/production
          </div>
        </div>

        {/* Terminal content */}
        <div
          style={{
            padding: '24px',
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#c9d1d9',
            minHeight: '500px',
          }}
        >
          {/* Prompt with SQL query */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '4px' }}>
            <span style={{ color: '#58a6ff' }}>postgres=#</span>
            <div style={{ flex: 1 }}>
              {/* Highlight EXPLAIN ANALYZE when arrow appears */}
              {arrowProgress > 0 && (
                <span
                  style={{
                    color: '#58a6ff',
                    backgroundColor: 'rgba(88, 166, 255, 0.15)',
                    padding: '2px 4px',
                    borderRadius: '3px',
                  }}
                >
                  EXPLAIN ANALYZE{' '}
                </span>
              )}
              <span style={{ color: '#ffffff' }}>{sqlQuery}</span>
            </div>
          </div>

          {/* Output */}
          {showOutput && (
            <div
              style={{
                marginTop: '24px',
                opacity: outputOpacity,
              }}
            >
              {outputLines.map((line, index) => {
                // Color coding for different parts
                let color = '#c9d1d9';
                if (line.includes('QUERY PLAN') || line.includes('───')) {
                  color = '#8b949e';
                } else if (line.includes('cost=') || line.includes('actual time=')) {
                  color = '#79c0ff';
                } else if (line.includes('Planning Time:') || line.includes('Execution Time:')) {
                  color = '#ffa657';
                }

                return (
                  <div
                    key={index}
                    style={{
                      color,
                      whiteSpace: 'pre',
                      marginBottom: index === outputLines.length - 1 ? '0' : '2px',
                    }}
                  >
                    {line}
                  </div>
                );
              })}

              {/* Blinking cursor at the end */}
              {frame >= 140 && Math.floor((frame - 140) / 15) % 2 === 0 && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <span style={{ color: '#58a6ff' }}>postgres=#</span>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '10px',
                      height: '20px',
                      backgroundColor: '#58a6ff',
                      marginLeft: '2px',
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
