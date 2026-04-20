# MASTER TODO — MODONTY
> **آخر تحديث:** 2026-04-21 (Session 49)
> **الإصدار الحالي:** admin v0.36.0 | modonty v1.35.0 | console v0.1.2
> المهام المنجزة في → [🏆 MASTER-DONE.md](🏆%20MASTER-DONE.md)

---

# ⚠️ POST-PUSH — إجراءات يدوية باقية

- [ ] Verify `admin.modonty.com` live and accessible
- [ ] Run `setup-ttl-indexes.ts` on PROD DB
- [ ] Add `.playwright-mcp/` to `.gitignore`
- [x] **SEO-004** — Admin Settings → Site URL → `https://www.modonty.com` ✅
- [x] **SEO-005** — Vercel Dashboard → `NEXT_PUBLIC_SITE_URL` = `https://www.modonty.com` في admin + modonty projects ✅

---

# 🔴 CRITICAL

- [ ] **OBS-027** — Industries listing shows "12 شركات" but detail shows "0 شركة موثوقة"
  - Listing counts ALL clients; detail filters `subscriptionStatus: ACTIVE` only
  - **Fix A (quick):** Set production clients to `subscriptionStatus: ACTIVE` in Admin
  - **Fix B (correct):** Align listing query to count ACTIVE clients only

---

# 🌐 MODONTY — Public Site

## 🔴 HIGH — SEO Fixes (Session 48)

- [x] **SEO-001** — Article canonical truncated + no www → always regenerate canonical from current siteUrl+slug, even when using stored nextjsMetadata ✅
- [x] **SEO-002** — Client detail canonical no www → added www normalization regex in `clients/[slug]/page.tsx` ✅
- [x] **SEO-003** — Client detail meta description missing → added fallback description from seoDescription or default string ✅
- [x] **SEO-004** — Admin Settings → Site URL → `https://www.modonty.com` ✅
- [x] **SEO-005** — Vercel `NEXT_PUBLIC_SITE_URL` = `https://www.modonty.com` (admin + modonty projects) ✅

## 🔴 HIGH — Performance (PageSpeed Session 48)

- [x] **PERF-001** — Clients page Accessibility: added `aria-label` to 2 icon buttons (`clients-content.tsx:90` + `client-card-external-link.tsx`) ✅
- [x] **PERF-002** — Homepage LCP: removed invalid `preload` combination from `OptimizedImage.tsx` + `PostCardHeroImage.tsx` — now uses `loading="eager"` + `fetchPriority="high"` per Next.js 16 App Router docs ✅
- [ ] **PERF-003** — Legacy JavaScript 14 KiB across all pages — vendor dependency ships unnecessary polyfills (Array.at, flat, Object.fromEntries etc.) — needs `ANALYZE=true pnpm build` to identify chunk
- [ ] **PERF-004** — Unused JavaScript 24-27 KiB (clients/industries pages) — bundle analyzer needed
- [x] **PERF-005** — Article pages CAN be tested via PageSpeed — use double-encoded Arabic URL format (encode the `%` signs again) → PageSpeed accepted it ✅
  - **Result (Session 49, Mobile):** Performance **87** · Accessibility **100** · Best Practices **100** · SEO **100**
  - FCP 1.1s · LCP 3.2s · TBT 250ms · CLS 0 · Speed Index 3.9s
  - Same LCP bottleneck as homepage (server streaming) + TBT 250ms from forced reflow + legacy JS

- [ ] **PERF-008** — Article page TBT 250ms — Forced reflow from JavaScript querying layout properties
  - PageSpeed flagged: "Forced reflow" + "Minimize main-thread work"
  - Likely source: article body renderer or TOC component calling `offsetWidth` / `getBoundingClientRect` during render
  - Fix: identify the offending component via Chrome DevTools Performance tab → defer layout reads with `requestAnimationFrame`

## 🔴 HIGH — SEO Fixes (Session 49 Live Test)

- [x] **SEO-006** — hreflang tags MISSING on article pages → added `languages: { ar, "x-default" }` to stored metadata early-return path in `articles/[slug]/page.tsx` ✅

- [ ] **SEO-007** — **Article canonical still missing www in production** — live test shows `https://modonty.com/articles/...` instead of `https://www.modonty.com/articles/...`
  - SEO-001 code fix exists locally but **not pushed to production** yet
  - OR `NEXT_PUBLIC_SITE_URL` in Vercel is `https://modonty.com` and our regex isn't catching it
  - **Action required:** Push SEO-001 fix + verify `NEXT_PUBLIC_SITE_URL` in Vercel = `https://www.modonty.com`

## 🔴 HIGH — LCP Speed Fix (Session 49)

> **Root cause (confirmed via live timing):** TTFB = 65ms ✅ · HTML stream = **2771ms** 🔴
> The server takes ~2.8s to compute and stream the homepage HTML before the browser can paint the LCP image.
> Cause: `getArticles()` runs `_count` aggregation on 5 collections (likes/dislikes/favorites/comments/views) per article — heavy MongoDB join, blocks rendering.
> The `"use cache"` with `cacheLife("hours")` helps when warm, but `revalidateTag("articles")` on every admin publish clears it.

- [ ] **PERF-006** — **[Option B — Correct Fix]** Denormalize interaction counts into Article document
  - Add `likesCount`, `dislikesCount`, `favoritesCount`, `commentsCount`, `viewsCount` fields directly on Article
  - Update these fields (increment/decrement) when interactions happen — replaces all `_count` queries in the feed
  - Feed query becomes ~10× faster — no aggregation joins
  - Files: `modonty/app/api/helpers/article-queries.ts` · `admin` interaction handlers · Prisma schema
  - **Impact:** Reduces homepage HTML stream from 2.8s → estimated ~300ms → LCP ~500ms

