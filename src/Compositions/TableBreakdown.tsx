import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const TableBreakdown: React.FC = () => {
  const frame = useCurrentFrame();

  // Zoom effect
  const zoom = interpolate(frame, [0, 180], [1.0, 1.25], {
    extrapolateRight: 'clamp',
  });

  // Row counter - rapidly increases to 5 million
  const rowCountPhase1 = interpolate(frame, [20, 80], [0, 5000000], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const rowCount = frame < 20 ? 0 : Math.floor(rowCountPhase1);

  // Table appears
  const tableOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Stress indicators
  const showStress = frame >= 50;
  const stressLevel = interpolate(frame, [50, 90], [0, 1], {
    extrapolateRight: 'clamp',
  });


  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  // Progress percentage
  const progressPercent = (rowCount / 5000000) * 100;

  // Performance degradation - starts at 100%, drops to near 0
  const performance = interpolate(frame, [20, 90], [100, 5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Generate performance graph points - only draw up to current frame
  const getPerformancePoints = () => {
    const points: string[] = [];
    const segments = 50;

    // Only generate points up to where we are in time
    const currentProgress = Math.max(0, Math.min(1, (frame - 20) / 70));
    const maxSegment = Math.floor(currentProgress * segments);

    for (let i = 0; i <= maxSegment; i++) {
      const x = (i / segments) * 300;
      const frameAtPoint = 20 + (i / segments) * 70;
      // Calculate performance at this point (100% -> 5%)
      const perfAtPoint = interpolate(frameAtPoint, [20, 90], [100, 5], { extrapolateRight: 'clamp' });
      // Convert to y coordinate (invert so high perf is at top)
      const y = 100 - perfAtPoint;
      points.push(`${x},${y}`);
    }

    return points.join(' ');
  };

  // Visible rows calculation - shows which rows are "visible" in the scrolling table
  const visibleRowCount = 8;
  const baseRowIndex = Math.max(0, rowCount - visibleRowCount);

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
            top: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#ffffff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            opacity: tableOpacity,
            textAlign: 'center',
          }}
        >
          Creating Table...
        </div>

        {/* Main table container */}
        <div
          style={{
            opacity: tableOpacity,
          }}
        >
            <div
              style={{
                width: '800px',
                backgroundColor: '#1a1f3a',
                border: `3px solid ${showStress ? '#ef4444' : '#3b4261'}`,
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: showStress
                  ? `0 0 ${40 * stressLevel}px rgba(239, 68, 68, ${stressLevel * 0.6})`
                  : '0 20px 60px rgba(0, 0, 0, 0.4)',
                position: 'relative',
              }}
            >
              {/* Table header */}
              <div
                style={{
                  backgroundColor: '#2a3150',
                  padding: '24px 32px',
                  borderBottom: '2px solid #3b4261',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      fontSize: '28px',
                      color: showStress ? '#fca5a5' : '#58a6ff',
                      fontFamily: 'Menlo, Monaco, monospace',
                      fontWeight: 'bold',
                    }}
                  >
                    user_analytics
                  </div>
                  {showStress && (
                    <span style={{ fontSize: '28px' }}>⚠️</span>
                  )}
                </div>
              </div>

              {/* Database table view */}
              <div
                style={{
                  fontFamily: 'Menlo, Monaco, monospace',
                  fontSize: '14px',
                }}
              >
                {/* Table column headers */}
                <div
                  style={{
                    display: 'flex',
                    backgroundColor: '#161b22',
                    borderBottom: '2px solid #30363d',
                    padding: '12px 20px',
                    color: '#8b949e',
                    fontWeight: 'bold',
                  }}
                >
                  <div style={{ width: '120px' }}>id</div>
                  <div style={{ width: '200px' }}>name</div>
                  <div style={{ flex: 1 }}>email</div>
                  <div style={{ width: '140px' }}>created_at</div>
                </div>

                {/* Table rows - showing most recent 8 rows */}
                <div style={{ height: '220px', overflow: 'hidden' }}>
                  {[...Array(visibleRowCount)].map((_, i) => {
                    const rowId = baseRowIndex + i;
                    if (rowId >= rowCount) return null;

                    const names = ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry'];
                    const domains = ['company.com', 'example.org', 'business.net', 'corp.io'];

                    return (
                      <div
                        key={rowId}
                        style={{
                          display: 'flex',
                          padding: '8px 20px',
                          backgroundColor: i % 2 === 0 ? '#0d1117' : '#161b22',
                          color: showStress ? '#fca5a5' : '#c9d1d9',
                          borderBottom: '1px solid #21262d',
                        }}
                      >
                        <div style={{ width: '120px' }}>{rowId + 1}</div>
                        <div style={{ width: '200px' }}>{names[rowId % names.length]}{rowId % 100}</div>
                        <div style={{ flex: 1 }}>user{rowId}@{domains[rowId % domains.length]}</div>
                        <div style={{ width: '140px' }}>2024-01-{String((rowId % 30) + 1).padStart(2, '0')}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Row counter bar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    backgroundColor: '#161b22',
                    borderTop: '2px solid #30363d',
                  }}
                >
                  <div
                    style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: showStress
                        ? `rgb(${255}, ${Math.floor(165 - 165 * stressLevel)}, ${Math.floor(165 - 165 * stressLevel)})`
                        : '#58a6ff',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}
                  >
                    {formatNumber(rowCount)} rows
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#8b949e',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}
                  >
                    Target: 5,000,000
                  </div>
                </div>
              </div>

              {/* Performance graph */}
              <div
                style={{
                  padding: '20px 32px 24px 32px',
                  backgroundColor: '#0d1117',
                  borderTop: '2px solid #30363d',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#8b949e',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}
                  >
                    Insert Performance
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: performance > 50 ? '#58a6ff' : performance > 20 ? '#fbbf24' : '#ef4444',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}
                  >
                    {Math.floor(performance)}%
                  </div>
                </div>

                {/* Graph */}
                <div
                  style={{
                    width: '100%',
                    height: '100px',
                    backgroundColor: '#161b22',
                    borderRadius: '8px',
                    border: '1px solid #30363d',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <svg width="100%" height="100" style={{ position: 'absolute' }}>
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map((y) => (
                      <line
                        key={y}
                        x1="0"
                        y1={y}
                        x2="100%"
                        y2={y}
                        stroke="#30363d"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Performance line */}
                    <polyline
                      points={getPerformancePoints()}
                      fill="none"
                      stroke={performance > 50 ? '#58a6ff' : performance > 20 ? '#fbbf24' : '#ef4444'}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

            </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
