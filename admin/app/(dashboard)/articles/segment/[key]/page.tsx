import { notFound } from "next/navigation";
import { SegmentPageHeader } from "@/components/shared/segment-page-header";
import { Card, CardContent } from "@/components/ui/card";

import { db } from "@/lib/db";
import { ARTICLE_SEO_SELECT, getArticleSeoScore } from "@/lib/seo/article-seo-score";
import { getArticleSegment } from "../segments";
import { ArticleSegmentTable, type SegmentArticle } from "./components/article-segment-table";

// One dynamic page behind every clickable number in the dashboard's Articles section
// (Khalid 2026-07-13) — same contract as the client segments: the `where` lives in
// segments.ts and is shared with the count, so the card and the list cannot diverge.
//
// The SEO number comes from shared/lib/seo/article — the shared source of truth,
// exactly where the client scorer's header said the article one would go. It reads the
// STORED published fields (nextjsMetadata + jsonLdStructuredData + the cached validation
// report), so:
//   · every surface shows the same number, computed once, in one place
//   · the score describes the LIVE page, not the state of a draft form
//   · the select stays cheap — we never pull article bodies to render a table
//
// The admin's own analyzeArticleSEO stays where it belongs: inside the editor, scoring
// the form as you type. That is a different question and deliberately a different number.

// 1000, not 300 (1 Oct 2026): at 313 articles the cap cut «فيها نقص سيو» to 227 while the
// dashboard, which scores every article, said 240. The note below still shows if it is ever hit.
const MAX_ROWS = 1000;

export default async function ArticleSegmentPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const segment = getArticleSegment(key);
  if (!segment) notFound();

  const rows = await db.article.findMany({
    where: segment.where,
    select: {
      id: true,
      // title · datePublished · dateModified come in ARTICLE_SEO_SELECT below.
      slug: true,
      status: true,
      viewsCount: true,
      // The shared scorer's own select, spread — not retyped. The retyped list here missed
      // `_count.relatedFrom`, so «links.related» failed for every row: the dashboard said 73
      // articles at 100 and this page listed 0 (measured 1 Oct 2026).
      ...ARTICLE_SEO_SELECT,
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
    <div dir="rtl" className="mx-auto max-w-[1200px] space-y-6">
      <SegmentPageHeader title={segment.title} description={segment.description} count={`${articles.length} مقال`} />

      {articles.length === MAX_ROWS && (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-400">
          معروض آخر {MAX_ROWS} مقال تحدّث. قياس السيو يقرأ كل مقال كاملاً، فالقائمة محدودة — أطول منها
          تصير بطيئة، وقائمة مقطوعة بصمت تبدو كاملة أسوأ من قائمة بطيئة. العدد الكامل في لوحة التحكم.
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
