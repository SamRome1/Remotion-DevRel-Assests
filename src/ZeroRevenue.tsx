import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';

export const ZeroRevenue: React.FC = () => {
  const frame = useCurrentFrame();

  // Animation for the dollar amount appearing
  const amountScale = spring({
    frame: frame - 10,
    fps: 30,
    config: {
      damping: 15,
    },
  });

  // Animation for the graph line drawing
  const lineProgress = interpolate(frame, [30, 90], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
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
      {/* Background gradient */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 30%, rgba(239, 68, 68, 0.08) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main content container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '80px',
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: '48px',
            fontWeight: '600',
            color: '#a0aec0',
            textAlign: 'center',
            opacity: interpolate(frame, [0, 20], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          Total Revenue
        </div>

        {/* Large dollar amount */}
        <div
          style={{
            fontSize: '180px',
            fontWeight: '800',
            color: '#ef4444',
            textShadow: '0 4px 30px rgba(239, 68, 68, 0.3)',
            transform: `scale(${amountScale})`,
            letterSpacing: '-0.02em',
          }}
        >
          $0.00
        </div>

        {/* Graph container */}
        <div
          style={{
            width: '800px',
            height: '300px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '40px',
            position: 'relative',
            opacity: interpolate(frame, [20, 40], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          {/* Y-axis labels */}
          <div
            style={{
              position: 'absolute',
              left: '10px',
              top: '40px',
              fontSize: '16px',
              color: '#718096',
            }}
          >
            $100
          </div>
          <div
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '16px',
              color: '#718096',
            }}
          >
            $50
          </div>
          <div
            style={{
              position: 'absolute',
              left: '10px',
              bottom: '40px',
              fontSize: '16px',
              color: '#ef4444',
              fontWeight: '600',
            }}
          >
            $0
          </div>

          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: '60px',
                right: '40px',
                top: `${40 + i * 55}px`,
                height: '1px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }}
            />
          ))}

          {/* Zero line (flat) */}
          <svg
            style={{
              position: 'absolute',
              left: '60px',
              right: '40px',
              bottom: '40px',
              width: '700px',
              height: '220px',
            }}
          >
            {/* The flat line at zero */}
            <line
              x1="0"
              y1="220"
              x2={700 * lineProgress}
              y2="220"
              stroke="#ef4444"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Data points */}
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((progress, i) => {
              const pointOpacity = interpolate(
                frame,
                [30 + i * 10, 40 + i * 10],
                [0, 1],
                {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }
              );

              if (progress > lineProgress) return null;

              return (
                <circle
                  key={i}
                  cx={700 * progress}
                  cy="220"
                  r="6"
                  fill="#ef4444"
                  opacity={pointOpacity}
                />
              );
            })}
          </svg>

          {/* X-axis labels */}
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '60px',
              right: '40px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              color: '#718096',
            }}
          >
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '32px',
            fontWeight: '500',
            color: '#718096',
            textAlign: 'center',
            opacity: interpolate(frame, [60, 80], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >

        </div>
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '6px',
          background: 'linear-gradient(90deg, transparent 0%, #ef4444 50%, transparent 100%)',
          opacity: 0.5,
        }}
      />
    </AbsoluteFill>
  );
};
