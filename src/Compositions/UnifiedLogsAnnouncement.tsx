import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import {
  Zap,
  Database,
  ShieldCheck,
  HardDrive,
  Server,
  Radio,
  Network,
  Search,
} from 'lucide-react';
import {
  BG,
  GREEN,
  RED,
  WARNING,
  FG,
  FG_LIGHT,
  FG_MUTED,
  BORDER,
  MONO,
  itp,
  sp,
  spSlow,
  DotGrid,
} from '../tokens';
import { circularFamily } from '../fonts';
import type { IconProps } from '../Components/Icons';

// ─────────────────────────────────────────────────────────────────────────────
// Unified Logs — open beta announcement
// 600 frames / 30fps / 1920x1080
//
// Scene 1 (0–150)   Hook — hero text reveal
// Scene 2 (130–330) Live log stream — dense scrolling "live tail"
// Scene 3 (315–490) Filter & search UX in action
// Scene 4 (480–600) Close — wordmark + open beta badge
//
// Scenes are rendered in chronological DOM order so each incoming scene
// paints on top of the outgoing one, giving a natural crossfade in the
// overlap windows.
// ─────────────────────────────────────────────────────────────────────────────

type ServiceKey =
  | 'gateway'
  | 'postgres'
  | 'auth'
  | 'storage'
  | 'postgrest'
  | 'realtime'
  | 'pooler';

const SERVICE_META: Record<ServiceKey, { label: string; Icon: React.FC<IconProps> }> = {
  gateway:   { label: 'API Gateway', Icon: Zap },
  postgres:  { label: 'Postgres',    Icon: Database },
  auth:      { label: 'Auth',        Icon: ShieldCheck },
  storage:   { label: 'Storage',     Icon: HardDrive },
  postgrest: { label: 'PostgREST',   Icon: Server },
  realtime:  { label: 'Realtime',    Icon: Radio },
  pooler:    { label: 'Pooler',      Icon: Network },
};

interface LogEntry {
  service: ServiceKey;
  method:  string;
  path:    string;
  status:  number;
}

const LOG_TEMPLATES: LogEntry[] = [
  { service: 'gateway',   method: 'GET',    path: '/rest/v1/users',              status: 200 },
  { service: 'postgres',  method: 'INSERT', path: '/rest/v1/messages',           status: 201 },
  { service: 'auth',      method: 'POST',   path: '/auth/v1/token',              status: 200 },
  { service: 'storage',   method: 'PUT',    path: '/storage/v1/object/avatars',  status: 200 },
  { service: 'postgrest', method: 'GET',    path: '/rest/v1/profiles',           status: 200 },
  { service: 'realtime',  method: 'WS',     path: '/realtime/v1/websocket',      status: 101 },
  { service: 'pooler',    method: 'GET',    path: '/rest/v1/orders',             status: 200 },
  { service: 'auth',      method: 'POST',   path: '/auth/v1/token',              status: 401 },
  { service: 'postgres',  method: 'SELECT', path: '/rest/v1/rpc/search',         status: 500 },
  { service: 'gateway',   method: 'DELETE', path: '/rest/v1/sessions',           status: 204 },
  { service: 'storage',   method: 'GET',    path: '/storage/v1/object/public/logo.png', status: 200 },
  { service: 'postgrest', method: 'PATCH',  path: '/rest/v1/settings',           status: 200 },
  { service: 'realtime',  method: 'POST',   path: '/realtime/v1/channels',       status: 200 },
  { service: 'pooler',    method: 'GET',    path: '/rest/v1/analytics',          status: 200 },
];

const statusColor = (status: number): string =>
  status >= 500 ? RED : status >= 400 ? WARNING : GREEN;

// Deterministic timestamp — fixed base instant + row index offset, no real-time dependency.
const formatTimestamp = (i: number): string =>
  new Date(1_700_000_000_000 + i * 420).toISOString().slice(11, 23);

// ─────────────────────────────────────────────────────────────────────────────
// Shared row visual
// ─────────────────────────────────────────────────────────────────────────────

