# Session Context — Last Updated: 2026-04-13 (mobile UX complete 18/18 + perf + admin editor — modonty v1.31.0 · admin v0.34.0)

> This file is the handoff document for the next agent/session.
> Read this FIRST before starting any work.
> Update this file BEFORE every push.

---

## Current Versions
- **admin**: v0.34.0
- **modonty**: v1.31.0
- **console**: v0.1.2

---

## ✅ Session 31 — Mobile UX complete + Performance + Admin editor (2026-04-13 · modonty v1.31.0 · admin v0.34.0)

### What Was Done

**modonty v1.31.0 — Mobile UX (MOB-001–018 ALL FIXED)**
- `MobileFooter.tsx` → `"use client"` + `usePathname()` — active state always correct (MOB-012)
- `MobileFooterWithFavorites.tsx` — removed stale `activeSection` prop
- `TopNav.tsx` — `hidden sm:flex` on CTA pill, 3-column grid (MOB-002)
- `users/login/page.tsx` — removed `min-h-screen`, replaced with `py-8 sm:py-24` (MOB-007)
- `article-header.tsx` — `break-words` on `<h1>` for mixed Arabic/English (MOB-003)
- `article-mobile-engagement-bar.tsx` — `bottom-16` → `bottom-20` + `hideLoginHint` (MOB-016/011)
- `subscribe-form.tsx` — removed duplicate `CardTitle` (MOB-014)
- `TrendingArticles.tsx` — always-present image container + `IconArticle` placeholder (MOB-018)
- `enhanced-category-card.tsx` + `category-list-item.tsx` — `text-xs` → `text-sm` on labels (MOB-009)
- `featured-client-card.tsx` — gradient + large initials fallback (MOB-010)
- `about/page.tsx` — `prose-h2:border-t prose-h2:pt-6 prose-h2:mt-8` section dividers (MOB-015)
- `articles/[slug]/page.tsx` — all `dynamic({ssr:false})` moved to `client-lazy.tsx` (perf)
- `LeftSidebar.tsx` — `Promise.all` for parallel fetch (perf)
- 11 new `loading.tsx` skeletons (subscribe, profile, help, faq, feedback, terms, 4×legal, news/subscribe)

**admin v0.34.0 — Article Editor**
- `article-server-schema.ts` — PUSH-2/3: unlock seoTitle max + limits
- `update-article.ts` — mutation improvements
- `article-form-navigation.tsx` — PUSH-5: toast uses `save_failed`
- `meta-tags-step.tsx` — PUSH-3: `maxLength` on SEO fields

**Cleanup**
- Deleted ~35 old `.md` report files from root + subdirectories (never belonged in repo)

### Live Test (2026-04-13 — 375×812px)
✅ Login (no dead space) · ✅ Search active nav · ✅ Subscribe (1 title) · ✅ Trending (full cards) · ✅ Categories (14px labels) · ✅ Article toolbar clearance · ✅ 404 bottom nav · ✅ About section dividers

### ⚠️ Pending
- PUSH-4: رسائل خطأ عربية في `update-article.ts`
- ARCH-1: Toast after archive/unarchive
- SCOPY-1–5: SEO copy fields audit (admin)
- Mobile Phase 2 (MOB1-7): mockup in design-preview/page.tsx

---

## ✅ Session 30 — Mobile navbar fix + CTA sticky banner (2026-04-13 · modonty v1.31.0)

### What Was Done

**modonty v1.31.0**
- `TopNav.tsx`: Added `hidden sm:flex` to CTA pill — was causing navbar overflow at 375px (457px scrollWidth vs 375px viewport)
  - Root cause: `whitespace-nowrap` pill + 3 icons forced navbar wider than viewport on all pages
- `MobileFooter.tsx`: Added sticky CTA banner above bottom nav
  - "🚀 عملاء بلا إعلانات من جوجل ↗" — links to jbrseo.com
  - Visible on ALL pages, best UX pattern for mobile conversion
- `layout.tsx`: Increased `pb-16` → `pb-28` to compensate for banner + nav height (~104px combined)

