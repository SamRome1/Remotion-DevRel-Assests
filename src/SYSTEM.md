# Supabase Remotion Video System

You are generating a Remotion composition for a Supabase developer education video.
Read this entire file before writing any code.

---

## Project structure

```
src/
  tokens.ts           ← all design tokens, helpers, base components — always import from here
  components/         ← reusable composition components
    CodePanel.tsx
    TreeNode.tsx
    ConnectorLine.tsx
    TableRow.tsx
    TableHeader.tsx
    UserToken.tsx
  compositions/       ← one file per video — this is what you are generating
  public/
    SupabaseIcon.png
```

---

## Rules — read these first

- **Always import** colors, helpers, and base components from `../tokens` — never redefine them
- **Never add payoff text inside the video** — the visual does the explaining. Caption goes in the X post, not the composition.
- **Code drives the diagram** — the left panel always triggers what happens on the right, never the other way around
- **No floating animations** — spring config is always `{ damping: 18, stiffness: 200, mass: 0.8 }` via the `sp()` helper. Use `spSlow()` only for large panels entering
- **Entrances** — panels slide in from the direction they come from. Left panel from left (`translateX` negative → 0), right panel from right (positive → 0), nodes from below (`translateY` positive → 0)
- **Exits** — slide off in the same direction they entered
- **Glow = active** — use `glowStyles(progress)` from tokens for any lit node or element. Never manually write the 3-property glow
- **Duration** — 12–16 seconds. 360–480 frames at 30fps
- **Canvas** — always 1920×1080
- **Export** — export the composition as a named export, not default

---

## Imports — always use these exact imports

```tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Img, staticFile } from 'remotion';
import { loadFont, fontFamily as interFont } from '@remotion/google-fonts/Inter';
import { GREEN, BG, SURFACE_100, BORDER, MONO, FG, FG_LIGHT, FG_MUTED, boxBase, itp, sp, spSlow, glowStyles, glowText, iconColor, DotGrid, TrafficLights } from '../tokens';
import { IconDatabase, IconAuth, IconStorage, IconRealtime, IconEdgeFunctions, IconUser, IconSQL, UploadCloud, HardDrive, Lock, ShieldCheck, Link, Zap, ArrowRight } from '../components/Icons';
```

Load Inter at the top of the file, outside the component:
```tsx
loadFont('normal', { weights: ['300', '400', '500', '600', '700'] });
```

---

## Icon system

**Never use emojis for icons in compositions.** Always use the icon components from `../components/Icons`.

All icons live in `src/components/Icons.tsx`. There are two categories:

### 1. Supabase product icons (inline SVG)

Use these for any node representing a Supabase product or feature:

| Import | Use for |
|---|---|
| `IconDatabase` | Postgres / database nodes |
| `IconAuth` | Auth / RLS / access control |
| `IconStorage` | Storage buckets / file upload |
| `IconRealtime` | Realtime / pub-sub / pg_notify |
| `IconEdgeFunctions` | Edge Functions / serverless |
| `IconSQL` | SQL editor / query panels |
| `IconUser` | User identity / JWT |

### 2. Lucide icons (standard UI)

Use for generic UI concepts (arrows, locks, links, status):

| Import | Use for |
|---|---|
| `Lock` / `Unlock` | Auth lock state |
| `ShieldCheck` / `Shield` | RLS / policy |
| `HardDrive` | S3 / object storage |
| `UploadCloud` | Upload action |
| `Link` / `ExternalLink` | URLs / public endpoints |
| `Zap` | Realtime / fast |
| `ArrowRight` / `MoveRight` | Request flow |
| `CheckCircle` / `XCircle` | Allow / deny |
| `Key` / `KeyRound` | JWT / token |

### Passing icons to TreeNode

Always use the `svgIcon` prop (not the `icon` emoji prop). Use `iconColor()` from tokens to set color based on glow state:

