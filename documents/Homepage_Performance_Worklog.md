## Homepage Performance Worklog – Mobile Focus

This file tracks what we changed and how to re‑run tests for the **`modonty` homepage (`/`)**, with a focus on **mobile Core Web Vitals**.

**When to re-run (reference)**  
After **any code change** that might affect the homepage (e.g. PostCard, images, layout, JS), you **must** repeat the full process so scores reflect the new build:
1. `pnpm --filter @modonty/modonty build && pnpm --filter @modonty/modonty start` (keep running)
2. In a second terminal: `npx lhci autorun --collect.numberOfRuns=5 --upload.target=temporary-public-storage`  
If you skip build/start, LHCI audits the **old** bundle and the new scores do not reflect your changes.

---

## 1. Scope & Goals

- **Scope**
  - Only the `modonty` web app, homepage route: `modonty/app/page.tsx`.
  - Layout components used on the homepage: `FeedContainer`, `LeftSidebar`, `RightSidebar`, and the first article `PostCard`.
- **Primary goals**
  - Improve **mobile Performance score** in Lighthouse.
  - Reduce **Largest Contentful Paint (LCP)** time.
  - Reduce **unused / legacy JavaScript** impact on the main thread.
  - Improve **image delivery** (size, responsive behavior, and loading).

---

## 2. Desktop‑Only Sidebars (Server Level)

- **Files**
  - `modonty/components/layout/LeftSidebar.tsx`
  - `modonty/components/layout/RightSidebar.tsx`
  - `modonty/components/layout/is-mobile-request.ts`
  - `modonty/components/feed/FeedContainer.tsx`

- **Behavior after change**
  - On **desktop**:
    - `LeftSidebar` and `RightSidebar` still render normally via `FeedContainer`.
    - All existing analytics, suggested articles, and newsletter UI work as before.
  - On **mobile** (detected via `user-agent`):
    - `LeftSidebar` and `RightSidebar` **return `null` before any data fetching**.
    - No DB queries or article lookups run for sidebars.
    - No `<aside>` markup for sidebars is sent in the HTML.

- **Key implementation**
  - `is-mobile-request.ts`:
    - Uses `await headers()` from `next/headers` (Next 16 requirement).
    - Simple regex on the `user-agent` string to detect mobile.
  - `LeftSidebar` / `RightSidebar`:
    - Both are `async` server components.
    - First line in each component:
      - `if (await isMobileRequest()) { return null; }`
    - All data fetching stays below this guard.

- **How to verify**
  1. **Desktop**
     - Open `/` normally (no device toolbar).
     - Sidebars should be visible and behave as before.
  2. **Mobile (DevTools)**
     - Enable device toolbar → pick a phone → reload.
     - In **Elements**, search for:
       - `تحليلات الفئات` (left sidebar).
       - `أخبار مودونتي` or `النشرة الإخبارية` (right sidebar).
     - Expected: **not found** on mobile, but present on desktop.

---

## 3. Lighthouse CI Setup (Local, Mobile)

- **Files**
  - Root config: `lighthouserc.js`
  - Short how‑to: `LighthouseCI.md`

- **Config summary**
  - Target URL: `http://localhost:3000/` (homepage only).
  - Mode: Lighthouse **mobile** (default).
  - Runs: `numberOfRuns: 5` to smooth randomness.
  - Assertions:
    - Uses `preset: "lighthouse:recommended"`.
    - Warns if Performance score drops below `0.6`.
  - Upload:
    - `target: "temporary-public-storage"` – gives shareable report links but stores no secrets in the repo.

- **Step‑by‑step to run**
  1. **Build + start local production server** (from repo root)
     ```bash
     pnpm --filter @modonty/modonty build && pnpm --filter @modonty/modonty start
     ```
  2. **Run Lighthouse CI (second terminal, root)**
     ```bash
     npx lhci autorun --collect.numberOfRuns=5 --upload.target=temporary-public-storage
     ```
  3. **Inspect results**
     - Open the printed report URL.
     - Focus on:
       - Performance score.
       - LCP, FCP, TBT / Max Potential FID.
       - “Improve image delivery”, “Properly size images”, and “Reduce unused JavaScript”.

