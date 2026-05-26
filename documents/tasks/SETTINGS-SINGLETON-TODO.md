# Settings Singleton — Race Condition Permanent Fix

> **Last Updated:** 2026-05-26 (post-stress-test fix)
> **Status:** DEV 100% VERIFIED · 40 parallel reqs → 1 doc · awaiting PROD migration strategy decision

## ⚡ CRITICAL DISCOVERY (post-cleanup stress test)

After the initial cleanup ran successfully, a stress test of 20 parallel requests created TWO new duplicate docs (`...fbdab1` + `...fbdab2`). Root cause was NOT the original race — it was a deeper BSON-level issue:

**The bug:** Prisma's `@default("global")` returns the default value on READ when the field is missing in BSON. So `cleanup` script reading `keeper.singletonKey` saw `"global"` and skipped the update. The field stayed MISSING in actual MongoDB BSON. Then `findUnique({where: {singletonKey: "global"}})` translated to MongoDB filter `{singletonKey: "global"}` which DIDN'T match Doc-1 (no field in BSON) → returned null → ensureSettingsId fell through to create branch → spawned a new doc on every cold-start.

**The fix (3 layers):**
1. **Raw MongoDB `$set`** on existing docs (Prisma update won't reliably write a value equal to schema default)
2. **Unique index applied at MongoDB level** via `prisma db push` (DEV) or manual `createIndex` (PROD)
3. **Delete-before-backfill ordering** so the unique constraint doesn't block migration

**Verification:** 40 parallel requests against admin/maintenance + admin/settings + modonty/ + console/dashboard → settings count stayed at 1 · BSON has singletonKey="global" field actually stored · direct insert attempts blocked by E11000.

---

## Problem

PROD `settings` collection had **2 docs** (singleton violation). ObjectIds `...746e` + `...746f` were created milliseconds apart → historical race condition during initial seeding. The risk: `findFirst()` without `orderBy` returns docs in non-deterministic order → admin saves to one doc, modonty/console may read from the other → data divergence.

**Root cause:** 6 code sites used non-atomic `findFirst → if null create` pattern. Two concurrent calls on empty DB both saw null → both created → 2 docs.

---

## Solution

**Schema-level lock + atomic upsert pattern across all 3 apps.**

- Added `singletonKey String @unique @default("global")` to `Settings` model
- New helper `lib/settings/settings-singleton.ts` in admin/modonty/console
- `ensureSettingsId()` (admin) — atomic resolve with legacy-doc migration fallback
- All reads now use `findUnique({where: SETTINGS_SINGLETON_WHERE})` (deterministic)
- All writes use `ensureSettingsId()` + `update` (race-safe)
- All "find or create" patterns replaced with `upsert({where: SETTINGS_SINGLETON_WHERE})`

---

## Checklist

### ✅ Code changes (this session — 2026-05-26)

- [x] Add `singletonKey String @unique @default("global")` to `Settings` model in `dataLayer/prisma/schema/schema.prisma`
- [x] Kill all node.exe processes + `pnpm prisma generate`
- [x] Create `admin/lib/settings/settings-singleton.ts` with `SETTINGS_SINGLETON_WHERE` + `ensureSettingsId()` (legacy-migration aware)
- [x] Create `modonty/lib/settings/settings-singleton.ts` (constant only — modonty does reads only)
- [x] Create `console/lib/settings/settings-singleton.ts` (constant only — console does reads only)
- [x] Refactor `admin/app/(dashboard)/settings/actions/settings-actions.ts`:
  - [x] `getAllSettings()` line 343 → uses `findUnique` + upsert fallback
  - [x] `ensureSettingsExists()` line 610 → now wraps shared `ensureSettingsId()`
  - [x] `updateAllSettings()` line 858 → uses `ensureSettingsId()`, removed else-create branch
- [x] Refactor `admin/lib/seo/site-url.ts` (2 `findFirst` → `findUnique`)
- [x] Refactor `admin/lib/seo/listing-page-seo-generator.ts` (2 `findFirst+update` → `ensureSettingsId+update`)
- [x] Refactor `admin/app/(dashboard)/settings/actions/seed-technical-defaults.ts` (`findFirst → create` → `ensureSettingsId`)
- [x] Refactor 8 modonty caller sites (all reads):
  - [x] `lib/settings/get-platform-social-links.ts`
  - [x] `lib/settings/get-feed-banner-settings.ts`
  - [x] `lib/seo/trending-page-seo.ts`
  - [x] `lib/seo/home-page-seo.ts`
  - [x] `lib/seo/get-article-defaults-from-settings.ts`
  - [x] `lib/seo/faq-page-seo.ts`
  - [x] `lib/seo/clients-page-seo.ts` (2 functions)
  - [x] `lib/seo/categories-page-seo.ts`
  - [x] `app/clients/[slug]/page.tsx`
- [x] Refactor 2 console caller sites:
  - [x] `app/(dashboard)/dashboard/content/page.tsx`
  - [x] `app/(dashboard)/dashboard/articles/page.tsx`
- [x] TSC clean: admin · modonty · console (all 3 = zero errors)
- [x] Write `admin/scripts/cleanup-settings-singleton.ts` (Prisma-based — works but doesn't force BSON field write — see backfill script below)
- [x] **POST-DISCOVERY:** Write `admin/scripts/backfill-singleton-key.ts` (raw MongoDB $set — forces field into BSON · deletes duplicates FIRST to avoid unique index blocking the backfill)
- [x] **DEV: `prisma db push` applied** — created `settings_singletonKey_key` unique index on MongoDB (also dropped 3 TTL indexes — see warning below)
- [x] **DEV: backfill ran** — Doc-1 now has singletonKey="global" stored in BSON · count=1
- [x] **DEV: 40-parallel-request stress test PASSED** — count stayed at 1 · direct insert attempts blocked by E11000
- [ ] **Deferred (non-blocking):** Refactor `admin/scripts/seed-settings-from-env.ts` + `fill-settings-seo-defaults.ts` + `seed-technical-defaults.ts`

### ⚠️ PROD MIGRATION — DO NOT use `prisma db push` on PROD

**Why:** `prisma db push` on DEV silently dropped 3 manually-created TTL indexes (Session.expires + VerificationToken.expires + one expiresAt). These auto-cleanup expired records. PROD likely has the same TTL indexes (created outside Prisma).

**Safe PROD migration sequence (manual, ~5 min):**

1. **Backup PROD DB** (`bash scripts/backup.sh`)
2. **Run backfill on PROD** with explicit URL:
   ```
   DATABASE_URL="mongodb+srv://...@modonty-cluster.../modonty" \
     pnpm tsx admin/scripts/backfill-singleton-key.ts
   ```
   This will: delete Doc-2 (`...746f` SEO-only) → backfill Doc-1 (`...746e`) singletonKey="global" via raw $set
3. **Create unique index manually in Atlas Shell:**
   ```js
   db.settings.createIndex({ singletonKey: 1 }, { unique: true, name: "settings_singletonKey_key" })
   ```
   Manual approach preserves the TTL indexes that `prisma db push` would drop.
4. **Verify final state on PROD:**
   ```
   DATABASE_URL="...prod..." pnpm tsx admin/scripts/debug-singleton-index.ts
   ```
   Expected: 1 doc · singletonKey="global" stored in BSON · settings_singletonKey_key unique=true · direct insert blocked by E11000
5. **THEN push v0.63.0** (admin version bump + backup + changelog + commit + push)
6. **Post-push live verification:** `https://admin.modonty.com/maintenance` → drift card green · `https://admin.modonty.com/settings` save works

### 📋 Live-test final checklist (DEV — all ✅)

**Infrastructure:**
- [x] cleanup script: count=1
- [x] prisma db push: unique index applied
- [x] backfill: BSON field stored (raw $set)
- [x] 3 dev servers boot clean

**Read-path correctness (the ORIGINAL bug was here):**
- [x] /maintenance: drift card GREEN — "DB + env match · https://www.modonty.com"
- [x] /settings: form loads with all data from Doc-1 (logo, OG, descriptions, social links all populated)
- [x] /settings/modonty: nested route loads cleanly
- [x] **modonty home canonical** = `https://www.modonty.com` (WITH www) ✅ — this is exactly the bug that broke Quality Check
- [x] **modonty article canonical + og:url** = `https://www.modonty.com/articles/...` (WITH www) ✅
- [x] console/dashboard/articles: auth-gate (expected)

**Write-path resilience:**
- [x] 40 parallel GET requests (admin/maint + admin/sett + modonty + console): count stays at 1
- [x] 60 parallel modonty reads (home + articles + categories + trending + clients + faq): count stays at 1
- [x] **Run All Auto-Maintenance: 10/10 steps complete in 21.4s, "0 tools need attention"** — heaviest settings-write workflow in the app:
  - JSON-LD Regeneration · Canonical URLs (7 tables) · Sitemap Refresh · Sessions/OTPs/Stale Versions/Cloudinary/Legal Forms/Soft-Deleted Comments — all touched Settings, all clean
  - TTL Indexes: **auto-fixed the 3 dropped by prisma db push** (Slug Change OTPs · Auth Sessions · Verification Tokens) — net zero side effect

**Direct DB enforcement:**
- [x] Direct insert attempt with singletonKey="global": **E11000 duplicate key error** (unique index actively blocks)
- [x] After 100+ requests + Auto-Maintenance run: still 1 doc, BSON field stored, index unique=true

**Verdict: 100% verified.** The race condition that was producing duplicate Settings docs is permanently closed. The original symptom (Quality Check failing because modonty read a different doc than admin saved → canonical without www) is gone — modonty and admin now read identical singleton.

---

### 🔧 JSON-LD Cache Integrity — host-mismatch detection added (2026-05-26 evening)

**Discovered during PROD investigation:** the `jsonld-integrity.ts` `detectStaleHosts()` function was only catching `BAD_HOST_PATTERNS` (localhost, vercel.app, http:// scheme). It did **NOT** detect www-vs-non-www host mismatches — so JSON-LD blobs stored before the v0.62.0 SITE URL refactor stayed un-flagged forever even though their cached `@id`/`url`/`mainEntityOfPage` URLs pointed to `https://modonty.com/...` (no www) while live meta canonical now emits `https://www.modonty.com/...`.

**Why this matters (verified from Google Search Central + John Mueller):**
- Mismatch does NOT block indexing (Google picks one)
- BUT it's an SEO hygiene issue — confuses canonical signal selection
- And it was making Run-All Auto-Maintenance falsely report "all clean" while 25 articles had stale cache

**Fix applied** (`admin/app/(dashboard)/database/actions/jsonld-integrity.ts`):
- Extended `detectStaleHosts()` with apex-domain-aware host comparison
- Regex scans every absolute URL in the cache string
- Flags entries where `storedHost !== expectedHost` AND apex (without `www.`) matches
- Safely ignores third-party hosts (cloudinary, schema.org) — only flags drift on our own domain
- Output format: `host-mismatch:modonty.com (expected www.modonty.com)`

**Live verified on DEV (Playwright on /maintenance):**
- Before fix: card said "clean" — 25 stale entries hidden
- After fix: card flagged "25 stale" + listed sample articles + showed the new detection signal
- After clicking Run All Auto-Maintenance: "Complete — 25 fixed in 182.7s" (JSON-LD Regeneration step regenerated all 25)
- Post-regen page reload: JSON-LD card disappeared, "0 tools need attention", all 9 maintenance tools healthy

### 📌 Why this is safe to deploy

Even if Khalid pushes BEFORE running cleanup script:
- `ensureSettingsId()` includes a **legacy migration fallback**: if `findUnique({where: {singletonKey: "global"}})` returns null, it finds the OLDEST doc via `findFirst({orderBy: {id: "asc"}})` and lazily sets `singletonKey="global"` on it.
- This means: on first call after deploy, Doc-1 (`...746e`) automatically gets `singletonKey="global"` and becomes the canonical singleton.
- Doc-2 (`...746f`) becomes orphaned but inert — no code path will ever read or write to it.
- Cleanup script can run any time after to permanently delete the orphan.

### 🔮 Future: enforce DB-level unique index

Currently `@unique` is **type-level only** (Prisma TypeScript types). For TRUE atomic guarantee at MongoDB level, run `prisma db push` to create the actual unique index. This blocks new duplicates from being inserted ever, even via raw MongoDB writes. Not blocking — code-level upsert is already race-safe in practice.
