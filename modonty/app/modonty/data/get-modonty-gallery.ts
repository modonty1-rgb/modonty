import { cacheTag, cacheLife } from "next/cache";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { ArticleStatus } from "@prisma/client";
import { db } from "@/lib/db";

export interface ModontyGalleryImage {
  id: string;
  /** Already resolved via `mediaSrc` — the CDN URL to render, never the raw DB row. */
  url: string;
  blurDataURL: string | null;
  altText: string | null;
  /** The published article this cover belongs to — every print on the board opens it. */
  href: string;
  title: string;
}

/**
 * «من شغلنا» — a POOL of covers of modonty's PUBLISHED articles, from which the pinboard
 * draws eight at random on every request (Khalid, 2026-08-17: «كل ما أفتح الصفحة الصور
 * تتغيّر»). Only featured images qualify: they are the one media→article link the schema
 * has, and a teaser that leads nowhere is a wasted click — each print opens its article.
 * The pool is cached; only the draw is per-request.
 */
export async function getModontyGallery(clientId: string): Promise<ModontyGalleryImage[]> {
  "use cache";
  cacheTag("clients", "articles");
  cacheLife("minutes");

  const articles = await db.article.findMany({
    where: {
      clientId,
      status: ArticleStatus.PUBLISHED,
      featuredImageId: { not: null },
      OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
    },
    select: {
      slug: true,
      title: true,
      featuredImage: { select: { id: true, url: true, bunnyUrl: true, blurDataURL: true, altText: true } },
    },
    orderBy: [{ datePublished: "desc" }, { id: "desc" }],
    take: 24,
  });

  return articles.flatMap((article) => {
    const cover = article.featuredImage;
    const url = cover ? mediaSrc(cover) : "";
    if (!cover || !url) return [];
    return [
      {
        id: cover.id,
        url,
        blurDataURL: cover.blurDataURL,
        altText: cover.altText,
        href: `/articles/${encodeURIComponent(article.slug)}`,
        title: article.title,
      },
    ];
  });
}
