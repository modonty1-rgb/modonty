import { Gift } from "lucide-react";

/**
 * ملخّصٌ نحيف أعلى صفحة الدفع — اسم الباقة والإجمالي. شارة الالتزام بالتسليم تعيش تحت زرّ
 * الدفع (مصدرٌ واحد)، فلا تُكرَّر هنا. النحافة مقصودة: الثقل البصريّ لسطح الدفع نفسه.
 */
export function OrderSummary({
  planName,
  totalDisplay,
  billingLabel,
  freeMonths = 0,
  vatNote,
}: {
  planName: string;
  totalDisplay: string;
  /** أشهر **الخدمة** لا المدفوعة — نفس الرقم الذي على بطاقة الباقة. */
  billingLabel: string;
  /** أشهر مجانية على المدّة المختارة. صفراً لا يُرسم السطر — لا هديّة تُخترع. */
  freeMonths?: number;
  /** السطر الضريبي من القاعدة لا من الكود (PAY-G20). */
  vatNote?: string | null;
}) {
  return (
    <section aria-label="ملخص الاشتراك" className="rounded-2xl border border-border bg-card/60 px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11.5px] font-semibold text-muted-foreground">باقتك</p>
          <h2 className="mt-0.5 truncate text-lg font-black text-foreground sm:text-xl">{planName}</h2>
        </div>

        <div className="shrink-0 text-end">
          <p dir="ltr" className="text-xl font-black leading-none text-foreground sm:text-2xl">{totalDisplay}</p>
          <p className="mt-1 text-[11.5px] leading-[1.6] text-muted-foreground">
            {billingLabel}{vatNote ? ` · ${vatNote}` : ""}
          </p>
        </div>
      </div>

      {/* الهديّة تُحمَل إلى الصفحة التي يُسلَّم فيها المال فعلاً. بطاقة الباقة تعد بأشهر
          مجانية، فمشترٍ اختار المدّة بسببها ثم وصل هنا ولم يجد ذكرها يفقد — عند لحظة
          الثقة بالذات — ما أقنعه. و«منها» لا «ومعها»: المدّة أعلاه تعدّ أشهر الخدمة،
          فالشهر المجاني داخلها لا مضافٌ إليها.

          و`text-star-ink` لا `amber` ولا `text-star`: هو حبر التوكن الذهبيّ نفسه الذي تُعبَّأ
          به شارة الهدية على بطاقة الباقة — فالمشتري يرى العائلة اللونية ذاتها في الموضعين
          ويتغيّران من مكانٍ واحد. و`star` الأصل لامعٌ لأنه سطحٌ يُكتب فوقه؛ نصّاً على أبيض
          كان يقرأ ١٫٩٢:١ (قيس ١٥ سبتمبر ٢٠٢٦) والحدّ ٤٫٥:١، فالحبر هو الصحيح هنا. */}
      {freeMonths > 0 && (
        <p className="mt-3 flex items-center gap-1.5 border-t border-t-border pt-3 text-[12px] font-bold leading-[1.6] text-star-ink">
          <Gift className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
          {freeMonths === 1 ? "منها شهر خدمة مجاني" : `منها ${new Intl.NumberFormat("ar-SA").format(freeMonths)} شهور خدمة مجانية`}
        </p>
      )}
    </section>
  );
}
