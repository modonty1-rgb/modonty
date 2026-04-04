# خطة العمل — SEO Cache System Fix

> **الهدف:** إصلاح كل مولدات SEO Cache + robots.txt → الإطلاق
> **القاعدة:** كل خطوة نخلصها ← نعلّم عليها ✅ ← نتحرك للي بعدها

---

## المرحلة 1: إصلاح مولد الفئات (Categories)

**المشكلة:** المولد يقرأ `siteUrl` بس — باقي القيم hardcoded
**الملف:** `admin/lib/seo/category-seo-generator.ts` (112 سطر)

**الوضع الحالي — القيم الثابتة اللي لازم تتغير:**
```
سطر 21: robots: "index, follow"              ← لازم يجي من settings.defaultMetaRobots
سطر 28: siteName: "Modonty"                  ← لازم يجي من settings.siteName
سطر 29: locale: "ar_SA"                      ← لازم يجي من settings.defaultOgLocale
سطر 30: صورة alt تستخدم title بس            ← لازم يضيف socialImageAlt لو موجود
سطر 35: card يتحدد بوجود الصورة بس          ← لازم يجي من settings.defaultTwitterCard
سطر 35: ما في twitterSite ولا twitterCreator ← لازم يجيون من settings
سطر 59: inLanguage: "ar"                     ← لازم يجي من settings.inLanguage
```

**الـ pattern المطلوب:**
```typescript
// بدل ما نمرر siteUrl بس — نمرر settings كامل
export async function generateAndSaveCategorySeo(categoryId: string) {
  const settings = await getAllSettings();
  const siteUrl = settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
  const siteName = settings.siteName || "Modonty";
  const inLanguage = settings.inLanguage || "ar";
  const ogLocale = settings.defaultOgLocale || "ar_SA";
  const metaRobots = settings.defaultMetaRobots || "index, follow";
  const twitterCard = settings.defaultTwitterCard || "summary_large_image";
  const twitterSite = settings.twitterSite || undefined;
  const twitterCreator = settings.twitterCreator || undefined;
  // ... ثم نمررهم لـ buildCategoryMetadata و buildCategoryJsonLd
}
```

**الخطوة 1.1:** تعديل `buildCategoryMetadata` — يستقبل settings object بدل siteUrl string
**الخطوة 1.2:** تعديل `buildCategoryJsonLd` — يستقبل settings object بدل siteUrl string
**الخطوة 1.3:** تعديل `generateAndSaveCategorySeo` — يقرأ كل الإعدادات ويمررها
**الخطوة 1.4:** إضافة `socialImageAlt` في select query (سطر 78) + استخدامه في OG image alt

**التحقق:**
- [ ] 1.1 — `buildCategoryMetadata` يستخدم settings بدل hardcoded values
- [ ] 1.2 — `buildCategoryJsonLd` يستخدم settings بدل hardcoded values
- [ ] 1.3 — `generateAndSaveCategorySeo` يقرأ كل Settings ويمررها
- [ ] 1.4 — socialImageAlt مضاف في OpenGraph
- [ ] 1.5 — `pnpm tsc --noEmit` على الملف — صفر أخطاء
- [ ] 1.6 — اختبار: إنشاء فئة → الـ cache يحتوي على siteName من Settings مو "Modonty"

---

## المرحلة 2: بناء مولد التاقات (Tags)

**المشكلة:** ما في مولد أصلاً — حقول SEO cache فاضية في DB
**الملف الجديد:** `admin/lib/seo/tag-seo-generator.ts`
**مبني على:** نسخة من `admin/lib/seo/category-seo-generator.ts` المصلح

**الفرق الوحيد عن Category:**
```
URL prefix:        /tags/{slug}       (بدل /categories/{slug})
Breadcrumb label:  "الوسوم"            (بدل "التصنيفات")
Breadcrumb URL:    {siteUrl}/tags      (بدل {siteUrl}/categories)
DB model:          db.tag              (بدل db.category)
```

**الملفات اللي تتعدل:**

1. **ملف جديد:** `admin/lib/seo/tag-seo-generator.ts`
   - نسخة من category-seo-generator.ts المصلح
   - تغيير: URL path, breadcrumb labels, DB model name
   - يصدّر: `generateAndSaveTagSeo(tagId)` + `batchGenerateTagSeo()`

