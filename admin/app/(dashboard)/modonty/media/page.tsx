import { getCoreClientId } from "@modonty/shared/lib/core-client";
import { db } from "@/lib/db";
import { canDeleteMedia } from "@/lib/media/can-delete-media";
import { deleteMedia } from "@/lib/media/delete-media";
// Same one cross-route import Clients › Media carries: the in-place WebP swap lives with the
// Media section and rebuilds SEO through actions that cannot move to lib/ without it.
import { saveOptimizedImage } from "@/app/(dashboard)/media/actions/optimize-image";
import Link from "next/link";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MEDIA_SPECS } from "@/lib/media/media-specs";
import { MediaPageClient } from "@/components/shared/media-library/media-page-client";
import { MediaKindToggles, MediaUsageSelect } from "@/components/shared/media-library/media-filter-bar";
import { MODONTY_MEDIA_KINDS, type ModontyMediaKind } from "./helpers/modonty-media-kinds";
import { getSiteImageUrls } from "./helpers/get-site-image-urls";
import { getModontyMedia } from "./helpers/get-modonty-media";
import { getModontyMediaCounts } from "./helpers/get-modonty-media-counts";
import { modontyMediaWhere } from "./helpers/modonty-media-where";
import { findIssueMediaIds } from "@/lib/media/find-issue-media-ids";
import { ModontyUploadButton, ModontyUploadProvider } from "./components/modonty-upload";

/**
 * Modonty › Media (27 Sep 2026): the Media library's grid, narrowed to what Modonty itself
 * owns — its site pages, articles, brand, gallery and reels. Same as Clients › Media with the
 * owner fixed, so there is no client picker and Upload never asks «for whom?».
 */
export default async function ModontyMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; issues?: string; used?: string; search?: string; sort?: string; page?: string }>;
}) {
  const [params, coreClientId, siteUrls] = await Promise.all([searchParams, getCoreClientId(), getSiteImageUrls()]);

  if (!coreClientId) {
    return (
      <div className="max-w-[1200px] mx-auto rounded-lg border border-dashed p-10 text-center">
        <h1 className="text-base font-semibold">Modonty is not set as a client yet</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose Modonty&apos;s own client in Settings › System, then its files show here.
        </p>
      </div>
    );
  }

  const core = await db.client.findUnique({ where: { id: coreClientId }, select: { name: true } });
  const coreName = core?.name ?? "Modonty";

  const kind = MODONTY_MEDIA_KINDS.find((k) => k.value === params.kind);
  // The triangle files of the whole page — the «Issues» toggle and its count.
  const issuesOn = params.issues === "1";
  const issueIds = await findIssueMediaIds(modontyMediaWhere(coreClientId, siteUrls, {}));
  const query = {
    issueIds: issuesOn ? issueIds : undefined,
    kind: kind?.value as ModontyMediaKind | undefined,
    used: params.used === "used" ? true : params.used === "unused" ? false : undefined,
    search: params.search || undefined,
    sort: params.sort || "newest",
    page: params.page ? Math.max(1, parseInt(params.page, 10) || 1) : 1,
  };

  const [result, counts] = await Promise.all([
    getModontyMedia(coreClientId, siteUrls, query),
    getModontyMediaCounts(coreClientId, siteUrls, { kind: query.kind, used: query.used, search: query.search }, { ids: issueIds, on: issuesOn }),
  ]);

  const kindSpec = kind?.role ? MEDIA_SPECS[kind.role] : null;
  // Article images upload where they get linked to their article — one place for that job.
  const articlesUpload = (
    <Button asChild size="sm" className="h-9 gap-1.5">
      <Link href="/articles/media"><Upload className="h-4 w-4" />Upload in Articles › Media</Link>
    </Button>
  );
  const emptyState = issuesOn
    ? { title: "No issues here", hint: "Every file under these filters has the right format, ratio and size.", action: <span /> }
    : query.used !== undefined && !kind
      ? {
          title: query.used ? "Nothing in use here" : "Nothing unused here",
          hint: query.used ? "None of these files is on a page yet." : "Every Modonty file is in use — nothing to clean up.",
          action: <span />,
        }
      : kind
        ? {
            title: `No ${kind.label.toLowerCase()} files here`,
            hint: kindSpec
              ? `${kindSpec.label} · ${kindSpec.ratioLabel}${kindSpec.width ? ` · ${kindSpec.width}×${kindSpec.height}` : ""}`
              : "Nothing of this kind matches the current filters.",
            action: kind.value === "articles" ? articlesUpload : kindSpec ? (
              <ModontyUploadButton coreClientId={coreClientId} coreName={coreName} role={kind.role} label={`Upload ${kindSpec.label}`} />
            ) : (
              <span />
            ),
          }
        : undefined;

  return (
    <ModontyUploadProvider>
      <div className="max-w-[1200px] mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Modonty Media</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {coreName} · {counts.all} file{counts.all === 1 ? "" : "s"} · site pages, articles, brand, gallery and reels
            {counts.createdThisMonth ? ` · +${counts.createdThisMonth} this month` : ""}
          </p>
        </div>

        <MediaKindToggles
          kinds={MODONTY_MEDIA_KINDS}
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

        <MediaPageClient
          media={result.items}
          sortBy={query.sort}
          searchQuery={params.search || ""}
          pagination={{ page: result.page, totalPages: result.totalPages, total: result.total, perPage: result.perPage }}
          deleteAction={deleteMedia}
          canDeleteAction={canDeleteMedia}
          basePath="/modonty/media"
          uploadHref="/media/upload"
          uploadSlot={
            kind?.value === "articles" ? articlesUpload : <ModontyUploadButton coreClientId={coreClientId} coreName={coreName} role={kind?.role} />
          }
          toolbarExtra={<MediaUsageSelect used={counts.used} unused={counts.unused} />}
          emptyState={emptyState}
          lockUsedDelete
          allowGroup={false}
          convertAction={saveOptimizedImage}
        />
      </div>
    </ModontyUploadProvider>
  );
}
