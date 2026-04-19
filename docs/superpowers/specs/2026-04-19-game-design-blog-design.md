# Game Design Blog — Design Spec
**Date:** 2026-04-19  
**Status:** Approved

---

## Overview

Personal blog về game design bằng tiếng Việt. Content gồm: game design theory & mechanics, GDD & tài liệu thiết kế, review & phân tích game. Target audience: người trong ngành, game designer enthusiast.

---

## Architecture

**Approach:** Next.js 15 App Router + Sanity v3 CMS + Vercel deployment (Hybrid ISR + API Routes)

```
Sanity Studio → GROQ queries → Next.js App Router → Vercel CDN
```

**Rendering strategy:**
- Blog pages: ISR (revalidate 60s + on-demand webhook)
- API routes: Dynamic (search, newsletter, revalidation)
- Static: About page, 404

**API Routes:**
- `POST /api/search` — GROQ fulltext search
- `POST /api/subscribe` — Newsletter via Resend
- `POST /api/revalidate` — Sanity webhook trigger

---

## Pages & Routes

| Route | Description | Rendering |
|---|---|---|
| `/` | Home — featured post + latest grid | ISR 60s |
| `/bai-viet/[slug]` | Single post | ISR on-demand |
| `/chu-de/[slug]` | Category listing | ISR 60s |
| `/ve-toi` | About page | Static |

---

## Data Models (Sanity)

**post**
- `title` string
- `slug` slug
- `excerpt` text
- `content` Portable Text (blocks)
- `coverImage` image (Sanity asset)
- `publishedAt` datetime
- `categories[]` → reference to `category`
- `tags[]` string array
- `readingTime` number (computed)

**category**
- `title` string
- `slug` slug
- `description` text

**author**
- `name` string
- `bio` text
- `avatar` image

---

## UI Design

**Color palette:**
```
Background:  #0f0f0f / #1a1a1a (cards)
Text:        #e5e5e5 / #a3a3a3 (muted)
Accent:      #f59e0b (amber) → hover #d97706
Tag bg:      #292929, border amber
```

**Typography:** Inter (body) + Playfair Display / Fraunces (headings)

**Layout — Home:**
```
Header: Logo | Nav (Bài Viết, Chủ Đề, Về Tôi) | Search icon
Hero: Featured post — cover full-width, title 3xl bold, excerpt
Latest: 3-column grid of PostCards
Newsletter: Inline CTA banner
Footer
```

**Layout — Post:**
```
Header
Cover image (full-width)
Post header: Category badge | Title | Date | Read time
Two-column: Content 70% | Sidebar 30% (TOC sticky + Related)
Reading progress bar (fixed top)
Giscus comments (bottom)
```

---

## Features

| Feature | Implementation |
|---|---|
| Search | `/api/search` + GROQ `match`, debounce 300ms |
| Newsletter | Resend API |
| Comments | Giscus (GitHub Discussions, client-side) |
| Reading time | Word count computed at build |
| Reading progress | IntersectionObserver, fixed bar |
| Table of contents | Parse headings từ Portable Text |
| Dark mode | next-themes, default dark |
| SEO | generateMetadata, OG image auto |
| Sitemap | app/sitemap.ts |

---

## Tech Stack

```
next@15                  App Router, ISR, API routes
sanity@3                 CMS, Portable Text
next-sanity              Live preview, webhook revalidation
@sanity/image-url        Image optimization
resend                   Newsletter emails
tailwindcss@4            Styling
shadcn/ui                Base components
lucide-react             Icons
giscus                   Comments
next-themes              Dark mode
```

---

## Folder Structure

```
/app
  layout.tsx
  page.tsx                         ← Home
  /bai-viet/[slug]/page.tsx
  /chu-de/[slug]/page.tsx
  /ve-toi/page.tsx
  /api/search/route.ts
  /api/subscribe/route.ts
  /api/revalidate/route.ts
/components
  /ui/                             ← shadcn components
  /blog/
    post-card.tsx
    post-header.tsx
    table-of-contents.tsx
    reading-progress.tsx
    giscus-comments.tsx
    newsletter-form.tsx
/sanity
  /schemas/
    post.ts
    category.ts
    author.ts
  client.ts
  queries.ts
  image.ts
/lib
  utils.ts
  reading-time.ts
```

---

## Deployment

- **Frontend:** Vercel (free tier)
- **CMS:** Sanity Cloud (free tier — 3 users, 2 datasets)
- **Email:** Resend (free tier — 3,000 emails/month)
- **Comments:** Giscus (GitHub repo public)
- **Domain:** Tùy Big Boss

---

## Out of Scope (v1)

- Auth / login system
- Premium/paid content
- Multi-author
- Multilingual
