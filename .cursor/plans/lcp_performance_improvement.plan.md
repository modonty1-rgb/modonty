---
name: LCP Performance Improvement
overview: Reduce Largest Contentful Paint from ~6.29s by removing layout-blocking auth, adding Cache Components for home page data, and improving LCP image fetch priority.
todos:
  - id: remove-auth-blocking
    content: Remove await auth() from layout, pass session=null to SessionProvider
  - id: fetch-priority
    content: Add fetchPriority="high" to OptimizedImage when priority is true
  - id: enable-cache-components
    content: Enable cacheComponents in next.config.ts
  - id: cache-get-articles
    content: Add "use cache" with cacheTag/cacheLife to getArticles
  - id: cache-get-home-seo
    content: Add "use cache" with cacheTag/cacheLife to getHomePageSeo
  - id: revalidate-on-mutation
    content: Add revalidateTag calls when articles/settings change (admin flows)
isProject: false
---

# LCP Performance Improvement Plan (Revised)

## Problem Summary

The LCP image (`img.object-cover.hover:scale-105` in the first article card) loads at **6.29s** because:

1. **Layout blocks on auth** - Root layout awaits `auth()` before rendering; no HTML is sent until it completes
2. **Page blocks on uncached data** - getArticles and getHomePageSeo run on every request with no persistent cache
3. **LCP image lacks explicit fetchPriority** - OptimizedImage never passes `fetchPriority="high"` when priority is true

## Current vs Target Flow

```mermaid
sequenceDiagram
    participant Browser
    participant NextJS as Next.js Server
    participant Auth
    participant DB

    Note over Browser,DB: CURRENT - Blocking
    Browser->>NextJS: GET /
    NextJS->>Auth: await auth()
    Note over Auth: Blocks 200-500ms+
    Auth-->>NextJS: session
    NextJS->>DB: getArticles, getHomePageSeo
    Note over DB: Blocks every request
    DB-->>NextJS: data
    NextJS-->>Browser: Full HTML

    Note over Browser,DB: TARGET - Streaming + Cache
    Browser->>NextJS: GET /
    Note over NextJS: Layout renders (session=null)
    NextJS-->>Browser: HTML shell + loading fallback
    par
        NextJS->>NextJS: getArticles (use cache)
        Note over NextJS: Cache hit = instant; miss = DB
        NextJS->>DB: getHomePageSeo (use cache)
    end
    NextJS-->>Browser: Stream page content
```

---

## Implementation Steps

### 1. Remove Auth from Layout Blocking Path

**File:** [modonty/app/layout.tsx](modonty/app/layout.tsx)

**Change:** Pass `session={null}` and remove `await auth()`. NextAuth SessionProvider fetches session client-side via `useSession()` when given null.

**Before:**
```tsx
let session = null;
try {
  session = await auth();
} catch (error) { ... }
return (
  <SessionProvider session={session}>
```

**After:**
```tsx
return (
  <SessionProvider session={null}>
```

**Rationale:** TopNav and ChatSheetProvider use `useSession()` (client hook). A brief "Sign in" flash for logged-in users is acceptable for the LCP gain.

---

### 2. Add fetchPriority="high" for LCP Images

**File:** [modonty/components/OptimizedImage.tsx](modonty/components/OptimizedImage.tsx)

**Issue:** Line 80 uses `{...(!priority && fetchPriority && { fetchPriority })}`, so `fetchPriority` is never passed when `priority` is true.

**Change:** Add `fetchPriority={priority ? "high" : fetchPriority}` to the Image props.

---

### 3. Enable Cache Components

**File:** [modonty/next.config.ts](modonty/next.config.ts)

**Change:** Add `cacheComponents: true` at the top level of the config.

```ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  serverExternalPackages: ["cohere-ai"],
  // ... rest unchanged
};
```

**Note:** This enables `"use cache"` and requires any uncached async access to be wrapped in Suspense. After we cache getArticles and getHomePageSeo, the home page will use cached data and avoid blocking.

---

### 4. Add "use cache" to getArticles

**File:** [modonty/app/api/helpers/article-queries.ts](modonty/app/api/helpers/article-queries.ts)

**Change:** Extract the core logic into a cached function. React's `cache()` operates in a different scope than `"use cache"`; keep both for request deduplication and persistent caching.

