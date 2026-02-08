# SEO Implementation Checklist - Step-by-Step Guide

> **Purpose:** Clear, actionable checklist to follow when adding new Articles, Clients, Categories, or Authors to ensure 100% SEO coverage with no missing fields.

---

## 📋 Quick Reference Table

| Field | Entity | Required | Character Limit | Format | Auto-Generated |
|-------|--------|----------|----------------|--------|----------------|
| **Title** | All | ✅ Yes | - | Text | ❌ No |
| **Slug** | All | ✅ Yes | - | URL-safe | ✅ Yes |
| **SEO Title** | All | ✅ Yes | 50-60 chars | Text | ❌ No |
| **SEO Description** | All | ✅ Yes | 150-160 chars | Text | ❌ No |
| **Description (Schema.org)** | All | ✅ Yes | 100+ chars | Text | ❌ No |
| **Featured Image** | Article | ✅ Yes | - | 1200x630px | ❌ No |
| **Logo** | Client | ✅ Yes | - | 112x112px min | ❌ No |
| **Profile Image** | Author | ⚠️ Recommended | - | Any size | ❌ No |
| **Image Alt Text** | All (if image) | ✅ Yes | - | Text | ❌ No |
| **Date Published** | Article | ✅ Yes | - | ISO 8601 | ❌ No |
| **Date Modified** | Article | ✅ Yes | - | ISO 8601 | ✅ Yes |
| **Last Reviewed** | Article | ⚠️ Recommended | - | ISO 8601 | ❌ No |
| **Founding Date** | Client | ⚠️ Recommended | - | ISO 8601 | ❌ No |
| **URL** | Client | ✅ Yes | - | HTTPS | ❌ No |
| **Canonical URL** | All | ✅ Yes | - | HTTPS | ✅ Yes |
| **OG Tags** | All | ✅ Yes | - | Various | ✅ Partial |
| **Twitter Cards** | All | ✅ Yes | - | Various | ✅ Partial |
| **Structured Data** | All | ✅ Yes | - | JSON-LD | ❌ No |
| **Social Profiles** | Client, Author | ⚠️ Recommended | - | URLs array | ❌ No |
| **E-E-A-T Signals** | Author | ⚠️ Recommended | - | Various | ❌ No |

**Legend:**
- ✅ Yes = Required field
- ⚠️ Recommended = Optional but improves SEO score
- ❌ No = Manual input required
- ✅ Yes/Partial = Auto-generated from other fields

---

## 📝 Step-by-Step Checklists

### 1. Article Checklist

Follow these steps in order when creating a new article:

#### Step 1: Basic Content ✅

- [ ] **Title** (Required)
  - Clear, descriptive title
  - Include primary keyword naturally
  - 60-80 characters recommended

- [ ] **Slug** (Required, Auto-generated)
  - URL-safe format
  - Auto-generated from title
  - Verify it's unique per client

- [ ] **Content** (Required)
  - Full article body
  - Markdown or HTML format
  - Minimum 300 words recommended

- [ ] **Excerpt** (Optional but Recommended)
  - Brief summary (100-200 chars)
  - Used in listings and previews

#### Step 2: SEO Meta Tags ✅

- [ ] **SEO Title** (Required)
  - 50-60 characters
  - Include brand/keyword
  - Unique per page
  - Can be same as title or optimized version

- [ ] **SEO Description** (Required)
  - 150-160 characters
  - Compelling, action-oriented
  - Include primary keyword naturally
  - Separate from Schema.org description

- [ ] **Meta Robots** (Optional)
  - Default: `index, follow`
  - Use `noindex` only if needed

#### Step 3: Open Graph Tags ✅

- [ ] **og:title** (Auto from SEO Title)
  - Auto-generated from SEO Title
  - 55-60 characters optimal

- [ ] **og:description** (Auto from SEO Description)
  - Auto-generated from SEO Description
  - 110-150 characters optimal

- [ ] **og:image** (Required)
  - 1200x630px recommended
  - High quality, relevant to content
  - Format: WebP/AVIF preferred, JPG/PNG acceptable

- [ ] **og:type** (Auto)
  - Set to `article` automatically

- [ ] **og:url** (Auto)
  - Canonical URL auto-generated

- [ ] **og:site_name** (Auto)
  - Site name auto-generated

- [ ] **og:locale** (Auto)
  - Language/region auto-generated (e.g., "ar_SA")

- [ ] **og:article:author** (Required)
  - Author name or profile URL

- [ ] **og:article:published_time** (Required)
  - Publication date in ISO 8601 format

- [ ] **og:article:modified_time** (Auto)
  - Auto-updated on changes

