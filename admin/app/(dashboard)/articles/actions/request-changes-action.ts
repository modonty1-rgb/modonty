"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ArticleStatus } from "@prisma/client";
import type { FormSubmitResult } from "@/lib/types/form-types";

export async function requestChanges(articleId: string): Promise<FormSubmitResult> {
  try {
    const article = await db.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return {
        success: false,
        error: "Article not found",
      };
    }

    await db.article.update({
      where: { id: articleId },
      data: {
        status: ArticleStatus.WRITING,
      },
    });

    revalidatePath("/articles");
    revalidatePath(`/articles/${article.slug}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error requesting changes:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to request changes",
    };
  }
}