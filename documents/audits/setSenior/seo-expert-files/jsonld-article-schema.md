# JSON-LD — Article, BlogPosting, BreadcrumbList, Organization

> كل ما يخص الـ Structured Data في Modonty: التعريفات، الخصائص الإلزامية، الـ builders type-safe.

---

## 🎯 المبدأ

JSON-LD في Modonty:
1. يتولّد عبر **builder type-safe** (مش string نسخ-لصق)
2. ينتج كائن JS object
3. يُخزن في `articleSEO.jsonLdArticle` كـ `Json` field
4. عند الـ render نلفّه في `<script type="application/ld+json">` بدون ما نحسب أي شيء

---

## 1️⃣ Article / BlogPosting

### المصدر الرسمي
- [Google Search Central — Article](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Schema.org — BlogPosting](https://schema.org/BlogPosting)

### `@type` المسموحة
Google يقبل واحد من ثلاثة:
- `Article` — عام
- `BlogPosting` — مقالات مدونة (الأنسب لـ Modonty) ✅
- `NewsArticle` — أخبار

> **Modonty: استخدم `BlogPosting` دائماً للمقالات.**

### الخصائص — Recommended (Google لا يفرض required لكن هذي ضرورية للـ rich results)

| الخاصية | النوع | القاعدة | مصدر |
|---------|------|---------|------|
| `headline` | Text | **≤ 110 حرف** ضروري | Google |
| `image` | URL or ImageObject أو Array | **مثالياً 3 صور**: 1×1, 4×3, 16×9 | Google |
| `datePublished` | Date | ISO 8601 + timezone | Google |
| `dateModified` | Date | ISO 8601 + timezone | Google |
| `author` | Person or Organization | name + url **معاً** | Google |
| `publisher` | Organization | name + logo (ImageObject with url) | Google |

### الخصائص — Highly Recommended (للـ rich result الكامل)

| الخاصية | الوصف |
|---------|--------|
| `description` | متطابق مع meta description |
| `mainEntityOfPage` | `{ '@type': 'WebPage', '@id': canonical }` |
| `articleSection` | اسم التصنيف |
| `articleBody` | المحتوى الكامل (اختياري — حذر من زيادة حجم الـ HTML) |
| `keywords` | array of tags |
| `inLanguage` | BCP 47 (مثل `ar-SA`, `en-US`) |
| `wordCount` | عدد كلمات المقالة |
| `url` | URL المقالة (= canonical) |
| `isAccessibleForFree` | `true` (لـ Modonty المحتوى مجاني) |

### الـ Builder

```typescript
// app/lib/seo/jsonld/article.ts
import type { WithContext, BlogPosting } from 'schema-dts';
// npm install schema-dts  ← types-only، ما تضيف runtime

type ImageVariant = string;  // CDN URL

interface BuildArticleInput {
  headline: string;
  description: string;
  image: [ImageVariant, ImageVariant, ImageVariant];  // 1x1, 4x3, 16x9
  datePublished: string;  // ISO 8601
  dateModified: string;   // ISO 8601
  author: {
    '@type': 'Person';
    name: string;
    url: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  mainEntityOfPage: { '@type': 'WebPage'; '@id': string };
  articleSection: string;
  keywords: string[];
  inLanguage: 'ar-SA' | 'en-US';
  wordCount?: number;
  url: string;
}

export function buildArticleJsonLd(
  input: BuildArticleInput
): WithContext<BlogPosting> {
  // assertions ضرورية
  if (input.headline.length > 110) {
    throw new Error(`headline exceeds 110 chars: ${input.headline.length}`);
  }
  if (input.image.length !== 3) {
    throw new Error(`image must contain exactly 3 variants (1x1, 4x3, 16x9)`);
  }
  if (!isValidIso8601WithTimezone(input.datePublished)) {
    throw new Error(`datePublished must be ISO 8601 WITH timezone`);
  }
  if (!isValidIso8601WithTimezone(input.dateModified)) {
    throw new Error(`dateModified must be ISO 8601 WITH timezone`);
  }
  if (!input.publisher.logo.url.startsWith('https://')) {
    throw new Error(`publisher.logo.url must be absolute https`);
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.headline,
    description: input.description,
    image: input.image,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    author: input.author,
    publisher: input.publisher,
    mainEntityOfPage: input.mainEntityOfPage,
    articleSection: input.articleSection,
    keywords: input.keywords.join(', '),
    inLanguage: input.inLanguage,
    ...(input.wordCount !== undefined && { wordCount: input.wordCount }),
    url: input.url,
    isAccessibleForFree: true,
  };
}

function isValidIso8601WithTimezone(value: string): boolean {
  // ISO 8601 must end with Z OR ±HH:MM
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(value);
}
```

### مثال للناتج

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "كيف تبني استراتيجية SEO عربية ناجحة في 2026",
  "description": "دليل شامل لبناء استراتيجية SEO عربية...",
  "image": [
    "https://cdn.modonty.com/articles/seo-ar-1x1.webp",
    "https://cdn.modonty.com/articles/seo-ar-4x3.webp",
    "https://cdn.modonty.com/articles/seo-ar-16x9.webp"
  ],
  "datePublished": "2026-05-22T10:00:00+03:00",
  "dateModified": "2026-05-22T14:30:00+03:00",
  "author": {
    "@type": "Person",
    "name": "خالد علي",
    "url": "https://modonty.com/ar/authors/khalid"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Modonty",
    "logo": {
      "@type": "ImageObject",
      "url": "https://cdn.modonty.com/logo-600x60.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://modonty.com/ar/blog/seo-ar-strategy-2026"
  },
  "articleSection": "التسويق الرقمي",
  "keywords": "SEO, محتوى عربي, تسويق رقمي",
  "inLanguage": "ar-SA",
  "wordCount": 1850,
  "url": "https://modonty.com/ar/blog/seo-ar-strategy-2026",
  "isAccessibleForFree": true
}
```

### قواعد الـ `publisher.logo`

من توثيق Google:
- يجب أن يكون **ImageObject** بـ `@type` و `url`
- الـ logo: **عرض ≤ 600px, ارتفاع ≤ 60px** (نسبياً مستطيل أفقي)
- صيغة PNG أو JPG (مفضّل PNG شفاف)

```json
"logo": {
  "@type": "ImageObject",
  "url": "https://cdn.modonty.com/logo-600x60.png",
  "width": 600,
  "height": 60
}
```

### الأخطاء الشائعة (يطلعها Ahrefs Structured Data + Rich Results Test)

| الخطأ | الإصلاح |
|------|---------|
| JSON parsing error | تأكد إن الـ JSON صحيح (محسوب من builder، ليس string) |
| Missing @type property | كل object داخل JSON-LD لازم له `@type` |
| Invalid schema type | استخدم Schema.org types الموثقة فقط |
| Invalid date format | ISO 8601 مع timezone (`+03:00` أو `Z`) |
| author missing url | أضف URL لصفحة المؤلف |
| publisher.logo not ImageObject | `@type: "ImageObject"` ضرورية |
| headline > 110 chars | اقطعها قبل ما تخزّن |

---

## 2️⃣ BreadcrumbList

### المصدر
- [Google — Breadcrumb structured data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [Schema.org — BreadcrumbList](https://schema.org/BreadcrumbList)

### الخصائص

| Property | Type | Required |
|----------|------|----------|
| `itemListElement` | Array of ListItem | ✅ |

كل ListItem:
- `@type`: `"ListItem"`
- `position`: integer **يبدأ من 1**
- `name`: اسم العقدة (مثلاً "الصفحة الرئيسية", "التسويق الرقمي")
- `item`: URL مطلق (للعقدة الأخيرة اختياري — Google يقبل بدون `item` للأخيرة)

### الـ Builder

```typescript
// app/lib/seo/jsonld/breadcrumb.ts
import type { WithContext, BreadcrumbList } from 'schema-dts';

interface BreadcrumbNode {
  name: string;
  url: string;
}

export function buildBreadcrumbJsonLd(
  nodes: BreadcrumbNode[]
): WithContext<BreadcrumbList> {
  if (nodes.length < 2) {
    throw new Error('Breadcrumb must have at least 2 nodes');
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: nodes.map((node, index) => ({
      '@type': 'ListItem',
      position: index + 1,  // ⚠️ يبدأ من 1، ليس 0
      name: node.name,
      item: node.url,
    })),
  };
}
```

### مثال للناتج

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "الصفحة الرئيسية",
      "item": "https://modonty.com/ar"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "التسويق الرقمي",
      "item": "https://modonty.com/ar/category/digital-marketing"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "كيف تبني استراتيجية SEO عربية ناجحة",
      "item": "https://modonty.com/ar/blog/seo-ar-strategy-2026"
    }
  ]
}
```

### قواعد إلزامية

- `position` متسلسلة بدون قفزات: 1, 2, 3, ...
- كل `item` URL **مطلق**
- لا تكرر الـ home page في breadcrumb مرتين

---

## 3️⃣ Organization (للـ Publisher)

### المصدر
- [Google — Organization](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Schema.org — Organization](https://schema.org/Organization)

### Modonty نضعها في `app/layout.tsx` (مرة واحدة فقط)

```typescript
// app/lib/seo/jsonld/organization.ts
export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Modonty',
    alternateName: 'مدونتي',
    url: 'https://modonty.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://cdn.modonty.com/logo-600x60.png',
      width: 600,
      height: 60,
    },
    sameAs: [
      'https://twitter.com/modonty',
      'https://www.linkedin.com/company/modonty',
      'https://www.facebook.com/modonty',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@modonty.com',
      availableLanguage: ['Arabic', 'English'],
    },
  };
}
```

تُضاف في `<head>` للـ root layout فقط:

```tsx
// app/layout.tsx
import { JsonLd } from '@/components/seo/JsonLd';
import { buildOrganizationJsonLd } from '@/lib/seo/jsonld/organization';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <JsonLd data={buildOrganizationJsonLd()} />
        {children}
      </body>
    </html>
  );
}
```

---

## 4️⃣ WebSite (مع SearchAction)

اختياري لكن قوي — يفعّل sitelinks searchbox في نتائج Google.

```typescript
export function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Modonty',
    url: 'https://modonty.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://modonty.com/ar/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
```

---

## 5️⃣ FAQ Page (للمقالات اللي فيها قسم أسئلة شائعة)

> ⚠️ **حذر:** Google قلّص ظهور FAQ rich results في 2023، الآن يظهر بشكل محدود للمواقع الحكومية والصحية. لكن schema لا يضر.

```typescript
interface FaqItem {
  question: string;
  answer: string;  // HTML مسموح
}

export function buildFaqJsonLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
```

**شرط Google:** الأسئلة والأجوبة لازم تكون **ظاهرة فعلياً** في الصفحة. لا تستخدم FAQ schema لأسئلة مخفية.

---

## 6️⃣ Rendering Pattern

كومبوننت موحد للـ JSON-LD:

```tsx
// components/seo/JsonLd.tsx
interface JsonLdProps {
  data: object;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // dangerouslySetInnerHTML أفضل من children لأنه لا يـ escape
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 0)
      }}
    />
  );
}
```

في صفحة المقالة:

```tsx
// app/[locale]/blog/[slug]/page.tsx
export default async function ArticlePage({ params }) {
  const article = await getArticleWithSEO(params.locale, params.slug);
  if (!article?.seo) notFound();

  return (
    <>
      <JsonLd data={article.seo.jsonLdArticle} />
      <JsonLd data={article.seo.jsonLdBreadcrumb} />
      <article>...</article>
    </>
  );
}
```

---

## 7️⃣ Validation

### قبل الـ commit (محلياً)

```bash
# extract JSON-LD من صفحة محددة
curl -s https://localhost:3000/ar/blog/test | \
  grep -oP '<script type="application/ld\+json">\K[^<]+' | \
  jq .
```

### في الـ CI

```typescript
// tests/seo/jsonld.test.ts
import { buildArticleJsonLd } from '@/lib/seo/jsonld/article';
import { z } from 'zod';

const ArticleJsonLdSchema = z.object({
  '@context': z.literal('https://schema.org'),
  '@type': z.literal('BlogPosting'),
  headline: z.string().max(110),
  image: z.array(z.string().url()).length(3),
  datePublished: z.string().regex(/^\d{4}-\d{2}-\d{2}T.*[+-]\d{2}:\d{2}|Z$/),
  dateModified: z.string(),
  author: z.object({
    '@type': z.literal('Person'),
    name: z.string().min(1),
    url: z.string().url(),
  }),
  publisher: z.object({
    '@type': z.literal('Organization'),
    name: z.string(),
    logo: z.object({
      '@type': z.literal('ImageObject'),
      url: z.string().url(),
    }),
  }),
  // ...
});

test('article jsonld is valid', () => {
  const result = buildArticleJsonLd({ /* sample input */ });
  ArticleJsonLdSchema.parse(result);  // throws if invalid
});
```

### بعد النشر (smoke test)

- **Rich Results Test:** https://search.google.com/test/rich-results
- **Schema Validator:** https://validator.schema.org/

كلاهما يقبل لصق الـ JSON-LD مباشرة أو URL.

---

## 8️⃣ القاعدة الذهبية

> **لا تكتب JSON-LD يدوياً. أي JSON-LD يطلع من builder. أي builder عنده Zod schema يتحقق منه قبل ما يرجّع النتيجة.**

---

## 📚 المصادر الرسمية

- [Google — Intro to Structured Data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Google — Article](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google — Breadcrumb](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [Google — Organization](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Google — General Structured Data Guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Schema.org BlogPosting](https://schema.org/BlogPosting)
- [Schema.org BreadcrumbList](https://schema.org/BreadcrumbList)
- [Schema.org Organization](https://schema.org/Organization)
- [schema-dts (TypeScript types)](https://github.com/google/schema-dts)
