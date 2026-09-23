import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  getSubscriptionTerm,
  resolveSubscriptionStatus,
  type DisplayedSubscriptionStatus,
  type SubscriptionState,
} from "@modonty/shared/lib/subscription/subscription-term";

/**
 * **اشتراكُ كلّ عميلٍ من طلبه الساري — دفعةً واحدة.** المصدرُ الواحد لشاشات الأدمن.
 *
 * كانت التنبيهاتُ والشرائحُ وعدّاداتُ «منتهٍ» وقائمةُ العملاء تقرأ نسخةَ الكرت
 * (`subscriptionStatus` · `subscriptionEndDate` · `subscriptionStartDate`) — نسخةٌ تُكتب يومَ
 * التفعيل ثمّ لا يحدّثها تعديلُ الطلب. قيس ٢٣ سبتمبر ٢٠٢٦ على نسخة الإنتاج: ١١ عميلاً «نشطون»
 * على الكرت وطلبُهم منتهٍ، و٩ نهايتُهم تخالف طلبَهم (خالد: «ابغى مصدر واحد»).
 *
 * فالحسابُ هنا: الطلبُ الساري (`activeOrderId`) ← `getSubscriptionTerm` (نفسُ معادلة
 * الكونسول وجدول الطلبات). والكرتُ يُقرأ لشيءٍ واحد: **الإلغاءُ اليدويّ** (`CANCELLED`).
 *
 * استعلامان مهما كثر العملاء — الكروتُ ثمّ طلباتُها بـ`in` — لا استعلامٌ لكلّ عميل.
 */
export interface ClientSubscription {
  clientId: string;
  hasOrder: boolean;
  status: DisplayedSubscriptionStatus;
  state: SubscriptionState | null;
  startedAt: Date | null;
  endsAt: Date | null;
  daysLeft: number | null;
  articlesPerMonth: number | null;
  planName: string | null;
}

export async function getClientSubscriptions(
  where: Prisma.ClientWhereInput = {},
  now: Date = new Date(),
): Promise<Map<string, ClientSubscription>> {
  const clients = await db.client.findMany({
    where,
    select: { id: true, subscriptionStatus: true, activeOrderId: true },
    take: 5000,
  });
  const orderIds = clients.flatMap((c) => (c.activeOrderId ? [c.activeOrderId] : []));
  const orders = orderIds.length
    ? await db.checkoutOrder.findMany({
        where: { id: { in: orderIds } },
        select: {
          id: true, clientId: true, serviceStartedAt: true, paidMonths: true,
          bonusServiceMonths: true, articlesPerMonth: true, planName: true,
        },
      })
    : [];
  const orderById = new Map(orders.map((o) => [o.id, o]));

  const result = new Map<string, ClientSubscription>();
  for (const c of clients) {
    const raw = c.activeOrderId ? orderById.get(c.activeOrderId) : undefined;
    // مؤشّرٌ بقي من طلبٍ حُذف أو رُبط بغيره لا يُعدّ اشتراكاً لهذا العميل.
    const order = raw && raw.clientId === c.id ? raw : undefined;
    const term = order ? getSubscriptionTerm(order, now) : null;
    result.set(c.id, {
      clientId: c.id,
      hasOrder: !!order,
      status: resolveSubscriptionStatus(c.subscriptionStatus, !!order, term),
      state: term?.state ?? null,
      startedAt: term?.startedAt ?? null,
      endsAt: term?.endsAt ?? null,
      daysLeft: term?.daysLeft ?? null,
      articlesPerMonth: order?.articlesPerMonth ?? null,
      planName: order?.planName ?? null,
    });
  }
  return result;
}

/** معرّفاتُ العملاء الذين يطابق اشتراكُهم الشرط — للاستعلامات التي كانت تفلتر بحقول الكرت. */
export function clientIdsWhere(
  subs: Map<string, ClientSubscription>,
  test: (s: ClientSubscription) => boolean,
): string[] {
  const ids: string[] = [];
  subs.forEach((s) => {
    if (test(s)) ids.push(s.clientId);
  });
  return ids;
}
