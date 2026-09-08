import Link from "next/link";
import { ArrowLeft, CalendarClock } from "lucide-react";

import { formatCount } from "../helpers/format-count";
import { describeDue } from "../helpers/funnel";
import type { SalesLeadRow } from "../helpers/get-sales-leads";

/**
 * شريطٌ يقول ما عليها اليوم — ولا يكرّر قائمة المتابعة.
 *
 * كان هذا القسم يعرض القائمة كاملةً بأزرار الاتصال والتأجيل، ثم صارت للمتابعة صفحتها. وقائمتان
 * بنفس الصفوف وأفعالٍ مختلفة تصيران مصدرين للحقيقة: تُؤجَّل من هنا فلا يتغيّر شيء هناك، أو
 * يُصلَح أحدهما ويُنسى الآخر. فبقي هنا **الرقم والأسماء الثلاثة الأولى** — ما يكفي لتعرف أنّ
 * عليها شغلاً — والفعل كلّه في مكانٍ واحد خلف ضغطة.
 *
 * ويختفي كلّه حين لا يكون فيه أحد: صندوقٌ فارغ اسمه «اللي عليكِ النهارده» يعلّم العين أن
 * تتخطّاه، فحين يمتلئ لا تراه.
 */
export function DueToday({ leads }: { leads: SalesLeadRow[] }) {
  if (leads.length === 0) return null;

  const overdue = leads.filter((l) => describeDue(l.nextActionAt).tone === "overdue").length;
  return (
    <Link
      href="/sales-leads/follow-ups"
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-amber-500/25 bg-amber-500/[0.04] px-4 py-3 transition-colors hover:bg-amber-500/[0.08]"
    >
      <CalendarClock className="size-4 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden />
      <span className="text-sm font-semibold">متابعات اليوم</span>

      <span className="text-xs text-muted-foreground">
        {overdue > 0 && (
          <>
            <span className="font-medium text-rose-700 dark:text-rose-400">
              <span className="tabular-nums">{formatCount(overdue)}</span> متأخّر
            </span>
            {" · "}
          </>
        )}
        <span className="tabular-nums">{formatCount(leads.length)}</span> في المجموع
      </span>

      <span className="ms-auto inline-flex shrink-0 items-center gap-1 text-xs font-medium">
        عرض المتابعات
        <ArrowLeft className="size-3.5 rtl:rotate-180" aria-hidden />
      </span>
    </Link>
  );
}
