# URL Lifecycle & GSC Coverage — Action Plan
**آخر تحديث:** 2026-04-25
**الهدف:** بنية تحتية تحمي SEO + أداة مراقبة الفجوة بين GSC و DB
**الحالة:** بانتظار البدء بالمرحلة 1

---

## 🎯 لماذا هذا الملف؟

نحن لسه قبل أول عميل حقيقي. نريد بناء البنية التحتية لـ URL lifecycle (slug change · archive · delete · redirect) **الآن** — قبل أن نواجه المشكلة.

ثلاث مراحل منفصلة، كل واحدة تُسلِّم قيمة بمفردها.

---

## 🟦 المرحلة 1 — Coverage Visibility ✅ DONE (2026-04-25)

> **النتيجة:** الـ dashboard يعرض coverage alert clickable + `/seo` يعرض جدول كامل بـ recommendations

---

## 🟧 المرحلة 2 — Full Coverage Review Tool (~يومان)

> **الهدف:** أداة قرار لكل URL مفهرس — مراجعة يدوية قبل بناء الـ infrastructure.

### Tasks
- [ ] **U-05** — `/seo` كاملة بـ tabs
  - **Overview tab:** KPIs + شارت أداء + alerts
  - **Coverage tab:** جدول كل المفهرسة + filter + actions
  - **Queries tab:** أفضل 50 query
  - **Pages tab:** أفضل 50 page

- [ ] **U-06** — Coverage tab — جدول مفصّل
  - Columns: URL · Status · Clicks · Impressions · Position · Recommended Action · Action button
  - Filter: All / Live / Archived / Missing
  - Sort: by clicks / impressions / status

- [ ] **U-07** — Per-row recommendations (read-only الآن)
  - Live + low CTR → "Improve title"
  - Archived + traffic → "Restore or 410"
  - Missing → "Add 301 redirect or 410 Gone"
  - Live + 0 GSC impressions → "Request indexing"

- [ ] **U-08** — Action buttons UI (functional في المرحلة 3)
  - زر "Add Redirect" — يفتح dialog، يحفظ pending action
  - زر "Mark as 410" — يحفظ pending action
  - زر "Request Indexing" — يحفظ pending action

### Verify
- جدول 100% functional
- Filters تعمل
- Recommendations منطقية لكل صف

---

## 🟥 المرحلة 3 — URL Lifecycle Infrastructure (~3-4 أيام)

> **الهدف:** النظام يحمي SEO تلقائياً — أول عميل يكتب → كل URL له lifecycle محسوب.

### 3.A — Research & Audit
- [ ] **U-09** — بحث رسمي عبر Google Search Central
  - Best practice: 410 Gone vs 301 vs 404 للـ permanently removed
  - Best practice: slug change handling
  - Best practice: archive behavior
  - توثيق النتيجة في هذا الملف

- [ ] **U-10** — Audit الكود الحالي
  - فحص `db.article.delete` calls — أين تُستدعى؟
  - فحص `Article.status = ARCHIVED` behavior — كيف يعرض على الموقع؟
  - فحص sitemap.xml — هل يستثني archived/draft؟
  - تقرير: ما الذي يحتاج تغيير

### 3.B — Foundation
- [ ] **U-11** — `UrlRedirect` Prisma model
  - Fields: `fromPath, toPath?, type (301|410), reason, articleId?, hits, createdAt`
  - Migration + db push

- [ ] **U-12** — Next.js middleware للـ redirects
  - يفحص كل طلب
  - يطابق ضد UrlRedirect
  - يرجع 301 (مع toPath) أو 410 (بدون toPath)
  - يزيد counter `hits`

- [ ] **U-13** — Auto slug-change handler
  - Hook في server action تحديث article
  - عند `slug` تغيّر → ينشئ UrlRedirect تلقائياً
  - يضيف للـ `Article.slugHistory[]`

- [ ] **U-14** — Block hard-delete في admin UI
  - حذف زر Delete من الواجهة (أو تحويله لـ Archive)
  - SQL DELETE فقط للـ DBA من خلال DB tool

- [ ] **U-15** — Archive policy implementation
  - Default: ARCHIVED → page returns 410 + removed from sitemap
  - Override option: "Keep accessible (noindex)" للـ evergreen content
  - زر في article admin UI لتبديل السلوك

- [ ] **U-16** — Sitemap hygiene
  - Verify `app/sitemap.ts` يستثني archived/draft
  - إصلاح إذا لزم

### 3.C — Indexing API & Automation
- [ ] **U-17** — `lib/gsc/indexing.ts`
  - `requestIndexing(url)` — URL_UPDATED
  - `notifyDeleted(url)` — URL_DELETED
  - يستخدم نفس service account credentials

