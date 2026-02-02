import { getClients, getClientsStats, ClientFilters } from "./actions/clients-actions";
import { ClientsStats } from "./components/clients-stats";
import { ClientsPageClient } from "./components/clients-page-client";
import { ClientsHeaderWrapper } from "./components/clients-header-wrapper";
import type { ClientForList } from "./actions/clients-actions/types";

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

  const [clients, stats] = await Promise.all([getClients(filters), getClientsStats()]);

  const getDescription = () => {
    if (filters.hasArticles === true) return "Viewing clients with articles";
    if (filters.hasArticles === false) return "Viewing clients without articles";
    if (filters.createdFrom || filters.createdTo) return "Viewing clients by date range";
    if (filters.minArticleCount !== undefined || filters.maxArticleCount !== undefined)
      return "Viewing clients by article count";
    return "Manage all clients in the system";
  };

  return (
    <div className="container mx-auto max-w-[1128px] px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <ClientsHeaderWrapper
        clientCount={clients.length}
        description={getDescription()}
      >
        <ClientsStats stats={stats} />
        <ClientsPageClient
          clients={clients}
          clientCount={clients.length}
          description={getDescription()}
        />
      </ClientsHeaderWrapper>
    </div>
  );
}
