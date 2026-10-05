import { NextResponse } from "next/server";

/**
 * الرابط الثابت لتحميل تطبيق الأندرويد: `console.modonty.com/android`.
 *
 * البانر والـQR يشيران إلى هنا لا إلى ملف الـAPK نفسه، فحين نرفع نسخة جديدة يتغيّر
 * `ANDROID_APK_URL` على Vercel وحده — والـQR المطبوع أو المرسَل يبقى صالحاً.
 * عامّ بلا دخول: العميل يصوّر الـQR بجواله وهو غير مسجّل فيه.
 */
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const apkUrl = process.env.ANDROID_APK_URL;
  return NextResponse.redirect(apkUrl || new URL("/", request.url), 302);
}
