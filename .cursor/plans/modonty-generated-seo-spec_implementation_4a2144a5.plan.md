---
name: MODONTY-GENERATED-SEO-SPEC Implementation
overview: "Implement [documents/MODONTY-GENERATED-SEO-SPEC.md](documents/MODONTY-GENERATED-SEO-SPEC.md) so Generated SEO (metaTags + jsonLdStructuredData) fully reflects the Default Value tab: expand meta output with all spec keys (alt, googlebot, themeColor, author, keywords, determiner, localeAlternate, hreflang, sitemap, ogUrl), and replace minimal WebPage-only JSON-LD with full @graph (Organization, WebSite, WebPage/AboutPage, optional BreadcrumbList). Update validator to allow and require the new graph shape. No Prisma migration in initial scope; optional meta fields sourced from env or existing metaTags."
todos: []
isProject: false
---

# Implement MODONTY-GENERATED-SEO-SPEC

## Scope

- **In scope:** [generate-modonty-page-seo.ts](admin/app/(dashboard)/modonty/setting/actions/generate-modonty-page-seo.ts), [generate-modonty-page-jsonld.ts](admin/app/(dashboard)/modonty/setting/helpers/generate-modonty-page-jsonld.ts), [modonty-jsonld-validator.ts](admin/app/(dashboard)/modonty/setting/helpers/modonty-jsonld-validator.ts). Optional: small helper for hreflang building (can live inside generator or in a shared helper under same route).
- **Out of scope:** Prisma schema changes, new form tabs/inputs, modonty app consumption of meta/JSON-LD. Spec §5 (persistence): all required page fields already exist on Modonty or in metaTags; optional keys (googlebot, themeColor, author, keywords, ogDeterminer, twitter IDs) will be read from env or from existing metaTags when present.

## Current state

- **Generator** selects a subset of Modonty fields; builds meta with hardcoded `alt: ""`, no googlebot, themeColor, author, keywords, determiner, localeAlternate, hreflang, sitemap, and uses canonical for openGraph.url (ignores ogUrl). Does not select `socialImageAlt`, `alternateLanguages`, `sitemapPriority`, `sitemapChangeFreq`. `ogLocaleAlternate` is stored in metaTags by [page-actions.ts](admin/app/(dashboard)/modonty/setting/actions/page-actions.ts) (merged into metaTags); generator must read it from `page.metaTags` when building.
- **JSON-LD helper** returns only one node (WebPage). No Organization, WebSite, AboutPage, BreadcrumbList; no site config input.
- **Validator** requires exactly one WebPage; custom rule rejects if no WebPage. Must be relaxed to allow Organization, WebSite, AboutPage, BreadcrumbList and require at least one of WebPage or AboutPage.

## Implementation plan

### 1. Meta: expand select and build full meta object ([generate-modonty-page-seo.ts](admin/app/(dashboard)/modonty/setting/actions/generate-modonty-page-seo.ts))

- **Select:** Add to `db.modonty.findUnique` select: `socialImageAlt`, `alternateLanguages`, `sitemapPriority`, `sitemapChangeFreq`. Keep `metaTags` (for ogLocaleAlternate, and optional googlebot, themeColor, author, keywords, ogDeterminer, ogImageAlt, twitterSiteId, twitterCreatorId if we ever store them there).
- **Site URL / canonical / OG URL:** Keep `ensureAbsoluteUrl`; `canonicalUrl` = ensureAbsoluteUrl(page.canonicalUrl, siteUrl) or siteUrl + "/" + page.slug. For openGraph.url use ensureAbsoluteUrl(page.ogUrl, siteUrl) if page.ogUrl is set, else canonicalUrl.
- **Build meta object (spec §1 table):**
  - title, description, canonical, robots: unchanged (existing logic).
  - googlebot: (page.metaTags?.googlebot) or robots (same value).
  - themeColor: process.env.NEXT_PUBLIC_THEME_COLOR or "#3030FF".
  - author: (page.metaTags?.author) or process.env.NEXT_PUBLIC_SITE_AUTHOR; omit if empty.
  - keywords: (page.metaTags?.keywords); omit if empty.
  - openGraph: title, description, type (page.ogType or "website"), url (ogUrl if set else canonical), siteName, locale, localeAlternate, determiner. localeAlternate: from page.metaTags?.ogLocaleAlternate (string "en_US" -> array ["en_US"]) or from page.alternateLanguages (array of {hreflang, url}) by extracting unique locale codes; determiner: page.metaTags?.ogDeterminer or "auto". images[0]: url, secure_url, type (page has no ogImageType; use "image/jpeg"), width 1200, height 630, alt: page.socialImageAlt || page.metaTags?.ogImageAlt || "" (no hardcoded empty when we have a field).
  - twitter: card, title, description, image, imageAlt (page.socialImageAlt || page.metaTags?.twitterImageAlt || page.metaTags?.ogImageAlt || ""), site, creator; optionally siteId, creatorId from metaTags if present.
  - hreflang: build array of { lang, href }. If page.alternateLanguages is non-empty array (each item { hreflang, url }), map to { lang: item.hreflang, href: item.url }; add entry for primary locale (from page.ogLocale) and x-default (canonical). Else if page.metaTags?.ogLocaleAlternate (string), parse comma-separated locales and build hrefs same way as [page-form.tsx](admin/app/(dashboard)/modonty/setting/components/page-form.tsx) deriveAlternateLanguagesFromOgLocaleAlternate (base + pathname; alternate URL pattern /lang/path or /path).
  - sitemapPriority: page.sitemapPriority ?? 0.5; sitemapChangeFreq: page.sitemapChangeFreq ?? "monthly".
