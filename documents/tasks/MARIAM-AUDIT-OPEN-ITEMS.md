# Mariam Audit — Open Items (Backlog)

> **آخر تحديث:** 2026-05-28 22:00 — **/search-console refactor مكتمل + ملف SEO نظيف.**
> **Investigation result (2026-05-28):**
>   - **9 fetch errors** (NOT 7): كلهم 200 على curl live. السبب = GSC stale cache من قبل v1.49.x slug encoding fix. الحل = ping Google عبر IndexNow.
>   - **5 canonical mismatches** (NOT 4): كل الـ 5 pages تُرسل `www.modonty.com` صح على live. السبب = Google يحتفظ بـ canonical قديم من قبل v1.49.1. سيختفي مع الـ recrawl التالي.
>   - **النتيجة:** صفر bugs في الكود. كله stale GSC data.
> **/search-console v0.65.3 (2026-05-28):** restructured — sole source-of-truth = live PROD sitemap (hardcoded `https://www.modonty.com/sitemap.xml`), DB = enrichment only, auto-background-inspect on page load (no manual button), cache TTL 7d → 24h. Verified live on PROD DB: TOTAL=102 (exact sitemap), LIVE=102, Coverage=100%, 102/102 inspected.
> **Open (deferred — non-blocking):** بكرة Mariam تكمل indexing sweep (Google quota reset 00:00 UTC).
> **المصدر:** كل تقارير Mariam (audits + PSI + verification + diagnostic)
> **القاعدة:** بعد كل تقرير → نحدّث هذا الملف، البنود المنجزة تنتقل لـ Done (مش تُحذف)

---

## ✅ P0 — FALSE ALARM (closed 2026-05-27 23:30)

- [x] ~~Arabic slug 404 على Googlebot~~ — **stale cache في GSC، مش bug حقيقي**
  - تشخيص Khalid: "جرّب مقالات أخرى — لا تعتمد على عيّنة واحدة"
  - Mariam اختبرت 5 مقالات Arabic-slug إضافية + المقالة المتّهَمة → كلها HTTP 200 على Googlebot Live Test
  - الـ 404 الأصلي كان بيانات GSC محفوظة من قبل v1.49.3 deploy
  - **الحل:** Request Indexing على ما-هو-السيو لتحديث الـ cache (لا middleware needed)
  - 📄 [modonty-slug-diagnostic-2026-05-27-2322.md](C:/Users/w2nad/Downloads/modonty-slug-diagnostic-2026-05-27-2322.md)

---

## 🟡 Important (مؤجّل من قبل + جديد)

- [ ] **LCP لسه > 2.5s** (audit 2304) 🆕
  - **الحالي:** 3.5s mobile median (ما تحسّن من 3.3s)
  - **السبب الحقيقي (مش الـ Suspense):** render-blocking JS (660ms savings) + unused JS (149KB)
  - **الفِكس المقترح من Mariam:**
    - `fetchpriority="high"` على LCP `<img>` (first feed card cover)
    - `<link rel="preload" as="image">` للـ LCP image في Suspense fallback
    - Split الـ 660ms render-blocking chunk من critical path

- [ ] **CLS مقالة 0.083 — marginal** (audit 2304) 🆕
  - تحت threshold (0.1) لكن قريب
  - السبب المحتمل: صور أو embeds في article body بدون reserved height

