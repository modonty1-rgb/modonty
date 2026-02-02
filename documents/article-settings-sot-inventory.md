# Article ↔ Settings SOT

**SOT = Settings table.** Values below are **removed from Article** and **read from Settings** only. No fallback.

---

## Remove from Article → Use from Settings

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

**Render-only (Article has no column):** Use Settings `defaultOgLocale` for article page meta/OG locale; `defaultHreflang`, `defaultNotranslate` for page meta when needed.

---

## Article fields that stay (validation from Settings only)

Values stay on Article; Settings only supplies rules (min/max/restrict).

- `seoTitle` → rules: `seoTitleMin`, `seoTitleMax`, `seoTitleRestrict`
- `seoDescription` → rules: `seoDescriptionMin`, `seoDescriptionMax`, `seoDescriptionRestrict`
- OG/Twitter title/description when derived → rules: `ogTitleMax`, `ogTitleRestrict`, `ogDescriptionMax`, `ogDescriptionRestrict`, `twitterTitleMax`, `twitterTitleRestrict`, `twitterDescriptionMax`, `twitterDescriptionRestrict`

---

## Article fields unchanged

All other Article fields (id, title, slug, excerpt, content, clientId, categoryId, authorId, status, scheduledAt, featured, datePublished, dateModified, lastReviewed, mainEntityOfPage, ogArticleAuthor, ogArticlePublishedTime, ogArticleModifiedTime, canonicalUrl, breadcrumbPath, featuredImageId, jsonLd*, articleBodyText, semanticKeywords, citations, seoKeywords, nextjsMetadata*, etc.) stay; no removal, no Settings SOT.

---

## OG fields (derived, not stored on Article)

For articles, these Open Graph values are **not stored** on Article; they are **derived** from a single source of truth. Same URL for canonical and OG is best practice.

| OG field | SOT (source) | Notes |
|----------|--------------|--------|
| **OG URL** | **Canonical URL** | `og:url` and JSON-LD `mainEntityOfPage` use the same URL as the article canonical. Edit Canonical URL in Meta Tags step; OG URL is derived everywhere (metadata generator, modonty article page, previews). |
| **OG Site Name** | **Client name** | `og:site_name` is derived from the article’s client (`article.client.name`), fallback "مودونتي". |
| **OG Article Section** | **Category** | `og:article:section` is derived from the article’s category (`article.category?.name`). |
| **OG Article Tags** | **Article tags** | `og:article:tag` is derived from the article’s tags relation (tag names). |

Form may show these as read-only or editable for preview; metadata generation uses the SOT above.

---

## Implementation

1. **Schema:** Remove the 12 Article columns in the table above. Ensure Settings has `defaultIsAccessibleForFree`, `defaultAlternateLanguages`, `defaultContentFormat` (already in schema). Run migration.
2. **Code:** Any place that needs these values must read Settings (singleton). Do not read from Article for them.

---

*Article: `articles`. Settings: `settings`. Schema: `dataLayer/prisma/schema/schema.prisma`.*
