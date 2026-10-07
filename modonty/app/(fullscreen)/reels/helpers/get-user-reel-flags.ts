import { db } from "@/lib/db";

/** Per-user like/favorite flags — session-specific, deliberately NOT cached. */
export async function getUserReelFlags(
  userId: string,
  reelIds: string[]
): Promise<{ liked: Set<string>; fav: Set<string> }> {
  // One table for both now, split by `kind` — two queries became one.
  const reactions = await db.mediaReaction.findMany({
    where: { userId, mediaId: { in: reelIds } },
    select: { mediaId: true, kind: true },
  });
  return {
    liked: new Set(reactions.filter((r) => r.kind === "LIKE").map((r) => r.mediaId)),
    fav: new Set(reactions.filter((r) => r.kind === "FAVORITE").map((r) => r.mediaId)),
  };
}
