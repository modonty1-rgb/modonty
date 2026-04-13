# PRD: Home Page & Main List Pages Meta & JSON-LD (Generate & Store)

**Product:** Modonty home page and main list pages (clients, categories, trending) SEO — generate meta tags and JSON-LD in admin, store in Settings, serve from DB for page speed.  
**Spec reference:** [HOME-PAGE-META-JSONLD-SPEC.md](./HOME-PAGE-META-JSONLD-SPEC.md)  
**Status:** Draft

---

## 1. Overview

### 1.1 Goal

- Generate **home page** meta object and JSON-LD once in the admin dashboard (from Settings + latest articles).
- Extend the same **generate → validate → store → read from DB** pattern to **main list pages:** `/clients`, `/categories`, `/trending` (each with its own meta + JSON-LD stored in Settings).
- **Validate** JSON-LD (Schema.org / rich results) for each page.
- **Store** results in the Settings table so Modonty public pages **read** from DB at request time (no runtime generation) for maximum page speed and SEO.

### 1.2 Success criteria

- Admin can trigger "Generate M/J" (per page or bulk) and get meta + JSON-LD written to Settings for home and for clients, categories, trending.
- Modonty home and main list routes output stored meta and JSON-LD from DB only.
- Meta and JSON-LD match the 100% coverage defined in HOME-PAGE-META-JSONLD-SPEC.md (home); list pages follow the same pattern (CollectionPage/ItemList where applicable).
- Validation report is stored and visible in admin for each generated page.

---

## 2. Scope

### In scope

- **Home:** Generate home meta object from Settings (per Section 3 of spec); build home JSON-LD @graph from Settings + `getArticles({ limit: 20 })` (per Section 4). Store in `homeMetaTags`, `jsonLdStructuredData`, `jsonLdLastGenerated`, `jsonLdValidationReport`. Modonty home reads from DB only.
- **Clients list (`/clients`):** Same pattern — generate meta + JSON-LD (e.g. CollectionPage/ItemList of clients), validate, store in `clientsPageMetaTags`, `clientsPageJsonLdStructuredData`, `clientsPageJsonLdLastGenerated`, `clientsPageJsonLdValidationReport`. Modonty `/clients` reads from DB only.
- **Categories list (`/categories`):** Same pattern — store in `categoriesPageMetaTags`, `categoriesPageJsonLdStructuredData`, `categoriesPageJsonLdLastGenerated`, `categoriesPageJsonLdValidationReport`. Modonty `/categories` reads from DB only.
- **Trending list (`/trending`):** Same pattern — store in `trendingPageMetaTags`, `trendingPageJsonLdStructuredData`, `trendingPageJsonLdLastGenerated`, `trendingPageJsonLdValidationReport`. Modonty `/trending` reads from DB only (default period or first available).
- **Validate:** Run JSON-LD validation for each page; store report in the corresponding `*JsonLdValidationReport` field.
- **UI:** "Generate M/J" tab: trigger generate (per page or all), show last generated time and validation summary per page.

### Out of scope

- Per-page meta/JSON-LD for about, terms, legal (handled by existing Modonty model: `Modonty.metaTags`, `Modonty.jsonLdStructuredData`).
- Changes to article or client data model beyond what the spec already assumes.
- Google/Bing verification meta (site-specific; add to Settings when needed).

---

## 3. User personas & stories

| Persona | Story | Acceptance |
|---------|--------|------------|
| Admin | Generate home meta + JSON-LD from current Settings and articles | One action triggers build; result saved to Settings; success/error and validation summary shown. |
| Admin | Generate clients / categories / trending page meta + JSON-LD | Same flow per page; result saved to corresponding `*PageMetaTags`, `*PageJsonLdStructuredData`, etc. |
| Admin | See when each page SEO was last generated and whether it passed validation | UI shows `*JsonLdLastGenerated` and summary or link to `*JsonLdValidationReport` per page. |
| Public user | Load Modonty home with correct meta and JSON-LD | Home uses only stored `homeMetaTags` and `jsonLdStructuredData` from DB; no generation at request time. |
| Public user | Load `/clients`, `/categories`, `/trending` with correct meta and JSON-LD | Each list page uses only stored `*PageMetaTags` and `*PageJsonLdStructuredData` from DB. |

