# Handoff — Creative CTRL Collective

**Updated:** 2026-08-21T19:20:00Z  
**Agent:** Antigravity  
**Slice:** Submissions, Contact & Publish-Notify → complete; current target is **9**  
**Proof:** `npx tsc -b` clean; contact submissions save + notify; blog publish supports optional subscriber notifications.
**Repo:** https://github.com/creativectrl-collab/CreativeCtrlCollective (`dev`). Push as `creativectrl-collab`.

---

## Done — do not undo

- Standalone dedicated Supabase project `xzfdmrjxwkcxdcbqvwbd` active.
- Storage RLS policies defined on `public-media` bucket to allow select and insert.
- Local media files uploaded to Supabase Storage and build URLs converted to CDN.
- Notion-style custom block editor (`BlockEditor.tsx`) using `@tiptap/react` with slash commands (`/`), bubble formatting, embeds, text alignment, image floating layouts, and custom interactive node widgets (Audio Players, Custom Buttons, Social Link Icons, Multi-Image Galleries).
- Restructured Admin Dashboard: Home view displays live database analytics and acts as launcher for standalone builder managers (Events, Blog, Broadcasts).
- Implemented CORS-compliant `send-campaign` Edge Function (Deno/TypeScript) integrating Resend API for CASL compliance.
- Fixed infinite recursion RLS policy error on `team_profiles`.
- Implemented Visual Gallery & Event Archive: created `gallery_photos` database table, constructed `/gallery` filter/masonry roll with fullscreen swipe lightbox, created homepage "Artifact Frame", and integrated a multi-image admin editor batch uploader.
- Admin signup/reset now send `emailRedirectTo` from the current origin (`/admin` and `/admin/profile`).
- Duplicate admin signup detects an existing auth account, switches to login, and offers password reset.
- Admin TOTP: `/admin/mfa-setup` enroll, `/admin/mfa` challenge, AdminGuard requires `aal2`, restrictive write RLS on founder tables.
- **Slice 7 (Submissions & Contact):** Wired contact form submissions to save to `community_members` table and trigger a Resend email notification directly to `contact@creativectrlcollective.org` via a new Edge Function (`notify-contact`). Cleaned up `mailto:` fallback navigation.
- **Publish & Notify Automation:** Implemented a state-controlled checkbox in the Blog admin manager (`Blog.tsx`) to notify subscribers. Added `notify-post` Edge Function to fetch post data and dispatch batch email notifications via Resend API when publishing.

## Next (exactly one primary task)

**Slice 9 — Launch Checklist & Domain Audit.** Complete domain review, verify production redirects, clean up design tokens (sink page), and finalize build configurations.

## Blocked

- Auth Site URL is still unset (defaults to localhost). Confirm emails will keep sending teammates to localhost until it is set in the dashboard. See DECISIONS 2026-08-21.

## Do not

- ArtSpace project. Remote db reset. Commit `.env.local`. `VITE_` LLM keys. First-party ticketing. Restyle off-tokens.

## Files touched

- `src/components/admin/BlockEditor.tsx`
- `src/pages/admin/dashboard/{Index.tsx,Layout.tsx,Blog.tsx,Broadcasts.tsx}`
- `src/pages/PostPage.tsx`
- `src/App.tsx`
- `supabase/functions/send-campaign/index.ts`
- `supabase/functions/notify-contact/index.ts`
- `supabase/functions/notify-post/index.ts`
- `src/components/ContactForm.tsx`
- `.gitignore`
- `.agents/HANDOFF.md`
- `.agents/ROADMAP.md`
- `.agents/DECISIONS.md`
- `src/pages/admin/Login.tsx`
- `src/pages/admin/ResetPassword.tsx`
- `src/lib/supabase.ts`
- `src/lib/adminAuth.ts`
- `src/pages/admin/MfaSetup.tsx`
- `src/pages/admin/MfaChallenge.tsx`
- `src/components/admin/AdminGuard.tsx`
- `src/components/Layout.tsx`
- `package.json`, `package-lock.json`
