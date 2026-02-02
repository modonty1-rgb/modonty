import { getTierConfigs } from "./actions/tier-actions";
import { PageHeader } from "@/components/shared/page-header";
import { TierTable } from "./components/tier-table";
import { TierCards } from "./components/tier-cards";

export default async function SubscriptionTiersPage() {
  const tiers = await getTierConfigs();

  return (
    <div className="container mx-auto max-w-[1128px]">
      <PageHeader
        title="Subscription Tiers"
        description="Manage subscription tier configurations, pricing, and article limits"
      />
      <TierCards tiers={tiers} />
      <TierTable tiers={tiers} />
    </div>
  );
}
