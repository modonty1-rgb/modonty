import { NextRequest, NextResponse } from "next/server";
import { getRadarFields } from "@/lib/idea-bank/get-radar-fields";

/**
 * **المجالات التي يرصدها رادار المحتوى** — يقرؤها الرادار في كل تشغيل يومي.
 * محميّ بنفس سرّ المدخل؛ تحت `/api` فلا يمرّ بحارس الدخول.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.RADAR_INGEST_SECRET;
  if (!secret || request.headers.get("x-radar-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ fields: await getRadarFields() });
}
