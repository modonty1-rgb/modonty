import { cn } from "@/lib/utils";
import { getNpsResponses, type NpsGroup } from "./helpers/get-nps-responses";
import { NpsTable } from "./components/nps-table";

/**
 * **رضا العملاء (NPS)** — إجابات الاستبيان الذي يظهر للعميل في الكونسول (خالد ١٥ أكتوبر ٢٠٢٦، على نمط
 * تمارا): «من ٠ إلى ١٠، ما احتمال أن توصي بمدونتي؟». الرقم فوق = نسبة المروّجين ناقص نسبة المنتقدين على
 * آخر إجابة لكل عميل. المنتقد يظهر أيضاً في «عاجل» على اللوحة — يُتّصل به قبل أن يلغي.
 */
export default async function NpsPage({ searchParams }: { searchParams: Promise<{ group?: string }> }) {
  const sp = await searchParams;
  const initial = (["promoter", "passive", "detractor"] as const).includes(sp.group as NpsGroup) ? (sp.group as NpsGroup) : undefined;
  const { rows, summary } = await getNpsResponses();
  const tone =
    summary.nps === null ? "text-muted-foreground" : summary.nps >= 30 ? "text-emerald-600 dark:text-emerald-400" : summary.nps >= 0 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400";

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">رضا العملاء</h1>
          <p className="text-sm text-muted-foreground">
            استبيان الكونسول: «ما احتمال أن توصي بمدونتي؟» من ٠ إلى ١٠ — يظهر للعميل بعد أوّل مقال منشور، ثم كل ٩٠ يوماً.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex min-w-[110px] flex-col items-center rounded-lg border px-4 py-2">
            <span className={cn("text-3xl font-extrabold tabular-nums", tone)}>{summary.nps === null ? "—" : summary.nps}</span>
            <span className="text-xs text-muted-foreground">NPS (−١٠٠ إلى +١٠٠)</span>
          </div>
          <div className="flex min-w-[110px] flex-col items-center rounded-lg border px-4 py-2">
            <span className="text-3xl font-extrabold tabular-nums">{summary.answered}</span>
            <span className="text-xs text-muted-foreground">عميل أجاب</span>
          </div>
          <div className="flex min-w-[110px] flex-col items-center rounded-lg border px-4 py-2">
            <span className="text-3xl font-extrabold tabular-nums text-muted-foreground">{summary.dismissed}</span>
            <span className="text-xs text-muted-foreground">أغلق النافذة (تأجيل)</span>
          </div>
        </div>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          لا إجابات بعد — يظهر الاستبيان للعميل في الكونسول بعد أوّل مقال منشور له.
        </p>
      ) : (
        <NpsTable rows={rows} initial={initial} />
      )}
    </div>
  );
}
