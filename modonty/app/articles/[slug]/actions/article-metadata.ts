import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

export async function getArticleForMetadata(slug: string) {
  "use cache";
  cacheTag("articles");
  cacheLife("hours");

  const article = await db.article.findFirst({
    where: {
      slug,
      status: ArticleStatus.PUBLISHED,
    },
    select: {
      nextjsMetadata: true,
      seoTitle: true,
      title: true,
      seoDescription: true,
      excerpt: true,
      canonicalUrl: true,
      client: {
        select: {
          name: true,
          logoMedia: { select: { url: true } },
          ogImageMedia: { select: { url: true } },
        },
      },
      author: { select: { name: true } },
      category: { select: { name: true } },
      tags: {
        include: {
          tag: { select: { name: true } },
        },
      },
      featuredImage: {
        select: {
          url: true,
          altText: true,
          width: true,
          height: true,
        },
      },
      datePublished: true,
      updatedAt: true,
    },
  });

  return article;
}
