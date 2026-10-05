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

export function GET(request: Request) {
  const apkUrl = process.env.ANDROID_APK_URL;
  return NextResponse.redirect(apkUrl || new URL("/", request.url), 302);
}
