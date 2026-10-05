import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { endMobileSession } from "@/lib/mobile-api/auth";
import { ok } from "@/lib/mobile-api/http";
import { isObjectId } from "@/lib/mobile-api/params";

/**
 * الخروج يُلغي جلسة هذا التوكن في الخادم، ويُطفئ تنبيهات هذا الجوال.
 *
 * الجسم اختياري: `{ deviceId?: string; expoPushToken?: string }` — `deviceId` هو `device.id`
 * الراجع من `POST /devices/register`، و`expoPushToken` بديلٌ لو لم يحفظ التطبيق المعرّف.
 * ويردّ 200 دائماً (حتى بتوكن منتهٍ أو مستعمَل): الخروج لا يجوز أن يعلق الجوال داخل الحساب.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { deviceId?: unknown; expoPushToken?: unknown } | null;
  const session = await endMobileSession(request);

  let deviceUnregistered = false;
  if (session) {
    const deviceId = typeof body?.deviceId === "string" && isObjectId(body.deviceId) ? body.deviceId : null;
    const expoPushToken = typeof body?.expoPushToken === "string" && body.expoPushToken.length <= 200 ? body.expoPushToken : null;
    if (deviceId || expoPushToken) {
      const result = await db.mobileDevice.updateMany({
        where: { clientId: session.clientId, enabled: true, ...(deviceId ? { id: deviceId } : { expoPushToken: expoPushToken as string }) },
        data: { enabled: false, disabledAt: new Date(), disabledReason: "SignedOut" },
      });
      deviceUnregistered = result.count > 0;
    }
  }
  return ok({ signedOut: true, deviceUnregistered });
}
