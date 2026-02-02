"use server";

import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function approveArticle(articleId: string, clientId: string) {
  try {
    const article = await db.article.findFirst({
      where: {
        id: articleId,
        clientId,
        status: ArticleStatus.DRAFT,
      },
    });

    if (!article) {
      return {
        success: false,
        error: "Article not found or not available for approval",
      };
    }

    const now = new Date();

    await db.article.update({
      where: { id: articleId },
      data: {
        status: ArticleStatus.PUBLISHED,
        datePublished: now,
        ogArticlePublishedTime: now,
        ogArticleModifiedTime: now,
      },
    });

    revalidatePath("/dashboard/articles");
    revalidatePath("/dashboard/content");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to approve article";
    return { success: false, error: message };
  }
}

export async function requestChanges(
  articleId: string,
  clientId: string,
  feedback: string
) {
  try {
    const article = await db.article.findFirst({
      where: {
        id: articleId,
        clientId,
        status: ArticleStatus.DRAFT,
      },
    });

    if (!article) {
      return {
        success: false,
        error: "Article not found or not available",
      };
    }

    if (!feedback || feedback.trim().length === 0) {
      return {
        success: false,
        error: "Feedback is required when requesting changes",
      };
    }

    await db.article.update({
      where: { id: articleId },
      data: {
        status: ArticleStatus.DRAFT,
      },
    });

    revalidatePath("/dashboard/articles");
    revalidatePath(`/dashboard/articles/${articleId}/preview`);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to request changes";
    return { success: false, error: message };
  }
}
