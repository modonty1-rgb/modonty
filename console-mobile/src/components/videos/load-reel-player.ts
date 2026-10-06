import type { ReelPlayer } from '@/src/components/videos/ReelPlayer';

/**
 * المشغّل يُحمَّل **عند الطلب داخل `try`** — نفس سبب `push-registration.ts`.
 *
 * `expo-video` وحدة أصلية: إضافتها لـ`package.json` لا تضعها في التطبيق المثبَّت حتى بناء جديد،
 * واستيرادها في رأس الملفّ يُقيَّم عند تحميل الحزمة فيُسقط التطبيق كلّه على النسخة الحالية
 * («Cannot find native module 'ExpoVideo'») — والتحديث الصامت يصل لتلك النسخة قبل البناء.
 * فبغيابها ترجع `null`: الشبكة تُعرض والمربّعات لا تَعِد بتشغيل، والمشغّل يظهر وحده مع البناء القادم.
 */
let cached: typeof ReelPlayer | null | undefined;

export function loadReelPlayer(): typeof ReelPlayer | null {
  if (cached !== undefined) return cached;
  try {
    cached = (require('@/src/components/videos/ReelPlayer') as typeof import('@/src/components/videos/ReelPlayer')).ReelPlayer;
  } catch (reason) {
    console.warn('[reels] player unavailable in this build', reason instanceof Error ? reason.message : reason);
    cached = null;
  }
  return cached;
}
