# Modonty Setting — Generated SEO = Default Value Tab (Strict Spec)

**Source of truth:** Default Value tab in `admin/app/(dashboard)/modonty/setting/components/page-form.tsx` (TabsContent value="default-value") and `documents/SEO-FULL-COVERAGE-100.md` §1–6.

**Contract:** Output of "Generate SEO" (metaTags + jsonLdStructuredData) must match every applicable item from that tab. Changing any persisted/input value that the tab says feeds SEO must show up in Generated SEO after save + generate.

---

## 1. Meta — Required output and sources

After generate, `metaTags` must contain exactly these, from the stated source:

| Output key/path | Source | Fallback |
|-----------------|--------|----------|
| title | page.seoTitle \|\| page.title | "Modonty"; max 60 chars |
| description | page.seoDescription | max 160 chars |
| canonical | page.canonicalUrl → absolute URL | siteUrl + "/" + page.slug |
| robots | page.metaRobots | "index, follow" |
| googlebot | page.googlebot or same as robots | "index, follow" |
| themeColor | env NEXT_PUBLIC_THEME_COLOR or fixed | "#3030FF" |
| author | page.author or env NEXT_PUBLIC_SITE_AUTHOR | — |
| keywords | page.keywords if present | — |
| openGraph.title | page.ogTitle \|\| meta title | — |
| openGraph.description | page.ogDescription \|\| meta description | — |
| openGraph.type | page.ogType | "website" |
| openGraph.url | page.ogUrl if set, else canonical | — |
| openGraph.siteName | page.ogSiteName | "Modonty" |
| openGraph.locale | page.ogLocale | "ar_SA" |
| openGraph.localeAlternate | page.ogLocaleAlternate or from page.alternateLanguages | array or omit |
| openGraph.determiner | page.ogDeterminer | "auto" |
| openGraph.images[0].url | page.ogImage \|\| page.socialImage → absolute | — |
| openGraph.images[0].secure_url | same URL (HTTPS) | — |
| openGraph.images[0].type | page.ogImageType | "image/jpeg" |
| openGraph.images[0].width | page.ogImageWidth | 1200 |
| openGraph.images[0].height | page.ogImageHeight | 630 |
| openGraph.images[0].alt | page.socialImageAlt \|\| page.ogImageAlt | — |
| twitter.card | page.twitterCard | "summary_large_image" |
| twitter.title | page.twitterTitle \|\| meta title | — |
| twitter.description | page.twitterDescription \|\| meta description | — |
| twitter.image | same absolute image as OG | — |
| twitter.imageAlt | page.twitterImageAlt \|\| page.socialImageAlt \|\| page.ogImageAlt | — |
| twitter.site | page.twitterSite \|\| env NEXT_PUBLIC_TWITTER_SITE | — |
| twitter.creator | page.twitterCreator \|\| env NEXT_PUBLIC_TWITTER_CREATOR \|\| twitter.site | — |
| twitter.siteId | page.twitterSiteId if present | optional |
| twitter.creatorId | page.twitterCreatorId if present | optional |
| hreflang | Built from page.ogLocale + page.ogLocaleAlternate (or page.alternateLanguages) + canonical | array of { lang, href } |
| sitemapPriority | page.sitemapPriority | 0.5 |
| sitemapChangeFreq | page.sitemapChangeFreq | "monthly" |

Site base URL: env NEXT_PUBLIC_SITE_URL \|\| NEXT_PUBLIC_MODONTY_URL \|\| "https://modonty.com".

---

## 2. JSON-LD — Required @graph and sources

After generate, `jsonLdStructuredData` must be a single JSON object with `@context` "https://schema.org" and `@graph` containing at least:

**2.1 Organization**

- @id `{siteUrl}#organization`
- name, url, description, sameAs (array), contactPoint (ContactPoint: contactType, email, telephone, areaServed), logo (ImageObject: url, width 512, height 512), image (ImageObject from page OG/social image), knowsLanguage (array)
- Optional: address (PostalAddress from env). Do **not** output inLanguage or geo on Organization (schema.org: inLanguage is CreativeWork; geo is Place).
- Sources: env NEXT_PUBLIC_SITE_NAME, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_BRAND_DESCRIPTION, NEXT_PUBLIC_ORG_SAMEAS_*, NEXT_PUBLIC_ORG_CONTACT_*, NEXT_PUBLIC_ORG_AREA_SERVED, NEXT_PUBLIC_ORG_LOGO_URL (or Media); address from NEXT_PUBLIC_ORG_STREET_ADDRESS, _ADDRESS_LOCALITY, _ADDRESS_REGION, _ADDRESS_COUNTRY, _POSTAL_CODE. knowsLanguage from page.ogLocale / config.

**2.2 WebSite**

- @id `{siteUrl}#website`
- name, url, description, inLanguage, publisher { "@id": "{siteUrl}#organization" }, optional potentialAction (SearchAction from NEXT_PUBLIC_ORG_SEARCH_URL_TEMPLATE)
- Sources: same site/env + page.inLanguage.

**2.3 WebPage or AboutPage**

