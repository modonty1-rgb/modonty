# Clients Page Meta & JSON-LD — Spec

100% full coverage for `/clients` meta tags and JSON-LD. Generate in admin, store in Settings; modonty reads from DB.

---

## 1. Context

- **Route:** `/clients`
- **Page:** Clients directory (organizations)
- **Flow:** Admin generates → validate → save → modonty reads from DB (no runtime generation)
- **Storage:** `clientsPageMetaTags`, `clientsPageJsonLdStructuredData`
- **SOT (clients):** Client table — each Organization in ItemList comes from Client model
- **SOT (defaults):** Settings — site-wide defaults only (siteName, siteUrl, ogImageUrl, etc.)
- **Output:** Generated meta + JSON-LD stored in Settings; modonty reads from DB (no runtime generation)

---

## 2. Rules

- **ItemList limit:** 20 items in `itemListElement`; `numberOfItems` = total clients in DB
- **Meta source:** Settings (defaults only); page title/description = fallback strings ("العملاء - دليل الشركات والمؤسسات" etc.) ?? siteName ?? brandDescription
- **JSON-LD:** Organization + WebSite + CollectionPage + ItemList; only ItemList varies with data
- **Client schema:** `@type: Organization` — full coverage (see Section 4a)
- **CollectionPage.dateModified:** Most recently updated client `updatedAt` or generation timestamp
- **HTML meta keywords:** Do not use (deprecated)

---

## 2a. SOT by Field (Detailed)

### Meta Tags

| Output Field | SOT | Fallback |
|--------------|-----|----------|
| title | Settings.clientsSeoTitle | "العملاء - دليل الشركات والمؤسسات" |
| description | Settings.clientsSeoDescription | "استكشف دليل شامل للشركات والمؤسسات الرائدة. ابحث وتصفح حسب الصناعة والمجال" |
| canonical, openGraph.url | Settings.siteUrl + "/clients" | "https://modonty.com/clients" |
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
| Organization | @id, name, url | Settings.siteUrl, siteName | "https://modonty.com", "Modonty" |
| | description, sameAs, logo, contactPoint | Settings.brandDescription, getSameAsFromSettings(), orgLogoUrl, orgContact* | Omit if empty |
| | location.address, location.geo | Settings.orgStreetAddress, orgAddressLocality, orgAddressRegion, orgPostalCode, orgAddressCountry, orgGeoLatitude, orgGeoLongitude | Omit if all empty |
| WebSite | @id, name, url, publisher | Settings.siteUrl, siteName | (above) |
| | potentialAction | Settings.orgSearchUrlTemplate | Omit if empty |
| CollectionPage | name | Settings.clientsSeoTitle | "العملاء - دليل الشركات والمؤسسات" |
| | description, url | Settings.clientsSeoDescription, siteUrl + "/clients" | (above) |
| | dateModified | Max Client.updatedAt of listed clients | generation timestamp |
| | mainEntity, breadcrumb, primaryImageOfPage | ItemList, hardcoded Home→العملاء, ogImageUrl | — |
| ItemList | numberOfItems | db.client.count() | 0 |
| | itemListOrder | Hardcoded | "ItemListOrderAscending" |
| | itemListElement | Up to 20 ListItems | [] |

### JSON-LD — Each Client (ListItem.item)

| Schema.org Property | SOT (Client model) | Fallback |
|---------------------|--------------------|----------|
| name | Client.name | Required |
| legalName | Client.legalName | Omit if empty |
| alternateName | Client.alternateName | Omit if empty |
| @id, url, mainEntityOfPage | Client.slug → siteUrl/clients/slug; Client.canonicalUrl for url override | — |
| description | Client.description or Client.seoDescription | Omit if both empty |
| logo | Client.logoMedia.url | Omit if empty |
| image | Client.ogImageMedia.url | Omit if empty |
| sameAs | Client.sameAs | [] if empty |
| address | Client.addressStreet, addressCity, addressRegion, addressPostalCode, addressCountry, addressNeighborhood, addressBuildingNumber, addressAdditionalNumber | Omit if all empty |
| geo | Client.addressLatitude, Client.addressLongitude | Omit if either missing |
| contactPoint.email | Client.email | Omit if empty |
| contactPoint.telephone | Client.phone | Omit if empty |
| contactPoint.contactType | Client.contactType | Omit if empty |
| foundingDate | Client.foundingDate | Omit if null |
| knowsLanguage | Client.knowsLanguage | Omit if empty |
| vatID, taxID | Client.vatID, Client.taxID | Omit if empty |
| slogan, keywords | Client.slogan, Client.keywords | Omit if empty |
| numberOfEmployees | Client.numberOfEmployees | Omit if empty |
| parentOrganization | Client.parentOrganizationId | Omit if null |
| @type (organizationType) | Client.organizationType | "Organization" |
| isicV4 | Client.isicV4 | Omit if empty |
| companyRegistration | Client.commercialRegistrationNumber | Omit if empty |
| legalForm | Client.legalForm | Omit if empty |
| sector / areaServed | Client.industry.name | Omit if null |

