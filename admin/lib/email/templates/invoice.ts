import { baseTemplate, badge, divider, heading, paragraph } from "@modonty/shared/lib/email";
import type { EmailContent } from "@modonty/shared/lib/email";

/**
 * The legal registry is no longer a parameter here: the shared `baseTemplate` reads
 * `Settings.org*` itself and prints it in the footer of EVERY email, this one included
 * (MAILREV, 23 Aug). The invoice body carries the invoice; the footer carries the company.
 *
 * PAY-E5 (Khalid, 11 Sep 2026): an invoice born from a checkout order is a STANDARD tax
 * invoice document — seller legal name/VAT/address, buyer legal name/VAT when known, one
 * line item (plan × months), net + 15% VAT + total, issue date AND time, and the ZATCA
 * Phase-1 QR (tags 1–5, TLV/Base64) attached inline. Older invoices have none of those
 * fields and keep the plain receipt layout below — one template, two shapes, decided by
 * whether `tax` is present.
 */
export interface InvoiceTaxDetail {
  /** Major units. */
  subtotal: number;
  vatRateBp: number;
  vat: number;
  total: number;
  paidMonths: number;
  bonusServiceMonths: number;
  orderNumber: string | null;
}

export interface InvoiceParty {
  legalName: string | null;
  vatNumber: string | null;
  crNumber?: string | null;
  address: string | null;
}

export interface InvoiceEmailParams {
  clientName: string;
  email: string;
  invoiceNumber: string;
  tierName: string;
  periodLabel: string; // "شهري" | "سنوي" — legacy invoices only; tax invoices print the real duration
  amount: number;
  currency: "SAR" | "EGP";
  paymentMethodLabel?: string;
  paymentStatus: "PAID" | "DUE";
  issuedAt: Date;
  subscriptionStart?: Date | null;
  subscriptionEnd?: Date | null;
  /** Present only for order-born invoices — switches the layout to the tax invoice. */
  tax?: InvoiceTaxDetail;
  seller?: InvoiceParty;
  buyer?: InvoiceParty;
  /** Content-ID of the attached QR PNG (<img src="cid:…">). */
  qrCid?: string;
}

