# DONE — كل المهام المنجزة
> **آخر تحديث:** 2026-04-20 (Session 56 — FAQ Workflow ✅)
> ملف مرجعي جامع لكل ما أُنجز عبر تاريخ المشروع.
> مرتّب بأقسام — كل قسم يمثل منطقة عمل مستقلة.

---

## Session 56 — FAQ Workflow (2026-04-20) ✅ — admin v0.37.0 | modonty v1.40.0 | console v0.2.0

### نظرة عامة
نظام FAQ كامل 3 مراحل: Admin يرسل → العميل يوافق في Console → ينشر على modonty مع FAQPage JSON-LD لـ Google Featured Snippets.

### ADMIN — Phase 1
- [x] **FAQ-FLOW-1** — `convertToArticleFaq` يحفظ `status: PENDING` بدل PUBLISHED
- [x] **FAQ-FLOW-2** — Button/dialog/toast: "Send to Client for Approval" بدل "Convert to FAQ"

### CONSOLE — Phase 2 (صفحة جديدة كاملة)
- [x] **FAQ-FLOW-3** — `/dashboard/faqs` — stat cards (pending/published/total) + filter tabs (الكل/بانتظار/منشورة/مرفوضة)
- [x] **FAQ-FLOW-4** — `approveFaq` + `rejectFaq` server actions مع ownership check
- [x] **FAQ-FLOW-5** — Sidebar badge للـ pending count — يتحدث تلقائياً
- [x] **FAQ-FLOW-6** — "تعديل الإجابة" textarea لتعديل الإجابة قبل النشر
- [x] **FAQ-FLOW-7** — Prisma: أضيف `REJECTED` لـ `ArticleFAQStatus` enum

### MODONTY — Phase 3
- [x] **FAQ-FLOW-8** — Client page: قسم "الأسئلة الشائعة" بـ `<details>/<summary>` accordion
- [x] **FAQ-FLOW-9** — Client page: FAQPage JSON-LD ← Google Featured Snippets
- [x] **FAQ-FLOW-10** — Article page: FAQPage JSON-LD عند وجود FAQs منشورة

### Key files (Session 56)
- `admin/app/(dashboard)/chatbot-questions/actions/chatbot-questions-actions.ts`
- `admin/app/(dashboard)/chatbot-questions/components/chatbot-questions-client.tsx`
- `console/app/(dashboard)/dashboard/faqs/` (NEW — page, components, helpers, actions)
- `console/lib/ar.ts` + layout.tsx + sidebar.tsx + mobile-sidebar.tsx + dashboard-layout-client.tsx
- `modonty/app/clients/[slug]/helpers/client-faqs.ts` (NEW)
- `modonty/app/clients/[slug]/page.tsx`
- `modonty/app/articles/[slug]/actions/index.ts` + `page.tsx`
- `dataLayer/prisma/schema/schema.prisma`

---

## Session 55 — CHAT-FAQ1–4 (2026-04-20) ✅

### ADMIN — Chatbot Questions Page
- [x] **CHAT-FAQ1** — Admin `/chatbot-questions`: صفحة تعرض كل أسئلة الـ chatbot مجمّعة حسب التكرار — stats row (Total / Unique / Converted)
- [x] **CHAT-FAQ2** — زر "Convert to FAQ" بـ dialog يحمّل السؤال والإجابة جاهزين للتعديل ثم ينشر على المقال مباشرةً
- [x] **CHAT-FAQ3** — فلتر scope (All/Article/Category) + source (All/Web/DB) + search bar
- [x] **CHAT-FAQ4** — Modonty: `getArticleFaqs` fix — يفلتر `status: PUBLISHED` فقط → الـ FAQs المحوَّلة تظهر تلقائياً على المقال

### Key files changed (Session 55)
- `admin/app/(dashboard)/chatbot-questions/page.tsx` (NEW)
- `admin/app/(dashboard)/chatbot-questions/loading.tsx` (NEW)
- `admin/app/(dashboard)/chatbot-questions/actions/chatbot-questions-actions.ts` (NEW)
- `admin/app/(dashboard)/chatbot-questions/components/chatbot-questions-client.tsx` (NEW)
- `admin/components/admin/sidebar.tsx` — added "Chatbot Questions" under Audience
- `modonty/app/articles/[slug]/actions/article-data.ts` — added `status: "PUBLISHED"` filter to `getArticleFaqs`

---

## Session 54 — modonty v1.40.0 (2026-04-20) ✅

### MODONTY — جديد مودونتي + Coming Soon page
- [x] **SIDEBAR-MOD1 → /whats-new** — بدل كارت sidebar، تحوّل لصفحة Coming Soon كاملة + pill link في بنر الهوم
- [x] **FeedContainer banner** — أضيف "جديد مودونتي" animated pill link يوصل لـ `/whats-new`
- [x] **`/whats-new` page** — Coming Soon: hero + badge + pulsing dot + 5 upcoming features grid + mystery card + "العودة للرئيسية" CTA (`app/whats-new/page.tsx` + `loading.tsx`)

### Key files changed (Session 54)
- `modonty/components/feed/FeedContainer.tsx`
- `modonty/app/whats-new/page.tsx` (NEW)
- `modonty/app/whats-new/loading.tsx` (NEW)

---

## Session 53 — modonty v1.39.0 (2026-04-20) ✅

### MODONTY — USR-R3: Notification Settings (full fix)
- [x] **Server Action** — `updateNotificationSettings`: `data: {}` → `data: { notificationPreferences: settings }` — now actually writes to DB
- [x] **GET API** — `/api/users/[id]/settings`: reads `notificationPreferences` from DB, merges with defaults — user sees their saved settings on load
- [x] **Settings tab** — added "الإشعارات" tab (IconBell) to `settings-tabs.tsx` — grid updated to `sm:grid-cols-5`
- [x] **renderSection()** — added `case "notifications": return <NotificationsSettings />` + dynamic import in `settings/page.tsx`
- [x] **Email guard** — comment reply route: fetches `notificationPreferences` on parent author, skips email if `emailCommentReplies === false`
- [x] **OBS-027** — `getIndustriesWithCounts`: `_count.clients` now filters `ACTIVE` only — listing matches detail count

### Key files changed (Session 53)
- `modonty/app/users/profile/settings/actions/settings-actions.ts`
- `modonty/app/api/users/[id]/settings/route.ts`
- `modonty/app/users/profile/settings/components/settings-tabs.tsx`
- `modonty/app/users/profile/settings/page.tsx`
- `modonty/app/api/articles/[slug]/comments/[commentId]/route.ts`
- `modonty/app/api/helpers/industry-queries.ts`

---

## Session 52 — modonty v1.38.0 (2026-04-20) ✅ PUSHED

### MODONTY — Announcement Bar + Navbar Cleanup + OBS-027 fix
- [x] **AnnouncementBar** — `components/navigatore/AnnouncementBar.tsx` (NEW): full-width teal bar above header on mobile only (`md:hidden`), pulsing dot, links to jbrseo.com, dismissible via localStorage key `modonty_announcement_v1`
- [x] **Mobile navbar cleanup** — `TopNav.tsx`: removed CTA pill from center, simplified to `flex justify-between`: Logo | [Bell + Chat + User]
- [x] **OBS-027** — Industries count mismatch fixed: `getIndustriesWithCounts()` now filters `_count.clients` by `subscriptionStatus: ACTIVE` — listing and detail now consistent
- [x] **`.playwright-mcp/` + `*.png`** added to `.gitignore`

### Key files changed (Session 52)
- `modonty/components/navigatore/AnnouncementBar.tsx` (NEW)
- `modonty/components/navigatore/TopNav.tsx`
- `modonty/app/layout.tsx`
- `modonty/app/api/helpers/industry-queries.ts`
- `.gitignore`

---

## Session 51 — modonty v1.37.0 (2026-04-20) ✅ PUSHED

