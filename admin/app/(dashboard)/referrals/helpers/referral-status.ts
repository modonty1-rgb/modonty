import { ReferralLeadStatus } from "@prisma/client";

/**
 * حالات الإحالة: أسماؤها العربية، ومسارها المسموح.
 *
 * ملفّ مستقلّ لا `"use server"`: ملفّ الخادم لا يصدّر إلا دوالّ غير متزامنة، وهذي ثوابت
 * تحتاجها الشاشة والخادم معاً. مصدرٌ واحد كي لا يفترق اسمٌ في الجدول عن اسمٍ في رسالة خطأ.
 */

/** ما يقرأه الفريق. */
export const STATUS_AR: Record<ReferralLeadStatus, string> = {
  NEW: "جديدة",
  CONTACTED: "تواصلنا",
  SUBSCRIBED: "اشترك",
  PAID: "سدّد",
  REWARDED: "مُنحت المكافأة",
  REJECTED: "رفض",
  LOST: "انقطع",
};

/**
 * المسار في اتجاه واحد. كل حالة تقبل ما يليها فقط، وكل صفٍّ حيّ يمكن إغلاقه برفض أو انقطاع.
 * الرجوع ممنوع بنيةً لا بانضباط: صفٌّ يعود من «سدّد» إلى «جديدة» يجعل السجلّ الزمني كذباً،
 * ويجعل سؤال «كم إحالة تحوّلت؟» بلا جواب.
 */
export const ALLOWED_NEXT: Record<ReferralLeadStatus, ReferralLeadStatus[]> = {
  NEW: ["CONTACTED", "REJECTED", "LOST"],
  CONTACTED: ["SUBSCRIBED", "REJECTED", "LOST"],
  SUBSCRIBED: ["PAID", "LOST"],
  PAID: ["REWARDED"],
  REWARDED: [],
  REJECTED: [],
  LOST: [],
};

/** الحقل الزمني الذي تختمه كل حالة عند دخولها — يُكتب مرّة ولا يُمحى. */
export const STATUS_STAMP: Partial<
  Record<ReferralLeadStatus, "contactedAt" | "subscribedAt" | "paidAt" | "rewardedAt">
> = {
  CONTACTED: "contactedAt",
  SUBSCRIBED: "subscribedAt",
  PAID: "paidAt",
  REWARDED: "rewardedAt",
};

/** الحالات التي انتهى مسارها — تُعرض هادئة، ولا زرّ عليها. */
export const IS_CLOSED = (s: ReferralLeadStatus) => ALLOWED_NEXT[s].length === 0;
