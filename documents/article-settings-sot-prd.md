# PRD: Article Technical Fields — Settings as Single Source of Truth

**Version:** 1.0  
**Status:** Draft  
**Scope:** Admin article experience; article technical defaults; Settings table as SOT.

**Note:** Current environment uses fake/test data only; no need to worry about migrating existing article records or production data when removing the 12 columns.

---

## 1. Problem

- Article table today stores many technical/default values (language, meta robots, license, sitemap, Twitter/OG defaults, etc.) **per article**.
- Changing a site-wide default (e.g. “all articles use this license”) requires either changing every article or keeping defaults in two places (Settings + article form defaults).
- Editors can override these on every article, which leads to inconsistency and extra maintenance when site policy changes.

---

## 2. Goals

- **Single source of truth:** All article technical/default values come from the **Settings table** only. No duplicate storage on Article.
- **Article remains fully functional:** Create, edit, view, publish, sitemap, meta tags, JSON-LD, and public article pages all work; they simply **read** these values from Settings.
- **No per-article input for these fields:** In the article form, these values are **not editable**. They are shown as **read-only labels** (e.g. “Language: ar”, “Meta robots: index, follow”) so editors see what applies but do not change them on the article.
- **One place to change defaults:** Admins change language, meta robots, license, sitemap settings, etc. in **Settings**; all articles and all outputs (sitemap, meta, JSON-LD) use those values automatically.

---

## 3. Scope

### In scope

- The 12 article technical/default fields listed in the inventory (see Section 5).
- Admin article: new article, edit article, view article (read-only). Form shows labels only; view shows values from Settings.
- All outputs that use these values: sitemap, meta tags, JSON-LD, public article page, article preview, analyzers. They must resolve these values from Settings, not from Article.
- Schema: Article table no longer stores these 12 fields; Settings table holds (or already holds) the corresponding defaults.

### Out of scope

- Changing which fields exist in the Settings model (only ensuring they are used as SOT).
- Redesigning the Settings UI (Settings form already allows editing these; no new screens required).
- Per-article overrides: this PRD does not introduce “override on this article” for these 12 fields; they are site-wide from Settings only.

---

## 4. User stories

- **As an admin**, I want to set default language, meta robots, license, sitemap behavior, and similar technical defaults in one place (Settings) so that all articles use them without per-article configuration.
- **As an editor**, I want to see which technical defaults apply to my article (as read-only labels) so I know what will be used for sitemap, meta, and structured data, without being able to change them on the article.
- **As an admin**, I want to change a site-wide default (e.g. license or sitemap frequency) in Settings and have it apply to all articles and all generated outputs (sitemap, meta, JSON-LD) without touching individual articles.

---

## 5. Fields: Remove from Article, Use from Settings

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

**Render-only (no Article column):** When building article page meta or hreflang, use Settings: `defaultOgLocale`, `defaultHreflang`, `defaultNotranslate` as needed.

**Article fields that stay (validation only):** SEO title and SEO description remain on Article; Settings only supplies validation rules (min/max/restrict). No change to where those values are stored.

---

## 6. Requirements

### 6.1 Data

- Article table must not store the 12 fields above after implementation.
- Settings table must be the only source for these values when generating or displaying article-related data.
- New article and edit article flows must receive these values from Settings (e.g. via a single load of Settings), not from the article record.

### 6.2 Article form (admin)

- The article form must **not** show inputs (dropdowns, checkboxes, number fields, text inputs) for the 12 fields.
- The article form must show these 12 as **read-only labels** with the current value from Settings (e.g. “Language: ar”, “Meta robots: index, follow”, “License: CC-BY”).
- Labels must update to reflect the current Settings values (e.g. after a refresh or when opening the form with latest Settings).

### 6.3 Article view (admin, read-only)

- The article view ([id]) must still display the same technical information (language, meta robots, license, sitemap, Twitter/OG defaults, etc.).
- Displayed values must come from Settings, not from the article record (since those columns will be removed).

### 6.4 Create and update article

- Create article must not persist any of the 12 fields to the Article table.
- Update article must not read or write any of the 12 fields to/from the Article table.

### 6.5 Downstream consumers

