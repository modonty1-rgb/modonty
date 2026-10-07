import "server-only";

import { db } from "@/lib/db";

export type ReaderDeviceDisableReason = "SignedOut" | "Unregistered" | "Replaced" | "DeviceNotRegistered";

/**
 * Stops pushes to reader phones without deleting the row (the token may come back on the next
 * register, which re-enables it). Only enabled rows move, so a repeat call is a no-op.
 */
export async function disableReaderDevices(
  where: { userId?: string; deviceId?: string; ids?: string[]; tokens?: string[]; exceptToken?: string },
  reason: ReaderDeviceDisableReason,
): Promise<number> {
  const { count } = await db.readerDevice.updateMany({
    where: {
      enabled: true,
      ...(where.userId ? { userId: where.userId } : {}),
      ...(where.deviceId ? { deviceId: where.deviceId } : {}),
      ...(where.ids ? { id: { in: where.ids } } : {}),
      ...(where.tokens ? { expoPushToken: { in: where.tokens } } : {}),
      ...(where.exceptToken ? { expoPushToken: { not: where.exceptToken } } : {}),
    },
    data: { enabled: false, disabledAt: new Date(), disabledReason: reason },
  });
  return count;
}
