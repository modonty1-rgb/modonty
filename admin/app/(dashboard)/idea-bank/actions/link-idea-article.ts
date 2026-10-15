"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const Input = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/),
  articleId: z.string().regex(/^[a-f0-9]{24}$/),
});

/**
 * «كُتبت» بمقالها — الفكرة تصير USED مربوطةً بالمقال، ويبدأ عدّاد الثلاثين يوماً من نشره، فيُقاس
 * في تبويب «النتائج» هل جاءت الفكرة بزيارات (خالد ١٥ أكتوبر ٢٠٢٦).
 */
export async function linkIdeaArticle(raw: unknown): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  const staffId = (session?.user as { id?: string } | undefined)?.id;
  if (!staffId) return { success: false, error: "غير مصرح" };

  const parsed = Input.safeParse(raw);
  if (!parsed.success) return { success: false, error: "طلب غير صالح" };

  const article = await db.article.findFirst({
    where: { id: parsed.data.articleId, status: "PUBLISHED" },
    select: { datePublished: true },
  });
  if (!article) return { success: false, error: "المقال غير منشور أو غير موجود" };

  try {
    await db.ideaBankItem.update({
      where: { id: parsed.data.id },
      data: {
        status: "USED",
        articleId: parsed.data.articleId,
        writtenAt: article.datePublished ?? new Date(),
        reviewedById: staffId,
        reviewedAt: new Date(),
      },
      select: { id: true },
    });
  } catch {
    return { success: false, error: "الفكرة غير موجودة" };
  }
  revalidatePath("/idea-bank");
  return { success: true };
}
