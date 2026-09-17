import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

/**
 * Paid orders with no client account yet — money in the bank, service not started.
 *
 * ONE definition, read by both surfaces (the dashboard card and the orders filter) so the
 * count on the card and the rows behind it can never disagree.
 *
 * `clientId` marks activation: filled = a client was founded from this order, absent =
 * still waiting. No extra status field to drift out of sync (MONEY-FLOW §1).
 *
 * The `OR` is not belt-and-braces — it is required. Prisma's MongoDB connector does not
 * match `clientId: null` against a document where the key was never written, and every
 * order born on the checkout page is exactly that (`clientId` is absent from its create
 * data). Filtering on `null` alone returned ZERO while four orders were waiting; the same
 * trap is documented at `link-order-to-client.ts:17-23` and it caught this file's first
 * draft too.
 *
 * `satisfies` لا `as const`: الثاني يجمّد المصفوفة (`readonly`) وPrisma يطلبها قابلةً
 * للتغيير، فكان كلُّ مستهلكٍ لهذا الثابت يسقط في TS2322. و`satisfies` يبقي الفحص على
 * أسماء الحقول بلا تجميد.
 */
export const AWAITING_ACTIVATION = {
  status: "PAID",
  OR: [{ clientId: null }, { clientId: { isSet: false } }],
} satisfies Prisma.CheckoutOrderWhereInput;

export type AwaitingActivationTotals = {
  count: number;
  /** Sum per currency — never a single number. Adding SAR to EGP is the bug decision 4 exists to stop. */
  byCurrency: Array<{ currency: string; totalMinor: number }>;
  /** Days since the oldest one was paid — null when nothing is waiting. */
  oldestDays: number | null;
};

/** The card's numbers: how many wait, how much, and how long the oldest has waited. */
export async function getAwaitingActivationTotals(): Promise<AwaitingActivationTotals> {
  const rows = await db.checkoutOrder.findMany({
    where: AWAITING_ACTIVATION,
    select: { totalMinor: true, currency: true, paidAt: true, createdAt: true },
    take: 500,
  });

  const sums = new Map<string, number>();
  let oldest: Date | null = null;
  for (const r of rows) {
    sums.set(r.currency, (sums.get(r.currency) ?? 0) + r.totalMinor);
    // paidAt is the honest clock; createdAt is the fallback for a row that predates it.
    const when = r.paidAt ?? r.createdAt;
    if (!oldest || when < oldest) oldest = when;
  }

  return {
    count: rows.length,
    byCurrency: [...sums.entries()]
      .map(([currency, totalMinor]) => ({ currency, totalMinor }))
      .sort((a, b) => b.totalMinor - a.totalMinor),
    oldestDays: oldest ? Math.floor((Date.now() - oldest.getTime()) / 86_400_000) : null,
  };
}
