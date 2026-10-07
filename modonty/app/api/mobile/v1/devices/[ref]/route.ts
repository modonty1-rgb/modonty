import { db } from "@/lib/db";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { ACCOUNT_MESSAGES } from "@/lib/mobile-api/messages-account";
import { isObjectId } from "@/lib/mobile-api/params";
import { disableReaderDevices } from "@/lib/push/disable-reader-devices";
import { READER_DEVICE_SELECT } from "@/lib/push/reader-device-shape";

type Ctx = { params: Promise<{ ref: string }> };

const TOKEN = /^(Expo|Exponent)PushToken\[.+\]$/;

/** `ref` = the row id from `POST /devices/register`, or the Expo push token itself (URL-encoded). */
function readRef(raw: string): { id: string } | { expoPushToken: string } | null {
  let ref: string;
  try {
    ref = decodeURIComponent(raw).trim();
  } catch {
    return null;
  }
  if (isObjectId(ref)) return { id: ref };
  if (ref.length <= 200 && TOKEN.test(ref)) return { expoPushToken: ref };
  return null;
}

/**
 * N3 — DELETE /api/mobile/v1/devices/:idOrToken · Bearer.
 * Turns pushes off for one of the reader's phones (the row is kept disabled — `Unregistered` — so a
 * later register re-enables it). Only the reader's own rows: anyone else's → 404. Repeating is fine.
 * → `{ device }`
 */
export const DELETE = handle("devices-unregister", async (request: Request, { params }: Ctx) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  const ref = readRef((await params).ref);
  if (!ref) return fail("NOT_FOUND", ACCOUNT_MESSAGES.deviceNotFound);

  const row = await db.readerDevice.findFirst({ where: { ...ref, userId: reader.id }, select: { id: true } });
  if (!row) return fail("NOT_FOUND", ACCOUNT_MESSAGES.deviceNotFound);

  await disableReaderDevices({ ids: [row.id], userId: reader.id }, "Unregistered");
  const device = await db.readerDevice.findUniqueOrThrow({ where: { id: row.id }, select: READER_DEVICE_SELECT });
  return ok({ device });
});
