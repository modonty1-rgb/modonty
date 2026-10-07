import { useEffect, useRef, type Dispatch, type RefObject, type SetStateAction } from "react";

import { loadMoreReels } from "../actions/load-more-reels";
import type { ReelFeedItemWithState } from "@/lib/queries/reels-feed-shapes";

/** Infinite scroll — prefetch two screens before the end so the reader never hits a wall. */
export function useLoadMoreReels({
  scrollRef,
  sentinelRef,
  initialCursor,
  clientSlug,
  setItems,
}: {
  scrollRef: RefObject<HTMLDivElement | null>;
  sentinelRef: RefObject<HTMLDivElement | null>;
  initialCursor: string | null;
  /** Kept on infinite-scroll requests so a client filter never leaks other reels in. */
  clientSlug: string | null;
  setItems: Dispatch<SetStateAction<ReelFeedItemWithState[]>>;
}) {
  const stateRef = useRef({ cursor: initialCursor, loading: false });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const io = new IntersectionObserver(
      (entries) => {
        const s = stateRef.current;
        if (!entries[0].isIntersecting || s.loading || !s.cursor) return;
        s.loading = true;
        loadMoreReels(s.cursor, clientSlug)
          .then((res) => {
            setItems((prev) => [...prev, ...res.items]);
            s.cursor = res.nextCursor;
          })
          .finally(() => {
            s.loading = false;
          });
      },
      { root: scrollRef.current, rootMargin: "200% 0px" }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [clientSlug]);
}
