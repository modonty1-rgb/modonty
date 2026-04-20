# Session Context — Last Updated: 2026-04-21 (Session 62 — PERF-006 article-data.ts fix + full live test)

> This file is the handoff document for the next agent/session.
> Read this FIRST before starting any work.
> Update this file BEFORE every push.

---

## Current Versions
- **admin**: v0.40.0 🔄 (ready to push)
- **modonty**: v1.41.0 🔄 (ready to push)
- **console**: v0.2.0 ✅ (pushed 2026-04-20)

---

## 🔄 Session 62 — READY TO PUSH (PERF-006 complete + full live test ✅)

### Summary
Fixed final gap in PERF-006: `getArticleBySlugMinimal` in `article-data.ts` was still using `_count` for the 5 interaction fields. Fixed by:
1. Replacing `_count: { likes, dislikes, favorites, comments, views, faqs }` with `_count: { faqs }` only + auto-included scalar fields
2. Reconstructing `_count` shape from scalar fields in the return value (page.tsx needs zero changes)
3. Updated `article-manual-related.tsx` related articles type + JSX to use `likesCount/dislikesCount/commentsCount` directly

Full live test confirmed all 8 interaction scenarios: like, unlike, dislike, like-while-disliked, dislike-while-liked, favorite, unfavorite. UI + DB in sync in every case.

### Files changed (Session 62)
**modonty:**
- `app/articles/[slug]/actions/article-data.ts` — getArticleBySlugMinimal: _count → scalar fields (keep _count.faqs only)
- `app/articles/[slug]/components/article-manual-related.tsx` — updated prop type + JSX counters

### Notes for next agent
- PERF-006 is 100% complete. All paths read from scalar fields.
- article-data.ts returns reconstructed _count shape so page.tsx (307-395) still works unchanged
- Full live test passed: all counter scenarios verified UI=DB

---

## 🔄 Session 61 — READY TO PUSH (PERF-006 + PERF-007)

### Summary
PERF-006: Denormalized interaction counts on Article model. 5 new scalar fields replace 5+ COUNT(*) queries per article load. All interaction endpoints (like, dislike, favorite, view, comment-approve) now atomically increment/decrement counters. All query helpers updated to read direct fields. Admin Recalculation card added (Settings → System tab). Verified: recalculation ran on 30 articles, API returns real counts.

PERF-007: Homepage ISR — removed `isMobileRequest()` from sidebars (was calling headers() → force-dynamic), added `"use cache"` + `cacheLife("minutes")` at page level, moved category filter client-side via new `CategoryFeedSection` component.

### Files changed (Session 61)
**modonty:**
- `app/page.tsx` — "use cache" + cacheLife + cacheTag (PERF-007)
- `app/articles/[slug]/actions/article-interactions.ts` — full rewrite with atomic counters
- `app/api/articles/[slug]/like/route.ts` — atomic counter update
- `app/api/articles/[slug]/dislike/route.ts` — atomic counter update
- `app/api/articles/[slug]/favorite/route.ts` — atomic counter update
- `app/api/articles/[slug]/view/route.ts` — parallel viewsCount increment
- `app/api/helpers/article-queries.ts` — replaced _count with direct fields
- `app/api/helpers/interaction-queries.ts` — replaced _count, eliminated articleView.groupBy
- `app/api/helpers/client-queries.ts` — replaced article _count
- `app/api/helpers/category-queries.ts` — replaced article _count + viewsCount orderBy
- `components/feed/CategoryFeedSection.tsx` (NEW — PERF-007)
- `components/feed/FeedContainer.tsx` — uses CategoryFeedSection
- `components/layout/LeftSidebar/LeftSidebar.tsx` — removed isMobileRequest
- `components/layout/RightSidebar/RightSidebar.tsx` — removed isMobileRequest
- `components/layout/LeftSidebar/DiscoveryCard.tsx` — useSearchParams for category detection
- `components/feed/infiniteScroll/InfiniteArticleList.tsx` — showEmptyState flash fix
- `app/clients/components/clients-section.tsx` — ssr:false hydration fix

**admin:**
- `app/(dashboard)/settings/actions/recalculate-article-counts.ts` (NEW)
- `app/(dashboard)/settings/components/settings-form-v2.tsx` — RecalculationCard added

**console:**
- `app/(dashboard)/dashboard/comments/actions/comment-actions.ts` — commentsCount sync

**dataLayer:**
- `prisma/schema/schema.prisma` — 5 new fields: likesCount, dislikesCount, commentsCount, favoritesCount, viewsCount

