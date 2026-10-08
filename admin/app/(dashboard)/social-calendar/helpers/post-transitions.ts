import type { SocialPostStatus } from "@prisma/client";

/**
 * آلة حالات منشور السوشيال — المصدر الوحيد (PRD §٥.١).
 *
 *   IN_PRODUCTION    ──markReady (أصل ≥ ١)──▶ READY_FOR_REVIEW
 *   READY_FOR_REVIEW ──approve──────────────▶ READY_TO_PUBLISH
 *   READY_FOR_REVIEW ──reject + note────────▶ IN_PRODUCTION      (rejectionCount++)
 *   READY_FOR_REVIEW ──assetsEmptied────────▶ IN_PRODUCTION      (تلقائي عند حذف آخر أصل)
 *   READY_TO_PUBLISH ──publish──────────────▶ PUBLISHED
 *   READY_TO_PUBLISH ──reject + note────────▶ IN_PRODUCTION      (الميديا باير يعيد — س٧)
 *   PUBLISHED        ── لا انتقال ──           (تعديل الروابط فقط)
 *
 * القديم كان يقبل أي حالة من أي حالة (`updateStatus` في `entries.ts:250-271`)؛ هنا كل أكشن
 * يسأل هذا الجدول، والانتقال غير المدرَج يرجع خطأً.
 */
export type SocialPostEvent = "markReady" | "approve" | "reject" | "publish" | "assetsEmptied";

export const SOCIAL_TRANSITIONS: Record<SocialPostEvent, { from: readonly SocialPostStatus[]; to: SocialPostStatus }> = {
  markReady: { from: ["IN_PRODUCTION"], to: "READY_FOR_REVIEW" },
  approve: { from: ["READY_FOR_REVIEW"], to: "READY_TO_PUBLISH" },
  reject: { from: ["READY_FOR_REVIEW", "READY_TO_PUBLISH"], to: "IN_PRODUCTION" },
  publish: { from: ["READY_TO_PUBLISH"], to: "PUBLISHED" },
  assetsEmptied: { from: ["READY_FOR_REVIEW"], to: "IN_PRODUCTION" },
};

/**
 * الحالات التي تُقفَل فيها الأصول: لا رفع ولا حذف ولا تعديل تسمية.
 * نفس قفل القديم (`ProductionForm.tsx:205` و`entries.ts:355-357`).
 */
export const ASSETS_LOCKED_STATUSES: readonly SocialPostStatus[] = ["READY_TO_PUBLISH", "PUBLISHED"];

/** الحالة التالية لهذا الحدث من هذه الحالة، أو null إن كان الانتقال ممنوعاً. */
export function nextSocialStatus(from: SocialPostStatus, event: SocialPostEvent): SocialPostStatus | null {
  const t = SOCIAL_TRANSITIONS[event];
  return t.from.includes(from) ? t.to : null;
}