- [ ] **og:article:section** (Required)
  - Category name

- [ ] **og:article:tag** (Optional)
  - Array of article tags

- [ ] **og:updated_time** (Auto)
  - Last update timestamp

#### Step 4: Twitter Cards ✅

- [ ] **twitter:card** (Auto)
  - Set to `summary_large_image` automatically

- [ ] **twitter:title** (Auto from SEO Title)
  - Auto-generated from SEO Title
  - Max 70 characters

- [ ] **twitter:description** (Auto from SEO Description)
  - Auto-generated from SEO Description
  - Max 200 characters

- [ ] **twitter:image** (Auto from OG Image)
  - Auto-generated from OG Image
  - Min 600x314px, recommended 1200x628px

- [ ] **twitter:site** (Auto)
  - Site Twitter handle auto-generated

- [ ] **twitter:image:alt** (Required if image exists)
  - Descriptive alt text for image
  - Accessibility + SEO

- [ ] **twitter:creator** (Optional)
  - Author's Twitter handle (@username)

#### Step 5: Structured Data (JSON-LD) ✅

- [ ] **Article Schema** (Required)
  - @type: "Article"
  - headline: Article title
  - description: Schema.org description (100+ chars, separate from SEO description)
  - datePublished: ISO 8601
  - dateModified: ISO 8601
  - author: Author schema reference
  - publisher: Organization schema reference
  - image: Featured image URL
  - mainEntityOfPage: Canonical URL

- [ ] **Author Schema** (Required)
  - @type: "Person"
  - name: Author name
  - url: Author profile URL
  - jobTitle: Author job title
  - worksFor: Organization reference
  - sameAs: Social profiles array

- [ ] **Organization Schema** (Required)
  - @type: "Organization"
  - name: Client/Organization name
  - url: Organization website
  - logo: Logo URL
  - sameAs: Social profiles array

- [ ] **Breadcrumb Schema** (Required)
  - @type: "BreadcrumbList"
  - itemListElement: Array of breadcrumb items

- [ ] **FAQ Schema** (If applicable)
  - @type: "FAQPage"
  - mainEntity: Array of Question/Answer pairs

#### Step 6: Dates & Status ✅

- [ ] **Date Published** (Required for published articles)
  - ISO 8601 format (YYYY-MM-DD or full datetime)
  - Set when publishing

- [ ] **Date Modified** (Auto)
  - Auto-updated on changes

- [ ] **Last Reviewed** (Optional but Recommended)
  - Content freshness signal
  - Update when content is reviewed/updated

- [ ] **Status** (Required)
  - DRAFT, PUBLISHED, or ARCHIVED

#### Step 7: Images ✅

- [ ] **Featured Image** (Required)
  - 1200x630px recommended
  - High quality, relevant to content
  - Format: WebP/AVIF preferred

- [ ] **Featured Image Alt Text** (Required if image exists)
  - Descriptive, keyword-rich
  - Accessibility + SEO
  - 125 characters or less

- [ ] **Image Optimization**
  - Lazy loading enabled
  - Responsive images (srcset)
  - Proper file naming (descriptive, lowercase, hyphens)

#### Step 8: Relationships ✅

- [ ] **Client** (Required)
  - Select client/organization

- [ ] **Category** (Optional but Recommended)
  - Select relevant category
  - Improves organization and SEO

- [ ] **Author** (Required)
  - Select author
  - Author must have complete profile

- [ ] **Tags** (Optional)
  - Add relevant tags
  - Improves discoverability

---

### 2. Client/Organization Checklist

Follow these steps when creating a new client:

#### Step 1: Basic Info ✅

- [ ] **Name** (Required)
  - Organization name
  - Clear and official

- [ ] **Legal Name** (Optional)
  - Official legal name if different

- [ ] **Slug** (Required, Auto-generated)
  - URL-safe format
  - Auto-generated from name
  - Must be unique

- [ ] **Description** (Required for Schema.org)
  - 100+ characters
  - Business/organization description
  - Separate from SEO description
  - Used in Schema.org structured data

- [ ] **SEO Description** (Optional)
  - 150-160 characters
  - Separate from Schema.org description
  - Optimized for search results

#### Step 2: Contact & Location ✅

- [ ] **Email** (Optional)
  - Contact email address

- [ ] **Phone** (Optional)
  - Contact phone number

- [ ] **Contact Type** (Optional)
  - customer service, technical support, sales, etc.
  - Used in ContactPoint schema

- [ ] **Address** (For Local SEO)
  - [ ] Street address
  - [ ] City
  - [ ] Country
  - [ ] Postal Code
  - Required for local businesses