### MODONTY — Client Page UX/UI Overhaul (CP-15 to CP-25)
- [x] **CP-15** — Hero CTA: added "اسأل العميل" primary button → `/clients/[slug]/contact` (`hero-cta.tsx`)
- [x] **CP-16** — Hero Cover fallback: dot pattern + full client name watermark + bottom fade gradient (`hero-cover.tsx`)
- [x] **CP-17** — Hero Social Links: redesigned as pill buttons with icon + platform name label (`hero-cta.tsx`)
- [x] **CP-18** — Left Sidebar: removed duplicate Stats Card (already shown in hero) (`client-page-left.tsx`)
- [x] **CP-19** — Right Sidebar: removed empty-state cards when followers=0 / reviews=0 (`client-page-right.tsx`)
- [x] **CP-20** — Left Sidebar: reordered — description (نبذة) first, then company info (`client-page-left.tsx`)
- [x] **CP-21** — Feed: featured first article card — `aspect-[16/7]` image, `text-xl` title, `line-clamp-3` excerpt, `border-primary/20` (`PostCard.types.ts`, `PostCard.tsx`, `PostCardHeroImage.tsx`, `PostCardBody.tsx`, `client-page-feed.tsx`)
- [x] **CP-22** — Left Sidebar: newsletter subscription card — email input → `/api/subscribers`, success/error states (`client-newsletter-card.tsx` NEW)
- [x] **CP-23** — Mobile: scroll-aware sticky FAB "اسأل العميل" — appears after 300px scroll, `fixed bottom-16`, `lg:hidden` (`client-mobile-cta.tsx` NEW + `layout.tsx`)
- [x] **CP-24** — Tab Nav: fade gradient on edges for hidden tabs on mobile — already implemented, confirmed working on 375px
- [x] **CP-25** — Tab Nav: icon + shortLabel on mobile, text-only on desktop — `TAB_ICON_MAP` in Client Component, `TabNavLink` updated (`client-tab-items.ts`, `client-tabs-nav.tsx`)
- [x] **OBS-034 fix** — Featured card no-image: always `aspect-video` regardless of `featured` prop (avoids oversized placeholder)

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

### Live Test — Production (Session 51)
- [x] Mobile 375px: hero cover watermark ✅, FAB after scroll ✅, tab icons ✅, newsletter card ✅
- [x] Desktop 1280px: tabs text-only ✅, featured card larger ✅
- [x] All pages reviewed: homepage, article, categories, clients, trending, industries, search ✅
- [x] TSC zero errors ✅ | Vercel build ✅ (hotfix fd5191e for missing page.tsx staged change)

---

## Session 50 — modonty v1.36.0 (2026-04-20) ✅ PUSHED

### MODONTY — Mobile Article Phase 2 (MOB2–MOB6)
- [x] **MOB2** — Mobile bar Zone 1: client avatar (h-7 w-7 ring) + "اسأل العميل" trigger-only button (pre-filled when logged in)
- [x] **MOB3** — Mobile bar Zone 1: "اشترك في النشرة" button → triggers ClientNewsletter overlay
- [x] **MOB4** — `article-header.tsx`: views + questions count في meta row (mobile)
- [x] **MOB5** — `article-featured-image-newsletter.tsx`: newsletter overlay على الصورة الرئيسية
- [x] **MOB6** — Sheet (`article-mobile-sidebar-sheet.tsx`): محتوى كامل — client card + TOC + related articles + newsletter
- [x] **hideDislike prop** — `ArticleInteractionButtons`: optional `hideDislike` — يخفي dislike في mobile compact mode
- [x] **2-row bar layout** — `flex-col` في الـ bar → Zone1 (client row) + Zone2 (icons row) كل واحدة على سطر مستقل
- [x] **Sticky fix** — `ArticleMobileLayout` نُقل قبل `<Breadcrumb>` في DOM → `sticky top-14` يشتغل من scrollY=0 مباشرة

### Live Test — Production (Session 50)
- [x] Mobile 375px: like ✅, save ✅, اسأل العميل (pre-filled) ✅, اشترك في النشرة ✅, sheet ✅
- [x] Mobile 320px: لا overflow، كل الأيقونات ظاهرة ✅
- [x] Desktop 1280px: bar مخفي (lg:hidden)، sidebar سليم ✅
- [x] Console: 0 errors ✅

### PageSpeed Scores (Mobile) — after v1.36.0
- Article page: **Performance 92** · Accessibility 100 · Best Practices 100 · SEO 100
- FCP 1.1s ✅ · LCP 2.7s 🟡 · TBT **80ms** ✅ (كان 250ms) · CLS 0.087 ✅

---

## Sessions 48–49 — modonty v1.35.0 (2026-04-21) ✅ PUSHED

### MODONTY — SEO Fixes
- [x] **SEO-001** — Article canonical: always regenerated from siteUrl+slug — fixes truncated + no-www canonical from stored nextjsMetadata (`articles/[slug]/page.tsx`)
- [x] **SEO-002** — Client canonical: www normalization regex (`clients/[slug]/page.tsx`)
- [x] **SEO-003** — Client meta description: fallback from seoDescription or default string when stored metadata has no description
- [x] **SEO-004** — Admin Settings → Site URL → `https://www.modonty.com` (manual)
- [x] **SEO-005** — Vercel `NEXT_PUBLIC_SITE_URL` = `https://www.modonty.com` in both admin + modonty projects (manual)
- [x] **SEO-006** — hreflang missing on article pages → added `languages: { ar, "x-default" }` to stored metadata early-return path
- [x] **SEO-007** — Article og:url also overridden with www — verified in production: canonical ✅ hreflang ✅ og:url ✅

### MODONTY — Performance
- [x] **PERF-001** — Clients page Accessibility 95→100: added `aria-label` to 2 icon-only buttons (`clients-content.tsx` + `client-card-external-link.tsx`)
- [x] **PERF-002** — Homepage LCP image: removed invalid `preload` prop — now uses `loading="eager"` + `fetchPriority="high"` per Next.js 16 App Router docs (`OptimizedImage.tsx` + `PostCardHeroImage.tsx`)
- [x] **PERF-005** — Article pages CAN be tested via PageSpeed using double-encoded Arabic URL — Result: Performance 87 · Accessibility 100 · Best Practices 100 · SEO 100

### PageSpeed Scores (Mobile) — after v1.35.0
- Homepage: Performance ~92 · Accessibility 100 · Best Practices 100 · SEO 100
- Article page: Performance 87 · Accessibility 100 · Best Practices 100 · SEO 100

---

## Session 47 — modonty v1.34.0 (2026-04-19) ✅ PUSHED

### MODONTY — Performance
- [x] ScrollProgress duplicate render fixed (TopNav → FeedDeferredUI only)
- [x] MobileMenu lazy loading — dynamic(ssr:false) + mounted state
- [x] FollowCard social icons → Server Component (7 SVGs out of client bundle)
- [x] Social icons unified to filled style (LinkedIn, YouTube, Instagram updated)
- [x] Twitter/X icon dark mode fix — fill="currentColor"
- [x] FollowCard icon spacing — gap-1 + p-0.5
- [x] FollowCardClient.tsx deleted (dead code)
- [x] CLIENT-COMPONENTS.md created — full audit of 35 client components
- [x] Social links synced to modonty_dev DB

---

## Sessions 41–46 — admin v0.36.0 + modonty v1.33.0 (2026-04-19) ✅ PUSHED

### MODONTY
- [x] `/industries` listing page — page.tsx + loading.tsx + getIndustriesWithCounts updated
- [x] `/industries/[slug]` detail pages — TSC fix: `SubscriptionStatus`, `logoMedia`, `slogan`
- [x] DiscoveryCard tabs — categories/industries/tags links 100% verified
- [x] Navbar 7 improvements — active bg, kbd shortcut, logo hover, teal border, ScrollProgress solid, ghost CTA, mobile CTA no gradient
- [x] LeftSidebar width 240px → 300px
- [x] AnalyticsCard 3×2 grid compact layout
- [x] CategoriesCard collapse (top 3 + "المزيد")
- [x] IndustriesCard added to LeftSidebar
- [x] NewClientsCard — Radix ScrollArea, 16+ clients, RTL scrollbar, "استكشف" link
- [x] `vh` → `dvh` global replace (6 files)
- [x] Homepage pagination `?page=N` + SEO prev/next canonical
- [x] feedBanner `platformTagline` + `platformDescription` editable from Settings
- [x] Register + Newsletter — Telegram notifications + welcome email (non-blocking)
- [x] feedArticleSelect performance optimization
- [x] SEO ImageObject in Article structured data
- [x] Notifications page — faqReply support
- [x] Vercel build fix — added `@radix-ui/react-scroll-area` to modonty/package.json
- [x] Telegram env vars added to Vercel (user confirmed)
- [x] modonty.com production verified — homepage, industries, navbar ✅

