# تقرير: مشكلة فهرسة Google لصفحات المقالات — modonty.com

## ملخص المشكلة

صفحة `https://www.modonty.com/articles/ما-هو-السيو` تعطي الزوار استجابة 200 وتعمل في المتصفح بشكل طبيعي، لكن Google Search Console تُظهر **"Indexing request rejected"** مع **"Page fetch: Failed: Not found (404)"** عند محاولة الفهرسة.

---

## نتائج الفحص التقني

### 1. الـ robots.txt — لا توجد مشكلة ✅
```
User-Agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /admin/
```
Googlebot مسموح له بالوصول لمسار `/articles/`.

### 2. الـ Sitemap — موجودة لكن فيها ملاحظة ⚠️
الـ sitemap تحتوي على المقال بالحروف العربية غير المشفّرة:
```xml
<url>
  <loc>https://www.modonty.com/articles/ما-هو-السيو</loc>
  <lastmod>2026-05-21T12:13:55.956Z</lastmod>
</url>
```
المعيار الصحيح يتطلب URL مشفّر (percent-encoded):
```xml
<loc>https://www.modonty.com/articles/%D9%85%D8%A7-%D9%87%D9%88-%D8%A7%D9%84%D8%B3%D9%8A%D9%88</loc>
```

### 3. الـ Canonical Tag — صحيح ✅
```html
<link rel="canonical" href="https://www.modonty.com/articles/%D9%85%D8%A7-%D9%87%D9%88-%D8%A7%D9%84%D8%B3%D9%8A%D9%88"/>
```

### 4. الـ Meta Robots — صحيح ✅
```html
<meta name="robots" content="index, follow"/>
<meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1"/>
```

---

## 🔴 المشكلة الأولى والأخطر: JSON-LD Schema يحتوي على URL مختلف تماماً

### ما وجدناه في الـ HTML الفعلي:

**الـ Canonical URL الصحيح:**
```
https://www.modonty.com/articles/%D9%85%D8%A7-%D9%87%D9%88-%D8%A7%D9%84%D8%B3%D9%8A%D9%88
```
أي: `https://www.modonty.com/articles/ما-هو-السيو`

**الـ JSON-LD `@id` الموجود في الصفحة (خطأ):**
```
https://modonty.com/articles/%D9%85%D8%A7-%D9%87%D9%88-%D8%A7%D9%84%D8%B3%D9%8A%D9%88-%D9%81%D9%8A-2026-%D9%83%D9%8A%D9%81-%D8%AA%D8%B6%D8%A7%D8%B9%D9%81-%D9%85%D8%A8%D9%8A%D8%B9%D8%A7%D8%AA%D9%83-%D9%88%D8%AA%D8%B3%D9%8A%D8%B7%D8%B1-%D8%B9%D9%84%D9%89-%D9%82%D9%85%D8%A9-%D8%AC%D9%88%D8%AC%D9%84
```
أي: `https://modonty.com/articles/ما-هو-السيو-في-2026-كيف-تضاعف-مبيعاتك-وتسيطر-على-قمة-جوجل`

### الفرق بين الاثنين:
| العنصر | الـ Canonical (صحيح) | الـ JSON-LD (خطأ) |
|---|---|---|
| الدومين | `www.modonty.com` | `modonty.com` (بدون www) |
| الـ slug | `ما-هو-السيو` | `ما-هو-السيو-في-2026-كيف-تضاعف-مبيعاتك-وتسيطر-على-قمة-جوجل` |

### سبب هذا الخطأ المحتمل في الكود:
على الأرجح الكود يبني الـ JSON-LD `@id` من حقل مختلف عن حقل الـ slug — ربما من `title` أو `seoTitle` أو حقل `fullUrl` قديم في قاعدة البيانات، بدلاً من استخدام `slug` الفعلي للمقال.

