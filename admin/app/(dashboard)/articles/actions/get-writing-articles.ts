"use server";

import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

export async function getWritingArticles() {
  try {
    const articles = await db.article.findMany({
      where: {
        status: ArticleStatus.WRITING,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return articles.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      client: article.client,
      category: article.category,
      author: article.author,
      updatedAt: article.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching writing articles:", error);
    return [];
  }
}