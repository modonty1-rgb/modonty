import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { registerPushDevice } from '@/src/services/mobile-api';
import { savePushDeviceId } from '@/src/services/mobile-session';

/**
 * الوحدتان تُحمَّلان **عند الطلب داخل `try`**، لا في رأس الملفّ.
 *
 * `expo-notifications` و`expo-device` وحدتان **أصليّتان**: وجودهما في `package.json` لا
 * يضعهما في التطبيق المثبَّت، فهما يحتاجان بناءً جديداً. واستيرادهما في الرأس يُقيَّم عند
 * تحميل الحزمة، فيسقط التطبيق **كلّه** على جهاز بُني قبلهما:
 *
 *   [runtime not ready]: Error: Cannot find native module 'ExpoDevice'
 *
 * (مقيس على SM-A217F — شاشة حمراء وتطبيق لا يفتح.) والتحميل المتأخّر يجعل الغياب يتدهور
 * إلى `unsupported` بدل أن يهدم كل شيء: التطبيق يعمل اليوم، والتنبيهات تبدأ وحدها لحظة
 * وجود بناء جديد — بلا سطر كود إضافي.
 */
type NotificationsModule = typeof import('expo-notifications');
type DeviceModule = typeof import('expo-device');

function loadNativeModules(): { notifications: NotificationsModule; device: DeviceModule } | null {
  try {
    return { notifications: require('expo-notifications') as NotificationsModule, device: require('expo-device') as DeviceModule };
  } catch {
    return null;
  }
}

/**
 * تسجيل الجهاز لاستقبال التنبيهات.
 *
 * كان الخادم يملك نقطة `devices/register` وموديل `MobileDevice` بحقل `expoPushToken` فريد،
 * **والتطبيق لا يذكر `devices` ولا مرّة** — فالصندوق جاهز وما فيه من يضع عنوانه. ومعناه أنّ
 * العميل لا يصله شيء وجواله مغلق، فيعرف بالمقال المنتظر قراره فقط لو فتح التطبيق بنفسه.
 *
 * والتسجيل يقع بعد الدخول لا قبله: الرمز يُربط بعميل، ولا عميل قبل الجلسة.
 */

/** لماذا فشل التسجيل — يُسجَّل ولا يُبتلع، ولا يُعرض للعميل: هذا شأن تشغيليّ لا رسالة له. */
export type PushRegistrationOutcome =
  | { status: 'registered'; token: string }
  | { status: 'denied' }
  | { status: 'unsupported'; reason: string }
  | { status: 'failed'; reason: string };

/**
 * المحاكي لا يملك رمزاً — التوثيق الرسمي صريح: التنبيهات البعيدة تحتاج **جهازاً فعليّاً**.
 * فنفرّق بين «غير مدعوم» و«فشل» كي لا يُقرأ عملُ المحاكي عطلاً في السجلّ.
 */
export async function registerForPushNotifications(accessToken: string): Promise<PushRegistrationOutcome> {
  const native = loadNativeModules();
  if (native === null) return { status: 'unsupported', reason: 'وحدات التنبيهات الأصلية غير مبنيّة في هذا التطبيق — يلزم بناء تطوير جديد' };
  const { notifications: Notifications, device: Device } = native;
  if (!Device.isDevice) return { status: 'unsupported', reason: 'محاكي لا جهاز فعليّ' };

  try {
    const existing = await Notifications.getPermissionsAsync();
    let granted = existing.status === 'granted';
    // لا نسأل مرّتين: من رفض مرّة يبقى رفضه، وإعادة السؤال في كل فتح مضايقة لا إقناع.
    if (!granted && existing.canAskAgain) {
      const requested = await Notifications.requestPermissionsAsync();
      granted = requested.status === 'granted';
    }
    if (!granted) return { status: 'denied' };

    /**
     * `projectId` يُمرَّر يدوياً بنصّ التوثيق: «It is recommended to manually set the project
     * ID, which can be found in the app.json file under the extra.eas.projectId field».
     */
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (typeof projectId !== 'string' || projectId.length === 0) {
      return { status: 'unsupported', reason: 'extra.eas.projectId غير مضبوط' };
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });

    const registered = await registerPushDevice(accessToken, {
      expoPushToken: token,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
      deviceName: Device.deviceName ?? undefined,
      appVersion: Constants.expoConfig?.version ?? undefined,
    });
    // يُحفظ ليُلغى به التسجيل عند الخروج (`DELETE /devices/{id}`).
    await savePushDeviceId(registered.device.id);

    return { status: 'registered', token };
  } catch (reason) {
    // لا `catch {}` صامت: السبب يُحمل كما هو ليُقرأ في السجلّ.
    return { status: 'failed', reason: reason instanceof Error ? reason.message : String(reason) };
  }
}

/**
 * أين يفتح التنبيه حين يُضغط.
 *
 * المُرسِل كان يكتب النوع في `data.event` والتطبيق يقرأ `data.type` فقط — فلا تنبيه يفتح
 * شيئاً. نقرأ الاثنين (`type ?? event`) فيعمل التطبيق مع الخادم القديم والجديد معاً.
 * ونقطة التنبيهات تشتقّ الهدف **بنفس البادئات** (`console/app/api/mobile/v1/notifications/route.ts`):
 * أيّ اختلاف بين الاثنين يعني تنبيهاً يفتح تبويباً غير الذي يَعِد به.
 *
 * وتنبيه المقال يفتح **المقال نفسه** لا قائمة المقالات: `data.articleId`، أو `relatedId`
 * لأنه معرّف المقال في كل تنبيه نوعه `article*`.
 */
