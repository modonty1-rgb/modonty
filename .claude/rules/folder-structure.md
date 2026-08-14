---
paths:
  - "modonty/app/**"
  - "modonty/components/**"
  - "modonty/lib/**"
  - "admin/app/**"
  - "console/app/**"
  - "shared/components/**"
---

# Folder structure

## Where a file goes — there is no third option

- Used by ONE route → inside that route's folder.
- Used by TWO OR MORE routes in the same app → that app's shared folder.
- Used by TWO OR MORE apps → `shared/`.

## Route folder layout

```
app/<route>/
  page.tsx        server component, thin: fetch + compose
  loading.tsx     skeleton matching the real layout
  error.tsx       only where the route can realistically fail
  components/     used by this route only
  helpers/        hooks, utils, zod schemas, types — this route only
  actions.ts      server actions for this route only
```

## Shared layout

```
shared/components/ui/    shadcn primitives. No product knowledge: no DB type,
                            no translation key, no route, no permission.
shared/components/       composed components used by two or more APPS.
shared/lib/              utils used by two or more apps.
<app>/components/shared/    composed components used by two or more ROUTES of that app.
<app>/lib/                  utils used by two or more routes of that app.
```

## Import direction — never violated

- A route MAY import from `shared`, from its app's `components/`, and from its app's `lib/`.
- Shared code MUST NOT import from any route folder. Ever.
- A route MUST NOT import from a SIBLING route's folder. Ever.
- A route MAY import from its own ANCESTOR route — see below.
- `shared` MUST NOT import from any app. Ever.

If route A needs something from sibling route B, promote that thing to shared first.
Never import across siblings, not even temporarily.

### The one exception: a parent and its children

A nested route may import from a route ABOVE it in its own path. Downwards only —
the parent must never reach into a child.

```
app/users/profile/            components/profile-tabs · components/empty-state
  bookings/page.tsx           ../components/profile-tabs      ✅ up its own path
  comments/page.tsx           ../components/comment-card      ✅
  settings/page.tsx           ../helpers/profile-*            ✅
app/users/profile/page.tsx    ./bookings/components/…         ❌ never downward
app/search/page.tsx           ../users/profile/components/…   ❌ sibling
```

Why this is not a hole in the rule. The rule exists to stop two UNRELATED pages from
fusing, where editing one silently breaks the other. A parent and its children are not
two pages — they are one page with tabs, and the children cannot be reached except
through the parent. The shared piece (the tab bar, the empty state, the comment card)
is meaningless outside that family.

Promoting instead would break the promotion rule itself: it demands "two real consumers
in two DIFFERENT routes", and this is one route with its children. The tab bar knows the
profile's own URLs — in `components/` it would sit among app-wide pieces while serving
exactly one family, which is the grab-bag this document exists to prevent.

The test, when unsure: could the child page exist if the parent were deleted? If no,
it is a family and the import goes up. If yes, they are siblings and the piece is promoted.

## Promotion rule

Promote only when BOTH are true:

1. two real consumers, in two different routes (or two different apps)
2. they change together — one edit serves both

Never promote on first use "because it might be reused later".
If a shared component drops back to one consumer, move it back into that route.

## Imports style

- Inside a route: relative imports (`./components/Card`).
- To this app's shared code: the alias (`@/components/shared/Card`).
- To cross-app shared code: the package (`@modonty/shared/components/ui/button`).

An alias import pointing into another route is the signal that a boundary was crossed.

## Route handlers live with the route they serve

A `route.ts` may sit anywhere under `app/`, so an endpoint that only one page calls
belongs inside that page's folder — not in a central `app/api/` pile.

```
app/categories/
  page.tsx            → /categories
  api/route.ts        → /categories/api
  helpers/
```

The one hard constraint, enforced by the compiler and not just by convention:
**`page.tsx` and `route.ts` cannot share a segment.** A segment is one URL, and one URL
returns either a page or data, never both. Put the handler in a child folder.

Three endpoints must NOT move, because their URL is an external contract:

- `app/api/auth/[...nextauth]` — the auth library assumes `/api/auth`. Moving it breaks login.
- `app/api/revalidate` and `app/api/revalidate/tag` — admin and console call these by a
  URL written into their own code. Moving them stops pages refreshing after publish.
- Anything a third party, webhook, or another app in this repo calls by literal URL.

So the test before moving a handler is not "which route uses it" but "who holds its URL".
Measure the callers across all four packages first; move only what modonty alone calls.

## One function per file

Every exported function lives in its own file, named after it in kebab-case:
`getCategoriesEnhanced` → `get-categories-enhanced.ts`. A folder collects them and
re-exports through `index.ts`.

```
helpers/queries/
  get-categories-enhanced.ts
  get-category-by-slug.ts
  index.ts                    export { getCategoriesEnhanced } from "./get-categories-enhanced"
```

Why, in this codebase specifically: `app/api/helpers/category-queries.ts` was 572 lines
and 7 functions. A route importing ONE of them dragged in the other six — including two
nobody called at all. That is the Interface Segregation principle broken by file layout:
a consumer forced to depend on what it does not use.

Splitting also makes placement decidable. A file with one function has one consumer set,
so the rule above ("used by ONE route → inside that route") gives a single answer. A file
with seven functions and seven different consumer sets has no correct home, so it stays
in the wrong place forever.

- One exported function per file. Types and small private helpers that only that function
  uses stay with it.
- The file name IS the function name, in kebab-case. No `utils.ts`, no `helpers.ts`,
  no `*-queries.ts` grab-bags.
- Re-export through `index.ts` so the import stays short.
- A file whose function has zero consumers is dead code. Delete it, do not move it.

## Naming

Folders are `components` and `helpers`. No underscore prefix — a folder without
`page.tsx` does not create a route, so nothing needs hiding.

Names are read by humans. `get-client-hero-slides.ts` says what it returns;
`client-queries.ts` says only which table it touches. Pick the name that answers
"what do I get from this?" before the name that answers "where did it come from?".

## This repo's shape, for reference

Four workspace packages at the root, not under `apps/`: `modonty` (public site),
`admin` (team), `console` (client), `shared` (shared: Prisma, shared components,
shared lib). The rules above are written for that shape; do not restructure the
workspace to match a generic `apps/` + `packages/` example.
