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
 * Save a scheduled publish date for an article currently in SCHEDULED status.
 * Sets `scheduledAt` — does NOT publish the article. Admin still has to either
 * (a) come back and click Publish Now, or (b) wait for a future cron job that
 * auto-publishes articles whose scheduledAt has passed.
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

    const article = await db.article.findUnique({
      where: { id: articleId },
      // title is here for the audit line — an id tells the reader nothing.
      select: { id: true, status: true, slug: true, title: true },
    });

    if (!article) return { success: false, error: "Article not found" };
    if (article.status !== ArticleStatus.SCHEDULED) {
      return {
        success: false,
        error: `Article must be SCHEDULED — it's currently ${article.status}.`,
      };
    }

    await db.article.update({
      where: { id: articleId },
      data: { scheduledAt: date },
    });

    // A schedule decides WHEN the world sees it — same weight as publishing.
    await logAction("article.schedule", {
      entity: "Article",
      entityId: articleId,
      summary: article.title,
      metadata: { scheduledAt: date.toISOString() },
    });

    revalidatePath("/articles/workflow/scheduled-to-published");
    revalidatePath(`/articles/${article.slug}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save schedule",
    };
  }
}
