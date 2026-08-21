# Decisions — Creative CTRL Collective

Append-only. Each entry: date, decision, why, rejected alternative.

---

## 2026-08-19 — Dedicated Supabase project

**Decision:** Collective uses its own Supabase project (`xzfdmrjxwkcxdcbqvwbd`).  
**Why:** ArtSpace is a sole-prop asset; the Collective is multi-partner. Shared tables, buckets, keys, or OAuth clients mix ownership.  
**Rejected:** Reuse ArtSpace project `baixjfnlxcupgnzrmbno`.

## 2026-08-19 — External ticketing

**Decision:** Events store an external `ticket_link`.  
**Why:** Plan.md models Amapiano Nights (and similar) as promotions that sell off-platform.  
**Rejected:** First-party Stripe/Paystack tickets in v1.

## 2026-08-19 — Public inquiries, gated portal

**Decision:** Anonymous INSERT on `inquiries`. Partner portal is authenticated.  
**Why:** Artist/sponsor inbound should not require an account. Ledgers, MOU/BIN, and schedules are partner-only.  
**Rejected:** Account-gated contact form; public ledger.

## 2026-08-19 — Netlify + Google Workspace inbound

**Decision:** CI/CD on Netlify. Inbound mail `contact@creativectrlcollective.org` via Google Workspace.  
**Why:** Named in Plan.md. Email implementation (Edge Function vs Netlify vs Resend) is still open — record it here when chosen.  
**Rejected:** None yet.

## 2026-08-20 — Repo-canonical HANDOFF

**Decision:** Shared agent memory is `.agents/HANDOFF.md` (plus `DECISIONS.md` / `ROADMAP.md`), loaded via `AGENTS.md` (Grok + Antigravity) and `GEMINI.md` (Gemini CLI + Antigravity).  
**Why:** `~/.grok/memory/`, Gemini tmp memory, and Antigravity brain files are harness-private. ArtSpace already proved a repo HANDOFF works; Grok does not auto-load `GEMINI.md`, so this repo also has `AGENTS.md`.  
**Rejected:** Cline 6-file `memory-bank/` (empty files waste context on a greenfield site). Rejected using Grok `/remember` or Gemini tmp `MEMORY.md` as the cross-agent store.

## 2026-08-20 — No client Gemini key

**Decision:** The public site does not call Gemini. Do not keep an LLM key under `VITE_*`.  
**Why:** Vite prefixes are shipped to the browser. Plan.md does not include an in-app model.  
**Rejected:** `VITE_GEMINI_API_KEY` in `.env.local` as a client env var.

## 2026-08-20 — Partner portal schema is not in Plan.md

**Decision:** Slice 3 must add `governance_documents`, `project_ledgers`, and `production_schedules` (names may vary) plus storage buckets. Plan.md SQL is truncated and only covers `profiles`, `initiatives`, `inquiries`.  
**Why:** The UX section requires those portal surfaces; implementing Plan.md SQL as-is would ship a portal with nowhere to store data.  
**Rejected:** Migrating Plan.md SQL verbatim.

## 2026-08-20 — Collective visual language

**Decision:** Tokens live in `src/index.css` (`@theme`). Display/body is Bricolage Grotesque; kickers/data are IBM Plex Mono. Palette: `void` `#08080c`, `paper` `#f1eee6`, `signal` `#d4ff3f`, `alert` `#ff4d8d`, plus `surface` / `raised` / `line` / `mute`. Grain + ambient glow are CSS utilities consumed via `SiteChrome`.  
**Why:** Plan.md asks for dark grotesque, mono accents, grain/glow, and media grids. Distinct from ArtSpace Clash Grotesk so the Collective is a sibling brand, not a clone.  
**Rejected:** Reusing ArtSpace Clash Grotesk / `#1a1a1a` / blue accent. Rejected one-off colors in the Hero.

## 2026-08-20 — Admin Dashboard Restructure & Standalone Builders

**Decision:** The admin view `/admin/dashboard` is dedicated to statistics/metrics. Creating posts, events, and broadcasts is moved to standalone builder routes to feel modular and wordpress-like.
**Why:** Improves usability, matches the requested layout, and separates content writing from dashboard monitoring.
**Rejected:** Keeping creators and lists inline under navigation tabs.

## 2026-08-20 — Custom Tiptap Editor & Block rendering

**Decision:** Replace the default Novel wrapper with a custom `@tiptap/react` BlockEditor and render structured block JSON on the client-side `PostPage.tsx`.
**Why:** Provides complete layout control over custom highlight styling (`#d4ff3f`), image uploads, embeds, and blockquotes without bundle conflicts.
**Rejected:** Using Novel's built-in styles and standard markdown plaintext rendering.

## 2026-08-21 — Visual Gallery & Timeline Archive

**Decision:** Created the `gallery_photos` table, implemented the `/gallery` tag-less timeline navigation grouped by year, and integrated a multi-image editor batch uploader inside the events admin panel.
**Why:** Grouping by year instead of event title keeps the tag navigation row compact and future-proof. Having the uploader inline inside the event editor allows complete catalog management of historical event rolls.
**Rejected:** Displaying all event titles as tag selectors.
