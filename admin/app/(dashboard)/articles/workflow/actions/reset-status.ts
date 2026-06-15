"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { ArticleStatus } from "@prisma/client";

import { ROLLBACK_TARGETS, STAGE_RANK } from "../lib/rollback-targets";

/**
 * Rollback-only status maintenance.
 *
 * Rescues a stuck (non-published) article by sending it BACK to an earlier editing
 * stage (Draft or Writing). It deliberately does NOT use the workflow state machine
 * or transitionArticleAction — this is a constrained admin override with its own
 * hard rules:
 *   - PUBLISHED articles are live and are never touched here.
 *   - The only allowed targets are DRAFT / WRITING (never PUBLISHED, SCHEDULED,
 *     or AWAITING_APPROVAL) — so the admin can never use it to jump an article
 *     forward and bypass the client-approval gate.
 *   - The target must be an earlier stage than the current one (backward only).
 */

export interface ResetStatusResult {
  success: boolean;
  error?: string;
}

export async function resetArticleStatusAction(
  articleId: string,
  toStatus: ArticleStatus,
): Promise<ResetStatusResult> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    if (!ROLLBACK_TARGETS.includes(toStatus)) {
      return { success: false, error: "Maintenance can only reset to Draft or Writing." };
    }

    const article = await db.article.findUnique({
      where: { id: articleId },
      select: { id: true, status: true, slug: true },
    });
    if (!article) return { success: false, error: "Article not found" };

    // Published articles are live on modonty.com — never reset them here.
    if (article.status === ArticleStatus.PUBLISHED) {
      return {
        success: false,
        error: "Published articles are live and cannot be reset from maintenance.",
      };
    }

    if (article.status === toStatus) {
      return { success: false, error: `Article is already in ${toStatus}.` };
    }

    // Backward only — never allow a forward jump that would skip the client gate.
    if (STAGE_RANK[toStatus] >= STAGE_RANK[article.status]) {
      return {
        success: false,
        error: `Can only roll back to an earlier stage (${article.status} → ${toStatus} is not a rollback).`,
      };
    }

    // Reset + clear forward-only artifacts: the schedule and the client-approval
    // stamp. The article re-enters the workflow clean and must pass the gate +
    // client approval again before it can be published.
    await db.article.update({
      where: { id: articleId },
      data: {
        status: toStatus,
        scheduledAt: null,
        lastReviewed: null,
      },
    });

    revalidatePath("/articles");
    revalidatePath("/articles/workflow/maintenance");
    revalidatePath(`/articles/${article.id}`);
    revalidateTag("article-status-counts", "max");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Reset failed";
    return { success: false, error: message };
  }
}
