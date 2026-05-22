---
name: modonty-code-refactor
description: |
  Strict, behavior-preserving refactor skill for the Modonty monorepo
  (modonty.com / console.modonty.com / admin.modonty.com / dataLayer).
  Use this skill whenever Khalid asks to "refactor", "clean up", "audit code",
  "review code", "reduce complexity", "minimize DOM", "deduplicate components",
  or "fix folder structure" on any Modonty app. Triggers also on Arabic:
  "ريفاكتور" · "نظف الكود" · "راجع الكود" · "قلل التعقيد".
  The skill enforces ZERO functional changes — same UI, same logic, same
  behavior — and produces a phased, atomic, fully revertable refactor.
  For tool-level mechanics (knowledge graph queries, dead-code detection,
  rename previews), this skill builds on top of the `Refactor Safely` skill.
---

# Modonty Code Refactor Skill — v2

Senior reviewer/refactorer for Khalid's stack:
**Next.js 16 App Router · React 19 · TypeScript strict · tRPC · Prisma + MongoDB · shadcn/ui · Tailwind · next-intl (ar/en) · pnpm workspaces · Vercel.**

This skill builds on top of:
- Khalid's global rules: `~/.claude/CLAUDE.md`
- Project memory: `~/.claude/projects/c--Users-w2nad-Desktop-dreamToApp-MODONTY/memory/`
- The `Refactor Safely` skill (for `code-review-graph` MCP tool usage)

Anything in those takes priority over this skill if there's a conflict.

---

## 🔒 The Prime Directive

> **Refactor only. Never change behavior.**
> Same UI · Same logic · Same network calls · Same routes · Same outputs.
> If a change *might* alter behavior, **STOP and ask** before doing it.

If during the audit you find a real bug, do **not** silently fix it. Log it
under `BUGS_FOUND.md` and let Khalid decide whether to spin a separate task.

---

## 📋 Memory & Project Context (Always Apply)

When this skill runs, it inherits and respects these existing project rules:

- **Push needs explicit user confirmation** — never auto-push.
- **Version bump before push** — `admin/package.json` etc.
- **Backup before push** — `bash scripts/backup.sh` is non-optional.
- **Changelog with every push** — `pnpm tsx admin/scripts/add-changelog.ts`.
- **Session context handoff** — update `documents/context/SESSION-LOG.md`
  before every push so the next agent has full context.
- **TSC strategic** — `pnpm tsc --noEmit` per phase end + before push.
  **Never** after every small edit.
- **NEVER seed/script PROD DB** — read .env first, state the URL, then act.
- **Prisma edits = kill servers first** — `taskkill //F //IM node.exe` →
  `pnpm prisma:generate` → restart servers. Schema is in `dataLayer/`.
- **Context7 mandatory** before any package/library decision.
- **Plan before code** — large tasks need explicit per-step approval.

---

## 🛑 Hard Limits — STOP and Ask Before Any of These

1. Renaming a route folder (changes URL → SEO impact).
2. Changing a Prisma schema field (`dataLayer/prisma/schema/schema.prisma`).
3. Changing a tRPC procedure name, input shape, or output shape.
4. Removing a dependency.
5. Touching `next-intl` message keys (`messages/ar.json`, `messages/en.json`).
6. Touching auth (`lib/auth.ts`, NextAuth config), billing, or admin
   permission code.
7. Anything in `console.modonty.com` permission tiers
   (Basic / Standard / Pro / Premium).
8. **Cross-app component duplication** — if a component is duplicated across
   `admin + modonty + console`, lifting it requires creating/modifying a
   shared package (currently none exists for UI). STOP — this is an
   architectural decision.
9. Touching `dataLayer/` directly (Prisma client, generated types).
10. Touching the design tokens or `tailwind.config.{js,ts}`.

---

## 📐 Non-Negotiable Rules

### Behavior preservation

1. **Zero functional change.** No new features, no removed features, no
   altered API shapes, no changed copy, no changed styling outputs, no
   changed render order, no changed loading states.
2. **Server↔Client boundary changes require pre-verification.** Before
   removing `"use client"`, prove that no descendant relies on a hook,
   browser API, or event handler — directly OR transitively. If unsure,
   **don't change it.**
3. **No memo additions during refactor.** `useMemo` / `useCallback` /
   `React.memo` introductions change render timing. Out of scope. Flag
   as a separate "perf-pass" task instead.
4. **No SEO/a11y additions during refactor.** Adding canonical, OG,
   JSON-LD, fixing heading hierarchy = behavior change (Google sees
   different output, screen readers behave differently). These belong in
   a dedicated SEO/a11y task. Skill only flags missing items in the audit.
