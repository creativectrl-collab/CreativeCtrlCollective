---
description: Cold-start pickup. Load canonical memory and restate the next task before doing any work.
---

# /start — pickup

1. Read `.agents/HANDOFF.md` in full.
2. Read `.agents/ROADMAP.md` and identify the single `in-progress` slice. It must match HANDOFF **Next**.
3. Read every path in HANDOFF **Read-first**, in order.
4. Do not read `.agents/sessions/` unless HANDOFF points at a specific file.
5. Reply with exactly:
   - Current slice
   - Next (verbatim from HANDOFF)
   - Do not (short bullets)
   - Proof last recorded
6. Stop. Do not edit files until the user confirms or the current Next is an explicit request to continue.
