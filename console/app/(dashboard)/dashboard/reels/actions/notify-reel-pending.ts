import "server-only";

import { db } from "@/lib/db";
import { sendContentTeamTelegram, escapeTgHtml } from "@modonty/database/lib/telegram/client";

/**
 * Tell the team a reel is sitting in the approval queue.
 *
 * The console promises the client "بعد اعتماد مُدَوَّنَتِي" and then nothing carries that
 * promise anywhere — the row goes PENDING_APPROVAL in a screen nobody has open. That is
 * how 56 reels piled up unseen. This is the signal that was missing.
 *
 * BURST GUARD — the real trap in this feature. A client uploading ten reels in one sitting
 * would fire ten messages and bury the group, which is worse than no alert at all. So a
 * notice goes out only when nothing else entered this client's queue in the last few
 * minutes; the rest of the burst stays quiet and is covered by the count in that one
 * message. No scheduler and no new column — "was something queued just now?" is already
 * answerable from `updatedAt` on rows we have.
 *
 * Never throws. A Telegram outage must not fail an upload that already succeeded.
 */

const ADMIN_ORIGIN = "https://admin.modonty.com";

/** Long enough to swallow a normal upload burst, short enough that a later batch still alerts. */
const BURST_WINDOW_MS = 10 * 60 * 1000;

export type ReelQueueEntry = "uploaded" | "resubmitted";

export async function notifyReelPending(
  mediaId: string,
  clientId: string,
  entry: ReelQueueEntry
): Promise<void> {
  try {
    const [client, media, waiting, alreadyAnnounced] = await Promise.all([
      db.client.findUnique({ where: { id: clientId }, select: { name: true } }),
      db.media.findUnique({
        where: { id: mediaId },
        select: { title: true, mimeType: true, inGallery: true },
      }),
      db.media.count({
        where: { clientId, inReels: true, reelStatus: "PENDING_APPROVAL" },
      }),
      // Any OTHER reel of this client queued moments ago means a notice already went out.
      db.media.count({
        where: {
          clientId,
          inReels: true,
          reelStatus: "PENDING_APPROVAL",
          id: { not: mediaId },
          updatedAt: { gte: new Date(Date.now() - BURST_WINDOW_MS) },
        },
      }),
    ]);

    if (!media || alreadyAnnounced > 0) return;

    const isVideo = media.mimeType.startsWith("video/");
    const header =
      entry === "resubmitted"
        ? "🔁 <b>ريل معدَّل رجع للمراجعة</b>"
        : "🎬 <b>ريل جديد بانتظار المراجعة</b>";

    // A reel with no title cannot be approved (Google needs one unique per reel), so saying
    // so here saves the reviewer from opening it to find that out.
    const name = (media.title ?? "").trim();
    const fileLine = `${isVideo ? "فيديو" : "صورة"}${
      media.inGallery ? " · من معرض الصور" : ""
    } — ${name ? escapeTgHtml(name) : "<i>بلا عنوان بعد، ما ينعتمد قبل ما يكتبه العميل</i>"}`;

    let tg =
      `${header}\n` +
      `<b>مرسل:</b> ${escapeTgHtml(client?.name ?? "عميل غير معروف")}\n` +
      `<b>مستلم:</b> مُدَوَّنَتِي\n` +
      `<b>الملف:</b> ${fileLine}\n` +
      `<b>بانتظار المراجعة:</b> ${waiting}\n`;

    tg += `<a href="${ADMIN_ORIGIN}/reels">افتح شاشة الاعتماد</a>`;

    await sendContentTeamTelegram(tg);
  } catch {
    // never let a notification break an upload that already succeeded
  }
}
