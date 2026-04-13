# SEO لصفحات القوائم (Listing Pages)

> المرجع الرسمي لبناء SEO Cache لصفحات القوائم في مدونتي
> مبني على مصادر رسمية فقط — صفر تخمين
> تاريخ: 2026-04-03

---

## ايش صفحات القوائم؟

صفحات تعرض قائمة عناصر — مو عنصر واحد:

| الصفحة | الرابط | تعرض |
|--------|--------|------|
| الرئيسية | `/` | أحدث المقالات + نظرة عامة |
| العملاء | `/clients` | كل العملاء |
| التصنيفات | `/categories` | كل الفئات |
| الوسوم | `/tags` | كل التاقات |
| الصناعات | `/industries` | كل الصناعات |
| الأكثر رواجاً | `/trending` | أكثر المقالات قراءة |

---

## الهيكل المطلوب لكل صفحة قائمة

### أولاً: Meta Tags

كل صفحة قائمة تحتاج meta tags فريدة:

**المطلوب:**
- `title` — فريد لكل صفحة. مثال: "العملاء | مدونتي"
- `description` — 150-160 حرف يوصف المحتوى. فريد لكل صفحة.
- `canonical` — يشير لنفس الصفحة (self-referencing)
- `robots` — `index, follow`
- `og:type` — `website` (مو `article`)
- `og:title` — نفس title أو مختصر
- `og:description` — نفس description أو مختصر
- `og:url` — الرابط الكامل
- `og:site_name` — من Settings
- `og:locale` — من Settings (ar_SA)
- `og:image` — صورة المشاركة الافتراضية من Settings
- `twitter:card` — `summary_large_image`
- `twitter:title` — نفس title
- `twitter:description` — نفس description
- `twitter:site` — من Settings

**المصدر:** [Google Search Central — Title Links](https://developers.google.com/search/docs/appearance/title-link) + [Snippets](https://developers.google.com/search/docs/appearance/snippet)

**قاعدة مهمة:** لو الصفحة paginated (صفحة 2، 3...)، العنوان يتغير:
- صفحة 1: "العملاء | مدونتي"
- صفحة 2: "العملاء — صفحة 2 | مدونتي"

---

### ثانياً: JSON-LD — الهيكل الرسمي

كل صفحة قائمة تحتاج 3 أنواع JSON-LD في `@graph`:

#### 1. CollectionPage

**ايش هو:** يقول لجوجل "هذي صفحة تعرض قائمة عناصر"

**المصدر:** [Schema.org — CollectionPage](https://schema.org/CollectionPage)

```json
{
  "@type": "CollectionPage",
  "@id": "https://modonty.com/clients#collectionpage",
  "name": "العملاء",
  "description": "استعرض قائمة عملاء مدونتي...",
  "url": "https://modonty.com/clients",
  "inLanguage": "ar",
  "isPartOf": {
    "@type": "WebSite",
    "@id": "https://modonty.com#website",
    "name": "مدونتي",
    "url": "https://modonty.com"
  },
  "mainEntity": {
    "@id": "https://modonty.com/clients#itemlist"
  }
}
```

**قواعد:**
- `@type` دائماً `CollectionPage` — مو `WebPage` ومو `ItemList`
- `isPartOf` يشير للـ WebSite
- `mainEntity` يشير للـ ItemList
- `inLanguage` من Settings

#### 2. ItemList

**ايش هو:** القائمة نفسها — كل عنصر فيها `ListItem`

**المصدر:** [Schema.org — ItemList](https://schema.org/ItemList) + [Google Carousel](https://developers.google.com/search/docs/appearance/structured-data/carousel)

```json
{
  "@type": "ItemList",
  "@id": "https://modonty.com/clients#itemlist",
  "numberOfItems": 150,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "شركة أكمي",
      "url": "https://modonty.com/clients/acme-corp"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "مؤسسة النخبة",
      "url": "https://modonty.com/clients/elite-est"
    }
  ]
}
```

**قواعد:**
- `numberOfItems` = العدد الكلي عبر كل الصفحات (مو بس الصفحة الحالية)
- `itemListElement` = العناصر في الصفحة الحالية فقط
- كل `ListItem` فيه بس: `position` + `name` + `url`
- **ما نحط البيانات الكاملة** للعنصر — صفحة العنصر الفردية تتكفل بهذا
- الـ `position` يبدأ من 1 في كل صفحة (أو يكمل من الصفحة السابقة — الاثنين صح)

**المصدر:** [Google — Carousel Structured Data](https://developers.google.com/search/docs/appearance/structured-data/carousel): "Each item in the list includes only a type, position, and url property"

#### 3. BreadcrumbList

**ايش هو:** مسار التنقل — يظهر في جوجل فوق العنوان

**المصدر:** [Google — Breadcrumb](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)

```json
{
  "@type": "BreadcrumbList",
  "@id": "https://modonty.com/clients#breadcrumb",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "الرئيسية",
      "item": "https://modonty.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "العملاء"
    }
  ]
}
```

**قواعد:**
- آخر عنصر ما يحتاج `item` (هو الصفحة الحالية)
- `position` يبدأ من 1
- `name` بالعربي

---

## JSON-LD الكامل — مثال صفحة العملاء

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://modonty.com/clients#collectionpage",
      "name": "العملاء | مدونتي",
      "description": "استعرض قائمة عملاء مدونتي — شركات ومؤسسات تثق في خدماتنا",
      "url": "https://modonty.com/clients",
      "inLanguage": "ar",
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://modonty.com#website",
        "name": "مدونتي",
        "url": "https://modonty.com"
      },
      "mainEntity": {
        "@id": "https://modonty.com/clients#itemlist"
      }
    },
    {
      "@type": "ItemList",
      "@id": "https://modonty.com/clients#itemlist",
      "numberOfItems": 150,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "شركة أكمي",
          "url": "https://modonty.com/clients/acme-corp"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "مؤسسة النخبة",
          "url": "https://modonty.com/clients/elite-est"
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://modonty.com/clients#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "الرئيسية",
          "item": "https://modonty.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "العملاء"
        }
      ]
    }
  ]
}
```

---

## الصفحة الرئيسية — حالة خاصة

الصفحة الرئيسية مختلفة — مو CollectionPage. هي WebPage + Organization + WebSite:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://modonty.com#organization",
      "name": "مدونتي",
      "url": "https://modonty.com",
      "description": "...",
      "logo": { "@type": "ImageObject", "url": "...", "width": 512, "height": 512 },
      "contactPoint": { ... },
      "sameAs": ["https://x.com/modonty", "..."]
    },
    {
      "@type": "WebSite",
      "@id": "https://modonty.com#website",
      "name": "مدونتي",
      "url": "https://modonty.com",
      "inLanguage": "ar",
      "publisher": { "@id": "https://modonty.com#organization" }
    },
    {
      "@type": "WebPage",
      "@id": "https://modonty.com#webpage",
      "name": "مدونتي — أحدث المقالات",
      "url": "https://modonty.com",
      "isPartOf": { "@id": "https://modonty.com#website" },
      "inLanguage": "ar",
      "dateModified": "2026-04-03T00:00:00.000Z"
    }
  ]
}
```

