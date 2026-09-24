import { db } from "@/lib/db";
import { articlesAgreed } from "@/lib/orders/articles-agreed";
import { deliveredArticlesWhere } from "@/lib/orders/delivered-articles-where";

export interface ClientGuideRow {
  id: string;
  name: string;
  planName: string | null;
  articlesPerMonth: number | null;
  serviceMonths: number;
  /** المتّفق عليه في الطلب الساري — `null` بلا طلبٍ أو بلا حصّة. */
  agreed: number | null;
  /** المنشورُ له منذ بداية خدمته — نفس عدّ كرت الطلب. `null` بلا طلبٍ سارٍ: لا دورةَ يُعدّ فيها. */
  delivered: number | null;
  remaining: number | null;
  /** عند العميل في كونسوله ولم يوافق بعد (`AWAITING_APPROVAL`) — حالتُه الآن، لا دورتُه. */
  awaitingApproval: number;
  activatedAt: Date | null;
}

export interface GuidePlan {
  name: string;
  articlesPerMonth: number | null;
  /** عددُ العملاء على الباقة — عدّادُ حبّة الفلتر. */
  clients: number;
}

/**
 * **دليلُ العملاء** (خالد، ٢٤ سبتمبر ٢٠٢٦: «عشان طارق يعرف كل عميل قدّيش عنده، وقدّيش أخذ،
 * وقدّيش باقي، ومتى تفعّل»).
 *
 * لا حسابَ جديد: الطلبُ الساري (`Client.activeOrderId`) مصدرُ الباقة والحصّة ويوم التفعيل،
 * والحصّةُ والمُسلَّم من `lib/orders/` — الملفّان نفساهما اللذان يقرؤهما كرتُ الطلب.
 * العميلُ بلا طلبٍ سارٍ يظهر بشَرطة: لا حصّةَ تُحسب له.
 */
export async function getClientsGuide(): Promise<{ rows: ClientGuideRow[]; plans: GuidePlan[] }> {
  const clients = await db.client.findMany({
    select: { id: true, name: true, activeOrderId: true },
    orderBy: { name: "asc" },
    take: 500,
  });

  const orderIds = clients.map((c) => c.activeOrderId).filter((id): id is string => Boolean(id));
  const orders = orderIds.length
    ? await db.checkoutOrder.findMany({
        where: { id: { in: orderIds } },
        select: {
          id: true,
          planName: true,
          articlesPerMonth: true,
          paidMonths: true,
          bonusServiceMonths: true,
          serviceStartedAt: true,
          activatedAt: true,
        },
      })
    : [];
  const orderById = new Map(orders.map((o) => [o.id, o]));


  const withOrder = clients.filter((c) => c.activeOrderId && orderById.has(c.activeOrderId));
  const deliveredCounts = await Promise.all(
    withOrder.map((c) =>
      db.article.count({ where: deliveredArticlesWhere(c.id, orderById.get(c.activeOrderId!)!.serviceStartedAt) }),
    ),
  );
  const deliveredById = new Map(withOrder.map((c, i) => [c.id, deliveredCounts[i]]));

  // عدٌّ واحدٌ مجمَّع لكل العملاء — الحالةُ الآن لا تتقيّد ببداية الخدمة.
  const awaiting = await db.article.groupBy({
    by: ["clientId"],
    where: { status: "AWAITING_APPROVAL" },
    _count: { _all: true },
  });
  const awaitingById = new Map(awaiting.map((a) => [a.clientId, a._count._all]));

  const rows = clients.map((c) => {
    const order = c.activeOrderId ? orderById.get(c.activeOrderId) : undefined;
    const agreed = order ? articlesAgreed(order) : null;
    const delivered = order ? (deliveredById.get(c.id) ?? 0) : null;
    return {
      id: c.id,
      name: c.name,
      planName: order?.planName ?? null,
      articlesPerMonth: order?.articlesPerMonth ?? null,
      serviceMonths: order ? order.paidMonths + order.bonusServiceMonths : 0,
      agreed,
      delivered,
      remaining: agreed != null && delivered != null ? agreed - delivered : null,
      activatedAt: order?.activatedAt ?? null,
      awaitingApproval: awaitingById.get(c.id) ?? 0,
    };
  });

  // الأكثرُ دَيناً من المقالات أوّلاً — هو ما يُكتب له اليوم؛ ومَن بلا طلبٍ في الآخر.
  rows.sort((a, b) => (b.remaining ?? -Infinity) - (a.remaining ?? -Infinity) || a.name.localeCompare(b.name, "ar"));

  /**
   * الوسومُ فوق الجدول تعرّف الباقات: اسمُها وكم مقالاً في شهرها — من تعريف الباقة
   * (`CommercialPlan`)، فلا يتكرّر الرقمُ في كلّ صفّ (خالد، ٢٤ سبتمبر ٢٠٢٦). والجدولُ يبقى
   * على العقد (Agreed من الطلب).
   * باقةٌ على طلبٍ وليست في التعريفات (مثل «مجاني») تأخذ رقمَ طلباتها إن اتّفقت.
   */
  const defs = await db.commercialPlan.findMany({
    select: { name: true, articlesPerMonth: true },
    orderBy: { displayOrder: "asc" },
  });
  const defByName = new Map(defs.map((d) => [d.name, d.articlesPerMonth]));
  const orphanQuotas = new Map<string, Set<number | null>>();
  for (const r of rows) {
    if (!r.planName || defByName.has(r.planName)) continue;
    orphanQuotas.set(r.planName, (orphanQuotas.get(r.planName) ?? new Set()).add(r.articlesPerMonth));
  }
  const planQuota = (name: string) =>
    defByName.has(name) ? (defByName.get(name) ?? null) : orphanQuotas.get(name)?.size === 1 ? [...orphanQuotas.get(name)!][0] : null;

  const clientsByPlan = new Map<string, number>();
  for (const r of rows) if (r.planName) clientsByPlan.set(r.planName, (clientsByPlan.get(r.planName) ?? 0) + 1);
  const plans: GuidePlan[] = [
    ...defs
      .filter((d) => clientsByPlan.has(d.name))
      .map((d) => ({ name: d.name, articlesPerMonth: d.articlesPerMonth, clients: clientsByPlan.get(d.name)! })),
    ...[...orphanQuotas.keys()].map((name) => ({ name, articlesPerMonth: planQuota(name), clients: clientsByPlan.get(name)! })),
  ];
  return { rows, plans };
}