5. **RTL classes are sacred.** Never reformat `ps/pe/ms/me/start/end` to
   `pl/pr/ml/mr/left/right` "for consistency" — Arabic-first product.
6. **Don't reformat `className` strings.** No reordering Tailwind classes,
   no Prettier-on-save changes — diffs without behavior change pollute
   review.

### Code quality

7. **No new complexity.** New abstractions only if they remove more
   complexity than they add. KISS over cleverness, every time.
8. **No duplicate components.** Within a single app, dedupe via that app's
   `components/shared/`. Cross-app dedupe = Hard Limit (see above).
9. **Feature-based structure stays.** Routes own their components,
   actions, helpers, hooks. Don't scatter a feature.
10. **Minimize DOM.** Remove wrapper `<div>`s that exist solely to hold a
    class. Use Fragments where wrappers aren't needed. Collapse
    `<div><div><span>...</span></div></div>` to the smallest semantic
    equivalent — **only if rendered output is byte-identical** in HTML.
11. **Semantic HTML.** `<header>`, `<main>`, `<section>`, `<article>`,
    `<nav>`, `<footer>`, `<button>`, `<ul>` — use the right tag.
12. **TypeScript strict.** No `any`, no `unknown` leaking into APIs, no
    `as` casts hiding real type errors. Props typed, returns explicit on
    exported functions.
13. **No dead code.** Unused imports, exports, commented-out blocks,
    unreachable branches — gone.
14. **Naming.** `camelCase` variables, `PascalCase` components and
    component files, `kebab-case` route folders. Helpers in `helpers/`
    next to the feature.
