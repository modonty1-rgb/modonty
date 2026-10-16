import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ArticleStatus, SubscriptionStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { reindexArticles } from "@/app/(site)/modo-chat/data/get-embedded-chunks";
import { hashContent } from "@/app/(site)/modo-chat/helpers/hash-content";

export const maxDuration = 120;

/**
 * Articles embedded per maintenance call. Cohere answered `TooManyRequestsError` when 200 went
 * at once (measured 16 Oct 2026), so the admin button walks the backlog in small steps.
 */
const DEFAULT_BATCH = 5;
const MAX_BATCH = 10;

const bodySchema = z.object({
  secret: z.string().min(1),
  /** One article, right after it is published or its text is edited. */
  articleId: z.string().regex(/^[a-f0-9]{24}$/i).optional(),
  /** Count only — the maintenance card reads this before offering the button. */
  dryRun: z.boolean().optional(),
  limit: z.number().int().positive().max(MAX_BATCH).optional(),
});

/**
 * **فهرسة مقالات مودو — لحظة النشر، وزرّ في الصيانة لما فات** (خالد ١٦ أكتوبر ٢٠٢٦: «مع كل
 * ارتكل يتحوّل لببلش نعمل له فهرسة بدون ما نشغّل كرون على الفاضي… وفي الصيانة الفهرسة اللي ما
 * تفهرست»).
 *
 * مودو يبحث في كلّ المكتبة (`search-all-articles.ts`)، فالمقال غير المفهرس غير موجود عنده. وقيس
 * قبلها: ١٢٦ من ٢٧٨ مقالاً منشوراً فقط مفهرسة، ولا شيء كان يعيد فهرسة مقالٍ عُدّل نصّه.
 *
 * «مستحقّ الفهرسة» = منشورٌ لشريكٍ نشط، ونصُّه بلا أجزاء أو تغيّرت بصمته (`contentHash`) عمّا
 * بُنيت منه أجزاؤه.
 *
 * السرّ `INTERNAL_LOG_SECRET`: قيمةٌ واحدة مشتركة بين الأدمن ومدونتي على فيرسيل بلا تجاوزٍ على
 * مستوى المشروع. لا `REVALIDATE_SECRET`: للأدمن على الإنتاج قيمةٌ خاصّة به (١٥ سبتمبر) تختلف عن
 * قيمة مدونتي — أوّل نداءٍ من الصيانة ردّ 401 (قيس ١٧ أكتوبر ٢٠٢٦).
 */
export async function POST(request: NextRequest) {
  const expected = process.env.INTERNAL_LOG_SECRET;
  if (!expected) return NextResponse.json({ error: "INTERNAL_LOG_SECRET is not configured" }, { status: 500 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { articleId, dryRun, limit } = parsed.data;

  const [articles, stored] = await Promise.all([
    db.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        client: { subscriptionStatus: SubscriptionStatus.ACTIVE },
        ...(articleId ? { id: articleId } : {}),
      },
      select: { id: true, title: true, content: true },
      take: 5000,
    }),
    db.articleChunk.findMany({
      // One row per article is enough to read the hash its chunks were built from.
      where: {
        chunkIndex: 0,
        OR: [{ kind: "article" }, { kind: { isSet: false } }],
        ...(articleId ? { articleId } : {}),
      },
      select: { articleId: true, contentHash: true },
    }),
  ]);

  const builtFrom = new Map(stored.map((s) => [s.articleId, s.contentHash]));
  const due = articles.filter((a) => {
    const content = a.content ?? "";
    return content.trim() && builtFrom.get(a.id) !== hashContent(content);
  });

  if (dryRun) return NextResponse.json({ published: articles.length, due: due.length });

  const now = due.slice(0, articleId ? 1 : (limit ?? DEFAULT_BATCH));
  // One article at a time: each is a single embed call. The current key is a TRIAL key —
  // «trial token rate limit exceeded, limit is 100000 tokens per minute» (measured 16 Oct 2026) —
  // so hitting it stops the step cleanly and the maintenance button waits a minute and resumes.
  let chunks = 0;
  let indexed = 0;
  let rateLimited = false;
  for (const a of now) {
    try {
      chunks += await reindexArticles([{ id: a.id, title: a.title }]);
      indexed += 1;
    } catch (err) {
      if ((err as { statusCode?: number }).statusCode === 429) {
        rateLimited = true;
        break;
      }
      throw err;
    }
  }

  return NextResponse.json({
    published: articles.length,
    indexed,
    chunks,
    remaining: due.length - indexed,
    rateLimited,
  });
}
