import { Ban, Wrench } from "lucide-react";

/**
 * ممنوعات القول للعميل.
 *
 * كانت في صفحة «الممنوعات» الجامعة، وحُذفت الصفحة بعد أن نزل كل تصنيف إلى قسمه
 * (خالد، ١٢ سبتمبر ٢٠٢٦). وهذه وحدها ليست ممنوعات تقنية تضرّ الموقع — هي جملٌ تُقال
 * في مكالمة فتصير وعدًا لا نملك الوفاء به، فمكانها قسم المبيعات.
 */
const RED_LINES = [
  "«نصمم لك موقعًا» أو «نأخذ لك نطاقًا».",
  "ترتيب أول في نتائج البحث خلال مدة محددة.",
  "عدد مبيعات أو عملاء محتملين مضمون.",
  "أن السيو يعوض خدمة ضعيفة أو عرضًا غير مناسب.",
];

const BUILDING = [
  "نطاق فرعي باسم الشريك بدل مسار الصفحة الحالي.",
  "لوحة موحدة تفهم غير التقني ما أنجزناه وما ينتظر اعتماده وأثره.",
  "مؤشر جاهزية لملف الشريك قبل بدء الإنتاج.",
  "تنبيهات عند هبوط الأداء أو تأخر الاعتماد.",
  "بناء السلطة الخارجية والروابط — لم يبدأ بعد.",
];

export function SalesLimits() {
  return (
    <section className="space-y-3" id="sales-limits">
      <div className="flex items-center gap-2">
        <Ban className="h-4.5 w-4.5 text-red-400" />
        <h2 className="text-lg font-bold">ما لا يُقال للعميل</h2>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <div className="rounded-xl border border-red-500/35 bg-red-500/[0.04] p-4">
          <h3 className="text-[14.5px] font-bold">خطوط حمراء: لا تُقال أبدًا</h3>
          <ul className="mt-3 space-y-2 text-[13px] leading-7 text-muted-foreground">
            {RED_LINES.map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400/70" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-amber-500/35 bg-amber-500/[0.04] p-4">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 shrink-0 text-amber-400" />
            <h3 className="text-[14.5px] font-bold">قيد البناء: يُقال كخطة لا كخدمة</h3>
          </div>
          <ul className="mt-3 space-y-2 text-[13px] leading-7 text-muted-foreground">
            {BUILDING.map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="rounded-xl border border-primary/30 bg-primary/[0.04] p-4 text-[13px] leading-7 text-muted-foreground">
        <b className="text-foreground">القاعدة:</b> إن كان الوعد شيئًا تفعله المنصّة أو يفعله الفريق
        أو يقرّره الشريك، فسمّه باسمه. وإن كان قيد البناء، فقله كخطة. وإن كان نتيجةً لا نتحكّم
        فيها، فلا تعد به.
      </p>
    </section>
  );
}
