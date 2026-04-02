# SEO Implementation Checklist

Follow these step-by-step checklists when creating new Articles, Clients, Categories, or Authors.

---

## Quick Reference Table

| Field | Entity | Required | Limit | Format | Auto |
|-------|--------|----------|-------|--------|------|
| **Title** | All | ✅ | - | Text | ❌ |
| **Slug** | All | ✅ | - | URL-safe | ✅ |
| **SEO Title** | All | ✅ | 50-60 | Text | ❌ |
| **SEO Description** | All | ✅ | 150-160 | Text | ❌ |
| **Description (Schema.org)** | All | ✅ | 100+ | Text | ❌ |
| **Featured Image** | Article | ✅ | - | 1200x630px | ❌ |
| **Logo** | Client | ✅ | - | 112x112px min | ❌ |
| **Profile Image** | Author | ⚠️ | - | Any size | ❌ |
| **Image Alt Text** | All (if image) | ✅ | - | Text | ❌ |
| **Date Published** | Article | ✅ | - | ISO 8601 | ❌ |
| **Date Modified** | Article | ✅ | - | ISO 8601 | ✅ |
| **Last Reviewed** | Article | ⚠️ | - | ISO 8601 | ❌ |
| **Founding Date** | Client | ⚠️ | - | ISO 8601 | ❌ |
| **URL** | Client | ✅ | - | HTTPS | ❌ |
| **Canonical URL** | All | ✅ | - | HTTPS | ✅ |
| **OG Tags** | All | ✅ | - | Various | ✅ Partial |
| **Twitter Cards** | All | ✅ | - | Various | ✅ Partial |
| **Structured Data** | All | ✅ | - | JSON-LD | ❌ |
| **Social Profiles** | Client, Author | ⚠️ | - | URLs array | ❌ |
| **E-E-A-T Signals** | Author | ⚠️ | - | Various | ❌ |

---

## Article Checklist

### Step 1: Basic Content
- [ ] **Title** - Clear, descriptive, include primary keyword (60-80 chars)
- [ ] **Slug** - URL-safe, auto-generated from title, verify unique
- [ ] **Content** - Full body, markdown/HTML, minimum 300 words recommended
- [ ] **Excerpt** - Brief summary (100-200 chars), used in listings

### Step 2: SEO Meta Tags
- [ ] **SEO Title** - 50-60 chars, include brand/keyword, unique
- [ ] **SEO Description** - 150-160 chars, compelling, action-oriented, include keyword
- [ ] **Meta Robots** - Default: `index, follow`

### Step 3: Open Graph Tags
- [ ] **og:title** - Auto from SEO Title
- [ ] **og:description** - Auto from SEO Description
- [ ] **og:image** - 1200x630px, relevant, WebP/AVIF preferred
- [ ] **og:type** - Auto set to `article`
- [ ] **og:url** - Auto canonical URL
- [ ] **og:site_name** - Auto generated
- [ ] **og:locale** - Auto generated (e.g., ar_SA)
- [ ] **og:article:author** - Author name or profile URL
- [ ] **og:article:published_time** - Publication date ISO 8601
- [ ] **og:article:modified_time** - Auto-updated on changes
- [ ] **og:article:section** - Category name
- [ ] **og:article:tag** - Article tags array (optional)
- [ ] **og:updated_time** - Auto-updated

### Step 4: Twitter Cards
- [ ] **twitter:card** - Auto set to `summary_large_image`
- [ ] **twitter:title** - Auto from SEO Title (max 70 chars)
- [ ] **twitter:description** - Auto from SEO Description (max 200 chars)
- [ ] **twitter:image** - Auto from OG Image (min 600x314px, recommended 1200x628px)
- [ ] **twitter:site** - Auto generated
- [ ] **twitter:image:alt** - Descriptive alt text (required if image)
- [ ] **twitter:creator** - Author's Twitter handle (optional)

### Step 5: Structured Data (JSON-LD)
- [ ] **Article Schema** - @type: Article, headline, description (100+ chars), datePublished, dateModified, author, publisher, image, mainEntityOfPage
- [ ] **Author Schema** - @type: Person, name, url, jobTitle, worksFor, sameAs
- [ ] **Organization Schema** - @type: Organization, name, url, logo, sameAs
- [ ] **Breadcrumb Schema** - @type: BreadcrumbList with itemListElement
- [ ] **FAQ Schema** - If applicable, Question/Answer pairs

### Step 6: Dates & Status
- [ ] **Date Published** - ISO 8601 format, set when publishing
- [ ] **Date Modified** - Auto-updated
- [ ] **Last Reviewed** - Content freshness signal (optional but recommended)
- [ ] **Status** - DRAFT, PUBLISHED, or ARCHIVED