### ADMIN
- [x] Seed files deleted — 5,000+ lines dev-only code removed
- [x] publish-article — SEO description min 50 chars required
- [x] Article editor — Arabic SEO error messages, `audioUrl` field
- [x] Client form — SlugChangeDialog + locked slug warning
- [x] create-media — allows `clientId: null` (General scope)
- [x] SEO generators — category/industry/tag auto-generation
- [x] Analytics — `getClients()` select + take optimization
- [x] Media picker simplified overlay (hover cleaner)

### SCHEMA
- [x] `MediaScope` enum + `Media.scope @default(GENERAL)`
- [x] `User.notificationPreferences Json?`
- [x] `Client.newsletterCtaText String?`
- [x] `Article.audioUrl String?`
- [x] `ArticleFAQ.source String?`
- [x] `Settings` b2b + platformTagline/Description fields
- [x] New model: `SlugChangeOtp`
- [x] New indexes: `Media[scope]`, `Media[clientId, scope]`

### POST-PUSH
- [x] OTP-AUDIT-4 — Telegram Bot token confirmed in Vercel env vars ✅

---

## Session 40 — Modonty UX Fixes (2026-04-18)

- [x] **OBS-025** — Client hero "SA" → "السعودية": exported `localizeCountry()` from `utils.tsx` + used in `hero-meta.tsx:53`

### Verified already fixed (no code change needed)
- [x] **OBS-009** — Article title overflow (break-words) — confirmed in `article-header.tsx`
- [x] **OBS-011** — Bottom nav covers content — confirmed `pb-16 md:pb-0` in `layout.tsx`
- [x] **OBS-016** — 404 missing bottom nav — confirmed root layout includes `MobileFooterWithFavorites`
- [x] **OBS-026/CP-14** — Hero stats row wraps on mobile — confirmed `flex-nowrap` + `shrink-0` in `hero-meta.tsx`

---

## 0. Mobile UX — Live Audit (2026-04-13) — 18/18 مشكلة ✅

> **Source:** Live Playwright audit — 375×812px (iPhone) — جميع صفحات modonty.com
> **تم الإنجاز:** جلسة واحدة — 2026-04-13

- [x] **MOB-001** — Broken slug `/articles/م` — slug updated in DB + cache revalidated
- [x] **MOB-002** — Navbar congested on mobile — `hidden sm:flex` on CTA pill + 3-column grid
- [x] **MOB-003** — Article title overflows (mixed Arabic/English) — `break-words` on `<h1>` in article-header.tsx
- [x] **MOB-004** — Bottom nav covers page content — `pb-16 md:pb-0` on `<main>` in layout.tsx
- [x] **MOB-005** — Trending thumbnails missing — CLOSED (already vertical aspect-video cards)
- [x] **MOB-006** — Terms/Legal headings clipped — VERIFIED FIXED (wraps correctly)
- [x] **MOB-007** — Login page ~80px dead space — removed `min-h-screen`, replaced with `py-8 sm:py-24`
- [x] **MOB-008** — 404 missing bottom nav — VERIFIED FIXED (nav present)
- [x] **MOB-009** — Categories count label too small — `text-xs` → `text-sm` in EnhancedCategoryCard + CategoryListItem
- [x] **MOB-010** — FeaturedClientCard plain gray placeholder — gradient + large initials fallback
- [x] **MOB-011** — Article toolbar + login hint cramped — resolved via MOB-016 (`hideLoginHint`)
- [x] **MOB-012** — Search nav item no active state — MobileFooter → `"use client"` + `usePathname()`
- [x] **MOB-013** — (merged with MOB-018)
- [x] **MOB-014** — Subscribe page duplicate title — removed `CardTitle` from subscribe-form.tsx
- [x] **MOB-015** — About page no section dividers — `prose-h2:border-t prose-h2:pt-6 prose-h2:mt-8` on prose wrapper
- [x] **MOB-016** — Article floating toolbar overlaps bottom nav — `bottom-16` → `bottom-20` + `hideLoginHint`
- [x] **MOB-017** — FALSE POSITIVE — Arabic numerals rendering was correct
- [x] **MOB-018** — Trending card layout — CLOSED (vertical aspect-video already); added no-image IconArticle placeholder

**Perf pass (same session):**
- [x] `ssr: false` pattern — moved all `dynamic({ ssr: false })` calls to `client-lazy.tsx` (`"use client"` wrapper)
- [x] LeftSidebar parallel fetch — `Promise.all([getCategoriesWithCounts(), getCategoryAnalytics(), getOverallCategoryAnalytics()])`
- [x] 11 missing `loading.tsx` skeletons added (subscribe, profile, help, faq, feedback, terms, 4× legal, news/subscribe)

---

## 1. الأمان والبنية التحتية (Security & Infrastructure)

- [x] Auth + Zod + slug uniqueness على كل الكيانات (articles, clients, categories, tags, industries, authors, media, settings)
- [x] Auth على إدارة المستخدمين (create/update/delete admin)
- [x] Error boundaries: `error.tsx` موجود في كل الأقسام
- [x] Security headers في `next.config.ts` (HSTS, XSS, CSP, Frame-Options)
- [x] Rate limiting على كل Public API routes / Server Actions

---

## 2. Admin — المقالات (Articles)

### UI & Form
- [x] نموذج المقال: من 12 خطوة إلى 5 خطوات
- [x] Auto-save كل 30 ثانية في وضع التعديل
- [x] عداد الكلمات المباشر في footer المحرر
- [x] تحذير "تغييرات غير محفوظة" قبل مغادرة الصفحة (beforeunload — مُحكم وليس aggressive)
- [x] محرر TipTap المُحسَّن (20 أداة)
- [x] شريط التقدم: إصلاح من 56% → 60% كحد أدنى للنشر
- [x] بوابة النشر عند 60% SEO
- [x] إعادة تصميم قائمة المقالات (status tabs, compact stats, clean table)
- [x] إعادة تصميم صفحة التفاصيل (live preview)
- [x] إضافة TOC + Author Bio لصفحة العرض
- [x] إنشاء صفحة Technical منفصلة
- [x] حذف صفحة Preview القديمة
- [x] حذف Bulk Selection
- [x] حذف 30+ ملف dead code
- [x] Beta testing banner

### SEO & Logic
- [x] محلل SEO موحّد (نظام واحد، لا نظامين)
- [x] حذف فحوصات SEO الوهمية (filler checks)
- [x] إصلاح type guard في الـ normalizer
- [x] إصلاح JSON-LD validator
- [x] إصلاح media update revalidation
- [x] إصلاح redirect بعد التحديث
- [x] إصلاح SEO title truncation عند حدود الكلمة
- [x] SEO cascades (author/category/client/media)

### Security
- [x] Auth على كل المutations
- [x] Zod server-side validation
- [x] Slug uniqueness validation
- [x] XSS sanitization
- [x] Optimistic locking
- [x] Status machine transitions (draft → review → published)

### Testing
- [x] Playwright E2E tests (6 اختبارات)
- [x] Seed data محسّن (محتوى عربي غني + FAQs)

---

## 3. Admin — العملاء (Clients)

- [x] Auth على كل mutations
- [x] Zod server-side validation (client-server-schema.ts)
- [x] Slug uniqueness validation
- [x] إزالة Bulk delete
- [x] إصلاح Tax ID assignment bug
- [x] إصلاح JSON-LD @id/@type
- [x] Cascade: client update → article JSON-LD regeneration
- [x] إعادة تصميم كامل للـ UI
- [x] error.tsx boundary
- [x] واجهة عربية → إنجليزية (65+ label في 10 form components)

---

## 4. Admin — التصنيفات (Categories)

- [x] Auth على create/update/delete
- [x] Zod validation (category-server-schema.ts)
- [x] Slug uniqueness قبل الحفظ
- [x] error.tsx boundary
- [x] رسائل خطأ → إنجليزية
- [x] JSON-LD: Organization + WebSite في @graph
- [x] JSON-LD: Breadcrumb labels → إنجليزية
- [x] Metadata: alternates.languages (ar-SA)
- [x] CRUD كامل
- [x] تسلسل هرمي للتصنيفات الأب + tree view
- [x] JSON-LD (CollectionPage) + metadata cache
- [x] Cascade إلى المقالات عند التحديث
- [x] حماية الحذف (يمنع الحذف إذا عنده مقالات أو أبناء)
- [x] SEO health gauge
- [x] Loading skeletons
- [x] CSV export
- [x] Batch SEO regeneration

---

## 5. Admin — الوسوم (Tags)

