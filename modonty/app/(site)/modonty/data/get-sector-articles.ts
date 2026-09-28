import { cacheLife, cacheTag } from "next/cache";
import { ArticleStatus } from "@prisma/client";

import { mediaSrc } from "@modonty/shared/lib/media-src";
import { SECTOR_PICK_LIMIT } from "@modonty/shared/lib/sectors/live-sectors";
import { db } from "@/lib/db";
import { getCoreClientId } from "@/lib/settings/get-core-client-id";

export interface SectorArticle {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  /** Our own words about the article — its excerpt, else its SEO description. */
  summary: string | null;
}

/**
 * A sector page's «من مدونتي» — exactly the articles the editor picked for it in the admin
 * (Modonty › Sectors › <sector> › المقالات), in the editor's order (Khalid, 27 Sep 2026: «احنا من
 * الادمن في صفحة الكورة نحدد المقالات اللي تطلع فيها»). One reader for every sector page.
 *
 * Each comes with its summary: the page's own text should be ours, not only the lists it carries
 * (Khalid, 28 Sep 2026: renewing the picks renews that text — no extra section to write).
 *
 * An article unpublished after it was picked drops out here rather than showing a dead link.
 * Tagged «articles», the tag the admin's pick actions bust.
 */
export async function getSectorArticles(sector: string): Promise<SectorArticle[]> {
  "use cache";
  cacheTag("articles");
  cacheLife("hours");

  const clientId = await getCoreClientId();
  if (!clientId) return [];

  // Modonty owns every sector page — only its own articles, even if another slipped into the picks.
  const picks = await db.sectorPick.findMany({
    where: { sector, article: { clientId, status: ArticleStatus.PUBLISHED } },
    orderBy: { order: "asc" },
    take: SECTOR_PICK_LIMIT,
    select: {
      article: {
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          seoDescription: true,
          featuredImage: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
        },
      },
    },
  });

  return picks.map(({ article: a }) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    image: mediaSrc(a.featuredImage) ?? null,
    summary: a.excerpt?.trim() || a.seoDescription?.trim() || null,
  }));
}
