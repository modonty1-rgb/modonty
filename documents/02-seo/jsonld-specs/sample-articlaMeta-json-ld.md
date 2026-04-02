METATAG & JSON‑LD – ARTICLE REFERENCE
Purpose of Step 12
Goal: Make each article page export perfect metadata for search engines and social platforms.
Output targets:
Next.js metadata object (for <head> tags).
Article JSON‑LD (for rich results).
Data Sources (Admin Article Edit)
Form data (formData)
Title / slug / excerpt / content
Client, category, author, tags
SEO fields: seoTitle, seoDescription, metaRobots, canonicalUrl
OG fields: ogType, ogSiteName, ogLocale, ogArticle*
Twitter fields: twitterCard, twitterSite, twitterCreator
Technical SEO: datePublished, ogArticleModifiedTime, sitemap*, license, isAccessibleForFree, inLanguage
Structured‑data helpers: wordCount, articleBodyText, semanticKeywords, citations
Related entities
Client: name, slug, url, logo
Category: name, slug
Author: name, bio, image, url
Tags: list of tag names
Featured media
Resolved via featuredImageId + clientId → image url, width, height, alt.
Target Metadata Shape (Article Page)
1. Top‑level
title
Pattern: "{seoOrTitle} - {clientName}".
Use seoTitle if present, else fall back to title.
description
Use seoDescription if present, else fall back to excerpt.
alternates.canonical
Absolute URL of the article: https://modonty.com/articles/{slug} (or canonical override if provided).
2. Open Graph (for Facebook, LinkedIn, WhatsApp, etc.)
Required
openGraph.title → same as full title.
openGraph.description → same as description.
openGraph.url → canonical URL.
openGraph.siteName → client name (or default brand).
openGraph.locale → "ar_SA" for Arabic / KSA.
openGraph.type → "article" (critical for blog posts).
openGraph.images[]
url (absolute, HTTPS).
width / height (real dimensions).
alt (Arabic, describes the image and article topic).
Recommended article‑specific fields
openGraph.publishedTime → ISO date:
Prefer datePublished, else scheduledAt, else now.
openGraph.modifiedTime → ISO:
Prefer ogArticleModifiedTime, else now.
openGraph.authors[] → author display name.
openGraph.section → category name.
openGraph.tags[] → tag names / main SEO keywords.
3. Twitter
Base
twitter.card → "summary_large_image".
twitter.title → same as full title.
twitter.description → same as description.
twitter.images[] → same image URL as Open Graph.
Branding
twitter.site → @modonty (brand account).
twitter.creator → author handle, or @modonty if unknown.
Optional polishing
Add alt text (mapped from OG image alt) if you surface it to Twitter tags.
4. Robots
Default “indexable” article
robots.index → true if metaRobots does not include noindex.
robots.follow → true if metaRobots does not include nofollow.
Googlebot advanced control
robots.googleBot.index / follow mirror the above.
robots.googleBot["max-image-preview"] → "large".
robots.googleBot["max-video-preview"] → -1 (no limit).
robots.googleBot["max-snippet"] → -1 (no limit).
JSON‑LD Article Reference
Context and graph
@context: "https://schema.org".
@graph: [Article, WebPage, BreadcrumbList, Organization, Person].
1. Article node
@type: "Article".
@id: {canonical}#article.
Core fields
headline → same as main title.
description → same as description.
datePublished → same logic as OG publishedTime.
dateModified → same logic as OG modifiedTime.
author → { "@id": "{site}/authors/{authorSlug}#person" }.
publisher → { "@id": "{site}/clients/{clientSlug}#organization" }.
mainEntityOfPage → { "@type": "WebPage", "@id": canonical }.
inLanguage → "ar" or locale code.
isAccessibleForFree → boolean from article form.
Recommended enrichments
articleSection → category name.
keywords → tag names / SEO keywords.
image → ImageObject with same URL, width, height as OG image.
wordCount → numeric.
license → URL/string when not "none".
2. WebPage node
@id: canonical URL (no hash).
url: canonical.
name: article title.
description: article description.
isPartOf:
@type: "WebSite".
name: client name or main brand.
url: main site URL.
breadcrumb: { "@id": "{canonical}#breadcrumb" }.
3. BreadcrumbList node
@id: {canonical}#breadcrumb.
Items (at minimum):
Home → /.
Optional category → /categories/{categorySlug}.
Article → canonical URL.
4. Organization node
@id: {site}/clients/{clientSlug}#organization.
@type: "Organization".
name: client name or brand.
url: client site URL.
Optional:
logo → ImageObject pointing to client logo.
5. Person node (author)
@id: {site}/authors/{authorSlug}#person.
@type: "Person".
name: author name.
Optional:
description: author bio.
image: author avatar.
url: author profile URL.
Consistency Checklist (for “100% coverage”)
Title & description
Same core meaning across <title>, OG, Twitter, JSON‑LD.
Canonical URL
Identical in alternates.canonical, OG url, JSON‑LD mainEntityOfPage.@id, WebPage url, Breadcrumb last item URL.
Image
Same main hero image for OG, Twitter, and JSON‑LD image.
Dates
datePublished / dateModified in JSON‑LD match OG publishedTime / modifiedTime.
Author / publisher
Same author and client across OG and JSON‑LD.
Indexability
robots settings match your real intent (no “noindex” on important articles).
You can use this file as a reference when checking or evolving Step 12 – MetaTag & JSON‑LD so every article page reaches big‑publisher, official‑docs‑level SEO coverage.

