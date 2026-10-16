"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { logAction } from "@/lib/audit/log-action";

import { getIndustryDeleteBlockers } from "./get-industry-delete-blockers";
import { requireDeleteAdmin } from "./require-delete-admin";
import { settleRedirects } from "./settle-redirects";
import type { DeleteResult } from "./delete-result";

export async function deleteIndustry(id: string): Promise<DeleteResult> {
  try {
    const denied = await requireDeleteAdmin();
    if (denied) return { success: false, error: denied };

    const industry = await db.industry.findUnique({ where: { id }, select: { name: true, slug: true, archivedAt: true } });
    if (!industry) return { success: false, error: "الصناعة غير موجودة — يمكن انحذفت قبل." };
    // الحذف للمؤرشف فقط — الأرشفة قرار الفريق من صفحته أولاً (خالد ١٦ أكتوبر ٢٠٢٦: «نفس المنطق»).
    if (!industry.archivedAt) return { success: false, error: `«${industry.name}» ما هو مؤرشف — الفريق يأرشفه من صفحة الصناعة أولاً.` };

    const why = (await getIndustryDeleteBlockers([id])).get(id) ?? [];
    if (why.length) return { success: false, error: `ما تنحذف «${industry.name}»: عليها ${why.join(" · ")}.` };

    await db.industry.delete({ where: { id } });
    await settleRedirects("industries", industry.slug);

    await logAction("industry.delete", {
      entity: "Industry",
      entityId: id,
      summary: industry.name,
    });

    revalidatePath("/industries");
    revalidatePath("/deletion");
    // Rebuild the listing blob BEFORE busting modonty’s cache. It ran after, so the flush
    // went out first and the next visitor rebuilt the listing from the blob that still
    // contained the deleted row — the stale page served under a fresh cache. Same order the
    // create and update paths already follow.
    //
    // The answer is read too: the generator returns `{ success, error }` and never throws, so
    // `await` alone always looked successful. A failed rebuild holds the flush.
    let listingOk = true;
    try {
      const { regenerateIndustriesListingCache } = await import("@/lib/seo/listing-page-seo-generator");
      const r = await regenerateIndustriesListingCache();
      listingOk = r.success;
      if (!r.success) console.error("Industries listing cache failed:", r.error);
    } catch (e) {
      listingOk = false;
      console.error("Industries listing cache failed:", e);
    }
    if (listingOk) await revalidateModontyTag("industries");
    return {
      success: true,
      message:
        `انحذفت الصناعة «${industry.name}» نهائياً. رابطها مسحوب من جوجل (410) من وقت أرشفتها.` +
        (listingOk ? "" : " تنبيه: قائمة الصناعات في الموقع ما تجدّدت — جدّدها من صيانة السيو."),
    };
  } catch (error) {
    return { success: false, error: `ما انحذفت الصناعة — خطأ من القاعدة: ${error instanceof Error ? error.message : String(error)}` };
  }
}
