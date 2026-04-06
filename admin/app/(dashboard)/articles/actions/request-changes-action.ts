"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { ArticleStatus } from "@prisma/client";
import type { FormSubmitResult } from "@/lib/types/form-types";
import { auth } from "@/lib/auth";

export async function requestChanges(articleId: string): Promise<FormSubmitResult> {
  try {
    const session = await auth(); if (!session) return { success: false, error: "غير مصرح" };
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
    await revalidateModontyTag("articles");

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