### Step 7: Images
- [ ] **Featured Image** - 1200x630px, high quality, relevant
- [ ] **Featured Image Alt Text** - Descriptive, keyword-rich, 125 chars max
- [ ] **Image Optimization** - Lazy loading enabled, responsive images, descriptive filenames

### Step 8: Relationships
- [ ] **Client** - Select client/organization (required)
- [ ] **Category** - Select relevant category (optional but recommended)
- [ ] **Author** - Select author (required, must have complete profile)
- [ ] **Tags** - Add relevant tags (optional)

---

## Client/Organization Checklist

### Step 1: Basic Info
- [ ] **Name** - Official organization name
- [ ] **Legal Name** - Official legal name if different
- [ ] **Slug** - URL-safe, auto-generated, unique
- [ ] **Description** - 100+ chars, separate from SEO description
- [ ] **SEO Description** - 150-160 chars, optimized for search

### Step 2: Contact & Location
- [ ] **Email** - Contact email
- [ ] **Phone** - Contact phone number
- [ ] **Contact Type** - customer service, technical support, sales, etc.
- [ ] **Address** - Street, city, country, postal code (for local SEO)

### Step 3: Branding
- [ ] **Logo** - 112x112px minimum, PNG/SVG/JPG, clear and high quality
- [ ] **Logo Alt Text** - Descriptive alt text
- [ ] **OG Image** - 1200x630px (optional, default for articles)

### Step 4: SEO Fields
- [ ] **SEO Title** - 50-60 chars, optimized
- [ ] **SEO Description** - 150-160 chars, compelling
- [ ] **URL** - Organization website URL (required, HTTPS)
- [ ] **Canonical URL** - Auto-generated from slug

### Step 5: Social & Links
- [ ] **Social Profiles** - LinkedIn, Twitter, Facebook, other
- [ ] **Website URL** - Main website (required, HTTPS)

### Step 6: Dates
- [ ] **Founding Date** - ISO 8601 format (optional but recommended)

### Step 7: Open Graph & Twitter
- [ ] **All OG Tags** - Auto-generated, verify all present
- [ ] **All Twitter Card Tags** - Auto-generated, verify all present

---

## Category Checklist

### Step 1: Basic Info
- [ ] **Name** - Category name, clear and descriptive
- [ ] **Slug** - URL-safe, auto-generated, unique
- [ ] **Description** - 100+ chars

### Step 2: SEO Fields
- [ ] **SEO Title** - 50-60 chars
- [ ] **SEO Description** - 150-160 chars

### Step 3: Structured Data
- [ ] **Category Schema** - @type: Category, name, description (100+ chars), url
- [ ] **Breadcrumb Schema** - Include category in breadcrumb path

### Step 4: Open Graph & Twitter
- [ ] **All OG Tags** - Auto-generated, verify present
- [ ] **All Twitter Card Tags** - Auto-generated, verify present

---

## Author Checklist

### Step 1: Basic Info
- [ ] **Name** - Full name, professional
- [ ] **Slug** - URL-safe, auto-generated, unique
- [ ] **Bio/Description** - 100+ chars, author biography
- [ ] **Profile Image** - Professional headshot (optional but recommended)
- [ ] **Image Alt Text** - Descriptive alt text (if image exists)

### Step 2: E-E-A-T Signals
- [ ] **Job Title** - Current job title (optional but recommended)
- [ ] **Works For** - Organization affiliation (optional but recommended)
- [ ] **Credentials** - Degrees, certifications (array, optional)
- [ ] **Qualifications** - Professional qualifications (array, optional)
- [ ] **Expertise Areas** - Topics of specialization (knowsAbout, optional)
- [ ] **Experience Years** - Years of experience (optional)
- [ ] **Verification Status** - Verified author status (optional)

### Step 3: Social Profiles
- [ ] **LinkedIn** - LinkedIn profile URL
- [ ] **Twitter** - Twitter profile URL
- [ ] **Facebook** - Facebook profile URL
- [ ] **sameAs Array** - All social profiles

### Step 4: SEO Fields
- [ ] **SEO Title** - 50-60 chars
- [ ] **SEO Description** - 150-160 chars
- [ ] **URL** - Author profile page URL

### Step 5: Open Graph & Twitter
- [ ] **All OG Tags** - Auto-generated, verify present
- [ ] **All Twitter Card Tags** - Auto-generated, verify present

---

## Format Requirements

### Text Fields

| Field | Optimal | Max | Purpose |
|-------|---------|-----|---------|
| SEO Title | 50-60 | 60 | Search results |
| SEO Description | 150-160 | 160 | Search snippet |
| OG Title | 55-60 | 60 | Social preview |
| OG Description | 110-150 | 150 | Social preview |
| Twitter Title | 60-70 | 70 | Twitter display |
| Twitter Description | 150-200 | 200 | Twitter display |
| Schema.org Description | 100+ | - | Structured data |
| Image Alt Text | 50-125 | 125 | Accessibility + SEO |

