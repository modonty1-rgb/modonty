import type { VideoItemStatus, VideoJobStatus, VideoPlatform } from "@prisma/client";

/**
 * قيم العقد مع سيرفر المصنع (حروف صغيرة) ↔ قيم القاعدة (تعدادات بحروف كبيرة).
 * العقد مقفول: documents/video-factory/03-contract.md — أي قيمة جديدة تُبلَّغ لجلسة المصنع قبلها.
 */
export const JOB_STATUS_TO_API: Record<VideoJobStatus, string> = {
  READY_FOR_REVIEW: "ready_for_review",
  NEEDS_ATTENTION: "needs_attention",
  DONE: "done",
};

export const PLATFORM_FROM_API = {
  youtube: "YOUTUBE",
  modonty_reels: "MODONTY_REELS",
  tiktok: "TIKTOK",
  instagram: "INSTAGRAM",
} as const satisfies Record<string, VideoPlatform>;

export const PLATFORM_TO_API: Record<VideoPlatform, keyof typeof PLATFORM_FROM_API> = {
  YOUTUBE: "youtube",
  MODONTY_REELS: "modonty_reels",
  TIKTOK: "tiktok",
  INSTAGRAM: "instagram",
};

export const ITEM_STATUS_TO_API: Record<VideoItemStatus, string> = {
  PENDING: "pending",
  APPROVED: "approved",
  PUBLISHED: "published",
  REJECTED: "rejected",
  FAILED: "failed",
  SKIPPED: "skipped",
};

/** `long` · `short-1..3` — نفس المفاتيح في `assets`, `copy`, `items.asset`. */
export const ASSET_KEYS = ["long", "short-1", "short-2", "short-3"] as const;
export type AssetKey = (typeof ASSET_KEYS)[number];

/** الفيديو العادي على يوتيوب فقط؛ كل شورت على المنصات الأربع (قرار العقد Q7). */
export const PLATFORMS_FOR_ASSET = (asset: AssetKey): VideoPlatform[] =>
  asset === "long" ? ["YOUTUBE"] : ["YOUTUBE", "MODONTY_REELS", "TIKTOK", "INSTAGRAM"];

/** Final per item — a job is `DONE` when every item is one of these. */
export const FINAL_ITEM_STATUSES: VideoItemStatus[] = ["PUBLISHED", "SKIPPED"];
