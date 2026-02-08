# Next.js Cache Components - Official Docs Fix Plan

Based on [Next.js 16 docs](https://nextjs.org/docs/app/getting-started/cache-components).

## Current State
- `cacheComponents: false` - build passes with route segment configs
- Footer uses client component for `new Date()` (FooterYear)
- getArticles, getHomePageSeo use `"use cache"` + cacheTag + cacheLife
- revalidateTag API in place for admin-triggered invalidation

## With cacheComponents: true (Recommended)

### 1. Route segment configs
**Per docs:** `dynamic`, `revalidate`, `fetchCache` are disabled. Remove them.

### 2. Replace revalidate with cacheLife
**Per docs:** Use `cacheLife` inside `"use cache"` functions instead of route-level `revalidate`.
- Already done: getArticles (cacheLife: minutes), getHomePageSeo (cacheLife: hours)

### 3. Uncached data outside Suspense
**Per [blocking-route](https://nextjs.org/docs/messages/blocking-route):** Either:
- **Use "use cache"** for data you want in static shell
- **Wrap in Suspense** for request-time data with fallback UI

Example for pages with db access (cookie-policy, clients/[slug], articles/[slug]):
```tsx
// Before
export default async function Page() {
  const data = await db.query(...)
  return <div>{data}</div>
}

// After - wrap in Suspense
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

### 4. new Date() in Server Component
**Per [next-prerender-current-time](https://nextjs.org/docs/messages/next-prerender-current-time):**
- Move to Client Component (done: FooterYear)
- Client Component with Date needs **Suspense boundary above it** per [next-prerender-current-time-client](https://nextjs.org/docs/messages/next-prerender-current-time-client)

```tsx
// In layout or parent
<Suspense fallback={<span>...</span>}>
  <Footer />
</Suspense>
```

### 5. API routes (GET with request data)
**Per [Route Handlers with Cache Components](https://nextjs.org/docs/app/getting-started/route-handlers#with-cache-components):**
- Accessing `request.url`, `request.headers`, etc. defers to request-time (prerender stops)
- For cached responses: extract logic to helper with `"use cache"`, call from handler

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

For routes that need searchParams: they run at request time by default. The "bail out" when accessing request is expected.

### 6. Connection() for explicit request-time
**Per docs:** Use `await connection()` before `Date.now()` or non-deterministic ops when you need request-time in a Server Component.

## Pragmatic choice
With `cacheComponents: false`, the app uses traditional ISR. Enable `cacheComponents: true` when ready to add Suspense boundaries and migrate fully.