### Images

| Type | Min | Recommended | Format | Alt Required |
|------|-----|-------------|--------|--------------|
| Featured (Article) | 600x314 | 1200x630 | WebP/AVIF | ✅ |
| Logo (Client) | 112x112 | 200x200 | PNG/SVG/JPG | ✅ |
| Profile (Author) | 100x100 | 400x400 | Any | ✅ |
| OG Image | 600x314 | 1200x630 | WebP/AVIF | ✅ |
| Twitter Image | 600x314 | 1200x628 | WebP/AVIF | ✅ |

**Best Practices:** WebP/AVIF format, lazy loading, responsive images (srcset), descriptive filenames (lowercase, hyphens), optimize file size.

### Dates

| Field | Format | Example | Required |
|-------|--------|---------|----------|
| Date Published | ISO 8601 | 2025-01-15 | ✅ (published) |
| Date Modified | ISO 8601 | Auto-updated | ✅ (auto) |
| Last Reviewed | ISO 8601 | 2025-01-15 | ⚠️ (optional) |
| Founding Date | ISO 8601 | 2020-01-15 | ⚠️ (optional) |

Format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ssZ`

### URLs

| Type | Format | Required |
|------|--------|----------|
| Website URL | HTTPS absolute | ✅ |
| Canonical URL | HTTPS absolute | ✅ (auto) |
| Social Profile | HTTPS absolute | ⚠️ |
| Image URL | HTTPS absolute | ✅ (if image) |

**Best Practices:** Always HTTPS, use absolute URLs, no trailing slashes, URL-safe characters, descriptive slugs.

---

## Auto-Generated Fields

### Fully Auto-Generated
- Slug, Canonical URL, Date Modified, og:type, og:url, og:site_name, og:locale, twitter:card, twitter:site

### Partially Auto-Generated (From Other Fields)
- og:title (from SEO Title), og:description (from SEO Description), og:image (from Featured Image)
- og:article:modified_time, og:updated_time, twitter:title, twitter:description, twitter:image

### Manual Input Required
- Title/Name, Content, SEO Title, SEO Description, Schema.org Description, Images, Alt Text, Date Published, Last Reviewed, Founding Date, Social Profiles, E-E-A-T Signals, Relationships

---

## Pre-Publishing Validation

### Required Fields
- [ ] All required fields filled
- [ ] No empty required fields
- [ ] All relationships set (Client, Author for Articles)

### Character Limits
- [ ] SEO Title: 50-60 characters
- [ ] SEO Description: 150-160 characters
- [ ] Schema.org Description: 100+ characters
- [ ] Image Alt Text: 50-125 characters

### Images
- [ ] All images have alt text
- [ ] Featured images: 1200x630px (minimum size)
- [ ] Logos: 112x112px minimum
- [ ] Images optimized (WebP/AVIF when possible)
- [ ] Images use HTTPS URLs

### URLs
- [ ] All URLs use HTTPS
- [ ] URLs are absolute (full URL with domain)
- [ ] Canonical URLs correct
- [ ] No broken links

### Dates
- [ ] Dates in ISO 8601 format
- [ ] Date Published set for published content
- [ ] Dates are valid (not future for published)

### Structured Data
- [ ] Structured data validates (Google Rich Results Test)
- [ ] All required Schema.org fields present
- [ ] JSON-LD format correct
- [ ] No structured data errors

### Open Graph & Twitter
- [ ] All essential OG tags present
- [ ] OG image correct size (1200x630px)
- [ ] All Twitter Card tags present
- [ ] Test with Facebook Debugger
- [ ] Test with Twitter Validator

### Technical SEO
- [ ] Mobile-friendly (Google Mobile-Friendly Test)
- [ ] Page speed acceptable (PageSpeed Insights)
- [ ] Core Web Vitals good (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- [ ] No console errors
- [ ] No broken resources

### Content Quality
- [ ] Content is original and valuable
- [ ] Well-written (no grammar/spelling errors)
- [ ] Properly formatted
- [ ] Images relevant to content
- [ ] Links are relevant and working

---

## Quick Tips

1. Always fill SEO Title and SEO Description (critical for search)
2. Separate SEO Description from Schema.org Description
3. Always add alt text to images (accessibility + SEO)
4. Use HTTPS for all URLs (Google requirement)
5. Validate structured data before publishing
6. Test social sharing (OG and Twitter tags)
7. Check mobile-friendliness (mobile-first indexing)
8. Monitor Core Web Vitals (affects rankings)
9. Update Last Reviewed date (shows content freshness)
10. Complete E-E-A-T signals for Authors

---

**Last Updated:** April 2026
**Status:** Complete - Ready for use
**Coverage:** 100% SEO best practices
