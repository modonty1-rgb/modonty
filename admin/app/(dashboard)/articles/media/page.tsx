import { canDeleteMedia } from "@/lib/media/can-delete-media";
import { deleteMedia } from "@/lib/media/delete-media";
// The in-place WebP swap lives with the Media section (it rebuilds client SEO through the
// clients actions) — same cross-route import Clients › Media makes, noted there.
import { saveOptimizedImage } from "@/app/(dashboard)/media/actions/optimize-image";
import { MediaPageClient } from "@/components/shared/media-library/media-page-client";
import { MediaKindToggles, MediaUsageSelect, UrlSearchPicker } from "@/components/shared/media-library/media-filter-bar";
import { findIssueMediaIds } from "@/lib/media/find-issue-media-ids";
import { articlesMediaWhere } from "./helpers/articles-media-where";
import { ARTICLE_MEDIA_KINDS, type ArticleMediaKind } from "./helpers/article-media-kinds";
import { getArticlesMedia } from "./helpers/get-articles-media";
import { getArticlesMediaCounts } from "./helpers/get-articles-media-counts";
import { getArticleMediaPickers } from "./helpers/get-article-media-pickers";
import { getArticleBox } from "./helpers/get-article-box";
import { ArticleUploadProvider, ArticleToolbarUpload } from "./components/article-upload";
import { ArticleBox } from "./components/article-box";

/**
 * Articles › Media (Khalid, 26 Sep 2026): the same grid as Clients › Media, for article images
 * of every client, Modonty's included. Pick a client, then an article: its featured image sits
 * in a box above (upload / replace in place), the grid below shows its gallery.
 */
export default async function ArticlesMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; articleId?: string; kind?: string; issues?: string; used?: string; search?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;

  const kind = ARTICLE_MEDIA_KINDS.find((k) => k.value === params.kind);
  const clientId = params.clientId && params.clientId !== "all" ? params.clientId : undefined;
  const articleId = params.articleId || undefined;
  // The triangle files of the whole page — the «Issues» toggle and its count.
  const issuesOn = params.issues === "1";
  const issueIds = await findIssueMediaIds(articlesMediaWhere({}));
  const query = {
    clientId,
    articleId,
    issueIds: issuesOn ? issueIds : undefined,
    kind: kind?.value as ArticleMediaKind | undefined,
    used: params.used === "used" ? true : params.used === "unused" ? false : undefined,
    search: params.search || undefined,
    sort: params.sort || "newest",
    page: params.page ? Math.max(1, parseInt(params.page, 10) || 1) : 1,
  };

  // The featured image sits in the box; with no type or search on, the grid shows the rest.
  const box = articleId ? await getArticleBox(articleId) : null;
  const othersOnly = !!box?.featured && !kind && !query.search && !issuesOn;

  const [result, counts, pickers] = await Promise.all([
    getArticlesMedia({ ...query, excludeIds: othersOnly && box?.featured ? [box.featured.id] : undefined }),
    getArticlesMediaCounts({ clientId, articleId, kind: query.kind, used: query.used, search: query.search }, { ids: issueIds, on: issuesOn }),
    getArticleMediaPickers({ clientId, kind: query.kind, used: query.used, search: query.search, issueIds: query.issueIds }),
  ]);

  const uploadClientId = box?.clientId ?? clientId;
  const whose = box ? box.title : pickers.clients.find((c) => c.id === clientId)?.name;

  const emptyState = issuesOn
    ? { title: "No issues here", hint: "Every file under these filters has the right format, ratio and size.", action: <span /> }
    : box
    ? {
        title: othersOnly ? "Nothing else in this article" : "No files match",
        hint: othersOnly ? "Its featured image is above; gallery images added in the editor show here." : "Try another type or clear the search.",
        action: <span />,
      }
    : {
        title: "No article images match",
        hint: "Change the filters, or upload an article image for a client.",
        action: <ArticleToolbarUpload clients={pickers.clients} clientId={uploadClientId} label="Upload article image" />,
      };

  return (
    <ArticleUploadProvider>
      <div className="max-w-[1200px] mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Article Media</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {whose ? `${whose} · ${counts.all} file${counts.all === 1 ? "" : "s"}` : "Featured images and article galleries of every client"}
            {counts.createdThisMonth ? ` · +${counts.createdThisMonth} this month` : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-start gap-3">
          <UrlSearchPicker
            param="clientId"
            options={pickers.clients}
            allLabel="All clients"
            searchPlaceholder="Search clients…"
            ariaLabel="Client"
            className="w-[220px]"
            clearsParams={["articleId"]}
          />
          <UrlSearchPicker
            param="articleId"
            options={pickers.articles}
            allLabel="All articles"
            searchPlaceholder="Search articles…"
            ariaLabel="Article"
            className="w-[300px]"
          />
          <MediaKindToggles kinds={ARTICLE_MEDIA_KINDS} total={counts.all} byKind={counts.byKind} issues={counts.issues} />
        </div>

        {box ? <ArticleBox article={box} /> : null}

        <MediaPageClient
          media={result.items}
          sortBy={query.sort}
          searchQuery={params.search || ""}
          pagination={{ page: result.page, totalPages: result.totalPages, total: result.total, perPage: result.perPage }}
          deleteAction={deleteMedia}
          canDeleteAction={canDeleteMedia}
          basePath="/articles/media"
          uploadHref="/media/upload"
          uploadSlot={<ArticleToolbarUpload clients={pickers.clients} clientId={uploadClientId} />}
          toolbarExtra={<MediaUsageSelect used={counts.used} unused={counts.unused} />}
          emptyState={emptyState}
          lockUsedDelete
          allowGroup={false}
          convertAction={saveOptimizedImage}
          gridHeading={
            othersOnly ? (
              <h2 className="text-sm font-semibold">
                Gallery <span className="font-normal text-muted-foreground">· {result.total} · images inside this article</span>
              </h2>
            ) : null
          }
        />
      </div>
    </ArticleUploadProvider>
  );
}
