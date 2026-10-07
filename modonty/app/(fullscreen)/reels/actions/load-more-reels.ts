"use server";

import { auth } from "@/lib/auth";

import { getReelsPageFor } from "../helpers/get-reels-page-for";
import type { ReelFeedItemWithState } from "@/lib/queries/reels-feed-shapes";

interface LoadMoreResult {
  items: ReelFeedItemWithState[];
  nextCursor: string | null;
}

/** Web door: identity from the session cookie, page + flags from `getReelsPageFor` (shared with the mobile API). */
export async function loadMoreReels(cursor: string, clientSlug?: string | null): Promise<LoadMoreResult> {
  const session = await auth();
  return getReelsPageFor(session?.user?.id ?? null, cursor, clientSlug);
}
