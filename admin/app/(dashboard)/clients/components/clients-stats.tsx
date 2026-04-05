import { AnalticCard } from "@/components/shared/analtic-card";
import type { ClientsStats as ClientsStatsType } from "../actions/clients-actions/types";

interface ClientsStatsProps {
  stats: ClientsStatsType;
}

export function ClientsStats({ stats }: ClientsStatsProps) {
  return (
    <div className="flex gap-4 mb-4 w-full">
      <div className="flex-1 [&>*]:w-full">
        <AnalticCard
          title="Clients"
          value={String(stats.total ?? 0)}
          icon="Users"
          description={`${stats.createdThisMonth} new this month`}
          variant="compact"
        />
      </div>
      <div className="flex-1 [&>*]:w-full">
        <AnalticCard
          title="Delivery"
          value={`${stats.delivery.deliveryRate}%`}
          icon="Package"
          description={`${stats.delivery.totalDelivered}/${stats.delivery.totalPromised}`}
          variant="compact"
        />
      </div>
      <div className="flex-1 [&>*]:w-full">
        <AnalticCard
          title="صحة البحث"
          value={`${stats.averageSEO}%`}
          icon="Search"
          description={stats.averageSEO >= 80 ? "جيد" : stats.averageSEO >= 60 ? "يحتاج تحسين" : "ضعيف"}
          variant="compact"
        />
      </div>
    </div>
  );
}
