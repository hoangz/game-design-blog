# Game Design Blog — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal Vietnamese game design blog with Next.js 15, Sanity CMS, dark mode, search, newsletter, and Giscus comments.

**Architecture:** Next.js 15 App Router with Hybrid ISR — blog pages use ISR (revalidated via Sanity webhook), search and newsletter use dynamic API routes. Sanity Studio manages all content.

**Tech Stack:** Next.js 15, TypeScript, Sanity v3, Tailwind CSS v4, shadcn/ui, next-themes, Resend, Giscus, Vitest

**Working directory:** `/Users/lap60412/MyGame`

**Spec:** `/Users/lap60412/MyGame/docs/superpowers/specs/2026-04-19-game-design-blog-design.md`

---

## File Map

```
/Users/lap60412/MyGame/
├── app/
│   ├── layout.tsx                          ← Root layout, fonts, ThemeProvider
│   ├── page.tsx                            ← Home: featured hero + post grid
│   ├── globals.css                         ← Tailwind v4 + custom dark theme
│   ├── bai-viet/[slug]/page.tsx            ← Single post (ISR on-demand)
│   ├── chu-de/[slug]/page.tsx              ← Category listing (ISR 60s)
│   ├── ve-toi/page.tsx                     ← About page (static)
│   ├── sitemap.ts                          ← Auto sitemap
│   └── api/
│       ├── search/route.ts                 ← GROQ fulltext search
│       ├── subscribe/route.ts              ← Newsletter via Resend
│       └── revalidate/route.ts             ← Sanity webhook trigger
├── components/
│   ├── layout/
│   │   ├── header.tsx                      ← Nav + dark mode toggle + search icon
│   │   ├── footer.tsx                      ← Footer links
│   │   └── theme-provider.tsx              ← next-themes wrapper
│   ├── blog/
│   │   ├── post-card.tsx                   ← Card for grid (image + title + meta)
│   │   ├── post-header.tsx                 ← Post page top section
│   │   ├── portable-text-renderer.tsx      ← Sanity Portable Text → styled HTML
│   │   ├── table-of-contents.tsx           ← Sticky TOC from headings
│   │   ├── reading-progress.tsx            ← Fixed top progress bar
│   │   └── giscus-comments.tsx             ← Giscus embed (client component)
│   └── ui/
│       ├── newsletter-form.tsx             ← Subscribe form
│       └── search-bar.tsx                  ← Search input with results dropdown
├── sanity/
│   ├── client.ts                           ← createClient config
│   ├── queries.ts                          ← All GROQ queries
│   ├── image.ts                            ← imageUrlBuilder helper
│   └── schemas/
│       ├── index.ts                        ← Schema registry
│       ├── post.ts                         ← Post schema
│       ├── category.ts                     ← Category schema
│       └── author.ts                       ← Author schema
├── lib/
│   ├── utils.ts                            ← cn() utility
│   └── reading-time.ts                     ← Word count → minutes
├── __tests__/
│   ├── reading-time.test.ts
│   └── api/search.test.ts
├── sanity.config.ts                        ← Sanity Studio config
├── sanity.cli.ts                           ← Sanity CLI config
├── next.config.ts                          ← next config + Sanity image domains
├── vitest.config.ts                        ← Vitest config
└── .env.local                              ← Env vars (gitignored)
```

---

## Task 1: Project Initialization

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `app/globals.css`
- Create: `vitest.config.ts`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /Users/lap60412/MyGame
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --yes
```

Expected output: `✓ Ready in Xs`

- [ ] **Step 2: Install all dependencies**

```bash
npm install sanity@^3 next-sanity @sanity/image-url @sanity/vision \
  next-themes resend \
  @portabletext/react \
  lucide-react \
  clsx tailwind-merge
npm install --save-dev vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom @types/node
npx shadcn@latest init --defaults
```

When prompted by shadcn: choose defaults (dark theme base, slate color, CSS variables yes).

- [ ] **Step 3: Configure next.config.ts**

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 4: Configure vitest.config.ts**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

- [ ] **Step 5: Create vitest.setup.ts**

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Add test script to package.json**

In `package.json`, add to `scripts`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "chore: initialize Next.js 15 project with dependencies"
```

---

## Task 2: Utility Functions

**Files:**
- Create: `lib/utils.ts`
- Create: `lib/reading-time.ts`
- Create: `__tests__/reading-time.test.ts`

- [ ] **Step 1: Write failing test for reading-time**

```typescript
// __tests__/reading-time.test.ts
import { describe, it, expect } from 'vitest'
import { calculateReadingTime } from '@/lib/reading-time'

describe('calculateReadingTime', () => {
  it('returns 1 for content under 200 words', () => {
    const content = Array(100).fill('word').join(' ')
    expect(calculateReadingTime(content)).toBe(1)
  })

  it('returns 2 for 400-word content', () => {
    const content = Array(400).fill('word').join(' ')
    expect(calculateReadingTime(content)).toBe(2)
  })

  it('returns 1 for empty string', () => {
    expect(calculateReadingTime('')).toBe(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- reading-time
```

Expected: FAIL — `Cannot find module '@/lib/reading-time'`

