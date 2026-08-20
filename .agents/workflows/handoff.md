---
description: Freeze this session so Grok, Gemini, or Antigravity can pick up from a clean checkpoint.
---

# /handoff — freeze for another agent

1. Finish or clearly park the current task. Do not start a new ROADMAP slice unless the user asked.
2. Rewrite `.agents/HANDOFF.md` using the same contract as `/checkpoint`. **Next** is what the incoming agent should do first.
3. If the current slice is complete, mark it `done` on `.agents/ROADMAP.md` and set the following slice to `in-progress`. HANDOFF **Next** must match that slice.
4. Copy the new HANDOFF body to `.agents/sessions/YYYY-MM-DD-<slug>.md` (UTC date, short slug).
5. Confirm: no secrets in the files just written.
6. Reply with the Next task and stop.