- Slug in about/legal list (page-config) → AboutPage; else WebPage.
- @id `{pageUrl}#webpage` or `#aboutpage`
- name (page.seoTitle \|\| page.title), headline (AboutPage only, same as name), url (absolute page URL), mainEntityOfPage (same URL), description (page.seoDescription), about (AboutPage only: { "@id": "{siteUrl}#organization" }), publisher { "@id": "{siteUrl}#organization" }, isPartOf { "@id": "{siteUrl}#website" }, inLanguage, dateModified (page.updatedAt ISO 8601), primaryImageOfPage (ImageObject from page.ogImage \|\| page.socialImage; optional width/height). Optional: breadcrumb { "@id": "{pageUrl}#breadcrumb" } for AboutPage.
- Sources: page.slug, page.title, page.seoTitle, page.seoDescription, page.canonicalUrl, page.inLanguage (or from page.ogLocale), page.ogImage, page.socialImage, page.updatedAt.

**2.4 BreadcrumbList (optional, for AboutPage when configured)**

- @id `{pageUrl}#breadcrumb`. itemListOrder "ItemListOrderAscending". itemListElement: ListItem position, name, item (@id).
- Sources: getPageConfig(slug).label + site name + page URL.

Optional per doc §5–6: LocalBusiness, FAQPage, HowTo, Article when data exists; not required for Defaults compliance.

---

## 3. Generator — Required reads and behavior

**File:** `admin/app/(dashboard)/modonty/setting/actions/generate-modonty-page-seo.ts`

- **DB select:** Include every field used in §1: slug, title, seoTitle, seoDescription, canonicalUrl, inLanguage, socialImage, socialImageAlt, ogImage, updatedAt, metaRobots, ogTitle, ogDescription, ogType, ogUrl, ogSiteName, ogLocale, ogLocaleAlternate (or read from metaTags after save), alternateLanguages, sitemapPriority, sitemapChangeFreq, twitterCard, twitterTitle, twitterDescription, twitterSite, twitterCreator; plus any optional fields if on model (googlebot, themeColor, author, keywords, ogDeterminer, ogImageAlt, ogImageType, ogImageWidth, ogImageHeight, twitterSiteId, twitterCreatorId).
- **metaTags build:** Build the full meta object from §1. Use page fields and env; no hardcoded "" for alt; include googlebot, themeColor, author, keywords, openGraph.determiner, openGraph.localeAlternate, openGraph.images[0].alt (from socialImageAlt), twitter.imageAlt, hreflang (from ogLocale + ogLocaleAlternate/alternateLanguages), sitemapPriority, sitemapChangeFreq; use page.ogUrl for openGraph.url when set.
- **Merge:** Final metaTags = merge of existing metaTags with this built object; built keys override. Do not drop required keys.

**File:** `admin/app/(dashboard)/modonty/setting/helpers/generate-modonty-page-jsonld.ts`

- **Input:** Accept site config (siteUrl, siteName, brandDescription, sameAs, contactPoint, logo, knowsLanguage, address, geo, searchUrlTemplate, areaServed) and page (slug, title, seoTitle, seoDescription, canonicalUrl, inLanguage, socialImage, ogImage, socialImageAlt, updatedAt).
- **Output:** One JSON-LD object with @graph = [Organization, WebSite, WebPage or AboutPage, optional BreadcrumbList]. WebPage/AboutPage and BreadcrumbList per §2. Use getPageConfig(slug) for AboutPage vs WebPage and breadcrumb labels.

**File:** `admin/app/(dashboard)/modonty/setting/actions/generate-modonty-page-seo.ts` (wire)

- Call the JSON-LD helper with site config (from env) and page; write returned @graph into jsonLdStructuredData.

---

## 4. Validator

**File:** `admin/app/(dashboard)/modonty/setting/helpers/modonty-jsonld-validator.ts`

- Allow @graph to contain Organization, WebSite, WebPage, AboutPage, BreadcrumbList (and optional LocalBusiness, etc.).
- Require at least one node of type WebPage or AboutPage. Do not require exactly one node; do not reject Organization or WebSite.

---

## 5. Persistence

- Every field listed in §1 or §2 that comes from "page" must be persisted on save (Prisma Modonty or metaTags). If a field is in the form and in this spec, it must be in PERSISTED_KEYS (or written into metaTags in updatePage) and selected in generateModontyPageSEO.

---

## 6. Verification

- Change each dynamic input (e.g. seoTitle, socialImageAlt, ogLocaleAlternate, canonicalUrl, sitemapPriority) → Save → Run Generate (or rely on save triggering generate). Reload Generated SEO tab. The new value must appear in the correct key in metaTags or in @graph as specified above.
- Default Value tab text is reference only; do not change it for this spec. Generated SEO is the artifact under test.

---

## 7. Out of scope for this spec

- Charset, viewport (app/layout level).
- GEO FAQPage/HowTo/Article unless explicitly added later.
- Changing modonty app consumption of metaTags/jsonLdStructuredData (this spec defines admin-generated output only).

---

**Summary:** Default Value tab + SEO-FULL-COVERAGE-100 §1–6 define the contract. Generated SEO (meta + JSON-LD) must implement the tables in §1 and §2. Generator must read all listed sources and output all listed keys; no silent omissions, no hardcoded empties for user-editable fields. Validator must allow the full @graph. Persistence must cover all inputs used. Verification: change input → save → generate → inspect Generated SEO.
