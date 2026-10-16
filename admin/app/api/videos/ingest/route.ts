import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/lib/db";
import { buildPublishItems, isFactoryAuthorized, jobStatusFromItems, resolveArticleUrl, type AssetKey } from "@/lib/videos";
import { ingestSchema } from "./ingest-schema";

/**
 * سيرفر المصنع يسلّم فيديو مقالة جاهزاً للمراجعة (العقد §١ · M9). سجل واحد لكل مقالة:
 * revision أقل ← 409 · نفس الرقم ← تحديث آمن (البنود والنص المعدّل يبقيان) · رقم أعلى ← تحديث وبنود
 * غير المنشورة ترجع pending. الرد فيه رابط صفحة الأدمن لتنبيه تليجرام.
 */
export async function POST(request: NextRequest) {
  if (!isFactoryAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = ingestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad-request", issues: parsed.error.issues.slice(0, 5) }, { status: 400 });
  }
  const input = parsed.data;

  const article = await resolveArticleUrl(input.articleUrl);
  if (!article) return NextResponse.json({ error: "article-not-found" }, { status: 404 });

  const existing = await db.videoJob.findUnique({
    where: { articleId: article.articleId },
    select: { id: true, revision: true, items: true, copy: true },
  });
  if (existing && input.revision < existing.revision) {
    return NextResponse.json({ error: "stale-revision", current: existing.revision }, { status: 409 });
  }

  const now = new Date();
  const isNewRevision = !existing || input.revision > existing.revision;
  const assets: AssetKey[] = ["long", ...input.assets.shorts.map((s) => s.key)];
  const items = buildPublishItems(assets, existing?.items ?? [], isNewRevision, now);
  const long = {
    url: input.assets.long.url,
    seconds: input.assets.long.seconds,
    thumbnail: input.assets.long.thumbnail ?? null,
    srt: input.assets.long.srt ?? null,
  };
  const shorts = input.assets.shorts.map((s) => ({ key: s.key, series: s.series ?? null, url: s.url, seconds: s.seconds }));
  const qa = input.qa ? { passed: input.qa.passed, failures: input.qa.failures } : null;
  const scalars = {
    articleUrl: input.articleUrl,
    clientId: article.clientId,
    status: jobStatusFromItems(items),
    revision: input.revision,
    engineVersion: input.engineVersion ?? null,
    voiceId: input.voiceId ?? null,
    scriptUrl: input.scriptUrl ?? null,
    // Same revision = a safe re-send: keep the copy the team may have edited. A new revision brings new text.
    copy: (isNewRevision ? input.copy : (existing?.copy ?? input.copy)) as object,
    usage: (input.usage ?? undefined) as object | undefined,
  };
  const event = { revision: input.revision, event: isNewRevision ? "ingest" : "ingest_resend", at: now, byName: null };

  // Composite fields: `{ set }` on update — the repo's convention (console page-content actions).
  const job = existing
    ? await db.videoJob.update({
        where: { id: existing.id },
        data: { ...scalars, long: { set: long }, shorts: { set: shorts }, qa: { set: qa }, items: { set: items }, history: { push: event } },
        select: { id: true },
      })
    : await db.videoJob.create({
        data: { ...scalars, articleId: article.articleId, long, shorts, qa, items, errors: [], history: [event] },
        select: { id: true },
      });

  return NextResponse.json({ id: job.id, url: new URL(`/videos/${job.id}`, request.url).toString() });
}
