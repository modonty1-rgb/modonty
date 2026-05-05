"use server";

import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { messages } from "@/lib/messages";

// TODO: Add compliance check (forbidden keywords/claims) before publishing.
// Console app cannot import admin's @/lib/seo/pre-publish-audit.
// Options: (1) shared package in workspace, or (2) admin API endpoint for compliance.
export async function approveArticle(articleId: string, clientId: string) {
  try {
    const article = await db.article.findFirst({
      where: {
        id: articleId,
        clientId,
        status: ArticleStatus.AWAITING_APPROVAL,
      },
    });

    if (!article) {
      return {
        success: false,
        error: messages.error.notFound,
      };
    }

    const now = new Date();

    // Client approval moves the article to SCHEDULED only — admin must publish.
    // Per workflow design: client approval ≠ publish. Admin sees the article in
    // /articles/workflow/scheduled-to-published queue and decides when to publish.
    // datePublished is intentionally NOT set here — it's set when admin publishes.
    await db.article.update({
      where: { id: articleId },
      data: {
        status: ArticleStatus.SCHEDULED,
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
    return { success: false, error: messages.error.serverError };
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
        status: ArticleStatus.AWAITING_APPROVAL,
      },
    });

    if (!article) {
      return {
        success: false,
        error: messages.error.notFound,
      };
    }

    if (!feedback || feedback.trim().length === 0) {
      return {
        success: false,
        error: messages.error.feedback_required,
      };
    }

    // Move article to NEEDS_REVISION + persist client feedback so admin sees it.
    await db.article.update({
      where: { id: articleId },
      data: {
        status: ArticleStatus.NEEDS_REVISION,
        revisionNotes: feedback.trim(),
      },
    });

    revalidatePath("/dashboard/articles");
    revalidatePath(`/dashboard/articles/${articleId}/preview`);

    return { success: true };
  } catch (error) {
    return { success: false, error: messages.error.serverError };
  }
}
