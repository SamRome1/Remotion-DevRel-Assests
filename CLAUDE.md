# REQUIRED FIRST STEP — Video brief gate

**Any request to create a new video, animation, composition, or scene sequence MUST begin with a completed brief in the format of `docs/VIDEO_BRIEF_TEMPLATE.md`. This step cannot be skipped.**

When the user asks for a new video and has not supplied a brief:
1. Do NOT write code, scaffold files, or download assets yet.
2. Reply with: "This project requires a specific brief format to ensure the visuals are professional. Please fill this out in a format similar to the following:" and paste the full contents of `docs/VIDEO_BRIEF_TEMPLATE.md`. Point to `docs/briefs/shortform-openai-postgres.md` as a completed example.
3. Wait for the brief. If any REQUIRED section is missing or a placeholder like `#______` is unfilled, ask for it before building.

The only bypass: the user explicitly states they are deliberately skipping the brief (e.g. "skip the brief", "no brief, just build it"). A vague "just do it" does not count — ask once whether they mean to skip. If they confirm, say so in the first line of your reply and fall back to the Supabase defaults in this file.

When a brief IS provided:
- Its VISUAL SYSTEM section overrides the Supabase color and typography defaults below for that composition.
- Its ASSET RULES and ARCHITECTURE sections always apply.
- Follow the assets-batch step literally: download and verify every asset (render the `AssetCheck` composition), stop and report the file list, and wait for the go-ahead before building any scene.
- Save the brief to `docs/briefs/<composition-id>.md` so future edits stay in sync with it.

Edits to an existing composition do not need a new brief — use the one in `docs/briefs/`.

**When a video is done: verify stills from every scene, render the MP4 to `out/`, then commit and push to GitHub (`origin/main`) unless the user says otherwise.**

---

# Remotion Animations — Supabase Styling Guide

This project produces Remotion video compositions for Supabase content. All animations must follow Supabase brand principles.

---

## Token system

`src/tokens.ts` is the source of truth for all color constants, animation helpers, glow utilities, and reusable components. Import from there rather than redefining values inline.

```ts
import {
  BG, SURFACE_100, GREEN, FG, FG_LIGHT, FG_MUTED,
  BORDER, BORDER_BRAND, MONO,
  itp, sp, spSlow,
  glowStyles, glowText, iconColor,
  DotGrid, TrafficLights, CheckIcon, CrossIcon, LockIcon,
  DOT_GRID_STYLE, boxBase,
} from '../tokens';
```

---

## Colors

```ts
// Backgrounds (darkest → elevated)
const BG        = '#0f0f0f';   // default canvas
const BG_ALT    = '#1a1a1a';   // elevated surface
const BG_CARD   = '#1f1f1f';   // cards / panels
const SURFACE   = '#2a2a2a';   // top-level surface

// Brand accent
const GREEN     = '#3ECF8E';   // Supabase green — single primary accent
const GREEN_DIM = '#2ea370';   // darker green for depth/fills

// Brand accent at opacity (use for backgrounds and borders)
// bg tint:  rgba(62, 207, 142, 0.08)
// border:   rgba(62, 207, 142, 0.25)  or  0.3 for emphasis

// Text
const TEXT         = 'rgba(255,255,255,0.92)';  // body / heading
const TEXT_MUTED   = 'rgba(255,255,255,0.45)';  // secondary / captions
const TEXT_FAINT   = 'rgba(255,255,255,0.28)';  // labels / metadata
const TEXT_BRAND   = GREEN;                      // brand-colored emphasis
```

**Rules:**
- Use one accent color (`#3ECF8E`). Do not introduce other saturated colors unless the animation specifically compares two distinct systems (e.g., Connectors vs MCP).
- Keep backgrounds very dark (`#0f0f0f`–`#1f1f1f`). Never use a white or light-mode canvas unless it's a deliberate one-off.
- White text at full opacity only for the most prominent heading. All other text drops to `0.45`–`0.92` opacity.
- Green at low opacity (`0.08`) for card/panel tints. At `0.25`–`0.3` for borders.

---

## Typography

Supabase's brand font is **Circular Std**. Use it via the shared font loader — never use Inter as the primary font.

```ts
import { circularFamily } from '../fonts';
// then on your root AbsoluteFill:
fontFamily: circularFamily   // 'CircularStd, system-ui, -apple-system, sans-serif'
```

`src/fonts.ts` handles the `delayRender`/`continueRender` handshake automatically on import — no extra setup needed per composition.

**Available weight:** Only Book (400) is installed. The browser will synthesise bold for heavier weights, which is acceptable for video rendering. Do not specify `fontWeight` below 400.

**Monospace (code only):** Use `MONO` from `tokens.ts` — never Circular for code blocks.

**Scale:**
| Role | Size | Weight | Line Height |
|---|---|---|---|
| Hero / display | 72–96px | 800 | 1.0 |
| Section heading | 48–64px | 700 | 1.0–1.1 |
| Subheading | 28–36px | 600 | 1.2 |
| Body | 18–24px | 400–500 | 1.4–1.5 |
| Caption / label | 12–16px | 500–600 | 1 |

**Rules:**
- Hero text uses `lineHeight: 1` — dense, terminal-like.
- Labels (all-caps tags, badges) use `letterSpacing: 1`–`2` and `fontWeight: 600`.
- Source Code Pro / monospace for code snippets only. Otherwise always Inter.
- No decorative fonts.

