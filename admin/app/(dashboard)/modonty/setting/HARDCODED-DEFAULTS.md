# Hardcoded Defaults — Modonty Setting

## How it works (plain)

1. **Where do meta values come from?**  
   **Settings first.** When we build meta (title, description, charset, viewport, og:image, truncation, etc.), we pass options from the **Settings** table. So the **single source of truth (SOT)** for those defaults is the DB (Settings).

2. **When do we use literals in code?**  
   **Only when the option is null.** In `build-meta-from-page.ts` we have constants like `FALLBACK_CHARSET = "UTF-8"`, `FALLBACK_TITLE = "Modonty"`, etc. They are used **only** when the corresponding value from Settings is null or not passed. So: **Settings value → if null → then use FALLBACK_***. There are no literals in the built meta unless the Settings value is missing.

3. **What was the “missing block”?**  
   The code that **assigns** those values was missing: e.g. `charsetValue = defaultCharset?.trim() || FALLBACK_CHARSET`, `truncationSuffix = (defaultTruncationSuffix?.trim() || "...")`, and the same for og:image type/width/height and viewport. Without that block, the built object was still using variables that were never defined. That block was added so the built meta uses options (from Settings) with FALLBACK_* only when null.

**Summary:** Meta output is driven 100% by Settings when values exist; the only literals left are the FALLBACK_* values used when an option is null.

---

Values **never read from DB** (Modonty or Settings). Literals only. All meta fields come from Settings; code fallbacks only when options null.

## 1. From DB (fallbacks only)

DB first; code literals only when null.

- **Modonty (per-page):** `title`, `og:site_name`, `ogLocaleAlternate`, `imageAlt` → `seoTitle`/`title`, `ogSiteName`, `ogLocaleAlternate`/`alternateLanguages`, `heroImageAlt`/`socialImageAlt`.
- **Settings (global):** `themeColor`, `siteUrl`, `siteName`, twitter author/site, `inLanguage`, `areaServed`, `seoTitleMax`/`seoDescriptionMax`, `defaultTruncationSuffix`, and all 16 `default*` below.

## 2. Settings — 16 default fields

**Source:** Prisma `Settings`. Seed: `pnpm seed:seo-defaults` (from admin).

| Settings field             | Type   | Example default        |
|----------------------------|--------|------------------------|
| `defaultMetaRobots`        | String?| `"index, follow"`      |
| `defaultGooglebot`         | String?| `"index, follow"`      |
| `defaultOgType`             | String?| `"website"`             |
| `defaultOgLocale`          | String?| `"ar_SA"`              |
| `defaultOgDeterminer`       | String?| `"auto"`               |
| `defaultTwitterCard`       | String?| `"summary_large_image"`|
| `defaultSitemapPriority`   | Float? | `0.5`                  |
| `defaultSitemapChangeFreq`  | String?| `"monthly"`            |
| `defaultCharset`           | String?| `"UTF-8"`              |
| `defaultViewport`           | String?| viewport string        |
| `defaultOgImageType`        | String?| `"image/jpeg"`         |
| `defaultOgImageWidth`       | Int?   | `1200`                 |
| `defaultOgImageHeight`     | Int?   | `630`                  |
| `defaultHreflang`          | String?| `"x-default"`          |
| `defaultPathname`           | String?| `"/"`                  |
| `defaultTruncationSuffix`   | String?| `"..."`                |

Wired: settings-actions → BuildMetaOptions → build-meta-from-page → generate/preview. SOT: Settings.
