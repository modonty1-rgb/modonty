# Modonty Home & About Page — JSON-LD & Meta Tags Spec

**Purpose:** Single source of truth for https://www.modonty.com/ (home) and https://www.modonty.com/about (من نحن). Same **Organization** and **WebSite** data used on both; only the page-level type and meta differ.

**References:** schema.org (WebSite, Organization, AboutPage, BreadcrumbList), [ogp.me](https://ogp.me/), Google snippet/canonical guidance, BM (AI-BUSINESS-MODEL-GUIDE.md).

---

## 1. Shared identity (use on both home and about)

| Field | Value | Notes |
|-------|--------|------|
| **Site URL** | `https://www.modonty.com` | Canonical base; no trailing slash for root. |
| **Site name** | مودونتي (Modonty) | OG/Twitter `site_name`; JSON-LD Organization/WebSite `name`. |
| **Default locale** | `ar_SA` | BCP 47; primary language Arabic. |
| **Description (brand)** | One sentence from BM: e.g. "منصة محتوى عربية بالاشتراك تعتمد نظام المدونة المرجعية — حضور حقيقي وليس وعوداً." | Reuse in Organization `description` and WebSite `description` where applicable. |

---

## 2. JSON-LD — Home page (https://www.modonty.com/)

**Goal:** Identify the site as a **WebSite** and the brand as an **Organization**. Optionally include a **WebPage** or **CollectionPage** for the homepage URL. Use `@graph` so Organization and WebSite have stable `@id`s and can be referenced from the about page.

### 2.1 Recommended @graph (home)

- **Organization**  
  - `@type`: `Organization`  
  - `@id`: `https://www.modonty.com/#organization`  
  - `name`: مودونتي  
  - `url`: `https://www.modonty.com`  
  - `description`: (brand description above)  
  - `inLanguage`: `ar`  
  - Optional: `logo` (ImageObject or URL), `sameAs` (array of social profile URLs).

- **WebSite**  
  - `@type`: `WebSite`  
  - `@id`: `https://www.modonty.com/#website`  
  - `name`: مودونتي  
  - `url`: `https://www.modonty.com`  
  - `description`: (same or shortened brand description)  
  - `inLanguage`: `ar`  
  - `publisher`: `{ "@id": "https://www.modonty.com/#organization" }`  
  - Optional: `potentialAction` (e.g. SearchAction if you have site search).

- **WebPage** (for the homepage URL)  
  - `@type`: `WebPage`  
  - `@id`: `https://www.modonty.com/#webpage`  
  - `name`: (e.g. "أحدث المقالات والمدونات" or "مودونتي - منصة المدونات")  
  - `url`: `https://www.modonty.com`  
  - `isPartOf`: `{ "@id": "https://www.modonty.com/#website" }`  
  - `inLanguage`: `ar`  
  - `dateModified`: ISO 8601 (last significant update)  
  - Optional: `description`, `primaryImageOfPage`.

If the homepage is primarily a **collection of articles**, you can instead (or in addition) use **CollectionPage** with `mainEntity` ItemList of articles — but keep **Organization** and **WebSite** in the same `@graph` so identity is consistent.

### 2.2 Example JSON-LD (home)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.modonty.com/#organization",
      "name": "مودونتي",
      "url": "https://www.modonty.com",
      "description": "منصة محتوى عربية بالاشتراك تعتمد نظام المدونة المرجعية — حضور حقيقي وليس وعوداً.",
      "inLanguage": "ar"
    },
    {
      "@type": "WebSite",
      "@id": "https://www.modonty.com/#website",
      "name": "مودونتي",
      "url": "https://www.modonty.com",
      "description": "منصة محتوى عربية بالاشتراك — مدونة مرجعية ومقالات احترافية.",
      "inLanguage": "ar",
      "publisher": { "@id": "https://www.modonty.com/#organization" }
    },
    {
      "@type": "WebPage",
      "@id": "https://www.modonty.com/#webpage",
      "name": "أحدث المقالات والمدونات",
      "url": "https://www.modonty.com",
      "isPartOf": { "@id": "https://www.modonty.com/#website" },
      "inLanguage": "ar",
      "dateModified": "2025-01-29T00:00:00.000Z"
    }
  ]
}
```

---

## 3. JSON-LD — About page (https://www.modonty.com/about)

**Goal:** **AboutPage** (schema.org type for “about” pages) with **same** Organization and WebSite by reference. Add **BreadcrumbList** for hierarchy (Home → من نحن).

### 3.1 Recommended @graph (about)

- **Organization** — same as home: `@id` `https://www.modonty.com/#organization`, `name`, `url`, `description`, `inLanguage`.
- **WebSite** — same as home: `@id` `https://www.modonty.com/#website`, `publisher` → Organization.
- **AboutPage**  
  - `@type`: `AboutPage`  
  - `@id`: `https://www.modonty.com/about#aboutpage`  
  - `name` / `headline`: e.g. "من نحن - مودونتي"  
  - `url`: `https://www.modonty.com/about`  
  - `description`: (about-page meta description)  
  - `about`: `{ "@id": "https://www.modonty.com/#organization" }`  
  - `publisher`: `{ "@id": "https://www.modonty.com/#organization" }`  
  - `isPartOf`: `{ "@id": "https://www.modonty.com/#website" }`  
  - `inLanguage`: `ar`  
  - `dateModified`: ISO 8601  
  - Optional: `primaryImageOfPage`, `mainEntityOfPage` (URL of this page).
