import { getCoreClientId } from "@modonty/shared/lib/core-client";
import { canDeleteMedia } from "@/lib/media/can-delete-media";
import { deleteMedia } from "@/lib/media/delete-media";
// The in-place swap still lives with the Media section; it rebuilds client SEO through the
// clients actions, so it cannot move to lib/ without them. One cross-route import, noted.
import { saveOptimizedImage } from "@/lib/media/optimize-image";
import { MEDIA_SPECS } from "@/lib/media/media-specs";
import { MediaPageClient } from "@/components/shared/media-library/media-page-client";
import { CLIENT_MEDIA_KINDS, type ClientMediaKind } from "./helpers/client-media-kinds";
import { getClientsMediaUniverse } from "./helpers/get-clients-media-universe";
import { getClientsMedia } from "./helpers/get-clients-media";
import { getClientsMediaCounts } from "./helpers/get-clients-media-counts";
import { getClientMediaSlots } from "./helpers/get-client-media-slots";
import { getMediaOwnerClients } from "./helpers/get-media-owner-clients";
import { MediaKindToggles, MediaUsageSelect, UrlSearchPicker } from "@/components/shared/media-library/media-filter-bar";
import { ClientMediaSlots } from "./components/client-media-slots";
import { ClientUploadProvider, ToolbarUploadButton } from "./components/client-upload";

/**
 * Clients › Media (Khalid, 26 Sep 2026): the Media library's own grid — search, sort, views,
 * delete, upload — narrowed to what clients own. No «General», no Modonty; the main library
 * is untouched. Pick a client and its four page images show above the grid, set or missing.
 */
