import { DueList } from "../components/due-list";
import { getDueFollowUps } from "../helpers/get-due-follow-ups";

export const metadata = { title: "المتابعة — أدمن مدونتي" };

/**
 * قائمة «المتابعة» — الشاشة التي تُفتح أوّل الصباح.
 *
 * صفحة العملاء تجيب «مين عندنا؟»، وهذه تجيب «مين عليّا النهارده؟». وهما سؤالان مختلفان:
 * الأوّل جردٌ يُتصفَّح، والثاني قائمة عملٍ تُفرَغ.
 */
export default async function FollowUpsPage() {
  const { leads, total, truncated } = await getDueFollowUps();

  return (
    <div dir="rtl" className="space-y-4 p-4 sm:p-6">
      <header>
        <h1 className="text-xl font-semibold leading-tight">المتابعة</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          تقرير مشترك لفريق المبيعات: رحلة كل عميل غير مفقود، من أول متابعة إلى آخرها.
        </p>
      </header>

      <DueList leads={leads} />

      {truncated && (
        <p className="text-xs text-muted-foreground">
          معروض أحدث <span className="tabular-nums">{leads.length}</span> من{" "}
          <span className="tabular-nums">{total}</span> عميل غير مفقود.
        </p>
      )}
    </div>
  );
}
