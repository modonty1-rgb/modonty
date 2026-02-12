## Purpose

This file tracks **all temporary code changes made while investigating / improving TBT and performance**, so that once the true root causes are fully understood and fixed, we can cleanly **revert or keep** each change.

Status legend:
- **Active**: change is currently in code.
- **Reverted**: change was undone and code is back to original behavior.
- **Experimental**: change is intentionally temporary and should be revisited.

---

## Session / Auth Related Changes

- **Custom Session Context (Active)**  
  - **Files**:
    - `modonty/components/providers/SessionContext.tsx`
    - `modonty/components/providers/SessionProviderWrapper.tsx`
  - **What changed**:
    - Replaced `next-auth` client `SessionProvider` with a **custom `SessionContext`** that receives `session` from the server.
    - Added `SessionProviderWrapper` (async server component) that calls `auth()` and wraps the app with `SessionProvider`.
    - `useSession()` now returns `{ data, status }` with `"loading" | "authenticated" | "unauthenticated"` for compatibility with existing pages.
  - **Why**:
    - Remove `Date.now()` usage from `next-auth` internals during prerender and stop `Date.now()` build errors on routes like `/categories` and `/help`.
  - **How to revert**:
    - Restore original `next-auth` `SessionProvider` usage in `layout.tsx` and any client components using `useSession()` from `next-auth/react`.
    - Remove `SessionContext.tsx` and `SessionProviderWrapper.tsx` or stop using them.

- **Session wrapped in `<Suspense>` in layout (Active)**  
  - **File**: `modonty/app/layout.tsx`  
  - **What changed**:
    - `SessionProviderWrapper` (which calls `auth()`) is now wrapped with a single `<Suspense fallback={null}>`:
      - This covers `TopNav`, `<main>{children}</main>`, `Footer`, and `MobileFooter` because they are inside `SessionProviderWrapper`.
  - **Why**:
    - Fix Next.js prerender error: **“Uncached data was accessed outside of `<Suspense>`”** for routes like `/categories`, since `auth()` is uncached data.
  - **How to revert**:
    - Remove the `<Suspense>` wrapper and render `SessionProviderWrapper` directly (note: this will re-introduce the prerender error unless `auth()` usage changes).

---

## Navigation / TopNav Changes

- **TopNav moved to dedicated folder and client islands (Active)**  
  - **Files**:
    - `modonty/components/TopNav.tsx` (thin re-export)
    - `modonty/components/top-nav/TopNav.tsx`
    - `modonty/components/top-nav/NavLinksClient.tsx`
    - `modonty/components/top-nav/UserAreaClient.tsx`
    - `modonty/components/top-nav/MobileControlsClient.tsx`
  - **What changed**:
    - `components/TopNav.tsx` is now a simple re-export of `components/top-nav/TopNav.tsx`.
    - Actual nav logic moved into `top-nav/TopNav.tsx`, a client component that dynamically imports:
      - `NavLinksClient`
      - `UserAreaClient`
      - `MobileControlsClient`
    - Each of these smaller components owns its own client-only logic (`usePathname`, `useSession`, mobile controls).
  - **Why**:
    - Reduce initial JS for navigation by using **client islands** and dynamic imports with `ssr: false`, keeping the global layout lighter.
  - **How to revert**:
    - Move nav logic back into original `components/TopNav.tsx` and remove the `top-nav` subfolder + re-export file.

---

## Home Feed / Article List Changes

- **Home page initial posts limit (Active)**  
  - **File**: `modonty/app/page.tsx`
  - **What changed**:
    - `getArticles({ limit: 8 })` → **`getArticles({ limit: 4 })`**.
  - **Why**:
    - Reduce DOM + JS work above the fold: 1 hero + up to 3 additional posts server-rendered; remaining posts come from infinite scroll.
  - **How to revert**:
    - Change the limit back to `8` (or previous value).

- **FeedContainer uses server-rendered cards for initial posts (Active)**  
  - **File**: `modonty/components/FeedContainer.tsx`
  - **What changed**:
    - First post rendered via `FirstArticleCard`.
    - Other initial posts rendered directly as server-side `PostCard`s (no longer passed into `InfiniteArticleList` as `initialPosts`).
    - Layout keeps left/right sidebars sticky with `self-start` wrappers.
  - **Why**:
    - Avoid hydrating the first batch of posts inside a client component; shifts work to the server and reduces TBT.
  - **How to revert**:
    - Restore previous pattern: pass `posts.slice(1)` to `InfiniteArticleList` as `initialPosts` and remove direct `PostCard` mapping.