#### Step 3: Branding ✅

- [ ] **Logo** (Required)
  - 112x112px minimum
  - PNG/SVG/JPG format
  - High quality, clear logo

- [ ] **Logo Alt Text** (Required if logo exists)
  - Descriptive alt text
  - Example: "[Company Name] logo"

- [ ] **OG Image** (Optional)
  - 1200x630px
  - Default image for all articles
  - Used if article doesn't have featured image

#### Step 4: SEO Fields ✅

- [ ] **SEO Title** (Optional)
  - 50-60 characters
  - Optimized for search results

- [ ] **SEO Description** (Optional)
  - 150-160 characters
  - Compelling description for search results

- [ ] **URL** (Required)
  - Organization website URL
  - Must be HTTPS
  - Full absolute URL

- [ ] **Canonical URL** (Auto)
  - Auto-generated from slug

#### Step 5: Social & Links ✅

- [ ] **Social Profiles** (Recommended)
  - [ ] LinkedIn URL
  - [ ] Twitter URL
  - [ ] Facebook URL
  - [ ] Other social profiles
  - Added to sameAs array in Schema.org

- [ ] **Website URL** (Required)
  - Main website URL
  - HTTPS required

#### Step 6: Dates ✅

- [ ] **Founding Date** (Optional but Recommended)
  - ISO 8601 format (YYYY-MM-DD)
  - Used in Schema.org Organization
  - Shows business history/authority

#### Step 7: Open Graph & Twitter ✅

- [ ] **All OG Tags** (Auto-generated)
  - Auto-generated from SEO fields and basic info
  - Verify all tags are present

- [ ] **All Twitter Card Tags** (Auto-generated)
  - Auto-generated from OG tags
  - Verify all tags are present

---

### 3. Category Checklist

Follow these steps when creating a new category:

#### Step 1: Basic Info ✅

- [ ] **Name** (Required)
  - Category name
  - Clear and descriptive

- [ ] **Slug** (Required, Auto-generated)
  - URL-safe format
  - Auto-generated from name
  - Must be unique

- [ ] **Description** (Required)
  - 100+ characters
  - Category description
  - Used in Schema.org structured data

#### Step 2: SEO Fields ✅

- [ ] **SEO Title** (Optional)
  - 50-60 characters
  - Optimized for search results

- [ ] **SEO Description** (Optional)
  - 150-160 characters
  - Compelling description for search results

#### Step 3: Structured Data ✅

- [ ] **Category Schema** (Required)
  - @type: "Category" or appropriate type
  - name: Category name
  - description: Category description (100+ chars)
  - url: Category page URL

- [ ] **Breadcrumb Schema** (Required)
  - @type: "BreadcrumbList"
  - Include category in breadcrumb path

#### Step 4: Open Graph & Twitter ✅

- [ ] **All OG Tags** (Auto-generated)
  - Auto-generated from SEO fields
  - Verify all tags are present

- [ ] **All Twitter Card Tags** (Auto-generated)
  - Auto-generated from OG tags
  - Verify all tags are present

---

### 4. Author Checklist

Follow these steps when creating a new author:

#### Step 1: Basic Info ✅

- [ ] **Name** (Required)
  - Author full name
  - Clear and professional

- [ ] **Slug** (Required, Auto-generated)
  - URL-safe format
  - Auto-generated from name
  - Must be unique

- [ ] **Bio/Description** (Required)
  - 100+ characters
  - Author biography
  - Used in Schema.org Person
  - Separate from SEO description

- [ ] **Profile Image** (Optional but Recommended)
  - Professional headshot
  - Any size (square recommended)
  - High quality

- [ ] **Image Alt Text** (Required if image exists)
  - Descriptive alt text
  - Example: "[Author Name] profile photo"

#### Step 2: E-E-A-T Signals (Recommended) ✅

- [ ] **Job Title** (Optional but Recommended)
  - Current job title
  - Shows expertise

- [ ] **Works For** (Optional but Recommended)
  - Organization/Client reference
  - Shows affiliation

- [ ] **Credentials** (Optional but Recommended)
  - Degrees, certifications
  - Array of credentials
  - Shows expertise

- [ ] **Qualifications** (Optional but Recommended)
  - Professional qualifications
  - Array of qualifications
  - Shows expertise

- [ ] **Expertise Areas** (Optional but Recommended)
  - Topics of specialization
  - knowsAbout array in Schema.org
  - Shows expertise

- [ ] **Experience Years** (Optional)
  - Years of experience in field
  - Shows experience

