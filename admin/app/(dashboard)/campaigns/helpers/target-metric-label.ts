import type { AdObjective } from "@prisma/client";

/**
 * اسم الرقم المستهدف يتبع الهدف — خانةٌ واحدة لا ثلاث (خالد ٢٩ سبتمبر ٢٠٢٦: «ما أبغى أعقّد»).
 * العملاء والمبيعات تُقاس بتكلفة العميل، والزيارات بتكلفة النقرة، والوعي والتفاعل بتكلفة الألف ظهور.
 */
export const TARGET_METRIC_LABEL: Record<AdObjective, string> = {
  LEADS: "تكلفة العميل المستهدفة",
  SALES: "تكلفة العميل المستهدفة",
  TRAFFIC: "تكلفة النقرة المستهدفة",
  AWARENESS: "تكلفة الألف ظهور المستهدفة",
  ENGAGEMENT: "تكلفة الألف ظهور المستهدفة",
};

/** Only these are measured by cost per lead — the «فوق المستهدف» alert applies to them alone. */
export const isLeadObjective = (o: AdObjective | null | undefined) => o === "LEADS" || o === "SALES";
