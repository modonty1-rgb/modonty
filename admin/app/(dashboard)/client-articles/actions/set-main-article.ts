"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const schema = z.object({
  clientId: z.string().min(1),
  articleId: z.string().min(1),
});

/** A hub with nothing under it is a thin page — four articles is the floor. */
const MIN_ARTICLES_FOR_MAIN = 4;

export interface SetMainArticleResult {
  success: boolean;
  error?: string;
}

/**
 * Marks ONE article as this client's main article — the hub every other article of
 * theirs points up to.
 *
 * "One" is enforced here rather than trusted: the previous main is cleared in the same
 * call, so two hubs can never exist even if two admins click at the same moment. The
 * client is re-derived from the article row, never taken from the caller — passing a
 * mismatched pair cannot move an article between clients.
 */
export async function setMainArticle(clientId: string, articleId: string): Promise<SetMainArticleResult> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const parsed = schema.safeParse({ clientId, articleId });
    if (!parsed.success) return { success: false, error: "Bad request" };

    const article = await db.article.findUnique({
      where: { id: parsed.data.articleId },
      select: { clientId: true, isClientSiteArticle: true },
    });

    if (!article || article.clientId !== parsed.data.clientId) {
      return { success: false, error: "Article not found" };
    }

    if (!article.isClientSiteArticle) {
      return { success: false, error: "This article is not written for the client's site" };
    }

    const total = await db.article.count({
      where: { clientId: parsed.data.clientId, isClientSiteArticle: true },
    });

    if (total < MIN_ARTICLES_FOR_MAIN) {
      return {
        success: false,
        error: `A main article needs at least ${MIN_ARTICLES_FOR_MAIN} articles under it — this client has ${total}.`,
      };
    }

    // Clear then set: never two hubs, not even for the instant between two writes.
    await db.article.updateMany({
      where: { clientId: parsed.data.clientId, isMainArticle: true },
      data: { isMainArticle: false },
    });

    await db.article.update({
      where: { id: parsed.data.articleId },
      data: { isMainArticle: true },
    });

    revalidatePath(`/client-articles/${parsed.data.clientId}`);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to set the main article";
    return { success: false, error: message };
  }
}