---

## 4. Functional requirements

### 4.1 Build home meta object

- **Input:** Settings row (single record).
- **Output:** JSON object matching Section 5 (simulated meta) of spec.
- **Rules:** Use spec Section 3 checklist: title/description from modontySeoTitle / modontySeoDescription (fallbacks per spec); all other fields from corresponding Settings fields; include optional keys (e.g. referrerPolicy, msapplicationTileColor, notranslate, robots with max-snippet/max-image-preview) when configured.
- **No HTML meta keywords.**

### 4.2 Build home JSON-LD

- **Input:** Settings + `getArticles({ limit: 20 })` with relations (client, category, tags, author, featuredImage).
- **Output:** Single JSON-LD string with `@context` and `@graph` containing Organization, WebSite, CollectionPage, ItemList, and up to 20 ListItems (each item = Article with publisher, articleSection, keywords, author with url, image, mainEntityOfPage, dateModified, wordCount, inLanguage, isAccessibleForFree, license when available).
- **Rules:** Per spec Section 4 and Section 6. `numberOfItems` = total article count in DB; `itemListElement` = up to 20 items. Publisher = client Organization per article. Breadcrumb = single-item BreadcrumbList (Home). primaryImageOfPage from ogImageUrl/logoUrl. Organization address/geo/contactPoint from Settings when present.

### 4.3 Validation

- Validate generated JSON-LD (schema + optional rich-result checks).
- Produce a validation report (e.g. valid flag, errors, warnings).
- Store report in `Settings.jsonLdValidationReport` for home; for list pages store in the corresponding `*PageJsonLdValidationReport` (clientsPageJsonLdValidationReport, categoriesPageJsonLdValidationReport, trendingPageJsonLdValidationReport).

### 4.4 Persist

- **Home:** Save meta to `Settings.homeMetaTags`, JSON-LD to `jsonLdStructuredData`, timestamp to `jsonLdLastGenerated`, report to `jsonLdValidationReport`.
- **List pages:** For each of clients, categories, trending: save meta to `*PageMetaTags`, JSON-LD to `*PageJsonLdStructuredData`, timestamp to `*PageJsonLdLastGenerated`, report to `*PageJsonLdValidationReport`.

### 4.5 Modonty home page

- Read `homeMetaTags` and `jsonLdStructuredData` from Settings.
- Render meta tags from `homeMetaTags` and one `<script type="application/ld+json">` for `jsonLdStructuredData`.
- If stored data is null/empty, define fallback (e.g. minimal meta only; no JSON-LD or minimal WebSite-only block) and document in PRD/spec.

### 4.6 Modonty list pages (/clients, /categories, /trending)

- Each page reads its stored `*PageMetaTags` and `*PageJsonLdStructuredData` from Settings (clientsPage*, categoriesPage*, trendingPage*).
- Render meta from the stored meta object and one `<script type="application/ld+json">` for the stored JSON-LD string.
- If stored data is null/empty, define fallback (e.g. minimal meta; no or minimal JSON-LD) and document.

---

## 5. Data requirements

### 5.1 Settings (existing + optional new)

