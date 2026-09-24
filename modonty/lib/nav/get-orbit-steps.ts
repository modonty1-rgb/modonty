/**
 * **كم خانةً يبعد هذا الرابط عن النشط — في حلقة** (مثل شريط Galaxy): موجبٌ جهة، سالبٌ الجهة الأخرى.
 *
 * المركزُ ثابت، والنشطُ فيه دائماً، والباقي يدور حوله: الأقربُ في الحلقة يلي المركزَ من الجهتين.
 * يقرؤها شريطُ الجوّال (`components/shared/quick-links/OrbitQuickLinks.tsx`) وشريطُ الديسكتوب
 * (`app/layout/components/nav/NavLinksClient.tsx`) — حسابٌ واحد فلا تفترق الحركتان
 * (خالد ٢٤ سبتمبر ٢٠٢٦: «نفس فكرة الجالكسي… نطبّقها هنا»).
 */
export function getOrbitSteps(index: number, activeIndex: number, count: number): number {
  const distance = (index - activeIndex + count) % count;
  return distance > count / 2 ? distance - count : distance;
}
