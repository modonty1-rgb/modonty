import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { ASSET_KEYS, isFactoryAuthorized, jobStatusFromItems, PLATFORM_FROM_API } from "@/lib/videos";

const bodySchema = z.object({
  asset: z.enum(ASSET_KEYS),
  platform: z.enum(["youtube", "modonty_reels", "tiktok", "instagram"]),
  status: z.enum(["published", "failed"]),
  externalId: z.string().trim().max(200).nullish(),
  url: z.string().trim().url().max(1000).nullish(),
  error: z.string().trim().max(2000).nullish(),
});

/**
 * السيرفر يبلّغ نتيجة النشر لبندٍ معتمد (العقد §٤): `published` + المعرّف والرابط، أو `failed` + الخطأ.
 * البند لازم يكون `approved` (أو `failed` لإعادة المحاولة) — غير ذلك 409، فما ينكتب «منشور» على شي ما انعتمد.
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isFactoryAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!/^[a-f0-9]{24}$/i.test(id)) return NextResponse.json({ error: "job-not-found" }, { status: 404 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad-request", issues: parsed.error.issues.slice(0, 5) }, { status: 400 });
  }
  const input = parsed.data;
  const platform = PLATFORM_FROM_API[input.platform];

  const job = await db.videoJob.findUnique({ where: { id }, select: { id: true, revision: true, items: true, status: true } });
  if (!job) return NextResponse.json({ error: "job-not-found" }, { status: 404 });
  const index = job.items.findIndex((i) => i.asset === input.asset && i.platform === platform);
  if (index < 0) return NextResponse.json({ error: "item-not-found" }, { status: 404 });
  const item = job.items[index];
  if (item.status !== "APPROVED" && item.status !== "FAILED") {
    return NextResponse.json({ error: "not-approved", status: item.status.toLowerCase() }, { status: 409 });
  }

  const now = new Date();
  const items = job.items.map((i, n) =>
    n !== index
      ? i
      : input.status === "published"
        ? { ...i, status: "PUBLISHED" as const, externalId: input.externalId ?? null, url: input.url ?? null, error: null, updatedAt: now }
        : { ...i, status: "FAILED" as const, error: input.error ?? "publish failed", updatedAt: now },
  );
  // A publish result does not clear an open «needs attention» — only a new ingest or finishing everything does.
  const next = jobStatusFromItems(items);
  await db.videoJob.update({
    where: { id },
    data: {
      items: { set: items },
      status: job.status === "NEEDS_ATTENTION" && next !== "DONE" ? "NEEDS_ATTENTION" : next,
      history: { push: { revision: job.revision, event: input.status === "published" ? "publish" : "publish_failed", at: now, byName: null } },
    },
  });
  return NextResponse.json({ ok: true });
}