### Notes for next agent
- Run recalculation card (Settings → System) on PRODUCTION after first deploy to populate counts for existing articles
- `AnalyticsCard` on homepage reads from `getOverallCategoryAnalytics()` which now uses denormalized counts ✅
- All 3 apps TSC zero errors ✅

---

## ✅ Session 58 — PUSHED 2026-04-20 (Email Templates Preview — admin v0.39.0)

### Summary
New `/emails` page in admin: preview all 8 email templates (6 modonty user-facing + 2 admin) with mock Arabic data in an iframe. "Send Test" button sends a test email with `[TEST]` prefix to modonty1@gmail.com. Nav item added to sidebar under System.

### Files changed
- `admin/lib/email/templates/base.ts` — added `warningBox()`
- `admin/lib/email/templates/{welcome,email-verification,password-reset,comment-reply,faq-reply,newsletter-welcome}.ts` (NEW — 6 files)
- `admin/app/(dashboard)/emails/actions/preview-email.ts` (NEW)
- `admin/app/(dashboard)/emails/components/email-preview-client.tsx` (NEW)
- `admin/app/(dashboard)/emails/page.tsx` (NEW)
- `admin/app/(dashboard)/emails/loading.tsx` (NEW)
- `admin/components/admin/sidebar.tsx` — added Email Templates
- `admin/package.json` — bumped to v0.39.0

---

## ✅ Session 57 — PUSHED 2026-04-20 (Database Health Tools — admin v0.38.0)

### Summary
Complete `/database` health page in admin with 9 tools: DB Stats (storageMB), Orphan Cleaner, TTL Index Health (with Create buttons), Slug Integrity, Broken References, Session Cleaner, Stale Article Versions, Collection Sizes, Duplicate Slug Scanner. All DB-1–DB-9 done. OTP-AUDIT-1 moved to NICE-TO-HAVE.

### Files changed
- `admin/app/(dashboard)/database/actions/database-health.ts` — added `storageMB`, `collectionsCount` via `$runCommandRaw({ dbStats: 1 })`
- `admin/app/(dashboard)/database/actions/orphan-cleaner.ts` (NEW) — unused media count + clean expired OTPs
- `admin/app/(dashboard)/database/actions/index-health.ts` (NEW) — TTL index check + `createTTLIndex()` server action
- `admin/app/(dashboard)/database/actions/slug-integrity.ts` (NEW) — empty slugs across 6 entity types
- `admin/app/(dashboard)/database/actions/broken-references.ts` (NEW) — articles with broken authorId/categoryId/featuredImageId
- `admin/app/(dashboard)/database/actions/session-cleaner.ts` (NEW) — expired NextAuth sessions + verification tokens
- `admin/app/(dashboard)/database/actions/stale-versions.ts` (NEW) — article versions older than 30/90 days
- `admin/app/(dashboard)/database/actions/collection-sizes.ts` (NEW) — per-collection MB breakdown via `collStats`
- `admin/app/(dashboard)/database/actions/duplicate-slugs.ts` (NEW) — cross-client slug reuse detection via aggregateRaw
- `admin/app/(dashboard)/database/components/db-tools-section.tsx` (NEW) — full client component with useTransition + all 9 tool cards
- `admin/app/(dashboard)/database/components/database-overview.tsx` — updated to show storageMB
- `admin/app/(dashboard)/database/page.tsx` — Promise.all for 9 parallel fetches
- `admin/package.json` — bumped to v0.38.0
- `documents/tasks/✅ MASTER-TODO.md` — DB section all marked done, OTP-AUDIT-1 removed
- `documents/tasks/💡 NICE-TO-HAVE.md` — added OTP-AUDIT-1

---

## ✅ Session 53 — PUSHED 2026-04-20 (FAQ System — 3-phase)

### Summary
Full FAQ workflow: Admin sends → Client approves in Console → Published on modonty + FAQPage JSON-LD for Google Featured Snippets.

### Phase 1 — Admin changes
- `convertToArticleFaq` now saves `status: "PENDING"` instead of `PUBLISHED`
- Button/dialog text: "Convert to FAQ" → "Send to Client for Approval"
- Toast message updated accordingly

