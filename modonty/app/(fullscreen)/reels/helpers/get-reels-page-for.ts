import "server-only";

import { getReelsFeedPage } from "@/lib/queries/get-reels-feed-page";
import { getUserReelFlags } from "./get-user-reel-flags";
import { withReelState } from "./with-reel-state";
import type { ReelFeedItemWithState } from "@/lib/queries/reels-feed-shapes";

interface ReelsPageForReader {
  items: ReelFeedItemWithState[];
  nextCursor: string | null;
}

/**
 * One page of the public reels feed with THIS reader's like/save flags — the body of
 * `loadMoreReels` with the identity passed in (`null` = signed out). The cached feed and the
 * uncached per-user flags stay separate reads, exactly as on the web.
 */
export async function getReelsPageFor(
  userId: string | null,
  cursor?: string | null,
  clientSlug?: string | null,
): Promise<ReelsPageForReader> {
  const { items, nextCursor } = await getReelsFeedPage(cursor, clientSlug);

  let liked = new Set<string>();
  let fav = new Set<string>();
  if (userId && items.length > 0) {
    ({ liked, fav } = await getUserReelFlags(userId, items.map((i) => i.id)));
  }

  return {
    items: withReelState(items, liked, fav),
    nextCursor,
  };
}
