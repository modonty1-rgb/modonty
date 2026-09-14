import {
  EMAIL_BRAND_AR,
  EMAIL_COLORS,
  EMAIL_CONTACT_ADDRESS,
  EMAIL_LEGAL_FALLBACK_HTML,
  EMAIL_SITE_URL,
} from "../email-theme";
import { getLegalFooterHtml } from "../get-legal-footer-html";

const { navy, blue, gray, lightGray, border } = EMAIL_COLORS;

/**
 * THE email footer for the whole repo: تواصلٌ · روابط · السجلّ النظاميّ.
 *
 * `async` لأنه يقرأ السجلّ من `Settings.org*` **بنفسه** — نفس المصدر الذي تقرأ منه /trust
 * والفاتورة. وهذا كل الغرض: لا يستطيع مستدعٍ أن ينساه (قبل MAILREV نسيه ٩ من ١٠ قوالب).
 *
 * خالد (١٣ سبتمبر ٢٠٢٦): «خليهم أكثر احترافية». وما تغيّر:
 *
 * - **ثلاث طبقات بدل كتلةٍ واحدة.** كان الفوتر ثلاث فقرات متشابهة الوزن — سطر تواصل
 *   وسطر روابط وسطر سجلّ — فتُقرأ ككتلة رماديّة تُتخطّى. الآن: سطر تواصل بارز · شريط
 *   روابط بفواصل · ثم السجلّ النظاميّ خلف خطٍّ فاصل وبلونٍ أخفت. الهرم يقول أيّها
 *   للقارئ وأيّها للنظام.
 * - **السجلّ داخل حاضنٍ مستقلّ** بخلفيّة أفتح قليلاً: هو بياناتٌ قانونية تُطلب عند الحاجة
 *   ولا تُقرأ كل مرّة — فصلُها يريح العين ويُبقيها موجودةً كما يفرضه النظام.
 * - **اسم العلامة مذكورٌ صراحةً** قبل الروابط: رسالةٌ تُعاد توجيهها أو تُطبع قد تصل من لا
 *   يعرف الشعار، فيبقى «مُدَوَّنَتِي» مكتوباً لا مرسوماً فقط.
 * - **الحقوق بالسنة الحالية** — سطرٌ صغير يُتوقَّع في كل رسالة تجارية، وغيابه يُقرأ نقصاً.
 *   وفجوته ١٢px لا ٨: قيست الثمانية فالتصق السطران وقُرئا فقرةً واحدة، والسجلّ والحقوق
 *   معلومتان مختلفتان.
 * - **مساحة نقرٍ للروابط**: `padding` رأسيّ ٤px حول كل رابط، فالإصبع على الجوّال يصيبه
 *   دون أن يصيب جاره — الروابط النصّية المتلاصقة أكثر ما يُخطئه اللمس في البريد.
 *
 * كل شيء جداول وأنماط داخلية: لا فليكس ولا شبكة ولا ورقة أنماط — نصف عملاء البريد
 * يُسقطونها.
 */
export async function emailFooter(): Promise<string> {
  const legalHtml = (await getLegalFooterHtml()) ?? EMAIL_LEGAL_FALLBACK_HTML;
  const host = EMAIL_SITE_URL.replace(/^https?:\/\//, "");
  const year = new Date().getFullYear();

  const link = (href: string, text: string) =>
    `<a href="${href}" style="display:inline-block;padding:4px 2px;color:${blue};text-decoration:none;">${text}</a>`;

  return `<tr>
            <td style="background-color:${lightGray};padding:22px 32px 18px;border-top:1px solid ${border};text-align:center;">

              <p style="margin:0 0 10px;font-size:12.5px;line-height:1.8;color:${gray};">
                سؤال أو ملاحظة؟ راسلنا على
                <a href="mailto:${EMAIL_CONTACT_ADDRESS}" style="color:${blue};text-decoration:none;font-weight:bold;">${EMAIL_CONTACT_ADDRESS}</a>
              </p>

              <p style="margin:0 0 4px;font-size:12.5px;color:${navy};font-weight:bold;">${EMAIL_BRAND_AR}</p>
              <p style="margin:0;font-size:12px;color:${gray};">
                ${link(EMAIL_SITE_URL, host)}
                <span style="color:${border};">&nbsp;·&nbsp;</span>
                ${link(`${EMAIL_SITE_URL}/privacy`, "سياسة الخصوصية")}
                <span style="color:${border};">&nbsp;·&nbsp;</span>
                ${link(`${EMAIL_SITE_URL}/terms`, "الشروط والأحكام")}
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0 0;">
                <tr>
                  <td style="border-top:1px solid ${border};padding:16px 0 0;text-align:center;">
                    <p style="margin:0;font-size:10.5px;color:#9a9aa8;line-height:1.8;">${legalHtml}</p>
                    <p style="margin:12px 0 0;font-size:10.5px;color:#9a9aa8;">© ${year} ${EMAIL_BRAND_AR} — جميع الحقوق محفوظة</p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>`;
}
