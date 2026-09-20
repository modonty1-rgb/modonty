"use server";

import { revalidatePath } from "next/cache";

import { recomputeSubscriptionEnd } from "@/lib/invoices/recompute-subscription-end";
import { z } from "zod";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";
import { requireSalesDesk } from "@/lib/require-sales-desk";

/**
 * تعديلُ طلبٍ قائم — مديرُ النظام وحده.
 *
 * وُجد لأنّ الترحيل بنى الطلباتِ من بياناتٍ متناقضة: `billingCycle` خالف المبلغَ في
 * ٢٣ من ٢٨ صفّاً، والتواريخُ خالفت الاثنين. فما خُمّنت المدّة — وُسمت، وتُصحَّح هنا بيدٍ
 * تعرف الحقيقة (خالد ١٧ سبتمبر ٢٠٢٦: «الأدمن اللي يقدر يعدّل»).
 *
 * ولا تُلمس الحالةُ ولا الرقمُ ولا العميل: الحالةُ تتغيّر بأفعالها (تأكيد التحويل ·
 * التفعيل)، والرقمُ مرجعٌ خارجيّ يُطبع على الفواتير، والعميلُ هو هويّةُ الطلب نفسها.
 *
 * وكلُّ تعديلٍ يُسجَّل بما تغيّر حقلاً حقلاً — طلبٌ ماليٌّ يُعدَّل بلا أثرٍ هو طلبٌ
 * لا يُوثَق به.
 */

const schema = z.object({
  orderId: z.string().min(1),
  planName: z.string().trim().min(1, "اسم الباقة مطلوب").max(60),
  planSlug: z.string().trim().min(1, "سلَق الباقة مطلوب").max(60),
  articlesPerMonth: z.coerce.number().int().min(0).max(200).nullable(),
  market: z.enum(["SA", "EG"]),
  currency: z.enum(["SAR", "EGP"]),
  /** بالوحدة الكبرى كما يكتبها المحاسب — تُحوَّل للأصغر عند الحفظ. */
  total: z.coerce.number().min(0).max(10_000_000),
  paidMonths: z.coerce.number().int().min(1).max(60),
  bonusServiceMonths: z.coerce.number().int().min(0).max(24),
  vatRateBp: z.coerce.number().int().min(0).max(10_000),
  serviceStartedAt: z.string().trim().optional(),
  activatedAt: z.string().trim().optional(),
  paidAt: z.string().trim().optional(),
  notes: z.string().trim().max(1000).optional(),
});

/** حقلُ تاريخٍ فارغ يعني «لا تاريخ»، لا «اليوم». */
function toDate(v: string | undefined): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * يومٌ واحد؟ — يُقارَن اليومُ لا اللحظة.
 *
 * القاعدةُ تخزّن `DateTime` كاملاً، وحقلُ `date` في المتصفّح يرسل `YYYY-MM-DD` وحدها
 * فتُقرأ منتصفَ الليل. فبلا هذه المقارنة يُسجَّل «٢٠٢٦-٠٦-١٦ ← ٢٠٢٦-٠٦-١٦» تغييراً،
 * ويُبتر وقتُ القيمة الأصليّة بلا سبب. القاعدة: ما لم يتغيّر يومُه يبقى كما هو بلحظته.
 */
function sameDay(a: Date | null, b: Date | null): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

/** يُبقي القيمةَ الأصليّة بلحظتها ما دام اليومُ واحداً. */
function keepIfSameDay(incoming: Date | null, existing: Date | null | undefined): Date | null {
  return sameDay(incoming, existing ?? null) ? (existing ?? null) : incoming;
}

const LABEL: Record<string, string> = {
  planName: "الباقة",
  planSlug: "سلَق الباقة",
  articlesPerMonth: "الحصّة الشهريّة",
  market: "السوق",
  currency: "العملة",
  totalMinor: "المبلغ",
  paidMonths: "الشهور المدفوعة",
  bonusServiceMonths: "شهور الهدية",
  vatRateBp: "نسبة الضريبة",
  subtotalMinor: "المبلغ قبل الضريبة",
  vatMinor: "قيمة الضريبة",
  monthlyBaseMinor: "السعر الشهريّ",
  serviceStartedAt: "بداية الخدمة",
  activatedAt: "يوم التفعيل",
  paidAt: "يوم الدفع",
  notes: "الملاحظة",
};

