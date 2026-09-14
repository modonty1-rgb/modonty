import type { CatalogFeature } from "./get-market-catalog";
import { isMonthlyUnit } from "./feature-unit-labels";

/**
 * ما وُعد به المشتري، سطراً سطراً — يُجمَّد في الطلب ويُطبع في الفاتورة (PAY-E5).
 *
 * خالد (١٣ سبتمبر ٢٠٢٦): «ليه ما نضيف تفاصيل الباقة في الفاتورة عشان منها تكون فاتورة
 * والتزام». فالفاتورة تصير مستندين في ورقة: ما دُفع، وما يُستحقّ مقابله.
 *
 * ثلاث قواعد في الصياغة:
 *
 * ١ **الكمّية للمدّة كلّها لا للشهر.** البطاقة تقول «٨ مقال/شهر» لأنها تقارن باقات؛
 *   والفاتورة تقول «٥٦ مقالاً على مدونتي خلال ٧ أشهر» لأنها تُحاسَب عليها. الرقم الذي
 *   يُطالِب به العميل بعد ستّة أشهر هو الإجمالي لا المعدّل.
 *
 * ٢ **ما لا كمّية له يُكتب كما هو.** «نظام حجوزات» ليس ٧ أنظمة — الضرب في المدّة يجعل
 *   الالتزام هزليّاً.
 *
 * ٣ **نصٌّ جاهز لا معرّف.** يُخزَّن السطر مكتوباً، فحذفُ ميزةٍ من الكتالوج بعد سنة لا
 *   يُفرغ سطراً في فاتورةٍ صادرة.
 *
 * ٤ **لا ينزل إلا ما وُسم `billable`** في المكتبة. البطاقة تعرض كل المزايا — تسويق؛
 *   والفاتورة تعرض ما نستطيع إثبات تسليمه — التزام. فـ«محتواك جاهز للذكاء الاصطناعي»
 *   جاهزيّةٌ عند طرفٍ ثالث، ولا مكان لها في مستندٍ يُطالَب به.
 */

const ar = new Intl.NumberFormat("ar-SA");

export function buildPlanCommitments(features: CatalogFeature[], serviceMonths: number): string[] {
  return features.filter((f) => f.billable).map((f) => {
    if (f.quantity === null) return f.name;

    if (isMonthlyUnit(f.unitLabel) && serviceMonths > 0) {
      const total = f.quantity * serviceMonths;
      const months = `${ar.format(serviceMonths)} ${serviceMonths >= 3 && serviceMonths <= 10 ? "أشهر" : "شهر"}`;
      return `${ar.format(total)} — ${f.name} (خلال ${months})`;
    }

    return `${ar.format(f.quantity)} — ${f.name}`;
  });
}
