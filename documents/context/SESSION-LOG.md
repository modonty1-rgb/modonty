# Session Context — Last Updated: 2026-04-27 (Session 70 — Console copy + responsive overhaul ✅ ready to push)

> This file is the handoff document for the next agent/session.
> Read this FIRST before starting any work.
> Update this file BEFORE every push.

---

## Current Versions
- **admin**: v0.43.2 ⏳ (ready to push — slug regex accepts Arabic)
- **modonty**: v1.42.0 ✅ (pushed 2026-04-26 · commit `8a6b59c`)
- **console**: v0.3.0 ⏳ (ready to push — full copy + responsive overhaul)

---

## ⏳ Session 70 — READY TO PUSH 2026-04-27 (console v0.3.0 + admin v0.43.2)

### Summary
Massive console session focused on the client portal app. Two phases:
- **Phase 1 — Copy/Plain-language overhaul:** 28 COPY items + 2 visual jargon fixes + 7 bonus dashboard fixes. Replaced JSON-LD/Schema/UTM/GTM/Staging/LCP/CLS/INP/TTFB/TBT/Organic English/jargon with plain Arabic descriptive labels. Verified across 17 pages with regex sweep.
- **Phase 2 — Responsive overhaul:** Header redesign for mobile (no wordmark cropping), profile form 2-column on desktop (was 1-col wasting space), media filter wrap, top-articles chart rebuilt (recharts → Arabic-friendly progress list), URL inputs `dir="ltr"`, action buttons 40px + aria-labels, table filter wraps, HelpCollapsible touch target fix, and **layout overhaul to eliminate nested scrollbars** (removed `h-screen overflow-hidden` + main `flex-1 overflow-y-auto` → page now scrolls naturally with one scrollbar).

### Key user calls during the session
- "خلي الـ console يشتغل على الـ production" → switched `console/.env.local` to PROD DB to match admin (TEMPORARY for session)
- Discovered admin's `client-server-schema.ts` slug regex blocked Arabic slugs → fixed regex to accept `\u0600-\u06FF` (Arabic block) + `a-z0-9_-`
- "أعمل كل الإصلاحات" → executed full responsive overhaul in one pass

### Files changed
**console (12 files modified + 1 new):**
- `lib/ar.ts` (~700 lines rewrite)
- `app/(dashboard)/components/dashboard-header.tsx` (mobile redesign + parent path navTitle)
- `app/(dashboard)/components/dashboard-layout-client.tsx` (removed nested scrollbars)
- `app/(dashboard)/dashboard/page.tsx` (Arabic subLines)
- `app/(dashboard)/dashboard/components/{traffic-chart,top-articles-chart}.tsx` (Arabic source labels + chart rebuild)
- `app/(dashboard)/dashboard/analytics/page.tsx` (sourceLabel + ctaType mappers)
- `app/(dashboard)/dashboard/content/page.tsx` (Arabic status + dates)
- `app/(dashboard)/dashboard/profile/components/profile-form.tsx` (`lg:grid-cols-2` + `dir="ltr"`)
- `app/(dashboard)/dashboard/media/components/{media-gallery,branding-media-section}.tsx` (Arabic + flex-wrap filters)
- `app/(dashboard)/dashboard/comments/components/comments-table.tsx` (h-10 + aria-label)
- `app/(dashboard)/dashboard/{questions,leads,subscribers,support}/...` (flex-wrap filters + table responsive)
- `app/(dashboard)/dashboard/seo/{competitors,keywords}/page.tsx` + `seo/components/{intake-tab,intake-field}.tsx` (Arabic descriptions + collapsible touch target)
- `app/(dashboard)/dashboard/settings/page.tsx` (Arabic subscription badges)
- `app/(dashboard)/dashboard/articles/[articleId]/error.tsx` (humane Arabic)
- `app/icon.svg` (NEW — favicon fix)
- `package.json` 0.2.0 → 0.3.0

**admin (1 file modified):**
- `app/(dashboard)/clients/actions/clients-actions/client-server-schema.ts` — slug regex accepts Arabic
- `package.json` 0.43.1 → 0.43.2

### Verification
- ✅ TSC clean on console / admin / modonty
- ✅ 17/17 pages × 3 viewports (375 / 768 / 1366) = 0 overflow, 0 small buttons, 0 nested scroll
- ✅ Live test: kimazone client login + navigation through 17 pages on PROD DB
- ✅ Backup: `backup-2026-04-27_15-37` (62 collections, 2.5M)

