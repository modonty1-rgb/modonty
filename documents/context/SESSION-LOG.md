# Session Context — Last Updated: 2026-05-06 (Session 87 — Light mode full scan + bg-card fixes · admin v0.55.1)

---

## ✅ Session 87 — 2026-05-06 (Light Mode Full Scan + bg-card Fixes)

### Summary
Full scan of all admin pages in light mode. Root cause: dark-mode-first development left two classes of issues: (1) `bg-white/N` / `border-white/N` opacity classes on section containers — nearly invisible on light backgrounds, already fixed in Session 87's first half. (2) Table/section containers with `border rounded-lg overflow-hidden` but no `bg-card` — transparent on the warm gray page background. Fixed all instances across 15+ files. Also fixed loading skeleton containers to match. The two intentional cases (`border-white/5` in WhatsApp mockup, `border-white/50` on image overlay dot) were left unchanged.

### Releases shipped today

| Version | What | Why |
|---------|------|-----|
| **admin v0.55.1** | Light mode full scan — bg-card fixes on all table/section containers | Transparent containers blended with warm gray page background in light mode |

### Code changes (Session 87)

**Table containers — added `bg-card`:**
- `app/(dashboard)/industries/components/industry-table.tsx`
- `app/(dashboard)/industries/loading.tsx`
- `app/(dashboard)/tags/components/tag-table.tsx`
- `app/(dashboard)/tags/loading.tsx`
- `app/(dashboard)/categories/components/category-table.tsx`
- `app/(dashboard)/categories/loading.tsx`
- `app/(dashboard)/media/components/media-grid.tsx` (list view container)

**Client detail tab section containers — added `bg-card`:**
- `app/(dashboard)/clients/[id]/components/tabs/settings-tab.tsx`
- `app/(dashboard)/clients/[id]/components/tabs/address-tab.tsx`
- `app/(dashboard)/clients/[id]/components/tabs/security-tab.tsx`
- `app/(dashboard)/clients/[id]/components/tabs/legal-tab.tsx`
- `app/(dashboard)/clients/[id]/components/tabs/additional-tab.tsx`
- `app/(dashboard)/clients/[id]/components/tabs/media-social-tab.tsx`
- `app/(dashboard)/clients/[id]/components/client-tabs.tsx` (SectionCard helper)

**Previously fixed (Session 87 first half):**
- `clients/components/client-form.tsx` — AccordionItems bg-white/5 → bg-card
- `clients/[id]/components/client-articles.tsx` — table wrapper bg-card
- `categories/[id]/components/category-articles.tsx` — table wrapper bg-card
- `tags/[id]/components/tag-articles.tsx` — table wrapper bg-card
- `industries/[id]/components/industry-clients.tsx` — table wrapper bg-card
- `clients/[id]/components/client-seo-form.tsx` — AccordionItems bg-card
- `settings/components/settings-form-v2.tsx` — Social image container bg-card
- `search-console/pipeline/[articleId]/pipeline-runner.tsx` — step badge bg-muted-foreground/20
- `components/admin/data-table.tsx` (both copies) — table wrapper bg-card
- `articles/components/article-table.tsx` — table wrapper bg-card
- `clients/components/client-table.tsx` — table wrapper bg-card

### Key decisions
- `bg-card` is always correct for data/section containers — it's `hsl(var(--card))` which is white in light, dark in dark
- `bg-white/N` only works on dark backgrounds — never use for containers
- Image/video aspect-ratio containers and overlay dots are intentional — do NOT add bg-card to those

---

## ✅ Session 86 — 2026-05-06 (Update Client: Loader Bug Fix + Performance 4× Speedup)

### Summary
Fixed two bugs in the client update flow. (1) **Loader stuck bug**: after saving a client successfully and the toast notification appeared, the "Saving..." button never reset to "Update Client" — root cause: `setLoading(false)` was missing in the success branch of `use-client-form.ts`. One-line fix. (2) **Save performance**: `updateClient` server action was taking 30–55 seconds — root cause: `generateClientSEO` + article SEO cascade were running sequentially, two redundant `db.article.findMany` calls, and `batchRegenerateJsonLd` was internally sequential. Fixed by merging to one DB call, running SEO generation + article cascade in `Promise.all`, and calling `generateAndSaveJsonLd` / `generateAndSaveNextjsMetadata` directly per article in parallel. Result: **55s → 13s** (4× speedup) on a client with 2 articles. Added `ARCH-01` note to MASTER-TODO documenting the scalability concern: `Promise.all` on all articles simultaneously will exhaust the MongoDB connection pool (~10 connections) for large clients (200 articles). Long-term fix is background jobs (Inngest / BullMQ).

### Releases shipped today

| Version | What | Why |
|---------|------|-----|
| **admin v0.55.0** | Loader fix + save performance 4× speedup + ARCH-01 scalability note | Loader never reset; save was 55s; large clients risk connection pool exhaustion |

### Code changes

**admin:**
- `app/(dashboard)/clients/helpers/hooks/use-client-form.ts` — Added `setLoading(false)` in success path before `router.push()` (was only called in failure branch)
- `app/(dashboard)/clients/actions/clients-actions/update-client.ts` — Merged two `db.article.findMany` into one; moved `generateClientSEO` + article cascade into `Promise.all`; bypassed sequential `batchRegenerateJsonLd` with direct per-article parallel calls; removed redundant `db.client.findUnique` for slug

**documents:**
- `documents/tasks/✅ MASTER-TODO.md` — Added `ARCH-01` section documenting background jobs scalability concern with table (article count vs outcome) and short/long-term fix plans

### Key decisions
- `setLoading(false)` MUST be called before `router.push()` in success path — navigation is async and the button stays mounted briefly
- `generateClientSEO` and article cascade have no dependency (both read already-updated DB) → safe to `Promise.all`
- `batchRegenerateJsonLd` was a hidden bottleneck (sequential for-loop internally) — bypassed
- `Promise.all` on all articles is OK for small clients but will break at ~50+ articles (connection pool); needs chunked batching or background jobs as next step

### Pending / next session ideas
- **ARCH-01**: Implement batch processing (10 articles at a time) as short-term fix for `update-client.ts` lines 96–120
- **ARCH-01 long-term**: Evaluate Inngest vs BullMQ for background job queue
- Test share URL on production after Session 84 deploy
- Notification to admin when client requests changes (bell on dashboard)
- Cron auto-publish SCHEDULED → PUBLISHED at scheduledAt

---

## ✅ Session 85 — 2026-05-06 (Media Widget in Client Edit + Table Cleanup)

### Summary
Added Logo + Hero image editing widget to the client edit page (`/clients/[id]/edit`) as a prominent Media section above the accordion. Logo and Hero are click-to-change thumbnails using the existing `ClientLogoModal` and `ClientHeroModal`. Removed all media editing from the clients table (logo click no longer opens modal, "Edit media" action button removed). Corrected all dimension hints to match the official guideline (`/guidelines/media`): Logo = 500×500px (1:1), Hero = 2400×400px (6:1). Fixed inconsistent hint text across `client-form.tsx`, `client-logo-modal.tsx`, `client-hero-modal.tsx`, and `media-picker.tsx`. Pushed as **admin v0.55.0**.

### Releases shipped today

| Version | What | Why |
|---------|------|-----|
| **admin v0.55.0** | Media widget in edit page + table cleanup + correct dimension hints | Logo/hero editing was hidden (table-only); dimensions were wrong across 4 files |

### Code changes

**admin:**
- `app/(dashboard)/clients/components/client-form.tsx` — Added Media widget (Logo + Hero thumbnails) in edit mode above accordion; added `logoModalOpen`, `heroModalOpen`, `currentLogoUrl`, `currentHeroUrl` state + `useEffect` to sync after `router.refresh()`; corrected hints to `500×500px — نسبة 1:1` and `2400×400px — نسبة 6:1`
- `app/(dashboard)/clients/components/client-table.tsx` — Removed `ClientLogoModal` + `ClientHeroModal` + all related state; converted logo `button` → `div` (display only); removed "Edit media" action button
- `app/(dashboard)/clients/components/client-logo-modal.tsx` — Updated description to `500×500px (1:1 ratio)`
- `app/(dashboard)/clients/components/client-hero-modal.tsx` — Updated description to `2400×400px (6:1 ratio)`
- `components/shared/media-picker.tsx` — Updated inline hints: Logo → `500×500px — 1:1`, non-logo → `2400×400px — 6:1`

### Key decisions
- All media editing (logo + hero) now centralized in `/clients/[id]/edit` — single source of truth
- Table shows logo as display-only avatar; no editing shortcuts from table
- Dimension source: `/guidelines/media` page (team guideline) — not the SEO validator minimum (112×112)

### Pending / next session ideas
- Test share URL on production after Session 84 deploy
- Notification to admin when client requests changes (bell on dashboard)
- Cron auto-publish SCHEDULED → PUBLISHED at scheduledAt

---

## ✅ Session 84 — 2026-05-06 (Bug Fixes: Share URL + Follow 500 + UX)

### Summary
Three bugs fixed in the modonty public site. (1) Share/copy URL was copying `%D8%A3%D9%81...` instead of readable Arabic — fixed with `decodeURIComponent` in 4 components. (2) Client follow API was returning 500 for all users after the first follower — root cause: `@@unique([clientId, sessionId])` in `ClientLike` MongoDB model treats `null==null`, blocking any second authenticated follow. Fixed by changing to `@@index` + running `prisma db push` directly against prod Atlas (instant fix, no deploy needed). (3) "حفظ" label on client page → "مفضّلة"/"مُضافة". Pushed as **modonty v1.44.0** (commit `1204863`).

### Releases shipped today

| Version | What | Why |
|---------|------|-----|
| **modonty v1.44.0** | Share URL fix + follow 500 fix + "حفظ"→"مفضّلة" | Share was copying encoded URL; follow was broken for all users after 1st follower; "حفظ" was ambiguous |

