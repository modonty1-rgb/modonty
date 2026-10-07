import { NextResponse } from "next/server";

/**
 * غلاف ردود واجهة تطبيق القارئ — نفس عقد الكونسول (`console/lib/mobile-api/http.ts`):
 * نجاح `{ data }` · فشل `{ error: { code, message, details? } }`.
 */
export type MobileApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

const STATUS_BY_CODE: Record<MobileApiErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

/**
 * رأس الكاش. العامّ (نفس الردّ لكل زائر) يُخزَّن في الـCDN خمس دقائق فوق كاش الدالّة نفسها؛
 * وكل ردّ يقرأ التوكن أو معرّف الجهاز خاصّ لا يُخزَّن أبداً.
 */
export const PUBLIC_CACHE = "public, s-maxage=300, stale-while-revalidate=3600";
export const PUBLIC_CACHE_SHORT = "public, s-maxage=60, stale-while-revalidate=600";
export const PRIVATE_NO_STORE = "private, no-store";

export function ok<T>(data: T, cacheControl: string = PRIVATE_NO_STORE, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", cacheControl);
  return NextResponse.json({ data }, { ...init, headers });
}

export function fail(code: MobileApiErrorCode, message: string, details?: unknown, headers?: HeadersInit) {
  const merged = new Headers(headers);
  merged.set("Cache-Control", PRIVATE_NO_STORE);
  return NextResponse.json(
    { error: { code, message, ...(details === undefined ? {} : { details }) } },
    { status: STATUS_BY_CODE[code], headers: merged },
  );
}

export const MESSAGES = {
  unauthorized: "يجب تسجيل الدخول.",
  sessionExpired: "انتهت الجلسة. سجّل الدخول مرة أخرى.",
  badCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  tooManyAttempts: "محاولات كثيرة. حاول بعد قليل.",
  invalidBody: "البيانات المرسلة غير صالحة.",
  deviceRequired: "معرّف الجهاز مطلوب (X-Device-Id).",
  internal: "حدث خطأ. حاول مرة ثانية.",
  articleNotFound: "المقال غير موجود.",
  categoryNotFound: "الفئة غير موجودة.",
  industryNotFound: "المجال غير موجود.",
  partnerNotFound: "الشريك غير موجود.",
  reelNotFound: "الريل غير موجود.",
  notificationNotFound: "الإشعار غير موجود.",
  commentEmpty: "اكتب تعليقك أولاً.",
  commentTooLong: "التعليق طويل — الحدّ ١٠٠٠ حرف.",
} as const;

/**
 * كل نقطة تمرّ من هنا: أي استثناء غير متوقَّع يصير 500 بغلاف موحّد ورسالة عربية،
 * ويُطبع في سجلّ الخادم باسم النقطة — لا `catch {}` صامت.
 */
export function handle<Args extends unknown[]>(
  name: string,
  handler: (...args: Args) => Promise<Response>,
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error(`[mobile-api:${name}]`, error);
      return fail("INTERNAL_ERROR", MESSAGES.internal);
    }
  };
}