- Sitemap generation must use Settings for sitemap priority and change frequency (and any other of the 12 it needs).
- Article meta tags (admin and public) must use Settings for meta robots, OG type, Twitter card, locale, etc.
- Article JSON-LD and structured data must use Settings for language, license, accessible for free, etc.
- Public article page and article preview must use Settings for any of the 12 they display or use in meta/JSON-LD.
- Any analyzer or validation that needs these values (e.g. language for word count, meta robots for guidance) must receive them from Settings.

### 6.6 Settings UI

- Settings must expose and allow editing of all Settings fields that correspond to the 12 article defaults (including `defaultIsAccessibleForFree`, `defaultAlternateLanguages`, `defaultContentFormat` if they are used). No new screens are required if these already exist in the Settings form.

### 6.7 New article and Edit article — schema, backend, frontend (full coverage)

This subsection confirms the plan covers **new article** and **edit article** end-to-end: **schema**, **backend**, and **frontend**.

---

**Schema**

| Layer | What | Change |
|-------|------|--------|
| Article table | 12 columns today: `inLanguage`, `metaRobots`, `ogType`, `twitterCard`, `twitterSite`, `twitterCreator`, `sitemapPriority`, `sitemapChangeFreq`, `license`, `isAccessibleForFree`, `alternateLanguages`, `contentFormat` | **Remove** these 12 columns from the Article model. Run migration after code is updated. |
| Settings table | Already has fields that map to the 12 (e.g. `inLanguage`, `defaultMetaRobots`, `defaultOgType`, `defaultTwitterCard`, `twitterSite`, `twitterCreator`, `articleDefaultSitemapPriority`, `articleDefaultSitemapChangeFreq`, `defaultLicense`, `defaultIsAccessibleForFree`, `defaultAlternateLanguages`, `defaultContentFormat`) | **No schema change** to Settings. Ensure API (getAllSettings) returns all 12 so backend/frontend can read them. |

---

**New article — backend**

| Touchpoint | Role | Change |
|------------|------|--------|
| New article page (server) | Loads data for the form; passes `initialData` and `onSubmit` to `ArticleFormProvider`. | **Load Settings** (e.g. getAllSettings or getArticleDefaultsFromSettings). Pass **article defaults from Settings** into the form (e.g. as `initialData` for the 12 only, or as a dedicated prop like `settingsArticleDefaults`). Do not pass the 12 from Article (there is no article yet). |
| createArticle mutation | Persists new article to DB. | **Do not persist** the 12. Remove every one of the 12 from the `data` object passed to `db.article.create`. Do not read them from the incoming payload for persistence (form must not send them, or mutation must ignore them). |
| getArticleById / get-articles | Not used for new article. | For edit and view: after schema change, **remove the 12 from any explicit Article select**, or rely on Prisma returning only existing columns (returned article will not have the 12). |

---

**New article — frontend**

| Touchpoint | Role | Change |
|------------|------|--------|
| New article page (client shell) | Renders `ArticleFormProvider` and form tabs. | No structural change; provider receives Settings-derived defaults from server. |
| ArticleFormProvider / form context | Provides initial form state and `updateField`; calls `onSubmit` (createArticle) on save. | **Accept** Settings-derived defaults (from server). Use them for **display only** (labels). **Do not allow** `updateField` to change the 12, or treat the 12 as read-only. On submit, **do not send** the 12 in the payload to createArticle (or send only for display; backend must not persist them). |
| Form store (initial state) | Default form data for new article. | For the 12, **initialise from Settings** (passed from server), not from hardcoded defaults. |
| Form UI (tabs: Meta Tags, Technical SEO, Social, etc.) | Renders inputs and labels for article fields. | **Replace** every input (dropdown, checkbox, number, text) for the 12 with **read-only labels** that show the value from context (Settings). Same layout/sections; only the 12 become non-editable labels. |

---

**Edit article — backend**