```ts
import { cacheTag, cacheLife } from "next/cache";

async function getArticlesCached(filters: ArticleFilters = {}) {
  "use cache";
  cacheTag("articles");
  cacheLife("minutes"); // 1 min revalidate, 1 hour expire (per Next.js preset)
  // ... move current getArticles body here (DB query + mapArticleToResponse)
  return { articles, pagination };
}

export const getArticles = cache(async (filters: ArticleFilters = {}) => {
  return getArticlesCached(filters);
});
```

**Serialization:** ArticleFilters (page, limit, category, client, featured, status) and ArticleResponse (plain objects, ISO strings) are serializable.

---

### 5. Add "use cache" to getHomePageSeo

**File:** [modonty/lib/seo/home-page-seo.ts](modonty/lib/seo/home-page-seo.ts)

**Change:**

```ts
import { cacheTag, cacheLife } from "next/cache";

export async function getHomePageSeo(): Promise<HomePageSeo> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours"); // Settings change rarely; "days" also valid
  // ... existing db.settings query
}
```

---

### 6. Add Revalidation on Data Mutations (Follow-up)

When articles or settings are created/updated/deleted, call:

- `revalidateTag("articles")` - in admin article create/update/delete flows
- `revalidateTag("settings")` - in admin settings update flows

**File(s):** Admin app server actions or API routes that mutate articles/settings.

```ts
import { revalidateTag } from "next/cache";
// After article mutation:
revalidateTag("articles");
// After settings mutation:
revalidateTag("settings");
```

This ensures cached home page data stays fresh when content changes.

---

## Verification

1. **LCP:** Run Lighthouse or Chrome DevTools Local metrics on `/` - expect LCP under 2.5s on good networks
2. **Auth:** Login/logout works; TopNav shows correct state after hydration
3. **Cache:** Second visit to `/` loads faster (cache hit for getArticles, getHomePageSeo)
4. **Revalidation:** After adding revalidateTag, publishing a new article updates home feed within cacheLife window or on next request

---

## Verification Checklist (100% Confirmed)

| Item | Status | Notes |
|------|--------|-------|
| Next.js 16.1.6 | OK | Project uses next ^16.1.6 - cacheComponents supported |
| cacheComponents config | OK | `cacheComponents: true` at top level of next.config |
| cacheTag/cacheLife import | OK | From `"next/cache"` (same as existing revalidatePath) |
| cacheLife("minutes") | OK | Built-in preset: 5min stale, 1min revalidate, 1h expire |
| getArticles serialization | OK | ArticleFilters = primitives; ArticleResponse = plain objects + ISO strings |
| getHomePageSeo serialization | OK | Returns { metadata, jsonLd } - serializable |
| SessionProvider session=null | OK | NextAuth fetches client-side when session not passed |
| TopNav/ChatSheetProvider | OK | Use useSession() - work with client-fetched session |
| Article page auth | OK | Fetches auth() itself - layout change does not affect it |
| loading.js coverage | OK | app/loading.tsx exists; article page has loading.tsx |
| fetchPriority prop | OK | Next.js Image supports fetchPriority natively |

---

## Caveats and Trade-offs

1. **Auth flash**: Logged-in users may see LoginButton for ~100-300ms before UserMenu appears (client fetch). Acceptable for LCP gain.
2. **cacheLife choice**: "minutes" for articles = 1 min revalidate. For less DB load, consider "hours". For settings, "hours" or "days" may be better than "minutes".
3. **Admin revalidateTag**: Must be added where articles/settings mutate; otherwise cache can serve stale data until cacheLife expiry.
4. **Page revalidate=60**: Home page has `revalidate = 60`. With "use cache", cacheLife and revalidateTag control freshness. The page-level revalidate may be redundant; monitor for conflicts.

---

## Files Modified Summary

| File | Change |
|------|--------|
| [modonty/app/layout.tsx](modonty/app/layout.tsx) | Remove await auth(), pass session=null |
| [modonty/components/OptimizedImage.tsx](modonty/components/OptimizedImage.tsx) | fetchPriority="high" when priority=true |
| [modonty/next.config.ts](modonty/next.config.ts) | Add cacheComponents: true |
| [modonty/app/api/helpers/article-queries.ts](modonty/app/api/helpers/article-queries.ts) | Add getArticlesCached with "use cache" |
| [modonty/lib/seo/home-page-seo.ts](modonty/lib/seo/home-page-seo.ts) | Add "use cache" with cacheTag/cacheLife |
| Admin article/settings mutation flows | Add revalidateTag (follow-up) |
