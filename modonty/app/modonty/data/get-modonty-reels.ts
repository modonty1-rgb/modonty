import { cacheTag, cacheLife } from "next/cache";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import type { ReelItem } from "@/components/shared/reels-card/ReelsCard";

/** The rail card shows three portrait tiles — the same count the homepage sidebar uses. */
const RAIL_REELS = 3;

/**
 * modonty's OWN published reels — this page is modonty as the core client, so it shows
 * only what belongs to modonty (Khalid, 2026-08-17: «الصفحة هذي تعرض كل ما يخص مدونتي»).
 * Same definition of a reel as `/reels` (`inReels` + `reelStatus PUBLISHED` + image),
 * scoped to one client. Empty on `modonty_dev` today (0 published reels, 2026-08-17).
 */
export async function getModontyReels(clientId: string): Promise<ReelItem[]> {
  "use cache";
  cacheTag("reels");
  cacheLife("minutes");

  const reels = await db.media.findMany({
    where: { clientId, inReels: true, reelStatus: "PUBLISHED", mimeType: { startsWith: "image/" } },
    select: { id: true, title: true, url: true, bunnyUrl: true, blurDataURL: true, client: { select: { name: true } } },
    orderBy: [{ reelPublishedAt: "desc" }, { id: "desc" }],
    take: RAIL_REELS,
  });

  return reels.map((reel) => ({
    id: reel.id,
    title: reel.title ?? "",
    imageUrl: mediaSrc(reel),
    clientName: reel.client?.name ?? "",
  }));
}
