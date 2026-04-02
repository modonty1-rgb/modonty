# Next.js Cache Components - Fix Plan

**Reference**: [Next.js 16 Cache Components Docs](https://nextjs.org/docs/app/getting-started/cache-components)

## Current State

- `cacheComponents: false` - Build passes with route segment configs
- Footer uses client component for `new Date()` (FooterYear)
- getArticles, getHomePageSeo use `"use cache"` + cacheTag + cacheLife
- revalidateTag API in place for admin-triggered invalidation

## Migration to `cacheComponents: true`

### 1. Route Segment Configs

Per docs: `dynamic`, `revalidate`, `fetchCache` are disabled. Remove them.

### 2. Replace Revalidate with cacheLife

Use `cacheLife` inside `"use cache"` functions instead of route-level `revalidate`.

Already done:
- getArticles (cacheLife: minutes)
- getHomePageSeo (cacheLife: hours)

### 3. Uncached Data Outside Suspense

**Per [blocking-route docs](https://nextjs.org/docs/messages/blocking-route)**: Either:
- **Use "use cache"** for data in static shell
- **Wrap in Suspense** for request-time data with fallback UI

**Before**:
```tsx
export default async function Page() {
  const data = await db.query(...)
  return <div>{data}</div>
}
```

**After - wrap in Suspense**:
```tsx
export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContent />
    </Suspense>
  )
}

async function PageContent() {
  const data = await db.query(...)
  return <div>{data}</div>
}
```

Apply to pages with db access: cookie-policy, clients/[slug], articles/[slug]

### 4. new Date() in Server Component

**Per [next-prerender-current-time docs](https://nextjs.org/docs/messages/next-prerender-current-time)**:
- Move to Client Component (done: FooterYear)
- Client Component with Date needs **Suspense boundary above it** per [next-prerender-current-time-client docs](https://nextjs.org/docs/messages/next-prerender-current-time-client)

```tsx
// In layout or parent
<Suspense fallback={<span>...</span>}>
  <Footer />
</Suspense>
```

### 5. API Routes with Request Data

**Per [Route Handlers with Cache Components docs](https://nextjs.org/docs/app/getting-started/route-handlers#with-cache-components)**:
- Accessing `request.url`, `request.headers` defers to request-time (prerender stops)
- For cached responses: extract logic to helper with `"use cache"`

```ts
// Cached helper
async function getProducts() {
  "use cache"
  cacheLife("hours")
  return db.query("SELECT * FROM products")
}

// Route - no request access, fully cached
export async function GET() {
  const products = await getProducts()
  return Response.json(products)
}
```

Routes using searchParams run at request time by default.

### 6. Connection() for Explicit Request-Time

**Per docs**: Use `await connection()` before `Date.now()` or non-deterministic ops when you need request-time in a Server Component.

## Recommendation

With `cacheComponents: false`, the app uses traditional ISR. Enable `cacheComponents: true` when ready to:
1. Add Suspense boundaries
2. Migrate to request-time data fetching
3. Use `cacheLife` for granular cache control
