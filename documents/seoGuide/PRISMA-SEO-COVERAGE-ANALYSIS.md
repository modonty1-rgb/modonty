# Prisma Schema SEO Coverage Analysis

> **Purpose:** Comprehensive analysis comparing Prisma schema fields against SEO Implementation Checklist to identify missing fields and ensure 100% SEO coverage.

---

## Coverage Summary

| Model | Coverage | Status | Missing Fields |
|-------|----------|--------|----------------|
| **Article** | 95% | ⚠️ Good | 4 fields (image alt text, OG image dimensions) |
| **Client** | 90% | ⚠️ Good | 3 fields (image alt text) |
| **Category** | 100% | ✅ Complete | 0 fields |
| **Author** | 95% | ⚠️ Good | 1 field (image alt text) |

**Overall Coverage: 95%**

---

## Detailed Field Comparison

### 1. Article Model Analysis

#### ✅ Covered Fields

**Basic Content:**
- ✅ `title` - Required
- ✅ `slug` - Required, unique per client
- ✅ `content` - Required
- ✅ `excerpt` - Optional but recommended

**SEO Meta Tags:**
- ✅ `seoTitle` - Required (50-60 chars)
- ✅ `seoDescription` - Required (150-160 chars)
- ✅ `metaRobots` - Optional

**Open Graph Tags:**
- ✅ `ogTitle` - Auto from SEO title
- ✅ `ogDescription` - Auto from SEO description
- ✅ `ogImage` - Required (1200x630px)
- ✅ `ogType` - Auto (default: "article")
- ✅ `ogUrl` - Auto (canonical URL)
- ✅ `ogSiteName` - Auto
- ✅ `ogLocale` - Auto
- ✅ `ogUpdatedTime` - Auto
- ✅ `ogArticleAuthor` - Required
- ✅ `ogArticlePublishedTime` - Required
- ✅ `ogArticleModifiedTime` - Auto
- ✅ `ogArticleSection` - Required (category)
- ✅ `ogArticleTag` - Optional (array)

**Twitter Cards:**
- ✅ `twitterCard` - Auto (default: "summary_large_image")
- ✅ `twitterTitle` - Auto from SEO title
- ✅ `twitterDescription` - Auto from SEO description
- ✅ `twitterImage` - Auto from OG image
- ✅ `twitterSite` - Auto
- ✅ `twitterCreator` - Optional (author handle)

**Structured Data:**
- ✅ All Schema.org fields supported via relationships and fields
- ✅ Article schema: title, description, dates, author, publisher
- ✅ Breadcrumb schema: `breadcrumbPath` (Json field)
- ✅ FAQ schema: `faqs` relationship

**Dates & Status:**
- ✅ `datePublished` - Required for published
- ✅ `dateModified` - Auto-updated
- ✅ `lastReviewed` - Optional but recommended
- ✅ `status` - Required (DRAFT, PUBLISHED, ARCHIVED)

**Images:**
- ✅ `featuredImageId` - Required (relation to Media)
- ✅ `featuredImageAlt` - Required if image exists

**Relationships:**
- ✅ `client` - Required
- ✅ `category` - Optional but recommended
- ✅ `author` - Required
- ✅ `tags` - Optional (via ArticleTag)

**Technical SEO:**
- ✅ `canonicalUrl` - Required
- ✅ `alternateLanguages` - For hreflang (Json)
- ✅ `robotsMeta` - Combined robots directive
- ✅ `sitemapPriority` - Float (0.0-1.0)
- ✅ `sitemapChangeFreq` - String

#### ❌ Missing Fields

1. **`ogImageAlt`** (String?)
   - **Priority:** ⚠️ Recommended
   - **Purpose:** Alt text for OG image (accessibility + SEO)
   - **Checklist Requirement:** Required if image exists

2. **`ogImageWidth`** (Int?)
   - **Priority:** ⚠️ Recommended
   - **Purpose:** OG image width in pixels (recommended: 1200)
   - **Checklist Requirement:** Recommended for proper rendering

3. **`ogImageHeight`** (Int?)
   - **Priority:** ⚠️ Recommended
   - **Purpose:** OG image height in pixels (recommended: 630)
   - **Checklist Requirement:** Recommended for proper rendering

