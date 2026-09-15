import { NextResponse, type NextRequest } from "next/server";

/**
 * توجيه السوق — منقولٌ من `modonty/proxy.ts` في `PAY-S3` (خالد ١٤ سبتمبر ٢٠٢٦:
 * «كل ما يخصّ البيمنت يكون جوّه البيمنت… ابعد عن مدونتي»).
 *
 * مصر وحدها بالجنيه؛ وسعر السعودية هو الافتراضي لكل بلدٍ آخر بما فيها الخليج.
 * والمسار المختار يُفرَض أيضاً، فلا يكشف زائرٌ السوق الآخر بتغيير العنوان وحده.
 *
 * ── `/` تُعاد كتابتها ولا تُحوَّل (خالد ١٥ سبتمبر ٢٠٢٦) ──
 * «الاي بي تبع الدوله يبتدي الكنترول من الصفحه الرئيسيه مش من صفحه الباقات بس».
 * وقبلها كان الأوفرفيو بلا سوق، فيقرأ المصريّ «تبدأ من ٣٩٩ ر.س.» في أوّل سطرٍ يراه
 * بينما باقته بالجنيه — رقمٌ لا يجده حين يصل إلى `/eg/plans`.
 *
 * و`rewrite` لا `redirect`: التحويل يضيف قفزةً على أغلى صفحةٍ في المسار، ويكتب `/sa`
 * في عنوان كل سعوديّ بلا فائدةٍ له. وإعادة الكتابة تُبقي العنوان `/` وتخدم نسخة
 * `/eg` **المبنيّة وقت البناء** — صفر قفزة وصفر تصيير عند الطلب.
 */
const MARKET_PLANS_PATH = /^\/(sa|eg)\/plans$/;

type Market = "sa" | "eg";
const isMarket = (v: string | undefined | null): v is Market => v === "sa" || v === "eg";

/**
 * ── باب المعاينة الإداريّة (خالد ١٥ سبتمبر ٢٠٢٦) ──
 *
 * «انا الان في السعوديه ابغى اشوف اسعار مصر انا كاداره هنا ماني قادر».
 * والفرض الجغرافيّ كان يمنعه هو أيضاً: كل فتحٍ لـ`/eg/plans` من الرياض يرتدّ إلى
 * `/sa/plans`، فلا سبيل لمراجعة صفحات مصر ولا لتصحيح نصوصها قبل إطلاق حملتها.
 *
 * ولا يُفتح الباب بلا قفل: الفرض نفسه وُضع كي لا يشتري سعوديٌّ بسعر مصر بتغيير
 * العنوان. فالمعاينة تحتاج `PAY_MARKET_PREVIEW_KEY` — ومن لا يملكه لا يرى شيئاً،
 * ويبقى الفرض عليه كما كان.
 *
 *   الدخول:  /plans?market=eg&key=<المفتاح>
 *   الخروج:  /plans?market=off&key=<المفتاح>
 *
 * والمفتاح يُستهلَك مرّة: يُثبَّت في كوكي ثمانِ ساعاتٍ ثم يُنظَّف من العنوان، فلا يبقى
 * السرّ في شريط العنوان ولا في سجلّ المتصفّح ولا في `Referer` إلى طرفٍ ثالث.
 *
 * ومحليّاً بلا مفتاح: لا `PAY_MARKET_PREVIEW_KEY` على جهاز التطوير غالباً، وبلا
 * `x-vercel-ip-country` يسقط كل شيء على السعودية — فيصير تطوير صفحات مصر مستحيلاً
 * على اللوكل. لذا يُقبل `?market=eg` بلا مفتاح خارج الإنتاج وحده.
 */
const PREVIEW_COOKIE = "pay_market_preview";
const PREVIEW_MAX_AGE = 60 * 60 * 8;

/**
 * ── كوكي الرحلة: السوق يُقرّر مرّةً عند الدخول، ثم يُتذكَّر ──
 *
 * العطل (خالد ١٥ سبتمبر ٢٠٢٦، قيس حيّاً): «كنا في المحتوى المصري، لما انضغطت
 * وداك على المحتوى السعودي». من `/eg` يضغط الزائر «شوف الباقات» فيطلب المتصفّح
 * `/eg/plans`، والبروكسي يعيد حساب البلد من الصفر — وبلا رأس `x-vercel-ip-country`
 * في تلك اللحظة يسقط على السعودية، فيُقذف من سوقه إلى سوقٍ آخر في منتصف الرحلة.
 *
 * والرأس ليس مضموناً في كل طلب: تخزينٌ وسيط، رابطٌ يُشارَك، شبكةٌ تتبدّل، VPN.
 * فبناءُ كل قفزةٍ على إعادة حسابه يعني رحلةً تتقلّب تحت المشتري بلا سببٍ يفهمه —
 * ويصل إلى سعرٍ غير الذي رآه.
 *
 * فالبلد يُقرأ **مرّةً** عند أوّل صفحة، ويُثبَّت في كوكي الجلسة، وتُقرأ منه بقيّة
 * الرحلة. والحارس باقٍ: الكوكي يُكتب مما قرّره الخادم لا مما يطلبه الزائر، فمن
 * يكتب `/eg/plans` بيده من الرياض يُردّ كما كان يُردّ.
 */
