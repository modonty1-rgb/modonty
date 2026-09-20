"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";
import { requireTransferConfirm } from "@/lib/require-transfer-confirm";

/**
 * **إلغاءُ طلبٍ لم يصل فيه مال** (خالد ٢٠ سبتمبر ٢٠٢٦: «ضيفها في الأوردر نفسه واعمل
 * عليها التأكيد… ومراعاة أنّما تكون صدرت له فاتورة»).
 *
 * كانت `CANCELLED` قيمةً في الـenum **بلا كاتبٍ واحد** — مقيسٌ على كلّ
 * `checkoutOrder.update*` في التطبيقات الثلاثة: تأكيدُ التحويل يكتب `PAID`،
 * والاستردادُ يكتب `REFUNDED`، والبوّاباتُ تكتبان `PAID`/`FAILED`، ولا شيءَ يكتب
 * `CANCELLED`. فشريحةُ «ملغى» في الفلتر تعرض صفراً إلى الأبد، والطلباتُ المهجورة —
 * زائرٌ فتح صفحة الدفع ولم يُكمل — تبقى «بانتظار» بلا نهاية.
 *
 * ── ثلاثةُ حرّاسٍ لا واحد ──
 * ١. **الحالة:** `AWAITING_PAYMENT` أو `AWAITING_TRANSFER` وحدهما. ما وصل فيه مال
 *    له بابُه: الاستردادُ يُسجّل خروجَ المال، والإلغاءُ يزعم أنّه لم يدخل أصلاً —
 *    فلو أُلغي مدفوعٌ سقط من الإيراد بلا أثرٍ ماليٍّ يقابله.
 * ٢. **الفاتورة:** صدورُها يعني رقماً محجوزاً وورقةً عند المشتري. فإن وُجدت يُرفض
 *    الإلغاء ويُوجَّه للاسترداد — ولا تُحذف فاتورةٌ سلّمناها.
 * ٣. **الكتابةُ باليد:** رقمُ الطلب كاملاً أو آخرُ أربعة أرقامٍ منه. الحوارُ الذي
 *    يُغلق بضغطةٍ واحدة يُضغط سهواً؛ والذي يطلب نسخَ رقمٍ من الشاشة لا يُضغط إلّا قصداً.
 *
 * ── ويُكتب مشروطاً ──
 * الشرطُ في `updateMany` لا في قراءةٍ سابقة: الصفحةُ قد تكون مفتوحةً منذ دقائق وقد
 * أكّد زميلٌ الحوالةَ في الأثناء — فيُردّ الإلغاءُ بدل أن يمحوَ تأكيدَه.
 */
const schema = z.object({
  orderId: z.string().min(1),
  reason: z.string().trim().min(3, "اكتب سبب الإلغاء").max(300),
  confirm: z.string().trim().min(1, "اكتب رقم الطلب للتأكيد"),
});

/** الحالتان اللتان لم يصل فيهما مال — وهما وحدهما ما يُلغى. */
const CANCELLABLE = ["AWAITING_PAYMENT", "AWAITING_TRANSFER"] as const;

export async function cancelOrderAction(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  // لا مالَ في هذا الطلب بعد، وصاحبُه المندوبُ الذي يتابع المشتري.
  await requireTransferConfirm();

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  const { orderId, reason, confirm } = parsed.data;

  const order = await db.checkoutOrder.findUnique({
    where: { id: orderId },
    select: { number: true, status: true, invoiceId: true, notes: true, buyerName: true, totalMinor: true, currency: true },
  });
  if (!order) return { ok: false, error: "الطلب غير موجود" };

  // الحارسُ الأوّل — على القيمة المخزَّنة لا المعروضة.
  if (!CANCELLABLE.includes(order.status as (typeof CANCELLABLE)[number])) {
    return { ok: false, error: `لا يُلغى إلّا ما لم يصل فيه مال — هذا الطلب «${order.status}»` };
  }

  // الحارسُ الثاني — الفاتورةُ رقمٌ محجوزٌ وورقةٌ عند المشتري.
  if (order.invoiceId) {
    return { ok: false, error: "صدرت لهذا الطلب فاتورة — لا يُلغى. الاستردادُ هو بابُه." };
  }

  // الحارسُ الثالث — الرقمُ كاملاً أو آخرُ أربعةٍ منه.
  const digits = order.number.replace(/\D/g, "");
  const last4 = digits.slice(-4);
  const typed = confirm.toUpperCase();
  const matches = typed === order.number.toUpperCase() || typed.replace(/\D/g, "") === last4;
  if (!matches) return { ok: false, error: `الرقم لا يطابق — اكتب ${order.number} أو آخر أربعة أرقام (${last4})` };

  const stamp = `✕ أُلغي ${new Date().toISOString().slice(0, 10)} — ${reason}`;
  /**
   * **ولا `invoiceId: null` هنا — فخُّ مونغو.**
   *
   * توثيق Prisma للموصل نصّاً: «`name: null` is checking for equality, and a
   * non-existing field isn't equal to null». وطلباتُ صفحة الدفع تُنشأ بلا هذا الحقل
   * أصلاً، فهو **غائبٌ** لا `null` — فالشرطُ يستبعدها كلَّها ويرجع `count: 0`. قيس
   * حيّاً على الإنتاج (٢٠ سبتمبر ٢٠٢٦): `ORD-2026-00001` رُدَّ بـ«تغيّرت حالةُ الطلب»
   * وهي لم تتغيّر.
   *
   * ولا يُستبدل بـ`isSet: false`: الحقلُ قد يكون `null` صريحاً في صفوفٍ أخرى. والحارسُ
   * لا يسقط — الفاتورةُ لا تصدر إلّا لطلبٍ `PAID`، و`PAID` مستبعدةٌ بشرط الحالة نفسِه.
   */
  const { count } = await db.checkoutOrder.updateMany({
    where: { id: orderId, status: { in: [...CANCELLABLE] } },
    data: { status: "CANCELLED", notes: order.notes ? `${order.notes}\n${stamp}` : stamp },
  });
  if (count === 0) return { ok: false, error: "تغيّرت حالةُ الطلب قبل لحظة — أعد تحميل الصفحة" };

  await logAction("order.cancel", {
    entity: "Order",
    entityId: orderId,
    summary: `إلغاء ${order.number} — ${(order.totalMinor / 100).toLocaleString("en")} ${order.currency} — ${reason}`,
    metadata: { previousStatus: order.status, totalMinor: order.totalMinor, currency: order.currency, reason },
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/");
  return { ok: true };
}
