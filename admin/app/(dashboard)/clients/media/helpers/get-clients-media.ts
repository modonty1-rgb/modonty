import "server-only";

import { db } from "@/lib/db";
import { MEDIA_USED_WHERE } from "@/lib/media/usage-where";
import { listMedia } from "@/lib/media/list-media";
import { getMediaTypeLabel } from "@/lib/media/media-utils";
import { REEL_LIVE_WHERE } from "@/lib/media/reel-where";
import { REEL_STATUS, REEL_VIEW } from "@/lib/media/reel-status";
import { clientsMediaWhere, type ClientsMediaQuery } from "./clients-media-where";

/**
 * One page of Clients › Media, shaped for the shared media grid.
 *
 * Two things the main library does not do, both because this page shows files by what they
 * ARE rather than how they were uploaded:
 * - `roleLabel` comes from the link first (a GENERAL upload that is a client's logo reads
 *   «Client Logo»), and a reel reads «Reel».
 * - `isUsed` is the same clause as the «Used» filter, so the badge and the filter agree —
 *   including gallery images and live reels, which the main grid's `_count` check misses.
 */
export async function getClientsMedia(
  coreClientId: string | null,
  query: ClientsMediaQuery & { sort?: string; page?: number },
) {
  const result = await listMedia(clientsMediaWhere(coreClientId, query), { sort: query.sort, page: query.page });
  const ids = result.items.map((m) => m.id);

  const [usedRows, reelRows] = ids.length
    ? await Promise.all([
        db.media.findMany({ where: { AND: [{ id: { in: ids } }, { OR: [MEDIA_USED_WHERE, REEL_LIVE_WHERE] }] }, select: { id: true } }),
        db.media.findMany({
          where: { AND: [{ id: { in: ids } }, { OR: [{ inReels: true }, { reelStatus: { not: null } }] }] },
          select: { id: true, reelStatus: true },
        }),
      ])
    : [[], []];

  const used = new Set(usedRows.map((r) => r.id));
  const reels = new Map(reelRows.map((r) => [r.id, r.reelStatus]));

  const items = result.items.map((m) => {
    const isReel = reels.has(m.id);
    const reelStatus = reels.get(m.id) ?? null;
    const roleLabel = isReel
      ? "Reel"
      : m._count.logoClients > 0
        ? getMediaTypeLabel("LOGO")
        : m._count.heroImageClients > 0
          ? getMediaTypeLabel("HERO")
          : m._count.mobileHeroImageClients > 0
            ? getMediaTypeLabel("HERO_MOBILE")
            : getMediaTypeLabel(m.type);
    return {
      ...m,
      client: m.client || undefined,
      isUsed: used.has(m.id),
      roleLabel,
      reelHref: isReel ? `/reels/${REEL_VIEW[reelStatus ?? ""] ?? "pending"}` : undefined,
      status: isReel ? REEL_STATUS[reelStatus ?? ""] ?? { label: "In reels", tone: "muted" as const } : undefined,
    };
  });

  return { ...result, items };
}
