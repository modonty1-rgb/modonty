# Clients Section — Complete TODO

> Last Updated: 2026-04-05
> Organized by priority. Completed tasks at bottom.

---

## CRITICAL — Must Fix Before Next Push

---

## HIGH — Fix This Sprint

### UI/UX

---

## MEDIUM — Improve Quality

_(All completed — see bottom)_

---

## LOW — Nice to Have

_(All completed or skipped — see bottom)_

---

## Completed

- [x] **C1: Add auth check to ALL mutation actions**
  - Added `auth()` + "غير مصرح" to `create-client.ts`, `update-client.ts`, `delete-client.ts`

- [x] **C2: Add Zod validation to ALL mutation actions**
  - Created `client-server-schema.ts`, added `safeParse()` to create + update

- [x] **C3: Validate slug uniqueness before create/update**
  - Added `findUnique` check in create + update (excludes current client)

- [x] **C4: Remove bulk delete**
  - Deleted `bulk-delete-clients.ts`, `bulk-actions-toolbar.tsx`, removed export

- [x] **C5: Fix Tax ID assignment bug** — Fixed in ALL 4 files (found 4th: `map-initial-data-to-form-data.ts`)

- [x] **C6: Fix JSON-LD bare `id`/`type` keys** — Root cause: `jsonld.compact()` strips `@` prefix.
  - Fixed: `jsonld-processor.ts` — restore `@id`/`@type` after compact
  - Removed: `sanitizeJsonLd()` hack from `modonty/app/clients/[slug]/page.tsx`

- [x] **C7: Add cascade — client update → article JSON-LD regeneration**
  - Added: `batchRegenerateJsonLd()` for all client articles after `generateClientSEO()`
  - Added: `revalidateModontyTag("articles")` for frontend cache — SEO Gap #3 closed

- [x] **C8: Remove hidden dead sidebar in client-form.tsx** — Deleted 28 lines of hidden div

- [x] **C9: Remove empty placeholder components** — Deleted 4 files:
  - `additional-section.tsx`, `classification-section.tsx`, `contact-section.tsx`, `form-stepper.tsx`

- [x] **C10: Remove unreachable code in get-client-articles.ts** — Merged duplicate return paths into single clean flow

- [x] **H1: ~~Add `@id` to Logo ImageObject~~** — SKIPPED after Google docs verification. Not in any official example. Zero SEO benefit.

- [x] **H2: ~~Fix `companyRegistration` not included~~** — FALSE POSITIVE. Field IS added to organizationNode and pushed to graph. No fix needed.

- [x] **H3: Fix primaryImageOfPage** — Removed logo fallback, removed fabricated dimensions. Only uses OG image with real dimensions.

- [x] **H4: Remove console.log debug statements** — Removed 3 emoji debug logs from `jsonld-validator.ts`. Kept only catch-block error logs.

- [x] **H5: Remove unused `richResults` field** — Grepped codebase: never accessed. Removed from `ValidationReport` interface and `client-tabs.tsx`.

- [x] **H6: Add `alternates.languages` from `knowsLanguage`** — Maps Arabic→ar-SA, English→en. Added to MetaTagsObject and metadata generation.

- [x] **H7: Fix `any` types in 8 files** — Replaced all `any` with proper types: `Record<string, unknown>`, `Prisma.InputJsonValue`, `Prisma.ClientCreateInput`, `UseFormReturn`, parameter inference types.

- [x] **H8: Fix 36 form.watch() calls** — Replaced with single `form.watch()` + `seoFieldsKey` memo. Only recomputes when SEO-relevant fields change.

- [x] **H9: Move article count filtering to DB** — Pre-query with `db.article.groupBy` to get matching clientIds, then filter in main query.

- [x] **H10: Fix O(n) stats error handler** — Replaced individual-fetch loop with single fallback query excluding problematic date fields.

- [x] **H11: Memoize table validation** — Pre-computed `clientComputedMap` via useMemo before render loop. Map lookup instead of per-row recalculation.