### Code changes

**Schema:**
- `dataLayer/prisma/schema/schema.prisma` — `@@unique([clientId, sessionId])` → `@@index` in ClientLike model. Ran `prisma db push` on both dev + prod MongoDB Atlas directly.

**modonty:**
- `components/shared/ShareButtons.tsx` — `window.location.href` → `decodeURIComponent(window.location.href)` (main share component)
- `articles/[slug]/components/article-mobile-sidebar-sheet.tsx` — same fix (navigator.share + clipboard)
- `articles/[slug]/components/article-mobile-engagement-bar.tsx` — same fix
- `articles/[slug]/components/article-utilities.tsx` — same fix (currentUrl for copy)
- `clients/[slug]/components/client-favorite-button.tsx` — "حفظ"→"مفضّلة", "محفوظ"→"مُضافة"

### Key decisions
- Follow fix applied directly via `prisma db push` on prod Atlas — no deploy needed, instant effect. Verified: POST /api/clients/كيما-زون/follow → 200 `{isFollowing:true, followersCount:2}`.
- Share fix requires Vercel deploy (client-side code change). Verified logic correct via `decodeURIComponent(window.location.href)` evaluation.
- Test visitor account created on prod: `testvisitor@modonty.com` / `Visitor123!`

### Pending / next session ideas
- Test share URL on production after deploy (verify Arabic slug copies cleanly)
- Notification to admin when client requests changes (bell on dashboard)
- Cron auto-publish SCHEDULED → PUBLISHED at scheduledAt

---

## ✅ Session 83 — 2026-05-05 (Article Revision Cycle + dataLayer/.env safety fix)

### Summary
Closed the last gap in the article life cycle: the **client → admin feedback loop**. When a client clicks "Request changes" in console, the feedback now persists on the article and surfaces in a dedicated admin workflow page with an amber banner above the article. Admin clicks **Re-submit for Review** → article goes back to DRAFT and re-enters the Quality Gate. Pushed as **admin v0.54.0 + console v0.6.2** (commit `1c49e3b`).

Also resolved a **production-DB safety incident** discovered mid-session (see below).

### Releases shipped today

| Version | What | Why |
|---------|------|-----|
| **admin v0.54.0 + console v0.6.2** | Article revision cycle — client feedback persists, admin sees it in `/articles/workflow/revision-to-draft`, Re-submit clears notes and re-enters Quality Gate | Final missing piece of the article life cycle. Without this, when a client requested changes, the admin had no way to see what they actually wanted edited. |

### Code changes (1 commit feature + 1 changelog commit)

**Schema:**
- `dataLayer/prisma/schema/schema.prisma` — added `revisionNotes String?` on Article model (stores client feedback text when status = NEEDS_REVISION)

**Console:**
- `console/.../articles/actions/article-actions.ts` — `requestChanges` now saves `feedback.trim()` to `revisionNotes` and sets status to `NEEDS_REVISION` (was: cancelled approval only)

**Admin:**
- `admin/.../workflow/lib/transitions.ts` — new `revision-to-draft` transition (NEEDS_REVISION → DRAFT, action label "Re-submit for Review")
- `admin/.../workflow/[transition]/page.tsx` — selects `revisionNotes` from DB; renders amber banner with 💬 emoji + "Client revision notes" header + the feedback text above the article row (only on this one transition)
- `admin/.../workflow/actions/transition-article.ts` — when `expectedFrom=NEEDS_REVISION` and `toStatus=DRAFT`, sets `revisionNotes: null` in the same DB update (atomic clear, no leftover notes between cycles)
- `admin/components/admin/sidebar.tsx` — added "Revision → Draft" item between "Approval → Revision" and "Approval → Scheduled" with the FileEdit icon

### Live test (dev DB)

E2E pass on `modonty_dev` using a Nova Electronics DRAFT article (`69f78bed732bb6673fcc28ec`):
1. Set status=NEEDS_REVISION + revisionNotes (Arabic feedback string) via prep script
2. Opened `/articles/workflow/revision-to-draft` as admin → ✅ amber banner rendered with the exact feedback text
3. Clicked **Re-submit for Review** → confirm dialog → ✅ status moved to DRAFT, revisionNotes cleared to null

DB verification post-test:
```
AFTER_RESUBMIT: { "status": "DRAFT", "revisionNotes": null, "title": "..." }
PASS — status=DRAFT + revisionNotes cleared
```

### 🚨 Production-DB safety incident (resolved, no data loss)

**What happened:**
Mid-session, while preparing the test article on what I believed was the dev DB, my standalone Node prep script wrote to **production** (`modonty`). Article `69e8b29e004d362b0383b22a` (Kimazone "أفضل واكس شعر للرجال") was briefly flipped from PUBLISHED → AWAITING_APPROVAL.

**Why it happened:**
- I checked `.env.shared` (which correctly points to `modonty_dev`) and assumed dev was the resolved URL.
- I **did not check `dataLayer/.env`**, which had an active `DATABASE_URL=...modonty?...` (production).
- Prisma's standalone client and Prisma CLI both load `.env` adjacent to the schema (i.e. `dataLayer/.env`), NOT `.env.shared`. So my `node _tmp-prep.mjs` script silently used prod.

**Restoration (within ~10 min):**
- Article restored to `status=PUBLISHED`, `datePublished=2026-04-22T11:35:58.678Z` (original timestamp preserved), `revisionNotes=null`.
- No other rows touched. No data loss.

**Permanent fix:**
- `dataLayer/.env` now points to `modonty_dev` (with a comment explaining why prod URL must NEVER live in this file — production env lives only in Vercel Dashboard).
- Memory rule added: `feedback_check_datalayer_env.md` — log resolved `DATABASE_URL` *inside* every standalone Node script before any read/write. `.env.shared` alone is not sufficient verification.

**Verified after fix:**
```
RESOLVED_DB_URL: ...modonty_dev?...
✅ DEV — safe
article.count(): 46  (vs 19 on prod — confirms different DB)
```

### Files created / modified

**Schema:**
- `dataLayer/prisma/schema/schema.prisma` (revisionNotes field)

**Code:**
- `console/.../articles/actions/article-actions.ts` (saves revisionNotes)
- `admin/.../workflow/lib/transitions.ts` (new transition)
- `admin/.../workflow/[transition]/page.tsx` (amber banner)
- `admin/.../workflow/actions/transition-article.ts` (clears notes on Re-submit)
- `admin/components/admin/sidebar.tsx` (sidebar entry)
- `admin/scripts/add-changelog.ts` (v0.54.0 entry)

**Safety fix:**
- `dataLayer/.env` (modonty → modonty_dev, with cautionary comment)

**Memory:**
- `~/.claude/projects/.../memory/feedback_check_datalayer_env.md` (new)
- `~/.claude/projects/.../memory/MEMORY.md` (indexed)

**Versions:**
- `admin/package.json` 0.53.0 → 0.54.0
- `console/package.json` 0.6.1 → 0.6.2

### Pre-push checks

| Check | Result |
|-------|--------|
| Backup script (`scripts/backup.sh`) | ✅ ran, 12 backups maintained |
| TSC admin (`pnpm tsc --noEmit`) | ✅ zero errors |
| TSC console (`pnpm tsc --noEmit`) | ✅ zero errors |
| Changelog → LOCAL + PROD DBs | ✅ id `69f9b2a446d9764223e5f050` (LOCAL) + `69f9b2a446d9764223e5f051` (PROD) |
| Live test on dev DB | ✅ amber banner + Re-submit + DB clear all verified |

### Push

`ec98b55..1c49e3b main -> main` — Vercel auto-deploys both admin + console.

### Next session ideas

1. **Notify admin when client requests changes** — currently revisionNotes persists silently. A toast/notification on admin dashboard ("X clients requested changes") would surface urgency.
2. **Cron auto-publish at scheduledAt** — still pending from Session 82; SCHEDULED articles don't auto-transition to PUBLISHED yet.
3. **Cleanup snapshot artifacts** — `snapshot-*.md` and `snap-*.md` files from earlier sessions still untracked at repo root.

---

## ✅ Session 82 — 2026-05-04 (Pipeline polish + indexing UX + sitemap fix)

### Summary
Continued Session 81 work after machine push of v0.50.0. Live-tested the pipeline on PROD (admin.modonty.com) and shipped **4 sequential PROD releases** to address discovered issues, ending with a leaner SEO setup and a verified-working indexing flow.

### Releases shipped today (in order)

| Version | What | Why |
|---------|------|-----|
| **v0.50.1** | Stage 13 NEUTRAL → ready (was critical) | Without this, Stage 14 Lock could never open for a brand-new article — Google hadn't visited yet, so verdict was NEUTRAL, treated as critical, gate locked. NEUTRAL means "no problem, just unvisited" → ready. PASS still required for true success; FAIL/PARTIAL stay critical. |
| **v0.51.0** | Indexing tracking on Pending Indexing card | New Request column (DB: GscManualRequest.openedAt + doneAt) + Google column (URL Inspection verdict) + per-row Re-check button (24h confirmation guard, calls URL Inspection API forceRefresh, 1 quota per click) |
| **v0.51.1** | Encoding hotfix (decode-then-encode) | `new URL(url).href` was pre-encoding Arabic slugs (`أ` → `%D8%A3`), then `encodeURIComponent` was encoding the `%` again → `%25D8%25A3` (double-encoded). Fixed: removed the round-trip. |
| **v0.51.2** | Drop unsupported `?id=` pre-fill | Per official docs (support.google.com/webmasters/answer/9012289), Google never documented a deep-link with URL pre-fill. The `?id=...` pattern was reverse-engineered, broke after a GSC routing change. Switched to documented `?action=inspect` (no pre-fill) + clipboard copy + paste-Ctrl+V manually. |
| **v0.52.0 + modonty v1.43.1** | Removed image-sitemap entirely | GSC reported 48/48 entries as errors. Root cause: image URLs point to `res.cloudinary.com` (cross-domain). Verified safe to remove via 3 Google docs (image-sitemaps, google-images, image-license-metadata) — page crawl + JSON-LD + OG cover all image discovery. Image SEO unaffected. |