### Pending issues
1. **`admin/.env.local` and `console/.env.local` both point to PROD** — need to revert to `modonty_dev` after push completes (TEMPORARY warnings present in both files).
2. CTA event labels stored in DB ("Feed card – عنوان المقال", "Tab – الكل", etc.) — come from modonty.com tracking code, not console. Future task: localize tracking labels in modonty public site.
3. CONS-VIS-003 mixed numerals (Latin + Arabic) — out of scope.
4. CONS-001/002/003/004 HIGH security items still pending (compliance check, RLS, admin notifications, dev button hide).

### Next agent: BEFORE next push
- Revert env.local files to dev DB once console session is complete.
- Address HIGH security items (CONS-001..004) — see `documents/tasks/CONSOLE-TODO.md`.

---

## ✅ Session 69 — PUSHED 2026-04-26 (modonty v1.42.0 + admin v0.43.1)

### Summary
Massive search-console session. Two pushes to main:
- `dd99016` — admin v0.43.0: Removal Queue + Stage 14 with 3-state manual GSC tracking
- `8a6b59c` — modonty v1.42.0 + admin v0.43.1: 410 for non-published slugs + Tech Health drill-down

### Key findings (verified from official Google docs, 6 sources)
- **Indexing API exists** (`urlNotifications:publish` for URL_UPDATED + URL_DELETED) but is restricted to JobPosting + BroadcastEvent. Submissions for modonty articles are silently rejected (publish returns 200 with empty metadata; getMetadata returns 404 — per Google docs, this means submission was NOT accepted).
- **No public API** for GSC Removals tool or Request-Indexing button. Both are manual web UI only. Confirmed from Search Console API v1 reference + Discovery doc.
- **Browser automation blocked**: Google blocks Playwright + Chrome with `--remote-debugging-port` from signing in (anti-bot). Browserbase MCP didn't help in time-vs-value calculation.
- **Conclusion**: manual GSC flow is the right path. 3-state UI (pending → opened → done) tracks the user's intent in our DB.

### Files changed (Session 69 — both commits)
**admin (v0.43.0 → v0.43.1):**
- `app/(dashboard)/search-console/page.tsx` — Removal Queue with track states + Tech Health drill-down stats
- `app/(dashboard)/search-console/components/seo-row-action.tsx` — unified 3-state component for delete + index
- `app/(dashboard)/search-console/components/tech-health-dialog.tsx` (new) — drill-down for Canonical/Robots/Mobile/Soft 404
- `app/(dashboard)/search-console/components/tech-health-stat.tsx` (new) — clickable stat trigger
- `app/(dashboard)/search-console/actions/removal-tracking-actions.ts` (new) — server actions for GscManualRequest CRUD
- `app/(dashboard)/search-console/pipeline/[articleId]/page.tsx` (new) + `pipeline-runner.tsx` (new) — 13-stage indexing pipeline + Stage 14 manual GSC button
- `app/(dashboard)/search-console/components/{auto-fix-schema-button,pending-indexing-card,robots-audit-dialog,robots-txt-dialog,schema-validation-dialog,stage-details-dialog,view-schema-validation-button}.tsx` (new helpers)
- `lib/seo/{article-validator,crux,pagespeed,pipeline-stages}.ts` (new) — pipeline backend
- `lib/gsc/indexing.ts` — added `URL_DELETED` (was wrongly `URL_REMOVED`) + getMetadata helpers
- `app/(dashboard)/search-console/actions/pipeline-actions.ts` (new) — pipeline runner
- `scripts/{check-live-urls,check-removal-status,debug-*,test-*,verify-removal-queue-state}.ts` — debug scripts (kept for future investigations)
- `package.json` 0.42.0 → 0.43.0 → 0.43.1
- `scripts/add-changelog.ts` — v0.43.0 + v1.42.0 entries

**modonty (v1.41.1 → v1.42.0):**
- `proxy.ts` — now returns 410 for ANY non-PUBLISHED slug (was: only ARCHIVED)
- `lib/archive-cache.ts` — flipped to "published-slugs" set (the inverse of the old "archived-slugs")
- `package.json` 1.41.1 → 1.42.0

