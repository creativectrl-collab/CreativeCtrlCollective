---
description: Mid-session save. Rewrite the canonical HANDOFF in place without starting a new slice.
---

# /checkpoint — mid-session save

1. Read `.agents/HANDOFF.md` and `.agents/ROADMAP.md`.
2. Rewrite `.agents/HANDOFF.md` in place (do not append). Keep it under ~4 KB. Required sections in order:
   - Title + Updated (UTC) + Agent (`grok` | `gemini` | `antigravity`) + Slice + Proof
   - Done — do not undo
   - Next (exactly one primary task)
   - Blocked
   - Do not
   - Files touched
   - Read-first (ordered)
3. Proof must name a command that was actually run, or `none`.
4. Do not create a `sessions/` snapshot (that is `/handoff`).
5. Do not start the next ROADMAP slice.
6. Never write secrets, `.env.local` values, keys, or JWTs.
