import "server-only";

import { db } from "@/lib/db";

import { chunkArticleContent } from "../helpers/chunk-article-content";
import { hashContent } from "../helpers/hash-content";
import { embedTexts } from "./embed-texts";

export interface EmbeddedChunk {
  /** Article title prepended to the chunk — the reranker and the model read this text. */
  text: string;
  embedding: number[];
  articleId: string;
  articleTitle: string;
}

export interface ArticleRef {
  id: string;
  title: string;
}

/**
 * The embeddings for a set of articles, read from the cache and computed only for what is missing.
 *
 * Article text is immutable between edits, so embedding it on every question was pure waste: a
 * category with 30 articles paid for the same vectors again and again, and the bill grew with the
 * corpus instead of with traffic. Now the first question after a publish pays once, and every
 * question after it embeds only itself.
 *
 * Just as important for latency: the caller passes only ids and titles. Article BODIES are fetched
 * lazily, and only for the articles whose cache is actually cold — measured on a live category,
 * shipping 30 full bodies into every request was several hundred kilobytes of database payload
 * that the answer never used.
 *
 * A write failure is swallowed on purpose: a cache that cannot persist must still answer the
 * visitor, just without the saving.
 */
export async function getEmbeddedChunks(articles: ArticleRef[]): Promise<EmbeddedChunk[]> {
  if (articles.length === 0) return [];

  const ids = articles.map((a) => a.id);
  const titleById = new Map(articles.map((a) => [a.id, a.title]));

  const cached = await db.articleChunk.findMany({
    // `kind` was added after these rows existed, and in Mongo an ABSENT field is not null —
    // filtering on `kind: "article"` alone would have declared every cached chunk cold and
    // re-embedded the whole corpus once. Rows written before the column count as article chunks.
    where: { articleId: { in: ids }, OR: [{ kind: "article" }, { kind: { isSet: false } }] },
    orderBy: { chunkIndex: "asc" },
    select: { articleId: true, text: true, embedding: true },
  });

  const result: EmbeddedChunk[] = [];
  const cachedIds = new Set<string>();
  for (const row of cached) {
    cachedIds.add(row.articleId);
    result.push({
      text: row.text,
      embedding: row.embedding,
      articleId: row.articleId,
      articleTitle: titleById.get(row.articleId) ?? "",
    });
  }

  const cold = ids.filter((id) => !cachedIds.has(id));
  if (cold.length > 0) {
    result.push(...(await buildAndStore(cold, titleById)));
  }

  return result;
}

async function buildAndStore(
  articleIds: string[],
  titleById: Map<string, string>
): Promise<EmbeddedChunk[]> {
  // Bodies are read here and nowhere else in the request.
  const bodies = await db.article.findMany({
    where: { id: { in: articleIds } },
    select: { id: true, content: true },
  });

  const pending: { articleId: string; chunkIndex: number; text: string; hash: string }[] = [];
  for (const body of bodies) {
    const content = body.content ?? "";
    if (!content.trim()) continue;
    const hash = hashContent(content);
    const title = titleById.get(body.id) ?? "";
    chunkArticleContent(content).forEach((chunk, chunkIndex) => {
      pending.push({
        articleId: body.id,
        chunkIndex,
        // The title rides along so a matched chunk can be traced back to its article.
        text: `${title}\n\n${chunk}`,
        hash,
      });
    });
  }

  if (pending.length === 0) return [];

  // embedTexts batches internally at the vendor's 96-per-call ceiling.
  const vectors = await embedTexts(pending.map((p) => p.text), "search_document");

  const rows = pending
    .map((p, i) => ({ ...p, embedding: vectors[i] }))
    .filter((p): p is typeof p & { embedding: number[] } => Array.isArray(p.embedding));

  try {
    // Scoped by kind: FAQ chunks live in the same table and must survive an article re-chunk.
    await db.articleChunk.deleteMany({
      where: { articleId: { in: articleIds }, OR: [{ kind: "article" }, { kind: { isSet: false } }] },
    });
    await db.articleChunk.createMany({
      data: rows.map((r) => ({
        articleId: r.articleId,
        chunkIndex: r.chunkIndex,
        text: r.text,
        embedding: r.embedding,
        contentHash: r.hash,
      })),
    });
  } catch (err) {
    console.error("[getEmbeddedChunks] could not persist chunk cache", err);
  }

  return rows.map((r) => ({
    text: r.text,
    embedding: r.embedding,
    articleId: r.articleId,
    articleTitle: titleById.get(r.articleId) ?? "",
  }));
}

/**
 * Drops an article's cached chunks so the next question rebuilds them.
 * Call this when an article's body changes.
 */
export async function invalidateArticleChunks(articleId: string): Promise<void> {
  try {
    await db.articleChunk.deleteMany({ where: { articleId } });
  } catch (err) {
    console.error("[invalidateArticleChunks]", err);
  }
}
