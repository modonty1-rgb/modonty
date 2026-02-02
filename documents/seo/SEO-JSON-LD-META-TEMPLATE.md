# SEO JSON-LD & Meta Tags — Reference Template

**Purpose:** Reusable reference template for **home page** and **about page** SEO. No hardcoded data — use placeholders and fill from your app/CMS. Aligned with schema.org, [ogp.me](https://ogp.me/), [Google Search Central](https://developers.google.com/search/docs), and [Twitter Cards](https://developer.x.com/en/docs/twitter-for-websites/cards/overview/markup).

**Relation:** This file is the generic template; for a project-specific instance with examples, see `MODONTY-HOME-ABOUT-SEO-SPEC.md`.

**How to use:** Replace every `{{PLACEHOLDER}}` with your real values. Use the field tables as a checklist so no official field is missed.

---

## Placeholder reference

| Placeholder | Description | Example value |
|------------|-------------|---------------|
| `{{SITE_URL}}` | Canonical site base URL (no trailing slash for root) | `https://www.example.com` |
| `{{SITE_NAME}}` | Brand/site name (OG site_name, JSON-LD name) | `Example Site` |
| `{{LOCALE}}` | Primary locale for OG (format: `lang_TERRITORY`) | `en_US`, `ar_SA` |
| `{{LANG}}` | Primary language for schema.org (BCP 47, e.g. `en`, `ar`, `ar-SA`) | `en`, `ar` |
| `{{BRAND_DESCRIPTION}}` | One-sentence brand/site description | Short tagline or mission |
| `{{HOME_TITLE}}` | Home page title (unique) | Home or main listing title |
| `{{HOME_DESCRIPTION}}` | Home meta description (≤160 chars) | Compelling summary |
| `{{ABOUT_TITLE}}` | About page title | e.g. "About Us" |
| `{{ABOUT_DESCRIPTION}}` | About meta description (≤160 chars) | About-page summary |
| `{{ABOUT_PATH}}` | About page path (no leading slash) | `about` |
| `{{ABOUT_LABEL}}` | About breadcrumb label | e.g. "About Us" |
| `{{DATE_MODIFIED}}` | Page last modified (ISO 8601) | `2025-01-29T00:00:00.000Z` |
| `{{OG_IMAGE_URL}}` | Absolute URL to default/social image (HTTPS) | `https://www.example.com/og.jpg` |
| `{{OG_IMAGE_WIDTH}}` | Image width (recommended 1200) | `1200` |
| `{{OG_IMAGE_HEIGHT}}` | Image height (recommended 630 for 2:1) | `630` |
| `{{OG_IMAGE_ALT}}` | Alt text for image | Short description |
| `{{TWITTER_SITE}}` | Twitter @username for site (optional) | `@example` |
| `{{TWITTER_CREATOR}}` | Twitter @username for creator (optional) | `@author` |
| `{{ROBOTS}}` | Robots directive | `index, follow` |
| `{{GOOGLEBOT}}` | Googlebot directive (optional) | Prefer **index, follow**. Use max-snippet/max-image-preview only if you have a specific reason to restrict. |
| `{{SAME_AS}}` | Array of trusted social profile URLs (Twitter, LinkedIn, etc.) | `["https://twitter.com/example", "https://linkedin.com/company/example"]` |
| `{{CONTACT_EMAIL}}` | Support/inquiries email | `support@example.com` |
| `{{CONTACT_PHONE}}` | Support phone (optional) | `+1234567890` |
| `{{CONTACT_TYPE}}` | contactPoint contactType | `customer service` |
| `{{SEARCH_URL_TEMPLATE}}` | Internal search URL with `{search_term_string}` (only if you have site search) | `https://www.example.com/search?q={search_term_string}` |
| `{{KNOWS_LANGUAGE}}` | Array of other languages (BCP 47) if multilingual | `["ar", "en"]` |
| `{{LOGO_URL}}` | Organization logo absolute URL (for ImageObject) | `https://www.example.com/logo.png` |

---

## 1. Shared identity (same on home and about)

Use one source of truth for Organization and WebSite; reference by `@id` on all pages.

| Field | Placeholder / Rule | Official source |
|-------|-------------------|----------------|
| Site URL | `{{SITE_URL}}` | Canonical base |
| Site name | `{{SITE_NAME}}` | og:site_name, Organization/WebSite name |
| Default locale | `{{LOCALE}}` | ogp.me: `language_TERRITORY` |
| Language (schema) | `{{LANG}}` | schema.org inLanguage: BCP 47 |
| Brand description | `{{BRAND_DESCRIPTION}}` | Organization/WebSite description |

---

## 2. JSON-LD — Home page

**Goal:** WebSite + Organization + WebPage (or CollectionPage) in one `@graph`. Stable `@id`s for reuse on other pages.

### 2.1 Organization (schema.org)

| Property | Required | Placeholder / Notes |
|----------|----------|---------------------|
| `@type` | Yes | `Organization` |
| `@id` | Yes | `{{SITE_URL}}#organization` |
| `name` | Yes | `{{SITE_NAME}}` |
| `url` | Yes | `{{SITE_URL}}` |
| `description` | Recommended | `{{BRAND_DESCRIPTION}}` |
| `inLanguage` | Recommended | `{{LANG}}` (BCP 47) |
| `logo` | Optional | ImageObject or URL |
| `image` | Optional | URL or ImageObject |
| `sameAs` | Optional | Array of social profile URLs |
| `contactPoint` | Optional | ContactPoint (telephone, contactType, areaServed, etc.) |
| `address` | Optional | PostalAddress |
| `email` | Optional | Text |
| `telephone` | Optional | Text |
| `alternateName` | Optional | Alias |
| `foundingDate` | Optional | Date |
| `legalName` | Optional | Registered name |

### 2.2 WebSite (schema.org)

| Property | Required | Placeholder / Notes |
|----------|----------|---------------------|
| `@type` | Yes | `WebSite` |
| `@id` | Yes | `{{SITE_URL}}#website` |
| `name` | Yes | `{{SITE_NAME}}` |
| `url` | Yes | `{{SITE_URL}}` |
| `description` | Recommended | `{{BRAND_DESCRIPTION}}` or shortened |
| `inLanguage` | Recommended | `{{LANG}}` |
| `publisher` | Recommended | `{ "@id": "{{SITE_URL}}#organization" }` |
| `potentialAction` | Optional | e.g. SearchAction with target template |

### 2.3 WebPage — home (schema.org)

| Property | Required | Placeholder / Notes |
|----------|----------|---------------------|
| `@type` | Yes | `WebPage` |
| `@id` | Yes | `{{SITE_URL}}#webpage` |
| `name` | Yes | `{{HOME_TITLE}}` |
| `url` | Yes | `{{SITE_URL}}` |
| `isPartOf` | Recommended | `{ "@id": "{{SITE_URL}}#website" }` |
| `inLanguage` | Recommended | `{{LANG}}` |
| `dateModified` | Recommended | `{{DATE_MODIFIED}}` (ISO 8601) |
| `description` | Optional | `{{HOME_DESCRIPTION}}` |
| `primaryImageOfPage` | Optional | ImageObject with url |
| `mainEntityOfPage` | Optional | URL of this page |

### 2.4 Home @graph template (copy-paste, then replace)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "{{SITE_URL}}#organization",
      "name": "{{SITE_NAME}}",
      "url": "{{SITE_URL}}",
      "description": "{{BRAND_DESCRIPTION}}",
      "inLanguage": "{{LANG}}"
    },
    {
      "@type": "WebSite",
      "@id": "{{SITE_URL}}#website",
      "name": "{{SITE_NAME}}",
      "url": "{{SITE_URL}}",
      "description": "{{BRAND_DESCRIPTION}}",
      "inLanguage": "{{LANG}}",
      "publisher": { "@id": "{{SITE_URL}}#organization" }
    },
    {
      "@type": "WebPage",
      "@id": "{{SITE_URL}}#webpage",
      "name": "{{HOME_TITLE}}",
      "url": "{{SITE_URL}}",
      "isPartOf": { "@id": "{{SITE_URL}}#website" },
      "inLanguage": "{{LANG}}",
      "dateModified": "{{DATE_MODIFIED}}"
    }
  ]
}
```

**HTML:** Emit inside `<script type="application/ld+json">`. Escape `<` as `\u003c` and avoid literal `</script>` in JSON string.

---

## 3. JSON-LD — About page

**Goal:** Same Organization + WebSite by reference; AboutPage + BreadcrumbList.

### 3.1 AboutPage (schema.org)

| Property | Required | Placeholder / Notes |
|----------|----------|---------------------|
| `@type` | Yes | `AboutPage` |
| `@id` | Yes | `{{SITE_URL}}/{{ABOUT_PATH}}#aboutpage` |
| `name` | Yes | e.g. `{{ABOUT_TITLE}} - {{SITE_NAME}}` |
| `headline` | Recommended | `{{ABOUT_TITLE}}` |
| `url` | Yes | `{{SITE_URL}}/{{ABOUT_PATH}}` |
| `mainEntityOfPage` | Recommended | URL of this page (same as url) |
| `description` | Recommended | `{{ABOUT_DESCRIPTION}}` |
| `about` | Recommended | `{ "@id": "{{SITE_URL}}#organization" }` |
| `publisher` | Recommended | `{ "@id": "{{SITE_URL}}#organization" }` |
| `isPartOf` | Recommended | `{ "@id": "{{SITE_URL}}#website" }` |
| `inLanguage` | Recommended | `{{LANG}}` |
| `dateModified` | Recommended | `{{DATE_MODIFIED}}` |
| `primaryImageOfPage` | Optional | ImageObject |
| `breadcrumb` | Optional | BreadcrumbList or reference by @id |

