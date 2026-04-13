# Suggested Changes (Optional)

Documentation of optional improvements identified during codebase review.

---

## 1. InfiniteArticleList – stabilize IntersectionObserver

**File:** `components/InfiniteArticleList.tsx`

**Issue:** The IntersectionObserver depends on `loadMore`, which changes whenever `loading`, `hasMore`, or `page` changes. This recreates the observer frequently. With a short viewport and few posts, this can trigger more `loadMore` calls than intended.

**Current:**
```tsx
useEffect(() => {
  const sentinel = sentinelRef.current;
  if (!sentinel) return;

  observerRef.current = new IntersectionObserver(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        loadMore();
      }
    },
    { root: null, rootMargin: "100px", threshold: 0.1 }
  );
  observerRef.current.observe(sentinel);
  return () => observerRef.current?.disconnect();
}, [hasMore, loading, loadMore]);
```

**Suggested change:**
```tsx
const loadMoreRef = useRef(loadMore);
loadMoreRef.current = loadMore;

useEffect(() => {
  const sentinel = sentinelRef.current;
  if (!sentinel) return;

  observerRef.current = new IntersectionObserver(
    (entries) => {
      const [entry] = entries;
      if (!entry.isIntersecting) return;
      loadMoreRef.current(); // guard (loading, hasMore) inside loadMore
    },
    { root: null, rootMargin: "100px", threshold: 0.1 }
  );
  observerRef.current.observe(sentinel);
  return () => observerRef.current?.disconnect();
}, []); // empty deps – observer created once
```

**Note:** The `loadMore` callback keeps its existing guard (`if (loading || !hasMore) return`).
