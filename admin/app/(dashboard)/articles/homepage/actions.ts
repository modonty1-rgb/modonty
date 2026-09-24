"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { HOMEPAGE_PICK_LIMIT } from "@modonty/shared/lib/articles/homepage-article-order";

const objectId = z.string().regex(/^[a-f0-9]{24}$/);
const pickInput = z.object({ articleId: objectId, picked: z.boolean() });
const orderInput = z.object({ articleIds: z.array(objectId).min(1).max(100) });

async function refresh() {
  revalidatePath("/articles/homepage");
  // فوريّ: المحرّرُ يختار ثم يفتح الرئيسية ليرى — «max» كان يعرض ما قبل الاختيار (مقيس).
  await revalidateModontyTag("articles", undefined, { immediate: true });
}

/**
 * **اختيارُ مقالٍ ليتصدّر رئيسية مدونتي — أو رفعُه عنها** (خالد ٢٤ سبتمبر ٢٠٢٦).
 *
 * `featured` يُعلِّم الاختيار، و`featuredOrder` مكانُه بين الاختيارات: الجديدُ يُضاف آخرَها
 * (أكبرُ رقمٍ + ١)، والمرفوعُ يُفرَّغ رقمُه. ولا يبقى مختارٌ بلا رقم — مونغو يقدّم الفارغ
 * (`shared/lib/articles/homepage-article-order.ts`). المنشورُ وحده يُختار.
 */
export async function setHomepagePick(raw: unknown): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "غير مصرح" };

    const parsed = pickInput.safeParse(raw);
    if (!parsed.success) return { success: false, error: "طلب غير صالح" };
    const { articleId, picked } = parsed.data;

    const article = await db.article.findUnique({ where: { id: articleId }, select: { status: true } });
    if (!article) return { success: false, error: "المقال غير موجود" };
    if (picked && article.status !== "PUBLISHED") return { success: false, error: "المنشور وحده يُختار للرئيسية" };

    if (picked) {
      // عشرُ خاناتٍ في الصفحة الأولى — الحادي عشر لا يظهر، فيُرفض هنا لا في الواجهة وحدها.
      const count = await db.article.count({ where: { featured: true, NOT: { id: articleId } } });
      if (count >= HOMEPAGE_PICK_LIMIT) return { success: false, error: `اكتملت الخانات (${HOMEPAGE_PICK_LIMIT}) — أزل مقالاً أوّلاً` };
      const last = await db.article.findFirst({
        where: { featured: true, featuredOrder: { not: null } },
        orderBy: { featuredOrder: "desc" },
        select: { featuredOrder: true },
      });
      await db.article.update({ where: { id: articleId }, data: { featured: true, featuredOrder: (last?.featuredOrder ?? 0) + 1 } });
    } else {
      await db.article.update({ where: { id: articleId }, data: { featured: false, featuredOrder: null } });
    }

    await refresh();
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "تعذّر الحفظ" };
  }
}

/**
 * **ترتيبُ الاختيارات كما رتّبها المحرّر** — القائمةُ كاملةً بترتيبها الجديد، فيُكتب لكلٍّ رقمُ
 * مكانه (١، ٢، ٣…). كتابةُ القائمة كلّها لا تبادلُ جارين: تُصلح أيضاً أيّ مختارٍ بقي بلا رقم.
 */
export async function reorderHomepagePicks(raw: unknown): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "غير مصرح" };

    const parsed = orderInput.safeParse(raw);
    if (!parsed.success) return { success: false, error: "طلب غير صالح" };
    const { articleIds } = parsed.data;

    await db.$transaction(
      articleIds.map((id, i) => db.article.updateMany({ where: { id, featured: true }, data: { featuredOrder: i + 1 } })),
    );

    await refresh();
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "تعذّر الحفظ" };
  }
}
