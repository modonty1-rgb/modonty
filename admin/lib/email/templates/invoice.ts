import { baseTemplate, badge, divider, heading, paragraph } from "@modonty/shared/lib/email";
import type { EmailContent } from "@modonty/shared/lib/email";
import { invoiceHero, invoiceParties, invoiceLine, invoiceQr, invoiceContact } from "./invoice-parts";

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
  periodLabel: string; // المدّة كما بيعت — «٣ أشهر» · «شهر واحد» · «٦ أشهر + شهر هدية = ٧ أشهر»
  /**
   * **الخدمةُ لم تبدأ بعد** — لم يصل العميلَ مقالٌ أوّل.
   *
   * فلا تُطبع تواريخُ بدايةٍ ونهاية، بل يُقال ذلك صراحةً: المدّةُ معلومةٌ وبدايتُها
   * معلَّقة. وإخفاءُ السطر وحده لا يكفي — العميل يدفع ويسأل «متى تبدأ؟»، والسكوتُ
   * يجعله يفترض أنّها بدأت يوم الدفع.
   */
  serviceStartsWithFirstArticle?: boolean;
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
  /** ما وُعد به المشتري، من لقطة الطلب — لا من الكتالوج الحيّ (PAY-E5). */
  commitments?: string[];
  /**
   * تواصلُ المبيعات — من `Settings.salesPhone`/`salesEmail` (خالد ١٨ سبتمبر ٢٠٢٦).
   * كان الرقمُ مكتوباً بنصّه هنا، فيُغيَّر في الإعدادات ويبقى القديمُ في كلّ فاتورة تُرسَل.
   */
  salesPhone?: string | null;
  salesEmail?: string | null;
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

/**
 * ما اشتراه العميل بلغة الخدمة: أشهر مدفوعة + هدية = **أشهر خدمة**.
 *
 * الرقم الأخير هو ما يعنيه له فعلاً (متى تنتهي خدمته)، وكان غائباً — تُذكر المدفوعة
 * والهدية ويُترك الجمع له. وهو نفس الرقم الذي وعدت به بطاقة الباقة وصفحة الدفع، فلا
 * يختلف مستندٌ عن آخر في عدد الأشهر.
 */
function serviceLabel(t: InvoiceTaxDetail): string {
  const m = (n: number) => `${n} ${n === 1 ? "شهر" : "أشهر"}`;
  if (!t.bonusServiceMonths) return `${m(t.paidMonths)} خدمة`;
  const total = t.paidMonths + t.bonusServiceMonths;
  return `${m(t.paidMonths)} مدفوعة + ${t.bonusServiceMonths === 1 ? "شهر هدية" : `${t.bonusServiceMonths} أشهر هدية`} = ${m(total)} خدمة`;
}

