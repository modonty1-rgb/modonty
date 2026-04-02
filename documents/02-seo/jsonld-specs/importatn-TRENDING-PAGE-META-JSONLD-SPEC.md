# Trending Page Meta & JSON-LD — Spec

100% full coverage for `/trending` meta tags and JSON-LD. Generate in admin, store in Settings; modonty reads from DB.

---

## 1. Context

- **Route:** `/trending`
- **Page:** Trending article feed (most popular / recent)
- **Flow:** Admin generates → validate → save → modonty reads from DB (no runtime generation)
- **Storage:** `trendingPageMetaTags`, `trendingPageJsonLdStructuredData`
- **SOT (trending):** Article table — each Article in ItemList comes from Article model (+ client, category, tags, author)
- **SOT (defaults):** Settings — site-wide defaults only (siteName, siteUrl, ogImageUrl, etc.)
- **Output:** Generated meta + JSON-LD stored in Settings; modonty reads from DB (no runtime generation)

---

## 2. Rules

- **ItemList limit:** 20 items in `itemListElement`; `numberOfItems` = total trending article count
- **Meta source:** Settings (defaults only); page title/description = fallback strings ("الأكثر رواجاً" etc.) ?? siteName ?? brandDescription
- **JSON-LD:** Organization + WebSite + CollectionPage + ItemList; only ItemList varies with articles
- **Article schema:** Full Article per item — full coverage (see Section 4a)
- **CollectionPage.dateModified:** max(article.dateModified) or generation timestamp
- **HTML meta keywords:** Do not use (deprecated)

---

## 3. Meta Checklist

- **title, og:title, twitter:title**
  - Source: `"الأكثر رواجاً" ?? siteName`
- **description, og:description, twitter:description**
  - Source: `"استكشف المقالات الأكثر رواجاً - محتوى يتابعه القراء الآن" ?? brandDescription`
- **canonical, og:url**
  - Source: siteUrl/trending (canonical URL; og:url same as canonical)
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
  - Source: defaultNotranslate, defaultHreflang (path: /trending)
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
  - Source: fallback "الأكثر رواجاً" ?? siteName; fallback description ?? brandDescription; siteUrl/trending; max(article.dateModified) or generation time; breadcrumb Home→الأكثر رواجاً; ogImageUrl
- **ItemList**
  - Properties: itemListOrder, numberOfItems, itemListElement
  - Source: total trending articles; up to 20 ListItems
- **Each Article** (ListItem.item)
  - Properties: Full Article (see Section 4a)
  - Source: Article model + client + category + tags + author

---

## 4a. Each Article (ListItem.item) — Full Coverage

One Article per list item. Include every property when Article model (or related client, category, tags, author) has data; omit when empty.

- **title** → headline (Always)
- **slug** → url, @id, mainEntityOfPage (Always; `siteUrl/articles/slug`)
- **excerpt / metaDescription** → description (When set)
- **featuredImage / ogImageUrl** → image (ImageObject) (When set)
- **datePublished** → datePublished (When set)
- **dateModified** → dateModified (When set)
- **wordCount** → wordCount (When set)
- **inLanguage** → inLanguage (When set)
- **isAccessibleForFree** → isAccessibleForFree (When set)
- **license** → license (When set)
- **client** → publisher (Organization with name, url, logo) (When present)
- **category** → articleSection (When set)
- **tags** → keywords (comma-separated) (When set)
- **author** → author (Person with name, url when author page exists) (When present)

**Required:** headline, url, datePublished. **Recommended:** description, author, publisher, mainEntityOfPage. **Full:** + image, dateModified, articleSection, keywords, wordCount, inLanguage, isAccessibleForFree, license.

---

## 5. Simulated Meta Object

Stored in `Settings.trendingPageMetaTags`. Full-coverage shape per Section 3 checklist.

