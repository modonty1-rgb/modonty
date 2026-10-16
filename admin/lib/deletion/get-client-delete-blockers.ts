import { db } from "@/lib/db";

import { pushIf, type DeleteBlockers } from "./delete-blockers";

/**
 * ما يمنع حذف العميل — يُحسب هنا مرّة ويُستعمل في الصفحة (للعرض) وفي الحذف (للمنع).
 *
 * - مقالات: صفحاتها حيّة عند جوجل، وعلاقتها Restrict.
 * - مشتركو النشرة والفواتير: علاقتهم Restrict — الحذف كان يسقط بخطأ إنجليزي.
 * - طلب مدفوع بمبلغ: فلوس (`CheckoutOrder.clientId` بلا علاقة). الطلب بصفر ينحذف معه في `delete-client.ts`.
 * - عملاء فروع: علاقتهم NoAction، فيبقون يشيرون لعميل غير موجود.
 * - منشورات السوشيال: كل عميل له تقويم يُنشأ تلقائياً (٤٨ من ٤٨ على dev)، فالتقويم الفاضي
 *   ينحذف معه في `delete-client.ts`؛ والذي فيه منشورات يمنع — المنشورات شغل التيم.
 * - العميل الأساسي لمدونتي (`Settings.coreClientId`).
 */
export async function getClientDeleteBlockers(ids: string[]): Promise<DeleteBlockers> {
  const [clients, orders, calendars, settings] = await Promise.all([
    db.client.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        _count: { select: { articles: true, subscribers: true, invoices: true, subOrganizations: true } },
      },
    }),
    // الطلب بصفر (تجربة/هديّة) ما يمنع — ينحذف مع العميل. المانع طلبٌ فيه مبلغ (خالد ١٦ أكتوبر ٢٠٢٦).
    db.checkoutOrder.groupBy({ by: ["clientId"], where: { clientId: { in: ids }, totalMinor: { gt: 0 } }, _count: { _all: true } }),
    db.socialCalendar.findMany({ where: { clientId: { in: ids } }, select: { clientId: true, _count: { select: { posts: true } } } }),
    db.settings.findFirst({ select: { coreClientId: true } }),
  ]);
  const ordersBy = new Map(orders.map((o) => [o.clientId, o._count._all]));
  const postsBy = new Map<string, number>();
  for (const c of calendars) if (c.clientId) postsBy.set(c.clientId, (postsBy.get(c.clientId) ?? 0) + c._count.posts);

  const out: DeleteBlockers = new Map();
  for (const c of clients) {
    const why: string[] = [];
    pushIf(why, c._count.articles, "مقال — احذفها أو انقلها لعميل آخر أولاً");
    pushIf(why, ordersBy.get(c.id) ?? 0, "طلب مدفوع بمبلغ — هذا إلغاء اشتراك واسترجاع، مو حذف");
    pushIf(why, c._count.invoices, "فاتورة");
    pushIf(why, c._count.subscribers, "مشترك في نشرته");
    pushIf(why, c._count.subOrganizations, "عميل مسجّل فرعاً تحته");
    pushIf(why, postsBy.get(c.id) ?? 0, "منشور في تقويم السوشيال");
    if (settings?.coreClientId === c.id) why.push("هذا العميل الأساسي لمدونتي في الإعدادات");
    out.set(c.id, why);
  }
  return out;
}
