import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";

export async function GET(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const videos = await db.media.findMany({
    where: { clientId: session.clientId, inReels: true },
    orderBy: { createdAt: "desc" }, take: 100,
    select: { id: true, filename: true, reelStatus: true, reelSlug: true, thumbnailUrl: true, playbackUrl: true, mp4Url: true, durationSec: true, reelRejectionReason: true, createdAt: true, updatedAt: true },
  });
  return ok({ videos });
}