**المصدر:** [Google — Organization](https://developers.google.com/search/docs/appearance/structured-data/organization) + [Yoast — WebPage Schema](https://developer.yoast.com/features/schema/pieces/webpage)

---

## الفرق بين صفحات القوائم

| الصفحة | CollectionPage name | Breadcrumb | ItemList items |
|--------|-------------------|------------|----------------|
| `/clients` | العملاء | الرئيسية → العملاء | كل عميل: name + `/clients/{slug}` |
| `/categories` | التصنيفات | الرئيسية → التصنيفات | كل فئة: name + `/categories/{slug}` |
| `/tags` | الوسوم | الرئيسية → الوسوم | كل تاق: name + `/tags/{slug}` |
| `/industries` | الصناعات | الرئيسية → الصناعات | كل صناعة: name + `/industries/{slug}` |
| `/trending` | الأكثر رواجاً | الرئيسية → الأكثر رواجاً | كل مقال: title + `/articles/{slug}` |

---

## Pagination — القواعد

**المصدر:** [Google — Pagination](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)

**القواعد:**
1. كل صفحة paginated تاخذ canonical لنفسها — **مو للصفحة الأولى**
2. `rel="next"` و `rel="prev"` **ملغية** من جوجل منذ 2019
3. العنوان يتغير: "العملاء — صفحة 2 | مدونتي"
4. `numberOfItems` في ItemList = العدد الكلي (مو عدد الصفحة الحالية)
5. `itemListElement` = عناصر الصفحة الحالية فقط
6. **ما نحط `noindex` على صفحات paginated** — جوجل يقول لا تسويها

---

## كيف نبني الـ Cache

### الخطوة 1: الأدمن يضغط "Generate" في SEO Cache tab

### الخطوة 2: النظام يقرأ من DB
- يقرأ Settings (siteUrl, siteName, inLanguage, إلخ)
- يقرأ كل العملاء/الفئات/التاقات/الصناعات (name + slug فقط)
- يحسب العدد الكلي

### الخطوة 3: يبني Meta Tags + JSON-LD لكل صفحة قائمة
- Meta Tags: title, description, OG, Twitter — من Settings + عنوان/وصف الصفحة
- JSON-LD: CollectionPage + ItemList + BreadcrumbList

### الخطوة 4: يحفظ في Settings
- `homeMetaTags` + `jsonLdStructuredData` (الرئيسية)
- `clientsPageMetaTags` + `clientsPageJsonLdStructuredData` (العملاء)
- `categoriesPageMetaTags` + `categoriesPageJsonLdStructuredData` (التصنيفات)
- `trendingPageMetaTags` + `trendingPageJsonLdStructuredData` (الترند)

### الخطوة 5: الموقع العام يقرأ الـ cache مباشرة
- سريع — ما يحسب شيء
- لو ما في cache → يولد بيانات أساسية كـ fallback

---

## القواعد الثابتة

1. **CollectionPage + ItemList معاً** — ما نستخدم ItemList لوحده كنوع صفحة
2. **ListItem فيه بس name + url + position** — ما نحط البيانات الكاملة
3. **numberOfItems = الكل** — حتى لو عرضنا 10 فقط
4. **كل صفحة paginated canonical لنفسها** — مو للصفحة الأولى
5. **title فريد لكل صفحة قائمة** — مع رقم الصفحة لو > 1
6. **BreadcrumbList في كل صفحة قائمة**
7. **الرئيسية حالة خاصة** — WebPage + Organization + WebSite (مو CollectionPage)
8. **كل القيم من Settings** — ما نكتب شيء hardcoded

---

## المصادر

**Google (رسمي):**
- [Carousel Structured Data](https://developers.google.com/search/docs/appearance/structured-data/carousel) — ItemList + ListItem
- [Breadcrumb Structured Data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb) — BreadcrumbList
- [Organization Structured Data](https://developers.google.com/search/docs/appearance/structured-data/organization) — Organization
- [Pagination Guide](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading) — no rel next/prev
- [Title Links](https://developers.google.com/search/docs/appearance/title-link) — unique titles
- [Snippets](https://developers.google.com/search/docs/appearance/snippet) — unique descriptions

**Schema.org (رسمي):**
- [CollectionPage](https://schema.org/CollectionPage) — page type for listings
- [ItemList](https://schema.org/ItemList) — list structure
- [ListItem](https://schema.org/ListItem) — individual item in list

**Yoast (مرجع):**
- [WebPage Schema](https://developer.yoast.com/features/schema/pieces/webpage) — CollectionPage variant

---

## الحقول المطلوبة في DB

### حقول موجودة في Settings:

| الحقل | النوع | لأي صفحة |
|-------|-------|----------|
| `homeMetaTags` | Json | الرئيسية — meta tags |
| `jsonLdStructuredData` | String | الرئيسية — JSON-LD |
| `jsonLdLastGenerated` | DateTime | الرئيسية — وقت التوليد |
| `jsonLdValidationReport` | Json | الرئيسية — تقرير التحقق |
| `clientsPageMetaTags` | Json | العملاء — meta tags |
| `clientsPageJsonLdStructuredData` | String | العملاء — JSON-LD |
| `clientsPageJsonLdLastGenerated` | DateTime | العملاء — وقت التوليد |
| `clientsPageJsonLdValidationReport` | Json | العملاء — تقرير التحقق |
| `categoriesPageMetaTags` | Json | التصنيفات — meta tags |
| `categoriesPageJsonLdStructuredData` | String | التصنيفات — JSON-LD |
| `categoriesPageJsonLdLastGenerated` | DateTime | التصنيفات — وقت التوليد |
| `categoriesPageJsonLdValidationReport` | Json | التصنيفات — تقرير التحقق |
| `trendingPageMetaTags` | Json | الترند — meta tags |
| `trendingPageJsonLdStructuredData` | String | الترند — JSON-LD |
| `trendingPageJsonLdLastGenerated` | DateTime | الترند — وقت التوليد |
| `trendingPageJsonLdValidationReport` | Json | الترند — تقرير التحقق |

### حقول ناقصة — محتاجين نضيفها في Schema:

| الحقل | النوع | لأي صفحة |
|-------|-------|----------|
| `tagsPageMetaTags` | Json | الوسوم — meta tags |
| `tagsPageJsonLdStructuredData` | String | الوسوم — JSON-LD |
| `tagsPageJsonLdLastGenerated` | DateTime | الوسوم — وقت التوليد |
| `tagsPageJsonLdValidationReport` | Json | الوسوم — تقرير التحقق |
| `industriesPageMetaTags` | Json | الصناعات — meta tags |
| `industriesPageJsonLdStructuredData` | String | الصناعات — JSON-LD |
| `industriesPageJsonLdLastGenerated` | DateTime | الصناعات — وقت التوليد |
| `industriesPageJsonLdValidationReport` | Json | الصناعات — تقرير التحقق |