| Field | Type | Purpose |
|-------|------|--------|
| modontySeoTitle, modontySeoDescription | String | Home meta title/description (and CollectionPage name/description). |
| siteUrl, siteName, brandDescription, inLanguage | String | Organization, WebSite, CollectionPage, canonical, og:url, etc. |
| defaultMetaRobots, defaultGooglebot, defaultOgType, defaultOgLocale, defaultOgDeterminer | String | robots, googlebot, og:type, og:locale, og:determiner. |
| defaultOgImageWidth, defaultOgImageHeight, defaultOgImageType, altImage | - | og:image sub-properties. |
| defaultTwitterCard, twitterSite, twitterCreator, twitterSiteId, twitterCreatorId | String | Twitter card meta. |
| defaultCharset, defaultViewport, defaultSitemapPriority, defaultSitemapChangeFreq | String/Float | charset, viewport, sitemap. |
| defaultHreflang, defaultPathname, themeColor, siteAuthor | String | hreflang, theme-color, author. |
| orgContactType, orgContactEmail, orgContactTelephone, orgAreaServed, orgStreetAddress, orgAddressLocality, orgAddressRegion, orgAddressCountry, orgPostalCode, orgGeoLatitude, orgGeoLongitude | String/Float | Organization contactPoint and address/geo. |
| orgSearchUrlTemplate, orgLogoUrl, logoUrl, ogImageUrl | String | WebSite potentialAction, Organization logo, CollectionPage primaryImageOfPage, og:image. |
| sameAs (or social URLs) | - | Organization sameAs. |
| **homeMetaTags** | **Json?** | **Stored home meta object (add if missing).** |
| jsonLdStructuredData | String? | Stored home JSON-LD string. |
| jsonLdLastGenerated | DateTime? | Last generation timestamp. |
| jsonLdValidationReport | Json? | Validation result. |
| **clientsPageMetaTags** | **Json?** | **Stored `/clients` meta object (add if missing).** |
| **clientsPageJsonLdStructuredData** | **String?** | **Stored `/clients` JSON-LD string.** |
| **clientsPageJsonLdLastGenerated** | **DateTime?** | **Last generation timestamp for clients page.** |
| **clientsPageJsonLdValidationReport** | **Json?** | **Validation result for clients page.** |
| **categoriesPageMetaTags** | **Json?** | **Stored `/categories` meta object (add if missing).** |
| **categoriesPageJsonLdStructuredData** | **String?** | **Stored `/categories` JSON-LD string.** |
| **categoriesPageJsonLdLastGenerated** | **DateTime?** | **Last generation timestamp for categories page.** |
| **categoriesPageJsonLdValidationReport** | **Json?** | **Validation result for categories page.** |
| **trendingPageMetaTags** | **Json?** | **Stored `/trending` meta object (add if missing).** |
| **trendingPageJsonLdStructuredData** | **String?** | **Stored `/trending` JSON-LD string.** |
| **trendingPageJsonLdLastGenerated** | **DateTime?** | **Last generation timestamp for trending page.** |
| **trendingPageJsonLdValidationReport** | **Json?** | **Validation result for trending page.** |

Optional for full coverage: defaultNotranslate, defaultReferrerPolicy, google-site-verification, msvalidate.01 (site-specific).

### 5.2 Data sources (read-only for generation)

- **Home:** `getArticles({ limit: 20 })` (e.g. order by datePublished desc), with client, category, tags, author, featuredImage. Separate count query for `numberOfItems`. Per article: title → headline, excerpt → description, slug → url, datePublished, dateModified, mainEntityOfPage, wordCount, inLanguage, isAccessibleForFree, license, featuredImage → image, author (name + url) → author Person, client → publisher Organization, category.name → articleSection, tags → keywords.
- **List pages:** Data sources per page: clients list (e.g. getClients), categories list (e.g. getCategories), trending articles (e.g. getTrendingArticles); see 6.1 for build steps.

### 5.3 Schema alignment (Settings vs PRD)

**Checked:** Prisma `Settings` model vs PRD Section 5.1 data requirements. Also checked for PRD-required fields under **alternate names** (e.g. metaTags, homeMeta, cachedMeta, siteMetaTags, defaultMetaTags): **none exist on Settings**. (Client and Modonty have `metaTags` for their own pages; Settings has no field that stores the site home meta object.)

