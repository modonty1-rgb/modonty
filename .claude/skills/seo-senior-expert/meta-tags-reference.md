# Meta Tags Reference (Basic + Open Graph + Twitter Card)

> كل ميتا تاج Modonty تستخدمه، مع القاعدة + المصدر الرسمي + الكود في Next.js.

---

## 🧱 المبدأ

كل ميتا تاج في Modonty:
1. قيمته **محسوبة ومحفوظة** في `articleSEO`
2. تُمرَّر لـ `generateMetadata` في Next.js (Metadata API)
3. لا يُحسب أي شيء وقت الطلب

---

## 1️⃣ الـ Basic Meta Tags

### `<title>` — التايتل
- **الموقع:** `<head>`, **واحد فقط** لكل صفحة
- **القاعدة:** فريد لكل صفحة، يحتوي الـ keyword الرئيسي، **≤ 60 حرف** (بعدها Google يقطعه)
- **مرجع:** Google Search Central — Title links
- **أخطاء يطلعها Semrush:** "Pages don't have title tags", "Issues with duplicate title tags", "Title is too long" (>60), "Title is too short" (<10)
- **Next.js:** `metadata.title`
```typescript
title: seo.metaTitle  // من الـ DB، محسوب مسبقاً
```

### `<meta name="description">`
- **القاعدة:** فريد لكل صفحة، **50–160 حرف**
- **مرجع:** Google Search Central — Snippet
- **أخطاء:** Semrush "Pages don't have meta descriptions", "Duplicate meta descriptions", Lighthouse "Document does not have a meta description"
- **Next.js:** `metadata.description`

### `<meta name="viewport">`
- **القاعدة الإلزامية:** `width=device-width, initial-scale=1.0`
- **مرجع:** Web.dev / Google Mobile-Friendly
- **أخطاء:** Semrush Error "Pages with no viewport tag", Lighthouse "Does not have a `<meta name="viewport">` tag"
- **Next.js:** يتولاها Next افتراضياً عبر `viewport` export
```typescript
// app/layout.tsx
import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};
```

### `<meta charset="utf-8">`
- **القاعدة:** أول tag بعد `<head>`. Next.js يحطها افتراضياً. لا تتدخل.

### `<meta name="robots">`
- **القاعدة:** يحدد سلوك crawlers
- **قيم شائعة:**
  - `index,follow` (افتراضي للمنشور)
  - `noindex,nofollow` (للمسودات أو الصفحات الإدارية)
  - `noarchive` (يمنع cached version)
  - `nosnippet` (يمنع snippets)
  - `max-image-preview:large` (يسمح بـ rich preview)