- [ ] **Step 3: Implement lib/reading-time.ts**

```typescript
// lib/reading-time.ts
const WORDS_PER_MINUTE = 200

export function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}
```

- [ ] **Step 4: Implement lib/utils.ts**

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- reading-time
```

Expected: PASS — 3 tests passing

- [ ] **Step 6: Commit**

```bash
git add lib/ __tests__/reading-time.test.ts vitest.config.ts vitest.setup.ts
git commit -m "feat: add reading-time and utils helpers"
```

---

## Task 3: Sanity Schemas & Client

**Files:**
- Create: `sanity/schemas/post.ts`
- Create: `sanity/schemas/category.ts`
- Create: `sanity/schemas/author.ts`
- Create: `sanity/schemas/index.ts`
- Create: `sanity/client.ts`
- Create: `sanity/queries.ts`
- Create: `sanity/image.ts`
- Create: `sanity.config.ts`
- Create: `sanity.cli.ts`

- [ ] **Step 1: Create Sanity project**

```bash
npx sanity@latest init --no-typescript
```

When prompted:
- Create new project → yes
- Project name: `game-design-blog`
- Dataset: `production`
- Project template: Clean project with no predefined schemas

This generates `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET`. Note them.

- [ ] **Step 2: Create post schema**

```typescript
// sanity/schemas/post.ts
import { defineType, defineField } from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'Bài Viết',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tiêu đề',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Tóm tắt',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'coverImage',
      title: 'Ảnh bìa',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'publishedAt',
      title: 'Ngày đăng',
      type: 'datetime',
    }),
    defineField({
      name: 'categories',
      title: 'Chủ đề',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'content',
      title: 'Nội dung',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
        { type: 'code' },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', media: 'coverImage' },
  },
})
```

- [ ] **Step 3: Create category schema**

```typescript
// sanity/schemas/category.ts
import { defineType, defineField } from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Chủ Đề',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Tên', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'description', title: 'Mô tả', type: 'text', rows: 2 }),
  ],
})
```

- [ ] **Step 4: Create author schema**

```typescript
// sanity/schemas/author.ts
import { defineType, defineField } from 'sanity'

export const author = defineType({
  name: 'author',
  title: 'Tác Giả',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Tên', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'bio', title: 'Giới thiệu', type: 'text', rows: 4 }),
    defineField({ name: 'avatar', title: 'Avatar', type: 'image', options: { hotspot: true } }),
  ],
})
```

- [ ] **Step 5: Create schema registry**

```typescript
// sanity/schemas/index.ts
import { post } from './post'
import { category } from './category'
import { author } from './author'

export const schemaTypes = [post, category, author]
```

- [ ] **Step 6: Create Sanity client**

```typescript
// sanity/client.ts
import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})
```

- [ ] **Step 7: Create GROQ queries**

```typescript
// sanity/queries.ts
import { groq } from 'next-sanity'

const postFields = groq`
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  publishedAt,
  tags,
  "categories": categories[]->{ title, "slug": slug.current }
`

export const allPostsQuery = groq`
  *[_type == "post" && defined(publishedAt) && !(_id in path("drafts.**"))]
  | order(publishedAt desc) { ${postFields} }
`

export const featuredPostQuery = groq`
  *[_type == "post" && defined(publishedAt) && !(_id in path("drafts.**"))]
  | order(publishedAt desc)[0] { ${postFields} }
`

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    ${postFields},
    content
  }
`

export const postsByCategoryQuery = groq`
  *[_type == "post" && $slug in categories[]->slug.current
    && defined(publishedAt) && !(_id in path("drafts.**"))]
  | order(publishedAt desc) { ${postFields} }
`

export const categoryBySlugQuery = groq`
  *[_type == "category" && slug.current == $slug][0] {
    title, "slug": slug.current, description
  }
`

export const allCategoriesQuery = groq`
  *[_type == "category"] { title, "slug": slug.current }
`

export const searchPostsQuery = groq`
  *[_type == "post" && defined(publishedAt) && !(_id in path("drafts.**"))
    && (title match $query || excerpt match $query)]
  | order(publishedAt desc)[0...10] {
    title, "slug": slug.current, excerpt, publishedAt,
    "categories": categories[]->{ title, "slug": slug.current }
  }
`

export const allPostSlugsQuery = groq`
  *[_type == "post" && defined(slug.current) && defined(publishedAt)] {
    "slug": slug.current, publishedAt
  }
`
```

- [ ] **Step 8: Create image URL builder**

```typescript
// sanity/image.ts
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { client } from './client'

const builder = imageUrlBuilder(client)

export function urlForImage(source: SanityImageSource) {
  return builder.image(source)
}
```

- [ ] **Step 9: Create sanity.config.ts**

```typescript
// sanity.config.ts
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from '@/sanity/schemas'

export default defineConfig({
  basePath: '/studio',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
})
```

- [ ] **Step 10: Create .env.local**

