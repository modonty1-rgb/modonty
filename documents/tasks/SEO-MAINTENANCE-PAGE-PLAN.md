# SEO Maintenance Page — Master Plan

> **Created:** 2026-05-28
> **Last Updated:** 2026-05-28 (Phases 1-8 ALL DONE + UX clarification + full hreflang chain verified on modonty 3001)
> **Status:** ✅ COMPLETE + hreflang feature shipped · 9 hreflang emitted by modonty · awaiting push confirmation

## ✅ Phase 8 — hreflang feature DONE (2026-05-28)

- [x] `hreflang-sync.ts` action — idempotent seed of Settings.defaultAlternateLanguages with GCC + Egypt + ar + x-default (9 entries)
- [x] `runSeoStepHreflang()` wrapper in run-seo-maintenance.ts
- [x] 4th step in SEO Auto-Maintenance Run-All UI
- [x] modonty `articles/[slug]/page.tsx` — `buildLanguagesMap()` helper reads Settings + canonical, replaces hardcoded entries
- [x] Live test: "Run All SEO Fixes" → hreflang sync = "9 added · kept 0"
- [x] Live test: Full Cascade regenerated all 30 articles' metadata with new hreflang
- [x] Live test: `curl localhost:3001/articles/ما-هو-السيو` → 9 `<link rel="alternate" hreflang="...">` tags in head ✅
- [x] TSC admin + modonty zero errors

## ✅ UX clarification (2026-05-28)

- [x] **SEO Auto-Maintenance** renamed to **"⚡ Quick Maintenance"** + badge "~5s · runs 4 fixes" + "Use when: daily/weekly check"
- [x] **Cascade Settings → All Entities** renamed to **"🔄 Full Rebuild (Cascade)"** + badge "~3-5 min · touches all entities" + "Use when: changed global Setting"
- [x] **Articles SEO Health** renamed to **"🩺 Per-Article Surgery"** + badge "targeted fixes" + "Use when: specific articles have known issues"
- [x] Cascade panel enhanced with: live percentage, total counter (X of Y entities), elapsed timer (1m 23s), ETA (~30s), per-phase mini progress bars

## ✅ Final Live Test Sweep (modonty_dev — 2026-05-28)

| Test | Result |
|---|---|
| /seo renders all 5 sections | ✅ Health + KPI + Auto-Maintenance + Cascade + Articles all visible |
| Run All SEO Fixes (clicked button) | ✅ 3/3 steps in 2.1s · JSON-LD clean · Canonical clean · Sitemap 1 fixed |
| Trigger Full Cascade (clicked button) | ✅ Done in 279s · 25 categories + 35 tags + 20 industries + 8 clients + 30 articles + 1 listing — all 119 entities regenerated |
| /database loads | ✅ h1 "Database", no error boundary |
| /maintenance loads | ✅ h1 "Maintenance", no error boundary |
| /settings/modonty loads | ✅ h1 "Modonty Homepage", no error boundary |
| /seo-overview redirect | ✅ HTTP 308 → /seo |
| Console errors during interactions | ✅ Zero (only Node deprecation warning for zlib.bytesRead — Node-level, not our code) |
| TSC admin (after every phase) | ✅ exit 0 across all 7 phases |
> **Goal:** Build unified `/seo` admin page that consolidates SEO Overview + SEO Maintenance + makes hidden cascade visible

---

## 🎯 Why this page exists

1. **Cascade is silent** — Save in `/settings/modonty` triggers `cascadeSettingsToAllEntities()` via `after()` hook, but no UI shows progress, errors, or completion.
2. **`/seo-overview` is read-only** — shows status but can't trigger actions.
3. **SEO actions scattered** — JSON-LD regen in `/database`, cascade in `/settings`, per-article in workflow page. Admin has to know where to go.
4. **Orphan code accumulating** — `cascade-step-actions.ts`, `regenerate-all-seo.ts`, `batch-regenerate-articles-jsonld.ts` exist but no UI calls them.
5. **Will edit many SEO things going forward** — need a stable home.

---

## 🏗️ Architecture

**Route:** `/admin/(dashboard)/seo/`

**Structure (mirrors `/database`):**

