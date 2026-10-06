import Constants from 'expo-constants';
import { APP_RELEASE } from '@/src/services/app-release';
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
      appVersion: APP_RELEASE,
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
  // `review*` (تقييم صفحتك) يُراجَع في تبويب التقييمات داخل الجمهور — نفس سطر الخادم.
  if (type.startsWith('faq') || type.startsWith('comment') || type.startsWith('contact') || type.startsWith('review') || type.includes('question')) return 'audience';
  if (type.startsWith('reel') || type.startsWith('video') || type.startsWith('media')) return 'videos';
  // ما لا هدف له يفتح صندوق التنبيهات: هناك يجده مكتوباً، بدل أن تذهب ضغطته سدى.
  return 'notifications';
}

const nonEmptyString = (value: unknown): string | null => typeof value === 'string' && value.length > 0 ? value : null;

export function tapTargetOf(data: unknown): PushTapTarget | null {
  const payload = (data ?? {}) as Record<string, unknown>;
  const type = nonEmptyString(payload.type) ?? nonEmptyString(payload.event);
  // تنبيهٌ وصل بلا نوع يُقرأ (بيانات ناقصة في مسار الفتح البارد مثلاً) يفتح الصندوق لا «الرئيسية».
  const tab = tapTabOf(type) ?? 'notifications';
  const articleId = tab === 'articles' ? nonEmptyString(payload.articleId) ?? nonEmptyString(payload.relatedId) : null;
  return { tab, articleId };
}

/**
 * الضغطة تُلتقط **عند تحميل الحزمة** وتُحفظ هنا حتى تجهز الشاشات — لا بعد الدخول.
 *
 * مقيس على الإنتاج (٥ أكتوبر ٢٠٢٦، جوال خالد): «مشاركة لصفحتك» والتطبيق مقفول تماماً فتح
 * «الرئيسية» لا التنبيهات. النسخة السابقة كانت تسجّل المستمع وتقرأ «آخر ضغطة» **مرّة واحدة**
 * داخل `useEffect` ينتظر `isSignedIn` — أي بعد تجديد التوكن وجلب الحساب والرئيسية من الشبكة
 * (ثانية إلى ثلاث). وعلى أندرويد تصل ضغطة الفتح البارد عبر `NotificationForwarderActivity` ←
 * `NotificationsService` **بشكل غير متزامن** مع إقلاع التطبيق، وحدث `onDidReceiveNotificationResponse`
 * يُرسَل من الأصلي **ولا يُحفظ لمستمع يأتي بعده**؛ والتوثيق صريح أنّ أندرويد والتطبيق مقتول
 * لا يطلق `NotificationResponseReceivedListener` أصلاً، وأنّ المستمع يُسجَّل «at module top-level»
 * ومعه `getLastNotificationResponse` عند الإقلاع. فكان الاعتماد كلّه على قراءةٍ واحدة في لحظة
 * واحدة، وما فاتها لا يُعاد: المعرّف يدخل `handledTapIds` ولا يُقرأ ثانية، ولا قراءة بعد جاهزية
 * الملاحة. (لم يُلتقط سجلّ من الجوال يحسم أيّ الطرفين فات — فالإصلاح يغلق الطرفين معاً.)
 *
 * الآن: مستمع دائم من أوّل سطر يُحمَّل · قراءة «آخر ضغطة» عند الالتقاط وعند كل اشتراك وبعد
 * مهلة قصيرة · والهدف يبقى **معلَّقاً هنا** حتى يشترك التطبيق (بعد الجلسة والرئيسية والملاحة)،
 * لا يُرمى لأنّ الشجرة لم تجهز. وبعد تسليمه تُمسح «آخر ضغطة» من الأصلي كي لا تعيد فتح نفس
 * الوجهة بعد خروج ودخول.
 */
type TapResponse = { actionIdentifier?: string; notification: { date?: number; request: { identifier?: string | null; content: { data?: unknown } } } };

const handledTapKeys = new Set<string>();
let pendingTapTarget: PushTapTarget | null = null;
let tapConsumer: ((target: PushTapTarget) => void) | null = null;
let isCapturing = false;

// المعرّف قد يغيب في مسار «الإضافات» (`google.message_id`) — فالتاريخ مع البيانات يميّز الضغطة.
function tapKeyOf(response: TapResponse): string {
  const { identifier } = response.notification.request;
  return identifier ? identifier : `${response.notification.date ?? 0}:${JSON.stringify(response.notification.request.content.data ?? null)}`;
}

function acceptTap(response: TapResponse | null, source: string): void {
  if (response === null) return;
  const key = tapKeyOf(response);
  if (handledTapKeys.has(key)) return;
  handledTapKeys.add(key);
  const target = tapTargetOf(response.notification.request.content.data);
  console.log('[push] tap', source, JSON.stringify(target));
  if (target === null) return;
  if (tapConsumer) tapConsumer(target); else pendingTapTarget = target;
  // سُلِّم أو حُفظ هنا — الأصلي لا يحتاج أن يتذكّره بعد الآن.
  try { loadNativeModules()?.notifications.clearLastNotificationResponse(); } catch { /* نسخة أصلية أقدم بلا الدالّة */ }
}

function readLastTap(source: string): void {
  try {
    acceptTap(loadNativeModules()?.notifications.getLastNotificationResponse() ?? null, source);
  } catch (reason) {
    console.warn('[push] last response read failed', reason);
  }
}

/** يُنادى **مرّة عند تحميل `App.tsx`** — قبل أيّ رسم أو جلسة. التكرار لا يضيف مستمعاً ثانياً. */
export function captureNotificationTaps(): void {
  if (isCapturing) return;
  const native = loadNativeModules();
  if (native === null) return;
  isCapturing = true;
  // دائم لا يُفكّ: ضغطةٌ أثناء استرجاع الجلسة أو على شاشة الدخول تُحفظ ولا تضيع.
  native.notifications.addNotificationResponseReceivedListener((response) => acceptTap(response, 'listener'));
  readLastTap('module');
}

/**
 * التطبيق يشترك **حين يقدر أن ينفّذ** (جلسة + رئيسية + ملاحة جاهزة). يستلم المعلَّق فوراً،
 * ثم كل ضغطة لاحقة. ويعيد دالّة إلغاء الاشتراك.
 */
export function consumeNotificationTaps(onTarget: (target: PushTapTarget) => void): () => void {
  captureNotificationTaps();
  tapConsumer = onTarget;
  readLastTap('subscribe');
  const pending = pendingTapTarget;
  pendingTapTarget = null;
  if (pending !== null) onTarget(pending);
  // شبكة أمان للسباق نفسه: لو وصلت ضغطة البارد من الخدمة الأصلية بعد هذه اللحظة بقليل.
  const late = setTimeout(() => readLastTap('late'), 1500);
  return () => {
    clearTimeout(late);
    if (tapConsumer === onTarget) tapConsumer = null;
  };
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
