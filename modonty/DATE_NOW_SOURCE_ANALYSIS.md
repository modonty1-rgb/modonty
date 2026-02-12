# Date.now() Prerender Error - Source Analysis

**Error:** `Route "/categories" used Date.now() inside a Client Component without a Suspense boundary above it`

**Affected routes:** `/categories`, `/help`

---

## Likely Sources (in渲染 order)

### 1. **GTMContainer** (`components/gtm/GTMContainer.tsx`)

```tsx
// Line 19 - inside dangerouslySetInnerHTML script
new Date().getTime(),event:'gtm.js'
```

The GTM script injects `new Date().getTime()` when it runs. If Next.js executes the script during prerender simulation, this triggers the error.

**Status:** Already wrapped in `<Suspense fallback={null}>`

---

### 2. **TopNav** (`components/TopNav.tsx`)

- `"use client"`
- Uses `usePathname()` and `useSession()`
- In layout for all pages

**Note:** With `cacheComponents: true`, [Next.js docs](https://nextjs.org/docs/app/api-reference/functions/use-pathname) state: "usePathname may require a Suspense boundary for dynamic routes."

---

### 3. **MobileFooter** (`components/MobileFooter.tsx`)

- `"use client"`
- Uses `usePathname()`
- In layout for all pages

---

### 4. **CategorySearchForm & CategoryFilters** (`app/categories/components/`)

- Both `"use client"`
- Both use `useSearchParams()`
- **Status:** Wrapped in Suspense on categories page

---

### 5. **Profile page** (`app/users/profile/page.tsx`)

```tsx
// Line 279
انضم في {new Date((session.user as any).createdAt || Date.now()).toLocaleDateString("ar-SA")}
```

- Client component with `Date.now()`
- **Not used on /categories or /help** – only on profile route

---

### 6. **Session-helper** (`app/help/faq/helpers/session-helper.ts`)

```ts
// Line 19
sessionId = `faq-session-${Date.now()}-${Math.random()...}`;
```

- `"use server"` – server action
- Called when creating FAQ session, not during initial /help render

---

## External Libraries (Next.js / next-auth)

- **useSearchParams** – needs Suspense for prerender
- **usePathname** – may need Suspense with `cacheComponents: true`
- **useSession** (next-auth) – may use Date for token expiry

---

## Recommended Next Steps

1. **Run debug build:** `npx next build --debug-prerender` with root Suspense removed to capture the stack trace.
2. **Isolate GTM:** Temporarily remove or comment out GTMContainer and rebuild.
3. **Test layout:** Wrap only Footer in Suspense (Footer is server, but FooterCopyright is used – verify it doesn’t use Date).
4. **Try disabling cacheComponents:** Set `cacheComponents: false` in next.config to see if the error changes.

---

## Current Fix

Root Suspense around `SessionProvider` (and full layout) fixes the build but causes ~937ms render delay for LCP.
