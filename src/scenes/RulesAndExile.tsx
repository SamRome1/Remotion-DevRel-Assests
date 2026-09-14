import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CheckGlyph, CrossGlyph, CylinderGlyph, ReplicaTopology, SceneWrapper, TOPO_H, TOPO_W } from '../Components/system';
import { brand, colors, enter, fonts, itp, lerp, radius, slowSpring } from '../theme';

export const RULES_EXILE_DURATION = 465;

// Phase 1 — rules track the VO, not a fixed stagger.
const RULES: { text: string; ok: boolean; at: number }[] = [
  { text: 'ALTER TABLE ... ADD COLUMN', ok: true, at: 0 },
  { text: 'table rewrites', ok: false, at: 70 },
  { text: 'CREATE INDEX CONCURRENTLY', ok: true, at: 140 },
];
const PHASE2 = 210;

// Phase 2 geometry
const CIRCLE = { cx: 430, cy: 560, r: 235 };
const TOPO_SCALE = 0.5;
const CIRCLE_AT = PHASE2 + 15;
const CIRCLE_LEN = 40;
const APPROACH_AT = PHASE2 + 60; // 270
const APPROACH_LEN = 60;
const PRESS_AT = APPROACH_AT + APPROACH_LEN; // 330
const PRESS_LEN = 30;
const DEFLECT_AT = PRESS_AT + PRESS_LEN; // 360
const DEFLECT_LEN = 55;
const EXILE_DB_AT = 380;
const EXILE = { x: 905, y: 500 };
const BOX = { w: 110, h: 56 };
const BOX_HOME = [
  { x: EXILE.x, y: EXILE.y + 120 },
  { x: EXILE.x, y: EXILE.y + 196 },
];

export const RulesAndExile: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rulesOut = itp(frame, PHASE2, PHASE2 + 10, 1, 0);
  const topoIn = itp(frame, PHASE2 + 8, PHASE2 + 20);
  const circle = slowSpring(frame, fps, CIRCLE_AT, CIRCLE_LEN);

  // boundary flash while the boxes press
  const pressT = itp(frame, PRESS_AT, PRESS_AT + PRESS_LEN);
  const flash = frame >= PRESS_AT && frame < DEFLECT_AT ? Math.abs(Math.sin(pressT * Math.PI * 2)) * 0.45 : 0;

  const pressX = frame >= PRESS_AT && frame < DEFLECT_AT ? Math.sin(pressT * Math.PI * 2) * 6 : 0;
  const TRAIL = 9; // second box trails the first so they never overlap mid-arc
  const exileDb = slowSpring(frame, fps, EXILE_DB_AT, 30);

  const boxPos = (i: number) => {
    const approach = slowSpring(frame, fps, APPROACH_AT + i * TRAIL, APPROACH_LEN);
    const deflect = slowSpring(frame, fps, DEFLECT_AT + i * TRAIL, DEFLECT_LEN);
    const startX = -160;
    const restX = CIRCLE.cx - CIRCLE.r - BOX.w / 2 - 6; // touching the boundary
    const y0 = CIRCLE.cy - 40 + i * 76;
    if (frame < DEFLECT_AT + i * TRAIL) {
      return { x: lerp(startX, restX, approach) + pressX, y: y0, o: 1 };
    }
    // deflection: swing under the circle and settle beside the exile db
    const t = deflect;
    const home = BOX_HOME[i];
    const recoil = Math.sin(Math.min(1, t * 3) * Math.PI) * -28;
    // arc peak sits clear below the circle's bottom edge
    const arcAmp = CIRCLE.cy + CIRCLE.r + 70 - (y0 + home.y) / 2;
    return {
      x: lerp(restX, home.x, t) + recoil,
      y: lerp(y0, home.y, t) + Math.sin(t * Math.PI) * arcAmp,
      o: 1,
    };
  };

  return (
    <SceneWrapper>
      {/* PHASE 1 — rules */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: rulesOut }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40, width: 700 }}>
          {RULES.map((r) => {
            const e = enter(frame, fps, r.at);
            const g = enter(frame, fps, r.at + 10).progress;
            return (
              <div
                key={r.text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: fonts.mono,
                  fontSize: 28,
                  color: colors.text,
                  opacity: e.opacity,
                  transform: `translateY(${e.translateY}px) scale(${e.scale})`,
                  transformOrigin: '0% 50%',
                }}
              >
                <span>{r.text}</span>
                {r.ok ? <CheckGlyph progress={g} size={32} /> : <CrossGlyph progress={g} size={32} color={brand.denied} />}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* PHASE 2 — exile */}
      {frame >= PHASE2 ? (
        <AbsoluteFill>
          {/* protected topology */}
          <div
            style={{
              position: 'absolute',
              left: CIRCLE.cx - (TOPO_W * TOPO_SCALE) / 2,
              top: CIRCLE.cy - (TOPO_H * TOPO_SCALE) / 2 + 10,
              width: TOPO_W,
              height: TOPO_H,
              transform: `scale(${TOPO_SCALE})`,
              transformOrigin: '0 0',
              opacity: topoIn,
            }}
          >
            <ReplicaTopology showElephant animate={false} />
          </div>

          {/* dashed boundary — revealed clockwise via a conic mask */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              WebkitMaskImage: `conic-gradient(from -90deg at ${CIRCLE.cx}px ${CIRCLE.cy}px, #000 0deg, #000 ${circle * 360}deg, transparent ${circle * 360}deg)`,
            }}
          >
            <svg width={1080} height={1080} style={{ position: 'absolute', inset: 0 }}>
              <circle
                cx={CIRCLE.cx}
                cy={CIRCLE.cy}
                r={CIRCLE.r}
                fill="none"
                stroke={`rgba(255,255,255,${0.35 + flash})`}
                strokeWidth={1}
                strokeDasharray="6 8"
              />
            </svg>
          </div>

          {/* workload boxes */}
          {[0, 1].map((i) => {
            const p = boxPos(i);
            const vis = itp(frame, APPROACH_AT, APPROACH_AT + 8);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: p.x - BOX.w / 2,
                  top: p.y - BOX.h / 2,
                  width: BOX.w,
                  height: BOX.h,
                  border: `1px solid ${colors.zinc400}`,
                  borderRadius: radius.sm,
                  backgroundColor: colors.bg,
                  opacity: vis * p.o,
                }}
              />
            );
          })}

          {/* exile database */}
          <div style={{ position: 'absolute', left: EXILE.x - 32, top: EXILE.y - 40 }}>
            <CylinderGlyph progress={exileDb} size={64} />
          </div>
        </AbsoluteFill>
      ) : null}
    </SceneWrapper>
  );
};
