"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { ArticleStatus } from "@prisma/client";

export interface TransitionResult {
  success: boolean;
  error?: string;
}

/**
 * Transition an article from one status to another.
 * Validates: caller is authenticated + current status === expectedFrom (prevents accidental skips).
 */
export async function transitionArticleAction(
  articleId: string,
  expectedFrom: ArticleStatus,
  toStatus: ArticleStatus
): Promise<TransitionResult> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const article = await db.article.findUnique({
      where: { id: articleId },
      select: { id: true, status: true, slug: true },
    });

    if (!article) {
      return { success: false, error: "Article not found" };
    }

    if (article.status !== expectedFrom) {
      return {
        success: false,
        error: `Article is in ${article.status} state, not ${expectedFrom}. Refresh the page.`,
      };
    }

    // Auto-set datePublished when moving directly to PUBLISHED
    const data: { status: ArticleStatus; datePublished?: Date } = {
      status: toStatus,
    };
    if (toStatus === ArticleStatus.PUBLISHED) {
      data.datePublished = new Date();
    }

    await db.article.update({
      where: { id: articleId },
      data,
    });

    revalidatePath("/articles");
    revalidatePath("/articles/workflow");
    if (toStatus === ArticleStatus.PUBLISHED) {
      await revalidateModontyTag("articles");
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transition failed";
    return { success: false, error: message };
  }
}