**dataLayer:**
- `prisma/schema/schema.prisma` — renamed `GscRemovalRequest` → `GscManualRequest` with new `type` field (REMOVAL | INDEXING) + compound unique on (url, type). Kept `@@map("gsc_removal_requests")` to preserve existing collection.

**root:**
- `.mcp.json` — added `chrome-devtools` + `browserbase` MCPs (kept for non-Google sites)
- `.claude/settings.json` — added permissions for the new bash commands tested

### What's working in production
- ✅ admin Removal Queue + Stage 14 (3-state, opens GSC + clipboard, tracks done in DB)
- ✅ admin Tech Health drill-down (clickable Canonical/Robots/Mobile/Soft 404)
- ✅ modonty 410 for non-published slugs (Google de-indexes faster than noindex)

### What's pending / known issues
1. **Vercel env var `GSC_MODONTY_KEY_BASE64`** missing in production — `Failed to load sitemaps` toast on `/search-console`. User-side fix in Vercel Dashboard → Settings → Environment Variables.
2. **Canonical bug revealed by drill-down**: site declares `https://modonty.com/...` but Google chose `https://www.modonty.com/...`. Decide on www-vs-non-www and unify the canonical generator.
3. **Double-encoded canonical for clients**: `%25D8%25...` instead of `%D8%...`. Bug in client-page canonical generation.
4. **API keys exposed in chat logs** (BROWSERBASE_API_KEY + GEMINI_API_KEY) — user should rotate from respective dashboards. Removed from `.claude/settings.json` before commit, but env vars still set in Windows.

### Memory rule added (mandatory for next agent)
- `feedback_verify_before_claiming.md`: never claim how an external API behaves until tested live; never assume a file is deployed without checking `git status` / `git ls-files`; never extrapolate "all of X are Y" from a single sample. Confident-wrong answers destroy trust.

### Tooling state
- 6 MCPs project-level configured: `playwright`, `context7`, `gsc`, `code-review-graph`, `chrome-devtools`, `browserbase`.
- Chrome with `--remote-debugging-port=9222` running with isolated profile at `C:/Users/w2nad/chrome-mcp-profile` — only useful for non-Google sites.

---

## ✅ Session 66 — PUSHED 2026-04-24 (Changelog filter fix — admin v0.42.0)

### Summary
Two fixes to changelog page:
1. Filter now hides non-matching items WITHIN each card (not just the cards themselves)
2. Added "Hard Refresh" button (top-right) that calls `router.refresh()` with spin animation

### Files changed (Session 66)
**admin:**
- `app/(dashboard)/changelog/changelog-client.tsx` — filter prop on ChangelogCard + Hard Refresh button
- `scripts/changelog-sync.ts` — added v0.42.0 entry
- `package.json` — version bump 0.41.1 → 0.42.0

---

## ✅ Session 65 — PUSHED 2026-04-24 (Changelog system overhaul — admin v0.41.1)

### Summary
Complete overhaul of the changelog system — scripts, data, and UI.

**Root bug found & fixed:** pnpm auto-loads `.env` before scripts run, so `dotenv.config()` was silently ignored (DATABASE_URL already set to production). Fix: `{ override: true }` in all `dotenv.config()` calls. Scripts were writing to production instead of local all along.

**What changed:**
- `changelog-sync.ts` — unified SOT script derived from git log with real release dates
  - `--reset` flag: clears DB and re-inserts with correct dates
  - Default (no flag): writes to BOTH local + production simultaneously
  - `--local` / `--prod` for single-target
- Both DBs reset and re-seeded with 41 clean entries, correct dates from git log
- `changelog-client.tsx` — enhanced UI: stats bar, type filter, current version badge
- `actions.ts` — semantic version sort (not createdAt) so order is always correct
- `page.tsx` — added `force-dynamic`

**New script commands:**
```
pnpm changelog:sync              → sync missing to BOTH DBs (use every push)
pnpm changelog:sync:local/prod   → single target
pnpm changelog:reset             → clear + re-insert BOTH DBs
pnpm changelog:reset:local/prod  → single target reset
```

**Workflow from now on:** When pushing a new version, add its entry to the CHANGELOG array in `changelog-sync.ts`, then run `pnpm changelog:sync`.

