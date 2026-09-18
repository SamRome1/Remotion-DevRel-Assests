# Video Brief — Jev: Wired into a database

Composition: `JevCommentModeration` (`src/Compositions/JevCommentModeration.tsx`), 1080x1080, 30fps, 600 frames (20s).
Brief step was explicitly skipped by the user ("no more questions go"); this file records the decisions so later edits stay in sync.

## 0. Format
- Canvas: 1080x1080, 30fps
- Placement / context: standalone square, visuals only, user voices over live
- Total duration: 600 frames (20s)
- Voiceover script → beats:
  1. "until you wire it into a database." → 0–45f (title + panels stamp in)
  2. "Imagine an app where users leave comments." → 45–115f (comment types in YOUR APP)
  3. "Every comment that hits my Supabase table" → 115–170f (`row` chip → `comments` table, row appears `pending`)
  4. "fires a webhook, calling an Edge Function" → 170–250f (`webhook` chip → EDGE FUNCTION, `jev.choice(...)` lights up)
  5. "that asks Jev one question: is this spam, abuse, or fine?" → 250–360f (`req` chip → JEV, question highlights, SPAM/ABUSE/FINE rows)
  6. "And Jev answers almost instantly — about 150 milliseconds" → 360–455f (`150ms` chip, bars fill together 0.91/0.06/0.03, SPAM selected, `spam` chip travels back, table row status → `spam`)
  7. "no parsing, no retries, no hallucinated fourth option." → 470–600f (three notes; a dashed ghost row "MAYBE?" appears and is struck through, "not an option")

## 1. VISUAL SYSTEM
Identical to `docs/briefs/jev-confidence-picker.md` section 1 (blueprint layout on the Supabase dark palette, `src/blueprint.ts`). Square grid: two 390px panels on top (YOUR APP left, `comments` right with the Supabase mark in the header), EDGE FUNCTION mid-right, JEV full-width at the bottom; closing notes sit mid-left. Red appears only for the `spam` status cell and the ghost-row strike.

## 2. ASSET RULES
As in the template. Assets used: `public/assets/supabase.svg` (already verified in `AssetCheck`). No new downloads.

## 3. ARCHITECTURE
- Theme `src/blueprint.ts`; shared components `src/Components/Blueprint.tsx` (`Frame`, `SectionTitle`, `Panel` with `x/w/pad/headerRight`, `Link` axis-aligned connector with traveling chip, `Highlight`, `Chip`, `ScoreRow` with compact sizing props).
- One continuous diagram, so one scene file: `src/scenes/JevCmPipeline.tsx`, driven by a frame timeline of named beat constants.

## 4. Delivery
- Render target: `out/JevCommentModeration.mp4`
- Verify stills at each beat, render, commit, push.
