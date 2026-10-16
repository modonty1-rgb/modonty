import { ArticleStatus } from "@prisma/client";

import { db } from "@/lib/db";

import { CLIENT_SITE_LOCK_MESSAGE, hasLeftForClientSite } from "@/lib/client-site-guard";

import type { DeleteBlockers } from "./delete-blockers";

/**
 * الحذف تنظيف للقاعدة لا قرار نشر (خالد ١٦ أكتوبر ٢٠٢٦: «أول قرار يجي من الكاتب إنه يأرشف،
 * بعد كذا إحنا نحذف»). فلا يُحذف إلا مقال مؤرشف — والأرشفة نفسها هي اللي شالت رابطه من جوجل.
 * ومقال منشور على موقع العميل ما ينحذف من عندنا — يكسر صفحة شغّالة عنده.
 */
export async function getArticleDeleteBlockers(ids: string[]): Promise<DeleteBlockers> {
  const rows = await db.article.findMany({
    where: { id: { in: ids } },
    select: { id: true, isClientSiteArticle: true, status: true, lastFetchedAt: true },
  });
  const out: DeleteBlockers = new Map();
  for (const r of rows) {
    const why: string[] = [];
    if (hasLeftForClientSite(r)) why.push(CLIENT_SITE_LOCK_MESSAGE);
    else if (r.status !== ArticleStatus.ARCHIVED) why.push("ما هو مؤرشف — الكاتب يأرشفه من صفحته أولاً");
    out.set(r.id, why);
  }
  return out;
}
