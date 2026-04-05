# Session Context — Last Updated: 2026-04-05 16:30

> This file is the handoff document for the next agent/session.
> Read this FIRST before starting any work.
> Update this file BEFORE every push.

---

## Current Versions
- **admin**: v0.11.0 (pushed)
- **modonty**: v1.17.0 (pushed)

## What Was Done This Session

### 1. Clients Section — Complete Overhaul (57 Issues Fixed)

**Security (C1-C4):**
- Auth check (`auth()`) added to all mutation actions (create, update, delete)
- Zod server-side validation added (`client-server-schema.ts` + `safeParse()`)
- Slug uniqueness validation on create + update
- Bulk delete removed entirely (action + component + export)

**Logic Bugs (C5-C7):**
- Tax ID assignment fixed in ALL 4 files (was copying VAT→Tax, now Tax takes priority)
- JSON-LD `@id`/`@type` fix — root cause in `jsonld-processor.ts` (jsonld.compact strips @ prefix). Fixed at source, removed `sanitizeJsonLd()` hack from frontend
- Client update now cascades to regenerate ALL article JSON-LD via `batchRegenerateJsonLd()`

**Dead Code (C8-C10):**
- Removed hidden dead sidebar from client-form.tsx (28 lines)
- Deleted 4 empty/unused components: additional-section, classification-section, contact-section, form-stepper
- Fixed unreachable code in get-client-articles.ts (merged duplicate return paths)

**SEO & JSON-LD (H1-H6):**
- H1: Logo @id — SKIPPED (verified from Google docs: not in any official example)
- H2: companyRegistration — FALSE POSITIVE (field IS included in output)
- H3: primaryImageOfPage — removed logo fallback, use real dimensions only
- H4: Removed 3 emoji debug console.logs from jsonld-validator.ts
- H5: Removed unused `richResults` field from ValidationReport interface
- H6: Added `alternates.languages` from `knowsLanguage` field (hreflang: ar-SA, en)

**TypeScript (H7):**
- Removed ALL `any` types across 8 files (create-client, generate-client-seo, client-seo-form, client-table, settings-section, client-form, build-client-seo-data, modonty client page)

**Performance (H8-H12):**
- H8: Replaced 36 individual form.watch() calls with single watch() + seoFieldsKey memo
- H9: Moved article count filtering from JS to DB (pre-query with groupBy)
- H10: Removed O(n) individual client queries, replaced with single fallback query
- H11: Pre-computed validation results in useMemo Map before render loop
- H12: Removed jsonLdStructuredData from list query (5-10KB per client saved)

**UI/UX (H13-H15):**
- H13: Replaced sidebar+inline-panel with shadcn Tabs (3 tabs: Overview, Details, Content)
- H14: Media gallery pagination (24 items + "Show more" button)
- H15: Extracted duplicate code into `client-display-utils.ts` (3 functions) + `use-media-preview.ts` hook. Updated 9 files.
- Fixed detail page padding/spacing (removed max-w-[1200px], added proper p-4 sm:p-6)

**Error Handling (M2-M5):**
- Created error.tsx for clients route
- Partial update failures return warning instead of full error
- SEO generation failures return warning field
- Delete button race condition fixed with useRef guard

**Validation (M6-M10):**
- Relationship IDs validated before connect (industry, parent org, subscription tier)
- VAT ID regex loosened (strips all non-digits before validation)
- numberOfEmployees parsing: supports "100+", "1,000-5,000", "50-99 employees"
- Meta title truncation at word boundary
- min/max swap for employee count range

**Frontend Fixes (M11-M14):**
- View tracking deduplication (30-min window)
- Follow button race condition (useRef isPending)
- Added caching to client-stats.ts and client-followers.ts
- Featured clients carousel: CSS background → next/image

**Code Quality (M15-M17, L1-L15):**
- Removed redundant console.logs from 6 mutation files
- Fixed useEffect missing dependencies with useRef pattern
- Added ARIA labels to delete button, table actions, pagination
- Added aria-busy to loading skeletons
- Fixed loading skeleton layout mismatch
- Removed unused props from clients-page-client.tsx
- Fixed sort comparison with 'ar' locale
- Removed invalid Ajv verbose option
- Session ID generation: Math.random() → crypto.randomUUID()
- Added Suspense boundaries (stats + table stream independently)
- Exposed all 6 filters in UI

### 2. SEO Reference Document Created

- `documents/MODONTY-RULE/SEO-REFERENCE.md` — Master reference with 49 verified sources
- Tier 1: Google Search Central, Schema.org, OpenGraph, Twitter Cards
- Tier 2: SEMrush, Ahrefs, Moz (industry tools)
- Tier 3: Search Engine Journal, Search Engine Land
- Golden rule saved in memory: zero guessing on SEO/JSON-LD changes

### 3. Master TODO Created

- `documents/tasks/MASTER-TODO.md` — Single source of truth for all pending tasks
- Cross-app issues: slug validation (X1-X4), bulk delete audit (X5-X8), auth checks (X9-X13), Zod validation (X14-X17)
- X18-X24: Revert Arabic UI labels back to English (admin console is English-first)

### 4. Key Rules Established

- **SEO Golden Rule**: Any JSON-LD/metadata change must be verified from official sources. Zero guessing.
- **Admin Language**: UI labels/headings/buttons in ENGLISH. Only data content is Arabic.
- **Slug Validation**: Every entity with slug must validate uniqueness before save.
- **Auth on Actions**: Every mutation server action must have auth() check.
- **TSC Strategy**: Skip during simple edits, required after agent merges and before push.

---

## Known Issues (from MASTER-TODO.md)

