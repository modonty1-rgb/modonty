# SEO Cache Standard — Master Rules

> هذا الملف هو المرجع الرسمي والأساسي لكل عمليات الكاشنج للـ SEO
> كل entity يُحفظ أو يُعدّل لازم يمشي على هذا الستاندر بدون استثناء
> أي تعديل مستقبلي يُراجع على أساس هذا الملف

---

## Overview: What Gets Cached and Where

```
┌─────────────────────────────────────────────────────────────────┐
│                    Settings Table                                │
│                 (Source of Truth - Central Config)                │
│                                                                  │
│  Business: siteName, siteUrl, brandDescription, inLanguage       │
│  Organization: orgLogoUrl, orgContact*, orgAddress*, orgGeo*     │
│  Social: twitterSite, twitterCreator, sameAs                    │
│  OG: defaultOgLocale, defaultOgType, defaultOgImageWidth/Height │
│  Twitter: defaultTwitterCard                                     │
│  Robots: defaultMetaRobots, defaultGooglebot                    │
│  Technical: defaultCharset, defaultHreflang, defaultLicense      │
│                                                                  │
│         ↓ getAllSettings() on every save ↓                       │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Article  │ │ Author   │ │ Category │ │  Client  │  ...       │
│  │ jsonLd ✅│ │ jsonLd ✅│ │ jsonLd ✅│ │ jsonLd ✅│            │
│  │ meta  ❌│ │ meta  ✅│ │ meta  ✅│ │ meta  ✅│            │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Rule 1: getAllSettings() — مطلوب في كل عملية حفظ

```
كل action يحفظ entity لازم يقرأ الإعدادات المركزية.
ما نكتب أي قيمة ثابتة موجودة في Settings.
```

```typescript
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";

const settings = await getAllSettings();

