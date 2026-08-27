import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ deviceId: string }> }) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const { deviceId } = await params;
  const result = await db.mobileDevice.updateMany({ where: { id: deviceId, clientId: session.clientId, enabled: true }, data: { enabled: false, disabledAt: new Date(), disabledReason: "SignedOut" } });
  if (!result.count) return fail("NOT_FOUND", "الجهاز غير موجود.");
  return ok({ unregistered: true });
}
