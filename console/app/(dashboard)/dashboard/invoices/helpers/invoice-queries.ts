import { db } from "@/lib/db";

/**
 * The client's own invoices, read-only. Issuing, editing and settling all happen in the
 * admin — the console exists here so «عرض الفواتير» in the account notice leads somewhere
 * real (it used to point at Settings, which never showed an invoice — Khalid 2026-07-24).
 */

export interface ClientInvoice {
  id: string;
  number: string;
  issuedAt: Date;
  tierName: string;
  period: string;
  amount: number;
  currency: string;
  isPaid: boolean;
  paidAt: Date | null;
  subscriptionEnd: Date | null;
}

export interface InvoiceSummary {
  invoices: ClientInvoice[];
  unpaidCount: number;
  unpaidAmount: number;
  paidAmount: number;
  currency: string | null;
}

export async function getClientInvoices(clientId: string): Promise<InvoiceSummary> {
  const rows = await db.invoice.findMany({
    // Archived invoices are void — the admin keeps them for accounting, the client never
    // sees a bill that was cancelled. `archivedAt: null` alone would hide EVERY invoice
    // written before the field existed (Mongo: null ≠ missing), so both forms are matched.
    where: { clientId, OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }] },
    orderBy: { issuedAt: "desc" },
    select: {
      id: true,
      number: true,
      issuedAt: true,
      tierName: true,
      period: true,
      amount: true,
      currency: true,
      paymentStatus: true,
      paidAt: true,
      subscriptionEnd: true,
    },
    take: 100,
  });

  const invoices: ClientInvoice[] = rows.map((r) => ({
    id: r.id,
    number: r.number,
    issuedAt: r.issuedAt,
    tierName: r.tierName,
    period: r.period,
    amount: r.amount,
    currency: r.currency,
    isPaid: r.paymentStatus === "PAID",
    paidAt: r.paidAt,
    subscriptionEnd: r.subscriptionEnd,
  }));

  const unpaid = invoices.filter((i) => !i.isPaid);

  return {
    invoices,
    unpaidCount: unpaid.length,
    unpaidAmount: unpaid.reduce((s, i) => s + i.amount, 0),
    paidAmount: invoices.filter((i) => i.isPaid).reduce((s, i) => s + i.amount, 0),
    currency: invoices[0]?.currency ?? null,
  };
}
