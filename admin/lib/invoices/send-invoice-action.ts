"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit/log-action";
import { sendEmailWithRetry, type SendEmailParams } from "@/lib/email/resend-client";
import { invoiceEmail, type InvoiceEmailParams } from "@/lib/email/templates/invoice";
import { renderInvoiceQrPng } from "@/lib/invoices/render-invoice-qr";
import { buildZatcaQrTlvBase64 } from "@modonty/shared/lib/payments/zatca-qr-tlv";

interface SendInvoiceResult {
  ok: boolean;
  error?: string;
}

const QR_CID = "zatca-qr";

/**
 * Email an invoice to the client (issue and send are decoupled). Lives under admin/lib
 * because two routes call it: the client account ledger and the order detail page.
 *
 * PAY-E5: an invoice that carries the tax detail (born from a checkout order) goes out as
 * a STANDARD tax invoice — seller registry from Settings, buyer legal identity from the
 * client, net/VAT/total from the invoice's own snapshot, and the ZATCA Phase-1 QR inline.
 * It refuses to send a tax invoice without the seller's VAT number: a «tax invoice» with
 * no seller VAT is an invalid document, not a cosmetic gap. Legacy invoices (no tax
 * fields) keep the receipt layout unchanged.
 */
export async function sendInvoiceAction(invoiceId: string): Promise<SendInvoiceResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };
  if (!invoiceId) return { ok: false, error: "الفاتورة مطلوبة" };

  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    select: {
      id: true, clientId: true, number: true, tierName: true, period: true, currency: true, amount: true,
      paymentStatus: true, issuedAt: true, subscriptionStart: true, subscriptionEnd: true,
      orderId: true, subtotalMinor: true, vatRateBp: true, vatMinor: true, totalMinor: true, paidMonths: true, bonusServiceMonths: true,
      client: { select: { name: true, email: true, legalName: true, vatID: true, addressStreet: true, addressCity: true, addressCountry: true } },
    },
  });
  if (!invoice) return { ok: false, error: "الفاتورة غير موجودة" };
  if (!invoice.client.email) return { ok: false, error: "لا يوجد إيميل لهذا العميل" };

  const currency = invoice.currency === "EGP" ? "EGP" : "SAR";
  const isTax = invoice.subtotalMinor != null && invoice.vatMinor != null && invoice.vatRateBp != null && invoice.totalMinor != null && invoice.paidMonths != null;

  const params: InvoiceEmailParams = {
    clientName: invoice.client.name,
    email: invoice.client.email,
    invoiceNumber: invoice.number,
    tierName: invoice.tierName,
    periodLabel: invoice.period === "monthly" ? "شهري" : "سنوي",
    amount: invoice.amount,
    currency,
    paymentStatus: invoice.paymentStatus === "PAID" ? "PAID" : "DUE",
    issuedAt: invoice.issuedAt,
    subscriptionStart: invoice.subscriptionStart,
    subscriptionEnd: invoice.subscriptionEnd,
  };
  const attachments: NonNullable<SendEmailParams["attachments"]> = [];

  if (isTax) {
    const [settings, order] = await Promise.all([
      db.settings.findUnique({
        where: { singletonKey: "global" },
        select: { orgLegalName: true, orgVatNumber: true, orgCommercialRegistrationNumber: true, orgStreetAddress: true, orgAddressNeighborhood: true, orgAddressLocality: true, orgAddressCountry: true },
      }),
      invoice.orderId ? db.checkoutOrder.findUnique({ where: { id: invoice.orderId }, select: { number: true, planCommitments: true } }) : Promise.resolve(null),
    ]);
    const sellerVat = settings?.orgVatNumber?.trim();
    const sellerName = settings?.orgLegalName?.trim();
    if (!sellerVat || !sellerName) return { ok: false, error: "أدخل الاسم النظامي والرقم الضريبي في بيانات المنشأة قبل إرسال فاتورة ضريبية" };

    const t = (v: string | null | undefined) => v?.trim() || null;
    const total = invoice.totalMinor! / 100;
    const vat = invoice.vatMinor! / 100;
    params.tax = { subtotal: invoice.subtotalMinor! / 100, vatRateBp: invoice.vatRateBp!, vat, total, paidMonths: invoice.paidMonths!, bonusServiceMonths: invoice.bonusServiceMonths ?? 0, orderNumber: order?.number ?? null };
    params.seller = {
      legalName: sellerName,
      vatNumber: sellerVat,
      crNumber: t(settings?.orgCommercialRegistrationNumber),
      address: [t(settings?.orgAddressCountry), t(settings?.orgAddressLocality), t(settings?.orgAddressNeighborhood), t(settings?.orgStreetAddress)].filter(Boolean).join(" — ") || null,
    };
    params.buyer = {
      legalName: t(invoice.client.legalName) ?? invoice.client.name,
      vatNumber: t(invoice.client.vatID),
      address: [t(invoice.client.addressCountry), t(invoice.client.addressCity), t(invoice.client.addressStreet)].filter(Boolean).join(" — ") || null,
    };
    // من لقطة الطلب لا من الكتالوج: الباقة تتغيّر، والفاتورة تقول ما اتُّفق عليه يومها.
    params.commitments = order?.planCommitments ?? [];
    params.qrCid = QR_CID;
    const png = await renderInvoiceQrPng(buildZatcaQrTlvBase64({ sellerName, vatNumber: sellerVat, timestamp: invoice.issuedAt, totalWithVat: total, vatTotal: vat }));
    attachments.push({ filename: `${invoice.number}-qr.png`, content: png.toString("base64"), contentType: "image/png", contentId: QR_CID });
  }

  try {
    // Legal registry: printed in the footer by the shared baseTemplate (reads Settings itself).
    const tpl = await invoiceEmail(params);

    await sendEmailWithRetry({
      from: process.env.RESEND_FROM?.trim() || "Modonty <modonty@modonty.com>",
      to: invoice.client.email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
      attachments: attachments.length ? attachments : undefined,
      tags: [
        { name: "emailType", value: isTax ? "tax-invoice" : "invoice" },
        { name: "invoiceNumber", value: invoice.number },
      ],
    });

    await db.invoice.update({ where: { id: invoice.id }, data: { emailSentAt: new Date() } });

    await logAction("invoice.send", {
      entity: "Invoice",
      entityId: invoice.id,
      summary: `${invoice.number} · ${invoice.client.name ?? invoice.clientId}`,
      metadata: { taxInvoice: isTax },
    });

    revalidatePath(`/clients/${invoice.clientId}/account`);
    return { ok: true };
  } catch (e) {
    console.error("[sendInvoice] failed:", e);
    return { ok: false, error: e instanceof Error ? e.message : "فشل إرسال الإيميل" };
  }
}
