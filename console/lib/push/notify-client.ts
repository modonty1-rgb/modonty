import { db } from "@/lib/db";
import { NOTIFICATION_GROUPS, readNotificationPreferences, type NotificationGroupKey } from "@/app/api/mobile/v1/me/preference-groups";

/**
 * تنبيه العميل: صفٌّ في صندوقه **ودفعٌ إلى جواله**، في نداء واحد.
 *
 * الاثنان معاً عمداً. كان الصندوق يمتلئ ولا يُدفع منه شيء، فيعرف العميل بالمقال المنتظر
 * قراره فقط لو فتح التطبيق — أي أنّ التطبيق «يُتفقَّد» ولا «يُنبِّه». وفصلُهما إلى ندائين
 * يفتح باب أن يوجد أحدهما بلا الآخر: دفعةٌ بلا أثر في الصندوق يضغطها العميل فلا يجد شيئاً،
 * أو صفٌّ صامت لا يعلم به. فالدالّة واحدة، ولا يُكتب صفٌّ إلّا ومعه محاولة دفع.
 *
 * والدفع **لا يُسقط** كتابة الصفّ: لو تعذّر الوصول إلى خدمة Expo يبقى التنبيه في الصندوق —
 * الشبكةُ تسقط والمعلومةُ لا يجوز أن تسقط معها.
 */

const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";

/** التوثيق الرسمي: «an array of up to 100 message objects» في الطلب الواحد. */
const MAX_MESSAGES_PER_REQUEST = 100;

type ExpoTicket = { status: "ok" | "error"; id?: string; message?: string; details?: { error?: string } };

export type NotifyClientInput = {
  clientId: string;
  /** يُشتقّ منه هدف الفتح في التطبيق (`targetOf` في نقطة التنبيهات) — فليكن بنفس بادئاته. */
  type: string;
  title: string;
  body: string;
  relatedId?: string | null;
  /**
   * أي مفتاح تفضيل يحكم هذا التنبيه.
   *
   * `actionable` لما يحتاج فعلاً من العميل (مقال ينتظر قراره · سؤال قارئ · طلّة مرفوضة)،
   * و`activity` لما هو خبرٌ لا مهمّة (تعليق · طلّة اعتُمدت). وهما نفس المفتاحين اللذين
   * يقلبهما العميل في S13، فلا نخترع تفضيلاً ثالثاً بلا مكان يعيش فيه.
   */
  group: NotificationGroupKey;
};

export type NotifyClientResult = { notificationId: string | null; pushed: number; skipped: "muted" | "no-devices" | null };

/**
 * دفعٌ إلى الجوال **بلا كتابة صفّ**.
 *
 * لأنّ بعض الأحداث يكتب صفّه بنفسه في مكان آخر، فلو كتبنا صفّاً ثانياً هنا لرأى العميل
 * التنبيه مرّتين في صندوقه. فمن يملك صفّه ينادي هذه، ومن لا يملكه ينادي `notifyClient`.
 */
export async function pushToClient(input: NotifyClientInput & { notificationId?: string | null }): Promise<NotifyClientResult> {
  return deliver(input, input.notificationId ?? null);
}

export async function notifyClient(input: NotifyClientInput): Promise<NotifyClientResult> {
  const notification = await db.notification.create({
    data: { clientId: input.clientId, type: input.type, title: input.title, body: input.body, relatedId: input.relatedId ?? null },
    select: { id: true },
  });
  return deliver(input, notification.id);
}

