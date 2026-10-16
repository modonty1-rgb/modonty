"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { logAction } from "@/lib/audit/log-action";

import { getCategoryDeleteBlockers } from "./get-category-delete-blockers";
import { requireDeleteAdmin } from "./require-delete-admin";
import { settleRedirects } from "./settle-redirects";
import type { DeleteResult } from "./delete-result";

export async function deleteCategory(id: string): Promise<DeleteResult> {
  try {
    const denied = await requireDeleteAdmin();
    if (denied) return { success: false, error: denied };

    const category = await db.category.findUnique({ where: { id }, select: { id: true, name: true, slug: true, archivedAt: true } });
    if (!category) return { success: false, error: "التصنيف غير موجود — يمكن انحذف قبل." };
    // الحذف للمؤرشف فقط — الأرشفة قرار الفريق من صفحته أولاً (خالد ١٦ أكتوبر ٢٠٢٦: «نفس المنطق»).
    if (!category.archivedAt) return { success: false, error: `«${category.name}» ما هو مؤرشف — الفريق يأرشفه من صفحة التصنيف أولاً.` };

    const why = (await getCategoryDeleteBlockers([id])).get(id) ?? [];
    if (why.length) return { success: false, error: `ما ينحذف «${category.name}»: فيه ${why.join(" · ")}.` };

    await db.category.delete({ where: { id: category.id } });
    await settleRedirects("categories", category.slug);

    await logAction("category.delete", {
      entity: "Category",
      entityId: category.id,
      summary: category.name,
      metadata: { slug: category.slug },
    });

    revalidatePath("/categories");
    revalidatePath("/deletion");

    // Rebuild the listing blob BEFORE busting modonty's cache. It was the other way round,
    // so the flush went out first and the next visitor rebuilt /categories from the blob
    // that still listed the deleted category — the stale page served under a fresh cache.
    // Same order the create and update paths already follow.
    //
    // And the answer is read: the generator returns `{ success, error }` and never throws,
    // so `await` alone always looked successful. A failed rebuild holds the flush rather
    // than publishing the old list as new.
    let listingOk = true;
    try {
      const { regenerateCategoriesListingCache } = await import("@/lib/seo/listing-page-seo-generator");
      const r = await regenerateCategoriesListingCache();
      listingOk = r.success;
      if (!r.success) console.error("Categories listing cache failed:", r.error);
    } catch (e) {
      listingOk = false;
      console.error("Categories listing cache failed:", e);
    }
    if (listingOk) await revalidateModontyTag("categories");

    return {
      success: true,
      message:
        `انحذف التصنيف «${category.name}» نهائياً. رابطه مسحوب من جوجل (410) من وقت أرشفته.` +
        (listingOk ? "" : " تنبيه: قائمة التصنيفات في الموقع ما تجدّدت — جدّدها من صيانة السيو."),
    };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: `ما انحذف التصنيف — خطأ من القاعدة: ${error instanceof Error ? error.message : String(error)}` };
  }
}
