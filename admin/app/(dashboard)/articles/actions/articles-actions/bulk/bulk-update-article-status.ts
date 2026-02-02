"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ArticleStatus } from "@prisma/client";

export async function bulkUpdateArticleStatus(
  articleIds: string[],
  status: ArticleStatus
) {
  try {
    await db.article.updateMany({
      where: {
        id: { in: articleIds },
      },
      data: {
        status,
        datePublished: status === ArticleStatus.PUBLISHED ? new Date() : undefined,
      },
    });

    revalidatePath("/articles");
    return { success: true };
  } catch (error) {
    console.error("Error bulk updating article status:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update article status";
    return { success: false, error: message };
  }
}

