import { db } from "@/lib/db";
import { invoiceEmail, type InvoiceEmailParams } from "@/lib/email/templates/invoice";
import { renderInvoiceQrPng } from "@/lib/invoices/render-invoice-qr";
import { buildZatcaQrTlvBase64 } from "@modonty/shared/lib/payments/zatca-qr-tlv";
import type { EmailContent } from "@modonty/shared/lib/email";

export const INVOICE_QR_CID = "zatca-qr";

/**
 * بناءُ رسالة الفاتورة — مصدرٌ واحد للإرسال وللمعاينة.
 *
 * خالد (١٨ سبتمبر ٢٠٢٦): «أبغى الإصدار يستخدم نفس التمبلت اللي بنرسل فيه الفاتورة،
 * عشان السيلز يشوف بالضبط نفس اللي هيترسل للعميل». فالمعاينةُ ليست رسماً يشبه الرسالة —
 * هي الرسالةُ نفسُها مولَّدةً بنفس الدالّة. ولو بُنيت في مكانين لانحرف أحدهما بأوّل تعديل.
 *
 * والمصدرُ لقطةٌ من الفاتورة (أو من خطّة إصدارها قبل أن تُكتب)، لا من الكتالوج الحيّ.
 */
export interface InvoiceEmailSource {
  number: string;
  tierName: string;
  period: string;
  currency: string;
  amount: number;
  paymentStatus: string;
  issuedAt: Date;
  subscriptionStart: Date | null;
  subscriptionEnd: Date | null;
  clientId: string;
  orderId: string | null;
  subtotalMinor: number | null;
  vatRateBp: number | null;
  vatMinor: number | null;
  totalMinor: number | null;
  paidMonths: number | null;
  bonusServiceMonths: number | null;
}

export type BuiltInvoiceEmail =
  | { ok: true; content: EmailContent; email: string; isTax: boolean; qrPng: Buffer | null }
  | { ok: false; error: string };