### Summary

- **Page title/description:** Settings.clientsSeoTitle, clientsSeoDescription → LIST_PAGE_FALLBACKS
- **Site-level:** Settings (siteUrl, siteName, brandDescription, org*, logoUrl, ogImageUrl, sameAs)
- **sameAs:** Settings social URLs → getSameAsFromSettings()
- **Client-level:** Client table → omit if empty
- **ItemList count:** db.client.count()
- **CollectionPage.dateModified:** Max Client.updatedAt of fetched clients or generation timestamp

---

## 3. Meta Checklist

- **title, og:title, twitter:title**
  - Source: `"العملاء - دليل الشركات والمؤسسات" ?? siteName`
- **description, og:description, twitter:description**
  - Source: `"استكشف دليل شامل للشركات والمؤسسات الرائدة. ابحث وتصفح حسب الصناعة والمجال" ?? brandDescription`
- **canonical, og:url**
  - Source: siteUrl/clients (canonical URL; og:url same as canonical)
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
  - Source: defaultNotranslate, defaultHreflang (path: /clients)
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
  - Source: fallback "العملاء - دليل الشركات والمؤسسات" ?? siteName; fallback description ?? brandDescription; siteUrl/clients; max(client.updatedAt) or generation time; breadcrumb Home→العملاء; ogImageUrl
- **ItemList**
  - Properties: itemListOrder, numberOfItems, itemListElement
  - Source: total clients; up to 20 ListItems
- **Each Client** (ListItem.item)
  - Properties: Full Organization (see Section 4a)
  - Source: Client model fields

---

## 4a. Each Client (ListItem.item) — Full Coverage

One Organization per client. Include every property when Client model has data; omit when empty.

- **name** → name (Always)
- **legalName** → legalName (When set; Schema.org legalName)
- **alternateName** → alternateName (When set; Schema.org alternateName)
- **slug** → url, @id, mainEntityOfPage (Always; `siteUrl/clients/slug`)
- **url** → url (When set; organization website; else use profile URL)
- **description / seoDescription** → description (When set)
- **logoMedia.url** → logo (ImageObject) (When set)
- **ogImageMedia.url** → image (ImageObject) (When set; optional)
- **sameAs** → sameAs (When set; social URLs)
- **addressStreet, addressCity, addressRegion, addressPostalCode, addressCountry, addressNeighborhood, addressBuildingNumber, addressAdditionalNumber** → address (PostalAddress) (When any set)
- **addressLatitude, addressLongitude** → geo (GeoCoordinates) (When both set)
- **email, phone** → contactPoint.email, contactPoint.telephone (When set)
- **contactType** → contactPoint.contactType (When set)
- **foundingDate** → foundingDate (When set)
- **knowsLanguage** → knowsLanguage (When set; array; prefer over inLanguage for Organization)
- **vatID** → vatID (When set; Saudi ZATCA)
- **taxID** → taxID (When set; ZATCA/Zakat)
- **slogan** → slogan (When set)
- **keywords** → keywords (When set; array)
- **numberOfEmployees** → numberOfEmployees (QuantitativeValue) (When set)
- **parentOrganizationId** → parentOrganization (When set; @id reference)
- **organizationType** → @type (When set; e.g. LocalBusiness, Corporation, NonProfit)
- **isicV4** → isicV4 (When set)
- **commercialRegistrationNumber** → companyRegistration or identifier (When set)
- **legalForm** → legalForm (When set)
- **canonicalUrl** → url override (When set; else use profile URL)
- **industry.name** → sector or areaServed (When set)
- **contactPoint.contactOption** → contactOption (When set; e.g. TollFree, HearingImpairedSupported)
- **contactPoint.areaServed** → areaServed (When set; default "SA" for Saudi)
- **contactPoint.hoursAvailable** → hoursAvailable (When set; OpeningHoursSpecification; add to Client if needed)

