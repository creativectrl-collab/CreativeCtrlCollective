# CREATIVE CTRL COLLECTIVE — WEB PLATFORM PROJECT PLAN & TECHNICAL BLUEPRINT

**Prepared For:** Creative CTRL Collective  
**Target Stack:** Vite + React, Tailwind CSS, Supabase, Netlify  
**Email / Inbound:** contact@creativectrlcollective.org  
**Date:** August 19, 2026  

---

## 1. Database Architecture & Strategy Recommendation

**Recommendation:** Create a dedicated, standalone project on Supabase.

* **Legal & Operational Separation:** Artspace remains an asset of the Sole Proprietorship, whereas the Collective is a multi-partner entity. Keeping tables, storage buckets, API keys, and environment variables completely isolated prevents co-mingling records and ensures clear ownership trails.
* **Authentication Scoping:** Supabase auth users, email templates, and OAuth redirect URLs operate at the project level, allowing Google OAuth redirects mapped cleanly to `creativectrlcollective.org`.
* **Cost Optimization:** Develop on a free-tier Supabase project ($0) during Antigravity development, then attach it to the Pro Organization ($10/month compute) upon production launch.

---

## 2. Executive Summary & Scope

* **Product:** Creative CTRL Collective Digital Hub & Partner Portal.
* **Audience:** Founding partners, community collaborators, showcase attendees, brand sponsors, and grant evaluators.
* **Core Mission:** High-impact showcase platform for collective initiatives, live event ticketing/promotions (e.g., Amapiano Nights), artist curation, and a gated partner workspace for internal project tracking.
* **Deployment:** CI/CD on Netlify, domain DNS linked to Google Workspace, and backend on Supabase.

---

## 3. Design System & UI/UX Vibe

* **Aesthetic:** Minimalist dark mode with bold grotesque typography, monospace accents, subtle ambient glows/grain, and high-impact media grids.
* **Core Views:**
  * **Hero / Manifesto:** Dynamic video/audio background introducing collective vision and current initiatives.
  * **Initiatives & Showcase:** Interactive archive of past and upcoming events, digital drops, and recordings.
  * **Team / Roster Grid:** Curatorial bios of founding partners and resident creatives.
  * **Submissions & Contact:** Inbound portal for artists and sponsors routing notifications directly to `contact@creativectrlcollective.org`.
  * **Partner Portal (Gated):** Protected space for partners to review open-book project ledgers, download governance docs (MOU/BIN), and review production schedules.

---

## 4. Database Schema Blueprint (PostgreSQL / Supabase)

```sql
-- 1. Profiles & Team Members
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  is_founding_partner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Initiatives & Event Production
CREATE TABLE public.initiatives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  cover_image_url TEXT,
  event_date TIMESTAMPTZ,
  venue_location TEXT,
  ticket_link TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Inquiries & Community Submissions
CREATE TABLE public.inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  inquiry_type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for published initiatives" 
  ON public.initiatives FOR SELECT USING (is_published = true);

CREATE POLICY "Allow public inquiry submissions" 
  ON public.inquiries FOR INSERT WITH CHECK (true);