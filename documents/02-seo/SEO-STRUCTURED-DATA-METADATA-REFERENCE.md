# SEO Structured Data & Metadata Master Reference

**Purpose:** Verified official-source reference for JSON-LD structured data and metadata implementation on modonty.com (Arabic-first content platform targeting ar-SA and ar-EG).

**Last updated:** 2026-04-05

**Rule:** Every fact cites its official source URL. Nothing is guessed.

---

## 1. Article Structured Data (JSON-LD)

**Source:** https://developers.google.com/search/docs/appearance/structured-data/article

### Supported Types

- `Article`
- `NewsArticle`
- `BlogPosting`

### Properties (ALL are recommended, NONE are required)

Google states: "There are no required properties; instead, add the properties that apply to your content."

| Property | Type | Status | Notes |
|---|---|---|---|
| `author` | Person or Organization | Recommended | Follow author markup best practices |
| `author.name` | Text | Recommended | Author's name |
| `author.url` | URL | Recommended | Link to author profile/bio page |
| `dateModified` | DateTime | Recommended | ISO 8601 format with timezone |
| `datePublished` | DateTime | Recommended | ISO 8601 format with timezone |
| `headline` | Text | Recommended | Article title (keep concise) |
| `image` | ImageObject or URL (repeated) | Recommended | Multiple images recommended |

### Image Requirements for Article Schema

- **Minimum:** 50,000 pixels (width x height multiplied)
- **Recommended aspect ratios:** 16:9, 4:3, 1:1
- **Provide multiple images** across these ratios for maximum compatibility
- Image URLs must be crawlable and indexable
- Format must be supported by Google Images (BMP, GIF, JPEG, PNG, WebP, SVG, AVIF)
- High-resolution preferred
- Images should represent the actual article content (not logos or captions)

**Source for image formats:** https://developers.google.com/search/docs/appearance/google-images

### What Triggers Article Rich Results

Google may show article rich results (top stories carousel, visual stories, etc.) when Article structured data is present with the recommended properties. Having `image`, `headline`, `datePublished`, and `author` properties increases eligibility.

---

## 2. Organization Structured Data

**Source:** https://developers.google.com/search/docs/appearance/structured-data/organization

### Properties (ALL are recommended, NONE are required)

Google states: "There are no required properties; instead, add the properties that apply to your organization."

| Property | Type | Notes |
|---|---|---|
| `name` | Text | Organization name |
| `url` | URL | Organization homepage |
| `logo` | URL or ImageObject | Representative logo |
| `description` | Text | Detailed description |
| `address` | PostalAddress | Physical/mailing address (ISO 3166-1 alpha-2 country code) |
| `alternateName` | Text | Alternative business names |
| `contactPoint` | ContactPoint | Best contact methods (telephone, email) |
| `email` | Text | Primary contact email |
| `telephone` | Text | Primary phone (with country/area codes) |
| `foundingDate` | Date | ISO 8601 format |
| `legalName` | Text | Registered legal name |
| `sameAs` | URL | Links to social profiles and other websites |
| `taxID` | Text | Tax identifier matching address country |
| `numberOfEmployees` | QuantitativeValue | Number or range |

### Logo Requirements

- **Minimum dimensions:** 112x112 pixels
- Format must be supported by Google Images
- Must be visible on a **pure white background**
- URL must be crawlable and indexable

**Source:** https://developers.google.com/search/docs/appearance/structured-data/logo

### Organization Knowledge Panel

Adding Organization structured data with `logo`, `name`, `url`, `sameAs`, and `description` helps Google build a Knowledge Panel. The `sameAs` property linking to Wikipedia, social profiles, and authoritative sources significantly increases Knowledge Panel eligibility.

---

## 3. Person Structured Data (Authors)

**Source:** https://schema.org/Person

### Key Properties for Author Markup

