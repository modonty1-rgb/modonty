import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { registerPushDevice } from '@/src/services/mobile-api';

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

    await registerPushDevice(accessToken, {
      expoPushToken: token,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
      deviceName: Device.deviceName ?? undefined,
      appVersion: Constants.expoConfig?.version ?? undefined,
    });

    return { status: 'registered', token };
  } catch (reason) {
    // لا `catch {}` صامت: السبب يُحمل كما هو ليُقرأ في السجلّ.
    return { status: 'failed', reason: reason instanceof Error ? reason.message : String(reason) };
  }
}

/**
 * أين يفتح التنبيه حين يُضغط.
 *
 * الخادم يضع في كل دفعة `data.type`، ونقطة التنبيهات تشتقّ منه هدفاً بثلاث قيم فقط
 * (`console/app/api/mobile/v1/notifications/route.ts:20`). فنكرّر الاشتقاق **بنفس البادئات**
 * لا بترجمة جديدة: أيّ اختلاف بين الاثنين يعني تنبيهاً يفتح تبويباً غير الذي يَعِد به.
 *
 * وبلا هذا المراقب تكون الضغطة بلا أثر — يفتح التطبيق على آخر شاشة كان عليها، فيقرأ العميل
 * «سؤال من قارئ» ويجد نفسه في الرئيسية يبحث عنه بيده.
 */
export type PushTapTarget = 'articles' | 'audience' | 'videos' | 'notifications';

export function tapTargetOf(type: unknown): PushTapTarget | null {
  if (typeof type !== 'string') return null;
  if (type.startsWith('article')) return 'articles';
  if (type.startsWith('faq') || type.startsWith('comment') || type.startsWith('contact') || type.includes('question')) return 'audience';
  if (type.startsWith('reel') || type.startsWith('video') || type.startsWith('media')) return 'videos';
  // ما لا هدف له يفتح صندوق التنبيهات: هناك يجده مكتوباً، بدل أن تذهب ضغطته سدى.
  return 'notifications';
}

/**
 * يربط الضغطة بالتبويب، ويشمل **الفتح البارد**.
 *
 * `getLastNotificationResponse()` بنصّ التوثيق للحالة التي كان فيها التطبيق مغلقاً تماماً —
 * بدونها يعمل المراقب فقط والتطبيق حيّ، وهي أقلّ الحالتين وقوعاً في تنبيه حقيقي.
 *
 * يعيد دالّة فكّ الاشتراك، أو `undefined` إن لم تكن الوحدات مبنيّة.
 */
export function observeNotificationTaps(onTarget: (target: PushTapTarget) => void): (() => void) | undefined {
  const native = loadNativeModules();
  if (native === null) return undefined;
  const Notifications = native.notifications;

  const dispatch = (data: unknown): void => {
    const target = tapTargetOf((data as { type?: unknown } | null)?.type);
    if (target !== null) onTarget(target);
  };

  const cold = Notifications.getLastNotificationResponse();
  if (cold) dispatch(cold.notification.request.content.data);

  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    dispatch(response.notification.request.content.data);
  });
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
