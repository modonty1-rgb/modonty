import { cacheLife, cacheTag } from "next/cache";
import { ArticleStatus } from "@prisma/client";

import { mediaSrc } from "@modonty/shared/lib/media-src";
import { SECTOR_PICK_LIMIT } from "@modonty/shared/lib/sectors/live-sectors";
import { db } from "@/lib/db";
import { getCoreClientId } from "@/lib/settings/get-core-client-id";

export interface FootballArticle {
  id: string;
  title: string;
  slug: string;
  image: string | null;
}

/**
 * The page's «من مدونتي» — exactly the articles the editor picked for the football page in the
 * admin (/articles/sectors), in the editor's order (Khalid, 27 Sep 2026: «احنا من الادمن في صفحة
 * الكورة نحدد المقالات اللي تطلع فيها»). It replaced matching football words in titles.
 *
 * An article unpublished after it was picked drops out here rather than showing a dead link.
 * Tagged «articles», the tag the admin's pick actions bust.
 */
export async function getFootballArticles(): Promise<FootballArticle[]> {
  "use cache";
  cacheTag("articles");
  cacheLife("hours");

  const clientId = await getCoreClientId();
  if (!clientId) return [];

  // Modonty owns every sector page — only its own articles, even if another slipped into the picks.
  const picks = await db.sectorPick.findMany({
    where: { sector: "football", article: { clientId, status: ArticleStatus.PUBLISHED } },
    orderBy: { order: "asc" },
    take: SECTOR_PICK_LIMIT,
    select: {
      article: {
        select: {
          id: true,
          title: true,
          slug: true,
          featuredImage: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
        },
      },
    },
  });

  return picks.map(({ article: a }) => ({ id: a.id, title: a.title, slug: a.slug, image: mediaSrc(a.featuredImage) ?? null }));
}