const LogRow: React.FC<{
  entry: LogEntry;
  index: number;
  style?: React.CSSProperties;
  opacity: number;
  scale?: number;
  highlight?: boolean;
}> = ({ entry, index, style, opacity, scale = 1, highlight = false }) => {
  const meta = SERVICE_META[entry.service];
  const Icon = meta.Icon;
  const isError = entry.status >= 400;
  const rowBg = highlight
    ? 'rgba(62, 207, 142, 0.10)'
    : isError
    ? entry.status >= 500
      ? 'rgba(240, 64, 64, 0.07)'
      : 'rgba(245, 166, 35, 0.07)'
    : '#1a1a1a';
  const rowBorder = highlight
    ? 'rgba(62, 207, 142, 0.4)'
    : isError
    ? entry.status >= 500
      ? 'rgba(240, 64, 64, 0.28)'
      : 'rgba(245, 166, 35, 0.28)'
    : BORDER;

  return (
    <div
      style={{
        position:      'absolute',
        left:          0,
        right:         0,
        display:       'flex',
        alignItems:    'center',
        gap:           20,
        padding:       '0 28px',
        background:    rowBg,
        border:        `1px solid ${rowBorder}`,
        borderRadius:  10,
        boxShadow:     highlight ? '0 0 26px rgba(62,207,142,0.22)' : 'none',
        opacity,
        transform:     `scale(${scale})`,
        ...style,
      }}
    >
      <span style={{ fontFamily: MONO, fontSize: 15, color: FG_MUTED, width: 132, flexShrink: 0 }}>
        {formatTimestamp(index)}
      </span>

      <div
        style={{
          display:       'flex',
          alignItems:    'center',
          gap:           8,
          width:         208,
          flexShrink:    0,
          padding:       '5px 12px',
          borderRadius:  999,
          background:    'rgba(255,255,255,0.04)',
          border:        `1px solid ${BORDER}`,
        }}
      >
        <Icon size={16} strokeWidth={1.5} color={FG_LIGHT} />
        <span style={{ fontFamily: circularFamily, fontSize: 14, fontWeight: 600, color: FG_LIGHT }}>
          {meta.label}
        </span>
      </div>

      <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 600, color: FG, width: 90, flexShrink: 0 }}>
        {entry.method}
      </span>

      <span
        style={{
          fontFamily:   MONO,
          fontSize:     15,
          color:        FG_LIGHT,
          flex:         1,
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          whiteSpace:   'nowrap',
        }}
      >
        {entry.path}
      </span>

      <span
        style={{
          fontFamily:  MONO,
          fontSize:    14,
          fontWeight:  700,
          color:       statusColor(entry.status),
          width:       64,
          flexShrink:  0,
          textAlign:   'right',
        }}
      >
        {entry.status}
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Scene 1 — Hook
// ─────────────────────────────────────────────────────────────────────────────