- **Merge:** metaTags = { ...existingMeta, ...built } (built overrides). Ensure no required key is dropped (built must contain all keys from spec that have a value).

### 2. JSON-LD: site config + full @graph ([generate-modonty-page-jsonld.ts](admin/app/(dashboard)/modonty/setting/helpers/generate-modonty-page-jsonld.ts))

- **New types:** Define `ModontySiteConfig` (siteUrl, siteName, brandDescription?, sameAs?, contactPoint?, logo?, knowsLanguage?, address?, geo?, searchUrlTemplate?, areaServed?). Extend `ModontyPageForJsonLd` with optional `socialImageAlt`; keep slug, title, seoTitle, seoDescription, canonicalUrl, inLanguage, socialImage, ogImage, updatedAt.
- **Function signature:** `generateModontyPageJsonLd(config: ModontySiteConfig, page: ModontyPageForJsonLd): object`. No longer read env inside the helper; caller passes config built from env in generate-modonty-page-seo.ts.
- **Build @graph in order:**
  1. **Organization** (if config has at least name/url): @id config.siteUrl + "#organization", name (config.siteName or "Modonty"), url (config.siteUrl), description (config.brandDescription), inLanguage (page.inLanguage or "ar"), sameAs (config.sameAs array), contactPoint (ContactPoint: contactType, email, telephone, areaServed from config), logo (ImageObject url, width 512, height 512 from config.logo), image (ImageObject from page.ogImage || page.socialImage; width 1200, height 630), knowsLanguage (config.knowsLanguage or [page.inLanguage] + from locale alternate). Optional: address (PostalAddress from config), geo (GeoCoordinates from config).
  2. **WebSite:** @id config.siteUrl + "#website", name, url, description, inLanguage, publisher { "@id": config.siteUrl + "#organization" }, potentialAction (SearchAction with config.searchUrlTemplate) if searchUrlTemplate present.
  3. **WebPage or AboutPage:** Use [getPageConfig](admin/app/(dashboard)/modonty/setting/helpers/page-config.ts)(page.slug) to decide; if config exists and slug is in PAGE_CONFIGS (about, user-agreement, privacy-policy, cookie-policy, copyright-policy), type "AboutPage", else "WebPage". @id pageUrl + "#aboutpage" or "#webpage", name (seoTitle || title || "Modonty"), headline (AboutPage only), url (absolute pageUrl), mainEntityOfPage (pageUrl), description, about (AboutPage only: "@id" organization), publisher, isPartOf "@id" website, inLanguage, dateModified (updatedAt ISO 8601), primaryImageOfPage (ImageObject with url, optional width 1200 height 630). Optional breadcrumb for AboutPage: "@id" pageUrl + "#breadcrumb".
  4. **BreadcrumbList** (optional, for AboutPage): @id pageUrl + "#breadcrumb", itemListOrder "ItemListOrderAscending", itemListElement: [ { "@type": "ListItem", position: 1, name: config.siteName or "Modonty", item: { "@id": config.siteUrl } }, { position: 2, name: getPageConfig(slug).label or page name, item: { "@id": pageUrl } } ].
- **Return:** { "@context": "[https://schema.org](https://schema.org)", "@graph": [...] }. Order: Organization, WebSite, WebPage/AboutPage, BreadcrumbList (if any).
- **Helpers:** Implement ensureAbsoluteUrl for image URLs inside this file or accept pre-normalized pageUrl from caller. Page URL: page.canonicalUrl trimmed and made absolute with config.siteUrl, or config.siteUrl + "/" + page.slug.

### 3. Wire site config and call JSON-LD helper ([generate-modonty-page-seo.ts](admin/app/(dashboard)/modonty/setting/actions/generate-modonty-page-seo.ts))

