import "server-only";

import { isMediaUsed } from "@/lib/media/usage-where";
import { isReelLive } from "@/lib/media/reel-where";
import { listMedia } from "@/lib/media/list-media";
import { getMediaTypeLabel } from "@/lib/media/media-utils";
import { REEL_STATUS, REEL_VIEW } from "@/lib/media/reel-status";
import type { ClientsMediaQuery } from "./clients-media-where";
import type { ClientsMediaUniverse } from "./get-clients-media-universe";

/**
 * One page of Clients › Media, shaped for the shared media grid.
 *
 * Two things the main library does not do, both because this page shows files by what they
 * ARE rather than how they were uploaded:
 * - `roleLabel` comes from the link first (a GENERAL upload that is a client's logo reads
 *   «Client Logo»), and a reel reads «Reel».
 * - `isUsed` is the same rule as the «Used» filter, so the badge and the filter agree —
 *   including gallery images and live reels, which the main grid's `_count` check misses.
 */
export async function getClientsMedia(
  { links, where }: ClientsMediaUniverse,
  query: ClientsMediaQuery & { sort?: string; page?: number },
) {
  const result = await listMedia(where(query), { sort: query.sort, page: query.page });

  const items = result.items.map((m) => {
    const isReel = m.inReels === true || m.reelStatus !== null;
    const roleLabel = isReel
      ? "Reel"
      : links.logoClients.has(m.id)
        ? getMediaTypeLabel("LOGO")
        : links.heroImageClients.has(m.id)
          ? getMediaTypeLabel("HERO")
          : links.mobileHeroImageClients.has(m.id)
            ? getMediaTypeLabel("HERO_MOBILE")
            : getMediaTypeLabel(m.type);
    return {
      ...m,
      client: m.client || undefined,
      isUsed: isMediaUsed(m, links) || isReelLive(m),
      roleLabel,
      reelHref: isReel ? `/reels/${REEL_VIEW[m.reelStatus ?? ""] ?? "pending"}` : undefined,
      status: isReel ? REEL_STATUS[m.reelStatus ?? ""] ?? { label: "In reels", tone: "muted" as const } : undefined,
    };
  });

  return { ...result, items };
}