export type PushTapTab = 'articles' | 'audience' | 'videos' | 'notifications' | 'bookings';
export type PushTapTarget = { tab: PushTapTab; articleId: string | null };

export function tapTabOf(rawType: unknown): PushTapTab | null {
  if (typeof rawType !== 'string') return null;
  // الأنواع تصل بصيغتين (`article_approved` · `askClientQuestion`) — المقارنة بلا حالة أحرف.
  const type = rawType.toLowerCase();
  if (type.startsWith('article')) return 'articles';
  if (type.startsWith('booking')) return 'bookings';
  if (type.startsWith('faq') || type.startsWith('comment') || type.startsWith('contact') || type.includes('question')) return 'audience';
  if (type.startsWith('reel') || type.startsWith('video') || type.startsWith('media')) return 'videos';
  // ما لا هدف له يفتح صندوق التنبيهات: هناك يجده مكتوباً، بدل أن تذهب ضغطته سدى.
  return 'notifications';
}

const nonEmptyString = (value: unknown): string | null => typeof value === 'string' && value.length > 0 ? value : null;

export function tapTargetOf(data: unknown): PushTapTarget | null {
  const payload = (data ?? {}) as Record<string, unknown>;
  const type = nonEmptyString(payload.type) ?? nonEmptyString(payload.event);
  const tab = tapTabOf(type);
  if (tab === null) return null;
  const articleId = tab === 'articles' ? nonEmptyString(payload.articleId) ?? nonEmptyString(payload.relatedId) : null;
  return { tab, articleId };
}

/**
 * يربط الضغطة بوجهتها، ويشمل **الفتح البارد**.
 *
 * `getLastNotificationResponse()` بنصّ التوثيق للحالة التي كان فيها التطبيق مغلقاً تماماً —
 * بدونها يعمل المراقب فقط والتطبيق حيّ، وهي أقلّ الحالتين وقوعاً في تنبيه حقيقي.
 *
 * يعيد دالّة فكّ الاشتراك، أو `undefined` إن لم تكن الوحدات مبنيّة.
 */
const handledTapIds = new Set<string>();

export function observeNotificationTaps(onTarget: (target: PushTapTarget) => void): (() => void) | undefined {
  const native = loadNativeModules();
  if (native === null) return undefined;
  const Notifications = native.notifications;

  // الضغطة الواحدة تُفتح مرّة: «آخر ضغطة» تبقى محفوظة بعد الخروج والدخول، فبلا هذا تعيد فتح نفس المقال.
  const dispatch = (response: { notification: { request: { identifier: string; content: { data: unknown } } } }): void => {
    const identifier = response.notification.request.identifier;
    if (handledTapIds.has(identifier)) return;
    handledTapIds.add(identifier);
    const target = tapTargetOf(response.notification.request.content.data);
    console.log("[push] tap target:", JSON.stringify(target));
    if (target !== null) onTarget(target);
  };

  const cold = Notifications.getLastNotificationResponse();
  console.log("[push] cold response (sync):", cold ? cold.notification.request.identifier : null);
  if (cold) dispatch(cold);
  // الفتح البارد على أندرويد قد لا يكون جاهزاً لحظة القراءة المتزامنة — القراءة غير المتزامنة تكمّلها.
  void Notifications.getLastNotificationResponseAsync().then((late: typeof cold) => {
    console.log("[push] cold response (async):", late ? late.notification.request.identifier : null);
    if (late) dispatch(late);
  }).catch(() => undefined);

  const subscription = Notifications.addNotificationResponseReceivedListener(dispatch);
  return () => subscription.remove();
}

/**
 * ماذا يحدث للتنبيه **والتطبيق مفتوح**.
 *
 * التوثيق صريح: «By default, if no handler is configured … the application will not show the
 * notification». وهذا ما قِيس فعلاً — دفعةٌ ردّها إكسبو `ok` وإيصالها `ok`، ولم يظهر لها أثر
 * في درج الجهاز لأنّ التطبيق كان في المقدّمة. أي أنّ العميل الذي يتصفّح تطبيقه هو **آخر من
 * يعلم** بسؤال قارئ وصله للتوّ.
 *
 * `shouldPlaySound: false` عمداً: صوتٌ وأنت داخل التطبيق مقاطعةٌ لا تنبيه — العميل هنا حاضر،
 * تكفيه لافتة يراها. والصوت يبقى في القناة حين يكون التطبيق مغلقاً.
 */
export function configureForegroundPresentation(): void {
  const native = loadNativeModules();
  if (native === null) return;
  native.notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/**
 * قناة أندرويد الافتراضية.
 *
 * بدونها تصل التنبيهات على أندرويد ٨+ بلا صوت ولا اهتزاز ولا أولوية — تظهر في الدرج صامتة،
 * وهو أسوأ من ألّا تصل: يظنّ العميل أنّ التنبيهات تعمل وهي لا تلفته.
 */
export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  const native = loadNativeModules();
  if (native === null) return;
  const Notifications = native.notifications;
  try {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'تنبيهات مدونتي',
      importance: Notifications.AndroidImportance.DEFAULT,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  } catch (reason) {
    console.warn('تعذّر إنشاء قناة التنبيهات:', reason);
  }
}
