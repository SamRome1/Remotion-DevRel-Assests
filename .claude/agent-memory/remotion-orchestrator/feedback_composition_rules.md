---
name: composition_quality_rules
description: Enforced quality rules for all Remotion compositions in this project
type: feedback
---

Every composition must meet these rules (from SYSTEM.md):

1. Canvas 1920×1080 (horizontal default), fill the full canvas
2. All colors imported from `../tokens` — no inline hex literals
3. `codeFontSize` ≥ 18 on every CodePanel (use 18 or 19)
4. `NODE_H` ≥ 96 (use 100), node widths ≥ 200 (root ≥ 230)
5. Tree fills y=80 to y=950+ — no bottom dead zone
6. Named export must match filename exactly
7. `DotGrid` is always first child of `AbsoluteFill`
8. SVG layer spans full 1920×1080 with `overflow: visible`
9. Use `sp()` / `spSlow()` — never custom spring configs
10. All 13 Supabase explainers follow left=CodePanel, right=TreeNode/Table layout

**Why:** Established by SYSTEM.md design system to ensure visual consistency.

**How to apply:** Verify each check before confirming any composition is complete.