Perfect MetaTag JSON example (reference)

Use this as a model of a “100% article‑ready” metadata object for a single article page:

```json
{
  "title": "استثمار العقارات: أهمية مواد البناء - شركة تسويقية الذكية",
  "description": "اكتشف كيف تؤثر مواد البناء على استثمارك في العقارات وأهمية اختيارها بعناية.",
  "alternates": {
    "canonical": "https://modonty.com/articles/استثمارك-في-العقارات-مواد-البناء-وأهميتها"
  },
  "openGraph": {
    "title": "استثمار العقارات: أهمية مواد البناء - شركة تسويقية الذكية",
    "description": "اكتشف كيف تؤثر مواد البناء على استثمارك في العقارات وأهمية اختيارها بعناية.",
    "url": "https://modonty.com/articles/استثمارك-في-العقارات-مواد-البناء-وأهميتها",
    "siteName": "شركة تسويقية الذكية",
    "images": [
      {
        "url": "https://res.cloudinary.com/.../article-hero-image.jpg",
        "width": 1200,
        "height": 630,
        "alt": "استثمار العقارات: أهمية مواد البناء"
      }
    ],
    "locale": "ar_SA",
    "type": "article",
    "publishedTime": "2026-01-29T07:30:00.000Z",
    "modifiedTime": "2026-01-29T07:45:15.402Z",
    "authors": [
      "Modonty"
    ],
    "section": "استثمار العقارات",
    "tags": [
      "استثمار العقارات",
      "مواد البناء",
      "استثمار عقاري"
    ]
  },
  "twitter": {
    "card": "summary_large_image",
    "title": "استثمار العقارات: أهمية مواد البناء - شركة تسويقية الذكية",
    "description": "اكتشف كيف تؤثر مواد البناء على استثمارك في العقارات وأهمية اختيارها بعناية.",
    "images": [
      "https://res.cloudinary.com/.../article-hero-image.jpg"
    ],
    "creator": "@modonty",
    "site": "@modonty"
  },
  "robots": {
    "index": true,
    "follow": true,
    "googleBot": {
      "index": true,
      "follow": true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
}
```

