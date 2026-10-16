"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { ASSET_KEYS, createReelFromShort, jobStatusFromItems } from "@/lib/videos";

const inputSchema = z.object({
  jobId: z.string().regex(/^[a-f0-9]{24}$/i),
  asset: z.enum(ASSET_KEYS),
  platform: z.enum(["YOUTUBE", "MODONTY_REELS", "TIKTOK", "INSTAGRAM"]),
  op: z.enum(["approve", "reject", "skip", "posted", "reset"]),
  note: z.string().trim().max(1000).optional(),
});

type Result = { success: true } | { success: false; error: string };
const MANUAL = new Set(["TIKTOK", "INSTAGRAM"]);

/**
 * قرار الفريق على بند واحد (ملف × منصة) — العقد documents/video-factory/03-contract.md:
 *  • approve: يوتيوب ينشره السيرفر من الطابور · الريلز ينشرها الأدمن (الخطوة ٥) · تيك توك وإنستغرام ما يحتاجون اعتماد، ينشرون يدوياً.
 *  • reject: بملاحظة إلزامية ← يرجع للسكربت (السيرفر يقرأه من queue?state=rejected).
 *  • skip: «ما ننشره هنا» نهائي · posted: تيك توك/إنستغرام بعد النشر اليدوي · reset: تراجع لـ«ينتظر».
 * المنشور ما يتغيّر — صار على المنصة.
 */
export async function decideVideoItem(raw: z.input<typeof inputSchema>): Promise<Result> {
  const gate = await requireAdmin();
  if ("error" in gate) return { success: false, error: gate.error };
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "طلب غير صالح." };
  const { jobId, asset, platform, op, note } = parsed.data;

  if (op === "reject" && !note) return { success: false, error: "اكتب سبب الرفض — السكربت ينكتب من جديد على أساسه." };
  if (op === "posted" && !MANUAL.has(platform)) return { success: false, error: "«تم النشر يدوياً» لتيك توك وإنستغرام بس." };
  if (op === "approve" && MANUAL.has(platform)) return { success: false, error: "تيك توك وإنستغرام ينشرون يدوياً — نزّل الملف وانسخ النص، وبعدها «تم النشر يدوياً»." };

  const [job, staff] = await Promise.all([
    db.videoJob.findUnique({
      where: { id: jobId },
      select: { id: true, revision: true, status: true, items: true, clientId: true, articleId: true, shorts: true, copy: true },
    }),
    db.staff.findUnique({ where: { id: gate.userId }, select: { name: true } }),
  ]);
  if (!job) return { success: false, error: "الفيديو مو موجود." };
  const index = job.items.findIndex((i) => i.asset === asset && i.platform === platform);
  if (index < 0) return { success: false, error: "البند مو موجود." };
  if (job.items[index].status === "PUBLISHED") return { success: false, error: "منشور — ما يتغيّر من هنا." };

  // Modonty reels: the admin itself makes the reel (contract Q6) — into the reels queue, once.
  let reelMediaId: string | null = job.items[index].externalId ?? null;
  if (op === "approve" && platform === "MODONTY_REELS" && !reelMediaId) {
    const short = job.shorts.find((s) => s.key === asset);
    const yt = ((job.copy ?? {}) as Record<string, { youtube?: { title?: string; description?: string } }>)[asset]?.youtube;
    if (!short) return { success: false, error: "ملف الشورت مو موجود." };
    if (!yt?.title?.trim() || !yt?.description?.trim()) {
      return { success: false, error: "الريل يحتاج عنوان ووصف — اكتبهم في «عدّل النص» أول." };
    }
    try {
      const reel = await createReelFromShort({
        clientId: job.clientId,
        articleId: job.articleId,
        fileUrl: short.url,
        title: yt.title.trim(),
        description: yt.description.trim(),
        seconds: short.seconds,
      });
      reelMediaId = reel.mediaId;
    } catch (e) {
      return { success: false, error: `ما قدرنا نرفع الريل على Bunny: ${e instanceof Error ? e.message : "خطأ"}` };
    }
  }

  const now = new Date();
  const byName = staff?.name ?? null;
  const items = job.items.map((i, n) => {
    if (n !== index) return i;
    switch (op) {
      case "approve":
        return {
          ...i,
          status: "APPROVED" as const,
          approvedById: gate.userId,
          approvedByName: byName,
          approvedAt: now,
          note: null,
          error: null,
          // For reels: the Media row id — the reels approval flips this item to PUBLISHED by it.
          externalId: platform === "MODONTY_REELS" ? reelMediaId : i.externalId,
          url: platform === "MODONTY_REELS" ? "/reels/pending" : i.url,
          updatedAt: now,
        };
      case "reject":
        return { ...i, status: "REJECTED" as const, note: note ?? null, approvedById: null, approvedByName: null, approvedAt: null, updatedAt: now };
      case "skip":
        return { ...i, status: "SKIPPED" as const, note: note ?? null, updatedAt: now };
      case "posted":
        return { ...i, status: "PUBLISHED" as const, postedManuallyAt: now, approvedById: gate.userId, approvedByName: byName, approvedAt: now, updatedAt: now };
      case "reset":
        return { ...i, status: "PENDING" as const, approvedById: null, approvedByName: null, approvedAt: null, note: null, updatedAt: now };
    }
  });
  const next = jobStatusFromItems(items);
  await db.videoJob.update({
    where: { id: jobId },
    data: {
      items: { set: items },
      status: job.status === "NEEDS_ATTENTION" && next !== "DONE" ? "NEEDS_ATTENTION" : next,
      history: { push: { revision: job.revision, event: `${op}:${asset}:${platform.toLowerCase()}`, at: now, byName } },
    },
  });
  revalidatePath("/videos");
  revalidatePath(`/videos/${jobId}`);
  return { success: true };
}
