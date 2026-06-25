# Next.js Upgrade — `16.3.0-canary.17` → `16.2.9` (stable)

> **Date:** 2026-06-25
> **Scope:** modonty (critical) + admin + console — all aligned to **`next@16.2.9`** (stable).
> **Why now:** modonty's Vercel deploy of v1.66.0 FAILED (the deploy step, not our code). Investigation
> proved the failure is a Vercel-platform + canary-version incompatibility, and that the ORIGINAL reason we
> were pinned to canary (the Arabic-slug bug) is now fixed in stable `16.2.9`. So we leave canary for stable.

---

## 1. The TWO problems (keep them separate — they are different)

### Problem A — the ORIGINAL reason we were on canary (the Arabic-slug bug)
- **Symptom:** every article page whose slug is **Arabic** (non-ASCII) returned **HTTP 500**. Discovered
  **while doing Indexing on Google** — it reproduced **10/10 with Googlebot smartphone UA on the origin**
  (a fresh render / **cache MISS**). Normal visitors hit the prerendered CDN cache and did NOT see it, which
  is why it was invisible until Googlebot forced fresh origin renders.
- **Exact error:** `TypeError: Invalid character in header content ["x-next-cache-tags"]` (`ERR_INVALID_CHAR`).
- **Root cause (in Next.js, NOT our code):** Cache Components (`"use cache"`) builds an implicit cache tag
  from the route path. With an Arabic slug, that tag contains non-ASCII characters. Next.js put it **raw**
  into the `x-next-cache-tags` HTTP response header. Node's `validateHeaderValue` rejects any byte outside
  `\t\x20-\x7e` → throws → 500 on every affected request.
- **Our slug is correct** by web standards. The bug was Next.js not percent-encoding the tag.
- **The fix:** PR **#93601** "Encode non-ASCII characters in cache tags at construction" — adds an
  `encodeCacheTag()` helper applied at the public boundaries (`getImplicitTags`, `validateTags`,
  `revalidatePath`/`revalidateTag`/`updateTag`). Merged into `canary` 2026-05-07.
- **Why canary.17 specifically (back on 2026-05-27):** it was the first canary that contained #93601 AND was
  BEFORE the new defaults enabled in canary.24-26 (`rootParams`, `varyParams`, `optimisticRouting`,
  `cachedNavigations`). See `documents/tasks/ARABIC-SLUG-DECISION.md`.

### Problem B — the NEW deploy failure (2026-06-25, what triggered this upgrade)
- **Symptom:** modonty deploy of v1.66.0 → Vercel build **succeeded** (`Build Completed in 37s`, all pages
  prerendered), then the **deploy step** failed:
  > `Cannot patch preview comments when immutable static file upload is enabled.`
  > `Upgrade to next@v16.3.0-canary.32 or newer to resolve this.`
- **What it means (Vercel internals, NOT our code, NOT Cloudinary):**
  - "static files" = the build OUTPUT Next.js produces (compiled JS + prerendered HTML) — NOT user uploads.
  - "immutable static file upload" = Vercel's deploy step that uploads those build files to its CDN and
    locks them (each file fingerprinted, never changes).
  - "preview comments" = a Vercel feature that injects code into pages so the team can comment on previews.
  - **Conflict:** Vercel enabled immutable-upload on their side; it locks the files; the preview-comments
    patcher then can't modify them → deploy fails. Fixed in `next@16.3.0-canary.32+`.
- **Proof it was Vercel-side, not us:** v1.65.5 (yesterday 2026-06-24) deployed **READY** on the SAME
  `16.3.0-canary.17`. v1.66.0 (today) FAILED on the **same** Next version with only trivial UI code
  (gallery lightbox + a Google-analytics box). The v1.66.0 commit did **not** touch the `next` dependency.
  The only variable that changed between yesterday and today = **Vercel enabled immutable-upload**. Our
  deploy was simply the first modonty deploy after that switch flipped.
