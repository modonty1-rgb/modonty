import { getReelStatusCounts } from "./helpers/load-reels";

/**
 * الرأس والشريط مشتركان بين الشاشات الأربع، فمكانهما التخطيط لا كل صفحة.
 *
 * ولأن `layout.tsx` لا يعرف المقطع النشط، تقرؤه كل صفحة من مسارها وتمرّره — لكن
 * العدّادات تُجلب هنا مرّةً واحدة لا أربعاً، فالتنقّل بين الحالات لا يعيد استعلامها.
 *
 * الشريط يُرسم في `page.tsx` كي يعرف أيّها نشط؛ وهذا التخطيط يحمل العنوان الثابت
 * وحدود الصفحة. `<h1>` هنا وحده، والصفحات تبدأ من `<h2>` — تسلسل العناوين لا يُكسر.
 */
export default async function ReelsLayout({ children }: { children: React.ReactNode }) {
  const counts = await getReelStatusCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto max-w-[880px] space-y-5">
      <header>
        <h1 className="text-xl font-semibold">الريلز</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {total > 0
            ? `${total.toLocaleString("ar-SA")} ريل في المنظومة — موزّعة على الحالات أدناه.`
            : "ما فيه ريلز بعد. أوّل ما يرفع عميل ريلاً يوصل «بالانتظار»."}
        </p>
      </header>
      {children}
    </div>
  );
}
