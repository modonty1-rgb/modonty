import { db } from "@/lib/db";
import { getCategoryDeleteBlockers } from "@/lib/deletion/get-category-delete-blockers";
import { getIndustryDeleteBlockers } from "@/lib/deletion/get-industry-delete-blockers";
import { getTagDeleteBlockers } from "@/lib/deletion/get-tag-delete-blockers";
import type { TaxonomyKind } from "@/lib/taxonomy-archive/set-taxonomy-archived";

import { ArchiveTaxonomyButton } from "./archive-taxonomy-button";

/**
 * زرّ «أرشف / رجّع» في صفحة التصنيف والوسم والصناعة — يقرأ الحالة والموانع في الخادم، فالزرّ
 * يعرف قبل الضغط هل يتأرشف أو لا ولماذا (نفس موانع الحذف — «المنطق واحد»، خالد ١٦ أكتوبر ٢٠٢٦).
 */
export async function ArchiveTaxonomyControl({ kind, id }: { kind: TaxonomyKind; id: string }) {
  const row =
    kind === "category"
      ? await db.category.findUnique({ where: { id }, select: { name: true, archivedAt: true } })
      : kind === "tag"
        ? await db.tag.findUnique({ where: { id }, select: { name: true, archivedAt: true } })
        : await db.industry.findUnique({ where: { id }, select: { name: true, archivedAt: true } });
  if (!row) return null;

  const blockers = row.archivedAt
    ? []
    : ((kind === "category"
        ? await getCategoryDeleteBlockers([id])
        : kind === "tag"
          ? await getTagDeleteBlockers([id])
          : await getIndustryDeleteBlockers([id])
      ).get(id) ?? []);

  return <ArchiveTaxonomyButton kind={kind} id={id} name={row.name} archived={!!row.archivedAt} blockers={blockers} />;
}
