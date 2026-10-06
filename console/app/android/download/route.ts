import { NextResponse } from "next/server";

/**
 * ملف تطبيق الأندرويد نفسه: `console.modonty.com/android/download` — يحوّل إلى الـAPK على Bunny.
 * الصفحة `/android` (يفتحها الـQR والبانر) تعرض زرّ التحميل الذي يشير إلى هنا.
 *
 * البانر والـQR يشيران إلى هنا لا إلى ملف الـAPK نفسه، فحين نرفع نسخة جديدة يتغيّر
 * `ANDROID_APK_URL` على Vercel وحده — والـQR المطبوع أو المرسَل يبقى صالحاً.
 * عامّ بلا دخول: العميل يصوّر الـQR بجواله وهو غير مسجّل فيه.
 * ضُبط على Vercel (مشروع modonty-console · Production) ٥ أكتوبر ٢٠٢٦: نسخة «بوابة مدونتي» ٦٣ م.ب على Bunny.
 */
export const dynamic = "force-dynamic";

/**
 * رابط آخر نسخة مكتوب هنا لا في `ANDROID_APK_URL`: تغيير متغيّر Vercel يحتاج صلاحية إنتاج،
 * والرابط في الكود يُرفع مع النسخة ويبقى أثره في git (٦ أكتوبر ٢٠٢٦ — نسخة موقّعة محلياً بختم
 * مدونتي في ~/.modonty-keys · ٦١ م.ب · arm64-v8a + armeabi-v7a).
 */
const LATEST_APK_URL = "https://modonty-asset.b-cdn.net/apps/android/modonty-console-2026-10-06-r2.apk";

export function GET() {
  return NextResponse.redirect(LATEST_APK_URL, 302);
}
