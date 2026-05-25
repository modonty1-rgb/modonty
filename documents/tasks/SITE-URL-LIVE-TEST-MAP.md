# 🧪 Live Test Map — SITE URL Refactor

> **آخر تحديث:** 2026-05-25
> **الغرض:** خريطة كاملة لكل function عُدّلت + UI/URL محتاج اختبار
> **مرتبط بـ:** [SITE-URL-SOURCE-OF-TRUTH-TODO.md](SITE-URL-SOURCE-OF-TRUTH-TODO.md)

---

## 🎯 الاختبار الفوري — المشكلة الأصلية في الـ screenshot

**`/articles/workflow/quality-check/[articleId]`**
- **Test:** افتح المقال اللي فشل في الـ screenshot (`دليل تصنيع مستحضرات التجميل بعلامتك التجارية في مصر`)
- **Expected before migration:** لسة CRITICAL لأن canonical في DB لسه بدون www (الكود الجديد يبني article.url بـ www)
- **Expected after migration (Phase 2):** ✅ Pass — كل canonical في DB بـ www

⚠️ **ملاحظة مهمة:** الكود الآن يولّد canonical جديد بـ www، لكن الـ data القديمة في DB لازم migration. الـ live test الكامل **بعد المرحلة 2**.

---

## 📋 خريطة الـ Functions + UIs

### المجموعة 1 — Article Workflow (الأهم)

| Function عُدّلت | الملف | UI / Path للاختبار |
|---|---|---|
| `validateArticleFromDb(article.url=buildArticleUrl)` | [workflow/[transition]/page.tsx](admin/app/(dashboard)/articles/workflow/[transition]/page.tsx) | `/articles/workflow/draft-to-approval` |
| نفسها | [workflow/quality-check/[articleId]/page.tsx](admin/app/(dashboard)/articles/workflow/quality-check/[articleId]/page.tsx) | `/articles/workflow/quality-check/[articleId]` ⭐ |
| `gatedTransitionAction` | [workflow/actions/gated-transition.ts](admin/app/(dashboard)/articles/workflow/actions/gated-transition.ts) | "Send for Approval" button → backend |

**Test steps:**
1. افتح `/articles/workflow/draft-to-approval` — يحمّل القائمة
2. اضغط "1 issue to fix" على مقال — يفتح Quality Check
3. الـ canonical check: قبل migration = CRITICAL ⚠️ · بعد migration = PASS ✅

---

### المجموعة 2 — Article Editor (Form + Preview)

| Function | الملف | UI / Path |
|---|---|---|
| `useArticleForm().siteUrl` | [article-form-context.tsx](admin/app/(dashboard)/articles/components/article-form-context.tsx) | `/articles/new` + `/articles/[id]/edit` |
| `generateCanonicalUrl(slug, siteUrl, ...)` | [seo-generation.ts](admin/app/(dashboard)/articles/helpers/seo-generation.ts) | Auto-fill canonical في الـ form |
| `SEOStep` يستخدم siteUrl prop | [steps/seo-step.tsx](admin/app/(dashboard)/articles/components/steps/seo-step.tsx) | Article form → SEO step |
| `SEOSection` نفس | [sections/seo-section.tsx](admin/app/(dashboard)/articles/components/sections/seo-section.tsx) | Article form → SEO section |
| `SocialSection` نفس | [sections/social-section.tsx](admin/app/(dashboard)/articles/components/sections/social-section.tsx) | Article form → Social section |
| `MetatagPreviewStep` نفس | [steps/metatag-preview-step.tsx](admin/app/(dashboard)/articles/components/steps/metatag-preview-step.tsx) | Article form → MetaTags preview |
| `ArticleFormPreviewSidebar` نفس | [article-form-preview-sidebar.tsx](admin/app/(dashboard)/articles/components/article-form-preview-sidebar.tsx) | Preview button (sidebar) |

**Test steps:**
1. افتح `/articles/new` — Provider يستلم siteUrl
2. اكتب slug → canonical يتولد تلقائياً بـ www (live in form)
3. روح SEO step → preview URL بـ www
4. روح Social step → preview URL بـ www
5. روح MetaTags Preview → canonical بـ www
6. اضغط Preview sidebar → URL بـ www
7. نفس الاختبارات على `/articles/[id]/edit`

---

### المجموعة 3 — Client Editor (Forms)