/** Arabic month names, Arabic digits — an `en-GB` date inside an RTL cell read backwards. */
const dateFmt = new Intl.DateTimeFormat("ar-SA", { year: "numeric", month: "long", day: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("ar-SA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Riyadh" });

function money(amount: number, currency: "SAR" | "EGP", fraction = 0): string {
  return new Intl.NumberFormat(currency === "SAR" ? "ar-SA" : "ar-EG", {
    style: "currency",
    currency,
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction,
  }).format(amount);
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:9px 12px;font-size:13px;color:#5b5b5b;border-bottom:1px solid #f0f0f0;">${label}</td>
    <td style="padding:9px 12px;font-size:13px;color:#0E065A;font-weight:bold;text-align:left;border-bottom:1px solid #f0f0f0;">${value}</td>
  </tr>`;
}

function partyBlock(title: string, p: InvoiceParty, fallbackName: string): string {
  const lines = [
    `<strong style="color:#0E065A;">${p.legalName || fallbackName}</strong>`,
    p.vatNumber ? `الرقم الضريبي: ${p.vatNumber}` : null,
    p.crNumber ? `السجل التجاري: ${p.crNumber}` : null,
    p.address || null,
  ].filter(Boolean);
  return `<td valign="top" style="width:50%;padding:10px 12px;font-size:12.5px;line-height:1.7;color:#333;">
    <div style="font-size:11px;color:#8a8a8a;margin-bottom:4px;">${title}</div>${lines.join("<br/>")}
  </td>`;
}

function durationLabel(t: InvoiceTaxDetail): string {
  const paid = `${t.paidMonths} ${t.paidMonths === 1 ? "شهر" : "أشهر"}`;
  return t.bonusServiceMonths ? `${paid} + ${t.bonusServiceMonths} ${t.bonusServiceMonths === 1 ? "شهر هدية" : "أشهر هدية"}` : paid;
}

export async function invoiceEmail(p: InvoiceEmailParams): Promise<EmailContent> {
  const paid = p.paymentStatus === "PAID";
  const statusBadge = paid ? badge("مدفوعة", "#10b981") : badge("مستحقّة", "#f59e0b");
  const isTax = Boolean(p.tax);
  const t = p.tax;
  const vatPct = t ? `${t.vatRateBp / 100}٪` : "";

  const partiesTable = p.seller || p.buyer ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f9;border:1px solid #ededed;border-radius:6px;margin:14px 0;">
      <tr>
        ${p.seller ? partyBlock("البائع", p.seller, "مُدَوَّنَتِي") : ""}
        ${p.buyer ? partyBlock("المشتري", p.buyer, p.clientName) : ""}
      </tr>
    </table>` : "";

  const lineItems = t ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ededed;border-radius:6px;margin:14px 0;font-size:13px;">
      <tr style="background-color:#f3f3f8;">
        <td style="padding:8px 12px;color:#5b5b5b;">البند</td>
        <td style="padding:8px 12px;color:#5b5b5b;text-align:left;">الكمية</td>
        <td style="padding:8px 12px;color:#5b5b5b;text-align:left;">المبلغ قبل الضريبة</td>
      </tr>
      <tr>
        <td style="padding:10px 12px;color:#0E065A;font-weight:bold;">اشتراك باقة «${p.tierName}» — ${durationLabel(t)}</td>
        <td style="padding:10px 12px;text-align:left;">1</td>
        <td style="padding:10px 12px;text-align:left;">${money(t.subtotal, p.currency, 2)}</td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;">
      ${detailRow("الصافي قبل الضريبة", money(t.subtotal, p.currency, 2))}
      ${detailRow(`ضريبة القيمة المضافة (${vatPct})`, money(t.vat, p.currency, 2))}
    </table>` : "";

  const qrBlock = p.qrCid ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 0;">
      <tr>
        <td style="text-align:center;">
          <img src="cid:${p.qrCid}" width="150" height="150" alt="رمز QR للفاتورة الضريبية" style="display:inline-block;width:150px;height:150px;border:1px solid #ededed;border-radius:6px;padding:6px;background:#fff;" />
          <div style="font-size:11px;color:#8a8a8a;margin-top:4px;">رمز الفاتورة الضريبية — يُقرأ بتطبيق الهيئة</div>
        </td>
      </tr>
    </table>` : "";

  const content = `
    ${heading(isTax ? `فاتورة ضريبية ${p.invoiceNumber}` : `فاتورة ${p.invoiceNumber}`)}
    ${paragraph(`مرحباً ${p.clientName}، هذه ${isTax ? "الفاتورة الضريبية" : "فاتورة"} اشتراكك في مُدَوَّنَتِي.`)}
    ${partiesTable}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f9;border:1px solid #ededed;border-radius:6px;margin:18px 0;">
      ${detailRow("رقم الفاتورة", p.invoiceNumber)}
      ${t?.orderNumber ? detailRow("رقم الطلب", t.orderNumber) : ""}
      ${isTax ? detailRow("تاريخ ووقت الإصدار", dateTimeFmt.format(p.issuedAt)) : detailRow(paid ? "تاريخ الدفع" : "تاريخ الإصدار", dateFmt.format(p.issuedAt))}
      ${!isTax ? detailRow("الباقة", `${p.tierName} (${p.periodLabel})`) : ""}
      ${p.paymentMethodLabel ? detailRow("طريقة الدفع", p.paymentMethodLabel) : ""}
      ${p.subscriptionStart ? detailRow("بداية الاشتراك", dateFmt.format(p.subscriptionStart)) : ""}
      ${p.subscriptionEnd ? detailRow("نهاية الاشتراك", dateFmt.format(p.subscriptionEnd)) : ""}
    </table>
    ${lineItems}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">
      <tr>
        <td style="font-size:14px;color:#5b5b5b;">الحالة</td>
        <td style="text-align:left;">${statusBadge}</td>
      </tr>
    </table>
    ${divider()}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="font-size:15px;font-weight:bold;color:#0E065A;">${isTax ? "الإجمالي شامل الضريبة" : "الإجمالي"}</td>
        <td style="text-align:left;font-size:22px;font-weight:bold;color:#0E065A;">${money(t ? t.total : p.amount, p.currency, isTax ? 2 : 0)}</td>
      </tr>
    </table>
    ${qrBlock}
    ${divider()}
    ${paragraph("شكراً لتعاملك مع مُدَوَّنَتِي.")}
    ${paragraph(
      'لأي استفسار عن الفاتورة:<br/>📱 جوال: <a href="tel:+966560299034" style="color:#3030FF;text-decoration:none;">0560299034</a><br/>✉️ البريد: <a href="mailto:modonty@modonty.com" style="color:#3030FF;text-decoration:none;">modonty@modonty.com</a>'
    )}
  `;

  const textLines = [
    `${isTax ? "فاتورة ضريبية" : "فاتورة"} ${p.invoiceNumber}`,
    "",
    `مرحباً ${p.clientName}،`,
    `هذه ${isTax ? "الفاتورة الضريبية" : "فاتورة"} اشتراكك في مُدَوَّنَتِي.`,
    "",
    p.seller ? `البائع: ${p.seller.legalName ?? "مُدَوَّنَتِي"}${p.seller.vatNumber ? ` · الرقم الضريبي ${p.seller.vatNumber}` : ""}` : null,
    p.buyer ? `المشتري: ${p.buyer.legalName ?? p.clientName}${p.buyer.vatNumber ? ` · الرقم الضريبي ${p.buyer.vatNumber}` : ""}` : null,
    `رقم الفاتورة: ${p.invoiceNumber}`,
    t?.orderNumber ? `رقم الطلب: ${t.orderNumber}` : null,
    isTax ? `تاريخ ووقت الإصدار: ${dateTimeFmt.format(p.issuedAt)}` : `${paid ? "تاريخ الدفع" : "تاريخ الإصدار"}: ${dateFmt.format(p.issuedAt)}`,
    t ? `البند: اشتراك باقة «${p.tierName}» — ${durationLabel(t)}` : `الباقة: ${p.tierName} (${p.periodLabel})`,
    p.paymentMethodLabel ? `طريقة الدفع: ${p.paymentMethodLabel}` : null,
    p.subscriptionStart ? `بداية الاشتراك: ${dateFmt.format(p.subscriptionStart)}` : null,
    p.subscriptionEnd ? `نهاية الاشتراك: ${dateFmt.format(p.subscriptionEnd)}` : null,
    t ? `الصافي قبل الضريبة: ${money(t.subtotal, p.currency, 2)}` : null,
    t ? `ضريبة القيمة المضافة (${vatPct}): ${money(t.vat, p.currency, 2)}` : null,
    `الحالة: ${paid ? "مدفوعة" : "مستحقّة"}`,
    `${isTax ? "الإجمالي شامل الضريبة" : "الإجمالي"}: ${money(t ? t.total : p.amount, p.currency, isTax ? 2 : 0)}`,
    "",
    "شكراً لتعاملك مع مُدَوَّنَتِي.",
    "لأي استفسار عن الفاتورة: جوال 0560299034 · بريد modonty@modonty.com",
    "",
    "— فريق مُدَوَّنَتِي",
  ].filter((line): line is string => line !== null);

  return {
    subject: `${isTax ? "فاتورة ضريبية" : "فاتورة"} ${p.invoiceNumber} — مُدَوَّنَتِي`,
    html: await baseTemplate(content, `${isTax ? "فاتورة ضريبية" : "فاتورة"} ${p.invoiceNumber} بقيمة ${money(t ? t.total : p.amount, p.currency, isTax ? 2 : 0)}`),
    text: textLines.join("\n"),
  };
}
