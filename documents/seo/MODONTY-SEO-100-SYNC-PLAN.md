# Modonty SEO 100% Sync Plan — Meta + JSON-LD

**Goal:** Cover all fields from `SEO-FULL-COVERAGE-100.md` in **Generated SEO output** (meta + JSON-LD). Sync doc ↔ Generated SEO. Optional UI/DB fields (Phase E) for full editable coverage where applicable.

---

## 1. Meta 100% — Doc keys → UI → Generated SEO

### 1.1 Doc §1 keys (SEO-FULL-COVERAGE-100.md)

| Key | Source | UI today | Generated SEO today | Action |
|-----|--------|----------|----------------------|--------|
| title | page | ✓ SEO Title | ✓ | — |
| description | page | ✓ SEO Description | ✓ | — |
| canonical | page | ✓ Canonical URL | ✓ | — |
| robots | page | ✓ Meta Robots | ✓ | — |
| googlebot | page or derive | ❌ | ❌ | Phase E: optional field or derive from robots; add to output |
| theme-color | env/layout | ❌ | ❌ | Add to output from env (e.g. NEXT_PUBLIC_THEME_COLOR) or omit |
| author | page | ❌ | ❌ | Phase E: optional field + UI (SEO tab) + output |
| keywords | page | ❌ | ❌ | Phase E: optional field + UI (SEO tab) + output (doc: ignored by Google/Bing) |
| og:title … og:locale | page | ✓ Social tab | ✓ | — |
| og:image:alt | page (socialImageAlt) | ⚠️ exists, doesn’t save on alt-only edit | ❌ (hardcoded "") | Fix DeferredImageUpload onAltChange; use socialImageAlt in output |
| og:locale:alternate | page | ❌ | ❌ | Phase E: optional field or derive from alternateLanguages; add to output |
| og:determiner | page | ❌ | ❌ | Phase E: optional field + UI (Social tab) + output |
| twitter:* + image:alt | page | ✓ except image:alt | ✓ except imageAlt | Use socialImageAlt for twitter imageAlt; add to output |
| twitter:site:id, creator:id | page | ❌ | ❌ | Phase E: optional fields + UI (Social tab) + output |
| hreflang | page (alternateLanguages) | ✓ Technical tab | ❌ | Read alternateLanguages in generator; add hreflang to output |

### 1.2 Meta actions (no duplicates)

1. **Fix Social Image Alt** — DeferredImageUpload: add `onAltChange`; SEOSection wire it so alt-only edit updates form and saves. Generator: read `socialImageAlt`, set `openGraph.images[].alt` and `twitter.imageAlt`.
2. **Generator output** — Add to metaTags: `googlebot` (same value as robots or Phase E field), `hreflang` (from alternateLanguages). Optional: `themeColor` from env.
3. **Phase E** — Add optional Prisma + UI for: author, keywords, googlebot, og:determiner, og:locale:alternate, twitter:site:id, twitter:creator:id; wire into generator for full editable coverage.  

---

## 2. JSON-LD 100% — Doc §2–3 → Generated SEO

### 2.1 Doc @graph (Home / About)

- **Organization:** @id, name, url, description, inLanguage, sameAs, contactPoint, logo (ImageObject), image (ImageObject), knowsLanguage. Optional: address, geo.
- **WebSite:** @id, name, url, description, inLanguage, publisher → Organization, optional potentialAction (SearchAction).
- **WebPage or AboutPage:** @id, name, headline (About), url, mainEntityOfPage, description, about (About), publisher, isPartOf, inLanguage, dateModified, primaryImageOfPage (ImageObject), breadcrumb (About).
- **BreadcrumbList:** @id, itemListOrder, itemListElement (ListItem: position, name, item).

### 2.2 Source of truth (no per-page UI for site-level)

- **Site-level (env or future Site Settings):** SITE_URL, SITE_NAME, BRAND_DESCRIPTION, optional: SAME_AS (JSON array), CONTACT_EMAIL, CONTACT_PHONE, CONTACT_TYPE, LOGO_URL, KNOWS_LANGUAGE (JSON array), ADDRESS (JSON or separate env), GEO (lat/lng), SEARCH_URL_TEMPLATE.
- **Page-level (existing Modonty fields):** slug, title, seoTitle, seoDescription, canonicalUrl, inLanguage, socialImage, socialImageAlt, updatedAt; page-config for label (breadcrumb).

### 2.3 JSON-LD actions