### Key architectural learning — Trust + Verify pattern for indexing requests

User asked: "how do we know Google received the request?"

Verified flow (from Google docs):
- **DB tracks human action only** — Google has NO API field to expose "user clicked Request Indexing" (verified: "documentation does not indicate that the URL Inspection tool displays a history of indexing requests"). The user's click → DB `openedAt`/`doneAt` is the ONLY way to track the human side.
- **URL Inspection API tracks Google's view** — returns verdict, coverageState, indexingState. Reflects Google's last crawl, NOT real-time. Google indexing takes 1 day to 2 weeks per docs.
- **Verification is async**: re-inspection some hours/days later compares coverageState before/after. Change from "URL unknown" → "Discovered/Crawled" = signal that Google received the request.

The Re-check button surfaces this in the UI: admin can re-poll Google whenever they want, status updates in the Google column. Once verdict = PASS, the article naturally drops out of "Pending Indexing" (because it appears in GSC top 100 by impressions — existing logic handles the transition).

### PROD live verifications

| Test | Result |
|------|--------|
| `admin.modonty.com/search-console` after each push | ✅ all sections render, sidebar shows correct version |
| Pipeline (test article 69e8b29e004d362b0383b22a) | ✅ 13/13 stages pass after v0.50.1; previously 12/13 with Stage 13 critical |
| Stage 14 Lock unlock | ✅ "All quality gates passed" + "Request indexing in GSC" button shown |
| GSC deep-link click | ✅ after v0.51.2: opens correct URL Inspection page (was 404 with `?id=` pattern) |
| Image-sitemap removal in GSC | ✅ user clicked sitemap row → details page → ⋮ → Remove sitemap (NOT the 3 dots in the row table itself — that only shows "See page indexing"). After removal, only `sitemap.xml` (Success, 101 URLs) remains. |
| Local TSC after each change | ✅ admin + console + modonty zero errors |

### Files created / modified

**Created:**
- `admin/.../search-console/components/indexing-recheck-button.tsx` — client component with 24h guard
- `recheckIndexingStatusAction(url)` in `removal-tracking-actions.ts` — re-inspect via API

**Deleted:**
- `modonty/app/image-sitemap.xml/route.ts`
- `admin/.../search-console/components/image-sitemap-card.tsx`
- `admin/.../search-console/components/submit-image-sitemap-button.tsx`

**Modified:**
- `admin/.../search-console/pipeline/[articleId]/pipeline-runner.tsx` — Stage 13 NEUTRAL fix
- `admin/.../search-console/components/pending-indexing-card.tsx` — full rewrite with 5 columns (added Request, Google)
- `admin/.../search-console/components/seo-row-action.tsx` — encoding fix + drop pre-fill
- `admin/.../search-console/page.tsx` — fetch indexing request states + inspections, removed ImageSitemapCard render
- `admin/.../search-console/actions/robots-actions.ts` — removed image-sitemap from audit cases (19 → 17)

### Manual GSC action (completed by user)

Removed `image-sitemap.xml` from GSC web UI:
- Steps: Sitemaps page → click on the row (not the ⋮) → details page → click ⋮ in details → Remove sitemap
- Result confirmed via screenshot: only `sitemap.xml` remains in Submitted sitemaps list

### Still pending (next session)

#### 🎯 MAJOR (carried from Session 81): Build "SEO Data Health" section in `/database`
All the same as previous SESSION-LOG entry — no progress on this since user prioritized pipeline polish today. Plan:
- New section in `db-tools-section.tsx` with 5 actions:
  1. Settings.siteUrl health check + fix
  2. Articles with invalid slug chars (count + bulk clean)
  3. Articles with stale canonical (count + bulk reset)
  4. Articles with stale JSON-LD cache (count + bulk regen)
  5. Articles with stale `mainEntityOfPage` (count + bulk reset)
- New file `admin/.../database/actions/seo-data-health.ts`
- Replaces 8 one-off scripts (`admin/scripts/test-*.ts` + `fix-settings-site-url.ts`)
- Estimated: 1-2 hours

#### Other pending
- Decide: delete `admin/scripts/test-*.ts` after migrating to UI
- Run "Bulk regenerate JSON-LD" on PROD (refreshes mainEntityOfPage + canonical for all articles)
- Add Changelog DB entry for v0.50.0 + v0.51.x + v0.52.0 (not added yet)

### Where the user left off (2026-05-04, end of session)
- All work pushed to PROD, all verified live
- GSC manually cleaned (image-sitemap removed)
- User asked to update this SESSION-LOG before machine restart
- DEV environment (DEV DB) verified — `.env.shared` defaults to `modonty_dev`, all `.env.local` overrides commented out → safe to restart and continue on DEV

### Quick resume commands for next session

```bash
# Start servers
pnpm --filter @modonty/admin dev      # :3000
pnpm --filter @modonty/modonty dev    # :3001
pnpm --filter @modonty/console dev    # :3002
```

**Current versions live on PROD:** admin v0.52.0 · modonty v1.43.1 · console v0.5.0

---

## ✅ Session 81 — 2026-05-03/04 (Quality Gate + Google-strict audit + SEO root-cause fixes)

### Summary
Built a complete pre-publish Quality Gate at `DRAFT → AWAITING_APPROVAL` — single bouncer that ensures every article is technically clean before reaching the client. Started at 28 checks (initial design), then a strict audit against Google official docs dropped it to **21 checks** after removing 6 invented rules (stricter than Google or sourced from third-party SEO blogs). Plus 4 code-level SEO root-cause fixes. Full lifecycle live-tested end-to-end: WRITING → DRAFT → AWAITING_APPROVAL → SCHEDULED → PUBLISHED with the gate enforcing 100% before forward movement.

### Key architectural decision: SINGLE GATE
Only `draft → approval` is gated (28 checks → 21 after audit). Once an article passes:
- `approval → revision` NOT gated (content rejection, admin must respond freely)
- `approval → scheduled` NOT gated (article is trusted clean)
- `scheduled → published` NOT gated (same trust)

The gate at draft-to-approval is the **only bouncer**. Subsequent transitions trust its guarantee.

### What was built

**Quality Gate core:**
- `admin/lib/seo/article-validator-db.ts` — pre-publish DB validator (21 checks across 8 groups)
- `admin/lib/seo/site-url.ts` (NEW) — `loadSiteUrl()` + `resolveSiteUrl()` — single source of truth for the site URL (Settings.siteUrl > env > hardcoded www)
- `admin/app/(dashboard)/articles/workflow/quality-check/[articleId]/page.tsx` (NEW) — dedicated review page (re-run + edit + send buttons)
- `admin/app/(dashboard)/articles/workflow/components/gated-transition-button.tsx` — Link to quality-check page (replaced the dialog approach)
- `admin/app/(dashboard)/articles/workflow/components/seo-health-cell.tsx` — pill linking to quality-check page (no dialog)
- `admin/app/(dashboard)/articles/workflow/actions/gated-transition.ts` — server action: auto-fix JSON-LD → validate → block if any check fails

**Workflow row UI (current state):**
```
[Avatar 40px]  Article Title (next to avatar)
              client · author · updated date          [Send for Approval] [N issues to fix]
                                                       (locked when errors)  (links to quality-check)
```
Quality check pill ONLY appears on `draft-to-approval` page.

### Google-strict audit — 6 invented rules REMOVED

| # | Removed Rule | Google's Position |
|---|------|------|
| 1 | `title-length` 30-60 chars | *"There's no limit on how long a `<title>` element can be"* |
| 2 | `meta-description` 120-160 chars | *"There's no limit on how long a meta description can be"* |
| 3 | `excerpt` ≥50 chars | Invented (no Google source) |
| 4 | `word-count` ≥300 | EXPLICIT: *"we don't have a preferred word count"* (Helpful Content) |
| 5 | `jsonld-adobe-warnings = 0` | *"Warnings don't prevent rich results from being shown"* |
| 6 | `jsonld-breadcrumb` required | Recommended (separate rich result), not required for Article |

### Sweep across admin (other validators with same patterns)
- `admin/lib/seo/article-validator.ts` (HTML post-publish, used by Search Console pipeline) — same 4 invented rules removed
- `admin/lib/seo/pre-publish-audit.ts` — `WORD_COUNT_LOW` warning removed
- `admin/lib/seo/pipeline-stages.ts` — Stage 6 + Stage 9 mappings updated to drop removed check IDs

### 4 code-level SEO fixes (root-cause analysis)
1. **slugify** regex updated to `\p{L}\p{N}` (was `\u0600-\u06FF` which incorrectly kept Arabic punctuation `؟ ، ؛` since they sit inside the Arabic Unicode block)
2. **Settings.siteUrl** in DB was `https://modonty.com` (no www) — fixed to `https://www.modonty.com` via one-time script
3. **Single source of truth for canonical** — server actions (create/update/bulkFixSeo) now read `Settings.siteUrl` and pass `baseUrl` to `generateCanonicalUrl()`. Stops relying on hardcoded fallbacks.
4. **All hardcoded `https://modonty.com` fallbacks** in admin codebase fixed to `https://www.modonty.com`

### Validator robustness fixes (during live test)
- Validator now accepts **Person OR Organization** as Author (was rejecting Organization despite T1.1 making Modonty the Org Author)
- 60-second tolerance window on cache freshness check (Prisma `@updatedAt` race put `dateModified` ~9ms after `jsonLdLastGenerated` causing always-stale verdict)

