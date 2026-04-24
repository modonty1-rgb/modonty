import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-internal-secret");
  if (!secret || secret !== process.env.INTERNAL_LOG_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    message: string;
    digest?: string | null;
    path: string;
    method: string;
    routePath: string;
    routeType: string;
    source: string;
  };

  await db.systemError.create({
    data: {
      message: String(body.message).slice(0, 1000),
      digest: body.digest ? String(body.digest) : null,
      path: String(body.path).slice(0, 500),
      method: String(body.method),
      routePath: String(body.routePath).slice(0, 500),
      routeType: String(body.routeType),
      source: String(body.source),
    },
  });

  return NextResponse.json({ ok: true });
}
