"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { getCategoryDeleteBlockers } from "@/lib/deletion/get-category-delete-blockers";
import { getIndustryDeleteBlockers } from "@/lib/deletion/get-industry-delete-blockers";
import { getTagDeleteBlockers } from "@/lib/deletion/get-tag-delete-blockers";

export type TaxonomyKind = "category" | "tag" | "industry";

const META = {
  category: { one: "التصنيف", section: "categories", listing: "regenerateCategoriesListingCache", path: "/categories" },
  tag: { one: "الوسم", section: "tags", listing: "regenerateTagsListingCache", path: "/tags" },
  industry: { one: "الصناعة", section: "industries", listing: "regenerateIndustriesListingCache", path: "/industries" },
} as const;

/**
 * أرشفة تصنيف/وسم/صناعة أو إرجاعه — قرار الفريق من صفحته، مثل أرشفة المقال والريل (خالد ١٦ أكتوبر
 * ٢٠٢٦: «نفس المنطق، الأرشفة وبعد كذا الحذف من عندنا»). المؤرشف يرجع رابطه لجوجل 410 ويختفي من
 * الموقع، والحذف النهائي له للأدمن من System ← Deletion.
 *
 * الموانع نفسها موانع الحذف (`lib/deletion/get-*-delete-blockers`): ما يتأرشف شيء عليه مقالات أو
 * عملاء أو تحته فرعيات — «المنطق واحد». الإرجاع بلا موانع: يرجع كما كان.
 */
export async function setTaxonomyArchived(
  kind: TaxonomyKind,
  id: string,
  archived: boolean,
): Promise<{ success: boolean; message?: string; error?: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "غير مصرح" };
  const meta = META[kind];

  try {
    const row =
      kind === "category"
        ? await db.category.findUnique({ where: { id }, select: { name: true, archivedAt: true } })
        : kind === "tag"
          ? await db.tag.findUnique({ where: { id }, select: { name: true, archivedAt: true } })
          : await db.industry.findUnique({ where: { id }, select: { name: true, archivedAt: true } });
    if (!row) return { success: false, error: `${meta.one} غير موجود.` };

    if (archived) {
      if (row.archivedAt) return { success: false, error: `«${row.name}» مؤرشف من قبل.` };
      const blockers =
        kind === "category"
          ? await getCategoryDeleteBlockers([id])
          : kind === "tag"
            ? await getTagDeleteBlockers([id])
            : await getIndustryDeleteBlockers([id]);
      const why = blockers.get(id) ?? [];
      if (why.length) return { success: false, error: `ما يتأرشف «${row.name}»: ${why.join(" · ")}.` };
    } else if (!row.archivedAt) {
      return { success: false, error: `«${row.name}» ما هو مؤرشف.` };
    }

    const data = { archivedAt: archived ? new Date() : null };
    if (kind === "category") await db.category.update({ where: { id }, data });
    else if (kind === "tag") await db.tag.update({ where: { id }, data });
    else await db.industry.update({ where: { id }, data });

    await logAction(`${kind}.${archived ? "archive" : "unarchive"}`, {
      entity: kind === "category" ? "Category" : kind === "tag" ? "Tag" : "Industry",
      entityId: id,
      summary: row.name,
    });

    // نفس ترتيب الحذف والإنشاء: تُبنى قائمة الموقع أولاً، ثم يُبطَل كاش مدونتي.
    revalidatePath(meta.path);
    revalidatePath(`${meta.path}/${id}`);
    revalidatePath("/deletion");
    let listingOk = true;
    try {
      const gen = await import("@/lib/seo/listing-page-seo-generator");
      const r = await gen[meta.listing]();
      listingOk = r.success;
    } catch {
      listingOk = false;
    }
    if (listingOk) await revalidateModontyTag(meta.section);

    return {
      success: true,
      message: archived
        ? `انأرشف «${row.name}». رابطه يرجع لجوجل «410 محذوف» خلال ٥ دقايق، وتقدر ترجّعه من صفحته.`
        : `رجع «${row.name}» للموقع.`,
    };
  } catch (e) {
    return { success: false, error: `ما تم — خطأ من القاعدة: ${e instanceof Error ? e.message : String(e)}` };
  }
}
