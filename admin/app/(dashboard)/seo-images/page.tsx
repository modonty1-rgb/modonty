import { loadSeoImageGroups } from "./helpers/load-groups";
import { SeoGroupsTable, type SeoGroupSummary } from "./components/seo-groups-table";

// The writer-owned "SEO Images" surface. Main route = a table of CLIENTS (+ one مدوّنتي
// bucket for article/general images). Clicking a client navigates to /seo-images/[clientId].
export const dynamic = "force-dynamic";

export default async function SeoImagesPage() {
  const { groups, total, loaded, truncated } = await loadSeoImageGroups();
  const summaries: SeoGroupSummary[] = groups.map(
    ({ key, name, isModonty, count, avgScore, problems, breakdown, typeCounts }) => ({
      key,
      name,
      isModonty,
      count,
      avgScore,
      problems,
      breakdown,
      typeCounts,
    }),
  );

  // The headline the screen was missing. The chips above the table count ROWS (owners) —
  // «23» — while every row's status column counts IMAGES — «25». Same word, two units, side
  // by side, and Khalid read the small number as the whole problem. This line states the
  // image total once, in the unit the work is actually done in.
  const gradedImages = groups.reduce((s, g) => s + g.count, 0);
  const problemImages = groups.reduce((s, g) => s + g.problems, 0);

  return (
    <div className="max-w-[1100px] mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold">SEO Images</h1>
        <p className="text-sm text-muted-foreground mt-1">
          سيو الصور مجمّعة حسب العميل. افتح العميل لترى صوره وتكتب النص البديل والوصف. الأسوأ أولاً.
        </p>
        {/* Silence here was the bug: the page used to grade 500 of 870 rows and present the
            result as the whole picture. If the ceiling is ever hit again, it says so. */}
        {truncated && (
          <p className="mt-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
            معروض {loaded} من {total} صورة — الباقي لم يُقيَّم في هذه الصفحة، فالأرقام أدناه ناقصة.
          </p>
        )}
        <p className="mt-2 text-sm">
          {problemImages > 0 ? (
            <>
              <b className="tabular-nums text-amber-600 dark:text-amber-500">{problemImages}</b>{" "}
              <span className="text-muted-foreground">صورة تحتاج شغل من {gradedImages}</span>
            </>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400">كل الصور مكتملة — {gradedImages} صورة.</span>
          )}
        </p>
      </div>
      <SeoGroupsTable groups={summaries} />
    </div>
  );
}
