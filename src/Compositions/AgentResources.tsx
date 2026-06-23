import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Bot, Database } from 'lucide-react';
import { circularFamily } from '../fonts';
import {
  BG, GREEN, FG_MUTED, SURFACE_100, MONO,
  itp, spSlow,
  DotGrid, TrafficLights,
} from '../tokens';

// ── Timing constants ─────────────────────────────────────────────────────────
const TITLE_IN_START  = 0;
const TITLE_IN_END    = 20;
const COL_STAGGER     = 18;
const AGENT_IN        = 25;
const LINE1_START     = 45;
const LINE1_END       = 75;
const CARD_IN         = 80;
const LINE2_START     = 100;
const LINE2_END       = 125;
const DB_IN           = 128;

// Column centers
const COL_CENTERS = [200, 540, 880];

const GREEN_GLOW = 'rgba(62,207,142,0.35)';

const AGENT_ICON_FILTER =
  'drop-shadow(0 0 18px rgba(62,207,142,0.4)) drop-shadow(0 0 5px rgba(62,207,142,0.4))';

const CODE_LINES: Array<{ text: string; color: string }> = [
  { text: 'const agent = new Agent()', color: FG_MUTED },
  { text: 'await agent.run(task)',      color: GREEN   },
  { text: 'return agent.result',        color: FG_MUTED },
];

// ── Connector line (vertical SVG, draws top→bottom) ──────────────────────────
interface ConnectorLineProps {
  topY:    number;
  bottomY: number;
  centerX: number;
  progress: number; // 0→1
}

const ConnectorLine: React.FC<ConnectorLineProps> = ({ topY, bottomY, centerX, progress }) => {
  const totalH    = bottomY - topY;
  const drawnH    = totalH * progress;
  // Arrowhead fades in when progress crosses 0.85
  const arrowOp   = itp(progress, 0.85, 1, 0, 1);
  const arrowY    = topY + drawnH;
  const arrowSize = 7;

  return (
    <svg
      style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}
      width={1080}
      height={1080}
    >
      {/* Glow layer */}
      <line
        x1={centerX} y1={topY}
        x2={centerX} y2={topY + drawnH}
        stroke={GREEN_GLOW}
        strokeWidth={10}
        strokeLinecap="round"
      />
      {/* Main line */}
      <line
        x1={centerX} y1={topY}
        x2={centerX} y2={topY + drawnH}
        stroke={GREEN}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Arrowhead */}
      <polygon
        points={`${centerX},${arrowY + arrowSize} ${centerX - arrowSize * 0.6},${arrowY - arrowSize * 0.5} ${centerX + arrowSize * 0.6},${arrowY - arrowSize * 0.5}`}
        fill={GREEN}
        opacity={arrowOp}
      />
    </svg>
  );
};

// ── Single column ─────────────────────────────────────────────────────────────
interface ColumnProps {
  centerX:  number;
  colFrame: number; // frame - columnOffset
}