- **مرجع:** [Google Robots meta tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
- **Next.js:** `metadata.robots`
```typescript
robots: {
  index: seo.robots.includes('index'),
  follow: seo.robots.includes('follow'),
  googleBot: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
}
```

### `<meta name="author">`
- **القاعدة:** اسم المؤلف. Google يفضّل JSON-LD author بدلاً منه، لكن لا يضر.
- **Next.js:** `metadata.authors`

### `<link rel="canonical">`
- **القاعدة:** URL **مطلق** (https), يشير إلى النسخة الأصلية (نفس الصفحة عادةً = self-referencing)
- **مرجع:** [Google Canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- **أخطاء حمراء:**
  - canonical نسبي (`/blog/x`) — Semrush Error
  - canonical يشير لصفحة 404 — Semrush Error "Pages with a broken canonical link"
  - أكثر من `<link rel="canonical">` في نفس الصفحة — Semrush Error "Multiple canonical URLs"
- **Next.js:**
```typescript
alternates: {
  canonical: seo.canonical,  // https://modonty.com/ar/blog/slug
}
```

### `<html lang="..." dir="...">`
- **القاعدة:**
  - `lang="ar"` للنسخة العربية، `lang="en"` للإنجليزية
  - `dir="rtl"` للعربية، `dir="ltr"` للإنجليزية
- **أخطاء:** Lighthouse "Document doesn't have a `<html lang>` attribute"
- **Next.js:**
```typescript
// app/[locale]/layout.tsx
export default function LocaleLayout({ children, params: { locale } }) {
  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body>{children}</body>
    </html>
  );
}
```

---

## 2️⃣ Open Graph Tags

أساس: [The Open Graph Protocol](https://ogp.me/) | يستخدمه Facebook, LinkedIn, WhatsApp, Telegram, Slack.

### Required (4 tags)

| Tag | القيمة | ملاحظات |
|-----|--------|---------|
| `og:title` | عنوان الصفحة | مثل metaTitle لكن مرن (يقدر يكون أطول) |
| `og:type` | `article` للمقالات، `website` للصفحات الأخرى | |
| `og:image` | صورة CDN | شروط أدناه ⬇️ |
| `og:url` | URL **مطلق** | = canonical |

### Recommended

| Tag | القيمة |
|-----|--------|
| `og:description` | وصف الصفحة |
| `og:site_name` | `Modonty` |
| `og:locale` | `ar_SA` (ليس `ar` فقط) أو `en_US` |
| `og:locale:alternate` | متعدد، للنسخ الأخرى |

### `og:image` — قواعد إلزامية

| المعيار | القيمة المطلوبة | المصدر |
|---------|------------------|---------|
| الأبعاد المثالية | **1200 × 630** بكسل | Facebook docs |
| الأبعاد الأدنى | 1200 × 630 (لـ large card) | Facebook |
| الأبعاد المطلق الأدنى | 200 × 200 | Facebook |
| النسبة | 1.91 : 1 | Facebook |
| حجم الملف | < 5 MB (مفضل < 1 MB) | Facebook |
| الصيغة | JPG / PNG / **WebP** | Facebook |
| **ممنوع** | SVG (Facebook + LinkedIn يرفضوها) | |

**جزماً لازم نخزن:** `og:image:width`, `og:image:height`, `og:image:alt`. هذي تسرّع الـ render وتساعد الـ accessibility.

### Article-specific OG tags

للمقالات نضيف:
- `article:published_time` (ISO 8601)
- `article:modified_time` (ISO 8601)
- `article:section` (= category name)
- `article:tag` (متعدد، tag per `<meta>`)
- `article:author` (URL لصفحة المؤلف)

### مثال HTML (للمرجع)

```html
<!-- Required -->
<meta property="og:type" content="article" />
<meta property="og:title" content="عنوان المقالة" />
<meta property="og:description" content="وصف المقالة" />
<meta property="og:image" content="https://cdn.modonty.com/articles/abc-1200x630.webp" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="نص بديل وصفي للصورة" />
<meta property="og:url" content="https://modonty.com/ar/blog/slug" />

<!-- Recommended -->
<meta property="og:site_name" content="Modonty" />
<meta property="og:locale" content="ar_SA" />
<meta property="og:locale:alternate" content="en_US" />

<!-- Article -->
<meta property="article:published_time" content="2026-05-22T10:00:00+03:00" />
<meta property="article:modified_time" content="2026-05-22T14:30:00+03:00" />
<meta property="article:section" content="التسويق الرقمي" />
<meta property="article:tag" content="SEO" />
<meta property="article:tag" content="محتوى عربي" />
<meta property="article:author" content="https://modonty.com/ar/authors/khalid" />
```

### Next.js Metadata mapping

```typescript
openGraph: {
  type: 'article',
  title: seo.ogTitle,
  description: seo.ogDescription,
  url: seo.ogUrl,
  siteName: seo.ogSiteName,
  locale: seo.ogLocale,
  images: [{
    url: seo.ogImage,
    width: 1200,
    height: 630,
    alt: seo.ogImageAlt,
    type: 'image/webp',  // إذا كانت webp
  }],
  publishedTime: seo.articlePublishedTime.toISOString(),
  modifiedTime: seo.articleModifiedTime.toISOString(),
  section: seo.articleSection,
  tags: seo.articleTags,
  authors: [seo.articleAuthor],
}
```

---

## 3️⃣ Twitter Card Tags

أساس: [Twitter Cards docs](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards) (الآن X)

### Required (3 tags)

| Tag | القيمة |
|-----|--------|
| `twitter:card` | `summary_large_image` للمقالات (مفضّل) |
| `twitter:title` | عنوان الصفحة |
| `twitter:description` | وصف الصفحة |

### Recommended

| Tag | القيمة |
|-----|--------|
| `twitter:image` | صورة (تأخذ نفس og:image تقريباً) |
| `twitter:image:alt` | نص بديل للصورة |
| `twitter:site` | `@modonty` (Twitter handle للموقع) |
| `twitter:creator` | `@author_handle` (Twitter handle للمؤلف) |

### قواعد الصورة لـ Twitter Card

| النوع | الأبعاد | النسبة |
|------|---------|--------|
| `summary` (صغيرة) | 144 × 144 minimum, 4096 × 4096 max | 1:1 |
| `summary_large_image` (المختار لـ Modonty) | 300 × 157 minimum, 4096 × 4096 max | 2:1 |
| حد أقصى لحجم الملف | 5 MB | JPG/PNG/WebP/GIF |

**ملاحظة:** Modonty تستخدم صورة 1200×630 (1.91:1) — هذي تشتغل لـ Twitter `summary_large_image` رغم إنها مش 2:1 بالظبط. Twitter يـ crop ذاتياً للوسط.

### Next.js Metadata mapping

```typescript
twitter: {
  card: 'summary_large_image',
  title: seo.twitterTitle,
  description: seo.twitterDescription,
  images: [{
    url: seo.twitterImage,
    alt: seo.twitterImageAlt,
  }],
  site: seo.twitterSite,        // @modonty
  creator: seo.twitterCreator,  // @author
}
```

---

## 4️⃣ Tags خاصة بمحركات بحث أخرى

### `<meta name="format-detection">`
- `content="telephone=no, email=no, address=no"` — يمنع iOS من تحويل النصوص تلقائياً للـ links
- موصى به للنصوص العربية اللي ممكن iOS يخمن إنها أرقام تليفونات

### `<meta name="theme-color">`
- اللون اللي يظهر في الـ browser chrome على الموبايل
- مفيد للـ branding
```typescript
// viewport export
themeColor: '#0f172a',  // brand color
```

---

## 5️⃣ Tags ممنوعة / Deprecated

| Tag | السبب |
|-----|-------|
| `<meta name="keywords">` | Google ما يستخدمها منذ 2009. عبء بلا فائدة. **لا تكتبها.** |
| `<meta http-equiv="refresh">` | Semrush Error. استخدم 301 redirect بدلها. |
| `og:type=blog` | غير قياسي. استخدم `article`. |
| `twitter:card=photo` / `gallery` | deprecated منذ 2015. |

---

## 6️⃣ Validation محلي

```bash
# تحقق من كل الميتا تاجز في صفحة محددة
curl -s https://localhost:3000/ar/blog/test-article | \
  grep -oE '<meta[^>]+>' | \
  sort | uniq

# تحقق من الترتيب الصحيح (charset أولاً، title واحد، canonical واحد)
curl -s https://localhost:3000/ar/blog/test-article | \
  grep -oE '<(meta|title|link)[^>]+>' | head -30
```

**خدمات فحص خارجية (للـ smoke test قبل النشر):**
- Facebook Sharing Debugger — https://developers.facebook.com/tools/debug/
- Twitter Card Validator — https://cards-dev.twitter.com/validator (deprecated, use opengraph.xyz)
- LinkedIn Post Inspector — https://www.linkedin.com/post-inspector/
- OpenGraph.xyz (يفحص الكل) — https://www.opengraph.xyz/

---

## 📚 المصادر الرسمية

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Facebook — Sharing best practices](https://developers.facebook.com/docs/sharing/best-practices)
- [Google Search Central — Meta tags Google supports](https://developers.google.com/search/docs/crawling-indexing/special-tags)
- [Next.js — Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Semrush — Site Audit issues list](https://www.semrush.com/kb/542-site-audit-issues-list)