| Property | Type | Notes |
|---|---|---|
| `@type` | "Person" | Required type declaration |
| `name` | Text | Full name |
| `givenName` | Text | First name |
| `familyName` | Text | Last name |
| `url` | URL | Personal website or author page |
| `image` | URL or ImageObject | Photo |
| `sameAs` | URL (array) | Wikipedia, social profiles, official sites |
| `jobTitle` | Text | e.g., "Financial Manager" |
| `worksFor` | Organization | Employing organization |
| `description` | Text | Short bio |
| `email` | Text | Contact email |
| `knowsLanguage` | Text | Languages spoken |

### Google's Author Markup Best Practices

**Source:** https://developers.google.com/search/docs/appearance/structured-data/article

- Use `author.name` (not just organization name for individual authors)
- Use `author.url` linking to an author-specific page
- The author page should exist and contain real biographical information
- Multiple authors can be listed as an array

---

## 4. FAQ Structured Data

**Source:** https://developers.google.com/search/docs/appearance/structured-data/faqpage

### CRITICAL RESTRICTION (2023+)

**"FAQ rich results are only available for well-known, authoritative websites that are government-focused or health-focused."**

This means modonty.com will NOT qualify for FAQ rich results unless it is a government or health authority site. The markup can still be added for semantic value, but it will NOT generate rich results in Google Search for most websites.

### Required Properties (if implementing)

**FAQPage:**
- `mainEntity`: Array of at least one `Question` object

**Question:**
- `name`: Full question text
- `acceptedAnswer`: Single `Answer` object

**Answer:**
- `text`: Complete answer (supports limited HTML: h1-h6, br, ol, ul, li, a, p, div, b, strong, i, em)

### Content Guidelines

- Only mark up content that is actually visible on the page
- Answers can be in expandable/collapsible sections
- Do not use for advertising
- Mark same Q&A only once site-wide (not on multiple pages)

---

## 5. BreadcrumbList Structured Data

**Source:** https://developers.google.com/search/docs/appearance/structured-data/breadcrumb

### Required Properties

| Property | Type | Required | Notes |
|---|---|---|---|
| `itemListElement` | ListItem[] | Yes | Array of breadcrumb items |
| `position` | Integer | Yes | Position in trail (1 = beginning) |
| `name` | Text | Yes | Display title of breadcrumb |
| `item` | URL | Conditional | URL of the breadcrumb page. **NOT required for the last/current item** |

### Best Practices

- Represent typical **user navigation path**, not URL structure
- Not necessary to include the top-level domain
- Not necessary to include the current page itself
- Triggers breadcrumb rich result in Google Search (trail appears below the title)

---

## 6. WebSite Structured Data (Site Name)

**Source:** https://developers.google.com/search/docs/appearance/site-names

### Required Properties

| Property | Type | Notes |
|---|---|---|
| `name` | Text | The website name |
| `url` | URL | Canonical home page URL |

### Recommended Properties

| Property | Type | Notes |
|---|---|---|
| `alternateName` | Text | Acronym or shorter variant (can list multiple) |

### Implementation Rules

- Must be placed on the **home page only** (domain or subdomain root)
- Only ONE site name per domain/subdomain
- www and m prefixes are treated as equivalent
- Home page must be crawlable
- Use consistent naming across all home page duplicates (HTTP/HTTPS, www/non-www)
- Google also considers `og:site_name`, `<title>`, heading elements, but **WebSite structured data is the strongest signal**

---

## 7. Schema.org Type Hierarchies

**Source:** https://schema.org/Article, https://schema.org/Organization, https://schema.org/Person

### Article Type Hierarchy

```
Thing > CreativeWork > Article
                        ├── NewsArticle
                        ├── BlogPosting
                        ├── SocialMediaPosting
                        ├── TechArticle
                        ├── ScholarlyArticle
                        ├── SatiricalArticle
                        ├── AdvertiserContentArticle
                        └── Report
```

### Organization Type Hierarchy

