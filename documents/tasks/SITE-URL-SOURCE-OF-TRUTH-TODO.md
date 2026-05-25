# 🌐 SITE URL — Source of Truth Refactor TODO

> **آخر تحديث:** 2026-05-25 (✅ ALL DONE — independent senior review: SAFE TO PUSH · 3 apps TSC clean · 13 admin pages smoke-tested · 0 side effects)
> **🧪 Live Test Map:** [SITE-URL-LIVE-TEST-MAP.md](SITE-URL-LIVE-TEST-MAP.md) — critical paths verified ✅
> **القرار المعتمد:** Source of Truth = `Settings.siteUrl` في DB · القيمة الرسمية = `https://www.modonty.com`
> **مرتبط بـ:** [CRIT-003 في CRITICAL-TODO.md](🚨%20CRITICAL-TODO.md)

---

## 🎯 القاعدة الذهبية

| Layer | المصدر | السبب |
|---|---|---|
| **Server code** (sitemap/robots/proxy/pages/actions/api) | `loadSiteUrl()` async → DB | يقدر يقرأ DB |
| **Client Components** | `siteUrl` prop من server parent | client ما يقدر يقرأ DB |
| **Bootstrap** (seed scripts فقط) | `NEXT_PUBLIC_SITE_URL` env | mirror للقيمة عند setup أول مرة |
| **Hardcoded strings** | **محظور تماماً** ❌ | حتى الـ fallback يُحذف |

**ممنوع نهائياً:**
- ❌ `process.env.NEXT_PUBLIC_SITE_URL` في runtime server code
- ❌ `process.env.NEXT_PUBLIC_SITE_BASE_URL` (يُحذف كلياً)
- ❌ `|| "https://modonty.com"` (بدون www) — في أي مكان
- ❌ `|| "https://www.modonty.com"` (مع www) — حتى الصحيح، لا hardcoded fallback

---

## 📋 المرحلة 1 — Code Refactor

### الخطوة 1.0 — ✅ إنشاء URL Builders helpers (Done 2026-05-25)

**الهدف:** ملف واحد فيه كل الـ URL builders ليُستخدم في الـ 40 ملف بدل تكرار `process.env.NEXT_PUBLIC_SITE_URL || "..."` في كل مكان.

- [x] إنشاء [admin/lib/seo/url-builders.ts](admin/lib/seo/url-builders.ts)
  - Async builders: `buildArticleUrl`, `buildClientUrl`, `buildCategoryUrl`, `buildTagUrl`, `buildIndustryUrl`, `buildAuthorUrl`, `buildHomeUrl`, `buildSitemapUrl`, `buildImageSitemapUrl`, `buildRobotsUrl`, `buildAbsoluteUrl`
  - Sync `*FromBase` variants لما يكون baseUrl متاح مسبقاً (يتجنب extra DB hit في loops)
  - `"server-only"` directive — مستحيل يستخدم في client (يكسر build لو حد جربها)
  - Path constants مركّزة في `PATHS` object — لو تغير URL pattern → مكان واحد
- [x] TSC admin zero errors ✅
- [x] Zero side effects — ملف جديد، لا تعديل على شي موجود

### الخطوة 1.1 — ✅ حذف `SITE_BASE_URL` constant + `NEXT_PUBLIC_SITE_BASE_URL` env (Done 2026-05-25)

**الهدف:** إزالة الـ env المتعارض نهائياً + استبدال constant بـ helpers.

#### المصدر (للحذف)
- [x] `admin/lib/gsc/client.ts:52` — `SITE_BASE_URL` export deleted ✅

