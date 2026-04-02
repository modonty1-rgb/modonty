 

Single reference: **meta tags** + **JSON-LD** + **Physical Entity** + **GEO**. Replace values with your own.

---

## 1. Meta tags (object — key → sample)

### 1.1 Document & SEO

```json
{
  "charset": "UTF-8",
  "viewport": "width=device-width, initial-scale=1",
  "title": "About Us - Example Site",
  "description": "Learn about Example Site. Short compelling summary under 160 characters.",
  "canonical": "https://www.example.com/about",
  "robots": "index, follow",
  "googlebot": "index, follow",
  "theme-color": "#000000",
  "author": "Example Team",
  "keywords": "about, company, example"
}
```
**Notes:**  
- `meta name="keywords"` is **ignored by Google and Bing**; include only if other systems or legacy crawlers use it.  
- **googlebot:** Unless you have a specific reason to restrict Google (e.g. max-snippet, max-image-preview), standard **index, follow** is safer and cleaner.

### 1.2 Open Graph (property → content)

```json
{
  "og:title": "About Us - Example Site",
  "og:type": "website",
  "og:url": "https://www.example.com/about",
  "og:image": "https://www.example.com/og.jpg",
  "og:image:secure_url": "https://www.example.com/og.jpg",
  "og:image:type": "image/jpeg",
  "og:image:width": "1200",
  "og:image:height": "630",
  "og:image:alt": "Example Site about page preview",
  "og:description": "Learn about Example Site.",
  "og:site_name": "Example Site",
  "og:locale": "ar_SA",
  "og:locale:alternate": ["en_US"],
  "og:determiner": "auto"
}
```

### 1.3 Twitter Card

```json
{
  "twitter:card": "summary_large_image",
  "twitter:title": "About Us - Example Site",
  "twitter:description": "Learn about Example Site.",
  "twitter:image": "https://www.example.com/og.jpg",
  "twitter:image:alt": "Example Site about page preview",
  "twitter:site": "@example",
  "twitter:creator": "@example_team",
  "twitter:site:id": "123456789",
  "twitter:creator:id": "987654321"
}
```
**Note:** Most brands use **@handle** (twitter:site, twitter:creator). Numeric **site:id** / **creator:id** are only needed if you change handles frequently.

### 1.4 International (hreflang)

```json
{
  "hreflang": [
    { "lang": "ar", "href": "https://www.example.com/about" },
    { "lang": "en", "href": "https://www.example.com/en/about" },
    { "lang": "x-default", "href": "https://www.example.com/about" }
  ]
}
```

---

