# Supabase Remotion Composition System

## Project structure
- Compositions live in `src/Compositions/` (capital C)
- Design tokens: `src/tokens.ts`
- Components: `src/Components/CodePanel.tsx`, `src/Components/TreeNode.tsx`, `src/Components/Table.tsx`, `src/Components/Icons.tsx`
- Always import from `../tokens` and `../Components/` — never redefine inline

---

## Canvas rules
- Default size: **1920 × 1080** (horizontal). Use **1080 × 1920** only when explicitly specified as vertical/short
- **Fill the full canvas.** Elements must use the full height. No large empty zones at the bottom
- Tree/flow diagrams: distribute nodes from ~y=80 to ~y=950 on a 1080px canvas
- Code panels: width 860+, `codeFontSize` 18–20, positioned so they occupy the left half meaningfully
- Node sizes: `NODE_H` ≥ 96, node widths ≥ 200 (root ≥ 230), icon sizes ≥ 24

---

## Design tokens (from `../tokens`)

### Colors
```ts
BG           // '#0f0f0f' — canvas background
SURFACE_75   // '#141414' — deepest panels
SURFACE_100  // '#1a1a1a' — code panels, node boxes
SURFACE_200  // '#1f1f1f' — hover / secondary
SURFACE_300  // '#242424' — elevated modals
BORDER       // '#2a2a2a' — rest state
BORDER_STRONG// '#3a3a3a' — hover / focus
BORDER_BRAND // 'rgba(62,207,142,0.35)' — active / lit
GREEN        // '#3ecf8e' — brand primary, active color
GREEN_LT     // '#5cd9a0' — lighter highlight
GREEN_DK     // '#29b073' — pressed / deep
RED          // '#f04040' — destructive / error
WARNING      // '#f5a623'
SYN_KEYWORD  // '#ff9f7f'
SYN_FN       // GREEN
SYN_TABLE    // '#7c9cff'
SYN_STRING   // '#f97583'
SYN_COMMENT  // 'rgba(255,255,255,0.28)'
SYN_DEFAULT  // 'rgba(255,255,255,0.82)'
FG           // 'rgba(255,255,255,0.92)'
FG_LIGHT     // 'rgba(255,255,255,0.55)'
FG_MUTED     // 'rgba(255,255,255,0.28)'
FG_SUBTLE    // 'rgba(255,255,255,0.12)'
MONO         // '"JetBrains Mono", "Fira Code", ui-monospace, monospace'
```

### Animation helpers
```ts
itp(frame, startFrame, endFrame, from=0, to=1)
// Clamped interpolate. Returns value between from–to.

sp(frame, delay=0)
// Snappy spring: damping 18, stiffness 200, mass 0.8

spSlow(frame, delay=0)
// Slow spring: damping 14, stiffness 120, mass 1 — for large elements
```

### Glow system
```ts
glowStyles(progress: number): CSSProperties
// Returns { background, border, boxShadow } — apply to any lit node

iconColor(glow: number): string
// Returns GREEN when glow > 0.1, FG_MUTED otherwise

glowText(progress: number): CSSProperties
// Returns { color: GREEN, opacity, textShadow }
```

### Reusable components (from tokens)
```ts
<DotGrid />            // dot grid background — always first child of AbsoluteFill
<TrafficLights filename="..." />  // macOS window chrome
<CheckIcon progress={0–1} size={18} />
<CrossIcon opacity={0–1} size={18} />
<LockIcon color open size />
```

---

## Components

### CodePanel (`../Components/CodePanel`)

```ts
interface CodeLineData {
  tokens: CodeToken[]   // {type: 'keyword'|'fn'|'table'|'string'|'comment'|'plain', text: string}[]
  startFrame: number    // global frame when this line starts typing
  active?: number       // 0–1 glow progress — drives green left accent bar
  showAccent?: boolean
}

interface CodePanelProps {
  filename?: string
  lines: CodeLineData[]
  annotation?: { startFrame, label, value, valueColor? }
  enterFrame?: number        // default 0
  enterFrom?: 'left'|'right' // default 'left'
  exitFrame?: number
  exitTo?: 'left'|'right'
  width?: number             // default 620 — use 860+ for this project
  codeFontSize?: number      // default 15 — use 18–20 for this project
  style?: CSSProperties
}
```

### TreeNode (`../Components/TreeNode`)

```ts
interface TreeNodeProps {
  label: string
  sublabel?: string
  icon?: string        // emoji
  svgIcon?: ReactNode  // use Icons from ../Components/Icons
  cx: number           // absolute center X
  cy: number           // absolute center Y
  glow?: number        // 0–1
  enterFrame?: number
  enterFrom?: 'below'|'above'|'left'|'right'|'none'
  root?: boolean       // slightly larger
  width?: number       // default 130 (root: 143) — use 200+ for this project
  height?: number      // default 72 — use 96+ for this project
  morphLabel?: string  // label morphs to this when glow > 0.5
  morphLabelColor?: string
  style?: CSSProperties
}
```

