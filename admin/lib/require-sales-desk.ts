import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * **مكتبُ المبيعات — الأدمن والمبيعات معاً.**
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
 * ── ما يحرسه ──
 * تأكيدُ الحوالة · إلغاءُ طلبٍ لم يصل فيه مال · إصدارُ الفاتورة · إرسالُها. وجامعُها أنّها
 * **متابعةُ صفقةٍ مع مشترٍ بعينه** — شغلُ مَن يكلّمه ويرى إيصاله.
 *
 * ── وما لا يحرسه ──
 * الأسعارُ والباقات · **تسجيلُ الاسترداد** · تعديلُ الطلب. تلك قراراتٌ تغيّر الإيراد أو
 * تسعيرَ المنصّة كلِّها، وتبقى لـ`requireFinanceAdmin` — أي مديرِ النظام وحده
 * (خالد ٢٠ سبتمبر ٢٠٢٦: «نفس اللي عملناه أوّل، الاسترداد بس للأدمن»).
 *
 * وكلاهما يُقيَّد بسجلّ التدقيق: الفعلُ يكتب `confirmedByUserId`، فيُعرف مَن أقرّ ومتى.
 */
const ALLOWED = ["ADMIN", "SALES"] as const;

type SalesDeskGate = { status: "ok" } | { status: "unauthenticated" } | { status: "forbidden" };

export async function checkSalesDesk(): Promise<SalesDeskGate> {
  const session = await auth().catch(() => null);
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) return { status: "unauthenticated" };

  const staff = await db.staff.findUnique({ where: { id }, select: { role: true, isActive: true } });
  if (!staff || staff.isActive === false) return { status: "forbidden" };
  if (!ALLOWED.includes(staff.role as (typeof ALLOWED)[number])) return { status: "forbidden" };
  return { status: "ok" };
}

export async function requireSalesDesk(): Promise<void> {
  const gate = await checkSalesDesk();
  if (gate.status === "unauthenticated") throw new Error("غير مصرح");
  if (gate.status === "forbidden") throw new Error("هذا الإجراء لمدير النظام أو مندوب المبيعات");
}
