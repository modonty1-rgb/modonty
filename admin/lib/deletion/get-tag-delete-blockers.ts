import { db } from "@/lib/db";

import { pushIf, type DeleteBlockers } from "./delete-blockers";

/** وسم مربوط بمقالات ما ينحذف — يُدمج في وسم آخر أولاً، والدمج يحوّل رابطه (308). */
export async function getTagDeleteBlockers(ids: string[]): Promise<DeleteBlockers> {
  const rows = await db.tag.findMany({
    where: { id: { in: ids } },
    select: { id: true, _count: { select: { articles: true } } },
  });
  const out: DeleteBlockers = new Map();
  for (const r of rows) {
    const why: string[] = [];
    pushIf(why, r._count.articles, "مقال مربوط به — ادمجه في وسم آخر أولاً");
    out.set(r.id, why);
  }
  return out;
}
