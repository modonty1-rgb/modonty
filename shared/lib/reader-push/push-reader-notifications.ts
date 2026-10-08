import { Expo, type ExpoPushMessage, type ExpoPushTicket } from "expo-server-sdk";
import { after } from "next/server";
import { db } from "../db";
import { disableReaderDevices } from "./disable-reader-devices";
import { resolveNotificationTargets } from "./notification-targets";

/**
 * دفع إشعارات القارئ إلى جوّاله — مسار واحد يستدعيه:
 *   ١. الكونسول لحظة كتابة الإشعار (`fireReaderPush` عبر `after()`) — الإشعار يصل فوراً.
 *   ٢. مهمّة مدونتي المجدولة (`/api/mobile/v1/internal/push-dispatch`) — تلتقط ما فات (سقوط شبكة
 *      أو Expo) فلا يضيع إشعار.
 *
 * بمكتبة Expo الرسمية (`expo-server-sdk` 7.2): تعيد المحاولة على 429 بتراجع أُسّي، وتحدّ الطلبات
 * المتزامنة. كل صفّ يُحجز (`pushedAt`) قبل الإرسال بشرط أنه لم يُحجز — فالمساران معاً لا يرسلان
 * الإشعار مرّتين. والطلب الفاشل يُفكّ حجزه فتعيده المهمّة.
 *
 * لا ترمي أبداً: الحدث الأصلي (اعتماد التعليق · الرد) نجح قبل النداء.
 */

/** «لم يُدفع» — null صراحةً **أو** غائب (صفوف ما قبل الحقل). `null` وحده لا يطابق الغائب في مونغو. */
export const NOT_PUSHED = { OR: [{ pushedAt: null }, { pushedAt: { isSet: false } }] };

let client: Expo | null = null;
function expo(): Expo {
  // Enhanced push security (EAS Dashboard) — مع التفعيل يُرفض أي طلب بلا الرمز.
  const accessToken = process.env.EXPO_ACCESS_TOKEN;
  client ??= new Expo(accessToken ? { accessToken } : {});
  return client;
}

export interface PushReaderResult {
  claimed: number;
  skippedRead: number;
  sent: number;
  retryLater: number;
  disabledDevices: number;
}

const EMPTY: PushReaderResult = { claimed: 0, skippedRead: 0, sent: 0, retryLater: 0, disabledDevices: 0 };

export async function pushReaderNotifications(notificationIds: string[]): Promise<PushReaderResult> {
  const ids = [...new Set(notificationIds)];
  if (ids.length === 0) return EMPTY;

  const rows = await db.notification.findMany({
    where: { id: { in: ids }, userId: { not: null }, ...NOT_PUSHED },
    select: { id: true, userId: true, type: true, title: true, body: true, readAt: true, relatedId: true },
  });

  const now = new Date();
  const claims = await Promise.all(
    rows.map((n) => db.notification.updateMany({ where: { id: n.id, ...NOT_PUSHED }, data: { pushedAt: now } })),
  );
  const claimed = rows.filter((n, i) => claims[i].count === 1 && n.userId);
  // قُرئ على الويب قبل الدفع ← لا دفع لشيء رآه.
  const toSend = claimed.filter((n) => !n.readAt);
  if (toSend.length === 0) return { ...EMPTY, claimed: claimed.length, skippedRead: claimed.length };

  const [targets, devices] = await Promise.all([
    resolveNotificationTargets(toSend),
    db.readerDevice.findMany({
      where: { userId: { in: [...new Set(toSend.map((n) => n.userId!))] }, enabled: true },
      select: { userId: true, expoPushToken: true },
    }),
  ]);
  const tokensByUser = new Map<string, string[]>();
  for (const d of devices) {
    if (!Expo.isExpoPushToken(d.expoPushToken)) continue;
    tokensByUser.set(d.userId, [...(tokensByUser.get(d.userId) ?? []), d.expoPushToken]);
  }

  const outgoing: { notificationId: string; message: ExpoPushMessage & { to: string } }[] = [];
  for (const n of toSend) {
    const target = targets.get(n.id) ?? null;
    for (const to of tokensByUser.get(n.userId!) ?? []) {
      outgoing.push({
        notificationId: n.id,
        message: {
          to,
          title: n.title,
          body: n.body,
          sound: "default",
          channelId: "default",
          data: {
            type: n.type,
            notificationId: n.id,
            ...(target?.kind === "article" ? { articleSlug: target.slug } : {}),
            ...(target?.kind === "reel" ? { reelSlug: target.slug } : {}),
          },
        },
      });
    }
  }

  const failed = new Set<string>();
  const deadTokens: string[] = [];
  const tickets: { ticketId: string; expoPushToken: string; notificationId: string }[] = [];
  const size = Expo.pushNotificationChunkSizeLimit;
  for (let i = 0; i < outgoing.length; i += size) {
    const chunk = outgoing.slice(i, i + size);
    let result: ExpoPushTicket[];
    try {
      result = await expo().sendPushNotificationsAsync(chunk.map((c) => c.message));
    } catch (error) {
      console.error("[reader-push] Expo request failed after retries", error);
      chunk.forEach((c) => failed.add(c.notificationId));
      continue;
    }
    // التذاكر بترتيب الرسائل.
    result.forEach((ticket, index) => {
      const sent = chunk[index];
      if (ticket.status === "ok") {
        tickets.push({ ticketId: ticket.id, expoPushToken: sent.message.to, notificationId: sent.notificationId });
      } else if (ticket.details?.error === "DeviceNotRegistered") {
        deadTokens.push(sent.message.to);
      } else {
        console.warn("[reader-push] ticket error", ticket.details?.error ?? ticket.message);
      }
    });
  }

  if (tickets.length) await db.readerPushTicket.createMany({ data: tickets });
  const retry = [...failed];
  if (retry.length) await db.notification.updateMany({ where: { id: { in: retry } }, data: { pushedAt: null } });
  const disabledDevices = deadTokens.length ? await disableReaderDevices({ tokens: deadTokens }, "DeviceNotRegistered") : 0;

  return {
    claimed: claimed.length,
    skippedRead: claimed.length - toSend.length,
    sent: tickets.length,
    retryLater: retry.length,
    disabledDevices,
  };
}

/** لحظة الحدث: بعد إرسال الرد للمستخدم (`after`) فلا يبطئ الصفحة، ولا يرمي. */
export function fireReaderPush(notificationIds: string[]): void {
  if (notificationIds.length === 0) return;
  after(async () => {
    try {
      await pushReaderNotifications(notificationIds);
    } catch (error) {
      console.error("[reader-push] push failed — the scheduled sweep will retry", error);
    }
  });
}