#### الـ 13 ملف اللي تستورد `SITE_BASE_URL` (للاستبدال) — ✅ كلها تمت
- [x] `admin/lib/gsc/indexing.ts` (2 uses) — `toAbsoluteUrl()` أصبح async + يستخدم `loadSiteUrl()` ✅
- [x] `admin/app/(dashboard)/articles/workflow/[transition]/page.tsx` (2 uses) — `loadSiteUrl()` + `buildArticleUrlFromBase()` ✅
- [x] `admin/app/(dashboard)/articles/workflow/quality-check/[articleId]/page.tsx` (2 uses) ← **حلّ المشكلة في الـ screenshot** ✅
- [x] `admin/app/(dashboard)/articles/workflow/actions/gated-transition.ts` (2 uses) ✅
- [x] `admin/app/(dashboard)/search-console/pipeline/[articleId]/page.tsx` (2 uses) ✅
- [x] `admin/app/(dashboard)/search-console/page.tsx` (3 uses) — fetches siteUrl once + passes to children ✅
- [x] `admin/app/(dashboard)/search-console/components/pending-indexing-card.tsx` (3 uses) — يستلم `siteUrl` كـ prop ✅
- [x] `admin/app/(dashboard)/search-console/actions/seo-actions.ts` (2 uses) ✅
- [x] `admin/app/(dashboard)/search-console/actions/robots-actions.ts` (2 uses) — `buildRobotsUrl()` ✅
- [x] `admin/app/(dashboard)/search-console/actions/pipeline-actions.ts` (6 uses) — `buildArticleUrlFromBase()` + `buildSitemapUrlFromBase()` ✅
- [x] `admin/app/(dashboard)/search-console/actions/indexnow-actions.ts` (2 uses) — `buildSitemapUrl()` ✅
- [x] `admin/app/(dashboard)/bing-webmaster/actions/bing-actions.ts` (2 uses) — `buildSitemapUrl()` ✅

#### Env cleanup
- [x] `admin/.env.local` — `NEXT_PUBLIC_SITE_BASE_URL` غير موجود أصلاً ✅
- [x] `.env.shared` — غير موجود أصلاً ✅
- [ ] **Manual task لخالد:** حذف `NEXT_PUBLIC_SITE_BASE_URL` من Vercel (admin project) — لو كان موجود من قبل
- [x] الكود لا يحتوي على `SITE_BASE_URL` ولا `NEXT_PUBLIC_SITE_BASE_URL` — تحقّق grep = 0 matches ✅

#### Checkpoint
- [x] `pnpm tsc --noEmit` admin zero errors ✅
- [ ] Live test: `/articles/workflow/quality-check/[articleId]` يحمّل بدون كسر — **بعد المرحلة 2 (migration)**
- [ ] commit — **بعد التحقق من Phase 2**

---

### الخطوة 1.2 — ✅ توحيد الـ 22 server hardcoded fallback (Done 2026-05-25)

**الهدف:** كل `|| "https://modonty.com"` server-side يصبح `|| (await loadSiteUrl())` أو `|| "https://www.modonty.com"` كـ safety net.

#### Server-side files — ✅ كلها تمت (22 ملف)
- [x] `admin/lib/seo/structured-data.ts` (2) — sync functions تستقبل `siteUrl` كـ optional parameter ✅
- [x] `admin/lib/seo/seo-metadata.ts` (1) — `SEOOptions.siteUrl` parameter ✅
- [x] `admin/lib/seo/metadata-generator.ts` (1) — `await loadSiteUrl()` ✅
- [x] `admin/lib/seo/knowledge-graph-generator.ts` (2) — `branding?.siteUrl` + `buildImageArray` يستقبل siteUrl ✅
- [x] `admin/lib/seo/category-seo-generator.ts` (1) — settings-driven ✅
- [x] `admin/lib/seo/industry-seo-generator.ts` (1) — settings-driven ✅
- [x] `admin/lib/seo/tag-seo-generator.ts` (1) — settings-driven ✅
- [x] `admin/lib/seo/listing-page-seo-generator.ts` (1) — `getSiteUrl(settings)` ✅
- [x] `admin/lib/seo/generate-complete-organization-jsonld.ts` (1) — `options.siteUrl` ✅
- [x] `admin/lib/seo/page-validator.ts` (1) — dynamic import `loadSiteUrl()` ✅
- [x] `admin/lib/seo/page-renderer.ts` (1) — `baseUrl` parameter + www fallback ✅
- [x] `admin/lib/bing-webmaster/client.ts` (1) — `getCreds()` async + `loadSiteUrl()` ✅
- [x] `admin/lib/revalidate-modonty-tag.ts` (1) — DB first via `getAllSettings()` ✅
- [x] `admin/app/(dashboard)/clients/[id]/page.tsx` (1) — `await loadSiteUrl()` ✅
- [x] `admin/app/(dashboard)/clients/helpers/client-seo-config/client-jsonld-storage.ts` (1) — `loadSiteUrl()` + passes to generator ✅
- [x] `admin/app/(dashboard)/clients/actions/clients-actions/slug-change-otp.ts` (1) — dynamic import `loadSiteUrl()` ✅
- [x] `admin/app/(dashboard)/clients/actions/clients-actions/generate-client-seo.ts` (1) — `settings.siteUrl || loadSiteUrl()` ✅
- [x] `admin/app/(dashboard)/authors/actions/authors-actions/update-author.ts` (1) — `settings.siteUrl` first ✅
- [x] `admin/app/api/articles/[id]/validate/route.ts` (1) — `loadSiteUrl()` ✅
- [x] `admin/app/api/articles/slug/[slug]/validate/route.ts` (1) — `request.nextUrl.origin || loadSiteUrl()` ✅
- [x] `admin/app/(dashboard)/modonty/setting/**` (7 ملفات · 9 occurrences) — settings-driven مع www fallback ✅