async function deliver(input: NotifyClientInput, notificationId: string | null): Promise<NotifyClientResult> {
  const client = await db.client.findUnique({ where: { id: input.clientId }, select: { notificationPreferences: true } });
  const preferences = readNotificationPreferences(client?.notificationPreferences ?? null);
  const group = NOTIFICATION_GROUPS.find((candidate) => candidate.key === input.group);
  /**
   * القراءة `=== true` بنفس قاعدة `notificationToggles` — المفتاح الغائب **مطفأ**.
   * ولو عاملناه مفعّلاً لاختلفت الشاشة عن السلوك: يقرأ العميل «مطفأ» ويصله الدفع.
   */
  const allowed = group !== undefined && group.preferenceKeys.every((key) => preferences[key] === true);
  if (!allowed) return { notificationId, pushed: 0, skipped: "muted" };

  const devices = await db.mobileDevice.findMany({
    where: { clientId: input.clientId, enabled: true },
    select: { id: true, expoPushToken: true },
    take: MAX_MESSAGES_PER_REQUEST,
  });
  if (devices.length === 0) return { notificationId, pushed: 0, skipped: "no-devices" };

  const messages = devices.map((device) => ({
    to: device.expoPushToken,
    title: input.title,
    body: input.body,
    sound: "default",
    /**
     * `channelId` بنصّ التوثيق: «channelId (string) — Android Only — ID of the Notification Channel».
     *
     * بدونه يضع أندرويد التنبيه في `fcm_fallback_notification_channel` — قناة اسمها
     * «Miscellaneous» بلا صوت ولا اهتزاز (مقيس على SM-A217F: `channel=fcm_fallback…
     * sound=null vibrate=null`). فالقناة العربية التي يُنشئها التطبيق تُنشأ ولا تُستعمل،
     * ويرى العميل في إعداداته اسماً أجنبياً لا يعرف ما يطفئه.
     *
     * والقيمة `default` هي نفسها معرّف القناة في `ensureAndroidChannel` — لا تُغيَّر هنا وحدها.
     */
    channelId: "default",
    // يفتح التطبيق على الشاشة الصحيحة ويوسم التنبيه مقروءاً بمعرّفه.
    data: { notificationId, type: input.type, relatedId: input.relatedId ?? null },
  }));

  try {
    const response = await fetch(EXPO_PUSH_ENDPOINT, {
      method: "POST",
      headers: { accept: "application/json", "accept-encoding": "gzip, deflate", "content-type": "application/json" },
      body: JSON.stringify(messages),
    });
    // `response.ok` قبل `json()`: خدمة ساقطة تردّ HTML، و`json()` عليه يرمي خطأً يخفي السبب.
    if (!response.ok) {
      console.warn("دفع التنبيهات: ردّ غير ناجح", response.status, await response.text().catch(() => ""));
      return { notificationId, pushed: 0, skipped: null };
    }
    const payload = (await response.json()) as { data?: ExpoTicket[] | ExpoTicket; errors?: unknown[] };
    const tickets = Array.isArray(payload.data) ? payload.data : payload.data === undefined ? [] : [payload.data];

    /**
     * `DeviceNotRegistered` يعني أنّ العميل حذف التطبيق أو ألغى الإذن — والتوثيق صريح:
     * «signaling that the server should stop sending to that token». فيُطفأ الجهاز بدل أن
     * يُحاوَل إلى الأبد، ويُكتب السبب ليُعرف لاحقاً لماذا صمت هذا الجهاز.
     */
    const dead = tickets
      .map((ticket, index) => ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered" ? devices[index]?.id : null)
      .filter((id): id is string => typeof id === "string");
    if (dead.length > 0) {
      await db.mobileDevice.updateMany({
        where: { id: { in: dead } },
        data: { enabled: false, disabledAt: new Date(), disabledReason: "DeviceNotRegistered" },
      });
    }

    return { notificationId, pushed: tickets.filter((ticket) => ticket.status === "ok").length, skipped: null };
  } catch (reason) {
    // الصفّ كُتب ويبقى: سقوط الشبكة يمنع الدفع ولا يمنع العميل من رؤية التنبيه في التطبيق.
    console.warn("دفع التنبيهات: تعذّر الوصول إلى خدمة Expo", reason);
    return { notificationId, pushed: 0, skipped: null };
  }
}
