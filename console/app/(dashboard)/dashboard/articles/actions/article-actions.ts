"use server";

import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { messages } from "@/lib/messages";

import { notifyArticleDecision } from "./notify-article-decision";

// What the Telegram notice needs, fetched with the article rather than in a second round
// trip: the client's name (the sender) and their assigned editor (the recipient).
const DECISION_CONTEXT = {
  client: {
    select: {
      name: true,
      editor: { select: { name: true, email: true } },
    },
  },
} as const;

/** Editor display name, falling back to the email so an unnamed staff row is still useful. */
function editorNameOf(client: { editor: { name: string | null; email: string | null } | null }) {
  return client.editor?.name?.trim() || client.editor?.email || null;
}

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
      include: DECISION_CONTEXT,
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
    //
    // The client's approval IS the professional review (E-E-A-T): for YMYL clients
    // the reviewing professional's name lives in ymylData.reviewerName, and this
    // approval stamps lastReviewed = now → "Reviewed by Dr. X on <date>".
    await db.article.update({
      where: { id: articleId },
      data: {
        status: ArticleStatus.SCHEDULED,
        ogArticleModifiedTime: now,
        lastReviewed: now,
      },
    });

    // NOTE: Console app does not have access to admin's @/lib/seo modules.
    // SEO regeneration (JSON-LD + metadata) is NOT performed here.
    // The admin app's scheduled SEO jobs or manual re-publish will handle it.
    // TODO: Add an admin API endpoint for cross-app SEO regeneration.

    // TODO: add revalidateModontyTag to console app when needed

    // Registered synchronously, INSIDE the request — a bare unawaited promise here would
    // be killed when the response closes and the editor would never hear about it
    // (the exact failure OBS-216 traced on the GA4 events).
    after(async () => {
      await notifyArticleDecision({
        kind: "approved",
        articleId,
        articleTitle: article.title,
        clientName: article.client.name,
        editorName: editorNameOf(article.client),
      });
    });

    revalidatePath("/dashboard/articles");
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
      include: DECISION_CONTEXT,
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

    after(async () => {
      await notifyArticleDecision({
        kind: "changes",
        articleId,
        articleTitle: article.title,
        clientName: article.client.name,
        editorName: editorNameOf(article.client),
        // The client's own words — an editor acts on these, so they travel with the
        // notice instead of forcing a trip into the dashboard to find out what to fix.
        feedback: feedback.trim(),
      });
    });

    revalidatePath("/dashboard/articles");
    revalidatePath(`/dashboard/articles/${articleId}/preview`);

    return { success: true };
  } catch (error) {
    return { success: false, error: messages.error.serverError };
  }
}