### Files created
- `admin/lib/seo/site-url.ts` — `loadSiteUrl()` + `resolveSiteUrl()` (single source of truth helper)
- `admin/lib/seo/article-validator-db.ts` — 21-check validator
- `admin/app/(dashboard)/articles/workflow/quality-check/[articleId]/page.tsx` + components
- `admin/app/(dashboard)/articles/workflow/components/gated-transition-button.tsx`
- `admin/app/(dashboard)/articles/workflow/components/seo-health-cell.tsx`
- `admin/app/(dashboard)/articles/workflow/actions/gated-transition.ts`
- `admin/scripts/reset-articles-to-writing.ts` — DEV reset helper
- `admin/scripts/fix-settings-site-url.ts` — DB fix
- `admin/scripts/test-*.ts` — 8 diagnostic scripts (can clean up before push)

### Files modified (key)
- `admin/lib/utils.ts` — slugify regex
- `admin/app/(dashboard)/articles/helpers/seo-generation.ts` — canonical fallback to www
- `admin/app/(dashboard)/articles/actions/articles-actions/mutations/create-article.ts` — uses loadSiteUrl
- `admin/app/(dashboard)/articles/actions/articles-actions/mutations/update-article.ts` — uses loadSiteUrl
- `admin/app/(dashboard)/seo-overview/actions/articles-seo-actions.ts` — uses loadSiteUrl
- `admin/lib/seo/article-validator.ts` — invented rules removed
- `admin/lib/seo/pre-publish-audit.ts` — WORD_COUNT_LOW removed
- `admin/lib/seo/pipeline-stages.ts` — stage check IDs updated
- `admin/lib/seo/jsonld-validator.ts` — author accepts Person OR Organization
- `admin/app/(dashboard)/articles/workflow/[transition]/page.tsx` — gate scope + row redesign

### DB changes (DEV only)
- `Settings.siteUrl`: `https://modonty.com` → `https://www.modonty.com`
- All 46 articles reset to WRITING (one-time, for end-to-end flow testing)
- Test article `69d6830820251ee8497527b4` (`ماهو-السيو-...`) cycled through full workflow → now PUBLISHED with clean JSON-LD `https://www.modonty.com/articles/<clean-slug>#article`

### Documentation added
- `documents/tasks/QUALITY-GATE-AUDIT-2026-05-04.md` — full audit report with Google source citations + sweep results

### Live tests passed (final)
| Test | Result |
|------|--------|
| Quality-check page (21/21) | ✅ |
| writing-to-draft / draft-to-approval / approval-to-revision / approval-to-scheduled / scheduled-to-published | ✅ all 5 workflow pages render |
| Article edit page | ✅ tabs render with %, no errors |
| Search Console pipeline page | ✅ uses cleaned `article-validator.ts` |
| SEO Overview page | ✅ uses cleaned canonical generator |
| TSC (admin) | ✅ zero errors |

### Pending for next session

#### 🎯 MAJOR: Build "SEO Data Health" maintenance section in `/database` page
The owner pointed out (correctly) that all the one-off scripts I wrote should be **maintenance actions** in the existing `/database` UI page (which already has Orphan Cleaner, Session Cleaner, Slug Integrity, Broken References, etc.). This is the architectural standard — DB changes that may need re-running should be UI-accessible buttons, NOT tribal-knowledge scripts.

**Plan: add a new section "SEO Data Health" to `db-tools-section.tsx` with these checks/actions:**

| # | Check | What it does | Backend |
|---|------|------|---------|
| 1 | Settings.siteUrl health | Verify www-prefixed, "Fix" button if not | New action `getSiteUrlHealth()` + `fixSiteUrl()` |
| 2 | Articles with invalid slug chars | Count articles where slug fails `/^[\p{L}\p{N}\-_/]+$/u` | New action `findInvalidSlugs()` + `bulkCleanSlugs()` |
| 3 | Articles with stale canonical | Count articles where `canonicalUrl` host ≠ Settings.siteUrl | New action `findStaleCanonicals()` + `bulkResetCanonical()` (set null → auto-generate) |
| 4 | Articles with stale JSON-LD cache | Count where `dateModified > jsonLdLastGenerated + 60s` | New action `findStaleJsonLd()` + `bulkRegenerateJsonLd()` |
| 5 | Articles with stale `mainEntityOfPage` | Count where stored URL ≠ `${siteUrl}/articles/${slug}` | New action `findStaleMainEntity()` + `bulkResetMainEntity()` |

**File structure to create:**
- `admin/app/(dashboard)/database/actions/seo-data-health.ts` — consolidated actions file
- Update `admin/app/(dashboard)/database/components/db-tools-section.tsx` — add new section
- Update `admin/app/(dashboard)/database/page.tsx` — fetch initial counts + pass props
- Delete after migration: `admin/scripts/fix-settings-site-url.ts`, `admin/scripts/test-fix-slug.ts`, `admin/scripts/test-fix-content-and-regen.ts`, `admin/scripts/test-clear-mainentity.ts`, `admin/scripts/reset-articles-to-writing.ts` (the last one is DEV-only — could keep for fast resets)

**Why this matters:**
- Admin can run maintenance whenever needed, on PROD or DEV
- No need to touch terminal or write new scripts
- Same UX as existing maintenance (consistent)
- Single source of truth for "what needs fixing"

**Estimated effort:** 1-2 hours (5 actions + 1 UI section, follows existing pattern)

#### 📋 Pre-push checklist
- [ ] Build SEO Data Health section (above) — replaces script-based fixes
- [ ] Run "Fix Settings.siteUrl" action on PROD via the new UI button (instead of script)
- [ ] Decide: delete `admin/scripts/test-*.ts` (8 files) OR leave as DEV utilities (not pushed)?
- [ ] Run "Bulk regenerate JSON-LD" on PROD (refreshes mainEntityOfPage + canonical for all articles)
- [ ] TSC zero errors on `modonty` and `console` (only admin verified so far)
- [ ] Version bump admin v0.49.0 → v0.50.0 (significant architecture change)
- [ ] `bash scripts/backup.sh`
- [ ] Add Changelog DB entry for v0.50.0
- [ ] Final live verify after all maintenance + push

### Where the user left off (2026-05-04, late night)
- **Live test of all validator-touched functions: PASSED ✅** (6/6 green)
- Owner asked for risk report if pushing now → I gave them the assessment
- Owner correctly pointed out the architectural mistake: I was building scripts for DB maintenance instead of adding them to the existing `/database` maintenance UI. **The right approach: add as UI actions in `db-tools-section.tsx` so they're reusable on any environment.**
- Owner said: *"خليك ذكي يعني"* (be smart) — meaning think architecturally, not script-by-script.

### Push v0.50.0 — 2026-05-04
- TSC zero errors on **admin + modonty + console** (3/3 ✅)
- `bash scripts/backup.sh` ran successfully (`backup-2026-05-04_13-35`)
- admin version bumped 0.49.0 → 0.50.0
- 58 files changed (Sessions 80 + 81 combined): Quality Gate, audit cleanup, T1.x Schema work
- Pushed to main → Vercel auto-deploy

### Pending for next session (post-push)
- 🎯 Build "SEO Data Health" maintenance section in `/database` page (replaces 8 one-off scripts in `admin/scripts/test-*.ts` + `fix-settings-site-url.ts`)
- Run "Fix Settings.siteUrl" + "Bulk regenerate JSON-LD" on PROD via that new UI
- Add Changelog DB entry for v0.50.0
- Decide: delete `admin/scripts/test-*.ts` after migrating to UI

---

## ✅ Session 80 — 2026-05-03 (T1.1 multi aspect ratios + T1.2 Modonty Organization + T1.6 mentions + T1.7 cascade unified + T1.8 UI banner)

### Summary
Major Schema.org perfection work. T1.1 (multi aspect ratio images), T1.2 (Modonty author = Organization with Settings branding), T1.6 (semanticKeywords as mentions[]) all live-tested on real article. T1.7 unified Settings Save into single atomic action with one cascade (was 6 parallel actions causing race conditions). T1.8 added UI progress banner with live counter (Updating articles 6/23…). All DB schema unchanged — no migrations.

### What was done

**T1.1 — Multiple Image Aspect Ratios (1:1 · 4:3 · 16:9)** ✅ DONE
- Cloudinary `c_fill,ar_X:Y,g_auto` auto-crop — single image in DB → 3 variants in JSON-LD
- New file `modonty/lib/seo/image-aspect-ratios.ts` (`buildAspectRatioUrl`, `buildAspectRatiosArray`)
- `admin/lib/seo/knowledge-graph-generator.ts` — primary generator emits 3 ImageObjects (1:1 · 4:3 · 16:9) for both featuredImage AND fallback (client logo) branches
- `modonty/lib/seo/index.ts` — fallback generator uses `buildAspectRatiosArray()` for `image[]`
- Live verified: 3 ImageObjects emitted with correct Cloudinary transformations
- Zero schema changes · zero UI changes · TSC clean both apps

**T1.2 — Modonty Author = Organization (Brand-level E-E-A-T)** ✅ DONE
- Modonty articles now emit `@type: Organization` for author (not Person) — pattern: Forbes/BuzzFeed
- `admin/lib/seo/knowledge-graph-generator.ts` — added `PLATFORM_AUTHOR_SLUGS = ["modonty"]` + `PlatformBranding` interface + `generatePlatformAuthorNode()`
- Pulls branding from Settings: name (siteName) · url (siteUrl) · description (brandDescription) · logo (logoUrl) · sameAs[] (7 social URLs)
- `admin/lib/seo/jsonld-storage.ts` — passes Settings as branding to generator
- **Logo upload via Playwright on /settings tab Modonty** — used existing Cloudinary URL `https://res.cloudinary.com/dfegnpgwx/image/upload/v1768724691/final-01_fdnhom.svg`
- Live verified: author node has 7 fields (@id, @type, name, url, description, logo, sameAs)