### 3.2 BreadcrumbList (schema.org)

| Property | Required | Placeholder / Notes |
|----------|----------|---------------------|
| `@type` | Yes | `BreadcrumbList` |
| `@id` | Recommended | `{{SITE_URL}}/{{ABOUT_PATH}}#breadcrumb` |
| `itemListElement` | Yes | Array of ListItem |
| ListItem: `@type` | Yes | `ListItem` |
| ListItem: `position` | Yes | 1, 2, … |
| ListItem: `name` | Yes | Display name |
| ListItem: `item` | Yes | `{ "@id": "URL" }` for the link |

### 3.3 About @graph template

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "{{SITE_URL}}#organization",
      "name": "{{SITE_NAME}}",
      "url": "{{SITE_URL}}",
      "description": "{{BRAND_DESCRIPTION}}",
      "inLanguage": "{{LANG}}"
    },
    {
      "@type": "WebSite",
      "@id": "{{SITE_URL}}#website",
      "name": "{{SITE_NAME}}",
      "url": "{{SITE_URL}}",
      "inLanguage": "{{LANG}}",
      "publisher": { "@id": "{{SITE_URL}}#organization" }
    },
    {
      "@type": "AboutPage",
      "@id": "{{SITE_URL}}/{{ABOUT_PATH}}#aboutpage",
      "name": "{{ABOUT_TITLE}} - {{SITE_NAME}}",
      "headline": "{{ABOUT_TITLE}}",
      "url": "{{SITE_URL}}/{{ABOUT_PATH}}",
      "mainEntityOfPage": "{{SITE_URL}}/{{ABOUT_PATH}}",
      "description": "{{ABOUT_DESCRIPTION}}",
      "about": { "@id": "{{SITE_URL}}#organization" },
      "publisher": { "@id": "{{SITE_URL}}#organization" },
      "isPartOf": { "@id": "{{SITE_URL}}#website" },
      "inLanguage": "{{LANG}}",
      "dateModified": "{{DATE_MODIFIED}}"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "{{SITE_URL}}/{{ABOUT_PATH}}#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "{{SITE_NAME}}", "item": { "@id": "{{SITE_URL}}" } },
        { "@type": "ListItem", "position": 2, "name": "{{ABOUT_LABEL}}", "item": { "@id": "{{SITE_URL}}/{{ABOUT_PATH}}" } }
      ]
    }
  ]
}
```

---

## 4. Meta tags — Full checklist (official sources)

### 4.1 Document & SEO (Google)

| Tag | Required | Placeholder / Constraint | Notes |
|-----|----------|--------------------------|-------|
| `<title>` | Yes | Unique per page; ~50–60 chars | Snippet title |
| `<meta name="description" content="…">` | Yes | Unique, ≤160 chars | Snippet description |
| `<link rel="canonical" href="…">` | Yes | Absolute URL of this page | One per page |
| `<meta name="robots" content="…">` | Optional | `{{ROBOTS}}` (default index, follow) | Crawl directive |
| `<meta name="googlebot" content="…">` | Optional | `{{GOOGLEBOT}}` | Prefer **index, follow**. Use max-snippet/max-image-preview only when you need to restrict; standard index, follow is safer and cleaner. |
| `<meta charset="UTF-8">` | Yes | First in `<head>` | HTML5 |
| `<meta name="viewport" content="width=device-width, initial-scale=1">` | Recommended | — | Mobile-friendly (Google) |
| `<meta name="theme-color" content="…">` | Optional | Hex color | PWA/browser UI |
| `<meta name="author" content="…">` | Optional | Name or URL | — |
| `<meta name="keywords" content="…">` | Optional | Comma-separated | **Ignored by Google and Bing**; optional for legacy/other crawlers only. |

### 4.2 Open Graph (ogp.me)

| Property | Required | Placeholder / Constraint | Notes |
|----------|----------|--------------------------|-------|
| `og:title` | Yes | Page title | Required by ogp.me |
| `og:type` | Yes | `website` for home/about | Required |
| `og:image` | Yes | `{{OG_IMAGE_URL}}` | Required |
| `og:url` | Yes | Canonical URL of page | Required |
| `og:description` | Recommended | Same as meta description or shorter | — |
| `og:site_name` | Recommended | `{{SITE_NAME}}` | Same on all pages |
| `og:locale` | Recommended | `{{LOCALE}}` (e.g. en_US, ar_SA) | Underscore |
| `og:image:secure_url` | Recommended | HTTPS URL of image | When using HTTPS |
| `og:image:type` | Optional | MIME e.g. image/jpeg | — |
| `og:image:width` | Recommended | `{{OG_IMAGE_WIDTH}}` (1200) | — |
| `og:image:height` | Recommended | `{{OG_IMAGE_HEIGHT}}` (630) | — |
| `og:image:alt` | Recommended | `{{OG_IMAGE_ALT}}` | Accessibility |
| `og:determiner` | Optional | a, an, the, "", auto | Before title in sentence |
| `og:locale:alternate` | Optional | Array of other locales | Multilingual |
| `og:audio` | Optional | URL | — |
| `og:video` | Optional | URL | — |

### 4.3 Twitter Card (developer.x.com)

| Meta name | Required | Placeholder / Constraint | Notes |
|-----------|----------|--------------------------|-------|
| `twitter:card` | Yes | `summary_large_image` (when using image) | summary, summary_large_image, app, player |
| `twitter:title` | Yes for cards | Max 70 characters | — |
| `twitter:description` | Optional | Max 200 characters | — |
| `twitter:image` | Required for summary_large_image | Same as og:image | <5MB; JPG, PNG, WEBP, GIF; 2:1; min 300×157 |
| `twitter:image:alt` | Recommended | Max 420 characters | Accessibility |
| `twitter:site` | Recommended | `{{TWITTER_SITE}}` (@username) | Attribution |
| `twitter:site:id` | Optional | Numeric Twitter ID | Most brands use @handle (twitter:site); ID only if you change handles frequently. |
| `twitter:creator` | Optional | `{{TWITTER_CREATOR}}` | Attribution |
| `twitter:creator:id` | Optional | Numeric ID | Same: @handle (twitter:creator) usual; ID only if handles change often. |

### 4.4 International (Google — when multilingual)

| Tag | When | Placeholder / Rule |
|-----|------|--------------------|
| `<link rel="alternate" hreflang="xx" href="…">` | Multiple languages/regions | Each version lists itself + all alternates |
| `<link rel="alternate" hreflang="x-default" href="…">` | Default for unspecified users | Usually home or primary locale |

Use BCP 47 / ISO 639-1 for `hreflang`. Fully qualified URLs required.

### 4.5 Example HTML meta block (about page) — replace placeholders

```html
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{{ABOUT_TITLE}} - {{SITE_NAME}}</title>
<meta name="description" content="{{ABOUT_DESCRIPTION}}" />
<link rel="canonical" href="{{SITE_URL}}/{{ABOUT_PATH}}" />
<meta name="robots" content="{{ROBOTS}}" />
<meta name="googlebot" content="{{GOOGLEBOT}}" />