---

## Layout & Spacing

- Canvas is always filled — no dead space at edges. Content reaches close to the boundary.
- Use `AbsoluteFill` as the root, `overflow: 'hidden'`.
- Distribute elements across the full width/height. Avoid clustering everything in the center.
- Generous internal padding for cards: `24–40px`.
- Consistent grid gutters: multiples of `8px`.

---

## Components & Patterns

**Cards / panels:**
```ts
{
  backgroundColor: 'rgba(62, 207, 142, 0.08)',  // green tint
  border: '1px solid rgba(62, 207, 142, 0.25)',
  borderRadius: 12,
  padding: '24px 32px',
}
```

**Dividers:**
```ts
{ width: 1, backgroundColor: 'rgba(62, 207, 142, 0.25)' }  // vertical
{ height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)' } // horizontal
```

**Pill / badge:**
```ts
{
  backgroundColor: `${COLOR}18`,   // hex + 18 for ~10% opacity
  color: COLOR,
  borderRadius: 999,
  padding: '4px 12px',
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: 1,
}
```

**Glow effects:**
```ts
boxShadow: '0 0 40px rgba(62, 207, 142, 0.25)'   // green glow
boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'       // depth shadow
```

---

## Icons

Supabase uses **Lucide** as its primary icon library. `lucide-react` is installed. Always prefer Lucide over custom SVGs. For Supabase-specific product icons (Database, Auth, Storage, etc.) use `src/Components/Icons.tsx`.

**Import:**
```ts
import { Monitor, Bot, Database, Server, Workflow, BrainCircuit } from 'lucide-react';
import { IconDatabase, IconAuth, IconStorage, IconFunctions, IconRealtime } from '../Components/Icons';
```

**Concept → icon map (use these, don't invent custom SVGs):**
| Concept | Lucide icon |
|---|---|
| Computer / machine | `Monitor` |
| AI agent | `Bot` |
| Multiple agents / orchestration | `Workflow` |
| AI / reasoning | `BrainCircuit` |
| Database | `Database` (or `IconDatabase` from Icons.tsx) |
| Server / backend | `Server` |
| Terminal / CLI | `Terminal` |
| Auth / security | `ShieldCheck` |
| Storage | `HardDrive` |
| API | `Zap` |
| Network / connections | `Network` |

**Spec — always use these values on Lucide icons:**
- `strokeWidth={1.5}` (Supabase baseline)
- `strokeLinecap="round"` / `strokeLinejoin="round"` (Lucide default, leave as-is)
- `fill="none"` (Lucide default)
- Pass `color` prop for the stroke color

**Sizing:**
| Context | `size` prop | `strokeWidth` |
|---|---|---|
| List items / inline | 16–20 | 1.5 |
| Card headers / node labels | 24 | 1.5 |
| Feature callouts | 32–40 | 2 |
| Hero / display | 160–220 | 1.5 (scales with size) |

**Applying glow to Lucide icons — use the `style` prop:**
```tsx
// Static glow (white, for neutral elements like a computer/monitor)
<Monitor
  size={180}
  color={FG}
  strokeWidth={1.5}
  style={{ filter: 'drop-shadow(0 0 22px rgba(255,255,255,0.2)) drop-shadow(0 0 6px rgba(255,255,255,0.2))' }}
/>

// Green glow (for active/brand elements like an agent)
<Bot
  size={180}
  color={GREEN}
  strokeWidth={1.5}
  style={{ filter: `drop-shadow(0 0 22px ${GREEN_GLOW}) drop-shadow(0 0 6px ${GREEN_GLOW})` }}
/>

// Pulsing glow (processing/active state)
<Bot
  size={180}
  color={GREEN}
  strokeWidth={1.5}
  style={{ filter: `drop-shadow(0 0 ${22 + pulse * 18}px ${GREEN_GLOW}) drop-shadow(0 0 ${6 + pulse * 10}px ${GREEN_GLOW})` }}
/>
```

**Node/container glow — use `glowStyles(progress)` from tokens:**
```ts
import { glowStyles, iconColor } from '../tokens';

<div style={{ ...boxBase, ...glowStyles(activeProgress) }}>
  <Database size={24} strokeWidth={1.5} color={iconColor(activeProgress)} />
</div>
```

---

## Animation Principles

- Spring-based entrances for UI elements: `damping: 18, stiffness: 130`.
- Stagger reveals by `4–8 frames` between sibling elements.
- Default FPS: 30. Default duration: calculated from content — don't pad with empty frames.
- Exit: fade or slide out cleanly. Don't just cut.
- Use `Extrapolate.CLAMP` on all `interpolate` calls.

---

## Assets

- Supabase logo: `staticFile('SupabaseIcon.png')` — 80×80px, `objectFit: 'contain'`
- Background images: `staticFile('BG3.png')` etc. — always `objectFit: 'cover'`, fade in via opacity
- Public images referenced with `staticFile()`, never raw paths

---

## Do Not

- Do not use CSS classes or Tailwind — inline styles only (Remotion requirement).
- Do not use light backgrounds unless the brief specifically calls for it.
- Do not crowd elements into the center — use the full canvas.
- Do not add a second accent color unless the animation explicitly contrasts two systems.
- Do not use font sizes below 12px — they render poorly in video.
