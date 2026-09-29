import type { AdApproval, AdCampaignStatus } from "@prisma/client";

/**
 * دورة البريف (خالد ٢٩ سبتمبر ٢٠٢٦): بانتظار الموافقة ← موافَق عليها ← شغّالة ⇄ موقوفة (أو مرفوضة).
 *
 * الحالة **قرار الأدمن وحده**: الموافقة تضعها «موافَق عليها» (بندٌ لوحده)، و«تشغيل» يجعلها «شغّالة»،
 * و«إيقاف» / «تشغيل» يقلبانها بعدها. ميتا لا تحرّك التبويب — كانت تحرّكه فرجعت حملةٌ شُغّلت إلى «موافَق عليها» لأن
 * ميتا لم تبنها بعد. ما في ميتا يظهر داخل الكرت (الصرف · شغّالة هناك أم لا)، والاختلاف تنبيه.
 */
export const STAGES = ["PENDING", "APPROVED", "RUNNING", "PAUSED", "REJECTED"] as const;
export type BriefStage = (typeof STAGES)[number];

export const STAGE_LABEL: Record<BriefStage, string> = {
  PENDING: "بانتظار الموافقة",
  APPROVED: "موافَق عليها",
  RUNNING: "شغّالة",
  PAUSED: "موقوفة",
  REJECTED: "مرفوضة",
};

/** Same colour language as the rest of the admin: amber waits, green goes, rose stopped. */
export const STAGE_TONE: Record<BriefStage, string> = {
  PENDING: "text-amber-700 dark:text-amber-400",
  APPROVED: "text-sky-700 dark:text-sky-400",
  RUNNING: "text-emerald-700 dark:text-emerald-400",
  PAUSED: "text-muted-foreground",
  REJECTED: "text-rose-700 dark:text-rose-400",
};

export function briefStage(row: { approval: AdApproval; status: AdCampaignStatus }): BriefStage {
  if (row.approval !== "APPROVED") return row.approval;
  if (isStopped(row.status)) return "PAUSED";
  return row.status === "ACTIVE" ? "RUNNING" : "APPROVED";
}

/** Stopped by an admin. `ENDED` is read the same way — the enum has it, and a stop must never read as «running». */
export function isStopped(status: AdCampaignStatus): boolean {
  return status === "PAUSED" || status === "ENDED";
}
