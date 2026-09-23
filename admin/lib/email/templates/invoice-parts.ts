import { InvoicePaymentStatus } from "@prisma/client";
import { EMAIL_COLORS } from "@modonty/shared/lib/email";
import { INVOICE_STATUS_LABEL } from "@modonty/shared/lib/payments/invoice-status-label";

/**
 * قطع الفاتورة الضريبية — مفصولةٌ عن `invoice.ts` كي يبقى القالب مقروءاً بعد إعادة تشكيله
 * (PAY-E5 · خالد ١٣ سبتمبر ٢٠٢٦: «الهيدر محتاج تحسين… البائع والمشتري، إحنا نبيع خدمة،
 * هذه فاتورة تطلع لي محل جملة»).
 *
 * قاعدتان تحكمان كل ما هنا:
 *
 * ١ **رأسٌ يجيب بلمحة.** من يفتح فاتورةً يسأل أربعة أسئلة قبل أن يقرأ سطراً: ما هذه؟ ممّن؟
 *   كم؟ هل دُفعت؟ وكانت الإجابة موزَّعةً على أربع كتل متباعدة — الرقم في جدول، والمبلغ في
 *   آخر الصفحة، والحالة شارةً بينهما. الآن تجتمع الأربع في شريطٍ واحد أعلى الرسالة.
 *
 * ٢ **لغة خدمة لا بضاعة.** «البائع/المشتري» و«الكمية: 1» لغةُ فاتورة محلّ جملة. نحن نصدر
 *   اشتراك خدمة، فالطرفان «صادرة من» و«إلى»، والبند يذكر **مدّة الخدمة** لا كميّةً من قطعة.
 *   واسمُ الحقل عرضٌ لا قانون: ما تفرضه الهيئة هو أن يظهر اسم المورّد ورقمه الضريبي واسم
 *   المشتري ورقمه — وكلّها باقية كما هي، وإنما تغيّرت التسمية التي تُقرأ فوقها.
 *
 * والبريد ليس متصفّحاً: جداول وأنماط داخل السمة، بلا فليكس ولا شبكة ولا ملفّ خارجي.
 */

const { navy, blue, gray, border } = EMAIL_COLORS;

export interface InvoiceHeroInput {
  title: string;
  /** العنوان الإنجليزيّ تحته — عرفٌ ثابت في الفاتورة الضريبيّة السعوديّة. */
  titleEn?: string;
  invoiceNumber: string;
  orderNumber: string | null;
  issuedAtLabel: string;
  totalLabel: string;
  totalAmount: string;
  paymentStatus: InvoicePaymentStatus;
}

/**
 * شريط الرأس — الإجابة الكاملة في نظرة: نوع المستند ورقمه · الحالة · المبلغ.
 *
 * المبلغ هو أكبر ما في الرسالة لأنه أوّل ما تبحث عنه العين، والحالة شارةٌ ملوّنة بجانبه
 * لأن «هل دُفعت؟» يأتي مباشرةً بعد «كم؟». والتاريخ ورقم الطلب أصغر تحتهما — يُحتاجان عند
 * الرجوع لا عند الفتح.
 */
