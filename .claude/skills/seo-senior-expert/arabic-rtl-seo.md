# Arabic & RTL SEO

> خصوصيات الـ SEO للمحتوى العربي والـ RTL في Modonty.

---

## 🎯 الأساسيات على مستوى HTML

### `<html>` tags إلزامية

```tsx
// app/[locale]/layout.tsx
export default function LocaleLayout({ children, params: { locale } }) {
  return (
    <html
      lang={locale}                              // "ar" أو "en"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}     // اتجاه القراءة
      className={`${cairo.variable} ${inter.variable}`}
    >
      <body className={locale === 'ar' ? 'font-cairo' : 'font-inter'}>
        {children}
      </body>
    </html>
  );
}
```

**أخطاء يطلعها Lighthouse:**
- "Document doesn't have a `<html lang>` attribute" → الحل: `lang={locale}`
- "Document does not have a `dir` attribute" (warning في بعض الأدوات) → الحل: `dir="rtl"` للعربية

---

## 1️⃣ BCP 47 — Locale codes الصحيحة

### في الكود

| الاستخدام | القيمة الصحيحة | القيمة الخاطئة |
|----------|---------------|---------------|
| `<html lang>` | `ar` أو `ar-SA` | `arabic`, `AR`, `ar_SA` |
| `og:locale` | `ar_SA` (مع underscore) | `ar-SA`, `arabic` |
| `og:locale:alternate` | `en_US` | `en-US` |
| `hreflang` | `ar` أو `ar-SA` (مع dash) | `ar_SA`, `ARA` |
| JSON-LD `inLanguage` | `ar-SA` (BCP 47) | `ar_SA`, `arabic` |

> **انتبه:** `og:locale` يستخدم **underscore** (`ar_SA`), بينما `hreflang` و `lang` و `inLanguage` يستخدمون **dash** (`ar-SA`). هذه نقطة الخلط الأكثر شيوعاً.

### Locale codes للعالم العربي

| البلد | hreflang | og:locale |
|------|---------|-----------|
| السعودية | `ar-SA` | `ar_SA` |
| مصر | `ar-EG` | `ar_EG` |
| الإمارات | `ar-AE` | `ar_AE` |
| الكويت | `ar-KW` | `ar_KW` |
| عام (كل العرب) | `ar` | `ar_AR` (نادر، استخدم `ar_SA`) |

---

## 2️⃣ Open Graph لـ العربية

```html
<meta property="og:locale" content="ar_SA" />
<meta property="og:locale:alternate" content="en_US" />
<meta property="og:locale:alternate" content="ar_EG" />
```

في Next.js:

```typescript
openGraph: {
  locale: 'ar_SA',
  alternateLocale: ['en_US', 'ar_EG'],
  // ...
}
```

---

## 3️⃣ Typography — Fonts العربية

### Modonty تستخدم Cairo (موصى به للمحتوى العربي)

```typescript
// app/layout.tsx
import { Cairo, Inter } from 'next/font/google';

const cairo = Cairo({
  subsets: ['arabic'],         // ⚠️ critical — تنزل arabic glyphs فقط
  display: 'swap',             // يمنع invisible text أثناء التحميل
  preload: true,
  variable: '--font-cairo',
  weight: ['400', '500', '700'],
  adjustFontFallback: true,    // يقلل الـ CLS من font swap
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});
```

### Fonts عربية موصى بها

| الخط | الاستخدام |
|------|-----------|
| **Cairo** | UI + body — قابل للقراءة على شاشات صغيرة |
| **IBM Plex Sans Arabic** | بديل احترافي للشركات |
| **Noto Sans Arabic** | fallback آمن |
| **Tajawal** | عناوين |
| **Amiri** | محتوى تراثي/قرآني |

### الـ Fallback chain الصحيح

```css
font-family: var(--font-cairo), 'Segoe UI', Tahoma, Arial, sans-serif;
```

---

## 4️⃣ Unicode Normalization (مهم لـ search)

### المشكلة

النصوص العربية ممكن تحتوي على variants للحرف الواحد:

| الحرف | الـ codepoint الصحيح | الـ codepoint البديل (يسبب مشاكل) |
|------|--------------------|---------------------------------|
| ك | U+0643 (ك العربية) | U+06A9 (ک الفارسية) |
| ي | U+064A (ي العربية) | U+06CC (ی الفارسية) |
| ة | U+0629 (ة) | U+0647 (ه — خطأ شائع في مصر) |
| ﻻ | composition من ل + ا | U+FEFB (ligature واحد) |

### الإصلاح في الكود

