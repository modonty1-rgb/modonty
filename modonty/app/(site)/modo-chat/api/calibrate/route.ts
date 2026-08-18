import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getEmbeddedChunks } from "@/app/(site)/modo-chat/data/get-embedded-chunks";
import { getIndustryScope } from "@/app/(site)/modo-chat/data/get-industry-scope";
import { retrieveFromEmbedded } from "@/app/(site)/modo-chat/data/retrieve-from-embedded";
import { isGreetingOrShortPleasantry } from "@/app/(site)/modo-chat/helpers/is-greeting";

export const maxDuration = 60;

/** Gap between questions — the vendor rate-limits rerank calls per minute. */
const PAUSE_MS = 7000;

const bodySchema = z.object({
  // Six per call: the vendor rate-limits rerank, and the pause below plus maxDuration=60
  // leaves no room for more. Measured 2026-08-18: 35 in one go returned HTTP 429.
  questions: z.array(z.string().min(1).max(300)).min(1).max(6),
  industrySlug: z.string().min(1),
});

/**
 * Retrieval scores for a batch of questions — the input to calibrating the thresholds.
 *
 * DEVELOPMENT ONLY. It answers with raw relevance numbers, which is exactly what a scraper
 * would want to map the corpus, and it costs an embed + a rerank per question.
 *
 * It deliberately stops BEFORE generation: the answer text is irrelevant to calibration and
 * generation is the expensive part. Measured 2026-08-18, generation was 6–40s of every request
 * while retrieval was ~1s.
 *
 * The five thresholds it exists to settle — `RERANK_MIN_SCORE` · `SUGGEST_MIN_SCORE` ·
 * `MIN_RELEVANCE` · `RELATED_MIN_SCORE` · the article gate — were all picked by feel, and the
 * vendor states scores are query-dependent and not comparable across queries.
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const industry = await getIndustryScope(parsed.data.industrySlug);
  if (!industry) return NextResponse.json({ error: "Industry not found" }, { status: 404 });

  const chunks = await getEmbeddedChunks(industry.articles);

  const results = [];
  for (const question of parsed.data.questions) {
    if (isGreetingOrShortPleasantry(question)) {
      results.push({ question, identity: true, topRerankScore: null, docsCount: null, topScore: null });
      continue;
    }
    // The vendor returned 429 on a fast batch, so questions are paced rather than raced.
    if (results.length > 0) await new Promise((r) => setTimeout(r, PAUSE_MS));
    const { docs, topScore, topRerankScore } = await retrieveFromEmbedded(question, chunks);
    results.push({
      question,
      identity: false,
      topScore: Number(topScore.toFixed(4)),
      topRerankScore: Number(topRerankScore.toFixed(4)),
      docsCount: docs.length,
    });
  }

  return NextResponse.json({
    industry: industry.name,
    articles: industry.articles.length,
    chunks: chunks.length,
    results,
  });
}
