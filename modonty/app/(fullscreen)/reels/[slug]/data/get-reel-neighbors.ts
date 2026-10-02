import { cacheTag, cacheLife } from "next/cache";

import { db } from "@/lib/db";

/**
 * The reels just before and after this one, in the feed's own order (newest first). The watch
 * page links both with a real `<a href>` — plan item د١ (2 Oct 2026): the homepage links only
 * the latest four reels, so an older reel had no page linking to it and Google never found it.
 * With these two links every reel is reachable from the newest one.
 */
export async function getReelNeighbors(reelId: string): Promise<{ newer: string | null; older: string | null }> {
  "use cache";
  cacheTag("reels");
  // hours, not minutes (Vercel cost / plan أ٦, 2 Oct 2026) — reels: a newly approved reel revalidates the tag.
  cacheLife("hours");

  const reels = await db.media.findMany({
    where: { inReels: true, reelStatus: "PUBLISHED", reelSlug: { not: null }, client: { isNot: null } },
    orderBy: [{ reelPublishedAt: "desc" }, { id: "desc" }],
    take: 1000,
    select: { id: true, reelSlug: true },
  });

  const i = reels.findIndex((r) => r.id === reelId);
  if (i === -1) return { newer: null, older: null };
  return { newer: reels[i - 1]?.reelSlug ?? null, older: reels[i + 1]?.reelSlug ?? null };
}
