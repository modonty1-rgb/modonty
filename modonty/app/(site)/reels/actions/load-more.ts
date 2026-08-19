"use server";

import { auth } from "@/lib/auth";

import { getReelsFeedPage } from "@/lib/queries/get-reels-feed-page";
import { getUserReelFlags } from "@/lib/queries/get-user-reel-flags";
import type { ReelFeedItemWithState } from "@/lib/queries/reels-feed-shapes";

export interface LoadMoreResult {
  items: ReelFeedItemWithState[];
  nextCursor: string | null;
}

export async function loadMoreReels(cursor: string): Promise<LoadMoreResult> {
  const { items, nextCursor } = await getReelsFeedPage(cursor);

  const session = await auth();
  const userId = session?.user?.id ?? null;
  let liked = new Set<string>();
  let fav = new Set<string>();
  if (userId && items.length > 0) {
    ({ liked, fav } = await getUserReelFlags(userId, items.map((i) => i.id)));
  }

  return {
    items: items.map((i) => ({
      ...i,
      likedByMe: liked.has(i.id),
      favoritedByMe: fav.has(i.id),
    })),
    nextCursor,
  };
}