```typescript
// app/lib/text/normalize-arabic.ts
const persianToArabicMap: Record<string, string> = {
  'ک': 'ك',  // U+06A9 → U+0643
  'ی': 'ي',  // U+06CC → U+064A
  'ۀ': 'ة',
  // ligatures
  '\uFEFB': 'لا',
  '\uFEF7': 'لأ',
  '\uFEF9': 'لإ',
  '\uFEF5': 'لآ',
};

export function normalizeArabic(text: string): string {
  // 1. Unicode NFC normalization
  let normalized = text.normalize('NFC');

  // 2. استبدال variants
  for (const [persian, arabic] of Object.entries(persianToArabicMap)) {
    normalized = normalized.replaceAll(persian, arabic);
  }

  // 3. إزالة tashkeel (اختياري — حسب الاستخدام)
  // normalized = normalized.replace(/[\u064B-\u0652]/g, '');

  return normalized;
}
```

استخدمها قبل التخزين:

```typescript
// قبل insert/update لأي حقل نصي
const cleanTitle = normalizeArabic(input.title);
const cleanBody = normalizeArabic(input.body);
```

---

## 5️⃣ Slug Generation للعربية

### المشكلة
URL يفضّل يكون **transliterated** (إنجليزي) أو **slug عربي URL-encoded**:

```
✅ /ar/blog/seo-strategy-2026
✅ /ar/blog/استراتيجية-السيو-2026  (URL-encoded في الـ navigation)
❌ /ar/blog/strategy%20with%20spaces
```

### الـ helper

```typescript
// app/lib/text/slugify.ts
import slugify from 'slugify';

export function slugifyArabic(text: string, options: {
  preserveArabic?: boolean;
} = {}): string {
  if (options.preserveArabic) {
    // slug عربي
    return text
      .normalize('NFC')
      .trim()
      .replace(/[\s\u00A0]+/g, '-')
      .replace(/[^\u0600-\u06FF\u0750-\u077Fa-zA-Z0-9-]/g, '')
      .toLowerCase();
  }

  // transliterate to English
  return slugify(text, {
    lower: true,
    strict: true,
    locale: 'ar',
  });
}
```

### التوصية لـ Modonty
ابدأ بـ **slugs إنجليزية transliterated**. هذي تضمن:
- لا encoding issues في الـ social shares
- أسهل للنسخ واللصق
- Google يفهم الـ keywords حتى لو slug إنجليزي (Title + content يحملان الإشارة العربية)

---

## 6️⃣ Meta description — قواعد إضافية للعربية

| القاعدة | السبب |
|---------|-------|
| العد بالأحرف، ليس الكلمات | الـ Google يقيس chars, ليس words |
| 50-160 حرف (متضمن المسافات والـ tashkeel) | نفس القاعدة العالمية |
| تجنّب الـ tashkeel في الـ meta | يضيع عدد الأحرف بدون فائدة بحثية |
| استخدم arabic punctuation: ، ؛ ؟ | لتجربة قراءة أصلية |
| اللهجة: استخدم الفصحى المعاصرة | Google يفهمها أفضل من اللهجات |

```typescript
function buildArabicMetaDescription(body: string): string {
  // إزالة tashkeel
  let stripped = body.replace(/[\u064B-\u0652\u0670\u0640]/g, '');

  // أول 160 حرف من أول فقرة
  const firstParagraph = stripped.split('\n').find(l => l.trim().length > 50);
  if (!firstParagraph) return stripped.substring(0, 160);

  return firstParagraph.substring(0, 160).trim();
}
```

---

## 7️⃣ Headings — الترتيب الصحيح للـ RTL

CSS و HTML نفسهم — لا فرق في الـ semantic structure:

```tsx
<article dir="rtl">
  <h1>عنوان المقالة الرئيسي</h1>     {/* مرة واحدة فقط */}
  <p>المقدمة...</p>

  <h2>القسم الأول</h2>
  <p>...</p>

  <h3>نقطة فرعية</h3>
  <p>...</p>

  <h2>القسم الثاني</h2>       {/* لا تقفز من h2 لـ h4 */}
  <p>...</p>
</article>
```

---

