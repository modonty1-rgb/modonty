import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";

/**
 * **مدخل «بنك الأفكار» من رادار المحتوى** (خالد ١٥ أكتوبر ٢٠٢٦).
 *
 * يناديه سكربت `automation/content-radar/radar.py` على سيرفر Contabo كل ساعة. السيرفر لا يحمل
 * رابط القاعدة — يكلّم هذا المسار وحده بسرٍّ مشترك (`RADAR_INGEST_SECRET`)، كما توصي الخطة §19.
 * والمسار تحت `/api` فلا يمرّ بحارس تسجيل الدخول (`proxy.ts` matcher) — السرُّ هو الحارس.
 *
 * فكرةٌ رآها الرادار من قبل لا يُكتب عليها شيءٌ سوى «آخر ظهور»: قرارُ الفريق عليها
 * (اعتمد/رفض/تابع) لا يُمسّ أبداً بتشغيلٍ لاحق.
 */

const Item = z.object({
  key: z.string().regex(/^[a-f0-9]{8,40}$/),
  topic: z.string().trim().min(1).max(500),
  sourceTitle: z.string().max(500).optional().default(""),
  sourceUrl: z.string().max(2000).optional().default(""),
  sourcePlatform: z.enum(["google_trends", "google_suggest", "google_news", "competitor", "youtube", "x"]),
  market: z.string().trim().min(2).max(4),
  engagement: z.string().max(100).optional().default(""),
  crossSourceCount: z.number().int().min(1).max(1000).default(1),
  sector: z.string().max(100).optional().default(""),
  saudiRelevance: z.number().int().min(0).max(100),
  opportunityScore: z.number().int().min(0).max(100),
  whyItMatters: z.string().max(1000).optional().default(""),
  suggestedAngle: z.string().max(1000).optional().default(""),
  fieldType: z.enum(["sector", "category", "industry", "general", "competitor"]).optional(),
  fieldKey: z.string().max(100).optional(),
  fieldName: z.string().max(200).optional(),
  intent: z.enum(["evergreen", "trend"]).optional(),
  /** أيام (YYYY-MM-DD) نُشر فيها خبرٌ قريب خلال آخر ١٠ — يحسبها الرادار من تواريخ النشر. */
  historyDays: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).max(15).optional(),
});
const Body = z.object({ items: z.array(Item).min(1).max(100) });

export async function POST(request: NextRequest) {
  const secret = process.env.RADAR_INGEST_SECRET;
  if (!secret || request.headers.get("x-radar-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad-request", issues: parsed.error.issues.slice(0, 5) }, { status: 400 });
  }

  // دفعة واحدة لكل عملية — لا نداء لكل فكرة.
  const items = parsed.data.items;
  const keys = [...new Set(items.map((i) => i.key))];
  const existing = await db.ideaBankItem.findMany({ where: { key: { in: keys } }, select: { id: true, key: true, seenDays: true } });
  const known = new Set(existing.map((e) => e.key));
  const now = new Date();
  // اليوم بتوقيت الرياض — «ظهر يوماً» يُعدّ بيوم القارئ السعودي لا بيوم UTC.
  const day = new Date(now.getTime() + 3 * 3600_000).toISOString().slice(0, 10);
  /** أيام الظهور = أيام الأخبار السابقة (من تواريخ نشرها) ∪ اليوم — بلا تكرار، مرتّبة. */
  const daysOf = (prev: string[], history: string[] = []) => [...new Set([...prev, ...history, day])].sort();

  const fresh = items.filter((i, idx) => !known.has(i.key) && items.findIndex((j) => j.key === i.key) === idx);
  if (fresh.length > 0) {
    await db.ideaBankItem.createMany({
      data: fresh.map((i) => ({
        key: i.key,
        topic: i.topic,
        sourceTitle: i.sourceTitle || null,
        sourceUrl: i.sourceUrl || null,
        sourcePlatform: i.sourcePlatform,
        market: i.market,
        engagement: i.engagement || null,
        crossSourceCount: i.crossSourceCount,
        sector: i.sector || null,
        saudiRelevance: i.saudiRelevance,
        opportunityScore: i.opportunityScore,
        whyItMatters: i.whyItMatters || null,
        suggestedAngle: i.suggestedAngle || null,
        fieldType: i.fieldType ?? null,
        fieldKey: i.fieldKey ?? null,
        fieldName: i.fieldName ?? null,
        intent: i.intent ?? null,
        seenDays: daysOf([], i.historyDays),
        daysSeen: daysOf([], i.historyDays).length,
        status: "NEW",
        firstSeenAt: now,
        lastSeenAt: now,
      })),
    });
  }
  if (known.size > 0) {
    // يومٌ جديد أو أيام أخبار لم تُعدّ ⇒ تُدمج · لا جديد ⇒ «آخر ظهور» فقط. الحالة لا تُمسّ أبداً.
    const incoming = new Map(items.map((i) => [i.key, i.historyDays ?? []]));
    const grow = existing
      .map((e) => ({ id: e.id, before: e.seenDays.length, after: daysOf(e.seenDays, incoming.get(e.key)) }))
      .filter((g) => g.after.length > g.before);
    // تحديثٌ لكل فكرةٍ زادت أيامها فقط (عادةً قليلة)، داخل معاملة واحدة.
    if (grow.length > 0) {
      await db.$transaction(
        grow.map((g) => db.ideaBankItem.update({ where: { id: g.id }, data: { seenDays: g.after, daysSeen: g.after.length }, select: { id: true } })),
      );
    }
    await db.ideaBankItem.updateMany({ where: { key: { in: [...known] } }, data: { lastSeenAt: now } });
  }

  revalidatePath("/idea-bank");
  return NextResponse.json({ ok: true, created: fresh.length, seenAgain: known.size });
}