### Must Do Next
1. **X18-X24: Revert Arabic labels to English** — client-tabs.tsx, clients-stats.tsx, seo-tab.tsx, [id]/page.tsx, client-form.tsx, clients-filters.tsx were incorrectly translated to Arabic
2. Cross-app slug validation (X1-X4): articles, categories, tags, industries
3. Cross-app auth checks (X9-X13): all entity mutations
4. Cross-app Zod validation (X14-X17): all entity mutations
5. Cross-app bulk delete audit (X5-X8): remove if exists

### SEO Gaps (from SEO-CACHE-STANDARD.md)
- Gap #3 CLOSED (client → article cascade)
- Remaining gaps: 1,2,4-11

---

## Files Changed (this push)

### Admin — Actions
- `clients/actions/clients-actions/create-client.ts` — auth, Zod, slug check, types fixed
- `clients/actions/clients-actions/update-client.ts` — auth, Zod, cascade, partial warnings
- `clients/actions/clients-actions/delete-client.ts` — auth added
- `clients/actions/clients-actions/update-client-grouped.ts` — tax ID fix, console.logs removed
- `clients/actions/clients-actions/get-clients.ts` — article count filter to DB, over-fetch reduced
- `clients/actions/clients-actions/get-clients-stats.ts` — O(n) fallback fixed
- `clients/actions/clients-actions/get-client-articles.ts` — unreachable code fixed
- `clients/actions/clients-actions/index.ts` — bulk delete export removed
- `clients/actions/clients-actions/types.ts` — jsonLdStructuredData removed from list type
- `clients/actions/clients-actions/client-server-schema.ts` — NEW: Zod server schema
- `clients/actions/clients-actions/generate-client-seo.ts` — alternates.languages, types fixed, title truncation

### Admin — Components
- `clients/components/client-form.tsx` — single watch(), dead sidebar removed
- `clients/components/client-table.tsx` — memoized validation, types fixed, ARIA
- `clients/components/client-seo-form.tsx` — types fixed
- `clients/components/clients-page-client.tsx` — unused props removed
- `clients/components/clients-stats.tsx` — label changes
- `clients/components/clients-filters.tsx` — all 6 filters exposed
- `clients/components/form-sections/settings-section.tsx` — types fixed
- `clients/components/form-sections/media-section.tsx` — useRef for deps
- `clients/[id]/components/client-tabs.tsx` — sidebar→tabs redesign
- `clients/[id]/components/client-header.tsx` — spacing fix
- `clients/[id]/components/tabs/media-social-tab.tsx` — pagination
- `clients/[id]/components/tabs/seo-tab.tsx` — label changes
- `clients/[id]/components/delete-client-button.tsx` — race condition fix
- `clients/[id]/page.tsx` — spacing, SEO banner text
- `clients/page.tsx` — Suspense boundaries
- `clients/loading.tsx` — aria-busy, layout match
- `clients/error.tsx` — NEW: error boundary

### Admin — Helpers
- `clients/helpers/client-display-utils.ts` — NEW: shared utility (tier name, days remaining, delivery rate)
- `clients/helpers/hooks/use-media-preview.ts` — NEW: shared media preview hook
- `clients/helpers/client-field-mapper.ts` — tax ID fix
- `clients/helpers/hooks/use-client-form.ts` — tax ID fix
- `clients/helpers/map-initial-data-to-form-data.ts` — tax ID fix
- `clients/helpers/build-client-seo-data.ts` — types fixed
- `clients/helpers/client-seo-config/client-jsonld-validator.ts` — Ajv verbose removed
- `clients/helpers/client-seo-config/validators-advanced.ts` — VAT regex fix

### Admin — Shared SEO
- `lib/seo/jsonld-processor.ts` — @id/@type restoration after compact
- `lib/seo/jsonld-validator.ts` — richResults removed, debug logs removed
- `lib/seo/generate-complete-organization-jsonld.ts` — primaryImageOfPage fix, employees parsing

### Admin — Deleted Files
- `clients/actions/clients-actions/bulk-delete-clients.ts`
- `clients/components/bulk-actions-toolbar.tsx`
- `clients/components/form-sections/additional-section.tsx`
- `clients/components/form-sections/classification-section.tsx`
- `clients/components/form-sections/contact-section.tsx`
- `clients/components/form-stepper.tsx`

### Modonty (Frontend)
- `app/clients/[slug]/page.tsx` — sanitizeJsonLd removed, types fixed
- `app/clients/[slug]/helpers/client-stats.ts` — caching added
- `app/clients/[slug]/helpers/client-followers.ts` — caching added
- `app/clients/[slug]/components/client-follow-button.tsx` — race condition fix
- `app/clients/components/featured-client-card.tsx` — CSS background → next/image
- `app/api/clients/[slug]/view/route.ts` — deduplication, crypto.randomUUID()
- `app/api/clients/[slug]/share/route.ts` — crypto.randomUUID()

### Documents
- `MODONTY-RULE/SEO-REFERENCE.md` — NEW: master SEO reference (49 sources)
- `tasks/MASTER-TODO.md` — rewritten as single source of truth
- `tasks/admin/CLIENTS-TODO.md` — 57 items tracked and completed
- `tasks/admin/CLIENTS-ARTICLES-STUDY.md` — deep analysis document
- `context/SESSION-LOG.md` — this file

---

## Next Steps

1. Revert Arabic UI labels to English (X18-X24)
2. Start Articles section (study done, TODO pending)
3. Cross-app fixes (slug, auth, Zod, bulk delete)
4. Categories + Tags + Industries
5. Remaining SEO gaps
