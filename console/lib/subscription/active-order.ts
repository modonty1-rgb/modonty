import { db } from "@/lib/db";

/**
 * The deal that governs this client — the console's ONE source for plan name, price,
 * term and currency.
 *
 * Everything here is a snapshot frozen at purchase (MONEY-FLOW, قاعدة المصدر الواحد):
 * `planName` not `tierConfig.name`, `totalMinor` not `tierConfig.price`, `currency` not
 * a guess from the client's address. Re-pricing a plan tomorrow must not rewrite what a
 * client who bought yesterday sees on their own portal.
 *
 * Returns null when the client has no governing order. The caller renders an explicit
 * empty state — never a value borrowed from the old catalog, because a second source is
 * exactly what this replaces.
 */
export type ActiveOrderView = {
  number: string;
  planName: string;
  currency: string;
  /** الإجماليّ المدفوع بالوحدة الصغرى — لا سعر الكتالوج (قرار خالد ١٧ سبتمبر). */
  totalMinor: number;
  paidMonths: number;
  bonusServiceMonths: number;
  articlesPerMonth: number | null;
  paidAt: Date | null;
  serviceStartedAt: Date | null;
  /** `REFUNDED` يبقى الطلبَ الحاكم (الاستردادُ لا يفكّ التفعيل) لكنّه لا يُعرض مدفوعاً. */
  status: string;
};

export async function getActiveOrderForClient(clientId: string): Promise<ActiveOrderView | null> {
  const client = await db.client.findUnique({
    where: { id: clientId },
    select: { activeOrderId: true },
  });
  if (!client?.activeOrderId) return null;

  const order = await db.checkoutOrder.findUnique({
    where: { id: client.activeOrderId },
    select: {
      number: true, planName: true, currency: true, totalMinor: true,
      paidMonths: true, bonusServiceMonths: true, articlesPerMonth: true,
      paidAt: true, serviceStartedAt: true, clientId: true, status: true,
    },
  });
  // A pointer left behind by a deleted or re-linked order must not render as this
  // client's deal — the read verifies the order still belongs to them.
  if (!order || order.clientId !== clientId) return null;

  const { clientId: _ignored, ...view } = order;
  return view;
}

/** «٢٬٣٩٤ ر.س» — العملة من الطلب، مجمّدةً يوم الشراء. */
export function formatOrderMoney(minor: number, currency: string): string {
  const amount = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 }).format(minor / 100);
  const unit = currency === "EGP" ? "ج.م" : currency === "SAR" ? "ر.س" : currency;
  return `${amount} ${unit}`;
}
