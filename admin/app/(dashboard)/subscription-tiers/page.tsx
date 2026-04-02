import { getTierConfigs } from "./actions/tier-actions";
import { TierCards } from "./components/tier-cards";
import { TierTable } from "./components/tier-table";

export default async function SubscriptionTiersPage() {
  const tiers = await getTierConfigs();

  const totalClients = tiers.reduce((sum, t) => sum + t._count.clients, 0);
  const totalArticles = tiers.reduce((sum, t) => sum + t.articleCount, 0);
  const activePlans = tiers.filter((t) => t.isActive).length;

  return (
    <div className="container mx-auto max-w-[1128px] space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold leading-tight">Plans & Pricing</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {activePlans} active plan{activePlans !== 1 ? "s" : ""} · {totalClients} client{totalClients !== 1 ? "s" : ""} · {totalArticles} published article{totalArticles !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Plan Cards */}
      <TierCards tiers={tiers} />

      {/* Table */}
      <TierTable tiers={tiers} />
    </div>
  );
}