- **BreadcrumbList**  
  - `@type`: `BreadcrumbList`  
  - `@id`: `https://www.modonty.com/about#breadcrumb`  
  - `itemListElement`: [ { position: 1, name: "مودونتي", item: { "@id": "https://www.modonty.com" } }, { position: 2, name: "من نحن", item: { "@id": "https://www.modonty.com/about" } } ]

### 3.2 Example JSON-LD (about)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.modonty.com/#organization",
      "name": "مودونتي",
      "url": "https://www.modonty.com",
      "description": "منصة محتوى عربية بالاشتراك تعتمد نظام المدونة المرجعية — حضور حقيقي وليس وعوداً.",
      "inLanguage": "ar"
    },
    {
      "@type": "WebSite",
      "@id": "https://www.modonty.com/#website",
      "name": "مودونتي",
      "url": "https://www.modonty.com",
      "inLanguage": "ar",
      "publisher": { "@id": "https://www.modonty.com/#organization" }
    },
    {
      "@type": "AboutPage",
      "@id": "https://www.modonty.com/about#aboutpage",
      "name": "من نحن - مودونتي",
      "headline": "من نحن",
      "url": "https://www.modonty.com/about",
      "mainEntityOfPage": "https://www.modonty.com/about",
      "description": "تعرف على منصة مودونتي - منصة المدونات الاحترافية متعددة العملاء.",
      "about": { "@id": "https://www.modonty.com/#organization" },
      "publisher": { "@id": "https://www.modonty.com/#organization" },
      "isPartOf": { "@id": "https://www.modonty.com/#website" },
      "inLanguage": "ar",
      "dateModified": "2025-01-29T00:00:00.000Z"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.modonty.com/about#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "مودونتي", "item": { "@id": "https://www.modonty.com" } },
        { "@type": "ListItem", "position": 2, "name": "من نحن", "item": { "@id": "https://www.modonty.com/about" } }
      ]
    }
  ]
}
```

---

## 4. Meta tags — Both pages (same structure, page-specific values)

Per [ogp.me](https://ogp.me/): **required** — `og:title`, `og:type`, `og:image`, `og:url`. **Recommended** — `og:description`, `og:site_name`, `og:locale`. Google: **title** (≈50–60 chars), **meta description** (≈150–160 chars), **canonical**.

### 4.1 Standard set per page

| Meta / Tag | Home | About | Notes |
|------------|------|--------|------|
| **Title** | e.g. "أحدث المقالات والمدونات - مودونتي" | e.g. "من نحن - مودونتي" | Unique per page; ~50–60 chars. |
| **Meta description** | Home description (≤160 chars) | About description (≤160 chars) | Unique, compelling summary. |
| **Canonical** | `https://www.modonty.com/` | `https://www.modonty.com/about` | One canonical URL per page. |
| **Robots** | `index, follow` (or from config) | `index, follow` | Same as current. |
| **og:title** | Same as or variant of title | Same as or variant of title | As it should appear in social. |
| **og:type** | `website` | `website` | Not article. |
| **og:url** | `https://www.modonty.com/` | `https://www.modonty.com/about` | Canonical URL. |
| **og:image** | Absolute URL to image (1200×630 recommended) | Absolute URL to image | Same or page-specific. |
| **og:image:secure_url** | Same as og:image (HTTPS) | Same | If using HTTPS. |
| **og:image:width** | 1200 | 1200 | Optional but recommended. |
| **og:image:height** | 630 | 630 | Optional but recommended. |
| **og:image:alt** | Short alt text | Short alt text | Recommended by ogp.me. |
| **og:description** | Same as meta description or shorter | Same as meta description or shorter | 1–2 sentences. |
| **og:site_name** | مودونتي | مودونتي | **Same on both.** |
| **og:locale** | `ar_SA` | `ar_SA` | **Same on both.** |
| **twitter:card** | `summary_large_image` | `summary_large_image` | When image is prominent. |
| **twitter:title** | Same as og:title | Same as og:title | |
| **twitter:description** | Same as og:description | Same as og:description | |
| **twitter:image** | Same as og:image | Same as og:image | |
| **twitter:site** | @handle (if any) | @handle | **Same on both.** |
| **twitter:creator** | @handle (if any) | @handle | **Same on both.** |