const MARKET_COOKIE = "pay_market";

/** كوكي جلسة بلا `maxAge`: الرحلة تنتهي بإغلاق المتصفّح، ولا يُحبَس زائرٌ في سوقٍ سافر منه. */
const setMarketCookie = (res: NextResponse, market: Market) => {
  res.cookies.set(MARKET_COOKIE, market, { path: "/", sameSite: "lax", httpOnly: true });
  return res;
};

/** جذر النطاق — يُعاد كتابته بسوق الزائر، ولا يظهر ذلك في العنوان. */
const ROOT_PATH = "/";

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const root = pathname === ROOT_PATH;
  const bare = pathname === "/plans";
  if (!root && !bare && !MARKET_PLANS_PATH.test(pathname)) return;

  const wanted = searchParams.get("market")?.toLowerCase();
  if (wanted) {
    const secret = process.env.PAY_MARKET_PREVIEW_KEY?.trim();
    const isProd = process.env.VERCEL_ENV
      ? process.env.VERCEL_ENV === "production"
      : process.env.NODE_ENV === "production";
    const authorized = secret
      ? searchParams.get("key") === secret
      : !isProd; // بلا سرٍّ مضبوط: مسموحٌ خارج الإنتاج فقط، ممنوعٌ فيه دائماً

    if (authorized && (isMarket(wanted) || wanted === "off")) {
      /**
       * العنوان يُنظَّف من `market` و`key` ويُحتفظ بالباقي (`plan`, `months`).
       * والعودة إلى **نفس نوع الصفحة**: من `/` إلى `/` ومن `/plans` إلى `/x/plans` —
       * فمن يعاين الأوفرفيو لا يُقذف إلى الباقات.
       */
      const back = root ? ROOT_PATH : isMarket(wanted) ? `/${wanted}/plans` : pathname;
      const target = new URL(back, request.url);
      const keep = new URLSearchParams(searchParams);
      keep.delete("market");
      keep.delete("key");
      target.search = keep.toString();

      const res = NextResponse.redirect(target, 307);
      if (isMarket(wanted)) {
        res.cookies.set(PREVIEW_COOKIE, wanted, {
          maxAge: PREVIEW_MAX_AGE,
          path: "/",
          sameSite: "lax",
          httpOnly: true,
        });
      } else {
        res.cookies.delete(PREVIEW_COOKIE);
      }
      // كوكي الرحلة يُمسَح مع كل تبديل معاينة، وإلّا بقي السوق القديم يتنازع مع الجديد.
      res.cookies.delete(MARKET_COOKIE);
      return res;
    }
    // طلبُ معاينةٍ بلا صلاحية: يُتجاهَل بصمت ويُكمل الفرض الجغرافيّ أدناه.
  }

  /**
   * ترتيب المصادر: معاينةُ الإدارة تعلو، ثم كوكي الرحلة، ثم بلد الزائر.
   * والرأس آخرها لا أوّلها — فهو الوحيد الذي قد يغيب في منتصف الرحلة.
   */
  const preview = request.cookies.get(PREVIEW_COOKIE)?.value;
  const journey = request.cookies.get(MARKET_COOKIE)?.value;
  const country = request.headers.get("x-vercel-ip-country")?.toUpperCase();
  const market: Market = isMarket(preview)
    ? preview
    : isMarket(journey)
      ? journey
      : country === "EG"
        ? "eg"
        : "sa";

  /**
   * الجذر: السعوديّ يُخدَم `app/page.tsx` كما هو، والمصريّ تُعاد كتابته إلى `/eg`
   * فيستلم نسخته وعنوانه لم يتغيّر. وفي الحالتين يُثبَّت السوق — فهذه أوّل نقطةٍ
   * في الرحلة، وما يُقرّر هنا هو ما تتبعه كل قفزةٍ بعدها.
   */
  if (root) {
    const res = market === "sa" ? NextResponse.next() : NextResponse.rewrite(new URL(`/${market}`, request.url));
    return setMarketCookie(res, market);
  }

  const expectedPath = `/${market}/plans`;
  // على المسار الصحيح: يُمرّ ويُجدَّد الكوكي (لمن دخل من `/plans` مباشرةً بلا مرورٍ بالجذر).
  if (pathname === expectedPath) return setMarketCookie(NextResponse.next(), market);

  /**
   * سلسلة الاستعلام تُحمَل معها. كانت تُبنى من المسار وحده، فيسقط `?months=`
   * و`?duration=` بصمت — فكل رابط حملة إلى `/plans` يهبط على المدّة الموصى بها لا
   * المُعلَن عنها، فيختلف الإعلان والصفحة على السعر بلا أثرٍ في السجلّ. و`?plan=`
   * من جدول المقارنة يمرّ بنفس الطريق.
   */
  const target = new URL(expectedPath, request.url);
  target.search = request.nextUrl.search;
  return setMarketCookie(NextResponse.redirect(target, 307), market);
}

export const config = {
  matcher: ["/", "/plans", "/:market/plans"],
};
