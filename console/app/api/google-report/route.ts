import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getClientSearchRows, type ReportDimension } from "@/lib/google/get-client-search-rows";
import { verifyGoogleReportKey } from "@/lib/google/verify-google-report-key";

export const runtime = "nodejs";
export const maxDuration = 60;

const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const querySchema = z.object({
  key: z.string().min(1).max(200),
  start: isoDay,
  end: isoDay,
  dims: z
    .string()
    .default("")
    .transform((s) => [...new Set(s.split(",").filter(Boolean))])
    .pipe(z.array(z.enum(["date", "page", "query"]))),
});

/**
 * The data behind the client's Google report (Looker Studio), called by our Community Connector.
 *
 * One report serves every client: the report link carries the client's signed key, the connector
 * forwards it here, and only that client's pages come back. A wrong or altered key gets 401 —
 * never another client's rows. Public by design (Google's servers call it), so the key is the lock.
 */
export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const { key, start, end, dims } = parsed.data;
  const clientId = verifyGoogleReportKey(key);
  if (!clientId) return NextResponse.json({ error: "invalid_key" }, { status: 401 });
  if (start > end) return NextResponse.json({ error: "bad_range" }, { status: 400 });

  try {
    const order: ReportDimension[] = ["date", "page", "query"];
    const data = await getClientSearchRows(clientId, start, end, order.filter((d) => dims.includes(d)));
    if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(data, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[google-report]", error);
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }
}
