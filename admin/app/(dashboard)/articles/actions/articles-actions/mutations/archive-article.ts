"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { auth } from "@/lib/auth";
import { ArticleStatus } from "@prisma/client";

export async function archiveArticle(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "غير مصرح" };

    await db.article.update({
      where: { id },
      data: { status: ArticleStatus.ARCHIVED },
    });

    revalidatePath(`/articles/${id}`);
    revalidatePath("/articles");
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
    await revalidateModontyTag("articles");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "فشل إلغاء الأرشفة" };
  }
}