## 2. JSON-LD — Home (100% coverage)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.example.com#organization",
      "name": "Example Site",
      "url": "https://www.example.com",
      "description": "One-sentence brand description.",
      "inLanguage": "ar",
      "sameAs": [
        "https://twitter.com/example",
        "https://linkedin.com/company/example"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "support@example.com",
        "telephone": "+966500000000",
        "areaServed": "SA"
      },
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.example.com/logo.png",
        "width": 512,
        "height": 512
      },
      "image": {
        "@type": "ImageObject",
        "url": "https://www.example.com/og.jpg",
        "width": 1200,
        "height": 630
      },
      "knowsLanguage": ["ar", "en"]
    },
    {
      "@type": "WebSite",
      "@id": "https://www.example.com#website",
      "name": "Example Site",
      "url": "https://www.example.com",
      "description": "One-sentence brand description.",
      "inLanguage": "ar",
      "publisher": { "@id": "https://www.example.com#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.example.com/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://www.example.com#webpage",
      "name": "Home - Example Site",
      "url": "https://www.example.com",
      "description": "Home page description.",
      "isPartOf": { "@id": "https://www.example.com#website" },
      "inLanguage": "ar",
      "dateModified": "2025-01-29T00:00:00.000Z",
      "mainEntityOfPage": "https://www.example.com",
      "primaryImageOfPage": {
        "@type": "ImageObject",
        "url": "https://www.example.com/og.jpg",
        "width": 1200,
        "height": 630
      }
    }
  ]
}
```

---

## 3. JSON-LD — About (100% coverage)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.example.com#organization",
      "name": "Example Site",
      "url": "https://www.example.com",
      "description": "One-sentence brand description.",
      "inLanguage": "ar",
      "sameAs": [
        "https://twitter.com/example",
        "https://linkedin.com/company/example"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "support@example.com",
        "telephone": "+966500000000",
        "areaServed": "SA"
      },
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.example.com/logo.png",
        "width": 512,
        "height": 512
      },
      "knowsLanguage": ["ar", "en"]
    },
    {
      "@type": "WebSite",
      "@id": "https://www.example.com#website",
      "name": "Example Site",
      "url": "https://www.example.com",
      "inLanguage": "ar",
      "publisher": { "@id": "https://www.example.com#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.example.com/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "AboutPage",
      "@id": "https://www.example.com/about#aboutpage",
      "name": "About Us - Example Site",
      "headline": "About Us",
      "url": "https://www.example.com/about",
      "mainEntityOfPage": "https://www.example.com/about",
      "description": "About page description.",
      "about": { "@id": "https://www.example.com#organization" },
      "publisher": { "@id": "https://www.example.com#organization" },
      "isPartOf": { "@id": "https://www.example.com#website" },
      "inLanguage": "ar",
      "dateModified": "2025-01-29T00:00:00.000Z",
      "primaryImageOfPage": {
        "@type": "ImageObject",
        "url": "https://www.example.com/og.jpg",
        "width": 1200,
        "height": 630
      },
      "breadcrumb": { "@id": "https://www.example.com/about#breadcrumb" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.example.com/about#breadcrumb",
      "itemListOrder": "ItemListOrderAscending",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Example Site",
          "item": { "@id": "https://www.example.com" }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "About Us",
          "item": { "@id": "https://www.example.com/about" }
        }
      ]
    }
  ]
}
```

---

## 4. Key checklist (100% coverage)

| Area | Keys |
|------|------|
| **Document** | charset, viewport, title, description, canonical, robots, googlebot (prefer index, follow), theme-color, author, keywords (ignored by Google/Bing) |
| **OG** | og:title, og:type, og:url, og:image, og:image:secure_url, og:image:type, og:image:width, og:image:height, og:image:alt, og:description, og:site_name, og:locale, og:locale:alternate, og:determiner |
| **Twitter** | twitter:card, twitter:title, twitter:description, twitter:image, twitter:image:alt, twitter:site, twitter:creator (IDs only if handles change often) |
| **Org** | @type, @id, name, url, description, inLanguage, sameAs, contactPoint, logo (ImageObject), image (ImageObject), knowsLanguage |
| **WebSite** | @type, @id, name, url, inLanguage, publisher, potentialAction (SearchAction) |
| **WebPage/AboutPage** | @type, @id, name, headline (About), url, mainEntityOfPage, description, about (About), publisher, isPartOf, inLanguage, dateModified, primaryImageOfPage (ImageObject), breadcrumb (About) |
| **BreadcrumbList** | @type, @id, itemListOrder, itemListElement (ListItem: position, name, item) |
| **Physical Entity** | Organization: address (PostalAddress), geo (GeoCoordinates). LocalBusiness: address, telephone, openingHoursSpecification, image |
| **GEO** | FAQPage (mainEntity: Question/Answer), HowTo (step: HowToStep), Article (author, datePublished, dateModified). Entity depth: Org + address + contactPoint + sameAs |

Omit `potentialAction` if no site search. **googlebot:** prefer standard **index, follow** unless you need snippet/image restrictions. **twitter:site:id / creator:id:** optional; most use @handle; IDs only if handles change frequently. **keywords:** ignored by Google/Bing.

---

## 5. Physical Entity (address, place, geo)

