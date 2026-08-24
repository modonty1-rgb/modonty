import "server-only";

import { db } from "@/lib/db";
import { mediaSrc } from "@modonty/shared/lib/media-src";

export interface MyReelTile {
  id: string;
  /** Watch URL segment; null when the row has no `reelSlug` yet. */
  slug: string | null;
  title: string;
  imageUrl: string | null;
  clientName: string;
}

/**
 * The reader's own reels — what they liked, or what they saved.
 *
 * Until now `MediaReaction` had exactly ONE consumer in modonty (`get-user-reel-flags.ts`,
 * which only reads it to draw the heart filled). Nothing anywhere listed the rows back, so a
 * reader could save a reel and never reach it again — the save button wrote into a void
 * (measured 24 Aug 2026: `grep mediaReaction` returned that single file).
 *
 * Not cached: the answer is one reader's, and a cached one would hand a stranger's list over.
 */
export async function getMyReels(
  userId: string,
  kind: "LIKE" | "FAVORITE",
  take = 60
): Promise<MyReelTile[]> {
  const rows = await db.mediaReaction.findMany({
    where: {
      userId,
      kind,
      // A reel that was unpublished since must not surface in a personal list — it would open
      // a watch page that answers `notFound()`.
      media: { inReels: true, reelStatus: "PUBLISHED" },
    },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      media: {
        select: {
          id: true,
          reelSlug: true,
          title: true,
          url: true,
          bunnyUrl: true,
          blurDataURL: true,
          thumbnailUrl: true,
          bunnyVideoId: true,
          client: { select: { name: true } },
        },
      },
    },
  });

  return rows
    .filter((r) => r.media)
    .map(({ media: m }) => ({
      id: m!.id,
      slug: m!.reelSlug,
      title: m!.title ?? "",
      // Same discriminator the feed uses: an encoded reel shows its thumbnail, a still its own file.
      imageUrl: m!.bunnyVideoId ? (m!.thumbnailUrl ?? mediaSrc(m!)) : mediaSrc(m!),
      clientName: m!.client?.name ?? "",
    }));
}
