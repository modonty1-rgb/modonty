import { db } from "@/lib/db";
import { checkFinanceAdmin } from "@/lib/require-finance-admin";

/**
 * **مَن يُجري ترحيل الطلبات ومتى** — تعريفٌ واحدٌ تقرؤه الشاشةُ والمسار معاً.
 *
 * وُضع هنا لا في `route.ts` لأنّ له مستهلكَين في مسارين مختلفين: صفحةُ
 * `orders-migration` تقرّر به إظهار الزرّ، والمسارُ يرفض به الطلب. ولو انشقّ
 * التعريفُ بينهما لظهر زرٌّ يرفضه الخادم — أو أسوأ، زرٌّ يعمل والشاشةُ تقول «تمّ».
 */

/** قاعدةُ التجارب — فيها يُعاد الترحيل ما شاء الفريق؛ وخارجَها مرّةٌ واحدة. */
export function isDevDatabase(): boolean {
  return (process.env.DATABASE_URL ?? "").includes("modonty_dev");
}

export type MigrationGate =
  | { allowed: true; isDev: boolean; orders: number }
  | { allowed: false; reason: "unauthenticated" | "forbidden" | "already-done"; orders: number };

/**
 * المعيارُ **ما في الجدول** لا اسمُ القاعدة.
 *
 * كان الحارسُ يرفض كلَّ قاعدةٍ اسمُها غيرُ `modonty_dev`، فيستحيل تشغيلُ الترحيل على
 * الإنتاج أصلاً — والترحيلُ إنّما وُجد للإنتاج: العملاءُ القدامى هناك لا هنا (خالد
 * ١٨ سبتمبر ٢٠٢٦: «المفروض إنّه يشتغل في الـproduction… ومجرّد ما أسوّي الترحيل يختفي»).
 *
 * فعلى الإنتاج يُسمح ما دام جدولُ الطلبات فارغاً تماماً، ويُرفض بعدها للأبد. وهذا
 * أمتنُ من فحص الاسم: الترحيلُ يمسح الطلبات والفواتير، فوجودُ طلبٍ واحد — مُرحَّلٍ كان
 * أو من صفحة دفعٍ حقيقيّة — يعني أنّ المسح يتلف مالاً مسجَّلاً.
 *
 * والصلاحيّةُ أُضيفت معه: كان `session?.user` وحده يكفي — أيُّ موظّفٍ مسجَّل، ولو كان
 * كاتباً، يمسح الطلبات والفواتير كلَّها بطلبٍ واحد. صار مديرَ النظام (ADMIN) وحده.
 */
export async function checkOrdersMigrationGate(): Promise<MigrationGate> {
  const gate = await checkFinanceAdmin();
  if (gate.status !== "ok") return { allowed: false, reason: gate.status === "unauthenticated" ? "unauthenticated" : "forbidden", orders: 0 };

  const orders = await db.checkoutOrder.count();
  if (isDevDatabase()) return { allowed: true, isDev: true, orders };
  if (orders > 0) return { allowed: false, reason: "already-done", orders };
  return { allowed: true, isDev: false, orders };
}