## 8️⃣ JSON-LD — `inLanguage` للعربية

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "عنوان المقالة",
  "inLanguage": "ar-SA",            // ← BCP 47 مع dash
  "author": {
    "@type": "Person",
    "name": "خالد علي",              // ← اسم عربي طبيعي
    "url": "https://modonty.com/ar/authors/khalid"
  },
  ...
}
```

> ⚠️ **لا تستخدم** `"inLanguage": "arabic"` أو `"ar_SA"`. لازم `ar` أو `ar-SA`.

---

## 9️⃣ Bidi text — الـ mixed Arabic + English

عندما يحتوي النص العربي على كلمات إنجليزية أو أرقام، استخدم Unicode bidi marks لو الـ layout انكسر:

```tsx
// إذا في كلمة إنجليزية في وسط نص عربي تخرّب الترتيب
const text = `مدونة \u202BModonty\u202C للسيو العربي`;
//                  LRE  ...   PDF
```

غالباً Next.js + React + HTML5 يتعاملون مع bidi تلقائياً، لكن لو في مشكلة استخدم:
- `\u202A` — Left-to-Right Embedding (LRE)
- `\u202C` — Pop Directional Formatting (PDF)
- `\u200E` — Left-to-Right Mark (LRM, للأرقام)
- `\u200F` — Right-to-Left Mark (RLM)

---

## 🔟 RTL CSS — قواعد عامة

### استخدم logical properties (موصى به في 2026)

```css
/* ❌ قديم — يكسر RTL */
.card { margin-left: 16px; padding-right: 24px; }

/* ✅ حديث — يشتغل auto لـ RTL */
.card { margin-inline-start: 16px; padding-inline-end: 24px; }
```

في Tailwind:

```tsx
{/* ❌ */}
<div className="ml-4 pr-6">...</div>

{/* ✅ */}
<div className="ms-4 pe-6">...</div>
```

Tailwind v3.3+ يدعم `ms-*`, `me-*`, `ps-*`, `pe-*` (logical properties).

---

## 1️⃣1️⃣ الكلمات الشائعة في الاستهداف العربي

عند بناء meta title و description:

| اللهجة | عربي يفهم في كل الدول العربية |
|------|----------|
| ✅ "الجوّال" / "الهاتف المحمول" | يفهمها الكل |
| ⚠️ "الموبايل" | OK لكن لهجة |
| ⚠️ "التليفون" | مصر فقط |
| ❌ "الهاتف الذكي" | فصحى ثقيلة |

> **قاعدة:** استخدم الفصحى المعاصرة في الـ titles و descriptions. اللهجة OK داخل المحتوى لكن مش في الميتاداتا.

---

## 1️⃣2️⃣ Search intent للجمهور العربي

### كلمات شائعة في الـ search queries السعودية/المصرية

| الكلمة | كيف تستخدمها |
|--------|-------------|
| "كيف" | كلمة افتتاحية للـ how-to content |
| "أفضل" | للـ listicles |
| "شرح" | للـ tutorials |
| "بالعربي" | للمحتوى المترجم |
| "مجاناً" / "مجاني" | للأدوات والموارد |
| "للمبتدئين" | لمحتوى تعليمي |
| "2026" | للمحتوى الـ timely |

---

## 1️⃣3️⃣ صفحات الـ AI Search (SearchGPT, Perplexity, Claude)

أدوات الـ AI Search لها متطلبات مختلفة شوي:

- **last-modified header**: مهم — AI tools تستخدمه لتقييم freshness
- **semantic HTML**: `<article>`, `<header>`, `<time>` بدلاً من `<div>` كل مكان
- **structured data**: ضرورية أكثر مما هي لـ Google التقليدي
- **clear authoritative content**: AI prefers خبرة موثقة + sources

في الـ headers config:

```typescript
// next.config.ts
headers: [
  {
    source: '/:locale/blog/:slug*',
    headers: [
      {
        key: 'Last-Modified',
        value: 'dynamic',  // — نعالجها في الـ route handler
      },
    ],
  },
],
```

---

## 1️⃣4️⃣ Checklist للمقالة العربية

```
☐ <html lang="ar" dir="rtl">
☐ <body> مستخدم font عربي مع subsets: ['arabic']
☐ النص الأصلي مر بـ normalizeArabic()
☐ meta title و description بالفصحى (لا لهجة)
☐ JSON-LD: inLanguage = "ar-SA"
☐ og:locale = "ar_SA" (مع underscore)
☐ hreflang: "ar" أو "ar-SA" (مع dash)
☐ author.name بالعربي + author.url لصفحة المؤلف العربية
☐ CSS يستخدم logical properties (ms-*, me-*)
☐ slug إنجليزي transliterated (موصى به)
☐ Headings بترتيب: h1 واحد → h2 → h3 (لا قفزات)
☐ النص عريض على شاشة الموبايل (≥ 16px للجسم، ≥ 24px للـ h1)
```

---

## 📚 المصادر الرسمية

- [Google — International SEO](https://developers.google.com/search/docs/specialty/international)
- [W3C — Internationalization](https://www.w3.org/International/)
- [W3C — Bidirectional algorithm](https://www.w3.org/International/articles/inline-bidi-markup/)
- [BCP 47 — Tags for Identifying Languages](https://tools.ietf.org/html/bcp47)
- [Tailwind CSS — Logical properties](https://tailwindcss.com/docs/margin#using-logical-properties)