### Tested
- Homepage ✅ — navbar clean, banner visible above bottom nav
- Clients page ✅ — layout fully aligned
- Article page ✅ — banner + interaction toolbar don't conflict

### ⚠️ Pending (mobile-ux-issues.md)
- MOB-001: Broken slug `/articles/م` (homepage last card)
- MOB-003: Article title overflow (mixed Arabic/English)
- MOB-004–011: Remaining medium/low issues

---

## ✅ Session 29 — Archive confirmation dialog (2026-04-12 · admin v0.33.0)

### What Was Done

**admin v0.33.0**
- `archive-article-button.tsx`: Added AlertDialog confirmation for Archive action only
  - Archive button → shows Arabic AlertDialog: "أرشفة المقال" title, warning description, "استمرار" + "كنسل" buttons
  - Unarchive fires immediately (no dialog — safe/reversible operation)
  - Added `open` state + `handleClick` / `handleConfirm` separation
  - Loader2 spinner in button during loading state
  - Removed `useToast` import (not needed — router.refresh() is sufficient feedback)

### Tested End-to-End
- Archive → AlertDialog appears ✅
- كنسل → dialog closes, no change ✅
- استمرار → article archived, button flips to Unarchive ✅
- Unarchive → no dialog, fires immediately, button flips to Archive ✅
- Test article restored to Writing status ✅

### ⚠️ Pending
- ARCH-1: Toast after archive/unarchive — "تم أرشفة المقال — لن يظهر في المدونة" / "تم إلغاء الأرشفة — المقال عاد للحالة السابقة"
- Save-blocking for SEO fields (seoTitle > 60, seoDescription > 160)
- DB script for old articles: truncate oversized SEO fields
- PUSH-4: seoDescription maxLength=160 + hints
- PUSH-5: Arabic error messages
- SCOPY-1 through SCOPY-5: Full SEO copy fields audit

---

## ✅ Session 28 — Archive system + SEO redirect + slug UX (2026-04-12 · admin v0.32.0 / modonty v1.30.0)

### What Was Done

**admin v0.32.0**
- `archive-article.ts` (NEW): `archiveArticle()` + `unarchiveArticle()` server actions with auth guard, try/catch, revalidatePath + revalidateModontyTag
- `archive-article-button.tsx` (NEW): Client component — toggles Archive/Unarchive with loading state, router.refresh() on success
- `articles/[id]/page.tsx`: Removed ⋯ dropdown entirely. Added `[Edit] [Archive/Unarchive] [⚙️]` buttons directly in header. Removed delete. Added gear icon for Technical Details.
- `basic-section.tsx`: Slug UX — hint above field, full URL preview (`https://www.modonty.com/articles/[slug]`), warning animation when > 50 chars, removed copy button, slug takes full width
- `article-form-context.tsx`: Fixed slug auto-generation — slug now follows title only in `mode === 'new'` (was locking after first char)
- `actions/index.ts`: Exported `archiveArticle`, `unarchiveArticle`

**modonty v1.30.0**
- `article-data.ts`: Added `getArchivedArticleRedirectSlug()` — lightweight query, ARCHIVED check only
- `actions/index.ts`: Exported new function
- `articles/[slug]/page.tsx`: ARCHIVED articles → `redirect("/")` (307 temporary, no chain) instead of 404. Used `unstable_rethrow` (official Next.js API) to re-throw NEXT_REDIRECT inside catch block.

### SEO Decision Log
- 307 (not 308/404/410) for archived content — reversible, Google keeps URL in index, re-discovers on unarchive
- `unstable_rethrow` is the official Next.js pattern for redirect() inside try/catch
- Redirect target: `/` directly (not `/articles` which has its own redirect → avoid chain)

### ⚠️ Pending
- Save-blocking for SEO fields (seoTitle > 60, seoDescription > 160) — user said "ممنوع نحفظ إذا تجاوز الحد"
- DB script for old articles: truncate seoTitle > 60 to 59+"X", seoDescription > 160 to 159+"X"
- PUSH-4: seoDescription maxLength=160 + hints
- PUSH-5: Arabic error messages
- SCOPY-1 through SCOPY-5: Full SEO copy fields audit