| PRD field / requirement | Schema | Status |
|--------------------------|--------|--------|
| modontySeoTitle, modontySeoDescription | Settings.modontySeoTitle, modontySeoDescription | ✅ Present |
| siteUrl, siteName, brandDescription, inLanguage | Settings.siteUrl, siteName, brandDescription, inLanguage | ✅ Present |
| defaultMetaRobots, defaultGooglebot, defaultOgType, defaultOgLocale, defaultOgDeterminer | Settings.defaultMetaRobots, defaultGooglebot, defaultOgType, defaultOgLocale, defaultOgDeterminer | ✅ Present |
| defaultOgImageWidth, defaultOgImageHeight, defaultOgImageType, altImage | Settings.defaultOgImageWidth, defaultOgImageHeight, defaultOgImageType, altImage | ✅ Present |
| defaultTwitterCard, twitterSite, twitterCreator, twitterSiteId, twitterCreatorId | Settings.defaultTwitterCard, twitterSite, twitterCreator, twitterSiteId, twitterCreatorId | ✅ Present |
| defaultCharset, defaultViewport, defaultSitemapPriority, defaultSitemapChangeFreq | Settings.defaultCharset, defaultViewport, defaultSitemapPriority, defaultSitemapChangeFreq | ✅ Present |
| defaultHreflang, defaultPathname, themeColor, siteAuthor | Settings.defaultHreflang, defaultPathname, themeColor, siteAuthor | ✅ Present |
| orgContact*, orgAddress*, orgGeo* | Settings.orgContactType/Email/Telephone, orgAreaServed, orgStreetAddress, orgAddressLocality/Region/Country, orgPostalCode, orgGeoLatitude/Longitude | ✅ Present |
| orgSearchUrlTemplate, orgLogoUrl, logoUrl, ogImageUrl | Settings.orgSearchUrlTemplate, orgLogoUrl, logoUrl, ogImageUrl | ✅ Present |
| sameAs (or social URLs) | Settings: facebookUrl, twitterUrl, linkedInUrl, etc. — build sameAs array from these | ✅ Present (derive) |
| **homeMetaTags** | **Settings** | ❌ **Missing** — add `homeMetaTags Json?` to Settings |
| jsonLdStructuredData | Settings.jsonLdStructuredData | ✅ Present |
| jsonLdLastGenerated | Settings.jsonLdLastGenerated | ✅ Present |
| jsonLdValidationReport | Settings.jsonLdValidationReport | ✅ Present |
| **clientsPageMetaTags** | **Settings** | ❌ **Missing** — add `clientsPageMetaTags Json?` |
| **clientsPageJsonLdStructuredData** | **Settings** | ❌ **Missing** — add `clientsPageJsonLdStructuredData String? @db.String` |
| **clientsPageJsonLdLastGenerated** | **Settings** | ❌ **Missing** — add `clientsPageJsonLdLastGenerated DateTime?` |
| **clientsPageJsonLdValidationReport** | **Settings** | ❌ **Missing** — add `clientsPageJsonLdValidationReport Json?` |
| **categoriesPageMetaTags** | **Settings** | ❌ **Missing** — add `categoriesPageMetaTags Json?` |
| **categoriesPageJsonLdStructuredData** | **Settings** | ❌ **Missing** — add `categoriesPageJsonLdStructuredData String? @db.String` |
| **categoriesPageJsonLdLastGenerated** | **Settings** | ❌ **Missing** — add `categoriesPageJsonLdLastGenerated DateTime?` |
| **categoriesPageJsonLdValidationReport** | **Settings** | ❌ **Missing** — add `categoriesPageJsonLdValidationReport Json?` |
| **trendingPageMetaTags** | **Settings** | ❌ **Missing** — add `trendingPageMetaTags Json?` |
| **trendingPageJsonLdStructuredData** | **Settings** | ❌ **Missing** — add `trendingPageJsonLdStructuredData String? @db.String` |
| **trendingPageJsonLdLastGenerated** | **Settings** | ❌ **Missing** — add `trendingPageJsonLdLastGenerated DateTime?` |
| **trendingPageJsonLdValidationReport** | **Settings** | ❌ **Missing** — add `trendingPageJsonLdValidationReport Json?` |

