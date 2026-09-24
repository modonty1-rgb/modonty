"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

const input = z.object({ articleId: z.string().regex(/^[a-f0-9]{24}$/), picked: z.boolean() });

/**
 * **اختيارُ مقالٍ ليتصدّر رئيسية مدونتي — أو رفعُه عنها** (خالد ٢٤ سبتمبر ٢٠٢٦).
 *
 * الحقلُ `Article.featured` قائمٌ منذ البداية وخانتُه في فورم المقال، ورئيسيةُ مدونتي ترتّب به
 * (`home-feed-shapes.ts` · `sortBy: "homepage"`). هنا يُدار كقائمةٍ واحدة بدل فتح كلّ مقال.
 * المنشورُ وحده يُختار: المسودّةُ لا تظهر في الرئيسية أصلاً.
 */
export async function setHomepagePick(raw: unknown): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "غير مصرح" };

    const parsed = input.safeParse(raw);
    if (!parsed.success) return { success: false, error: "طلب غير صالح" };
    const { articleId, picked } = parsed.data;

    const article = await db.article.findUnique({ where: { id: articleId }, select: { status: true } });
    if (!article) return { success: false, error: "المقال غير موجود" };
    if (picked && article.status !== "PUBLISHED") return { success: false, error: "المنشور وحده يُختار للرئيسية" };

    await db.article.update({ where: { id: articleId }, data: { featured: picked } });

    revalidatePath("/articles/homepage");
    await revalidateModontyTag("articles");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "تعذّر الحفظ" };
  }
}