Checklist for using this example:
- Replace the title, description, canonical URL, image URL, and dates with the current article’s data.
- Keep `openGraph.type` as `"article"` for article detail pages.
- Always provide at least one author, a section/category, and a tags list.
- Ensure JSON‑LD for the article uses the same title, description, canonical, image, dates, author, section, and keywords.

Perfect Article JSON‑LD example (reference)

Use this as a model of a “100% article‑ready” JSON‑LD graph for a single article page:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://modonty.com/articles/استثمارك-في-العقارات-مواد-البناء-وأهميتها#article",
      "headline": "استثمار العقارات: أهمية مواد البناء",
      "description": "اكتشف كيف تؤثر مواد البناء على استثمارك في العقارات وأهمية اختيارها بعناية.",
      "datePublished": "2026-02-02T07:51:32.161Z",
      "dateModified": "2026-02-02T08:15:00.000Z",
      "author": {
        "@id": "https://modonty.com/authors/default-author#person"
      },
      "publisher": {
        "@id": "https://modonty.com/clients/client-8-تسويقية-الدمام-1768750183960-7#organization"
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://modonty.com/articles/استثمارك-في-العقارات-مواد-البناء-وأهميتها"
      },
      "inLanguage": "ar-SA",
      "isAccessibleForFree": true,
      "articleSection": "Local SEO",
      "keywords": [
        "استثمار العقارات",
        "مواد البناء",
        "استثمار عقاري"
      ],
      "image": {
        "@type": "ImageObject",
        "url": "https://res.cloudinary.com/dfegnpgwx/image/upload/v1768751409/seed/article-gallery/article-hero-image.jpg",
        "width": 1200,
        "height": 630
      },
      "wordCount": 1000,
      "articleBody": "النص الكامل للمقالة (منظف من العناصر الزخرفية قدر الإمكان).",
      "license": "https://creativecommons.org/licenses/by-nc-sa/4.0/"
    },
    {
      "@type": "WebPage",
      "@id": "https://modonty.com/articles/استثمارك-في-العقارات-مواد-البناء-وأهميتها",
      "url": "https://modonty.com/articles/استثمارك-في-العقارات-مواد-البناء-وأهميتها",
      "name": "استثمار العقارات: أهمية مواد البناء",
      "description": "اكتشف كيف تؤثر مواد البناء على استثمارك في العقارات وأهمية اختيارها بعناية.",
      "isPartOf": {
        "@type": "WebSite",
        "name": "شركة تسويقية الذكية",
        "url": "https://modonty.com"
      },
      "breadcrumb": {
        "@id": "https://modonty.com/articles/استثمارك-في-العقارات-مواد-البناء-وأهميتها#breadcrumb"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://modonty.com/articles/استثمارك-في-العقارات-مواد-البناء-وأهميتها#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "الرئيسية",
          "item": "https://modonty.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Local SEO",
          "item": "https://modonty.com/categories/local-seo"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "استثمار العقارات: أهمية مواد البناء",
          "item": "https://modonty.com/articles/استثمارك-في-العقارات-مواد-البناء-وأهميتها"
        }
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://modonty.com/clients/client-8-تسويقية-الدمام-1768750183960-7#organization",
      "name": "شركة تسويقية الذكية",
      "url": "https://تسويقية-الدمام-8.example.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://res.cloudinary.com/dfegnpgwx/image/upload/v1768750838/seed/client-logos/logo-شركة-تسويقية-الذكية.jpg",
        "width": 400,
        "height": 400
      }
    },
    {
      "@type": "Person",
      "@id": "https://modonty.com/authors/default-author#person",
      "name": "Modonty"
    }
  ]
}
```

Checklist for using this example:
- Use a valid single language code (e.g. `ar-SA`) or an array of codes, not a comma‑separated string.
- Ensure `dateModified` is the same as, or later than, `datePublished` (never earlier).
- Make the breadcrumb last item URL exactly match the canonical article URL.
- Provide `keywords` that align with your Open Graph tags / SEO keywords.
- When available, include a clean `articleBody` text to give Google maximum context.