// القيم المطلوبة من Settings:
const siteUrl       = settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
const siteName      = settings.siteName || "مدونتي";
const inLanguage    = settings.inLanguage || "ar";
const ogLocale      = settings.defaultOgLocale || "ar_SA";
const twitterCard   = settings.defaultTwitterCard || "summary_large_image";
const metaRobots    = settings.defaultMetaRobots || "index, follow";
const ogImageWidth  = settings.defaultOgImageWidth || 1200;
const ogImageHeight = settings.defaultOgImageHeight || 630;
```

### ما يُقرأ من Settings حسب الاستخدام:

| المجموعة | الحقول | يُستخدم في |
|----------|--------|-----------|
| **Business** | `siteName`, `siteUrl`, `brandDescription` | JSON-LD + Metadata |
| **Organization** | `orgLogoUrl`, `orgContact*`, `orgAddress*`, `orgGeo*` | JSON-LD Organization node |
| **Social** | `twitterSite`, `twitterCreator` | Metadata twitter |
| **OG Defaults** | `defaultOgLocale`, `defaultOgImageWidth`, `defaultOgImageHeight` | Metadata openGraph |
| **Twitter Defaults** | `defaultTwitterCard` | Metadata twitter |
| **Robots** | `defaultMetaRobots`, `defaultGooglebot` | Metadata robots |
| **License** | `defaultLicense` | JSON-LD license fallback |

---

## Rule 2: Metadata كاملة — بدون حقل ناقص

```
كل entity لازم يُخزّن nextjsMetadata كاملة.
الفرونت إند يقرأها كما هي — لو ناقصة Google يشوف بيانات ناقصة.
```

### الهيكل المطلوب:

```typescript
const metadata = {
  // === Core ===
  title: seoTitle || `${entityName} — ${siteName}`,
  description: seoDescription || fallbackDescription,
  robots: metaRobots,                          // ← من Settings

  // === Canonical + Languages ===
  alternates: {
    canonical: `${siteUrl}/${entityPath}`,
    languages: {
      [inLanguage]: `${siteUrl}/${entityPath}`, // ← من Settings
    },
  },

  // === Open Graph ===
  openGraph: {
    title: seoTitle || `${entityName} — ${siteName}`,
    description: seoDescription || fallbackDescription,
    type: ogType,                              // حسب النوع (جدول تحت)
    url: `${siteUrl}/${entityPath}`,
    siteName,                                  // ← من Settings
    locale: ogLocale,                          // ← من Settings
    ...(imageUrl && {
      images: [{
        url: imageUrl,
        width: ogImageWidth,                   // ← من Settings
        height: ogImageHeight,                 // ← من Settings
      }],
    }),
  },

  // === Twitter ===
  twitter: {
    card: twitterCard,                         // ← من Settings
    title: seoTitle || entityName,
    description: seoDescription || fallbackDescription,
    ...(settings.twitterSite && { site: settings.twitterSite }),         // ← من Settings
    ...(settings.twitterCreator && { creator: settings.twitterCreator }), // ← من Settings
    ...(imageUrl && { images: [imageUrl] }),
  },
};
```

### og:type حسب نوع الـ Entity:

| Entity | og:type |
|--------|---------|
| Article | `article` |
| Author | `profile` |
| Category | `website` |
| Tag | `website` |
| Industry | `website` |
| Client | `website` |
| Home / About / FAQ | `website` |

---

## Rule 3: JSON-LD مع Organization — ربط بالمنظمة

```
كل entity لازم يربط بالمنظمة (Organization) من Settings.
طريقة الربط تختلف حسب نوع الـ Entity.
```

### طريقة الربط لكل Entity:

| Entity | JSON-LD Type | ربط المنظمة |
|--------|-------------|-------------|
| **Article** | `@graph: [Article, Organization, Person, Breadcrumb, FAQ, ImageObject]` | `publisher: Organization` |
| **Author** | `Person` | `worksFor: Organization` |
| **Category** | `@graph: [CollectionPage, Organization, WebSite, BreadcrumbList]` | `publisher: Organization` |
| **Tag** | `@graph: [CollectionPage, Organization, WebSite, BreadcrumbList]` | `publisher: Organization` |
| **Industry** | `@graph: [CollectionPage, Organization, WebSite, BreadcrumbList]` | `publisher: Organization` |
| **Client** | `Organization` (بياناته الخاصة) | هو نفسه Organization |
| **Modonty Pages** | `@graph: [WebPage, Organization, WebSite]` | Organization كامل |

### Organization Node المطلوب (minimum):

```typescript
{
  "@type": "Organization",
  name: settings.siteName,
  url: siteUrl,
  ...(settings.orgLogoUrl && { logo: settings.orgLogoUrl }),
  ...(settings.brandDescription && { description: settings.brandDescription }),
}
```

### حقول إضافية للـ JSON-LD:

```
inLanguage: settings.inLanguage || "ar"     // مطلوب في كل JSON-LD node
```

---

## Rule 4: الحفظ في DB + Cascade

```
كل عملية حفظ لازم:
1. تخزّن JSON-LD + Metadata في الـ entity نفسه
2. تعيد توليد الـ entities المرتبطة (cascade)
3. تعمل revalidatePath للفرونت
```

### الحقول المطلوبة في كل Model:

```prisma
// مطلوبة في كل model يملك صفحة على الفرونت
jsonLdStructuredData        String?   @db.String
jsonLdLastGenerated         DateTime?
jsonLdValidationReport      Json?
nextjsMetadata              Json?
nextjsMetadataLastGenerated DateTime?
```

### كود الحفظ المطلوب:

```typescript
// 1. حفظ الكاش
await db.[entity].update({
  where: { id },
  data: {
    jsonLdStructuredData: JSON.stringify(jsonLd),
    jsonLdLastGenerated: new Date(),
    nextjsMetadata: JSON.parse(JSON.stringify(metadata)),
    nextjsMetadataLastGenerated: new Date(),
  },
});

// 2. Cascade
const relatedArticles = await db.article.findMany({
  where: { [entityForeignKey]: id },
  select: { id: true },
});
if (relatedArticles.length > 0) {
  await Promise.all(
    relatedArticles.map(a => generateAndSaveJsonLd(a.id).catch(() => null))
  );
}