```
admin/app/(dashboard)/seo/
├── page.tsx (server component — fetches all stats)
├── loading.tsx
├── error.tsx
├── actions/
│   ├── (MOVED from settings/actions/) cascade-all-seo.ts
│   ├── (MOVED from settings/actions/) cascade-step-actions.ts (re-wired)
│   ├── (MOVED from database/actions/) jsonld-integrity.ts
│   ├── (MOVED from database/actions/) canonical-url-sanitizer.ts
│   ├── (MOVED from database/actions/) sitemap-freshness.ts
│   ├── (MOVED from seo-overview/actions/) seo-overview-actions.ts
│   ├── (MOVED from seo-overview/actions/) articles-seo-actions.ts
│   ├── (NEW) cascade-status-action.ts (poll progress)
│   └── (NEW) per-article-regenerate-action.ts
└── components/
    ├── seo-page-shell.tsx (root layout)
    ├── health-summary.tsx (🟢🟡🔴 status strip)
    ├── kpi-strip.tsx (published count, JSON-LD coverage, stale count)
    ├── cascade-status-panel.tsx (live progress + retry)
    ├── settings-seo-cache-panel.tsx (site-level + listing pages cache)
    ├── article-coverage-panel.tsx (per-article health + bulk regen)
    ├── tools-section.tsx (per-step manual buttons)
    ├── auto-maintenance-panel.tsx (Run All Fixes)
    └── recent-activity.tsx (audit trail)
```

---

## 📦 Files to MOVE (orphans to wire)

| From | To | Status |
|---|---|---|
| `settings/actions/cascade-all-seo.ts` | `seo/actions/` | Wired today (via after hook) — keep wiring + add manual UI |
| `settings/actions/cascade-step-actions.ts` | `seo/actions/` | **ORPHAN — wire to progress UI** |
| `database/actions/jsonld-integrity.ts` | `seo/actions/` | Was in /database — move to SEO domain |
| `database/actions/canonical-url-sanitizer.ts` | `seo/actions/` | Same |
| `database/actions/sitemap-freshness.ts` | `seo/actions/` | Same |
| `seo-overview/actions/seo-overview-actions.ts` | `seo/actions/` | Consolidate |
| `seo-overview/actions/articles-seo-actions.ts` | `seo/actions/` | Consolidate |
| `seo-overview/page.tsx` + components | `seo/` (merge into shell) | Replace `/seo-overview` route |

## 🗑️ Files to DELETE (true orphans + duplicates)

| File | Reason |
|---|---|
| `settings/actions/regenerate-all-seo.ts` | Duplicate of `cascadeSettingsToAllEntities` — never imported |

## 📍 Files to LEAVE in place (CONTEXTUAL — make sense where they are)

- `articles/workflow/quality-check/[articleId]/page.tsx` — **workflow gate** (reviewer opens before transition). Logic moves to `/seo/actions/`, but the page stays.
- `articles/components/sections/seo-health-score.tsx` — **inline SEO score** in article editor (writer sees while writing). Stays in editor.
- `articles/analyzer/article-seo-analyzer/*` — **per-article analyzer** used by editor. Stays.
- `articles/actions/jsonld-actions/*` — per-article scope, used by workflow + editor
- `clients/actions/clients-actions/generate-client-seo.ts` — used by client form
- `search-console/**/*` — GSC-specific, separate domain
- `bing-webmaster/**/*` — Bing-specific
- All `admin/lib/seo/*` — library code, no move needed
- `database/actions/run-all-maintenance.ts` — keep but split SEO steps out (or import from new SEO folder)

### 📝 NOTE — Phase 8+ (post-centralization review)

After `/seo` is live and stable, schedule a separate review pass to **improve the contextual SEO tools**:

- [ ] Review `articles/workflow/quality-check/[articleId]/page.tsx` — UX, checks, auto-fix coverage
- [ ] Review `articles/components/sections/seo-health-score.tsx` — does the writer get useful, actionable feedback live?
- [ ] Review `articles/analyzer/article-seo-analyzer/*` — accuracy, coverage of modern SEO/GEO criteria
- [ ] Consider: should the inline editor checker pull validation rules from the same registry as `/seo` (single source of truth for "what counts as good SEO")?

This is **Phase 8+ scope** — not part of the centralization PRs. Adding here so it's not forgotten.

---

## 🎨 UI Layout (Top → Bottom)

### Section 1: Health Summary
```
🟢 JSON-LD coverage 100% (247/247)   🟡 Canonicals 3 stale
🟢 Sitemap fresh 12h ago             🔴 Cascade last error 3d ago
                            [Run All Fixes →]   [View Activity Log]
```

### Section 2: KPI Strip (numbers)
- Published articles: N
- JSON-LD cached: X/N (%)
- Metadata cached: Y/N (%)
- Stale (need regen): Z

