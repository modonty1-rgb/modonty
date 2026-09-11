import { db } from "@/lib/db";
import { NOT_ARCHIVED } from "./not-archived";

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
