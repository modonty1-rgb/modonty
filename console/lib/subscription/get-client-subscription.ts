import { db } from "@/lib/db";
import {
  getSubscriptionTerm,
  resolveSubscriptionStatus,
  type DisplayedSubscriptionStatus,
  type SubscriptionState,
} from "@modonty/shared/lib/subscription/subscription-term";
import { getActiveOrderForClient, type ActiveOrderView } from "./active-order";

/**
 * **اشتراكُ العميل كلُّه من طلبه الساري** — المصدرُ الواحد لكلّ شاشةٍ في الكونسول.
 *
 * كانت الشاشةُ الواحدة تخلط مصدرين: الباقةُ والمبلغ من الطلب، والبدايةُ والنهايةُ والحالةُ
 * والحصّة من كرت العميل — نسخةٌ تُكتب يومَ التفعيل ثمّ لا يحدّثها تعديلُ الطلب. فقيس ٢٣
 * سبتمبر ٢٠٢٦ على نسخة الإنتاج: ١١ عميلاً يرون «نشط» واشتراكُهم منتهٍ (خالد: «ابغى مصدر واحد»).
 *
 * والكرتُ يبقى قارئاً لشيءٍ واحد: **الإلغاءُ اليدويّ** (`CANCELLED`) — `resolveSubscriptionStatus`.
 */
export interface ClientSubscription {
  order: ActiveOrderView | null;
  status: DisplayedSubscriptionStatus;
  state: SubscriptionState | null;
  startedAt: Date | null;
  endsAt: Date | null;
  daysLeft: number | null;
  articlesPerMonth: number | null;
}

export async function getClientSubscription(clientId: string): Promise<ClientSubscription> {
  const [client, order] = await Promise.all([
    db.client.findUnique({ where: { id: clientId }, select: { subscriptionStatus: true } }),
    getActiveOrderForClient(clientId),
  ]);
  const term = order ? getSubscriptionTerm(order) : null;
  return {
    order,
    status: resolveSubscriptionStatus(client?.subscriptionStatus, !!order, term),
    state: term?.state ?? null,
    startedAt: term?.startedAt ?? null,
    endsAt: term?.endsAt ?? null,
    daysLeft: term?.daysLeft ?? null,
    articlesPerMonth: order?.articlesPerMonth ?? null,
  };
}