<meta property="og:title" content="{{ABOUT_TITLE}} - {{SITE_NAME}}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="{{SITE_URL}}/{{ABOUT_PATH}}" />
<meta property="og:image" content="{{OG_IMAGE_URL}}" />
<meta property="og:image:secure_url" content="{{OG_IMAGE_URL}}" />
<meta property="og:image:width" content="{{OG_IMAGE_WIDTH}}" />
<meta property="og:image:height" content="{{OG_IMAGE_HEIGHT}}" />
<meta property="og:image:alt" content="{{OG_IMAGE_ALT}}" />
<meta property="og:description" content="{{ABOUT_DESCRIPTION}}" />
<meta property="og:site_name" content="{{SITE_NAME}}" />
<meta property="og:locale" content="{{LOCALE}}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{{ABOUT_TITLE}} - {{SITE_NAME}}" />
<meta name="twitter:description" content="{{ABOUT_DESCRIPTION}}" />
<meta name="twitter:image" content="{{OG_IMAGE_URL}}" />
<meta name="twitter:image:alt" content="{{OG_IMAGE_ALT}}" />
<meta name="twitter:site" content="{{TWITTER_SITE}}" />
<meta name="twitter:creator" content="{{TWITTER_CREATOR}}" />
```

---

## 5. Official constraints & validation

### 5.1 JSON-LD

- **Context:** `https://schema.org` (or `https://schema.org/`).
- **inLanguage:** IETF BCP 47 (e.g. `en`, `ar`, `ar-SA`). schema.org uses hyphen; OG uses underscore in locale.
- **Dates:** ISO 8601 (e.g. `YYYY-MM-DDTHH:mm:ss.sssZ`).
- **URLs:** Absolute, preferably HTTPS.
- **Embedding:** `<script type="application/ld+json">` in `<head>` or `<body>`. Escape `<` (e.g. `\u003c`) and avoid raw `</script>` in JSON.

