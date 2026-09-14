import { BRAND_LOGO_URL } from "../../brand-assets";
import { EMAIL_BRAND_AR, EMAIL_COLORS, EMAIL_SITE_URL } from "../email-theme";

const { navy, teal, blue } = EMAIL_COLORS;

/**
 * THE email header for the whole repo — ١١ قالباً يفتحون به (فاتورة · ترحيب · تحقّق ·
 * استعادة كلمة مرور · ردّ تعليق · إشعار حجز …).
 *
 * خالد (١٣ سبتمبر ٢٠٢٦): «خليهم أكثر احترافية — الهيدر والفوتر ريوزيبل ونستخدمهم في كل
 * القوالب». فما تغيّر هنا يظهر في الأحد عشر دفعةً واحدة، وهذا سبب التحفّظ في كل قرار تحته.
 *
 * ما كان: شعارٌ وسط سطحٍ أبيض وخطٌّ كحليّ صلبٌ تحته. الشعار غير مرتبط بشيء، والخطّ
 * ٣px يقطع الرسالة بدل أن يبدأها.
 *
 * ما صار وسببه:
 * - **الشعار رابطٌ إلى الموقع.** أوّل ما تُلمس اليد في أي رسالة هو الشعار — وكان لا يقود
 *   إلى شيء. و`aria-label` عليه لأن قارئ الشاشة يقرأ الرابط لا الصورة وحدها.
 * - **الشريط تدرّجٌ من ألوان العلامة الثلاثة** (كحليّ → أزرق → سماويّ) بارتفاع ٤px يعلو
 *   الترويسة لا يفصلها. و`to left` لا `90deg`: المستند عربيّ، فالكحليّ يبدأ من جهة
 *   البداية (اليمين) ويمشي التدرّج مع القراءة لا ضدّها.
 *   وعملاء البريد التي لا تدعم التدرّج (Outlook القديم) ترتدّ إلى `background-color`
 *   الكحليّ المعلن قبله — فلا تظهر فجوة بيضاء أبداً. والارتفاع مثبَّتٌ على العنصر
 *   وعلى `div` داخله معاً، و`mso-line-height-rule` لأن Outlook يتجاهل الأول ويمدّ
 *   الصفّ إلى ارتفاع سطرٍ كامل.
 * - **`padding` غير متماثل**: ٢٦px فوق و٢٠px تحت. الشعار كتلةٌ بصرية ثقيلة، فمسافةٌ
 *   متساوية تجعله يبدو هابطاً — قاعدة التوازن البصري لا الحسابي.
 * - **`max-height` بقي ٥٦px** ولم يُكبَّر: الترويسة مقدّمةٌ لا لافتة، وما يلي هو الرسالة.
 *
 * ولا شيء هنا يعتمد على CSS خارجي أو فليكس — كلّه جداول وأنماط داخلية، لأن نصف عملاء
 * البريد يُسقطون أي ورقة أنماط.
 */
export function emailHeader(): string {
  return `<tr>
            <td style="background-color:#ffffff;padding:26px 32px 20px;text-align:center;">
              <a href="${EMAIL_SITE_URL}" aria-label="${EMAIL_BRAND_AR}" style="display:inline-block;text-decoration:none;border:0;">
                <img src="${BRAND_LOGO_URL}" alt="${EMAIL_BRAND_AR}" width="150" height="auto" style="display:block;border:0;max-height:56px;object-fit:contain;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="height:4px;line-height:4px;font-size:0;mso-line-height-rule:exactly;background-color:${navy};background-image:linear-gradient(to left, ${navy} 0%, ${blue} 55%, ${teal} 100%);"><div style="height:4px;line-height:4px;font-size:0;">&#8203;</div></td>
          </tr>`;
}
