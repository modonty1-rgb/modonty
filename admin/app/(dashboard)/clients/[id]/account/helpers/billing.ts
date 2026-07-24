import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

/**
 * «Not archived» on MongoDB. `{ archivedAt: null }` looks right and is a silent trap: it
 * matches only documents where the field EXISTS and holds null — every invoice written
 * before the field was added has no such key, so the filter returned 0 of 8 rows and the
 * recompute wiped a client's end date (caught live 2026-07-24, before any push).
 * Verified against the dev database: eqNull=0, isSet:false=8.
 */
export const NOT_ARCHIVED: Pick<Prisma.InvoiceWhereInput, "OR"> = {
  OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
};

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

/**
 * We do not sell on credit (Khalid 2026-07-24: «ما في عميل تُصدر له فاتورتان إلا يكون
 * سدّد اللي قبلها»). That rule lived only in his head — the code happily issued three
 * unpaid invoices in a row — so it is enforced here. The only way out is archiving the
 * outstanding invoice, never a bypass flag.
 *
 * Returns the blocking invoice number, or null when issuing is allowed.
 */
export async function findBlockingUnpaidInvoice(clientId: string): Promise<string | null> {
  const outstanding = await db.invoice.findFirst({
    where: { clientId, paymentStatus: { not: "PAID" }, ...NOT_ARCHIVED },
    orderBy: { issuedAt: "asc" },
    select: { number: true },
  });
  return outstanding?.number ?? null;
}
