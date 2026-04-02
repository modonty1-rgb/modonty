# SEO Perfect Coverage - Quick Guideline

## Core Principles for 100% SEO Coverage

### 1. Schema.org Structured Data
**Required for all entities:**
- Name, Description (100+ chars), URL (HTTPS), Image/Logo (PNG/SVG/JPG, min 112x112px)
- Date fields (foundingDate, datePublished, dateModified) in ISO 8601 format
- ContactPoint (email/phone with contactType)
- Address (street, city, country, postalCode)
- Social profiles (sameAs array)

### 2. Meta Tags
- **Title:** 50-60 chars, unique per page, include brand/keyword
- **Description:** 150-160 chars, compelling, include primary keyword

### 3. Open Graph Tags (Complete)
**Essential:** og:title, og:description, og:url, og:type, og:image (1200x630px)
**Recommended:** og:site_name, og:locale (e.g., "ar_SA"), og:image:width, og:image:height, og:image:alt
**Article-specific:** og:article:author, og:article:published_time (ISO 8601), og:article:modified_time, og:article:section, og:article:tag, og:updated_time

### 4. Twitter Cards (Complete)
**Essential:** twitter:card (summary_large_image), twitter:title, twitter:description, twitter:image (min 600x314px, recommended 1200x628px), twitter:site
**Recommended:** twitter:image:alt, twitter:creator (@username)

### 5. Technical SEO
- HTTPS (always required), SSL certificate valid
- Canonical URL (prevent duplicates)
- XML Sitemap + robots.txt
- JSON-LD structured data (conditional spreading: `...(field && { field })`)
- Image optimization (WebP/AVIF, lazy loading)
- Code minification (CSS, JS, HTML)
- CDN usage for static assets
- hreflang tags (multi-language sites)
- Validation: Google Rich Results Test, Mobile-Friendly Test

### 6. Core Web Vitals (2025 Standard)
- **LCP (Largest Contentful Paint):** Target < 2.5s (Good), < 4.0s (Needs Improvement)
- **INP (Interaction to Next Paint):** Target < 200ms (Good), < 500ms (Needs Improvement)
- **CLS (Cumulative Layout Shift):** Target < 0.1 (Good), < 0.25 (Needs Improvement)
- **TTFB (Time to First Byte):** Target < 800ms (Good), < 1.8s (Needs Improvement)
- **TBT (Total Blocking Time):** Target < 200ms (Good), < 600ms (Needs Improvement)

Optimization: Image optimization, minify files, CDN, compression, reduce server response time, eliminate render-blocking resources, efficient caching.

### 7. Mobile-First Indexing
- Responsive design (all device sizes)
- Mobile content = Desktop content
- Touch-friendly elements (44x44px minimum)
- Fast mobile page speed
- No intrusive interstitials
- Mobile-friendly navigation
- Readable text (no horizontal scrolling)

### 8. E-E-A-T Principles (Experience, Expertise, Authoritativeness, Trustworthiness)

**For Authors:**
- Credentials, degrees, certifications
- Expertise areas (knowsAbout)
- Verification status
- Social profiles (sameAs)
- Organization affiliation
- Years of experience

**For Content:**
- Author attribution
- Publication date
- Last reviewed date (content freshness)
- Source citations
- Content depth indicators
- Publishing organization

### 9. Image SEO
- Alt text (descriptive, keyword-rich)
- File naming (descriptive, lowercase, hyphens)
- Format optimization (WebP, AVIF preferred)
- Lazy loading
- Proper dimensions in structured data
- Image sitemap (if many images)
- Responsive images (srcset)

### 10. Voice Search & AI Optimization
- FAQPage schema (voice search queries)
- Speakable schema (voice assistants)
- HowTo schema (instructional)
- QAPage schema (Q&A content)
- Natural language + conversational keywords
- Question-based content structure

---

## Entity-Specific Checklist

### For Articles
- Title (50-60 chars), Meta description (150-160 chars), Featured image (1200x630px) with alt text
- Date published/modified + Last reviewed (content freshness)
- Author (with E-E-A-T signals), Organization publisher, Category/articleSection
- OG tags (all) + Twitter Cards (all) + Canonical URL
- FAQ schema (if applicable) + Breadcrumb schema
- Core Web Vitals optimization + Mobile-friendly validation

### For Authors
- Name, Bio/description (100+ chars), Profile image + alt text
- Job title, Organization affiliation, Social profiles (sameAs)
- Credentials/qualifications (E-E-A-T), Expertise areas (knowsAbout), Experience years
- Verification status
- OG tags (all) + Twitter Cards (all) + Canonical URL

### For Categories
- Name, Description (100+ chars), SEO title (50-60 chars), SEO description (150-160 chars)
- OG tags (all) + Twitter Cards (all) + Canonical URL
- Breadcrumb schema + Mobile-friendly validation

