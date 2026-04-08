import { getMedia, getClients, getMediaStats, type MediaFilters } from "./actions/media-actions";
import { MediaFilters as MediaFiltersComponent } from "./components/media-filters";
import { MediaPageClient } from "./components/media-page-client";
import { MediaStats } from "./components/media-stats";

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{
    clientId?: string;
    mimeType?: string;
    type?: string;
    search?: string;
    used?: string;
    sort?: string;
    page?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}) {
  const params = await searchParams;

  const filters: MediaFilters = {
    clientId: params.clientId && params.clientId !== "all" ? params.clientId : undefined,
    mimeType: params.mimeType && params.mimeType !== "all" ? params.mimeType : undefined,
    type: params.type && params.type !== "all" ? (params.type as MediaFilters["type"]) : undefined,
    search: params.search || undefined,
    used: params.used === "used" ? true : params.used === "unused" ? false : undefined,
    dateFrom: params.dateFrom ? new Date(params.dateFrom) : undefined,
    dateTo: params.dateTo ? new Date(`${params.dateTo}T23:59:59.999Z`) : undefined,
    sort: params.sort || "newest",
    page: params.page ? parseInt(params.page, 10) : 1,
  };

  const [mediaResult, clients, stats] = await Promise.all([
    getMedia(filters),
    getClients(),
    getMediaStats(),
  ]);

  const transformedMedia = mediaResult.items.map((m) => ({
    ...m,
    client: m.client || undefined,
    isUsed: m._count.featuredArticles > 0 || m._count.logoClients > 0 || m._count.heroImageClients > 0 || m._count.heroImageClients > 0,
  }));

  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-xl font-semibold">Media Library</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Manage all media files in the system</p>
          </div>
          <MediaStats stats={stats} />
        </div>
        <MediaFiltersComponent clients={clients} defaultClientId={params.clientId} />
      </div>
      <MediaPageClient
        media={transformedMedia}
        sortBy={params.sort || "newest"}
        searchQuery={params.search || ""}
        pagination={{
          page: mediaResult.page,
          totalPages: mediaResult.totalPages,
          total: mediaResult.total,
          perPage: mediaResult.perPage,
        }}
      />
    </div>
  );
}
