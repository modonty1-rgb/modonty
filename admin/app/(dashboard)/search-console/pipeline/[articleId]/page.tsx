import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Pencil } from "lucide-react";

import { db } from "@/lib/db";
import { SITE_BASE_URL } from "@/lib/gsc/client";
import { getCachedInspection } from "@/lib/gsc/inspection-cache";

import { getManualTrackState } from "../../actions/removal-tracking-actions";
import { PipelineRunner } from "./pipeline-runner";

export default async function IndexingPipelinePage({
  params,
}: {
  params: Promise<{ articleId: string }>;
}) {
  const { articleId } = await params;
  const article = await db.article.findUnique({
    where: { id: articleId },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      datePublished: true,
    },
  });
  if (!article) notFound();

  const url = `${SITE_BASE_URL}/articles/${article.slug}`;
  const [cachedInspection, indexingTrackState] = await Promise.all([
    getCachedInspection(url).catch(() => null),
    getManualTrackState(url, "INDEXING").catch(() => null),
  ]);

  return (
    <div className="px-6 py-6 max-w-[1100px] mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-1.5">
          <Link
            href="/search-console"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Search Console
          </Link>
          <h1 className="text-2xl font-semibold leading-tight">
            Indexing Pipeline
          </h1>
          <p className="text-sm text-muted-foreground">
            13 quality gates · article must pass all of them at 100% before being requested for indexing
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="space-y-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Article
            </div>
            <h2 className="text-base font-semibold line-clamp-2" title={article.title}>
              {article.title}
            </h2>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className="font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              {url}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <Link
            href={`/articles/${article.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium hover:bg-muted"
          >
            <Pencil className="h-3 w-3" />
            Edit article
          </Link>
        </div>
      </div>

      <PipelineRunner
        articleId={article.id}
        articleUrl={url}
        indexingTrackState={indexingTrackState}
        cachedInspection={
          cachedInspection
            ? {
                verdict: cachedInspection.verdict,
                coverageState: cachedInspection.coverageState,
                indexingState: cachedInspection.indexingState,
                inspectedAt: cachedInspection.inspectedAt.toISOString(),
                isFresh: cachedInspection.isFresh,
              }
            : null
        }
      />
    </div>
  );
}
