import { AnalticCard } from "@/components/shared/analtic-card";
import { SEOScoreOverall } from "@/components/shared/seo-doctor";

interface IndustriesStatsProps {
  stats: {
    total: number;
    withClients: number;
    withoutClients: number;
    createdThisMonth: number;
    averageSEO: number;
  };
}

export function IndustriesStats({ stats }: IndustriesStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <AnalticCard
        title="Total Industries"
        value={stats.total}
        icon="Building2"
        description="All industries in the system"
      />
      <AnalticCard
        title="With Clients"
        value={stats.withClients}
        icon="Users"
        description="Industries with clients"
      />
      <AnalticCard
        title="Without Clients"
        value={stats.withoutClients}
        icon="UserX"
        description="Industries with no clients"
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