| Touchpoint | Role | Change |
|------------|------|--------|
| Edit article page (server) | Loads article by id, transforms to form data, passes `initialData` and `onSubmit` to `ArticleFormProvider`. | **Load article + Settings.** Build initial form data so that: (a) **transformArticleToFormData** no longer reads the 12 from `article` (they will not exist after schema change); (b) the 12 in `initialData` come **from Settings** (merge Settings defaults into the transformed object). Pass merged `initialData` to the provider. |
| getArticleById | Returns one article for edit and view. | After schema change, the returned article **will not have** the 12 properties (columns removed). Any caller that expects `article.inLanguage` etc. must get them from Settings or from a merged model built on the server. |
| transformArticleToFormData(article) | Converts DB article to form shape. | **Do not read** the 12 from `article`. Either: (1) accept a second argument `settings` and set the 12 in the return object from Settings, or (2) have the edit page merge Settings into the result of transform after calling it. Output must include the 12 for form display, but sourced from Settings only. |
| updateArticle mutation | Persists changes to existing article. | **Do not read or persist** the 12. Remove every one of the 12 from the `data` object passed to `db.article.update`. Do not read them from the incoming payload for persistence. |
| get-articles (list) | Returns many articles; may include the 12 in select or in response shape. | After schema change, **remove the 12** from any explicit select or from response mapping. List UI that shows the 12 must get them from Settings (site-wide) or omit them. |

---

**Edit article — frontend**

| Touchpoint | Role | Change |
|------------|------|--------|
| Edit article page (client shell) | Renders `ArticleFormProvider` with `initialData` from server. | No structural change; `initialData` is already merged (article + Settings) on the server. |
| ArticleFormProvider / form context | Same as new article; for edit it calls updateArticle on submit. | **Same as new:** the 12 are display-only (from Settings). **Do not send** the 12 in the payload to updateArticle. |
| Form store / initial state | For edit, initial state comes from `initialData` (merged article + Settings). | Merged `initialData` from server already contains the 12 from Settings; store uses them for labels only. |
| Form UI | Same as new article. | **Same as new:** the 12 are **read-only labels**; no inputs. |

---

**Summary**

- **Schema:** Article loses the 12 columns; Settings keeps them. API exposes them.
- **New article backend:** Page loads Settings and passes defaults to form; createArticle does not persist the 12.
- **New article frontend:** Provider/store get defaults from server; form shows the 12 as labels only; submit does not send the 12.
- **Edit article backend:** Page loads article + Settings; transform does not read the 12 from article; merged initialData has the 12 from Settings; getArticleById returns article without the 12 after migration; updateArticle does not read or persist the 12.
- **Edit article frontend:** Same as new article: labels only, no submit of the 12.

The plan **fully covers** new article and edit article across schema, backend, and frontend.

---

## 7. Acceptance criteria

- [ ] Article can be created and updated without storing the 12 fields on Article.
- [ ] Article form shows the 12 fields as read-only labels; values match current Settings.
- [ ] Article form has no inputs (no dropdown, checkbox, or number field) for the 12 fields.
- [ ] Article view shows the same technical information; values come from Settings.
- [ ] Changing a value in Settings and reopening the article form or view shows the updated value in the labels.
- [ ] Sitemap uses Settings for article sitemap priority and change frequency.
- [ ] Article meta tags (admin and public) use Settings for the relevant fields.
- [ ] Article JSON-LD and public article page use Settings for language, license, and other applicable fields.
- [ ] No feature or flow reads the 12 fields from the Article table after implementation.

---

## 8. Success metrics

- Single place to change article technical defaults (Settings).
- Zero per-article configuration for the 12 fields; editors see labels only.
- All article-related outputs (sitemap, meta, JSON-LD, public page) stay correct and consistent with Settings.

---

## 9. Risks and mitigations (no errors, no crash, no broken UI)

