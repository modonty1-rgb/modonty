import { z } from "zod";

import { db } from "@/lib/db";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { readBody } from "@/lib/mobile-api/request";
import { disableReaderDevices } from "@modonty/shared/lib/reader-push/disable-reader-devices";
import { READER_DEVICE_SELECT } from "@/lib/push/reader-device-shape";

const bodySchema = z.object({
  /** Expo's own token format (expo-server-sdk `Expo.isExpoPushToken`). */
  expoPushToken: z
    .string()
    .trim()
    .max(200)
    .regex(/^(Expo|Exponent)PushToken\[.+\]$/),
  platform: z.enum(["ios", "android"]),
  deviceId: z.string().regex(/^[A-Za-z0-9-]{8,64}$/),
  deviceName: z.string().trim().max(100).nullish(),
  appVersion: z.string().trim().max(30).nullish(),
});

/**
 * N3 — POST /api/mobile/v1/devices/register · Bearer.
 * Upsert by token (pattern of `console/app/api/mobile/v1/devices/register`, on `ReaderDevice`): a token
 * already known — even under another reader who used this phone before — moves to the current reader
 * and is re-enabled. Older tokens of the same phone (Expo rotated it) are disabled as `Replaced`, so
 * one phone never gets the same push twice. Called after every sign-in and app start.
 * → `{ device }`
 */
export const POST = handle("devices-register", async (request: Request) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;
  const { expoPushToken, platform, deviceId, deviceName, appVersion } = body.value;

  const now = new Date();
  const fields = {
    userId: reader.id,
    deviceId,
    platform,
    deviceName: deviceName ?? null,
    appVersion: appVersion ?? null,
    enabled: true,
    lastSeenAt: now,
    disabledAt: null,
    disabledReason: null,
  };
  const device = await db.readerDevice.upsert({
    where: { expoPushToken },
    create: { expoPushToken, ...fields },
    update: fields,
    select: READER_DEVICE_SELECT,
  });
  await disableReaderDevices({ deviceId, exceptToken: expoPushToken }, "Replaced");

  return ok({ device });
});
