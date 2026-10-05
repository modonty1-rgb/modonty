import { AppState } from 'react-native';

/**
 * التحديث الحيّ: الشاشة المفتوحة تتحدّث وحدها حين يحدث شيء — بلا سحب ولا تنقّل.
 *
 * خالد ٥ أكتوبر ٢٠٢٦: العميل واقف على شاشة، وقارئ سأل أو أعجبه مقال، فما يظهر شيء إلا لو
 * سحب الشاشة. كان التحديث عند دخول الشاشة فقط (`useFocusEffect`)، و`AppState` غائب كلّياً.
 *
 * إشارتان تكفيان بلا اتصال دائم بالخادم:
 *  1. **وصول تنبيه والتطبيق مفتوح** — كل حدث يخصّ العميل يرسل تنبيهاً، فوصوله هو الخبر نفسه.
 *  2. **رجوع التطبيق من الخلفية** — ما فات وهو في الخلفية يُجلب لحظة يعود.
 * والمستمعون: الرئيسية (العدّادات والشارة) والشاشة المركَّزة وحدها، لا كل الشاشات المكدَّسة.
 */

type Listener = () => void;
const listeners = new Set<Listener>();

/**
 * الجلب **بعد** انتهاء الدفعة لا مع كل تنبيه (تأخير لاحق).
 *
 * مقيس ٥ أكتوبر على جوال خالد: ١٣ حدثاً متتالياً والتطبيق مفتوح ظهر منها ٨ فقط. كل وصول
 * كان يشغّل جلباً وإعادة رسم فوراً، فينشغل خيط JS ويتأخّر ردّ `handleNotification` على التنبيه
 * التالي — والتوثيق (SDK ≤57): «A handler that does not respond within 3 seconds drops the notification». والتطبيق في الخلفية ظهرت دفعة الخمسة كلها.
 * فالانتظار حتى تهدأ الدفعة يترك الخيط حرّاً لعرض التنبيهات، ثم جلبٌ واحد يحمل كل الجديد.
 */
const SETTLE_MS = 1500;
let pending: ReturnType<typeof setTimeout> | null = null;

export function emitLiveRefresh(): void {
  if (pending !== null) clearTimeout(pending);
  pending = setTimeout(() => {
    pending = null;
    listeners.forEach((listener) => listener());
  }, SETTLE_MS);
}

export function onLiveRefresh(listener: Listener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** يُشغَّل مرّة بعد الدخول؛ يعيد دالّة الإيقاف عند الخروج. */
export function observeLiveSignals(): () => void {
  let previous = AppState.currentState;
  const appState = AppState.addEventListener('change', (next) => {
    if (previous !== 'active' && next === 'active') emitLiveRefresh();
    previous = next;
  });

  // نفس التحميل المتأخّر في push-registration: بلا الوحدة الأصلية يعمل الرجوع من الخلفية وحده.
  let received: { remove: () => void } | null = null;
  try {
    const Notifications = require('expo-notifications') as typeof import('expo-notifications');
    received = Notifications.addNotificationReceivedListener(() => emitLiveRefresh());
  } catch {
    received = null;
  }

  return () => {
    appState.remove();
    received?.remove();
  };
}
