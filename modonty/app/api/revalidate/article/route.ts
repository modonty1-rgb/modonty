import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const revalidateSchema = z.object({
  slug: z.string().min(1).max(200),
  secret: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = revalidateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request", fields: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { slug, secret } = parsed.data;

    const revalidationSecret = process.env.REVALIDATE_SECRET;
    if (!revalidationSecret) {
      return NextResponse.json(
        { success: false, error: "Revalidation not configured" },
        { status: 503 }
      );
    }
    const providedSecret = secret || req.headers.get("x-revalidate-secret");

    /**
     * **السرُّ وحده — ولا بابَ للجلسة** (خالد ٢٠ سبتمبر ٢٠٢٦: «فصلنا الستاف تماماً عن
     * التيبل تبع اليوزر، فأيّ حاجة ما تخصّ اليوزر ألغها»).
     *
     * كان هنا بابٌ ثانٍ: `session.user.role !== ADMIN`. وتعليقُه نفسُه كان يقول إنّ
     * الجلسة **لقارئ** وإنّ التسجيل في مدونتي مفتوحٌ للعامّة — ثمّ يفتح على `User.role`،
     * وهي بقيّةٌ من عهد خلطِ الموظّفين بالقرّاء. و`admin/scripts/add-admin-user.ts:92`
     * كان يكتب `prisma.user.create({ role: ADMIN })` — أي قارئاً بصلاحيّة مدير، يفتح
     * هذا البابَ بتسجيل دخولٍ عاديّ.
     *
     * والأدمن والكونسول يستعملان السرَّ أصلاً (التعليق القديم يقولها: «their real
     * identity»)، فإسقاطُ الباب الثاني لا يكسر مستهلكاً — يُغلق بقيّةً لا ميزة.
     */
    if (providedSecret !== revalidationSecret) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Provide the revalidation secret." },
        { status: 401 }
      );
    }

    revalidatePath(`/articles/${slug}`);
    
    return NextResponse.json({
      success: true,
      message: `Article ${slug} revalidated`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Revalidation failed" },
      { status: 500 }
    );
  }
}
