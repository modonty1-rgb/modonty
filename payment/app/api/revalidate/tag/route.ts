import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * إبطال كاش الكتالوج — نقطة هذه الحزمة وحدها (PAY-S4، خالد ١٤ سبتمبر ٢٠٢٦:
 * «كل ما يخصّ البيمنت يكون جوّه البيمنت»).
 *
 * وسمٌ واحد مسموح: `commercial-catalog` — تحته تُكاش بطاقات البيع (الباقات والأسعار
 * والمزايا وكلام الصفحة). وسومُ مدونتي الاثنا عشر (`articles` · `settings` · `pages`…)
 * تبقى عندها، وهذه النقطة ترفضها بـ٤٠٠ كي لا يظنّ أحدٌ أن الإبطال وقع وهو لم يقع.
 */
/**
 * `settings` مضافٌ إلى جانب الكتالوج (مراجعة ١٤ سبتمبر ٢٠٢٦).
 *
 * العطل الذي كشفه الجرد: `getSiteChrome` و`getSellerLegal` في هذه الحزمة تُكاشان تحت
 * `settings`، وأكشن الأدمن كان يرسل هذا الوسم إلى **مدونتي وحدها**. فتبديل الشعار أو
 * إضافة حساب أو تصحيح رقم السجلّ التجاري يظهر في المدوّنة ولا يظهر هنا أبداً — والرقم
 * الخاطئ يبقى مطبوعاً في نموذج العقد الذي يقرؤه المشتري قبل الدفع.
 */
/**
 * `staff` ثالثها (١٥ سبتمبر ٢٠٢٦): قسم الفريق على الأوفرفيو يقرأ الموظّفين المؤشَّر
 * لهم «اعرض للعملاء»، وهو مكاشٌ لأن الأوفرفيو ساكنة. فبلا هذا الوسم يبقى موظّفٌ
 * تُرك العمل معروضاً للمشترين حتى أوّل نشرة.
 */
const ALLOWED_TAGS = ["commercial-catalog", "settings", "staff"] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { tag, secret } = body;

    if (!tag || !ALLOWED_TAGS.includes(tag)) {
      return NextResponse.json(
        { success: false, error: `Tag must be one of: ${ALLOWED_TAGS.join(", ")}` },
        { status: 400 },
      );
    }

    const revalidationSecret = process.env.REVALIDATE_SECRET;
    if (!revalidationSecret) {
      return NextResponse.json({ success: false, error: "Revalidation not configured" }, { status: 503 });
    }

    const providedSecret =
      secret ?? req.headers.get("x-revalidation-secret") ?? req.headers.get("x-revalidate-secret");
    if (providedSecret !== revalidationSecret) {
      return NextResponse.json({ success: false, error: "Unauthorized. Provide valid secret." }, { status: 401 });
    }

    /**
     * `{ expire: 0 }` لا `"max"` — والفرق قيس (١٣ سبتمبر ٢٠٢٦ على `/sa`):
     * `"max"` دلالته stale-while-revalidate، فخُدم **طلبان** بالسعر القديم وظهر الجديد
     * في الثالث. لمقالٍ هذا مقبول؛ لسعرٍ لا — يعدّل خالد ٢٣٩٤ إلى ١٩٩٤ فيرى ٢٣٩٤ مرّتين
     * فيظنّ أن الحفظ لم يعمل، أو أسوأ: يراه مشترٍ فيشتري بسعر الأمس.
     *
     * والشكل المدعوم بالأنواع هو الوسيط الثاني `{ expire?: number }` (`revalidate.d.ts`)،
     * لا النداء بوسيطٍ واحد — فذاك مهجور وأُسقط من التوقيع في 16.3.4.
     * و`updateTag` — الطريق الرسميّ لـread-your-own-writes — يرمي في Route Handler
     * ولا يعمل إلا في Server Action، والأدمن لا يستطيع نداء أكشنٍ هنا عبر HTTP.
     */
    revalidateTag(tag, { expire: 0 });

    return NextResponse.json({ success: true, message: `Tag "${tag}" revalidated` });
  } catch {
    return NextResponse.json({ success: false, error: "Revalidation failed" }, { status: 500 });
  }
}