### 5.2 Open Graph

- **og:locale:** `language_TERRITORY` (e.g. `en_US`, `ar_SA`).
- **og:image:** Absolute URL; 1200×630 recommended for large previews.

### 5.3 Twitter

- **twitter:title:** Max 70 characters.
- **twitter:description:** Max 200 characters.
- **twitter:image:alt:** Max 420 characters.
- **Image:** Aspect ratio 2:1; min 300×157; max 4096×4096; <5MB; JPG, PNG, WEBP, GIF (no SVG).

### 5.4 Google

- **Title:** ~50–60 characters for display.
- **Meta description:** ~150–160 characters; may be rewritten.
- **Canonical:** One per page; match og:url.

### 5.5 Validation tools

| Tool | URL | Use |
|------|-----|-----|
| Schema.org Validator | https://validator.schema.org | JSON-LD syntax and types |
| Google Rich Results Test | https://search.google.com/test/rich-results | Rich result eligibility |
| Facebook Sharing Debugger | https://developers.facebook.com/tools/debug/ | OG tags and cache |
| Twitter Card Validator | https://cards-dev.twitter.com/validator | Twitter card and image |
| Google Search Console | https://search.google.com/search-console | Indexing and structured data |

---

## 6. Optional schema.org fields (when data exists)

**Organization:** `logo`, `sameAs`, `contactPoint`, `address`, `email`, `telephone`, `alternateName`, `foundingDate`, `legalName`, `slogan`, `knowsLanguage`, `areaServed`.  
**ContactPoint** (when used): `@type: ContactPoint`, `telephone`, `contactType` (e.g. customer service), `email`, `areaServed`, `availableLanguage`, `contactOption` (e.g. TollFree, HearingImpairedSupported), `hoursAvailable`.