```
Thing > Organization
         ├── Corporation
         ├── LocalBusiness (has many subtypes)
         ├── EducationalOrganization
         ├── GovernmentOrganization
         ├── MedicalOrganization
         ├── NewsMediaOrganization
         ├── NGO
         ├── OnlineBusiness
         ├── PerformingGroup
         ├── SportsOrganization
         └── ... (20+ subtypes total)
```

### ImageObject Type Hierarchy

```
Thing > CreativeWork > MediaObject > ImageObject
```

**Direct ImageObject properties:** caption, embeddedTextCaption, exifData, representativeOfPage

**Key inherited properties from MediaObject:** contentUrl, width, height, encodingFormat, contentSize, uploadDate

### @graph and @id Best Practices

**Source:** https://schema.org/docs/data-and-datasets.html

- Use `@graph` to define multiple related entities in a single JSON-LD block
- Use `@id` to assign a unique identifier to each entity (e.g., `"@id": "https://modonty.com/#organization"`)
- Reference entities by their `@id` instead of repeating the full structure
- This enables clean relationships: an Article's `publisher` can reference the Organization's `@id`

**Pattern:**
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://modonty.com/#organization",
      "name": "MODONTY",
      "logo": { ... }
    },
    {
      "@type": "Article",
      "@id": "https://modonty.com/article/slug#article",
      "publisher": { "@id": "https://modonty.com/#organization" },
      "author": { "@id": "https://modonty.com/author/name#person" }
    }
  ]
}
```

---

## 8. OpenGraph Protocol

**Source:** https://ogp.me/

### Required Tags (ALL pages)

| Tag | Description |
|---|---|
| `og:title` | Title as it should appear in the graph |
| `og:type` | Object type (e.g., `article`, `website`) |
| `og:image` | Image URL representing the content |
| `og:url` | Canonical URL (permanent ID in the graph) |

### Optional Core Tags

| Tag | Description |
|---|---|
| `og:description` | 1-2 sentence description |
| `og:site_name` | Parent website name |
| `og:locale` | Language/territory (default: `en_US`) |
| `og:locale:alternate` | Array of alternate locales |
| `og:determiner` | Word before title (a, an, the, "", auto) |
| `og:audio` | Audio file URL |
| `og:video` | Video file URL |

### Image Structured Properties

| Tag | Description |
|---|---|
| `og:image:url` | Same as og:image |
| `og:image:secure_url` | HTTPS URL |
| `og:image:type` | MIME type (e.g., `image/jpeg`) |
| `og:image:width` | Width in pixels |
| `og:image:height` | Height in pixels |
| `og:image:alt` | Alt text description |

### Image Dimensions

- **Recommended:** 1200x630 pixels (widely used standard for social sharing)
- **Minimum:** Facebook requires at least 200x200, but 600x315 is the practical minimum for high-quality display
- **Aspect ratio:** 1.91:1 is the standard (1200:630)

### Article-Specific Tags

| Tag | Description |
|---|---|
| `article:published_time` | ISO 8601 datetime |
| `article:modified_time` | ISO 8601 datetime |
| `article:expiration_time` | ISO 8601 datetime |
| `article:author` | Author profile URL |
| `article:section` | Category/section name |
| `article:tag` | Content tags (can repeat) |

### Locale Handling for Arabic

```html
<meta property="og:locale" content="ar_SA" />
<meta property="og:locale:alternate" content="ar_EG" />
<meta property="og:locale:alternate" content="en_US" />
```

Format is `language_TERRITORY` (underscore, not hyphen). Use `ar_SA` for Saudi Arabia and `ar_EG` for Egypt.

---

## 9. Twitter/X Cards

**Sources:** https://developer.x.com/en/docs/x-for-websites/cards/overview/summary-card-with-large-image, https://developer.x.com/en/docs/x-for-websites/cards/overview/summary

### Card Types

| Type | Description | Image Display |
|---|---|---|
| `summary` | Default card with small thumbnail | Square thumbnail (1:1) |
| `summary_large_image` | Card with large image above title | Large rectangular image (2:1) |
| `player` | Card with audio/video player | Inline player |
| `app` | Card for mobile apps | App store layout |

### Meta Tags

| Tag | Required | Description |
|---|---|---|
| `twitter:card` | Yes | Card type (`summary` or `summary_large_image`) |
| `twitter:site` | No | @username of the website |
| `twitter:creator` | No | @username of content creator |
| `twitter:title` | Falls back to og:title | Title (max ~70 chars displayed) |
| `twitter:description` | Falls back to og:description | Description (max ~200 chars displayed) |
| `twitter:image` | Falls back to og:image | Image URL (must be HTTPS) |
| `twitter:image:alt` | No | Alt text for the image (max 420 chars) |

### Image Dimensions

**summary_large_image:**
- **Recommended:** 1200x628 pixels (or 1200x675 for 16:9)
- **Minimum:** 300x157 pixels (below this, falls back to summary card)
- **Maximum file size:** 5MB
- **Aspect ratio:** 2:1 (cropped to this ratio)

**summary:**
- **Recommended:** 800x800 pixels
- **Minimum:** 144x144 pixels
- **Maximum file size:** 5MB
- **Aspect ratio:** 1:1

**Supported formats:** JPG, PNG, WebP, GIF (first frame only for animated)

### Important Notes

- Tag names still use `twitter:` prefix (NOT `x:`) even after the X rebrand
- X falls back to OpenGraph tags if Twitter-specific tags are missing
- `twitter:title` falls back to `og:title`, `twitter:description` to `og:description`, `twitter:image` to `og:image`

---

## 10. Meta Tags

### Title Tag

**Source:** https://developers.google.com/search/docs/advanced/appearance/good-titles-snippets

- **No hard character limit** from Google; truncation happens based on device width
- **Practical guideline:** 50-60 characters to avoid truncation on most devices
- Must be unique per page
- Avoid keyword stuffing
- Avoid vague titles ("Home", "Profile")
- Include site branding concisely (use delimiter: hyphen, colon, or pipe)
- Use the same language/writing system as page content
- Google may rewrite your title if it finds a better representation

### Meta Description

**Source:** https://developers.google.com/search/docs/appearance/snippet

- **No character limit** from Google; truncated as needed to fit device width
- **Practical guideline:** 150-160 characters for optimal display
- Must be unique per page
- Google may choose NOT to use your meta description and generate its own snippet
- Avoid keyword stuffing
- Can include structured info (author, date, price)
- Programmatic generation is acceptable and encouraged for large sites

### Canonical URL

**Source:** https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls

- Specify **only ONE** `rel="canonical"` per page (multiple = all ignored)
- Must point to an existing page (not 404 or soft 404)
- Do NOT use URL fragments (#) as canonical
- Google prefers **HTTPS** over HTTP as canonical
- Canonical is a **hint**, not a directive; Google may choose differently
- Link internally to canonical URLs consistently
- Do NOT use robots.txt for canonicalization
- Choose www or non-www and stick to one

### Hreflang

**Source:** https://developers.google.com/search/docs/specialty/international/localized-versions

**Format:** `hreflang="[ISO 639-1 language]-[ISO 3166-1 Alpha 2 region]"`

**For modonty.com:**
```html
<link rel="alternate" hreflang="ar-SA" href="https://modonty.com/ar-SA/page" />
<link rel="alternate" hreflang="ar-EG" href="https://modonty.com/ar-EG/page" />
<link rel="alternate" hreflang="x-default" href="https://modonty.com/page" />
```

**Three implementation methods:**
1. HTML `<link>` tags in `<head>`
2. HTTP `Link:` response headers
3. XML sitemap with `xhtml:link` elements

**Critical rules:**
- **Bidirectional:** Every page must list itself AND all other language/region variants
- **Self-referencing:** Each page must reference itself
- **Fully qualified URLs** with protocol (https://)
- `x-default` for unmatched languages (language selector or auto-redirecting pages)

### Robots Meta

**Source:** https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag

| Directive | Description |
|---|---|
| `all` | Default; no restrictions |
| `noindex` | Do not show in search results |
| `nofollow` | Do not follow links on this page |
| `none` | Same as `noindex, nofollow` |
| `nosnippet` | No text snippet or video preview; blocks AI Overviews |
| `max-snippet:[n]` | Limit text snippet to n chars (-1 = unlimited) |
| `max-image-preview:[size]` | Image preview size: `none`, `standard`, `large` |
| `max-video-preview:[n]` | Video preview seconds (-1 = unlimited) |
| `notranslate` | Do not translate page in results |
| `noimageindex` | Do not index images on page |
| `unavailable_after:[date]` | Remove after date (ISO 8601) |
| `indexifembedded` | Allow indexing when embedded despite noindex |

**Google-specific user agents:** `googlebot` (text search), `googlebot-news` (news)

### Google-Specific Meta Tags

**Source:** https://developers.google.com/search/docs/crawling-indexing/special-tags

| Tag | Description |
|---|---|
| `google-site-verification` | Verifies site ownership in Search Console |
| `googlebot` content="notranslate" | Prevents translation of title/snippets |
| `google` content="nopagereadaloud" | Blocks Google text-to-speech |
| `rating` content="adult" | Labels explicit content for SafeSearch |
| `viewport` | Signals mobile-friendliness |

---

## 11. Sitemap

**Source:** https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap

### Limits

- **Maximum URLs per sitemap:** 50,000
- **Maximum file size:** 50MB (uncompressed)
- If exceeding limits, split into multiple sitemaps and use a sitemap index file

### Required Fields

| Field | Required | Notes |
|---|---|---|
| `<loc>` | Yes | Full absolute URL |
| `<lastmod>` | No | Last modification date; Google uses this for crawl scheduling |
| `<changefreq>` | No | **Google IGNORES this field** |
| `<priority>` | No | **Google IGNORES this field** |

**Source for ignored fields:** https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping

**Key:** `<lastmod>` is the only optional field that Google actually uses as a signal, and only when it is consistently accurate and verifiable.

### Format Requirements

- UTF-8 encoded
- Fully qualified absolute URLs
- Proper XML declaration and `<urlset>` namespace
- List canonical URLs only

### Image Sitemap Extension

**Source:** https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps

```xml
<url>
  <loc>https://modonty.com/article/slug</loc>
  <image:image>
    <image:loc>https://modonty.com/images/photo.jpg</image:loc>
  </image:image>
