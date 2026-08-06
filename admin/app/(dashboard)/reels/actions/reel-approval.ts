"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

// The Modonty decision on a client's reel (أ٥). Approve goes straight to PUBLISHED —
// the promise on the console side is «بعد اعتماد مُدَوَّنَتِي يظهر», and an APPROVED
// holding state nothing reads would quietly break it. `reelRevealedAt` stays untouched
// for the future hidden-batch launch.
//
// Both approval guards (ق9) run HERE, not only in the UI — the disabled button is a
// courtesy; this is the enforcement.

type Result = { success: true } | { success: false; error: string };

/** Same set as the loader: statuses whose titles a new reel must not collide with. */
const TITLE_HOLDERS = ["PENDING_APPROVAL", "APPROVED", "PUBLISHED"] as const;

export async function approveReel(mediaId: string): Promise<Result> {
  const session = await auth();
  if (!session) return { success: false, error: "غير مصرّح" };
  if (!mediaId?.trim()) return { success: false, error: "معرّف الريل مفقود" };

  try {
    const reel = await db.media.findFirst({
      where: { id: mediaId, inReels: true, reelStatus: "PENDING_APPROVAL" },
      select: { id: true, title: true, description: true, clientId: true },
    });
    if (!reel) return { success: false, error: "الريل غير موجود أو خرج من قائمة الانتظار" };

    // Guard 1 — without a title no VideoObject/ImageObject is emitted at all, so the
    // approval would publish something invisible to search.
    if (!reel.title?.trim() || !reel.description?.trim()) {
      return { success: false, error: "الاعتماد مقفول — العنوان أو الوصف فاضي" };
    }

    // Guard 2 — Google requires a title unique to each clip per client. Checked at
    // approval time (not only in the loader) so two tabs can't approve the same copy.
    if (reel.clientId) {
      const duplicate = await db.media.findFirst({
        where: {
          id: { not: reel.id },
          clientId: reel.clientId,
          inReels: true,
          reelStatus: { in: [...TITLE_HOLDERS] },
          title: { equals: reel.title.trim(), mode: "insensitive" },
        },
        select: { id: true },
      });
      if (duplicate) {
        return { success: false, error: "الاعتماد مقفول — العنوان مكرّر مع ريل ثاني لنفس العميل" };
      }
    }

    const now = new Date();
    await db.media.update({
      where: { id: reel.id },
      data: {
        reelStatus: "PUBLISHED",
        reelApprovedAt: now,
        reelPublishedAt: now,
        reelRejectionReason: null,
      },
    });

    // The public feed caches per page under this tag — without the hit, the approved
    // reel waits out the cache window instead of appearing "فوراً" as promised.
    await revalidateModontyTag("reels").catch(() => {});
    revalidatePath("/reels");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "فشل اعتماد الريل" };
  }
}

export async function rejectReel(mediaId: string, reason: string): Promise<Result> {
  const session = await auth();
  if (!session) return { success: false, error: "غير مصرّح" };
  if (!mediaId?.trim()) return { success: false, error: "معرّف الريل مفقود" };

  // The reason is what the client sees on their card — a rejection without one reads
  // as arbitrary and generates a support message instead of a fix.
  const cleanReason = (reason ?? "").trim();
  if (!cleanReason) return { success: false, error: "اكتب سبب الرفض — العميل بيشوفه على البطاقة" };

  try {
    const reel = await db.media.findFirst({
      where: { id: mediaId, inReels: true, reelStatus: "PENDING_APPROVAL" },
      select: { id: true },
    });
    if (!reel) return { success: false, error: "الريل غير موجود أو خرج من قائمة الانتظار" };

    await db.media.update({
      where: { id: reel.id },
      data: { reelStatus: "REJECTED", reelRejectionReason: cleanReason.slice(0, 500) },
    });

    revalidatePath("/reels");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "فشل رفض الريل" };
  }
}