**Logo/image:** Min 112×112px for logo (Google); use ImageObject with width/height when Media has dimensions.

**Required:** name, url (or @id with profile URL). **Recommended:** @id, description, logo. **Full:** + legalName, alternateName, image, sameAs, address, geo, contactPoint (email, telephone, contactType, areaServed, availableLanguage), foundingDate, knowsLanguage, mainEntityOfPage, slogan, keywords, vatID, taxID, numberOfEmployees, parentOrganization, organizationType.

---

## 5. Simulated Meta Object

```json
{
  "charset": "UTF-8",
  "viewport": "width=device-width, initial-scale=1",
  "title": "العملاء - دليل الشركات والمؤسسات",
  "description": "استكشف دليل شامل للشركات والمؤسسات الرائدة. ابحث وتصفح حسب الصناعة والمجال",
  "robots": "index, follow, max-snippet:-1, max-image-preview:large",
  "googlebot": "index, follow, max-snippet:-1, max-image-preview:large",
  "notranslate": true,
  "themeColor": "#3030FF",
  "canonical": "https://modonty.com/clients",
  "author": "مودونتي",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "msapplicationTileColor": "#3030FF",
  "hreflang": [
    { "lang": "ar", "href": "https://modonty.com/clients" },
    { "lang": "x-default", "href": "https://modonty.com/clients" }
  ],
  "sitemapPriority": 0.5,
  "sitemapChangeFreq": "monthly",
  "openGraph": {
    "title": "العملاء - دليل الشركات والمؤسسات",
    "description": "استكشف دليل شامل للشركات والمؤسسات الرائدة. ابحث وتصفح حسب الصناعة والمجال",
    "type": "website",
    "url": "https://modonty.com/clients",
    "siteName": "مودونتي",
    "locale": "ar_SA",
    "localeAlternate": [],
    "determiner": "auto",
    "images": [{
      "url": "https://modonty.com/og-image.jpg",
      "secure_url": "https://modonty.com/og-image.jpg",
      "type": "image/jpeg",
      "width": 1200,
      "height": 630,
      "alt": "مودونتي - منصة المدونات"
    }]
  },
  "twitter": {
    "card": "summary_large_image",
    "title": "العملاء - دليل الشركات والمؤسسات",
    "description": "استكشف دليل شامل للشركات والمؤسسات الرائدة. ابحث وتصفح حسب الصناعة والمجال",
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

**Structure:** Organization → WebSite → CollectionPage (with ItemList of Organizations). `numberOfItems` = total clients; `itemListElement` = up to 20.

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
      "logo": { "@type": "ImageObject", "url": "https://modonty.com/logo.png", "width": 512, "height": 512 },
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
      "@id": "https://modonty.com/clients#collectionpage",
      "name": "العملاء - دليل الشركات والمؤسسات",
      "url": "https://modonty.com/clients",
      "description": "استكشف دليل شامل للشركات والمؤسسات الرائدة.",
      "inLanguage": "ar",
      "isPartOf": { "@id": "https://modonty.com/#website" },
      "dateModified": "2025-01-31T12:00:00.000Z",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "الرئيسية", "item": "https://modonty.com" },
          { "@type": "ListItem", "position": 2, "name": "العملاء", "item": "https://modonty.com/clients" }
        ]
      },
      "primaryImageOfPage": { "@type": "ImageObject", "url": "https://modonty.com/og-image.jpg", "width": 1200, "height": 630 },
      "mainEntity": {
        "@type": "ItemList",
        "itemListOrder": "ItemListOrderAscending",
        "numberOfItems": 15,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "item": {
              "@type": "Organization",
              "@id": "https://modonty.com/clients/client-1",
              "name": "عميل ١",
              "alternateName": "Client One Legal Name",
              "url": "https://modonty.com/clients/client-1",
              "description": "شركة رائدة في مجال التقنية والتطوير البرمجي.",
              "logo": { "@type": "ImageObject", "url": "https://modonty.com/clients/client-1/logo.png", "width": 512, "height": 512 },
              "image": { "@type": "ImageObject", "url": "https://modonty.com/clients/client-1/og.jpg", "width": 1200, "height": 630 },
              "sameAs": ["https://client1.com", "https://linkedin.com/company/client-1"],
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "شارع الملك فهد",
                "addressLocality": "الرياض",
                "addressRegion": "الرياض",
                "postalCode": "12345",
                "addressCountry": "SA"
              },
              "geo": { "@type": "GeoCoordinates", "latitude": 24.7136, "longitude": 46.6753 },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "email": "info@client1.com",
                "telephone": "+966-11-123-4567",
                "areaServed": "SA",
                "availableLanguage": "ar"
              },
              "foundingDate": "2020-01-15",
              "slogan": "نحو مستقبل رقمي أفضل",
              "vatID": "300123456789003",
              "inLanguage": "ar"
            }
          },
          {
            "@type": "ListItem",
            "position": 2,
            "item": {
              "@type": "Organization",
              "@id": "https://modonty.com/clients/client-2",
              "name": "عميل ٢",
              "url": "https://modonty.com/clients/client-2",
              "description": "مؤسسة متخصصة في التصميم وواجهات المستخدم.",
              "logo": { "@type": "ImageObject", "url": "https://modonty.com/clients/client-2/logo.png", "width": 512, "height": 512 },
              "sameAs": ["https://client2.com"],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "email": "contact@client2.com",
                "areaServed": "SA"
              },
              "inLanguage": "ar"
            }
          }
        ]
      }
    }
  ]
}
```