// 3. Revalidate
revalidatePath("/[entity-path]");
revalidatePath("/articles");
```

### جدول الـ Cascade:

| لما يتعدل هذا | يتجدد تلقائي | الحالة |
|---------------|-------------|--------|
| **Author** | كل المقالات بهذا المؤلف | ✅ شغال |
| **Media** | كل المقالات اللي تستخدم هذه الصورة | ✅ شغال |
| **Category** | كل المقالات في هذا التصنيف | ❌ مطلوب |
| **Tag** | كل المقالات بهذا الوسم | ❌ مطلوب |
| **Industry** | كل المقالات في هذا القطاع | ❌ مطلوب |
| **Client** | كل المقالات لهذا العميل | ❌ مطلوب |
| **Settings** | كل الـ entities | ❌ يدوي من SEO Overview |
| **FAQ** | صفحة FAQ في Settings | ✅ شغال |

---

## Rule 5: Frontend يقرأ الكاش أولاً

```
كل صفحة على الفرونت لازم:
1. تقرأ الكاش (jsonLdStructuredData + nextjsMetadata)
2. لو الكاش موجود — تستخدمه مباشرة
3. لو الكاش فاضي — تولّد live كـ fallback
```

### كود الفرونت المطلوب:

```typescript
// generateMetadata
export async function generateMetadata(): Promise<Metadata> {
  const entity = await getEntity(slug);
  
  // Use cached metadata if available
  if (entity.nextjsMetadata && typeof entity.nextjsMetadata === "object") {
    return entity.nextjsMetadata as Metadata;
  }

  // Fallback: generate live
  return { title: entity.name, description: entity.description };
}