**T1.6 — Semantic Keywords as JSON-LD mentions[]** ✅ DONE
- `modonty/lib/seo/index.ts` — added block converting `Article.semanticKeywords` (Wikidata entities) to `mentions[]` array with `@id` + `sameAs` for entity disambiguation
- Graceful fallback when no wikidataId → `{ @type: Thing, name }` only

**T1.7 — Settings Cascade Unified into single atomic save** ✅ DONE
- **Problem found:** "Save & Publish" was firing 6 server actions in parallel (`Promise.all`) — 3 of them triggered cascade simultaneously → race conditions + duplicate work + 2 actions (saveMediaSettings, saveModontySettings) had NO cascade at all
- **Solution:** `updateAllSettings()` in [settings-actions.ts](admin/app/(dashboard)/settings/actions/settings-actions.ts) now writes all fields atomically; the 6 individual save actions kept for backward compat
- **MongoDB Atlas issue:** Initial single-update of 73 fields hit "Pipeline length greater than 50" error → split into 2 chunks of 45 + 28 fields
- [settings-form-v2.tsx](admin/app/(dashboard)/settings/components/settings-form-v2.tsx) `saveModonty()` simplified to call `updateAllSettings(settings)` once

**T1.8 — Cascade UI feedback (Live Progress Banner)** ⚠️ CODE WRITTEN — UNTESTED
- User direction: "تخيل لو عندنا 600 مقال بكرة — لازم UI يعرض progress" + "مش محتاجين DB schema change"
- **Approach:** Client-driven cascade (form pulls list of IDs, calls regen action per-entity, updates UI counter live)
- **New file:** [cascade-step-actions.ts](admin/app/(dashboard)/settings/actions/cascade-step-actions.ts) with 7 server actions:
  - `getCascadeEntities()` → returns `{ articleIds[], clientIds[] }`
  - `regenerateOneArticleCascade(id)` · `regenerateOneClientCascade(id)` (one-by-one)
  - `regenerateBulkCategoriesCascade()` · `regenerateBulkTagsCascade()` · `regenerateBulkIndustriesCascade()` · `regenerateListingsCascade()` (each is one bulk call)
  - `finalizeCascadeRevalidation()` (revalidate tags)
- **Removed:** background `cascadeSettingsToAllEntities()` trigger from `updateAllSettings()` — form drives the cascade now
- **Form changes (settings-form-v2.tsx):**
  - New state: `cascade: CascadeProgress { phase, total, completed, errors, message }`
  - `saveModonty()` rewrite: 6 sequential phases (saving → articles → clients → categories → tags → industries → listings), each updating state after every entity
  - New `<CascadeProgressBanner />` component below Save & Publish button — shows live progress bar + counter `6/23` + Arabic phase labels (📝 تحديث المقالات / 👥 تحديث العملاء / etc.)
  - Auto-hides banner 5s after success
  - Shows error count + final toast with totals
- **TSC:** admin zero errors
- **⚠️ NOT live-tested before user requested restart** — needs verification next session

### State at restart

- **All code committed in working tree but NOT pushed to git**
- **No DB schema changes** — all of Session 80's work is code-only
- **No version bumps yet**
- **modonty article 69f71c9cdf533d533b45f48b** has fresh JSON-LD with all 23 articles regenerated during T1.7 live test
- **Settings.logoUrl** = `https://res.cloudinary.com/dfegnpgwx/image/upload/v1768724691/final-01_fdnhom.svg` (uploaded via Playwright)

### Next session priorities

1. **Verify T1.8 live** — start admin + modonty, navigate /settings, click Save & Publish, watch banner show "📝 تحديث المقالات 6/23 …" → done
2. **Continue Tier 1:** T1.3 Reviewer Field · T1.4 Schema Type Selector (NewsArticle/BlogPosting) · T1.5 Publisher Logo Dimensions
3. **Pre-push:** version bumps (admin → 0.50.0, modonty → 1.44.0) + backup + changelog + commit + push

### Files changed (NOT YET COMMITTED)

**modonty:**
- `modonty/lib/seo/image-aspect-ratios.ts` (new)
- `modonty/lib/seo/index.ts` (mentions block + image array using buildAspectRatiosArray)

**admin:**
- `admin/lib/seo/knowledge-graph-generator.ts` (PLATFORM_AUTHOR_SLUGS + generatePlatformAuthorNode + buildAspectUrl + 3 ImageObjects)
- `admin/lib/seo/jsonld-storage.ts` (pass branding to generator)
- `admin/app/(dashboard)/settings/actions/settings-actions.ts` (split updateAllSettings into 2 chunks, removed cascade trigger)
- `admin/app/(dashboard)/settings/actions/cascade-step-actions.ts` (new — 7 step actions)
- `admin/app/(dashboard)/settings/components/settings-form-v2.tsx` (CascadeProgressBanner + saveModonty rewrite)
- `documents/tasks/ARTICLE-SCHEMA-PERFECTION-TODO.md` (T1.1/T1.2/T1.6/T1.7 moved to Done · T1.8 in Tier 1.5 · Last Updated bumped)

---

# Session Context — Earlier sessions: 2026-05-02 (Session 79 — admin v0.49.0 pushed + Pricing Strategy Agreement + mermaid MCP installed)

> This file is the handoff document for the next agent/session.
> Read this FIRST before starting any work.
> Update this file BEFORE every push.

---

## Current Versions

- **admin**: v0.49.0 (committed `ba85296` Session 79 — PUSHED, Vercel deploy in progress)
- **modonty**: v1.43.0 (no change since Session 74)
- **console**: v0.5.0 (committed earlier — no change in Session 79)

---

## ✅ Session 79 — 2026-05-02 (admin v0.49.0 + Pricing Strategy + mermaid MCP)

### Summary
Pushed admin v0.49.0 (guideline pages now read prices from DB · DEV-only Sync Local from PROD button). Then deep architectural discussion on pricing/billing — agreed on snapshot pattern + no-discount golden rule + unified client creation flow with origin selector. Added the pricing rule to sales-playbook guideline. Installed mermaid MCP for upcoming flow diagrams (pending Claude Code restart to activate).

### What was done

**1. ✅ Pushed admin v0.49.0 (commit `ba85296`)**
- 14 files changed · 1267 insertions
- 6 guideline pages migrated to DB-driven pricing (33 places): brand · golden-rules · icps · positioning · sales-playbook · team-onboarding
- New helpers: `admin/lib/pricing/get-tier-pricing.ts` (unstable_cache 1h) + `format-for-guideline.ts` (Intl ar-SA + en-GB)
- DEV-only **Sync Local from PROD** button in navbar (NDJSON streaming, drops + recreates indexes)
- API route `admin/app/api/dev/sync-local-from-prod/route.ts` with safety check (rejects if not modonty_dev)
- Tested: 64 collections · 1,242 docs · 137.3s · zero failures
- Bug fix: createIndexes rejected `unique:null`/`sparse:null` — now only added when `=== true`
- Changelog written to LOCAL + PROD DBs (ids `69f6232a58ae44523c1de701`/`702`)

**2. 🥇 Pricing Golden Rule agreed + documented**
- **Rule:** الأسعار ثابتة — لا خصم على الإطلاق. المكافآت فقط (شهور إضافية + مقالات إضافية) بتعميد إدارة كتابي.
- Added prominent card to `admin/app/(public)/guidelines/sales-playbook/page.tsx` (between Packages card and Closing Lines section) — 4 sections: ❌ ممنوع · ✅ مسموح · 💡 المنطق · 📋 الصياغة الجاهزة
- Saved memory: `memory/project_pricing_no_discount.md` + indexed in MEMORY.md
- TSC admin: zero errors

**3. 🏗 Schema redesign agreed (NOT yet implemented)**

Adding to Client model — snapshot of pricing locked at subscribe time + customer origin tracking:

```prisma
// Subscription snapshot (locked at subscribe/renew time)
subscribedCountry        String?    // "SA" | "EG"
subscribedMonthsPaid     Int?       // الشهور المدفوعة (1, 2, 3, 6, 12, 24...)
subscribedMonthsBonus    Int?       @default(0)  // شهور إضافية (بتعميد إدارة)
subscribedPricePerMonth  Float?     // السعر القياسي (يطابق tier.pricing[country].mo — لا خصم)
subscribedArticlesBonus  Int?       @default(0)  // مقالات إضافية (one-time pool)
subscribedAt             DateTime?  // تاريخ التثبيت

// Customer origin (analytics + flow routing)
origin                   ClientOrigin?  // enum: JBRSEO | DIRECT | REFERRAL | ADVERTISING | OTHER
jbrseoSubscriberId       String?        // link only when origin=JBRSEO
referralClientId         String?        // link only when origin=REFERRAL

enum ClientOrigin {
  JBRSEO
  DIRECT
  REFERRAL
  ADVERTISING
  OTHER
}
enum BillingCycle deferred — using subscribedMonthsPaid (flexible duration) instead
```

**Computed values (live in UI, not stored):**
- `currency = country === "EG" ? "EGP" : "SAR"` (derived, single source of truth)
- `totalMonths = monthsPaid + monthsBonus`
- `totalAmountPaid = monthsPaid × pricePerMonth`
- `totalArticles = (articlesPerMonth × totalMonths) + articlesBonus`
- `subscriptionEndDate = startDate + totalMonths months` (auto-set on save)

**4. 🎯 Unified `/clients/new` flow agreed**
- Single screen with origin selector at top (default: JBRSEO)
- If JBRSEO: shows search of unconverted JbrseoSubscriber records → autofill email/phone/country/plan/billing on selection
- If DIRECT/REFERRAL/ADVERTISING/OTHER: form stays empty for manual entry
- Origin always saved → analytics on customer acquisition channels
- The 3.7.x console subscription-card migration was started + reverted (pending schema redesign)