```bash
# .env.local
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_read_token_here
SANITY_WEBHOOK_SECRET=your_webhook_secret_here
RESEND_API_KEY=your_resend_key_here
NEXT_PUBLIC_GISCUS_REPO=yourusername/your-repo
NEXT_PUBLIC_GISCUS_REPO_ID=your_repo_id
NEXT_PUBLIC_GISCUS_CATEGORY=Announcements
NEXT_PUBLIC_GISCUS_CATEGORY_ID=your_category_id
```

Fill in values from Sanity dashboard (Settings → API).

- [ ] **Step 11: Commit**

```bash
git add sanity/ sanity.config.ts sanity.cli.ts .env.local.example
git commit -m "feat: add Sanity schemas, client, and GROQ queries"
```

---

## Task 4: Global Styles & Root Layout

**Files:**
- Modify: `app/globals.css`
- Create: `components/layout/theme-provider.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update globals.css with dark theme**

```css
/* app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-inter);
  --font-display: var(--font-fraunces);
}

:root {
  --background: #0f0f0f;
  --foreground: #e5e5e5;
  --card: #1a1a1a;
  --card-foreground: #e5e5e5;
  --muted: #292929;
  --muted-foreground: #a3a3a3;
  --accent: #f59e0b;
  --accent-hover: #d97706;
  --border: #2a2a2a;
  --radius: 0.5rem;
}

body {
  background-color: var(--background);
  color: var(--foreground);
}

/* Prose styles for blog content */
.prose {
  color: var(--foreground);
  max-width: 65ch;
}

.prose h1, .prose h2, .prose h3, .prose h4 {
  color: #ffffff;
  font-family: var(--font-display);
  font-weight: 700;
  scroll-margin-top: 5rem;
}

.prose h2 { font-size: 1.5rem; margin-top: 2rem; margin-bottom: 1rem; }
.prose h3 { font-size: 1.25rem; margin-top: 1.5rem; margin-bottom: 0.75rem; }

.prose p { line-height: 1.8; margin-bottom: 1.25rem; color: #d4d4d4; }

.prose a { color: var(--accent); text-decoration: underline; }
.prose a:hover { color: var(--accent-hover); }

.prose code {
  background-color: var(--muted);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
  color: #fcd34d;
}

.prose pre {
  background-color: #111111;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1.25rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.prose blockquote {
  border-left: 3px solid var(--accent);
  padding-left: 1rem;
  color: var(--muted-foreground);
  font-style: italic;
  margin: 1.5rem 0;
}

.prose img {
  border-radius: 0.5rem;
  margin: 1.5rem 0;
  width: 100%;
}

.prose ul, .prose ol {
  padding-left: 1.5rem;
  margin-bottom: 1.25rem;
}

.prose li { margin-bottom: 0.5rem; color: #d4d4d4; }
```

- [ ] **Step 2: Create ThemeProvider**

```typescript
// components/layout/theme-provider.tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

- [ ] **Step 3: Update app/layout.tsx**

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-inter' })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', weight: ['700', '900'] })

export const metadata: Metadata = {
  title: { default: 'Game Design Blog', template: '%s | Game Design Blog' },
  description: 'Blog cá nhân về game design — thiết kế cơ chế, GDD, và phân tích game.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${fraunces.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx components/layout/theme-provider.tsx
git commit -m "feat: add global dark theme styles and root layout"
```

---

## Task 5: Header Component

**Files:**
- Create: `components/layout/header.tsx`

- [ ] **Step 1: Create header.tsx**

```typescript
// components/layout/header.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/bai-viet', label: 'Bài Viết' },
  { href: '/chu-de', label: 'Chủ Đề' },
  { href: '/ve-toi', label: 'Về Tôi' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4 flex h-14 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-xl font-bold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
        >
          GD<span className="text-white">Blog</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Tìm kiếm"
            className="text-[var(--muted-foreground)] hover:text-white transition-colors"
          >
            <Search size={18} />
          </button>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-[var(--muted-foreground)] hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--background)] px-4 py-3 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--muted-foreground)] hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* Search overlay — populated in Task 16 */}
      {searchOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--background)] px-4 py-3">
          <input
            autoFocus
            placeholder="Tìm bài viết..."
            className="w-full bg-[var(--muted)] text-sm px-3 py-2 rounded-md outline-none text-white placeholder:text-[var(--muted-foreground)]"
            onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
          />
        </div>
      )}
    </header>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/header.tsx