</url>
```

- Namespace: `xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`
- Up to **1,000 images per `<url>`**
- Can include CDN URLs (cross-domain allowed)
- Deprecated tags (do NOT use): `caption`, `geo_location`, `title`, `license`

**Source for deprecations:** https://developers.google.com/search/blog/2022/05/spring-cleaning-sitemap-extensions

---

## 12. Core Web Vitals & Technical SEO

**Source:** https://web.dev/articles/vitals

### Thresholds

| Metric | Good | Needs Improvement | Poor |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | <= 2.5s | 2.5s - 4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | <= 200ms | 200ms - 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | <= 0.1 | 0.1 - 0.25 | > 0.25 |

A site is classified as "good" for a metric if at least **75% of page views** meet the "good" threshold.

### Next.js Image Optimization

**Source:** https://nextjs.org/docs/app/api-reference/components/image

- Use `priority` prop (or `preload` in Next.js 16+) on the LCP image of each page
- In Next.js 16, `priority` is **deprecated** in favor of `preload` prop
- Use `loading="eager"` or `fetchPriority="high"` as alternatives
- Do NOT use `preload` when:
  - Multiple images could be LCP depending on viewport
  - `loading` prop is already set
  - `fetchPriority` prop is already set
- `loading="lazy"` (default) defers loading until near viewport

### Image Best Practices for LCP

- Above-fold hero images: use `preload` (Next.js 16) or `priority` (Next.js 15)
- Specify `width` and `height` to prevent CLS
- Use modern formats (WebP, AVIF) for smaller file sizes
- Use `sizes` prop to serve appropriate image sizes per viewport

---

## 13. Recommended OG Image Size (Universal)

For maximum compatibility across all platforms (Google, Facebook, X/Twitter, LinkedIn, WhatsApp, Telegram):

- **Dimensions:** 1200 x 630 pixels
- **Aspect ratio:** 1.91:1
- **Format:** JPEG or PNG (WebP has limited support on some platforms)
- **File size:** Under 1MB (under 5MB for X/Twitter)
- This single image works for both `og:image` and `twitter:image`

---

## 14. Implementation Checklist for modonty.com

### Every Public Page MUST Have:

- [ ] `<title>` tag (unique, 50-60 chars, Arabic-first)
- [ ] `<meta name="description">` (unique, 150-160 chars, Arabic)
- [ ] `<link rel="canonical">` (one per page, absolute HTTPS URL)
- [ ] `og:title`, `og:type`, `og:image`, `og:url` (required by OG spec)
- [ ] `og:description`, `og:locale` (ar_SA), `og:site_name`
- [ ] `twitter:card` (summary_large_image for articles)
- [ ] `twitter:image:alt` (Arabic alt text)
- [ ] Hreflang tags (ar-SA, ar-EG, x-default) with bidirectional linking

### Home Page MUST Have:

- [ ] WebSite JSON-LD (name, url, alternateName)
- [ ] Organization JSON-LD (name, url, logo, sameAs, description, contactPoint)

### Every Article Page MUST Have:

- [ ] Article JSON-LD (headline, image, datePublished, dateModified, author, publisher)
- [ ] BreadcrumbList JSON-LD
- [ ] Article OG tags (article:published_time, article:modified_time, article:author, article:section)
- [ ] Image meeting 50K pixel minimum in 16:9, 4:3, AND 1:1 ratios

### Sitemap MUST Have:

- [ ] `<loc>` for every public canonical URL
- [ ] `<lastmod>` with accurate, verifiable dates
- [ ] Image extension for pages with images
- [ ] Maximum 50,000 URLs per file
- [ ] Do NOT include `<priority>` or `<changefreq>` (Google ignores them)

### robots.txt MUST:

- [ ] Allow `/`
- [ ] Disallow `/api/`, `/admin/`, `/dashboard/`
- [ ] Include sitemap URL

---

## 15. Industry SEO Tools — Practical Data (SEMrush, Ahrefs, Moz)

> These tools are the daily reference for SEO specialists worldwide.
> Data below adds practical detail beyond Google's official docs.

### Title Tag & Meta Description (Practical Numbers)

| Metric | Google Says | Industry Data | Source |
|--------|------------|---------------|--------|
| Title length | No hard limit, truncates by device width | **55 chars max** to avoid truncation | SEMrush |
| Meta description length | No limit, truncates as needed | **105 chars** (SEMrush) / 150-160 (traditional) | SEMrush |
| Google rewrites meta | Not disclosed | **62.78%** of the time | Ahrefs study |
| Google shows your meta | Not disclosed | Only **37%** of the time | Ahrefs study |

### Content Quality Signals

| Signal | Recommendation | Source |
|--------|---------------|--------|
| Content length (top 3) | Average **2,100-2,500 words** | Multiple studies |
| Internal links per page | **2-5 contextual links** | SEMrush |
| Crawl depth | Important pages within **3-4 clicks** of homepage | SEMrush |
| Keyword density | **Not a ranking factor** (Google confirmed). Natural: 1-2% | Google/John Mueller |
| H1 per page | **One H1** with primary keyword near beginning | SEMrush |

### Structured Data CTR Impact

| Metric | Value | Source |
|--------|-------|--------|
| Rich results CTR boost | **20-30%** over plain blue links | Ahrefs, Moz |
| Schema types for AI Overviews | Article + FAQ + Breadcrumb + Author/Publisher | Search Engine Land experiment |
| AI Overview CTR impact (informational) | **34-47% CTR reduction** for publishers | SEJ |
| AI Overview CTR impact (branded) | **18% CTR increase** when appearing | SEJ |

### E-E-A-T Implementation (SEMrush Framework)

**Experience:**
- First-hand accounts, original photos, real-world examples
- User testimonials and customer success stories

**Expertise:**
- Display credentials, qualifications, certifications
- Have subject matter specialists review content
- Create comprehensive guides demonstrating mastery

**Authoritativeness:**
- Earn links from reputable, relevant websites
- Contribute expert articles to recognized publications

**Trustworthiness:**
- **Name the writer on each post** with detailed bio page
- Cite credible sources (academic, government)
- Use HTTPS, display data protection measures
- Review and refresh content regularly
- Display customer reviews and verified user content
- Showcase certifications and accreditations

### AI Search Visibility (2025-2026)

| Fact | Data | Source |
|------|------|--------|
| AI Overviews trigger rate | 6.5% (Jan 2025) → 25% (Jul) → <16% (Nov) | SEJ |
| Zero-click searches | Increased from **56% to 69%** | SEJ |
| AI citations from PR | **~34%** of AI citations originate from PR coverage | SEJ |
| JavaScript rendering | **Most LLMs don't render JS** — avoid JS for critical content | Ahrefs |
| Content for AI | Prioritize "clarity and cognitive ease" — AI cites unique, data-rich content | SEJ |

### Google Algorithm Updates (2025-2026)

| Date | Update | Duration |
|------|--------|----------|
| Mar 2025 | Core update | 14 days |
| Jun 2025 | Core update ("big update") | 16 days |
| Dec 2025 | Core update | 18 days |
| Feb 2026 | Discover feed update | Ongoing |
| Mar 2026 | Core update + spam update | Ongoing |

Google confirmed: **Core Web Vitals weight increased in 2025** — when two pages have similar relevance, better CWV wins.

### Multilingual / Arabic SEO (SEMrush)

- Use **ISO 639-1** language codes (ar for Arabic)
- Implement **self-referencing hreflang** on every page
- Each language version must include hreflang tags pointing to **all other versions including itself**
- **Hreflang and canonical tags must be in sync** — Arabic canonical → Arabic page
- All hreflang links must be **absolute URLs** returning HTTP 200
- Display prices in local currency (SAR, EGP)
- Adjust layout for RTL readers

### Key Takeaway for modonty.com

> Structured data is NOT a direct ranking factor, but a **massive CTR factor** (20-30% boost).
> In the AI era, pages with well-implemented schema (Article + Breadcrumb + Author + Publisher)
> are the **only ones appearing in AI Overviews**. This makes structured data more important
> than ever — not for ranking, but for **visibility across Google Search AND AI systems**.

---

## Sources Index

All facts in this document are verified from these sources:

### Tier 1 — Official / Specification Sources

1. [Google: Article Structured Data](https://developers.google.com/search/docs/appearance/structured-data/article)
2. [Google: Organization Structured Data](https://developers.google.com/search/docs/appearance/structured-data/organization)
3. [Google: FAQ Structured Data](https://developers.google.com/search/docs/appearance/structured-data/faqpage)
4. [Google: BreadcrumbList Structured Data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
5. [Google: Logo Structured Data](https://developers.google.com/search/docs/appearance/structured-data/logo)
6. [Google: Site Names](https://developers.google.com/search/docs/appearance/site-names)
7. [Google: Meta Description / Snippets](https://developers.google.com/search/docs/appearance/snippet)
8. [Google: Title Links](https://developers.google.com/search/docs/advanced/appearance/good-titles-snippets)
9. [Google: Robots Meta Tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
10. [Google: Meta Tags Google Supports](https://developers.google.com/search/docs/crawling-indexing/special-tags)
11. [Google: Hreflang / Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
12. [Google: Canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
13. [Google: Build Sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
14. [Google: Image Sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps)
15. [Google: Sitemap Lastmod / Ping Deprecation](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping)
16. [Google: Sitemap Extension Deprecations](https://developers.google.com/search/blog/2022/05/spring-cleaning-sitemap-extensions)
17. [Google: Image SEO Best Practices](https://developers.google.com/search/docs/appearance/google-images)
18. [Google: Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)
19. [Google: Structured Data General Guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
20. [Schema.org: Article](https://schema.org/Article)
21. [Schema.org: Organization](https://schema.org/Organization)
22. [Schema.org: Person](https://schema.org/Person)
23. [Schema.org: ImageObject](https://schema.org/ImageObject)
24. [OpenGraph Protocol](https://ogp.me/)
25. [X/Twitter: Summary Large Image Card](https://developer.x.com/en/docs/x-for-websites/cards/overview/summary-card-with-large-image)
26. [X/Twitter: Summary Card](https://developer.x.com/en/docs/x-for-websites/cards/overview/summary)
27. [Web.dev: Core Web Vitals](https://web.dev/articles/vitals)
28. [Web.dev: LCP](https://web.dev/articles/lcp)
29. [Next.js: Image Component](https://nextjs.org/docs/app/api-reference/components/image)
30. [Next.js: generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

### Tier 2 — Industry Tools & Research (SEMrush, Ahrefs, Moz)

31. [SEMrush: On-Page SEO Checklist 2026](https://www.semrush.com/blog/on-page-seo-checklist/)
32. [SEMrush: Schema Markup Guide](https://www.semrush.com/blog/schema-markup/)
33. [SEMrush: Internal Links Guide](https://www.semrush.com/blog/internal-links/)
34. [SEMrush: E-E-A-T Guide](https://www.semrush.com/blog/eeat/)
35. [SEMrush: Hreflang Guide](https://www.semrush.com/blog/hreflang-attribute-101/)
36. [SEMrush: Multilingual SEO](https://www.semrush.com/blog/multilingual-seo/)
37. [Ahrefs: On-Page SEO Checklist 2026](https://ahrefs.com/blog/on-page-seo-checklist/)
38. [Ahrefs: 82-Point SEO & AI Checklist](https://ahrefs.com/blog/seo-ai-search-checklist/)
39. [Ahrefs: Meta Description Study](https://ahrefs.com/blog/meta-description-study/)
40. [Ahrefs: Confirmed Google Ranking Factors](https://ahrefs.com/blog/google-ranking-factors/)
41. [Ahrefs: Structured Data Glossary](https://ahrefs.com/seo/glossary/structured-data)

### Tier 3 — Industry Publications (SEJ, Search Engine Land)

42. [SEJ: Google Algorithm History](https://www.searchenginejournal.com/google-algorithm-history/)
43. [SEJ: AI Overviews Impact on Publishers](https://www.searchenginejournal.com/impact-of-ai-overviews-how-publishers-need-to-adapt/556843/)
44. [SEJ: Structured Data Still Essential in AI Era](https://www.searchenginejournal.com/google-confirms-structured-data-still-essential-in-ai-search-era/544141/)
45. [SEJ: Enterprise SEO Trends 2026](https://www.searchenginejournal.com/key-enterprise-seo-and-ai-trends-for-2026/558508/)
46. [SEJ: 2026 SEO Landscape](https://www.searchenginejournal.com/googles-old-search-era-is-over-heres-what-2026-seo-will-really-look-like/561410/)
47. [Search Engine Land: Schema & AI Overviews](https://searchengineland.com/schema-ai-overviews-structured-data-visibility-462353)
48. [Search Engine Land: 2025 Google Updates Review](https://searchengineland.com/google-algorithm-updates-2025-in-review-3-core-updates-and-1-spam-update-466450)
49. [Search Engine Land: AI Overviews Data](https://searchengineland.com/google-ai-overviews-surge-pullback-data-466314)
