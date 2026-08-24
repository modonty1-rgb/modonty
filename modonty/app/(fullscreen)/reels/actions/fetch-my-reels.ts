"use server";

import { auth } from "@/lib/auth";

import { getMyReels, type MyReelTile } from "../data/get-my-reels";

/**
 * The sheet's data, fetched on first open rather than with the page: a reader who never taps
 * their avatar should not pay two queries for a list they did not ask for.
 */
export async function fetchMyReels(
  kind: "LIKE" | "FAVORITE"
): Promise<{ items: MyReelTile[] }> {
  const session = await auth();
  const userId = session?.user?.id;
  // Signed out reaches the sign-in prompt before this runs; an empty list is the safe answer
  // if it is ever called anyway — never another reader's rows.
  if (!userId) return { items: [] };
  return { items: await getMyReels(userId, kind) };
}
