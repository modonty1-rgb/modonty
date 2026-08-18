import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SubscriptionStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { embedTexts } from "@/app/(site)/modo-chat/data/embed-texts";
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
 * industry the answer never saw. Only industries with an active partner are offered — an
 * industry with none is a dead end no matter how well the words match.
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

    const industries = await db.industry.findMany({
      where: { clients: { some: { subscriptionStatus: SubscriptionStatus.ACTIVE } } },
      select: { name: true, slug: true, description: true },
      take: 20,
    });

    if (industries.length === 0) {
      return NextResponse.json({ success: true, suggestion: null });
    }

    const industryTexts = industries.map(
      (i) => `${i.name}${i.description ? `. ${i.description}` : ""}`
    );

    const [queryEmbs, industryEmbs] = await Promise.all([
      embedTexts([message], "search_query"),
      embedTexts(industryTexts, "search_document"),
    ]);

    if (!queryEmbs?.[0] || !industryEmbs?.length) {
      return NextResponse.json({ success: true, suggestion: null });
    }

    const queryEmb = queryEmbs[0];
    const scores = industryEmbs.map((emb, i) => ({
      industry: industries[i]!,
      score: cosineSimilarity(queryEmb, emb),
    }));
    scores.sort((a, b) => b.score - a.score);
    const top = scores[0];

    if (!top || top.score < SUGGESTION_THRESHOLD) {
      return NextResponse.json({ success: true, suggestion: null });
    }

    return NextResponse.json({
      success: true,
      suggestion: {
        slug: top.industry.slug,
        name: top.industry.name,
        confidence: top.score,
      },
    });
  } catch (error) {
    console.error("Suggest industry error:", error);
    return NextResponse.json({ success: true, suggestion: null });
  }
}