- [ ] **U-18** — Hook publish → request indexing تلقائياً

- [ ] **U-19** — Hook archive/delete → notify URL_DELETED

- [ ] **U-20** — UI buttons في `/seo` Coverage tab يعملوا بـ functional الآن:
  - "Add Redirect" → ينشئ UrlRedirect entry
  - "Mark as 410" → ينشئ UrlRedirect type=410
  - "Request Indexing" → يستدعي Indexing API

### 3.D — Polish
- [ ] **U-21** — Slug change UX
  - عند تغيير slug في published article → dialog warning
  - يعرض GSC clicks على الـ slug القديم لو موجودة
  - "Save will auto-create 301 redirect" notice

- [ ] **U-22** — Daily cron للـ coverage sync (optional)
  - يجدّد cache التوافق
  - يرسل Telegram alert إذا missing > 5

### Verify Phase 3
- TSC zero errors
- Live test: تغيير slug → redirect يعمل · archive → 410 ظاهر · delete blocked
- Indexing API responds
- Sitemap clean

---

## 📊 Status Summary

| المرحلة | المهام | الحالة |
|---------|--------|---------|
| 1. Coverage Visibility | U-01 → U-04 | ✅ done (2026-04-25) |
| 2. Indexing Actions + Archive 410 | (full set) | ✅ done (2026-04-25) |
| 3.A Research & Audit | U-09 → U-10 | ⏳ pending |
| 3.B Foundation | U-11 → U-16 | ⏳ pending |
| 3.C Indexing & Automation | U-17 → U-20 | ⏳ pending |
| 3.D Polish | U-21 → U-22 | ⏳ pending |

---

## 🔗 ملفات مرتبطة

- **Dashboard rebuild plan:** [Dashboard-Action-Plan.md](Dashboard-Action-Plan.md)
- **Live test log:** [CLAUDE.md](CLAUDE.md)
- **GSC connection details:** memory `project_gsc_connection.md`

---

## ✅ Done

### Phase 2 — Indexing API Actions + Archive 410 (2026-04-25)
- [x] Research: Google Search Central + RFC 7231 — 410 Gone is best practice for archived/permanently removed content
- [x] `lib/gsc/client.ts` enhanced: added `getSearchConsoleClient()` + `getIndexingClient()` (separate scope `auth/indexing`)
- [x] `lib/gsc/inspection.ts` simplified to use shared client
- [x] `lib/gsc/indexing.ts` — `requestIndexing(url)` (URL_UPDATED) + `notifyDeleted(url)` (URL_REMOVED) + batch versions
- [x] `app/(dashboard)/seo/actions/seo-actions.ts` — server actions with auth check + revalidateTag (Next.js 16 signature)
- [x] `seo-row-action.tsx` — per-row button with toast feedback + "Sent" state
- [x] `seo-bulk-actions.tsx` — bulk bar with confirmation dialog (notes API quota 200/day)
- [x] `/seo/page.tsx` integrated: Notify deleted button shown for missing/archived rows · Request indexing for 0-impression published rows
- [x] **modonty:** removed unsafe 307→`/` redirect for archived (was soft 404 risk)
- [x] **modonty:** new `proxy.ts` (Next.js 16 — replaces deprecated middleware.ts) returns true 410 Gone for archived slugs
- [x] **modonty:** `lib/archive-cache.ts` — cached archived slug set (5min TTL, tag `archived-slugs`)
- ✅ TSC zero errors on both apps · live test passed: 11 "Notify deleted" buttons + bulk action visible

### Phase 1 — Coverage Visibility (2026-04-25)
- [x] **U-01** `lib/gsc/coverage.ts` — `parseUrl()` + `analyzeGscCoverage()` · types: article/homepage/client/category/tag/industry/author/static/other · Arabic decode · trailing slash normalization
- [x] **U-02** Coverage Alert clickable في GSC section (`gsc-section.tsx`) — يعرض live · archived · missing · coverage % مع Review needed indicator
- [x] **U-03** `/seo/page.tsx` stub — Summary KPIs (5 cards) + Coverage table sorted by status urgency + per-row recommendation + Edit article link
- [x] **U-04** Live test على production: 17 total indexed, 2 live, 11 missing, 15% coverage — كشف فجوة حقيقية

### نتائج Phase 1 على production
- Dashboard alert: 7 pages في 7 يوم (2 live, 5 missing)
- /seo deep view: 100 pages في 28 يوم (2 live, 11 missing, 4 non-article)
- 11 URL مفهرسة في Google لا تطابق DB → تحتاج 301 redirect أو 410 Gone (المرحلة 2)
