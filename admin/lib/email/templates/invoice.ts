import { baseTemplate, badge, divider, heading, paragraph } from "@modonty/shared/lib/email";
import type { EmailContent } from "@modonty/shared/lib/email";

/**
 * The legal registry is no longer a parameter here: the shared `baseTemplate` reads
 * `Settings.org*` itself and prints it in the footer of EVERY email, this one included
 * (MAILREV, 23 Aug). The invoice body carries the invoice; the footer carries the company.
 */
export interface InvoiceEmailParams {
  clientName: string;
  email: string;
  invoiceNumber: string;
  tierName: string;
  periodLabel: string; // "شهري" | "سنوي"
  amount: number;
  currency: "SAR" | "EGP";
  paymentMethodLabel?: string;
  paymentStatus: "PAID" | "DUE";
  issuedAt: Date;
  subscriptionStart?: Date | null;
  subscriptionEnd?: Date | null;
}

/** Arabic month names, Arabic digits — an `en-GB` date inside an RTL cell read backwards. */
const dateFmt = new Intl.DateTimeFormat("ar-SA", { year: "numeric", month: "long", day: "numeric" });

function money(amount: number, currency: "SAR" | "EGP"): string {
  return new Intl.NumberFormat(currency === "SAR" ? "ar-SA" : "ar-EG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:9px 12px;font-size:13px;color:#5b5b5b;border-bottom:1px solid #f0f0f0;">${label}</td>
    <td style="padding:9px 12px;font-size:13px;color:#0E065A;font-weight:bold;text-align:left;border-bottom:1px solid #f0f0f0;">${value}</td>
  </tr>`;
}

export async function invoiceEmail(p: InvoiceEmailParams): Promise<EmailContent> {
  const paid = p.paymentStatus === "PAID";
  const statusBadge = paid ? badge("مدفوعة", "#10b981") : badge("مستحقّة", "#f59e0b");

  const content = `
    ${heading(`فاتورة ${p.invoiceNumber}`)}
    ${paragraph(`مرحباً ${p.clientName}، هذه فاتورة اشتراكك في مُدَوَّنَتِي.`)}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f9;border:1px solid #ededed;border-radius:6px;margin:18px 0;">
      ${detailRow("رقم الفاتورة", p.invoiceNumber)}
      ${detailRow("الباقة", `${p.tierName} (${p.periodLabel})`)}
      ${p.paymentMethodLabel ? detailRow("طريقة الدفع", p.paymentMethodLabel) : ""}
      ${detailRow(paid ? "تاريخ الدفع" : "تاريخ الإصدار", dateFmt.format(p.issuedAt))}
      ${p.subscriptionStart ? detailRow("بداية الاشتراك", dateFmt.format(p.subscriptionStart)) : ""}
      ${p.subscriptionEnd ? detailRow("نهاية الاشتراك", dateFmt.format(p.subscriptionEnd)) : ""}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">
      <tr>
        <td style="font-size:14px;color:#5b5b5b;">الحالة</td>
        <td style="text-align:left;">${statusBadge}</td>
      </tr>
    </table>
    ${divider()}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="font-size:15px;font-weight:bold;color:#0E065A;">الإجمالي</td>
        <td style="text-align:left;font-size:22px;font-weight:bold;color:#0E065A;">${money(p.amount, p.currency)}</td>
      </tr>
    </table>
    ${divider()}
    ${paragraph("شكراً لتعاملك مع مُدَوَّنَتِي.")}
    ${paragraph(
      'لأي استفسار عن الفاتورة:<br/>📱 جوال: <a href="tel:+966560299034" style="color:#3030FF;text-decoration:none;">0560299034</a><br/>✉️ البريد: <a href="mailto:modonty@modonty.com" style="color:#3030FF;text-decoration:none;">modonty@modonty.com</a>'
    )}
  `;

  return {
    subject: `فاتورة ${p.invoiceNumber} — مُدَوَّنَتِي`,
    html: await baseTemplate(content, `فاتورة ${p.invoiceNumber} بقيمة ${money(p.amount, p.currency)}`),
    text: `فاتورة ${p.invoiceNumber}

مرحباً ${p.clientName}،
هذه فاتورة اشتراكك في مُدَوَّنَتِي.

رقم الفاتورة: ${p.invoiceNumber}
الباقة: ${p.tierName} (${p.periodLabel})
${p.paymentMethodLabel ? `طريقة الدفع: ${p.paymentMethodLabel}\n` : ""}${paid ? "تاريخ الدفع" : "تاريخ الإصدار"}: ${dateFmt.format(p.issuedAt)}
${p.subscriptionStart ? `بداية الاشتراك: ${dateFmt.format(p.subscriptionStart)}\n` : ""}${p.subscriptionEnd ? `نهاية الاشتراك: ${dateFmt.format(p.subscriptionEnd)}\n` : ""}الحالة: ${paid ? "مدفوعة" : "مستحقّة"}
الإجمالي: ${money(p.amount, p.currency)}

شكراً لتعاملك مع مُدَوَّنَتِي.
لأي استفسار عن الفاتورة: جوال 0560299034 · بريد modonty@modonty.com

— فريق مُدَوَّنَتِي`,
  };
}