```ts
// SVG components — place inside an <svg> covering the full canvas
<ConnectorLine
  x1 y1 x2 y2
  progress={0–1}      // draw-in progress
  litProgress={0–1}   // green glow intensity
  strokeWidth?        // default 1.8 — use 3+ for this project
  arrow?
  id="unique-string"  // required to avoid marker conflicts
/>

<TravelingDot
  x1 y1 x2 y2
  progress={0–1}      // position along path
  radius?             // default 5
  color?              // default GREEN
/>
```

### Table (`../Components/Table`)

```ts
interface ColumnDef { label, width?, color?, mono? }
interface RowData { id, cells: string[], highlight?: 'allow'|'deny'|'neutral'|'dim', enterFrame? }

interface TableProps {
  columns: ColumnDef[]
  rows: RowData[]
  tableName?: string
  showStatus?: boolean    // check/cross icon column
  compact?: boolean
  enterFrame?: number
  enterFrom?: 'left'|'right'|'none'
  exitFrame?: number
  exitTo?: 'left'|'right'
  offsetX?: number
  style?: CSSProperties
}
```

Preset columns available: `POSTS_COLUMNS`, `USERS_COLUMNS`, `STORAGE_COLUMNS`

### Icons (`../Components/Icons`)

Supabase product icons: `IconDatabase`, `IconAuth`, `IconStorage`, `IconRealtime`, `IconEdgeFunctions`, `IconSQL`, `IconUser`

Lucide icons: `Lock`, `Unlock`, `ShieldCheck`, `Shield`, `Key`, `KeyRound`, `HardDrive`, `FolderOpen`, `UploadCloud`, `Zap`, `Radio`, `Code`, `Terminal`, `User`, `Users`, `ArrowRight`, `MoveRight`, `Check`, `CheckCircle`, `X`, `XCircle`, `Link`, `ExternalLink`

Usage: `<IconDatabase size={24} color={iconColor(glow)} />`

---

## Composition template

```tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Img, staticFile } from 'remotion';
import { loadFont, fontFamily as interFont } from '@remotion/google-fonts/Inter';
import {
  BG, GREEN, /* ...other tokens */
  DotGrid, itp, sp, spSlow, glowStyles, iconColor,
} from '../tokens';
import { CodePanel } from '../Components/CodePanel';
import type { CodeLineData } from '../Components/CodePanel';
import { TreeNode, ConnectorLine, TravelingDot } from '../Components/TreeNode';
import { Table } from '../Components/Table';
import type { ColumnDef, RowData } from '../Components/Table';
import { IconDatabase /* etc */ } from '../Components/Icons';

loadFont('normal', { weights: ['300', '400', '500', '600', '700'] });

// ── Layout constants ──────────────────────────────────────────────────────────
// (define cx/cy/NODE_H etc here)

// ── Timeline (Nframes = Ns @ 30fps)
// frame 0–XX  : description
// frame XX–XX : description
// ...

export const MyComposition: React.FC = () => {
  const frame = useCurrentFrame();
  void useVideoConfig();

  const globalIn = itp(frame, 0, 22);

  // glow progresses
  // connector progresses
  // dot progresses

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', opacity: globalIn }}>
      <DotGrid />

      {/* SVG layer for connector lines and dots */}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
        {/* ConnectorLine and TravelingDot elements */}
      </svg>

      {/* LEFT: CodePanel */}
      {/* RIGHT: TreeNode diagram or Table */}
    </AbsoluteFill>
  );
};
```

---

## Timeline conventions
- Global fade in: frames 0–22 via `itp(frame, 0, 22)` applied to root opacity
- Panel/table entrance: frames 18–45 (spSlow)
- Tree nodes enter: frames 45–90 staggered by 10f each, `enterFrom="below"`
- Code lines type in: stagger by 30f each, starting frame 60
- Connector draws: 5–10f after the source node glows, over 20f
- Dot travels: 5f after connector starts, over 30–40f
- Glow activations: follow the logical flow of the concept being explained
- Logo fade in: last 24f of the composition

## Composition duration guide
- Simple (1 concept, 3–4 nodes): 300 frames (10s)
- Medium (2 steps, 5–6 nodes): 420 frames (14s)
- Complex (multi-phase, 7+ nodes or table): 540 frames (18s)

---

## Quality checklist (animator must verify before confirming)
- [ ] All colors from tokens — no hex literals inline
- [ ] All springs use `sp()` or `spSlow()` — no custom spring configs
- [ ] `NODE_H` ≥ 96, node widths ≥ 200
- [ ] `codeFontSize` ≥ 18 on CodePanel
- [ ] Tree fills y=80 to y=950+ on 1080px canvas — no bottom gap
- [ ] Named export matching the filename
- [ ] `AbsoluteFill` + `useCurrentFrame()` + `useVideoConfig()` used correctly
- [ ] `DotGrid` is first child of AbsoluteFill
- [ ] SVG layer spans full 1920×1080 with `overflow: visible`
- [ ] File is complete — not truncated
