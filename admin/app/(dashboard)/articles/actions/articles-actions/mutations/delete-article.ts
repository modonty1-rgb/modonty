"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteArticle(id: string) {
  try {
    await Promise.all([
      db.articleTag.deleteMany({ where: { articleId: id } }),
      db.articleVersion.deleteMany({ where: { articleId: id } }),
      db.articleFAQ.deleteMany({ where: { articleId: id } }),
      db.relatedArticle.deleteMany({
        where: {
          OR: [{ articleId: id }, { relatedId: id }],
        },
      }),
      db.analytics.deleteMany({ where: { articleId: id } }),
    ]);

    await db.article.delete({
      where: { id },
    });

    revalidatePath("/articles");
    return { success: true };
  } catch (error) {
    console.error("Error deleting article:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete article";
    return { success: false, error: message };
  }
}