**5. 📊 Installed `mcp-mermaid` (v0.4.1) + generated 3 flow diagrams**
- Path: `C:\Users\w2nad\AppData\Roaming\npm\node_modules\mcp-mermaid\build\index.js`
- Added to `.mcp.json` under name `mermaid`
- ✅ Restarted + tested live — generates Arabic-text PNGs cleanly
- Saved to `documents/diagrams/`:
  - `01-client-creation-flow.png` — flowchart of 5 origins + autofill behavior
  - `02-database-schema-er.png` — ER diagram of Client + JbrseoSubscriber + SubscriptionTierConfig with new snapshot fields
  - `03-jbrseo-conversion-sequence.png` — sequence diagram of admin → form → DB conversion flow

**6. 📝 Memory updates**
- New: `memory/project_pricing_no_discount.md` (golden rule)
- Strengthened: `memory/feedback_arabic_only_chat.md` — added explicit "no English in Arabic prose, even brand names"
- Both indexed in MEMORY.md

### Pending for next session

1. **Restart Claude Code** to activate mermaid MCP
2. Draw 3 flow diagrams via mermaid:
   - Customer creation flow (5 origin sources + autofill behavior)
   - JbrseoSubscriber → Client conversion sequence
   - New schema ER diagram (snapshot fields + origin links)
3. Decide on schema migration approach (extend existing Client vs separate Subscription model)
4. Implement schema additions + data migration for existing 3 clients
5. Refactor `/clients/new` form: add origin selector + JBRSEO autofill behavior
6. Refactor `console/.../settings/page.tsx` + `subscription-card.tsx` to read snapshot from Client (not tier config)
7. Resume Step 3.7 (console subscription-card migration) AFTER schema redesign is in place
8. Continue JBRSEO-INTEGRATION-PLAN Step 3.f (Pricing Mirror admin UI) when ready

### Files touched (committed in `ba85296`)
- `admin/package.json` (0.48.0 → 0.49.0)
- `admin/scripts/add-changelog.ts` (v0.49.0 entry)
- 6 guideline pages: brand · golden-rules · icps · positioning · sales-playbook · team-onboarding
- `admin/lib/pricing/get-tier-pricing.ts` (NEW)
- `admin/lib/pricing/format-for-guideline.ts` (NEW)
- `admin/app/api/dev/sync-local-from-prod/route.ts` (NEW)
- `admin/components/admin/sync-local-button.tsx` (NEW)
- `admin/components/admin/header.tsx` (added SyncLocalButton)
- `documents/tasks/JBRSEO-INTEGRATION-PLAN.md` (status updated)

### Files touched in Session 79 (NOT committed yet)
- `admin/app/(public)/guidelines/sales-playbook/page.tsx` (added pricing rule card)
- `documents/tasks/JBRSEO-INTEGRATION-PLAN.md` (added pricing rule + schema notes)
- `.mcp.json` (added mermaid server)

---

## ✅ Session 74 — 2026-04-30 (Shared Env Migration + Local Verification)

### Summary
Major refactor of monorepo env management. ZERO production code changes (apart from 3 changelog scripts + 2 brand-description hardcodes). All Next.js apps now load shared env vars via `.env.shared` at root.

### What was done

**Phase 0-3 ✅ — Wired all 3 apps**
- New file: `MODONTY/.env.shared` (gitignored, 34 active keys + 12 commented unused)
- New file: `MODONTY/.env.shared.example` (committed template)
- `console/next.config.ts` + `modonty/next.config.ts` + `admin/next.config.ts` — added `dotenv.config({ path: '../.env.shared' })` at top (4 lines each)
- `console/package.json` + `modonty/package.json` — added `dotenv@^16.6.1` + `cheerio@^1.0.0` (cheerio was a pre-existing missing dep — bug from Session 71)
- Priority: `<app>/.env.local > <app>/.env > .env.shared` (override:false, Next.js standard)

**Phase 3.5 ✅ — Cleanup of duplicates**
- 6 per-app `.env`/`.env.local` files cleaned of duplicate keys (commented-out for rollback safety)
- Backup of all 6 files: `c:/tmp/env-backup-2026-04-29/`
- 5 pre-existing bugs fixed:
  1. console/.env: `NEXTAUTH_URL=https://admin.modonty.com` → `https://console.modonty.com`
  2. console/.env: `RESEND_FROM=no-reply@admin.modonty.com` → `no-reply@modonty.com`
  3. console/.env: `NEXT_PUBLIC_SITE_URL=https://modonty.com` → `https://www.modonty.com`
  4. .env.shared: `GOOGLE_SEARCH_CONSOLE_SITE_URL=https://modonty.com` → `https://www.modonty.com`
  5. modonty/.env: empty `TELEGRAM_BOT_TOKEN=` placeholder was overriding shared (commented out)

### Keys moved to `.env.shared` (34 active)
DATABASE_URL · AUTH_TRUST_HOST · NEXT_PUBLIC_SITE_URL · REVALIDATE_SECRET · INTERNAL_LOG_SECRET · GOOGLE_CLIENT_ID/SECRET · 6 Cloudinary · RESEND_API_KEY/FROM · 7 GSC + PageSpeed · NEXT_PUBLIC_GTM_CONTAINER_ID · 3 OpenAI · COHERE_API_KEY · SERPER_API_KEY · UNSPLASH · NEWS · 5 Telegram (with new TELEGRAM_WEBHOOK_SECRET = `b0b05ce0c9bdda586dff0f2a2097e3cf6acb0608656617f186d5a159de9fbc61`)

### Keys hardcoded (NOT secrets — by user decision)
- `PRODUCTION_DATABASE_URL` → hardcoded in 3 changelog scripts (admin/scripts/add-changelog.ts · changelog-sync.ts · changelog-prod.ts) per user "ما أبغى أتخبط في الـ environment"
  - ⚠️ **Atlas password rotation = update 3 scripts**
- `NEXT_PUBLIC_BRAND_DESCRIPTION` → hardcoded in 2 admin seed locations (not a secret)

### Audit & verification (4-level)
1. Independent Agent (155s, 68 calls) → 12 unused keys
2. Combined OR-pattern grep → ZERO matches
3. 12 individual greps → ZERO matches each
4. Edge-case grep (bracket access + dynamic prefix) → ZERO matches

12 unused keys commented in `.env.shared` (verified UNUSED 2026-04-30):
- `GSC_MODONTY_CLIENT_EMAIL` (client_email is inside KEY_BASE64 JSON)
- `NEXT_PUBLIC_GTM_DEBUG`, `NEXT_PUBLIC_GTM_ENVIRONMENT`
- `NEXT_PUBLIC_PHONE_NUMBER`, `NEXT_PUBLIC_WHATSAPP_NUMBER`
- 7 `NEXT_PUBLIC_SOCIAL_*` (replaced by DB Settings — `modonty/lib/settings/get-platform-social-links.ts`)

### Local test ✅ (PROD DB)
- `pnpm install` → 14.4s clean
- `pnpm prisma:generate` + `prisma:validate` → ✅
- 3 dev servers running on 3000/3001/3002 → all HTTP 200
- Playwright live tests ✅ on each:
  - **console**: login Kimazone → dashboard → site-health (PSI live: Mobile 62, Desktop 78) → settings (Telegram "مربوط")
  - **admin**: login modonty@modonty.com → dashboard (KPIs live) → /search-console (17 indexed, 11 missing, 19 pending — all GSC live)
  - **modonty**: homepage + sitemap (17KB) + image-sitemap (26KB) + robots.txt all 200
- Zero env-related errors. JWTSessionError on modonty browser nav = stale cookies (OBS-118 — pre-existing, not env issue).

### Next session — Phase 4 (Vercel)
~35-40 min UI work:
1. Backup .env from each Vercel project (Settings → Environment Variables → Download)
2. Team Settings → Environment Variables → Shared tab → Import .env.shared → Link to all 3 projects
3. Verify Shared section visible in each project
4. Delete duplicates from Project-level (low-risk first → DATABASE_URL last)
5. Redeploy 3 projects (no cache)
6. Update Telegram webhook with new secret:
   ```
   curl -X POST "https://api.telegram.org/bot8739374417:AAGaV6s6KaEwU7Jl5_sySrjx4YF9DUg099Y/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url":"https://console.modonty.com/api/telegram/webhook","secret_token":"b0b05ce0c9bdda586dff0f2a2097e3cf6acb0608656617f186d5a159de9fbc61"}'
   ```
7. Live verify 3 production domains

### Phase 5 (later — final cleanup)
After Phase 4 confirmed working: remove all `# UNUSED` and `# moved to .env.shared` comments from per-app `.env` files. Pure cleanup.

### TODO for production rotation (security)
- Regenerate AUTH_SECRETs in Vercel UI for all 3 apps (rotation best practice)
- Rotate Atlas DB password — needs to update `.env.shared` + 3 changelog scripts + Vercel Shared

---

## ✅ Session 73 — 2026-04-29 (Repo Cleanup + Marketing Brief + Pre-push)

### Summary
Three groups of work this session:

**1. Repo Cleanup (~1.45 GB + 1.7 MB freed)**
- `.next/` cache (admin 975 MB · modonty 376 MB · console) deleted
- test-screenshots, test-results, admin/logs, .playwright-mcp deleted
- Backups trimmed 16 → 5 most recent
- 31 one-off scripts archived (debug/test/check/seed) → eventually deleted in Phase 4
- 6 root configs moved to `documents/` (clients-table.yml · ga4.txt · mockup · compass-connections.json moved out)
- `documents/_archive/` reduced 150 → 0 files (folder deleted entirely)
- `DESIGN_SYSTEM.md` → `documents/07-design-ui/` (proper home)
- `shared.md` → `documents/implementation-plans/SHARED_ENV_MIGRATION_PLAN.md`
- `frontend-master-SKILL.md` → `.claude/skills/frontend-master.md` (Claude skill location)