2. **تعديل:** `admin/app/(dashboard)/tags/actions/tags-actions.ts`
   - في `createTag` (بعد `db.tag.create`): إضافة استدعاء المولد
   - في `updateTag` (بعد `db.tag.update`): إضافة استدعاء المولد
   - **نفس pattern الفئات:**
   ```typescript
   try {
     const { generateAndSaveTagSeo } = await import("@/lib/seo/tag-seo-generator");
     await generateAndSaveTagSeo(tag.id);
   } catch (e) { console.error("Tag SEO gen failed:", e); }
   ```

3. **ملف جديد:** `admin/app/(dashboard)/tags/components/revalidate-seo-button.tsx`
   - نسخة من `admin/app/(dashboard)/categories/[id]/components/revalidate-seo-button.tsx`
   - تغيير: يستدعي `generateAndSaveTagSeo` بدل `generateAndSaveCategorySeo`
   - Props: `{ tagId: string }` بدل `{ categoryId: string }`

4. **ملف جديد:** `admin/app/(dashboard)/tags/components/revalidate-all-seo-button.tsx`
   - نسخة من `admin/app/(dashboard)/categories/components/revalidate-all-seo-button.tsx`
   - تغيير: يستدعي `batchGenerateTagSeo` بدل `batchGenerateCategorySeo`

**التحقق:**
- [ ] 2.1 — `tag-seo-generator.ts` موجود ويصدّر الدوال الثلاث
- [ ] 2.2 — `createTag` يستدعي المولد بعد الإنشاء
- [ ] 2.3 — `updateTag` يستدعي المولد بعد التعديل
- [ ] 2.4 — زر Revalidate SEO موجود في صفحة التاق
- [ ] 2.5 — زر Revalidate All SEO موجود في صفحة القائمة
- [ ] 2.6 — `pnpm tsc --noEmit` — صفر أخطاء
- [ ] 2.7 — اختبار: إنشاء تاق → حقول nextjsMetadata و jsonLdStructuredData ممتلئة

---

## المرحلة 3: بناء مولد الصناعات (Industries)

**نفس المرحلة 2 بالضبط — بس للصناعات**
**الملف الجديد:** `admin/lib/seo/industry-seo-generator.ts`

**الفرق عن Tag:**
```
URL prefix:        /industries/{slug}  (بدل /tags/{slug})
Breadcrumb label:  "الصناعات"           (بدل "الوسوم")
Breadcrumb URL:    {siteUrl}/industries (بدل {siteUrl}/tags)
DB model:          db.industry          (بدل db.tag)
```

**الملفات اللي تتعدل:**

1. **ملف جديد:** `admin/lib/seo/industry-seo-generator.ts`

2. **تعديل:** `admin/app/(dashboard)/industries/actions/industries-actions/create-industry.ts`
   ```typescript
   // بعد db.industry.create:
   try {
     const { generateAndSaveIndustrySeo } = await import("@/lib/seo/industry-seo-generator");
     await generateAndSaveIndustrySeo(industry.id);
   } catch (e) { console.error("Industry SEO gen failed:", e); }
   ```

3. **تعديل:** `admin/app/(dashboard)/industries/actions/industries-actions/update-industry.ts`
   - نفس الاستدعاء بعد `db.industry.update`

4. **ملف جديد:** `admin/app/(dashboard)/industries/components/revalidate-seo-button.tsx`

5. **ملف جديد:** `admin/app/(dashboard)/industries/components/revalidate-all-seo-button.tsx`

**التحقق:**
- [ ] 3.1 — `industry-seo-generator.ts` موجود
- [ ] 3.2 — `createIndustry` يستدعي المولد
- [ ] 3.3 — `updateIndustry` يستدعي المولد
- [ ] 3.4 — أزرار Revalidate موجودة
- [ ] 3.5 — `pnpm tsc --noEmit` — صفر أخطاء
- [ ] 3.6 — اختبار: إنشاء صناعة → cache يتولد

---

## المرحلة 4: إصلاح مولد العملاء (Clients)

**المشكلة:** يقرأ من `process.env` بدل Settings
**الملفات:**
- `admin/app/(dashboard)/clients/actions/clients-actions/generate-client-seo.ts`
- `admin/lib/seo/generate-complete-organization-jsonld.ts`

**التغيير المطلوب:**
```typescript
// بدل:
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";

// يصير:
const settings = await getAllSettings();
const siteUrl = settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
const siteName = settings.siteName || "Modonty";
const inLanguage = settings.inLanguage || "ar";
const ogLocale = settings.defaultOgLocale || "ar_SA";
const metaRobots = settings.defaultMetaRobots || "index, follow";
const twitterSite = settings.twitterSite || undefined;
const twitterCreator = settings.twitterCreator || undefined;
```

