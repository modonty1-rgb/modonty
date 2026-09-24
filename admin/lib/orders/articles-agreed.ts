/**
 * **حصّةُ المقالات المتَّفق عليها في طلب** = الشهريّة × شهور الخدمة (المدفوعة + الهديّة).
 * `null` حين لا حصّة على الطلب. يقرؤه كرتُ الطلب (`get-order-statement.ts`) ودليلُ العملاء
 * (`/articles/clients-guide`) — فلا يختلف الرقمُ بين الشاشتين.
 */
export function articlesAgreed(order: {
  articlesPerMonth: number | null;
  paidMonths: number;
  bonusServiceMonths: number;
}): number | null {
  return order.articlesPerMonth != null ? order.articlesPerMonth * (order.paidMonths + order.bonusServiceMonths) : null;
}
