import "server-only";

import { isMediaUsed, PLATFORM_DEFAULT_PREFIX, type MediaLinks } from "@/lib/media/usage-where";
import { isReelLive } from "@/lib/media/reel-where";
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
 * card says what the file IS (from its link) and whether it is used by the same rule the
 * «Used» filter runs — here that rule also knows Modonty's own pages and site settings.
 * Both come from the links already read, not from two more queries per page.
 */
export async function getModontyMedia(
  coreClientId: string,
  siteUrls: string[],
  links: MediaLinks,
  query: ModontyMediaQuery & { sort?: string; page?: number },
) {
  const result = await listMedia(modontyMediaWhere(coreClientId, siteUrls, links, query), { sort: query.sort, page: query.page });
  const settingUrls = new Set(siteUrls);

  const items = result.items.map((m) => {
    const isReel = m.inReels === true || m.reelStatus !== null;
    const site = SITE_LABELS.find(([k]) => links[k].has(m.id))?.[1];
    const inSetting = settingUrls.has(m.url) || (!!m.bunnyUrl && settingUrls.has(m.bunnyUrl));
    const roleLabel = m.filename.startsWith(PLATFORM_DEFAULT_PREFIX)
      ? "Platform default"
      : isReel
      ? "Reel"
      : site ?? (inSetting
        ? "Site setting"
        : links.featuredArticles.has(m.id) || links.articleGallery.has(m.id)
          ? getMediaTypeLabel("POST")
          : links.logoClients.has(m.id)
            ? getMediaTypeLabel("LOGO")
            : links.heroImageClients.has(m.id)
              ? getMediaTypeLabel("HERO")
              : links.mobileHeroImageClients.has(m.id)
                ? getMediaTypeLabel("HERO_MOBILE")
                : getMediaTypeLabel(m.type));
    return {
      ...m,
      client: m.client || undefined,
      isUsed: isMediaUsed(m, links) || isReelLive(m) || inSetting,
      roleLabel,
      reelHref: isReel ? `/reels/${REEL_VIEW[m.reelStatus ?? ""] ?? "pending"}` : undefined,
      status: isReel ? REEL_STATUS[m.reelStatus ?? ""] ?? { label: "In reels", tone: "muted" as const } : undefined,
    };
  });

  return { ...result, items };
}
