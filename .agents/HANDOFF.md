# Handoff — Creative CTRL Collective

**Updated:** 2026-08-20T14:35Z  
**Agent:** grok  
**Slice:** SEO foundation → complete; current target is **3**  
**Proof:** `npm run lint` 0 issues. `npm run build` wrote `dist/robots.txt`, `dist/sitemap.xml`, `dist/og-banner.png` (1200×630), `dist/logo.png`. Sitemap currently 4 static URLs (0 published `posts`).  
**Repo:** https://github.com/creativectrl-collab/CreativeCtrlCollective (`dev`). Push as `creativectrl-collab`.

---

## Done — do not undo

- Public pages (`/`, `/events`, `/team`) on Collective tokens. Title **Creative CTRL Collective**.
- SEO: `Seo` wrapper + static tags in `index.html` (title template, description, canonical, OG, Twitter, Organization JSON-LD).
- OG fallback: `/og-banner.png` 1200×630. Schema logo: `/logo.png`.
- Post routes: `/updates`, `/posts/:slug`. Event JSON-LD if `posts.event_date` is set, else BlogPosting.
- `public/robots.txt` allows indexing, disallows `/tokens`, points at sitemap.
- `npm run sitemap` / `npm run build` fetch published `public.posts` slugs into `public/sitemap.xml`.
- Contact is still mailto until Slice 7.

## Next (exactly one primary task)

**Slice 3 — Schema completion** on `xzfdmrjxwkcxdcbqvwbd`. Finish truncated Plan.md RLS; portal tables + buckets. No remote `db reset`. Public pages stay static until wired. `posts` already exists (empty).

## Blocked

- Slice 3 needs Supabase CLI / dashboard write access.
- Social crawlers (WhatsApp, iMessage, X) read `index.html` only. Homepage OG works; `/posts/:slug` OG needs prerender or an edge inject later.

## Do not

- ArtSpace project. Remote db reset. Commit `.env.local`. `VITE_` LLM keys. First-party ticketing. Restyle off-tokens.

## Files touched

- `src/components/Seo.tsx`, `src/seo/defaults.ts`, `src/seo/postJsonLd.ts`, `src/lib/posts.ts`
- `src/pages/{PostPage,UpdatesPage,EventsPage,TeamPage}.tsx`, `src/App.tsx`, `src/components/Layout.tsx`
- `index.html`, `public/{robots.txt,sitemap.xml,og-banner.png,logo.png}`
- `scripts/generate-sitemap.mjs`, `scripts/og-banner.html`, `package.json`, `netlify.toml`

## Read-first (ordered)

1. This file
2. `src/seo/defaults.ts`
3. `src/content/site.ts`
4. `.agents/ROADMAP.md` (Slice 3)
