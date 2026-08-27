import { db } from "@/lib/db";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

type PublicMobilePushEvent = "BOOKING_CREATED" | "WHATSAPP_CONTACT";

interface MobilePushPayload {
  event: PublicMobilePushEvent;
  title: string;
  body: string;
  articleId?: string | null;
}

/** Sends the smallest useful payload after a public lead is persisted. */
export async function notifyClientMobile(
  clientId: string,
  payload: MobilePushPayload,
): Promise<void> {
  try {
    const devices = await db.mobileDevice.findMany({
      where: { clientId, enabled: true },
      select: { id: true, expoPushToken: true },
    });

    await Promise.allSettled(
      devices.map(async (device) => {
        const response = await fetch(EXPO_PUSH_URL, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: device.expoPushToken,
            sound: "default",
            title: payload.title,
            body: payload.body,
            data: {
              event: payload.event,
              ...(payload.articleId ? { articleId: payload.articleId } : {}),
            },
          }),
        });

        if (!response.ok) return;
        const result = (await response.json()) as {
          data?: { details?: { error?: string } }[];
        };
        if (result.data?.[0]?.details?.error === "DeviceNotRegistered") {
          await db.mobileDevice.update({
            where: { id: device.id },
            data: {
              enabled: false,
              disabledAt: new Date(),
              disabledReason: "DeviceNotRegistered",
            },
          });
        }
      }),
    );
  } catch {
    // The visitor action must not fail when Expo is unavailable.
  }
}
