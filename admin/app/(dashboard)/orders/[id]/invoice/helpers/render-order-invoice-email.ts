import { InvoicePaymentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { buildInvoiceEmail, INVOICE_QR_CID } from "@/lib/invoices/build-invoice-email";
import { planInvoiceFromOrder } from "../../../helpers/plan-invoice-from-order";

/**
 * رسالةُ الفاتورة كما ستصل العميل — قبل الإصدار وبعده.
 *
 * تُبنى بنفس دالّة الإرسال (`buildInvoiceEmail`)، فما يراه السيلز هو الرسالةُ نفسُها
 * لا نسخةٌ تشبهها (خالد ١٨ سبتمبر ٢٠٢٦: «نفسها اللي هتترسل للعميل»).
 *
 * فرقان اثنان لا ثالثَ لهما، وكلاهما مذكورٌ للقارئ:
 *  - قبل الإصدار: رقمُ الفاتورة لم يُخصَّص بعد، فيُعرض بنصٍّ صريح لا برقمٍ مخترَع.
 *  - رمزُ الاستجابة يُرفَق في البريد بـ`cid:`، ولا يُعرض في المتصفّح إلّا كـ`data:` —
 *    فتُستبدل الإشارةُ ببايتات الصورة نفسِها، لا بصورةٍ أخرى.
 */
export type OrderInvoiceEmail =
  | { ok: true; html: string; subject: string; to: string; isTax: boolean; hasQr: boolean; issued: boolean }
  | { ok: false; error: string };

export async function renderOrderInvoiceEmail(orderId: string): Promise<OrderInvoiceEmail> {
  const order = await db.checkoutOrder.findUnique({ where: { id: orderId }, select: { invoiceId: true } });
  if (!order) return { ok: false, error: "الطلب غير موجود" };

  const invoice = order.invoiceId
    ? await db.invoice.findUnique({
        where: { id: order.invoiceId },
        select: {
          number: true, tierName: true, period: true, currency: true, amount: true, paymentStatus: true,
          issuedAt: true, subscriptionStart: true, subscriptionEnd: true, clientId: true, orderId: true,
          subtotalMinor: true, vatRateBp: true, vatMinor: true, totalMinor: true, paidMonths: true, bonusServiceMonths: true,
        },
      })
    : null;

  let source;
  if (invoice) {
    source = invoice;
  } else {
    const planned = await planInvoiceFromOrder(orderId);
    if (!planned.ok) return { ok: false, error: planned.error };
    const p = planned.plan;
    source = {
      // شرطةٌ لا جملة: الرقمُ يظهر في الموضوع وفي جسم الرسالة، فجملةٌ مكانه تشوّه السطرين.
      // وشارةُ «معاينة — لم تُرسَل» فوق الإطار تقول ما تقوله الجملة، مرّةً واحدة.
      number: "—",
      tierName: p.tierName,
      period: p.period,
      currency: p.currency,
      amount: p.totalMinor / 100,
      paymentStatus: InvoicePaymentStatus.PAID,
      issuedAt: new Date(),
      subscriptionStart: p.subscriptionStart,
      subscriptionEnd: p.subscriptionEnd,
      clientId: p.clientId,
      orderId: p.orderId,
      subtotalMinor: p.subtotalMinor,
      vatRateBp: p.vatRateBp,
      vatMinor: p.vatMinor,
      totalMinor: p.totalMinor,
      paidMonths: p.paidMonths,
      bonusServiceMonths: p.bonusServiceMonths,
    };
  }

  const built = await buildInvoiceEmail(source);
  if (!built.ok) return { ok: false, error: built.error };

  const html = built.qrPng
    ? built.content.html.split(`cid:${INVOICE_QR_CID}`).join(`data:image/png;base64,${built.qrPng.toString("base64")}`)
    : built.content.html;

  // `hasQr` منفصلٌ عن `isTax`: الفاتورةُ الضريبيّة بلا بيانات منشأةٍ تخرج بلا رمز، وشارةٌ
  // تقول «برمز ZATCA» وهو غائبٌ تكذب على من يقرؤها (خالد ١٨ سبتمبر ٢٠٢٦).
  return { ok: true, html, subject: built.content.subject, to: built.email, isTax: built.isTax, hasQr: !!built.qrPng, issued: !!invoice };
}
