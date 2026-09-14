import { NextResponse, type NextRequest } from "next/server";

/**
 * توجيه السوق — منقولٌ من `modonty/proxy.ts` في `PAY-S3` (خالد ١٤ سبتمبر ٢٠٢٦:
 * «كل ما يخصّ البيمنت يكون جوّه البيمنت… ابعد عن مدونتي»).
 *
 * مصر وحدها بالجنيه؛ وسعر السعودية هو الافتراضي لكل بلدٍ آخر بما فيها الخليج.
 * والمسار المختار يُفرَض أيضاً، فلا يكشف زائرٌ السوق الآخر بتغيير العنوان وحده.
 *
 * ⚠ `/` لم تعد تُحوَّل (خالد، نفس اليوم): صارت صفحة الأوفرفيو — عامّة لكل البلدان،
 * بلا أسعار، وساكنة. وتحويلها بالبلد كان يجعل أوّل صفحةٍ في المسار تقفز قفزةً لا لزوم
 * لها، ويمنع تسليمها ساكنةً من الحافة. فالسوق يبدأ من **`/plans`** — أي مع السعر لا
 * قبله، وهي القفزة الوحيدة التي تحتاج بلد الزائر.
 */
const MARKET_PLANS_PATH = /^\/(sa|eg)\/plans$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const bare = pathname === "/plans";
  if (!bare && !MARKET_PLANS_PATH.test(pathname)) return;

  const country = request.headers.get("x-vercel-ip-country")?.toUpperCase();
  const market = country === "EG" ? "eg" : "sa";
  const expectedPath = `/${market}/plans`;
  if (pathname === expectedPath) return;

  /**
   * سلسلة الاستعلام تُحمَل معها. كانت تُبنى من المسار وحده، فيسقط `?months=`
   * و`?duration=` بصمت — فكل رابط حملة إلى `/plans` يهبط على المدّة الموصى بها لا
   * المُعلَن عنها، فيختلف الإعلان والصفحة على السعر بلا أثرٍ في السجلّ. و`?plan=`
   * من جدول المقارنة يمرّ بنفس الطريق.
   */
  const target = new URL(expectedPath, request.url);
  target.search = request.nextUrl.search;
  return NextResponse.redirect(target, 307);
}

export const config = {
  matcher: ["/plans", "/:market/plans"],
};
