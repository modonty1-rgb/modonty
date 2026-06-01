# TODO — Centralize Client Classification (single source of truth)

> **Goal:** `legalForm` + `organizationType` option values defined ONCE in `dataLayer`,
> consumed by admin + console + sanitizer. DB columns stay `String?`. `normalize()`
> guards every write so the DB only ever holds canonical values.
> **Why:** console wrote free-text Arabic; admin enforced an English enum → mismatched
> values silently blocked ALL saves on the affected client (root cause of devnadish).
>
> **Last Updated:** 2026-06-01

## Phases — one at a time, TSC + verify after each

- [x] **A. Shared file** — `dataLayer/lib/constants/client-classification.ts` ✅ verified 20/20 unit tests
  - `LEGAL_FORMS` + `ORGANIZATION_TYPES` (value + ar + patterns), value tuples, `normalizeLegalForm` / `normalizeOrganizationType`.
  - **Verified:** `normalize("مؤسسة فردية")→"Sole Proprietorship"`, `"ذ.م.م"→"LLC"`, `"مساهمة مبسطة"→"Simplified..."` (not JSC), canonical pass-through, junk→null.
- [x] **B. Admin reads shared** ✅ — `client-form-schema.ts` derives `z.enum` from `LEGAL_FORM_VALUES`/`ORGANIZATION_TYPE_VALUES`; `legal-section.tsx` + `seo-section.tsx` dropdowns map over `LEGAL_FORMS`/`ORGANIZATION_TYPES`. admin TSC = 0.
- [x] **C. Console writes safe** ✅ — `profile-form.tsx` free-text → `<select>` dropdowns (shared options, store English value); initial values normalized on load; `updateProfile` runs `normalize()` before save. console TSC = 0. **Live: reload shows `legalForm="Sole Proprietorship"`, `organizationType="LocalBusiness"`** (canonical English stored).
- [x] **D. Sanitizer** ✅ — `legalform-sanitizer.ts` rewritten to use shared `normalize()` (private table dropped) + generalized to both fields; `runStepOrganizationType` added to Run-All. **Live: detected 1/12 → devnadish `مؤسسة فردية`→`Sole Proprietorship`, sanitized.**
- [x] **E. Cleanup + full verify** ✅ — sanitizer ran → devnadish **saved OK** (validation passed, navigated to /clients) → modonty live JSON-LD: `hasMap`/`geo`/`openingHours`/`priceRange` **GONE**, `logo` present, GBP in `sameAs`, `dateModified` fresh. Console dropdowns live-verified.

## Self-healing maintenance tools (added 2026-06-01)
> Goal: Database Maintenance detects + fixes legacy/new data drift automatically so Production stays 100% clean.

- [x] **legalForm + organizationType sanitizers** — Run-All steps + cards (source: dataLayer enum). Done earlier today.
- [x] **Canonical URL sanitizer** — `database/actions/canonical-sanitizer.ts`. Scans `canonicalUrl` across **6 entities** (clients · articles · categories · tags · industries · authors). Flags wrong-host (vs `Settings.siteUrl`), double-encoded (`%25`), or wrong-path. Fix = rebuild `{siteUrl-origin}/{path}/{slug}` + **regenerate** that entity's SEO (so live page updates). Source of truth = `Settings.siteUrl`.
  - Wired: Run-All step ("Canonical URLs") + detection **card** in `/maintenance` (count + before→after preview + isolated Fix button).
  - **Verified:** admin TSC = 0 · detection logic **9/9 unit test** · card renders · `Settings.siteUrl` = `https://www.modonty.com`.
  - **LIVE before/after PASSED (2026-06-01, modonty_dev):** injected non-www canonicals into 1 client + 1 tag (+ 1 ASCII category that stayed valid). Card showed **"2 need fixing / 2 of 125"** with before→after; category correctly NOT flagged (no over-flagging). Clicked **Fix** → card → 0. DB read-back: both corrected to `https://www.modonty.com/...`. **Live modonty pages canonical = www for BOTH** (client `/clients/شركة-جبر-سيو` + tag `/tags/google` — regen propagated, verified in browser). Tool works end-to-end, 100%. Test scripts deleted; injected data left correct.