| Function | الملف | UI / Path |
|---|---|---|
| `ClientForm({ siteUrl })` | [client-form.tsx](admin/app/(dashboard)/clients/components/client-form.tsx) | `/clients/new` + `/clients/[id]/edit` |
| `ClientSeoForm({ siteUrl })` | [client-seo-form.tsx](admin/app/(dashboard)/clients/components/client-seo-form.tsx) | `/clients/[id]/seo` |
| `ClientSEOValidationSection({ siteUrl })` | [client-seo-validation-section.tsx](admin/app/(dashboard)/clients/components/form-sections/client-seo-validation-section.tsx) | Inside both forms above |
| `generateClientSEO` (action) | [generate-client-seo.ts](admin/app/(dashboard)/clients/actions/clients-actions/generate-client-seo.ts) | "Regenerate SEO" button |
| `regenerateClientJsonLd` | [client-jsonld-storage.ts](admin/app/(dashboard)/clients/helpers/client-seo-config/client-jsonld-storage.ts) | Save client → JSON-LD regen |
| `slugChangeOtp` flow | [slug-change-otp.ts](admin/app/(dashboard)/clients/actions/clients-actions/slug-change-otp.ts) | Change client slug |
| Client metadata gen | [clients/[id]/page.tsx](admin/app/(dashboard)/clients/[id]/page.tsx) | OG URL في `<head>` |

**Test steps:**
1. `/clients/new` — يحمّل بدون errors
2. `/clients/[id]/edit` — يحمّل + SEO Analysis accordion يفتح + URL بـ www
3. `/clients/[id]/seo` — يحمّل + preview canonical بـ www
4. Save client → JSON-LD يتعاد توليده + URL بـ www
5. (اختياري) Slug change flow → URL الجديد بـ www

---

### المجموعة 4 — Author Form

| Function | الملف | UI / Path |
|---|---|---|
| `useAuthorForm({ siteUrl })` | [use-author-form.ts](admin/app/(dashboard)/authors/helpers/hooks/use-author-form.ts) | Author form |
| `AuthorForm({ siteUrl })` | [author-form.tsx](admin/app/(dashboard)/authors/components/author-form.tsx) | `/authors` |
| `updateAuthor` action | [update-author.ts](admin/app/(dashboard)/authors/actions/authors-actions/update-author.ts) | Save author |

**Test steps:**
1. `/authors` — يحمّل + Modonty author form
2. Default canonical URL في الـ form بـ www
3. Save → URL في DB بـ www

---

### المجموعة 5 — Modonty Pages (Settings)

| Function | الملف | UI / Path |
|---|---|---|
| `buildHomeJsonLd` | [build-home-jsonld-from-settings.ts](admin/app/(dashboard)/modonty/setting/helpers/build-home-jsonld-from-settings.ts) | Home page SEO |
| `buildClientsPageJsonLd` | [build-clients-page-jsonld.ts](admin/app/(dashboard)/modonty/setting/helpers/build-clients-page-jsonld.ts) | Clients listing page |
| `buildCategoriesPageJsonLd` | [build-categories-page-jsonld.ts](admin/app/(dashboard)/modonty/setting/helpers/build-categories-page-jsonld.ts) | Categories listing |
| `buildTrendingPageJsonLd` | [build-trending-page-jsonld.ts](admin/app/(dashboard)/modonty/setting/helpers/build-trending-page-jsonld.ts) | Trending page |
| `generateHomeAndListPageSEO` | [generate-home-and-list-page-seo.ts](admin/app/(dashboard)/modonty/setting/actions/generate-home-and-list-page-seo.ts) | Save Modonty Page |
| `generateModontyPageSeo` | [generate-modonty-page-seo.ts](admin/app/(dashboard)/modonty/setting/actions/generate-modonty-page-seo.ts) | Save page (custom) |
| `pageActions` | [page-actions.ts](admin/app/(dashboard)/modonty/setting/actions/page-actions.ts) | Page CRUD |

**Test steps:**
1. `/modonty/pages` — قائمة الصفحات
2. افتح أي صفحة → Save → JSON-LD URL بـ www
3. تحقق من الـ JSON-LD المخزن في DB

---

### المجموعة 6 — Categories / Industries / Tags

| Function | الملف | UI / Path |
|---|---|---|
| `generateCategorySeo` | [category-seo-generator.ts](admin/lib/seo/category-seo-generator.ts) | `/categories/[id]/edit` → Save |
| `generateIndustrySeo` | [industry-seo-generator.ts](admin/lib/seo/industry-seo-generator.ts) | `/industries/[id]/edit` → Save |
| `generateTagSeo` | [tag-seo-generator.ts](admin/lib/seo/tag-seo-generator.ts) | `/tags/[id]/edit` → Save |

**Test steps:**
1. عدّل أي category → Save → canonical في DB بـ www
2. نفسه لـ industry + tag

---

### المجموعة 7 — Search Console + External APIs

