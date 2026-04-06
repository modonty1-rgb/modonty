import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { getClients, getClientsStats, ClientFilters } from "./actions/clients-actions";
import { ClientsPageClient } from "./components/clients-page-client";
import { ClientsHeaderWrapper } from "./components/clients-header-wrapper";

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
  const [clients, stats] = await Promise.all([
    getClients(filters),
    getClientsStats(),
  ]);

  return (
    <ClientsHeaderWrapper clientCount={clients.length} stats={stats}>
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
    <div className="p-4 sm:p-6">
      <Suspense fallback={<TableSkeleton />}>
        <ClientsContent filters={filters} />
      </Suspense>
    </div>
  );
}
