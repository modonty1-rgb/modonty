"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit/log-action";
import { sendEmailWithRetry, type SendEmailParams } from "@/lib/email/resend-client";
import { buildInvoiceEmail, INVOICE_QR_CID } from "@/lib/invoices/build-invoice-email";
import { requireSalesDesk } from "@/lib/require-sales-desk";

interface SendInvoiceResult {
  ok: boolean;
  error?: string;
}

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
  /**
   * **حارسُ دورٍ لا مجرّدُ جلسة** (خالد ٢٠ سبتمبر ٢٠٢٦).
   *
   * كان الشرطُ `if (!session?.user)` وحده — أي **أيّ موظّفٍ مسجَّل**: كاتبٌ أو مصمّم.
   * وزرُّ الإرسال كان محروساً بـ`isFinanceAdmin` في الشاشة، لكنّ السيرفر أكشن نقطةُ
   * HTTP عامّة: الزرُّ المخفيُّ ليس حارساً، والفعلُ يُنادى بلا زرّ.
   */
  await requireSalesDesk();
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

  // البناءُ مشتركٌ مع المعاينة (`build-invoice-email.ts`): ما يراه السيلز قبل الإرسال
  // هو هذه الرسالةُ نفسُها لا رسمٌ يشبهها (خالد ١٨ سبتمبر ٢٠٢٦).
  const built = await buildInvoiceEmail({
    number: invoice.number,
    tierName: invoice.tierName,
    period: invoice.period,
    currency: invoice.currency,
    amount: invoice.amount,
    paymentStatus: invoice.paymentStatus,
    issuedAt: invoice.issuedAt,
    subscriptionStart: invoice.subscriptionStart,
    subscriptionEnd: invoice.subscriptionEnd,
    clientId: invoice.clientId,
    orderId: invoice.orderId,
    subtotalMinor: invoice.subtotalMinor,
    vatRateBp: invoice.vatRateBp,
    vatMinor: invoice.vatMinor,
    totalMinor: invoice.totalMinor,
    paidMonths: invoice.paidMonths,
    bonusServiceMonths: invoice.bonusServiceMonths,
  });
  if (!built.ok) return { ok: false, error: built.error };
  const { isTax } = built;
  const attachments: NonNullable<SendEmailParams["attachments"]> = built.qrPng
    ? [{ filename: `${invoice.number}-qr.png`, content: built.qrPng.toString("base64"), contentType: "image/png", contentId: INVOICE_QR_CID }]
    : [];

  try {
    // Legal registry: printed in the footer by the shared baseTemplate (reads Settings itself).
    const tpl = built.content;

    await sendEmailWithRetry({
      from: process.env.RESEND_FROM?.trim() || "Modonty <modonty@modonty.com>",
      to: built.email,
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