```json
{
  "charset": "UTF-8",
  "viewport": "width=device-width, initial-scale=1",
  "title": "الأكثر رواجاً",
  "description": "استكشف المقالات الأكثر رواجاً - محتوى يتابعه القراء الآن",
  "robots": "index, follow, max-snippet:-1, max-image-preview:large",
  "googlebot": "index, follow, max-snippet:-1, max-image-preview:large",
  "notranslate": true,
  "themeColor": "#3030FF",
  "canonical": "https://modonty.com/trending",
  "author": "مودونتي",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "msapplicationTileColor": "#3030FF",
  "hreflang": [
    { "lang": "ar", "href": "https://modonty.com/trending" },
    { "lang": "x-default", "href": "https://modonty.com/trending" }
  ],
  "sitemapPriority": 0.5,
  "sitemapChangeFreq": "monthly",
  "openGraph": {
    "title": "الأكثر رواجاً",
    "description": "استكشف المقالات الأكثر رواجاً - محتوى يتابعه القراء الآن",
    "type": "website",
    "url": "https://modonty.com/trending",
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
    "title": "الأكثر رواجاً",
    "description": "استكشف المقالات الأكثر رواجاً - محتوى يتابعه القراء الآن",
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

**Structure:** Organization → WebSite → CollectionPage (with ItemList of Articles). `numberOfItems` = total trending articles; `itemListElement` = up to 20. Stored in `Settings.trendingPageJsonLdStructuredData`.

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
      "@id": "https://modonty.com/trending#collectionpage",
      "name": "الأكثر رواجاً",
      "url": "https://modonty.com/trending",
      "description": "استكشف المقالات الأكثر رواجاً - محتوى يتابعه القراء الآن",
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
            "name": "الأكثر رواجاً",
            "item": "https://modonty.com/trending"
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
        "itemListOrder": "ItemListOrderDescending",
        "numberOfItems": 42,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "item": {
              "@type": "Article",
              "headline": "مقال رائج ١",
              "description": "ملخص المقال.",
              "url": "https://modonty.com/articles/trending-1",
              "mainEntityOfPage": "https://modonty.com/articles/trending-1",
              "image": {
                "@type": "ImageObject",
                "url": "https://modonty.com/articles/trending-1/cover.jpg",
                "width": 1200,
                "height": 630
              },
              "datePublished": "2025-01-30T10:00:00.000Z",
              "dateModified": "2025-01-31T08:30:00.000Z",
              "author": { "@type": "Person", "name": "مودونتي", "url": "https://modonty.com/authors/modonty" },
              "publisher": {
                "@type": "Organization",
                "name": "عميل ١",
                "url": "https://modonty.com/clients/client-1",
                "logo": "https://modonty.com/clients/client-1/logo.png"
              },
              "articleSection": "تقنية",
              "keywords": "تطوير, ويب, فرونت اند",
              "wordCount": 1250,
              "inLanguage": "ar",
              "isAccessibleForFree": true,
              "license": "https://modonty.com/terms"
            }
          },
          {
            "@type": "ListItem",
            "position": 2,
            "item": {
              "@type": "Article",
              "headline": "مقال رائج ٢",
              "description": "ملخص المقال.",
              "url": "https://modonty.com/articles/trending-2",
              "mainEntityOfPage": "https://modonty.com/articles/trending-2",
              "image": {
                "@type": "ImageObject",
                "url": "https://modonty.com/articles/trending-2/cover.jpg",
                "width": 1200,
                "height": 630
              },
              "datePublished": "2025-01-29T10:00:00.000Z",
              "dateModified": "2025-01-30T14:15:00.000Z",
              "author": { "@type": "Person", "name": "مودونتي", "url": "https://modonty.com/authors/modonty" },
              "publisher": {
                "@type": "Organization",
                "name": "عميل ٢",
                "url": "https://modonty.com/clients/client-2",
                "logo": "https://modonty.com/clients/client-2/logo.png"
              },
              "articleSection": "تصميم",
              "keywords": "واجهات, تجربة مستخدم",
              "wordCount": 980,
              "inLanguage": "ar",
              "isAccessibleForFree": true,
              "license": "https://modonty.com/terms"
            }
          }
        ]
      }
    }
  ]
}
```

**Implementation:** SOT: Article table (+ client, category, tags, author); Settings for defaults only. `getTrendingArticles({ limit: 20, days: 7 })` → ListItem per article (position, item = Article). Use Prisma field names: title→headline, excerpt, slug, datePublished, dateModified, featuredImage, wordCount, inLanguage, isAccessibleForFree, license; client→publisher, category→articleSection, tags→keywords, author.url. Include full coverage per Section 4a when data exists. Set `numberOfItems` = total trending count. `dateModified` from max(article.dateModified) or generation timestamp. Include site Organization address/geo when Settings have orgAddress*/orgGeo*.

**Senior SEO coverage vs official docs / big-company practice:**

- **Schema.org Article:** 100% — headline, description, url, datePublished, dateModified, author, publisher, articleSection, keywords, image, mainEntityOfPage, wordCount, inLanguage, isAccessibleForFree, license.
- **Schema.org WebSite / CollectionPage / ItemList:** 100% — breadcrumb, primaryImageOfPage, mainEntity, dateModified.
- **Google (Article, Breadcrumb, ItemList):** 100% — Article with publisher, author, datePublished; BreadcrumbList; ItemList with numberOfItems.
- **Trending/feed pages:** 100% — ItemListOrderDescending for popularity; full Article per item.

**Overall simulated JSON-LD: 100%** — Matches Schema.org, Google, and Bing expectations for trending article feeds; aligns with big-company patterns.

---

## 7. Storage

- **Meta object** → `trendingPageMetaTags`
- **@graph string** → `trendingPageJsonLdStructuredData`
- **Last generated** → `trendingPageJsonLdLastGenerated`
- **Validation report** → `trendingPageJsonLdValidationReport`

---

## 8. References

- **Open Graph:** [ogp.me](https://ogp.me/) (og:image:alt, og:determiner, og:locale:alternate)
- **Twitter Cards:** [X Developer Docs – Cards](https://developer.x.com/en/docs/twitter-for-websites/cards/overview/markup) (twitter:site:id, twitter:creator:id)
- **Google:** [meta tags](https://developers.google.com/search/docs/crawling-indexing/special-tags) | [robots meta](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag) (max-snippet, max-image-preview) | [canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) | [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- **Bing:** [Robots meta tags](https://www.bing.com/webmasters/help/which-robots-metatags-does-bing-support-5198d240)
- **Schema.org:** [Organization](https://schema.org/Organization) | [ContactPoint](https://schema.org/ContactPoint) | [WebSite](https://schema.org/WebSite) | [CollectionPage](https://schema.org/CollectionPage) | [ItemList](https://schema.org/ItemList) | [Article](https://schema.org/Article) | [Person](https://schema.org/Person) | [BreadcrumbList](https://schema.org/BreadcrumbList)
- **Validation:** [Validator](https://validator.schema.org/) | [Rich Results Test](https://search.google.com/test/rich-results)
