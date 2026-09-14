/**
 * وحدات المزايا — قائمة مغلقة تُختار من الأدمن (خالد ١٤ سبتمبر ٢٠٢٦).
 *
 * كانت تُكتب بيدٍ حرّة، فأنتجت «مقال/شهر» و«مقال / شهر» و«مقالات شهرياً» لنفس المعنى.
 * والضرر ليس جمالياً: حساب إجمالي المدّة يميّز الوحدة الشهرية بوجود «/شهر» فيها
 * (`build-plan-commitments.ts` · كتلة الأرقام في البطاقة)، فمسافةٌ زائدة تُسقط الرقم
 * من «٨٤ مقالاً خلال ٧ أشهر» إلى «١٢» بصمت.
 *
 * ولماذا لم تُحذف الوحدة أصلاً: «١٢ مقال» و«١٢ مقال/شهر» عرضان مختلفان تماماً، وأوّل ما
 * يسأل عنه المشتري. الوحدة هي التي تفصل بينهما.
 *
 * الإضافة هنا لا في القاعدة: وحدةٌ جديدة تعني قاعدة حسابٍ جديدة، فتُراجَع في الكود.
 */

export const FEATURE_UNIT_LABELS = [
  "مقال/شهر",
  "حملة/شهر",
  "صورة أو فيديو/شهر",
  "منشور/شهر",
  "تقرير/شهر",
  "جلسة",
  "تنبيه",
  "مقال",
] as const;

export type FeatureUnitLabel = (typeof FEATURE_UNIT_LABELS)[number];

export function isFeatureUnitLabel(value: string): value is FeatureUnitLabel {
  return (FEATURE_UNIT_LABELS as readonly string[]).includes(value);
}

/** هل تتراكم هذه الوحدة كل شهر؟ القاعدة الوحيدة التي يقوم عليها حساب إجمالي المدّة. */
export function isMonthlyUnit(unitLabel: string | null): boolean {
  return Boolean(unitLabel?.endsWith("/شهر"));
}
