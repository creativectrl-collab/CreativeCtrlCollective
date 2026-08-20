# Handoff is the source of truth

This workspace is shared by Grok, Gemini CLI, and Antigravity. `~/.grok/memory/` is Grok-only — facts another agent must know belong in `.agents/HANDOFF.md` or `.agents/DECISIONS.md`.

Before any file edit:

1. Read `.agents/HANDOFF.md`.
2. Read the current slice on `.agents/ROADMAP.md`.
3. Follow HANDOFF **Read-first**.
4. Restate slice, Next, and Do not.

When the user switches to Gemini or Antigravity, rewrite `.agents/HANDOFF.md` in place (one Next, Done, Do not, Read-first, Proof) and copy a snapshot to `.agents/sessions/YYYY-MM-DD-<slug>.md`.

Do not use the ArtSpace Supabase project. Do not reset the remote database. Do not commit `.env.local`. Do not put LLM keys in `VITE_*`.
