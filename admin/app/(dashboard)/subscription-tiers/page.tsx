import { getTierConfigs } from "./actions/tier-actions";
import { TierKpiStrip } from "./components/tier-kpi-strip";
import { TierCards } from "./components/tier-cards";

export const dynamic = "force-dynamic";

export default async function SubscriptionTiersPage() {
  const tiers = await getTierConfigs();
  const totalClients = tiers.reduce((sum, t) => sum + t._count.clients, 0);

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold leading-tight">Subscription Tiers</h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          Dual-market pricing plans · Saudi Arabia + Egypt
        </p>
      </div>

      <TierKpiStrip tiers={tiers} signups={null} />

      <TierCards tiers={tiers} totalClients={totalClients} />
    </div>
  );
}
