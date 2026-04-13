# Temporary Code Changes – TBT & Performance Investigation

Tracks all temporary changes made during TBT investigation. Once root causes are identified, decide whether to **keep** or **revert** each change.

**Status Legend:**
- **Active:** Currently in code
- **Reverted:** Undone, back to original
- **Experimental:** Intentionally temporary, needs revisit

---

## Session / Auth Related

**Custom Session Context (Active)**

Files:
- `modonty/components/providers/SessionContext.tsx`
- `modonty/components/providers/SessionProviderWrapper.tsx`

Changes:
- Replaced `next-auth` client `SessionProvider` with custom `SessionContext` receiving server `session`
- Added `SessionProviderWrapper` (async server component) calling `auth()` and wrapping app
- `useSession()` returns `{ data, status }` with `"loading" | "authenticated" | "unauthenticated"` for compatibility

Why:
- Remove `Date.now()` from `next-auth` internals during prerender
- Stop `Date.now()` build errors on routes like `/categories`

Revert:
- Restore `next-auth` `SessionProvider` in `layout.tsx`
- Remove `SessionContext.tsx` and `SessionProviderWrapper.tsx`

---

**Session wrapped in Suspense (layout) (Active)**

File: `modonty/app/layout.tsx`

Changes:
- `SessionProviderWrapper` wrapped with single `<Suspense fallback={null}>`
- Covers `TopNav`, `<main>`, `Footer`, `MobileFooter`

Why:
- Fix Next.js prerender error: "Uncached data was accessed outside of `<Suspense>`"
- Required for `auth()` (uncached data)

Revert:
- Remove `<Suspense>` wrapper and render `SessionProviderWrapper` directly
- Note: may re-introduce prerender error unless `auth()` usage changes

---

## Navigation / TopNav

**TopNav moved to dedicated folder with client islands (Active)**

Files:
- `modonty/components/TopNav.tsx` (thin re-export)
- `modonty/components/top-nav/TopNav.tsx`
- `modonty/components/top-nav/NavLinksClient.tsx`
- `modonty/components/top-nav/UserAreaClient.tsx`
- `modonty/components/top-nav/MobileControlsClient.tsx`

Changes:
- `TopNav.tsx` is re-export of `top-nav/TopNav.tsx`
- Nav logic moved to `top-nav/TopNav.tsx` (client), dynamically imports smaller client subcomponents
- Each smaller component owns its client-only logic

Why:
- Reduce initial JS via client islands and dynamic imports with `ssr: false`
- Keep global layout lighter

Revert:
- Move nav logic back to original `components/TopNav.tsx`
- Remove `top-nav` subfolder + re-export file

---

## Home Feed / Article List

**Home page initial posts limit (Active)**

File: `modonty/app/page.tsx`

Changes:
- `getArticles({ limit: 8 })` → `getArticles({ limit: 4 })`

Why:
- Reduce DOM + JS above fold: 1 hero + 3 posts server-rendered; rest via infinite scroll

Revert:
- Change limit back to `8` (or previous value)

---

**FeedContainer server-rendered cards (Active)**

File: `modonty/components/FeedContainer.tsx`

Changes:
- First post via `FirstArticleCard`
- Other initial posts as server-side `PostCard` (not passed to `InfiniteArticleList`)
- Sidebars remain sticky with `self-start` wrappers

Why:
- Avoid hydrating first batch inside client component
- Shift work to server, reduce TBT

Revert:
- Restore: pass `posts.slice(1)` to `InfiniteArticleList` as `initialPosts`
- Remove direct `PostCard` mapping

---

**InfiniteArticleList lazy-loaded on scroll (Active)**

Files:
- `modonty/components/InfiniteArticleListOnView.tsx` (new)
- `modonty/components/FeedContainer.tsx` (import/usage change)

Changes:
- New `InfiniteArticleListOnView` uses `IntersectionObserver` to detect scroll-to-bottom
- Dynamically imports `InfiniteArticleList` with `next/dynamic` and `ssr: false` only when visible
- `FeedContainer` renders `InfiniteArticleListOnView` instead of `InfiniteArticleList` directly

Why:
- Defer infinite scroll bundle + logic until user scrolls
- Further reduce initial JS evaluation and TBT

Revert:
- Remove `InfiniteArticleListOnView` usage
- Use `<InfiniteArticleList initialPosts={[]} initialStartIndex={posts.length} />` directly
- Optionally delete `InfiniteArticleListOnView.tsx`

---

**Sidebars skipped for mobile (Reverted)**

File: `modonty/components/FeedContainer.tsx`

Changes:
- (Experiment) Added `headers()` from `next/headers` + user-agent check to skip sidebar rendering on mobile

Status: **Fully reverted** – `FeedContainer` now always renders both sidebars, relying on CSS (`hidden lg:block` / `hidden xl:block`) to hide on small screens

Reason for revert:
- Did not improve Lighthouse score meaningfully
- Added unnecessary complexity

---

## Layout / GTM / Suspense

**GTM inclusion in layout (Current: Active, Suspense commented)**

File: `modonty/app/layout.tsx`

Timeline:
- Initially: `GTMContainer` imported, wrapped in `<Suspense>`
- Then: GTM import and Suspense commented out
- Now: GTM import restored; **Suspense block currently commented**, so GTM not rendered

Why:
- Measure impact of GTM on TBT / bundle size

Restore:
- Uncomment GTM `<Suspense>` block in `<body>`:
```tsx
<Suspense fallback={null}>
  <GTMContainer />
</Suspense>
```

---

**Root layout Suspense structure (Current: Minimal)**

File: `modonty/app/layout.tsx`

History:
- Original: Multiple nested `Suspense` wrappers (GTM, TopNav, skeleton, MobileFooter)
- Now: GTM Suspense commented; single `<Suspense>` wrapping `SessionProviderWrapper` (thus TopNav, children, Footer, MobileFooter)

Why:
- Reduce unnecessary Suspense complexity
- Still satisfy Next.js requirement for `auth()` (uncached data) under `<Suspense>`

Restore:
- Reintroduce previous outer Suspense layout skeleton + per-component boundaries if desired

---

## SEO / Misc

**Client SEO meta tags type fix (Active)**

File: `admin/app/(dashboard)/clients/actions/clients-actions/generate-client-seo.ts`

Changes:
- Removed `viewport` from `metaTags: MetaTagsObject`
- `MetaTagsObject` type does not support `viewport` field

Why:
- Fix Next.js / TypeScript build error

Revert:
- Re-add `viewport: "width=device-width, initial-scale=1.0"` to `metaTags`
- Update `MetaTagsObject` type to include `viewport`

---

## How to Use This

When root causes of TBT/performance are identified:
1. Decide for each change: **Keep** or **Revert**
2. Follow "Revert" instructions for changes you're removing
3. Verify with `pnpm build` and Lighthouse (mobile, Fast 4G, `/`)
