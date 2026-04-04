import { getMedia, getClients, getMediaStats, type MediaFilters } from "./actions/media-actions";
import { MediaGrid } from "./components/media-grid";
import { MediaFilters as MediaFiltersComponent } from "./components/media-filters";
import { MediaToolbar } from "./components/media-toolbar";
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
  }>;
}) {
  const params = await searchParams;

  const filters: MediaFilters = {
    clientId: params.clientId && params.clientId !== "all" ? params.clientId : undefined,
    mimeType: params.mimeType && params.mimeType !== "all" ? params.mimeType : undefined,
    type: params.type && params.type !== "all" ? (params.type as any) : undefined,
    search: params.search || undefined,
    used: params.used === "used" ? true : params.used === "unused" ? false : undefined,
  };

  const [media, clients, stats] = await Promise.all([
    getMedia(filters),
    getClients(),
    getMediaStats(),
  ]);

  // Transform client from null to undefined to match Media type
  const transformedMedia = media.map((m) => ({
    ...m,
    client: m.client || undefined,
  }));

  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Media Library</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Manage all media files in the system</p>
      </div>
      <MediaStats stats={stats} />
      <MediaFiltersComponent clients={clients} defaultClientId={params.clientId} />
      <MediaPageClient media={transformedMedia} sortBy={params.sort || "newest"} />
    </div>
  );
}