**2. Marketing Brief 2026 (deliverable for marketing team)**
- New `documents/01-business-marketing/MARKETING-BRIEF-2026.html` (16 sections)
- Built on **live PROD DB tier data** (مجاني/الانطلاقة/الزخم/الريادة — 0/499/1299/2999 SAR)
- Inventory of 28 console features + 22 admin features + modonty 45+ pages from 3 parallel agents
- 5 Hooks for Reels/Ads + Persona narrative ("أحمد") + Four Powers framework + Honest Numbers credibility section
- HTML with Tajawal font, sticky TOC, scroll-spy, RTL, print-ready
- BUSINESS-OVERVIEW.md + MODONTY-STORY-SCRIPT.md merged + deleted (one source of truth now)

**3. Documents structure cleanup**
- 04-technical-dev: deprecated `settings-ui-removed-fields.md` deleted; `PRODUCTION-ENV-VARS.md` rebuilt with 3 apps (incl. Console — was missing) + correct `GSC_MODONTY_*` names + Telegram + PageSpeed + 5 gotchas
- 02-seo: verified 4 files (kept) — disavow-linkbooster.txt + AUDIT-4 are standby for negative SEO emergency
- 07-design-ui: gap-report-v2 verified vs code → 5 gaps resolved → replaced with `PENDING-UX-GAPS.md` (only unresolved)

**Pre-push verification (all green):**
- TSC zero errors on admin · modonty · console
- Build success on admin · modonty · console
- Backup completed (63 collections, 2.5MB)
- Changelog entries (v0.44.0 + v0.4.0 + v1.43.0) written to LOCAL + PROD DBs
- `verify-client-password.ts` (security risk leftover) deleted

### Files structure now
```
documents/
  01-business-marketing/
    MARKETING-BRIEF-2026.html  (single source of truth, 16 sections)
  02-seo/
    AUDIT-4-BACKLINK-SPAM-GUIDE.md (standby)
    ROBOTS-SITEMAP-REFERENCE.md
    SEO-STRUCTURED-DATA-METADATA-REFERENCE.md (794 lines, gold)
    disavow-linkbooster.txt (standby)
  03-analytics-gtm/ga4.txt
  04-technical-dev/PRODUCTION-ENV-VARS.md (rebuilt, 3 apps)
  07-design-ui/
    DESIGN_SYSTEM.md (1277 lines, design tokens)
    PENDING-UX-GAPS.md (G1-G3 + B1/B2/B4 + accessibility + typography)
    mockups/
  audits/REPO-CLEANUP-AUDIT.md
  implementation-plans/SHARED_ENV_MIGRATION_PLAN.md
  context/SESSION-LOG.md (this file)
  tasks/✅ MASTER-TODO.md, 🏆 MASTER-DONE.md, etc.
```

### Pending decisions (carry forward)
- Atlas password rotation (`test-prisma-connection.ts` was in working tree, deleted, but in git history `493d4e5` — user decided to rotate Atlas account later instead of cleaning git history)
- Other documents folders (03-analytics-gtm · 05-performance · 06-ai-chatbot · 08-intake-setup · admin-setting-docs · console-docs · guides · guidelines · modonty-docs) — not yet reviewed in Session 73

---

## ⏳ Session 72 — 2026-04-29 (Telegram Integration · Site Health Dashboard) — included in v0.44.0/0.4.0/1.43.0

---

## ⏳ Session 72 — 2026-04-29 (Telegram Integration · Site Health Dashboard)

### Summary
Three major value-add features built end-to-end with live tests on PROD DB:

**1. Telegram Per-Client Notifications — OBS-187 to OBS-196**
- New per-client bot `@ModontyAlertsBot` (separate from existing admin global `TELEGRAM_BOT_TOKEN`)
- Used distinct env var `TELEGRAM_CLIENT_BOT_TOKEN` to avoid conflict
- Schema: 5 new optional fields on `Client` (telegramChatId, telegramPairingCode, telegramPairingExpiresAt, telegramConnectedAt, telegramEventPreferences) — no migration needed (MongoDB schemaless)
- Pairing flow: console UI generates 6-digit code (10-min TTL) → user sends `/start` to bot then the code → webhook validates + binds chat_id
- Webhook: `console/app/api/telegram/webhook/route.ts` — verifies `x-telegram-bot-api-secret-token` header
- Telegram catalog: started as 26 events, finalized at 22 after cleanup (removed redundant questionNew/clientLike/clientDislike + admin-only newsletterSubscribe)
- **All 22 events live-tested via Playwright** (Tester TG visitor account created on modonty + Kimazone admin in console)
- Dev setup uses ngrok tunnel (URL `https://5429-142-154-87-194.ngrok-free.app` → console:3000) for webhook
- All messages include footer: timestamp (en-GB Asia/Riyadh) + geo (city/country) using Node native + free ip-api.com fallback

**2. clientFavorite + clientComment — Built end-to-end (OBS-199)**
- User: "أضيفهم لأنهم بالفعل مهمون للعميل... شغلهم تمامًا، اتركهم شغالين 100% من كل الجهات"
- `clientFavorite` (modonty): API `/api/clients/[slug]/favorite` (GET/POST/DELETE) + `ClientFavoriteButton` UI on client page hero (Bookmark icon) + Telegram event
- `clientComment` (modonty): API `/api/clients/[slug]/comments` (POST PENDING + GET list APPROVED) + `ClientCommentsSection` form/list on client page (after FAQ section) + Telegram event
- Console approval page: `/dashboard/client-comments` with 5 KPIs + filter pills + approve/reject/delete/restore actions
- Sidebar entry "آراء حول الشركة" with `Quote` icon (NOT MessageSquare — collides with article-comments top-nav bell)

**3. Site Health Dashboard (OBS-202 to OBS-207)**
- New `/dashboard/site-health` page — value-add for client subscriptions
- Architecture: **NO DB persistence** (per user request "بس مجرد عرض للعميل كخدمة")
- 9 free helpers in `console/lib/health/`: ssl, dns, headers, robots, sitemap, domain (RDAP), meta+OG (cheerio), schema-check, pagespeed (Google PSI)
- 2 cards: "Google PageSpeed" (raw scores Mobile + Desktop side-by-side, direct from Google) + "Modonty Health Score" (separate aggregate of our own checks: security headers, DNS, SEO essentials, CWV)
- **Critical bug caught by user:** initial UI showed misleading 70/100 vs Google's 57. Two bugs found + fixed: `URLSearchParams.set("category", ...)` overwrote (changed to `append`), and UI mixed PSI scores with Modonty aggregate (now strictly separated).
- All free APIs: PageSpeed Insights API key + GSC service account copied from `admin/.env.local` to `console/.env.local`
- Cheerio installed: `pnpm add cheerio` ← only new dep
- Sidebar entry "صحة موقعك" with `Activity` icon

### Live test results (kimazone.net via Playwright)
- Telegram: 21/22 events delivered messages successfully (leadHigh future-ready)
- Site Health: Mobile=Perf 55, A11y 63, BP 100, SEO 91 (matches Google ✓); Desktop=Perf 42, A11y 75, BP 100, SEO 91; Modonty=58/100 Grade C
- All forms (favorite/comment) successfully submitted via Tester TG visitor account

### Key files added/changed
**New files (modonty):**
- `app/api/clients/[slug]/favorite/route.ts`
- `app/api/clients/[slug]/comments/route.ts`
- `app/clients/[slug]/components/client-favorite-button.tsx`
- `app/clients/[slug]/components/client-comments-section.tsx`
- `lib/telegram/{client,events,notify,geo}.ts` (mirrored from console)

**New files (console):**
- `app/api/telegram/webhook/route.ts`
- `app/(dashboard)/dashboard/settings/components/telegram-card.tsx`
- `app/(dashboard)/dashboard/settings/actions/telegram-actions.ts`
- `app/(dashboard)/dashboard/client-comments/{page.tsx,actions/,components/,helpers/}` (full module)
- `app/(dashboard)/dashboard/site-health/{page.tsx,components/score-hero.tsx,category-section.tsx,pagespeed-card.tsx}`
- `lib/telegram/{client,events,notify,pairing,geo}.ts`
- `lib/health/{types,ssl,dns,headers,robots,sitemap,domain,meta,schema-check,pagespeed,aggregator}.ts`

**Modified (modonty):**
- 6 API routes wired with `notifyTelegram` (article view/share/like/dislike/favorite, comments POST + reply, comment like/dislike, client view/follow/share, subscribers, contact)
- `lib/conversion-tracking.ts` (auto-fires `conversion` Telegram event)
- `app/clients/[slug]/page.tsx` (added ClientCommentsSection)
- `app/clients/[slug]/components/hero/hero-cta.tsx` (added ClientFavoriteButton)
- `lib/telegram.ts` (existing admin file unchanged — coexists with new lib/telegram/ directory)

**Modified (console):**
- `lib/ar.ts` (added telegram + clientComments + siteHealth namespaces)
- `app/(dashboard)/components/{sidebar.tsx,mobile-sidebar.tsx,dashboard-layout-client.tsx,dashboard-header.tsx}` (sidebar entries)
- `app/(dashboard)/layout.tsx` (fetches pendingClientCommentsCount)
- `app/(dashboard)/dashboard/settings/{page.tsx,actions/,components/}` (Telegram card integrated; OBS-188 prior settings rebuild also reflected)
- `dataLayer/prisma/schema/schema.prisma` (5 telegram fields added to Client model)

