# Session Context — Last Updated: 2026-04-20 (Session 51 — Client Page UX/UI Overhaul v1.37.0)

> This file is the handoff document for the next agent/session.
> Read this FIRST before starting any work.
> Update this file BEFORE every push.

---

## Current Versions
- **admin**: v0.36.0 ✅ (pushed 2026-04-19)
- **modonty**: v1.37.0 ✅ (pushed 2026-04-20)
- **console**: v0.1.2

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