- [ ] **Verification Status** (Optional)
  - Verified author status
  - Shows trustworthiness

#### Step 3: Social Profiles ✅

- [ ] **LinkedIn** (Optional)
  - LinkedIn profile URL

- [ ] **Twitter** (Optional)
  - Twitter profile URL

- [ ] **Facebook** (Optional)
  - Facebook profile URL

- [ ] **sameAs Array** (Recommended)
  - All social profiles
  - Used in Schema.org Person

#### Step 4: SEO Fields ✅

- [ ] **SEO Title** (Optional)
  - 50-60 characters
  - Optimized for search results

- [ ] **SEO Description** (Optional)
  - 150-160 characters
  - Compelling description for search results

- [ ] **URL** (Optional)
  - Author profile page URL

#### Step 5: Open Graph & Twitter ✅

- [ ] **All OG Tags** (Auto-generated)
  - Auto-generated from SEO fields
  - Verify all tags are present

- [ ] **All Twitter Card Tags** (Auto-generated)
  - Auto-generated from OG tags
  - Verify all tags are present

---

## 📏 Format Requirements

### Text Fields

| Field | Optimal Length | Max Length | Purpose |
|-------|---------------|------------|---------|
| SEO Title | 50-60 chars | 60 chars | Search results display |
| SEO Description | 150-160 chars | 160 chars | Search snippet |
| OG Title | 55-60 chars | 60 chars | Social media preview |
| OG Description | 110-150 chars | 150 chars | Social media preview |
| Twitter Title | 60-70 chars | 70 chars | Twitter card display |
| Twitter Description | 150-200 chars | 200 chars | Twitter card display |
| Schema.org Description | 100+ chars | - | Structured data |
| Image Alt Text | 50-125 chars | 125 chars | Accessibility + SEO |

### Images

| Image Type | Minimum Size | Recommended Size | Format | Alt Text Required |
|------------|-------------|------------------|--------|-------------------|
| Featured Image (Article) | 600x314px | 1200x630px | WebP/AVIF preferred | ✅ Yes |
| Logo (Client) | 112x112px | 200x200px | PNG/SVG/JPG | ✅ Yes |
| Profile Image (Author) | 100x100px | 400x400px | Any | ✅ Yes |
| OG Image | 600x314px | 1200x630px | WebP/AVIF preferred | ✅ Yes |
| Twitter Image | 600x314px | 1200x628px | WebP/AVIF preferred | ✅ Yes |

**Image Best Practices:**
- Use WebP or AVIF format when possible
- Enable lazy loading
- Use responsive images (srcset)
- Descriptive file names (lowercase, hyphens)
- Optimize file size (compress without quality loss)

### Dates

| Date Field | Format | Example | Required |
|------------|--------|---------|----------|
| Date Published | ISO 8601 | 2025-01-15 or 2025-01-15T10:30:00Z | ✅ Yes (published) |
| Date Modified | ISO 8601 | Auto-updated | ✅ Yes (auto) |
| Last Reviewed | ISO 8601 | 2025-01-15 | ⚠️ Recommended |
| Founding Date | ISO 8601 | 2020-01-15 | ⚠️ Recommended |

**ISO 8601 Format:**
- Date only: `YYYY-MM-DD` (e.g., `2025-01-15`)
- Date + Time: `YYYY-MM-DDTHH:mm:ssZ` (e.g., `2025-01-15T10:30:00Z`)

### URLs

| URL Type | Format | Example | Required |
|----------|--------|---------|----------|
| Website URL | HTTPS absolute | `https://example.com` | ✅ Yes |
| Canonical URL | HTTPS absolute | `https://example.com/article-slug` | ✅ Yes (auto) |
| Social Profile | HTTPS absolute | `https://linkedin.com/company/example` | ⚠️ Recommended |
| Image URL | HTTPS absolute | `https://cdn.example.com/image.jpg` | ✅ Yes (if image) |

**URL Best Practices:**
- Always use HTTPS (never HTTP)
- Use absolute URLs (full URL with domain)
- No trailing slashes (except root)
- URL-safe characters only
- Descriptive, keyword-rich slugs

---

## 🤖 Auto-Generated Fields

### Fully Auto-Generated (No Manual Input)

- **Slug** - Generated from title/name
- **Canonical URL** - Generated from slug + domain
- **Date Modified** - Auto-updated on changes
- **og:type** - Set based on entity type
- **og:url** - Generated from canonical URL
- **og:site_name** - From site configuration
- **og:locale** - From site configuration
- **twitter:card** - Set to `summary_large_image`
- **twitter:site** - From site configuration