| Function | الملف | UI / Path |
|---|---|---|
| Search Console page render | [search-console/page.tsx](admin/app/(dashboard)/search-console/page.tsx) | `/search-console` |
| `PendingIndexingCard` props | [pending-indexing-card.tsx](admin/app/(dashboard)/search-console/components/pending-indexing-card.tsx) | داخل /search-console |
| `IndexingPipeline` page | [pipeline/[articleId]/page.tsx](admin/app/(dashboard)/search-console/pipeline/[articleId]/page.tsx) | `/search-console/pipeline/[articleId]` |
| `toAbsoluteUrl` (async الآن) | [lib/gsc/indexing.ts](admin/lib/gsc/indexing.ts) | Indexing API calls |
| `requestIndexing` / `notifyDeleted` | نفسه | "Notify deleted" + "Request indexing" buttons |
| `bulkInspect` | [seo-actions.ts](admin/app/(dashboard)/search-console/actions/seo-actions.ts) | "Inspect all URLs" bulk button |
| `fetchRobotsTxt` + `runRobotsAudit` | [robots-actions.ts](admin/app/(dashboard)/search-console/actions/robots-actions.ts) | "View robots.txt" + "Run robots audit" |
| Pipeline stages 1-7,11 + 12 + 13 | [pipeline-actions.ts](admin/app/(dashboard)/search-console/actions/pipeline-actions.ts) | "Audit the page" / "Check speed" / "Ask Google" buttons |
| `submitAllToIndexNow` | [indexnow-actions.ts](admin/app/(dashboard)/search-console/actions/indexnow-actions.ts) | IndexNow submit button |
| Bing actions | [bing-actions.ts](admin/app/(dashboard)/bing-webmaster/actions/bing-actions.ts) | `/bing-webmaster` |

**Test steps:**
1. `/search-console` — يحمّل بدون errors
2. KPIs Coverage + Tech Health تظهر بأرقام صحيحة
3. Pending Indexing card تعرض المقالات
4. Removal Queue تعرض URLs محتاجة removal
5. Sitemap + Robots cards
6. اضغط Robots → "Run robots audit" → 19 cases pass/fail
7. افتح Pipeline لأي مقال → اضغط "Audit the page" → نتائج تظهر
8. (احذر API quota) "Inspect all URLs" — bulk inspection
9. `/bing-webmaster` — يحمّل

---

### المجموعة 8 — Validators / API Routes

| Function | الملف | UI / Path |
|---|---|---|
| Article validate API | [api/articles/[id]/validate/route.ts](admin/app/api/articles/[id]/validate/route.ts) | Article validate button |
| Slug validate API | [api/articles/slug/[slug]/validate/route.ts](admin/app/api/articles/slug/[slug]/validate/route.ts) | Article preview validate |
| `validateFullPage` | [page-validator.ts](admin/lib/seo/page-validator.ts) | SEO Overview validate |
| `renderPage` | [page-renderer.ts](admin/lib/seo/page-renderer.ts) | Used by validator |
| `revalidateModontyTag` | [lib/revalidate-modonty-tag.ts](admin/lib/revalidate-modonty-tag.ts) | Background (after any save) |

**Test steps:**
1. Save any article → see modonty تتعاد revalidate
2. Click "Validate" on article SEO → response correct

---

### المجموعة 9 — Modonty Frontend (User-facing)

| Function | الملف | URL |
|---|---|---|
| Article metadata generation | [modonty/app/articles/[slug]/page.tsx](modonty/app/articles/[slug]/page.tsx) | `https://www.modonty.com/articles/[slug]` |

**Test steps:**
1. افتح أي مقال على modonty.com بعد deploy
2. View page source → ابحث عن:
   - `<link rel="canonical" href="https://www.modonty.com/articles/...">` ✅
   - `<meta property="og:url" content="https://www.modonty.com/...">` ✅
   - JSON-LD `"url"` بـ www ✅

---

## 🧪 Live Test Plan — الترتيب الموصى به

### Phase A — قبل migration (الكود فقط)
1. `pnpm dev` admin + modonty + console
2. زيارة كل صفحة من الـ 7 مجموعات أعلاه — يجب تحمّل بدون errors
3. Functional smoke: open forms, click buttons, no console errors
4. **توقّع:** القيم القديمة في DB لسه بدون www (canonical mismatch) — هذا طبيعي لحد ما نسوي migration

### Phase B — بعد migration (المرحلة 2)
1. شغل migration script
2. Quality Check للمقال الفاشل → CRITICAL يختفي ✅
3. كل canonical في DB = www
4. Visual + functional verification

### Phase C — بعد deploy لـ Vercel
1. أي مقال جديد ينُشر → canonical بـ www
2. Modonty.com articles → canonical في الـ HTML = www
3. Google Search Console URL Inspection → user-canonical = www

---

## 📊 ملخص الـ Files المعدلة

| Step | Files | Server | Client | UI Routes |
|---|---|---|---|---|
| 1.0 | 1 (new) | 1 | 0 | — |
| 1.1 | 14 | 14 | 0 | 6+ pages |
| 1.2 | 22 | 22 | 0 | 10+ pages |
| 1.3 | 13 | 6 (parents) | 7 (consumers) | 5+ pages |
| 1.4 | 1 | 1 | 0 | modonty.com/articles/* |
| **Total** | **51** | **44** | **7** | **20+ pages** |
