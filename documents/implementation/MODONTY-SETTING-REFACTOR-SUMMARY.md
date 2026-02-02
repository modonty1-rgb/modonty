# Modonty Setting UI Refactor — Summary

Short recap so you can continue after restart.

---

## What We Did

### 1. Single sources of truth (SOT)

- **OG Locale (SOT)** — Default `ar_SA`. Drives:
  - `og:locale` (meta)
  - **inLanguage** (WebPage.inLanguage, hreflang) = first part of locale (e.g. `ar_SA` → `ar`)
  - **Organization.knowsLanguage** = derived from inLanguage on save  
  No Language input; value fixed at default.

- **OG Locale Alternate (SOT)** — Optional (e.g. `en_US` or `en_US, fr_FR`). Drives:
  - `og:locale:alternate` (meta)
  - **Alternate Languages** (hreflang) = derived as `/lang/path` from comma-separated locales  
  Stored in **metaTags** (no Prisma column). Value from metaTags on load or default `""`. No UI to edit after Technical tab was removed.

### 2. Tabs removed

- **Social Media** — Tab and `social-section.tsx` removed (all fields were defaults or .env).
- **Technical** — Tab and `technical-section.tsx` removed. OG Locale Alternate, sitemap priority/freq, canonical, language, alternate languages were either defaults or derived; no editable Technical UI left.

### 3. Fields moved to “Default Value” (labels only, no inputs)

- SEO: Meta Robots, Googlebot, Theme color, Author, Canonical URL.
- OG/Twitter: OG Type, OG Locale, OG Locale Alternate, OG Determiner, OG Site Name, Twitter Card Type; Twitter Site/Creator from .env (`NEXT_PUBLIC_TWITTER_SITE`, `NEXT_PUBLIC_TWITTER_CREATOR`).
- Technical (now doc-only): Canonical URL (computed), Sitemap Priority (0.5), Sitemap Change Frequency (monthly).

### 4. Key files

| Area | Path |
|------|------|
| Form + tabs | `admin/app/(dashboard)/modonty/setting/components/page-form.tsx` |
| Helpers | `deriveInLanguageFromOgLocale()`, `deriveAlternateLanguagesFromOgLocaleAlternate()` in page-form |
| Save / meta | `admin/app/(dashboard)/modonty/setting/actions/page-actions.ts` (metaTags: organizationSeo, ogLocaleAlternate) |
| Load | `admin/app/(dashboard)/modonty/setting/components/page-selector.tsx` (initialData.ogLocaleAlternate from metaTags) |
| Notes | `documents/FINAL-STEP-NOTES.md` (Default Values section) |

### 5. Current Modonty setting tabs

Basic · Media · SEO · Search & Social Previews · Generated SEO · Organization · **Default Value** (reference only).

---

## To Continue

- **OG Locale Alternate:** No UI; value is from metaTags or `""`. To allow editing again, add an input (e.g. on another tab or a small “Locale alternates” block) and wire it to `formData.ogLocaleAlternate` + save into metaTags.
- **Alternate Languages:** Still derived from `ogLocaleAlternate` on init/reset/submit; persisted as before. No JSON textarea.
- **FINAL-STEP-NOTES.md** — Single source for “what is default / SOT” per field; keep it in sync when you add or change defaults.
