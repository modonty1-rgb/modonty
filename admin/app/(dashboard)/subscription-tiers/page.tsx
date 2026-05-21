import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { getTierConfigs } from "./actions/tier-actions";
import {
  getJbrseoSubscribers,
  getJbrseoSubscriberStats,
} from "./helpers/jbrseo-queries";
import { TierKpiStrip } from "./components/tier-kpi-strip";
import { TierCards } from "./components/tier-cards";
import { TierDistribution } from "./components/tier-distribution";
import { SyncButton } from "./components/sync-button";
import { SubscribersTable } from "./components/subscribers-table";

export const dynamic = "force-dynamic";

export default async function SubscriptionTiersPage() {
  const [tiers, signupsRows, signupStats] = await Promise.all([
    getTierConfigs(),
    getJbrseoSubscribers(),
    getJbrseoSubscriberStats(),
  ]);
  const totalClients = tiers.reduce((sum, t) => sum + t._count.clients, 0);

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold leading-tight">Pricing & Leads</h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          Subscription plans · dual-market pricing · jbrseo signup leads
        </p>
      </div>

      {/* Unified KPI strip — visible across both tabs */}
      <TierKpiStrip
        tiers={tiers}
        signups={{
          total: signupStats.total,
          lastSyncedAt: signupStats.lastSyncedAt,
        }}
      />

      {/* Tabs */}
      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="h-auto p-1 bg-muted/40 border">
          <TabsTrigger value="plans" className="gap-2">
            Plans
            <span className="text-[10px] text-muted-foreground">{tiers.length}</span>
          </TabsTrigger>
          <TabsTrigger value="signups" className="gap-2">
            Signups
            {signupStats.total > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-none bg-pink-500/20 text-pink-600 dark:text-pink-400">
                {signupStats.total}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-4 space-y-6">
          <TierCards tiers={tiers} totalClients={totalClients} />
          <TierDistribution tiers={tiers} />
        </TabsContent>

        <TabsContent value="signups" className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-sm font-semibold">jbrseo Signups</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                People who signed up via jbrseo&apos;s pricing page · synced manually
              </p>
            </div>
            <SyncButton />
          </div>

          <Card>
            <CardContent className="pt-6">
              <SubscribersTable rows={signupsRows} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
