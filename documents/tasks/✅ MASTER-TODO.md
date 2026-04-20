# MASTER TODO — MODONTY
> **آخر تحديث:** 2026-04-20 (Session 53 — modonty v1.39.0 ✅)
> **الإصدار الحالي:** admin v0.36.0 | modonty v1.39.0 | console v0.1.2
> المهام المنجزة في → [🏆 MASTER-DONE.md](🏆%20MASTER-DONE.md)

---

# ⚠️ POST-PUSH — إجراءات يدوية باقية

- [ ] Verify `admin.modonty.com` live and accessible
- [ ] Run `setup-ttl-indexes.ts` on PROD DB
- [x] Add `.playwright-mcp/` to `.gitignore` ✅ Session 52

---

# 🌐 MODONTY — Public Site

## 🔴 HIGH — Performance

- [ ] **PERF-003** — Legacy JavaScript 14 KiB across all pages — vendor dependency ships unnecessary polyfills (Array.at, flat, Object.fromEntries etc.) — needs `ANALYZE=true pnpm build` to identify chunk
- [ ] **PERF-004** — Unused JavaScript 24-27 KiB (clients/industries pages) — bundle analyzer needed
- [ ] **PERF-008** — Article page TBT 250ms — Forced reflow from JavaScript querying layout properties
  - PageSpeed flagged: "Forced reflow" + "Minimize main-thread work"
  - Likely source: article body renderer or TOC component calling `offsetWidth` / `getBoundingClientRect` during render
  - Fix: identify the offending component via Chrome DevTools Performance tab → defer layout reads with `requestAnimationFrame`

## 🔴 HIGH — LCP Speed Fix

> **Root cause (confirmed via live timing):** TTFB = 65ms ✅ · HTML stream = **2771ms** 🔴
> `getArticles()` runs `_count` aggregation on 5 collections per article — heavy MongoDB join, blocks rendering.
> `"use cache"` + `cacheLife("hours")` helps when warm, but `revalidateTag("articles")` on every admin publish clears it.

- [ ] **PERF-006** — **[Correct Fix]** Denormalize interaction counts into Article document
  - Add `likesCount`, `dislikesCount`, `favoritesCount`, `commentsCount`, `viewsCount` fields directly on Article
  - Update fields on interaction — replaces all `_count` aggregation queries in the feed
  - Files: `modonty/app/api/helpers/article-queries.ts` · admin interaction handlers · Prisma schema
  - **Impact:** Homepage HTML stream 2.8s → ~300ms → LCP ~500ms

- [ ] **PERF-007** — **[Quick Fix]** Enable ISR for base homepage `/`
  - Requires moving category/page filter to client-side URL state (remove `searchParams` from top-level fetch)
  - `export const revalidate = 300` → Vercel pre-renders at edge → real users get <100ms
  - **Impact:** PageSpeed and real users both see instant LCP from edge cache

## 🔴 HIGH

- [x] **USR-R3** — Notification Settings UI ✅ Session 53 — tab + renderSection + DB persist + GET reads DB + email guard on comment reply

## 🟡 MEDIUM — RightSidebar

- [ ] **SIDEBAR-MOD1** — أعد تصميم كارت "جديد مودونتي" — client خاص في DB باسم "مودونتي" + query + إعادة الكارت للـ RightSidebar

## 🟡 MEDIUM — Mobile Phase 2

> ✅ MOB2–MOB6 مكتملة — نُقلت إلى MASTER-DONE (Session 50 / v1.36.0)

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
- [ ] **SEMrush** → "Rerun Campaign" بعد آخر deploy (الهدف: ≥ 90%)

---

> 🟢 LOW items → [💡 NICE-TO-HAVE.md](💡%20NICE-TO-HAVE.md)
