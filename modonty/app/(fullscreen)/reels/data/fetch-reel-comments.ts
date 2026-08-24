"use server";

import { auth } from "@/lib/auth";

import { getReelComments, type ReelComment } from "./get-reel-comments";

/**
 * The client-callable door to a reel's comments — loaded the moment the sheet opens, never
 * with the feed itself. Thin on purpose, like fetchArticleComments: the query lives in
 * get-reel-comments.ts; this file only resolves who is asking.
 */
export async function fetchReelComments(mediaId: string): Promise<ReelComment[]> {
  const session = await auth();
  return getReelComments(mediaId, session?.user?.id ?? null);
}
