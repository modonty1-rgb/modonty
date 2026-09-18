"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";
import { requireFinanceAdmin } from "@/lib/require-finance-admin";

/**
 * تسجيلُ استردادٍ حصل — لا تنفيذُه.
 *
 * المالُ يُردّ في البنك أو لدى المزوّد بيدِ إنسان؛ وهذا الفعلُ يكتب أنّه حصل. وكانت
 * `REFUNDED` قيمةً في الـenum **بلا كودٍ يكتبها** (مقيسٌ ١٨ سبتمبر ٢٠٢٦: صفر كاتب)،
 * فالمالُ يخرج من الحساب ويبقى في تقرير المبيعات إيراداً إلى الأبد.
 *
 * وبوسمِ الطلب `REFUNDED` يسقط من الإيراد من تلقائه: تقريرُ المبيعات يعدّ
 * `status: "PAID"` وحده (`get-sales-report.ts:136`) — فلا حسابَ ثانٍ يُطرح منه.
 *
 * **ولا يُفكّ التفعيل:** العميلُ أخذ خدمةً فعلاً، وحذفُ كرته يمحو مقالاته وفواتيره.
 * الاستردادُ حدثٌ ماليّ يُسجَّل، وإيقافُ الخدمة قرارٌ آخر له بابُه في كرت العميل.
 */
const schema = z.object({
  orderId: z.string().min(1),
  reason: z.string().trim().min(3, "اكتب سبب الاسترداد").max(300),
});

export async function refundOrderAction(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  await requireFinanceAdmin();

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  const { orderId, reason } = parsed.data;

  const order = await db.checkoutOrder.findUnique({
    where: { id: orderId },
    select: { number: true, status: true, totalMinor: true, currency: true, notes: true },
  });
  if (!order) return { ok: false, error: "الطلب غير موجود" };
  // شرطٌ على القيمة المخزَّنة لا المعروضة: الصفحةُ قد تكون مفتوحةً منذ دقائق.
  if (order.status !== "PAID") return { ok: false, error: `لا يُسترد إلّا المدفوع — هذا الطلب «${order.status}»` };

  const stamp = `↩ مُسترَد ${new Date().toISOString().slice(0, 10)} — ${reason}`;
  await db.checkoutOrder.update({
    where: { id: orderId },
    data: { status: "REFUNDED", notes: order.notes ? `${order.notes}\n${stamp}` : stamp },
  });

  await logAction("order.refund", {
    entity: "Order",
    entityId: orderId,
    summary: `استرداد ${order.number} — ${(order.totalMinor / 100).toLocaleString("en")} ${order.currency} — ${reason}`,
    metadata: { totalMinor: order.totalMinor, currency: order.currency, reason },
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/clients/sales-report");
  revalidatePath("/");
  return { ok: true };
}