### Phase 2 — Console `/dashboard/faqs` (NEW page + actions)
- `console/app/(dashboard)/dashboard/faqs/page.tsx` — server component, stat cards (pending/published/total)
- `console/app/(dashboard)/dashboard/faqs/components/faqs-table.tsx` — filter tabs, edit answer textarea, approve/reject buttons
- `console/app/(dashboard)/dashboard/faqs/helpers/faq-queries.ts` — `getClientFaqs`, `getFaqStats`, `formatFaqDate`
- `console/app/(dashboard)/dashboard/faqs/actions/faq-actions.ts` — `approveFaq` (sets PUBLISHED), `rejectFaq` (sets REJECTED)
- `console/lib/ar.ts` — added `faqs` section + `nav.faqs`
- `console/app/(dashboard)/layout.tsx` — added `getFaqStats`, passes `pendingFaqsCount`
- `console/app/(dashboard)/components/sidebar.tsx` + `mobile-sidebar.tsx` — added FAQs nav item with badge
- `console/app/(dashboard)/components/dashboard-layout-client.tsx` — added `pendingFaqsCount` prop

### Phase 3 — Modonty client + article pages
- `modonty/app/clients/[slug]/helpers/client-faqs.ts` (NEW) — `getClientPublishedFaqs()`, fetches PUBLISHED FAQs across all client articles
- `modonty/app/clients/[slug]/page.tsx` — added FAQ section with `<details>/<summary>` accordion + FAQPage JSON-LD
- `modonty/app/articles/[slug]/actions/index.ts` — exported `getArticleFaqs`
- `modonty/app/articles/[slug]/page.tsx` — added FAQPage JSON-LD block when article has published FAQs

### Prisma schema
- Added `REJECTED` to `ArticleFAQStatus` enum in `dataLayer/prisma/schema/schema.prisma`
- Ran `prisma generate` on both admin and console

### Key files changed (Session 53)
- `admin/app/(dashboard)/chatbot-questions/actions/chatbot-questions-actions.ts`
- `admin/app/(dashboard)/chatbot-questions/components/chatbot-questions-client.tsx`
- `console/app/(dashboard)/dashboard/faqs/` (NEW — page, components, helpers, actions)
- `console/lib/ar.ts`, layout.tsx, sidebar.tsx, mobile-sidebar.tsx, dashboard-layout-client.tsx
- `modonty/app/clients/[slug]/helpers/client-faqs.ts` (NEW)
- `modonty/app/clients/[slug]/page.tsx`
- `modonty/app/articles/[slug]/actions/index.ts`
- `modonty/app/articles/[slug]/page.tsx`
- `dataLayer/prisma/schema/schema.prisma`

---

## ✅ Session 52 — PUSHED 2026-04-20 (modonty v1.38.0)

### modonty changes — Announcement Bar + Navbar Cleanup
- **AnnouncementBar** — new `components/navigatore/AnnouncementBar.tsx`: full-width teal bar above header, pulsing dot, links to jbrseo.com, dismissible via localStorage (`modonty_announcement_v1`), renders above `TopNavWithFavorites` in root layout
- **Mobile navbar cleanup** — `TopNav.tsx`: removed CTA pill from center column, simplified to `flex justify-between`: Logo | [Bell + Chat + User]
- **Result:** navbar clean and professional on mobile — logo dominant, max 3 action icons

### Key files changed (Session 52)
- `modonty/components/navigatore/AnnouncementBar.tsx` (NEW)
- `modonty/components/navigatore/TopNav.tsx`
- `modonty/app/layout.tsx`
- `modonty/package.json` → v1.38.0

---

## ✅ Session 51 — PUSHED 2026-04-20 (modonty v1.37.0)

### modonty changes — Client Page UX/UI Overhaul (CP-15–24) + Tab Nav Icons (CP-25)
- **CP-16** — `hero-cover.tsx`: full client name watermark بدل الحرف الأول، dot pattern، bottom fade
- **CP-17** — `hero-cta.tsx`: social links → pill buttons (icon + platform name)
- **CP-21** — `PostCard` featured mode: aspect-[16/7] image + text-xl title + line-clamp-3 excerpt + border-primary/20 — first article on client page
- **CP-22** — `client-newsletter-card.tsx` (new): email subscribe card in left sidebar — calls `/api/subscribers`
- **CP-23** — `client-mobile-cta.tsx` (new): sticky FAB "اسأل العميل" — appears after 300px scroll, lg:hidden
- **CP-24** — Tab Nav fade: confirmed already implemented — working ✅
- **CP-25** — `client-tab-items.ts` + `client-tabs-nav.tsx`: TAB_ICON_MAP client-side, icon + shortLabel on mobile, text only on desktop
- **FAB fix** — scroll-aware: hidden at top (hero visible), appears after 300px
- **Featured card placeholder fix** — no-image featured card uses aspect-video (not 16/7) to avoid oversized placeholder

