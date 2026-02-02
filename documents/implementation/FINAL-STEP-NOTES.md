# Final step – shared notes

Use this file for your notes. We’ll both use it when we get to the final step.

---

## Your notes

*(Add your notes below)*

- **Social sharing images removed from UI**: No image fields in SEO tab or Social Media tab. OG/Twitter image values still in DB for meta/cards; no UI to edit them in Modonty Setting.  
  **Ref (where those values are used):** `og:image`, `og:image:secure_url`, `og:image:alt` (Document §1.2); `twitter:image`, `twitter:image:alt` (§1.3); JSON-LD `WebPage.primaryImageOfPage` (ImageObject.url).

- The optimized Cloudinary URL (e.g., https://res.cloudinary.com/dfegnpgwx/image/upload/w_auto,f_auto,q_auto/v1769772312/og-image_ueprdl.png) is used for database storage and OG/Twitter card generation.  
  **Ref (where it is used):** DB fields `ogImage` / `socialImage`; meta `og:image`, `og:image:secure_url` (§1.2); `twitter:image` (§1.3); JSON-LD `WebPage.primaryImageOfPage` (ImageObject.url).

- **Alt text** for OG/Twitter and hero uses the **master image** (Media tab hero image) alt. Single source: Hero Image Alt in Media tab.  
  **Ref (where alt is used):** `og:image:alt` (Document §1.2); `twitter:image:alt` (§1.3); hero img `alt` (accessibility); JSON-LD / page hero (same alt).

- **Media-related: 100% covered** per SEO-FULL-COVERAGE-100.md. Page-level: Media tab (Hero URL + Hero Alt) → og:image, twitter:image, primaryImageOfPage (§1.2, §1.3, §2–§4). Org logo/image → Organization section; LocalBusiness image → §5.3 (org scope).

- **OG Title, OG Description, Twitter Title, Twitter Description — SOT = SEO Title, SEO Description.** Single source: SEO tab (SEO Title, SEO Description); no separate OG/Twitter title/description in Social tab.  
  **Ref:** `meta title` / `meta description` (§1.1); `og:title`, `og:description` (§1.2); `twitter:title`, `twitter:description` (§1.3); JSON-LD WebPage.name, WebPage.description (§2, §3).

- **OG URL (og:url):** The canonical URL of the page when shared on social (Facebook, LinkedIn, etc.). Tells platforms “this is the canonical URL for this content.”  
  **Recommendation — one SOT:** **og:url SOT = Canonical URL** (SEO tab). Use the same canonical URL for meta canonical, JSON-LD WebPage.url, and og:url. No separate OG URL field in Social tab; at output use canonicalUrl for openGraph.url.  
  **Ref:** `og:url` (§1.2); same as meta canonical and JSON-LD WebPage.url (§1.1, §2, §3).

**Closed.** Moving to other notes.

---

## Default Values

*(Fields moved to Default Value tab — labels only, no input/select. Best practice from official doc; ref per field.)*

- **Meta Robots:** index, follow (default — allow indexing). No input in SEO tab; value fixed at default.  
  **Ref:** meta robots (Document §1.1).

- **Googlebot:** index, follow (default — prefer unless you need snippet/image restrictions). No input in SEO tab; value fixed at default.  
  **Ref:** meta googlebot (Document §1.1).

- **Theme color:** #000000 (hex — meta theme-color for browser UI). No input in SEO tab; value fixed at default.  
  **Ref:** meta theme-color (Document §1.1).

- **Author:** From app singleton (Author schema). App uses singleton author for meta author; no per-page input in SEO tab.  
  **Ref:** meta author (Document §1.1).

- **Canonical URL:** Main is modonty.com; path per page (e.g. about → /about). Full canonical = base + path (e.g. https://modonty.com/about). No input in SEO tab; app uses computed value (site base + slug).  
  **Ref:** meta canonical (Document §1.1); JSON-LD WebPage.url (§2, §3).

- **OG Type:** website (default for general pages). No input in Social Media tab; value fixed at default.  
  **Ref:** og:type (Document §1.2).

- **OG Locale Alternate (SOT):** Optional; add when multi-language (e.g. en_US or en_US, fr_FR). SOT for og:locale:alternate (meta) and Alternate Languages (hreflang). Editable in Technical tab; alternates derived as /lang/path. No separate Alternate Languages (JSON) input.  
  **Ref:** og:locale:alternate (Document §1.2); hreflang (§1.4).

- **OG Determiner:** auto (grammatical determiner for title; values: auto, a, an, the). No input in Social Media tab; value fixed at default.  
  **Ref:** og:determiner (Document §1.2).

- **OG Site Name:** Modonty (site name for og:site_name). No input in Social Media tab; value fixed at default.  
  **Ref:** og:site_name (Document §1.2).

- **Twitter Card Type:** summary_large_image (card type for twitter:card; e.g. summary_large_image, summary). No input in Social Media tab; value fixed at default.  
  **Ref:** twitter:card (Document §1.3).

- **Twitter Site / Twitter Creator:** Read from .env: NEXT_PUBLIC_TWITTER_SITE, NEXT_PUBLIC_TWITTER_CREATOR (e.g. @modonty). No input in Social Media tab; meta output uses env (with page/DB fallback).  
  **Ref:** twitter:site, twitter:creator (Document §1.3).

- **Sitemap Priority:** 0.5 (0.0 to 1.0; priority in sitemap). Value fixed at default.  
  **Ref:** sitemap priority (technical).

- **Sitemap Change Frequency:** monthly (e.g. always, hourly, daily, weekly, monthly, yearly, never). Value fixed at default.  
  **Ref:** sitemap changefreq (technical).

- **OG Locale (SOT):** ar_SA (language and region; e.g. ar_SA, en_US). Single source for og:locale, WebPage.inLanguage, and Organization.knowsLanguage. **inLanguage** = first part of locale (e.g. ar_SA → ar). No input; value fixed at default. No separate Language input in Technical tab; Organization.knowsLanguage derived from ogLocale on save. Ref: og:locale (Document §1.2); JSON-LD inLanguage · hreflang (§1.4); Organization.knowsLanguage (§2, §3, §4).

- **Contact type / Contact email / Contact telephone (Organization):** Read from .env: NEXT_PUBLIC_ORG_CONTACT_TYPE, NEXT_PUBLIC_ORG_CONTACT_EMAIL, NEXT_PUBLIC_ORG_CONTACT_TELEPHONE. No input in Organization tab; JSON-LD contactPoint built from env at output time. Ref: JSON-LD contactPoint (§2, §3).

- **Country code / Postal code (PostalAddress):** Read from .env: NEXT_PUBLIC_ORG_ADDRESS_COUNTRY, NEXT_PUBLIC_ORG_POSTAL_CODE. No input in Organization tab; JSON-LD address built from env at output time. Ref: JSON-LD PostalAddress (§5).

- **Latitude / Longitude (Organization geo):** Read from .env: NEXT_PUBLIC_ORG_GEO_LATITUDE, NEXT_PUBLIC_ORG_GEO_LONGITUDE. No input in Organization tab; JSON-LD GeoCoordinates (Organization.geo) built from env at output time. Ref: JSON-LD GeoCoordinates (§5).

- **WebSite (SearchAction) — Search URL template:** Read from .env: NEXT_PUBLIC_ORG_SEARCH_URL_TEMPLATE. No input in Organization tab; JSON-LD WebSite.potentialAction built from env at output time. Ref: JSON-LD WebSite.potentialAction (§2, §3, §4).

- **Same As (URLs) (Organization):** Read from .env: NEXT_PUBLIC_ORG_SAMEAS_FB, NEXT_PUBLIC_ORG_SAMEAS_INSTAGRAM, NEXT_PUBLIC_ORG_SAMEAS_LINKEDIN, NEXT_PUBLIC_ORG_SAMEAS_TIKTOK, NEXT_PUBLIC_ORG_SAMEAS_SNAP (one URL per key; omit keys for platforms not used). No input in Organization tab; JSON-LD Organization.sameAs built from env at output time. Ref: JSON-LD Organization.sameAs (§2, §3, §4).

- **Area served (Organization):** SA, AE, KW, BH, OM, QA, EG (default — ISO 3166-1 alpha-2: Gulf + Egypt; Schema.org areaServed accepts Text). Optional .env: NEXT_PUBLIC_ORG_AREA_SERVED. No input in Organization tab; JSON-LD ContactPoint.areaServed built from env or default at output time. Ref: JSON-LD ContactPoint.areaServed (§2, §3).

- **Locality / Region (PostalAddress):** Jeddah (default). No input in Organization tab; JSON-LD PostalAddress.addressLocality and addressRegion built from default at output time. Ref: JSON-LD PostalAddress (§5).

- **Address (PostalAddress):** Read from .env: NEXT_PUBLIC_ORG_STREET_ADDRESS, NEXT_PUBLIC_ORG_ADDRESS_LOCALITY, NEXT_PUBLIC_ORG_ADDRESS_REGION, NEXT_PUBLIC_ORG_ADDRESS_COUNTRY, NEXT_PUBLIC_ORG_POSTAL_CODE. No input in Organization tab; JSON-LD PostalAddress built from env at output time. Ref: JSON-LD PostalAddress (§5).

- **Page headline (JSON-LD):** SOT = SEO Title (SEO tab). No input in Organization tab; JSON-LD AboutPage.headline built from SEO title at output time. Ref: JSON-LD AboutPage.headline (§3, §4).