import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { isFactoryAuthorized, resolveArticleUrl } from "@/lib/videos";

const bodySchema = z.object({
  articleUrl: z.string().trim().url().startsWith("https://").max(1000),
  revision: z.number().int().min(1),
  step: z.enum(["fetch", "script", "voice", "render", "qa", "upload", "publish"]),
  message: z.string().trim().min(1).max(2000),
  attempts: z.number().int().min(1),
});

/**
 * خطوة فشلت مرتين على السيرفر (العقد §٥) — بلا :id، لأن الفشل قد يسبق أي ingest. ينشئ السجل بالمقالة
 * (بلا ملفات) أو يحدّثه، ويضع الحالة «يحتاج تدخل» مع الخطوة والرسالة.
 */
export async function POST(request: NextRequest) {
  if (!isFactoryAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad-request", issues: parsed.error.issues.slice(0, 5) }, { status: 400 });
  }
  const input = parsed.data;
  const article = await resolveArticleUrl(input.articleUrl);
  if (!article) return NextResponse.json({ error: "article-not-found" }, { status: 404 });

  const now = new Date();
  const error = { step: input.step, message: input.message, attempts: input.attempts, revision: input.revision, at: now };
  const event = { revision: input.revision, event: `attention:${input.step}`, at: now, byName: null };
  const existing = await db.videoJob.findUnique({ where: { articleId: article.articleId }, select: { id: true } });

  const job = existing
    ? await db.videoJob.update({
        where: { id: existing.id },
        data: { status: "NEEDS_ATTENTION", errors: { push: error }, history: { push: event } },
        select: { id: true },
      })
    : await db.videoJob.create({
        data: {
          articleId: article.articleId,
          clientId: article.clientId,
          articleUrl: input.articleUrl,
          status: "NEEDS_ATTENTION",
          revision: input.revision,
          shorts: [],
          items: [],
          errors: [error],
          history: [event],
        },
        select: { id: true },
      });

  return NextResponse.json({ ok: true, id: job.id, url: new URL(`/videos/${job.id}`, request.url).toString() });
}
