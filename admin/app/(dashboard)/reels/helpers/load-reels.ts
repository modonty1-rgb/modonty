import { cache } from "react";

import { db } from "@/lib/db";
import { mediaSrc } from "@modonty/shared/lib/media-src";

// Data for the Reels Approval route — every media row a client pushed into the reels
// flow that is still waiting for a Modonty decision (reelStatus = PENDING_APPROVAL).
//
// The three approval guards are COMPUTED HERE, per row, so the UI can disable the
// approve button with a reason instead of letting the click fail server-side:
//   Guard 1 — no title or no description → nothing useful reaches VideoObject/ImageObject.
//   Guard 2 — title duplicated within the same client → Google requires a title unique
//             to each clip, so approving the copy publishes something it will ignore.
//   Guard 3 — the upload never finished, so there may be no file behind the card at all.

/** Statuses whose titles a new reel must not collide with. A REJECTED or ARCHIVED
 *  title is reusable — that reel is out of the public surface. */
const TITLE_HOLDERS = ["PENDING_APPROVAL", "APPROVED", "PUBLISHED"] as const;

export interface PendingReelRow {
  id: string;
  isVideo: boolean;
  /** Display source — image file or video poster. */
  previewUrl: string | null;
  /** Videos only — the plain MP4 the preview plays. */
  mp4Url: string | null;
  title: string | null;
  description: string | null;
  altText: string | null;
  durationSec: number | null;
  width: number | null;
  height: number | null;
  uploadedBy: string | null;
  /** Also lives in the client's gallery (came from the gallery tick, not a fresh upload). */
  inGallery: boolean;
  createdAt: string;
  clientId: string | null;
  clientName: string;
  clientLogoUrl: string | null;
  /** Guard 2 — same title on another reel of the same client (or twice in this queue). */
  duplicateTitle: boolean;
  /**
   * Guard 3 — the video's upload never finished.
   *
   * The row is created before the first byte goes out (it holds Bunny's guid), and every
   * failure path in the uploader shows the client a message and leaves the row where it is —
   * a dropped connection, a failed encode, a closed tab. `finalizeVideoReel` is what writes
   * the dimensions, size and duration, so all three being empty means it never ran and there
   * may be no file behind the card. Measured 25 Aug 2026: 6 of 18 video reels, and the three
   * whose Bunny files answered 404 were all among them.
   *
   * Read straight off the row — no network call, so the queue stays as cheap as it was.
   */
  incompleteUpload: boolean;
  /** لحظة النشر — الشاشات السجلّية ترتّب بها وتعرضها. `null` لما لم يُنشر بعد. */
  publishedAt: string | null;
  /** السبب الذي قرأه العميل عند الرفض — بدونه شاشة «مرفوض» تعرض صفوفاً بلا معنى. */
  rejectionReason: string | null;
  /** عنوان الريل على مودونتي (`/reels/<slug>`). `null` قبل أن يُولَّد. */
  slug: string | null;
}

const normalize = (t: string | null | undefined) => (t ?? "").trim().toLowerCase();

/** The approval queue, oldest first — the client who has waited longest is served first. */
/** الحالات التي لها شاشة في الأدمن — ومنها تُشتقّ المسارات وبنود السايدبار. */
export const REEL_VIEWS = ["pending", "published", "rejected", "archived"] as const;
export type ReelView = (typeof REEL_VIEWS)[number];

/** كل شاشة وحالتها في القاعدة، وترتيب صفوفها.
 *
 *  الطابور يُرتَّب بالأقدم أوّلاً — العميل الذي انتظر أطول يُخدَم أوّلاً، وهذا هو
 *  السلوك القائم. أمّا الشاشات الثلاث الأخرى فسجلّ: الأحدث أوّلاً، لأن ما يُبحث عنه
 *  فيها هو آخر ما تغيّر لا أوّل ما دخل. */
export const REEL_VIEW_CONFIG: Record<
  ReelView,
  { status: string; order: "asc" | "desc"; title: string; lede: string }
> = {
  pending: {
    status: "PENDING_APPROVAL",
    order: "asc",
    title: "بالانتظار",
    lede: "ريلز رفعها العملاء من الكونسول وتستنى قرارك — الاعتماد ينشرها فوراً على مودونتي.",
  },
  published: {
    status: "PUBLISHED",
    order: "desc",
    title: "منشور",
    lede: "الريلز الحيّة على مودونتي الآن — يشوفها الزائر في الطلّات.",
  },
  rejected: {
    status: "REJECTED",
    order: "desc",
    title: "مرفوض",
    lede: "ريلز رُفضت بسبب مكتوب للعميل — يقدر يرفع بديلاً.",
  },
  archived: {
    status: "ARCHIVED",
    order: "desc",
    title: "مؤرشف",
    lede: "خرجت من الواجهة العامّة وبقي صفّها وتفاعل الزوّار عليه.",
  },
};