function show(v: unknown): string {
  if (v == null || v === "") return "—";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

export async function updateOrderAction(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  await requireSalesDesk();

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }
  const d = parsed.data;

  const before = await db.checkoutOrder.findUnique({
    where: { id: d.orderId },
    select: {
      number: true, planName: true, planSlug: true, articlesPerMonth: true,
      market: true, currency: true, totalMinor: true, paidMonths: true,
      bonusServiceMonths: true, vatRateBp: true, subtotalMinor: true, vatMinor: true,
      monthlyBaseMinor: true, serviceStartedAt: true, activatedAt: true, paidAt: true, notes: true,
    },
  });
  if (!before) return { ok: false, error: "الطلب غير موجود" };

  /**
   * الضريبةُ تُشتقّ من الإجمالي، لا تُجمع فوقه.
   *
   * `totalMinor` هو ما يدفعه المشتري شاملاً الضريبة (PAY-Q7)، فالمحاسب يكتب المبلغ
   * المحصَّل كما هو، والنسبةَ إن عُرفت — ويُفكّ الاثنان هنا. جمعُ الضريبة فوق الإجمالي
   * يجعل الطلبَ يقول رقماً لم يُحصَّل.
   */
  const totalMinor = Math.round(d.total * 100);
  const vatMinor = d.vatRateBp > 0 ? Math.round(totalMinor - totalMinor / (1 + d.vatRateBp / 10_000)) : 0;
  const subtotalMinor = totalMinor - vatMinor;
  const monthlyBaseMinor = d.paidMonths > 0 ? Math.round(totalMinor / d.paidMonths) : totalMinor;

  const next = {
    planName: d.planName,
    planSlug: d.planSlug,
    articlesPerMonth: d.articlesPerMonth,
    market: d.market,
    currency: d.currency,
    country: d.market,
    totalMinor,
    subtotalMinor,
    vatMinor,
    vatRateBp: d.vatRateBp,
    monthlyBaseMinor,
    paidMonths: d.paidMonths,
    bonusServiceMonths: d.bonusServiceMonths,
    serviceStartedAt: keepIfSameDay(toDate(d.serviceStartedAt), before.serviceStartedAt),
    activatedAt: keepIfSameDay(toDate(d.activatedAt), before.activatedAt),
    paidAt: keepIfSameDay(toDate(d.paidAt), before.paidAt),
    notes: d.notes || null,
  };

  // ما تغيّر فعلاً — لا كلُّ حقلٍ أُرسل. سجلٌّ يقول «عُدّل» بلا فرقٍ هو ضجيج.
  const changes: string[] = [];
  for (const [key, value] of Object.entries(next)) {
    if (key === "country") continue; // يتبع السوق، لا يُذكر مرّتين
    const old = (before as Record<string, unknown>)[key];
    const same =
      old instanceof Date && value instanceof Date
        ? old.getTime() === value.getTime()
        : (old ?? null) === (value ?? null);
    if (!same) changes.push(`${LABEL[key] ?? key}: ${show(old)} ← ${show(value)}`);
  }

  if (changes.length === 0) return { ok: true };

  await db.checkoutOrder.update({ where: { id: d.orderId }, data: next });

  /**
   * **والحصّةُ تُنقل إلى الكرت متى كان هذا هو الطلبَ الساري.**
   *
   * `Client.articlesPerMonth` نسخةُ عرضٍ من الطلب، وكان كاتبُها **واحداً**: زرّ التفعيل
   * (`lib/orders/activate-from-order.ts:163`). فتعديلُ حصّةِ طلبٍ مفعَّلٍ كان يغيّر الطلبَ
   * ولا يمسّ الكرت — مقيسٌ حيّاً (١٩ سبتمبر ٢٠٢٦): رُفعت حصّةُ «حلويات النيل» إلى ٢٠ فصار
   * الطلب يقول «٢٠/شهر × ٧ = ١٤٠» بينما عمود «This Month» في قائمة العملاء باقٍ على
   * <code>0/8</code>. والعمودُ هو ما يُقاس عليه التسليم، فكان يحاسب فريقَ المحتوى على حصّةٍ
   * لم تعد هي المتّفق عليها.
   *
   * والشرطُ `activeOrderId` ليس تجميلاً: العميل له طلباتٌ قديمةٌ في سجلّه بأسعارها وحصصها،
   * وتصحيحُ رقمٍ في طلب السنة الماضية يجب ألّا يمسّ ما يحكمه اليوم.
   */
  /**
   * **وتغيُّرُ المدّة يعيد حسابَ نهاية الاشتراك.**
   *
   * `Client.subscriptionEndDate` مشتقٌّ من (يوم التفعيل + الشهور + الهديّة) لأبعد طلبٍ
   * مدفوع، وتقرؤه شرائحُ المال وسيجمنتاتُها وكونسولُ العميل. فتصحيحُ «الشهور المدفوعة»
   * أو يومِ التفعيل على الطلب كان يترك تلك الشاشات على تاريخٍ سابق.
   */
  const termChanged =
    next.paidMonths !== before.paidMonths ||
    next.bonusServiceMonths !== before.bonusServiceMonths ||
    (next.activatedAt?.getTime() ?? null) !== (before.activatedAt?.getTime() ?? null);

  if (termChanged) {
    const owner = await db.checkoutOrder.findUnique({ where: { id: d.orderId }, select: { clientId: true } });
    if (owner?.clientId) {
      await recomputeSubscriptionEnd(owner.clientId);
      revalidatePath("/clients");
    }
  }

  if (next.articlesPerMonth !== before.articlesPerMonth) {
    const { count } = await db.client.updateMany({
      where: { activeOrderId: d.orderId },
      data: { articlesPerMonth: next.articlesPerMonth },
    });
    if (count > 0) revalidatePath("/clients");
  }

  await logAction("order.update", {
    entity: "Order",
    entityId: d.orderId,
    summary: `تعديل ${before.number} — ${changes.join(" · ")}`,
  });

  revalidatePath(`/orders/${d.orderId}`);
  revalidatePath(`/orders/${d.orderId}/edit`);
  revalidatePath("/orders");
  return { ok: true };
}