export default async function ClientsMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; kind?: string; issues?: string; used?: string; search?: string; sort?: string; page?: string }>;
}) {
  const [params, coreClientId] = await Promise.all([searchParams, getCoreClientId()]);

  const kind = CLIENT_MEDIA_KINDS.find((k) => k.value === params.kind);
  const clientId = params.clientId && params.clientId !== "all" && params.clientId !== coreClientId ? params.clientId : undefined;

  // The page's links and triangle files beside the picked client's page images; every query
  // below filters with them. A picked client's page images sit in the box above the grid. With no type or search on,
  // the grid shows the REST of its files (gallery, reels, old or unused) — not the same four
  // again (Khalid, 26 Sep 2026: «العميل هذا فوق في الصور… وتحت برضو… تكرار»).
  const [universe, slots] = await Promise.all([
    getClientsMediaUniverse(coreClientId),
    clientId ? getClientMediaSlots(clientId) : null,
  ]);

  // The triangle files of the whole page (every client) — the «Issues» toggle and its count.
  const issuesOn = params.issues === "1";
  const issueIds = universe.issueIds;
  const query = {
    clientId,
    issueIds: issuesOn ? issueIds : undefined,
    kind: kind?.value as ClientMediaKind | undefined,
    used: params.used === "used" ? true : params.used === "unused" ? false : undefined,
    search: params.search || undefined,
    sort: params.sort || "newest",
    page: params.page ? Math.max(1, parseInt(params.page, 10) || 1) : 1,
  };

  const othersOnly = !!slots && !kind && !query.search && !issuesOn;

  const [result, clients, counts] = await Promise.all([
    getClientsMedia(universe, { ...query, excludeIds: othersOnly ? slots.shownIds : undefined }),
    getMediaOwnerClients(coreClientId, universe, { kind: query.kind, used: query.used, search: query.search, issueIds: query.issueIds }),
    getClientsMediaCounts(universe, { clientId, kind: query.kind, used: query.used, search: query.search }, issuesOn),
  ]);

  const uploadBase = `/media/upload?for=clients${clientId ? `&clientId=${clientId}` : ""}`;
  const uploadHref = kind?.role ? `${uploadBase}&role=${kind.role}` : uploadBase;

  // A filtered empty page names what is missing and offers exactly that upload.
  // The empty message answers the filter that emptied the page, not «no files yet».
  const emptyState = issuesOn
    ? { title: "No issues here", hint: "Every file under these filters has the right format, ratio and size.", action: <span /> }
    : othersOnly && query.used === undefined
    ? {
        title: "No other files",
        hint: `Gallery images, reels and replaced images of ${slots.name} show here. Its page images are above.`,
        action: <span />,
      }
    : query.used !== undefined && !kind
    ? {
        title: query.used ? "Nothing in use here" : "Nothing unused here",
        hint: query.used
          ? "None of these files is on a page yet."
          : `Every file${slots ? ` of ${slots.name}` : ""} is in use — nothing to clean up.`,
        action: <span />,
      }
    : kind
    ? {
        title: `No ${kind.label.toLowerCase()} yet`,
        hint: kind.role
          ? `${MEDIA_SPECS[kind.role].ratioLabel} · ${MEDIA_SPECS[kind.role].width}×${MEDIA_SPECS[kind.role].height}${clientId ? "" : " — pick a client, or upload and choose one."}`
          : "Nothing of this kind matches the current filters.",
        action: <ToolbarUploadButton clients={clients} clientId={clientId} role={kind.role} label={kind.role ? `Upload ${kind.label}` : "Upload media"} />,
      }
    : slots
      ? {
          title: `No files for ${slots.name} yet`,
          hint: "Start with its logo and covers — the slots above upload straight to each one.",
          action: <ToolbarUploadButton clients={clients} clientId={clientId} label="Upload media" />,
        }
      : undefined;

  return (
    <ClientUploadProvider>
    <div className="max-w-[1200px] mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Client Media</h1>
        {/* Says whose files these are — «of every client» stayed while one client was picked. */}
        <p className="text-xs text-muted-foreground mt-0.5">
          {slots ? `${slots.name} · ${counts.all} file${counts.all === 1 ? "" : "s"}` : "Logos, covers, mini images, galleries and reels of every client"}
          {counts.createdThisMonth ? ` · +${counts.createdThisMonth} this month` : ""}
        </p>
      </div>

      {/* Whose files first, then what kind: the picker opens the client's box right below it. */}
      <div className="flex flex-wrap items-start gap-3">
        <UrlSearchPicker
          param="clientId"
          options={clients.map((c) => ({ id: c.id, name: c.name, count: c.files }))}
          allLabel="All clients"
          searchPlaceholder="Search clients…"
          ariaLabel="Client"
        />
        <MediaKindToggles
          kinds={CLIENT_MEDIA_KINDS.map(({ value, label }) => ({ value, label }))}
          total={counts.all}
          byKind={counts.byKind}
          issues={counts.issues}
          extra={{
            reels:
              counts.reelsPending > 0 ? (
                <span className="ms-1 rounded-full bg-amber-500 px-1.5 text-[10px] font-semibold text-white" title="Reels waiting for approval">
                  {counts.reelsPending} pending
                </span>
              ) : null,
          }}
        />
      </div>

      {slots && clientId ? <ClientMediaSlots clientId={clientId} name={slots.name} slots={slots.slots} /> : null}

      <MediaPageClient
        media={result.items}
        sortBy={query.sort}
        searchQuery={params.search || ""}
        pagination={{ page: result.page, totalPages: result.totalPages, total: result.total, perPage: result.perPage }}
        deleteAction={deleteMedia}
        canDeleteAction={canDeleteMedia}
        basePath="/clients/media"
        uploadHref={uploadHref}
        uploadSlot={<ToolbarUploadButton clients={clients} clientId={clientId} role={kind?.role} />}
        toolbarExtra={<MediaUsageSelect used={counts.used} unused={counts.unused} />}
        emptyState={emptyState}
        gridHeading={
          othersOnly ? (
            <h2 className="text-sm font-semibold">
              Other files <span className="font-normal text-muted-foreground">· {result.total} · gallery, reels and anything not on the page</span>
            </h2>
          ) : null
        }
        lockUsedDelete
        allowGroup={false}
        convertAction={saveOptimizedImage}
      />
    </div>
    </ClientUploadProvider>
  );
}