const Scene1: React.FC<{ frame: number }> = ({ frame }) => {
  const fadeOut = 1 - itp(frame, 120, 150);

  const l1 = sp(frame, 6);
  const l2 = sp(frame, 14);
  const l3 = sp(frame, 22);
  const iconSpring = spSlow(frame, 10);

  const line = (progress: number): React.CSSProperties => ({
    opacity:   Math.min(progress * 1.4, 1),
    transform: `translateY(${(1 - progress) * 42}px)`,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', opacity: fadeOut }}>
      <DotGrid />

      <div
        style={{
          position:        'absolute',
          inset:           0,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'space-between',
          padding:         '0 150px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 1180 }}>
          <div style={{ fontFamily: circularFamily, fontWeight: 700, fontSize: 62, lineHeight: 1, color: FG, ...line(l1) }}>
            Open Logs in the dashboard
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', fontFamily: circularFamily, fontSize: 78, lineHeight: 1, ...line(l2) }}>
            <span style={{ fontWeight: 700, color: FG }}>and&nbsp;see&nbsp;</span>
            <span
              style={{
                fontWeight: 800,
                color:      GREEN,
                textShadow: `0 0 30px rgba(62,207,142,0.45)`,
              }}
            >
              every event
            </span>
          </div>
          <div style={{ fontFamily: circularFamily, fontWeight: 700, fontSize: 62, lineHeight: 1, color: FG_LIGHT, ...line(l3) }}>
            that happens.
          </div>
        </div>

        <div
          style={{
            position:       'relative',
            width:          420,
            height:         420,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexShrink:     0,
            opacity:        Math.min(iconSpring * 1.4, 1),
            transform:      `scale(${0.75 + iconSpring * 0.25})`,
          }}
        >
          <div
            style={{
              position:     'absolute',
              width:        420,
              height:       420,
              borderRadius: '50%',
              background:   'radial-gradient(circle, rgba(62,207,142,0.16) 0%, rgba(62,207,142,0) 70%)',
            }}
          />
          <Radio
            size={200}
            strokeWidth={1.5}
            color={GREEN}
            style={{ filter: 'drop-shadow(0 0 26px rgba(62,207,142,0.5)) drop-shadow(0 0 8px rgba(62,207,142,0.4))' }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Scene 2 — Live log stream
// ─────────────────────────────────────────────────────────────────────────────

const ROW_HEIGHT      = 62;
const ROW_GAP         = 10;
const SLOT            = ROW_HEIGHT + ROW_GAP;
const SPAWN_INTERVAL  = 15;
const PX_PER_FRAME    = SLOT / SPAWN_INTERVAL;
const SPAWN_BASE      = -260;
const NUM_LOG_ROWS    = 48;
const STREAM_TOP      = 216;
const STREAM_BOTTOM   = 1000;

const Scene2: React.FC<{ frame: number }> = ({ frame }) => {
  const fadeIn  = itp(frame, 130, 155);
  const fadeOut = 1 - itp(frame, 300, 330);
  const sceneOpacity = Math.min(fadeIn, fadeOut);

  const headingIn = sp(frame, 132);
  const livePulse = (Math.sin(frame / 8) + 1) / 2;

  const rows = [];
  for (let i = 0; i < NUM_LOG_ROWS; i++) {
    const createFrame = SPAWN_BASE + i * SPAWN_INTERVAL;
    const y = STREAM_TOP + (frame - createFrame) * PX_PER_FRAME;

    if (y < STREAM_TOP - SLOT || y > STREAM_BOTTOM + SLOT) continue;

    const entryIn  = itp(frame, createFrame, createFrame + 8);
    const exitOut  = 1 - itp(y, STREAM_BOTTOM - SLOT, STREAM_BOTTOM);
    const opacity  = entryIn * exitOut;
    if (opacity <= 0.01) continue;

    const template = LOG_TEMPLATES[i % LOG_TEMPLATES.length];

    rows.push(
      <LogRow
        key={i}
        entry={template}
        index={i}
        opacity={opacity}
        style={{ top: y, height: ROW_HEIGHT }}
      />,
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', opacity: sceneOpacity }}>
      <DotGrid />

      {/* Header */}
      <div
        style={{
          position:  'absolute',
          top:       78,
          left:      100,
          right:     100,
          display:   'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity:   Math.min(headingIn * 1.4, 1),
          transform: `translateY(${(1 - headingIn) * 24}px)`,
        }}
      >
        <div>
          <div style={{ fontFamily: circularFamily, fontWeight: 800, fontSize: 44, color: FG, lineHeight: 1 }}>
            One unified stream
          </div>
          <div style={{ fontFamily: MONO, fontSize: 16, color: FG_MUTED, marginTop: 10, letterSpacing: 0.5 }}>
            API Gateway · Postgres · Auth · Storage · PostgREST · Realtime · Pooler
          </div>
        </div>

        <div
          style={{
            display:       'flex',
            alignItems:    'center',
            gap:           10,
            padding:       '8px 18px',
            borderRadius:  999,
            background:    'rgba(62,207,142,0.08)',
            border:        `1px solid rgba(62,207,142,${0.25 + livePulse * 0.15})`,
          }}
        >
          <div
            style={{
              width:        9,
              height:       9,
              borderRadius: '50%',
              background:   GREEN,
              boxShadow:    `0 0 ${6 + livePulse * 10}px rgba(62,207,142,0.8)`,
            }}
          />
          <span style={{ fontFamily: circularFamily, fontWeight: 700, fontSize: 15, color: GREEN, letterSpacing: 2 }}>
            LIVE TAIL
          </span>
        </div>
      </div>

      {/* Stream area */}
      <div
        style={{
          position: 'absolute',
          top:      STREAM_TOP,
          left:     100,
          right:    100,
          height:   STREAM_BOTTOM - STREAM_TOP,
          overflow: 'hidden',
        }}
      >
        {rows}
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Scene 3 — Filter & search
// ─────────────────────────────────────────────────────────────────────────────

const FILTER_SERVICES: ServiceKey[] = [
  'gateway', 'postgres', 'auth', 'storage', 'postgrest', 'realtime', 'pooler',
];
const ACTIVE_SERVICES = new Set<ServiceKey>(['postgres', 'auth']);
const PILL_COUNTS: Record<ServiceKey, number> = {
  gateway: 812, postgres: 244, auth: 366, storage: 98, postgrest: 501, realtime: 140, pooler: 63,
};

const STATIC_ROW_INDICES = [0, 1, 2, 3, 4, 5, 7, 8];

const TYPE_START = 400;
const TYPE_TEXT  = 'status:500';
const CHARS_PER  = 3;

const Scene3: React.FC<{ frame: number }> = ({ frame }) => {
  const fadeIn  = itp(frame, 315, 345);
  const fadeOut = 1 - itp(frame, 460, 490);
  const sceneOpacity = Math.min(fadeIn, fadeOut);

  const headingIn = sp(frame, 320);

  const typedChars = Math.max(0, Math.min(TYPE_TEXT.length, Math.floor((frame - TYPE_START) / CHARS_PER)));
  const typedText  = TYPE_TEXT.slice(0, typedChars);
  const showCursor = frame > 350 && Math.floor(frame / 15) % 2 === 0;

  const ROW_H = 68;
  const ROW_GAP3 = 14;
  const ROWS_TOP = 320;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', opacity: sceneOpacity }}>
      <DotGrid />

      {/* Heading */}
      <div
        style={{
          position:  'absolute',
          top:       70,
          left:      100,
          opacity:   Math.min(headingIn * 1.4, 1),
          transform: `translateY(${(1 - headingIn) * 20}px)`,
        }}
      >
        <div style={{ fontFamily: circularFamily, fontWeight: 800, fontSize: 40, color: FG, lineHeight: 1 }}>
          Filter and search, instantly
        </div>
      </div>

      {/* Filter pill bar */}
      <div
        style={{
          position: 'absolute',
          top:      160,
          left:     100,
          right:    100,
          display:  'flex',
          gap:      14,
        }}
      >
        {FILTER_SERVICES.map((service, i) => {
          const meta = SERVICE_META[service];
          const Icon = meta.Icon;
          const isTarget  = ACTIVE_SERVICES.has(service);
          const toggleAmt = itp(frame, 350 + i * 4, 378 + i * 4);
          const activeAmt = isTarget ? toggleAmt : 0;
          const dimAmt    = isTarget ? 0 : toggleAmt;

          const bg     = isTarget
            ? `rgba(62,207,142,${0.06 + activeAmt * 0.08})`
            : 'rgba(255,255,255,0.04)';
          const border = isTarget
            ? `rgba(62,207,142,${0.25 + activeAmt * 0.35})`
            : BORDER;
          const color  = isTarget
            ? `rgba(${255 - activeAmt * 192}, 255, ${255 - activeAmt * 113}, 1)`
            : FG_LIGHT;

          return (
            <div
              key={service}
              style={{
                display:       'flex',
                alignItems:    'center',
                gap:           8,
                padding:       '9px 16px',
                borderRadius:  999,
                background:    bg,
                border:        `1px solid ${border}`,
                opacity:       1 - dimAmt * 0.6,
                transform:     `scale(${1 + activeAmt * 0.06})`,
              }}
            >
              <Icon size={16} strokeWidth={1.5} color={isTarget ? GREEN : FG_MUTED} />
              <span style={{ fontFamily: circularFamily, fontSize: 14, fontWeight: 600, color: isTarget ? GREEN : color }}>
                {meta.label}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 12, color: FG_MUTED }}>
                {PILL_COUNTS[service]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Search box */}
      <div
        style={{
          position:      'absolute',
          top:           220,
          left:          100,
          width:         560,
          display:       'flex',
          alignItems:    'center',
          gap:           10,
          padding:       '12px 18px',
          borderRadius:  10,
          background:    '#1a1a1a',
          border:        `1px solid ${itp(frame, 385, 405) > 0.5 ? 'rgba(62,207,142,0.35)' : BORDER}`,
          opacity:       itp(frame, 385, 405),
        }}
      >
        <Search size={18} strokeWidth={1.5} color={FG_MUTED} />
        <span style={{ fontFamily: MONO, fontSize: 16, color: FG }}>
          {typedText}
          <span style={{ opacity: showCursor ? 1 : 0, color: GREEN }}>▍</span>
        </span>
      </div>

      {/* Filtered row list */}
      <div style={{ position: 'absolute', top: ROWS_TOP, left: 100, right: 100 }}>
        {STATIC_ROW_INDICES.map((tplIdx, i) => {
          const entry = LOG_TEMPLATES[tplIdx];
          const isTargetService = ACTIVE_SERVICES.has(entry.service);
          const isTargetStatus  = entry.status === 500;

          const serviceMatchAmt = isTargetService ? 1 : 1 - itp(frame, 350, 380);
          const searchMatchAmt  = isTargetStatus ? 1 : 1 - itp(frame, 430, 458);
          const matchFactor     = serviceMatchAmt * searchMatchAmt;

          const finalHighlight = itp(frame, 432, 460) * (isTargetStatus ? 1 : 0);

          const opacity = 0.14 + matchFactor * 0.86;
          const scale   = 0.94 + matchFactor * 0.06;

          return (
            <LogRow
              key={tplIdx}
              entry={entry}
              index={tplIdx}
              opacity={opacity}
              scale={scale}
              highlight={finalHighlight > 0.4}
              style={{ top: i * (ROW_H + ROW_GAP3), height: ROW_H }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Scene 4 — Close
// ─────────────────────────────────────────────────────────────────────────────

const Scene4: React.FC<{ frame: number }> = ({ frame }) => {
  const fadeIn = itp(frame, 480, 510);

  const logoSpring  = sp(frame, 484);
  const titleSpring = spSlow(frame, 500);
  const badgeSpring = sp(frame, 522);

  const badgePulse = (Math.sin(frame / 14) + 1) / 2;

  // Faint ghost log lines in the background, echoing scene 2, to fill negative space.
  const ghostRows = new Array(9).fill(0).map((_, i) => ({
    top: 140 + i * 92,
    w: 900 - (i % 3) * 140,
  }));

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', opacity: fadeIn }}>
      <DotGrid />

      {ghostRows.map((g, i) => (
        <div
          key={i}
          style={{
            position:     'absolute',
            top:          g.top,
            left:         i % 2 === 0 ? 90 : undefined,
            right:        i % 2 === 1 ? 90 : undefined,
            width:        g.w,
            height:       36,
            borderRadius: 8,
            background:   'rgba(255,255,255,0.025)',
            border:       '1px solid rgba(255,255,255,0.03)',
          }}
        />
      ))}

      <div
        style={{
          position:        'absolute',
          inset:            0,
          display:          'flex',
          flexDirection:    'column',
          alignItems:       'center',
          justifyContent:   'center',
          gap:              28,
        }}
      >
        <Img
          src={staticFile('SupabaseIcon.png')}
          style={{
            width:      80,
            height:     80,
            objectFit:  'contain',
            opacity:    Math.min(logoSpring * 1.4, 1),
            transform:  `translateY(${(1 - logoSpring) * -24}px) scale(${0.8 + logoSpring * 0.2})`,
          }}
        />

        <div
          style={{
            fontFamily: circularFamily,
            fontWeight: 800,
            fontSize:   112,
            lineHeight: 1,
            color:      FG,
            opacity:    Math.min(titleSpring * 1.4, 1),
            transform:  `translateY(${(1 - titleSpring) * 36}px)`,
            letterSpacing: -2,
          }}
        >
          Unified Logs
        </div>

        <div
          style={{
            padding:       '10px 26px',
            borderRadius:  999,
            background:    'rgba(62, 207, 142, 0.08)',
            border:        `1px solid rgba(62, 207, 142, ${0.3 + badgePulse * 0.15})`,
            boxShadow:     `0 0 ${18 + badgePulse * 16}px rgba(62,207,142,${0.18 + badgePulse * 0.12})`,
            opacity:       Math.min(badgeSpring * 1.4, 1),
            transform:     `translateY(${(1 - badgeSpring) * 20}px)`,
          }}
        >
          <span style={{ fontFamily: circularFamily, fontWeight: 600, fontSize: 18, color: GREEN, letterSpacing: 2, textTransform: 'uppercase' }}>
            Now in open beta
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Root composition
// ─────────────────────────────────────────────────────────────────────────────

export const UnifiedLogsAnnouncement: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Scene1 frame={frame} />
      <Scene2 frame={frame} />
      <Scene3 frame={frame} />
      <Scene4 frame={frame} />
    </AbsoluteFill>
  );
};
