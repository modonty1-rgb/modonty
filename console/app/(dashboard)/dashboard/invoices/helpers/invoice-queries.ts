import { InvoicePaymentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { invoiceMinor, isCollectedOrder } from "@modonty/shared/lib/payments/collected";
import { getSubscriptionTerm } from "@modonty/shared/lib/subscription/subscription-term";
import { formatMonths } from "@modonty/shared/lib/commercial/arabic-months";
import { formatTermLabel } from "@modonty/shared/lib/commercial/term-label";
import { getOutstandingInvoices, totalsByCurrency, type CurrencyTotal } from "@/lib/payments";

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
  /** «٦ أشهر + شهر هدية» — من الطلب خلف الفاتورة، وبلا طلب من حقولها هي، وإلّا null. */
  termLabel: string | null;
  amountMinor: number;
  currency: string;
  isPaid: boolean;
  /**
   * فاتورةٌ مدفوعةٌ لطلبٍ استُرِدّ مالُه — لا تُعرض «مدفوعة». وغيرُ المدفوعة تبقى «بانتظار الدفع»
   * ولو استُرِدّ طلبُها: هي في المستحقّ بقاعدة `isOutstandingInvoice` الواحدة، فلا يقول الصفُّ
   * «مُسترَدة» والكرتُ فوقه يعدّها دَيناً (٢٣ سبتمبر ٢٠٢٦ · خالد: مصدرٌ واحد).
   */
  isRefunded: boolean;
  paidAt: Date | null;
  /** نهايةُ الطلب محسوبةً اليوم (`getSubscriptionTerm`)، لا نسخةٌ جُمّدت يوم الإصدار. */
  subscriptionEnd: Date | null;
}

export interface InvoiceSummary {
  invoices: ClientInvoice[];
  unpaidCount: number;
  /** المستحقّ لكلّ عملةٍ وحدها — `getOutstandingInvoices`، نفسُ مصدر الشريط والإعدادات. */
  unpaid: CurrencyTotal[];
  /** ما دفعه فعلاً: طلباته `PAID` لكلّ عملةٍ وحدها — لا الفواتير. */
  paid: CurrencyTotal[];
}

/** فاتورةٌ قديمةٌ بلا طلبٍ ولا لقطةِ شهور: ما كُتب عليها يومَ صدرت. */
function legacyPeriodLabel(period: string): string | null {
  if (period === "monthly") return "شهري";
  if (period === "annual") return "سنوي";
  const months = /^(\d+)m$/.exec(period)?.[1];
  return months ? formatMonths(Number(months)) : null;
}

export async function getClientInvoices(clientId: string): Promise<InvoiceSummary> {
  const [rows, outstanding, paidOrders] = await Promise.all([
    db.invoice.findMany({
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
        totalMinor: true,
        currency: true,
        paymentStatus: true,
        paidAt: true,
        subscriptionEnd: true,
        paidMonths: true,
        bonusServiceMonths: true,
        orderId: true,
      },
      take: 100,
    }),
    getOutstandingInvoices(clientId),
    /**
     * «إجمالي المدفوع» = طلباتُ العميل `PAID` بقاعدة `collected.ts` (٢٣ سبتمبر ٢٠٢٦ · خالد:
     * مصدرٌ واحد). كان يجمع الفواتيرَ المدفوعة — فيُعيد قاعدةَ «الفاتورة بلا طلب مال» المحذوفة،
     * ويُسقط طلباً مدفوعاً لم تُصدر فاتورتُه بعد، ويبقى على المبلغ القديم بعد تعديل الطلب.
     */
    db.checkoutOrder.findMany({
      where: { clientId, status: "PAID" },
      select: { status: true, totalMinor: true, currency: true },
      take: 200,
    }),
  ]);

  /**
   * المدّةُ والنهايةُ من الطلب خلف الفاتورة (`Invoice.orderId`)، لا من `period` الذي يكتب
   * «سنوي» لكلّ مدّةٍ غيرِ شهر، ولا من `subscriptionEnd` المجمَّد يوم الإصدار. والاستردادُ
   * يغيّر حالةَ الطلب ولا يلمس فاتورتَه، فتُقرأ حالتُه هنا أيضاً.
   */
  const orderIds = [...new Set(rows.map((r) => r.orderId).filter((id): id is string => !!id))];
  const orderRows = orderIds.length
    ? await db.checkoutOrder.findMany({
        // طلبُ العميل نفسِه فقط — كما يتحقّق `active-order.ts` من ملكيّة الطلب قبل عرضه.
        where: { id: { in: orderIds }, clientId },
        select: { id: true, status: true, paidMonths: true, bonusServiceMonths: true, serviceStartedAt: true },
      })
    : [];
  const orders = new Map(orderRows.map((o) => [o.id, o] as const));

  const invoices: ClientInvoice[] = rows.map((r) => {
    const order = r.orderId ? orders.get(r.orderId) : undefined;
    const termLabel = order
      ? formatTermLabel(order.paidMonths, order.bonusServiceMonths)
      : r.paidMonths != null
        ? formatTermLabel(r.paidMonths, r.bonusServiceMonths)
        : legacyPeriodLabel(r.period);
    return {
      id: r.id,
      number: r.number,
      issuedAt: r.issuedAt,
      tierName: r.tierName,
      termLabel,
      amountMinor: invoiceMinor(r),
      currency: r.currency,
      isPaid: r.paymentStatus === InvoicePaymentStatus.PAID,
      isRefunded: r.paymentStatus === InvoicePaymentStatus.PAID && order?.status === "REFUNDED",
      paidAt: r.paidAt,
      subscriptionEnd: order ? getSubscriptionTerm(order).endsAt : r.subscriptionEnd,
    };
  });

  return {
    invoices,
    unpaidCount: outstanding.count,
    unpaid: outstanding.totals,
    paid: totalsByCurrency(
      paidOrders.filter(isCollectedOrder).map((o) => ({ currency: o.currency, minor: o.totalMinor })),
    ),
  };
}