**Conclusion:** Schema is aligned with the PRD except for the following fields (all to be added to Settings in one migration): **homeMetaTags**; **clientsPageMetaTags**, **clientsPageJsonLdStructuredData**, **clientsPageJsonLdLastGenerated**, **clientsPageJsonLdValidationReport**; **categoriesPageMetaTags**, **categoriesPageJsonLdStructuredData**, **categoriesPageJsonLdLastGenerated**, **categoriesPageJsonLdValidationReport**; **trendingPageMetaTags**, **trendingPageJsonLdStructuredData**, **trendingPageJsonLdLastGenerated**, **trendingPageJsonLdValidationReport**. No Settings fields exist under other names for these. Add all to the Settings model and run migration before implementing the generate/store flow. Article/Client/Category/Author models are used read-only; no schema change required for them.

---

## 6. Technical requirements

### 6.1 Admin (Generate flow)

- **Trigger:** Button or action in "Generate M/J" tab in Modonty setting (per page or bulk).
- **Steps (home):** Load Settings; load articles (limit 20 + total count); build home meta (spec Section 3 → Section 5); build home JSON-LD (spec Section 4 → Section 6); validate; update Settings (homeMetaTags, jsonLdStructuredData, jsonLdLastGenerated, jsonLdValidationReport).
- **Steps (list pages):** Same pattern per page: build meta + JSON-LD for `/clients`, `/categories`, `/trending` from Settings + relevant data (e.g. getClients, getCategories, getTrendingArticles); validate each; update the corresponding *PageMetaTags, *PageJsonLdStructuredData, *PageJsonLdLastGenerated, *PageJsonLdValidationReport.
- **Concurrency:** Prevent duplicate runs (e.g. disable button while generating, or idempotent overwrite).
- **Errors:** If validation fails, still persist meta + JSON-LD and store report so admin can fix; optional: block save on critical errors (product decision).

### 6.2 Modonty app (home page)

- **Data:** Read Settings once (or only homeMetaTags + jsonLdStructuredData).
- **Output:** Meta: map `homeMetaTags` to `<meta>`, `<link>`, and OG/Twitter tags per spec. JSON-LD: one `<script type="application/ld+json">` with `jsonLdStructuredData`.
- **Caching:** Prefer caching Settings or at least the two fields to avoid repeated DB reads per request.

### 6.3 Modonty app (list pages)

- **Data:** Each of `/clients`, `/categories`, `/trending` reads its *PageMetaTags and *PageJsonLdStructuredData from Settings.
- **Output:** Same as home: map stored meta to tags; one `<script type="application/ld+json">` for stored JSON-LD.
- **Caching:** Same as home; prefer caching per route or shared Settings read.

### 6.4 Schema / DB

- Add to Settings (one migration): `homeMetaTags` (Json?); for clients, categories, trending: `*PageMetaTags` (Json?), `*PageJsonLdStructuredData` (String? @db.String), `*PageJsonLdLastGenerated` (DateTime?), `*PageJsonLdValidationReport` (Json?) — i.e. 1 + 4×3 = 13 new fields.
- No change to Article/Client/Category/Author models for this feature; use existing fields only.

---

## 7. Validation requirements

- **JSON-LD:** Validate against Schema.org (structure, required types, URLs). Optionally run Google Rich Results Test logic or link to it.
- **Report shape:** e.g. `{ valid: boolean, errors: [], warnings: [] }` or link to validator output.
- **Meta:** No formal validator required; build logic must follow spec Section 3 so output matches Section 5.

---

## 8. Acceptance criteria (summary)

