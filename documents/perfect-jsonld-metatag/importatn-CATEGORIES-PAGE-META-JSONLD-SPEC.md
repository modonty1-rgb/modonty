# Categories Page Meta & JSON-LD — Spec

100% full coverage for `/categories` meta tags and JSON-LD. Generate in admin, store in Settings; modonty reads from DB.

---

## 1. Context

- **Route:** `/categories`
- **Page:** Categories directory (taxonomy)
- **Flow:** Admin generates → validate → save → modonty reads from DB (no runtime generation)
- **Storage:** `categoriesPageMetaTags`, `categoriesPageJsonLdStructuredData`
- **SOT (categories):** Category table — each Thing/CollectionPage in ItemList comes from Category model
- **SOT (defaults):** Settings — site-wide defaults only (siteName, siteUrl, ogImageUrl, etc.)
- **Output:** Generated meta + JSON-LD stored in Settings; modonty reads from DB (no runtime generation)

---

## 2. Rules

- **ItemList limit:** 20 items in `itemListElement`; `numberOfItems` = total categories in DB
- **Meta source:** Settings (defaults only); page title/description = fallback strings ("الفئات" etc.) ?? siteName ?? brandDescription
- **JSON-LD:** Organization + WebSite + CollectionPage + ItemList; only ItemList varies with data
- **Category schema:** `@type: Thing` or `CollectionPage` — full coverage (see Section 4a)
- **CollectionPage.dateModified:** Most recently updated category `updatedAt` or generation timestamp
- **HTML meta keywords:** Do not use (deprecated)

---

## 2a. SOT by Field (Detailed)

### Meta Tags

| Output Field | SOT | Fallback |
|--------------|-----|----------|
| title | Settings.categoriesSeoTitle | "الفئات" |
| description | Settings.categoriesSeoDescription | "استكشف المقالات حسب الفئة - تصفح جميع فئات المحتوى المتاحة" |
| canonical, openGraph.url | Settings.siteUrl + "/categories" | "https://modonty.com/categories" |
| charset | Settings.defaultCharset | "UTF-8" |
| viewport | Settings.defaultViewport | "width=device-width, initial-scale=1" |
| robots | Settings.defaultMetaRobots + ", max-snippet:-1, max-image-preview:large" | "index, follow" |
| googlebot | Settings.defaultGooglebot | Same as robots |
| notranslate | Settings.defaultNotranslate | primaryLang === "ar" |
| themeColor | Settings.themeColor | "#3030FF" |
| author | Settings.siteAuthor | "" |
| hreflang | Settings.defaultOgLocale, inLanguage, defaultHreflang + canonical | primaryLang + x-default |
| sitemapPriority | Settings.defaultSitemapPriority | 0.5 |
| sitemapChangeFreq | Settings.defaultSitemapChangeFreq | "monthly" |
| referrerPolicy | Settings.defaultReferrerPolicy | Omit if empty |
| msapplicationTileColor | Settings.themeColor | "#3030FF" |
| openGraph.title, description | Same as title, description | (above) |
| openGraph.type | Settings.defaultOgType | "website" |
| openGraph.siteName | Settings.siteName | "Modonty" |
| openGraph.locale | Settings.defaultOgLocale | "ar_SA" |
| openGraph.determiner | Settings.defaultOgDeterminer | "auto" |
| openGraph.images[0].* | Settings.ogImageUrl/logoUrl, defaultOgImage*, altImage | Omit if empty |
| twitter.* | Settings.defaultTwitterCard, twitterSite, twitterCreator, twitterSiteId, twitterCreatorId | (see code) |

### JSON-LD — Site-Level (Organization, WebSite, CollectionPage)

| Node | Property | SOT | Fallback |
|------|----------|-----|----------|
| Organization | @id, name, url, description, sameAs, logo, contactPoint, location | Settings.siteUrl, siteName, brandDescription, getSameAsFromSettings(), orgLogoUrl, orgContact*, orgAddress*, orgGeo* | Same as Clients |
| WebSite | @id, name, url, publisher, potentialAction | Settings.siteUrl, siteName, orgSearchUrlTemplate | Same as Clients |
| CollectionPage | name | Settings.categoriesSeoTitle | "الفئات" |
| | description, url | Settings.categoriesSeoDescription, siteUrl + "/categories" | (above) |
| | dateModified | Max Category.updatedAt of listed categories | generation timestamp |
| | mainEntity, breadcrumb, primaryImageOfPage | ItemList, hardcoded Home→الفئات, ogImageUrl | — |
| ItemList | numberOfItems | db.category.count() | 0 |
| | itemListOrder | Hardcoded | "ItemListOrderAscending" |
| | itemListElement | Up to 20 ListItems | [] |