```tsx
import { iconColor } from '../tokens';
import { IconDatabase, UploadCloud } from '../components/Icons';

// Inside the component, after computing glow progress:
<TreeNode
  label="Postgres"
  svgIcon={<IconDatabase size={20} color={iconColor(pgGlow)} />}
  cx={1280} cy={470}
  glow={pgGlow}
  enterFrame={65}
/>

<TreeNode
  label="Upload"
  svgIcon={<UploadCloud size={20} strokeWidth={1.5} color={iconColor(rootGlow)} />}
  cx={1280} cy={160}
  glow={rootGlow}
  enterFrame={45}
  root
/>
```

### Icon sizing

| Context | size | strokeWidth |
|---|---|---|
| TreeNode (standard) | `20` | `1.5` |
| TreeNode (root) | `22` | `1.5` |
| Inline / small | `16` | `1.5` |
| Hero / large | `28` | `1.5` |

---

## Layout templates

### CodeAndTree

Code panel on the left, tree diagram on the right. Each code line activates a matching tree node when it finishes typing.

**Left panel** — positioned at `left: 80, top: 280, width: 760`
**Right panel** — centered at `cx: 1440` (center of the right half, 960–1920). Root node at `cy: 170`, child nodes spaced ~160px apart vertically. For split/parallel nodes, spread horizontally to `cx: 1200` and `cx: 1680` to fill the full right half.

**Node sizes** — standard: `width: 160, height: 80`. Root: `width: 190, height: 80`. Always pass explicit `width` and `height` to every `TreeNode` — never rely on defaults.

**Connector coordinates** — always derive from constants using `NODE_H / 2` offsets, never hardcode pixel values:
```tsx
// vertical: bottom of node above → top of node below
x1={NODE_CX} y1={NODE_CY + NODE_H / 2}
x2={NEXT_CX} y2={NEXT_CY - NODE_H / 2}
```

**Animation sequence:**
1. `(0–22f)` global fade in
2. `(18–45f)` code panel slides in from left
3. `(40–68f)` tree slides in from right — root + dim child nodes
4. Per code line — stagger ~55f apart:
   - Line types in over 28f
   - Node lights up via `glowStyles()` 18f after line starts
   - Connector line draws in via SVG `strokeDashoffset` simultaneously
5. After last node lights — all connectors pulse bright green together (28f)
6. Root node glows and label morphs (e.g. "Supabase Project" → "Postgres")
7. Supabase logo fades in at bottom center

**Connector lines** — SVG layer, `position: absolute, inset: 0`. Draw from root center-bottom to each child center-top using `strokeDashoffset` animation.

---

### CodeAndTable

Code panel on left, full table center, terminal + results panel on right. Used for access control / RLS concepts.

**Left panel** — `left: 250, top: 260, width: 560`
**Center table** — starts at `left: 1020, top: 240` then shifts to `left: 200` when terminal appears
**Right terminal** — `left: 870, top: 240, width: 680`

**Animation sequence:**
1. `(0–22f)` global fade in
2. `(20–45f)` code panel slides in from left
3. `(35–65f)` full table slides in from right, rows stagger in
4. `(65–128f)` hold — both visible
5. `(128–158f)` code panel exits left, table shifts left via `translateX`
6. `(158–185f)` terminal box slides in from right
7. `(188–230f)` User A result rows stagger in. Full table highlights matching rows via `glowStyles()`
8. `(268–298f)` terminal comment line swaps to User B
9. `(298–340f)` User B result rows stagger in. Table highlights flip
10. `(368–400f)` payoff text fades in
11. `(400–424f)` Supabase logo fades in

---

## Timing conventions

| Event | Duration |
|---|---|
| Global fade in | 22f |
| Panel slide in/out | 18–28f (use `spSlow`) |
| Node entrance | 12–18f (use `sp`) |
| Typewriter per line | 28f |
| Connector line draw | 20f |
| Glow ramp | 22f |
| Row stagger interval | 6–8f per row |
| Hold between phases | 40–65f |
| Logo fade in | 24f |

