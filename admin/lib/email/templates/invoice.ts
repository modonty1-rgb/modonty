import { baseTemplate, heading, paragraph, divider, badge } from "./base";

/**
 * The platform's legal registry on the invoice — same Settings.org* fields the /trust page
 * shows (Khalid 2026-08-20: an invoice without them is incomplete). Every field nullable:
 * an unfilled column renders no row, never a label with nothing after it.
 */
export interface InvoiceLegalInfo {
  legalName: string | null;
  cr: string | null;
  unifiedNumber: string | null;
  entityType: string | null;
  capital: string | null;
  address: string | null;
}

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
  legal?: InvoiceLegalInfo | null;
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "short", day: "numeric" });

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

function legalRows(l: InvoiceLegalInfo): Array<[string, string]> {
  const rows: Array<[string, string | null]> = [
    ["الاسم القانوني", l.legalName],
    ["رقم السجل التجاري", l.cr],
    ["الرقم الوطني الموحّد", l.unifiedNumber],
    ["نوع الكيان", l.entityType],
    ["رأس المال", l.capital ? `${l.capital} ﷼` : null],
    ["العنوان", l.address],
  ];
  return rows.filter((r): r is [string, string] => !!r[1]);
}

export function invoiceEmail(p: InvoiceEmailParams): { subject: string; html: string; text: string } {
  const paid = p.paymentStatus === "PAID";
  const statusBadge = paid ? badge("مدفوعة", "#10b981") : badge("مستحقّة", "#f59e0b");

  // The full registry goes into the FOOTER, in the footer's own format and color
  // (Khalid 2026-08-20) — it replaces the base template's hardcoded two lines.
  const legal = p.legal ? legalRows(p.legal) : [];
  const l = p.legal;
  const footerLine1 = l
    ? [l.legalName, l.cr && `السجل التجاري ${l.cr}`, l.unifiedNumber && `الرقم الوطني الموحّد ${l.unifiedNumber}`, l.entityType]
        .filter(Boolean)
        .join(" &nbsp;·&nbsp; ")
    : "";
  const footerLine2 = l
    ? [l.address, l.capital && `رأس المال ${l.capital} ﷼`].filter(Boolean).join(" &nbsp;·&nbsp; ")
    : "";
  // Replace the footer only when the registry actually carries the essentials — production
  // Settings can be partially filled, and an invoice footer with an address but no CR is
  // worse than the hardcoded fallback in base.ts.
  const legalFooterHtml =
    l?.cr && l?.unifiedNumber
      ? [footerLine1, footerLine2].filter(Boolean).join("<br/>")
      : undefined;

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
      'لأي استفسار حول الفاتورة:<br/>📱 جوال: <a href="tel:+966560299034" style="color:#3030FF;text-decoration:none;">0560299034</a><br/>✉️ البريد: <a href="mailto:modonty@modonty.com" style="color:#3030FF;text-decoration:none;">modonty@modonty.com</a>'
    )}
  `;

  return {
    subject: `فاتورة ${p.invoiceNumber} — مُدَوَّنَتِي`,
    html: baseTemplate(content, `فاتورة ${p.invoiceNumber} بقيمة ${money(p.amount, p.currency)}`, legalFooterHtml),
    text: `فاتورة ${p.invoiceNumber}

مرحباً ${p.clientName}،

رقم الفاتورة: ${p.invoiceNumber}
الباقة: ${p.tierName} (${p.periodLabel})
${p.paymentMethodLabel ? `طريقة الدفع: ${p.paymentMethodLabel}\n` : ""}${paid ? "تاريخ الدفع" : "تاريخ الإصدار"}: ${dateFmt.format(p.issuedAt)}
${p.subscriptionStart ? `بداية الاشتراك: ${dateFmt.format(p.subscriptionStart)}\n` : ""}${p.subscriptionEnd ? `نهاية الاشتراك: ${dateFmt.format(p.subscriptionEnd)}\n` : ""}الحالة: ${paid ? "مدفوعة" : "مستحقّة"}

الإجمالي: ${money(p.amount, p.currency)}
${legal.length ? `\nالبيانات القانونية للمنشأة:\n${legal.map(([k, v]) => `${k}: ${v}`).join("\n")}\n` : ""}
شكراً لتعاملك مع مُدَوَّنَتِي.
لأي استفسار حول الفاتورة:
جوال: 0560299034
البريد: modonty@modonty.com`,
  };
}
