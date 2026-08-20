# Creative CTRL Collective — Agent Rules

Digital hub for Creative CTRL Collective. Separate legal entity from ArtSpace.

**Stack:** Vite + React + TypeScript, Tailwind, Supabase project `kvakftkmvqsfoinzzqav`, Netlify, domain `creativectrlcollective.org`, inbound `contact@creativectrlcollective.org`.

## Pickup (required)

Before creating or editing files:

1. Read [`.agents/HANDOFF.md`](.agents/HANDOFF.md) — canonical checkpoint. It wins over chat history and harness-private memory.
2. Read the current slice on [`.agents/ROADMAP.md`](.agents/ROADMAP.md).
3. Read the ordered **Read-first** list in HANDOFF.
4. Restate: slice, Next, Do not. Then wait or execute.

Antigravity: `/start` on a cold session, `/checkpoint` mid-work, `/handoff` before switching agents. Same procedure if those slash commands are unavailable.

## Isolation

- This repo is the Collective. Do not use ArtSpace Supabase (`baixjfnlxcupgnzrmbno`), `artspace.creativectrl.org`, or ArtSpace buckets/OAuth.
- Never `supabase db reset`, `db push --force`, or destructive SQL against the remote project.
- Never commit `.env.local` or write secrets into markdown.
- Do not expose a Gemini (or any LLM) key as `VITE_*`. The public site does not call Gemini.
- Ticketing is an external `ticket_link`. Do not scaffold Stripe tickets unless asked.

## Checkpoint

`HANDOFF.md` is the only shared memory. Keep it under ~4 KB. Overwrite in place. One **Next**. Durable choices go in [`.agents/DECISIONS.md`](.agents/DECISIONS.md). Session narrative goes in `.agents/sessions/`. Grok `/remember` and Gemini tmp memory are private — if another agent needs a fact, write it here.

## Product brief

[`Plan.md`](Plan.md) is the blueprint. Schema in it is truncated; partner-portal tables are missing. Do not treat it as a complete migration.

## Design

Minimalist dark mode, grotesque display type, monospace accents, grain/glow, high-impact media grids.
