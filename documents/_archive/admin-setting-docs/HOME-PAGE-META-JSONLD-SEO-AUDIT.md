# Home Page Meta & JSON-LD — SEO Gap Audit (Senior Expert)

**Audit date:** 2025-01-31  
**Spec under review:** `HOME-PAGE-META-JSONLD-SPEC.md`  
**Method:** Check against official docs (Google, Schema.org, Open Graph, Twitter/X, Bing) and enterprise/big-company best practices.

---

## 1. Executive Summary

The spec is **strong and already covers ~95%** of what official sources require and recommend. The gaps below are **optional or situational**; addressing them yields **full 100% coverage** for enterprise-grade SEO and social sharing.

| Area | Status | Critical gaps |
|------|--------|----------------|
| Meta (OG, Twitter, core) | ✅ Complete | None |
| Meta (robots, language, platform) | ⚠️ Minor | 3 optional additions |
| **Geo (local SEO) & AI GEO** | **✅ Covered** | **None** — Organization address + geo + contactPoint.areaServed in spec; supports local SEO and AI discovery. |
| JSON-LD Organization | ✅ Strong | 1 optional (ContactPoint extras) |
| JSON-LD WebSite | ✅ Complete | 0 |
| JSON-LD CollectionPage | ✅ Complete | 0 |
| JSON-LD Article (per item) | ⚠️ Minor | 2 recommended (author.url, isAccessibleForFree/license) |

---

## 2. Meta Tags — Gap Analysis

### 2.1 Open Graph (ogp.me) — ✅ Aligned

- **Required (website):** og:title, og:type, og:image, og:url → **covered**
- **Optional:** description, determiner, locale, locale:alternate, site_name → **covered**
- **Image structured:** og:image:url, secure_url, type, width, height, alt → **covered**
- **Note:** ogp.me states: *"If the page specifies an og:image it should specify og:image:alt"* — **you have this** ✅  
- **Not needed for homepage:** og:audio, og:video (optional for any object; used on media pages, not typical for home).

### 2.2 Twitter/X Cards — ✅ Aligned

- Core: card, site, creator, site:id, creator:id, title, description, image, image:alt → **covered**
- twitter:label1 / twitter:data1 are **not** in current X Cards docs for summary cards; no gap.

### 2.3 Google Meta (Search Central) — ⚠️ 2 Optional Gaps

