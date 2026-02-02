# Modonty Setting — Hardcoded & SOT Audit Report

Deep audit of `admin/app/(dashboard)/modonty/setting` and related flows. Goal: single source of truth (Settings / Modonty), no unintended hardcoding.

---

## Executive summary

| Status | Count | Notes |
|--------|--------|------|
| **Bugs (fixed)** | 3 | charset/viewport now from options; ogImage* and truncationSuffix now defined from options |
| **Intentional code fallbacks** | 18 | FALLBACK_* in build-meta-from-page when options null |
| **Other hardcoded (outside meta)** | 8 | JSON-LD, areaServed, siteName, locale, UI fallbacks |
| **100% from Settings when passed** | 16 default* + truncation + title/desc max | When callers pass all options, meta uses them |

**Verdict:** Meta output is SOT from Settings; code fallbacks only when options are null. Bugs 1.1–1.3 fixed in `build-meta-from-page.ts`.

---

## 1. Bugs (fixed in build-meta-from-page.ts)

### 1.1 ~~`charset` and `viewport` ignored from options~~ FIXED

- **Was:** `built` used literals `"UTF-8"` and `"width=device-width, initial-scale=1"`.
- **Fix:** `charset: charsetValue`, `viewport: viewportValue` where `charsetValue = defaultCharset?.trim() || FALLBACK_CHARSET`, `viewportValue = defaultViewport?.trim() || FALLBACK_VIEWPORT`.

### 1.2 ~~`ogImageType`, `ogImageWidth`, `ogImageHeight` undefined~~ FIXED

- **Was:** openGraph.images[0] used undefined variables.
- **Fix:** `ogImageType = defaultOgImageType?.trim() || FALLBACK_OG_IMAGE_TYPE`, `ogImageWidth = defaultOgImageWidth ?? FALLBACK_OG_IMAGE_WIDTH`, `ogImageHeight = defaultOgImageHeight ?? FALLBACK_OG_IMAGE_HEIGHT`.

### 1.3 ~~`truncationSuffix` not defined~~ FIXED

- **Was:** `truncationSuffix` used but never assigned; `defaultTruncationSuffix` not destructured.
- **Fix:** Destructure `defaultTruncationSuffix`; `truncationSuffix = (defaultTruncationSuffix?.trim() || "...")`.

---

## 2. Intentional code fallbacks (build-meta-from-page.ts)

Used only when the corresponding option from Settings is null/undefined. Documented as “From DB (fallbacks only)”.

| Constant | Value | Used for |
|----------|--------|----------|
| FALLBACK_TITLE_MAX | 60 | title max length when `titleMaxLength` not passed |
| FALLBACK_DESCRIPTION_MAX | 160 | description max length when `descriptionMaxLength` not passed |
| FALLBACK_TITLE | "Modonty" | title/site name when `defaultSiteName` null |
| FALLBACK_ROBOTS | "index, follow" | robots when `defaultMetaRobots` null |
| FALLBACK_OG_TYPE | "website" | og:type when `defaultOgType` null |
| FALLBACK_OG_LOCALE | "ar_SA" | og:locale when `defaultOgLocale` null |
| FALLBACK_OG_DETERMINER | "auto" | og:determiner when `defaultOgDeterminer` null |
| FALLBACK_TWITTER_CARD | "summary_large_image" | twitter:card when `defaultTwitterCard` null |
| FALLBACK_SITEMAP_PRIORITY | 0.5 | sitemap priority when `defaultSitemapPriority` null |
| FALLBACK_SITEMAP_CHANGE_FREQ | "monthly" | sitemap changefreq when `defaultSitemapChangeFreq` null |
| FALLBACK_THEME_COLOR | "#3030FF" | theme-color when `themeColor` null |
| FALLBACK_CHARSET | "UTF-8" | charset when `defaultCharset` null (not yet wired into `built`) |
| FALLBACK_VIEWPORT | "width=device-width, initial-scale=1" | viewport when `defaultViewport` null (not yet wired into `built`) |
| FALLBACK_OG_IMAGE_TYPE | "image/jpeg" | og:image type (not yet wired; ogImageType undefined) |
| FALLBACK_OG_IMAGE_WIDTH | 1200 | og:image width (not yet wired; ogImageWidth undefined) |
| FALLBACK_OG_IMAGE_HEIGHT | 630 | og:image height (not yet wired; ogImageHeight undefined) |
| FALLBACK_HREFLANG | "x-default" | hreflang when `defaultHreflang` null |
| FALLBACK_PATHNAME | "/" | pathname when `defaultPathname` null |

Locale fallbacks inside helpers: `(ogLocale ?? "ar_SA").split("_")[0] || "ar"` — used when ogLocale/page locale is null; acceptable as last-resort locale.

---

## 3. Other hardcoded values (outside meta built object)

### 3.1 `generate-modonty-page-seo.ts` / `get-live-preview-seo.ts`

- **areaServed:** `settings.orgAreaServed?.trim() || "SA, AE, KW, BH, OM, QA, EG"` — fallback when Settings `orgAreaServed` null.
- **siteName (siteConfig):** `settings.siteName?.trim() || "Modonty"` — fallback when Settings `siteName` null.
- **defaultInLanguage / inLanguage:** `(page.ogLocale || "ar_SA").split("_")[0] || "ar"` — locale fallback.

