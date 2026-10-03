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
- **Thumbnail Sibling Rule:** New public-media uploads write two files before anything is stored or shown: master `{dir}/{base}.webp` (max edge 2048, WebP quality 0.85) and sibling `{dir}/{base}-thumb.webp` (max edge 480, WebP quality 0.75). Store only the master URL. The UI loads the thumb sibling derived from that master. Gallery zoom-to-view is the only load of the original master, and that zoom src is the stored master URL with no resize, format conversion, or Supabase `/storage/v1/render/image/` transform. Do not raw-upload from Blog, BlockEditor, Broadcasts, event flyers, or `scripts/upload-media.js`. Do not re-upload or rename existing objects.

Slash commands in Antigravity: `/start`, `/checkpoint`, `/handoff`.

This is **not** ArtSpace. Dedicated Supabase `xzfdmrjxwkcxdcbqvwbd`. No `VITE_GEMINI_API_KEY`. No remote `db reset`. No first-party ticketing unless asked. No secrets in markdown.
