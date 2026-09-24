import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

// "pages" is the tag `getContentPageRow` caches the eleven content pages under (about,
// contact, terms, the four legal pages, trust, story, audio, reels). It was missing here, so
// every admin save of one of those pages fired a revalidation this route answered with 400 —
// the row changed in the database and the live page kept serving the old blob for hours.
// "ai-prompts" هو الوسم الذي يقرأ تحته مودو برومبتاته من `ai_prompts`. بدونه يبقى
// المساعد على النصّ القديم بعد تعديله من الأدمن — وهو عطلٌ لا يظهر في أي شاشة، فقط
// في جوابٍ يعطيه المساعد للزائر بشخصيةٍ ظنّ خالد أنه غيّرها.
// "commercial-catalog" خرج من هنا في ١٤ سبتمبر ٢٠٢٦ (PAY-S4): صفحة البيع صارت حزمة
// `payment` مستقلّة، فوسمها يُبطَل على نقطتها هي. وإبقاؤه هنا كان سيقبل النداء ويردّ
// نجاحاً لا يُبطل شيئاً — تعارضٌ صامت بلا رسالة خطأ.
const ALLOWED_TAGS = ["articles", "settings", "categories", "clients", "tags", "industries", "faqs", "authors", "ga4-clients", "reels", "pages", "ai-prompts"] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { tag, secret, immediate } = body;

    if (!tag || !ALLOWED_TAGS.includes(tag)) {
      return NextResponse.json(
        { success: false, error: `Tag must be one of: ${ALLOWED_TAGS.join(", ")}` },
        { status: 400 }
      );
    }

    const revalidationSecret = process.env.REVALIDATE_SECRET;
    if (!revalidationSecret) {
      return NextResponse.json(
        { success: false, error: "Revalidation not configured" },
        { status: 503 }
      );
    }
    const providedSecret = secret ?? req.headers.get("x-revalidation-secret") ?? req.headers.get("x-revalidate-secret");

    if (providedSecret !== revalidationSecret) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Provide valid secret." },
        { status: 401 }
      );
    }

    // `"max"` دلالته stale-while-revalidate: يُعلّم المدخل قديماً، فيخدم القديم مرّةً
    // أو مرّتين ويحدّث في الخلفية. وهو مقبولٌ لكل وسمٍ هنا — مقالٌ أو إعداد يظهر بعد
    // طلبٍ أو اثنين ولا يضرّ. الحالة التي لا تحتمله (السعر) خرجت إلى حزمة `payment`
    // ومعها `{ expire: 0 }`، انظر PAY-S4.
    //
    // `immediate` — للمحرّر الذي يغيّر شيئاً ويفتح الموقع ليراه (خالد ٢٤ سبتمبر ٢٠٢٦: اختياراتُ
    // الرئيسية). مقيسٌ على «max»: اختيارٌ في الأدمن والرئيسيةُ تعرض ما قبله بخطوتين. فيُطلب
    // انتهاءٌ فوريّ لهذا النداء وحده، والبقيّةُ على «max» كما هي.
    revalidateTag(tag, immediate === true ? { expire: 0 } : "max");

    return NextResponse.json({
      success: true,
      message: `Tag "${tag}" revalidated`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Revalidation failed" },
      { status: 500 }
    );
  }
}