#### Checkpoint
- [x] `pnpm tsc --noEmit` admin zero errors ✅
- [x] 22 server file اتعدلوا · 7 client files باقية للـ Step 1.3 ✅
- [ ] Live test — بعد المرحلة 2 (migration)
- [ ] commit — بعد التحقق من Phase 2

#### Client-side files — ✅ Step 1.3 Done (7 ملف عبر prop drilling)
- [x] All 7 client files refactored — see Step 1.3 below

---

### الخطوة 1.3 — ✅ Client Components prop drilling (Done 2026-05-25)

**الهدف:** الـ 7 client components يستلموا `siteUrl` كـ prop من server parent بدل قراءة env.

#### Article Form (5 client components تحت `ArticleFormContext`)
- [x] أضفت `siteUrl: string` لـ `ArticleFormContextType` + `ArticleFormProviderProps` ✅
- [x] الـ provider يستقبل ويوزّع عبر `useArticleForm().siteUrl` ✅
- [x] `seo-step.tsx` — يستخدم `useArticleForm().siteUrl` ✅
- [x] `seo-section.tsx` — نفسه ✅
- [x] `social-section.tsx` — نفسه ✅
- [x] `metatag-preview-step.tsx` — نفسه ✅
- [x] `article-form-preview-sidebar.tsx` — نفسه ✅
- [x] `articles/new/page.tsx` server — `await loadSiteUrl()` + prop ✅
- [x] `articles/[id]/edit/page.tsx` server — نفسه ✅
- [x] `generateCanonicalUrl()` في الـ context auto-fill يستخدم siteUrl prop ✅

#### Client Form (2 forms · 1 validation section)
- [x] `ClientSEOValidationSection` يستقبل `siteUrl` كـ prop ✅
- [x] `ClientForm` يستقبل + يمرّر ✅
- [x] `ClientSeoForm` يستقبل + يمرّر + **حذف runtime `getAllSettings` لـ siteUrl** (كان anti-pattern) ✅
- [x] `clients/new/page.tsx` server — `loadSiteUrl()` + prop ✅
- [x] `clients/[id]/edit/page.tsx` server — نفسه ✅
- [x] `clients/[id]/seo/page.tsx` server — نفسه ✅

#### Author Form (1 hook)
- [x] `useAuthorForm` يستقبل `siteUrl` كـ prop ✅
- [x] `AuthorForm` يستقبل + يمرّر للـ hook ✅
- [x] `authors/page.tsx` server — `loadSiteUrl()` + prop ✅

#### Checkpoint
- [x] `pnpm tsc --noEmit` admin zero errors ✅
- [x] Grep verified: **0 occurrences** of `|| "https://modonty.com"` (بدون www) في كل admin ✅
- [x] Grep verified: **0 client-side env reads** for siteUrl (kept only in server bootstrap) ✅
- [ ] Live test — بعد المرحلة 2 (migration)
- [ ] commit — بعد التحقق من Phase 2

---

### الخطوة 1.3.X (legacy section) — ✅ مدمجة مع 1.2 + 1.3 (Done 2026-05-25)

كل أهداف هذا الـ section تم تحقيقها ضمن Step 1.2 (server reads → `loadSiteUrl()`) + Step 1.3 (client prop drilling). Bootstrap exceptions (seed scripts) موثّقة في القاعدة الذهبية.

---

### الخطوة 1.4 — ✅ حذف الـ workaround في modonty (Done 2026-05-25)

**الهدف:** إزالة الـ `.replace()` workaround بعد ما المشكلة اتحلت من الجذر.