### For Clients/Organizations
- Name & legal name, Description (100+ chars, separate from SEO description)
- URL (HTTPS), Logo (112x112px min) with alt text, Founding date
- ContactPoint (email, phone, contactType)
- Address (street, city, country, postalCode)
- Social profiles (sameAs)
- OG/Twitter tags (all) + Canonical URL
- Trust signals (reviews, certifications)

---

## Field Lengths Reference

| Field | Optimal | Purpose |
|-------|---------|---------|
| SEO Title | 50-60 chars | Search results |
| Meta Description | 150-160 chars | Search snippet |
| OG Title | 55-60 chars | Social preview |
| OG Description | 110-150 chars | Social preview |
| Twitter Title | Max 70 chars | Twitter display |
| Twitter Description | Max 200 chars | Twitter display |
| Organization Description | 100+ chars | Schema.org |
| OG Image | 1200x630px | Social sharing |
| Twitter Image | 1200x628px (min 600x314px) | Twitter card |
| Logo | 112x112px min | Rich results |

---

## Implementation Pattern

```typescript
const structuredData = {
  "@context": "https://schema.org",
  "@type": "EntityType",
  name: entity.name,
  ...(entity.description && { description: entity.description }),
  ...(entity.url && { url: entity.url }),
  ...(entity.image && { image: { "@type": "ImageObject", url: entity.image } }),
  ...(entity.datePublished && { datePublished: entity.datePublished.toISOString().split("T")[0] }),
};
```

---

## SEO Doctor Scoring (200 points max - 2025)

**Critical (Must Have) - 60 points:**
- Name (5), Slug (5), SEO Title 50-60 chars (15), SEO Description 150-160 chars (15), URL HTTPS (10), Canonical URL (10)

**Important (Should Have) - 70 points:**
- Description Schema.org 100+ chars (10), OG Tags Essential (10), OG Tags Recommended (5), Twitter Cards Essential (10), Twitter Cards Recommended (5), Social Profiles (10), Contact Info (10), Founding Date (5), Image Alt Text (5)

**Performance & Technical - 40 points:**
- Core Web Vitals LCP/INP/CLS targets (15), Mobile-Friendly (10), Page Speed (10), XML Sitemap (5)

**Enhancements (Nice to Have) - 30 points:**
- ContactPoint (5), Address (5), E-E-A-T Signals (10), Voice Search Optimization (5), Breadcrumb Schema (5)

**Target: 80%+ (160+ points) for optimal SEO**

---

## Best Practices

1. Use HTTPS (Google requirement)
2. Separate SEO description ≠ Schema.org description
3. Auto-generate OG/Twitter tags when possible
4. Validate formats (URLs, images, ISO 8601 dates)
5. All new fields optional (backward compatible)
6. Use conditional spreading for optional fields
7. Real-time SEO Doctor feedback
8. JSON-LD format (Google recommended)
9. Optimize Core Web Vitals (LCP < 2.5s, INP < 200ms, CLS < 0.1)
10. Mobile-first approach
11. E-E-A-T signals (expertise, authoritativeness, trustworthiness)
12. Image optimization (WebP/AVIF, lazy load, proper alt)
13. Validate structured data (Google Rich Results Test)
14. Monitor Core Web Vitals in Search Console
15. Update lastReviewed date regularly

---

## Common Mistakes to Avoid

- Same text for SEO description and Schema.org description
- Missing OG tags (especially og:type, og:site_name, og:locale)
- HTTP instead of HTTPS
- Missing canonical URL (duplicate content risk)
- Logo too small (< 112x112px)
- Title/description too long (truncation)
- Missing Twitter Cards (lose social SEO)
- Missing image alt text (accessibility + SEO)
- Poor Core Web Vitals (ranking impact)
- Not mobile-friendly (mobile-first indexing)
- Missing E-E-A-T signals (author credentials)
- No XML sitemap (slower indexing)
- Unvalidated structured data (Search Console errors)
- HTTP images on HTTPS site (mixed content)
- Unoptimized images (slow page speed)

---

## Validation & Testing Checklist

**Before Publishing:**
- Validate structured data (Google Rich Results Test)
- Test mobile-friendliness (Google Mobile-Friendly Test)
- Check Core Web Vitals (PageSpeed Insights)
- Validate Open Graph tags (Facebook Sharing Debugger)
- Validate Twitter Cards (Twitter Card Validator)
- Check HTTPS and SSL certificate
- Verify canonical URLs
- Test XML sitemap accessibility
- Verify robots.txt
- Check all images have alt text
- Validate hreflang tags (multi-language)

**Ongoing Monitoring:**
- Monitor Search Console for errors
- Track Core Web Vitals
- Review structured data errors
- Monitor page speed
- Check mobile usability
- Review indexing status

---

**Last Updated:** April 2026
**Coverage:** 100% aligned with Google Search Central, Schema.org, and 2025 SEO best practices
