# SEO Technical Reference

Quick lookup for implementation details, diagnostics, and integration points.

---

## Schema Coverage by Table

| Model | SEO Fields | Config | Schema | Status |
|-------|-----------|--------|--------|--------|
| **Client** | seoTitle, seoDescription, ogImage, ogImageAlt, ogImageWidth/Height, twitterCard, twitterImageAlt, logoAlt, canonicalUrl (10 fields) | organizationSEOConfig | Organization | ✅ |
| **Article** | seoTitle, seoDescription, ogImage, ogImageAlt, ogImageWidth/Height, twitterCard, twitterImageAlt, featuredImageAlt, canonicalUrl (9 fields) | articleSEOConfig | Article | ✅ |
| **Author** | seoTitle, seoDescription, imageAlt (3 fields) | authorSEOConfig | Person | ✅ |
| **Category** | seoTitle, seoDescription (2 fields) | categorySEOConfig | Category | ✅ |

**Models without SEO configs:** Tag, Industry, User, Account, Session, VerificationToken, ArticleVersion, ArticleTag, Media, Analytics, Subscriber, FAQ, RelatedArticle (no public SEO pages or no SEO fields).

---

## Image Field Validation Rules

### Logo Alt (Client)
- Image exists + alt provided: 5 points (Good)
- Image exists + alt missing: 0 points (Error)
- No image: 0 points (Info)

### OG Image Alt (Client, Article)
- Image exists + alt provided: 5 points (Good)
- Image exists + alt missing: 0 points (Error)
- No image: 0 points (Info)

### OG Image Dimensions (Client, Article)
- 1200x630px: 5 points (Optimal)
- 600x314px+: 3 points (Minimum)
- One dimension only: 1 point (Warning)
- Missing: 0 points (Info)

### Twitter Image Alt (Client, Article)
- Image exists + alt provided: 5 points (Good)
- Image exists + alt missing: 0 points (Error)
- No image: 0 points (Info)

### Featured Image Alt (Article)
- Image exists + alt provided: 5 points (Good)
- Image exists + alt missing: 0 points (Error)
- No image: 0 points (Info)

### Author Image Alt (Author)
- Image exists + alt provided: 5 points (Good)
- Image exists + alt missing: 0 points (Error)
- No image: 0 points (Info)

---

## Scoring Max Points

| Entity | Score | Components |
|--------|-------|-------------|
| Client | 200 | 24 validators |
| Article | 200 | 17 validators |
| Author | 150 | 10 validators |
| Category | 100 | 8 validators |

**Target:** 80%+ for optimal SEO

---

## Database Storage Pattern

### Meta Tags
- **Individual columns:** seoTitle, seoDescription, metaRobots, etc. (source of truth)
- **Cached object:** metaTags Json (Client, Modonty only)
- **Consistency:** Client/Modonty cache generated from individual columns

### JSON-LD
- **Single cached string:** jsonLdStructuredData (all entities)
- **Validation report:** jsonLdValidationReport (validates structure)
- **Versioning:** Article only (jsonLdVersion, jsonLdHistory)

---

## Field Character Limits

- SEO Title: 50-60 chars (search results)
- SEO Description: 150-160 chars (search snippet)
- Image Alt Text: 125 chars max

---

## Required Image Dimensions

- Logo: 112x112px minimum
- Featured Image: 1200x630px recommended
- OG Image: 1200x630px recommended
- Twitter Image: 1200x628px (min 600x314px)

---

## Date Formats

ISO 8601 format required:
- Date only: YYYY-MM-DD
- Date + time: YYYY-MM-DDTHH:mm:ssZ

---

## Common Issues & Fixes

### Issue 1: Image Alt Text Not Saving on Alt-Only Edit
**Fix:** DeferredImageUpload needs `onAltChange` callback to update form state when alt text is edited without re-uploading image.

### Issue 2: SEO Score Discrepancy Between Components
**Cause:** Data source mismatch (form has dimensions from ogImageMedia, table query doesn't include media relation).
**Fix:** Include media relations in table queries or add width/height fields to schema.

### Issue 3: Missing OG Image Dimensions Validation
**Cause:** Client model schema missing ogImageWidth and ogImageHeight fields.
**Fix:** Add fields to schema or read dimensions from related Media model.

---

## Integration Points

### SEO Doctor Component
- Accepts config (organizationSEOConfig, articleSEOConfig, etc.)
- Displays validation results for all fields
- Real-time scoring feedback
- Used in edit forms

### SEO Health Gauge Component
- Accepts config and entity data
- Shows percentage score
- Used in tables and dashboards
- Works with any config

### Structured Data Generation
- `generateOrganizationStructuredData` (Client)
- `generateArticleStructuredData` (Article)
- `generatePersonStructuredData` (Author)
- `generateCategoryStructuredData` (Category)

---

## API Validators

All validators follow pattern:
- Check required field
- Return { status, message, points }
- Status: "good", "warning", "error", "info"
- Points: 0-5 typically

---

**Last Updated:** April 2026
**Scope:** Client, Article, Author, Category models
**Coverage:** 100% of SEO fields
