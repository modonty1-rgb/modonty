import Link from "next/link";
import { ArrowLeft, CalendarClock } from "lucide-react";

import { getRenewalsDue } from "@/lib/orders/renewals-due";

/**
 * التجديداتُ المستحقّة — البطاقةُ التي تجعل اشتراكاً منتهياً مرئيّاً.
 *
 * كانت الدائرةُ الماليّة تنتهي بلا مَن يُخبر أحداً: الحسابُ موجود والفلترُ موجود، ولا
 * شاشةَ تفتحها العينُ يوميّاً تقول «٣ انتهت». وبطاقةٌ على اللوحة أبسطُ ما يقفل الحلقة —
 * بلا كرون يُراقَب ولا بريدٍ يُضبط ولا طابورٍ يُدار (خالد ١٨ سبتمبر ٢٠٢٦: «ما أبغى أي تعقيد»).
 *
 * وتختفي تماماً حين لا يستحقّ أحد: لوحةٌ تعرض صندوقاً دائماً تُعلّم العينَ أن تتخطّاه.
 */
export async function RenewalsDueCard() {
  const { expired, soon, worstDaysPast } = await getRenewalsDue();
  if (expired === 0 && soon === 0) return null;

  // المنتهي أحمرُ لأنّه خدمةٌ تُقدَّم بلا مقابل الآن؛ والمقترِبُ بنفسجيٌّ كصفوفه في الجدول.
  const urgent = expired > 0;
  const tone = urgent
    ? { border: "border-red-500/40", bg: "bg-red-500/[0.07]", hover: "hover:bg-red-500/[0.12]", chip: "bg-red-500/15 text-red-600 dark:text-red-400", title: "text-red-700 dark:text-red-400", arrow: "text-red-600/70 dark:text-red-500/70" }
    : { border: "border-violet-500/40", bg: "bg-violet-500/[0.07]", hover: "hover:bg-violet-500/[0.12]", chip: "bg-violet-500/15 text-violet-600 dark:text-violet-400", title: "text-violet-700 dark:text-violet-400", arrow: "text-violet-600/70 dark:text-violet-500/70" };

  return (
    <Link
      href={urgent ? "/orders?view=expired" : "/orders"}
      className={`group flex items-center gap-4 rounded-2xl border ${tone.border} ${tone.bg} px-5 py-4 transition-colors ${tone.hover}`}
    >
      <span className={`grid size-10 shrink-0 place-items-center rounded-full ${tone.chip}`}>
        <CalendarClock className="size-5" aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <p className={`text-sm font-bold ${tone.title}`}>
          {expired > 0
            ? expired === 1
              ? "اشتراكٌ انتهى ولم يُجدَّد"
              : `${expired} اشتراكات انتهت ولم تُجدَّد`
            : soon === 1
              ? "اشتراكٌ ينتهي خلال شهر"
              : `${soon} اشتراكات تنتهي خلال شهر`}
        </p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {expired > 0 && soon > 0 ? (
            <>
              و<span className="font-semibold tabular-nums text-foreground">{soon}</span> تنتهي خلال شهر
              {worstDaysPast !== null && <> · أقدمها مضى عليها <span className="tabular-nums">{worstDaysPast}</span> يوم</>}
            </>
          ) : expired > 0 ? (
            worstDaysPast !== null ? <>مضى على أقدمها <span className="tabular-nums">{worstDaysPast}</span> يوم — الخدمة تُقدَّم بلا مقابل</> : "الخدمة تُقدَّم بلا مقابل"
          ) : (
            "جدِّدها قبل أن تنقطع الخدمة"
          )}
        </p>
      </div>

      <ArrowLeft className={`size-4 shrink-0 ${tone.arrow} transition-transform group-hover:-translate-x-0.5`} aria-hidden />
    </Link>
  );
}