4. **`twitterImageAlt`** (String?)
   - **Priority:** ⚠️ Recommended
   - **Purpose:** Alt text for Twitter image (accessibility + SEO)
   - **Checklist Requirement:** Required if image exists

**Note:** Image dimensions (width/height) can be stored in the `Media` model, but having them directly on Article would be more convenient for OG/Twitter tags.

---

### 2. Client Model Analysis

#### ✅ Covered Fields

**Basic Info:**
- ✅ `name` - Required
- ✅ `slug` - Required, unique
- ✅ `legalName` - Optional
- ✅ `description` - Required for Schema.org (100+ chars)
- ✅ `seoDescription` - Optional (150-160 chars, separate from description)

**Contact & Location:**
- ✅ `email` - Optional
- ✅ `phone` - Optional
- ✅ `contactType` - Optional (for ContactPoint schema)
- ✅ `addressStreet` - For local SEO
- ✅ `addressCity` - For local SEO
- ✅ `addressCountry` - For local SEO
- ✅ `addressPostalCode` - For local SEO

**Branding:**
- ✅ `logo` - Required (112x112px min)
- ✅ `ogImage` - Optional (1200x630px, default for articles)

**SEO Fields:**
- ✅ `seoTitle` - Optional (50-60 chars)
- ✅ `seoDescription` - Optional (150-160 chars)
- ✅ `url` - Required (HTTPS)
- ✅ `canonicalUrl` - Auto

**Social & Links:**
- ✅ `sameAs` - Recommended (array of social profile URLs)

**Dates:**
- ✅ `foundingDate` - Optional but recommended

**Twitter Cards:**
- ✅ `twitterCard` - Auto
- ✅ `twitterTitle` - Auto from SEO title
- ✅ `twitterDescription` - Auto from SEO description
- ✅ `twitterImage` - Auto from OG image
- ✅ `twitterSite` - Auto

#### ❌ Missing Fields

1. **`logoAlt`** (String?)
   - **Priority:** ⚠️ Recommended
   - **Purpose:** Alt text for logo (accessibility + SEO)
   - **Checklist Requirement:** Required if logo exists

2. **`ogImageAlt`** (String?)
   - **Priority:** ⚠️ Recommended
   - **Purpose:** Alt text for OG image (accessibility + SEO)
   - **Checklist Requirement:** Required if image exists

3. **`twitterImageAlt`** (String?)
   - **Priority:** ⚠️ Recommended
   - **Purpose:** Alt text for Twitter image (accessibility + SEO)
   - **Checklist Requirement:** Required if image exists

**Note:** Client model has good coverage. Missing fields are all image alt text fields which are important for accessibility and SEO.

---

### 3. Category Model Analysis

#### ✅ Covered Fields

**Basic Info:**
- ✅ `name` - Required
- ✅ `slug` - Required, unique
- ✅ `description` - Required (100+ chars)

**SEO Fields:**
- ✅ `seoTitle` - Optional (50-60 chars)
- ✅ `seoDescription` - Optional (150-160 chars)

**Structured Data:**
- ✅ Category schema supported via fields
- ✅ Breadcrumb schema can be generated from hierarchy

**Open Graph & Twitter:**
- ✅ All tags can be auto-generated from SEO fields

#### ❌ Missing Fields

**None** - Category model has 100% coverage for SEO checklist requirements.

---

### 4. Author Model Analysis

#### ✅ Covered Fields

**Basic Info:**
- ✅ `name` - Required
- ✅ `slug` - Required, unique
- ✅ `bio` - Required (100+ chars, Schema.org description)
- ✅ `image` - Optional but recommended (profile image)
- ✅ `url` - Optional (author page URL)

**E-E-A-T Signals:**
- ✅ `jobTitle` - Optional but recommended
- ✅ `worksFor` - Optional but recommended (Organization reference)
- ✅ `credentials` - Optional but recommended (array)
- ✅ `qualifications` - Optional but recommended (array)
- ✅ `expertiseAreas` - Optional but recommended (knowsAbout array)
- ✅ `experienceYears` - Optional
- ✅ `verificationStatus` - Optional
- ✅ `education` - Optional (Json field for structured data)

**Social Profiles:**
- ✅ `linkedIn` - Optional
- ✅ `twitter` - Optional
- ✅ `facebook` - Optional
- ✅ `sameAs` - Recommended (array of all social profiles)

