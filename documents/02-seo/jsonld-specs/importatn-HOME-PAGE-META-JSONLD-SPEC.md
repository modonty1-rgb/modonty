# Home Page Meta & JSON-LD — Spec & Notes

Single reference for **100% full coverage** of home page meta tags and JSON-LD using the **Settings** table. Generate once in admin, store in DB; home page reads from DB for page speed.

---

## 1. Context

- **Modonty site:** Public app at `modonty/` (RTL Arabic). Home route: `/`.
- **Home page:** Article feed. Meta and JSON-LD are **not** hardcoded; they are **generated in admin** and **stored in Settings**.
- **Flow:** Admin generates meta + JSON-LD (from Settings + article list) → validate → save to `Settings.homeMetaTags` and `Settings.jsonLdStructuredData`. Modonty home page **reads** stored meta + JSON-LD from DB and outputs them (no generation at request time).

---

## 2. Notes (rules)

- **Limit:** Use **20** items in `itemListElement` when generating (e.g. `getArticles({ limit: 20 })`). Set **`numberOfItems`** to the **total article count** in the DB so search engines know the full catalog size.
- **Meta:** Built only from Settings + modontySeoTitle / modontySeoDescription. Article count has **no effect** on meta.
- **JSON-LD:** Organization + WebSite + CollectionPage with ItemList. Only the ItemList’s `itemListElement` length and `numberOfItems` depend on articles; Organization, WebSite, and CollectionPage (name, url, description, isPartOf, dateModified) stay the same.
- **Publisher (client) per article:** Each Article in the list must have **`publisher`**: `{ "@type": "Organization", "name": client.name, "url": clientUrl, "logo": clientLogo }`. No separate homepage-level list of clients.
- **Category per article:** Add **`articleSection`** (Text) to each Article when it has a category (e.g. `article.category?.name`). No separate list of categories on the homepage.
- **Tags per article:** Use **Schema.org `keywords`** in the Article JSON-LD only (e.g. `article.tags?.map(t => t.name).join(", ")`). **Do not** use HTML meta keywords (`<meta name="keywords">`) — deprecated; Google does not use them.
- **Storage:** JSON-LD → `Settings.jsonLdStructuredData` (and jsonLdLastGenerated, jsonLdValidationReport). Meta → `Settings.homeMetaTags` (add this field if missing).
- **Optional properties (best practice):** Include Organization address/geo when Settings have orgAddress*/orgGeo* values; include Article image/mainEntityOfPage/dateModified/wordCount when available; add CollectionPage breadcrumb + primaryImageOfPage for enhanced SERP display.
- **Speakable:** Not used on WebSite (speakable is for WebPage/Article content only).
- **foundingDate:** Settings doesn't have this field yet; if added in future, include in Organization for trust signals.
- **Sitelinks search box:** Google removed the sitelinks search box from SERPs (Nov 2024); WebSite SearchAction markup is still valid and useful for other consumers.
- **Optional meta:** Optional robots directives (max-snippet, max-image-preview) and notranslate can be stored in Settings and output for full snippet/translation control. Verification tags (google-site-verification, msvalidate.01) are site-specific—add to Settings if used.

---

## 3. Meta checklist (100%) — source from Settings