---

## Typewriter effect

```tsx
const typed = (startF: number, text: string) => {
  const prog = itp(frame, startF, startF + 28);
  return text.slice(0, Math.floor(prog * text.length));
};
```

Show blinking cursor on the currently-typing line:
```tsx
{!fullTyped && (
  <span style={{
    display: 'inline-block', width: 2, height: 14,
    background: GREEN, marginLeft: 2, verticalAlign: 'middle',
    opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
  }} />
)}
```

---

## Syntax highlighting

Always apply these colors inside code panels:

```tsx
// Helper — wrap highlighted spans around a SQL string
// SQL keywords
<span style={{ color: '#ff9f7f' }}>SELECT</span>
// Functions
<span style={{ color: GREEN }}>auth.uid()</span>
// Table / column names
<span style={{ color: '#7c9cff' }}>user_id</span>
// String values
<span style={{ color: '#f97583' }}>'user-a'</span>
// Comments
<span style={{ color: 'rgba(255,255,255,0.28)' }}>-- comment</span>
```

---

## Tree node spec

Each node:
- Size: `width: 160, height: 80` (root: `width: 190, height: 80`) — always pass these explicitly
- Base style: `{ ...boxBase, borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5 }`
- At rest: `boxBase` styles, label color `FG_MUTED`
- When lit: spread `glowStyles(progress)` over boxBase, label color `GREEN`
- Always include an emoji or Lucide icon above the label

---

## Table row spec

States: `'neutral' | 'allow' | 'deny' | 'dim'`

```tsx
// allow
background: 'rgba(62,207,142,0.08)'  border: 'rgba(62,207,142,0.35)'  opacity: 1
// deny
background: 'rgba(255,64,64,0.06)'   border: 'rgba(255,64,64,0.25)'   opacity: 0.35
// neutral / dim
background: SURFACE_100              border: BORDER                    opacity: 1 / 0.25
```

Row height: `42px` (compact: `36px`)
Always include a `CheckIcon` or `CrossIcon` in the last column when state is `allow` or `deny`.

---

## Code panel spec

```tsx
<div style={{
  ...boxBase,
  borderRadius: 16,
  padding: '28px 32px',
  // entrance:
  opacity: Math.min(panelSpring * 1.5, 1),
  transform: `translateX(${interpolate(panelSpring, [0,1], [-60, 0])}px)`,
}}>
  <TrafficLights filename="query.sql" />
  {/* code content */}
</div>
```

---

## Brief template

When given a brief in this format, generate the full composition `.tsx` file:

```
## Brief

Concept: [one sentence]
Template: [CodeAndTree | CodeAndTable | custom]
Filename: [e.g. RlsPolicyExplainer.tsx]
Duration: [frames, e.g. 420]

Code panel:
  filename: [e.g. policy.sql]
  lines:
    1. [code] → activates [node/element]
    2. [code] → activates [node/element]
    ...

Tree (if CodeAndTree):
  root: [label]
  nodes:
    - label: [X]  icon: [emoji]
    - label: [Y]  icon: [emoji]
    ...
  payoff: [e.g. root label swaps to "Postgres" at end]

Table (if CodeAndTable):
  name: [e.g. posts]
  columns: [id, user_id, content]
  rows:
    - [post-1, user-a, Hello world]
    - [post-2, user-b, My first post]
    ...
  User A sees: [user-a rows]
  User B sees: [user-b rows]

Notes: [any non-standard timing or visual details]
```

---

## Completed compositions

| File | Concept |
|---|---|
| `AuthUidExplainer.tsx` | `auth.uid()` — same RLS policy blocks one user, allows another |
| `SupabasePostgresExplainer.tsx` | Every Supabase product is just Postgres — Auth, Storage, Realtime, Database light up from SQL commands |