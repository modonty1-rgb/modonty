import { BarChart3, BookOpen, FileText, IdCard, Megaphone, Sparkles, Target, UsersRound } from "lucide-react";

/**
 * خريطة الـPlaybook — مصدر واحد يقرأه الشريط الجانبي وشريط القسم معًا.
 *
 * فُصلت عن `hub-sidebar` في ١٢ سبتمبر ٢٠٢٦ حين صار للأقسام شريطان: الجانبيّ يعرض
 * أسماء الأقسام وحدها، وشريط داخل القسم يعرض صفحاته. ولو بقيت القائمة في مكانين
 * لانحرف أحدهما عن الآخر عند أوّل صفحة جديدة.
 */
export const SHARED = [
  { href: "/playbook", label: "ما هي مدونتي؟", icon: BookOpen },
  // الوصف الوظيفي كان بندًا هنا ليوم واحد، ثم نزل إلى صفحة كل قسم (خالد، ١٢ سبتمبر ٢٠٢٦):
  // «أبغى أحطّ كل حاجة بقسمها». وبقيت اللوحة وحدها هنا لأنها عابرةٌ للأقسام.
  // و«كيف نتكلّم» تبعتها في اليوم نفسه: مواقفها الستّة نزلت إلى المبيعات والعمليات
  // والمحتوى، وقواعدها وكلماتها إلى «ما هي مدونتي؟» لأنها هويّة لا مهارة قسم.
  { href: "/playbook/roles", label: "من يفعل ماذا", icon: UsersRound },
  // الشرائح المستهدفة: كانت قسمًا داخل المبيعات، ورُفعت في ١٣ سبتمبر ٢٠٢٦ لأن التسويق
  // يبني عليها الحملة كما يبني عليها البيع مكالمته. مادةٌ لقسمين ترتفع، ولا تُنسخ.
  { href: "/playbook/segments", label: "الشرائح المستهدفة", icon: Target },
] as const;

export const DEPARTMENTS = [
  {
    title: "المبيعات",
    href: "/playbook/sales",
    icon: Megaphone,
    // صفحاته السبع طُويت داخل صفحته وحُذفت (خالد، ١٢ سبتمبر ٢٠٢٦)، وصار التنقّل بينها
    // بمراسٍ في أعلى الصفحة لا بروابط تُعيد التحميل.
    items: [],
  },
  {
    title: "التسويق",
    href: "/playbook/marketing",
    icon: BarChart3,
    items: [
      { href: "/playbook/marketing/plan", label: "خطة التسويق" },
      { href: "/playbook/marketing/measurement", label: "القياس" },
    ],
  },
  {
    title: "المحتوى",
    href: "/playbook/content",
    icon: FileText,
    items: [
      { href: "/playbook/content/briefs", label: "البريف" },
      { href: "/playbook/content/structure", label: "تنظيم المحتوى" },
      { href: "/playbook/content/article-journey", label: "رحلة المقال" },
      { href: "/playbook/content/authority", label: "السلطة والنسبة" },
      { href: "/playbook/content/reels", label: "الريلز" },
      { href: "/playbook/content/after-publish", label: "بعد النشر" },
      // خمس صفحات كانت تُفتح من «الجانب التقني»، وسقطت بطاقاتها حين نُظّفت تلك الصفحة
      // (خالد، ١٢ سبتمبر ٢٠٢٦). ومسارها باقٍ تحت `tech/` لأن نقله يكسر روابط محفوظة،
      // أمّا مكانها في التنقّل فهنا: خمستها عن المقال، ومن يفتحها كاتبٌ لا تقنيّ.
      { href: "/playbook/tech/publishing", label: "بوّابة النشر" },
      { href: "/playbook/tech/seo-score", label: "نتيجة السيو" },
      { href: "/playbook/tech/image-seo", label: "سيو الصور" },
      { href: "/playbook/tech/search-preview", label: "شكل المقال في البحث" },
      { href: "/playbook/tech/client-articles", label: "مقالات الشركاء" },
    ],
  },
  {
    title: "التصميم",
    href: "/playbook/design",
    icon: Sparkles,
    items: [
      { href: "/playbook/design/brand", label: "الهوية البصرية" },
      { href: "/playbook/design/media", label: "مقاسات الوسائط" },
    ],
  },
  // قسمٌ بلا صفحات فرعية بعد — أنشأه خالد في ١٢ سبتمبر ٢٠٢٦ كي يكون لروان مكانٌ
  // كباقي الأقسام. والبريف وتأسيس الشريك يبقيان حيث يقرأهما أصحابهما.
  {
    title: "العمليات",
    href: "/playbook/operations",
    icon: IdCard,
    items: [],
  },
] as const;

/** القسم الذي ينتمي إليه مسارٌ ما، أو `undefined` لصفحات الأساس. */
export function departmentOf(pathname: string) {
  const byPath = DEPARTMENTS.find((d) => pathname === d.href || pathname.startsWith(d.href + "/"));
  if (byPath) return byPath;
  // صفحاتٌ مسارها تحت قسم وموضعها في التنقّل تحت آخر — يُحسم بالقائمة لا بالمسار.
  return DEPARTMENTS.find((d) => d.items.some((i) => i.href === pathname));
}
