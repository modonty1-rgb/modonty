"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { ASSET_KEYS } from "@/lib/videos";

const text = (max: number) => z.string().trim().max(max);
const inputSchema = z.object({
  jobId: z.string().regex(/^[a-f0-9]{24}$/i),
  asset: z.enum(ASSET_KEYS),
  copy: z.object({
    youtube: z
      .object({ title: text(100).min(1), description: text(5000), chapters: text(3000).optional(), tags: z.array(text(100)).max(30).optional() })
      .optional(),
    tiktok: z.object({ caption: text(2200), hashtags: z.array(text(100)).max(30) }).optional(),
    instagram: z.object({ caption: text(2200) }).optional(),
  }),
});

type Result = { success: true } | { success: false; error: string };

/**
 * تعديل نص ملف واحد قبل اعتماده — السيرفر يقرأ النص **بعد** التعديل من الطابور (العقد §٢).
 * عنوان يوتيوب ١٠٠ حرف بالكثير (حدّ يوتيوب). نفس revision لو أعاد السيرفر الإرسال يبقي هذا التعديل.
 */
export async function saveVideoCopy(raw: z.input<typeof inputSchema>): Promise<Result> {
  const gate = await requireAdmin();
  if ("error" in gate) return { success: false, error: gate.error };
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "النص غير صالح." };
  const { jobId, asset, copy } = parsed.data;

  const [job, staff] = await Promise.all([
    db.videoJob.findUnique({ where: { id: jobId }, select: { revision: true, copy: true } }),
    db.staff.findUnique({ where: { id: gate.userId }, select: { name: true } }),
  ]);
  if (!job) return { success: false, error: "الفيديو مو موجود." };

  const all = (job.copy ?? {}) as Record<string, Record<string, unknown>>;
  const merged = { ...all, [asset]: { ...(all[asset] ?? {}), ...copy } } as Prisma.InputJsonObject;
  await db.videoJob.update({
    where: { id: jobId },
    data: {
      copy: merged,
      history: { push: { revision: job.revision, event: `edit_copy:${asset}`, at: new Date(), byName: staff?.name ?? null } },
    },
  });
  revalidatePath(`/videos/${jobId}`);
  return { success: true };
}