- **Build site config from env:** siteUrl (NEXT_PUBLIC_SITE_URL || NEXT_PUBLIC_MODONTY_URL || "[https://modonty.com](https://modonty.com)"), siteName (NEXT_PUBLIC_SITE_NAME || "Modonty"), brandDescription (NEXT_PUBLIC_BRAND_DESCRIPTION), sameAs (parse NEXT_PUBLIC_ORG_SAMEAS or comma-separated NEXT_PUBLIC_ORG_SAMEAS_* into array), contactPoint (contactType, email, telephone from NEXT_PUBLIC_ORG_CONTACT_*), areaServed (NEXT_PUBLIC_ORG_AREA_SERVED or "SA"), logo (NEXT_PUBLIC_ORG_LOGO_URL), searchUrlTemplate (NEXT_PUBLIC_ORG_SEARCH_URL_TEMPLATE), knowsLanguage (array from page.ogLocale + ogLocaleAlternate or env), address (streetAddress, addressLocality, addressRegion, addressCountry, postalCode from NEXT_PUBLIC_ORG_*), geo (latitude, longitude from NEXT_PUBLIC_ORG_GEO_*). Omit optional fields when env not set.
- **Call:** rawJsonLd = generateModontyPageJsonLd(siteConfig, { slug, title, seoTitle, seoDescription, canonicalUrl, inLanguage, socialImage, ogImage, socialImageAlt, updatedAt }). Pass pageUrl as absolute (same as canonicalUrl computed above) so JSON-LD helper can use it; helper can accept pageUrl in page object or compute from canonicalUrl + siteUrl.
- **Normalize and validate** unchanged; write jsonLdString to DB as today.

### 4. Validator: allow full @graph, require WebPage or AboutPage ([modonty-jsonld-validator.ts](admin/app/(dashboard)/modonty/setting/helpers/modonty-jsonld-validator.ts))

- **Custom business rule (validateModontyPageBusinessRules):** Require at least one node in @graph with "@type" "WebPage" or "AboutPage" (not only "WebPage"). So: find nodes where @type === "WebPage" || @type === "AboutPage"; if none, error "Missing WebPage or AboutPage node in @graph". Keep warning "WebPage should have name or description" for the page node if it has no name and no description.
- **AJV schema:** Relax @graph items to allow any object with "@type" (Organization, WebSite, WebPage, AboutPage, BreadcrumbList) so validation does not fail on extra types. Current schema only requires @type; optional properties already allow extra keys. No change needed if current schema does not restrict @type enum; if it does, remove restriction so multiple types pass.

### 5. Edge cases and consistency

- **ogLocaleAlternate** is stored in metaTags (updatePage merges it). When building openGraph.localeAlternate, read from (page.metaTags as Record)?.ogLocaleAlternate (string "en_US" or "en_US,fr_FR"); convert to array of strings for meta output. For hreflang, use page.alternateLanguages when available (saved on submit from form’s deriveAlternateLanguagesFromOgLocaleAlternate), else derive from ogLocaleAlternate + canonical using same URL pattern as form.
- **Primary locale and x-default:** Include in hreflang array: one entry for primary (page.ogLocale e.g. "ar_SA" -> lang "ar", href canonical or locale-specific URL), and one for x-default (canonical). Match doc §1.4 pattern.
- **Image absolute URL:** Reuse ensureAbsoluteUrl in generator for og/twitter/JSON-LD image URLs; pass siteUrl into JSON-LD helper via config so helper can resolve relative image paths.

## Files to modify


| File                                                                                                                                                           | Changes                                                                                                                                                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [admin/app/(dashboard)/modonty/setting/actions/generate-modonty-page-seo.ts](admin/app/(dashboard)/modonty/setting/actions/generate-modonty-page-seo.ts)       | Expand select; build full meta per §1 (googlebot, themeColor, author, keywords, openGraph.url from ogUrl, localeAlternate, determiner, images[0].alt, twitter.imageAlt, hreflang, sitemap); build site config from env; call generateModontyPageJsonLd(config, page). |
| [admin/app/(dashboard)/modonty/setting/helpers/generate-modonty-page-jsonld.ts](admin/app/(dashboard)/modonty/setting/helpers/generate-modonty-page-jsonld.ts) | Add ModontySiteConfig and extended page type; implement Organization, WebSite, WebPage/AboutPage (via getPageConfig), BreadcrumbList; accept config + page; return full @graph.                                                                                       |
| [admin/app/(dashboard)/modonty/setting/helpers/modonty-jsonld-validator.ts](admin/app/(dashboard)/modonty/setting/helpers/modonty-jsonld-validator.ts)         | Require at least one WebPage or AboutPage in @graph; allow Organization, WebSite, BreadcrumbList.                                                                                                                                                                     |


## Verification

- After implementation: save a page with seoTitle, socialImageAlt, ogLocaleAlternate (or alternateLanguages), sitemapPriority; run Generate. Inspect Generated SEO tab: meta must include title, description, canonical, robots, googlebot, themeColor (or omit if no env), openGraph.url (ogUrl if set), openGraph.localeAlternate, openGraph.images[0].alt, twitter.imageAlt, hreflang, sitemapPriority, sitemapChangeFreq. JSON-LD must contain @graph with Organization, WebSite, and WebPage or AboutPage; for about slug, AboutPage and optional BreadcrumbList. Validator must pass (no "Missing WebPage node" when AboutPage is present).