- [x] Auth على create/update/delete
- [x] Zod validation (tag-server-schema.ts)
- [x] Slug uniqueness قبل الحفظ
- [x] error.tsx boundary
- [x] رسائل خطأ → إنجليزية
- [x] JSON-LD: Organization + WebSite في @graph
- [x] JSON-LD: Breadcrumb labels → إنجليزية
- [x] Metadata: alternates.languages (ar-SA)
- [x] CRUD كامل
- [x] JSON-LD (CollectionPage + DefinedTerm + BreadcrumbList)
- [x] Metadata cache + listing cache regeneration
- [x] Delete protection (يمنع الحذف إذا عنده مقالات)
- [x] SEO health gauge
- [x] Loading skeletons
- [x] Revalidate SEO buttons (single + batch)

---

## 6. Admin — الوسائط (Media)

- [x] إعادة تصميم Header
- [x] إعادة تصميم Grid مع تجميع بالعميل
- [x] Upload page — 3-column grid
- [x] EXIF removal عند الرفع
- [x] Image SEO (alt text, JSON-LD creditText/copyrightHolder)
- [x] Image sitemap
- [x] Search + pagination
- [x] Usage indicator
- [x] إعادة تصميم Edit form
- [x] Empty state
- [x] إزالة Bulk delete
- [x] إصلاح Featured Image preview: `object-cover` → `object-contain` (admin v0.28.0)

---

## 7. Admin — الإعدادات (Settings)

- [x] واجهة عربية → إنجليزية (Arabic labels → English)
- [x] Settings change → auto-cascade إلى كل الكيانات (v0.17.0)
- [x] Slug box ظاهر في كل نماذج الكيانات (categories, tags, industries, authors)
- [x] Social media URLs: من env vars إلى DB (getPlatformSocialLinks())
- [x] Industry cascade to clients

---

## 8. Admin — النظام العام

- [x] Toast UI: رسائل عربية، أيقونات، ألوان، auto-dismiss
- [x] Arabic tooltips + SEO analyzer messages
- [x] Changelog + team notes system
- [x] Feedback banner (Send Note → DB + email)
- [x] Bulk SEO fix لمقالات ذات نقاط منخفضة (SEO Overview page)
- [x] Industry cascade to clients
- [x] Seed data محسّن

---

## 9. Modonty — الصفحة الرئيسية والعامة (Public Site)

- [x] **HP1** — `/articles` كانت تعطي 404 → redirect 308 إلى `/`
- [x] **HP2** — إضافة تعريف المنصة للزائر الجديد فوق الـ feed
- [x] **HP3** — قسم "جديد مودونتي" يختفي إذا كان فارغاً (`articles.length === 0 → null`)
- [x] **HP4** — بطاقات المقالات: placeholder `bg-muted` + IconArticle إذا لا توجد صورة
- [x] **G1** — JWTSessionError في Console: `AUTH_SECRET` جديد + NEXTAUTH_URL صُحّح
- [x] **G2** — Footer quick links: الرئيسية / الرائجة / العملاء / عن مودونتي
- [x] **G3** — نشرة الاشتراك: error state + "جاري الاشتراك..." في newsletter-cta.tsx
- [x] Domain redirect: 307 → 308 من Vercel Dashboard
- [x] Loading pages: 11 ملف جديد (about, contact, legal, login, authors/[slug], notifications, favorites, liked, disliked, comments, following)

---

## 10. Modonty — صفحة المقال (Article Page)

- [x] **A1** — نص المقال في المنتصف → `text-right` + `direction: rtl`
- [x] **A2** — أقسام مخفية → التعليقات + مقالات ذات صلة + المزيد من Modonty/العميل مفتوحة
- [x] **A3** — ترتيب Sidebar الأيمن خاطئ → الترتيب الصح: Author card → TOC → Newsletter
- [x] **A4** — Sidebars تختفي وتترك فراغاً → `sticky top-[3.5rem] self-start h-[calc(100vh-4rem)]`
- [x] **A5** — زر "اسأل العميل" نص ثابت → ديناميكي `اسأل {clientName} مباشرةً` + لون amber
- [x] **A6** — شريط تقدم القراءة → كان مفعّلاً بالفعل في `page.tsx`
- [x] **M1** — Breadcrumb على الموبايل سطرين → `overflow-hidden` + `truncate` على 390px
- [x] صورة المقال — فراغ فوق وتحت → `object-cover` متطابق مع guidelines 16:9

---

## 11. Modonty — SEO Technical

### إصلاحات SEMrush الأساسية
- [x] **SEMR-1** — 93 رابط داخلي مكسور → بناء `/tags/[slug]` page كاملة (v1.29.0)
- [x] **SEMR-2** — 85 structured data item خاطئة → `fixAtKeywordsDeep()` recursive في `jsonld-processor.ts` + regenerate 23 مقال على production
- [x] **SEMR-2B** — 113 Breadcrumb خاطئة → حذف HTML microdata من `breadcrumb.tsx` — JSON-LD فقط (v1.29.6) · مؤكد: Google Rich Results Test → 0 errors
- [x] **SEMR-3** — 1,430 resource محجوب في robots.txt → حذف `/_next/` من قاعدة `*` (v1.29.0)
- [x] **SEMR-4** — 10 صفحات 4XX → بناء `/tags` index page كاملة (v1.29.0)
- [x] **SEMR-5** — 10 صفحات خاطئة في sitemap → إضافة `/tags` + كل `/tags/[slug]` لـ sitemap.ts
- [x] **SEMR-6** — 15 صفحة title طويل → max(51) في admin schemas + slice(0,51) على modonty fallbacks
- [x] **SEMR-7** — 3 صفحات بدون meta description → fallback descriptions ثابتة في 3 صفحات
- [x] **SEMR-8** — 5 صفحات بـ H1 مكرر → حذف sr-only h1 الزائد + FeedContainer h1→h2
- [x] **SEMR-9** — 7 روابط خارجية مكسورة → استبدال كل الروابط الوهمية بروابط مودونتي الحقيقية + twitter.com→x.com
- [x] **SEMR-10** — 20 رابط بدون anchor text → `aria-label` على links + `aria-hidden` على spans
- [x] **SEMR-11** — 9 صفحات orphan (رابط واحد فقط) → إضافة روابط داخلية من صفحات ذات صلة
- [x] **SEMR-12** — 12 URL تعمل redirect دائم → إصلاح جذري للـ canonical

### إصلاحات Audit إضافية
- [x] **AUDIT-1** — Homepage بدون H1 → `<h1 className="sr-only">مودونتي — منصة المحتوى العربي</h1>` (v1.29.0)
- [x] **AUDIT-2** — Response time 1.88s → `cacheLife("hours")` + parallel fetch + cached helper (v1.29.x)
- [x] **AUDIT-3** — Language not detected → ليست مشكلة حقيقية. `lang="ar" dir="rtl"` موجود
- [x] **AUDIT-4** — Backlink spam من linkbooster → disavow file جاهز (لا يُرفع إلا عند Manual Action)

### إصلاحات الـ Canonical (www)
- [x] 9 صفحات خاطئة في sitemap (non-www → www) → تغيير جميع fallbacks في 15 ملف (v1.29.7)
- [x] 4 روابط داخلية مكسورة + 1 صفحة 4XX → إنشاء `app/legal/page.tsx` + إضافة للـ sitemap (v1.29.8)
- [x] 2 hreflang conflicts → محلول بـ www fix (v1.29.7)
- [x] 1 hreflang redirect (308) على /tags → محلول بـ www fix (v1.29.7)
- [x] AI-BOT-1/2/3 → لا مشكلة. `/users/login/` و `/users/profile/` محجوبتان عمداً — صحيح

---

## 12. Modonty — Semantic HTML