**WebSite:** `potentialAction` (SearchAction), `abstract`, `inLanguage` (array for multiple).

**WebPage / AboutPage:** `primaryImageOfPage`, `speakable` (SpeakableSpecification), `lastReviewed`, `reviewedBy`, `mainEntityOfPage` (URL).

**BreadcrumbList:** Use `itemListOrder: "ItemListOrderAscending"` if order matters for consumers.

### 6.1 Full technical SEO coverage (100%)

To reach full technical SEO coverage, add the following to your Organization and WebSite JSON-LD:

| Item | Where | Purpose |
|------|--------|---------|
| **sameAs** | Organization | Link to trusted social accounts (e.g. Twitter, LinkedIn). Use placeholder `{{SAME_AS}}` (array of URLs). |
| **contactPoint** | Organization | For support or inquiries. Use ContactPoint with `contactType` (e.g. customer service), `email`, optional `telephone`, `areaServed`. |
| **ImageObject for images** | Organization `logo`/`image`; WebPage/AboutPage `primaryImageOfPage` | Prefer ImageObject instead of plain URLs: `{ "@type": "ImageObject", "url": "…", "width": 1200, "height": 630 }`. Optional: `caption` or alternate name for alt. |
| **potentialAction** (SearchAction) | WebSite | Only if you have internal search. Use `{ "@type": "SearchAction", "target": { "@type": "EntryPoint", "urlTemplate": "{{SEARCH_URL_TEMPLATE}}" }, "query-input": "required name=search_term_string" }`. |
| **knowsLanguage** | Organization | If you serve other languages. Use `{{KNOWS_LANGUAGE}}` (array of BCP 47 codes, e.g. `["ar", "en"]`). |

**Extended Organization + WebSite snippet** (merge into your @graph when you have the data):

