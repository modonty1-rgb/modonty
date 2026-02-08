import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";

export async function getAboutPageForMetadata() {
  "use cache";
  cacheTag("pages");
  cacheLife("hours");

  return db.modonty.findUnique({
    where: { slug: "about" },
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
