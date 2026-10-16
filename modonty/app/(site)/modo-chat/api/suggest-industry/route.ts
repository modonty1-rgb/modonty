import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getAnswerableIndustries } from "@/app/(site)/modo-chat/data/get-answerable-industries";
import { searchAllArticles } from "@/app/(site)/modo-chat/data/search-all-articles";
import { checkRateLimit } from "@/app/(site)/modo-chat/data/check-rate-limit";

const bodySchema = z.object({
  message: z.string().min(1).max(500),
});

const SUGGESTION_THRESHOLD = 0.35;

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Guesses which INDUSTRY a free-text question belongs to, so the visitor can just type.
 *
 * It used to guess a category, which quietly undid the whole scope: typing «أبغى دكتور أسنان»
 * landed in a content category holding one partner, while the twenty-one clinics sat in an
 * industry the answer never saw. Only industries Modo can answer from are offered — an active
 * partner with a published article — anything else is a dead end however well the words match.
 */
export async function POST(request: NextRequest) {
  try {
    /**
     * Open to visitors with no account, because the welcome screen promises exactly that:
     * «اكتب سؤالك وأنا أعرف مجاله» plus three free questions. Requiring a session here broke the
     * primary path — measured live 2026-08-19, an anonymous visitor typing a question got a 401
     * and the client drew a generic "حدث خطأ". Only clicking an industry button worked.
     *
     * It deliberately does NOT spend a trial question: this is a helper for the question the
     * visitor is about to ask, and charging it here would halve a three-question trial. The
     * ceiling that matters — the site-wide daily cap — still applies.
     */
    const session = await auth();
    const limit = await checkRateLimit(session?.user?.id ?? null, new Date());
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: limit.message },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: true, suggestion: null });
    }

    const { message } = parsed.data;

    /**
     * The industry of the ARTICLE closest to the question — not the industry whose description
     * reads closest. Measured 16 Oct 2026: «ما هو تحليل CBC في الدم؟» matched the description of
     * «التأهيل المهني» (0.38) while the CBC article lives under «السياحة العلاجية». The library
     * knows where an answer lives; a one-line description does not. Only industries Modo can
     * answer from are eligible — the same list the picker offers.
     */
    const [industries, corpus] = await Promise.all([getAnswerableIndustries(), searchAllArticles(message)]);
    const industryById = new Map(industries.map((i) => [i.id, i]));
    const industryOfArticle = new Map(corpus.articles.map((a) => [a.id, a.client.industryId]));

    if (!corpus.queryEmbedding) {
      return NextResponse.json({ success: true, suggestion: null });
    }

    // Chunks arrive closest-first from the vector index; the first one in an answerable industry wins.
    for (const chunk of corpus.chunks) {
      const industry = industryById.get(industryOfArticle.get(chunk.articleId) ?? "");
      if (!industry) continue;
      const score = cosineSimilarity(corpus.queryEmbedding, chunk.embedding);
      if (score < SUGGESTION_THRESHOLD) break;
      return NextResponse.json({
        success: true,
        suggestion: { slug: industry.slug, name: industry.name, confidence: score },
      });
    }

    return NextResponse.json({ success: true, suggestion: null });
  } catch (error) {
    console.error("Suggest industry error:", error);
    return NextResponse.json({ success: true, suggestion: null });
  }
}