This section and Sections 10–12 exist so that implementation can be checked line-by-line: every risk has a mitigation, every touchpoint is listed, functionality preserved is explicit, and go-live order prevents schema change before code is ready.

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Code still reads `article.inLanguage` (or any of the 12) after columns are removed** | Runtime error (undefined) or Prisma error when selecting; broken UI (e.g. "—" or blank labels); sitemap/meta/JSON-LD wrong or failing. | Before or in the same release as the schema migration: update every consumer to read these values from Settings (or from a merged "article + Settings" view model). Do not remove Article columns until all touchpoints are updated. |
| **Form removes inputs but does not load Settings** | Labels empty or wrong; form may still try to submit the 12 fields and mutation may fail or ignore them. | New and edit article pages must load Settings and pass Settings-derived values into the form (for display and for any logic that needs "current value"). Mutations must not persist the 12 to Article. |
| **View ([id]) still expects `article.*` for the 12** | After schema change, `article.inLanguage` etc. are undefined; view shows "—" or breaks. | Article view must receive a merged model (article + Settings) so view components read the 12 from that merged object, not from `article` alone. |
| **Queries (getArticleById, get-articles) still select the 12** | After schema change, Prisma will error (unknown column). | Remove the 12 from Article select lists in queries when the schema is updated. If response shape changes, ensure all callers use Settings or merged model for the 12. |
| **Settings API does not expose all 12** | Consumers cannot read `defaultIsAccessibleForFree`, `defaultAlternateLanguages`, `defaultContentFormat` (or others) from Settings. | Ensure getAllSettings (or equivalent) returns every Settings field that maps to the 12 article defaults. Add missing fields to Settings API and types before switching consumers. |
| **Create/update article still pass the 12 in payload** | After schema change, Prisma create/update will reject unknown fields or ignore them; risk of inconsistency if some code paths still send them. | Remove the 12 from create and update mutation payloads in the same change that removes the columns. Form must not send them (labels only, no form state for persist). |
| **Analyzers or validation expect `article.inLanguage` etc.** | Word count, SEO guidance, or validation may crash or give wrong results. | Pass Settings-derived values (or merged defaults) into analyzers and validators so they never read the 12 from Article. |
| **Public modonty page or sitemap reads `article.*`** | Public sitemap or article page could error or show wrong meta/license. | Modonty sitemap and article page must resolve the 12 from Settings (e.g. load Settings once and use for all articles or per-request). |

---

## 10. Touchpoints that must be updated (no missed reads/writes)

All of the following must be updated so that **no code reads the 12 from Article** and **no code writes the 12 to Article** after the schema change. Missing any of these can cause **crash, broken UI, or wrong output**.

- **Admin article**
  - New/edit page: load Settings; pass defaults into form.
  - Form context/store: accept Settings defaults; do not allow editing the 12 (labels only).
  - Transform (article → form data): do not read the 12 from article; use Settings defaults.
  - Create article mutation: do not persist the 12.
  - Update article mutation: do not read or persist the 12.
  - getArticleById / get-articles: remove the 12 from Article select (or rely on merged model).
  - Article view ([id]) page: load Settings; merge into view model.
  - Article view components (article-view-info, article-view-seo, article-view-social, article-view-header, article-view-content, article-view-taxonomy): receive the 12 from merged model (Settings), not from article.
  - Preview (meta-information-section, metatag-preview-step, technical-seo-preview): use Settings (or form display values from Settings).
  - Field metadata / step validation: remove or relax the 12 from article-based validation; use Settings for display.
  - Content stats / word count (content-section, article-form-sidebar, use-content-stats, content-stats): inLanguage from Settings.
  - Analyzers (normalize-input, analyze-technical, analyze-meta-tags, analyze-content-quality): receive the 12 from Settings or merged input.
  - Article SEO config / knowledge graph / structured data helpers: receive the 12 from Settings when building JSON-LD or meta.
- **Admin lib (SEO)**
  - metadata-generator, metadata-storage, structured-data, knowledge-graph-generator, sitemap-generator, custom-validation-rules: use Settings for the 12 (and for locale/robots/twitter/sitemap/license/inLanguage/isAccessibleForFree/contentFormat as applicable).
- **Modonty (public)**
  - Article page [slug]: license and any other of the 12 from Settings.
  - Sitemap: sitemap priority and change frequency from Settings.
  - lib/seo (article meta/JSON-LD): inLanguage, license, isAccessibleForFree from Settings.
- **Console**
  - Article preview client: inLanguage, contentFormat, metaRobots, ogType, twitterCard, twitterSite, twitterCreator, sitemapPriority, sitemapChangeFreq from Settings (or API that merges Settings into article).
- **Modonty setting helpers**
  - build-home-jsonld-from-settings, build-trending-page-jsonld: if they use article.inLanguage, switch to Settings.

---

## 11. Functionality preserved (same behavior for users)

After implementation, the following must behave the same from the user’s perspective:

