import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * **مَن يؤكّد وصول حوالةٍ بنكيّة — الأدمن والمبيعات.**
 *
 * خالد (٢٠ سبتمبر ٢٠٢٦): فاتن (مندوبة مصر) فتحت الطلب فلم ترَ زرّ «وصل المبلغ» ولا
 * «إلغاء الطلب»، فظُنّ الأمرُ حجباً بحسب الدولة أو الـIP. والسببُ كان الدور:
 * `require-finance-admin.ts:19` يشترط `role === "ADMIN"` فيردّ `SALES`.
 *
 * ── ولماذا حارسٌ ثانٍ لا إضافةُ SALES إلى الأوّل ──
 * `requireFinanceAdmin` يحرس ثلاثةَ أبوابٍ معاً: تأكيدُ الحوالة · **الأسعار والباقات** ·
 * **تسجيلُ الاسترداد**. فإضافةُ `SALES` إليه تفتح التسعيرَ والاستردادَ لأجل زرٍّ واحد —
 * وهو عينُ ما يُراد تفاديه: صلاحيّةٌ تُمنح لحاجةٍ فتحمل معها ما لم يُطلب.
 *
 * ── وحدودُ هذا الحارس ──
 * تأكيدُ الحوالة **إقرارٌ بما حدث في البنك**، وهو شغلُ مَن يتابع المشتري ويرى الإيصال —
 * أي المندوب. أمّا تغييرُ سعرٍ أو إخراجُ مالٍ من الإيراد فقرارٌ آخر يبقى للأدمن.
 *
 * وكلاهما يُقيَّد بسجلّ التدقيق: الفعلُ يكتب `confirmedByUserId`، فيُعرف مَن أقرّ ومتى.
 */
const ALLOWED = ["ADMIN", "SALES"] as const;

type TransferGate = { status: "ok" } | { status: "unauthenticated" } | { status: "forbidden" };

export async function checkTransferConfirm(): Promise<TransferGate> {
  const session = await auth().catch(() => null);
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) return { status: "unauthenticated" };

  const staff = await db.staff.findUnique({ where: { id }, select: { role: true, isActive: true } });
  if (!staff || staff.isActive === false) return { status: "forbidden" };
  if (!ALLOWED.includes(staff.role as (typeof ALLOWED)[number])) return { status: "forbidden" };
  return { status: "ok" };
}

export async function requireTransferConfirm(): Promise<void> {
  const gate = await checkTransferConfirm();
  if (gate.status === "unauthenticated") throw new Error("غير مصرح");
  if (gate.status === "forbidden") throw new Error("تأكيد الحوالات لمدير النظام أو مندوب المبيعات");
}