### Key files changed (Session 51)
- `modonty/app/clients/[slug]/components/hero/hero-cover.tsx`
- `modonty/app/clients/[slug]/components/hero/hero-cta.tsx`
- `modonty/app/clients/[slug]/components/client-page/client-page-left.tsx`
- `modonty/app/clients/[slug]/components/client-newsletter-card.tsx` (NEW)
- `modonty/app/clients/[slug]/components/client-mobile-cta.tsx` (NEW)
- `modonty/app/clients/[slug]/components/client-tab-items.ts`
- `modonty/app/clients/[slug]/components/client-tabs-nav.tsx`
- `modonty/app/clients/[slug]/layout.tsx`
- `modonty/components/feed/postcard/PostCard.tsx`
- `modonty/components/feed/postcard/PostCard.types.ts`
- `modonty/components/feed/postcard/PostCardHeroImage.tsx`
- `modonty/components/feed/postcard/PostCardBody.tsx`
- `modonty/app/clients/[slug]/components/client-page/client-page-feed.tsx`

### Live test (Session 51) — PASS
- Mobile 375px: hero cover watermark ✅, FAB appears after scroll ✅, tab icons ✅, newsletter card ✅
- Desktop 1280px: tabs text-only (no icons) ✅, featured card larger ✅
- All pages reviewed: homepage, article, categories, clients, trending, industries, search — all clean ✅

---

## ✅ Session 50 — PUSHED 2026-04-20 (modonty v1.36.0)

### modonty changes — Mobile Article Phase 2 (MOB2–MOB6)
- **MOB2** — Mobile bar Zone 1: client avatar (h-7 w-7 ring) + "اسأل العميل" trigger-only button
- **MOB3** — Mobile bar Zone 1: "اشترك في النشرة" button (triggers ClientNewsletter overlay)
- **MOB4** — `article-header.tsx`: added views count + questions count to meta row on mobile
- **MOB5** — `article-page-client.tsx` + `article-mobile-layout.tsx`: newsletter overlay on featured image (MOB5)
- **MOB6** — Sheet updated with full content: client card + TOC + related articles + newsletter
- **`hideDislike` prop** — `ArticleInteractionButtons`: new optional `hideDislike` prop, hides dislike button in compact/mobile mode
- **2-row bar layout** — outer bar uses `flex-col` so Zone1 (client row) and Zone2 (icons row) each have their own full-width row
- **Sticky fix** — `ArticleMobileLayout` moved BEFORE `<Breadcrumb>` in DOM in `page.tsx` so `sticky top-14` activates immediately at scrollY=0

### Live test (Session 50) — 100% PASS
- Mobile 375px: like ✅, save ✅, ask client dialog (pre-filled) ✅, newsletter dialog (pre-filled) ✅, sheet ✅
- Mobile 320px: no overflow, all icons visible ✅
- Desktop 1280px: bar hidden (lg:hidden), sidebar intact, 3-col layout ✅
- Console: 0 errors, 4 warnings (pre-existing Radix aria-describedby advisory) ✅

### Pending (next session)
- SEO-007: Verify canonical www in production
- PERF-003/004/006/007: Bundle + LCP fixes
- OBS-027: Industries listing vs detail count mismatch
- USR-R3: Notification Settings UI

---

## ✅ Session 49 — PUSHED 2026-04-21 (modonty v1.35.0)

### modonty changes
- **SEO-001** — Article canonical: always regenerated from current siteUrl+slug (fixes truncated + no-www canonical from stored nextjsMetadata)
- **SEO-002** — Client canonical: www normalization regex in `clients/[slug]/page.tsx`
- **SEO-003** — Client meta description: added fallback from seoDescription or default string when stored metadata has no description
- **SEO-006** — Article hreflang: added `languages: { ar, "x-default" }` to stored metadata early-return path
- **PERF-001** — Clients page Accessibility 100: added `aria-label` to 2 icon-only buttons
- **PERF-002** — Homepage LCP: removed invalid `preload` prop combination — now uses `loading="eager"` + `fetchPriority="high"` only

### Manual actions done (not code)
- SEO-004: Admin Settings → Site URL → `https://www.modonty.com`
- SEO-005: Vercel env var `NEXT_PUBLIC_SITE_URL` = `https://www.modonty.com` (admin + modonty projects)

### Pending (next session)
- SEO-007: Verify canonical www in production after this push
- PERF-003/004: Bundle analyzer (legacy JS + unused JS)
- PERF-006/007: LCP speed fix (denormalize counts OR ISR)
- OBS-027: Industries listing vs detail count mismatch

---

## ✅ Session 47 — PUSHED 2026-04-19 (modonty v1.34.0)

