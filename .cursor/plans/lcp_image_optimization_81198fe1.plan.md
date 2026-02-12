---
name: LCP Image Optimization
overview: Use the official Next.js Image API for LCP. Remove manual preload logic. Preload only index 0 (LCP); index 1–5 get eager loading without preload.
todos: []
isProject: false
---

# LCP Image Optimization Plan (Official Next.js Approach)

## Official Next.js Docs

Per [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image):

- **preload**: Inserts `<link rel="preload">` in `<head>`. Use **only for the LCP element**.
- **When NOT to use preload**: "When you have multiple images that could be considered the LCP element depending on the viewport."
- **Preferred**: "In most cases, use `loading="eager"` or `fetchPriority="high"` instead of preload."

Web best practice: Preload **only the single LCP image**. Multiple preloads compete for bandwidth and can delay the actual LCP.

---

## Critical Fix: Preload vs Eager


| Index | Hero     | Avatar   | Preload? | Rationale                                |
| ----- | -------- | -------- | -------- | ---------------------------------------- |
| 0     | priority | priority | **Yes**  | LCP element                              |
| 1–5   | priority | priority | **No**   | Eager load only; avoid multiple preloads |
| 6–7   | lazy     | lazy     | No       | Below fold                               |


**OptimizedImage** must support `preload` separately from `priority`:

- `priority`: `loading="eager"` when true, `lazy` when false
- `preload`: when `true` only → `preload={true}` + `fetchPriority="high"`. When false → no preload, `fetchPriority="auto"`.

**Critical:** web.dev: "Setting a high priority on more than one or two images makes priority setting unhelpful in reducing LCP." Index 1–5 must get `loading="eager"` but **NOT** `fetchPriority="high"` (use default/auto).

---

## Implementation

### 1. Remove Manual Preload

**File:** [modonty/app/page.tsx](modonty/app/page.tsx)

Remove: `getLcpOptimizedImageUrl` import, `buildLcpPreloadHref`, `lcpPreloadHref`, `<link rel="preload">` JSX. Keep FeedContainer, JSON-LD, generateMetadata.

### 2. Remove Unused Function

**File:** [modonty/lib/image-utils.ts](modonty/lib/image-utils.ts)

Remove `getLcpOptimizedImageUrl`.

### 3. OptimizedImage: Add `preload` Prop

**File:** [modonty/components/OptimizedImage.tsx](modonty/components/OptimizedImage.tsx)

Add `preload?: boolean`, `fetchPriorityHigh?: boolean`. Logic: `preload={preload ?? priority}`. When `preload=true` → `preload={true}` + `fetchPriority="high"`. When `fetchPriorityHigh=true` (e.g. LCP avatar) → `fetchPriority="high"` without preload. Else `fetchPriority="auto"`. Max 2 images with high (hero + avatar for index 0).

### 4. PostCard: Hero + Avatar Priority, LCP Hint

**File:** [modonty/components/PostCard.tsx](modonty/components/PostCard.tsx)

Props: `priority`, `isLcp` (default `false`).

- Hero: `OptimizedImage` with `priority={priority}`, `preload={priority && isLcp}`. (index 0: preload+fetchPriority high; index 1–5: eager only, fetchPriority auto)
- Avatar: when `priority` and `post.clientLogo`, use `OptimizedImage` with `priority`, `preload={false}`, `fetchPriorityHigh={isLcp}` (index 0 avatar gets high, within "one or two" limit). When not priority, keep `AvatarImage` (lazy).

### 5. FirstArticleCard

**File:** [modonty/components/FirstArticleCard.tsx](modonty/components/FirstArticleCard.tsx)

`<PostCard post={post} priority isLcp />` (index 0 = LCP).

### 6. InfiniteArticleList

**File:** [modonty/components/InfiniteArticleList.tsx](modonty/components/InfiniteArticleList.tsx)

Props: `initialStartIndex?: number` (default `1`).

`priority={initialStartIndex + index <= 5}`, `isLcp={false}` (only index 0 is LCP).

### 7. FeedContainer

**File:** [modonty/components/FeedContainer.tsx](modonty/components/FeedContainer.tsx)

Pass `initialStartIndex={1}` to InfiniteArticleList.

---

## Bug & Performance Checks


| Check                                                     | Status |
| --------------------------------------------------------- | ------ |
| Only one preload (index 0)                                | Yes    |
| Index 1–5: eager, no preload, fetchPriority auto          | Yes    |
| Index 6–7: lazy                                           | Yes    |
| Avatar: OptimizedImage when priority, fallback when empty | Yes    |
| No manual preload in body                                 | Yes    |
| getLcpOptimizedImageUrl removed                           | Yes    |


---

## Verification

1. Run Lighthouse (Performance) on home page.
2. Network tab: first hero image has "High" priority and preload in `<head>`.
3. Images 2–6: "High" priority, no preload link.
4. Images 7–8: lazy.
5. LCP should improve (single preload, no competition).

---

## Sources (Official & Senior Consensus)


| Source                                     | Quote / Finding                                                                                                                                                              |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **web.dev** (Philip Walton, Barry Pollard) | "Setting a high priority on more than one or two images makes priority setting unhelpful in reducing LCP."                                                                   |
| **web.dev**                                | "Never lazy-load your LCP image."                                                                                                                                            |
| **web.dev**                                | Preload + `fetchpriority="high"` for LCP. "Preloaded images are presumably high priority and so should include the fetchpriority='high' attribute."                          |
| **MDN Blog** (DebugBear)                   | "Lazy load images below the fold to reduce network contention… When you free up bandwidth, the LCP image can sometimes load faster."                                         |
| **web.dev**                                | "For sites where the image is quickly discoverable in the HTML, we recommend avoiding preload, and instead having the preload scanner pick up the images."                   |
| **Stack Overflow**                         | "Manual preload conflicts: If you're manually adding link preload tags… can cause duplicate loading and harm performance." Use next/image; it handles preload automatically. |
| **Addy Osmani / fetchpriority**            | "When everything is important, nothing is." Apply fetchPriority high to the single LCP image only.                                                                           |
| **SpeedVitals**                            | "Preloading additional images beyond the actual LCP element can degrade performance by creating unnecessary requests."                                                       |
| **corewebvitals.io**                       | Use both `rel="preload"` and `fetchpriority="high"` for the LCP image.                                                                                                       |


**Conclusion:** The plan matches official guidance. It will improve performance.