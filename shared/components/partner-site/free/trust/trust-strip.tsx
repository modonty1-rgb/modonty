import { Award } from "lucide-react";

import type { HomeData } from "../home/home-data";

/**
 * «شريط الثقة» — سطر هادئ تحت الغلاف: شهادات الشريك، كما تجلس سحابة الشعارات في موقع شركة.
 *
 * شارة «شريك موثَّق في مدونتي» غادرت هذا الشريط إلى الشريط العلوي (خالد ٣١ أغسطس): هي عن
 * علاقته بنا لا عن شهاداته، وثابتةٌ لكل شريك — فمكانها الشريط الذي يظهر في كل صفحة.
 */
export function TrustStrip({ data }: { data: HomeData; preview?: boolean }) {
  const { trust } = data;
  /**
   * كلّها لا أربعة (٣١ أغسطس): القسم بلا صفحة تعرضه كاملاً، فالخامس كان لا يصل الزائر
   * في أي مكان — أُثبت حيّاً باعتمادٍ أُضيف من الكونسول فلم يظهر على الموقع. الشريط
   * `flex-wrap` أصلاً، فالزائد ينزل سطراً ولا يكسر شيئاً.
   */
  const items = trust.credentials;
  return (
    // A section with no heading and a row of spans: a screen reader heard loose words with no
    // «what is this» (4 Oct 2026). Hidden heading + a real list; the look is unchanged.
    <section id="trust" aria-labelledby="trust-heading" className="border-y bg-muted/30">
      <h2 id="trust-heading" className="sr-only">اعتمادات {data.name}</h2>
      <ul className="mx-auto flex max-w-[1128px] flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-4 text-sm text-muted-foreground max-md:flex-col max-md:items-start">
        {items.map((c) => (
          // Phones: one credential per line, start-aligned — centred and wrapped, «اعتماد CBAHI» split
          // across three ragged lines (review, 4 Oct 2026).
          <li key={c.name} className="flex items-center gap-2 max-md:items-start">
            <Award className="h-4 w-4 text-[hsl(var(--primary-ink,var(--primary)))]" aria-hidden />
            <span className="whitespace-nowrap text-foreground">{c.name}</span>
            {c.authority && <span>· {c.authority}</span>}
            {c.year && <span>· {c.year}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
