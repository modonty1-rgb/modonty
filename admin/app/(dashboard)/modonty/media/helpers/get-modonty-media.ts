import "server-only";

import { db } from "@/lib/db";
import { MEDIA_USED_WHERE, PLATFORM_DEFAULT_PREFIX } from "@/lib/media/usage-where";
import { REEL_LIVE_WHERE } from "@/lib/media/reel-where";
import { REEL_STATUS, REEL_VIEW } from "@/lib/media/reel-status";
import { listMedia } from "@/lib/media/list-media";
import { getMediaTypeLabel } from "@/lib/media/media-utils";
import { modontyMediaWhere, type ModontyMediaQuery } from "./modonty-media-where";

/** The site link a file is on, as the card names it. First match wins. */
const SITE_LABELS = [
  ["industrySocialImages", "Industry image"],
  ["categorySocialImages", "Category image"],
  ["tagSocialImages", "Tag image"],
  ["authorImages", "Author photo"],
  ["authorSocialImages", "Author share image"],
  ["modontyHeroImages", "Page cover"],
  ["modontySocialImages", "Page share image"],
] as const;

/**
 * One page of Modonty › Media, shaped for the shared media grid. Like Clients › Media, a
 * card says what the file IS (from its link) and whether it is used by the same clause the
 * «Used» filter runs — here that clause also knows Modonty's own pages and site settings.
 */
export async function getModontyMedia(
  coreClientId: string,
  siteUrls: string[],
  query: ModontyMediaQuery & { sort?: string; page?: number },
) {
  const result = await listMedia(modontyMediaWhere(coreClientId, siteUrls, query), { sort: query.sort, page: query.page });
  const ids = result.items.map((m) => m.id);
  const inSettings = { OR: [{ url: { in: siteUrls } }, { bunnyUrl: { in: siteUrls } }] };

  const [usedRows, linkRows] = ids.length
    ? await Promise.all([
        db.media.findMany({
          where: { AND: [{ id: { in: ids } }, { OR: [MEDIA_USED_WHERE, REEL_LIVE_WHERE, inSettings] }] },
          select: { id: true },
        }),
        db.media.findMany({
          where: { id: { in: ids } },
          select: {
            id: true,
            url: true,
            bunnyUrl: true,
            inReels: true,
            reelStatus: true,
            _count: {
              select: {
                industrySocialImages: true,
                categorySocialImages: true,
                tagSocialImages: true,
                authorImages: true,
                authorSocialImages: true,
                modontyHeroImages: true,
                modontySocialImages: true,
                articleGallery: true,
              },
            },
          },
        }),
      ])
    : [[], []];

  const used = new Set(usedRows.map((r) => r.id));
  const links = new Map(linkRows.map((r) => [r.id, r]));
  const settingUrls = new Set(siteUrls);

  const items = result.items.map((m) => {
    const l = links.get(m.id);
    const isReel = !!l && (l.inReels || l.reelStatus !== null);
    const site = l ? SITE_LABELS.find(([k]) => l._count[k] > 0)?.[1] : undefined;
    const inSetting = !!l && (settingUrls.has(l.url) || (!!l.bunnyUrl && settingUrls.has(l.bunnyUrl)));
    const roleLabel = m.filename.startsWith(PLATFORM_DEFAULT_PREFIX)
      ? "Platform default"
      : isReel
      ? "Reel"
      : site ?? (inSetting
        ? "Site setting"
        : m._count.featuredArticles > 0 || (l?._count.articleGallery ?? 0) > 0
          ? getMediaTypeLabel("POST")
          : m._count.logoClients > 0
            ? getMediaTypeLabel("LOGO")
            : m._count.heroImageClients > 0
              ? getMediaTypeLabel("HERO")
              : m._count.mobileHeroImageClients > 0
                ? getMediaTypeLabel("HERO_MOBILE")
                : getMediaTypeLabel(m.type));
    const reelStatus = l?.reelStatus ?? null;
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
