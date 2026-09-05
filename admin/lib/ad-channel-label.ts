import type { AdChannel } from "@prisma/client";

/**
 * أسماء قنوات الإعلان بالعربية.
 *
 * في `lib` لا داخل مجلّد الحملات: تستعملها شاشتان في مسارين مختلفين — تأسيس الحملة
 * (`/campaigns`) وتسجيل العميل المحتمل (`/sales-leads`) حين تختار المندوبة الحملة التي جاء
 * منها. واستيراد مسارٍ من مسارٍ شقيقٍ ممنوع، فالترقية هي الطريق لا النسخ.
 */
export const AD_CHANNEL_LABEL: Record<AdChannel, string> = {
  TIKTOK: "تيك توك",
  YOUTUBE: "يوتيوب",
  SNAPCHAT: "سناب شات",
  INSTAGRAM: "انستقرام",
  FACEBOOK: "فيسبوك",
  TWITTER: "إكس",
  LINKEDIN: "لينكدإن",
  GOOGLE: "بحث جوجل",
};