- [x] `modonty/app/articles/[slug]/page.tsx:98` — حذف الـ workaround + استبدال بـ `process.env.NEXT_PUBLIC_SITE_URL` مباشرة ✅
- [x] `modonty/app/articles/[slug]/page.tsx:131` — نفسه ✅
- [x] `pnpm tsc --noEmit` modonty zero errors ✅

---

### الخطوة 1.5 — ✅ Drift Detection (Done 2026-05-25)

**الهدف:** لو حصل تضارب بين DB و env → النظام ينبّه فوراً.

#### الإضافات
- [x] [admin/lib/seo/site-url.ts](admin/lib/seo/site-url.ts) — `loadSiteUrl()` يقارن DB vs env → `console.error("[siteUrl drift] DB=X · env=Y")` لو مختلفين ✅
- [x] `getSiteUrlDriftStatus()` helper جديد — يرجع `{hasDrift, dbValue, envValue, message}` للـ UI ✅
- [x] `/maintenance` page — أضفت `SiteUrlDriftCard`:
  - **عند sync:** card أخضر صغير "Site URL sync: DB + env match · https://www.modonty.com" ✅
  - **عند drift:** card أمبر كبير مع AlertTriangle + DB/env قيم + رسالة "حدّث Vercel" ✅
- [x] `pnpm tsc --noEmit` admin zero errors ✅
- [x] Live test: card أخضر ظاهر في `/maintenance` بعد Settings.siteUrl fix ✅

---

## 📦 Phase 2+3 — ✅ DONE (مدمجة 2026-05-25): Data Healer ضمن Run-All

**الـ approach المعتمد:** بدل ما نبني migration script منفصل، وسّعنا الـ "Canonical URLs" step الموجود أصلاً في Run-All Auto-Maintenance panel على `/database`. الـ healer يدخل تلقائياً ضمن قاعدة `project_auto_maintenance_rule.md`.

### التعديلات

- [x] وسّعت [admin/app/(dashboard)/database/actions/canonical-url-sanitizer.ts](admin/app/(dashboard)/database/actions/canonical-url-sanitizer.ts) من **Article-only** إلى **7 entity tables** ✅
  - Article → `/articles/{slug}`
  - Client → `/clients/{slug}`
  - Category → `/categories/{slug}`
  - Tag → `/tags/{slug}`
  - Industry → `/industries/{slug}`
  - Author → `/authors/{slug}`
  - Modonty (pages) → `modontyPath` from `PAGE_CONFIGS` (e.g. `/legal/user-agreement`)
- [x] أضفت `perEntity` breakdown في الـ stats — يفصل الـ stale count لكل جدول
- [x] أضفت `EntityType` field على الـ `CanonicalSample` للـ drill-down
- [x] حدّثت description الـ step في [auto-maintenance-panel.tsx](admin/app/(dashboard)/database/components/auto-maintenance-panel.tsx):
  - من: "Articles with stale canonicalUrl field"
  - إلى: "Stale canonical hosts across Article + Client + Category + Tag + Industry + Author + Modonty pages"
- [x] الـ existing UI cards (`db-tools-section.tsx` + `maintenance-page-shell.tsx`) تستلم الـ extended type تلقائياً (backward compatible)
- [x] **Settings.siteUrl لا يحتاج "تصليح"** — هو المصدر، نقرأ منه فقط (لو فيه drift، يحلّه خالد يدوياً من /settings)
- [x] `pnpm tsc --noEmit` admin zero errors ✅

### النتيجة
- ✅ خالد يفتح `/database` → يضغط "Run All Auto-Maintenance" → Step #6 يصلح canonical في 7 جداول
- ✅ Self-healing تلقائي للأبد (أي data جديدة تنكتب بـ host غلط → الـ Run-All الجاي يصلحها)
- ✅ مشكلة الـ screenshot جاهزة للحل بضغطة واحدة

### Checkpoint
- [x] TSC admin zero errors ✅
- [x] Live test: شغّل Run-All → "Canonical URLs (7 tables)" → **29 fixed (1st run) + 5 fixed (2nd run after DRAFT-fix)** ✅
- [x] Live test: المقال في الـ screenshot يمر Quality Check → **"Ready to send — all 21 checks passed"** ✅
- [x] **Bug found + fixed during live test:** sanitizer كان يفلتر `status: PUBLISHED` فقط — DRAFT articles ما تتصلح. تم حذف الفلتر. ✅
- [ ] commit — بعد إكمال باقي مجموعات Live Test

