import { db } from "@/lib/db";
import { NOT_ARCHIVED } from "./not-archived";

/**
 * The one formula that decides how far a client's subscription runs.
 *
 * There used to be two: issuance took the furthest end across ALL invoices, settlement
 * took it across PAID ones only. Settling the oldest of several outstanding invoices
 * therefore rewrote the end date *backwards* — a client could pay and lose months
 * (caught 2026-07-24 on «فرسان التعافي»: end 2027-05-24 would have collapsed to
 * 2026-10-24). Every write-point now calls this, so the date only ever moves forward,
 * with archiving as the single deliberate exception.
 *
 * Archived invoices are excluded: a voided invoice must not keep paying for a period
 * nobody was billed for.
 */
export async function recomputeSubscriptionEnd(clientId: string): Promise<Date | null> {
  const invoices = await db.invoice.findMany({
    where: { clientId, ...NOT_ARCHIVED },
    select: { subscriptionEnd: true },
    take: 500,
  });

  const latestEnd = invoices
    .map((i) => i.subscriptionEnd)
    .filter((d): d is Date => d instanceof Date)
    .reduce<Date | null>((max, d) => (max === null || d > max ? d : max), null);

  // A null result means every remaining invoice is dateless (or all were archived) —
  // write it through rather than leaving a stale date the ledger no longer justifies.
  await db.client.update({
    where: { id: clientId },
    data: { subscriptionEndDate: latestEnd },
  });

  return latestEnd;
}
