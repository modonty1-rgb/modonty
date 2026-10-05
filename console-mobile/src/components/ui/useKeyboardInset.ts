import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * ارتفاع لوحة المفاتيح **فوق** شريط التنقّل — بالـdp — أو صفر وهي مغلقة.
 *
 * التطبيق `edgeToEdgeEnabled` (app.json): النافذة تمتدّ تحت أشرطة النظام **ولا تنكمش**
 * حين تفتح اللوحة، فافتراض `adjustResize` القديم سقط — قِيس على جوّال خالد: اللوحة غطّت حقل
 * «طلب تعديل المقال» وزرّه، وحقل «الرد على سؤال» وزرّ الإرسال. و`KeyboardAvoidingView` في
 * RN 0.81 لا يُعتمد عليه هنا: إصلاحه لوضع edge-to-edge نزل في 0.86 بنصّ مدوّنة الإصدار.
 *
 * والرقم من مصدره: `ReactRootView.checkForKeyboardEvents` (أندرويد ١١+) يرسل في
 * `keyboardDidShow` الارتفاع = `ime.bottom − systemBars.bottom`، أي اللوحة **بعد طرح** شريط
 * التنقّل. والشاشات المدفوعة تحجز `insets.bottom` أصلاً، فهذا الرقم هو الحشو الناقص بالضبط.
 * لا مكتبة أصلية جديدة (keyboard-controller) — كانت تحتاج بناءً جديداً للتطبيق.
 *
 * على iOS تبقى الأحداث `Will*` لتتحرّك الشاشة مع اللوحة لا بعدها، ويُطرح منها مؤشّر الشاشة
 * السفلي لأنّ ارتفاعها هناك يشمله.
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);
  const iosBottom = useSafeAreaInsets().bottom;
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const shown = Keyboard.addListener(showEvent, (event) => setInset(Math.max(0, event.endCoordinates.height - (Platform.OS === 'ios' ? iosBottom : 0))));
    const hidden = Keyboard.addListener(hideEvent, () => setInset(0));
    return () => { shown.remove(); hidden.remove(); };
  }, [iosBottom]);
  return inset;
}
