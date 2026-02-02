import { AnalticCard } from "@/components/shared/analtic-card";
import { SEOScoreOverall } from "@/components/shared/seo-doctor";

interface CategoriesStatsProps {
  stats: {
    total: number;
    withArticles: number;
    withoutArticles: number;
    createdThisMonth: number;
    averageSEO: number;
  };
}

export function CategoriesStats({ stats }: CategoriesStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <AnalticCard
        title="Total Categories"
        value={stats.total}
        icon="FolderTree"
        description="All categories in the system"
      />
      <AnalticCard
        title="With Articles"
        value={stats.withArticles}
        icon="FileText"
        description="Categories with published articles"
      />
      <AnalticCard
        title="Without Articles"
        value={stats.withoutArticles}
        icon="FileX"
        description="Categories with no articles"
      />
      <AnalticCard
        title="This Month"
        value={stats.createdThisMonth}
        icon="Calendar"
        description="Created this month"
      />
      <SEOScoreOverall value={stats.averageSEO} />
    </div>
  );
}
