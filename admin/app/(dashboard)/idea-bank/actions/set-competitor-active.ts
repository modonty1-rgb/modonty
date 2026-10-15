"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const Input = z.object({ domain: z.string().min(3).max(200), active: z.boolean() });

/**
 * إيقاف منافس أو إعادته — إيقافٌ لا حذف: أفكاره المرصودة تبقى في البنك، والرادار يتجاهله فقط.
 */
export async function setCompetitorActive(raw: unknown): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!(session?.user as { id?: string } | undefined)?.id) return { success: false, error: "غير مصرح" };

  const parsed = Input.safeParse(raw);
  if (!parsed.success) return { success: false, error: "مدخل غير صالح" };

  const { count } = await db.ideaCompetitor.updateMany({ where: { domain: parsed.data.domain }, data: { active: parsed.data.active } });
  if (count === 0) return { success: false, error: "المنافس غير موجود" };
  revalidatePath("/idea-bank");
  return { success: true };
}