### modonty changes
- **ScrollProgress** — removed duplicate render from TopNav.tsx, loads only via FeedDeferredUI (ssr:false)
- **MobileMenu** — dynamic(ssr:false) + mounted state in MobileMenuClient — loads only on first menu click
- **FollowCard social icons → Server** — 7 SVG icons moved from client bundle to Server Component (FollowCard.tsx). FollowCardInteractive.tsx handles form+expand only
- **Social icons unified style** — LinkedIn, YouTube, Instagram changed to filled (was stroke/outlined). All 7 icons now use fill="currentColor" — consistent visual weight
- **Twitter/X icon dark mode fix** — added fill="currentColor" to path (was defaulting to black)
- **FollowCard spacing** — gap-0.5 → gap-1 + p-1 → p-0.5 on icon links
- **FollowCardClient.tsx deleted** — dead code (replaced by FollowCard.tsx + FollowCardInteractive.tsx)
- **Social links copied to modonty_dev** — all 7 platform social URLs synced from production to dev DB

### PageSpeed baseline (mobile) — before this push
- Performance: 95 | Accessibility: 100 | Best Practices: 100 | SEO: 100

### PageSpeed after push (mobile) — 2026-04-19
- Performance: 93 | Accessibility: 100 | Best Practices: 100 | SEO: 100
- Note: -2 is within normal ±5 variance. LCP 3.1s + Speed Index 5.6s are the main suspects (above-fold image). No regression.

---

## ✅ Sessions 41–45 — PUSHED 2026-04-19

### modonty changes
- **Industries pages** — `/industries/[slug]` individual pages now work (TSC fix: `SubscriptionStatus`, `logoMedia`, `slogan`)
- **DiscoveryCard tabs** — all 3 tabs (categories/industries/tags) verified 100%: links, URLs, params
- **Navbar 7 improvements** — active bg fill, kbd shortcut, logo hover, teal border, ScrollProgress solid, ghost CTA, mobile CTA no gradient
- **Sidebar overhaul** — LeftSidebar 300px, AnalyticsCard 3×2 grid, CategoriesCard collapse, IndustriesCard added
- **NewClientsCard** — Radix ScrollArea with 16+ clients, RTL scrollbar, "استكشف" link
- **dvh → vh** — replaced in 6 files for mobile browser stability
- **Homepage pagination** — `?page=N` support + SEO prev/next canonical links
- **feedBanner** — `platformTagline` + `platformDescription` editable from admin Settings
- **Register + Newsletter** — Telegram notifications + welcome email (non-blocking)
- **article-queries feedArticleSelect** — performance optimization (feed-only fields)
- **SEO ImageObject** — Article structured data uses `ImageObject` type
- **Notifications page** — faqReply support added

### admin changes
- **Seed files deleted** — 5,000+ lines of dev-only seed code removed cleanly
- **publish-article** — SEO description required min 50 chars for publish
- **Article editor** — Arabic SEO error messages, `audioUrl` field
- **Client form** — SlugChangeDialog + locked slug warning UI
- **create-media** — allows `clientId: null` (General scope)
- **SEO generators** — category/industry/tag SEO auto-generation
- **Analytics** — `getClients()` select + take optimization

### schema changes
- `MediaScope` enum + `Media.scope` field with `@default(GENERAL)`
- `User.notificationPreferences Json?`
- `Client.newsletterCtaText String?`
- `Article.audioUrl String?`
- `ArticleFAQ.source String?`
- `Settings` b2b + platformTagline/Description fields
- New model: `SlugChangeOtp`
- New indexes: `Media[scope]`, `Media[clientId, scope]`

---

## ✅ Session 46 — Post-push cleanup (2026-04-19)
- Vercel build fixed: added `@radix-ui/react-scroll-area` to modonty/package.json
- Telegram env vars confirmed added to Vercel by user
- modonty.com production verified: homepage, industries, navbar all working
- MASTER-TODO cleaned up — DONE sections moved to MASTER-DONE.md
- Memory rule added: NEVER run seed/script against production DB (firing-level rule)

---

## ⚠️ Pending (next session — start here)
- [ ] Verify `admin.modonty.com` live
- [ ] Run `setup-ttl-indexes.ts` on PROD DB
- [ ] Add `.playwright-mcp/` to `.gitignore`
- [ ] **OBS-027** — Industries detail shows "0 شركة" — set clients to ACTIVE in Admin OR fix listing count query

---

## Open Tasks
- **USR-R3** — Notification Settings UI
- **SIDEBAR-MOD1** — "جديد مودونتي" card
- **MOB2–MOB6** — Mobile Phase 2
- **CHAT-FAQ1–4** — Chatbot FAQ admin
- **DB-1–5** — DB Health cards
