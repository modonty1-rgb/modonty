import { cacheTag, cacheLife } from "next/cache";

import { db } from "@/lib/db";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";

/**
 * The Settings columns that `buildListingPageMetadata` reads — the SAME builder the admin
 * uses to write every listing page's stored blob.
 *
 * A page that computes its metadata per request (the article archive: one canonical per
 * filter, so nothing can be cached in a single column) still has to ship the same defaults
 * as its cached sisters. Reading them here means a default added to Settings reaches both
 * kinds of page from one place instead of being copied into a second hand-rolled object.
 */
export async function getMetadataSettings(): Promise<Record<string, unknown>> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");

  const settings = await db.settings.findUnique({
    where: SETTINGS_SINGLETON_WHERE,
    select: {
      siteName: true,
      siteUrl: true,
      siteAuthor: true,
      defaultMetaRobots: true,
      defaultGooglebot: true,
      defaultOgType: true,
      defaultOgLocale: true,
      defaultOgDeterminer: true,
      defaultTwitterCard: true,
      defaultReferrerPolicy: true,
      defaultOgImageType: true,
      defaultAlternateLanguages: true,
      twitterSite: true,
      twitterCreator: true,
      twitterSiteId: true,
      twitterCreatorId: true,
      ogImageUrl: true,
      altImage: true,
    },
  });

  return (settings ?? {}) as Record<string, unknown>;
}
