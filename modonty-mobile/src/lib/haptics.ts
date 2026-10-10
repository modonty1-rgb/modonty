import * as Haptics from 'expo-haptics';

/**
 * لمسة خفيفة بعد فعلٍ نجح (إعجاب · حفظ · متابعة) — الإحساس بأن الضغطة «وصلت».
 * لا تُطلق قبل ردّ الخادم: الاهتزاز يعني نجاحاً لا محاولة. لا ترمي إن لم يدعمها الجهاز.
 */
export const haptic = {
  success: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined),
  /** نقرة اختيار خفيفة — خطوة منزلق أو تبديل خيار. */
  selection: () => Haptics.selectionAsync().catch(() => undefined),
};