```json
{
  "@type": "Organization",
  "@id": "{{SITE_URL}}#organization",
  "name": "{{SITE_NAME}}",
  "url": "{{SITE_URL}}",
  "description": "{{BRAND_DESCRIPTION}}",
  "inLanguage": "{{LANG}}",
  "sameAs": {{SAME_AS}},
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "{{CONTACT_TYPE}}",
    "email": "{{CONTACT_EMAIL}}",
    "telephone": "{{CONTACT_PHONE}}"
  },
  "logo": {
    "@type": "ImageObject",
    "url": "{{LOGO_URL}}"
  },
  "knowsLanguage": {{KNOWS_LANGUAGE}}
},
{
  "@type": "WebSite",
  "@id": "{{SITE_URL}}#website",
  "name": "{{SITE_NAME}}",
  "url": "{{SITE_URL}}",
  "inLanguage": "{{LANG}}",
  "publisher": { "@id": "{{SITE_URL}}#organization" },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "{{SEARCH_URL_TEMPLATE}}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

Use `potentialAction` only when you have internal search; omit it otherwise. For `primaryImageOfPage` on WebPage/AboutPage, use `{ "@type": "ImageObject", "url": "{{OG_IMAGE_URL}}", "width": {{OG_IMAGE_WIDTH}}, "height": {{OG_IMAGE_HEIGHT}} }` instead of a bare URL when possible.

**Note:** Replace `{{SAME_AS}}` and `{{KNOWS_LANGUAGE}}` with valid JSON arrays (e.g. `["https://twitter.com/example", "https://linkedin.com/company/example"]` and `["ar", "en"]`). Omit `contactPoint` or `knowsLanguage` if you have no data.

---

## 7. Comparison: Template vs Modonty schema

Comparison with the **Modonty** Prisma model (`dataLayer/prisma/schema/schema.prisma`).  
**Modonty** stores per-page SEO for about/legal pages; site-level values (SITE_URL, SITE_NAME, BRAND_DESCRIPTION) come from env/config, not Modonty.

### 7.1 Modonty schema fields (current)

| Modonty field | Template / meta equivalent | Status |
|---------------|----------------------------|--------|
| `slug` | Page path (e.g. ABOUT_PATH) | ✓ |
| `title` | Page title, fallback for seoTitle | ✓ |
| `seoTitle` | title meta, og:title, twitter:title | ✓ |
| `seoDescription` | meta description, og:description, twitter:description | ✓ |
| `metaRobots` | robots meta | ✓ |
| `socialImage` | og:image, twitter:image (fallback) | ✓ |
| `socialImageAlt` | Alt text (can be used for og:image:alt, twitter:image:alt) | ✓ (shared) |
| `ogTitle`, `ogDescription`, `ogType`, `ogUrl`, `ogSiteName`, `ogLocale`, `ogImage` | Open Graph | ✓ |
| `twitterCard`, `twitterTitle`, `twitterDescription`, `twitterSite`, `twitterCreator` | Twitter Card | ✓ |
| `canonicalUrl` | canonical, og:url | ✓ |
| `alternateLanguages` | hreflang (JSON array) | ✓ |
| `inLanguage` | inLanguage (JSON-LD), og:locale | ✓ |
| `sitemapPriority`, `sitemapChangeFreq` | Sitemap XML (not meta) | ✓ |
| `metaTags` (Json), `jsonLdStructuredData`, `jsonLdLastGenerated`, `jsonLdValidationReport` | Cached output | ✓ |
| `updatedAt` | dateModified (JSON-LD) | ✓ |

### 7.2 Missing in Modonty schema (template expects or recommends)

Fields the template lists but **Modonty does not store** per page. Add only if you need them editable in admin.

| Template / official field | Recommended | In Modonty? | Note |
|---------------------------|-------------|-------------|------|
| **og:image:alt** | Recommended (ogp.me) | ❌ No dedicated field | Use **socialImageAlt** for both og:image:alt and twitter:image:alt in generator. |
| **twitter:image:alt** | Recommended (max 420 chars) | ❌ No dedicated field | Same: use **socialImageAlt**. |
| **googlebot** | Optional (snippet control) | ❌ No | Could add `metaGooglebot String?` or derive from metaRobots (e.g. same value). |
| **meta keywords** | Optional | ❌ No | Add `metaKeywords String?` if you want per-page keywords. |
| **meta author** | Optional | ❌ No | Add `metaAuthor String?` if you want per-page author. |
| **og:determiner** | Optional (a, an, the, "", auto) | ❌ No | Add `ogDeterminer String?` only if needed. |
| **og:locale:alternate** | Optional (array of locales) | ❌ No | alternateLanguages is hreflang URLs; og:locale:alternate is different. Add `ogLocaleAlternate Json?` (array of strings) if you need it. |
| **theme-color** | Optional | ❌ No | Usually app/layout-level; not in Modonty. |
| **Breadcrumb page label** | For BreadcrumbList | From **page-config** | Not in DB; admin page-config has `label` (e.g. "من نحن"). Keep using config. |
| **SITE_URL, SITE_NAME, BRAND_DESCRIPTION** | Shared identity | Env / site config | Not per-page in Modonty; correct. |

### 7.3 Optional schema additions (if you want full parity)

If you want every template field storable per page in Modonty, add to the Prisma model:

```prisma
// Optional additions (Template §4–§5 parity)
ogImageAlt           String?  // Dedicated OG image alt (or keep using socialImageAlt)
twitterImageAlt      String?  // Dedicated Twitter image alt (or keep using socialImageAlt)
metaGooglebot        String?  // e.g. "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
metaKeywords         String?  // Comma-separated
metaAuthor           String?  // Name or URL
ogDeterminer         String?  // a | an | the | "" | auto
ogLocaleAlternate    Json?    // Array of locale strings, e.g. ["en_US", "ar_SA"]
```

**Recommendation:**  
- Keep using **socialImageAlt** for both og:image:alt and twitter:image:alt (no new fields).  
- Add **metaGooglebot** only if you need per-page snippet control different from robots.  
- Add **metaKeywords** / **metaAuthor** / **ogDeterminer** / **ogLocaleAlternate** only if the product requires them.

### 7.4 Not in template but in Modonty (no change)

| Modonty field | Purpose |
|---------------|--------|
| `heroImage`, `heroImageAlt`, `heroImageCloudinaryPublicId` | Page hero (display), not required for template meta/JSON-LD. |
| `content` | Body content (TipTap). |
| `cloudinaryPublicId` | Asset management. |
| `sitemapPriority`, `sitemapChangeFreq` | Sitemap XML; template does not list sitemap fields. |

---

## 8. Comparison: Template vs Modonty Setting UI (http://localhost:3000/modonty/setting)

All tabs and form fields on the Modonty setting page, compared to the template. **Missing** = template recommends or requires it but the UI has no editable field (or field not wired for edit-without-upload).

### 8.1 UI fields by tab (current)

**Tab: Basic**  
| UI field | Template / schema | Notes |
|----------|--------------------|-------|
| Title | title, seoTitle fallback | ✓ |
| Content | content (body) | ✓ |
| Hero Image | heroImage (display) | ✓ |
| Hero Image Alt | heroImageAlt | ✓ (inside DeferredImageUpload; only saved when new hero image uploaded) |

**Tab: SEO**  
| UI field | Template / schema | Notes |
|----------|--------------------|-------|
| SEO Title | title meta, og:title, twitter:title | ✓ (max 60) |
| SEO Description | meta description | ✓ (max 160) |
| Meta Robots | robots meta | ✓ |
| Canonical URL | canonical, og:url | ✓ |
| Social Image | og:image, twitter:image | ✓ (upload) |
| Social Image Alt | og:image:alt, twitter:image:alt | ⚠️ Only updated when **new image** selected; editing alt on existing image does not propagate to form (DeferredImageUpload does not call parent when only alt changes without new file). |

**Tab: Search & Social Previews**  
Read-only previews (Google, Facebook, Twitter). No form fields.

**Tab: Generated SEO**  
Read-only (cached meta tags, JSON-LD, validation, copy, regenerate). No form fields.

**Tab: Social Media**  
| UI field | Template / schema | Notes |
|----------|--------------------|-------|
| OG Title | og:title | ✓ (max 60) |
| OG Description | og:description | ✓ (max 200) |
| OG Type | og:type | ✓ |
| OG URL | og:url | ✓ |
| OG Site Name | og:site_name | ✓ |
| OG Locale | og:locale | ✓ |
| OG Image URL | og:image | ✓ |
| Twitter Card Type | twitter:card | ✓ |
| Twitter Title | twitter:title | ✓ (max 70) |
| Twitter Description | twitter:description | ✓ (max 200) |
| Twitter Site | twitter:site | ✓ |
| Twitter Creator | twitter:creator | ✓ |
| **OG Image Alt** | og:image:alt (recommended) | ❌ No field in Social tab. |
| **Twitter Image Alt** | twitter:image:alt (recommended, max 420) | ❌ No field in Social tab. |
| **og:image:width / height** | Recommended 1200×630 | ❌ Not in UI (can be fixed in generator). |
| **og:determiner** | Optional | ❌ No field. |

**Tab: Technical**  
| UI field | Template / schema | Notes |
|----------|--------------------|-------|
| Canonical URL | canonical | ✓ (duplicate of SEO tab) |
| Sitemap Priority | sitemap XML | ✓ |
| Sitemap Change Frequency | sitemap XML | ✓ |
| Language | inLanguage (JSON-LD), hreflang | ✓ |
| Alternate Languages (JSON) | hreflang | ✓ |
| **meta googlebot** | Optional snippet control | ❌ No field. |
| **meta keywords** | Optional | ❌ No field. |
| **meta author** | Optional | ❌ No field. |
| **og:locale:alternate** | Optional | ❌ No field (alternateLanguages is hreflang, not og:locale:alternate). |

### 8.2 Template fields present in UI (100% cross-check)

Every template §4 field that has a matching editable control on the Modonty setting page:

| Template field (§4) | UI location | Control |
|---------------------|-------------|---------|
| title | SEO tab | SEO Title |
| meta description | SEO tab | SEO Description |
| canonical | SEO tab, Technical tab | Canonical URL |
| robots | SEO tab | Meta Robots |
| og:title | Social tab | OG Title |
| og:type | Social tab | OG Type |
| og:image | SEO tab (Social Image), Social tab (OG Image URL) | Upload + URL |
| og:url | Social tab | OG URL |
| og:description | Social tab | OG Description |
| og:site_name | Social tab | OG Site Name |
| og:locale | Social tab | OG Locale |
| twitter:card | Social tab | Twitter Card Type |
| twitter:title | Social tab | Twitter Title |
| twitter:description | Social tab | Twitter Description |
| twitter:image | Same as og:image (shared) | — |
| twitter:site | Social tab | Twitter Site |
| twitter:creator | Social tab | Twitter Creator |
| hreflang / alternate | Technical tab | Alternate Languages (JSON), Language (inLanguage) |
| sitemap (not meta) | Technical tab | Sitemap Priority, Sitemap Change Frequency |

**Not per-page (no UI needed):** charset, viewport, theme-color (layout-level). og:image:secure_url (derived from og:image). og:image:width / og:image:height (can be fixed 1200×630 in generator).

### 8.3 Missing in UI (template expects or recommends) — definitive list

**A. Recommended by template (only real gaps)**

| # | Template field | In UI? | Note |
|---|----------------|--------|------|
| 1 | **Social Image Alt** (source for og:image:alt & twitter:image:alt) | ⚠️ Partial | Schema has `socialImageAlt`. SEO tab has Social Image upload with alt inside DeferredImageUpload, but **alt is only sent to form when a new image is selected**. If user edits only the alt text on an existing image, the parent never receives it (no `onAltChange`). So effectively **no editable field for image alt when the image already exists**. |
| 2 | **og:image:alt** | ❌ | Template recommends. No dedicated input; generator can use socialImageAlt once it is editable (fix #1). |
| 3 | **twitter:image:alt** | ❌ | Template recommends (max 420). Same as #2; use socialImageAlt once editable. |

So for **recommended** template fields, the **only** missing piece is: **Social Image Alt must be editable when the image already exists** (wire alt-only changes to form). After that, og:image:alt and twitter:image:alt are covered by the same value.

**B. Optional by template (missing in UI)**

| # | Template field | §4 table | In UI? |
|---|----------------|----------|--------|
| 4 | meta googlebot | §4.1 Optional | ❌ No field. |
| 5 | meta keywords | §4.1 Optional | ❌ No field. |
| 6 | meta author | §4.1 Optional | ❌ No field. |
| 7 | og:determiner | §4.2 Optional | ❌ No field. |
| 8 | og:locale:alternate | §4.2 Optional | ❌ No field (alternateLanguages is hreflang, not this). |
| 9 | og:image:type | §4.2 Optional | ❌ No field (MIME type). |
| 10 | og:audio | §4.2 Optional | ❌ No field. |
| 11 | og:video | §4.2 Optional | ❌ No field. |
| 12 | twitter:site:id | §4.3 Optional | ❌ No field (numeric ID). |
| 13 | twitter:creator:id | §4.3 Optional | ❌ No field (numeric ID). |

**C. Confirmed not missing**

- og:image:width / og:image:height — Template recommends but can be fixed (1200×630) in generator; no per-page UI needed.
- charset, viewport, theme-color — Document-level; not per-page.
- All required and other recommended template fields — Covered in §8.2 above.

**Summary:** The **only** recommended template gap is **#1 (Social Image Alt editable when image already exists)**. Items **#2–#3** are satisfied once #1 is fixed. Items **#4–#13** are optional; add UI only if the product needs them.

**100% confirmation (recheck):** Cross-checked template §4 (Document/SEO, Open Graph, Twitter, International) against Modonty setting UI (BasicSection, SEOSection, SocialSection, TechnicalSection) and `DeferredImageUpload`. **Confirmed:** The only recommended missing piece is #1 — Social Image Alt must propagate to the form when the user edits alt text on an *existing* image (no new file). `DeferredImageUpload` currently calls `onImageSelected` only when `file` is set (new upload); it has no `onAltChange` callback, so alt-only edits in edit mode never reach the parent. All other template-required and template-recommended fields have a matching UI control. Optional fields #4–#13 remain optional.

### 8.4 Duplicate in UI

- **Canonical URL** appears in both **SEO** and **Technical** tabs. Same value; consider keeping in one place (e.g. SEO only) or clearly label as "same field, edit in either tab."

### 8.5 Summary: what to add for full template parity

1. **High impact (recommended by template):**  
   - **Social Image Alt** — Make it editable when the image already exists (wire DeferredImageUpload alt-only changes to form, or add a separate "Social image alt" input in SEO tab).  
   - **OG Image Alt / Twitter Image Alt** — Either add "Image alt text" in Social tab (for og:image + twitter:image) or document that generator uses SEO tab’s Social Image Alt for both; ensure that value is editable (see above).

2. **Optional (template optional):**  
   - meta googlebot, meta keywords, meta author, og:determiner, og:locale:alternate — Add UI fields only if product needs them.

3. **No UI needed:**  
   - og:image:width / height — Can be fixed (1200×630) in generator.  
   - charset, viewport, theme-color — Layout/app-level, not per-page.

---

*Template version: 1.0. Sources: schema.org (v29.4), ogp.me, Google Search Central, Twitter/X Cards markup. No hardcoded data — replace all placeholders.*
