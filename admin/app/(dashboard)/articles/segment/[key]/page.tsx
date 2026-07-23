import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

import { db } from "@/lib/db";
import { getArticleSeoScore } from "@/lib/seo/article-seo-score";
import { getArticleSegment } from "../segments";
import { ArticleSegmentTable, type SegmentArticle } from "./components/article-segment-table";

// One dynamic page behind every clickable number in the dashboard's Articles section
// (Khalid 2026-07-13) — same contract as the client segments: the `where` lives in
// segments.ts and is shared with the count, so the card and the list cannot diverge.
//
// The SEO number comes from dataLayer/lib/seo/article — the shared source of truth,
// exactly where the client scorer's header said the article one would go. It reads the
// STORED published fields (nextjsMetadata + jsonLdStructuredData + the cached validation
// report), so:
//   · every surface shows the same number, computed once, in one place
//   · the score describes the LIVE page, not the state of a draft form
//   · the select stays cheap — we never pull article bodies to render a table
//
// The admin's own analyzeArticleSEO stays where it belongs: inside the editor, scoring
// the form as you type. That is a different question and deliberately a different number.

const MAX_ROWS = 300;

export default async function ArticleSegmentPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const segment = getArticleSegment(key);
  if (!segment) notFound();

  const rows = await db.article.findMany({
    where: segment.where,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      viewsCount: true,
      datePublished: true,
      dateModified: true,
      // The stored SEO fields the shared scorer reads — nothing more.
      nextjsMetadata: true,
      jsonLdStructuredData: true,
      jsonLdValidationReport: true,
      featuredImageId: true,
      authorId: true,
      clientId: true,
      client: { select: { name: true } },
      category: { select: { name: true } },
      author: { select: { name: true } },
    },
    orderBy: { dateModified: "desc" },
    take: MAX_ROWS,
  });

  // Dates cross the server/client boundary as ISO strings — a Date instance would not.
  const scored: SegmentArticle[] = rows.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    status: String(a.status),
    clientName: a.client.name,
    categoryName: a.category?.name ?? null,
    authorName: a.author?.name ?? null,
    views: a.viewsCount,
    seoScore: getArticleSeoScore(a),
    publishedAt: a.datePublished?.toISOString() ?? null,
    updatedAt: a.dateModified.toISOString(),
  }));

  // Score-based segments keep only their side of 100 — same split as the dashboard count.
  const articles: SegmentArticle[] = segment.scoreFilter
    ? scored.filter((a) =>
        segment.scoreFilter === "perfect" ? a.seoScore >= 100 : a.seoScore < 100,
      )
    : scored;

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">{segment.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{segment.description}</p>
        </div>
        <Link
          href="/"
          className="shrink-0 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted"
        >
          ← Back to dashboard
        </Link>
      </div>

      {articles.length === MAX_ROWS && (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-400">
          Showing the {MAX_ROWS} most recently updated. Scoring SEO means reading each article in
          full, so the list is capped — a longer one would be slow, and a silently truncated list
          that looks complete is worse than a slow one.
        </p>
      )}

      <Card>
        <CardContent className="pt-4">
          <ArticleSegmentTable articles={articles} />
        </CardContent>
      </Card>
    </div>
  );
}
