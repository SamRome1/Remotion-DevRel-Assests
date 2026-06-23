---
name: Remotion interpolate extrapolate string literals
description: In this project's Remotion v4 build, Extrapolate is not a named export — use string literals 'clamp' instead
type: feedback
---

Do NOT import `Extrapolate` from `"remotion"` — it is not exported in this build (v4.0.417). Use string literals directly in `interpolate()` options:

```ts
interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
```

**Why:** `Extrapolate` as a named export does not exist in the installed Remotion version; importing it causes a TS2305 compile error.

**How to apply:** Every time you write an `interpolate()` call with clamp options, use the string form `'clamp'` directly — never `Extrapolate.CLAMP`.