Organization with **address** (PostalAddress) and optional **geo** (GeoCoordinates). Use when you have a physical location. For a local branch, use **LocalBusiness** (extends Organization + Place).

### 5.1 Meta/keys (no extra meta; JSON-LD only)

### 5.2 Organization + address & geo (add to §2 / §3 @graph)

```json
{
  "@type": "Organization",
  "@id": "https://www.example.com#organization",
  "name": "Example Site",
  "url": "https://www.example.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Example St",
    "addressLocality": "Riyadh",
    "addressRegion": "Riyadh",
    "postalCode": "12345",
    "addressCountry": "SA"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 24.7136,
    "longitude": 46.6753
  }
}
```

### 5.3 LocalBusiness (optional — physical store/branch)

```json
{
  "@type": "LocalBusiness",
  "@id": "https://www.example.com#localbusiness",
  "name": "Example Site",
  "url": "https://www.example.com",
  "address": { "@type": "PostalAddress", "streetAddress": "123 Example St", "addressLocality": "Riyadh", "addressCountry": "SA" },
  "telephone": "+966500000000",
  "openingHoursSpecification": { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "09:00", "closes": "18:00" },
  "image": "https://www.example.com/og.jpg"
}
```

**Checklist:** address (PostalAddress), geo (GeoCoordinates), LocalBusiness when applicable (address, telephone, openingHours).

---

## 6. Generative AI Optimization (GEO)

GEO helps AI engines understand and cite your content: **entity depth** (Organization + address + contactPoint + sameAs), **FAQPage**, **HowTo**, **Article** (author, datePublished), and **content parity** (schema matches visible content).

### 6.1 GEO-relevant keys (already in doc)

- Organization: name, url, description, sameAs, contactPoint, address (§5), knowsLanguage — **entity signals**.
- WebSite: publisher, potentialAction — **site identity**.
- WebPage/AboutPage: dateModified, mainEntityOfPage, description — **freshness and topic**.

### 6.2 FAQPage (add when page has Q&A)

```json
{
  "@type": "FAQPage",
  "@id": "https://www.example.com/about#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Example Site?",
      "acceptedAnswer": { "@type": "Answer", "text": "Example Site is a leading platform for..." }
    }
  ]
}
```

### 6.3 HowTo (add when page has steps)

```json
{
  "@type": "HowTo",
  "@id": "https://www.example.com/guide#howto",
  "name": "How to get started",
  "step": [
    { "@type": "HowToStep", "name": "Step 1", "text": "First, sign up." },
    { "@type": "HowToStep", "name": "Step 2", "text": "Then, complete your profile." }
  ]
}
```

### 6.4 Article (for blog/news — author + date for GEO)

```json
{
  "@type": "Article",
  "@id": "https://www.example.com/post/slug#article",
  "headline": "Article title",
  "datePublished": "2025-01-15T00:00:00.000Z",
  "dateModified": "2025-01-29T00:00:00.000Z",
  "author": { "@type": "Person", "name": "Author Name", "url": "https://www.example.com/author" },
  "publisher": { "@id": "https://www.example.com#organization" }
}
```

### 6.5 GEO checklist

| Item | Purpose |
|------|---------|
| Organization + address + contactPoint + sameAs | Entity resolution, NAP, trust |
| FAQPage | Conversational Q&A, 40–60 word answers |
| HowTo | Step-by-step content, AI Overviews |
| Article (author, datePublished, dateModified) | Authority, freshness |
| Content parity | Schema matches visible content; avoid spammy structured data |

---

## 7. Coverage summary

| Area | Covered in doc |
|------|----------------|
| Meta (document, OG, Twitter, hreflang) | §1 |
| JSON-LD Home / About (Org, WebSite, WebPage, AboutPage, BreadcrumbList) | §2, §3 |
| Physical Entity (address, geo, LocalBusiness) | §5 |
| GEO (entity signals, FAQPage, HowTo, Article) | §6 |
