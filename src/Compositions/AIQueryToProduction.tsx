import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const AIQueryToProduction: React.FC = () => {
  const frame = useCurrentFrame();

  // Slow zoom effect throughout
  const zoom = interpolate(frame, [0, 240], [1.0, 1.2], {
    extrapolateRight: 'clamp',
  });

  // AI chat window slides in from left
  const aiChatX = interpolate(frame, [0, 30], [-1000, 200], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Mouse cursor movement to start of query
  const cursorMoveToStart = interpolate(frame, [50, 65], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Text selection - highlight grows as mouse drags
  const selectionProgress = interpolate(frame, [65, 95], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Show copy action (Cmd+C or Ctrl+C)
  const showCopyIndicator = frame >= 100 && frame < 115;

  // Cursor moves to production terminal
  const cursorMoveToProd = interpolate(frame, [115, 135], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Cursor positions
  const cursorX = frame < 115
    ? 330 + (cursorMoveToStart * 0) // Start position at code block
    : interpolate(cursorMoveToProd, [0, 1], [330, 1070]);

  const cursorY = frame < 115
    ? 440
    : interpolate(cursorMoveToProd, [0, 1], [440, 520]);

  const cursorVisible = frame >= 50 && frame < 145;

  // Production terminal slides in from right
  const prodTerminalX = interpolate(frame, [40, 70], [2000, 970], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Show paste indicator (Cmd+V or Ctrl+V)
  const showPasteIndicator = frame >= 140 && frame < 155;

  // Paste animation - text appears in production
  const showPaste = frame >= 145;
  const pasteProgress = interpolate(frame, [145, 165], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Execute animation
  const showExecuting = frame >= 175;

  // Chaos starts - errors, alerts
  const showChaos = frame >= 195;
  const chaosIntensity = interpolate(frame, [195, 225], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // The bad SQL query from AI
  const badQuery = `SELECT
  users.*,
  orders.*,
  products.*,
  categories.*,
  reviews.*,
  shipping_addresses.*
FROM users
LEFT JOIN orders ON 1=1
LEFT JOIN products ON 1=1
LEFT JOIN categories ON 1=1
LEFT JOIN reviews ON 1=1
LEFT JOIN shipping_addresses ON 1=1
WHERE users.email LIKE '%@%'
  AND orders.total > 0
  OR products.price < 999999
  OR 1=1;`;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0d1117',
      }}
    >
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        {/* AI Chat Window (Left) */}
        <div
          style={{
            position: 'absolute',
            left: `${aiChatX}px`,
            top: '200px',
            width: '750px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
            border: '1px solid #e1e4e8',
          }}
        >
          {/* Chat header */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#f6f8fa',
              borderBottom: '1px solid #e1e4e8',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              🤖
            </div>
            <div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#24292e',
                }}
              >
                AI Assistant
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#586069',
                }}
              >
                Online
              </div>
            </div>
          </div>

          {/* Chat content */}
          <div
            style={{
              padding: '20px',
              maxHeight: '600px',
              overflowY: 'auto',
            }}
          >
            {/* User message */}
            <div
              style={{
                marginBottom: '16px',
                textAlign: 'right',
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: '#0969da',
                  color: '#ffffff',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  maxWidth: '80%',
                }}
              >
                Write me a SQL query to get all user data
              </div>
            </div>

            {/* AI response */}
            <div
              style={{
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: '#f6f8fa',
                  color: '#24292e',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  maxWidth: '90%',
                  border: '1px solid #e1e4e8',
                }}
              >
                <div style={{ marginBottom: '12px' }}>
                  Sure! Here's a SQL query that will get all the data you need:
                </div>
                <div
                  style={{
                    backgroundColor: '#24292e',
                    color: '#e6edf3',
                    padding: '16px',
                    borderRadius: '8px',
                    fontFamily: 'Menlo, Monaco, monospace',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre',
                    position: 'relative',
                    border: '1px solid #30363d',
                  }}
                >
                  {/* Text selection highlight */}
                  {selectionProgress > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        right: '16px',
                        height: `${320 * selectionProgress}px`,
                        backgroundColor: 'rgba(88, 166, 255, 0.3)',
                        pointerEvents: 'none',
                        borderRadius: '4px',
                      }}
                    />
                  )}
                  <div style={{ position: 'relative' }}>
                    {badQuery}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Production Terminal (Right) */}
        <div
          style={{
            position: 'absolute',
            left: `${prodTerminalX}px`,
            top: '200px',
            width: '850px',
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            border: showChaos ? '3px solid #ef4444' : '1px solid #404040',
          }}
        >
          {/* Terminal header with production warning */}
          <div
            style={{
              padding: '12px 20px',
              backgroundColor: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #991b1b',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <span
                style={{
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                PRODUCTION DATABASE
              </span>
            </div>
            <div
              style={{
                backgroundColor: '#991b1b',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            >
              5.2M ROWS
            </div>
          </div>

          {/* Terminal content */}
          <div
            style={{
              padding: '20px',
              fontFamily: 'Menlo, Monaco, monospace',
              fontSize: '14px',
              color: '#e6edf3',
              lineHeight: '1.6',
              minHeight: '500px',
            }}
          >
            <div style={{ marginBottom: '16px', color: '#6e7681' }}>
              postgres@production:5432/users_db
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#58a6ff' }}>postgres=#</span>
              {showPaste && (
                <div style={{ flex: 1, position: 'relative' }}>
                  <pre
                    style={{
                      margin: 0,
                      color: '#ffffff',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      opacity: pasteProgress,
                    }}
                  >
                    {badQuery}
                  </pre>
                </div>
              )}
            </div>

            {/* Executing message */}
            {showExecuting && (
              <div
                style={{
                  marginTop: '20px',
                  color: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>⚡</span>
                <span>Executing query...</span>
              </div>
            )}

            {/* Chaos - errors and warnings */}
            {showChaos && (
              <div style={{ marginTop: '20px' }}>
                <div
                  style={{
                    color: '#ef4444',
                    marginBottom: '12px',
                    opacity: chaosIntensity,
                  }}
                >
                  ❌ ERROR: Query timeout after 30 seconds
                </div>
                <div
                  style={{
                    color: '#ef4444',
                    marginBottom: '12px',
                    opacity: chaosIntensity,
                  }}
                >
                  ❌ ERROR: Cartesian product detected (273,840,000 rows)
                </div>
                <div
                  style={{
                    color: '#ef4444',
                    marginBottom: '12px',
                    opacity: chaosIntensity,
                  }}
                >
                  ❌ ERROR: Memory limit exceeded
                </div>
                <div
                  style={{
                    color: '#fbbf24',
                    marginBottom: '12px',
                    opacity: chaosIntensity,
                  }}
                >
                  ⚠️  WARNING: 847 active connections blocked
                </div>
                <div
                  style={{
                    color: '#fbbf24',
                    opacity: chaosIntensity,
                  }}
                >
                  ⚠️  WARNING: Production database locked
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Animated cursor */}
        {cursorVisible && (
          <div
            style={{
              position: 'absolute',
              left: `${cursorX}px`,
              top: `${cursorY}px`,
              width: '24px',
              height: '24px',
              pointerEvents: 'none',
              zIndex: 100,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="black" strokeWidth="1">
              <path d="M3 3 L3 17 L8 12 L11 18 L13 17 L10 11 L16 11 Z" />
            </svg>
          </div>
        )}

        {/* Copy indicator (Cmd+C) */}
        {showCopyIndicator && (
          <div
            style={{
              position: 'absolute',
              left: '550px',
              top: '600px',
              backgroundColor: '#24292e',
              border: '2px solid #58a6ff',
              borderRadius: '12px',
              padding: '16px 24px',
              color: '#ffffff',
              fontSize: '20px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: '600',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              zIndex: 150,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '24px' }}>⌘</span>
            <span>C</span>
          </div>
        )}

        {/* Paste indicator (Cmd+V) */}
        {showPasteIndicator && (
          <div
            style={{
              position: 'absolute',
              left: '1220px',
              top: '600px',
              backgroundColor: '#24292e',
              border: '2px solid #58a6ff',
              borderRadius: '12px',
              padding: '16px 24px',
              color: '#ffffff',
              fontSize: '20px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: '600',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              zIndex: 150,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '24px' }}>⌘</span>
            <span>V</span>
          </div>
        )}

        {/* Chaos overlay effects */}
        {showChaos && (
          <>
            {/* Screen shake effect with flashing red overlay */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#ef4444',
                opacity: Math.sin(frame * 0.5) * 0.15 * chaosIntensity,
                pointerEvents: 'none',
              }}
            />

            {/* Alert popup */}
            {frame >= 215 && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) scale(${interpolate(frame, [215, 225], [0.8, 1], { extrapolateRight: 'clamp' })})`,
                  backgroundColor: '#7f1d1d',
                  border: '3px solid #ef4444',
                  borderRadius: '16px',
                  padding: '32px 48px',
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8)',
                  zIndex: 200,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚨</div>
                <div
                  style={{
                    color: '#ffffff',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  Production Down
                </div>
                <div
                  style={{
                    color: '#fca5a5',
                    fontSize: '18px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  Database unresponsive
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};
