import { db } from "@/lib/db";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const MAX_ATTEMPTS = 3;

export type MobilePushEvent =
  | "ARTICLE_AWAITING_APPROVAL"
  | "ARTICLE_APPROVED"
  | "ARTICLE_CHANGED"
  | "ARTICLE_PUBLISHED"
  | "AUDIENCE_QUESTION"
  | "AUDIENCE_COMMENT"
  | "VIDEO_REVIEWED"
  | "SUPPORT_REPLY"
  | "WHATSAPP_CONTACT"
  | "BOOKING_CREATED"
  | "BOOKING_UPDATED"
  | "CONTACT_LEAD";

interface PushInput {
  clientId: string;
  event: MobilePushEvent;
  title: string;
  body: string;
  data?: Record<string, string>;
}

function wait(milliseconds: number) { return new Promise((resolve) => setTimeout(resolve, milliseconds)); }

/** Best-effort delivery. A push outage never reverses the business event that caused it. */
export async function sendPushToClient(input: PushInput) {
  const devices = await db.mobileDevice.findMany({ where: { clientId: input.clientId, enabled: true }, select: { id: true, expoPushToken: true } });
  if (!devices.length) return { attempted: 0, accepted: 0 };

  const payload = devices.map((device) => ({ to: device.expoPushToken, sound: "default", title: input.title, body: input.body, data: { event: input.event, ...input.data } }));
  let response: Response | null = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      response = await fetch(EXPO_PUSH_URL, { method: "POST", headers: { "content-type": "application/json", accept: "application/json" }, body: JSON.stringify(payload) });
      if (response.ok || (response.status !== 429 && response.status < 500)) break;
    } catch { /* retry below */ }
    await wait(500 * 2 ** attempt);
  }
  if (!response?.ok) return { attempted: devices.length, accepted: 0 };

  const result = await response.json().catch(() => null) as { data?: Array<{ status?: string; details?: { error?: string } }> } | null;
  const rejected = (result?.data ?? []).flatMap((ticket, index) => ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered" ? [devices[index]?.id] : []).filter(Boolean) as string[];
  if (rejected.length) await db.mobileDevice.updateMany({ where: { id: { in: rejected } }, data: { enabled: false, disabledAt: new Date(), disabledReason: "DeviceNotRegistered" } });
  return { attempted: devices.length, accepted: devices.length - rejected.length };
}