- [x] **SEM-1a→g** — 7 صفحات: إزالة `<main>` وإحلال `<div>` (لأن root layout عنده main)
- [x] **SEM-2a** — `clients/page.tsx` → `<h1 sr-only>العملاء</h1>`
- [x] **SEM-2b** — `categories/page.tsx` → `<h1 sr-only>التصنيفات</h1>`
- [x] **SEM-2c** — `users/profile/page.tsx` → `<h1 sr-only>الملف الشخصي</h1>`
- [x] **SEM-2d→i** — 6 صفحات profile (favorites, liked, comments, following, disliked, settings) → sr-only h1 مضاف
- [x] **SEM-3a** — `authors/[slug]/page.tsx` → `aria-labelledby="author-articles-heading"`
- [x] **SEM-3b** — `news/page.tsx` → `aria-labelledby="news-articles-heading"`
- [x] **SEM-4** — `MobileFooter.tsx` → `aria-label="التنقل السفلي"`
- [x] **SEM-5a→i** — 9 error.tsx جديدة (clients, categories, authors/[slug], trending, subscribe, users/profile, users/login, help, help/faq)
- [x] **SEM-6a** — `LeftSidebar.tsx` → `aria-label="الشريط الجانبي الأيسر"`
- [x] **SEM-6b** — `RightSidebar.tsx` → `aria-label="الشريط الجانبي الأيمن"`
- [x] **SEM-6c** — `SidebarSkeletons.tsx` → `aria-hidden="true"` على كلا الـ skeletons

---

## 13. Modonty — الشات بوت (Chatbot)

- [x] **CHAT-1** — "اسأل العميل" بعد جواب الذكاء الاصطناعي → بطاقة gradient مع زرَّي "اقرأ المقال" و"اسأل العميل"
- [x] **CHAT-2** — اقتراح ذكي للفئة من أول رسالة → Cohere embed + cosine similarity → UI تأكيد مع category icon
- [x] **CHAT-3** — جواب الويب → بطاقة أقرب مقال (أعلى مشاهدات في الفئة)
- [x] **CHAT-4** — Trusted sources filter + UNTRUSTED_DOMAINS blacklist
- [x] **CHAT-5** — Hard test 8 cases — كلها نجحت. Bugs مُصلحة: scope threshold، empty message filter، trusted domains
- [x] Category-scoped chatbot — `api/chatbot/chat/route.ts`
- [x] Article-scoped chatbot — `api/articles/[slug]/chat/route.ts`
- [x] RAG pipeline (Cohere + rerank) — `lib/rag/`
- [x] Serper fallback (web search) — `lib/serper.ts`
- [x] Out-of-scope detection — `lib/rag/scope.ts`
- [x] Streaming (NDJSON)
- [x] Chat history في DB — `lib/chat/save-chatbot-message.ts`
- [x] History UI — `ChatHistoryList.tsx`
- [x] Prompt Engineering — 4 prompts قوية (category DB/web + article DB/web)

---

## 14. Modonty — حسابات المستخدمين (User Accounts)

- [x] **USR-B1** — المظهر + التفضيلات يعرضان نفس الكومبوننت → دُمجا في case واحد
- [x] **USR-B3** — حقل Bio: schema + action + JWT session + عرض في الملف الشخصي
- [x] **USR-U1** — Settings tabs مُبسَّطة من 7 إلى 4 (الملف الشخصي · الأمان · المظهر · الحساب)
- [x] **USR-U4** — Badge الإشعارات stale → `BellRevalidateTrigger` في notifications page
- [x] **USR-B5** — تاب "غير المعجبة" حُذف من profile-tabs.tsx، الـ grid من 6 إلى 5
- [x] **USR-BUG** — `replyToQuestion` في console لم تُنشئ إشعار → أُضيفت notification creation لـ faq_reply

---

## 15. Modonty — التفاعل والتحليلات (Analytics & Interactions)

### إصلاحات البيانات
- [x] تغيير حالة التعليق الجديد من "موافق تلقائياً" → "قيد الانتظار"
- [x] تحويل صفحة `/subscribe` للاستدعاء الصحيح
- [x] إضافة حد أقصى للإرسال لكل مستخدم
- [x] إضافة حد أقصى للمشاركة لكل مستخدم

### اختبارات Analytics المؤكدة
- [x] قراءة مقالة 30 ثانية + تمرير 70%+ → `timeOnPage` و`scrollDepth` محدّثان في DB
- [x] إعجاب/إلغاء إعجاب → toggle يعمل صح
- [x] إعجاب + عدم إعجاب → لا يمكن الاثنان معاً
- [x] مفضلة → تُحفظ وتبقى بعد إعادة التحميل
- [x] مشاركة عبر Twitter، WhatsApp، نسخ الرابط → كل منصة تُسجَّل بشكل مستقل
- [x] تعليق جديد → حالة PENDING في DB
- [x] رد على تعليق → `parentId` صحيح
- [x] إعجاب على تعليق → `commentLike` في DB
- [x] متابعة/إلغاء متابعة → تبقى بعد إعادة التحميل
- [x] نموذج "اسأل العميل" → `articleFAQ` بحالة PENDING، ثم يظهر بعد الرد
- [x] نموذج تواصل → "تم إرسال رسالتك بنجاح"
- [x] اشتراك في النشرة → نجاح + duplicate protection

---

## 16. Modonty — JBRSEO CTAs

- [x] **JBRSEO-1** — Header CTA "عملاء بلا إعلانات ↗" — ديسكتوب + موبايل
- [x] **JBRSEO-2** — `/clients` CTA panel gradient في نهاية الصفحة
- [x] **JBRSEO-3** — ClientsHero إعادة تصميم بعمودين B2C + B2B + نصوص SEO
- [x] **JBRSEO-4** — Footer CTA "هل تريد عملاء من جوجل بلا إعلانات؟ جبر SEO ↗"
- [x] **JBRSEO-5** — Client page CTA "أعجبك ما رأيت؟" في نهاية كل صفحة عميل
- [x] **JBRSEO-6** — Article footer CTA "تريد محتوى مثل هذا يجذب عملاء؟"

---

## 17. Console — إصلاحات البيانات

- [x] **BUG-01** — توزيع عمق التمرير = 0% → إصلاح معادلة حساب الـ buckets
- [x] **BUG-02** — وقت القراءة = 0 ثانية دائماً → إصلاح aggregation من DB
- [x] **BUG-03** — التحويلات تظهر 0 رغم وجود بيانات → إصلاح query
- [x] **BUG-04** — إحصائية الأسئلة: الإجمالي=1 لكن الجدول=8 → توحيد مصدر البيانات
- [x] **BUG-05** — Return Rate: معادلة خاطئة → إصلاح الحساب
- [x] **BUG-06** — المستخدمون النشطون يتأثر بـ null sessionId → إضافة null filter
- [x] **BUG-07** — فارق في المشاهدات: Dashboard=19 vs Analytics=20 → توحيد المصدر
- [x] **BUG-08** — لا يوجد قسم CTA Clicks → إضافة القسم
- [x] **BUG-09** — Engagement Score يفقد 35% من مكوناته → إصلاح الحساب الكامل

---

## 18. Brand Compliance

- [x] **BR1-4** — فحص 432 ملف، 66 violation في 24 ملف → كلها محوّلة لـ `text-primary` / `bg-primary/10` / `text-accent` / `text-destructive`

---

## 19. SEO JSON-LD (Structured Data)

- [x] **SEO-A1** — Breadcrumb JSON-LD مضاف لصفحة المقال
- [x] **SEO-A2** — JSON-LD fallback للمقالات بدون DB cache → `generateArticleStructuredData` live fallback
- [x] **SEO-IMG1** — صور المقالات في sitemap.ts عبر `images[]` property
- [x] Organization + WebSite JSON-LD في كل الصفحات
- [x] Person (Author) JSON-LD في صفحات الكتّاب
- [x] FAQPage JSON-LD للمقالات التي فيها أسئلة
- [x] مؤكد بـ Google Rich Results Test: **7 valid items — 0 errors — 0 warnings**

---

## 20. Modonty + Admin — إصلاحات 2026-04-17

