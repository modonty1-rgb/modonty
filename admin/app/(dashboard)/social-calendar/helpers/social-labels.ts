import type {
  SocialAssetKind,
  SocialChannel,
  SocialFunnelStage,
  SocialPaidKind,
  SocialPostFormat,
  SocialPostStatus,
} from "@prisma/client";

/**
 * العناوين العربية والألوان لتعدادات تقويم السوشيال — المصدر الوحيد.
 *
 * القيم والترتيب منقولة طبق الأصل من `JBRSEO/content/lib/constants.ts` (القوائم الثابتة)،
 * والألوان من `CalendarTable.tsx` و`GalleryClient.tsx` في التطبيق القديم. الفرق الوحيد:
 * المفاتيح تعدادات Prisma بدل النصوص (`"قيد الإنتاج"` · `"vid"` · `"instagram"`).
 */

// ── الحالة ───────────────────────────────────────────────────────────────────

export const STATUS_ORDER: readonly SocialPostStatus[] = [
  "IN_PRODUCTION",
  "READY_FOR_REVIEW",
  "READY_TO_PUBLISH",
  "PUBLISHED",
] as const;

export const STATUS_LABEL: Record<SocialPostStatus, string> = {
  IN_PRODUCTION: "قيد الإنتاج",
  READY_FOR_REVIEW: "جاهز للمراجعة",
  READY_TO_PUBLISH: "جاهز للنشر",
  PUBLISHED: "تم النشر",
};

/** الشارة: خلفية + نص + حدّ — فاتح وداكن. */
export const STATUS_BADGE: Record<SocialPostStatus, string> = {
  IN_PRODUCTION: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
  READY_FOR_REVIEW: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
  READY_TO_PUBLISH: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
  PUBLISHED: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/60 dark:text-green-300 dark:border-green-800",
};

export const STATUS_DOT: Record<SocialPostStatus, string> = {
  IN_PRODUCTION: "bg-zinc-400",
  READY_FOR_REVIEW: "bg-amber-400",
  READY_TO_PUBLISH: "bg-blue-500",
  PUBLISHED: "bg-green-500",
};

/** الحدّ الملوّن على يمين صفّ الجدول. */
export const STATUS_ROW_BORDER: Record<SocialPostStatus, string> = {
  IN_PRODUCTION: "border-r-zinc-200 dark:border-r-zinc-700",
  READY_FOR_REVIEW: "border-r-amber-400",
  READY_TO_PUBLISH: "border-r-blue-400",
  PUBLISHED: "border-r-green-400",
};

// ── نوع المحتوى ───────────────────────────────────────────────────────────────

export const FORMAT_ORDER: readonly SocialPostFormat[] = ["VIDEO", "CAROUSEL", "POST", "STORY", "REEL"] as const;

export const FORMAT_LABEL: Record<SocialPostFormat, string> = {
  VIDEO: "فيديو",
  CAROUSEL: "كاروسيل",
  POST: "بوست",
  STORY: "ستوري",
  REEL: "ريل",
};

// ── هدف الحملة ───────────────────────────────────────────────────────────────

export const FUNNEL_ORDER: readonly SocialFunnelStage[] = ["AWARENESS", "ENGAGEMENT", "LEADS", "CONVERSION"] as const;

export const FUNNEL_LABEL: Record<SocialFunnelStage, string> = {
  AWARENESS: "توعية",
  ENGAGEMENT: "تفاعل",
  LEADS: "عملاء محتملون",
  CONVERSION: "تحويل",
};

/** العنوان القصير في أزرار النموذج (القديم: «عملاء» لا «عملاء محتملون»). */
export const FUNNEL_SHORT_LABEL: Record<SocialFunnelStage, string> = {
  AWARENESS: "توعية",
  ENGAGEMENT: "تفاعل",
  LEADS: "عملاء",
  CONVERSION: "تحويل",
};

// ── القنوات ───────────────────────────────────────────────────────────────────

export const CHANNEL_ORDER: readonly SocialChannel[] = [
  "INSTAGRAM",
  "TIKTOK",
  "X",
  "FACEBOOK",
  "YOUTUBE",
  "LINKEDIN",
  "SNAPCHAT",
  "THREADS",
] as const;

export const CHANNEL_META: Record<SocialChannel, { label: string; bg: string; fg: string }> = {
  INSTAGRAM: { label: "Instagram", bg: "bg-pink-500", fg: "text-white" },
  TIKTOK: { label: "TikTok", bg: "bg-neutral-900", fg: "text-white" },
  X: { label: "X", bg: "bg-neutral-900", fg: "text-white" },
  FACEBOOK: { label: "Facebook", bg: "bg-blue-600", fg: "text-white" },
  YOUTUBE: { label: "YouTube", bg: "bg-red-600", fg: "text-white" },
  LINKEDIN: { label: "LinkedIn", bg: "bg-sky-700", fg: "text-white" },
  SNAPCHAT: { label: "Snapchat", bg: "bg-yellow-400", fg: "text-neutral-900" },
  THREADS: { label: "Threads", bg: "bg-neutral-900", fg: "text-white" },
};

// ── الميديا باير ─────────────────────────────────────────────────────────────

export const PAID_ORDER: readonly SocialPaidKind[] = ["ORGANIC", "SPONSORED"] as const;

export const PAID_LABEL: Record<SocialPaidKind, string> = {
  ORGANIC: "عضوي",
  SPONSORED: "مدفوع",
};

export const CURRENCY_OPTIONS = ["SAR", "USD", "EGP"] as const;
export type SocialCurrency = (typeof CURRENCY_OPTIONS)[number];

// ── الأصول ───────────────────────────────────────────────────────────────────

export const ASSET_KIND_LABEL: Record<SocialAssetKind, string> = {
  IMAGE: "صورة",
  VIDEO: "فيديو",
};