### 4.2 Example HTML meta (about page)

```html
<title>من نحن - مودونتي</title>
<meta name="description" content="تعرف على منصة مودونتي - منصة المدونات الاحترافية متعددة العملاء." />
<link rel="canonical" href="https://www.modonty.com/about" />
<meta name="robots" content="index, follow" />

<meta property="og:title" content="من نحن - مودونتي" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://www.modonty.com/about" />
<meta property="og:image" content="https://www.modonty.com/og-about.jpg" />
<meta property="og:image:secure_url" content="https://www.modonty.com/og-about.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="من نحن - مودونتي" />
<meta property="og:description" content="تعرف على منصة مودونتي - منصة المدونات الاحترافية متعددة العملاء." />
<meta property="og:site_name" content="مودونتي" />
<meta property="og:locale" content="ar_SA" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="من نحن - مودونتي" />
<meta name="twitter:description" content="تعرف على منصة مودونتي - منصة المدونات الاحترافية متعددة العملاء." />
<meta name="twitter:image" content="https://www.modonty.com/og-about.jpg" />
```

### 4.3 Example HTML meta (home page)

```html
<title>أحدث المقالات والمدونات - مودونتي</title>
<meta name="description" content="استكشف أحدث المقالات والمدونات الاحترافية من أفضل الكتّاب. محتوى عالي الجودة في التقنية، التصميم، التسويق، والابتكار." />
<link rel="canonical" href="https://www.modonty.com/" />
<meta name="robots" content="index, follow" />

<meta property="og:title" content="أحدث المقالات والمدونات - مودونتي" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://www.modonty.com/" />
<meta property="og:image" content="https://www.modonty.com/og-image.jpg" />
<meta property="og:image:secure_url" content="https://www.modonty.com/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="مودونتي - منصة المدونات" />
<meta property="og:description" content="استكشف أحدث المقالات والمدونات الاحترافية من أفضل الكتّاب. محتوى عالي الجودة في التقنية، التصميم، التسويق، والابتكار." />
<meta property="og:site_name" content="مودونتي" />
<meta property="og:locale" content="ar_SA" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="أحدث المقالات والمدونات - مودونتي" />
<meta name="twitter:description" content="استكشف أحدث المقالات والمدونات الاحترافية من أفضل الكتّاب." />
<meta name="twitter:image" content="https://www.modonty.com/og-image.jpg" />
```