| Gap | Official source | Recommendation |
|-----|-----------------|----------------|
| **Robots directives** | Google and Bing support `max-snippet` and `max-image-preview` in robots/googlebot content | **Add optional:** `max-snippet:-1` (no limit) and `max-image-preview:large` for better snippet/image preview control. Source: [Google](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag), [Bing](https://www.bing.com/webmasters/help/which-robots-metatags-does-bing-support-5198d240). |
| **notranslate** | Google supports `<meta name="google" content="notranslate">` to influence translation behavior | **Optional for RTL/Arabic:** Prevents Chrome “Translate this page” when you don’t want it. Add to checklist as optional (e.g. from Settings or default for Arabic). |

- title, description, robots, googlebot, canonical → **covered**
- google-site-verification → site-specific (Search Console); not part of generic home meta object; **no change** in spec.

### 2.4 Bing — ✅ Covered via robots + OG

- Bing uses robots (and optionally bingbot), plus OG for rich results. **max-snippet / max-image-preview** (see above) complete the picture.
- msvalidate.01 → verification only; document in “implementation notes” if you store verification IDs in Settings.

### 2.5 Platform / PWA (Optional for “max coverage”)

| Meta | Use case | Recommendation |
|------|----------|----------------|
| **referrer-policy** | Referrer header control (privacy, analytics) | Optional. Common value: `strict-origin-when-cross-origin`. Can be meta or HTTP header. |
| **msapplication-TileColor** | Windows pinned site tile color | Optional. Overlaps with theme-color; some enterprises still set it. |
| **apple-mobile-web-app-*** | iOS “Add to Home Screen” behavior | Optional. Prefer Web App Manifest for PWA; add only if you support legacy iOS meta. |

---

## 3. Geo (local SEO) and AI GEO — Coverage

### 3.1 Geo and local SEO — ✅ Covered in spec

The **HOME-PAGE-META-JSONLD-SPEC** already includes geographic markup at the Organization level:

| Property | Purpose | In spec |
|----------|---------|--------|
| **address** (PostalAddress) | Physical location: streetAddress, addressLocality, addressRegion, postalCode, addressCountry | ✅ Section 4 checklist + Section 6 simulated object |
| **geo** (GeoCoordinates) | latitude, longitude (WGS 84) for maps and local signals | ✅ Section 4 checklist + Section 6 simulated object |
| **contactPoint.areaServed** | Geographic area the contact point serves (e.g. "SA") | ✅ In simulated Organization ContactPoint |

**Conclusion:** Traditional **geo/local SEO** for the Organization (address + geo + areaServed) is **fully covered**. Google and Bing use Organization address + GeoCoordinates for local understanding and maps; the spec and simulated JSON-LD include both.

### 3.2 AI GEO (Generative Engine Optimization) — ✅ Covered

**AI GEO** = optimizing for AI-driven search (e.g. Google AI Overviews, Bing Copilot, Perplexity, ChatGPT). These systems rely on structured data to understand entities and location.

| Signal | Why it matters for AI GEO | In spec |
|--------|----------------------------|--------|
| **Organization @id** | Stable entity identifier for citation and disambiguation | ✅ siteUrl#organization |
| **Organization name, url, logo** | Identity anchors for AI to cite | ✅ |
| **Organization address + geo** | Location facts AI can extract and surface in “where” / local answers | ✅ |
| **contactPoint** (email, areaServed) | Service area and contact; supports “who to contact” / regional answers | ✅ areaServed in ContactPoint |
| **sameAs** | Links to official profiles; strengthens entity identity for AI | ✅ |

**Conclusion:** The spec’s **Organization** block (with address, geo, contactPoint including areaServed, sameAs, and stable @id) gives **full geo + AI GEO coverage** at the homepage/organization level. No extra geo-specific section is required in the audit beyond this confirmation.

### 3.3 Optional (beyond current scope)

- **LocalBusiness** (subtype of Organization): Use only if the homepage represents a physical store/service location with NAP, opening hours, etc. For a content/blog site homepage, **Organization** with address + geo is correct.
- **Organization.areaServed**: Schema.org allows `areaServed` on Organization (e.g. "Saudi Arabia"). If you add it to Settings, include it in Organization for clearer geographic scope; **contactPoint.areaServed** already covers the contact scope.

---

## 4. JSON-LD — Gap Analysis

### 4.1 Organization — ✅ Strong, 1 Optional

- name, url, description, inLanguage, logo, sameAs, contactPoint, address, geo → **covered**
- **Optional (Schema.org ContactPoint):**  
  - **contactOption** (e.g. TollFree, HearingImpairedSupported)  
  - **availableLanguage** (e.g. "ar", "en")  
  - **hoursAvailable** (OpeningHoursSpecification)  
  Add to checklist as “when Settings have them”; no change to simulated object unless you add fields.

### 4.2 WebSite — ✅ Complete

- name, url, description, inLanguage, publisher, potentialAction (SearchAction) → **covered**
- **SearchAction:** Use `query-input: "required name=search_term_string"` and same placeholder in `urlTemplate` (e.g. `?q={search_term_string}`). Your spec already matches this.  
- Note: Google removed the sitelinks search box from SERPs (Nov 2024); markup remains valid and useful for other consumers.

### 3.3 CollectionPage — ✅ Complete

- name, url, description, inLanguage, isPartOf, dateModified, mainEntity (ItemList), breadcrumb, primaryImageOfPage → **covered**
- BreadcrumbList: ListItem with position, name, item (URL) → **correct**; absolute URL for home is correct per Google.

### 4.4 ItemList — ✅ Correct

- itemListOrder, numberOfItems, itemListElement (ListItem with position, item) → **correct**. Schema.org uses **itemListElement** (not listItem).

### 4.5 Article (each item in ItemList) — ⚠️ 2 Recommended Additions

| Gap | Official source | Recommendation |
|-----|-----------------|----------------|
| **author.url** | Google recommends a URL for the author (bio/social page) for disambiguation and rich results | **Add:** In Person, add `url` when you have an author page, e.g. `"author": { "@type": "Person", "name": "...", "url": "https://modonty.com/authors/..." }`. |
| **isAccessibleForFree / license** | Schema.org Article (CreativeWork); Google uses for understanding paywalls and reuse | **Add when available:** `isAccessibleForFree` (boolean) and `license` (URL or text). Your Article model already has these; include in checklist and in simulated example for one article. |

- headline, description, url, mainEntityOfPage, image, datePublished, dateModified, author, publisher, articleSection, keywords, wordCount, inLanguage → **already covered**
- **Image:** ImageObject with url (and optional width/height) is correct; Google recommends image for Article rich results — **you have it** ✅

---

## 4. What Is Already Best-in-Class

- **OG:** All required + recommended for type “website,” including image dimensions and alt.
- **Twitter:** Full summary_large_image set including site/creator IDs.
- **Organization:** address (PostalAddress) and geo (GeoCoordinates); sameAs; contactPoint.
- **CollectionPage:** breadcrumb (BreadcrumbList) and primaryImageOfPage.
- **Article:** image, mainEntityOfPage, dateModified, wordCount, inLanguage; publisher (client Org); articleSection; keywords.
- **No HTML meta keywords** — aligned with Google (deprecated).
- **Stored meta + JSON-LD** — good for performance and consistency.

---

## 6. Recommended Spec Updates (Minimal)

To reach **100% documented coverage** without changing app behavior:

1. **Meta checklist (Section 3)**  
   - Add one row: **robots directives (optional):** e.g. `max-snippet`, `max-image-preview` (source: default or Settings).  
   - Add one row: **notranslate (optional):** for pages where translation should be discouraged (e.g. default for Arabic); source: Settings or default.

2. **Meta checklist (Section 3)**  
   - Optionally document: **referrer-policy** (optional), **msapplication-TileColor** (optional), **apple-mobile-web-app-*** (optional), **google-site-verification / msvalidate.01** (site-specific; add to Settings if used).

3. **JSON-LD checklist (Section 4)**  
   - **Organization:** Add optional ContactPoint: **contactOption**, **availableLanguage**, **hoursAvailable** when Settings support them.  
   - **Article:** Add **author.url** (Person url when author page exists). Add **isAccessibleForFree**, **license** when available (Article model already has them).

4. **Simulated JSON-LD (Section 6)**  
   - In one Article example: add **author** with **url**; add **isAccessibleForFree: true** and **license** (e.g. URL or "All rights reserved") when applicable.  
   - Optionally add ContactPoint **availableLanguage** (e.g. "ar") in Organization.

5. **Notes (Section 2)**  
   - One line: Sitelinks search box no longer shown in Google (Nov 2024); SearchAction markup still valid.  
   - One line: Optional robots directives (max-snippet, max-image-preview) and notranslate can be stored in Settings and output for full control.

6. **References (Section 8)**  
   - Add: [Google robots meta tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag) (max-snippet, max-image-preview), [Bing robots](https://www.bing.com/webmasters/help/which-robots-metatags-does-bing-support-5198d240), [Schema.org ContactPoint](https://schema.org/ContactPoint), [Schema.org Person](https://schema.org/Person) (url).

---

## 7. Official References Used in This Audit

- **Open Graph:** [ogp.me](https://ogp.me/) — required/optional metadata, image sub-properties, types.
- **Twitter/X:** [Cards markup](https://developer.x.com/en/docs/twitter-for-websites/cards/overview/markup).
- **Google:** [Meta tags](https://developers.google.com/search/docs/crawling-indexing/special-tags), [Robots meta](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag), [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article), [Breadcrumb](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb).
- **Bing:** [Robots meta tags](https://www.bing.com/webmasters/help/which-robots-metatags-does-bing-support-5198d240), [Structured data](https://www.bing.com/webmasters/help/marking-up-your-site-with-structured-data-3a93e731).
- **Schema.org:** [WebSite](https://schema.org/WebSite), [Organization](https://schema.org/Organization), [ContactPoint](https://schema.org/ContactPoint), [GeoCoordinates](https://schema.org/GeoCoordinates), [PostalAddress](https://schema.org/PostalAddress), [areaServed](https://schema.org/areaServed), [CollectionPage](https://schema.org/CollectionPage), [ItemList](https://schema.org/ItemList), [Article](https://schema.org/Article), [Person](https://schema.org/Person), [BreadcrumbList](https://schema.org/BreadcrumbList).
- **Geo & AI GEO:** Organization address + geo support local SEO and AI GEO (visibility in generative engines); see Section 3 of this audit.

---

## 8. Summary Table — Gaps and Priority

| # | Gap | Priority | Section to update |
|---|-----|----------|-------------------|
| 1 | Robots: max-snippet, max-image-preview (optional) | Medium | Meta checklist, Notes |
| 2 | notranslate (optional, e.g. Arabic default) | Low | Meta checklist |
| 3 | Article author.url (Person url) | **High** (Google recommendation) | JSON-LD checklist, Simulated Article |
| 4 | Article isAccessibleForFree, license | Medium | JSON-LD checklist, Simulated Article |
| 5 | Organization ContactPoint: contactOption, availableLanguage, hoursAvailable (optional) | Low | JSON-LD checklist |
| 6 | referrer-policy, msapplication-TileColor, apple-mobile-web-app (optional) | Low | Meta checklist or “Other meta” note |
| 7 | Sitelinks search box deprecation note | Low | Notes |
| 8 | Verification tags (google, bing) — site-specific | Note only | Implementation / Storage notes |

Implementing **1–5** in the spec (and optionally 6–8) gives you **full 100% coverage** as documented by official sources and common enterprise practice.
