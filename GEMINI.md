# Creative CTRL Collective — Gemini / Antigravity

Follow [`AGENTS.md`](AGENTS.md). Canonical checkpoint is [`.agents/HANDOFF.md`](.agents/HANDOFF.md).

Before any edit:

1. Read `.agents/HANDOFF.md` (wins over this chat, Antigravity brain files, and Gemini tmp memory).
2. Read the current slice on `.agents/ROADMAP.md`.
3. Read HANDOFF **Read-first**.
4. Restate slice, Next, Do not.

## Image Management Standard

- **Static Assets (Git-Managed):** Use for unchanging UI elements (logo, boilerplate icons, core site images). Store in `public/`.
- **Dynamic Content (Supabase-Managed):** Use for user-generated content, blog post covers, and event media. Upload to Supabase `public-media` bucket and store the public URL in the database.

Slash commands in Antigravity: `/start`, `/checkpoint`, `/handoff`.

This is **not** ArtSpace. Dedicated Supabase `xzfdmrjxwkcxdcbqvwbd`. No `VITE_GEMINI_API_KEY`. No remote `db reset`. No first-party ticketing unless asked. No secrets in markdown.
