import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { getClients, getClientsStats, ClientFilters } from "./actions/clients-actions";
import { ClientsPageClient } from "./components/clients-page-client";
import { ClientsHeaderWrapper } from "./components/clients-header-wrapper";
import { ClientsTabs } from "./components/clients-tabs";
import {
  getJbrseoSubscribers,
  getJbrseoSubscriberStats,
} from "../subscription-tiers/helpers/jbrseo-queries";
import { getTierConfigs } from "../subscription-tiers/actions/tier-actions";
import { TierDistribution } from "../subscription-tiers/components/tier-distribution";

function TableSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-12 w-full" />
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

async function ClientsContent({ filters }: { filters: ClientFilters }) {
  const [clients, stats, signupsRows, signupStats, tiers] = await Promise.all([
    getClients(filters),
    getClientsStats(),
    getJbrseoSubscribers(),
    getJbrseoSubscriberStats(),
    getTierConfigs(),
  ]);

  return (
    <ClientsHeaderWrapper clientCount={clients.length} stats={stats}>
      <ClientsTabs
        clientsCount={clients.length}
        signupsCount={signupStats.total}
        signupsRows={signupsRows}
        clientsSlot={<ClientsPageClient clients={clients} />}
        distributionSlot={<TierDistribution tiers={tiers} />}
      />
    </ClientsHeaderWrapper>
  );
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{
    hasArticles?: string;
    createdFrom?: string;
    createdTo?: string;
    minArticleCount?: string;
    maxArticleCount?: string;
  }>;
}) {
  const params = await searchParams;
  const filters: ClientFilters = {
    hasArticles:
      params.hasArticles === "yes"
        ? true
        : params.hasArticles === "no"
          ? false
          : undefined,
    createdFrom: params.createdFrom ? new Date(params.createdFrom) : undefined,
    createdTo: params.createdTo ? new Date(params.createdTo) : undefined,
    minArticleCount: params.minArticleCount ? parseInt(params.minArticleCount) : undefined,
    maxArticleCount: params.maxArticleCount ? parseInt(params.maxArticleCount) : undefined,
  };

  return (
    <div className="">
      <Suspense fallback={<TableSkeleton />}>
        <ClientsContent filters={filters} />
      </Suspense>
    </div>
  );
}
