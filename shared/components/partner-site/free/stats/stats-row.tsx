import type { HomeData } from "../home/home-data";

/** «أرقامنا» — a row of big numbers with small labels (Tailwind "stats"). Hairlines between, no cards. */
export function StatsRow({ data }: { data: HomeData; preview?: boolean }) {
  /**
   * كلّها، لا أربعة (خالد ٣١ أغسطس). القصّ عند ٤ كان يبتلع أرقام الشريك بلا أن يعرف:
   * القسم ما له صفحة تعرضه كاملاً، فالخامس ما كان يصل الزائر في أي مكان — ومقيسٌ عند
   * «د. علاء الدين» أنّ عنده خمسة. الصفّ `flex-1` يقسم العرض بالتساوي، و`flex-wrap`
   * ينزل بالزائد سطراً بدل أن يعصر الخلايا.
   */
  const items = data.stats;
  return (
    <section id="stats" className="border-y">
      {/* نفس سُلَّم `Section`: ٤٨ على الجوّال · ٦٤ من `md` — القسم لا يبني إيقاعه وحده. */}
      <dl className="mx-auto grid max-w-[1128px] grid-cols-2 gap-y-8 px-6 py-12 sm:flex sm:flex-wrap sm:divide-x sm:divide-x-reverse sm:divide-border md:py-16">
        {/* المفتاح هو الموضع لا التسمية: العميل يكتب تسمياته بيده، وثلاثة أرقام عند
            «د. علاء الدين بدوي» تحمل «ناجحه» نفسها — فتكرّر المفتاح ورياكت حذّر أن عنصراً
            قد يُكرَّر أو يُحذف. والقائمة ثابتة الترتيب ولا تُفرز، فالموضع مفتاح صالح. */}
        {items.map((s, i) => (
          <div key={i} className="px-4 text-center sm:flex-1 sm:px-6">
            {/* الحقل اسمه «رقم» لكنّ العميل يكتب فيه جملة: «أكثر من ٤٠٠٠ حالة لإستئصال
                المرارة» قِيست خارجةً عن خليّتها (١٦٣px) على آيفون ٣٩٠، لأن كلمة واحدة بحجم
                ٣٦px أعرض من الخليّة. يصغر الخطّ على الجوّال والكلمة تُكسَر عند الحاجة —
                فالرقم القصير يبقى كما هو والجملة الطويلة تنزل بدل أن تُقصّ. */}
            <dd className="text-3xl font-bold tabular-nums text-[hsl(var(--primary-ink,var(--primary)))] [overflow-wrap:anywhere] sm:text-4xl">{s.value}</dd>
            <dt className="mt-1 text-sm text-muted-foreground">{s.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