1. **Extend `generate-modonty-page-jsonld.ts`** — Accept site config (siteUrl, siteName, brandDescription from env) and optional (sameAs, contactPoint, logo, knowsLanguage, address, geo, searchUrlTemplate). Build @graph: Organization, WebSite, WebPage or AboutPage (by slug: about → AboutPage), BreadcrumbList for about/legal (use getPageConfig(slug).label).
2. **Wire in `generate-modonty-page-seo.ts`** — Read env for site-level; pass to JSON-LD builder; pass page socialImageAlt for ImageObject caption if needed.
3. **Validator** — Allow Organization, WebSite, AboutPage, BreadcrumbList; require at least one WebPage or AboutPage.

---

## 3. Sync checklist — Doc ↔ UI ↔ Generated SEO

| Doc section | UI (Modonty setting) | Generated SEO output |
|-------------|----------------------|----------------------|
| §1.1 Document | title, description, canonical, robots | metaTags: all + googlebot (derive), themeColor (env) |
| §1.2 OG | og:title … og:locale, og:image, og:image:alt (Social Image Alt) | openGraph: all, images[].alt from socialImageAlt |
| §1.3 Twitter | twitter:card … twitter:creator + image:alt (Social Image Alt) | twitter: all + imageAlt |
| §1.4 hreflang | Alternate Languages (Technical) | metaTags.hreflang from alternateLanguages |
| §2–3 JSON-LD | No per-page UI for Organization/WebSite; page fields feed WebPage/AboutPage | Full @graph from env + page data |

---

## 4. Implementation order

1. **Phase A — Social Image Alt**  
   DeferredImageUpload `onAltChange`; SEOSection wire; generator use `socialImageAlt` for og:image:alt and twitter:image:alt.

2. **Phase B — Generator meta 100%**  
   Add to generator: socialImageAlt, alternateLanguages in select; output: googlebot (derive), hreflang, openGraph.images[].alt, twitter.imageAlt. Optional: themeColor from env.

3. **Phase C — JSON-LD full @graph**  
   Env: SITE_URL, SITE_NAME, BRAND_DESCRIPTION (+ optional sameAs, contactPoint, logo, knowsLanguage, address, geo, searchUrlTemplate). Build Organization, WebSite, WebPage/AboutPage, BreadcrumbList in generate-modonty-page-jsonld.ts.

4. **Phase D — Validator**  
   Allow Organization, WebSite, AboutPage, BreadcrumbList; require WebPage or AboutPage.

5. **Phase E — Optional UI/DB for full coverage**
   Add optional Prisma fields + UI (SEO tab / Social tab) for: author, keywords, googlebot, og:determiner, og:locale:alternate, twitter:site:id, twitter:creator:id. Wire into generator. Optional UX: hint when description empty; group Meta Tags by section.

---

## 5. Files to touch

| File | Changes |
|------|--------|
| `admin/.../deferred-image-upload.tsx` | Add onAltChange; call in handleAltTextChange |
| `admin/.../seo-section.tsx` | Pass onAltChange to DeferredImageUpload |
| `admin/.../generate-modonty-page-seo.ts` | Select socialImageAlt, alternateLanguages; metaTags: alt, googlebot, hreflang, themeColor; pass config to JSON-LD |
| `admin/.../generate-modonty-page-jsonld.ts` | Full @graph: Organization, WebSite, WebPage/AboutPage, BreadcrumbList from env + page |
| `admin/.../modonty-jsonld-validator.ts` | Allow new types; require WebPage or AboutPage |
| `admin/.../generated-seo-section.tsx` | Hint when description empty |
| Prisma schema (page SEO/social) | Phase E: optional fields (author, keywords, googlebot, ogDeterminer, ogLocaleAlternate, twitterSiteId, twitterCreatorId) |
| `admin/.../seo-section.tsx` (SEO tab) | Phase E: optional inputs for author, keywords, googlebot |
| `admin/.../seo-section.tsx` (Social tab) | Phase E: optional inputs for og:determiner, og:locale:alternate, twitter IDs |

---

## 6. Result

- **Meta:** Generated SEO meta object contains every key from doc; Social Image Alt works on edit. Phase E adds optional UI/DB for author, keywords, googlebot, og:determiner, og:locale:alternate, twitter IDs for full editable coverage.
- **JSON-LD:** Generated SEO JSON-LD contains full @graph (Organization, WebSite, WebPage/AboutPage, BreadcrumbList) from env + page data; site-level from env.
- **Sync:** Doc and Generated SEO output aligned; Phase E optional fields give full editable coverage where desired.