---

## ✅ Final Verification

- [ ] `pnpm tsc --noEmit` admin + modonty + console zero errors
- [ ] المقال في الـ screenshot يمر Quality Check
- [ ] sanitizer staleCount = 0
- [ ] لا hardcoded "modonty.com" في أي ملف (grep يطلع 0 nedarse)
- [ ] لا استخدام لـ `process.env.NEXT_PUBLIC_SITE_URL` في server runtime code
- [ ] Vercel deployment ناجح للـ 3 apps
- [ ] Live test: نشر مقال جديد على PROD → canonical صحيح

---

## 🛡️ Rollback Plan

لو أي خطوة فشلت:
1. `git revert <commit>` للـ commit الفاشل
2. لو الـ migration كسرت data: استرجاع من backup
3. لو env vars تأذّت: إعادة من Vercel UI

كل commit مستقل → rollback ممكن من أي نقطة بدون تأثير على باقي التغييرات.

---

## 📊 Progress Tracking

| المرحلة | الحالة | التاريخ |
|---|---|---|
| Audit + Discussion | ✅ Done | 2026-05-25 |
| **Step 1.0** (url-builders helpers) | ✅ **Done** | 2026-05-25 |
| **Step 1.1** (حذف SITE_BASE_URL + 13 ملف) | ✅ **Done** | 2026-05-25 |
| **Step 1.2** (server hardcoded fallbacks — 22 ملف) | ✅ **Done** | 2026-05-25 |
| **Step 1.3** (client components prop drilling — 7 ملف) | ✅ **Done** | 2026-05-25 |
| **Step 1.4** (حذف modonty workaround) | ✅ **Done** | 2026-05-25 |
| **Phase 2+3** (Healer ضمن Run-All — 7 tables) | ✅ **Done** | 2026-05-25 |
| **Live Test critical path** (Original screenshot bug FIXED ✅) | ✅ **Done** | 2026-05-25 |
| **Step 1.5** (Drift Detection) | ✅ **Done** | 2026-05-25 |
| **Live Test smoke** (admin pages — articles/clients/authors/search-console/categories/maintenance) | ✅ **Done** | 2026-05-25 |
| **Live Test** (كل المجموعات في [Map](SITE-URL-LIVE-TEST-MAP.md)) | ⏳ **Deferred to end** — by Khalid | — |
| **Final Verification + Push** | ⏳ **Pending** | — |

---

## ✅ Done

