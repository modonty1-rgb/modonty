import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { isLandingClickRateLimited } from "./is-landing-click-rate-limited";
import { landingClickSchema } from "./landing-click-schema";

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",") ?? [];
  return forwarded[forwarded.length - 1]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

/**
 * يحفظ ضغطة واتساب من صفحة هبوط بلا نموذج (`/business-presence`) — تُرسَل بـ`sendBeacon` فلا تؤخّر
 * انتقال الزائر. نفس حرّاس `campaign-submissions`: نفس الأصل، وحدّ لكل IP، وZod. والتكرار بـ`eventId`.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false }, { status: 403 });
  }
  const ipAddress = clientIp(request);
  if (isLandingClickRateLimited(ipAddress, Date.now())) {
    return NextResponse.json({ success: false }, { status: 429 });
  }
  // sendBeacon posts text/plain unless given a typed Blob — read the body as text either way.
  const parsed = landingClickSchema.safeParse(await request.text().then((t) => JSON.parse(t)).catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
  const input = parsed.data;

  try {
    const seen = await db.landingClick.findUnique({ where: { eventId: input.eventId }, select: { id: true } });
    if (seen) return NextResponse.json({ success: true, data: { replayed: true } });
    await db.landingClick.create({
      data: { ...input, ipAddress, userAgent: request.headers.get("user-agent") },
      select: { id: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[landing-clicks] Failed to record click", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
