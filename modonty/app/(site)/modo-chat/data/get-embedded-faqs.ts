import "server-only";

import { db } from "@/lib/db";

import { hashContent } from "../helpers/hash-content";
import { embedTexts } from "./embed-texts";
import { getAnsweredFaqs } from "./get-answered-faqs";

import type { EmbeddedChunk } from "./get-embedded-chunks";

/**
 * Partner answers, embedded and cached like article chunks — so Modo can retrieve from them.
 *
 * They are stored in the same `article_chunks` table with `kind: "faq"`: the text is embedded,
 * searched and reranked identically, and only its origin differs. A second table would have
 * duplicated the whole cache-and-invalidate mechanism for no gain.
 *
 * The cached row is keyed by a hash of the question+answer, so a partner editing their answer
 * invalidates it without anyone remembering to.
 */
export async function getEmbeddedFaqs(industryId: string): Promise<EmbeddedChunk[]> {
  const faqs = await getAnsweredFaqs(industryId);
  if (faqs.length === 0) return [];

  // The exact text that gets embedded — and later read by the model. Naming the partner inside
  // it matters: the answer's authority IS that it came from them, not from us.
  const asText = (f: (typeof faqs)[number]) =>
    `${f.articleTitle}\n\nسؤال: ${f.question}\nجواب ${f.partnerName}: ${f.answer}`;

  const wanted = faqs.map((f) => ({ faq: f, text: asText(f), hash: hashContent(asText(f)) }));

  const cached = await db.articleChunk.findMany({
    where: { kind: "faq", contentHash: { in: wanted.map((w) => w.hash) } },
    select: { text: true, embedding: true, articleId: true, contentHash: true },
  });
  const byHash = new Map(cached.map((c) => [c.contentHash, c]));

  const result: EmbeddedChunk[] = [];
  const cold: typeof wanted = [];
  for (const w of wanted) {
    const hit = byHash.get(w.hash);
    if (hit) {
      result.push({
        text: hit.text,
        embedding: hit.embedding,
        articleId: hit.articleId,
        articleTitle: w.faq.articleTitle,
      });
    } else {
      cold.push(w);
    }
  }

  if (cold.length === 0) return result;

  const vectors = await embedTexts(cold.map((c) => c.text), "search_document");
  const rows = cold
    .map((c, i) => ({ ...c, embedding: vectors[i] }))
    .filter((c): c is typeof c & { embedding: number[] } => Array.isArray(c.embedding));

  try {
    // Stale rows for these articles' FAQs go first: an edited answer must not linger beside
    // its replacement, or retrieval could match the version the partner already corrected.
    await db.articleChunk.deleteMany({
      where: { kind: "faq", articleId: { in: [...new Set(rows.map((r) => r.faq.articleId))] } },
    });
    await db.articleChunk.createMany({
      data: rows.map((r, i) => ({
        articleId: r.faq.articleId,
        chunkIndex: 1000 + i, // kept clear of article chunk indices, which start at 0
        text: r.text,
        embedding: r.embedding,
        contentHash: r.hash,
        kind: "faq",
      })),
    });
  } catch (err) {
    console.error("[getEmbeddedFaqs] could not persist FAQ chunk cache", err);
  }

  for (const r of rows) {
    result.push({
      text: r.text,
      embedding: r.embedding,
      articleId: r.faq.articleId,
      articleTitle: r.faq.articleTitle,
    });
  }
  return result;
}