### Known issues / decisions deferred
- ⚠️ `leadHigh` event in catalog but no `lib/lead-scoring/` exists in modonty — future-ready (UI checkbox visible, doesn't fire)
- ⚠️ ngrok URL is local-only — production deploy requires fresh `setWebhook` curl pointing to `https://console.modonty.com/api/telegram/webhook`
- ⚠️ Bot token (`8739374417:...`) was leaked in chat twice — user accepted risk and authorized continued use; should `/revoke` and rotate before production
- ⚠️ modonty/.env.local was switched to PROD `modonty` DB to enable testing (was on `modonty_dev`) — **CRITICAL: revert before final push if dev DB needed**
- ⚠️ console/.env.local has new env vars (`TELEGRAM_CLIENT_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBHOOK_SECRET`, `GOOGLE_PAGESPEED_API_KEY`, `GSC_MODONTY_*`) — must be added to Vercel env settings before production deploy
- 🟡 Cheerio added as new dep in console/package.json — unrelated tiptap peer-dep warnings (pre-existing, not caused by this session)

### Decisions taken (architecture)
- **Telegram architecture:** Option B (single shared @ModontyAlertsBot) chosen over Option A (per-client BotFather bots). Simpler UX.
- **Site Health architecture:** No DB persistence — every page visit triggers fresh parallel checks (~3-10s with Suspense streaming). User explicitly rejected DB-backed approach.
- **GSC architecture:** Service account (existing `gsc-modonty@modonty.iam.gserviceaccount.com`) instead of OAuth-per-user — simpler, but requires each client to add the service-account email as user on their GSC property for per-client access.

### Manual setup required before production
1. Vercel env vars (console + modonty): see list above under "Known issues"
2. Telegram `/revoke` to rotate the leaked token
3. `setWebhook` curl pointing to `https://console.modonty.com/api/telegram/webhook` with the new secret
4. Verify with `getWebhookInfo`

---

## ⏳ Session 71 — 2026-04-28 (Campaigns + Notifications + Subscribers + Leads + Console UI sweep)

### Summary
Three big pieces shipped end-to-end with live Playwright tests, all on PROD DB:

**1. Campaigns Sales Teaser (console + admin) — OBS-168 + OBS-169**
- Replaced empty `/dashboard/campaigns` analytics page with high-conversion sales teaser
- 6 sections: hero ("قريباً" badge — no time commitment) · quota strip (mirrors `articlesPerMonth`) · 3 reach tiers (own/industry/full DB) · 5-step workflow · 4 features · final CTA gradient
- New Prisma model `CampaignInterest` (one-row-per-client with idempotent reach updates + auto history line in `notes` field) + 2 enums (`CampaignReach`, `CampaignInterestStatus`)
- New admin page `/campaigns/leads`: KPIs (NEW/CONTACTED/CONVERTED/CANCELLED) · search · 5 filter pills · table · Sheet drawer with WhatsApp deep-link, status workflow (auto-stamps contactedAt/convertedAt/cancelledAt), notes/history pre-block
- Sidebar: new "Campaign Leads" item under Audience group with Megaphone icon

**2. Unified Notifications Bell (admin) — OBS-170**
- User reframed Notification table as the gateway for ANY admin notification type
- Built `lib/notifications/registry.ts` (type → icon/tone/label/href fn) + 3 server actions (list / markRead / markAllRead) + Popover-based `NotificationsBell` component
- 3 types registered: `contact_reply` (blue) · `campaign_interest` (violet) · `faq_reply` (emerald). Unknown types → grey Bell fallback
- Replaced legacy `<Link href="/contact-messages">` bell + removed `ContactMessagesBadge` import from header
- **Critical Prisma+MongoDB gotcha caught + fixed**: `where: { readAt: null }` doesn't match documents missing the field. All unread queries now use `OR: [{ readAt: null }, { readAt: { isSet: false } }]`. Writers also explicitly set `readAt: null` on create.

**3. Subscribers Page Hardening (console) — OBS-172**
- Senior audit found 14 issues (2 critical / 3 high / 5 medium / 4 low) — all fixed
- 🔴 **Security:** all 5 server actions now `auth()`-checked + `ensureOwnedSubscriber` cross-tenant guard. Removed `clientId` from action signatures (callers can't spoof).
- 🔴 **CSV escape:** RFC 4180 (quote/double-quote/newline) + UTF-8 BOM (Arabic in Excel)
- 🟠 Pagination (take: 200) + sonner toasts replacing alert/confirm + dead code purge
- 🟡 Responsive grid + KPI percentage hints + polished empty states (3 contextual variants) + proper `Prisma.JsonValue` typing + Latin date format
- 🟢 Bulk select + bulk actions + search bar + Sheet drawer + filter pill "بموافقة الخصوصية" + status/consent badges with icons + trash button separated from toggle

**4. Leads Page Rebuild (console) — OBS-173**
- Senior audit found ~24 issues including **4 CRITICAL data-integrity bugs** (page returned WRONG results to client). All fixed.
- 🔴 **Stale leads** — refresh now deletes leads outside the 30-day window (was: HOT lead from 2 months ago stayed HOT forever)
- 🔴 **Anonymous→User split** — `sessionToUser` map merges anonymous activity into the known user when the same session is later linked to a userId
- 🔴 **Email always null** — bulk-fetch User table to populate `email` field (phone stays null until per-user phone capture exists)
- 🔴 **Qualification clarity** — `isQualified` now an INDEPENDENT badge alongside HOT/WARM/COLD level. Filter "مؤهل فقط" added.
- 🟠 N+1 upsert → `Promise.all` batches of 10 · Sonner toast feedback · "آخر تحديث: منذ X" timestamp · dead code purge
- 🟡 Responsive grid · empty states (3 contextual variants) · Latin dates · title matches sidebar · subtitle mentions 30-day window
- 🟢 Search bar · score progress bar visualization · detail Sheet drawer with 4-component score breakdown + WhatsApp/Email CTAs · CSV export with RFC 4180 escaping · Flame/TrendingUp/Snowflake icons for HOT/WARM/COLD
- **Live math verification:** Ahmed Osman = (viewScore 20 + timeScore 1 + interactionScore 80 + conversionScore 0)×0.25 = 25 ✓ matches DB exactly

### Live Test Results (Playwright on PROD DB, kimazone client)
- ✅ Campaigns: 6 sections render · 5 CTAs · reach update with auto history line · idempotency (same reach = no-op) · WhatsApp deep-link with pre-filled Arabic
- ✅ Admin Leads: KPIs · table · drawer · status cycle (NEW→CONTACTED→CONVERTED auto-stamps timestamps)
- ✅ Notifications Bell: badge count · dropdown · click row marks read + navigates · "Mark all read" clears badge
- ✅ Subscribers: 5 seeded test subs (incl. edge cases `smith,jr@` + `O"Brien, John`) — search/filter/bulk/drawer/CSV escape all verified · test data cleaned up after

### Files changed
**Schema (1 file):**
- `dataLayer/prisma/schema/schema.prisma` — added `CampaignInterest` model + 2 enums + `Client.campaignInterest` relation. `pnpm prisma:generate` ran successfully.

**Console (12 files):**
- `app/(dashboard)/dashboard/campaigns/actions/register-interest.ts` — NEW
- `app/(dashboard)/dashboard/campaigns/components/campaigns-teaser.tsx` — NEW
- `app/(dashboard)/dashboard/campaigns/page.tsx` — slim wrapper
- `app/(dashboard)/dashboard/subscribers/actions/subscriber-actions.ts` — full rewrite
- `app/(dashboard)/dashboard/subscribers/helpers/subscriber-queries.ts` — pagination + types
- `app/(dashboard)/dashboard/subscribers/components/subscribers-table.tsx` — full rewrite
- `app/(dashboard)/dashboard/subscribers/page.tsx` — responsive KPI grid
- `app/(dashboard)/dashboard/leads/actions/refresh-lead-scores.ts` — refactor (returns RefreshResult)
- `app/(dashboard)/dashboard/leads/components/refresh-lead-scores-button.tsx` — sonner toast feedback
- `app/(dashboard)/dashboard/leads/components/leads-table.tsx` — full rewrite (search + drawer + score viz)
- `app/(dashboard)/dashboard/leads/helpers/lead-queries.ts` — `getLeadsLastRefreshedAt` + dead code removed
- `app/(dashboard)/dashboard/leads/page.tsx` — responsive grid + last-refreshed badge
- `lib/lead-scoring/compute.ts` — sessionToUser merge + email population + delete-stale + parallel upsert
- `lib/ar.ts` — extended `campaigns` (60+) + `subscribers` (50+) + `leads` (60+) namespaces

**Admin (8 files):**
- `lib/notifications/registry.ts` — NEW
- `lib/notifications/actions.ts` — NEW
- `components/admin/notifications-bell.tsx` — NEW
- `app/(dashboard)/campaigns/leads/page.tsx` — NEW
- `app/(dashboard)/campaigns/leads/actions/leads-actions.ts` — NEW
- `app/(dashboard)/campaigns/leads/components/leads-table.tsx` — NEW
- `components/admin/header.tsx` — replaced legacy bell, removed `ContactMessagesBadge` import
- `components/admin/sidebar.tsx` — added Megaphone import + "Campaign Leads" nav item

### Pending before push
1. ⏳ Bump `console/package.json` v0.3.0 → v0.4.0 (significant new features)
2. ⏳ Bump `admin/package.json` v0.43.2 → v0.44.0 (new Campaign Leads page + Notifications Bell)
3. ⏳ Add changelog entry via `admin/scripts/add-changelog.ts`
4. ⏳ Run `bash scripts/backup.sh` for safety
5. ⏳ Final TSC sweep on both apps (already green — re-verify before push)
6. ⏳ Optional: live test all 3 features once more after server restart
7. ⏳ User explicit confirmation before `git push` (per memory rule `feedback_push_confirmation`)

### Pending issues from earlier sessions (still open)
- ⚠️ `admin/.env.local` + `console/.env.local` still point to PROD (since OBS-125). End of console session = decide whether to revert to `modonty_dev` for next session.
- CONS-001..004 HIGH security items still pending (compliance check, RLS, admin notifications for client approvals, dev button hide). Subscribers security closed one chunk; the other 4 remain.
- CTA event labels in DB still come from modonty.com tracking code (Latin) — out of scope.

### Next agent: BEFORE next push
- Bump versions (admin + console)
- Add changelog
- Run backup script
- Get explicit user push confirmation
- After push, decide on PROD-vs-dev `.env.local` state for next session

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
