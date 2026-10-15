import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";

/**
 * **تسجيل رصد مجال** — يبلّغه الرادار بعد كل مجال (نجح أو فشل)، فتعرف الصفحة متى رُصد آخر مرّة
 * وكم أخرج. بلا هذا كان الصفر يعني «لم يصله الدور» و«رُصد ولا شيء» معاً.
 */
const Body = z.object({
  fieldType: z.enum(["sector", "category", "industry", "general", "competitor"]),
  fieldKey: z.string().min(1).max(100),
  fieldName: z.string().min(1).max(200),
  ideas: z.number().int().min(0).max(1000),
  error: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  const secret = process.env.RADAR_INGEST_SECRET;
  if (!secret || request.headers.get("x-radar-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad-request" }, { status: 400 });

  const { fieldType, fieldKey, fieldName, ideas, error } = parsed.data;
  const data = { fieldName, lastScanAt: new Date(), lastIdeas: ideas, lastError: error ?? null };
  await db.ideaBankFieldScan.upsert({
    where: { fieldType_fieldKey: { fieldType, fieldKey } },
    create: { fieldType, fieldKey, ...data },
    update: data,
    select: { id: true },
  });
  revalidatePath("/idea-bank");
  return NextResponse.json({ ok: true });
}
