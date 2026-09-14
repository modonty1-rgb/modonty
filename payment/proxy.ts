import { NextResponse, type NextRequest } from "next/server";

/**
 * توجيه السوق قبل أن تُرسم صفحة الدفع — منقولٌ من `modonty/proxy.ts` في `PAY-S3`
 * (خالد ١٤ سبتمبر ٢٠٢٦: «كل ما يخصّ البيمنت يكون جوّه البيمنت… ابعد عن مدونتي»).
 *
 * مصر وحدها بالجنيه؛ وسعر السعودية هو الافتراضي لكل بلدٍ آخر بما فيها الخليج.
 * والمسار المختار يُفرَض أيضاً، فلا يكشف زائرٌ السوق الآخر بتغيير العنوان وحده.
 */
const MARKET_PATH = /^\/(sa|eg)$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname !== "/" && !MARKET_PATH.test(pathname)) return;

  const country = request.headers.get("x-vercel-ip-country")?.toUpperCase();
  const market = country === "EG" ? "eg" : "sa";
  const expectedPath = `/${market}`;
  if (pathname === expectedPath) return;

  /**
   * سلسلة الاستعلام تُحمَل معها. كانت تُبنى من المسار وحده، فيسقط `?months=`
   * و`?duration=` بصمت — فكل رابط حملة إلى `/` يهبط على المدّة الموصى بها لا
   * المُعلَن عنها، فيختلف الإعلان والصفحة على السعر بلا أثرٍ في السجلّ.
   */
  const target = new URL(expectedPath, request.url);
  target.search = request.nextUrl.search;
  return NextResponse.redirect(target, 307);
}

export const config = {
  matcher: ["/", "/:market"],
};
