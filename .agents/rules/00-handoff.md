---
trigger: always_on
description: Canonical cross-agent checkpoint. Always read .agents/HANDOFF.md before editing this repo.
---

# Handoff is the source of truth

This workspace is shared by Grok, Gemini CLI, and Antigravity. Private stores (`~/.gemini/antigravity-ide/brain/`, Gemini tmp memory, Grok `/memory`) are not visible to the other agents.

Before any file edit:

1. Read `.agents/HANDOFF.md`.
2. Read the current slice on `.agents/ROADMAP.md`.
3. Follow HANDOFF **Read-first**.
4. Restate slice, Next, and Do not.

On a cold session run `/start`. Before switching agents run `/handoff`. Mid-session progress goes in `/checkpoint`.

Do not use the ArtSpace Supabase project. Do not reset the remote database. Do not commit `.env.local`. Do not put LLM keys in `VITE_*`.