- [x] **QAUDIT-M1-FIX** — `select` بدل `include` في 4 feed functions (`getArticlesCached`, `getFeaturedArticles`, `getRecentArticles`, `getTrendingArticles`) — توفير ~300-800KB لكل طلب feed — File: `modonty/app/api/helpers/article-queries.ts`
- [x] **FEED-1** — PostCard no-image placeholder: شعار العميل (opacity-30) بدل المربع الفارغ — File: `modonty/components/feed/postcard/PostCardHeroImage.tsx`
- [x] **OTP-AUDIT-3** — Rate limiting (3 requests/10min) + `crypto.randomInt` بدل `Math.random()` — File: `admin/app/(dashboard)/clients/actions/clients-actions/slug-change-otp.ts`
- [x] **AvatarFallback crash** — hero-avatar.tsx: `AvatarFallback` → `span` — 2026-04-16
- [x] **create-article.ts finalStatus bug** — WRITING hardcoded → ديناميكي — 2026-04-16
- [x] **CP-3** ✅ 2026-04-17 — Hero cover aspect ratio: `aspect-[6/1]` → `aspect-[3/1] sm:aspect-[4/1] md:aspect-[6/1]` — موبايل 62px → 125px — File: `hero-cover.tsx`
- [x] **OBS-025** ✅ 2026-04-17 — Country code "SA" → "السعودية" عبر `localizeCountry()` map — File: `hero/utils.tsx`
- [x] **CP-4** ✅ 2026-04-17 — Tabs: `shortLabel` للـ "تواصل" + gradient fade edges + padding مضغوط — File: `client-tabs-nav.tsx`
- [x] **CP-5** ✅ 2026-04-17 — Sidebar: استبدل "ملخص الأعمال" بـ grid إحصائيات (مقال · متابع · مشاهدة) مع `Intl.NumberFormat("ar-SA")` — Files: `client-page-left.tsx`, `types.ts`, `page.tsx`
- [x] **CP-7** ✅ 2026-04-17 — Hero stats row: icon + bold number + label + faint dividers بدل plain text dots — File: `hero-meta.tsx`
- [x] **CP-8** ✅ 2026-04-17 — Feed heading "أحدث المقالات" + count badge (يظهر فقط إذا posts > 0) — File: `client-page-feed.tsx`
- [x] **CP-9** ✅ 2026-04-17 — Follow button: brand teal (accent) + bold "✓ متابَع" عند المتابعة، hover → destructive red "إلغاء المتابعة" — File: `client-follow-button.tsx`
- [x] **CP-10** ✅ 2026-04-17 — Mobile back button "العملاء ›" (`sm:hidden`) + breadcrumb `hidden sm:block` — File: `layout.tsx`
- [x] **CP-14** ✅ 2026-04-17 — Hero stats row regression: `flex-nowrap` + `text-xs sm:text-sm` + `shrink-0` على كل stat — File: `hero-meta.tsx`
- [x] **CP-6** ✅ 2026-04-17 — Sidebar "الصور": removed `ClientPhotosPreview` from `client-page-right.tsx` — photos only in dedicated tab — File: `client-page-right.tsx`
- [x] **CP-11** ✅ 2026-04-17 — إخفاء تابات "الريلز" و"الإعجابات" تلقائياً — filter in `layout.tsx` (Server Component), `ALL_TAB_ITEMS` in shared `client-tab-items.ts` — Files: `layout.tsx`, `client-tabs-nav.tsx`, `client-tab-items.ts`
- [x] **CP-12** ✅ 2026-04-17 — شارة التوثق: `h-5 w-5 md:h-6 md:w-6` → `h-6 w-6 md:h-7 md:w-7` — File: `hero-name-row.tsx`
- [x] **CP-13** ✅ 2026-04-17 — Share button: `aria-label="مشاركة"` already present in `ShareButtons.tsx` — VERIFIED ✓
- [x] **CP-2** ✅ 2026-04-17 — Hero tagline showed English `businessBrief` on Arabic public page — fixed: `getTagline()` now uses `slogan` (short Arabic motto) → falls back to `industry · location` — Files: `hero/types.ts`, `hero/utils.tsx`
- [x] **ARCH-1** ✅ 2026-04-17 — Archive/Unarchive buttons had no feedback — added toast: "تم أرشفة المقال / تم إلغاء الأرشفة" — File: `archive-article-button.tsx`
- [x] **PUSH-4** ✅ 2026-04-17 — SEO gate error was English: `"SEO score is X%..."` → Arabic: `"نقاط SEO X% — الحد الأدنى 60%..."` — File: `update-article.ts`
- [x] **PUSH-5** ✅ 2026-04-17 — VERIFIED already uses `messages.error.save_failed` in both error cases — no change needed — File: `article-form-navigation.tsx`
- [x] **A9** ✅ 2026-04-17 — VERIFIED: "اقرأ المزيد" is `aria-hidden="true"` (correct stretched-link pattern — title link is the accessible element) — no change needed
- [x] **QAUDIT-M2** ✅ 2026-04-17 — VERIFIED: `getArticleComments` uses lean `commentSelect` (id, content, createdAt, status, parentId, author: {id,name,image}, _count) — no change needed
- [x] **QAUDIT-M3** ✅ 2026-04-17 — VERIFIED: `getArticleFaqs` uses explicit `select: {id, question, answer, position}` — no change needed
- [x] **QAUDIT-M4** ✅ 2026-04-17 — VERIFIED: all 3 related article functions use proper `select:` + `take: 6`. Bonus: fixed `getArticleBySlug` — `client: { include: ... }` → `client: { select: {id, name, slug, description, logoMedia, heroImageMedia} }` — File: `article-data.ts`
- [x] **SEO-A4** ✅ 2026-04-17 — Article image in JSON-LD was a plain URL string → now proper `ImageObject` `{@type, url, width, height, name}` — Fixed in 2 places: `admin/helpers/article-seo-config/generate-article-structured-data.ts` + `modonty/lib/seo/index.ts`
- [x] **OBS-023** ✅ 2026-04-17 — VERIFIED: toast already present in `ClientHeroModal.handleSave` — no change needed
- [x] **USR-N1** ✅ 2026-04-17 — `faq_reply` notification showed "اختر رسالة" because `relatedId` was never saved + no FAQ render path. Fix: (1) added `relatedId: faq.id` in console's `replyToQuestion` action. (2) Added `faq_reply` case in modonty notifications page — fetches `ArticleFAQ` and renders question + answer + article link — Files: `console/questions/actions/question-actions.ts`, `modonty/app/users/notifications/page.tsx`
- [x] **MOB7** ✅ 2026-04-17 — VERIFIED: `AskClientDialog` already receives `clientName` prop everywhere (sidebar card line 111, chatbot line 526) and renders `اسأل ${clientName} مباشرةً` dynamically — no change needed
- [x] **A8** ✅ 2026-04-17 — TOC active class wasn't working because headings had no IDs in the live DOM (TipTap doesn't inject them). Fix: read headings from `#article-content` live DOM + inject `toc-N` IDs if missing → IntersectionObserver can now observe them. Also improved: picks topmost visible heading in callback. File: `modonty/app/articles/[slug]/components/sidebar/article-table-of-contents.tsx`
- [x] **JBRSEO-7** ✅ 2026-04-17 — Added B2B section "للشركات والأعمال" to `/about` page — gradient card with 3 value bullets + "ابدأ مع جبر SEO ↗" CTA → jbrseo.com. Live tested ✅ — File: `modonty/app/about/page.tsx`
- [x] **SEO-INF1/2/3/4** ✅ 2026-04-17 — SEO Infinite Scroll: (1) `/?page=N` SSR support — loads N×10 articles so crawlers see full context. (2) Hidden `<a rel="prev/next">` links for page discovery. (3) `pushState` via `window.history.pushState(null,'',?page=N)` after each batch (official Next.js pattern with `useSearchParams`). (4) Dynamic canonical per page: `/?page=1`→`/`, `/?page=N`→`/?page=N`. Verified: canonical + prev/next links all correct in browser. Files: `page.tsx`, `FeedContainer.tsx`, `InfiniteArticleListOnView.tsx`, `InfiniteArticleList.tsx`
- [x] **CP-1 + JBRSEO-ADMIN-1** ✅ 2026-04-17 — Hero B2B Panel on `/clients` page made fully dynamic from admin settings. (1) 7 new fields in Prisma `Settings` model (`b2bLabel`, `b2bHeadline`, `b2bBullet1-3`, `b2bCtaText`, `b2bCtaUrl`). (2) Admin UI: amber "Hero B2B Panel" section added to Settings → Modonty tab (Column 1, below Contact & Location). (3) `getB2bPanelSettings()` helper in `modonty/lib/seo/clients-page-seo.ts`. (4) `ClientsHero` reads from DB props with hardcoded Arabic fallbacks so page never breaks. Note: modonty has its own local `@prisma/client` — must run `pnpm prisma generate` in `modonty/` after schema changes. Live tested ✅ — Files: `schema.prisma`, `settings-actions.ts`, `settings-form-v2.tsx`, `clients-page-seo.ts`, `clients/page.tsx`, `clients-hero.tsx`

---

## 34. Session 37 — SEO + UX + DB + Telegram (2026-04-18)