- [ ] **PERF-007** — **[Option A — Quick]** Enable ISR for base homepage `/`
  - Requires removing `searchParams` from the top-level page fetch (move category/page filter to client-side URL state)
  - `export const revalidate = 300` on `page.tsx` → Vercel pre-renders at edge → real users get <100ms
  - This is a refactor of the FeedContainer to handle category filtering client-side
  - **Impact:** PageSpeed and real users both see instant LCP from edge cache

## 🔴 HIGH

- [ ] **USR-R3** — Notification Settings UI — schema done (`notificationPreferences Json?`) — يحتاج settings UI + email guard

## 🟡 MEDIUM — RightSidebar

- [ ] **SIDEBAR-MOD1** — أعد تصميم كارت "جديد مودونتي" — client خاص في DB باسم "مودونتي" + query + إعادة الكارت للـ RightSidebar

## 🟡 MEDIUM — Mobile Phase 2

- [ ] **MOB2** — أضف client avatar + "اسأل العميل" في Zone 1
- [ ] **MOB3** — أضف Newsletter trigger في الشريط
- [ ] **MOB4** — أضف views + questions في meta row
- [ ] **MOB5** — Newsletter overlay على الصورة الرئيسية
- [ ] **MOB6** — حدّث الـ Sheet بالمحتوى الكامل

## 🟡 MEDIUM — Chatbot Phase 2

- [ ] **CHAT-FAQ1** — Admin: صفحة أسئلة مجمّعة حسب التكرار
- [ ] **CHAT-FAQ2** — Admin: زر "حوّل لـ FAQ" — schema done (`ArticleFAQ.source String?`)
- [ ] **CHAT-FAQ3** — Admin: filter حسب الفئة / العميل / المصدر
- [ ] **CHAT-FAQ4** — Modonty: FAQ المحوَّلة تظهر على صفحة المقال

---

# 🛠️ ADMIN

## 🔴 HIGH — Security

- [ ] **OTP-AUDIT-1** — جرد الأماكن التي تحتاج 2FA

## 🟡 MEDIUM — DB Health & Maintenance

- [ ] **DB-1** — DB Stats card — collections count, document count, storage MB + connection health
- [ ] **DB-2** — Orphan Cleaner — unused media, expired OTPs > 30 days, broken ArticleMedia rows
- [ ] **DB-3** — Index Health Check — flag missing TTL/compound indexes on key collections
- [ ] **DB-4** — Slug Integrity Check — duplicate slugs, empty/invalid slugs
- [ ] **DB-5** — Broken References Scanner — articles with deleted featuredImageId / categoryId / authorId

## 🟡 MEDIUM — Media & Editor

- [ ] **UX-5** — رفع صورة بدون مغادرة صفحة المقال — upload + select inline inside article editor

## 🟡 MEDIUM — Email Template Viewer

- [ ] **EMAIL-PREVIEW-1** — صفحة `/modonty/emails` تعرض كل قوالب الإيميل (6 قوالب) — preview HTML + subject + زر "Send Test"

## 🟡 MEDIUM — Misc

- [ ] **AUDIT-5** — bundle size → `pnpm build:analyze` + dynamic imports
- [ ] **SEMR-7b** — `defaultDescription` في Settings
- [ ] **"Featured" label** — "Cover Image" + "Highlight on Homepage"

---

# 📊 CONSOLE

## 🟡 MEDIUM — Manual QA (قبل أول عميل)

- [ ] **QAUDIT-C1** — مراجعة شاملة لكل queries في console
  - Dashboard: C1–C5 · Analytics: C7/C10–C12/C14 · Leads: C15–C17 · Moderation: C22–C30

---

# ⚙️ VERCEL — إجراءات يدوية

- [ ] **AUTH_SECRET** → Vercel env vars
- [ ] **NEXTAUTH_URL** → `https://www.modonty.com`
- [ ] **NEXT_PUBLIC_SITE_URL** → `https://www.modonty.com`
- [ ] **SEMrush** → "Rerun Campaign" بعد آخر deploy (الهدف: ≥ 90%)

---

---

## ✅ DONE — Session 47 (2026-04-19)
- [x] **ScrollProgress duplicate render fixed** — removed direct import+render from TopNav.tsx, now only via FeedDeferredUI (ssr:false). Verified: 1 element in DOM ✅
- [x] **MobileMenu lazy loading** — MobileMenuClient now uses dynamic(ssr:false) + mounted state. MobileMenu JS loads only on first menu click. Verified: menuInDOM=false before click, dialog opens correctly after ✅
- [x] **FollowCard social icons → Server** — 7 social SVGs removed from client bundle. FollowCard.tsx (Server) renders icons. FollowCardInteractive.tsx (new Client) handles form + expand only. Verified: all elements render correctly ✅
- [x] **Social icons → filled style** — LinkedIn, YouTube, Instagram changed from stroke to fill. All 7 icons now consistent filled style ✅
- [x] **Twitter/X dark mode fix** — fill="currentColor" added to SVG path ✅
- [x] **FollowCard icon spacing** — gap-1 + p-0.5 (was gap-0.5 + p-1) ✅
- [x] **FollowCardClient.tsx deleted** — dead code removed ✅
- [x] **Social links synced to modonty_dev** — all 7 platform URLs copied from production DB ✅
- [x] **Client Components audit** — CLIENT-COMPONENTS.md created, 35 components reviewed, 1 deletable (done) ✅

---

> 🟢 LOW items → [💡 NICE-TO-HAVE.md](💡%20NICE-TO-HAVE.md)