---

## 5. Summary

| Page | JSON-LD @graph | Meta (same structure) |
|------|----------------|------------------------|
| **Home** | Organization + WebSite + WebPage (or CollectionPage) | title, description, canonical=/, OG, Twitter; site_name=مودونتي, locale=ar_SA |
| **About** | Organization + WebSite + AboutPage + BreadcrumbList | title, description, canonical=/about, OG, Twitter; **same** site_name and locale |

- **Same data:** Organization and WebSite identity (name, url, @id, description, inLanguage) are **identical** on both pages; AboutPage and BreadcrumbList are about-page only.
- **Stable @id:s:** `#organization`, `#website` so about page can reference them and stay consistent with home.
- **Validation:** Test with [validator.schema.org](https://validator.schema.org), Google Rich Results Test, and [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) before rollout.

No code changes until you confirm this spec.

---

## 6. Additions from official documentation (previously missing)

Items below come from schema.org, [ogp.me](https://ogp.me/), [Google Search Central](https://developers.google.com/search/docs), and [Twitter Cards](https://developer.x.com/en/docs/twitter-for-websites/cards/overview/markup). Add or align these so the spec matches official guidance.

### 6.1 JSON-LD (schema.org & Google)

| Item | Official source | Spec action |
|------|-----------------|-------------|
| **Language codes** | schema.org `inLanguage`: use [IETF BCP 47](https://www.rfc-editor.org/info/bcp47) (e.g. `ar`, `ar-SA`). Hyphen for region in BCP 47; OG uses underscore (`ar_SA`). | Use `"inLanguage": "ar"` or `"ar-SA"` in JSON-LD; keep `og:locale` as `ar_SA` per ogp.me. |
| **mainEntityOfPage** | schema.org: for the page entity (e.g. AboutPage), `mainEntityOfPage` = URL of the page where this is the main subject. Google recommends for rich results. | Add to **AboutPage**: `"mainEntityOfPage": "https://www.modonty.com/about"` (or same canonical URL). |
| **Organization (Knowledge Panel)** | Google: Organization with `contactPoint`, `address`, `logo`, `sameAs` can help populate Knowledge Panel. | Optional: add `logo` (ImageObject or URL), `sameAs` (social URLs), `contactPoint` (ContactPoint), `address` (PostalAddress) to Organization when data exists. |
| **Script tag in HTML** | JSON-LD must be in `<script type="application/ld+json">` in `<head>` or `<body>`. | Ensure output uses `type="application/ld+json"`. |
| **Escaping in HTML** | In HTML, `</script>` and `<` inside the script can break parsing. Use `\u003c` for `<` and avoid literal `</script>`. | When embedding JSON-LD in HTML, escape `<` (e.g. `\u003c`) and ensure no raw `</script>` in the JSON string. |

### 6.2 Meta tags — Open Graph (ogp.me)

| Item | Official source | Spec action |
|------|-----------------|-------------|
| **Required OG** | ogp.me: every page needs `og:title`, `og:type`, `og:image`, `og:url`. | Already in spec; keep as minimum. |
| **og:image** | ogp.me: optional but recommended `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`. | Already in spec; ensure `og:image:alt` is always set when using an image. |

### 6.3 Meta tags — Twitter Cards (developer.x.com)

| Item | Official source | Spec action |
|------|-----------------|-------------|
| **twitter:card** | For large image: must be `summary_large_image`. | Already in spec. |
| **twitter:title** | Required; max **70 characters**. | Cap title at 70 chars for Twitter. |
| **twitter:description** | Optional; max **200 characters**. | Cap at 200 chars for Twitter. |
| **twitter:image** | Required for summary_large_image. Aspect ratio **2:1**; min **300×157**; max **4096×4096**; &lt;5MB; JPG, PNG, WEBP, GIF (no SVG). | Use 1200×630 (2:1) to satisfy Twitter and OG. |
| **twitter:image:alt** | Alt text for image; max **420 characters**. | Add when using Twitter card with image (accessibility). |
| **twitter:site** / **twitter:creator** | @username; recommended for attribution. | Already in spec. |
| **Testing** | [Twitter Card Validator](https://cards-dev.twitter.com/validator). | Validate after deployment. |

### 6.4 Meta tags — Google (Search Central)

| Item | Official source | Spec action |
|------|-----------------|-------------|
| **Title** | Google: ~50–60 chars for display; longer may be truncated. | Already in spec. |
| **Meta description** | Google: ~150–160 chars; may be rewritten; unique per page. | Already in spec. |
| **Canonical** | One canonical URL per page; same as og:url. | Already in spec. |
| **robots** | Default is `index, follow`; omit or set explicitly. | Already in spec. |
| **googlebot** | Google-specific: same directives as robots; e.g. `content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"` to allow full snippets and large image previews. | Optional: add `<meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />` when you want full previews. |
| **hreflang** | [Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions): use `rel="alternate" hreflang="x"` + `x-default` when the site has multiple language/region versions. Each version must list itself and all alternates. | If you add other languages later: add `<link rel="alternate" hreflang="ar" href="https://www.modonty.com/" />` and `<link rel="alternate" hreflang="x-default" href="https://www.modonty.com/" />` (and per-page alternates). Skip if Arabic-only. |

### 6.5 HTML head (general best practice)

| Item | Official / best practice | Spec action |
|------|---------------------------|-------------|
| **charset** | HTML5: first element in `<head>` should be `<meta charset="UTF-8">`. | Ensure layout includes charset. |
| **viewport** | Google: viewport meta for mobile-friendly; required for mobile usability. | Ensure `<meta name="viewport" content="width=device-width, initial-scale=1" />` (or equivalent) is present. |
| **theme-color** | Optional; sets browser UI color. | Optional: `<meta name="theme-color" content="#…" />` for PWA/branding. |

### 6.6 Validation & testing (official tools)

| Tool | URL | Use |
|------|-----|-----|
| **Schema.org Validator** | [validator.schema.org](https://validator.schema.org) | Validate JSON-LD syntax and types. |
| **Google Rich Results Test** | [search.google.com/test/rich-results](https://search.google.com/test/rich-results) | Check eligibility for rich results. |
| **Facebook Sharing Debugger** | [developers.facebook.com/tools/debug](https://developers.facebook.com/tools/debug/) | Validate OG tags and refresh cache. |
| **Twitter Card Validator** | [cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator) | Validate Twitter card meta and image. |
| **Google Search Console** | [search.google.com/search-console](https://search.google.com/search-console) | Monitor indexing and structured data issues. |

### 6.7 Example: AboutPage with mainEntityOfPage (add to §3)

In the About page JSON-LD example, add `mainEntityOfPage` to the AboutPage node:

```json
{
  "@type": "AboutPage",
  "@id": "https://www.modonty.com/about#aboutpage",
  "name": "من نحن - مودونتي",
  "headline": "من نحن",
  "url": "https://www.modonty.com/about",
  "mainEntityOfPage": "https://www.modonty.com/about",
  "description": "...",
  "about": { "@id": "https://www.modonty.com/#organization" },
  "publisher": { "@id": "https://www.modonty.com/#organization" },
  "isPartOf": { "@id": "https://www.modonty.com/#website" },
  "inLanguage": "ar",
  "dateModified": "2025-01-29T00:00:00.000Z"
}
```

### 6.8 Example: Optional googlebot meta (snippet control)

```html
<meta name="robots" content="index, follow" />
<meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
```
