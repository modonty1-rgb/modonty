import { useEffect, useState } from "react";

import { fetchMyReels } from "../actions/fetch-my-reels";
import type { MyReelTile } from "../data/get-my-reels";

/** «طلّاتي» — each tab loads once, on first view, and is kept after. */
export function useMyReels(open: boolean, kind: "LIKE" | "FAVORITE") {
  const [cache, setCache] = useState<Partial<Record<"LIKE" | "FAVORITE", MyReelTile[]>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || cache[kind]) return;
    let alive = true;
    setLoading(true);
    fetchMyReels(kind)
      .then((res) => {
        if (alive) setCache((c) => ({ ...c, [kind]: res.items }));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [open, kind, cache]);

  return { cache, loading };
}
