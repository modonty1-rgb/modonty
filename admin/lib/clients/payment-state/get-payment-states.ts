import { CheckoutOrderStatus, InvoicePaymentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { NOT_ARCHIVED } from "@/lib/invoices/not-archived";
import {
  isCollectedOrder,
  isOutstandingInvoice,
  outstandingByCurrency,
} from "@modonty/shared/lib/payments/collected";

/**
 * **شارةُ الدفع للعميل — من طلبه الساري، والمستحقّاتُ من فواتيره** (٢٣ سبتمبر ٢٠٢٦ · خالد: مصدرٌ واحد).
 *
 * كانت تُشتقّ من الفواتير وحدها، فعميلٌ طلبُه `PAID` ولم تُصدَر فاتورتُه بعد (تُصدر يدويّاً
 * بعد الدفع) يُقرأ «بلا فواتير»، ومن له ورقةٌ مدفوعة «مسدَّد». والمالُ في الطلب لا في الورقة
 * (`shared/lib/payments/collected.ts`)، فالترتيب:
 *   ١ فاتورةٌ غيرُ مدفوعة وغيرُ مؤرشفة (`isOutstandingInvoice`) ← `OWES` «عليه مستحقّات» — تتقدّم.
 *   ٢ الطلبُ الساري `PAID` ← «مدفوع» · `REFUNDED` ← «مسترد».
 *   ٣ لا طلبَ ساري (أو ساريٌ بغير الحالتين) ← `NONE` «—» بلا شارةٍ خضراء.
 *
 * `Client.paymentStatus` سقط قبلها: كلمةٌ كُتبت مرّةً ونُسيت (١٧ سبتمبر ٢٠٢٦).
 * **دفعةً لا واحداً واحداً**: ثلاثة استعلاماتٍ مهما طال الجدول.
 */
export type ClientPaymentState = {
  status: "OWES" | "PAID" | "REFUNDED" | "NONE";
  unpaidCount: number;
  /** المستحقّ **لكلّ عملة** بالوحدة الصغرى — جمعُ الريال على الجنيه هو الخطأ الذي بُنيت الورقة لمنعه. */
  unpaidByCurrency: Array<{ currency: string; minor: number }>;
  /** أقدم فاتورةٍ غير مدفوعة — ومنها يُعرف كم صار لها. */
  oldestUnpaidAt: Date | null;
};

export const NO_PAYMENT_STATE: ClientPaymentState = {
  status: "NONE",
  unpaidCount: 0,
  unpaidByCurrency: [],
  oldestUnpaidAt: null,
};

export async function getPaymentStates(clientIds: string[]): Promise<Map<string, ClientPaymentState>> {
  const out = new Map<string, ClientPaymentState>();
  if (clientIds.length === 0) return out;

  // الأرشيف يخرج في الاستعلام: الفاتورة الملغاة تبقى في الدفتر ولا تُطالِب بشيء.
  const [clients, invoices] = await Promise.all([
    db.client.findMany({
      where: { id: { in: clientIds } },
      select: { id: true, activeOrderId: true },
    }),
    db.invoice.findMany({
      where: { clientId: { in: clientIds }, ...NOT_ARCHIVED },
      select: { clientId: true, paymentStatus: true, amount: true, totalMinor: true, currency: true, issuedAt: true },
    }),
  ]);

  // الطلبُ بلا `@relation` على الكرت (مقصود)، فيُجلب بالمعرّفات دفعةً واحدة.
  const orderIds = clients.flatMap((c) => (c.activeOrderId ? [c.activeOrderId] : []));
  const orders = orderIds.length
    ? await db.checkoutOrder.findMany({
        where: { id: { in: orderIds } },
        select: { id: true, clientId: true, status: true },
      })
    : [];
  const orderById = new Map(orders.map((o) => [o.id, o]));

  const invoicesByClient = new Map<string, typeof invoices>();
  for (const inv of invoices) {
    const list = invoicesByClient.get(inv.clientId) ?? [];
    list.push(inv);
    invoicesByClient.set(inv.clientId, list);
  }

  for (const c of clients) {
    const raw = c.activeOrderId ? orderById.get(c.activeOrderId) : undefined;
    // مؤشّرٌ بقي من طلبٍ حُذف أو رُبط بغيره لا يُعدّ طلباً لهذا العميل — حارسُ `getClientSubscriptions` نفسُه.
    const order = raw && raw.clientId === c.id ? raw : undefined;
    const unpaid = (invoicesByClient.get(c.id) ?? []).filter(isOutstandingInvoice);

    const status: ClientPaymentState["status"] =
      unpaid.length > 0
        ? "OWES"
        : order && isCollectedOrder(order)
          ? "PAID"
          : order?.status === CheckoutOrderStatus.REFUNDED
            ? "REFUNDED"
            : "NONE";

    out.set(c.id, {
      status,
      unpaidCount: unpaid.length,
      unpaidByCurrency: outstandingByCurrency(unpaid),
      oldestUnpaidAt: unpaid.reduce<Date | null>((min, inv) => (!min || inv.issuedAt < min ? inv.issuedAt : min), null),
    });
  }
  return out;
}

/** فحصٌ سريع: هل على هذا العميل فاتورةٌ تمنع إصدار التالية؟ يقرأ `NOT_ARCHIVED` نفسه. */
export const UNPAID_INVOICE_WHERE = { paymentStatus: { not: InvoicePaymentStatus.PAID }, ...NOT_ARCHIVED } as const;
