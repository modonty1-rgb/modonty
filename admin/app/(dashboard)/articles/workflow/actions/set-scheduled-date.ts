"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ArticleStatus } from "@prisma/client";
import { logAction } from "@/lib/audit/log-action";

export interface SetScheduledResult {
  success: boolean;
  error?: string;
}

/**
 * Give an article its publish date — the team's step after the client approves.
 *
 * APPROVED (client said yes, no date) → SCHEDULED with `scheduledAt`; an already
 * SCHEDULED article just moves its date. Does NOT publish: the cron takes it live once the
 * date passes, or someone clicks «Publish Now».
 *
 * The date must be in the future (27 Sep 2026): a past date meant «publish on the next
 * cron tick», which is «Publish Now» without its confirm dialog.
 */
export async function setScheduledDateAction(
  articleId: string,
  isoDate: string,
): Promise<SetScheduledResult> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      return { success: false, error: "Invalid date format" };
    }
    if (date.getTime() <= Date.now()) {
      return { success: false, error: "Pick a time in the future — to publish now, use «Publish Now»." };
    }

    const article = await db.article.findUnique({
      where: { id: articleId },
      // title is here for the audit line — an id tells the reader nothing.
      select: { id: true, status: true, slug: true, title: true },
    });

    if (!article) return { success: false, error: "Article not found" };
    if (article.status !== ArticleStatus.APPROVED && article.status !== ArticleStatus.SCHEDULED) {
      return {
        success: false,
        error: `Only a client-approved article can be scheduled — it's currently ${article.status}.`,
      };
    }

    await db.article.update({
      where: { id: articleId },
      data: { scheduledAt: date, status: ArticleStatus.SCHEDULED },
    });

    // A schedule decides WHEN the world sees it — same weight as publishing.
    await logAction("article.schedule", {
      entity: "Article",
      entityId: articleId,
      summary: article.title,
      metadata: { scheduledAt: date.toISOString(), from: article.status, to: ArticleStatus.SCHEDULED },
    });

    revalidatePath("/articles/workflow/scheduled-to-published");
    revalidatePath("/articles/workflow/approved-to-scheduled");
    revalidatePath(`/articles/${article.slug}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save schedule",
    };
  }
}
