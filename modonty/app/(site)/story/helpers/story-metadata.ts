import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";

/**
 * The story page's stored SEO — same shape and cache tag as the other editable pages.
 *
 * Only the tags live in the row: the page body is an audio player built in code, so admin
 * shows this page as SEO-only.
 */
export async function getStoryPageForMetadata() {
  "use cache";
  cacheTag("pages");
  cacheLife("hours");

  return db.modonty.findUnique({
    where: { slug: "story" },
    select: {
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
