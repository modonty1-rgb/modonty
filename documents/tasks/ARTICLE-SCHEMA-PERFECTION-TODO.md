# Article Schema — Perfection TODO

> **آخر تحديث:** 2026-05-03 (Tier 1 closed · Tier 2 + Tier 3 نُقلوا لـ MASTER-TODO #5 SCHEMA-T2 — low ROI, post-push monitoring)
> **النطاق:** تحقيق Article 100% perfect وفقاً لـ Schema.org spec الرسمي + Google Article Rich Results.
> **الدراسة مبنية على:**
> - Code: [schema.prisma](dataLayer/prisma/schema/schema.prisma) Article model + [modonty/lib/seo/index.ts](modonty/lib/seo/index.ts) JSON-LD generator
> - Schema.org الرسمي (`/schemaorg/schemaorg`)
> - Google Search Central (`/websites/developers_google_search`)

---

## 📊 ما لدينا حالياً (شغّال وسليم)

JSON-LD المُولَّد يحتوي:
- `@type: Article` · `headline` · `description` · `image` · `datePublished` · `dateModified`
- `author` (Person + name + url + image) · `publisher` (Organization + name + logo)
- `mainEntityOfPage` · `articleSection` · `wordCount`
- `inLanguage` · `isAccessibleForFree` · `license`
- `mainEntity` (FAQPage) عند وجود FAQs

في DB:
- `citations` String[] · `semanticKeywords` Json (Wikidata) · `breadcrumbPath` · `articleBodyText`
- `gallery` (ArticleMedia[]) · `audioUrl` · `featuredImage`

---

## 🔧 Tier 1.5 — Cascade Reliability
*(كل ال tasks اتنقلوا لـ Done — T1.7 + T1.8 ✅)*

---

## 🔴 Tier 1 — Critical (Rich Results + E-E-A-T)

### T1.3 — Reviewer Field → **DEFERRED** (نُقل لـ MASTER-TODO #3 — T1.3-REV)
- **حالة:** الـ Code work بسيط (~30-45 دقيقة) لكن blocker الحقيقي هو operations: modonty ما عنده طبيب مراجع
- **المرجع الكامل:** [✅ MASTER-TODO.md → T1.3-REV](✅%20MASTER-TODO.md) — يحتوي تفاصيل الـ outreach options + code steps
- **متى نرجع لها:** لما يتم تأكيد طبيب أسنان مرخّص (LinkedIn outreach أو paid editor)

*(T1.5 موجود في Done — مكتمل بالفعل بدون شغل code)*

---

*(Tier 2 + Tier 3 نُقلوا لـ [✅ MASTER-TODO.md](✅%20MASTER-TODO.md) — يُرجَع لهم بعد monitoring Search Console post-push)*

---


---

## ❌ خارج النطاق (لا ننفّذها)

- **Backlinks tab** — مفهوم خاطئ (Backlinks = روابط واردة من مواقع خارجية، مكتسبة لا تُدخَل يدوياً). الموضوع تابع لـ Search Console كـ analytics فقط.
- **Plagiarism check** — يحتاج external API مدفوع
- **Drag & drop reorder للأقسام** — over-engineering

---

## 📋 خطة التنفيذ المقترحة

```
Phase 1: Tier 1 (T1.1 → T1.6) — ~3-4 أيام عمل
  → نتيجة: Article 100% Schema.org compliant + Google Rich Results ready

Phase 2: Tier 2 (T2.1 → T2.5) — ~2-3 أيام
  → نتيجة: Voice + Video + Engagement signals + Homepage Featured

Phase 3: Tier 3 — حسب الأولوية لاحقاً
```

---

## ✅ Done

### Guideline addition — Publisher Authority Transfer (2026-05-03)
- **Side-task:** أضفنا قسم في [admin/app/(public)/guidelines/clients/page.tsx](admin/app/(public)/guidelines/clients/page.tsx) يوضح إن الـ publisher في JSON-LD = العميل (Client)، مش مودونتي
- **القيمة البيعية:** كل مقال يبني domain authority للعميل تلقائياً عبر Google Schema.org
- **المحتوى:** Card violet جديد + JSON-LD مثال مرئي + 4 bullet points + sales pitch جاهز
- **الموقع:** بين "التكامل التقني" و "ملاحظة للسيلز" — قبل الـ closing لتعزيز الـ value proposition
- **TSC:** admin zero errors · live verified على /guidelines/clients

### T1.5 — Publisher Logo Dimensions (2026-05-03 — VERIFIED ALREADY DONE)
- **المرجع:** Google Article rich results — publisher.logo strict requirements (min 112×112, max 1200 wide, aspect ≤ 4:1)
- **الحالة:** ✅ **مكتمل بالفعل** — صفر شغل code مطلوب
- **السبب:** الـ generator [admin/lib/seo/knowledge-graph-generator.ts:476-482](admin/lib/seo/knowledge-graph-generator.ts) يخرج width + height للـ Client.logoMedia تلقائياً
- **DB verification (3 clients):**
  | Client | logoMedia | dimensions | Google compliant? |
  |---|---|---|---|
  | كيما زون | ✓ | 200×205 PNG | ✅ |
  | شركة جبر سيو | ✓ | 2084×2084 PNG | ✅ |
  | شركة جبر الجنوبية | ✓ | 2084×2084 PNG | ✅ |
- **Live test على modonty article test:** الـ JSON-LD يحتوي:
  ```json
  "publisher": {
    "@type": "Organization",
    "name": "كيما زون",
    "logo": { "@type": "ImageObject", "url": "...", "width": 200, "height": 205 }
  }
  ```
- **ملاحظة:** الـ Google requirement يخص publisher (Client) — مش author. الـ Modonty author Organization (T1.2) عنده logo بدون dimensions، لكن هذا **مش requirement من Google** للـ Article rich results.

### T1.8 — Cascade UI feedback (Live Progress Banner) (2026-05-03 — VERIFIED)
- **النهج:** Client-driven cascade (zero DB schema change) — الـ form يطلب IDs ويلف عليها call-by-call؛ state يتحدث بعد كل response.
- **الملفات:**
  - [x] [`cascade-step-actions.ts`](admin/app/(dashboard)/settings/actions/cascade-step-actions.ts) — 7 server actions (getCascadeEntities + regenerateOneArticle + regenerateOneClient + 4 bulk + finalizeRevalidation)
  - [x] [`settings-actions.ts`](admin/app/(dashboard)/settings/actions/settings-actions.ts) — أزيل background cascade trigger من updateAllSettings
  - [x] [`settings-form-v2.tsx`](admin/app/(dashboard)/settings/components/settings-form-v2.tsx) — `<CascadeProgressBanner />` + saveModonty rewrite phase-by-phase
- **التنفيذ:**
  - state `cascade: { phase, total, completed, errors, message }` — UI يعكسه فوراً بعد كل entity
  - 7 phases sequential: saving → articles → clients → categories → tags → industries → listings → done
  - Banner يعرض progress bar + counter (e.g. `📝 تحديث المقالات 7/23`) + error count لو في
  - Auto-hide بعد 5s من النجاح
  - Done state: emerald banner `✅ تم تحديث كل المحتوى بنجاح (N عنصر)`
- **TSC:** admin zero errors
- **✅ Live test (2026-05-03 17:04-17:08):**
  - Click Save & Publish → الـ banner ظهر فوراً
  - شفنا live: `📝 تحديث المقالات 7/23` مع progress bar = 30% width
  - Phase transition: → `👥 تحديث العملاء 0/3`
  - Final emerald banner: `✅ تم تحديث كل المحتوى بنجاح (26 عنصر)` (23 مقال + 3 عملاء)
  - الـ banner لون primary أثناء التحديث، أخضر emerald عند النجاح

### T1.7 — Settings Cascade Unified into single atomic save (2026-05-03)
- **المشكلة:** `saveModonty()` كان يطلق 6 server actions متوازية بـ `Promise.all` — 3 منها تطلق cascade متوازية على نفس DB → duplicate work + race conditions. كمان `saveMediaSettings` (logoUrl) و `saveModontySettings` (page SEO) ما عندهم cascade — gap حقيقي.
- **الحل المطبَّق (خيار B من T1.7 plan):**
  - [x] `updateAllSettings()` في [settings-actions.ts](admin/app/(dashboard)/settings/actions/settings-actions.ts) أصبح يطلق cascade مرة واحدة في النهاية
  - [x] قسّم الـ second update إلى 2 chunks (< 50 حقل لكل chunk) لتجنب MongoDB Atlas pipeline limit
  - [x] [settings-form-v2.tsx](admin/app/(dashboard)/settings/components/settings-form-v2.tsx) `saveModonty()` يستدعي `updateAllSettings(settings)` واحد فقط بدل Promise.all لـ 6 actions
  - [x] الـ 6 actions القديمة (saveSiteSettings, etc.) محتفظ بها للـ backward compat
- **مشكلة وقت التنفيذ:** Atlas Error 8000 "Pipeline length greater than 50 not supported" — الـ update الأصلي كان 73 حقل دفعة وحدة. الحل: قسّمناه إلى 2 updates × 45 حقل كل واحد.
- **TSC:** admin zero errors
- **✅ Live test:** ضغط Save & Publish (16:42:46) → cascade اشتغل → 23/23 مقال تجدد JSON-LD خلال ~50 ثانية. آخر check: `recent === total = 23`. الـ logo Cloudinary URL موجود في كل المقالات.
- **⚠️ Pending UX gap → T1.8:** الـ cascade يشتغل في background بدون UI feedback. الأدمن يشوف toast نجاح فوراً لكن الـ regeneration ما تنتهي إلا بعد 30-60 ثانية. مفصول كـ T1.8 في Tier 1.5.

### T1.2 — Modonty Author = Organization (Brand-level E-E-A-T) (2026-05-03)
- **القرار التصميمي:** Modonty = brand author على مستوى المنصة (مش Person فردي). الكُتّاب الفعليون موظفون داخليون، والـ brand هي الواجهة العامة للمحتوى. نمط Forbes/BuzzFeed.
- **الحل المطبَّق:**
  - [x] [`admin/lib/seo/knowledge-graph-generator.ts`](admin/lib/seo/knowledge-graph-generator.ts) — `PLATFORM_AUTHOR_SLUGS = ["modonty"]` + `generatePlatformAuthorNode()` يخرج `@type: Organization` بدل Person لما `author.slug === "modonty"`
  - [x] `PlatformBranding` interface + توقيع `generateArticleKnowledgeGraph(article, branding?)` يقبل branding من Settings
  - [x] [`admin/lib/seo/jsonld-storage.ts`](admin/lib/seo/jsonld-storage.ts) — يبني branding object من Settings (siteName + siteUrl + brandDescription + logoUrl + 7 social URLs) ويمررها للـ generator
- **اختيارات التصميم:**
  - **صفر تغيير في DB schema** — Author "modonty" موجود أصلاً
  - **branding يُقرأ من Settings** — single source of truth، يتعدل من `/settings` admin UI
  - **fallback graceful** — لو Settings ما فيها logoUrl، الـ logo حقل ينحذف من JSON-LD (Schema.org يقبله optional)
  - **detection بالـ slug** (`PLATFORM_AUTHOR_SLUGS`) — قابل للتمدد لو في brands ثانية مستقبلاً
- **TSC:** admin zero errors
- **✅ Live test على article test (مقال-اختبار-دورة-العمل-حذف-بعد-الانتهاء):**
  - `@type: "Organization"` ✓
  - `name: "Modonty"` ✓ (من Settings.siteName)
  - `url: "https://modonty.com"` ✓ (من Settings.siteUrl)
  - `description: "Modonty — your trusted dental and healthcare platform in the Gulf region."` ✓ (من Settings.brandDescription)
  - `sameAs[]` = 7 روابط ✓ (Facebook · X · LinkedIn · Instagram · YouTube · TikTok · Snapchat — كلها من Settings)
- **✅ Logo data config مكتمل (2026-05-03 16:27):**
  - رُفع الشعار عبر Playwright في `/settings` admin tab Modonty → حقل Logo URL
  - الرابط: `https://res.cloudinary.com/dfegnpgwx/image/upload/v1768724691/final-01_fdnhom.svg`
  - DB verified (MongoDB direct query): `Settings.logoUrl` + `Settings.orgLogoUrl` كلاهما sync تلقائياً (الـ admin save action يحفظ نفس القيمة في الحقلين)
  - JSON-LD regenerated تلقائياً بعد الحفظ — verified على المقال test:
    ```
    "logo": { "@type": "ImageObject", "url": "https://res.cloudinary.com/.../final-01_fdnhom.svg" }
    ```
  - **النتيجة النهائية للـ author node:** 7/7 حقول مكتملة (@id · @type · name · url · description · logo · sameAs[7])

### T1.1 — Multiple Image Aspect Ratios (1:1 · 4:3 · 16:9) (2026-05-03)
- **المرجع:** Google Article rich results spec
- **الحل المطبَّق:** Cloudinary auto-crop (`c_fill,ar_X:Y,g_auto`) — صورة واحدة في DB، 3 variants في JSON-LD
- **الملفات:**
  - [x] [`modonty/lib/seo/image-aspect-ratios.ts`](modonty/lib/seo/image-aspect-ratios.ts) — Helper جديد (`buildAspectRatioUrl` + `buildAspectRatiosArray`)
  - [x] [`admin/lib/seo/knowledge-graph-generator.ts`](admin/lib/seo/knowledge-graph-generator.ts) — Primary generator يخرج 3 ImageObjects (1:1 + 4:3 + 16:9) مع dimensions صحيحة لكل واحد
  - [x] [`modonty/lib/seo/index.ts`](modonty/lib/seo/index.ts) — Fallback generator يستخدم `buildAspectRatiosArray()` لـ `image[]`
- **اختيارات التصميم:**
  - **صفر تغيير في DB schema** — featuredImageId واحد يبقى
  - **صفر تغيير في UI** — Cover uploader في Media tab يظل كما هو
  - **صفر تغيير على Modonty UI** (hero/cards/OG) — اللوقو consumers لم يتغيروا
  - **Primary 16:9** يحمل `representativeOfPage: true` (الباقي ImageObjects عادية)
  - **Width/Height ثابتة:** 1200×675 (16:9) · 1200×900 (4:3) · 1200×1200 (1:1)
- **TSC:** admin + modonty zero errors
- **Side effects:** صفر — التعديل additive (نضيف URLs، ما نشيل) · Schema.org يقبل array · Cache lazy regen
- **✅ Live test:** على المقال 69f71c9cdf533d533b45f48b — حفظ وإعادة توليد JSON-LD أنتج 3 ImageObjects (#primary-image / #primary-image-4x3 / #primary-image-1x1) مع transformations Cloudinary صحيحة
- **Pending:** push + validate على Google Rich Results Test في production

### T1.6 — Bug Fix: Inject Semantic Keywords كـ mentions (2026-05-03)
- **النوع:** Bug — الحقل محفوظ في DB لكن لا يُستخدم سابقاً
- **المرجع:** Schema.org `mentions` للـ entities
- **الملف:** [modonty/lib/seo/index.ts:265](modonty/lib/seo/index.ts) (`generateArticleStructuredData`)
- **الحل المطبَّق:**
  - [x] إضافة block يحوّل `semanticKeywords` → `mentions[]`
  - [x] Wikidata URL canonical كـ `@id` + `sameAs` للـ entity disambiguation
  - [x] Graceful fallback لو ما في wikidataId/url → `{ @type: Thing, name }` فقط
  - [x] Filter يستبعد entries فاضية أو بدون name
  - [x] TSC modonty zero errors
- **ملاحظة Cache:** الـ JSON-LD المخزّن في DB لمقالات existing ما رح يتحدّث تلقائياً. **Lazy regeneration** — كل مقال يولّد JSON-LD جديد عند next save (آمن وتدريجي).
- **Pending للـ pre-push:** modonty version bump + push (الـ generator فيها) + validate على Google Rich Results Test
