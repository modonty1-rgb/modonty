import "server-only";

import { db } from "@/lib/db";
import { mediaSrc } from "@modonty/shared/lib/media-src";

/**
 * The picked article's featured image — set or missing — for the box above the grid. The grid
 * then shows the article's gallery, not the featured image a second time.
 */
export async function getArticleBox(articleId: string) {
  const a = await db.article.findUnique({
    where: { id: articleId },
    select: {
      id: true,
      title: true,
      clientId: true,
      client: { select: { name: true } },
      featuredImage: { select: { id: true, url: true, bunnyUrl: true, blurDataURL: true } },
      _count: { select: { gallery: true } },
    },
  });
  if (!a) return null;
  return {
    id: a.id,
    title: a.title,
    clientId: a.clientId,
    clientName: a.client?.name ?? "",
    featured: a.featuredImage ? { id: a.featuredImage.id, src: mediaSrc(a.featuredImage) } : null,
    galleryCount: a._count.gallery,
  };
}
