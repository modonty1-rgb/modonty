"use server";

import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

export async function getTestDataSources() {
  try {
    const [media, articles] = await Promise.all([
      db.media.findMany({
        take: 50,
        select: {
          id: true,
          clientId: true,
          url: true,
          altText: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.article.findMany({
        take: 20,
        where: {
          status: { in: [ArticleStatus.PUBLISHED, ArticleStatus.DRAFT, ArticleStatus.SCHEDULED] },
        },
        select: {
          id: true,
          title: true,
        },
        orderBy: { dateModified: 'desc' },
      }),
    ]);

    return {
      success: true,
      media,
      articles,
    };
  } catch (error) {
    console.error("Error fetching test data sources:", error);
    console.error("Full error details:", JSON.stringify(error, null, 2));
    return {
      success: false,
      media: [],
      articles: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