export async function invoiceEmail(p: InvoiceEmailParams): Promise<EmailContent> {
  const paid = p.paymentStatus === "PAID";
  const statusBadge = paid ? badge("مدفوعة", "#10b981") : badge("مستحقّة", "#f59e0b");
  const isTax = Boolean(p.tax);
  const t = p.tax;
  const vatPct = t ? `${t.vatRateBp / 100}٪` : "";

  const parties = invoiceParties(p.seller, p.buyer, "مُدَوَّنَتِي", p.clientName);

  const period = p.serviceStartsWithFirstArticle
    ? "فترة الخدمة: تبدأ المدّة بعد نشر أوّل مقال"
    : p.subscriptionStart && p.subscriptionEnd
    ? `فترة الخدمة: ${dateFmt.format(p.subscriptionStart)} — ${dateFmt.format(p.subscriptionEnd)}`
    : null;

  const body = isTax && t
    ? invoiceLine({
        title: `اشتراك باقة «${p.tierName}»`,
        durationLabel: serviceLabel(t),
        // الكمّيّة والسعر كما تطلبهما الهيئة — والسعرُ مشتقٌّ من الصافي ÷ الأشهر المدفوعة،
        // فلا يوجد حقلٌ ثانٍ لسعر الشهر يفترق عن الإجمالي أوّلَ خصم.
        qty: t.paidMonths === 1 ? "شهر واحد" : `${t.paidMonths} أشهر`,
        unitPrice: money(t.paidMonths > 0 ? t.subtotal / t.paidMonths : t.subtotal, p.currency, 2),
        commitments: p.commitments ?? [],
        periodLabel: period,
        net: money(t.subtotal, p.currency, 2),
        vatLabel: `ضريبة القيمة المضافة (${vatPct})`,
        vat: money(t.vat, p.currency, 2),
        total: money(t.total, p.currency, 2),
        totalLabel: "الإجمالي شامل الضريبة",
      })
    : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f9;border:1px solid #ededed;border-radius:10px;margin:0 0 18px;font-size:13px;">
        ${detailRow("الباقة", `${p.tierName} (${p.periodLabel})`)}
        ${p.paymentMethodLabel ? detailRow("طريقة الدفع", p.paymentMethodLabel) : ""}
        ${p.serviceStartsWithFirstArticle
          ? detailRow("بداية الاشتراك", "تبدأ المدّة بعد نشر أوّل مقال")
          : `${p.subscriptionStart ? detailRow("بداية الاشتراك", dateFmt.format(p.subscriptionStart)) : ""}
             ${p.subscriptionEnd ? detailRow("نهاية الاشتراك", dateFmt.format(p.subscriptionEnd)) : ""}`}
        ${detailRow("الإجمالي", money(p.amount, p.currency, 0))}
      </table>`;

  const content = `
    ${invoiceHero({
      // عنوانٌ بلغتين: المستند الضريبيّ السعوديّ يُقرأ محلّيّاً ودوليّاً، والعنوان الإنجليزيّ
      // تحته عرفٌ ثابت في فواتير المملكة — ولا يزاحم العربيّ لأنّه أصغر منه.
      title: isTax ? "فاتورة ضريبية" : "فاتورة",
      titleEn: isTax ? "Tax Invoice" : "Invoice",
      invoiceNumber: p.invoiceNumber,
      orderNumber: t?.orderNumber ?? null,
      issuedAtLabel: isTax
        ? dateTimeFmt.format(p.issuedAt)
        : `${paid ? "تاريخ الدفع" : "تاريخ الإصدار"}: ${dateFmt.format(p.issuedAt)}`,
      totalLabel: isTax ? "الإجمالي شامل الضريبة" : "الإجمالي",
      totalAmount: money(t ? t.total : p.amount, p.currency, isTax ? 2 : 0),
      paid,
    })}
    ${paragraph(`مرحباً ${p.clientName}، هذه ${isTax ? "الفاتورة الضريبية" : "فاتورة"} اشتراكك في مُدَوَّنَتِي.`)}
    ${parties}
    ${body}
    ${p.qrCid ? invoiceQr(p.qrCid) : ""}
    ${divider()}
    ${p.salesPhone || p.salesEmail ? invoiceContact(p.salesPhone ?? "", p.salesEmail ?? "") : ""}
  `;

  const textLines = [
    `${isTax ? "فاتورة ضريبية" : "فاتورة"} ${p.invoiceNumber}`,
    "",
    `مرحباً ${p.clientName}،`,
    `هذه ${isTax ? "الفاتورة الضريبية" : "فاتورة"} اشتراكك في مُدَوَّنَتِي.`,
    "",
    p.seller ? `صادرة من: ${p.seller.legalName ?? "مُدَوَّنَتِي"}${p.seller.vatNumber ? ` · الرقم الضريبي ${p.seller.vatNumber}` : ""}` : null,
    p.buyer ? `إلى: ${p.buyer.legalName ?? p.clientName}${p.buyer.vatNumber ? ` · الرقم الضريبي ${p.buyer.vatNumber}` : ""}` : null,
    `رقم الفاتورة: ${p.invoiceNumber}`,
    t?.orderNumber ? `رقم الطلب: ${t.orderNumber}` : null,
    isTax ? `تاريخ ووقت الإصدار: ${dateTimeFmt.format(p.issuedAt)}` : `${paid ? "تاريخ الدفع" : "تاريخ الإصدار"}: ${dateFmt.format(p.issuedAt)}`,
    p.commitments?.length ? ["يشمل الاشتراك:", ...p.commitments.map((c) => `  · ${c}`)].join("\n") : null,
    t ? `البند: اشتراك باقة «${p.tierName}» — ${serviceLabel(t)}` : `الباقة: ${p.tierName} (${p.periodLabel})`,
    // نفسُ حقول الجدول في النسخة النصّيّة: عميلُ بريدٍ يقرؤها وحدها يجب ألّا ينقصه حقلٌ ملزِم.
    t ? `الكمّيّة: ${t.paidMonths === 1 ? "شهر واحد" : `${t.paidMonths} أشهر`} · سعر الوحدة: ${money(t.paidMonths > 0 ? t.subtotal / t.paidMonths : t.subtotal, p.currency, 2)}` : null,
    p.paymentMethodLabel ? `طريقة الدفع: ${p.paymentMethodLabel}` : null,
    p.subscriptionStart ? `بداية الاشتراك: ${dateFmt.format(p.subscriptionStart)}` : null,
    p.subscriptionEnd ? `نهاية الاشتراك: ${dateFmt.format(p.subscriptionEnd)}` : null,
    t ? `الصافي قبل الضريبة: ${money(t.subtotal, p.currency, 2)}` : null,
    t ? `ضريبة القيمة المضافة (${vatPct}): ${money(t.vat, p.currency, 2)}` : null,
    `الحالة: ${paid ? "مدفوعة" : "مستحقّة"}`,
    `${isTax ? "الإجمالي شامل الضريبة" : "الإجمالي"}: ${money(t ? t.total : p.amount, p.currency, isTax ? 2 : 0)}`,
    "",
    "شكراً لتعاملك مع مُدَوَّنَتِي.",
    p.salesPhone || p.salesEmail
      ? `لأي استفسار عن الفاتورة: ${[p.salesPhone ? `جوال ${p.salesPhone}` : null, p.salesEmail ? `بريد ${p.salesEmail}` : null].filter(Boolean).join(" · ")}`
      : null,
    "",
    "— فريق مُدَوَّنَتِي",
  ].filter((line): line is string => line !== null);

  return {
    subject: `${isTax ? "فاتورة ضريبية" : "فاتورة"} ${p.invoiceNumber} — مُدَوَّنَتِي`,
    // `contact: false`: الفاتورة تحمل سطرَ تواصلها («سؤال عن الفاتورة؟» بهاتفٍ وبريد)،
    // فسطرُ الفوتر العامّ يكرّر نفس البريد سطراً متلاصقاً به.
    html: await baseTemplate(
      content,
      `${isTax ? "فاتورة ضريبية" : "فاتورة"} ${p.invoiceNumber} بقيمة ${money(t ? t.total : p.amount, p.currency, isTax ? 2 : 0)}`,
      { contact: false },
    ),
    text: textLines.join("\n"),
  };
}
