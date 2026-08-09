"use server";

import { db } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { auth } from "@/lib/auth";
import { ArticleStatus } from "@prisma/client";
import { hasLeftForClientSite, CLIENT_SITE_LOCK_MESSAGE } from "../../../helpers/client-site-guard";

export async function archiveArticle(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "غير مصرح" };

    const article = await db.article.findUnique({
      where: { id },
      select: { status: true, isClientSiteArticle: true, lastFetchedAt: true },
    });

    if (!article) return { success: false, error: "المقال غير موجود" };

    // Archiving pulls the article out of the client's feed — same harm as deleting it,
    // just quieter. Same wall.
    if (hasLeftForClientSite(article)) {
      return { success: false, error: CLIENT_SITE_LOCK_MESSAGE };
    }

    await db.article.update({
      where: { id },
      data: { status: ArticleStatus.ARCHIVED },
    });

    revalidatePath(`/articles/${id}`);
    revalidatePath("/articles");
    revalidateTag("article-status-counts", "max");
    await revalidateModontyTag("articles");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "فشل الأرشفة" };
  }
}

export async function unarchiveArticle(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "غير مصرح" };

    await db.article.update({
      where: { id },
      data: { status: ArticleStatus.WRITING },
    });

    revalidatePath(`/articles/${id}`);
    revalidatePath("/articles");
    revalidateTag("article-status-counts", "max");
    await revalidateModontyTag("articles");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "فشل إلغاء الأرشفة" };
  }
}
