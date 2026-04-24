# Session Context — Last Updated: 2026-04-24 (Session 66 — Changelog filter fix ✅)

> This file is the handoff document for the next agent/session.
> Read this FIRST before starting any work.
> Update this file BEFORE every push.

---

## Current Versions
- **admin**: v0.42.0 ✅ (pushed 2026-04-24)
- **modonty**: v1.41.1 ✅ (pushed 2026-04-21)
- **console**: v0.2.0 ✅ (pushed 2026-04-20)

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
