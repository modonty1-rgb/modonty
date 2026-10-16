import { db } from "@/lib/db";

import { pushIf, type DeleteBlockers } from "./delete-blockers";

/** تصنيف فيه مقالات أو تصنيفات فرعية ما ينحذف — يُدمج في غيره أولاً (زر الدمج في صفحة التصنيفات). */
export async function getCategoryDeleteBlockers(ids: string[]): Promise<DeleteBlockers> {
  const rows = await db.category.findMany({
    where: { id: { in: ids } },
    select: { id: true, _count: { select: { articles: true, children: true } } },
  });
  const out: DeleteBlockers = new Map();
  for (const r of rows) {
    const why: string[] = [];
    pushIf(why, r._count.articles, "مقال تحته — ادمجه في تصنيف آخر أولاً");
    pushIf(why, r._count.children, "تصنيف فرعي تحته");
    out.set(r.id, why);
  }
  return out;
}