### 3.2 `generate-modonty-page-jsonld.ts`

- **name (page):** `(page.seoTitle || page.title || "").trim() || "Modonty"` — fallback when page has no title.
- **config.siteName:** `config.siteName || "Modonty"` (multiple places) — fallback when siteName null.
- **Logo ImageObject:** `width: 512`, `height: 512` — fixed; not from Settings.
- **org.image / primaryImageOfPage:** `width: 1200`, `height: 630` — fixed; not from Settings (could use defaultOgImageWidth/Height).

### 3.3 `page-actions.ts` (updatePage)

- **titleMax / descMax:** `settings.seoTitleMax ?? 60`, `settings.seoDescriptionMax ?? 160` — validation fallbacks when Settings null; OK.

### 3.4 `seo-section.tsx` (UI)

- **maxLength / hint text:** `seoSettings?.seoTitleMax || 60`, `seoSettings?.seoDescriptionMax || 160`, and min 30/120 in text — fallbacks when SEO settings not yet loaded; OK.

### 3.5 `modonty-jsonld-validator.ts`

- **CACHE_TTL:** `1000 * 60 * 60 * 24` — cache TTL for schema.org fetch; operational, not user-facing SOT.

### 3.6 `page-schema.ts`

- **metaRobotsEnum / twitterCardEnum / sitemapChangeFreqEnum:** Allowed values are fixed (e.g. "index, follow", "summary_large_image", "monthly"). These are schema constraints, not default values; OK.

---

## 4. What is 100% from Settings when passed

When `generate-modonty-page-seo` and `get-live-preview-seo` pass full options from `getAllSettings()`:

- **From Settings (and used correctly today):** defaultSiteName, defaultMetaRobots, defaultGooglebot, defaultOgType, defaultOgLocale, defaultOgDeterminer, defaultTwitterCard, defaultSitemapPriority, defaultSitemapChangeFreq, defaultHreflang, defaultPathname, titleMaxLength, descriptionMaxLength, themeColor, twitterSite/Creator/Ids, defaultTruncationSuffix (once truncationSuffix is defined from it).
- **From Settings but not yet used in `built`:** defaultCharset, defaultViewport, defaultOgImageType, defaultOgImageWidth, defaultOgImageHeight (and ogImageType/Width/Height must be derived from them).

---

## 5. Doc vs code

- **HARDCODED-DEFAULTS.md** says truncation suffix and lengths come from Settings with code fallback 60/160 and `"..."`; that’s correct **after** fixing the truncationSuffix bug.
- **HARDCODED-DEFAULTS.md** lists 16 default* fields and says charset/viewport are in Settings; that’s correct in schema, but the doc does not state that **charset and viewport are still hardcoded in the built object** (bug 1.1). After fixing bugs, the doc should state that all meta fields (including charset, viewport, og:image type/width/height, truncation) come from Settings with code fallbacks only when null.

---

## 6. Recommended fixes (short list)

1. **build-meta-from-page.ts**
   - Destructure `defaultTruncationSuffix` and set `truncationSuffix = (defaultTruncationSuffix?.trim() || "...")`.
   - Use `defaultCharset` / `defaultViewport` in `built`: `charset: defaultCharset?.trim() || FALLBACK_CHARSET`, `viewport: defaultViewport?.trim() || FALLBACK_VIEWPORT`.
   - Define and use: `ogImageType = defaultOgImageType?.trim() || FALLBACK_OG_IMAGE_TYPE`, `ogImageWidth = defaultOgImageWidth ?? FALLBACK_OG_IMAGE_WIDTH`, `ogImageHeight = defaultOgImageHeight ?? FALLBACK_OG_IMAGE_HEIGHT`, and use them in `openGraph.images[0]`.
2. **HARDCODED-DEFAULTS.md**
   - Update to say that meta charset, viewport, and og:image type/width/height are taken from Settings (with code fallbacks when null), and that the only remaining “truly hardcoded” values are those fallbacks when options are not passed.

---

## 7. File checklist

| File | Hardcoded / SOT | Notes |
|------|------------------|-------|
| `helpers/build-meta-from-page.ts` | Bugs + fallbacks | Fix charset, viewport, ogImage*, truncationSuffix |
| `helpers/generate-modonty-page-jsonld.ts` | Fallbacks + fixed 512/1200/630 | siteName/Modonty OK; image dimensions could come from config later |
| `helpers/page-schema.ts` | Enum values only | Constraints, not defaults |
| `helpers/modonty-jsonld-validator.ts` | CACHE_TTL | Operational |
| `actions/generate-modonty-page-seo.ts` | areaServed, siteName, ar_SA | Fallbacks when Settings null |
| `actions/get-live-preview-seo.ts` | Same | Same |
| `actions/page-actions.ts` | 60, 160 | Validation fallbacks from Settings |
| `components/sections/seo-section.tsx` | 60, 160, 30, 120 | UI fallbacks when settings not loaded |
