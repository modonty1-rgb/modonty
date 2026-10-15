import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";

/**
 * **طلبات «ابحث الآن»** — الرادار على Contabo يسأل هنا كل ٥ دقائق.
 *
 * GET  يستلم حتى ٣ طلبات معلّقة ويقلبها RUNNING (فلا يستلمها تشغيلٌ متداخل مرّتين).
 * POST يبلّغ نتيجة طلب: DONE بعدد ما أُضيف، أو FAILED بالسبب.
 * طلبٌ بقي RUNNING أكثر من ٣٠ دقيقة يُعاد للطابور — تشغيلٌ مات في منتصفه لا يحبس المجال للأبد.
 */

function authorized(request: NextRequest) {
  const secret = process.env.RADAR_INGEST_SECRET;
  return !!secret && request.headers.get("x-radar-secret") === secret;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stale = new Date(Date.now() - 30 * 60_000);
  await db.ideaBankRequest.updateMany({
    where: { status: "RUNNING", startedAt: { lt: stale } },
    data: { status: "PENDING", startedAt: null },
  });

  const pending = await db.ideaBankRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: 3,
    select: { id: true, fieldType: true, fieldKey: true, fieldName: true },
  });
  if (pending.length > 0) {
    await db.ideaBankRequest.updateMany({
      where: { id: { in: pending.map((p) => p.id) }, status: "PENDING" },
      data: { status: "RUNNING", startedAt: new Date() },
    });
  }
  return NextResponse.json({ requests: pending });
}

const Report = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/),
  status: z.enum(["DONE", "FAILED"]),
  created: z.number().int().min(0).max(1000).optional(),
  error: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = Report.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad-request" }, { status: 400 });

  const { id, status, created, error } = parsed.data;
  await db.ideaBankRequest.update({
    where: { id },
    data: { status, created: created ?? null, error: error ?? null, doneAt: new Date() },
    select: { id: true },
  });
  revalidatePath("/idea-bank");
  return NextResponse.json({ ok: true });
}
