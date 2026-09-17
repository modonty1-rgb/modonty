import { db } from "@/lib/db";
import { NOT_ARCHIVED } from "@/lib/invoices/not-archived";

/**
 * **حالةُ الدفع مشتقّةً من الفواتير — لا مقروءةً من الكرت.**
 *
 * `Client.paymentStatus` حقلٌ يحمل كلمةً كتبها أحدٌ مرّةً ونُسيت، ولا يعرف شيئاً عن فواتير
 * صاحبه. المقيس على `modonty_dev` (١٧ سبتمبر ٢٠٢٦):
 *
 *     ٢٧ عميلاً من ٤٢ بلا أيّ فاتورة — و٢٦ منهم مكتوبٌ على كرتهم «PAID».
 *
 * ولا شيء يكتب `OVERDUE` فيه أصلاً («تحديد مدفوعة» يكتب `PAID` فقط)، فكرتُ عميلٍ عليه
 * ثلاث فواتير غير مسدَّدة كان يقرأ «مدفوع» ولا يمكن أن يعرض غير الصفر (خالد ٢٤ يوليو ٢٠٢٦).
 *
 * **دفعةً لا واحداً واحداً**: القوائم تعرض عشرات الصفوف، واستعلامٌ لكلّ صفٍّ يقتل الصفحة.
 */

export type ClientPaymentState = {
  /**
   * `NO_INVOICES` حالةٌ ثالثة صريحة — لا تُطوى في «مدفوع». عميلٌ بلا فاتورة ليس مسدِّداً،
   * وطيُّها في PAID هو بالضبط الكذبةُ التي أسقطت هذا الحقل.
   */
  status: "PAID" | "UNPAID" | "NO_INVOICES";
  invoiceCount: number;
  unpaidCount: number;
  /** المتأخّر **لكلّ عملة** — جمعُ الريال على الجنيه هو الخطأ الذي بُنيت الورقة لمنعه. */
  unpaidByCurrency: Array<{ currency: string; amount: number }>;
  /** أقدم فاتورةٍ غير مسدَّدة — ومنها يُعرف كم صار لها. */
  oldestUnpaidAt: Date | null;
};

export const NO_INVOICES: ClientPaymentState = {
  status: "NO_INVOICES",
  invoiceCount: 0,
  unpaidCount: 0,
  unpaidByCurrency: [],
  oldestUnpaidAt: null,
};

export async function getPaymentStates(clientIds: string[]): Promise<Map<string, ClientPaymentState>> {
  const out = new Map<string, ClientPaymentState>();
  if (clientIds.length === 0) return out;

  // الأرشيف يخرج من العدّ لا من السجلّ: الفاتورة الملغاة تبقى في الدفتر ولا تُطالِب بشيء.
  const invoices = await db.invoice.findMany({
    where: { clientId: { in: clientIds } },
    select: { clientId: true, paymentStatus: true, amount: true, currency: true, archivedAt: true, issuedAt: true },
  });

  const counts = new Map<string, { total: number; unpaid: number; byCur: Map<string, number>; oldest: Date | null }>();
  for (const inv of invoices) {
    const cur = counts.get(inv.clientId) ?? { total: 0, unpaid: 0, byCur: new Map<string, number>(), oldest: null };
    cur.total += 1;
    const archived = inv.archivedAt !== null && inv.archivedAt !== undefined;
    if (!archived && inv.paymentStatus !== "PAID") {
      cur.unpaid += 1;
      cur.byCur.set(inv.currency, (cur.byCur.get(inv.currency) ?? 0) + inv.amount);
      if (!cur.oldest || inv.issuedAt < cur.oldest) cur.oldest = inv.issuedAt;
    }
    counts.set(inv.clientId, cur);
  }

  for (const id of clientIds) {
    const c = counts.get(id);
    if (!c || c.total === 0) { out.set(id, NO_INVOICES); continue; }
    out.set(id, {
      status: c.unpaid > 0 ? "UNPAID" : "PAID",
      invoiceCount: c.total,
      unpaidCount: c.unpaid,
      unpaidByCurrency: [...c.byCur.entries()]
        .map(([currency, amount]) => ({ currency, amount }))
        .sort((a, b) => b.amount - a.amount),
      oldestUnpaidAt: c.oldest,
    });
  }
  return out;
}

/** فحصٌ سريع: هل على هذا العميل فاتورةٌ تمنع إصدار التالية؟ يقرأ `NOT_ARCHIVED` نفسه. */
export const UNPAID_INVOICE_WHERE = { paymentStatus: { not: "PAID" }, ...NOT_ARCHIVED } as const;