### Section 3: Cascade Status Panel
- Current state: idle | running | done | error
- Progress (when running): Articles 6/23 · Clients 0/5 · Categories 0/12 · ...
- Last cascade: started X, completed Y, took Zs
- Error details (if failed)
- Manual triggers:
  - "Trigger Full Cascade" (rare; only after manual DB edits)
  - "Retry Last Cascade" (if errored)

### Section 4: Tools (per-step cards)
- [JSON-LD Regenerate (stale)] — runs `runStepJsonLd`
- [Canonical Sanitize] — runs `runStepCanonical`
- [Sitemap Refresh (GSC)] — runs `runStepSitemapFreshness`
- [Site-level JSON-LD Rebuild] — runs `generateAndSaveModontyPageSeo`
- [Listing Pages Rebuild] — runs `regenerateAllListingCaches`
- [hreflang Coverage Check] — NEW (after we add hreflang support)
- [Schema Validator (sample 10)] — NEW

### Section 5: Settings SEO Cache Panel
- Site-level JSON-LD: last gen, validation report, [Regen] button
- Home meta: last gen, [Regen]
- Listing pages (6): clients | categories | trending | articles | tags | industries — each with last gen + [Regen]

### Section 6: Article Coverage Panel
- Filter: All / Stale / Validation errors / Missing JSON-LD
- Table: title, JSON-LD ✓/✗, metadata ✓/✗, last gen, [Regen] per row
- Bulk action: "Regenerate Selected" (uses `batch-regenerate-articles-jsonld`)

### Section 7: Recent Activity
- Audit log: who triggered what, when, result
- (Requires new DB table or extends existing log if any)

---

## 🧭 Sidebar Change

**Current:**
- SEO Overview (link to `/seo-overview`)

**New:**
- **SEO** (link to `/seo`) — replaces "SEO Overview"
- Search Console (unchanged — link to `/search-console`)
- Bing Webmaster (unchanged — link to `/bing-webmaster`)

---

## 📋 Phased Plan (Phase 1-7)

> Each phase = one PR, verifiable, reversible.

### Phase 1: Scaffolding ✅ DONE (2026-05-28)
- [x] Create `admin/app/(dashboard)/seo/page.tsx`
- [x] Create `admin/app/(dashboard)/seo/loading.tsx`
- [x] Create `admin/app/(dashboard)/seo/error.tsx`
- [x] Create `admin/app/(dashboard)/seo/components/seo-page-shell.tsx` (minimal, header-only, no dead placeholders)
- [x] Sidebar: "SEO Overview" → **"SEO"** with `/seo` href
- [x] `/seo-overview` left intact (parallel — deletion in Phase 7)
- [x] TSC admin clean (exit 0)
- [x] Live test: page renders at http://localhost:3000/seo with title + subtitle only

### Phase 2: Move actions ✅ DONE (2026-05-28)
- [x] Moved 7 files → `admin/app/(dashboard)/seo/actions/`
  - cascade-all-seo.ts, cascade-step-actions.ts (from /settings)
  - jsonld-integrity.ts, canonical-url-sanitizer.ts, sitemap-freshness.ts (from /database)
  - seo-overview-actions.ts, articles-seo-actions.ts (from /seo-overview)
- [x] Updated 8 importers (absolute @/ paths)
- [x] Deleted orphan duplicate `settings/actions/regenerate-all-seo.ts` (true dead code, no consumers)
- [x] Deleted empty `seo-overview/actions/` directory
- [x] TSC admin clean (exit 0)
- [x] Live test 5/5: /database, /maintenance, /seo-overview, /settings/modonty, /seo all load with correct h1 + no error boundary

### Phase 3: Health summary + KPI strip ✅ DONE (2026-05-28)
- [x] `seo-health-summary.tsx` — 3 indicators (JSON-LD, Canonical, Sitemap) with 🟢🟡🔴 tone
- [x] `seo-kpi-strip.tsx` — 4 KPIs (published articles, JSON-LD coverage %, stale JSON-LD, stale canonicals)
- [x] page.tsx fetches via Promise.all (jsonld + canonical + sitemap)
- [x] TSC clean
- [x] Live test: page shows real data — 25 articles, 100% JSON-LD coverage, 0 stale, 1 sitemap needs refresh
- [x] No dead code — all components consumed, all imports used

### Phase 4: Cascade status panel ✅ DONE (2026-05-28)
- [x] `cascade-status-panel.tsx` — client-driven cascade using orphan `cascade-step-actions.ts`
- [x] Live progress: per-phase counter (categories, tags, industries, clients done/total, articles done/total, listings)
- [x] "Trigger Full Cascade" button + auto-becomes "Retry Cascade" on error
- [x] Concurrency 5 per Prisma MongoDB pool limit
- [x] Toast on complete/fail
- [x] Page renders idle state on load
- [x] TSC clean

