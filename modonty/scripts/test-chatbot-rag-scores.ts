/**
 * Test RAG/rerank scores for each case - no auth needed.
 * Helps tune RERANK_REDIRECT_THRESHOLD.
 * Run: cd modonty && pnpm exec tsx scripts/test-chatbot-rag-scores.ts
 * Requires: COHERE_API_KEY, DB connection
 */
import "dotenv/config";
import { ArticleStatus } from "@prisma/client";
import { db } from "../lib/db";
import { chunkArticleContent } from "../lib/rag/chunk";
import { retrieveFromChunks } from "../lib/rag/retrieve";
import { isOutOfScope } from "../lib/rag/scope";

const QUERIES = [
  { id: "out-of-scope", query: "ما هو الطقس اليوم في الرياض؟", expectOutOfScope: true },
  {
    id: "in-scope-db-match",
    query: "ما هي أفضل ممارسات تحسين المحتوى لمحركات البحث؟",
    expectRedirect: true,
  },
  {
    id: "in-scope-no-db",
    query: "ما هي تحديثات Google March 2026؟",
    expectRedirect: false,
  },
  {
    id: "in-scope-no-db-2",
    query: "كيف أستخدم Ahrefs لتحليل المنافسين؟",
    expectRedirect: false,
  },
];

const RERANK_THRESHOLD = 0.6;

async function main() {
  console.log("=== Chatbot RAG Scores Test ===\n");
  console.log("RERANK_REDIRECT_THRESHOLD:", RERANK_THRESHOLD);
  console.log("Category: content-seo\n");

  const category = await db.category.findUnique({ where: { slug: "content-seo" } });
  if (!category) {
    console.error("Category content-seo not found");
    process.exit(1);
  }

  const scopeArticles = await db.article.findMany({
    where: {
      categoryId: category.id,
      status: ArticleStatus.PUBLISHED,
      OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
    },
    select: { id: true, title: true, content: true },
    orderBy: [{ datePublished: "desc" }, { createdAt: "desc" }],
    take: 30,
  });

  const scopeParts = scopeArticles
    .slice(0, 5)
    .flatMap((a) => [a.title, a.content?.slice(0, 150) ?? ""].filter(Boolean));
  const scopeExcerpt = scopeParts.join(" ").slice(0, 600);

  const allChunks: string[] = [];
  for (const a of scopeArticles) {
    const chunks = chunkArticleContent(a.content ?? "");
    for (const c of chunks) allChunks.push(`${a.title}\n\n${c}`);
  }

  console.log(`Scope articles: ${scopeArticles.length}, chunks: ${allChunks.length}\n`);

  let passed = 0;
  let failed = 0;

  for (const q of QUERIES) {
    const outOfScope = await isOutOfScope(q.query, {
      categoryName: category.name,
      articleExcerpt: scopeExcerpt || undefined,
    });

    if ("expectOutOfScope" in q) {
      const ok = outOfScope === q.expectOutOfScope;
      if (ok) passed++;
      else failed++;
      console.log(
        `${ok ? "✓" : "✗"} ${q.id}: outOfScope=${outOfScope} (expect ${q.expectOutOfScope})`
      );
      if (outOfScope) continue;
    } else if (outOfScope) {
      console.log(`✓ ${q.id}: outOfScope (skipping RAG)`);
      passed++;
      continue;
    }

    const { docs, topScore, topRerankScore } = await retrieveFromChunks(q.query, allChunks);
    const wouldRedirect = docs.length > 0 && topRerankScore >= RERANK_THRESHOLD;
    const expectRedirect = "expectRedirect" in q ? q.expectRedirect : false;
    const ok = wouldRedirect === expectRedirect;

    if (ok) passed++;
    else failed++;

    console.log(`${ok ? "✓" : "✗"} ${q.id}: "${q.query.slice(0, 40)}..."`);
    console.log(
      `   topScore=${topScore.toFixed(3)} topRerankScore=${topRerankScore.toFixed(3)} wouldRedirect=${wouldRedirect} (expect ${expectRedirect})`
    );
    console.log("");
  }

  console.log("=== Summary ===");
  console.log(`Passed: ${passed}/${QUERIES.length} | Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