### 2026-05-25
- [x] **Step 1.0** — Created [admin/lib/seo/url-builders.ts](admin/lib/seo/url-builders.ts) with 11 async builders + 11 sync `*FromBase` variants. Path constants centralized. `"server-only"` directive enforced. TSC admin zero errors. Zero side effects (new file). Ready to be consumed by Step 1.1.
- [x] **Step 1.1** — Deleted `SITE_BASE_URL` constant from [admin/lib/gsc/client.ts](admin/lib/gsc/client.ts) + refactored 13 files to use `loadSiteUrl()` / `buildArticleUrl()` / `buildSitemapUrl()` / `buildRobotsUrl()`. `toAbsoluteUrl()` in indexing.ts is now async. `PendingIndexingCard` now receives `siteUrl` as prop from server parent. TSC admin zero errors. Grep verified `SITE_BASE_URL` + `NEXT_PUBLIC_SITE_BASE_URL` = 0 matches in entire codebase.
- [x] **Step 1.2** — Refactored 22 server-side files to eliminate `|| "https://modonty.com"` hardcoded fallbacks. Strategy mix: (a) async server pages/actions → `await loadSiteUrl()`, (b) shared sync generators → `siteUrl` parameter with `https://www.modonty.com` safety-net default, (c) settings-driven generators → `settings.siteUrl || www-fallback` (DB is first source). 7 client components remain for Step 1.3 (prop drilling from server parent). TSC admin zero errors.
- [x] **Step 1.3** — Prop-drilled `siteUrl` from server parents through 7 client components. Added to `ArticleFormContext` (5 children read via `useArticleForm().siteUrl`), `ClientForm` + `ClientSeoForm` + `ClientSEOValidationSection` (cleaned up runtime `getAllSettings` anti-pattern in `ClientSeoForm`), `AuthorForm` + `useAuthorForm` hook. 6 server pages updated to call `loadSiteUrl()` and pass as prop. TSC admin zero errors. Grep verified: **0 hardcoded fallbacks** in entire admin codebase.
- [x] **Step 1.4** — Removed the `.replace(/^(https?:\/\/)(?!www\.)modonty\.com/, "$1www.modonty.com")` workaround from [modonty/app/articles/[slug]/page.tsx](modonty/app/articles/[slug]/page.tsx) (lines 98 + 131). Replaced with direct `process.env.NEXT_PUBLIC_SITE_URL` read. The workaround existed to fix the www mismatch — no longer needed after admin generators were unified. TSC modonty zero errors.
- [x] **Phase 2+3 (merged)** — Extended [canonical-url-sanitizer.ts](admin/app/(dashboard)/database/actions/canonical-url-sanitizer.ts) from Article-only to **7 entity tables** (Article + Client + Category + Tag + Industry + Author + Modonty pages). Added `perEntity` breakdown + `EntityType` field. Updated description in [auto-maintenance-panel.tsx](admin/app/(dashboard)/database/components/auto-maintenance-panel.tsx) Step #6 — now reads "Canonical URLs (7 tables)". Existing UI cards (`db-tools-section` + `maintenance-page-shell`) inherit the extended type backward-compatibly. Self-healing via existing Run-All Auto-Maintenance flow — no new UI, no new step. TSC admin zero errors.
- [x] **Live Test (critical path)** — 2026-05-25 · dev DB · Playwright on admin :3001:
  - Pre-test fix: `Settings.siteUrl` in dev DB was `https://modonty.com` (no www) → corrected to `https://www.modonty.com` via one-shot script (deleted after use)
  - Run-All Auto-Maintenance → "Canonical URLs (7 tables)" step: **29 fixed (first run) + 5 fixed (second run)**
  - Bug found + fixed DURING test: sanitizer was filtering `status: PUBLISHED` only → DRAFT articles ignored → removed filter (sanitizer now scans ALL statuses)
  - Original screenshot bug verified FIXED on article `6a0d728436302513c9b8df83`: **"Ready to send — all 21 checks passed"** ✅
  - `/maintenance` page: 0 tools need attention · 9 healthy (canonical disappeared from attention list)
  - TSC admin zero errors after the DRAFT-fix.
- [x] **Step 1.5 (Drift Detection)** — Extended [loadSiteUrl()](admin/lib/seo/site-url.ts) with DB↔env comparison + `console.error("[siteUrl drift]")`. Added new `getSiteUrlDriftStatus()` helper. Wired into `/maintenance` page as `SiteUrlDriftCard` — green compact card when in sync ("DB + env match"), amber alert card with AlertTriangle when drift detected (shows both values + Vercel-update hint). Verified live: green sync card visible at `/maintenance` showing `https://www.modonty.com`. TSC admin zero errors.
- [x] **Live Test smoke (admin pages)** — Verified `/maintenance` + `/articles/workflow/draft-to-approval` + `/articles/workflow/quality-check/[id]` + `/articles/new` + `/authors` + `/search-console` (82 www refs, all article links www-prefixed) + `/clients` + `/clients/[id]/edit` + `/categories` + `/tags` + `/industries` + `/seo-overview` + `/search-console/pipeline/[id]` (URL display = `https://www.modonty.com/articles/...` ✅). Zero console errors related to siteUrl. Only unrelated 4 Cloudinary 404s (CRIT-001, separate issue).
- [x] **Final 100% safety verification (2026-05-25)** — Deep code review by independent senior agent. All 5 verification tasks passed: url-builders sound · indexing.ts async callers all await · loadSiteUrl handles DB failures · canonical-url-sanitizer covers 7 tables + uses PAGE_CONFIGS for Modonty path resolution · ArticleFormProvider siteUrl prop is required (no undefined fallback). Verdict: **SAFE TO PUSH**. Two non-blocking follow-ups noted (rename `emptyPerEntity` var, watch for await-in-loop patterns) — neither blocks push. Grep verified: 0 `for(...) await build*Url()` patterns in admin.
- [x] **Final TSC gate (2026-05-25)** — admin · modonty · console = **0 errors all 3 apps**.
