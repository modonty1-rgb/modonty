import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { getClients, getClientsStats, ClientFilters } from "./actions/clients-actions";
import { ClientsStats } from "./components/clients-stats";
import { ClientsPageClient } from "./components/clients-page-client";
import { ClientsHeaderWrapper } from "./components/clients-header-wrapper";

function StatsSkeleton() {
  return (
    <div className="flex gap-4 mb-4 w-full">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex-1">
          <Skeleton className="h-24 w-full" />
        </div>
      ))}
    </div>
  );
}

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

async function StatsSection() {
  const stats = await getClientsStats();
  return <ClientsStats stats={stats} />;
}

async function ClientsTableSection({ filters }: { filters: ClientFilters }) {
  const clients = await getClients(filters);

  const getDescription = () => {
    if (filters.hasArticles === true) return "Viewing clients with articles";
    if (filters.hasArticles === false) return "Viewing clients without articles";
    if (filters.createdFrom || filters.createdTo) return "Viewing clients by date range";
    if (filters.minArticleCount !== undefined || filters.maxArticleCount !== undefined)
      return "Viewing clients by article count";
    return "Manage all clients in the system";
  };

  return (
    <ClientsHeaderWrapper
      clientCount={clients.length}
      description={getDescription()}
    >
      <ClientsPageClient clients={clients} />
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
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <ClientsTableSection filters={filters} />
      </Suspense>
    </div>
  );
}