---

## 4. Current Baseline (After Sidebar Optimization)

- **Environment**
  - Local production (`pnpm build` + `pnpm start`).
  - Lighthouse CI mobile run, 5 samples, median selected.
- **Headline scores**
  - **Performance**: ~**70**
  - **Accessibility**: 99
  - **Best Practices**: 100
  - **SEO**: 100
- **Key signals from this run**
  - **Largest Contentful Paint (LCP)**:
    - LCP score ≈ **0.53–0.61** (needs improvement).
    - Median LCP time ≈ **3.9 s** (`numericValue` ≈ 3856 ms).
    - FCP ≈ **1.1 s**, Speed Index ≈ **2.6 s** → page starts painting fast, but the largest element (likely the first article card hero image/text) appears later.
  - **Main thread / JS**
    - Warnings for:
      - `unused-javascript`
      - `legacy-javascript` and `legacy-javascript-insight`
      - `mainthread-work-breakdown`
      - `max-potential-fid`
  - **Images**
    - `image-delivery-insight` (improve delivery).
    - `uses-responsive-images` (some images too large for mobile).
  - **Network / caching**
    - `render-blocking-resources` / `render-blocking-insight`.
    - `uses-long-cache-ttl` (some static assets under‑cached).

---

## 5. Next Steps Plan (Homepage Only)

These are **planned**, not yet fully implemented. Use this section as a checklist when continuing optimization.

### 5.1 LCP – First Article Card

- **Likely LCP element**
  - First article image rendered via:
    - `modonty/components/feed/FirstArticleCard.tsx`
    - `modonty/components/feed/PostCard.tsx` (props: `priority`, `isLcp`).
  - Uses `OptimizedImage` with `priority` and `preload={priority && isLcp}`.

- **Planned actions**
  - Confirm in Lighthouse which element is flagged as LCP (image vs text).
  - If it is the first article image:
    - Keep `priority` and `preload` only for that **single** image on the page.
    - Review `sizes` prop in `PostCard` to better match actual mobile width for the hero image.
      - Avoid large, unnecessary resolutions on mobile (adjust `sizes` or source presets if needed).
    - In parallel, look for homepage-only JS that can be delayed until after LCP so the main thread is less busy when the hero is rendering.

### 5.2 JavaScript – Unused / Legacy

- **Planned actions**
  - Use Lighthouse “**Reduce unused JavaScript**” and “Legacy JavaScript” panels to:
    - Identify which bundles correspond to which components or libraries.
    - Look for:
      - Heavy libraries used only below the fold that can be lazily loaded.
      - Legacy/polyfill bundles that can be dropped if not needed for our supported browsers.
  - Apply changes **only to homepage‑related components** first (feed, hero, above‑the‑fold widgets), keeping global refactors out of scope unless explicitly approved.

### 5.3 Images – Delivery & Responsiveness

- **Planned actions**
  - Review images in homepage feed:
    - `PostCard` article images.
    - Client logos in avatars.
  - For each image type:
    - Ensure `sizes` reflects real layout (especially on small screens).
    - Check that large desktop breakpoints aren’t being requested on narrow mobile viewports.
  - Re‑run LHCI after each small change and compare:
    - LCP score and timing.
    - “Improve image delivery” and “Properly size images” audits.

---

## 6. How to Compare Before / After

- Always:
  1. Commit or note the current code state.
  2. Run LHCI as described in section 3.
  3. Record:
     - Performance score.
     - LCP time.
     - TBT / max Potential FID.
  4. Make one focused change at a time (e.g. LCP image only).
  5. Re‑run LHCI and compare median results, not single runs.

