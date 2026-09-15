/**
 * شعارات الدفع المتاحة — قائمة مغلقة كسجلّ الأيقونات (PAY-Q11): أيّ شعار يُختار يسكن
 * القاعدة، وكيف يُرسم يبقى في الكود. اسمٌ خارجها يُرفض عند الحفظ، فلا يصل الزائر رابطٌ
 * مكسور على صفحة بيع.
 *
 * الملفّات في `public/logos/` بالتطبيقين (منسوخة من جبر سيو ١٣ سبتمبر ٢٠٢٦).
 */
export const PAY_MARKS = {
  mada: "مدى",
  visa: "Visa",
  mastercard: "Mastercard",
  "apple-pay": "Apple Pay",
  stcpay: "STC Pay",
  sadad: "سداد",
  alrajhi: "الراجحي",
  snb: "الأهلي",
  "saib-bank": "SAIB",
  cib: "CIB",
  instapay: "InstaPay",
  tamara: "تمارا",
} as const;

export type PayMarkName = keyof typeof PAY_MARKS;

export const PAY_MARK_NAMES = Object.keys(PAY_MARKS) as PayMarkName[];

export function isPayMarkName(value: string): value is PayMarkName {
  return Object.prototype.hasOwnProperty.call(PAY_MARKS, value);
}

/**
 * الاسم → مسار الملفّ ووصفه، للعرض. `sadad` و`saib-bank` وحدهما بصيغة png.
 *
 * والمسار واحدٌ في التطبيقين: لكلٍّ نسخته من الملفّات في `public/logos` — ملفّات `public`
 * لا تُشارَك بين تطبيقَي Next، لكن العنوان يبقى هو هو، فلا وسيط ولا فرع.
 */
/**
 * العلامات التي لا يوجد لها SVG رسميّ، فتُخدَم PNG شفّافة.
 *
 * و`instapay` منها منذ ١٥ سبتمبر ٢٠٢٦: الذي كان في المستودع شعارٌ **مختلف كليّاً** —
 * ألوانه `#602E8D` و`#F9DB2A` و`#38B5BE` (بنفسجي وأصفر وتركوازي) بينما علامة إنستا
 * باي المصرية بنفسجيّة وبرتقالية. وموقعها الرسميّ `instapay.eg` يردّ **٤٠٣** من
 * خارج مصر، فأُخذ الأصل من قائمة تطبيقها التي ناشرها **EBC** نفسها (الشركة المصرية
 * للبنوك، مشغّل الشبكة) — ثم أُزيل بياضه وقُصّ إلى حدوده.
 *
 * ولا يُعاد رسمه SVG بيد: علامةٌ تجارية على صفحة دفع، وأي تقريبٍ فيها تشويهٌ يراه
 * المصريّ فوراً ويقرؤه شكّاً في الصفحة كلّها.
 */
const PNG_MARKS = new Set<PayMarkName>(["sadad", "saib-bank", "instapay"]);

export function payMarkAsset(name: PayMarkName): { src: string; alt: string } {
  return { src: `/logos/${name}${PNG_MARKS.has(name) ? ".png" : ".svg"}`, alt: PAY_MARKS[name] };
}
