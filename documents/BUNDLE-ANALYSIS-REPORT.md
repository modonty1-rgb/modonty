# Bundle Analysis Report

**Date:** 2026-02-07  
**Tool:** `npx next experimental-analyze` (Next.js v16.1 official)  
**Route analyzed:** `/` (Home page – Client bundle)

---

## Summary

| Metric | Value |
|--------|-------|
| **Compressed** | ~494.56 KB |
| **Uncompressed** | 1.23 MB |
| **Modules** | 351 |

---

## Top Bundle Contributors

| Section | Size (compressed) | Notes |
|---------|-------------------|-------|
| `[project]/` | 447.50 KB | App code |
| `node_modules/.pnpm/` | 390.83 KB | Dependencies |
| `node_modules/next/` | 263.48 KB | Next.js + Babel |
| `dist/` | 263.32 KB | Compiled output |
| `client/` | 108.89 KB | Client code |
| `react-dom-client.production.js` | 60.80 KB | React DOM |
| `shared/lib/` | 44.08 KB | Shared libs |
| `compiled/` | 82.35 KB | Compiled assets |

---

## Findings

1. **App code (~447 KB)** – Largest share; review for heavy imports, dynamic imports, and tree-shaking.
2. **Next.js (~263 KB)** – Framework baseline; expected.
3. **`react-dom` (~61 KB)** – Core React runtime; expected.
4. **`lucide-react`** – Present; `optimizePackageImports` is already configured.
5. **`chatbot/`** – Visible; deferred loading should help.
6. **`tailwind-merge`** – Small; minor impact.

---

## Vs. Chrome DevTools “Duplicated JavaScript” (437 kB)

The analyzer does not show “duplicated” size as a separate metric. Likely causes:

- Same package in multiple chunks (e.g. shared runtime).
- Monorepo/workspace packages resolving to different versions.
- Webpack vs Turbopack output differences.

**Actions:** Run `pnpm dedupe` and re-profile; use `pnpm why <package>` to inspect large deps.

---

## Recommendations

1. ✅ **GTM lazyOnload** – Already applied.
2. ✅ **Chatbot deferred** – Already applied.
3. ✅ **ScrollProgress/BackToTop** – Already deferred.
4. **`pnpm dedupe`** – Run once to reduce duplicate dependencies (optional).
5. **Verify deferrals** – Confirm chatbot/GTM are not loading before LCP.
6. **Profile other routes** – e.g. `/articles/[slug]`, `/trending` for heavier client bundles.

---

## How to Run Again

```bash
cd modonty && pnpm run build:analyze
```

Opens at http://localhost:4000. Use the route selector, Client/Server filter, and search to explore routes and modules.
