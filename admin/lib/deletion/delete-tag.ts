"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { logAction } from "@/lib/audit/log-action";

import { getTagDeleteBlockers } from "./get-tag-delete-blockers";
import { requireDeleteAdmin } from "./require-delete-admin";
import { settleRedirects } from "./settle-redirects";
import type { DeleteResult } from "./delete-result";

export async function deleteTag(id: string): Promise<DeleteResult> {
  try {
    const denied = await requireDeleteAdmin();
    if (denied) return { success: false, error: denied };

    const tag = await db.tag.findUnique({ where: { id }, select: { name: true, slug: true, archivedAt: true } });
    if (!tag) return { success: false, error: "الوسم غير موجود — يمكن انحذف قبل." };
    // الحذف للمؤرشف فقط — الأرشفة قرار الفريق من صفحته أولاً (خالد ١٦ أكتوبر ٢٠٢٦: «نفس المنطق»).
    if (!tag.archivedAt) return { success: false, error: `«${tag.name}» ما هو مؤرشف — الفريق يأرشفه من صفحة الوسم أولاً.` };

    const why = (await getTagDeleteBlockers([id])).get(id) ?? [];
    if (why.length) return { success: false, error: `ما ينحذف «${tag.name}»: عليه ${why.join(" · ")}.` };

    await db.tag.delete({ where: { id } });
    await settleRedirects("tags", tag.slug);

    await logAction("tag.delete", {
      entity: "Tag",
      entityId: id,
      summary: tag.name,
      metadata: { slug: tag.slug },
    });

    revalidatePath("/tags");
    revalidatePath("/deletion");
    // Rebuild the listing blob BEFORE revalidating modonty — it renders the stored blob,
    // and regenerateTagsListingCache RETURNS { success, error } instead of throwing.
    let listingError: string | undefined;
    try {
      const { regenerateTagsListingCache } = await import("@/lib/seo/listing-page-seo-generator");
      const result = await regenerateTagsListingCache();
      if (!result.success) listingError = result.error || "سبب غير معروف";
    } catch (e) { listingError = e instanceof Error ? e.message : String(e); }
    if (listingError) console.error("Tags listing cache failed:", id, listingError);
    else await revalidateModontyTag("tags");

    return {
      success: true,
      message:
        `انحذف الوسم «${tag.name}» نهائياً. رابطه مسحوب من جوجل (410) من وقت أرشفته.` +
        (listingError ? ` تنبيه: صفحة الوسوم ما تجدّدت — جوجل بيبقى يشوفه في القائمة. (${listingError})` : ""),
    };
  } catch (error) {
    console.error("Error deleting tag:", error);
    return { success: false, error: `ما انحذف الوسم — خطأ من القاعدة: ${error instanceof Error ? error.message : String(error)}` };
  }
}