- [x] ~~**hreflang ar-SA + ar-EG على صفحات المقالات** (audit #3)~~ ✅ DONE 2026-05-28 (admin v0.65.0)
  - حلّ شامل: 9 locales (GCC كاملة + مصر + ar + x-default) عبر Settings.defaultAlternateLanguages
  - مُدار من admin UI: /seo → Quick Maintenance → hreflang Sync
  - Live verified: curl https://www.modonty.com/articles/ما-هو-السيو → 9 `<link rel="alternate" hreflang="..."/>` tags

- [ ] **og:url trailing slash على الرئيسية** (audit #3)
  - **الموقع:** [modonty/app/page.tsx](modonty/app/page.tsx) — `generateMetadata.openGraph.url`
  - **الحالي:** `https://www.modonty.com` (بدون شرطة)
  - **المطلوب:** `https://www.modonty.com/`

- [ ] **التحقّق من sitemap count: 134 → 102 URLs** (audit #3)

- [ ] **TBT الأصلي 490ms على صفحة المقال** (audit #3) — تحسّن في audit 2304 إلى 120ms ⚠️ ممكن نشيله إذا ظلّ نظيف

---

## 🆕 Phase 9 — Indexing Reasons Dashboard (added 2026-05-28)

- [ ] **Add `coverageState` breakdown UI on /search-console** — replicate GSC dropdown
  - **Data source:** already stored in `GscUrlInspection.coverageState` (no new API calls needed)
  - **15 official GSC reasons** (verified via Google docs 2026-05-28): Server error (5xx) · Redirect error · Blocked by robots.txt · Marked 'noindex' · Soft 404 · Unauthorized (401) · Not found (404) · Forbidden (403) · Other 4xx · Crawled – not indexed · Discovered – not indexed · Alternate page with canonical · Duplicate without canonical · Duplicate, Google chose different · Page with redirect
  - **UI design:** aggregate counts per coverageState + drill-down to URL list per reason
  - **Why:** Khalid wants full visibility in admin without needing an external SEO specialist
  - **Confirmed by docs:** URL Inspection API returns the SAME data as GSC dashboard, but realtime (not 6-day stale)

---

## 🟢 Nice-to-have

- [ ] **FAQPage schema على مقالات SEO** (audit #3)
- [ ] **author.name حقيقي بدل "Modonty"** (audit #3)

---

## ⚠️ استراتيجي (طويل المدى)

- [ ] **GEO citations — modonty يُذكر في AI engines** (audit #3)
  - الحلّ المقترح: [documents/seo/GROWTH-STRATEGY-PARTNER-BACKLINKS.md](documents/seo/GROWTH-STRATEGY-PARTNER-BACKLINKS.md)
  - يحتاج قرارات خالد على 8 أسئلة

---

## 🔄 تنفيذي (انتظر P0 أوّلاً)

- [ ] **بكرة:** Mariam Request Indexing لـ 20 مقالة (Google quota يرجع منتصف الليل UTC) — **⚠️ مشروط بإصلاح P0 أوّلاً، وإلا الـ quota يحترق على 404 URLs**
- [ ] **24-48h:** Bing Webmaster check لتأكيد IndexNow crawl
- [x] **IndexNow curl نُفّذ:** HTTP 200 (Bing/Yandex/Brave/Seznam)

---

## ✅ Done — Verified Live (audit 2304)

- [x] **CLS regression 0.242 → 0.014** (94% تحسّن) — AnnouncementBar logic معكوس ([modonty/components/navigatore/AnnouncementBar.tsx](modonty/components/navigatore/AnnouncementBar.tsx))
- [x] **AnnouncementBar في SSR HTML** — Mariam أكّدت عبر view-source: العنصر موجود في initial HTML قبل JS
- [x] **Performance Mobile: 76 → 83** — +7 نقاط
- [x] **Performance Desktop: 65 → 92** — +27 نقطة 🚀
- [x] **SEO score: 100/100**
- [x] **Accessibility: 100/100**

---

## ✅ Done — 2026-05-28 (search-console restructure)

- [x] **/search-console: source-of-truth = live PROD sitemap only** — v0.65.3
  - Was: `sitemap ∪ GSC top 1000` (110 URLs — included 8 phantom URLs Google discovered but we don't publish)
  - Now: hardcoded `https://www.modonty.com/sitemap.xml` ONLY (102 URLs — exact match to what we publish)
  - DB used ONLY for enrichment (entity name + status per URL type)
  - Verified live on PROD DB: TOTAL=102, LIVE=102, MISSING=0, Coverage=100%

- [x] **/search-console: enrichment extended to all entity types** — v0.65.3
  - Was: only Articles looked up in DB → authors/categories/tags/industries showed `n/a` and were wrong-counted
  - Now: parallel batch lookup for Article + Author + Category + Tag + Industry + Client
  - Result: LIVE 27 → 102 (full enrichment, no false 'other')

- [x] **/search-console: auto-background-inspect on page load** — v0.65.3
  - Was: manual `<InspectBulkButton>` with confirm dialog
  - Now: `<BackgroundInspector>` auto-fires on mount for stale URLs (>24h or never cached), shows live chip in header, `router.refresh()` when complete
  - Quota-safe: caps at 200 URLs per run, concurrency=3
  - Cache TTL lowered from 7d to 24h so fresh data is the new normal

---

## ✅ Done — Earlier sessions

- [x] **Critical #3 (audit #1): JSON-LD live generation** — v1.49.1
- [x] **Important #4 (audit #1): site-wide hreflang on homepage** — v1.49.1
- [x] **Important #5 (audit #1): homepage og:url to www** — v1.49.1
- [x] **Nice-to-have #8 (audit #1): html lang ar-SA** — v1.49.1
- [x] **Critical #1 (audit #1): image-sitemap.xml verified** — v1.49.1
- [x] **Critical (audit #2): ERR_INVALID_CHAR fix via canary.17** — v1.49.0
- [x] **LCP fix attempt #1 (Suspense fallback)** — v1.49.3 (لم يحلّ LCP لكن أفاد CLS)
- [x] **Workflow refactor — sole publish gate** — admin v0.64.0
- [x] **Deleted scheduled cron** — admin v0.64.0

---

## 📝 ملاحظات

- ترتيب الأولوية:
  1. **P0 Arabic slug 404** (يبلوك كل الفهرسة)
  2. P1 LCP fix (الـ chunk split + fetchpriority)
  3. باقي Important
  4. Nice-to-have
  5. استراتيجي
- بعد كل push، Mariam تعيد فحص (trigger: "Mariam verify")
- "موضوع مريم خلص" يعني هذا الملف نظيف من Critical + Important