git commit -m "feat: add sticky header with mobile nav"
```

---

## Task 6: Footer Component

**Files:**
- Create: `components/layout/footer.tsx`

- [ ] **Step 1: Create footer.tsx**

```typescript
// components/layout/footer.tsx
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-16">
      <div className="mx-auto max-w-5xl px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-[var(--muted-foreground)]">
          © {new Date().getFullYear()} Game Design Blog
        </p>
        <nav className="flex gap-5">
          {[
            { href: '/bai-viet', label: 'Bài Viết' },
            { href: '/chu-de', label: 'Chủ Đề' },
            { href: '/ve-toi', label: 'Về Tôi' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/footer.tsx
git commit -m "feat: add footer"
```

---

## Task 7: PostCard Component

**Files:**
- Create: `components/blog/post-card.tsx`

- [ ] **Step 1: Create post-card.tsx**

```typescript
// components/blog/post-card.tsx
import Link from 'next/link'
import Image from 'next/image'
import { urlForImage } from '@/sanity/image'
import { formatDate } from '@/lib/utils'
import { calculateReadingTime } from '@/lib/reading-time'

interface PostCardProps {
  title: string
  slug: string
  excerpt?: string
  coverImage?: { asset: { _ref: string } }
  publishedAt?: string
  categories?: { title: string; slug: string }[]
  tags?: string[]
  compact?: boolean
}

export function PostCard({ title, slug, excerpt, coverImage, publishedAt, categories, compact }: PostCardProps) {
  const imageUrl = coverImage ? urlForImage(coverImage).width(800).height(450).url() : null

  return (
    <Link href={`/bai-viet/${slug}`} className="group block">
      <article className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--accent)]/40 transition-all duration-300">
        {/* Cover image */}
        {imageUrl && (
          <div className={`relative overflow-hidden ${compact ? 'h-40' : 'h-52'}`}>
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        )}
        {!imageUrl && (
          <div className={`bg-gradient-to-br from-[var(--muted)] to-[var(--border)] ${compact ? 'h-40' : 'h-52'} flex items-center justify-center`}>
            <span className="text-[var(--muted-foreground)] text-4xl font-display font-bold opacity-20">GD</span>
          </div>
        )}

        <div className="p-5">
          {/* Category badge */}
          {categories?.[0] && (
            <span className="inline-block text-xs font-medium text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-full mb-2">
              {categories[0].title}
            </span>
          )}

          {/* Title */}
          <h3 className={`font-display font-bold text-white group-hover:text-[var(--accent)] transition-colors leading-snug ${compact ? 'text-base' : 'text-lg'} mb-2`}>
            {title}
          </h3>

          {/* Excerpt */}
          {!compact && excerpt && (
            <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-3">{excerpt}</p>
          )}

          {/* Meta */}
          {publishedAt && (
            <p className="text-xs text-[var(--muted-foreground)]">{formatDate(publishedAt)}</p>
          )}
        </div>
      </article>
    </Link>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/blog/post-card.tsx
git commit -m "feat: add PostCard component"
```

---

## Task 8: Home Page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Implement home page**

```typescript
// app/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/client'
import { allPostsQuery, featuredPostQuery } from '@/sanity/queries'
import { PostCard } from '@/components/blog/post-card'
import { NewsletterForm } from '@/components/ui/newsletter-form'
import { urlForImage } from '@/sanity/image'
import { formatDate } from '@/lib/utils'

export const revalidate = 60

export default async function HomePage() {
  const [featured, posts] = await Promise.all([
    client.fetch(featuredPostQuery),
    client.fetch(allPostsQuery),
  ])

  const latestPosts = posts.slice(1, 7) // exclude featured

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Hero — Featured post */}
      {featured && (
        <section className="mb-14">
          <Link href={`/bai-viet/${featured.slug}`} className="group block">
            <div className="relative rounded-2xl overflow-hidden bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/40 transition-all">
              {featured.coverImage && (
                <div className="relative h-72 md:h-96">
                  <Image
                    src={urlForImage(featured.coverImage).width(1200).height(600).url()}
                    alt={featured.title}
                    fill
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </div>
              )}
              <div className={`${featured.coverImage ? 'absolute bottom-0 left-0 right-0 p-6' : 'p-6'}`}>
                {featured.categories?.[0] && (
                  <span className="inline-block text-xs font-medium text-[var(--accent)] bg-[var(--accent)]/20 px-2.5 py-1 rounded-full mb-3">
                    {featured.categories[0].title}
                  </span>
                )}
                <h1 className="font-display text-2xl md:text-4xl font-bold text-white group-hover:text-[var(--accent)] transition-colors leading-tight mb-2">
                  {featured.title}
                </h1>
                {featured.excerpt && (
                  <p className="text-[var(--muted-foreground)] text-sm md:text-base line-clamp-2 mb-3">
                    {featured.excerpt}
                  </p>
                )}
                {featured.publishedAt && (
                  <p className="text-xs text-[var(--muted-foreground)]">{formatDate(featured.publishedAt)}</p>
                )}
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Latest posts grid */}
      {latestPosts.length > 0 && (
        <section className="mb-14">
          <h2 className="font-display text-xl font-bold text-white mb-6">Bài Viết Mới Nhất</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {latestPosts.map((post: any) => (
              <PostCard key={post._id} {...post} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <NewsletterForm />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: implement home page with featured hero and post grid"
```

---

## Task 9: Portable Text Renderer

**Files:**
- Create: `components/blog/portable-text-renderer.tsx`

- [ ] **Step 1: Create portable-text-renderer.tsx**

```typescript
// components/blog/portable-text-renderer.tsx
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'
import { urlForImage } from '@/sanity/image'

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null
      const imageUrl = urlForImage(value).width(1200).url()
      return (
        <figure className="my-6">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
            <Image
              src={imageUrl}
              alt={value.alt ?? ''}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 65ch"
            />
          </div>
          {value.caption && (
            <figcaption className="text-center text-xs text-[var(--muted-foreground)] mt-2">{value.caption}</figcaption>
          )}
        </figure>
      )
    },
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value.href}
        target={value.href?.startsWith('http') ? '_blank' : undefined}
        rel={value.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="text-[var(--accent)] underline hover:text-[var(--accent-hover)]"
      >
        {children}
      </a>
    ),
    code: ({ children }) => (
      <code className="bg-[var(--muted)] px-1.5 py-0.5 rounded text-[#fcd34d] text-sm">{children}</code>
    ),
  },
  block: {
    h2: ({ children }) => (
      <h2 id={String(children).toLowerCase().replace(/\s+/g, '-')} className="font-display text-2xl font-bold text-white mt-10 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 id={String(children).toLowerCase().replace(/\s+/g, '-')} className="font-display text-xl font-bold text-white mt-8 mb-3">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-[var(--accent)] pl-4 my-6 text-[var(--muted-foreground)] italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="text-[#d4d4d4]">{children}</li>,
    number: ({ children }) => <li className="text-[#d4d4d4]">{children}</li>,
  },
}

interface PortableTextRendererProps {
  content: any[]
}

export function PortableTextRenderer({ content }: PortableTextRendererProps) {
  return (
    <div className="prose max-w-none">
      <PortableText value={content} components={components} />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/blog/portable-text-renderer.tsx
git commit -m "feat: add Portable Text renderer with image and link support"
```

---

## Task 10: Reading Progress & Table of Contents

**Files:**
- Create: `components/blog/reading-progress.tsx`
- Create: `components/blog/table-of-contents.tsx`

- [ ] **Step 1: Create reading-progress.tsx**

```typescript
// components/blog/reading-progress.tsx
'use client'

import { useEffect, useState } from 'react'

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const total = el.scrollHeight - el.clientHeight
      setProgress(total > 0 ? (scrolled / total) * 100 : 0)
    }

    window.addEventListener('scroll', updateProgress, { passive: true })
    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent pointer-events-none">
      <div
        className="h-full bg-[var(--accent)] transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Create table-of-contents.tsx**

```typescript
// components/blog/table-of-contents.tsx
'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TocItem {
  id: string
  text: string
  level: number
}

export function TableOfContents() {
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll('.prose h2, .prose h3'))
    const tocItems: TocItem[] = headings.map((el) => ({
      id: el.id,
      text: el.textContent ?? '',
      level: el.tagName === 'H2' ? 2 : 3,
    }))
    setItems(tocItems)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-20% 0% -70% 0%' },
    )

    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [])

  if (items.length === 0) return null

  return (
    <aside className="hidden lg:block sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-3">
        Nội dung
      </p>
      <nav className="space-y-1">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              'block text-sm transition-colors leading-snug py-0.5',
              item.level === 3 && 'pl-3',
              activeId === item.id
                ? 'text-[var(--accent)] font-medium'
                : 'text-[var(--muted-foreground)] hover:text-white',
            )}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/blog/reading-progress.tsx components/blog/table-of-contents.tsx
git commit -m "feat: add reading progress bar and sticky table of contents"
```

---

## Task 11: Post Header & Giscus Comments

**Files:**
- Create: `components/blog/post-header.tsx`
- Create: `components/blog/giscus-comments.tsx`

- [ ] **Step 1: Create post-header.tsx**

```typescript
// components/blog/post-header.tsx
import Image from 'next/image'
import Link from 'next/link'
import { urlForImage } from '@/sanity/image'
import { formatDate } from '@/lib/utils'
import { calculateReadingTime } from '@/lib/reading-time'

interface PostHeaderProps {
  title: string
  excerpt?: string
  coverImage?: { asset: { _ref: string } }
  publishedAt?: string
  categories?: { title: string; slug: string }[]
  content?: any[]
}

export function PostHeader({ title, excerpt, coverImage, publishedAt, categories, content }: PostHeaderProps) {
  const readingTime = content ? calculateReadingTime(JSON.stringify(content)) : 1
  const imageUrl = coverImage ? urlForImage(coverImage).width(1400).height(700).url() : null

  return (
    <header className="mb-10">
      {/* Cover image */}
      {imageUrl && (
        <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden mb-8">
          <Image src={imageUrl} alt={title} fill priority className="object-cover" sizes="100vw" />
        </div>
      )}

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div className="flex gap-2 mb-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/chu-de/${cat.slug}`}
              className="text-xs font-medium text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-1 rounded-full hover:bg-[var(--accent)]/20 transition-colors"
            >
              {cat.title}
            </Link>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
        {title}
      </h1>

      {/* Excerpt */}
      {excerpt && (
        <p className="text-[var(--muted-foreground)] text-lg leading-relaxed mb-4">{excerpt}</p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
        {publishedAt && <span>{formatDate(publishedAt)}</span>}
        <span>·</span>
        <span>{readingTime} phút đọc</span>
      </div>

      {/* Divider */}
      <div className="mt-8 border-t border-[var(--border)]" />
    </header>
  )
}
```

- [ ] **Step 2: Create giscus-comments.tsx**

```typescript
// components/blog/giscus-comments.tsx
'use client'

import { useEffect, useRef } from 'react'

export function GiscusComments() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || ref.current.querySelector('iframe')) return

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.setAttribute('data-repo', process.env.NEXT_PUBLIC_GISCUS_REPO ?? '')
    script.setAttribute('data-repo-id', process.env.NEXT_PUBLIC_GISCUS_REPO_ID ?? '')
    script.setAttribute('data-category', process.env.NEXT_PUBLIC_GISCUS_CATEGORY ?? 'Announcements')
    script.setAttribute('data-category-id', process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID ?? '')
    script.setAttribute('data-mapping', 'pathname')
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'top')
    script.setAttribute('data-theme', 'dark_dimmed')
    script.setAttribute('data-lang', 'vi')
    script.setAttribute('crossorigin', 'anonymous')
    script.async = true

    ref.current.appendChild(script)
  }, [])

  return (
    <section className="mt-16 pt-10 border-t border-[var(--border)]">
      <h2 className="font-display text-xl font-bold text-white mb-6">Bình luận</h2>
      <div ref={ref} />
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/blog/post-header.tsx components/blog/giscus-comments.tsx
git commit -m "feat: add post header and Giscus comments components"
```

---

## Task 12: Single Post Page

**Files:**
- Create: `app/bai-viet/[slug]/page.tsx`

- [ ] **Step 1: Create post page**

```typescript
// app/bai-viet/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { client } from '@/sanity/client'
import { postBySlugQuery, allPostSlugsQuery } from '@/sanity/queries'
import { PostHeader } from '@/components/blog/post-header'
import { PortableTextRenderer } from '@/components/blog/portable-text-renderer'
import { TableOfContents } from '@/components/blog/table-of-contents'
import { ReadingProgress } from '@/components/blog/reading-progress'
import { GiscusComments } from '@/components/blog/giscus-comments'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await client.fetch(allPostSlugsQuery)
  return slugs.map(({ slug }: { slug: string }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await client.fetch(postBySlugQuery, { slug })
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await client.fetch(postBySlugQuery, { slug })
  if (!post) notFound()

  return (
    <>
      <ReadingProgress />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <PostHeader
          title={post.title}
          excerpt={post.excerpt}
          coverImage={post.coverImage}
          publishedAt={post.publishedAt}
          categories={post.categories}
          content={post.content}
        />

        {/* Two-column layout */}
        <div className="flex gap-12">
          {/* Main content */}
          <article className="min-w-0 flex-1">
            {post.content && <PortableTextRenderer content={post.content} />}
            <GiscusComments />
          </article>

          {/* Sidebar */}
          <div className="w-56 shrink-0">
            <TableOfContents />
          </div>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/bai-viet/
git commit -m "feat: add single post page with TOC, reading progress, and comments"
```

---

## Task 13: Category & About Pages

**Files:**
- Create: `app/chu-de/[slug]/page.tsx`
- Create: `app/ve-toi/page.tsx`

- [ ] **Step 1: Create category page**

```typescript
// app/chu-de/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { client } from '@/sanity/client'
import { postsByCategoryQuery, categoryBySlugQuery } from '@/sanity/queries'
import { PostCard } from '@/components/blog/post-card'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await client.fetch(categoryBySlugQuery, { slug })
  if (!category) return {}
  return { title: category.title, description: category.description }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const [category, posts] = await Promise.all([
    client.fetch(categoryBySlugQuery, { slug }),
    client.fetch(postsByCategoryQuery, { slug }),
  ])
  if (!category) notFound()

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-white mb-2">{category.title}</h1>
        {category.description && (
          <p className="text-[var(--muted-foreground)]">{category.description}</p>
        )}
      </header>

      {posts.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">Chưa có bài viết nào.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post: any) => (
            <PostCard key={post._id} {...post} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create about page**

```typescript
// app/ve-toi/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Về Tôi',
  description: 'Giới thiệu về tác giả blog.',
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-4xl font-bold text-white mb-6">Về Tôi</h1>
      <div className="prose max-w-none">
        <p>
          Chào bạn! Mình là [tên], một game designer với đam mê thiết kế cơ chế game, 
          phân tích trải nghiệm người chơi, và viết tài liệu thiết kế.
        </p>
        <p>
          Blog này là nơi mình chia sẻ những suy nghĩ về game design — từ lý thuyết cơ bản 
          đến phân tích chuyên sâu các tựa game nổi tiếng.
        </p>
        <h2>Liên hệ</h2>
        <p>
          Bạn có thể tìm mình tại:{' '}
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
          {' | '}
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/chu-de/ app/ve-toi/
git commit -m "feat: add category listing and about pages"
```

---

## Task 14: Search API & SearchBar Component

**Files:**
- Create: `app/api/search/route.ts`
- Create: `__tests__/api/search.test.ts`
- Modify: `components/layout/header.tsx` (wire up SearchBar)
- Create: `components/ui/search-bar.tsx`

- [ ] **Step 1: Write failing test for search API**

```typescript
// __tests__/api/search.test.ts
import { describe, it, expect, vi } from 'vitest'

// Mock Sanity client
vi.mock('@/sanity/client', () => ({
  client: { fetch: vi.fn() },
}))

import { POST } from '@/app/api/search/route'
import { client } from '@/sanity/client'
import { NextRequest } from 'next/server'

describe('POST /api/search', () => {
  it('returns 400 when query is missing', async () => {
    const req = new NextRequest('http://localhost/api/search', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns results for valid query', async () => {
    const mockPosts = [{ title: 'Game Design Basics', slug: 'basics' }]
    vi.mocked(client.fetch).mockResolvedValue(mockPosts)

    const req = new NextRequest('http://localhost/api/search', {
      method: 'POST',
      body: JSON.stringify({ query: 'game' }),
    })
    const res = await POST(req)
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.results).toEqual(mockPosts)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- search
```

Expected: FAIL — `Cannot find module '@/app/api/search/route'`

- [ ] **Step 3: Implement search API route**

```typescript
// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/client'
import { searchPostsQuery } from '@/sanity/queries'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const query = body?.query?.trim()

  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 })
  }

  const results = await client.fetch(searchPostsQuery, { query: `${query}*` })
  return NextResponse.json({ results })
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- search
```

Expected: PASS

- [ ] **Step 5: Create search-bar.tsx**

```typescript
// components/ui/search-bar.tsx
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface SearchResult {
  title: string
  slug: string
  excerpt?: string
  publishedAt?: string
  categories?: { title: string; slug: string }[]
}

interface SearchBarProps {
  onClose: () => void
}

export function SearchBar({ onClose }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value.trim()) { setResults([]); return }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: value }),
        })
        const data = await res.json()
        setResults(data.results ?? [])
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [])

  return (
    <div className="border-t border-[var(--border)] bg-[var(--background)] px-4 py-3">
      <div className="mx-auto max-w-5xl">
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3 text-[var(--muted-foreground)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
            placeholder="Tìm bài viết..."
            className="w-full bg-[var(--muted)] text-sm pl-9 pr-4 py-2 rounded-md outline-none text-white placeholder:text-[var(--muted-foreground)]"
          />
          <button onClick={onClose} className="absolute right-3 text-[var(--muted-foreground)] hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-2 bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
            {results.map((result) => (
              <Link
                key={result.slug}
                href={`/bai-viet/${result.slug}`}
                onClick={onClose}
                className="block px-4 py-3 hover:bg-[var(--muted)] transition-colors border-b border-[var(--border)] last:border-0"
              >
                <p className="text-sm font-medium text-white">{result.title}</p>
                {result.publishedAt && (
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{formatDate(result.publishedAt)}</p>
                )}
              </Link>
            ))}
          </div>
        )}

        {loading && (
          <p className="mt-2 text-xs text-[var(--muted-foreground)] text-center py-2">Đang tìm...</p>
        )}

        {!loading && query && results.length === 0 && (
          <p className="mt-2 text-xs text-[var(--muted-foreground)] text-center py-2">Không tìm thấy kết quả.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Update header.tsx to use SearchBar**

In `components/layout/header.tsx`, replace the simple search input in the `{searchOpen && ...}` block:

```typescript
// Add import at top of header.tsx:
import { SearchBar } from '@/components/ui/search-bar'

// Replace the {searchOpen && ...} block:
{searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}
```

- [ ] **Step 7: Commit**

```bash
git add app/api/search/ components/ui/search-bar.tsx components/layout/header.tsx __tests__/api/
git commit -m "feat: add search API route and SearchBar component"
```

---

## Task 15: Newsletter API & Form

**Files:**
- Create: `app/api/subscribe/route.ts`
- Create: `components/ui/newsletter-form.tsx`

- [ ] **Step 1: Implement newsletter API**

```typescript
// app/api/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const email = body?.email?.trim()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
  }

  try {
    await resend.contacts.create({
      email,
      audienceId: process.env.RESEND_AUDIENCE_ID ?? '',
    })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Resend error:', err)
    return NextResponse.json({ error: 'Không thể đăng ký. Vui lòng thử lại.' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create newsletter-form.tsx**

```typescript
// components/ui/newsletter-form.tsx
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()

    if (res.ok) {
      setStatus('success')
      setMessage('Đăng ký thành công! Cảm ơn bạn.')
      setEmail('')
    } else {
      setStatus('error')
      setMessage(data.error ?? 'Có lỗi xảy ra.')
    }
  }

  return (
    <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 text-center">
      <h2 className="font-display text-2xl font-bold text-white mb-2">Nhận bài mới qua email</h2>
      <p className="text-[var(--muted-foreground)] text-sm mb-6">
        Đăng ký để không bỏ lỡ những bài viết mới nhất về game design.
      </p>

      {status === 'success' ? (
        <p className="text-[var(--accent)] font-medium">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
            className="flex-1 bg-[var(--muted)] text-sm px-4 py-2.5 rounded-lg outline-none text-white placeholder:text-[var(--muted-foreground)] border border-[var(--border)] focus:border-[var(--accent)] transition-colors"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className={cn(
              'px-5 py-2.5 bg-[var(--accent)] text-black text-sm font-semibold rounded-lg transition-colors whitespace-nowrap',
              status === 'loading' ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[var(--accent-hover)]',
            )}
          >
            {status === 'loading' ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>
      )}

      {status === 'error' && (
        <p className="text-red-400 text-sm mt-2">{message}</p>
      )}
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/subscribe/ components/ui/newsletter-form.tsx
git commit -m "feat: add newsletter subscription with Resend"
```

---

## Task 16: Sitemap, SEO & Revalidation Webhook

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/api/revalidate/route.ts`

- [ ] **Step 1: Create sitemap.ts**

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'
import { client } from '@/sanity/client'
import { allPostSlugsQuery } from '@/sanity/queries'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://yourdomain.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs: { slug: string; publishedAt: string }[] = await client.fetch(allPostSlugsQuery)

  const postUrls = slugs.map(({ slug, publishedAt }) => ({
    url: `${BASE_URL}/bai-viet/${slug}`,
    lastModified: new Date(publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/ve-toi`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ...postUrls,
  ]
}
```

- [ ] **Step 2: Create revalidation webhook**

```typescript
// app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')

  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const slug = body?._id ? body.slug?.current : null

  try {
    revalidatePath('/', 'page')
    if (slug) revalidatePath(`/bai-viet/${slug}`, 'page')
    revalidatePath('/chu-de', 'layout')

    return NextResponse.json({ revalidated: true, slug: slug ?? 'all' })
  } catch (err) {
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Add NEXT_PUBLIC_BASE_URL to .env.local**

```bash
# Add to .env.local
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
RESEND_AUDIENCE_ID=your_audience_id_here
```

- [ ] **Step 4: Commit**

```bash
git add app/sitemap.ts app/api/revalidate/
git commit -m "feat: add sitemap and Sanity revalidation webhook"
```

---

## Task 17: Sanity Studio Route & Final Config

**Files:**
- Create: `app/studio/[[...tool]]/page.tsx`
- Modify: `next.config.ts`

- [ ] **Step 1: Add Sanity Studio route**

```typescript
// app/studio/[[...tool]]/page.tsx
import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'

export const dynamic = 'force-dynamic'

export default function StudioPage() {
  return <NextStudio config={config} />
}
```

- [ ] **Step 2: Update next.config.ts to silence Sanity warnings**

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
  // Required for Sanity Studio embedded in Next.js
  transpilePackages: ['next-sanity'],
}

export default nextConfig
```

- [ ] **Step 3: Run full test suite**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 4: Run build check**

```bash
npm run build
```

Expected: Build completes with no errors. If type errors appear, fix them before continuing.

- [ ] **Step 5: Commit**

```bash
git add app/studio/ next.config.ts
git commit -m "feat: embed Sanity Studio at /studio route"
```

---

## Task 18: Deploy to Vercel

- [ ] **Step 1: Push to GitHub**

```bash
git remote add origin https://github.com/yourusername/game-design-blog.git
git push -u origin main
```

- [ ] **Step 2: Create Vercel project**

Go to [vercel.com/new](https://vercel.com/new), import the GitHub repo.

- [ ] **Step 3: Add environment variables in Vercel**

In Vercel project settings → Environment Variables, add all variables from `.env.local`:
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_TOKEN`
- `SANITY_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_AUDIENCE_ID`
- `NEXT_PUBLIC_GISCUS_REPO`
- `NEXT_PUBLIC_GISCUS_REPO_ID`
- `NEXT_PUBLIC_GISCUS_CATEGORY`
- `NEXT_PUBLIC_GISCUS_CATEGORY_ID`
- `NEXT_PUBLIC_BASE_URL` (set to your Vercel domain)

- [ ] **Step 4: Configure Sanity CORS**

In Sanity dashboard → API → CORS Origins: add your Vercel domain.

- [ ] **Step 5: Set up Sanity webhook**

In Sanity dashboard → API → Webhooks:
- URL: `https://yourdomain.vercel.app/api/revalidate?secret=YOUR_SECRET`
- Dataset: `production`
- Trigger on: Create, Update, Delete

- [ ] **Step 6: Set up Giscus**

1. Go to [giscus.app](https://giscus.app), configure with your GitHub repo
2. Enable GitHub Discussions on the repo
3. Copy `repoId`, `categoryId` values into Vercel env vars

- [ ] **Step 7: Deploy**

```bash
git push origin main
```

Vercel auto-deploys. Check build logs for errors.

---

## Checklist Summary

- [ ] Task 1: Project initialization
- [ ] Task 2: Utility functions + tests
- [ ] Task 3: Sanity schemas & client
- [ ] Task 4: Global styles & root layout
- [ ] Task 5: Header component
- [ ] Task 6: Footer component
- [ ] Task 7: PostCard component
- [ ] Task 8: Home page
- [ ] Task 9: Portable Text renderer
- [ ] Task 10: Reading progress + TOC
- [ ] Task 11: Post header + Giscus comments
- [ ] Task 12: Single post page
- [ ] Task 13: Category & about pages
- [ ] Task 14: Search API + SearchBar
- [ ] Task 15: Newsletter API + form
- [ ] Task 16: Sitemap + revalidation webhook
- [ ] Task 17: Sanity Studio route
- [ ] Task 18: Deploy to Vercel
