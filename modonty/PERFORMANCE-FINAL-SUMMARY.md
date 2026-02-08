# Performance – Final Summary

**Date:** 2026-02-07  
**Scope:** LCP, script blocking, bundle size, deferrals

---

## ✅ Completed Changes

| # | Change | File(s) |
|---|--------|---------|
| 1 | GTM env fallback – support `NEXT_PUBLIC_GTM_ID` | `helpers/gtm/getGTMSettings.ts` |
| 2 | GTM strategy → `lazyOnload` | `components/gtm/GTMContainer.tsx` |
| 3 | Remove extra `priority` from `InfiniteArticleList` | `components/InfiniteArticleList.tsx` |
| 4 | Chatbot deferred until sheet opens | `components/chatbot/ChatSheetProvider.tsx` |
| 5 | ScrollProgress & BackToTop in client component | `components/FeedDeferredUI.tsx`, `FeedContainer.tsx` |
| 6 | Use official bundle analyzer | `next.config.ts`, `package.json` |

---

## 📁 Files Touched

**New**
- `components/FeedDeferredUI.tsx` – client wrapper for ScrollProgress + BackToTop

**Modified**
- `helpers/gtm/getGTMSettings.ts`
- `components/gtm/GTMContainer.tsx`
- `components/InfiniteArticleList.tsx`
- `components/chatbot/ChatSheetProvider.tsx`
- `components/FeedContainer.tsx`
- `next.config.ts` – removed `@next/bundle-analyzer`
- `package.json` – `build:analyze` uses `npx next experimental-analyze`

---

## 📊 Bundle Snapshot (Home, Client)

| Metric | Value |
|--------|-------|
| Compressed | ~495 KB |
| Uncompressed | 1.23 MB |
| Modules | 351 |

**Main contributors:** project (~447 KB), Next.js (~263 KB), React DOM (~61 KB)

---

## 🧪 How to Test

```bash
# Bundle analysis
cd modonty && pnpm run build:analyze
# → http://localhost:4000

# Dedupe deps (optional)
pnpm dedupe

# Dev
pnpm run dev
# → http://localhost:3000
```

---

## 📋 Deploy Checklist

- [ ] `pnpm build:modonty` passes
- [ ] No TypeScript/lint errors
- [ ] LCP < 2.5s
- [ ] GTM loads after LCP
- [ ] Chatbot opens on click

---

**Status:** Ready for deployment