### أين تبحث في الكود:
ابحث عن الملف المسؤول عن توليد الـ structured data / JSON-LD لصفحات المقالات. غالباً يكون في:
```
app/articles/[slug]/page.tsx        ← Next.js App Router
pages/articles/[slug].tsx           ← Next.js Pages Router
lib/seo.ts أو lib/schema.ts         ← helper functions
components/ArticleJsonLd.tsx        ← مكوّن مخصص
```

ابحث عن الكلمات المفتاحية:
```
application/ld+json
@context
WebPage
Article
@id
```

الـ `@id` لازم يكون مطابق تماماً للـ canonical URL. الكود الصحيح يكون هكذا:
```typescript
// خطأ — يستخدم حقل غير صحيح
"@id": `https://modonty.com/articles/${article.fullTitle}`

// صحيح — يستخدم الـ slug الفعلي مع www
"@id": `https://www.modonty.com/articles/${article.slug}`
```

---

## 🟡 المشكلة الثانية: Vercel ISR Cache متوقف عن التجديد

### ما وجدناه في الـ Response Headers:
```
x-vercel-cache: STALE
age: 3117
x-nextjs-stale-time: 300
cache-control: public, max-age=0, must-revalidate
x-nextjs-prerender: 1
```

### التحليل:
- `x-nextjs-stale-time: 300` = الكاش المفروض يتجدد كل 5 دقائق
- `age: 3117` = الكاش عمره ~52 دقيقة وقت الفحص
- `x-vercel-cache: STALE` = Vercel يخدم نسخة قديمة ولم يتجدد الكاش رغم مرور وقت أطول من المحدد

هذا يعني الـ ISR revalidation يفشل في الخلفية — ربما بسبب:
- timeout في الـ fetch من قاعدة البيانات
- خطأ في `generateStaticParams` أو `getStaticPaths`
- مشكلة في الـ `revalidate` config

### أين تبحث في الكود:
```typescript
// في app/articles/[slug]/page.tsx
export const revalidate = 300; // ← هذا الرقم

// أو في fetch calls
const data = await fetch(url, { next: { revalidate: 300 } });
```

**التوصية:** زيادة قيمة الـ `revalidate` إلى `3600` (ساعة) أو `86400` (يوم) إذا المحتوى لا يتغير بشكل متكرر، ومراجعة أي `try/catch` حول الـ fetch من DB قد يُخفي أخطاء.

---

## 🟡 المشكلة الثالثة: عدم تطابق الدومين في JSON-LD BreadcrumbList

وجدنا في الـ BreadcrumbList داخل JSON-LD:
```json
{
  "@type": "ListItem",
  "position": 4,
  "name": "ما هو السيو",
  "item": "https://www.modonty.com/articles/ما-هو-السيو"
}
```
هنا الـ slug صحيح لكن الـ URL غير مشفّر (Arabic raw). يفضل تشفيره.

---

## ترتيب الأولويات للإصلاح

| الأولوية | المشكلة | الأثر |
|---|---|---|
| 🔴 عاجل | JSON-LD `@id` يشير لـ URL مختلف | سبب مباشر لرفض الفهرسة |
| 🟡 مهم | ISR revalidate متوقف | صفحات قد تظهر بمحتوى قديم |
| 🟡 مهم | Sitemap URLs بحروف عربية غير مشفّرة | قد يُسبب confusion لبعض crawlers |
| 🟢 تحسين | توحيد www في كل URLs داخل الكود | consistency وتجنب duplicate content |

---

## خطوات التحقق بعد الإصلاح

1. بعد نشر الإصلاح، افتح الصفحة وتحقق من الـ JSON-LD:
```
عبر DevTools → Elements → ابحث عن application/ld+json
```

2. تحقق من الـ canonical و `@id` متطابقان.

3. ارجع لـ Google Search Console → URL Inspection → Request Indexing.

4. انتظر 24-48 ساعة للفهرسة.

---

*تم إعداد هذا التقرير بتاريخ 21 مايو 2026 بعد فحص مباشر للصفحة وتحليل HTTP headers، sitemap، robots.txt، وHTML source.*