### Files changed (Session 65)
**admin:**
- `scripts/changelog-sync.ts` (NEW — unified SOT script)
- `scripts/changelog-local.ts` (NEW — legacy single-target, kept for reference)
- `scripts/changelog-prod.ts` (NEW — legacy single-target, kept for reference)
- `app/(dashboard)/changelog/actions.ts` — semantic sort + noStore
- `app/(dashboard)/changelog/changelog-client.tsx` — stats bar + filter + current badge
- `app/(dashboard)/changelog/page.tsx` — force-dynamic
- `package.json` — new changelog:sync/reset scripts

### Notes for next agent
- **DB state**: Both `modonty_dev` and `modonty` have 41 clean entries, correct dates ✅
- **Next push workflow**: Add new entry to CHANGELOG array in `scripts/changelog-sync.ts`, then `pnpm changelog:sync`
- **pnpm env bug**: pnpm auto-loads `.env` before scripts — always use `{ override: true }` in `dotenv.config()` for scripts that need `.env.local`
- **Next task**: "Important real-world task outside admin" — user will specify at start of next session

---

## ✅ Session 64 — PUSHED 2026-04-24 (Global Error Logging — admin v0.41.0)

### Summary
Built a fully internal error logging system for the admin app — no external services (no Sentry/Datadog). Every server-side error (Server Components, Server Actions, Route Handlers, Middleware) is now automatically captured and stored in MongoDB, visible under **System → Error Logs**.

**Key pieces:**
- `instrumentation.ts` — Next.js `onRequestError` hook captures all server errors and POSTs to internal API
- `app/api/internal/log-error/route.ts` — protected internal endpoint (INTERNAL_LOG_SECRET header)
- `SystemError` model in Prisma schema (new `system_errors` collection)
- `app/(dashboard)/system-errors/` — new page with table, delete per-item, clear all
- All `error.tsx` files updated to use shared `PageError` component showing error message + digest with link to Error Logs
- Sidebar: "Error Logs" added under System

**Env var added to Vercel:**
- `INTERNAL_LOG_SECRET` — required for the instrumentation → API route auth

### Files changed (Session 64)
**admin:**
- `instrumentation.ts` (NEW)
- `app/api/internal/log-error/route.ts` (NEW)
- `app/(dashboard)/system-errors/page.tsx` (NEW)
- `app/(dashboard)/system-errors/loading.tsx` (NEW)
- `app/(dashboard)/system-errors/actions/system-errors-actions.ts` (NEW)
- `app/(dashboard)/system-errors/components/system-errors-table.tsx` (NEW)
- `components/admin/page-error.tsx` (NEW)
- `components/admin/sidebar.tsx` — added Error Logs link
- `components/admin/breadcrumb-utils.ts` — added 'system-errors' label
- `app/(dashboard)/articles/error.tsx` — uses PageError
- `app/(dashboard)/categories/error.tsx` — uses PageError
- `app/(dashboard)/clients/error.tsx` — uses PageError
- `app/(dashboard)/database/error.tsx` — uses PageError
- `app/(dashboard)/export-data/error.tsx` — uses PageError
- `app/(dashboard)/industries/error.tsx` — uses PageError
- `app/(dashboard)/tags/error.tsx` — uses PageError

**dataLayer:**
- `prisma/schema/schema.prisma` — added SystemError model

### Notes for next agent
- Error logging fully verified in production ✅
- Telegram OTP for slug change: was broken (missing TELEGRAM_BOT_TOKEN + TELEGRAM_ADMIN_CHAT_ID on Vercel) → now fixed
- Vercel env vars confirmed set: INTERNAL_LOG_SECRET, TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID

---

## ✅ Session 63 — PUSHED 2026-04-21 (PERF-008 + PERF-003 + bundle analyzer cleanup)

### Summary
- **PERF-008**: Deferred `ArticleSidebarEngagement` to `ssr: false`
- **PERF-003**: Bundle analyzer investigation — Won't Fix (framework limitation)
- **Bundle analyzer cleanup**: Removed `@next/bundle-analyzer` wrapper from `next.config.ts`

### Files changed (Session 63)
**modonty:**
- `app/articles/[slug]/components/client-lazy.tsx`
- `app/articles/[slug]/page.tsx`
- `app/articles/[slug]/components/article-interaction-buttons.tsx`
- `next.config.ts`
