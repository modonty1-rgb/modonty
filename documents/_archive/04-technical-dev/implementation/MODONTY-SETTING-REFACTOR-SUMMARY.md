# Modonty Setting UI Refactor — Summary

Quick recap for continuing after restart.

## What We Did

### 1. Single Sources of Truth (SOT)

**OG Locale (SOT)**: Default `ar_SA`. Drives:
- `og:locale` (meta)
- **inLanguage** (WebPage.inLanguage, hreflang)
- **Organization.knowsLanguage** (derived from inLanguage on save)
- No Language input; value fixed at default

**OG Locale Alternate (SOT)**: Optional (e.g. `en_US` or `en_US, fr_FR`). Drives:
- `og:locale:alternate` (meta)
- **Alternate Languages** (hreflang)
- Stored in **metaTags** (no Prisma column)
- No UI to edit after Technical tab removed

### 2. Tabs Removed

**Social Media Tab**: Removed; all fields were defaults or `.env`
**Technical Tab**: Removed; all fields were defaults or derived

### 3. Fields Moved to "Default Value"

Labels only, no inputs:

**SEO**: Meta Robots, Googlebot, Theme color, Author, Canonical URL
**OG/Twitter**: OG Type, OG Locale, OG Locale Alternate, OG Determiner, OG Site Name, Twitter Card Type
**Twitter**: Site/Creator from `.env` (`NEXT_PUBLIC_TWITTER_SITE`, `NEXT_PUBLIC_TWITTER_CREATOR`)

### 4. Key Files

| Area | Path |
|------|------|
| Form + tabs | `admin/app/(dashboard)/modonty/setting/components/page-form.tsx` |
| Helpers | `deriveInLanguageFromOgLocale()`, `deriveAlternateLanguagesFromOgLocaleAlternate()` in page-form |
| Save / meta | `admin/app/(dashboard)/modonty/setting/actions/page-actions.ts` |
| Load | `admin/app/(dashboard)/modonty/setting/components/page-selector.tsx` |
| Notes | `documents/FINAL-STEP-NOTES.md` |

### 5. Current Modonty Setting Tabs

Basic · Media · SEO · Search & Social Previews · Generated SEO · Organization · **Default Value** (reference only)

## To Continue

**OG Locale Alternate**: No UI; value from metaTags or `""`. To edit again, add input (e.g. another tab or "Locale alternates" block) and wire to `formData.ogLocaleAlternate` + save into metaTags.

**Alternate Languages**: Derived from `ogLocaleAlternate` on init/reset/submit; persisted as before. No JSON textarea.

**Reference**: Keep FINAL-STEP-NOTES.md in sync when adding/changing defaults.