const Column: React.FC<ColumnProps> = ({ centerX, colFrame }) => {
  // Agent entrance
  const agentScale   = spSlow(colFrame, AGENT_IN);
  const agentOpacity = itp(colFrame, AGENT_IN, AGENT_IN + 8);

  // Connector 1: agent → code
  const line1Progress = itp(colFrame, LINE1_START, LINE1_END);

  // Card entrance
  const cardScale    = spSlow(colFrame, CARD_IN);
  const cardTranslY  = (1 - cardScale) * 30;
  const cardOpacity  = itp(colFrame, CARD_IN, CARD_IN + 12);

  // Connector 2: code → database
  const line2Progress = itp(colFrame, LINE2_START, LINE2_END);

  // Database entrance
  const dbScale      = spSlow(colFrame, DB_IN);
  const dbOpacity    = itp(colFrame, DB_IN, DB_IN + 8);

  // Column background glow
  const colGlowOp    = itp(colFrame, AGENT_IN, AGENT_IN + 30, 0, 1);

  // Card dimensions
  const cardW = 280;
  const cardH = 200;

  // Key Y positions (absolute canvas coords)
  const agentY     = 160;  // center of agent icon
  const agentIconR = 60;   // half of 120px icon
  const cardCenterY = 430;
  const cardTop    = cardCenterY - cardH / 2;
  const cardLeft   = centerX - cardW / 2;
  const dbY        = 720;  // center of database icon
  const dbIconR    = 60;   // half of 120px icon

  // Connector endpoints (gap of 8px from edges)
  const line1TopY    = agentY + agentIconR + 8;
  const line1BottomY = cardTop - 8;
  const line2TopY    = cardTop + cardH + 8;
  const line2BottomY = dbY - dbIconR - 8;

  return (
    <>
      {/* Column background radial glow */}
      <div
        style={{
          position:   'absolute',
          left:       centerX - 150,
          top:        80,
          width:      300,
          height:     700,
          background: `rgba(62,207,142,0.04)`,
          filter:     'blur(80px)',
          opacity:    colGlowOp,
          pointerEvents: 'none',
        }}
      />

      {/* Agent icon */}
      <div
        style={{
          position:  'absolute',
          left:      centerX - 60,
          top:       agentY - 60,
          width:     120,
          height:    120,
          display:   'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity:   agentOpacity,
          transform: `scale(${agentScale})`,
        }}
      >
        <Bot
          size={120}
          color={GREEN}
          strokeWidth={1.5}
          style={{ filter: AGENT_ICON_FILTER }}
        />
      </div>



      {/* Connector line 1: agent → code */}
      <ConnectorLine
        topY={line1TopY}
        bottomY={line1BottomY}
        centerX={centerX}
        progress={line1Progress}
      />

      {/* Code panel card */}
      <div
        style={{
          position:        'absolute',
          left:            cardLeft,
          top:             cardTop,
          width:           cardW,
          height:          cardH,
          background:      SURFACE_100,
          border:          '1px solid rgba(62,207,142,0.25)',
          borderRadius:    10,
          padding:         '20px 24px',
          boxSizing:       'border-box',
          opacity:         cardOpacity,
          transform:       `translateY(${cardTranslY}px) scale(${cardScale})`,
        }}
      >
        <TrafficLights />
        {CODE_LINES.map((line, li) => {
          const lineOp = itp(colFrame, CARD_IN + 8 + li * 4, CARD_IN + 16 + li * 4);
          return (
            <div
              key={li}
              style={{
                fontFamily:  MONO,
                fontSize:    15,
                color:       line.color,
                opacity:     lineOp,
                marginBottom: li < CODE_LINES.length - 1 ? 10 : 0,
                whiteSpace:  'nowrap',
              }}
            >
              {line.text}
            </div>
          );
        })}
      </div>

      {/* Connector line 2: code → database */}
      <ConnectorLine
        topY={line2TopY}
        bottomY={line2BottomY}
        centerX={centerX}
        progress={line2Progress}
      />

      {/* Database icon */}
      <div
        style={{
          position:  'absolute',
          left:      centerX - 60,
          top:       dbY - 60,
          width:     120,
          height:    120,
          display:   'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity:   dbOpacity,
          transform: `scale(${dbScale})`,
        }}
      >
        <Database
          size={120}
          color={GREEN}
          strokeWidth={1.5}
          style={{ filter: AGENT_ICON_FILTER }}
        />
      </div>

      {/* Database label */}
      <div
        style={{
          position:    'absolute',
          left:        centerX - 60,
          top:         dbY + 66,
          width:       120,
          textAlign:   'center',
          fontFamily:  circularFamily,
          fontSize:    11,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color:       FG_MUTED,
          opacity:     dbOpacity,
        }}
      >
        Postgres DB
      </div>
    </>
  );
};

// ── Main composition ──────────────────────────────────────────────────────────
export const AgentResources: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity   = itp(frame, TITLE_IN_START, TITLE_IN_END);
  const titleTranslY   = itp(frame, TITLE_IN_START, TITLE_IN_END, -10, 0);

  const columns = [COL_CENTERS[0], COL_CENTERS[1], COL_CENTERS[2]];

  return (
    <AbsoluteFill style={{ background: BG, overflow: 'hidden', fontFamily: circularFamily }}>
      <DotGrid />

      {/* Faint horizontal rule */}
      <div
        style={{
          position:        'absolute',
          left:            80,
          right:           80,
          top:             100,
          height:          1,
          background:      'rgba(255,255,255,0.06)',
        }}
      />

      {/* Title */}
      <div
        style={{
          position:      'absolute',
          left:          0,
          right:         0,
          top:           52,
          textAlign:     'center',
          fontFamily:    circularFamily,
          fontSize:      32,
          color:         FG_MUTED,
          letterSpacing: 0.5,
          opacity:       titleOpacity,
          transform:     `translateY(${titleTranslY}px)`,
        }}
      >
        Each agent gets its own resources
      </div>

      {/* Three columns */}
      {columns.map((centerX, i) => (
        <Column
          key={centerX}
          centerX={centerX}
          colFrame={frame - i * COL_STAGGER}
        />
      ))}
    </AbsoluteFill>
  );
};