**القيم الثابتة اللي لازم تتغير في generate-client-seo.ts:**
```
siteName: "Modonty"              → settings.siteName
locale: "ar_SA"                  → settings.defaultOgLocale
robots: "index, follow"          → settings.defaultMetaRobots
language: "ar"                   → settings.inLanguage
charset: "UTF-8"                 → settings.defaultCharset
```

**القيم الثابتة في generate-complete-organization-jsonld.ts:**
```
siteUrl = process.env...         → settings.siteUrl
inLanguage hardcoded             → settings.inLanguage
```

**التحقق:**
- [ ] 4.1 — generate-client-seo.ts يقرأ من getAllSettings()
- [ ] 4.2 — generate-complete-organization-jsonld.ts يقرأ من getAllSettings()
- [ ] 4.3 — صفر `process.env.NEXT_PUBLIC_SITE_URL` في المولدين (إلا كـ fallback ثالث)
- [ ] 4.4 — صفر "Modonty" أو "ar_SA" أو "ar" hardcoded
- [ ] 4.5 — `pnpm tsc --noEmit` — صفر أخطاء

---

## المرحلة 5: تحديث robots.txt

**الملف:** `modonty/app/robots.ts`

**المطلوب:** إضافة rules لـ 8 بوتات AI مع نفس disallow paths:

```typescript
// إضافة بعد rule الـ Googlebot:
{ userAgent: "OAI-SearchBot", allow: "/", disallow: ["/api/", "/admin/", "/users/login/", "/users/profile/"] },
{ userAgent: "ChatGPT-User", allow: "/", disallow: ["/api/", "/admin/", "/users/login/", "/users/profile/"] },
{ userAgent: "GPTBot", allow: "/", disallow: ["/api/", "/admin/", "/users/login/", "/users/profile/"] },
{ userAgent: "ClaudeBot", allow: "/", disallow: ["/api/", "/admin/", "/users/login/", "/users/profile/"] },
{ userAgent: "Claude-User", allow: "/", disallow: ["/api/", "/admin/", "/users/login/", "/users/profile/"] },
{ userAgent: "Claude-SearchBot", allow: "/", disallow: ["/api/", "/admin/", "/users/login/", "/users/profile/"] },
{ userAgent: "PerplexityBot", allow: "/", disallow: ["/api/", "/admin/", "/users/login/", "/users/profile/"] },
{ userAgent: "Google-Extended", allow: "/", disallow: ["/api/", "/admin/", "/users/login/", "/users/profile/"] },
```

**التحقق:**
- [ ] 5.1 — 8 بوتات AI مضافة في robots.ts
- [ ] 5.2 — `pnpm tsc --noEmit` — صفر أخطاء

---

## المرحلة 6: زر إعادة توليد الكل في Settings

**الملف الجديد:** `admin/app/(dashboard)/settings/components/regenerate-all-seo-button.tsx`
**الملف الجديد:** `admin/app/(dashboard)/settings/actions/regenerate-all-seo.ts`

**Server Action:**
```typescript
"use server";
export async function regenerateAllSeoCache() {
  const { batchGenerateCategorySeo } = await import("@/lib/seo/category-seo-generator");
  const { batchGenerateTagSeo } = await import("@/lib/seo/tag-seo-generator");
  const { batchGenerateIndustrySeo } = await import("@/lib/seo/industry-seo-generator");
  
  const [categories, tags, industries] = await Promise.all([
    batchGenerateCategorySeo(),
    batchGenerateTagSeo(),
    batchGenerateIndustrySeo(),
  ]);
  
  return { categories, tags, industries };
}
```

**الزر:** يضاف في صفحة Settings — نفس pattern الـ RevalidateAllSEOButton الموجود في Categories.

**التحقق:**
- [ ] 6.1 — server action `regenerateAllSeoCache` موجود
- [ ] 6.2 — الزر يظهر في صفحة Settings
- [ ] 6.3 — ضغط الزر → كل الفئات + التاقات + الصناعات تتولد
- [ ] 6.4 — `pnpm tsc --noEmit` — صفر أخطاء

---

## المرحلة 7: الفحص النهائي

- [ ] 7.1 — `pnpm tsc --noEmit` على كامل المشروع — صفر أخطاء
- [ ] 7.2 — `pnpm build` — يمر بنجاح
- [ ] 7.3 — اختبار يدوي: إنشاء فئة + تاق + صناعة → كل الـ cache يتولد بقيم Settings
- [ ] 7.4 — تحديث version في package.json
- [ ] 7.5 — `bash scripts/backup.sh`
- [ ] 7.6 — commit + push