- **Why only modonty, not admin/console:** modonty was on the **canary** line (16.3) which triggers the
  conflict; admin/console are on **16.2.x stable** which does not. (admin/console deploys were also CANCELED
  via `ignoreCommand`, so they didn't attempt to deploy on that push anyway.)

---

## 2. Why `16.2.9` solves BOTH

| Problem | Fixed in 16.2.9? | Evidence |
|---|---|---|
| A — Arabic `ERR_INVALID_CHAR` | ✅ YES | #93601 was backported to the `next-16-2` branch via **PR #93918** (merged 2026-05-19). Verified from the OFFICIAL source at git tag **`v16.2.9`**: `packages/next/src/server/lib/encode-cache-tag.ts` exists with the exact percent-encoding function, and `packages/next/src/server/lib/implicit-tags.ts` imports + applies `encodeCacheTag()` on the pathname tag (the exact line that was crashing). The code is **byte-identical** to canary.17 — the version running in production NOW, serving Arabic articles to Googlebot with zero crashes. |
| B — Vercel immutable-upload deploy | ✅ YES (by leaving canary) | The conflict is specific to the 16.3-canary output. Stable 16.2.x does not trigger it (admin/console on 16.2.x deploy fine). Moving modonty to 16.2.9 stable removes the canary output entirely. |

**Cache Components support:** `cacheComponents: true` / `"use cache"` is **GA since 16.0.0** (it unified the
old `ppr` + `useCache` + `dynamicIO` flags) — confirmed via Context7 official docs. So 16.2.9 fully supports
our `"use cache"` usage. The build test confirmed it (next §3).

---

## 3. Pre-upgrade verification (what we did before changing the repo)

1. **Code-level proof (the decisive one for Problem A):** confirmed `encodeCacheTag` present + wired at the
   official `v16.2.9` tag, identical to prod-working canary.17.
2. **Isolated build test:** created a throwaway git worktree, bumped modonty to `next@16.2.9`, ran
   `pnpm install` + `pnpm build:modonty`. Result:
   - `▲ Next.js 16.2.9 (Turbopack)` · `- Cache Components enabled`
   - `✓ Compiled successfully in 26.9s`
   - `Finished TypeScript in 41s` (zero type errors)
   - Build then stopped only at `AUTH_SECRET environment variable is required` — an env var missing in the
     **isolated copy** (we copied `.env.shared` but not `modonty/.env.local`). **NOT a 16.2.9 problem.**
   - ⇒ Conclusion: modonty's code (all `"use cache"` Cache Components) **compiles + type-checks clean on
     16.2.9**. No breaking change from canary.17.
3. **Note on local testing limits:** Problem A only manifests on **origin cache-MISS renders** (Googlebot /
   indexing). A local `next start` serves prerendered pages and bypasses the failing header path, so a local
   "open the Arabic article" check can show "works" even on a broken version (false positive). That is why
   the **code-level proof** (step 1) is the authoritative evidence for Problem A, and the **Vercel deploy**
   is the authoritative confirmation for Problem B.

---

## 4. The upgrade applied

- `modonty/package.json`: `next` + `eslint-config-next` `16.3.0-canary.17` → **`16.2.9`**
- `admin/package.json`:   `next` + `eslint-config-next` `^16.2.2` → **`16.2.9`** (was resolving to 16.2.4)
- `console/package.json`: `next` + `eslint-config-next` `^16.2.2` → **`16.2.9`**
- `pnpm install` (updates `pnpm-lock.yaml` — required so Vercel's frozen-lockfile install matches).
- `pnpm prisma:generate` (the install skips postinstall scripts by default).
- React stays `^19.2.4` (compatible with 16.2.9).

---

## 5. 🔻 DOWNGRADE — if something breaks after this upgrade

**If the Arabic 500 / `ERR_INVALID_CHAR` returns** (watch GSC URL Inspection + Googlebot fetches + any 500 on
`/articles/<arabic-slug>` on the origin), OR a 16.2.9 regression appears:

1. Revert the version pins to the last-known-good canary:
   - `modonty/package.json`: `next` + `eslint-config-next` → `16.3.0-canary.17`
   - (admin/console can stay on 16.2.9 — they were never the problem.)
2. `pnpm install` → `pnpm prisma:generate`
3. Commit + push. modonty redeploys on canary.17.
   - ⚠️ If the Vercel **immutable-upload** deploy error returns on canary.17, then bump modonty to a 16.3
     line that satisfies it instead: **`16.3.0-canary.67`** (latest canary) or **`16.3.0-preview.4`** (more
     stable 16.3 prerelease). Both contain the same `encodeCacheTag` fix.

**Fastest git revert** (if the upgrade was a single commit `<HASH>`):
```
git revert <HASH>      # then pnpm install + prisma generate + push
```

---

## 6. How to detect WHERE a future failure is (triage map)

| What you see | Where the fault is | Action |
|---|---|---|
| `ERR_INVALID_CHAR` / 500 on Arabic article from **origin / Googlebot** | Cache-tag encoding (Problem A) regressed | Confirm `encodeCacheTag` is in the installed `next` (`node_modules/next/dist/server/lib/encode-cache-tag.js`). If missing → downgrade to canary.17. |
| Vercel **build** fails (TypeScript / compile error) | OUR code vs the new Next version | Read the build log; fix the code, or downgrade. |
| Vercel **build succeeds** but **deploy step** fails with `immutable static file upload` / `preview comments` | Vercel platform vs Next version (Problem B) | Need a Next version Vercel accepts — 16.2.x stable, or 16.3 ≥ canary.32. |
| Normal users see articles fine but Google can't index | origin-only bug (like Problem A) — cache hides it from users | Test via GSC URL Inspection (Live Test), not just a browser visit. |

---

## 7. Key reference files
- `documents/tasks/ARABIC-SLUG-DECISION.md` — the original 2026-05-27 investigation (why canary.17).
- Official source: `vercel/next.js` @ tag `v16.2.9` → `packages/next/src/server/lib/encode-cache-tag.ts`.
- PRs: #93601 (the fix) · #93918 (backport to 16.2).