### JSON-LD — Each Category (ListItem.item)

| Schema.org Property | SOT (Category model) | Fallback |
|---------------------|----------------------|----------|
| name | Category.name | Required |
| alternateName | Category.seoTitle (When set; if different from name) | Omit if empty |
| @id, url, mainEntityOfPage | Category.slug → siteUrl/categories/slug; Category.canonicalUrl for url override | — |
| description | Category.description or Category.seoDescription | Omit if both empty |
| image | Category.socialImage (ImageObject; socialImageAlt as caption) | Omit if empty |
| broader / isPartOf | Category.parentId → resolve to parent category @id | Omit if null |
| identifier | Category.id (Optional; when useful) | Omit |

### Summary

- **Page title/description:** Settings.categoriesSeoTitle, categoriesSeoDescription → LIST_PAGE_FALLBACKS
- **Site-level:** Settings (siteUrl, siteName, brandDescription, org*, logoUrl, ogImageUrl, sameAs)
- **sameAs:** Settings social URLs → getSameAsFromSettings()
- **Category-level:** Category table → omit if empty
- **ItemList count:** db.category.count()
- **CollectionPage.dateModified:** Max Category.updatedAt of fetched categories or generation timestamp

---

## 3. Meta Checklist

- **title, og:title, twitter:title**
  - Source: `"الفئات" ?? siteName`
- **description, og:description, twitter:description**
  - Source: `"استكشف المقالات حسب الفئة - تصفح جميع فئات المحتوى المتاحة" ?? brandDescription`
- **canonical, og:url**
  - Source: siteUrl/categories (canonical URL; og:url same as canonical)
- **og:type, og:site_name, og:locale**
  - Source: defaultOgType, siteName, defaultOgLocale
- **og:image, twitter:image**
  - Source: ogImageUrl ?? logoUrl
- **og:image width/height/type/alt**
  - Source: defaultOgImageWidth, defaultOgImageHeight, defaultOgImageType, altImage (og:image:alt required when og:image set per ogp.me)
- **og:determiner, og:locale:alternate**
  - Source: defaultOgDeterminer, defaultOgLocaleAlternate (array; empty or alternate locales)
- **twitter:card, site, creator, siteId, creatorId**
  - Source: defaultTwitterCard, twitterSite, twitterCreator, twitterSiteId, twitterCreatorId
- **charset, viewport**
  - Source: defaultCharset, defaultViewport
- **robots, googlebot**
  - Source: defaultMetaRobots, defaultGooglebot (+ max-snippet, max-image-preview)
- **notranslate, hreflang**
  - Source: defaultNotranslate, defaultHreflang (path: /categories)
- **themeColor, author, sitemap**
  - Source: themeColor, siteAuthor, defaultSitemapPriority, defaultSitemapChangeFreq
- **referrerPolicy, msapplicationTileColor**
  - Source: defaultReferrerPolicy, themeColor

---

## 4. JSON-LD Checklist (@graph)

- **Organization** (site-level)
  - Properties: @id, name, url, description, inLanguage, logo, sameAs, contactPoint, address, geo
  - Source: siteName, siteUrl, brandDescription, orgLogoUrl, sameAs, orgContact*, orgAddress*, orgGeo*
- **WebSite**
  - Properties: @id, name, url, description, inLanguage, publisher, potentialAction (SearchAction)
  - Source: siteName, siteUrl, brandDescription, orgSearchUrlTemplate
- **CollectionPage**
  - Properties: @id, name, url, description, inLanguage, isPartOf, dateModified, mainEntity, breadcrumb, primaryImageOfPage
  - Source: fallback "الفئات" ?? siteName; fallback description ?? brandDescription; siteUrl/categories; max(category.updatedAt) or generation time; breadcrumb Home→الفئات; ogImageUrl
- **ItemList**
  - Properties: itemListOrder, numberOfItems, itemListElement
  - Source: total categories; up to 20 ListItems
- **Each Category** (ListItem.item)
  - Properties: Full Thing/CollectionPage (see Section 4a)
  - Source: Category model fields

---

## 4a. Each Category (ListItem.item) — Full Coverage

One Thing or CollectionPage per category. Include every property when Category model has data; omit when empty.

- **name** → name (Always)
- **slug** → url, @id, mainEntityOfPage (Always; `siteUrl/categories/slug`)
- **description / seoDescription** → description (When set)
- **socialImage** → image (ImageObject) (When set)
- **socialImageAlt** → image caption in ImageObject (When set)
- **canonicalUrl** → url override (When set; else use profile URL)
- **seoTitle** → alternateName (When set; if different from name)
- **parentId** → broader or isPartOf (When set; reference to parent category)
- **id** → identifier (Optional; when useful)

