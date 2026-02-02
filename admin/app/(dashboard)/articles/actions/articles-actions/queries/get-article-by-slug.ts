"use server";

import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

export async function getArticleBySlug(slug: string, clientId?: string) {
  try {
    const article = await db.article.findFirst({
      where: {
        slug,
        ...(clientId && { clientId }),
      },
      include: {
        client: {
          include: {
            logoMedia: {
              select: {
                id: true,
                url: true,
              },
            },
          },
        },
        category: true,
        author: true,
        tags: {
          include: {
            tag: true,
          },
        },
        featuredImage: {
          select: {
            id: true,
            url: true,
            altText: true,
            width: true,
            height: true,
            filename: true,
          },
        },
        faqs: {
          orderBy: {
            position: "asc",
          },
        },
        gallery: {
          include: {
            media: {
              select: {
                id: true,
                url: true,
                altText: true,
                width: true,
                height: true,
                filename: true,
              },
            },
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    if (!article) {
      return null;
    }

    const validStatuses: ArticleStatus[] = [
      ArticleStatus.WRITING,
      ArticleStatus.DRAFT,
      ArticleStatus.SCHEDULED,
      ArticleStatus.PUBLISHED,
      ArticleStatus.ARCHIVED,
    ];

    if (!validStatuses.includes(article.status)) {
      console.warn(`Article ${slug} has invalid status: ${article.status}`);
      return null;
    }

    return article;
  } catch (error) {
    console.error("Error fetching article by slug:", error);
    return null;
  }
}

