# Meta Tags & JSON-LD — Quick Reference

Single reference for meta tags, JSON-LD, physical entities, and GEO optimization.

---

## 1. Meta Tags Quick Lookup

### Document & SEO
```json
{
  "charset": "UTF-8",
  "viewport": "width=device-width, initial-scale=1",
  "title": "Page Title (50-60 chars)",
  "description": "Meta description (150-160 chars)",
  "canonical": "https://www.example.com/page",
  "robots": "index, follow",
  "theme-color": "#000000"
}
```

### Open Graph
```json
{
  "og:title": "Page Title",
  "og:type": "website",
  "og:url": "https://www.example.com/page",
  "og:image": "https://www.example.com/og.jpg",
  "og:image:width": "1200",
  "og:image:height": "630",
  "og:image:alt": "Image description",
  "og:description": "Page description",
  "og:site_name": "Site Name",
  "og:locale": "ar_SA"
}
```

### Twitter Card
```json
{
  "twitter:card": "summary_large_image",
  "twitter:title": "Page Title",
  "twitter:description": "Description",
  "twitter:image": "https://www.example.com/og.jpg",
  "twitter:image:alt": "Image description",
  "twitter:site": "@username"
}
```

---

## 2. JSON-LD — Home/About (100% Coverage)

### Organization
```json
{
  "@type": "Organization",
  "@id": "https://example.com#organization",
  "name": "Company Name",
  "url": "https://example.com",
  "description": "Brief description",
  "inLanguage": "ar",
  "sameAs": ["https://twitter.com/...", "https://linkedin.com/..."],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "support@example.com",
    "telephone": "+966500000000",
    "areaServed": "SA"
  },
  "logo": {
    "@type": "ImageObject",
    "url": "https://example.com/logo.png",
    "width": 512,
    "height": 512
  },
  "knowsLanguage": ["ar", "en"]
}
```

### WebSite
```json
{
  "@type": "WebSite",
  "@id": "https://example.com#website",
  "name": "Site Name",
  "url": "https://example.com",
  "inLanguage": "ar",
  "publisher": { "@id": "https://example.com#organization" },
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://example.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

### WebPage / AboutPage
```json
{
  "@type": "WebPage",
  "@id": "https://example.com#webpage",
  "name": "Page Title",
  "url": "https://example.com",
  "isPartOf": { "@id": "https://example.com#website" },
  "inLanguage": "ar",
  "dateModified": "2025-01-29T00:00:00.000Z",
  "mainEntityOfPage": "https://example.com",
  "description": "Page description"
}
```

For AboutPage, add:
- `"headline": "About Us"`
- `"about": { "@id": "https://example.com#organization" }`
- `"breadcrumb": { "@id": "https://example.com/about#breadcrumb" }`

### BreadcrumbList
```json
{
  "@type": "BreadcrumbList",
  "@id": "https://example.com/about#breadcrumb",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": { "@id": "https://example.com" } },
    { "@type": "ListItem", "position": 2, "name": "About", "item": { "@id": "https://example.com/about" } }
  ]
}
```

---

## 3. Physical Entity (Address & Geo)

### Organization with Address
```json
{
  "@type": "Organization",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "Riyadh",
    "addressCountry": "SA",
    "postalCode": "12345"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 24.7136,
    "longitude": 46.6753
  }
}
```

### LocalBusiness (for physical stores)
```json
{
  "@type": "LocalBusiness",
  "address": { "@type": "PostalAddress", "streetAddress": "...", "addressLocality": "Riyadh", "addressCountry": "SA" },
  "telephone": "+966500000000",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "09:00",
    "closes": "18:00"
  }
}
```

---

## 4. GEO (Generative AI Optimization)

### Entity Depth
Organization + address + contactPoint + sameAs = NAP, trust, entity resolution

### FAQPage (Voice Search)
```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is...?",
      "acceptedAnswer": { "@type": "Answer", "text": "Answer text (40-60 words)" }
    }
  ]
}
```

### HowTo (Instructions)
```json
{
  "@type": "HowTo",
  "name": "How to...",
  "step": [
    { "@type": "HowToStep", "name": "Step 1", "text": "Do this" },
    { "@type": "HowToStep", "name": "Step 2", "text": "Then do this" }
  ]
}
```

### Article (Author + Dates)
```json
{
  "@type": "Article",
  "headline": "Article Title",
  "datePublished": "2025-01-15T00:00:00.000Z",
  "dateModified": "2025-01-29T00:00:00.000Z",
  "author": { "@type": "Person", "name": "Author", "url": "https://example.com/author" },
  "publisher": { "@id": "https://example.com#organization" }
}
```

---

## 5. Field Lengths & Formats

| Field | Length | Format | Example |
|-------|--------|--------|---------|
| SEO Title | 50-60 chars | Text | "Company Name - Services" |
| SEO Description | 150-160 chars | Text | Compelling summary |
| OG Title | 55-60 chars | Text | Can be same as SEO Title |
| OG Description | 110-150 chars | Text | Can be same as SEO Description |
| Image Alt | 125 chars max | Text | Descriptive text |
| Date | ISO 8601 | YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ | 2025-01-29 |
| Logo Size | 112x112px min | PNG/SVG/JPG | 250x100 recommended |
| OG Image | 1200x630px | WebP/AVIF/JPG | 2:1 ratio |
| Twitter Image | 1200x628px (min 600x314px) | WebP/AVIF/JPG | 1.91:1 ratio |

---

## 6. Meta Checklist (100% Coverage)

| Area | Keys |
|------|------|
| **Document** | charset, viewport, title, description, canonical, robots, theme-color, author |
| **OG** | og:title, og:type, og:url, og:image, og:image:width, og:image:height, og:image:alt, og:description, og:site_name, og:locale |
| **Twitter** | twitter:card, twitter:title, twitter:description, twitter:image, twitter:image:alt, twitter:site, twitter:creator |
| **Org** | @type, @id, name, url, description, inLanguage, sameAs, contactPoint, logo (ImageObject), image, knowsLanguage |
| **WebSite** | @type, @id, name, url, inLanguage, publisher, potentialAction |
| **WebPage/AboutPage** | @type, @id, name, headline (About), url, mainEntityOfPage, description, about (About), publisher, isPartOf, inLanguage, dateModified, breadcrumb (About) |
| **BreadcrumbList** | @type, @id, itemListElement (ListItem: position, name, item) |
| **GEO** | Entity depth (Org + address + contactPoint + sameAs), FAQPage, HowTo, Article (author, datePublished, dateModified) |

---

## 7. Best Practices

1. Validate structured data (Google Rich Results Test)
2. Test meta tags (Facebook Debugger, Twitter Validator)
3. Use HTTPS for all URLs
4. Separate SEO description from Schema.org description
5. Include alt text for all images (accessibility + SEO)
6. Use conditional spreading for optional fields
7. ISO 8601 format for all dates
8. ISO 3166-1 alpha-2 for country codes (SA, US, etc.)
9. ISO 639-1 for language codes (ar, en, etc.)
10. Content matches schema (avoid spammy structured data)

---

**Last Updated:** April 2026
**Coverage:** 100% of meta tags, JSON-LD, and GEO optimization
