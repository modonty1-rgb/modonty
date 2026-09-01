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

/**
 * Returns the first URL that is missing or does not answer, or null when all are there.
 * A network failure counts as unreachable: publishing on the benefit of the doubt is what
 * put three dead reels in the feed.
 *
 * A one-byte range GET, NOT a `HEAD`. Bunny Stream answers `HEAD` with 404 for a rendition
 * the edge does not hold yet — the file is intact at origin, the edge simply has no copy and
 * a HEAD does not make it pull one. Measured 31 Aug 2026 on one URL, three calls in a row:
 *   HEAD → 404 · GET Range 0-0 → 206 · HEAD → 200
 * while Bunny's own API reported the video `status 4`, encode 100%, 150MB stored. A real reel
 * was refused with «ارفعه من جديد» on the strength of that false 404. The range GET both
 * answers the question and warms the edge, for one byte.
 *
 * `cache: "no-store"` because this asks about the world right now, not about a value: a probe
 * whose answer can be replayed from a cache is not a probe.
 *
 * The reason NAMES the file and the code. A bare «(404)» sent us hunting the wrong CDN
 * behaviour for an hour on 31 Aug 2026 — which of the two URLs failed was never in the message.
 */
async function firstUnreachable(urls: (string | null)[]): Promise<string | null> {
  for (const url of urls) {
    if (!url?.trim()) return "الرابط فاضي";
    const file = url.split("/").pop() || url;
    try {
      const res = await fetch(url, {
        headers: { range: "bytes=0-0" },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return `${file} ← ${res.status}`;

      // أوّل بايت يقول «الملف موجود»، ولا يقول «الملف كامل». وبني ردّ علينا ٣١ أغسطس ٢٠٢٦
      // بـ«مكتمل ١٠٠٪ · 150MB» عن ملف يعلن 11,542,896 بايت ويصل منه ~5.1 ميغا برقم مختلف
      // كل مرّة من ثلاث نقاط توزيع (`curl exit=18`). فالحارس كان يمرّره.
      //
      // فنسأل عن **آخر** بايت كذلك: `Range: bytes=-1`. النقطة التي لا تملك إلا مقدّمة الملف
      // لا تستطيع تسليم بايته الأخير — ترد ٤١٦ أو تفشل. وثمنه بايتٌ واحد، لا تنزيلٌ كامل
      // لعشرات الميغابايتات عند كل اعتماد.
      //
      // ونقرأ `content-range` لنقارن الطول المعلن في الردّين: اختلافهما يعني أن ما عند
      // النقطة ليس ما يعلنه الأصل.
      const declared = res.headers.get("content-range")?.split("/")[1] ?? null;
      const tail = await fetch(url, {
        headers: { range: "bytes=-1" },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (!tail.ok) return `${file} ← الملف ناقص عند نقطة التوزيع (آخر بايت ${tail.status})`;
      const tailDeclared = tail.headers.get("content-range")?.split("/")[1] ?? null;
      if (declared && tailDeclared && declared !== tailDeclared) {
        return `${file} ← الطول غير ثابت (${declared} ثم ${tailDeclared}) — ارفعه من جديد`;
      }
    } catch (e) {
      return `${file} ← ما رد (${e instanceof Error ? e.name : "?"})`;
    }
  }
  return null;
}

export async function approveReel(mediaId: string): Promise<Result> {
  const session = await auth();
  if (!session) return { success: false, error: "غير مصرّح" };
  if (!mediaId?.trim()) return { success: false, error: "معرّف الريل مفقود" };

  try {
    const reel = await db.media.findFirst({
      where: { id: mediaId, inReels: true, reelStatus: "PENDING_APPROVAL" },
      select: {
        id: true,
        title: true,
        description: true,
        clientId: true,
        mimeType: true,
        mp4Url: true,
        thumbnailUrl: true,
      },
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

    // Guard 3 — the files have to exist. A video reel's watch page ships a `VideoObject`
    // whose `thumbnailUrl` and `contentUrl` Google fetches to verify the clip, and both are
    // required properties. Three reels were published on 25 Aug 2026 whose Bunny files were
    // already 404: the queue checked the text and never the video, so the feed carried three
    // black cards and three broken VideoObjects.
    if (reel.mimeType?.startsWith("video/")) {
      const dead = await firstUnreachable([reel.mp4Url, reel.thumbnailUrl]);
      if (dead) {
        return {
          success: false,
          error: `الاعتماد مقفول — ملف الريل مو موجود على السيرفر (${dead}). ارفعه من جديد قبل الاعتماد.`,
        };
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

    // The same cache hit approval fires, and for a stronger reason: approval only makes a
    // reel appear late, rejection leaves one VISIBLE. `revalidatePath("/reels")` below busts
    // this admin route, not modonty — so a rejected reel kept serving its watch page at
    // HTTP 200 for the whole cache window (measured 25 Aug 2026: gone from the feed and the
    // sitemap, still live at its own URL).
    await revalidateModontyTag("reels").catch(() => {});
    revalidatePath("/reels");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "فشل رفض الريل" };
  }
}
