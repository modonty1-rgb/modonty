import { DueList } from "../components/due-list";
import { formatCount } from "../helpers/format-count";
import { getDueFollowUps } from "../helpers/get-due-follow-ups";

export const metadata = { title: "المتابعة — أدمن مدونتي" };

/**
 * قائمة «المتابعة» — الشاشة التي تُفتح أوّل الصباح.
 *
 * صفحة العملاء تجيب «مين عندنا؟»، وهذه تجيب «مين عليّا النهارده؟». وهما سؤالان مختلفان:
 * الأوّل جردٌ يُتصفَّح، والثاني قائمة عملٍ تُفرَغ.
 */
export default async function FollowUpsPage() {
  const { overdue, today, upcoming, total, truncated } = await getDueFollowUps();

  return (
    <div dir="rtl" className="space-y-4 p-4 sm:p-6">
      <header>
        <h1 className="text-xl font-semibold leading-tight">المتابعة</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {overdue.length > 0 ? (
            <>
              <span className="font-medium text-rose-700 tabular-nums dark:text-rose-400">
                {formatCount(overdue.length)}
              </span>{" "}
              متأخّر ·{" "}
            </>
          ) : null}
          <span className="tabular-nums">{formatCount(today.length)}</span> اليوم ·{" "}
          <span className="tabular-nums">{formatCount(upcoming.length)}</span> قادم
        </p>
      </header>

      <DueList overdue={overdue} today={today} upcoming={upcoming} />

      {truncated && (
        <p className="text-xs text-muted-foreground">
          معروض أقرب <span className="tabular-nums">{formatCount(overdue.length + today.length + upcoming.length)}</span> من{" "}
          <span className="tabular-nums">{formatCount(total)}</span> موعد مفتوح.
        </p>
      )}
    </div>
  );
}
