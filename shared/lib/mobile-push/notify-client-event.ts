import { after } from "next/server";
import { db } from "../db";
import { describeClientEvent, type ClientEvent } from "./client-events";
import { isGroupOn, readNotificationPreferences } from "./preference-groups";

/**
 * الجسر الواحد: حدث في مدونتي أو الأدمن ← صفّ في صندوق العميل + دفعة إلى جواله.
 *
 * كانت ثلاث نسخ (modonty/lib/mobile-push.ts · console/lib/mobile-api/push.ts ·
 * console/lib/push/notify-client.ts)، اثنتان منها لا تكتبان صفّاً ولا تحترمان التفضيلات،
 * والثالثة لا يستدعيها أحد. فوصل الجرس لطلب التواصل وحده، وسكت لكل شيء آخر.
 *
 * لا ترمي أبداً: الحدث الأصلي (سؤال القارئ · اعتماد المقال) نجح قبل النداء، وسقوط الشبكة
 * أو خدمة Expo لا يجوز أن يُفشله. والصفّ يُكتب قبل الدفع، فلو سقط الدفع بقي التنبيه في التطبيق.
 *
 * لا يُرسَل للعميل عن فعلٍ فعله هو نفسه — هذا على المستدعي (لا يستدعيها من مسارات الكونسول).
 */

const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";
/** التوثيق الرسمي: «an array of up to 100 message objects» في الطلب الواحد. */
const MAX_DEVICES = 100;

type ExpoTicket = { status: "ok" | "error"; details?: { error?: string } };

export type NotifyClientEventResult = {
  notificationId: string | null;
  pushed: number;
  skipped: "muted" | "no-devices" | "failed" | null;
};

export async function notifyClientEvent(clientId: string, event: ClientEvent): Promise<NotifyClientEventResult> {
  const message = describeClientEvent(event);
  let notificationId: string | null = null;
  try {
    const row = await db.notification.create({
      data: { clientId, type: message.type, title: message.title, body: message.body, relatedId: message.relatedId, readAt: null },
      select: { id: true },
    });
    notificationId = row.id;

    const client = await db.client.findUnique({ where: { id: clientId }, select: { notificationPreferences: true } });
    if (!isGroupOn(readNotificationPreferences(client?.notificationPreferences ?? null), message.group)) {
      return { notificationId, pushed: 0, skipped: "muted" };
    }

    const devices = await db.mobileDevice.findMany({
      where: { clientId, enabled: true },
      select: { id: true, expoPushToken: true },
      take: MAX_DEVICES,
    });
    if (devices.length === 0) return { notificationId, pushed: 0, skipped: "no-devices" };

    const response = await fetch(EXPO_PUSH_ENDPOINT, {
      method: "POST",
      headers: { accept: "application/json", "accept-encoding": "gzip, deflate", "content-type": "application/json" },
      body: JSON.stringify(devices.map((device) => ({
        to: device.expoPushToken,
        title: message.title,
        body: message.body,
        sound: "default",
        // قناة التطبيق العربية — بدونها ينزل التنبيه في قناة أندرويد الصامتة (مقيس على SM-A217F).
        channelId: "default",
        data: { notificationId, type: message.type, relatedId: message.relatedId, articleId: message.articleId },
      }))),
    });
    if (!response.ok) {
      console.warn("[mobile-push] Expo رد غير ناجح", response.status, message.type);
      return { notificationId, pushed: 0, skipped: "failed" };
    }
    const payload = (await response.json()) as { data?: ExpoTicket[] | ExpoTicket };
    const tickets = Array.isArray(payload.data) ? payload.data : payload.data ? [payload.data] : [];

    // `DeviceNotRegistered` = حذف التطبيق أو ألغى الإذن؛ التوثيق: «stop sending to that token».
    const dead = tickets
      .map((ticket, index) => (ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered" ? devices[index]?.id : null))
      .filter((id): id is string => typeof id === "string");
    if (dead.length > 0) {
      await db.mobileDevice.updateMany({
        where: { id: { in: dead } },
        data: { enabled: false, disabledAt: new Date(), disabledReason: "DeviceNotRegistered" },
      });
    }
    return { notificationId, pushed: tickets.filter((ticket) => ticket.status === "ok").length, skipped: null };
  } catch (reason) {
    console.warn("[mobile-push] تعذّر إيصال تنبيه العميل", message.type, reason);
    return { notificationId, pushed: 0, skipped: "failed" };
  }
}

/**
 * للمستدعين الذين لا ينتظرون: يُرسل **بعد** الرد على القارئ فلا يُبطئه.
 *
 * `after` لا `void`: على Vercel قد تتجمّد الدالّة بعد الرد فيضيع وعدٌ مُطلَق بلا انتظار؛
 * `after` يمدّ عمرها بـ`waitUntil` حتى يكتمل الإرسال (توثيق Next.js · after.mdx).
 * يعمل داخل أكشن أو مسار؛ خارج سياق طلب (سكربت) يُرسل مباشرة.
 */
export function fireClientEvent(clientId: string | null | undefined, event: ClientEvent): void {
  if (!clientId) return;
  try {
    after(() => notifyClientEvent(clientId, event));
  } catch {
    void notifyClientEvent(clientId, event);
  }
}