export async function buildInvoiceEmail(src: InvoiceEmailSource): Promise<BuiltInvoiceEmail> {
  const [client, contact] = await Promise.all([
    db.client.findUnique({
      where: { id: src.clientId },
      select: { name: true, email: true, legalName: true, vatID: true, addressStreet: true, addressCity: true, addressCountry: true },
    }),
    // تواصلُ المبيعات من الإعدادات — وفارغاً يرجع لتواصل المنشأة، فلا تخرج فاتورةٌ بلا
    // جهةٍ تُسأل (خالد ١٨ سبتمبر ٢٠٢٦). وكان مكتوباً بنصّه في القالب.
    db.settings.findUnique({
      where: { singletonKey: "global" },
      select: { salesPhone: true, salesEmail: true, orgContactTelephone: true, orgContactEmail: true },
    }),
  ]);
  if (!client) return { ok: false, error: "العميل غير موجود" };
  if (!client.email) return { ok: false, error: "لا يوجد إيميل لهذا العميل" };

  const currency = src.currency === "EGP" ? "EGP" : "SAR";
  /**
   * الفاتورةُ الضريبيّة للسوق السعوديّ وحده (خالد ١٨ سبتمبر ٢٠٢٦: «الطلبات السعوديّة
   * حنُنزّل فيها الفواتير الضريبيّة، المصريّة حاليّاً لا ما نحتاجها»).
   *
   * ونظامُ الفوترة الإلكترونيّة الذي يفرض الشكلَ — الرقمُ الضريبيّ للبائع والمشتري ورمزُ
   * الاستجابة — هو نظامُ هيئة الزكاة والضريبة والجمارك السعوديّة، ولا ولايةَ له على بيعٍ
   * في مصر. فكانت الفاتورةُ المصريّة تخرج بعنوان «فاتورة ضريبية» وتطلب رقماً ضريبيّاً
   * سعوديّاً وضريبتُها صفر — مستندٌ يقول ما ليس فيه.
   *
   * والعملةُ هي السوق بالبناء: `SA → SAR` و`EG → EGP` يكتبهما مسارُ الدفع معاً، ولا
   * طلبَ يخالفهما. فالمصريُّ يأخذ إيصالاً واضحاً، والسعوديُّ مستنداً نظاميّاً كاملاً.
   */
  const isTax =
    currency === "SAR" &&
    src.subtotalMinor != null && src.vatMinor != null && src.vatRateBp != null && src.totalMinor != null && src.paidMonths != null;

  const params: InvoiceEmailParams = {
    clientName: client.name,
    email: client.email,
    invoiceNumber: src.number,
    tierName: src.tierName,
    periodLabel: src.period === "monthly" ? "شهري" : "سنوي",
    amount: src.amount,
    currency,
    paymentStatus: src.paymentStatus === "PAID" ? "PAID" : "DUE",
    issuedAt: src.issuedAt,
    subscriptionStart: src.subscriptionStart,
    subscriptionEnd: src.subscriptionEnd,
    salesPhone: contact?.salesPhone?.trim() || contact?.orgContactTelephone?.trim() || null,
    salesEmail: contact?.salesEmail?.trim() || contact?.orgContactEmail?.trim() || null,
  };

  let qrPng: Buffer | null = null;
  if (isTax) {
    const [settings, order] = await Promise.all([
      db.settings.findUnique({
        where: { singletonKey: "global" },
        select: { orgLegalName: true, orgVatNumber: true, orgCommercialRegistrationNumber: true, orgStreetAddress: true, orgAddressNeighborhood: true, orgAddressLocality: true, orgAddressCountry: true },
      }),
      src.orderId ? db.checkoutOrder.findUnique({ where: { id: src.orderId }, select: { number: true, planCommitments: true } }) : Promise.resolve(null),
    ]);
    const t = (v: string | null | undefined) => v?.trim() || null;
    /**
     * الأرقامُ الضريبيّة اختياريّة (خالد ١٨ سبتمبر ٢٠٢٦: «إذا في داتا تطلع، ما في داتا
     * ما تطلع — خليها اختياريّة مش إجباريّة»).
     *
     * كان الحارسُ يرفض الإرسالَ كلَّه بلا رقمٍ ضريبيّ للبائع، فيُحبَس عميلٌ دفع خلف
     * حقلٍ في الإعدادات — ومصرُ ضريبتُها صفر أصلاً ولا تخضع لهيئة الزكاة السعوديّة.
     * فالقالبُ يطبع ما وُجد ويسكت عمّا لم يوجد، ورمزُ الاستجابة يُولَّد حيث يصحّ فقط:
     * توليدُه بلا اسمٍ ورقمٍ يُنتج رمزاً لا يقرؤه تطبيقُ الهيئة — وصورةٌ كاذبة أسوأ من غيابها.
     */
    const sellerVat = t(settings?.orgVatNumber);
    const sellerName = t(settings?.orgLegalName);
    const total = src.totalMinor! / 100;
    const vat = src.vatMinor! / 100;
    params.tax = {
      subtotal: src.subtotalMinor! / 100,
      vatRateBp: src.vatRateBp!,
      vat,
      total,
      paidMonths: src.paidMonths!,
      bonusServiceMonths: src.bonusServiceMonths ?? 0,
      orderNumber: order?.number ?? null,
    };
    params.seller = {
      legalName: sellerName,
      vatNumber: sellerVat,
      crNumber: t(settings?.orgCommercialRegistrationNumber),
      address: [t(settings?.orgAddressCountry), t(settings?.orgAddressLocality), t(settings?.orgAddressNeighborhood), t(settings?.orgStreetAddress)].filter(Boolean).join(" — ") || null,
    };
    params.buyer = {
      legalName: t(client.legalName) ?? client.name,
      vatNumber: t(client.vatID),
      address: [t(client.addressCountry), t(client.addressCity), t(client.addressStreet)].filter(Boolean).join(" — ") || null,
    };
    // من لقطة الطلب لا من الكتالوج: الباقة تتغيّر، والفاتورة تقول ما اتُّفق عليه يومها.
    params.commitments = order?.planCommitments ?? [];
    if (sellerName && sellerVat) {
      params.qrCid = INVOICE_QR_CID;
      qrPng = await renderInvoiceQrPng(
        buildZatcaQrTlvBase64({ sellerName, vatNumber: sellerVat, timestamp: src.issuedAt, totalWithVat: total, vatTotal: vat }),
      );
    }
  }

  return { ok: true, content: await invoiceEmail(params), email: client.email, isTax, qrPng };
}