// JSON-LD in page component
export default async function Page() {
  const entity = await getEntity(slug);
  
  // Use cached JSON-LD if available
  const jsonLdString = entity.jsonLdStructuredData || JSON.stringify(liveFallback);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdString }}
    />
  );
}
```

### كل entity لازم يكون في:

- `sitemap.ts` — URL مع lastModified
- `image-sitemap.xml` — لو عنده صور (المقالات فقط حالياً)

---

## Current Compliance Matrix

### Content Entities (DB-backed, cacheable)

| Entity | Rule 1 | Rule 2 | Rule 3 | Rule 4 | Rule 5 | Score |
|--------|--------|--------|--------|--------|--------|-------|
| | getAllSettings | Complete Meta | JSON-LD + Org | Cache + Cascade | Frontend Cache | |
| **Article** | ✅ | ❌ no nextjsMetadata | ✅ full @graph | ✅ jsonLd only | ✅ | 80% |
| **Author** | ✅ | ✅ complete | ✅ worksFor | ✅ both + cascade | ✅ | **100%** |
| **Category** | ✅ | ⚠️ no languages | ❌ no Organization | ✅ both, no cascade | ✅ | 70% |
| **Tag** | ✅ | ⚠️ no languages | ❌ no Organization | ✅ both, no cascade | ✅ | 70% |
| **Industry** | ✅ | ⚠️ no languages | ❌ no Organization | ✅ both, no cascade | ✅ | 70% |
| **Client** | ✅ | ✅ fullest | ✅ own Organization | ✅ both, no cascade | ✅ | 90% |
| **Media** | N/A | N/A | N/A | cascade only ✅ | N/A | N/A* |

*Media لا يحتاج كاش خاص — هو trigger للمقالات فقط

### Modonty Pages (managed via admin Modonty Pages)

| Page | Cached in | Rule 5 (Frontend reads cache) | Score |
|------|-----------|-------------------------------|-------|
| **Home** `/` | Settings (homeMetaTags, homeJsonLd) | ✅ via `getHomePageSeo()` | **100%** |
| **About** `/about` | Modonty table (slug: about) | ⚠️ builds meta live, not from cache | 90% |
| **Privacy** `/legal/privacy-policy` | Modonty table | ⚠️ same issue | 90% |
| **Cookie** `/legal/cookie-policy` | Modonty table | ⚠️ same issue | 90% |
| **User Agreement** `/legal/user-agreement` | Modonty table | ⚠️ same issue | 90% |
| **Copyright** `/legal/copyright-policy` | Modonty table | ⚠️ same issue | 90% |
| **Terms** `/terms` | Modonty table | ⚠️ same issue | 90% |
| **FAQ** `/help/faq` | Settings (faqPageMetaTags, faqJsonLd) | ✅ via `getFaqPageSeo()` | 95% |
| **Trending** `/trending` | Settings (trendingPageMetaTags) | ✅ via `getTrendingPageSeo()` | 95% |
| **Categories List** `/categories` | Settings (categoriesPageMetaTags) | ✅ | 95% |
| **Clients List** `/clients` | Settings (clientsPageMetaTags) | ✅ | 95% |

### Utility Pages (static metadata, no DB cache)

| Page | Has Cache? | robots | Action Needed |
|------|-----------|--------|---------------|
| **Contact** `/contact` | ❌ hardcoded meta | index | ⚠️ Should use Modonty pages system |
| **Help** `/help` | ❌ hardcoded meta | index | ⚠️ Should use Modonty pages system |
| **Search** `/search` | ❌ hardcoded meta | noindex recommended | Document as intentionally static |
| **Subscribe** `/subscribe` | ❌ hardcoded meta | noindex | OK — noindex page |
| **News** `/news` | ❌ hardcoded meta | index | ⚠️ Should use cache or Modonty pages |
| **News Subscribe** `/news/subscribe` | ❌ hardcoded meta | noindex | OK — noindex page |
| **Feedback** `/help/feedback` | ❌ hardcoded meta | noindex | OK — noindex page |

### Sub-pages (derive from parent)

| Page | Parent | Cache Strategy |
|------|--------|---------------|
| **Client sub-pages** `/clients/[slug]/*` (about, contact, reviews, photos, reels, followers, likes, mentions) | Client | Derive metadata from parent client cache. No separate cache needed. |
| **User Profile** `/users/[id]` | User/Author | ⚠️ Generates live meta. Low priority — user profiles are not primary SEO targets. |

### Auth & Private Pages (noindex — no SEO cache needed)

| Page | robots | Notes |
|------|--------|-------|
| `/users/login` | noindex | Auth page — no SEO value |
| `/users/register` | noindex | Auth page — no SEO value |
| `/users/notifications` | noindex | Authenticated — private data |
| `/users/profile` | noindex | Authenticated — private data |
| `/users/profile/favorites` | noindex | Authenticated — private data |
| `/users/profile/comments` | noindex | Authenticated — private data |
| `/users/profile/following` | noindex | Authenticated — private data |
| `/users/profile/liked` | noindex | Authenticated — private data |
| `/users/profile/disliked` | noindex | Authenticated — private data |
| `/users/profile/settings` | noindex | Authenticated — private data |

> هذه الصفحات لا تحتاج SEO cache — هي صفحات خاصة بالمستخدم المسجل ولا تُفهرس في Google.

---

## Gaps to Fix (Priority Order)

### High Priority
1. **Category/Tag/Industry** — إضافة Organization node في JSON-LD
2. **Category/Tag/Industry** — إضافة `alternates.languages` في Metadata
3. **Client update** — إضافة cascade لتجديد مقالات العميل
4. **Article** — إضافة nextjsMetadata cache

### Medium Priority
5. **Category/Tag/Industry** — إضافة cascade لتجديد المقالات المرتبطة
6. **About + Legal pages** — الفرونت يبني meta live بدل ما يقرأ الكاش (يخالف Rule 5)
7. **Contact + Help pages** — إضافتها لنظام Modonty Pages عشان تُدار من الأدمن

### Low Priority
8. **Settings change** — إضافة auto-cascade لكل الـ entities (حالياً يدوي من SEO Overview)
9. **News page** — إضافة كاش أو إدارة من Modonty Pages
10. **Search page** — توثيق إنها noindex بقصد
11. **User profiles** — إضافة كاش (أولوية منخفضة)

---

## DB Tables — Where SEO Cache Lives

| Table | jsonLdStructuredData | nextjsMetadata | Who Writes | Frontend Page |
|-------|---------------------|----------------|------------|---------------|
| **articles** | Full @graph | ❌ missing | `generateAndSaveJsonLd()` | `/articles/[slug]` |
| **authors** | Person + worksFor | ✅ complete | `updateAuthor()` | `/authors/[slug]` |
| **categories** | CollectionPage | ✅ partial | `generateAndSaveCategorySeo()` | `/categories/[slug]` |
| **tags** | CollectionPage | ✅ partial | `generateAndSaveTagSeo()` | (no frontend page) |
| **industries** | CollectionPage | ✅ partial | `generateAndSaveIndustrySeo()` | (no frontend page) |
| **clients** | Organization | ✅ complete | `generateClientSEO()` | `/clients/[slug]` |
| **settings** | Organization + listing pages | Home/FAQ/Trending/Categories/Clients pages | Settings save actions | `/`, `/help/faq`, `/trending`, `/categories`, `/clients` |
| **modonty** | WebPage | Page-specific | `generateModontyPageSEO()` | `/about`, `/legal/*`, `/terms` |

---

## Data Flow: Settings → Entity → Frontend

```
┌──────────────────────────────────────────────────────────────────┐
│                    SETTINGS TABLE (Central Config)                │
│                                                                  │
│  siteName ─────────────┬──→ Article (publisher.name)             │
│                        ├──→ Author (worksFor.name)               │
│                        ├──→ Category/Tag/Industry (publisher)    │
│                        └──→ All metadata (og:siteName)           │
│                                                                  │
│  siteUrl ──────────────┬──→ All JSON-LD (URLs)                   │
│                        └──→ All metadata (canonical, og:url)     │
│                                                                  │
│  orgLogoUrl ───────────┬──→ Article (publisher.logo)             │
│                        └──→ Author (worksFor.logo)               │
│                                                                  │
│  defaultOgLocale ──────────→ All metadata (og:locale)            │
│  defaultTwitterCard ───────→ All metadata (twitter:card)         │
│  twitterSite ──────────────→ All metadata (twitter:site)         │
│  defaultMetaRobots ────────→ All metadata (robots)               │
│  inLanguage ───────────────→ All JSON-LD + metadata (hreflang)   │
│  defaultOgImageWidth/Height→ All metadata (og:image dimensions)  │
└──────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────────┐
│              WHO READS SETTINGS AND WHEN                         │
│                                                                  │
│  Article save ──→ getAllSettings() ──→ jsonLd cache               │
│  Author save ───→ getAllSettings() ──→ jsonLd + meta cache        │
│                                   ──→ ALL articles by author      │
│  Category save ─→ getAllSettings() ──→ jsonLd + meta cache        │
│  Tag save ──────→ getAllSettings() ──→ jsonLd + meta cache        │
│  Industry save ─→ getAllSettings() ──→ jsonLd + meta cache        │
│  Client save ───→ getAllSettings() ──→ jsonLd + meta cache        │
│  Media edit ────→ (no settings)  ──→ articles using this media    │
│  Page SEO ──────→ getAllSettings() ──→ page jsonLd + meta cache   │
│  Settings save ─→ NO auto-cascade ──→ manual from SEO Overview   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Checklist: قبل تسليم أي Entity Save Action

```
□ يقرأ getAllSettings()
□ يستخدم siteUrl من Settings (مو hardcoded)
□ يستخدم siteName من Settings (مو hardcoded)
□ Metadata فيها: title, description, robots
□ Metadata فيها: alternates (canonical + languages)
□ OpenGraph فيه: locale, siteName, type, images مع width/height من Settings
□ Twitter فيه: card, site, creator من Settings
□ JSON-LD فيه: Organization من Settings (publisher أو worksFor)
□ JSON-LD فيه: inLanguage من Settings
□ يحفظ jsonLdStructuredData في DB
□ يحفظ nextjsMetadata في DB
□ يحدّث jsonLdLastGenerated + nextjsMetadataLastGenerated
□ يعيد توليد المقالات المرتبطة (cascade)
□ يعمل revalidatePath للفرونت
□ الفرونت يقرأ الكاش أولاً مع live fallback
□ الصفحة موجودة في sitemap.ts
□ Zod validation على الـ input
```

---

## Template: Full Update Action

```typescript
"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { generateAndSaveJsonLd } from "@/lib/seo";

const updateSchema = z.object({
  name: z.string().min(1),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  // ... entity-specific fields
});

export async function updateEntity(id: string, data: z.infer<typeof updateSchema>) {
  try {
    // 1. Validate
    const parsed = updateSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };
    const d = parsed.data;

    // 2. Save entity data
    const entity = await db.entity.update({ where: { id }, data: { ...d } });

    // 3. Read ALL settings (Rule 1)
    const settings = await getAllSettings();
    const siteUrl       = settings.siteUrl || "https://modonty.com";
    const siteName      = settings.siteName || "مدونتي";
    const inLanguage    = settings.inLanguage || "ar";
    const ogLocale      = settings.defaultOgLocale || "ar_SA";
    const twitterCard   = settings.defaultTwitterCard || "summary_large_image";
    const metaRobots    = settings.defaultMetaRobots || "index, follow";
    const ogImageWidth  = settings.defaultOgImageWidth || 1200;
    const ogImageHeight = settings.defaultOgImageHeight || 630;

    // 4. Build JSON-LD with Organization (Rule 3)
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "...",  // Entity-specific
      name: d.name,
      inLanguage,
      // ... entity-specific fields
      publisher: {  // or worksFor for Person
        "@type": "Organization",
        name: siteName,
        url: siteUrl,
        ...(settings.orgLogoUrl && { logo: settings.orgLogoUrl }),
      },
    };

    // 5. Build complete Metadata (Rule 2)
    const metadata = {
      title: d.seoTitle || `${d.name} — ${siteName}`,
      description: d.seoDescription || "...",
      robots: metaRobots,
      alternates: {
        canonical: `${siteUrl}/path`,
        languages: { [inLanguage]: `${siteUrl}/path` },
      },
      openGraph: {
        title: d.seoTitle || d.name,
        description: d.seoDescription || "",
        type: "website",
        url: `${siteUrl}/path`,
        siteName,
        locale: ogLocale,
        ...(imageUrl && { images: [{ url: imageUrl, width: ogImageWidth, height: ogImageHeight }] }),
      },
      twitter: {
        card: twitterCard,
        title: d.seoTitle || d.name,
        description: d.seoDescription || "",
        ...(settings.twitterSite && { site: settings.twitterSite }),
        ...(settings.twitterCreator && { creator: settings.twitterCreator }),
        ...(imageUrl && { images: [imageUrl] }),
      },
    };

    // 6. Cache to DB (Rule 4)
    await db.entity.update({
      where: { id },
      data: {
        jsonLdStructuredData: JSON.stringify(jsonLd),
        jsonLdLastGenerated: new Date(),
        nextjsMetadata: JSON.parse(JSON.stringify(metadata)),
        nextjsMetadataLastGenerated: new Date(),
      },
    });

    // 7. Cascade regeneration (Rule 4)
    const relatedArticles = await db.article.findMany({
      where: { entityId: id },
      select: { id: true },
    });
    if (relatedArticles.length > 0) {
      await Promise.all(
        relatedArticles.map(a => generateAndSaveJsonLd(a.id).catch(() => null))
      );
    }

    // 8. Revalidate (Rule 4)
    revalidatePath("/entity-path");
    revalidatePath("/articles");

    return { success: true, entity };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed" };
  }
}
```
