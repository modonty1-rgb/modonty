# Meta Tags & JSON-LD: Complete Reference

## Meta Tags Overview

Meta tags in `<head>` communicate page information to search engines and social platforms.

### Standard Meta Tags
- `<title>` - Page title (browser tab + search results)
- `<meta name="description">` - Page description
- `<meta name="robots">` - Crawling instructions (index, follow, noindex, nofollow)

### Open Graph Meta Tags (Facebook, LinkedIn)
- `og:title`, `og:description`, `og:image`, `og:url`, `og:type` (website, article, etc.)
- `og:site_name`, `og:locale` (e.g., ar_SA)
- `og:image:width`, `og:image:height`, `og:image:alt`

### Twitter Card Meta Tags
- `twitter:card` (summary, summary_large_image)
- `twitter:title`, `twitter:description`, `twitter:image`, `twitter:site`
- `twitter:image:alt`, `twitter:creator`

### Canonical URL
- `<link rel="canonical">` - Prevents duplicate content issues

---

## Meta Tags Best Practices

### Title Tags
- Length: 50-60 characters (optimal)
- Include brand name
- Make compelling and unique
- Include primary keyword

### Meta Descriptions
- Length: 150-160 characters (optimal)
- Compelling call-to-action
- Include relevant keywords naturally
- Unique per page

### Open Graph Images
- Size: 1200x630 pixels (recommended)
- Format: JPEG or PNG
- Always include alt text
- Use HTTPS URLs

### Canonical URLs
- Always use absolute URLs
- Use HTTPS
- One canonical per page

---

## JSON-LD: JavaScript Object Notation for Linked Data

JSON-LD provides machine-readable metadata using Schema.org vocabulary. Placed in `<script type="application/ld+json">`.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Organization",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png"
}
</script>
```

**Key Properties:**
- `@context`: Always "https://schema.org"
- `@type`: Entity type (Organization, Person, Article, etc.)
- Other properties: Specific to entity type

---

## Schema.org Common Types

- **Organization** - Companies, businesses, institutions
- **Person** - Individuals
- **Article** - News articles, blog posts
- **LocalBusiness** - Businesses with physical locations
- **Product** - Products for sale
- **Event** - Events and gatherings
- **WebPage** - Web pages
- **WebSite** - Entire websites

---

## Organization Schema Property Reference

### Required
- `name` (organization name)
- `url` (website URL, absolute HTTPS)

### Recommended Basic Information
- `legalName` - Official legal name if different
- `alternateName` - Alternative names, aliases
- `logo` (URL or ImageObject, min 112x112px)
- `description` - Brief description (clear, concise)
- `slogan` - Company tagline

### Contact Information
- `contactPoint` (ContactPoint object)
  - `telephone`, `email`, `contactType` (customer service, sales, support)
  - `areaServed` (ISO 3166-1 alpha-2, e.g., "SA")
  - `availableLanguage` (array of ISO 639-1 codes)
- `telephone`, `email` - Primary contact

### Address & Legal
- `address` (PostalAddress)
  - `streetAddress`, `addressLocality` (city), `addressRegion`, `addressCountry` (ISO code), `postalCode`
- `legalAddress` - If different from physical
- `identifier` (PropertyValue array, e.g., commercial registration)
- `vatID`, `taxID`

### Business Information
- `numberOfEmployees` (QuantitativeValue - single value or range)
- `foundingDate` (ISO 8601: YYYY-MM-DD)
- `organizationType`, `legalForm`

### Industry & Expertise
- `isicV4` - International Standard Industrial Classification
- `knowsAbout` - Topics/expertise areas
- `keywords` - Classification keywords

### Relationships & Links
- `parentOrganization` - Parent company
- `sameAs` - Social profiles and official pages array
- `areaServed` - Geographic area (country codes or GeoShape)
- `knowsLanguage` - Languages (ISO 639-1 codes or names)

---

## Complete Organization JSON-LD Example

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com#organization",
      "name": "Acme Corporation",
      "legalName": "Acme Corp LLC",
      "url": "https://acmecorp.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://acmecorp.com/logo.png",
        "width": 250,
        "height": 100
      },
      "description": "Leading provider of digital services",
      "foundingDate": "2020-01-15",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+966-11-123-4567",
        "email": "contact@acmecorp.com",
        "contactType": "customer service",
        "areaServed": "SA",
        "availableLanguage": ["ar", "en"]
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "King Fahd Road, Building 123",
        "addressLocality": "Riyadh",
        "addressCountry": "SA",
        "postalCode": "12345"
      },
      "identifier": {
        "@type": "PropertyValue",
        "name": "Commercial Registration",
        "value": "1234567890"
      },
      "vatID": "311234567800003",
      "sameAs": [
        "https://facebook.com/acmecorp",
        "https://linkedin.com/company/acmecorp"
      ],
      "knowsAbout": ["Digital Marketing", "Web Development"],
      "knowsLanguage": ["ar", "en"]
    }
  ]
}
```

---

## Meta Tags Example

```html
<head>
  <title>Acme Corp - Digital Marketing Services</title>
  <meta name="description" content="Top-notch digital marketing services in Saudi Arabia. SEO, social media, e-commerce.">
  <meta name="robots" content="index, follow">

  <!-- Open Graph -->
  <meta property="og:title" content="Acme Corp - Digital Marketing Services">
  <meta property="og:description" content="Top-notch digital marketing services">
  <meta property="og:image" content="https://acmecorp.com/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Acme Corp">
  <meta property="og:url" content="https://example.com/clients/acme-corp">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Example Site">
  <meta property="og:locale" content="ar_SA">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Acme Corp - Digital Marketing">
  <meta name="twitter:description" content="Top-notch digital services">
  <meta name="twitter:image" content="https://acmecorp.com/og-image.jpg">
  <meta name="twitter:image:alt" content="Acme Corp">
  <meta name="twitter:site" content="@acmecorp">

  <!-- Canonical -->
  <link rel="canonical" href="https://example.com/clients/acme-corp">
</head>
```

---

## JSON-LD Best Practices

1. **Validation** - Use Schema.org Validator and Google Rich Results Test
2. **Completeness** - Include all relevant properties, use specific types
3. **Accuracy** - Data matches visible content, keep up-to-date
4. **URLs** - Always use absolute HTTPS URLs
5. **Images** - Use ImageObject with width/height, min 112x112px
6. **Address** - Use ISO country/language codes
7. **Contact** - Complete contactPoint information
8. **Dates** - ISO-8601 format (YYYY-MM-DD)

---

## Validation Checklist

### Pre-Generation
- All required data filled in
- Logo/images uploaded and accessible
- URLs are absolute and HTTPS
- Contact information accurate

### Meta Tags
- Title: 50-60 characters
- Description: 150-160 characters
- All URLs: absolute and HTTPS
- Images: correct dimensions
- All images have alt text
- Canonical URL correct
- Robots meta tag appropriate

### JSON-LD
- Valid JSON (no syntax errors)
- `@context` is "https://schema.org"
- `@type` correct
- `name` present, `url` absolute HTTPS
- Logo: ImageObject with dimensions (112x112 min)
- Address: ISO country codes
- Dates: ISO-8601 format
- All `sameAs` URLs valid
- Validates with Schema.org and Google tests

### Post-Generation
- Meta tags display in page source
- JSON-LD script in `<head>`
- Open Graph preview works (Facebook Debugger)
- Twitter Card preview works (Twitter Validator)
- Search engine can crawl/index
- Rich results appear in Search Console

---

**Last Updated:** April 2026
