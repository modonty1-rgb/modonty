"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export interface InfiniteListPage<T> {
  items: T[];
  hasMore: boolean;
}

/**
 * Generic infinite-scroll engine: sentinel observer + page fetching + key dedup +
 * loading/error/end/empty states, with optional History-API URL sync.
 *
 * SEO contract (Google "Fix lazy-loaded content" + pagination docs): infinite
 * scroll is a PROGRESSIVE ENHANCEMENT over a server-rendered paginated series.
 * The consuming route — not this component — must provide:
 *   1. a persistent URL per chunk with an absolute page number (e.g. /page/2)
 *      that server-renders that exact chunk;
 *   2. sequential <a href> prev/next links, because crawlers neither scroll nor click;
 *   3. real HTTP statuses for out-of-range pages (404) — not a streamed 200.
 * Pass `pageUrl` so each loaded chunk mirrors its crawlable twin via pushState.
 * This component owns the scrolling; the route owns the SEO.
 *
 * Zero product knowledge on purpose: items, state UIs, and strings all come from
 * the consumer, so the same engine serves modonty, admin, and console.
 */
interface InfiniteListProps<T> {
  /** Consumer's Route Handler call. Reads must NOT go through a Server Action —
   *  Next.js dispatches actions one at a time per client, so a scroll fetch
   *  through an action would queue behind every other action on the page. */
  fetchPage: (page: number) => Promise<InfiniteListPage<T>>;
  getKey: (item: T) => string;
  /** Receives the ABSOLUTE index (startIndex + position) — LCP/priority logic needs it. */
  renderItem: (item: T, index: number) => ReactNode;
  renderLoading: (seenCount: number) => ReactNode;
  renderError: (retry: () => void) => ReactNode;
  renderEnd: (seenCount: number) => ReactNode;
  /** Shown only when the WHOLE list is empty (startIndex 0 + no items + no more). */
  emptyState?: ReactNode;
  initialItems?: T[];
  initialPage?: number;
  /** How many items the surrounding page already rendered before this list. */
  startIndex?: number;
  /** Crawlable twin of each chunk (e.g. p => `/page/${p}`). When set, the displayed
   *  URL is updated via pushState after every successful load — Google's requirement. */
  pageUrl?: (page: number) => string;
  listClassName?: string;
}

export function InfiniteList<T>({
  fetchPage,
  getKey,
  renderItem,
  renderLoading,
  renderError,
  renderEnd,
  emptyState,
  initialItems = [],
  initialPage = 1,
  startIndex = 0,
  pageUrl,
  listClassName = "space-y-4",
}: InfiniteListProps<T>) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const ignoredRef = useRef(false);
  const loadingRef = useRef(false); // synchronous guard — prevents double fetch when observer + initial-load fire together

  const seenCount = startIndex + items.length;

  useEffect(() => {
    ignoredRef.current = false;
    return () => {
      ignoredRef.current = true;
    };
  }, []);

  const loadMore = async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoading(true);
    setError(false);
    const nextPage = page + 1;

    try {
      const result = await fetchPage(nextPage);
      if (ignoredRef.current) return;
      if (result.items.length > 0) {
        // Drop any item already in the list — guards against page-boundary overlap
        // when a new row lands mid-scroll and shifts offset pagination.
        setItems((prev) => {
          const seen = new Set(prev.map(getKey));
          const fresh = result.items.filter((item) => !seen.has(getKey(item)));
          return fresh.length > 0 ? [...prev, ...fresh] : prev;
        });
        setPage(nextPage);
        setHasMore(result.hasMore);
        if (pageUrl) window.history.pushState(null, "", pageUrl(nextPage));
      } else {
        setHasMore(false);
      }
    } catch {
      if (!ignoredRef.current) setError(true);
    } finally {
      loadingRef.current = false;
      if (!ignoredRef.current) setLoading(false);
    }
  };

  // Everything calls through the ref, so consumer-inline callbacks (fetchPage,
  // getKey, pageUrl) never force observer re-subscription or stale closures.
  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  // First-page load that doesn't depend solely on the IntersectionObserver firing on
  // mount (covers sentinel-already-in-view and hot-reload resets — prevents a stuck list).
  // Intent (did the visitor actually scroll?) is decided by whoever mounts this — see
  // useMountOnApproach — because by the time this mounts, the scroll that brought the
  // sentinel into view has already happened.
  useEffect(() => {
    if (items.length === 0 && hasMore && !error) {
      loadMoreRef.current();
    }
  }, [items.length, hasMore, error]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        loadMoreRef.current();
      },
      { root: null, rootMargin: "100px", threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // The observer reports TRANSITIONS, not state — and that alone is not enough to keep a
  // list moving. An intersection that arrives while a fetch is in flight hits the
  // `loadingRef` guard at the top of `loadMore` and returns; the event is consumed and
  // never replayed. If the sentinel is still on screen when that fetch lands, no new
  // transition ever happens and the list is stuck for good.
  //
  // Measured on `/articles` (22 Aug 2026): scrolling in slow steps loaded page after page,
  // but jumping straight to the bottom repeatedly froze it at 40 rows — six more jumps,
  // zero requests, sentinel sitting at `top: 57` fully in view. That is not a test artifact:
  // a phone fling produces exactly the same sequence.
  //
  // So after every settled load, ask the sentinel where it is instead of waiting to be
  // told. Same `100px` margin the observer uses, so the two agree on «near the end».
  useEffect(() => {
    if (loading || !hasMore || error) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const box = sentinel.getBoundingClientRect();
    const stillInReach = box.top < window.innerHeight + 100 && box.bottom > -100;
    if (stillInReach) loadMoreRef.current();
  }, [loading, hasMore, error, items.length]);

  const handleRetry = () => {
    setError(false);
    loadMoreRef.current();
  };

  const showEmptyState = items.length === 0 && startIndex === 0 && !loading && !hasMore;

  return (
    <>
      {items.length > 0 ? (
        <div className={listClassName}>
          {items.map((item, index) => (
            <Fragment key={getKey(item)}>{renderItem(item, startIndex + index)}</Fragment>
          ))}
        </div>
      ) : showEmptyState ? (
        (emptyState ?? null)
      ) : null}

      <div ref={sentinelRef} className="w-full py-8">
        {loading && renderLoading(seenCount)}
        {error && renderError(handleRetry)}
        {!hasMore && !loading && !error && items.length > 0 && renderEnd(seenCount)}
      </div>
    </>
  );
}
