---
name: Project Setup
description: Remotion project structure, versions, conventions, and composition registration pattern
type: project
---

Remotion v4.0.417, React 19, TypeScript 5.9. All compositions live in `src/Compositions/`. Root file is `src/Compositions/Root.tsx` — import the component and add a `<Composition>` block inside `RemotionRoot`. Default canvas is 1920x1080 at 30fps. Project uses `@remotion/google-fonts`, `@remotion/tailwind-v4`, framer-motion, gsap, lucide-react, three.js. Dev command: `npm run dev` (runs `remotion studio`).

Background: `#07070f` (or `#0d1117` for Supabase-aesthetic compositions). Dot grid: `radial-gradient(circle, rgba(255,255,255,0.032) 1px, transparent 1px)` at 52px. Font: Inter via `loadFont('normal', { weights: ['400','600','700','800'] })` from `@remotion/google-fonts/Inter`. Static assets via `staticFile()`. Claude logo: `staticFile('claudelogo.png')`.

Vertical short-form format is 1080x1920 at 30fps (used by ~20+ compositions e.g. GitHubStarsGrowth, ViralDatabaseStory). Supabase green: `#3ECF8E`. Design principle: fill the full canvas — large elements, no dead space, distributed across height.

All icons in new compositions must be drawn as inline SVG paths — no external images or staticFile() calls (unless existing staticFile assets are referenced). Use `seededRandom(seed)` (`Math.sin` based) for deterministic jitter. Avoid `Math.random()` or `Date.now()` in render.

**Why:** Established pattern from ~70 existing compositions.
**How to apply:** Always register new compositions in Root.tsx with the same import + `<Composition>` entry pattern. Match 1920x1080 30fps unless the user specifies otherwise (1080x1920 for vertical/short-form). Follow background/font/dot-grid baseline in all new compositions.
