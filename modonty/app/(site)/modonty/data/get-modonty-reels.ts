import { cacheTag, cacheLife } from "next/cache";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import type { ReelItem } from "@/components/shared/reels-card/ReelsCard";

/** The rail card shows three portrait tiles — the same count the homepage sidebar uses. */
const RAIL_REELS = 3;

/**
 * modonty's OWN published reels — this page is modonty as the core client, so it shows
 * only what belongs to modonty (Khalid, 2026-08-17: «الصفحة هذي تعرض كل ما يخص مدونتي»).
 * Same definition of a reel as `/reels` (`inReels` + `reelStatus PUBLISHED`), scoped to one
 * client. The `mimeType: image/` filter that used to sit here is GONE (card 83d, 24 Aug 2026):
 * a reel is a vertical clip, so filtering to stills meant the day modonty published its first
 * video the card would silently skip it. The tile draws the video's poster — `thumbnailUrl`
 * when the row carries one, its own `url` otherwise — so nothing about the tile changes.
 */
export async function getModontyReels(clientId: string): Promise<ReelItem[]> {
  "use cache";
  cacheTag("reels");
  cacheLife("minutes");

  const reels = await db.media.findMany({
    where: { clientId, inReels: true, reelStatus: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      url: true,
      bunnyUrl: true,
      blurDataURL: true,
      reelSlug: true,
      thumbnailUrl: true,
      bunnyVideoId: true,
      client: { select: { name: true } },
    },
    orderBy: [{ reelPublishedAt: "desc" }, { id: "desc" }],
    take: RAIL_REELS,
  });

  return reels.map((reel) => ({
    id: reel.id,
    title: reel.title ?? "",
    // A video reel is one Bunny actually encoded (`bunnyVideoId`) — the same honest
    // discriminator `/reels` uses, not the mime type. Its still is the thumbnail.
    imageUrl: reel.bunnyVideoId ? (reel.thumbnailUrl ?? mediaSrc(reel)) : mediaSrc(reel),
    clientName: reel.client?.name ?? "",
    // Null stays null: the tile then points at the feed instead of a URL that would 404.
    slug: reel.reelSlug,
  }));
}
