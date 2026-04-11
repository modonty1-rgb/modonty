# SEO — Article Page Structured Data TODO

> Created: 2026-04-11
> Priority: HIGH — Rich Results في نتائج جوجل
> Based on: Google Search Central official docs (developers.google.com)
>
> ⚠️ كل تاسك له ارتباطات في أماكن ثانية — راجعها قبل أي تعديل.

---

## SEO-A1 — Breadcrumb JSON-LD مفقود من صفحة المقال

**المشكلة:**
الـ breadcrumb موجود في الـ UI لكن لا يوجد `BreadcrumbList` JSON-LD مُخرَج في الصفحة.
جوجل يستخدمه لعرض breadcrumb trail تحت العنوان مباشرة في نتائج البحث (Rich Result مجاني ومؤكد).

**الدالة موجودة ولا تُستخدم:**
- `lib/seo/index.ts` → `generateBreadcrumbStructuredData(items)` ✅ موجودة وجاهزة

**الارتباطات اللي لازم نراجعها:**
- [ ] `modonty/app/articles/[slug]/page.tsx` — أين يُضاف الـ script tag؟ (قبل أو بعد JSON-LD المقال؟ أم داخل `@graph`؟)
- [ ] `modonty/lib/seo/index.ts` → `generateBreadcrumbStructuredData` — هل تولّد URLs صحيحة مع `NEXT_PUBLIC_SITE_URL`؟ تحقق.
- [ ] هل الـ admin يولّد breadcrumb داخل `jsonLdStructuredData` المحفوظ في DB؟ إذا نعم → لا نضيف مرتين.
  - راجع: `admin/lib/seo/structured-data.ts` و `admin/app/(dashboard)/articles/helpers/article-seo-config/generate-article-structured-data.ts`
- [ ] إذا الـ DB JSON-LD يحتوي `@graph` → الـ breadcrumb يدخل داخل نفس `@graph` أم كـ script منفصل؟ (جوجل يقبل كلاهما لكن `@graph` أفضل)
- [ ] صفحات أخرى تستخدم breadcrumb UI: `/clients/[slug]`, `/authors/[slug]`, `/categories/[slug]` — هل تحتاج نفس الإضافة؟

**المصدر الرسمي:**
https://developers.google.com/search/docs/appearance/structured-data/breadcrumb

---

## SEO-A2 — JSON-LD fallback غائب (مقالات بدون DB cache)

**المشكلة:**
```tsx
// page.tsx line 193
if (article.jsonLdStructuredData) {
  jsonLdGraph = JSON.parse(article.jsonLdStructuredData);
}
// إذا فارغ → الصفحة تُعرض بدون أي Article Schema
```
أي مقال لم يمر على SEO Analyzer في الأدمن = صفحة بدون structured data.

**الدالة موجودة ولا تُستخدم:**
- `lib/seo/index.ts` → `generateArticleStructuredData(article)` ✅ موجودة

**الارتباطات اللي لازم نراجعها:**
- [ ] متى يُولَّد `jsonLdStructuredData` في الأدمن بالضبط؟ هل هو جزء من publish flow التلقائي؟ أم يدوي فقط؟
  - راجع: `admin/app/(dashboard)/articles/helpers/article-seo-config/generate-article-structured-data.ts`
  - راجع: publish action في `admin/app/(dashboard)/articles/`
- [ ] `generateArticleStructuredData` في `lib/seo/index.ts` — ما البيانات اللي تحتاجها بالضبط؟ هل كلها متوفرة في `getArticleBySlugMinimal`؟
  - تحقق من: `article.faqs`, `article.author`, `article.client`, `article.featuredImage`, `article.category`
- [ ] إذا الـ DB cache موجود → نستخدمه (كما الآن). إذا فارغ → نولّد من الدالة. لا تعارض.
- [ ] الـ fallback يولّد flat `Article` object، والـ DB cache يولّد `@graph` — لازم نوحّد الشكل أو نتعامل مع الاثنين بشكل صحيح.
- [ ] إذا الـ fallback يشمل FAQPage (لما يكون `article.faqs.length > 0`) → هل البيانات موجودة في الـ query الحالي؟

**المصدر الرسمي:**
https://developers.google.com/search/docs/appearance/structured-data/article

---

## SEO-A3 — `og:site_name` = اسم العميل بدل "مودونتي"

**المشكلة:**
```ts
// page.tsx line 148
siteName: articleForGeneration.client.name,  // "Nova Electronics" مثلاً
```
`og:site_name` يجب أن يكون اسم المنصة (مودونتي)، وليس العميل.
اسم العميل موجود بشكل صحيح في publisher داخل JSON-LD — هذا كافٍ.

**الارتباطات اللي لازم نراجعها:**
- [ ] `modonty/lib/seo/index.ts` → `generateMetadataFromSEO()` — هل `siteName` يُستخدم في أماكن ثانية تتوقع اسم العميل؟ (مثلاً صفحة `/clients/[slug]`)
- [ ] صفحات العملاء `/clients/[slug]` — قد تمرر `siteName = client.name` بشكل صحيح هناك. لا تغيّر هذا السلوك.
- [ ] الـ title format الحالي: `"عنوان المقال - Nova Electronics"` — هل يتغير إذا غيّرنا siteName؟ نعم سيصبح `"عنوان المقال - مودونتي"`. هل هذا مطلوب؟ ← يحتاج قرار.
- [ ] `og:title` الحالي = `"عنوان المقال - Nova Electronics"` — هل نبقيه كذلك؟ أم `"عنوان المقال - مودونتي"`؟

**ملاحظة:**
هذا التاسك يحتاج قرار تصميمي قبل التنفيذ:
هل العلامة التجارية في OG = مودونتي؟ أم العميل الناشر؟

---

## SEO-A4 — صورة المقال في JSON-LD بدون width/height

**المشكلة:**
```ts
// lib/seo/index.ts line 215
image: article.featuredImage?.url || article.ogImage || undefined,
// جوجل يوصي بـ ImageObject مع width + height
```

**الارتباطات اللي لازم نراجعها:**
- [ ] `modonty/lib/seo/index.ts` → `generateArticleStructuredData()` — هل `article.featuredImage` يحتوي على `width` و `height` من الـ DB؟
  - راجع: `getArticleBySlugMinimal` query — هل يجلب هذه الحقول من Media؟
- [ ] `admin/lib/seo/structured-data.ts` — هل JSON-LD المحفوظ في DB يتضمن ImageObject صحيح؟
- [ ] الـ Media model في Prisma — هل يحتوي على `width` و `height` columns؟
  - راجع: `prisma/schema.prisma`

---

## ترتيب التنفيذ المقترح

```
SEO-A2 أولاً → نفهم متى يُولَّد JSON-LD في الأدمن
    ↓
SEO-A1 ثانياً → نضيف breadcrumb JSON-LD (بعد ما نعرف بنية @graph)
    ↓
SEO-A4 ثالثاً → نحسّن ImageObject (بعد ما نتحقق من Media fields)
    ↓
SEO-A3 أخيراً → قرار تصميمي على og:site_name
```

---

## ✅ مكتمل
_لا شيء بعد_
