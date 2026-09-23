"use server";


import { InvoicePaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";
import { addMonths } from "@/lib/invoices/add-months";
import { findBlockingUnpaidInvoice } from "@/lib/invoices/find-blocking-unpaid-invoice";
import { nextInvoiceNumber } from "@/lib/invoices/next-invoice-number";
import { recomputeSubscriptionEnd } from "@/lib/invoices/recompute-subscription-end";
import { setActiveOrder } from "@/lib/orders/resolve-active-order";
import { requireFinanceAdmin } from "@/lib/require-finance-admin";
import { requireSalesDesk } from "@/lib/require-sales-desk";
import { notifyPaymentReceived } from "@modonty/shared/lib/payments/notify-payment-received";
import { sendInvoiceAction } from "@/lib/invoices/send-invoice-action";
import { planInvoiceFromOrder, type InvoicePlanResult } from "./helpers/plan-invoice-from-order";

/**
 * Read-only name lookup for the breadcrumb (see breadcrumb-actions.ts), same unguarded
 * pattern as getCommercialPlanName — the order number isn't sensitive on its own.
 */
export async function getOrderNumber(id: string): Promise<string | null> {
  const order = await db.checkoutOrder.findUnique({ where: { id }, select: { number: true } });
  return order?.number ?? null;
}

const confirmTransferSchema = z.object({
  transferReference: z.string().trim().min(1, "مرجع التحويل مطلوب").max(80, "المرجع طويل جداً"),
  transferDate: z.coerce.date({ invalid_type_error: "تاريخ غير صحيح" }),
  // القناةُ التي وصل منها المال — يقرّرها من رأى وصوله. كانت تُكتب `BANK_TRANSFER` دائماً
  // فذابت إنستا باي في التحويل البنكيّ (خالد ١٨ سبتمبر ٢٠٢٦).
  channel: z.enum(["BANK_TRANSFER", "INSTAPAY"], { errorMap: () => ({ message: "اختر قناة التحويل: بنكي أو إنستا باي" }) }),
});

/**
 * PAY-Q12's mandatory guard for the Egypt manual-transfer path: ADMIN-only
 * (requireFinanceAdmin), a written reference + date, an audit row, and a conditional
 * update so the same order can never be confirmed twice — count === 0 means it was
 * already PAID (or never AWAITING_TRANSFER) and the caller sees why, not a false success.
 */
export async function confirmOrderPaymentAction(orderId: string, form: FormData): Promise<void> {
  // إقرارٌ بما حدث في البنك — يراه المندوبُ قبل غيره. (خالد ٢٠ سبتمبر ٢٠٢٦)
  await requireSalesDesk();

  const parsed = confirmTransferSchema.safeParse({
    transferReference: String(form.get("transferReference") ?? "").trim(),
    transferDate: String(form.get("transferDate") ?? ""),
    channel: String(form.get("channel") ?? ""),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "تحقّق من بيانات التحويل");

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) throw new Error("غير مصرح");

  const now = new Date();
  const { count } = await db.checkoutOrder.updateMany({
    where: { id: orderId, status: "AWAITING_TRANSFER" },
    data: {
      status: "PAID",
      paidAt: now,
      transferReference: parsed.data.transferReference,
      transferDate: parsed.data.transferDate,
      confirmedByUserId: userId,
      confirmedAt: now,
    },
  });
  if (count === 0) throw new Error("الطلب مؤكَّد مسبقاً أو ليس بانتظار تحويل");

  const order = await db.checkoutOrder.findUnique({ where: { id: orderId }, select: { number: true, totalMinor: true, currency: true, market: true, planName: true, paidMonths: true, bonusServiceMonths: true, buyerName: true, clientId: true } });
  if (order) {
    await db.paymentTransaction.create({
      data: { orderId, provider: parsed.data.channel, providerReference: parsed.data.transferReference, status: "SUCCESS", amountMinor: order.totalMinor, currency: order.currency, settledAt: now },
    });
    // A transfer only becomes the governing deal once the money is confirmed — an order
    // sitting in AWAITING_TRANSFER must never govern a client (MONEY-FLOW §4).
    if (order.clientId) await setActiveOrder(order.clientId, orderId);
  }

  await logAction("order.confirmPayment", {
    entity: "Order",
    entityId: orderId,
    summary: `تأكيد ${parsed.data.channel === "INSTAPAY" ? "إنستا باي" : "تحويل بنكي"} — مرجع ${parsed.data.transferReference}`,
  });

  // PAY-E7: the team hears about every arrival. Never fails the confirmation (no-op outside production).
  if (order) {
    const notice = await notifyPaymentReceived({ orderNumber: order.number, planName: order.planName, paidMonths: order.paidMonths, bonusServiceMonths: order.bonusServiceMonths, totalMinor: order.totalMinor, currency: order.currency, market: order.market, buyerName: order.buyerName, source: "manual-transfer" });
    if (!notice.success) console.warn("[order.confirmPayment] telegram:", notice.error);
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
}


/**
 * PAY-E6 / PAY-Q13: WhatsApp is a link a staff member clicks, not an API — the send itself
 * happens outside the system, so the only trace we can keep is WHO opened the ready
 * message for WHICH invoice. Any active staff member may send it (not money).
 */
export async function logInvoiceWhatsappAction(orderId: string): Promise<void> {
  const session = await auth();
  if (!(session?.user as { id?: string } | undefined)?.id) throw new Error("غير مصرح");
  const order = await db.checkoutOrder.findUnique({ where: { id: orderId }, select: { number: true, invoiceId: true } });
  if (!order?.invoiceId) throw new Error("لا فاتورة لهذا الطلب بعد");
  const invoice = await db.invoice.findUnique({ where: { id: order.invoiceId }, select: { number: true } });
  await logAction("invoice.whatsapp", { entity: "Invoice", entityId: order.invoiceId, summary: `${invoice?.number ?? order.invoiceId} · واتساب · من الطلب ${order.number}` });
}


/**
 * PAY-E4: every field comes from the order's own snapshot, never today's catalog —
 * changing a plan's price afterwards must not rewrite a past invoice. ADMIN-only
 * (money), one click, gapless numbering via the same Counter every other invoice uses.
 *
 * `period` is set "monthly" | "annual" (not the card's literal "{paidMonths}m") —
 * measured live: three consumers (sales-report, send-invoice, this account page's own
 * ledger row label) switch on exactly those two strings and silently read anything
 * else as "annual". A third format there is a defect, not a feature; paidMonths===1
 * is the same simplification PAY-E3 already made for the client form's billingCycle.
 */
/** المرحلةُ الأولى: ما ستحمله الفاتورة — بلا كتابة. */
export async function previewInvoiceFromOrderAction(orderId: string): Promise<InvoicePlanResult> {
  // معاينةُ الفاتورة جزءٌ من إصدارها — نفسُ الحارس (خالد ٢٠ سبتمبر ٢٠٢٦).
  await requireSalesDesk();
  return planInvoiceFromOrder(orderId);
}

/**
 * المرحلةُ الثانية: تُكتب الفاتورة.
 *
 * تُعيد حسابَ الخطّة عند الضغط لا تأخذها من الواجهة: النافذةُ قد تكون مفتوحةً منذ دقائق،
 * وزميلٌ آخر قد يكون أصدر فاتورةً أو غيّر الطلب بينهما. فالحُرّاس تُفحص على القيمة
 * المخزَّنة لا المعروضة — وهي نفسُها التي رُئيت، لأنّ المعاينة والإصدار حاسبٌ واحد.
 */
export async function createInvoiceFromOrderAction(orderId: string): Promise<{ ok: true; number: string } | { ok: false; error: string }> {
  // الفاتورةُ متابعةُ صفقةٍ مع مشترٍ بعينه — الأدمن والمبيعات (خالد ٢٠ سبتمبر ٢٠٢٦).
  await requireSalesDesk();
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return { ok: false, error: "غير مصرح" };

  const planned = await planInvoiceFromOrder(orderId);
  if (!planned.ok) return planned;
  const p = planned.plan;

  const number = await nextInvoiceNumber(new Date().getFullYear());
  const created = await db.invoice.create({
    data: {
      number,
      clientId: p.clientId,
      // `tier` لم يعد يُكتب — بلا قارئٍ واحد (مقيسٌ ١٧ سبتمبر).
      tierName: p.tierName,
      period: p.period,
      currency: p.currency,
      amount: p.totalMinor / 100,
      paymentStatus: InvoicePaymentStatus.PAID,
      paidAt: (await db.checkoutOrder.findUnique({ where: { id: orderId }, select: { paidAt: true } }))?.paidAt ?? null,
      subscriptionStart: p.subscriptionStart,
      subscriptionEnd: p.subscriptionEnd,
      issuedAt: new Date(),
      issuedByUserId: userId,
      orderId: p.orderId,
      subtotalMinor: p.subtotalMinor,
      vatRateBp: p.vatRateBp,
      vatMinor: p.vatMinor,
      totalMinor: p.totalMinor,
      paidMonths: p.paidMonths,
      bonusServiceMonths: p.bonusServiceMonths,
      fromOpeningBalance: p.foundingInvoice,
    },
    select: { id: true },
  });

  await db.checkoutOrder.update({ where: { id: orderId }, data: { invoiceId: created.id } });
  await recomputeSubscriptionEnd(p.clientId);

  await logAction("invoice.create", {
    entity: "Invoice",
    entityId: created.id,
    summary: `${number} · من الطلب ${p.orderNumber} · ${p.clientName}`,
    metadata: { orderId: p.orderId, totalMinor: p.totalMinor, paidMonths: p.paidMonths, bonusServiceMonths: p.bonusServiceMonths, fromOpeningBalance: p.foundingInvoice },
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath(`/clients/${p.clientId}/account`);
  revalidatePath("/");
  return { ok: true, number };
}

/**
 * إرسالُ فاتورةٍ صدرت — يُستدعى من صفحة الطلب لا من صفحة الفاتورة (خالد ١٨ سبتمبر ٢٠٢٦:
 * «صفحة الإصدار للإصدار بس، والإرسال من صفحة الأوردر عشان أعمل كنترول كامل»).
 * وبأثرٍ غير مُسقِط: الفاتورةُ مكتوبة، وفشلُ البريد لا يُلغيها.
 */
export async function sendInvoiceForOrderAction(orderId: string): Promise<{ ok: boolean; error?: string }> {
  /**
   * **الغلافُ كان أضيقَ من الفعل الذي يلفّه.**
   *
   * نُقل `sendInvoiceAction` في `lib/invoices/` إلى حارس مكتب المبيعات، وبقي هذا الغلافُ
   * على `requireFinanceAdmin` — وهو الذي يناديه زرُّ «إرسال الفاتورة بالإيميل» في صفحة
   * الطلب. فالزرُّ يظهر للمندوبة ثمّ يرفضها.
   *
   * مقيسٌ من سجلّ الأخطاء (`digest: 352758874`، ٢٠ سبتمبر ٢٠٢٦ ١٦:٥٢، القاهرة):
   * `POST /orders/6aafc1875f7a51f3f5b555c0 · action` ونصُّه «هذه الصفحة مخصصة لمدير
   * النظام فقط» — وهو نصُّ `requireFinanceAdmin` حرفيّاً. وحدُّ الخطأ ابتلعه فعرض
   * «تعذّر تحميل الطلب»، فبدا عطلاً في الصفحة لا رفضَ صلاحيّة.
   */
  await requireSalesDesk();
  const order = await db.checkoutOrder.findUnique({ where: { id: orderId }, select: { invoiceId: true } });
  if (!order?.invoiceId) return { ok: false, error: "لا فاتورة لهذا الطلب بعد" };
  const result = await sendInvoiceAction(order.invoiceId);
  revalidatePath(`/orders/${orderId}`);
  return result.ok ? { ok: true } : { ok: false, error: result.error ?? "فشل إرسال الفاتورة" };
}