- **InfiniteArticleList lazy-loaded on scroll (Active)**  
  - **Files**:
    - `modonty/components/InfiniteArticleListOnView.tsx` (new)
    - `modonty/components/FeedContainer.tsx` (import/usage change)
  - **What changed**:
    - New client wrapper `InfiniteArticleListOnView`:
      - Uses `IntersectionObserver` to detect when the user scrolls near the bottom of the feed.
      - Dynamically imports `InfiniteArticleList` with `next/dynamic` and `ssr: false` only when visible.
    - `FeedContainer` now renders:
      - `InfiniteArticleListOnView initialStartIndex={posts.length}`  
      instead of `<InfiniteArticleList initialPosts={[]} ... />` directly.
  - **Why**:
    - Defer the **infinite scroll bundle + logic** until user scrolls, further reducing initial JS evaluation and TBT.
  - **How to revert**:
    - Remove `InfiniteArticleListOnView` usage and import.
    - Use `<InfiniteArticleList initialPosts={[]} initialStartIndex={posts.length} />` directly again.
    - Optionally delete `InfiniteArticleListOnView.tsx` if no longer needed.

- **Sidebars skipped for mobile user-agents (Reverted)**  
  - **File**: `modonty/components/FeedContainer.tsx`
  - **What changed**:
    - (Experiment) Temporarily added `headers()` import from `next/headers` and user-agent check to avoid rendering sidebars on mobile.
    - This change has now been **fully reverted**; `FeedContainer` is back to always rendering both sidebars, relying only on CSS (`hidden lg:block` / `hidden xl:block`) to hide them on small screens.
  - **Reason for revert**:
    - The experiment did not improve Lighthouse score meaningfully and added extra complexity to the server component.

---

## Layout / GTM / Suspense Experiments

- **GTM inclusion in layout (Current: Active, but Suspense commented)**  
  - **File**: `modonty/app/layout.tsx`
  - **What changed over time**:
    - Initially: `GTMContainer` imported and wrapped in `<Suspense fallback={null}>`.
    - Then: GTM import and Suspense block **commented out** to see impact on TBT.
    - Later: GTM import restored; **GTM Suspense block is currently commented**, so GTM is not rendered.
  - **Why**:
    - Measure impact of GTM on TBT / bundle size.
  - **How to revert to original behavior**:
    - Uncomment the GTM `<Suspense>` block in `<body>`:
      ```tsx
      <Suspense fallback={null}>
        <GTMContainer />
      </Suspense>
      ```

- **Root layout Suspense structure (Current: Minimal)**  
  - **File**: `modonty/app/layout.tsx`
  - **History**:
    - Original: Multiple nested `Suspense` wrappers for:
      - GTM
      - TopNav
      - Whole layout skeleton
      - MobileFooter
    - Now:
      - GTM Suspense commented.
      - Single `<Suspense fallback={null}>` wrapping `SessionProviderWrapper` (and thus TopNav, `children`, Footer, MobileFooter).
  - **Why**:
    - Reduce unnecessary Suspense complexity while still satisfying Next.js requirement for `auth()` (uncached data) to be under a `<Suspense>` boundary.
  - **How to revert**:
    - Reintroduce the previous outer Suspense layout skeleton and per-component Suspense boundaries if desired.

---

## SEO / Misc Changes

- **Client SEO meta tags type fix (Active)**  
  - **File**: `admin/app/(dashboard)/clients/actions/clients-actions/generate-client-seo.ts`
  - **What changed**:
    - Removed `viewport` from `metaTags: MetaTagsObject` because `MetaTagsObject` type does not support a `viewport` field.
  - **Why**:
    - Fix Next.js / TypeScript build error:
      - `Object literal may only specify known properties, and 'viewport' does not exist in type 'MetaTagsObject'.`
  - **How to revert**:
    - Re-add `viewport: "width=device-width, initial-scale=1.0"` to `metaTags` and update the type definition to include `viewport` (if desired).

---

## How to Use This File

- When we finally identify the **true root causes of TBT / performance issues**, use this document to decide for each change:
  - **Keep** (if it clearly improves UX/perf and is safe).
  - **Revert** (if it was only experimental or is no longer needed).
- For any revert, follow the **“How to revert”** bullet for that specific change and verify with:
  - `pnpm build`
  - Lighthouse (mobile, Fast 4G, `/`)

