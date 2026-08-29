import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * CORS لواجهة الجوّال — **في التطوير وحده**.
 *
 * التطبيق نفسه يعمل الآن على الويب (`expo start --web`) لإغلاق الواجهة والوظائف على
 * الديسك توب بدل دورة «حزمة → adb → لقطة» التي تكلّف ٢٥–٣٥ ثانية للتعديل الواحد.
 * لكن المتصفّح يفرض CORS والتطبيق النيتف لا يفرضه، فكل نداء كان يسقط بـ:
 *
 *   Access to fetch at 'http://127.0.0.1:3100/api/mobile/v1/auth/screen'
 *   from origin 'http://localhost:8081' has been blocked by CORS policy
 *
 * وكل نداء يحمل ترويسة `Authorization`، وهي ترويسة **غير بسيطة**، فيسبقها المتصفّح
 * بطلب `OPTIONS` preflight. ومسارات الجوّال لا تصدّر `OPTIONS` فترجع 405 — لذلك لا تكفي
 * ترويسات `next.config`؛ لا بدّ من ردٍّ على الـpreflight نفسه، وهذا موضعه.
 *
 * ⛔ **حارسان يمنعانه من الإنتاج:**
 *  1. `NODE_ENV !== 'production'` — في الإنتاج تمرّ الطلبات بلا لمس، فلا ترويسة CORS تُضاف.
 *  2. قائمة أصول مغلقة على مضيف التطوير المحلّي — لا `*` ولا انعكاس للأصل الوارد،
 *     فلا يستطيع موقع خارجي أن يُقنع المتصفّح بأنه مسموح له.
 * والمُطابِق مقصور على `/api/mobile/v1/*` فلا يمسّ الكونسول ولا جلساته.
 */
const isDevelopment = process.env.NODE_ENV !== "production";

/** منافذ خادم Expo للويب: 8081 الافتراضي، و8082 حين يكون الأول مشغولاً. */
const allowedDevOrigins = new Set([
  "http://localhost:8081",
  "http://127.0.0.1:8081",
  "http://localhost:8082",
  "http://127.0.0.1:8082",
]);

function corsHeadersFor(origin: string | null): Headers | null {
  if (!isDevelopment) return null;
  if (origin === null || !allowedDevOrigins.has(origin)) return null;
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Authorization,Content-Type");
  // الأصل يتغيّر بين ٨٠٨١ و٨٠٨٢، فبلا هذه الترويسة قد يخدم كاش وسيط ردّ أصلٍ لآخر.
  headers.set("Vary", "Origin");
  return headers;
}

export function proxy(request: NextRequest) {
  const cors = corsHeadersFor(request.headers.get("origin"));
  if (cors === null) return NextResponse.next();

  // الـpreflight يُجاب هنا ولا يصل إلى المسار: المسارات لا تصدّر `OPTIONS` فترجع 405.
  if (request.method === "OPTIONS") return new NextResponse(null, { status: 204, headers: cors });

  const response = NextResponse.next();
  cors.forEach((value, key) => response.headers.set(key, value));
  return response;
}

export const config = {
  matcher: "/api/mobile/v1/:path*",
};
