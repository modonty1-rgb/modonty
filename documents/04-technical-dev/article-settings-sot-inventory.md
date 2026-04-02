# Article ↔ Settings SOT (Single Source of Truth)

## Remove from Article → Use from Settings

Values **removed from Article** and **read from Settings** only. No fallback.

| Remove from Article | Use from Settings |
|---------------------|-------------------|
| `inLanguage` | `inLanguage` |
| `metaRobots` | `defaultMetaRobots` |
| `ogType` | `defaultOgType` |
| `twitterCard` | `defaultTwitterCard` |
| `twitterSite` | `twitterSite` |
| `twitterCreator` | `twitterCreator` |
| `sitemapPriority` | `articleDefaultSitemapPriority` or `defaultSitemapPriority` |
| `sitemapChangeFreq` | `articleDefaultSitemapChangeFreq` or `defaultSitemapChangeFreq` |
| `license` | `defaultLicense` |
| `isAccessibleForFree` | `defaultIsAccessibleForFree` |
| `alternateLanguages` | `defaultAlternateLanguages` |
| `contentFormat` | `defaultContentFormat` |

**Render-only** (Article has no column): Use Settings `defaultOgLocale` for article page meta/OG locale; `defaultHreflang`, `defaultNotranslate` for page meta when needed.

## Article Fields That Stay

Values stay on Article; Settings only supplies validation rules (min/max/restrict).

- `seoTitle` → rules: `seoTitleMin`, `seoTitleMax`, `seoTitleRestrict`
- `seoDescription` → rules: `seoDescriptionMin`, `seoDescriptionMax`, `seoDescriptionRestrict`
- OG/Twitter title/description → rules: `ogTitleMax`, `ogTitleRestrict`, `ogDescriptionMax`, `ogDescriptionRestrict`, `twitterTitleMax`, `twitterTitleRestrict`, `twitterDescriptionMax`, `twitterDescriptionRestrict`

## Article Fields Unchanged

All other fields stay (id, title, slug, excerpt, content, clientId, categoryId, authorId, status, scheduledAt, featured, datePublished, dateModified, lastReviewed, mainEntityOfPage, ogArticleAuthor, ogArticlePublishedTime, ogArticleModifiedTime, canonicalUrl, breadcrumbPath, featuredImageId, jsonLd*, articleBodyText, semanticKeywords, citations, seoKeywords, nextjsMetadata*, etc.)

## OG Fields (Derived, Not Stored)

For articles, these Open Graph values are **not stored** on Article; they are **derived** from a single source of truth. Same URL for canonical and OG is best practice.

| OG Field | SOT (Source) | Notes |
|----------|--------------|-------|
| **OG URL** | **Canonical URL** | `og:url` and JSON-LD `mainEntityOfPage` use the same URL as the article canonical |
| **OG Site Name** | **Client name** | Derived from `article.client.name`, fallback "مودونتي" |
| **OG Article Section** | **Category** | Derived from `article.category?.name` |
| **OG Article Tags** | **Article tags** | Derived from article's tags relation (tag names) |

Form may show these as read-only or editable for preview; metadata generation uses the SOT above.

## Implementation

1. **Schema**: Remove 12 Article columns above. Ensure Settings has `defaultIsAccessibleForFree`, `defaultAlternateLanguages`, `defaultContentFormat`. Run migration.
2. **Code**: Any place needing these values must read Settings (singleton). Do not read from Article for them.

**Tables**: Article: `articles`. Settings: `settings`. Schema: `dataLayer/prisma/schema/schema.prisma`