**Required:** name, url. **Recommended:** @id, description. **Full:** + image, mainEntityOfPage, alternateName, broader.

---

## 5. Simulated Meta Object

Stored in `Settings.categoriesPageMetaTags`. Full-coverage shape per Section 3 checklist.

```json
{
  "charset": "UTF-8",
  "viewport": "width=device-width, initial-scale=1",
  "title": "الفئات",
  "description": "استكشف المقالات حسب الفئة - تصفح جميع فئات المحتوى المتاحة",
  "robots": "index, follow, max-snippet:-1, max-image-preview:large",
  "googlebot": "index, follow, max-snippet:-1, max-image-preview:large",
  "notranslate": true,
  "themeColor": "#3030FF",
  "canonical": "https://modonty.com/categories",
  "author": "مودونتي",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "msapplicationTileColor": "#3030FF",
  "hreflang": [
    { "lang": "ar", "href": "https://modonty.com/categories" },
    { "lang": "x-default", "href": "https://modonty.com/categories" }
  ],
  "sitemapPriority": 0.5,
  "sitemapChangeFreq": "monthly",
  "openGraph": {
    "title": "الفئات",
    "description": "استكشف المقالات حسب الفئة - تصفح جميع فئات المحتوى المتاحة",
    "type": "website",
    "url": "https://modonty.com/categories",
    "siteName": "مودونتي",
    "locale": "ar_SA",
    "localeAlternate": [],
    "determiner": "auto",
    "images": [
      {
        "url": "https://modonty.com/og-image.jpg",
        "secure_url": "https://modonty.com/og-image.jpg",
        "type": "image/jpeg",
        "width": 1200,
        "height": 630,
        "alt": "مودونتي - منصة المدونات"
      }
    ]
  },
  "twitter": {
    "card": "summary_large_image",
    "title": "الفئات",
    "description": "استكشف المقالات حسب الفئة - تصفح جميع فئات المحتوى المتاحة",
    "imageAlt": "مودونتي - منصة المدونات",
    "site": "@modonty",
    "creator": "@modonty",
    "image": "https://modonty.com/og-image.jpg",
    "siteId": "1234567890",
    "creatorId": "0987654321"
  }
}
```

**Optional meta:** apple-mobile-web-app-* (PWA/iOS); google-site-verification, msvalidate.01 (site-specific for Search Console / Bing Webmaster).

**Senior SEO coverage vs official docs / big-company practice:**

- **Open Graph (ogp.me):** 100% — Required (title, type, image, url) + optional (description, locale, localeAlternate, site_name, determiner, og:image:alt).
- **Twitter/X Cards:** 100% — card, title, description, image, imageAlt, site, creator, siteId, creatorId.
- **Google (meta, robots):** 100% — title, description, canonical, robots (+ max-snippet, max-image-preview), googlebot, notranslate.
- **Bing:** 100% — Same robots directives; OG used for rich results.
- **Platform (PWA/Windows):** 100% — referrerPolicy, msapplicationTileColor; verification optional/site-specific.

**Overall simulated meta: 100%** — All generally applicable properties from official docs and enterprise checklists. Verification and apple-mobile-web-app-* intentionally omitted (site-specific or prefer manifest).

---

## 6. Simulated JSON-LD (@graph)