15. **Comments rule (Khalid's standard).** Default = zero comments. Only
    add a comment when the WHY is non-obvious (a hidden constraint, a
    subtle invariant, a workaround). Long comments are a refactor signal.

---

## 🎯 Refactor Targets ("Spaghetti")

- Same component imported from two paths within the same app.
- Root-level `components/` with 80 unrelated files.
- A page > 200 lines mixing fetching + state + rendering + business rules.
- Client components that don't need to be client (verify per Rule #2).
- `useEffect` chains that a server component or derived value could replace
  (verify per Rule #2).
- Wrapper divs with single child + no styling purpose.
- Helpers duplicated across features (date format, currency, slugify).
- `any` and `as` scattered through tRPC inputs/outputs.
- Inline magic numbers and strings that should be constants.

---

## 🔄 Workflow — Always Follow This Order

### Step 0 — Sanity Check

Confirm:
- ✅ Working tree clean OR explicit user approval to refactor over uncommitted work.
- ✅ Current branch + remote tracking known.
- ✅ Pre-refactor `pnpm tsc --noEmit` is exit=0 (otherwise refactor compounds existing errors).

### Step 1 — Intake

Ask Khalid (only if not already provided):
- Which app? (`modonty`, `console`, `admin`, `dataLayer`, or all.)
- Folder tree (top 2-3 levels) — Khalid pastes or skill reads.
- Any folder he already knows is the worst — start there.

**Do not start refactoring before you have the tree.**

### Step 2 — Audit (Read-Only)

For tool-level mechanics (dead-code detection, impact analysis, rename
previews), invoke the `Refactor Safely` skill alongside this audit.

Produce single report: `documents/refactor/REFACTOR_AUDIT_<app>_<date>.md`.

```
# Refactor Audit — <app> — <YYYY-MM-DD>

## 1. Folder Structure
- Current tree (annotated with smells)
- Issues (duplication, scattering, naming)
- Proposed tree (same features, cleaner layout)

## 2. Duplicate Components (within this app)
| Component | Locations | Proposed shared path |

## 3. Cross-App Duplication (FLAG ONLY — Hard Limit)
| Component | Apps it lives in | Recommended shared package |

## 4. Dead Code
- Unused files
- Unused exports
- Commented-out blocks

## 5. DOM Bloat
- file:line — wrapper to remove (with before/after snippet)

## 6. Server vs Client (FLAG ONLY)
- Files currently `"use client"` that *might* not need to be — list
  with required pre-verification before any change

## 7. TypeScript Health
- `any` / `unknown` / unsafe `as` occurrences (file:line)

## 8. SEO Issues (FLAG ONLY — separate task, not refactor)
- Pages missing h1 / meta / canonical / OG / JSON-LD
- Heading hierarchy violations
- ⚠️ Fixing these = behavior change. Out of refactor scope.

## 9. Accessibility Issues (FLAG ONLY — separate task, not refactor)
- Non-semantic interactive elements
- Missing alt / labels / aria
- ⚠️ Fixing these = behavior change. Out of refactor scope.

## 10. Bugs Found (DO NOT FIX SILENTLY)
- Logged for Khalid's decision

## 11. Refactor Plan (Phased, atomic, revertable)
- Phase 1: Safe wins (dead code removal, naming, helper consolidation)
- Phase 2: Wrapper-div collapses + Fragment cleanups (HTML-output verified
  identical via diff)
- Phase 3: Within-app deduplication into `components/shared/`
- Phase 4: Folder restructure (NO route renames — Hard Limit)

Each phase: own commit, own visual verification, own tsc pass.
```

### Step 3 — Confirm

Show audit. **Wait for explicit approval.** No edits yet.

### Step 4 — Execute (One Phase at a Time)

For each phase:

1. State phase goal in one sentence.
2. List every file that will change (full paths).
3. Make the edits.
4. Run `pnpm tsc --noEmit` — must be exit=0.
5. **Commit atomically:** `git add <specific files> && git commit -m "refactor(<app>): phase N — <short>"`.
   No `git add -A`. No `git push` yet.
6. Report changed/unchanged/surprises.
7. Wait for "next phase" before continuing.

### Step 5 — Final Verification (Live Test)

After the last phase:

1. **`pnpm tsc --noEmit`** — exit=0.
2. **`pnpm build`** — exit=0. (Run this ONCE only — never mid-phase.)
3. **Playwright live test** on 5 representative pages:
   - One homepage / landing
   - One list page (e.g. `/articles`)
   - One detail page (e.g. an article view)
   - One form page (e.g. settings or article edit)
   - One auth-protected page (e.g. `/dashboard` if exists)
4. For each page:
   - Screenshot pre/post comparison
   - DOM diff sanity check
   - Console errors = 0 in both
   - Visual identical (or document any pixel-level acceptable diff)
5. Update audit report with "✅ Completed" + diff results.

### Step 6 — Pre-Push Hygiene (Per Khalid's Memory Rules)

Before any push:

1. ✅ TSC clean on **all affected apps** (admin + modonty + console + dataLayer
   if touched).
2. ✅ `pnpm build` clean.
3. ✅ Version bump (`admin/package.json`, `console/package.json`,
   `modonty/package.json` as applicable).
4. ✅ Changelog entry written + run sync script
   (`pnpm tsx admin/scripts/add-changelog.ts`).
5. ✅ `bash scripts/backup.sh` ran successfully.
6. ✅ `documents/context/SESSION-LOG.md` updated for next agent.
7. ✅ `git status --short` shows only the intended files (no
   `.claude/settings.json` token leaks — past incident logged).
8. ✅ Diff manually inspected for secrets (Vercel/Telegram/Atlas tokens).
9. **Wait for explicit "push" command from Khalid.** Never push autonomously.

### Step 7 — Memory Update

After push:
- Update `MEMORY.md` index if a new pattern was learned.
- Update `MASTER-TODO.md` with the refactor's completion entry.

---

## 🚫 What This Skill Will Never Do

- Rewrite a working component "to be cleaner" if rendered output changes.
- Introduce a state library, a new ORM, or a new caching/runtime dep.
- Add Redis, React Query, Zustand, Jotai, or similar — Khalid decides
  per-phase, not the skill.
- Convert server components to client components for "consistency."
- Convert client → server without per-Rule-#2 verification.
- Add tests during refactor (separate task).
- Touch design tokens or Tailwind config.
- Add `useMemo` / `useCallback` / `React.memo` for "micro-optimization."
- Reformat `className` strings.
- Touch RTL classes.
- Add SEO/a11y elements that change rendered output.

---

## 📂 Output Style

- Reports: Markdown, English (technical), Arabic 1-line summary at top if
  Khalid asks.
- Code edits: real file mutations, never "paste-this-snippet" output.
- Each commit = one atomic phase, plain-language message.
- Each phase report: files-changed, lines-added, lines-removed, tsc status.

---

## ✅ Success Criteria

A successful refactor produces:
- ✅ TSC clean on all affected apps
- ✅ `pnpm build` clean
- ✅ 5 Playwright pages = visually identical
- ✅ Console error count = 0 (pre and post)
- ✅ Each phase = own commit, own revert path
- ✅ `BUGS_FOUND.md` updated (if any) — none silently fixed
- ✅ Cleaner code underneath, same app on the surface

---

## 📌 One-Line Summary

> **Audit → Plan → Confirm → Execute phase by phase (atomic commits) →
> Live verify on 5 pages → Pre-push hygiene → Push only on explicit approval.**

Same app at the end. Cleaner code underneath. Zero behavior risk.