- [x] **H12: Reduce over-fetching** — Removed `jsonLdStructuredData` from list query select. Updated table to use `jsonLdValidationReport` only.

- [x] **M1: Replace technical jargon with business language** — Fixed: "SEO غير مكتمل"→"بيانات البحث غير مكتملة", "Setup SEO"→"إعداد بيانات البحث", "Regenerate"→"تحديث", "SEO Health"→"صحة البحث", toast titles to Arabic.

- [x] **M2: Add error.tsx for clients route** — Created with Arabic messages, matches existing pattern.

- [x] **M3: Handle partial update failures** — Returns `warning` field on partial success instead of full error. Only fails if ALL groups fail.

- [x] **M4: Show user feedback when SEO fails** — Added `warning` field to create + update responses when SEO generation fails.

- [x] **M5: Fix delete button race condition** — Added `useRef` guard to prevent concurrent calls.

- [x] **M6: Validate relationship IDs** — Added `findUnique` checks for industry, parentOrganization, subscriptionTierConfig before `connect`.

- [x] **M7: Fix VAT ID regex** — Changed `replace(/\s/g, "")` to `replace(/\D/g, "")` to strip all non-digits.

- [x] **M8: Fix numberOfEmployees parsing** — Added "100+" format, comma stripping, text removal.

- [x] **M9: Fix meta title truncation** — Now finds last space before limit, avoids mid-word cuts.

- [x] **M10: Validate min < max** — Added swap `[min, max] = [max, min]` when reversed.

- [x] **M11: View tracking deduplication** — 30-minute window, checks same user/session before creating record.

- [x] **M12: Follow button race condition** — Added `useRef` isPending guard.

- [x] **M13: Add caching to frontend queries** — Added `"use cache"` + `cacheTag("clients")` + `cacheLife("hours")` to client-stats.ts and client-followers.ts. Also fixed waterfall with Promise.all.

- [x] **M14: Featured clients carousel** — Replaced CSS backgroundImage with next/image `Image` component.

- [x] **M15: Remove console logs** — Removed from 6 files (redundant catch blocks). Kept in 7 files (only error signal).

- [x] **M16: useImperativeHandle** — SKIPPED: too invasive, needs UI redesign of header context.

- [x] **M17: Fix useEffect deps** — Added `useRef` for initialData to avoid missing dependency without infinite loops.

- [x] **H15: Extract duplicate code** — Created `client-display-utils.ts` (tier name, days remaining, delivery rate) + `use-media-preview.ts` hook. Updated 9 files.

- [x] **H13: Redesign client detail page** — Replaced sidebar+inline with shadcn Tabs (نظرة عامة, التفاصيل, المحتوى). All labels Arabic.

- [x] **H14: Media gallery pagination** — Shows 24 items + "عرض المزيد" loads more. No rendering all at once.

- [x] **L1: ARIA labels** — Added to delete button, table action icons, pagination buttons
- [x] **L2: Keyboard navigation** — SKIPPED (too invasive)
- [x] **L3: aria-busy on skeletons** — Added role="status", aria-busy, aria-label
- [x] **L4: Consolidate revalidation** — SKIPPED (architectural decision)
- [x] **L5: Loading skeleton mismatch** — Fixed padding classes to match page.tsx
- [x] **L6: Unused props** — Removed clientCount, description from clients-page-client.tsx
- [x] **L7: Sort comparison** — Added 'ar' locale to localeCompare
- [x] **L8: Hardcoded regions** — SKIPPED (needs shared constants design)
- [x] **L9: Ajv verbose** — Removed invalid `verbose: true` option
- [x] **L10: Session ID** — Replaced Math.random() with crypto.randomUUID()
- [x] **L11: Suspense boundaries** — Split stats and table into separate async components with Suspense
- [x] **L12: Pagination** — SKIPPED (too large for LOW)
- [x] **L13: Unsaved changes confirm** — SKIPPED (needs router interception)
- [x] **L14: Auto-regeneration stale SEO** — SKIPPED (needs cron system)
- [x] **L15: Expose all 6 filters** — Added date range + article count filters in Arabic