export function invoiceHero(h: InvoiceHeroInput): string {
  const paid = h.paymentStatus === InvoicePaymentStatus.PAID;
  const statusBg = paid ? "#ecfdf5" : "#fffbeb";
  const statusFg = paid ? "#047857" : "#b45309";
  // اسمُ الحالة من القائمة الواحدة — كانت الرسالةُ تقول «مستحقّة» والشاشاتُ «بانتظار الدفع»
  // لنفس القيمة (٢٣ سبتمبر ٢٠٢٦ · خالد: مصدرٌ واحد).
  const statusText = INVOICE_STATUS_LABEL[h.paymentStatus];

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f7fb;border:1px solid ${border};border-radius:10px;margin:0 0 18px;">
    <tr>
      <td style="padding:18px 20px 14px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td valign="top" style="font-size:12px;color:${gray};line-height:1.9;">
              <div style="font-size:16px;font-weight:bold;color:${navy};line-height:1.35;">${h.title}</div>
              ${h.titleEn ? `<div dir="ltr" style="font-size:10.5px;color:#9a9aa8;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px;">${h.titleEn}</div>` : ""}
              <div style="margin-top:2px;">رقم الفاتورة: <span style="color:${navy};font-weight:bold;">${h.invoiceNumber}</span></div>
              ${h.orderNumber ? `<div>رقم الطلب: <span style="color:${navy};">${h.orderNumber}</span></div>` : ""}
              <div>${h.issuedAtLabel}</div>
            </td>
            <td valign="top" align="left" style="text-align:left;white-space:nowrap;">
              <div style="display:inline-block;padding:3px 10px;border-radius:999px;background-color:${statusBg};color:${statusFg};font-size:11.5px;font-weight:bold;">${statusText}</div>
              <div style="margin-top:8px;font-size:11.5px;color:${gray};">${h.totalLabel}</div>
              <div style="font-size:26px;font-weight:bold;color:${navy};line-height:1.25;">${h.totalAmount}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

export interface InvoicePartyView {
  legalName: string | null;
  vatNumber: string | null;
  crNumber?: string | null;
  address: string | null;
}

/**
 * طرفا الفاتورة — «صادرة من» و«إلى».
 *
 * العنوان لا يُطبع هنا للمورّد: الفوتر يحمل السجلّ التجاري والرقم الوطني والعنوان في كل
 * رسالة (`emailFooter` يقرؤها من الإعدادات بنفسه)، وتكراره في الأعلى يضاعف السطور بلا أن
 * يضيف معلومة. عنوان **المشتري** يُطبع لأنه لا يظهر في مكانٍ آخر.
 */
export function invoiceParties(
  seller: InvoicePartyView | undefined,
  buyer: InvoicePartyView | undefined,
  sellerFallback: string,
  buyerFallback: string,
): string {
  if (!seller && !buyer) return "";

  const cell = (label: string, p: InvoicePartyView, fallback: string, showAddress: boolean) => {
    const rows = [
      `<div style="font-size:13.5px;font-weight:bold;color:${navy};">${p.legalName || fallback}</div>`,
      p.vatNumber ? `<div style="margin-top:3px;">الرقم الضريبي <span style="color:${navy};">${p.vatNumber}</span></div>` : "",
      showAddress && p.address ? `<div style="margin-top:2px;">${p.address}</div>` : "",
    ].join("");
    return `<td valign="top" style="width:50%;padding:12px 14px;font-size:12px;line-height:1.7;color:${gray};">
      <div style="font-size:10.5px;color:#9a9aa8;letter-spacing:.02em;margin-bottom:5px;">${label}</div>${rows}
    </td>`;
  };

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${border};border-radius:10px;margin:0 0 18px;">
    <tr>
      ${seller ? cell("صادرة من", seller, sellerFallback, false) : ""}
      ${buyer ? cell("إلى", buyer, buyerFallback, true) : ""}
    </tr>
  </table>`;
}

export interface InvoiceLineView {
  /** «اشتراك باقة «الزخم»» — ما اشتُري. */
  title: string;
  /** «٦ أشهر مدفوعة + شهر هدية = ٧ أشهر خدمة» — بديل خانة «الكمية». */
  durationLabel: string;
  /** الكمّيّة كما تطلبها الهيئة: عدد الأشهر المدفوعة. */
  qty: string;
  /** سعر الوحدة (الشهر) صافياً — مشتقٌّ من الصافي ÷ الأشهر، فلا يناقض الإجمالي أبداً. */
  unitPrice: string;
  /** فترة الخدمة حين تكون معروفة. */
  periodLabel: string | null;
  /** ما وُعد به المشتري — مجمَّدٌ في الطلب لحظة الشراء. فارغاً لا يُرسم القسم. */
  commitments: string[];
  net: string;
  vatLabel: string;
  vat: string;
  total: string;
  totalLabel: string;
}

/**
 * بند الخدمة وحسابه — جدولُ بنودٍ بأعمدة، لا كتلةُ نصّ.
 *
 * **لماذا الأعمدة (١٨ سبتمبر ٢٠٢٦):** هيئةُ الزكاة والضريبة والجمارك تُلزم الفاتورة
 * الضريبيّة بأن تحمل لكلّ بند: الوصفَ والكمّيّةَ وسعرَ الوحدة والمبلغَ الخاضع ونسبةَ
 * الضريبة وقيمتَها والإجماليَّ شاملاً إيّاها
 * (`zatca.gov.sa` — الدليل الإرشاديّ التفصيليّ للفوترة الإلكترونيّة · قرار الفوترة، الملحق ٢).
 * وكان سعرُ الوحدة غائباً تماماً، فالمستندُ يقول «كم دفعت» ولا يقول «على أيّ أساس».
 *
 * وسعرُ الشهر **يُشتقّ** من الصافي ÷ الأشهر ولا يُقرأ من حقلٍ ثانٍ: حقلان لسعرٍ واحد
 * يفترقان أوّلَ خصم، فتخرج فاتورةٌ حسابُها لا يقفل.
 *
 * والكمّيّة أشهرٌ لا قطع: نبيع خدمةً لا بضاعة، والعمودُ يحمل «١ شهر» لا «1».
 *
 * والحساب يُقرأ من فوق إلى تحت بترتيبه الطبيعي: صافٍ ← ضريبة ← إجمالي في صفٍّ مظلَّل،
 * فالعين تتتبّع الجمع بلا أن تقفز. والجداولُ وحدَها تخطيطٌ مضمون في كلّ عملاء البريد
 * (`caniemail.com` — دعمُ `<table>` ١٠٠٪، وفليكس والشبكة ليست كذلك).
 */
export function invoiceLine(l: InvoiceLineView): string {
  const row = (label: string, value: string, strong = false) => `<tr>
    <td style="padding:${strong ? "10px" : "7px"} 14px;font-size:${strong ? "14px" : "12.5px"};color:${strong ? navy : gray};${strong ? "font-weight:bold;" : ""}${strong ? `background-color:#f7f7fb;` : ""}">${label}</td>
    <td style="padding:${strong ? "10px" : "7px"} 14px;text-align:left;font-size:${strong ? "17px" : "12.5px"};color:${navy};${strong ? "font-weight:bold;" : ""}${strong ? `background-color:#f7f7fb;` : ""}">${value}</td>
  </tr>`;

  /**
   * ما يشمله الاشتراك — يجعل المستند **فاتورةً والتزاماً** معاً (خالد ١٣ سبتمبر ٢٠٢٦:
   * «عشان منها تكون فاتورة والتزام»). الأرقام للمدّة كلّها لا للشهر، لأنها ما يُحاسَب
   * عليه. وعلامة ✓ نصّية لا أيقونة: الصور تُحجب افتراضياً في كثير من عملاء البريد،
   * فقائمةٌ بلا علاماتٍ مرئية تصير سطوراً معلّقة.
   */
  const commitmentsBlock = l.commitments.length
    ? `<tr>
        <td style="padding:12px 14px 14px;border-bottom:1px solid #f0f0f4;">
          <div style="font-size:11.5px;color:#9a9aa8;margin-bottom:8px;">يشمل الاشتراك</div>
          ${l.commitments
            .map(
              (c) => `<div style="font-size:12.5px;line-height:1.85;color:${gray};">
                <span style="color:#10b981;font-weight:bold;">✓</span>&nbsp; ${c}
              </div>`,
            )
            .join("")}
        </td>
      </tr>`
    : "";

  const th = (text: string, align: "right" | "left" = "right") =>
    `<td align="${align === "right" ? "right" : "left"}" style="padding:8px 14px;font-size:10.5px;font-weight:bold;color:#9a9aa8;letter-spacing:.03em;text-align:${align};border-bottom:1px solid ${border};background-color:#fafafc;">${text}</td>`;

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${border};border-radius:10px;margin:0 0 18px;">
    <tr><td style="padding:0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          ${th("البند")}
          ${th("الكمّيّة")}
          ${th("سعر الوحدة")}
          ${th("الإجمالي", "left")}
        </tr>
        <tr>
          <td valign="top" style="padding:12px 14px;border-bottom:1px solid #f0f0f4;">
            <div style="font-size:13.5px;font-weight:bold;color:${navy};line-height:1.6;">${l.title}</div>
            <div style="margin-top:3px;font-size:11.5px;color:${gray};">${l.durationLabel}</div>
            ${l.periodLabel ? `<div style="margin-top:2px;font-size:11.5px;color:${gray};">${l.periodLabel}</div>` : ""}
          </td>
          <td valign="top" align="right" style="padding:12px 14px;font-size:12.5px;color:${navy};white-space:nowrap;border-bottom:1px solid #f0f0f4;">${l.qty}</td>
          <td valign="top" align="right" style="padding:12px 14px;font-size:12.5px;color:${navy};white-space:nowrap;border-bottom:1px solid #f0f0f4;">${l.unitPrice}</td>
          <td valign="top" align="left" style="padding:12px 14px;font-size:12.5px;font-weight:bold;color:${navy};white-space:nowrap;text-align:left;border-bottom:1px solid #f0f0f4;">${l.net}</td>
        </tr>
      </table>
    </td></tr>
    ${commitmentsBlock}
    <tr><td style="padding:0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${row("الصافي قبل الضريبة", l.net)}
        ${row(l.vatLabel, l.vat)}
        <tr><td colspan="2" style="padding:0 14px;"><div style="border-top:1px solid ${border};"></div></td></tr>
        ${row(l.totalLabel, l.total, true)}
      </table>
    </td></tr>
  </table>`;
}

/** رمز الهيئة — يُقرأ بتطبيقها، فيُعرض بحجمٍ يكفي للمسح من الشاشة. */
export function invoiceQr(cid: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 6px;">
    <tr>
      <td align="center" style="text-align:center;padding:4px 0 0;">
        <img src="cid:${cid}" width="132" height="132" alt="رمز الفاتورة الضريبية" style="display:inline-block;width:132px;height:132px;border:1px solid ${border};border-radius:10px;padding:8px;background:#ffffff;" />
        <div style="margin-top:6px;font-size:11px;color:${gray};">امسح الرمز بتطبيق هيئة الزكاة والضريبة والجمارك للتحقّق من الفاتورة</div>
      </td>
    </tr>
  </table>`;
}

/** سطر التواصل — رقمٌ وبريد، بلا رموز تعبيرية تُكسر في بعض عملاء البريد. */
export function invoiceContact(phone: string, email: string): string {
  // أيّهما وُجد يُطبع وحده: الفاصلةُ بين طرفين أحدُهما غائب تترك «·» معلّقةً في آخر السطر.
  const digits = phone.replace(/\D/g, "");
  /**
   * الرقمُ يُعزَل اتّجاهيّاً وإلّا انقلب (خالد ١٨ سبتمبر ٢٠٢٦: «الرقم جاي مقلوب»).
   *
   * علامةُ `+` محايدةٌ في خوارزميّة الاتّجاه الثنائيّ (يونيكود UAX #9)، فداخل فقرةٍ
   * عربيّة تأخذ اتّجاه ما حولها فتُرسَم في آخر الرقم: `966555000111+`. و`dir="ltr"`
   * وحدها لا تكفي — بعضُ عملاء البريد يُسقط الخاصّيّة، فتُضاف علامتا `&lrm;`
   * (U+200E) حول النصّ: محرفان يُثبّتان الاتّجاه ولا يُرسمان.
   */
  const ltr = (text: string) => `<span dir="ltr" style="unicode-bidi:isolate;">&lrm;${text}&lrm;</span>`;
  const parts = [
    phone ? `<a href="tel:+${digits}" dir="ltr" style="color:${blue};text-decoration:none;unicode-bidi:isolate;">${ltr(phone)}</a>` : null,
    email ? `<a href="mailto:${email}" dir="ltr" style="color:${blue};text-decoration:none;unicode-bidi:isolate;">${ltr(email)}</a>` : null,
  ].filter(Boolean);
  if (parts.length === 0) return "";
  return `<p style="margin:0;font-size:12.5px;line-height:1.9;color:${gray};text-align:center;">
    سؤال عن الفاتورة؟
    ${parts.join("&nbsp;&nbsp;·&nbsp;&nbsp;")}
  </p>`;
}
