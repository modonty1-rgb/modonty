import type { VideoItemStatus, VideoJobStatus, VideoPlatform } from "@prisma/client";

/** لون واحد لكل معنى في الصفحتين (وصفة Advanced Table): كهرماني ينتظر · وردي يحتاج تدخل · زمردي انتهى. */
export const JOB_STATUS_LABEL: Record<VideoJobStatus, string> = {
  READY_FOR_REVIEW: "جاهز للمراجعة",
  NEEDS_ATTENTION: "يحتاج تدخل",
  DONE: "خلص",
};

export const JOB_STATUS_BADGE: Record<VideoJobStatus, string> = {
  READY_FOR_REVIEW: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  NEEDS_ATTENTION: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  DONE: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
};

export const PLATFORM_LABEL: Record<VideoPlatform, string> = {
  YOUTUBE: "يوتيوب",
  MODONTY_REELS: "ريلز مدونتي",
  TIKTOK: "تيك توك",
  INSTAGRAM: "إنستغرام",
};

export const ITEM_STATUS_LABEL: Record<VideoItemStatus, string> = {
  PENDING: "ينتظر قرارك",
  APPROVED: "معتمد",
  PUBLISHED: "منشور",
  REJECTED: "مرفوض — يرجع للسكربت",
  FAILED: "فشل النشر",
  SKIPPED: "ما ننشره هنا",
};

export const ITEM_STATUS_BADGE: Record<VideoItemStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  APPROVED: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  PUBLISHED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  REJECTED: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  FAILED: "bg-red-500/15 text-red-700 dark:text-red-300",
  SKIPPED: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
};

export const ASSET_LABEL = (asset: string) =>
  asset === "long" ? "الفيديو العادي" : `شورت ${new Intl.NumberFormat("ar-EG").format(Number(asset.replace("short-", "")))}`;

/** Manual platforms: the team downloads, copies the text, posts by hand, then marks it. */
export const MANUAL_PLATFORMS: VideoPlatform[] = ["TIKTOK", "INSTAGRAM"];