- [ ] **Robots / contactType / language** — N/A as per-entity tools: clients/articles read these from `Settings` live at generation (no per-row column drift). Only `Settings`-level + Modonty-pages. No tool needed.

## Out of scope (follow-up)
- `metaRobots` (7 files, admin-only — clients + articles + pages) and `contactType` (free vocab both sides): add to the same shared file in a later pass.
- Prisma enums (`subscriptionTier/Status`, `paymentStatus`) already single-source — no action.

## Done — ALL PHASES COMPLETE (2026-06-01)
- **A. Shared file** — `dataLayer/lib/constants/client-classification.ts` + verified 20/20 unit tests.
- **B. Admin** reads shared (zod + 2 dropdowns). TSC = 0.
- **C. Console** dropdowns + normalize on save. TSC = 0. Live: stores canonical English.
- **D. Sanitizer** uses shared normalize, covers both fields, wired into Run-All.
- **E. Full live test PASSED** — devnadish saved, `hasMap` gone on modonty, console=admin canonical.

**Not yet pushed.** Pending: version bump (admin + console) + changelog + secret-scan + push (needs Khalid's go-ahead).

### Pre-push deploy-safety check (Vercel / dataLayer shared imports) — VERIFIED 2026-06-01
Khalid flagged: this batch is the FIRST to import shared SOURCE from `@modonty/database` (prod never did this). Risk = raw-TS workspace pkg, no `transpilePackages`, no tsconfig `paths` → "dev works, build fails" on Vercel.
- **Evidence:** `git grep "@modonty/database" HEAD` = 0 code imports in all 3 apps (dep declared `workspace:*` only). New imports (working tree): admin + console = classification constants + `lib/seo/{client/from-client,client/seo-score,generate-organization-jsonld}`; modonty = none.
- **Docs (Context7/Next.js):** Turbopack/Webpack-App-Router auto-transpile *workspace* packages; only *node_modules* raw-TS deps need `transpilePackages`. Hybrid case → settled by build.
- **Decisive: local `next build` (= Vercel's exact cmd):** admin → `✓ Compiled successfully in 73s`, EXIT 0; console → EXIT 0. No "Module parse failed"/"Cannot find module". Shared dataLayer source transpiles fine without `transpilePackages`.
- **ignoreCommand:** all 3 `vercel.json` watch `../dataLayer/` → shared edits rebuild all apps. ✅
- **Prod baseline healthy:** admin latest prod READY (v0.66.3); console+modonty last READY 2026-05-30 13:38 (later CANCELED = correct ignoreCommand skips); live HTTP admin/console/modonty = 200.
- **Verdict:** push is SAFE re: dataLayer shared-import concern.

## Already done this session (separate, not yet pushed)
- Validation banner at top of edit form (replaces silent save failure) + simple non-technical messages.
- Fixed false "Logo missing" preview (mapped `logoMedia`/`heroImageMedia` into form state).
- **Fixed forbidden-keyword false positive** (`admin/lib/seo/pre-publish-audit.ts` → `scanForbidden`). Was substring `includes()` → "رخيص" wrongly matched inside "ترخيص/وترخيصه" and BLOCKED publish (live on PROD: كيما زون scheduled article). Now whole-word + Arabic clitic-aware (و/ف/ب/ك/ل/ال + ة/ه/ها…) + tashkeel-stripped. Catches رخيص/الرخيص/رخيصة, ignores ترخيص. Fixes both publish paths (transition-article + update-article) via the one shared fn; console has no scan (TODO only). **Verified: 9/9 cases + admin TSC=0. Needs push to fix PROD.**
