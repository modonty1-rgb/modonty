"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { deleteBunnyUrl, isBunnyUrl } from "@modonty/shared/lib/bunny";
import { deleteStreamVideo } from "@modonty/shared/lib/bunny-stream";

import { getReelDeleteBlockers } from "./get-reel-delete-blockers";
import { mayDeleteBunnyFiles } from "./may-delete-bunny-files";
import { requireDeleteAdmin } from "./require-delete-admin";
import type { DeleteResult } from "./delete-result";

/**
 * الحذف النهائي لريل مسحوب — للأدمن وحده (خالد ١٦ أكتوبر ٢٠٢٦: «زي المقالات»).
 * السحب قرار الفريق من صفحة الريلز وقد شال رابطه من جوجل (410) من وقتها؛ هذا تنظيف للقاعدة
 * وللمساحة المدفوعة عند بني. التعليقات والتفاعلات تنحذف معه (Cascade).
 */
export async function deleteReel(id: string): Promise<DeleteResult> {
  try {
    const denied = await requireDeleteAdmin();
    if (denied) return { success: false, error: denied };

    const reel = await db.media.findUnique({
      where: { id },
      select: { title: true, url: true, bunnyUrl: true, bunnyVideoId: true, reelSlug: true, clientId: true },
    });
    if (!reel) return { success: false, error: "الريل غير موجود — يمكن انحذف قبل." };

    const why = (await getReelDeleteBlockers([id])).get(id) ?? [];
    const name = reel.title?.trim() || "ريل بلا عنوان";
    if (why.length) return { success: false, error: `ما ينحذف «${name}»: ${why.join(" · ")}.` };

    await db.media.delete({ where: { id } });

    // بني — أفضل جهد، بعد نجاح الحذف وحده: الفيديو بمعرّفه، وصورة الريل في منطقة reels،
    // ونسخة المرآة (bunnyUrl) في منطقة clients — نفس عقود `lib/media/delete-media.ts` ومعرض العميل.
    if (mayDeleteBunnyFiles()) try {
      if (reel.bunnyVideoId) await deleteStreamVideo(reel.bunnyVideoId);
      if (reel.url && isBunnyUrl("reels", reel.url)) await deleteBunnyUrl("reels", reel.url);
      if (reel.bunnyUrl) await deleteBunnyUrl("clients", reel.bunnyUrl);
    } catch {
      console.warn("Bunny cleanup failed for a deleted reel, continuing");
    }

    await logAction("reel.delete", { entity: "Media", entityId: id, summary: name, metadata: { slug: reel.reelSlug } });

    revalidatePath("/reels", "layout");
    revalidatePath("/deletion");
    await revalidateModontyTag("reels").catch(() => {});
    return { success: true, message: `انحذف «${name}» نهائياً مع ملفّه. رابطه مسحوب من جوجل (410) من وقت أرشفته.` };
  } catch (e) {
    return { success: false, error: `ما انحذف الريل — خطأ من القاعدة: ${e instanceof Error ? e.message : String(e)}` };
  }
}
