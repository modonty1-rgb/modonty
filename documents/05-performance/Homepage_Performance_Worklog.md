# Homepage Performance Worklog – Mobile Focus

Tracks changes and tests for the modonty homepage (`/`) mobile Core Web Vitals optimization.

## When to Re-run Tests

After **any code change** affecting the homepage:
1. `pnpm --filter @modonty/modonty build && pnpm --filter @modonty/modonty start` (keep running)
2. In second terminal: `npx lhci autorun --collect.numberOfRuns=5 --upload.target=temporary-public-storage`

## Scope & Goals

- **Target:** `modonty/app/page.tsx` and related components
- **Primary goals:**
  - Improve mobile Performance score in Lighthouse
  - Reduce Largest Contentful Paint (LCP)
  - Reduce unused/legacy JavaScript
  - Optimize image delivery

## 1. Desktop-Only Sidebars (Server Level)

**Files:**
- `modonty/components/layout/LeftSidebar.tsx`
- `modonty/components/layout/RightSidebar.tsx`
- `modonty/components/layout/is-mobile-request.ts`
- `modonty/components/feed/FeedContainer.tsx`

**Implementation:**
- `is-mobile-request.ts` uses `await headers()` from `next/headers` with user-agent detection
- `LeftSidebar` / `RightSidebar` return `null` on mobile before any data fetching
- Sidebar markup not sent in mobile HTML

**Verify:**
- Desktop: sidebars visible via `FeedContainer`
- Mobile (DevTools): sidebars absent from Elements; search for `تحليلات الفئات` or `أخبار مودونتي` returns nothing

## 2. Lighthouse CI Setup (Local, Mobile)

**Config:** `lighthouserc.js`

**Run:**
```bash
# Terminal 1
pnpm --filter @modonty/modonty build && pnpm --filter @modonty/modonty start

# Terminal 2
npx lhci autorun --collect.numberOfRuns=5 --upload.target=temporary-public-storage
```

**Settings:**
- Target: `http://localhost:3000/` (mobile)
- Runs: 5 samples
- Assertions: `preset: "lighthouse:recommended"` (warns if Performance < 0.6)

## 3. Current Baseline (After Sidebar Optimization)

| Metric | Score |
|--------|-------|
| Performance | ~70 |
| Accessibility | 99 |
| Best Practices | 100 |
| SEO | 100 |

**LCP Issue:** ~3.9s (first article card image)
- Warnings: unused-javascript, legacy-javascript, mainthread-work-breakdown, max-potential-fid
- Images: render-blocking resources, under-cached static assets

## 4. Planned Optimizations (Checklist)

### 4.1 LCP – First Article Card
- [ ] Confirm LCP element is hero image (via Lighthouse)
- [ ] Keep `priority` and `preload` only for first image
- [ ] Review `sizes` prop for mobile match
- [ ] Defer non-LCP JS until after render

### 4.2 JavaScript – Unused / Legacy
- [ ] Identify unused bundles via Lighthouse
- [ ] Lazy-load heavy libraries below fold
- [ ] Remove legacy/polyfill bundles if possible

### 4.3 Images – Delivery & Responsiveness
- [ ] Verify `sizes` reflects real mobile layout
- [ ] Ensure large desktop breakpoints not requested on mobile
- [ ] Re-run LHCI after each change

## 5. How to Compare Before / After

1. Note current code state
2. Run LHCI, record: Performance score, LCP time, TBT
3. Make one focused change
4. Re-run LHCI, compare median results