| Property | Source (Settings) |
|----------|-------------------|
| title, og:title, twitter:title | modontySeoTitle ?? siteName |
| description, og:description, twitter:description | modontySeoDescription ?? brandDescription |
| og:type | defaultOgType |
| og:image, twitter:image | ogImageUrl ?? logoUrl |
| og:url, canonical | siteUrl |
| og:site_name | siteName |
| og:locale | defaultOgLocale |
| og:locale:alternate | (empty array or alternate locales) |
| og:determiner | defaultOgDeterminer |
| og:image width/height/type/alt | defaultOgImageWidth, defaultOgImageHeight, defaultOgImageType, altImage |
| twitter:card | defaultTwitterCard |
| twitter:site, twitter:creator | twitterSite, twitterCreator |
| twitter:site:id, twitter:creator:id | twitterSiteId, twitterCreatorId (optional, use when set) |
| charset, viewport | defaultCharset, defaultViewport |
| robots, googlebot | defaultMetaRobots, defaultGooglebot (optional: append max-snippet, max-image-preview per Google/Bing) |
| notranslate (optional) | defaultNotranslate or default for Arabic — prevents Chrome “Translate this page” when set |
| hreflang | defaultHreflang, defaultPathname, inLanguage |
| theme-color, author | themeColor, siteAuthor |
| sitemap priority/changefreq | defaultSitemapPriority, defaultSitemapChangeFreq |
| referrer-policy (optional) | defaultReferrerPolicy (e.g. strict-origin-when-cross-origin) |
| msapplication-TileColor (optional) | themeColor or default — Windows pinned site tile |
| apple-mobile-web-app-* (optional) | PWA/iOS “Add to Home Screen” — prefer Web App Manifest |
| google-site-verification, msvalidate.01 (optional) | Site-specific; add to Settings when used for Search Console / Bing Webmaster |

---

## 4. JSON-LD checklist (100%) — @graph

