"use server";

import { db } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit/log-action";

export async function deleteArticle(id: string) {
  try {
    const session = await auth(); if (!session) return { success: false, error: "غير مصرح" };

    // Read the title BEFORE the row is gone — afterwards there is nothing left to name it
    // by, and "deleted article 6a53…" tells the reader nothing.
    const doomed = await db.article.findUnique({ where: { id }, select: { title: true, status: true } });

    await Promise.all([
      db.articleTag.deleteMany({ where: { articleId: id } }),
      db.articleVersion.deleteMany({ where: { articleId: id } }),
      db.articleFAQ.deleteMany({ where: { articleId: id } }),
      db.relatedArticle.deleteMany({
        where: {
          OR: [{ articleId: id }, { relatedId: id }],
        },
      }),
      db.analytics.deleteMany({ where: { articleId: id } }),
    ]);

    await db.article.delete({
      where: { id },
    });

    await logAction("article.delete", {
      entity: "Article",
      entityId: id,
      summary: doomed?.title ?? null,
      metadata: doomed?.status ? { status: doomed.status } : null,
    });

    revalidatePath("/articles");
    revalidateTag("article-status-counts", "max");
    await revalidateModontyTag("articles");
    try { const { regenerateArticlesListingCache } = await import("@/lib/seo/listing-page-seo-generator"); await regenerateArticlesListingCache(); } catch (error) { console.error("Failed to regenerate articles listing cache:", error); }
    return { success: true };
  } catch (error) {
    console.error("Error deleting article:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete article";
    return { success: false, error: message };
  }
}

