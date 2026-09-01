"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

// التحكّم بما بعد النشر — وهو ما كان مفقوداً كلّه: الاعتماد والرفض قرارٌ يُتّخذ مرّة على
// ما ينتظر، ولا شيء بعده. فريلٌ منشور يزعج العميل أو يحمل خطأً كان يبقى حيّاً حتى يفتح
// أحدنا القاعدة بيده.
//
// فعلان لا أكثر: السحب من الواجهة، وإرجاعه إليها. والحذف النهائيّ ليس هنا عن قصد —
// مكانه مكتبة الوسائط، وحارسها يشترط الأرشفة أوّلاً (`can-delete-media.ts`)، فيصير هذا
// الملفّ هو الباب الذي كانت تلك الرسالة تشير إليه ولا وجود له.

type Result = { success: true } | { success: false; error: string };

/**
 * سحب ريل منشور من الواجهة العامّة.
 *
 * `revalidateModontyTag` قبل كل شيء آخر: الأرشفة تترك صفحةً حيّة تردّ ٢٠٠ طوال نافذة
 * الكاش إن لم تُبطَل — وهو بالضبط ما قيس في ٢٥ أغسطس على ريل مرفوض.
 */
export async function archiveReel(mediaId: string): Promise<Result> {
  const session = await auth();
  if (!session) return { success: false, error: "غير مصرّح" };
  if (!mediaId?.trim()) return { success: false, error: "معرّف الريل مفقود" };

  try {
    const reel = await db.media.findFirst({
      where: { id: mediaId, inReels: true, reelStatus: "PUBLISHED" },
      select: { id: true },
    });
    if (!reel) return { success: false, error: "الريل غير موجود أو ما هو منشور أصلاً" };

    await db.media.update({
      where: { id: reel.id },
      data: { reelStatus: "ARCHIVED" },
    });

    await revalidateModontyTag("reels").catch(() => {});
    revalidatePath("/reels", "layout");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "فشل سحب الريل" };
  }
}

/**
 * إرجاع ريل مؤرشف إلى الواجهة.
 *
 * يُعاد فحص العنوان والوصف هنا لا في الشاشة وحدها: الريل قد يكون أُرشف سنةً، والعميل
 * قد يكون فرّغ حقلاً من الكونسول في هذه الأثناء — فالنشر على حسن الظنّ يعيد إلى الواجهة
 * بطاقةً بلا نصّ. والرسالة تسمّي الحقل، لأن «لا يمكن النشر» وحدها لا تُصلَح.
 *
 * ولا يُلمس `reelPublishedAt` إن كان موجوداً: تاريخ النشر الأوّل حقيقةٌ في السجلّ، ودهسه
 * يمحو متى رآه الزائر أوّل مرّة.
 */
export async function republishReel(mediaId: string): Promise<Result> {
  const session = await auth();
  if (!session) return { success: false, error: "غير مصرّح" };
  if (!mediaId?.trim()) return { success: false, error: "معرّف الريل مفقود" };

  try {
    const reel = await db.media.findFirst({
      where: { id: mediaId, inReels: true, reelStatus: "ARCHIVED" },
      select: { id: true, title: true, description: true, reelPublishedAt: true },
    });
    if (!reel) return { success: false, error: "الريل غير موجود أو ما هو مؤرشف" };

    if (!reel.title?.trim()) {
      return { success: false, error: "ما ينشر — حقل «العنوان» فاضي. العميل يكمّله من بطاقة الريل في الكونسول." };
    }
    if (!reel.description?.trim()) {
      return { success: false, error: "ما ينشر — حقل «الوصف» فاضي. العميل يكمّله من بطاقة الريل في الكونسول." };
    }

    await db.media.update({
      where: { id: reel.id },
      data: {
        reelStatus: "PUBLISHED",
        reelPublishedAt: reel.reelPublishedAt ?? new Date(),
        reelRejectionReason: null,
      },
    });

    await revalidateModontyTag("reels").catch(() => {});
    revalidatePath("/reels", "layout");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "فشل إرجاع الريل" };
  }
}
