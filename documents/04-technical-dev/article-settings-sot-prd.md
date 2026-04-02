# PRD: Article Technical Fields — Settings as Single Source of Truth

**Version**: 1.0
**Status**: Draft
**Scope**: Admin article experience; article technical defaults; Settings table as SOT

**Note**: Current environment uses fake/test data only.

## Problem

- Article table stores many technical/default values (language, meta robots, license, sitemap, Twitter/OG defaults) **per article**.
- Changing site-wide default requires changing every article or keeping defaults in two places (Settings + article form).
- Editors can override on every article, leading to inconsistency and maintenance issues when site policy changes.

## Goals

- **Single source of truth**: All article technical/default values from **Settings table** only. No duplicate storage on Article.
- **Article remains fully functional**: Create, edit, view, publish, sitemap, meta tags, JSON-LD work; they simply **read** from Settings.
- **No per-article input**: These values are **read-only labels** in article form (e.g. "Language: ar", "Meta robots: index, follow").
- **One place to change defaults**: Admins change in **Settings**; all articles and outputs (sitemap, meta, JSON-LD) use automatically.

## Scope

### In Scope

- 12 article technical/default fields (see Section 5)
- Admin article: new, edit, view (read-only) - Form shows labels only
- All outputs: sitemap, meta tags, JSON-LD, article page, preview, analyzers - Must resolve from Settings
- Schema: Article no longer stores these 12; Settings holds corresponding defaults

### Out of Scope

- Changing Settings model fields
- Redesigning Settings UI
- Per-article overrides for these 12 fields

## User Stories

- **As an admin**, I want to set defaults in one place (Settings) so all articles use them without per-article configuration.
- **As an editor**, I want to see technical defaults as read-only labels so I know what applies without changing them.
- **As an admin**, I want to change site-wide defaults in Settings and have them apply to all articles and generated outputs.

## Fields: Remove from Article, Use from Settings

| Remove from Article | Use from Settings |
|---------------------|-------------------|
| Language | `inLanguage` |
| Meta robots | `defaultMetaRobots` |
| OG type | `defaultOgType` |
| Twitter card | `defaultTwitterCard` |
| Twitter site | `twitterSite` |
| Twitter creator | `twitterCreator` |
| Sitemap priority | `articleDefaultSitemapPriority` or `defaultSitemapPriority` |
| Sitemap change frequency | `articleDefaultSitemapChangeFreq` or `defaultSitemapChangeFreq` |
| License | `defaultLicense` |
| Accessible for free | `defaultIsAccessibleForFree` |
| Alternate languages (hreflang) | `defaultAlternateLanguages` |
| Content format | `defaultContentFormat` |

**Render-only** (no Article column): When building article page meta or hreflang, use Settings: `defaultOgLocale`, `defaultHreflang`, `defaultNotranslate`.

**Article fields that stay** (validation only): SEO title and description remain on Article; Settings supplies validation rules (min/max/restrict). No change to storage location.

## Requirements

### Data

- Article table must not store the 12 fields after implementation.
- Settings table must be the only source when generating or displaying article data.
- New and edit article flows must receive values from Settings, not from article record.

### Article Form (Admin)

- Must **not** show inputs for the 12 fields.
- Must show as **read-only labels** with current Settings value (e.g. "Language: ar", "License: CC-BY").
- Labels must update to reflect current Settings values.

### Article View (Admin, Read-Only)

- Must still display technical information (language, meta robots, license, sitemap).
- Values must come from Settings, not article record.

### Create and Update Article

- Must not persist the 12 fields to Article table.
- Must not read or write the 12 fields.

### Downstream Consumers

- Sitemap generation reads Settings, not Article
- Meta tags generator reads Settings, not Article
- JSON-LD generator reads Settings, not Article
- Admin article preview reads Settings, not Article
- SEO analyzer reads Settings, not Article
