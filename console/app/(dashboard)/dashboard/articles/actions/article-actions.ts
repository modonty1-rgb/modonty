"use server";

import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

// TODO: Add compliance check (forbidden keywords/claims) before publishing.
// Console app cannot import admin's @/lib/seo/pre-publish-audit.
// Options: (1) shared package in workspace, or (2) admin API endpoint for compliance.
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
    const hasScheduledDate = article.scheduledAt && new Date(article.scheduledAt) > now;

    await db.article.update({
      where: { id: articleId },
      data: {
        status: hasScheduledDate ? ArticleStatus.SCHEDULED : ArticleStatus.PUBLISHED,
        ...(hasScheduledDate ? {} : { datePublished: now }),
        ogArticleModifiedTime: now,
      },
    });

    // NOTE: Console app does not have access to admin's @/lib/seo modules.
    // SEO regeneration (JSON-LD + metadata) is NOT performed here.
    // The admin app's scheduled SEO jobs or manual re-publish will handle it.
    // TODO: Add an admin API endpoint for cross-app SEO regeneration.

    // TODO: add revalidateModontyTag to console app when needed

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

    // Transition to WRITING so the author knows changes were requested
    // TODO: Add a revisionNotes field to Article model to persist feedback
    await db.article.update({
      where: { id: articleId },
      data: {
        status: ArticleStatus.WRITING,
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