---

## ✅ Session 27 — Admin query performance + articles table UX (2026-04-12 · admin v0.31.0)

### What Was Done

**admin v0.31.0**
- `get-articles.ts`: removed `content` field from select (was causing 20.8s load), parallelized `getAllSettings()` with `Promise.all()`
- `get-articles.ts`: reduced select to only fields needed by table + SEO analyzer — no full article body
- `article-table.tsx`: added client avatar column (logo or initial fallback), sortable by client
- `article-table.tsx`: enabled sort on SEO score and Status columns
- `contact-messages-actions.ts`: changed from `include` to `select`, removed full `message` body field
- `tags-actions.ts`: changed to explicit `select`, only fields used by table
- `categories/get-categories.ts`: reduced select to minimal fields for list view
- `article-view-types.ts`: made `content`, `updatedAt`, `featuredImage.url`, `logoMedia.altText` optional to support both list and detail views

### ⚠️ Pending
- User mentioned "ولسه في تعديل تاني على الارتكل" — another article change is coming, not specified yet
- DB Query Audit (CRITICAL) added to MASTER-TODO — remaining queries in modonty/ and console/ still to audit

---

## ✅ Session 26 — Sitemap www canonical fix (2026-04-11 · modonty v1.29.7)

### What Was Done

**modonty v1.29.7**
- 15 files: replaced all `"https://modonty.com"` fallbacks → `"https://www.modonty.com"` (sitemap, robots, image-sitemap, all page metadata, lib/seo/index.ts)
- Root cause: sitemap URLs used non-www → SEMrush flagged 9 "incorrect pages" as Redirect type errors
- Fix: all NEXT_PUBLIC_SITE_URL fallbacks now use canonical www form
- ⚠️ Also update Vercel env: `NEXT_PUBLIC_SITE_URL=https://www.modonty.com` (if currently set to non-www)

### ⚠️ Pending — Verify After Push
1. **SEMrush rerun** → "9 incorrect pages in sitemap.xml" should drop to 0
2. Investigate: 4 broken internal links + 1 page 4XX + hreflang conflicts (2+1)

---

## ✅ Session 25 — Breadcrumb structured data fix (2026-04-11 · modonty v1.29.6)

### What Was Done

**modonty v1.29.6**
- `modonty/components/ui/breadcrumb.tsx` — removed ALL HTML microdata attributes (`itemScope`, `itemType`, `itemProp`) from `<ol>` and `<li>` elements
- Root cause: component was outputting BOTH HTML microdata AND JSON-LD (`generateBreadcrumbStructuredData()`), causing Google to see duplicate BreadcrumbList — microdata version was missing `position` field
- Fix: clean HTML only, JSON-LD remains the single source of truth for breadcrumb structured data
- Impact: fixes 113 "Invalid items" in SEMrush structured data audit

### ⚠️ Pending — Verify After Push
1. **Google Rich Results Test** — test any article page (e.g., an article slug) → should now show 0 errors for BreadcrumbList
2. **SEMrush rerun** — re-crawl modonty.com to confirm structured data errors drop from 113 to 0
3. **9 incorrect pages in sitemap** — need to investigate which pages return errors
4. **2 hreflang conflicts** — need to investigate

---

## ✅ Session 24 — Sitemap + SocialCard DB fix (2026-04-11 · modonty v1.29.3)

### What Was Done

**modonty v1.29.2**
- `app/sitemap.ts` — removed `/news/subscribe` from sitemap (form page, not indexable)
- `app/news/subscribe/page.tsx` — added `robots: { index: false, follow: false }` metadata

**modonty v1.29.3 → v1.29.5** (SocialCard DB refactor — 3 hotfixes)
- `lib/settings/get-platform-social-links.ts` — NEW: `"use cache"` file, returns `{ key, href, label }[]` from DB settings (no icon — not serializable across Server/Client boundary)
- `SocialCard.tsx` — async Server Component, reads from DB via `getPlatformSocialLinks()`, maps key→icon locally
- `article-author-bio.tsx` — accepts `platformSocialLinks: SocialLink[]` as prop, maps key→icon locally
- `article-mobile-layout.tsx` + `article-mobile-sidebar-sheet.tsx` — pass `platformSocialLinks` through props chain
- `page.tsx` — fetches `getPlatformSocialLinks()` in `Promise.all` and passes down