**SEO Fields:**
- ✅ `seoTitle` - Optional (50-60 chars)
- ✅ `seoDescription` - Optional (150-160 chars)

**Open Graph & Twitter:**
- ✅ All tags can be auto-generated from SEO fields

#### ❌ Missing Fields

1. **`imageAlt`** (String?)
   - **Priority:** ⚠️ Recommended
   - **Purpose:** Alt text for profile image (accessibility + SEO)
   - **Checklist Requirement:** Required if image exists

---

## Missing Fields Summary

### Critical Missing Fields (High Priority)

**None** - All critical/required fields are present in the schema.

### Recommended Missing Fields (Medium Priority)

| Model | Field | Type | Purpose |
|-------|-------|------|---------|
| **Article** | `ogImageAlt` | `String?` | OG image alt text (accessibility) |
| **Article** | `ogImageWidth` | `Int?` | OG image width (1200px recommended) |
| **Article** | `ogImageHeight` | `Int?` | OG image height (630px recommended) |
| **Article** | `twitterImageAlt` | `String?` | Twitter image alt text (accessibility) |
| **Client** | `logoAlt` | `String?` | Logo alt text (accessibility) |
| **Client** | `ogImageAlt` | `String?` | OG image alt text (accessibility) |
| **Client** | `twitterImageAlt` | `String?` | Twitter image alt text (accessibility) |
| **Author** | `imageAlt` | `String?` | Profile image alt text (accessibility) |

**Total Missing Fields: 8**

---

## Schema Update Recommendations

### Priority 1: Image Alt Text Fields (Accessibility + SEO)

These fields are important for accessibility compliance and SEO best practices.

#### Article Model Additions

```prisma
model Article {
  // ... existing fields ...

  // Open Graph (Complete) - Add missing fields
  ogImageAlt     String? // Alt text for OG image (accessibility + SEO)
  ogImageWidth   Int?    // OG image width in pixels (recommended: 1200)
  ogImageHeight  Int?    // OG image height in pixels (recommended: 630)

  // Twitter Cards (Complete) - Add missing field
  twitterImageAlt String? // Alt text for Twitter image (accessibility + SEO)

  // ... rest of fields ...
}
```

#### Client Model Additions

```prisma
model Client {
  // ... existing fields ...

  // Branding - Add missing fields
  logoAlt        String? // Alt text for logo (accessibility + SEO)
  ogImageAlt     String? // Alt text for OG image (accessibility + SEO)
  twitterImageAlt String? // Alt text for Twitter image (accessibility + SEO)

  // ... rest of fields ...
}
```

#### Author Model Additions

```prisma
model Author {
  // ... existing fields ...

  // Schema.org Person - Add missing field
  imageAlt String? // Alt text for profile image (accessibility + SEO)

  // ... rest of fields ...
}
```

---

## Implementation Notes

### Field Naming Convention

All new fields follow existing naming conventions:
- `ogImageAlt` - Consistent with `ogImage`
- `twitterImageAlt` - Consistent with `twitterImage`
- `logoAlt` - Consistent with `logo`
- `imageAlt` - Consistent with `image`

### Optional Fields

All missing fields are **optional** (`String?` or `Int?`) to maintain backward compatibility:
- Existing records will have `null` values
- New records can populate these fields
- No breaking changes to existing code

### Data Migration

When adding these fields:
1. Fields are optional, so no data migration required
2. Existing records will have `null` values
3. Can be populated gradually as content is updated
4. No need to backfill existing data immediately

### Alternative Approach

**Option:** Store image dimensions in `Media` model (already has `width` and `height` fields)

**Pros:**
- Reuses existing Media model
- Single source of truth for image dimensions
- No duplication

**Cons:**
- Requires join/relation to get dimensions
- Less convenient for direct OG/Twitter tag generation
- Media model might not always be used (direct image URLs)

**Recommendation:** Add dimensions directly to Article/Client models for convenience, but also use Media model when available.

---

## Coverage by Checklist Section

### Article Checklist Coverage

