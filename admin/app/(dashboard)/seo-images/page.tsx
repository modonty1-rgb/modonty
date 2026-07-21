import { loadSeoImageGroups } from "./helpers/load-groups";
import { SeoGroupsTable, type SeoGroupSummary } from "./components/seo-groups-table";

// The writer-owned "SEO Images" surface. Main route = a table of CLIENTS (+ one مدوّنتي
// bucket for article/general images). Clicking a client navigates to /seo-images/[clientId].
export const dynamic = "force-dynamic";

export default async function SeoImagesPage() {
  const groups = await loadSeoImageGroups();
  const summaries: SeoGroupSummary[] = groups.map(({ key, name, isModonty, count, avgScore, problems, typeCounts }) => ({
    key,
    name,
    isModonty,
    count,
    avgScore,
    problems,
    typeCounts,
  }));

  return (
    <div className="max-w-[1100px] mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold">SEO Images</h1>
        <p className="text-sm text-muted-foreground mt-1">
          سيو الصور مجمّعة حسب العميل. افتح العميل لترى صوره وتكتب النص البديل والوصف. الأسوأ أولاً.
        </p>
      </div>
      <SeoGroupsTable groups={summaries} />
    </div>
  );
}
