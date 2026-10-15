import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * **أسماء المواضيع المعروفة لمجال** — يقرؤها الرادار قبل أن يسمّي مواضيع اليوم، فيعيد استعمال
 * الاسم نفسه للموضوع نفسه. بلا هذا ظهر «تمويل السيارات» بثلاثة أسماء في تشغيلٍ واحد (١٥ أكتوبر
 * ٢٠٢٦)، وكل اسمٍ جديد يبدأ عدّ أيام الاستمرار من الصفر — وهو المعيار الذي يقوم عليه بنك الأفكار.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.RADAR_INGEST_SECRET;
  if (!secret || request.headers.get("x-radar-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const field = request.nextUrl.searchParams.get("field") ?? "";
  const [fieldType, fieldKey] = field.split(":");
  if (!fieldType || !fieldKey) return NextResponse.json({ error: "bad-request" }, { status: 400 });

  const since = new Date(Date.now() - 15 * 86_400_000);
  const rows = await db.ideaBankItem.findMany({
    where: { fieldType, fieldKey, lastSeenAt: { gte: since } },
    orderBy: { daysSeen: "desc" },
    take: 40,
    select: { topic: true },
  });
  return NextResponse.json({ topics: rows.map((r) => r.topic) });
}