export async function getPendingReels(): Promise<PendingReelRow[]> {
  return getReelsByView("pending");
}

/** نفس استعلام الطابور، بحالةٍ وترتيبٍ يأتيان من `REEL_VIEW_CONFIG`.
 *  الحقول والحرّاس واحدة عبر الشاشات الأربع — فنسخ الاستعلام كان سيُبقي شاشةً
 *  تعرض حقلاً لا تعرضه أختها بعد أوّل تعديل. */
export async function getReelsByView(view: ReelView): Promise<PendingReelRow[]> {
  const cfg = REEL_VIEW_CONFIG[view];
  const pending = await db.media.findMany({
    where: { inReels: true, reelStatus: cfg.status as never },
    orderBy: { createdAt: cfg.order },
    select: {
      id: true,
      url: true,
      bunnyUrl: true, blurDataURL: true,
      thumbnailUrl: true,
      mp4Url: true,
      mimeType: true,
      title: true,
      description: true,
      altText: true,
      durationSec: true,
      width: true,
      height: true,
      inGallery: true,
      reelUploadedBy: true,
      reelPublishedAt: true,
      reelRejectionReason: true,
      reelSlug: true,
      createdAt: true,
      clientId: true,
      client: {
        select: { name: true, logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } } },
      },
    },
  });

  // Guard 2 needs every title the client already holds — fetched once for all queue
  // rows, not per row. Includes the queue itself: two pending reels with the same
  // title are BOTH flagged, otherwise approving them in sequence slips the copy through.
  const clientIds = [...new Set(pending.map((r) => r.clientId).filter((c): c is string => !!c))];
  const holders = clientIds.length
    ? await db.media.findMany({
        where: {
          clientId: { in: clientIds },
          inReels: true,
          reelStatus: { in: [...TITLE_HOLDERS] },
          title: { not: null },
        },
        select: { id: true, clientId: true, title: true },
      })
    : [];

  // clientId -> normalized title -> how many rows hold it
  const titleCounts = new Map<string, Map<string, number>>();
  for (const h of holders) {
    if (!h.clientId) continue;
    const key = normalize(h.title);
    if (!key) continue;
    const perClient = titleCounts.get(h.clientId) ?? new Map<string, number>();
    perClient.set(key, (perClient.get(key) ?? 0) + 1);
    titleCounts.set(h.clientId, perClient);
  }

  return pending.map((r) => {
    const isVideo = r.mimeType.startsWith("video/");
    const key = normalize(r.title);
    const count = r.clientId ? (titleCounts.get(r.clientId)?.get(key) ?? 0) : 0;
    return {
      id: r.id,
      isVideo,
      // A video's `url` is its HLS playlist — the poster is the previewable image.
      previewUrl: isVideo ? r.thumbnailUrl : (mediaSrc(r) ?? r.url),
      mp4Url: r.mp4Url,
      title: r.title,
      description: r.description,
      altText: r.altText,
      durationSec: r.durationSec,
      width: r.width,
      height: r.height,
      uploadedBy: r.reelUploadedBy,
      inGallery: r.inGallery,
      createdAt: r.createdAt.toISOString(),
      clientId: r.clientId,
      clientName: r.client?.name ?? "—",
      clientLogoUrl: mediaSrc(r.client?.logoMedia ?? null),
      // The row itself is one holder of its own title; a second holder means collision.
      duplicateTitle: !!key && count > 1,
      // Videos only: an image reel is written in one call and has no second step to lose.
      incompleteUpload:
        isVideo && (r.width == null || r.height == null || r.durationSec == null),
      publishedAt: r.reelPublishedAt?.toISOString() ?? null,
      rejectionReason: r.reelRejectionReason,
      slug: r.reelSlug,
    };
  });
}

/** Header counts — how much sits in each stage of the reel lifecycle.
 *
 *  `cache()` لأن طالبيه اثنان في نفس الطلب: التخطيط يجمعها في المجموع، والصفحة تمرّرها
 *  إلى شريط الحالات. بدونه استعلامٌ واحد يُنفَّذ مرّتين في كل فتحة شاشة (`server-cache-react`). */
export const getReelStatusCounts = cache(async function getReelStatusCounts(): Promise<
  Record<string, number>
> {
  const groups = await db.media.groupBy({
    by: ["reelStatus"],
    where: { inReels: true, reelStatus: { not: null } },
    _count: { _all: true },
  });
  return Object.fromEntries(groups.map((g) => [g.reelStatus ?? "?", g._count._all]));
});
