# Video Brief — <working title>

> Fill every section. Sections marked REQUIRED cannot be left blank.
> A completed example: `docs/briefs/shortform-openai-postgres.md`.

## 0. Format — REQUIRED
- Canvas: <1080x1080 | 1080x1920 | 1920x1080>, <fps>
- Placement / context: <e.g. upper half of a 9:16 composite, standalone, X embed>
- Total duration: <frames> (<seconds>)
- Voiceover: <attached script | none>. If attached, every beat below must cite the VO phrase it syncs to.

## 1. VISUAL SYSTEM — apply to every scene, no exceptions — REQUIRED
- Background: <e.g. pure black #000000. No gradients, no vignettes, no noise unless explicitly requested.>
- Typography: <UI/headline font + weights> for UI/headlines, <mono font> for code/technical labels. <primary text color> primary, <secondary color> secondary.
- Accent: one accent color per project: #______
- Layout: <e.g. generous negative space; content lives in the center 80% safe zone; never crowd edges.>
- Motion language: <entrance: e.g. opacity 0→1 plus a 12px rise, spring({fps, frame, config: {damping: 200}}). No bounce, no overshoot, no rotation-based entrances.> <exits: e.g. quick opacity fades, 6–8 frames.> <stagger: e.g. 3–5 frames between siblings.>
- Emphasis: <e.g. scale 0.98→1.0 on entry, never larger. Highlights use the accent or a 1px border glow, not size changes.>
- Timing: <e.g. unhurried; hold finished compositions ≥20 frames before transitioning.>

## 2. ASSET RULES — REQUIRED
- NEVER recreate brand logos, product icons, or UI screenshots with HTML/CSS/JSX shapes or hand-written SVG paths. Approximations are unacceptable.
- Before building any scene that references a real product/company, download the official asset first:
  1. Check https://svgl.app (clean official SVGs) or the company's brand/press kit
  2. Fallback: https://cdn.simpleicons.org/[slug] for monochrome marks
  3. Save to `public/assets/` with a descriptive filename
  4. Reference via `<Img src={staticFile("assets/name.svg")} />` — never hotlink remote URLs
- If an official asset can't be found, STOP and ask rather than improvising one.
- Logos on black: use white/light variants. Apply `filter: invert` only to pure monochrome marks, never to color logos.

### Assets batch (run before any scenes)
Download these to `public/assets/` and confirm each renders on the canvas background (use the `AssetCheck` composition):
1. <Product> logo (<variant>) — <source>
2. ...

**Stop and report the file list before proceeding. Do not build scenes until every asset exists locally.**

## 3. ARCHITECTURE — REQUIRED
- One shared `src/theme.ts` exporting colors, fonts, spacing, and spring configs. All components import from it.
- Reusable components in `src/Components/`: `<SceneWrapper>`, `<Headline>`, `<MonoLabel>`, `<LogoBadge>`, `<CodeBlock>`, `<StatCounter>` plus any load-bearing components this brief names. Build scenes by composing these, not one-off JSX.
- Each scene is its own file in `src/scenes/`, sequenced in a composition with `<Series>` and registered in `Root.tsx`.
- Name any component that must be shared across scenes (e.g. a diagram that later scenes populate) and say which scenes depend on it.

## 4. SCENES — REQUIRED (one block per scene)

### Scene N — <Name> (<start>–<end>f, <seconds>s)
Beat A (<frames>): <what enters, how, and the VO phrase it syncs to>
Beat B (<frames>): ...
Beat C (<frames>): <hold / exit>
On-screen text: <exact strings, or "none">
Load-bearing components: <component names later scenes reuse, or "none">
Sanctioned exceptions: <any deliberate break from the visual system, stated explicitly, or "none">

### Scene N+1 — ...

## 5. Delivery
- Render target: `out/<CompositionId>.mp4`
- Verify: stills from every beat reviewed before the full render
- Commit and push to GitHub when done
