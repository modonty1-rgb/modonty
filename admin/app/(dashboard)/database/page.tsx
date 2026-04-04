import { getDatabaseHealth } from "./actions/database-health";
import { DatabaseOverview } from "./components/database-overview";

export default async function DatabasePage() {
  const health = await getDatabaseHealth();
  const isLocal = process.env.NODE_ENV !== "production";

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight">Database Overview</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Live snapshot of all your data — {health.totalRecords.toLocaleString()} total records
        </p>
      </div>
      <DatabaseOverview health={health} isLocal={isLocal} />
    </div>
  );
}