| Section | Coverage | Status |
|---------|----------|--------|
| Step 1: Basic Content | 100% | ✅ Complete |
| Step 2: SEO Meta Tags | 100% | ✅ Complete |
| Step 3: Open Graph Tags | 90% | ⚠️ Missing alt text & dimensions |
| Step 4: Twitter Cards | 85% | ⚠️ Missing alt text |
| Step 5: Structured Data | 100% | ✅ Complete |
| Step 6: Dates & Status | 100% | ✅ Complete |
| Step 7: Images | 90% | ⚠️ Missing OG/Twitter alt text |
| Step 8: Relationships | 100% | ✅ Complete |

### Client Checklist Coverage

| Section | Coverage | Status |
|---------|----------|--------|
| Step 1: Basic Info | 100% | ✅ Complete |
| Step 2: Contact & Location | 100% | ✅ Complete |
| Step 3: Branding | 75% | ⚠️ Missing alt text fields |
| Step 4: SEO Fields | 100% | ✅ Complete |
| Step 5: Social & Links | 100% | ✅ Complete |
| Step 6: Dates | 100% | ✅ Complete |
| Step 7: Open Graph & Twitter | 85% | ⚠️ Missing alt text |

### Category Checklist Coverage

| Section | Coverage | Status |
|---------|----------|--------|
| Step 1: Basic Info | 100% | ✅ Complete |
| Step 2: SEO Fields | 100% | ✅ Complete |
| Step 3: Structured Data | 100% | ✅ Complete |
| Step 4: Open Graph & Twitter | 100% | ✅ Complete |

### Author Checklist Coverage

| Section | Coverage | Status |
|---------|----------|--------|
| Step 1: Basic Info | 95% | ⚠️ Missing image alt text |
| Step 2: E-E-A-T Signals | 100% | ✅ Complete |
| Step 3: Social Profiles | 100% | ✅ Complete |
| Step 4: SEO Fields | 100% | ✅ Complete |
| Step 5: Open Graph & Twitter | 100% | ✅ Complete |

---

## Priority Recommendations

### High Priority (Should Add)

1. **Image Alt Text Fields** - Required for accessibility compliance (WCAG 2.1 AA)
   - `Article.ogImageAlt`
   - `Article.twitterImageAlt`
   - `Client.logoAlt`
   - `Client.ogImageAlt`
   - `Client.twitterImageAlt`
   - `Author.imageAlt`

### Medium Priority (Nice to Have)

2. **OG Image Dimensions** - Helpful for proper rendering
   - `Article.ogImageWidth`
   - `Article.ogImageHeight`

**Note:** Dimensions can also be retrieved from Media model if image is stored there.

---

## Migration Strategy

### Step 1: Add Fields to Schema

Add all 8 missing fields to respective models (all optional).

### Step 2: Generate Prisma Client

```bash
cd dataLayer
pnpm prisma:generate
```

### Step 3: Update Application Code

- Update forms to include alt text fields
- Update validation to require alt text when image exists
- Update structured data generation to include alt text
- Update OG/Twitter tag generation to include alt text and dimensions

### Step 4: Gradual Data Population

- New records: Require alt text when images are added
- Existing records: Can be updated gradually
- No immediate backfill required (fields are optional)

---

## Validation Checklist

After adding missing fields, verify:

- [ ] All fields added to schema
- [ ] Prisma client generated successfully
- [ ] All apps (admin, beta, home) build successfully
- [ ] Forms updated to include new fields
- [ ] Validation updated to require alt text when image exists
- [ ] Structured data includes alt text
- [ ] OG tags include alt text and dimensions
- [ ] Twitter tags include alt text
- [ ] No breaking changes to existing code

---

## Conclusion

### Current Status: **95% Coverage**

The Prisma schema has excellent coverage of SEO requirements. The missing fields are primarily:
- **Image alt text fields** (8 fields) - Important for accessibility and SEO
- **OG image dimensions** (2 fields) - Helpful but can be derived from Media model

### Recommendation

**Add the 8 missing fields** to achieve 100% coverage:
- All fields are optional (backward compatible)
- No data migration required
- Improves accessibility compliance
- Enhances SEO best practices
- Minimal implementation effort

### Next Steps

1. Review and approve missing fields
2. Add fields to Prisma schema
3. Generate Prisma client
4. Update application forms and validation
5. Update structured data and meta tag generation
6. Test all changes

---

**Last Updated:** January 2025  
**Schema Version:** Current  
**Coverage:** 95% (8 fields missing)  
**Status:** Ready for schema updates
