import { InvoicePaymentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { isOutstandingInvoice, outstandingByCurrency } from "@modonty/shared/lib/payments/collected";
import type { CurrencyTotal } from "./totals-by-currency";

export interface OutstandingInvoices {
  count: number;
  /** لكلّ عملةٍ سطرُها — العملةُ من الفاتورة نفسها. */
  totals: CurrencyTotal[];
}

/**
 * **مستحقّاتُ العميل — قاعدةٌ واحدة** (٢٣ سبتمبر ٢٠٢٦ · خالد: مصدرٌ واحد).
 *
 * فواتيرُ غيرُ مدفوعة وغيرُ مؤرشفة، والجمعُ بـ`outstandingByCurrency` من `collected.ts` —
 * الدالّةُ نفسُها التي يقرؤها الأدمن، لا جمعٌ ثانٍ هنا. كان الشريطُ يجمع `amount` القديمَ
 * لكلّ الفواتير ويلصق عملةَ أوّلها، فريالٌ وجنيهٌ يصيران رقماً واحداً. يقرؤها الشريطُ
 * والإعداداتُ وصفحةُ الفواتير ولوحةُ البداية معاً.
 */
export async function getOutstandingInvoices(clientId: string): Promise<OutstandingInvoices> {
  const rows = await db.invoice.findMany({
    // `archivedAt: null` لا يطابق صفّاً كُتب قبل وجود الحقل في مونغو — فتُقرن بـ`isSet: false`.
    where: {
      clientId,
      NOT: { paymentStatus: InvoicePaymentStatus.PAID },
      OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
    },
    select: {
      paymentStatus: true,
      orderId: true,
      fromOpeningBalance: true,
      amount: true,
      totalMinor: true,
      currency: true,
    },
    take: 100,
  });
  return {
    count: rows.filter((r) => isOutstandingInvoice(r)).length,
    totals: outstandingByCurrency(rows),
  };
}
