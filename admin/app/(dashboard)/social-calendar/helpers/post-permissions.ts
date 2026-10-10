import type { StaffRole } from "@prisma/client";

/**
 * مَن يفعل ماذا في تقويم السوشيال — المصدر الوحيد (PRD §٤.٤ + توصيات §٩).
 *
 * يُسأل في ثلاثة أماكن: الصفحة، الأكشن، والزرّ — نفس حجّة `lib/can-see-reports.ts`: ثلاث
 * نسخ من قاعدة صلاحية = ثلاث فرص لأن تختلف، فيُظهر الزرّ ما يرفضه الخادم أو العكس.
 *
 *   view           عرض التقويم/التفصيل/المعرض/الأرشيف        كل موظّف نشط
 *   editBrief      إنشاء/تعديل البريف · نقل التاريخ          ADMIN · EDITOR
 *   produce        رفع/حذف أصل · «جاهز للمراجعة»             ADMIN · EDITOR · CREATIVE
 *   review         موافقة / رفض من «جاهز للمراجعة»           ADMIN · EDITOR   (س٥: QC قراءة فقط)
 *   publish        بيانات النشر · «نشر» · إرجاع من «جاهز للنشر» (س٧)   ADMIN · SOCIAL
 *   archive        أرشفة/استرجاع منشور                        ADMIN · EDITOR
 *
 * س١٥: كاتب المحتوى يرى كل العملاء في الإصدار الأول — لا تقييد بـ Client.editorId.
 */
export type SocialPermission = "view" | "editBrief" | "produce" | "review" | "publish" | "archive";

const MATRIX: Record<SocialPermission, readonly StaffRole[]> = {
  view: ["ADMIN", "EDITOR", "CREATIVE", "SOCIAL", "QC", "SALES"],
  editBrief: ["ADMIN", "EDITOR"],
  produce: ["ADMIN", "EDITOR", "CREATIVE"],
  review: ["ADMIN", "EDITOR"],
  publish: ["ADMIN", "SOCIAL"],
  archive: ["ADMIN", "EDITOR"],
};

export function canSocial(role: StaffRole | null | undefined, permission: SocialPermission): boolean {
  if (!role) return false;
  return MATRIX[permission].includes(role);
}