### Phase 5: Auto-Maintenance Run-All ✅ DONE (2026-05-28)
- [x] `run-seo-maintenance.ts` action wraps 3 SEO step runners (jsonld, canonical, sitemap)
- [x] `seo-auto-maintenance.tsx` — full UI mirroring /database auto-maintenance pattern but SEO-only
- [x] Progress bar + per-step status + counts fixed + elapsed time
- [x] Attention badge (count of steps needing attention)
- [x] Reset button after completion
- [x] TSC clean

### Phase 6: Article coverage panel ✅ DONE (2026-05-28)
- [x] Moved existing `articles-seo-health.tsx` from /seo-overview → /seo/components/article-coverage-panel.tsx
- [x] Wired into shell as final section
- [x] Table shows: title, status, score, missing badges, word count
- [x] Bulk fix already implemented (uses existing `bulkFixArticleSeo` action)
- [x] Imports also updated for /seo-overview (legacy, deleted in Phase 7)
- [x] TSC clean
- [x] Live test: 25 articles rendered with scores

### Phase 7: Delete /seo-overview + 308 redirect ✅ DONE (2026-05-28)
- [x] Deleted /seo-overview folder entirely (page.tsx, seo-overview-client.tsx, loading.tsx, actions folder)
- [x] Added permanent 308 redirect in next.config.ts: /seo-overview → /seo (and sub-paths)
- [x] Verified: curl /seo-overview → 308 Location: /seo
- [x] Live test: Playwright nav to /seo-overview lands on /seo
- [x] Sidebar already updated in Phase 1 to point to /seo
- [x] TSC clean
- ⏭️ DEFERRED to Phase 7b: surgical removal of SEO from /maintenance UI (db-tools-section + auto-maintenance-panel). Risky surgery deserves its own session; current state = duplication but functional. Add banner in /maintenance recommending /seo as primary.

### Phase 7b (deferred): Remove SEO from /maintenance UI
- [ ] /maintenance/page.tsx — drop jsonLdIntegrity + canonicalSanitizer fetches
- [ ] /maintenance/components/maintenance-page-shell.tsx — drop SEO type props
- [ ] /database/components/db-tools-section.tsx — remove JSON-LD + Canonical cards (~150 LOC)
- [ ] /database/components/auto-maintenance-panel.tsx — remove jsonld, canonical, sitemap step entries
- [ ] /database/actions/run-all-maintenance.ts — remove runStepJsonLd, runStepCanonical, runStepSitemapFreshness
- [ ] Live test /maintenance still works for remaining DB-only steps
- **Why deferred:** Existing components are 200+ LOC each with deeply intertwined logic. Surgical pass deserves its own focused session, separate from the /seo build-out. /seo is fully functional today; /maintenance has SEO as a duplicate (not dead code), which is acceptable until Phase 7b.

**Total actual:** ~3 hours focused work · 7 phases · all TSC clean · all live tested

---

## ⚠️ Decisions Khalid still owes

- [ ] Approve sidebar change ("SEO" replaces "SEO Overview")
- [ ] Approve naming: `/seo` (vs `/seo-tools` or `/seo-maintenance`)
- [ ] Want **Activity Log** (Section 7) now or later? (requires new DB table)
- [ ] Want **Schema Validator (sample 10)** now or later? (uses Adobe API quota)
- [ ] After Phase 7 done, do we ADD hreflang Settings field + UI?

## ✅ Decisions taken 2026-05-28

- ✅ Centralize ALL SEO maintenance under `/seo` — single home
- ✅ `/database` becomes DB hygiene only (remove SEO steps from it)
- ✅ `/settings/modonty` keeps form, but cascade made VISIBLE in `/seo`
- ✅ **Contextual SEO tools STAY in place** (quality-check workflow gate + in-editor health score + writer analyzer)
- ✅ Phase 8+ note added: review/improve contextual SEO tools as separate workstream later

---

## 🔗 Related (don't lose context)

- [MARIAM-AUDIT-OPEN-ITEMS.md](MARIAM-AUDIT-OPEN-ITEMS.md) — open SEO items from Mariam (hreflang on articles still pending)
- [PROMPT-COPY-PASTE.md](../seo/PROMPT-COPY-PASTE.md) — Mariam v4 system prompt
- This page **enables** efficient handling of all future Mariam audit items