- [x] **SEO-A3** ✅ — `og:site_name` كان يستخدم اسم العميل بدل اسم المنصة → `siteName: articleDefaults.siteName` من `get-article-defaults-from-settings.ts` → "مودونتي". File: `modonty/app/articles/[slug]/page.tsx`
- [x] **UX-3** ✅ — Media edit: إضافة Client dropdown في edit-media-form.tsx — يظهر بين Media Type وAlt Text — يسمح بإعادة تعيين الصورة لعميل آخر. Files: `media/[id]/edit/page.tsx`, `edit-media-form.tsx`, `update-media.ts`
- [x] **UX-4 / OBS-004** ✅ — Media upload: حُذف auto-select أول عميل → المستخدم يختار يدوياً. أضيف "General — no client (visible to all)" كأول خيار. `isGeneral` check يتجاوز client validation ويستخدم folder `general/`. Files: `use-upload-zone.ts`, `client-selector.tsx`, `use-cloudinary-upload.ts`, `create-media.ts`
- [x] **OTP-AUDIT-2** ✅ — MongoDB TTL index على `SlugChangeOtp.expiresAt`: script جديد `scripts/setup-ttl-indexes.ts` — تم تشغيله على dev DB ✅. **TODO PROD**: تشغيله على production DB قبل go-live.
- [x] **TG-SUB-1/2/3** ✅ — Telegram notifications: `modonty/lib/telegram.ts` (helper). إشعار عند: newsletter subscribe (`/api/news/subscribe`) + client subscriber (`/api/subscribers`) + user registration (`register-actions.ts`). Live tested ✅. Env vars في `.env.local`. **TODO**: إضافتهم في Vercel قبل push.

---

## 35. Session 38 — MEDIA-MOD (MediaScope enum) (2026-04-18)

- [x] **MEDIA-MOD-1** ✅ — `enum MediaScope { CLIENT | GENERAL | PLATFORM }` + `scope MediaScope @default(GENERAL)` في Prisma schema + 2 indexes + `pnpm prisma generate` ✅
- [x] **MEDIA-MOD-2** ✅ — `create-media.ts` + `update-media.ts`: يقبلان `scope?: MediaScope` ويحفظانه في DB
- [x] **MEDIA-MOD-3** ✅ — `get-media.ts`: scope-first filter — PLATFORM مستثنى من default list — `includeGeneral` يضيف `scope: GENERAL` فقط
- [x] **MEDIA-MOD-4** ✅ — Upload: `clientId === "modonty"` → `scope: PLATFORM, clientId: null, folder: "modonty/"`. `clientId === "none"` → `scope: GENERAL, clientId: null, folder: "general/"`. Files: `use-cloudinary-upload.ts`, `use-upload-zone.ts`, `client-selector.tsx`
- [x] **MEDIA-MOD-5** ✅ — Edit media form: `scope === "PLATFORM"` → init `clientId = "modonty"` في dropdown + resolves قبل الحفظ. File: `edit-media-form.tsx`
- [x] **MEDIA-MOD-6** ✅ — `media-picker-dialog.tsx`: `defaultScope` prop + "Client + General" vs "Modonty Platform" scope dropdown — platform mode guard (no clientId needed)
- [x] **MEDIA-MOD-7** ✅ — `MediaImageField` component جديد: image preview + hover remove + "Pick from Media Library" / "Change Image" — يفتح `MediaPickerDialog` بـ `defaultScope`. File: `admin/components/shared/media-image-field.tsx`
- [x] **MEDIA-MOD-8** ✅ — Category/Industry/Tag/Modonty-page forms: كل `CloudinaryImageInput` استُبدل بـ `MediaImageField(scope=PLATFORM)`. Zero manual URL inputs remaining. Files: `category-form.tsx`, `industry-form.tsx`, `tag-form.tsx`, `page-form.tsx`
- [x] **JSON-LD-IMG** ✅ — `CollectionPage.image: ImageObject` أُضيف في: `category-seo-generator.ts` + `industry-seo-generator.ts` + `tag-seo-generator.ts` (admin cached generators) + `categories/[slug]/page.tsx` + `tags/[slug]/page.tsx` (fallback inline). Verified: `og:image` ✅ · `twitter:image` ✅ · `JSON-LD CollectionPage.image` ✅ على modonty.com
- [x] Full flow verified: Upload PLATFORM → Category picker → Save → modonty.com all 3 signals updated ✅
- [x] TSC admin ✅ · TSC modonty ✅

---

## ملاحظة للمرجعية

> كل ما فوق تم نشره على production وهو يعمل الآن على modonty.com، admin.modonty.com، وconsole.modonty.com.
> آخر إصدار مُنجز: **admin v0.35.0 | modonty v1.32.0** (2026-04-17)
> آخر عمل منجز (لم يُنشر بعد): **admin v0.36.0 | modonty v1.33.0** — Session 37+38 — NO PUSH YET

---

## 21. Email System — كل 6 Templates مكتملة (2026-04-17)

- [x] **Newsletter Welcome** — `newsletter-welcome.ts` → `/api/news/subscribe` — live tested: Primary inbox ✅
- [x] **USR-R1 + Password Reset** — `password-reset.ts` → password reset flow — live tested ✅
- [x] **USR-R2 + EMAIL-1: Email Verification** — `email-verification.ts` → `register-actions.ts` + `/users/verify-email` page — live tested: `emailVerified` set, token deleted ✅
- [x] **EMAIL-2: Welcome** — `welcome.ts` → `register-actions.ts` — live tested: Primary inbox ✅
- [x] **EMAIL-3 + USR-L1: Comment Reply** — `comment-reply.ts` → `[commentId]/route.ts` — self-notification guard added — live tested: Primary inbox ✅
- [x] **EMAIL-4: FAQ Reply** — `faq-reply.ts` → console `question-actions.ts::replyToQuestion()` — wired + TSC 0 errors ✅

---

## 22. Admin Security — Auth on Server Actions (2026-04-17)

- [x] `contact-messages-actions.ts` — delete, updateStatus, markAsRead, markAsReplied
- [x] `faq-actions.ts` — create, update, delete, reorder, toggleStatus
- [x] `upload-image.ts` — uploadImage
- [x] `upload-avatar.ts` — uploadAvatar
- [x] `send-feedback.ts` — sendFeedback
- [x] `cascade-all-seo.ts` — cascadeSettingsToAllEntities
- [x] **OTP-AUDIT-3** — Rate limiting (3/10min) + `crypto.randomInt` بدل `Math.random()`

---

## 23. Admin UX Fixes (2026-04-17)

- [x] **SEED-CLEANUP** — حُذف `/settings/seed` + `/api/seed` + `seed-mock-data.ts`
- [x] **Media Gallery** — `object-cover` → `object-contain` في `media-grid.tsx:337`
- [x] **Article detail preview** — `object-cover` → `object-contain bg-muted` في `articles/[id]/page.tsx:141`

---

## 24. JBRSEO-ADMIN-2 — Feed Banner from DB (2026-04-18)

- [x] Added `platformTagline` + `platformDescription` to Prisma Settings model
- [x] Added to `ModontySettings` interface, `DEFAULT_SETTINGS`, `getAllSettings()`, `saveModontySettings()` in settings-actions.ts
- [x] Added "Feed Banner" section (violet) in admin Settings → Modonty tab Column 1
- [x] Created `modonty/lib/settings/get-feed-banner-settings.ts` — cached lean helper
- [x] `modonty/app/page.tsx` fetches via `Promise.all` and passes props to `FeedContainer`
- [x] `FeedContainer` uses DB values with Arabic fallbacks — never breaks if null
- [x] TSC admin + modonty: zero errors ✅
- [x] Note: `pnpm prisma generate` required after VS Code restart (Windows DLL lock)

---

## 25. SEO Copy Fields — SCOPY-1→5 (2026-04-18)

- [x] **SCOPY-1** — Audit: author/industry/tag/category forms + shared seo-fields.tsx
- [x] **SCOPY-2** — `seoTitle`: `maxLength={51}→{60}`, `CharacterCounter min={50} max={60}` — 4 forms + seo-fields.tsx
- [x] **SCOPY-3** — `seoDescription`: `FormInput→FormTextarea rows={3}`, `CharacterCounter min={120} max={160}` — 4 forms + seo-fields.tsx
- [x] **SCOPY-4** — Analyzer range enforced via CharacterCounter (50–60 title, 120–160 description) on all forms
- [x] **SCOPY-5** — Zod schemas: `max(51)→max(200)` for seoTitle, `max(300)→max(500)` for seoDescription — soft limit, no save blocking — update-author.ts + 3 server schemas