**Full live test PASSED before SEMrush rerun:**
- ✅ sameAs (7 correct), SocialCard (7 icons), H1s, meta descriptions, BreadcrumbList, robots.txt, sitemap, /tags 200

### Full Live Test Results (Pre-SEMrush)
- ✅ `/tags` → 200 (was 404, fixed in v1.29.1)
- ✅ sameAs JSON-LD → 7 correct URLs on homepage
- ✅ robots.txt → no `/_next/`, correct bots config
- ✅ H1 on homepage, /categories, /clients, article pages
- ✅ meta descriptions on all checked pages
- ✅ BreadcrumbList on article pages (3 items)
- ✅ `/news` → 200, `/about` → 200
- ✅ Footer links: الرئيسية, الرائجة, العملاء, الوسوم, المساعدة, عن مودونتي, legal pages
- ✅ sitemap: /tags, /tags/*, /terms, /about, /news present
- ⚠️ SocialCard UI (RightSidebar) — no links showing (NEXT_PUBLIC_SOCIAL_* vars missing in Vercel) — NOT a SEMrush issue (JSON-LD sameAs is correct)

### Pending (Post-SEMrush)
- Add NEXT_PUBLIC_SOCIAL_* vars to Vercel to show social icons in RightSidebar
- AI-BOT-1/2/3 — identify 2 blocked pages for ChatGPT/Googlebot/Perplexity in SEMrush panel
- AUDIT-5 — bundle size 401kB → dynamic imports (deferred by user)

---

## ✅ Session 23 — SEMrush Full Audit Fixes (2026-04-11 · modonty v1.29.0 · admin v0.30.0)

### What Was Done

**modonty v1.29.0**
- `app/tags/[slug]/page.tsx` — strip `robots` field from stored DB `nextjsMetadata` (prevents stale `noindex` returning)
- `modonty/.gitignore` — added `.env` + `.env.*` to prevent accidental secret leak to git
- `modonty/.env` — cleaned: fixed comment (social vars are UI-only, NOT JSON-LD sameAs), removed duplicate GTM var, fixed all social URLs to canonical production forms
- Multiple SEMR fixes (1→12 + AUDIT 1→4) all in this push — see `documents/tasks/modonty/SEMRUSH-AUDIT-TODO.md`

**admin v0.30.0**
- SEMR-2: `lib/seo/jsonld-processor.ts` — `fixAtKeywordsDeep()` recursive fix for nested `@type`/`@id` fields
- SEMR-6: All SEO title schemas enforced `max(51)` across articles, categories, tags, industries, clients, authors, pages
- `admin/lib/messages/` — updated ar/en/types

**documents**
- `documents/02-seo/disavow-linkbooster.txt` — Google Disavow file for linkbooster.agency (do NOT upload yet — monitor GSC first)
- `documents/02-seo/AUDIT-4-BACKLINK-SPAM-GUIDE.md` — step-by-step guide for handling spam backlinks
- `documents/tasks/modonty/SEMRUSH-AUDIT-TODO.md` — all SEMR fixes marked done

### ⚠️ Pending Manual Action (CRITICAL — do this after push)

**Admin Settings → Social URLs → Save/Regenerate JSON-LD:**
The Organization sameAs in DB still has wrong URLs. Admin must update in Settings panel:
- X/Twitter: `https://x.com/modonty`
- LinkedIn: `https://www.linkedin.com/company/111692906/`
- YouTube: `https://www.youtube.com/@modontycom`
Then save → JSON-LD regenerates in DB automatically.

### Remaining SEO Tasks
- **AI-BOT-1/2/3** — identify 2 blocked pages for ChatGPT/Googlebot/Perplexity in SEMrush panel
- **AUDIT-5** — bundle size 401kB → dynamic imports (explicitly deferred by user to last)

---

## ✅ Session 22 — SEO 100% + Client BreadcrumbList Fix (2026-04-11 · v1.28.0)

### What Was Done (modonty v1.28.0)

**BUG FIX — Client pages BreadcrumbList regression:**
- `app/clients/[slug]/page.tsx:159-177` — BreadcrumbList كان يُفقد عند وجود DB cache. الإصلاح: نقلنا `<script>` الـ BreadcrumbList خارج الـ conditional ليُرسَم دائماً بغض النظر عن الـ cache.
- تم اكتشافه في الفحص الثاني (3 جولات تحقق قبل الرفع)

**Verified:** tsc zero errors · 3 full audit passes · all 8 critical checkpoints confirmed

---

## ✅ Session 21 — SEO 100% Complete (2026-04-11 · v1.27.0)

### What Was Done (modonty v1.27.0)

**3 SEO gaps closed — full audit before advertising campaign:**
- `app/articles/[slug]/page.tsx` — SEO-A2: live fallback `generateArticleStructuredData()` when DB cache empty — مقالات جديدة تأخذ JSON-LD فوراً
- `app/authors/[slug]/page.tsx` — BreadcrumbList JSON-LD مضاف (Person schema كان موجود، breadcrumb كان مفقود)
- `public/llms.txt` — رابط Terms of Service مصحّح: `/terms` → `/legal/user-agreement`

**Verified:** tsc zero errors · all files read back · imports confirmed used

---

## ✅ Session 20 — Image Sitemap + SEO Dominance (2026-04-11 · v1.26.0)

### What Was Done (modonty v1.26.0)

- `app/sitemap.ts` — SEO-IMG1: أضفنا `featuredImage: { select: { url } }` لكل مقال + `images: [url]` في كل URL
  - Google الآن يرى صور المقالات مباشرة في sitemap.xml → Google Images indexing
  - الطريقة الرسمية: Next.js `MetadataRoute.Sitemap` `images[]` property (Context7 verified)
  - حذفنا TODO القديم عن ملف منفصل — الحل الصحيح دائماً كان داخل sitemap.ts

- `memory/project_seo_dominance_goal.md` — حفظنا هدف الهيمنة SEO كـ project memory دائم

---

## ✅ Session 19 — Launch Readiness Fixes (2026-04-11 · v1.25.0)

### What Was Done (modonty v1.25.0)

**4 launch blockers fixed before advertising campaign:**
- `app/articles/[slug]/page.tsx` — SEO-A1: BreadcrumbList JSON-LD added (generateBreadcrumbStructuredData called, verified against Google Search official docs)
- `app/api/subscribers/route.ts` — Rate limit: max 5 subscriptions per email per hour (429 response)
- `next.config.ts` — HSTS header added: `max-age=63072000; includeSubDomains; preload` (verified against MDN)
- `app/robots.ts` — Removed broken `image-sitemap.xml` reference (was causing 404 on Googlebot crawl)

**Sources verified:** MDN (HSTS), Google Search Docs (BreadcrumbList), Next.js source (robots sitemap type), schema.org (BreadcrumbList format)

---

## ✅ Session 18 — jbr SEO Integration — Sales Funnel (2026-04-11)

### What Was Done (modonty v1.24.0)

**6 CTAs across modonty pointing to jbrseo.com:**
- `DesktopUserAreaClient.tsx` + `TopNav.tsx` — Header: "عملاء بلا إعلانات ↗" ديسكتوب outline + موبايل solid
- `app/clients/page.tsx` — `/clients` CTA gradient panel في نهاية الصفحة
- `app/clients/components/clients-hero.tsx` — Hero إعادة تصميم بعمودين: B2C (قارئ) + B2B (صاحب عمل) بنصوص SEO قوية
- `components/layout/Footer.tsx` — "هل تريد عملاء من جوجل بلا إعلانات؟ جبر SEO ↗"
- `app/clients/[slug]/page.tsx` — "أعجبك ما رأيت؟" في نهاية كل صفحة عميل
- `app/articles/[slug]/components/article-footer.tsx` — "تريد محتوى مثل هذا يجذب عملاء؟" في footer كل مقال

**MASTER-TODO مُحدَّث:**
- JBRSEO-ADMIN-1: نصوص الهيرو تأتي من الأدمن (مستقبل)
- JBRSEO-7/8: about page + analytics (LOW)

---

## ✅ Session 17 — Profile Page Polish (2026-04-11)

### What Was Done (modonty v1.23.0)

**Files changed**
- `app/users/profile/layout.tsx` — removed hero gradient banner (`h-24 bg-gradient-to-r from-[#0e065a] to-[#3030ff]`)
- `app/users/profile/page.tsx` — removed `CardHeader` block, removed `-mt-16`/`-mt-12` banner offsets, replaced 5 heavy stat cards with a single inline row of number+label items separated by dividers

---

## ✅ Session 16 — Chatbot Phase 1 Complete (CHAT-1 → CHAT-5) (2026-04-11)

### What Was Done (modonty v1.22.0)

**1. New files**
- `lib/rag/prompts.ts` — centralized prompt builder (4 prompts: category DB/web, article DB/web). Strict rules: persona, no hallucination, cite source, Arabic فصحى, 3 paragraphs max
- `app/api/chatbot/suggest-category/route.ts` — Cohere embed cosine similarity → returns top category if score > 0.35

**2. Modified files**
- `app/api/chatbot/chat/route.ts` — added suggestedArticle (top-viewed in category after Serper), trusted sources check (hasTrustedContent), prompt from lib/rag/prompts
- `app/api/articles/[slug]/chat/route.ts` — same trusted sources + prompt from lib/rag/prompts
- `components/chatbot/ArticleChatbotContent.tsx` — full rewrite: auto-detect category (CHAT-2), "اسأل العميل" card after web answers (CHAT-1), suggested article card (CHAT-3), no-sources amber card (CHAT-4), input always visible

**3. Bugs found and fixed during live test (CHAT-5)**
- `ArticleChatbotContent.tsx:124` — empty-content suggestion message was sent to Cohere → 400 error. Fix: filter `m.content.trim().length > 0` before building history
- `lib/rag/scope.ts` — OUT_OF_SCOPE_THRESHOLD raised 0.42 → 0.52 (cooking passed as in-scope at 0.42)
- `lib/rag/prompts.ts` — `hasTrustedContent` added UNTRUSTED_DOMAINS blacklist (TikTok, YouTube, Instagram, etc.) — previously TikTok was accepted as "trusted"

**4. Live test results (CHAT-5 — 8 cases)**
- ✅ UI: input always visible, category chip, welcome message
- ✅ CHAT-2: auto-detect "التسويق الرقمي" from first message
- ✅ DB redirect: matched SEO article, redirect cards shown
- ✅ Web answer: source cited + suggested article card + "اسأل العميل" button
- ✅ Out-of-scope: cooking question rejected correctly
- ✅ Article chatbot: no category needed, answers from article content
- ✅ History tab: all sessions saved with timestamps

---

## ✅ Session 15 — User Account Polish + FAQ Reply Notification Fix (2026-04-11)

### What Was Done

**1. console v0.1.2 — Bug fix**
- `question-actions.ts`: `replyToQuestion` now creates `faq_reply` notification for the user after client replies
  - Looks up user via `submittedByEmail` → creates `db.notification` with type `faq_reply`
  - Wrapped in try/catch so notification failure never blocks the reply
  - Full live flow tested end-to-end: user asks → client replies → bell shows 1 → notification visible

**2. modonty v1.22.0 — User account + semantic HTML**
- Settings tabs simplified from 7 → 4 (profile · security · appearance · account)
- Removed duplicate "disliked" tab from profile grid (6 → 5 columns)
- Nested `<main>` fixed in `articles/[slug]/page.tsx` → changed to `<div>`
- sr-only `<h1>` added to 6 profile sub-pages (favorites, liked, comments, following, disliked, settings)
- `aria-labelledby` added to authors/[slug] + news sections
- `aria-label` added to MobileFooter nav
- `aria-label` added to LeftSidebar + RightSidebar
- `aria-hidden="true"` on SidebarSkeletons
- `BellRevalidateTrigger` added to notifications page (bell count syncs on every visit)

**3. Tooling**
- `UserPromptSubmit` hook added to `.claude/settings.local.json` — enforces automatic TODO file updates on every task completion
- `feedback_todo_file_rules.md` memory updated with migration rules

**4. Known UX Gap (USR-N1 — MASTER-TODO MEDIUM)**
- `faq_reply` notification type not handled in notifications detail panel — shows empty right side
- `notifications/page.tsx` needs a case for `faq_reply` to fetch ArticleFAQ data and show question + answer

---

## ✅ Session 14 — modonty Public Site Polish + Brand Compliance (2026-04-11)

### What Was Done

**1. Security fixes (modonty)**
- `/api/subscribers` — replaced `email.includes("@")` with Zod `z.string().email().max(254)`
- `/api/articles/[slug]/view` — deduplication: one view per (articleId, sessionId) per day
- Removed all `console.log` from production APIs: `comments/like`, `comments/dislike`, `users/liked`, `users/disliked`
- Removed security-sensitive `console.log` from admin auth (tokens were being logged): `forgot-password-actions.ts`, `reset-password-actions.ts`, `send-reset-email.ts`

**2. Console app — best practices (console)**
- Added `loading.tsx` + `error.tsx` for new `[articleId]` stats route
- Added `skeleton.tsx` component to console UI

**3. modonty public site (modonty v1.21.0)**

| Fix | File | Change |
|-----|------|--------|
| G1 — JWTSessionError | `.env.local` | New `AUTH_SECRET` + corrected `NEXTAUTH_URL` to `localhost:3001` |
| G3 — Newsletter no feedback | `newsletter-cta.tsx` | Added error state + "جاري الاشتراك..." |
| HP2 — No platform intro | `FeedContainer.tsx` | Strip "مرحباً بك في مودونتي" above feed |
| HP3 — Empty "جديد مودونتي" | `ModontyCard.tsx` | `if (articles.length === 0) return null` |
| HP4 — Cards no image | `PostCardHeroImage.tsx` | `bg-muted` + `IconArticle` placeholder |
| G2 — Footer links only | `Footer.tsx` | Added quick links: الرئيسية / الرائجة / العملاء / عن مودونتي |
| A6 — Reading progress | verified | Already active — no change needed |
| Loading pages | 11 new files | about, contact, legal, login, authors/[slug], notifications, profile sub-pages |
| BR1-4 — Brand Compliance | 24 files | 66 violations → all replaced with `text-primary` / `bg-primary/10` / `text-accent` / `text-destructive` |

---

## ⚠️ Pending Manual Actions (Vercel)

1. **AUTH_SECRET** — Update in Vercel Dashboard → Project → Settings → Environment Variables
   Value: `rGtnuhR8EeViMTAbFAF9bhL3sH38iRdxsovdyXRnoJI=`
   After updating: Redeploy. All logged-in users will be signed out (expected).
2. **NEXTAUTH_URL** — Confirm Vercel has `https://modonty.com` (not localhost)

---

## 📋 What's Left

### MASTER-TODO
- Chatbot Phase 2 (CHAT-FAQ1-4) — Admin FAQ generation from chat history
- Email integration (Resend) — needs Resend subscription first
- Mobile Phase 2 (MOB1-7) — mockup ready in `design-preview/page.tsx`
- Admin auth actions — 13 remaining (contact-messages, faq, upload, etc.)
- Admin UX improvements (media picker search, inline picker, etc.)
- USR-N1 — faq_reply notification detail view in modonty

### CHATBOT-TODO
- ✅ Phase 1 (CHAT-1 to CHAT-5) ALL COMPLETE
- Phase 2 (CHAT-FAQ1-4) — Admin FAQ generation — not started

---

## Ports
- admin: 3000
- modonty: 3001
- console: 3002

## Test Credentials
- Admin: modonty@modonty.com / Modonty123!
- Console (Nova): see admin → Clients → Nova Electronics
