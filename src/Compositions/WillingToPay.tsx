import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';

export const WillingToPay: React.FC = () => {
  const frame = useCurrentFrame();

  // User avatar component
  const UserAvatar: React.FC<{
    x: number;
    y: number;
    delay: number;
    color: string;
  }> = ({ x, y, delay, color }) => {
    const scale = spring({
      frame: frame - delay,
      fps: 30,
      config: {
        damping: 12,
      },
    });

    const opacity = interpolate(frame, [delay - 5, delay + 10], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    return (
      <div
        style={{
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          transform: `scale(${scale})`,
          opacity,
        }}
      >
        {/* Avatar circle */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: color,
            border: '3px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Simple face icon */}
          <div style={{ fontSize: '40px' }}>👤</div>
        </div>
      </div>
    );
  };

  // Money icon component
  const MoneyIcon: React.FC<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    delay: number;
  }> = ({ startX, startY, endX, endY, delay }) => {
    const progress = spring({
      frame: frame - delay,
      fps: 30,
      config: {
        damping: 20,
        mass: 0.5,
      },
    });

    const x = interpolate(progress, [0, 1], [startX, endX]);
    const y = interpolate(progress, [0, 1], [startY, endY]);

    const opacity = interpolate(frame, [delay, delay + 10, delay + 40], [0, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    return (
      <div
        style={{
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          fontSize: '36px',
          opacity,
          filter: 'drop-shadow(0 4px 8px rgba(34, 197, 94, 0.4))',
        }}
      >
        💵
      </div>
    );
  };

  // Central app icon
  const appScale = spring({
    frame: frame - 20,
    fps: 30,
    config: {
      damping: 10,
    },
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
          background: 'radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: '100px',
          fontSize: '56px',
          fontWeight: '700',
          color: '#ffffff',
          textAlign: 'center',
          opacity: interpolate(frame, [0, 20], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        Users Ready to Pay
      </div>

      {/* Central app container */}
      <div
        style={{
          position: 'relative',
          width: '1920px',
          height: '1080px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* User avatars positioned around the center */}
        <UserAvatar x={300} y={200} delay={10} color="#8b5cf6" />
        <UserAvatar x={200} y={450} delay={15} color="#ec4899" />
        <UserAvatar x={350} y={700} delay={20} color="#f59e0b" />
        <UserAvatar x={700} y={150} delay={12} color="#3b82f6" />
        <UserAvatar x={750} y={800} delay={18} color="#10b981" />
        <UserAvatar x={1600} y={220} delay={14} color="#ef4444" />
        <UserAvatar x={1550} y={480} delay={22} color="#06b6d4" />
        <UserAvatar x={1500} y={750} delay={16} color="#8b5cf6" />

        {/* Money flowing from users to center - left side */}
        <MoneyIcon startX={370} startY={240} endX={920} endY={510} delay={40} />
        <MoneyIcon startX={270} startY={490} endX={920} endY={510} delay={50} />
        <MoneyIcon startX={420} startY={740} endX={920} endY={510} delay={45} />
        <MoneyIcon startX={770} startY={190} endX={920} endY={510} delay={42} />
        <MoneyIcon startX={820} startY={840} endX={920} endY={510} delay={55} />

        {/* Money flowing from users to center - right side */}
        <MoneyIcon startX={1670} startY={260} endX={1000} endY={510} delay={44} />
        <MoneyIcon startX={1620} startY={520} endX={1000} endY={510} delay={48} />
        <MoneyIcon startX={1570} startY={790} endX={1000} endY={510} delay={52} />

        {/* Additional money waves */}
        <MoneyIcon startX={370} startY={240} endX={920} endY={510} delay={70} />
        <MoneyIcon startX={1670} startY={260} endX={1000} endY={510} delay={72} />
        <MoneyIcon startX={270} startY={490} endX={920} endY={510} delay={75} />
        <MoneyIcon startX={1620} startY={520} endX={1000} endY={510} delay={77} />

        {/* Central app icon */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) scale(${appScale})`,
            width: '200px',
            height: '200px',
            backgroundColor: '#22c55e',
            borderRadius: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 60px rgba(34, 197, 94, 0.4)',
            border: '4px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* App icon - shopping cart */}
          <div style={{ fontSize: '80px' }}>🛒</div>
        </div>

        {/* Pulsing rings around app */}
        {[0, 1, 2].map((i) => {
          const ringScale = interpolate(
            frame,
            [30 + i * 20, 60 + i * 20],
            [1, 2],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }
          );

          const ringOpacity = interpolate(
            frame,
            [30 + i * 20, 60 + i * 20],
            [0.5, 0],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }
          );

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) scale(${ringScale})`,
                width: '200px',
                height: '200px',
                borderRadius: '50px',
                border: '3px solid #22c55e',
                opacity: ringOpacity,
                pointerEvents: 'none',
              }}
            />
          );
        })}
      </div>

      {/* Stats container */}
      <div
        style={{
          position: 'absolute',
          bottom: '120px',
          display: 'flex',
          gap: '100px',
          opacity: interpolate(frame, [60, 80], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        {/* Stat 1 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: '800',
              color: '#22c55e',
            }}
          >
            87%
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#a0aec0',
            }}
          >
            Would Buy
          </div>
        </div>

        {/* Stat 2 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: '800',
              color: '#22c55e',
            }}
          >
            $49
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#a0aec0',
            }}
          >
            Avg. Willing to Pay
          </div>
        </div>

        {/* Stat 3 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: '800',
              color: '#22c55e',
            }}
          >
            2.5K
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#a0aec0',
            }}
          >
            Interested Users
          </div>
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
          background: 'linear-gradient(90deg, transparent 0%, #22c55e 50%, transparent 100%)',
          opacity: 0.5,
        }}
      />
    </AbsoluteFill>
  );
};