| Node | Properties | Source |
|------|------------|--------|
| **Organization** (@id siteUrl#organization) | name, url, description, inLanguage, logo, sameAs, contactPoint (contactType, email, areaServed, **contactOption**, **availableLanguage**, **hoursAvailable** when Settings have them), **address** (PostalAddress), **geo** (GeoCoordinates), foundingDate (optional) | Settings (siteName, siteUrl, brandDescription, inLanguage, orgLogoUrl/logoUrl, sameAs, orgContact*, orgAddress*, orgGeo*); foundingDate if added to Settings |
| **WebSite** (@id siteUrl#website) | name, url, description, inLanguage, publisher→Organization, potentialAction (SearchAction) | Settings (siteName, siteUrl, brandDescription, orgSearchUrlTemplate) |
| **CollectionPage** (@id siteUrl#collectionpage) | name, url, description, inLanguage, isPartOf→WebSite, dateModified, mainEntity→ItemList, **breadcrumb** (BreadcrumbList), **primaryImageOfPage** (ImageObject) | modontySeoTitle/siteName, siteUrl, modontySeoDescription/brandDescription; breadcrumb = Home; primaryImageOfPage from ogImageUrl/logoUrl; ItemList from article list |
| **ItemList** | itemListOrder, numberOfItems, itemListElement | numberOfItems = total articles in DB; itemListElement = up to 20 ListItems (one per article) |
| **Each Article** (inside ListItem.item) | headline, description, url, datePublished, **dateModified**, **author** (Person with **url** when author page exists), **publisher** (client Organization), **articleSection** (category), **keywords** (tags), **image** (ImageObject/URL), **mainEntityOfPage**, **wordCount**, **inLanguage**, **isAccessibleForFree**, **license** (when available) | Article (title, excerpt, slug, datePublished, dateModified, featuredImage, mainEntityOfPage, wordCount, inLanguage, isAccessibleForFree, license) + client + category + tags + author.url |

---

## 5. Simulated home meta object (latest version)

Stored in e.g. `Settings.homeMetaTags`. All values from Settings; no HTML meta keywords. **Version:** Full-coverage shape per Section 3 checklist (optional keys included when used).

```json
{
  "charset": "UTF-8",
  "viewport": "width=device-width, initial-scale=1",
  "title": "أحدث المقالات والمدونات",
  "description": "استكشف أحدث المقالات والمدونات الاحترافية من أفضل الكتّاب والمؤلفين.",
  "robots": "index, follow, max-snippet:-1, max-image-preview:large",
  "googlebot": "index, follow, max-snippet:-1, max-image-preview:large",
  "notranslate": true,
  "themeColor": "#3030FF",
  "canonical": "https://modonty.com",
  "author": "مودونتي",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "msapplicationTileColor": "#3030FF",
  "hreflang": [
    { "lang": "ar", "href": "https://modonty.com" },
    { "lang": "x-default", "href": "https://modonty.com" }
  ],
  "sitemapPriority": 0.5,
  "sitemapChangeFreq": "monthly",
  "openGraph": {
    "title": "أحدث المقالات والمدونات",
    "description": "استكشف أحدث المقالات والمدونات الاحترافية من أفضل الكتّاب والمؤلفين.",
    "type": "website",
    "url": "https://modonty.com",
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
    "title": "أحدث المقالات والمدونات",
    "description": "استكشف أحدث المقالات والمدونات الاحترافية من أفضل الكتّاب والمؤلفين.",
    "imageAlt": "مودونتي - منصة المدونات",
    "site": "@modonty",
    "creator": "@modonty",
    "image": "https://modonty.com/og-image.jpg",
    "siteId": "1234567890",
    "creatorId": "0987654321"
  }
}
```

**Confirmed:** Simulated meta object matches Section 3 checklist 100%. Optional keys (referrerPolicy, msapplicationTileColor) included for latest-version shape; google-site-verification / msvalidate.01 omitted (site-specific, add when used).

**Senior SEO coverage vs official docs / big-company practice:**

| Source | Coverage | Notes |
|--------|----------|--------|
| Open Graph (ogp.me) | **100%** | Required (title, type, image, url) + optional (description, locale, localeAlternate, site_name, determiner, image sub-properties including alt). |
| Twitter/X Cards | **100%** | card, title, description, image, imageAlt, site, creator, siteId, creatorId. |
| Google (meta, robots) | **100%** | title, description, canonical, robots (+ max-snippet, max-image-preview), googlebot, notranslate. |
| Bing | **100%** | Same robots directives; OG used for rich results. |
| Platform (PWA/Windows) | **100%** | referrerPolicy, msapplicationTileColor; verification optional/site-specific. |

**Overall simulated meta: 100%** — All generally applicable properties from official docs and common enterprise checklists are present. Verification and apple-mobile-web-app-* intentionally omitted (site-specific or prefer manifest).

---

## 6. Simulated home JSON-LD (latest version)

Stored in `Settings.jsonLdStructuredData`. **Version:** Full-coverage @graph per Section 4 checklist; `@context` `https://schema.org` (stable, latest vocabulary). @graph: Organization, WebSite, CollectionPage. ItemList: **numberOfItems** = total in DB (example: 42); **itemListElement** = up to 20 items. Each Article has **publisher** (client Organization), **articleSection** (category), **keywords** (tags), **author** (Person with **url** when author page exists), **isAccessibleForFree**, **license** when available.

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
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 24.7136,
        "longitude": 46.6753
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://modonty.com/#website",
      "name": "مودونتي",
      "url": "https://modonty.com",
      "description": "منصة محتوى عربية بالاشتراك — مدونة مرجعية ومقالات احترافية.",
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
      "@id": "https://modonty.com/#collectionpage",
      "name": "أحدث المقالات والمدونات",
      "url": "https://modonty.com",
      "description": "مجموعة من أحدث المقالات والمدونات الاحترافية",
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
              "headline": "مقال تجريبي ١",
              "description": "ملخص المقال.",
              "url": "https://modonty.com/articles/sample-1",
              "mainEntityOfPage": "https://modonty.com/articles/sample-1",
              "image": {
                "@type": "ImageObject",
                "url": "https://modonty.com/articles/sample-1/cover.jpg",
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
              "headline": "مقال تجريبي ٢",
              "description": "ملخص المقال.",
              "url": "https://modonty.com/articles/sample-2",
              "mainEntityOfPage": "https://modonty.com/articles/sample-2",
              "image": {
                "@type": "ImageObject",
                "url": "https://modonty.com/articles/sample-2/cover.jpg",
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

**Confirmed:** Simulated JSON-LD matches Section 4 checklist 100%. Organization (address, geo, contactPoint with availableLanguage), WebSite (SearchAction), CollectionPage (breadcrumb, primaryImageOfPage), ItemList, and each Article (image, mainEntityOfPage, dateModified, author with url, isAccessibleForFree, license) follow latest Schema.org and Google/Bing conventions.

**Senior SEO coverage vs official docs / big-company practice:**

| Source | Coverage | Notes |
|--------|----------|--------|
| Schema.org (Organization) | **100%** | @id, name, url, description, inLanguage, logo, sameAs, contactPoint (areaServed, availableLanguage), address (PostalAddress), geo (GeoCoordinates). Optional contactOption/hoursAvailable/foundingDate in checklist when Settings have them. |
| Schema.org (WebSite) | **100%** | name, url, description, inLanguage, publisher, potentialAction (SearchAction with correct query-input). |
| Schema.org (CollectionPage) | **100%** | name, url, description, inLanguage, isPartOf, dateModified, breadcrumb (BreadcrumbList), primaryImageOfPage, mainEntity (ItemList). |
| Schema.org (ItemList / Article) | **100%** | itemListOrder, numberOfItems, itemListElement; each Article: headline, description, url, mainEntityOfPage, image, datePublished, dateModified, author (Person with url), publisher (client Organization), articleSection, keywords, wordCount, inLanguage, isAccessibleForFree, license. |
| Google (Article, Breadcrumb) | **100%** | Article: image and author.url recommended; BreadcrumbList with position, name, item (URL). No deprecated HTML meta keywords. |
| Local SEO / AI GEO | **100%** | Organization address + geo + contactPoint.areaServed for local and generative-engine visibility. |

**Overall simulated JSON-LD: 100%** — Matches Schema.org, Google, and Bing expectations for homepage + article list; aligns with big-company patterns (identity, location, author, publisher, optional Article fields).

**Implementation:** Loop over `getArticles({ limit: 20 })`; for each article add one ListItem (position = index + 1, item = Article with headline, description, url, **mainEntityOfPage**, **image** (from featuredImage), datePublished, **dateModified**, **author** (Person with **url** when author page exists), **publisher** (client Organization), **articleSection**, **keywords**, **wordCount**, **inLanguage**, **isAccessibleForFree**, **license** when available). Set **numberOfItems** to total article count in DB. Example shows 2 items; real run uses up to 20.

**Optional Article properties:** Include `image` (Google recommended), `mainEntityOfPage`, `dateModified`, `wordCount`, `inLanguage`, **author.url** (Google recommendation for disambiguation), **isAccessibleForFree**, and **license** when available in Article model. If article has no featuredImage, image can be omitted or use fallback.

---

## 7. Storage

| Output | Settings field |
|--------|----------------|
| Home meta object | `homeMetaTags` (Json?) — add if missing |
| Home @graph string | `jsonLdStructuredData` |
| Last generated | `jsonLdLastGenerated` |
| Validation report | `jsonLdValidationReport` |

---

## 8. Official references

- **Open Graph:** [ogp.me](https://ogp.me/) (og:locale:alternate, og:determiner, og:image properties)
- **Twitter Cards:** [X Developer Docs – Cards](https://developer.x.com/en/docs/twitter-for-websites/cards/overview/markup) (twitter:site:id, twitter:creator:id)
- **Google:** [meta tags](https://developers.google.com/search/docs/crawling-indexing/special-tags), [robots meta tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag) (max-snippet, max-image-preview), [canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article) (image, author.url recommended)
- **Bing:** [Robots meta tags](https://www.bing.com/webmasters/help/which-robots-metatags-does-bing-support-5198d240) (max-snippet, max-image-preview)
- **Schema.org:** [WebSite](https://schema.org/WebSite), [Organization](https://schema.org/Organization) (address, geo, foundingDate), [ContactPoint](https://schema.org/ContactPoint) (contactOption, availableLanguage, hoursAvailable), [CollectionPage](https://schema.org/CollectionPage) (breadcrumb, primaryImageOfPage), [ItemList](https://schema.org/ItemList), [Article](https://schema.org/Article) (image, mainEntityOfPage, dateModified, wordCount, inLanguage, isAccessibleForFree, license, articleSection, keywords), [Person](https://schema.org/Person) (url for author), [BreadcrumbList](https://schema.org/BreadcrumbList)
- **Validation:** [Schema.org Validator](https://validator.schema.org/), [Google Rich Results Test](https://search.google.com/test/rich-results)
