import { db } from "@/lib/db";

/**
 * طلبٌ مُرحَّل؟ — له معاملةٌ بمزوّد `MIGRATED` يكتبها الترحيلُ نفسه
 * (`app/api/dev/rebuild-orders/route.ts`). والوسمُ ⚠ في الملاحظة لا يصلح تعريفاً:
 * يُمسح بعد المراجعة، والطلبُ يبقى مُرحَّلاً.
 */
export async function isMigratedOrder(orderId: string): Promise<boolean> {
  const count = await db.paymentTransaction.count({ where: { orderId, provider: "MIGRATED" } });
  return count > 0;
}
