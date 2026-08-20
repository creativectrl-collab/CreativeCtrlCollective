---
name: session-handoff
description: >-
  Pick up or freeze Creative CTRL Collective work across Grok, Gemini CLI, and
  Antigravity. Use when the user says pickup, start, checkpoint, handoff,
  switch agents, or asks what the next task is.
---

# Session handoff

Canonical state is `.agents/HANDOFF.md`. It wins over chat history, Antigravity brain artifacts, Grok memory, and Gemini tmp memory.

## Pickup

1. Read `.agents/HANDOFF.md`.
2. Read `.agents/ROADMAP.md` (current slice only).
3. Read HANDOFF **Read-first** in order.
4. Restate slice, Next, Do not, last Proof.
5. Do not edit until the user confirms, unless they already asked to execute Next.

## Checkpoint (same agent, still working)

Rewrite `.agents/HANDOFF.md` in place. One Next. Proof is a command that ran, or `none`. No `sessions/` file.

## Handoff (switching agents or ending the session)

1. Rewrite HANDOFF.
2. Align ROADMAP statuses so exactly one slice is `in-progress`.
3. Snapshot HANDOFF to `.agents/sessions/YYYY-MM-DD-<slug>.md`.
4. Stop.

## Contract for HANDOFF.md

```
# Handoff — Creative CTRL Collective
Updated: YYYY-MM-DDTHH:MMZ
Agent: grok | gemini | antigravity
Slice: <id>
Proof: <command + result | none>

## Done — do not undo
## Next (exactly one primary task)
## Blocked
## Do not
## Files touched
## Read-first (ordered)
```

Keep the hot file under ~4 KB. Durable choices go in `.agents/DECISIONS.md`. Do not put secrets in any of these files.