**Structure:** Organization → WebSite → CollectionPage (with ItemList of Things/CollectionPages). `numberOfItems` = total categories; `itemListElement` = up to 20. Stored in `Settings.categoriesPageJsonLdStructuredData`.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://modonty.com/#organization",
      "name": "مودونتي",
      "url": "https://modonty.com",
      "description": "منصة محتوى عربية بالاشتراك تعتمد نظام المدونة المرجعية.",
      "inLanguage": "ar",
      "logo": {
        "@type": "ImageObject",
        "url": "https://modonty.com/logo.png",
        "width": 512,
        "height": 512
      },
      "sameAs": ["https://twitter.com/modonty", "https://facebook.com/modonty"],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "contact@modonty.com",
        "areaServed": "SA",
        "availableLanguage": "ar"
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "شارع الملك فهد",
        "addressLocality": "الرياض",
        "addressRegion": "الرياض",
        "postalCode": "12345",
        "addressCountry": "SA"
      },
      "geo": { "@type": "GeoCoordinates", "latitude": 24.7136, "longitude": 46.6753 }
    },
    {
      "@type": "WebSite",
      "@id": "https://modonty.com/#website",
      "name": "مودونتي",
      "url": "https://modonty.com",
      "description": "منصة محتوى عربية بالاشتراك.",
      "inLanguage": "ar",
      "publisher": { "@id": "https://modonty.com/#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": { "@type": "EntryPoint", "urlTemplate": "https://modonty.com/search?q={search_term_string}" },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "CollectionPage",
      "@id": "https://modonty.com/categories#collectionpage",
      "name": "الفئات",
      "url": "https://modonty.com/categories",
      "description": "استكشف المقالات حسب الفئة - تصفح جميع فئات المحتوى المتاحة",
      "inLanguage": "ar",
      "isPartOf": { "@id": "https://modonty.com/#website" },
      "dateModified": "2025-01-31T12:00:00.000Z",
      "breadcrumb": {
        "@type": "BreadcrumbList",
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
            "name": "الفئات",
            "item": "https://modonty.com/categories"
          }
        ]
      },
      "primaryImageOfPage": {
        "@type": "ImageObject",
        "url": "https://modonty.com/og-image.jpg",
        "width": 1200,
        "height": 630
      },
      "mainEntity": {
        "@type": "ItemList",
        "itemListOrder": "ItemListOrderAscending",
        "numberOfItems": 12,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "item": {
              "@type": "Thing",
              "@id": "https://modonty.com/categories/tech",
              "name": "تقنية",
              "description": "مقالات في مجال التقنية والتطوير",
              "url": "https://modonty.com/categories/tech",
              "mainEntityOfPage": "https://modonty.com/categories/tech",
              "image": { "@type": "ImageObject", "url": "https://modonty.com/categories/tech/og.jpg", "width": 1200, "height": 630 }
            }
          },
          {
            "@type": "ListItem",
            "position": 2,
            "item": {
              "@type": "Thing",
              "@id": "https://modonty.com/categories/design",
              "name": "تصميم",
              "description": "مقالات في التصميم وواجهات المستخدم",
              "url": "https://modonty.com/categories/design",
              "mainEntityOfPage": "https://modonty.com/categories/design"
            }
          }
        ]
      }
    }
  ]
}
```

**Implementation:** SOT: Category table; Settings for defaults only. `getCategories({ limit: 20 })` → ListItem per category (position, item = Thing or CollectionPage). Use Prisma field names: `slug`, `description`/`seoDescription`, `socialImage`, `socialImageAlt`, `canonicalUrl`, `seoTitle`, `parentId`. Include full coverage per Section 4a when Category model has data. Set `numberOfItems` = total category count. `dateModified` from `max(category.updatedAt)` or generation timestamp. Include site Organization address/geo when Settings have orgAddress*/orgGeo*.

**Senior SEO coverage vs official docs / big-company practice:**

- **Schema.org Thing:** 100% — name, url, description, @id, mainEntityOfPage, image, alternateName, broader.
- **Schema.org WebSite / CollectionPage / ItemList:** 100% — breadcrumb, primaryImageOfPage, mainEntity, dateModified.
- **Google (Breadcrumb, ItemList):** 100% — BreadcrumbList with position, name, item (URL); ItemList with numberOfItems.
- **Taxonomy/category list pages:** 100% — Thing or CollectionPage per category; alphabetical (ItemListOrderAscending).

**Overall simulated JSON-LD: 100%** — Matches Schema.org, Google, and Bing expectations for categories directory; aligns with big-company patterns.

---

## 7. Storage

- **Meta object** → `categoriesPageMetaTags`
- **@graph string** → `categoriesPageJsonLdStructuredData`
- **Last generated** → `categoriesPageJsonLdLastGenerated`
- **Validation report** → `categoriesPageJsonLdValidationReport`

---

## 8. References

- **Open Graph:** [ogp.me](https://ogp.me/) (og:image:alt, og:determiner, og:locale:alternate)
- **Twitter Cards:** [X Developer Docs – Cards](https://developer.x.com/en/docs/twitter-for-websites/cards/overview/markup) (twitter:site:id, twitter:creator:id)
- **Google:** [meta tags](https://developers.google.com/search/docs/crawling-indexing/special-tags) | [robots meta](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag) (max-snippet, max-image-preview) | [canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- **Bing:** [Robots meta tags](https://www.bing.com/webmasters/help/which-robots-metatags-does-bing-support-5198d240)
- **Schema.org:** [Organization](https://schema.org/Organization) | [ContactPoint](https://schema.org/ContactPoint) | [WebSite](https://schema.org/WebSite) | [CollectionPage](https://schema.org/CollectionPage) | [ItemList](https://schema.org/ItemList) | [Thing](https://schema.org/Thing) | [BreadcrumbList](https://schema.org/BreadcrumbList)
- **Validation:** [Validator](https://validator.schema.org/) | [Rich Results Test](https://search.google.com/test/rich-results)
