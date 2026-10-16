"use server";

import { db } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { logAction } from "@/lib/audit/log-action";

import { getArticleDeleteBlockers } from "./get-article-delete-blockers";
import { requireDeleteAdmin } from "./require-delete-admin";
import { settleRedirects } from "./settle-redirects";
import type { DeleteResult } from "./delete-result";

/** `redirectToId`: مقال منشور بديل — رابط المحذوف يحوّل له تحويلاً دائماً بدل 410. */
export async function deleteArticle(id: string, redirectToId?: string | null): Promise<DeleteResult> {
  try {
    const denied = await requireDeleteAdmin();
    if (denied) return { success: false, error: denied };

    // Read the title BEFORE the row is gone — afterwards there is nothing left to name it
    // by, and "deleted article 6a53…" tells the reader nothing.
    const doomed = await db.article.findUnique({ where: { id }, select: { title: true, status: true, slug: true } });
    if (!doomed) return { success: false, error: "المقال غير موجود — يمكن انحذف قبل." };

    const why = (await getArticleDeleteBlockers([id])).get(id) ?? [];
    if (why.length) return { success: false, error: why.join(" · ") };

    // البديل لازم منشور، وإلا صار التحويل لصفحة 410.
    const target = redirectToId
      ? await db.article.findFirst({ where: { id: redirectToId, status: "PUBLISHED" }, select: { id: true, title: true, slug: true } })
      : null;
    if (redirectToId && (!target || target.id === id)) {
      return { success: false, error: "المقال البديل لازم يكون مقالاً آخر منشوراً." };
    }

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
    await settleRedirects("articles", doomed.slug, target?.slug);

    await logAction("article.delete", {
      entity: "Article",
      entityId: id,
      summary: doomed.title,
      metadata: { status: doomed.status, redirectTo: target?.slug ?? null },
    });

    revalidatePath("/articles");
    revalidatePath("/deletion");
    revalidateTag("article-status-counts", "max");
    await revalidateModontyTag("articles");
    return {
      success: true,
      message: target
        ? `انحذف «${doomed.title}». رابطه يحوّل تحويلاً دائماً لـ«${target.title}» خلال ٥ دقايق — جوجل ينقل قيمته له.`
        : `انحذف «${doomed.title}» نهائياً من القاعدة. رابطه مسحوب من جوجل (410) من وقت أرشفته.`,
    };
  } catch (error) {
    console.error("Error deleting article:", error);
    return { success: false, error: `ما انحذف المقال — خطأ من القاعدة: ${error instanceof Error ? error.message : String(error)}` };
  }
}