### Partially Auto-Generated (From Other Fields)

- **og:title** - Auto from SEO Title (can override)
- **og:description** - Auto from SEO Description (can override)
- **og:image** - Auto from Featured Image (can override)
- **og:article:modified_time** - Auto-updated
- **og:updated_time** - Auto-updated
- **twitter:title** - Auto from SEO Title (can override)
- **twitter:description** - Auto from SEO Description (can override)
- **twitter:image** - Auto from OG Image (can override)

### Manual Input Required

- **Title/Name** - Manual input
- **Content** - Manual input
- **SEO Title** - Manual input (required)
- **SEO Description** - Manual input (required)
- **Description (Schema.org)** - Manual input (required, separate from SEO description)
- **Images** - Manual upload/selection
- **Image Alt Text** - Manual input (required if image exists)
- **Date Published** - Manual input (required for published content)
- **Last Reviewed** - Manual input (optional)
- **Founding Date** - Manual input (optional)
- **Social Profiles** - Manual input (optional)
- **E-E-A-T Signals** - Manual input (optional)
- **Relationships** - Manual selection (Client, Category, Author, Tags)

---

## ✅ Validation Checklist

Before publishing any content, verify:

### Required Fields ✅

- [ ] All required fields are filled
- [ ] No empty required fields
- [ ] All relationships are set (Client, Author for Articles)

### Character Limits ✅

- [ ] SEO Title: 50-60 characters
- [ ] SEO Description: 150-160 characters
- [ ] Schema.org Description: 100+ characters
- [ ] Image Alt Text: 50-125 characters

### Images ✅

- [ ] All images have alt text
- [ ] Featured images are 1200x630px (or minimum size)
- [ ] Logos are 112x112px minimum
- [ ] Images are optimized (WebP/AVIF when possible)
- [ ] Images use HTTPS URLs

### URLs ✅

- [ ] All URLs use HTTPS (never HTTP)
- [ ] URLs are absolute (full URL with domain)
- [ ] Canonical URLs are correct
- [ ] No broken links

### Dates ✅

- [ ] Dates are in ISO 8601 format
- [ ] Date Published is set for published content
- [ ] Dates are valid (not in future for published content)

### Structured Data ✅

- [ ] Structured data validates (use [Google Rich Results Test](https://search.google.com/test/rich-results))
- [ ] All required Schema.org fields are present
- [ ] JSON-LD format is correct
- [ ] No errors in structured data

### Open Graph & Twitter ✅

- [ ] All essential OG tags are present
- [ ] OG image is correct size (1200x630px)
- [ ] All Twitter Card tags are present
- [ ] Test with [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Test with [Twitter Card Validator](https://cards-dev.twitter.com/validator)

### Technical SEO ✅

- [ ] Mobile-friendly (use [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly))
- [ ] Page speed is acceptable (use [PageSpeed Insights](https://pagespeed.web.dev/))
- [ ] Core Web Vitals are good:
  - [ ] LCP < 2.5s
  - [ ] INP < 200ms
  - [ ] CLS < 0.1
- [ ] No console errors
- [ ] No broken resources

### Content Quality ✅

- [ ] Content is original and valuable
- [ ] Content is well-written (no grammar/spelling errors)
- [ ] Content is properly formatted
- [ ] Images are relevant to content
- [ ] Links are relevant and working

---

## 🎯 Quick Tips

1. **Always fill SEO Title and SEO Description** - These are critical for search visibility
2. **Separate SEO Description from Schema.org Description** - They serve different purposes
3. **Always add alt text to images** - Required for accessibility and SEO
4. **Use HTTPS for all URLs** - Google requires secure sites
5. **Validate structured data** - Use Google Rich Results Test before publishing
6. **Test social sharing** - Verify OG and Twitter tags work correctly
7. **Check mobile-friendliness** - Mobile-first indexing is critical
8. **Monitor Core Web Vitals** - Performance affects rankings
9. **Update Last Reviewed date** - Shows content freshness
10. **Complete E-E-A-T signals** - Especially important for Authors

---

## 📚 Related Documents

- [SEO-GUIDELINE.md](SEO-GUIDELINE.md) - Complete SEO guidelines and best practices
- [SEO-GUIDELINE-REVIEW.md](SEO-GUIDELINE-REVIEW.md) - Comprehensive review analysis
- [SEO-GUIDELINE-CONFIRMATION.md](SEO-GUIDELINE-CONFIRMATION.md) - 100% coverage confirmation

---

**Last Updated:** January 2025  
**Status:** ✅ Complete - Ready for use  
**Coverage:** 100% SEO best practices