- **Create article:** User can create an article; all required fields and optional fields (except the 12) work as today. Technical defaults (language, meta robots, license, sitemap, etc.) apply from Settings and are visible as labels only.
- **Edit article:** User can edit an article; changes to title, content, SEO title/description, canonical, media, tags, FAQs, etc. save correctly. The 12 technical values are shown as read-only labels from Settings and are not editable on the article.
- **View article:** User sees the same technical information (language, meta robots, license, sitemap, Twitter/OG defaults, etc.) as today; values come from Settings and match what is used in sitemap/meta/JSON-LD.
- **Publish article:** Publishing works as today; meta, JSON-LD, and sitemap use Settings for the 12.
- **Public article page:** Correct meta tags, JSON-LD, and license/accessibility info; all from Settings.
- **Sitemap:** Correct priority and change frequency for articles; from Settings.
- **Article preview (admin):** Preview shows the same technical defaults; from Settings.
- **Word count / content stats:** Word count and reading time use language from Settings for calculation; no regression.
- **SEO guidance / analyzers:** Guidance and validation use Settings for meta robots, sitemap, language, etc.; no crash and same or better accuracy.
- **Settings UI:** Admins can still edit all site and article defaults (including the 12) in Settings; changes apply to all articles and outputs after refresh or next load.

---

## 12. Pre-implementation and go-live order

1. **Settings API:** Ensure Settings table and API expose all 12 values (including `defaultIsAccessibleForFree`, `defaultAlternateLanguages`, `defaultContentFormat`). Add to getAllSettings return and types if missing.
2. **Code first (recommended):** Update all touchpoints in Section 10 to read the 12 from Settings (or merged model) and to stop writing the 12 to Article. Keep Article schema unchanged initially so existing data still exists; use feature flag or branch if needed.
3. **Schema migration:** Remove the 12 columns from Article only after all code paths are updated and tested. Run migration.
4. **Verification:** Re-test create, edit, view, publish, sitemap, public article page, preview, and analyzers. Confirm no errors, no broken UI, and labels/values match Settings.

**Do not:** Remove Article columns before every consumer is updated; that will cause Prisma errors and broken UI.

---

## 13. Final check confirmation (100% smooth)

**Confirmed:**

- **PRD and inventory are aligned:** The 12 fields in Section 5 match [documents/article-settings-sot-inventory.md](documents/article-settings-sot-inventory.md). Remove from Article → Use from Settings is consistent.
- **Settings schema has all 12:** Prisma Settings model already has `inLanguage`, `defaultMetaRobots`, `defaultOgType`, `defaultTwitterCard`, `twitterSite`, `twitterCreator`, `articleDefaultSitemapPriority`, `articleDefaultSitemapChangeFreq`, `defaultLicense`, `defaultIsAccessibleForFree`, `defaultAlternateLanguages`, `defaultContentFormat`. No schema gap.
- **Every code touchpoint is listed:** All files that read or write the 12 (admin article form/view/mutations/queries/preview/analyzers, admin lib SEO, modonty, console, modonty setting helpers) are in Section 10. If you update every item in Section 10 and follow the order in Section 12, no read/write will be missed.
- **Risks have mitigations:** Section 9 covers crash, broken UI, wrong output, and Prisma errors; each has a clear mitigation.
- **Functionality preserved is explicit:** Section 11 lists what stays the same for users; no behavior change except “no input, labels only” for the 12.
- **Go-live order prevents schema-before-code:** Section 12: Settings API first → code updates → then schema migration → then verification. With test/fake data (see note at top), no migration of existing article rows is required.

**Condition for 100% smooth:**

1. **Settings API:** Expose all 12 in getAllSettings (or equivalent) and in TypeScript types. Add `defaultIsAccessibleForFree`, `defaultAlternateLanguages`, `defaultContentFormat` to the return object if they are not there yet.
2. **Code:** Update every touchpoint in Section 10 so that no code reads the 12 from Article and no code writes the 12 to Article. Use Settings (or a merged “article + Settings” model) everywhere the 12 are needed.
3. **Schema:** Remove the 12 columns from Article only after step 2 is done and tested.
4. **Verify:** Run through create article, edit article, view article, publish, sitemap, public article page, preview, and analyzers; confirm no errors and labels/values match Settings.

If these four steps are followed in order, **everything will go smooth**: no runtime errors, no broken UI, and all functionality preserved except that the 12 are labels-only and sourced from Settings.

---

## 14. References

- **Inventory (field mapping):** [documents/article-settings-sot-inventory.md](documents/article-settings-sot-inventory.md)
- **Schema:** Article table (`articles`); Settings table (`settings`).

---

*This PRD describes product requirements only. Implementation details and code changes are covered in a separate technical plan. Sections 9–12 ensure no errors, no crash, and no broken UI when implementing this change.*
