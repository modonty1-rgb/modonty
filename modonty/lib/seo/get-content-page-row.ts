import { cacheTag, cacheLife } from "next/cache";

import { db } from "@/lib/db";

/**
 * One reader for every content page whose SEO row lives in the `modonty` collection —
 * the same columns `buildMetadataFromPageRow` consumes.
 *
 * Written when `/audio` and `/reels` were brought into the system: each existing page had its
 * own near-identical helper (`about-metadata.ts` and friends), so a new page meant a new copy
 * of the same twenty-field select. `/reels` in particular kept its robots directive in code —
 * an indexed-or-not decision that has to be a switch in the admin, not a deploy.
 */
export async function getContentPageRow(slug: string) {
  "use cache";
  cacheTag("pages");
  cacheLife("hours");

  return db.modonty.findUnique({
    where: { slug },
    select: {
      // The blob the admin generated — read raw, exactly like every listing page's.
      nextjsMetadata: true,
      title: true,
      seoTitle: true,
      seoDescription: true,
      metaRobots: true,
      socialImage: true,
      socialImageAlt: true,
      ogTitle: true,
      ogDescription: true,
      ogType: true,
      ogUrl: true,
      ogSiteName: true,
      ogLocale: true,
      ogImage: true,
      twitterCard: true,
      twitterTitle: true,
      twitterDescription: true,
      twitterSite: true,
      twitterCreator: true,
      canonicalUrl: true,
      inLanguage: true,
    },
  });
}
