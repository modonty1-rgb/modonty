"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const Input = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/),
  // USED لا تُضبط هنا — «كُتبت» تمرّ بربط المقال (`link-idea-article.ts`) وإلا لا يُقاس أثرها
  status: z.enum(["NEW", "WATCH", "APPROVED", "REJECTED"]),
});

/** قرار الفريق على فكرة: اعتماد · متابعة · رفض · إرجاع. يُسجَّل من قرّر ومتى، ويُفكّ ربط المقال إن وُجد. */
export async function setIdeaStatus(raw: unknown): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  const staffId = (session?.user as { id?: string } | undefined)?.id;
  if (!staffId) return { success: false, error: "غير مصرح" };

  const parsed = Input.safeParse(raw);
  if (!parsed.success) return { success: false, error: "طلب غير صالح" };

  try {
    await db.ideaBankItem.update({
      where: { id: parsed.data.id },
      data: { status: parsed.data.status, reviewedById: staffId, reviewedAt: new Date(), articleId: null, writtenAt: null },
      select: { id: true },
    });
  } catch {
    return { success: false, error: "الفكرة غير موجودة" };
  }
  revalidatePath("/idea-bank");
  return { success: true };
}
