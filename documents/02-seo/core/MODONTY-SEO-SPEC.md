# Modonty SEO Specification

Comprehensive spec for Modonty home, about, and app pages.

---

## 1. Shared Identity

**Home & About Pages**

| Field | Value |
|-------|-------|
| Site URL | https://www.modonty.com |
| Site name | مودونتي (Modonty) |
| Primary locale | ar_SA |
| Description | منصة محتوى عربية بالاشتراك تعتمد نظام المدونة المرجعية |
| Language | ar |

---

## 2. Meta Tags Structure

All pages (home, about, app pages) include:

### Document & SEO
- title (50-60 chars, unique per page)
- description (≤160 chars, unique)
- canonical (absolute URL)
- robots (index, follow)

### Open Graph
- og:title, og:description, og:url, og:type (website)
- og:image (1200x630px), og:image:alt
- og:site_name (مودونتي), og:locale (ar_SA)

### Twitter Cards
- twitter:card (summary_large_image)
- twitter:title, twitter:description, twitter:image
- twitter:image:alt, twitter:site

---

## 3. JSON-LD Structure

Every page includes @graph with:

### Organization
- @id: {siteUrl}#organization
- name, url, description, inLanguage
- sameAs (social profiles array)
- contactPoint (email, phone, contactType, areaServed)
- logo (ImageObject: 512x512)
- knowsLanguage

### WebSite
- @id: {siteUrl}#website
- name, url, description, inLanguage
- publisher: Organization @id reference
- optional potentialAction (SearchAction)

### WebPage / AboutPage / CollectionPage
- For home: WebPage
- For about: AboutPage (add about reference, breadcrumb)
- For article listing: CollectionPage

Common fields:
- name, url, description, inLanguage, dateModified
- isPartOf: WebSite @id reference
- publisher: Organization @id reference
- primaryImageOfPage (ImageObject)

### BreadcrumbList (AboutPage only)
- itemListElement: ListItem array (position, name, item @id)

---

## 4. Home Page (/), JSON-LD

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.modonty.com/#organization",
      "name": "مودونتي",
      "url": "https://www.modonty.com",
      "description": "منصة محتوى عربية بالاشتراك تعتمد نظام المدونة المرجعية",
      "inLanguage": "ar"
    },
    {
      "@type": "WebSite",
      "@id": "https://www.modonty.com/#website",
      "name": "مودونتي",
      "url": "https://www.modonty.com",
      "inLanguage": "ar",
      "publisher": { "@id": "https://www.modonty.com/#organization" }
    },
    {
      "@type": "WebPage",
      "@id": "https://www.modonty.com/#webpage",
      "name": "أحدث المقالات والمدونات",
      "url": "https://www.modonty.com",
      "isPartOf": { "@id": "https://www.modonty.com/#website" },
      "inLanguage": "ar",
      "dateModified": "2025-01-29T00:00:00.000Z"
    }
  ]
}
```

---

## 5. About Page (/about), JSON-LD

Same Organization + WebSite as home (by @id reference).

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://www.modonty.com/#organization", ... },
    { "@type": "WebSite", "@id": "https://www.modonty.com/#website", ... },
    {
      "@type": "AboutPage",
      "@id": "https://www.modonty.com/about#aboutpage",
      "name": "من نحن - مودونتي",
      "headline": "من نحن",
      "url": "https://www.modonty.com/about",
      "description": "...",
      "about": { "@id": "https://www.modonty.com/#organization" },
      "publisher": { "@id": "https://www.modonty.com/#organization" },
      "isPartOf": { "@id": "https://www.modonty.com/#website" },
      "inLanguage": "ar",
      "dateModified": "2025-01-29T00:00:00.000Z",
      "breadcrumb": { "@id": "https://www.modonty.com/about#breadcrumb" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.modonty.com/about#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "مودونتي", "item": { "@id": "https://www.modonty.com" } },
        { "@type": "ListItem", "position": 2, "name": "من نحن", "item": { "@id": "https://www.modonty.com/about" } }
      ]
    }
  ]
}
```

---

## 6. App Pages (Settings: Default Value Tab)

**Generator:** `generate-modonty-page-seo.ts`
**JSON-LD Helper:** `generate-modonty-page-jsonld.ts`
**Validator:** `modonty-jsonld-validator.ts`

### Meta Tags Output
From page model + env:

| Key | Source | Fallback |
|-----|--------|----------|
| title | seoTitle \|\| title | Modonty |
| description | seoDescription | — |
| canonical | canonicalUrl | siteUrl + slug |
| robots | metaRobots | index, follow |
| og:image | ogImage \|\| socialImage | — |
| og:image:alt | socialImageAlt \|\| ogImageAlt | — |
| og:image:width | ogImageWidth | 1200 |
| og:image:height | ogImageHeight | 630 |
| twitter:image:alt | twitterImageAlt \|\| socialImageAlt | — |

### JSON-LD Output
@graph includes Organization, WebSite, WebPage (or AboutPage if slug in about/legal list), optional BreadcrumbList.

### Page Fields Persisted
slug, title, seoTitle, seoDescription, canonicalUrl, metaRobots, inLanguage, socialImage, socialImageAlt, ogImage, ogImageAlt, ogImageWidth, ogImageHeight, twitterCard, twitterImageAlt, alternateLanguages, sitemapPriority, sitemapChangeFreq, updatedAt.

**Optional Phase E fields:**
- author, keywords, googlebot, ogDeterminer, ogLocaleAlternate, twitterSiteId, twitterCreatorId

### Validator Requirements
- Allow: Organization, WebSite, WebPage, AboutPage, BreadcrumbList (+ optional LocalBusiness, FAQPage, HowTo, Article)
- Require: At least one WebPage or AboutPage

---

## 7. Meta Tags Example (About Page)

```html
<title>من نحن - مودونتي</title>
<meta name="description" content="تعرف على منصة مودونتي - منصة المدونات الاحترافية.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://www.modonty.com/about">

<!-- Open Graph -->
<meta property="og:title" content="من نحن - مودونتي">
<meta property="og:description" content="منصة المدونات الاحترافية في العالم العربي.">
<meta property="og:image" content="https://www.modonty.com/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="مودونتي">
<meta property="og:url" content="https://www.modonty.com/about">
<meta property="og:type" content="website">
<meta property="og:site_name" content="مودونتي">
<meta property="og:locale" content="ar_SA">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="من نحن - مودونتي">
<meta name="twitter:description" content="منصة المدونات الاحترافية.">
<meta name="twitter:image" content="https://www.modonty.com/og-image.jpg">
<meta name="twitter:image:alt" content="مودونتي">
<meta name="twitter:site" content="@modonty">
```

---

**Scope:** Home, About, and app pages (Settings default values)
**Contract:** Default Value tab + SEO-FULL-COVERAGE-100 §1–6
**Verification:** Change input → Save → Generate → Inspect Generated SEO tab
