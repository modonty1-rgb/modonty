import "server-only";

import { db } from "@/lib/db";
import { createStreamVideoFromUrl, streamUrls } from "@modonty/shared/lib/bunny-stream";

/** Unique across the media collection — the same rule as the console's reel upload. */
async function buildReelSlug(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `reel-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const taken = await db.media.findFirst({ where: { reelSlug: candidate }, select: { id: true } });
    if (!taken) return candidate;
  }
  throw new Error("could not allocate a unique reel slug");
}

/**
 * شورت من المصنع ← ريل في مدونتي (العقد Q6 · خالد ١٦ أكتوبر ٢٠٢٦). يرفعه على Bunny Stream ويضيفه
 * لطابور الريلز `PENDING_APPROVAL` — **لا ينشره**: النشر يمرّ من اعتماد الريلز نفسه
 * (`app/(dashboard)/reels/actions/reel-approval.ts`) لأنه يفحص أن الملف مكتمل على نقطة التوزيع قبل
 * النشر، والترميز عند Bunny يأخذ دقائق. نفس حقول رفع العميل في الكونسول، بـ`reelUploadedBy: ADMIN`.
 * العنوان والوصف من نص يوتيوب للشورت — حارس الاعتماد يرفض ريلاً بلا عنوان أو وصف.
 */
export async function createReelFromShort(input: {
  clientId: string;
  articleId: string;
  fileUrl: string;
  title: string;
  description: string;
  seconds: number | null;
}): Promise<{ mediaId: string; videoId: string }> {
  const videoId = await createStreamVideoFromUrl(input.title, input.fileUrl);
  const urls = streamUrls(videoId);
  const media = await db.media.create({
    data: {
      filename: `${input.title.slice(0, 180) || "short"}.mp4`,
      url: urls.mp4Url,
      contentUrl: urls.mp4Url,
      mimeType: "video/mp4",
      clientId: input.clientId,
      scope: "CLIENT",
      type: "GENERAL",
      inGallery: false,
      inReels: true,
      bunnyVideoId: videoId,
      playbackUrl: urls.playbackUrl,
      mp4Url: urls.mp4Url,
      thumbnailUrl: urls.thumbnailUrl,
      title: input.title,
      description: input.description,
      durationSec: input.seconds ? Math.round(input.seconds) : null,
      // Factory Shorts are always 1080×1920 (PRD D1). Without dimensions the reels queue locks
      // approval («ما عندنا مدّة المقطع ولا مقاسه») — measured 16 Oct 2026 on the first CBC reel.
      width: 1080,
      height: 1920,
      reelSlug: await buildReelSlug(),
      reelStatus: "PENDING_APPROVAL",
      reelUploadedBy: "ADMIN",
      reelArticleId: input.articleId,
      transcriptStatus: "PENDING",
    },
    select: { id: true },
  });
  return { mediaId: media.id, videoId };
}
