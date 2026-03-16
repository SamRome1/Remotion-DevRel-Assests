---
name: user_profile
description: User profile and collaboration preferences for the Remotion project
type: user
---

User runs a Supabase-themed Remotion video production pipeline. They work with:
- A well-structured design token system (`src/tokens.ts`)
- Reusable components: CodePanel, TreeNode, Table, Icons
- A SYSTEM.md that defines strict quality rules all compositions must follow

The user delegates composition generation tasks in batch (queues of 10+ briefs at once). They expect:
- Verification checks run after each file is written
- Clear status logs (⬜ ⏳ ✅ ❌) reported at completion
- All compositions registered in Root.tsx automatically
- No inline hex color literals — always use token imports
