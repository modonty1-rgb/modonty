"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/** «example.com» من أي صيغة يلصقها الفريق: رابط كامل · www · مسار. */
const toDomain = (v: string) =>
  v.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split(/[/?#]/)[0];

const Input = z.object({
  domain: z.string().min(3).max(200).transform(toDomain).pipe(z.string().regex(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/, "نطاق غير صالح")),
  name: z.string().trim().min(2).max(60),
});

/** إضافة منافس — أو إعادة تفعيله إن كان موقوفاً. يرصده الرادار من التشغيل التالي. */
export async function addCompetitor(raw: unknown): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!(session?.user as { id?: string } | undefined)?.id) return { success: false, error: "غير مصرح" };

  const parsed = Input.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "مدخل غير صالح" };
  const { domain, name } = parsed.data;

  await db.ideaCompetitor.upsert({
    where: { domain },
    create: { domain, name },
    update: { name, active: true },
    select: { id: true },
  });
  revalidatePath("/idea-bank");
  return { success: true };
}