---

## 26. صفحات ناقصة — HP1 (2026-04-18)

- [x] **HP1** ✅ — `/articles` listing page: قُرر أن الـ homepage هي feed المقالات. redirect 308 موجود في `modonty/next.config.ts` — `{ source: '/articles', destination: '/', permanent: true }`. المهمة لم تكن تحتاج بناء — الـ redirect كافٍ.

---

## 27. Article Page UX — MB1 + A7 (2026-04-18)

- [x] **MB1** ✅ 2026-04-18 — Newsletter CTA text editable from admin: `newsletterCtaText String?` on Client model (schema done). Admin: new "Newsletter CTA Text" field in client form Business Brief section (`business-brief-section.tsx`) + wired through `use-client-form.ts`, `update-client-grouped.ts`, `client-form-config.ts`, Zod schema. Modonty: `getArticleBySlug` selects `newsletterCtaText`, `NewsletterCTA` accepts `ctaText` prop and renders it when set. Flows to both desktop sidebar and mobile sheet. TSC zero errors ✅

- [x] **A7** ✅ 2026-04-18 — Audio version player + badge: `audioUrl String?` already in schema. Admin: "Audio Version URL" input added to Media section in article editor (`media-section.tsx`); field added to `ArticleFormData`, `initialFormData`, `transformArticleToFormData`, Zod schema (`article-server-schema.ts`); saved in both `create-article.ts` + `update-article.ts`. Modonty: `audioUrl: true` added to `feedArticleSelect`; `hasAudio: !!article.audioUrl` in `mapFeedArticleToResponse`; `hasAudio` passed through in `page.tsx` + `article-actions.ts`; article page shows `🎧 نسخة صوتية` badge + native `<audio controls>` player below featured image when `audioUrl` is set. TSC both apps zero errors ✅

---

## 29. JBRSEO-8 — CTA Click Tracking (2026-04-18)

- [x] **JBRSEO-8** ✅ 2026-04-18 — GA4 event tracking on all jbrseo.com CTAs across modonty. Replaced plain `<a>` / `<Link>` tags with `CtaTrackedLink` (or `trackCtaClick` onClick for Button asChild case) in 8 files: `TopNav.tsx` (mobile pill), `DesktopUserAreaClient.tsx` (desktop header button — onClick pattern), `Footer.tsx` (footer link), `article-footer.tsx`, `about/page.tsx`, `clients/page.tsx` (bottom CTA), `clients-hero.tsx` (B2B panel), `clients/[slug]/page.tsx` (join CTA). Each link has a unique `label` + `type` for GA4 segmentation. TSC both apps zero errors ✅. Live-tested all 5 locations via MCP Playwright ✅.

---

## 30. QAUDIT-A1→A5 — Admin Query Audit (2026-04-18)

- [x] **QAUDIT-A1** ✅ — `getFAQs()` + `getActiveFAQs()` in `faq-actions.ts`: added `faqListSelect` const with `{ id, question, answer, position, isActive, seoTitle }` — eliminated full-row fetch for listing. `getFAQById` kept as-is (edit form needs all fields).
- [x] **QAUDIT-A2** ✅ — `getAuthors()` — already optimal (returns singleton array, uses `.count()` only). No change needed.
- [x] **QAUDIT-A3** ✅ — `getIndustries()` in `get-industries.ts`: changed `include: { _count }` to explicit `select: { id, name, slug, createdAt, jsonLdLastGenerated, _count: { clients } }` — removed over-fetching of description, seoTitle, seoDescription, and all other fields.
- [x] **QAUDIT-A4** ✅ — `getMedia()` — already has `take: perPage` pagination + selective `include`. No change needed.
- [x] **QAUDIT-A5** ✅ — Four analytics/stats queries fixed: `getViewsTrendData()` → `take: 50000`; `getArticles()` (analytics) → `take: 1000`; `getClients()` (analytics) → `select: { id, name }` + `take: 1000`; `getIndustriesStats()` findMany → `take: 500`. Admin TSC zero errors ✅.

---

## 31. Admin UX Fixes — OBS batch (2026-04-18)

- [x] **OBS-001** ✅ — Media picker search: verified already reactive client-side (`filteredMedia` derived from `search` state in `media-picker-dialog.tsx`). No code change needed.
- [x] **OBS-019** ✅ — Edit Hero dialog "Change" button: removed hover-only opacity overlay in `media-picker.tsx`; added always-visible "Change Image" + "Remove" button row below the image preview. `media-picker.tsx` updated.
- [x] **OBS-021** ✅ — Media picker shows General only: added `includeGeneral?: boolean` to `MediaFilters` type; updated `get-media.ts` to use `OR [clientId = X, clientId = null]` when `includeGeneral: true`; `media-picker-dialog.tsx` now passes `includeGeneral: true` — client images + General images both appear. **Follow-up fix:** added `unoptimized` to `NextImage` in picker grid — seed records with `example.com` URLs were crashing `next/image` (hostname not in `next.config.js`). Live test ✅ zero errors.
- [x] **OBS-022** ✅ — No Upload button in Select Media dialog: added "Upload" link button to the picker toolbar (always visible, opens upload page in new tab with `clientId` pre-filled). `media-picker-dialog.tsx` updated.
- [x] **OBS-025** ✅ — "SA" country code: already fixed in previous session. `utils.tsx` in client hero has `COUNTRY_CODES` map with `SA → "السعودية"` + `localizeCountry()`. Verified and marked done.

---

## 32. Admin UX Fixes — Publish errors + SEO gate (2026-04-18)

- [x] **UX-1** ✅ — Misleading publish error toast: `save-article-button.tsx` + `article-form-navigation.tsx` — toast title now uses `cannot_publish` ("لا يمكن النشر") when `result.error` exists, instead of generic `server_error`. `create-article.ts` SEO gate error translated to Arabic (matches `publish-article.ts` style).
- [x] **UX-2** ✅ — SEO Publish Gate (`seoDescription`): `publish-article.ts` `validateArticleData` — changed `seoDescription` check from soft warning → hard `errors.push` when empty or < 50 chars. Blocks publish with message: "وصف SEO مطلوب ولا يقل عن 50 حرفاً للنشر". TSC zero errors ✅.

---

## 33. SEO Full-Circle Verification — FC6/FC2/FC3 (2026-04-18)

- [x] **SEO-FC6** ✅ — `/robots.txt` verified: Allow /, Disallow /api/ /admin/ /users/login/ /users/profile/, AI bots blocked (GPTBot/ClaudeBot/CCBot etc), Sitemap URL correct. `/sitemap.xml` verified: 56 URLs including all published articles, static pages, clients, categories, tags. Both working on dev server ✅.
- [x] **SEO-FC2** ✅ — Create flow: Article page returns 200 ✅. JSON-LD present (2 scripts: WebPage + BreadcrumbList) ✅. Article appears in sitemap ✅. `generateAndSaveJsonLd` called after publish in `publish-article.ts` ✅.
- [x] **SEO-FC3** ✅ — Update flow: `update-article.ts` calls both `generateAndSaveNextjsMetadata` and `generateAndSaveJsonLd` after every update ✅. Modonty article page reads stored JSON-LD from `article.jsonLdStructuredData` with fresh-generate fallback ✅.
- [x] **SEO-FC5** ✅ — Site Name cascade verified by code review: `saveSiteSettings()` + `saveOrganizationSettings()` both call `cascadeSettingsToAllEntities()` in background. Cascade regenerates JSON-LD + metadata for ALL articles, clients, categories, tags, industries, and listing pages. Fully implemented in `cascade-all-seo.ts`.
- [x] **SEO-FC4** ✅ — Archive/delete flow verified by code review: sitemap only includes `status: PUBLISHED` ✅. Archive action calls `revalidatePath` + `revalidateModontyTag("articles")` ✅. Archived article URL returns 307 redirect → `/` (not 404 — intentional UX to keep users on site; 307 = temporary, appropriate for re-archivable content) ✅.
- [x] **NEXT_PUBLIC_SITE_URL fix** ✅ — `admin/.env.local` had wrong value `http://localhost:3000` (admin port). Fixed to `http://localhost:3001` (modonty dev server). Production Vercel task added: must set `NEXT_PUBLIC_SITE_URL=https://www.modonty.com` — affects JSON-LD `@id`, canonical URLs, cache revalidation across 15+ SEO files.
