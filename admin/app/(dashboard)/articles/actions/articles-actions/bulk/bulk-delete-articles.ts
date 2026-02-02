"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function bulkDeleteArticles(articleIds: string[]) {
  try {
    await Promise.all([
      db.articleTag.deleteMany({ where: { articleId: { in: articleIds } } }),
      db.articleVersion.deleteMany({ where: { articleId: { in: articleIds } } }),
      db.articleFAQ.deleteMany({ where: { articleId: { in: articleIds } } }),
      db.relatedArticle.deleteMany({
        where: {
          OR: [
            { articleId: { in: articleIds } },
            { relatedId: { in: articleIds } },
          ],
        },
      }),
      db.analytics.deleteMany({ where: { articleId: { in: articleIds } } }),
    ]);

    await db.article.deleteMany({
      where: {
        id: { in: articleIds },
      },
    });

    revalidatePath("/articles");
    return { success: true };
  } catch (error) {
    console.error("Error bulk deleting articles:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete articles";
    return { success: false, error: message };
  }
}