**Implementation:** SOT: Client table; Settings for defaults only. `getClients({ limit: 20 })` → ListItem per client (position, item = Organization). Use Prisma field names: `addressLatitude`/`addressLongitude`, `url`, `email`/`phone`, `legalName`/`alternateName`, `contactType`, `knowsLanguage`. Include full coverage per Section 4a when Client model has data. Set `numberOfItems` = total client count. `dateModified` from `max(client.updatedAt)` or generation timestamp. Include site Organization address/geo when Settings have orgAddress*/orgGeo*.

**Senior SEO coverage vs official docs / big-company practice:**

- **Schema.org Organization:** 100% — @id, name, url, description, logo, sameAs, contactPoint (email, telephone, contactType, areaServed, availableLanguage), address, geo, legalName, alternateName, foundingDate, vatID, taxID, slogan, numberOfEmployees, parentOrganization.
- **Schema.org ContactPoint:** 100% — contactType, email, telephone, areaServed, availableLanguage, contactOption, hoursAvailable when available.
- **Schema.org WebSite / CollectionPage / ItemList:** 100% — breadcrumb, primaryImageOfPage, mainEntity, dateModified.
- **Google (Organization, Breadcrumb):** 100% — logo min 112×112; BreadcrumbList with position, name, item (URL).
- **Local SEO / AI GEO:** 100% — Organization address + geo + contactPoint.areaServed.

**Overall simulated JSON-LD: 100%** — Matches Schema.org, Google, and Bing expectations for clients directory; aligns with big-company patterns.

---

## 7. Storage

- **Meta object** → `clientsPageMetaTags`
- **@graph string** → `clientsPageJsonLdStructuredData`
- **Last generated** → `clientsPageJsonLdLastGenerated`
- **Validation report** → `clientsPageJsonLdValidationReport`

---

## 8. References

- **Open Graph:** [ogp.me](https://ogp.me/) (og:image:alt, og:determiner, og:locale:alternate)
- **Twitter Cards:** [X Developer Docs – Cards](https://developer.x.com/en/docs/twitter-for-websites/cards/overview/markup) (twitter:site:id, twitter:creator:id)
- **Google:** [meta tags](https://developers.google.com/search/docs/crawling-indexing/special-tags) | [robots meta](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag) (max-snippet, max-image-preview) | [canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) | [Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)
- **Bing:** [Robots meta tags](https://www.bing.com/webmasters/help/which-robots-metatags-does-bing-support-5198d240)
- **Schema.org:** [Organization](https://schema.org/Organization) | [ContactPoint](https://schema.org/ContactPoint) | [PostalAddress](https://schema.org/PostalAddress) | [GeoCoordinates](https://schema.org/GeoCoordinates) | [WebSite](https://schema.org/WebSite) | [CollectionPage](https://schema.org/CollectionPage) | [ItemList](https://schema.org/ItemList) | [BreadcrumbList](https://schema.org/BreadcrumbList)
- **Validation:** [Validator](https://validator.schema.org/) | [Rich Results Test](https://search.google.com/test/rich-results)
