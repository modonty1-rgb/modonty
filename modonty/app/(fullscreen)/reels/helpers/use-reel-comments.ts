import { useEffect, useState } from "react";

import { fetchReelComments } from "../data/fetch-reel-comments";
import type { ReelComment } from "../data/get-reel-comments";

/** A reel's comments, loaded the moment the sheet opens; `setFetched(false)` reloads the truth. */
export function useReelComments(mediaId: string, open: boolean) {
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || fetched) return;
    setLoading(true);
    setError(null);
    fetchReelComments(mediaId)
      .then((data) => {
        setComments(data);
        setFetched(true);
      })
      .catch(() => setError("فشل تحميل التعليقات"))
      .finally(() => setLoading(false));
  }, [open, fetched, mediaId]);

  return { comments, setComments, loading, fetched, setFetched, error, setError };
}