| # | Criteria |
|---|----------|
| AC1 | Admin can trigger generation; for home, meta and JSON-LD are built from Settings + up to 20 articles per spec; for list pages, from Settings + relevant data per page (clients, categories, trending articles). |
| AC2 | Generated meta matches spec Section 3 checklist and Section 5 simulated shape (100% coverage). |
| AC3 | Generated JSON-LD matches spec Section 4 checklist and Section 6 simulated shape (Organization, WebSite, CollectionPage, ItemList, up to 20 Articles with publisher, articleSection, keywords, author.url, image, etc.). |
| AC4 | JSON-LD is validated per page and validation report is stored in Settings (home: jsonLdValidationReport; list pages: *PageJsonLdValidationReport). |
| AC5 | Settings are updated with homeMetaTags, jsonLdStructuredData, jsonLdLastGenerated, jsonLdValidationReport; and with clientsPage*, categoriesPage*, trendingPage* for list pages. |
| AC6 | Modonty home page reads and outputs only stored homeMetaTags and jsonLdStructuredData (no runtime generation). |
| AC7 | Modonty `/clients`, `/categories`, `/trending` read and output only stored *PageMetaTags and *PageJsonLdStructuredData (no runtime generation). |
| AC8 | UI shows last generated time and validation status/summary per page (home + clients + categories + trending). |

---

## 9. Dependencies & references

- **Spec:** [HOME-PAGE-META-JSONLD-SPEC.md](./HOME-PAGE-META-JSONLD-SPEC.md) — source of truth for checklists, simulated objects, and storage.
- **Audit:** [HOME-PAGE-META-JSONLD-SEO-AUDIT.md](./HOME-PAGE-META-JSONLD-SEO-AUDIT.md) — gaps and geo/AI GEO coverage.
- **Flow:** [META-AND-JSONLD-FLOW.md](./META-AND-JSONLD-FLOW.md) — context and flow.
- **Code:** Existing Modonty setting actions, helpers (e.g. validators), and Settings/Article data access.

---

## 10. Implementation phases (suggested)

| Phase | Deliverable |
|-------|-------------|
| **1. Data** | Add to Settings schema (one migration): `homeMetaTags`; `clientsPageMetaTags`, `clientsPageJsonLdStructuredData`, `clientsPageJsonLdLastGenerated`, `clientsPageJsonLdValidationReport`; `categoriesPage*` (same four); `trendingPage*` (same four). |
| **2. Build meta** | Helper/action: build home meta from Settings (spec Section 3 → Section 5); extend for clients, categories, trending (same pattern per page). |
| **3. Build JSON-LD** | Helper/action: build home @graph from Settings + getArticles(20) + count (spec Section 4 → Section 6); extend for list pages (CollectionPage/ItemList per page). |
| **4. Validate** | Run JSON-LD validation per page; produce and store report in corresponding *JsonLdValidationReport. |
| **5. Save** | Server action: generate + validate + persist to Settings (home + list pages); expose to "Generate M/J" UI. |
| **6. UI** | "Generate M/J" tab: trigger button (per page or all), last generated time and validation summary/report per page. |
| **7. Modonty pages** | Home reads homeMetaTags + jsonLdStructuredData; /clients, /categories, /trending read *PageMetaTags + *PageJsonLdStructuredData; render meta + JSON-LD script. |
| **8. Test & doc** | E2E/test for generate + save; confirm home and list-page output; update README or internal doc. |

---

## 11. Open points (optional)

- **Validation strictness:** Save even when validation has errors, or block save on errors?
- **Fallback when empty:** Exact fallback for Modonty home when homeMetaTags/jsonLdStructuredData are null (minimal meta only vs. no JSON-LD). Same for list pages when *PageMetaTags/*PageJsonLdStructuredData are null.
- **Regeneration trigger:** Only manual button, or also on Settings save / cron?

---

*PRD version: 1.3. Last updated: 2025-01-31. Scope: home + clients, categories, trending list pages; all 13 Settings fields documented. 100% recheck: structure (1–11, 5.3 under 5, 6.1–6.4); spec refs (Sections 3–6); field names/types/count; AC1/AC4 explicit per page; 5.2 Data sources (home + list) with 6.1 cross-ref; no errors or bugs.*
