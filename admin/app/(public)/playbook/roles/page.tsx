import { ModontySystemMap } from "../components/modonty-system-map";
import { SectionHead } from "../components/section-head";
import { RolesBoard } from "./components/roles-board";
import { ROLE_ASKS } from "./helpers/roles-data";

export const metadata = { title: "الدور الوظيفي" };

export default function RolesPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-6" dir="rtl">
      {/* المقدّمة جملة واحدة: ما كان تحتها يشرح الصفحة ويكرّر عدّاد اللوحة (audit ١٢ سبتمبر ٢٠٢٦). */}
      <header className="rounded-xl border bg-card p-5">
        <h1 className="text-xl font-bold">الدور الوظيفي</h1>
        <p className="mt-3 max-w-4xl border-s-2 border-primary ps-3 text-[15.5px] font-bold leading-8">
          كل مهمّة في مدونتي لها مالك واحد بالاسم. تعرف دورك من هنا، وتعرف من تسلّمه ومن يسلّمك.
        </p>
      </header>

      {/*
        الرحلة انتقلت من `/playbook` في ١٢ سبتمبر ٢٠٢٦ بقرار خالد.
        كانت رسمًا لأبواب مدونتي، وصارت في هذه الجلسة رسمًا لمن يسلّم لمن — بالأسماء.
        فسؤالها صار سؤال هذه الصفحة: من يفعل ماذا، لا «ما هي مدونتي».
        وترتيب الصفحة يمشي معها: المسار، ثم ما يُنتظر من كل دور، ثم مهامه بالاسم.
      */}
      <section className="mt-8 scroll-mt-6" id="journey">
        <SectionHead title="الرحلة" />
        <div className="mt-4 overflow-hidden rounded-lg border bg-card">
          <ModontySystemMap />
        </div>
      </section>

      <section className="mt-8 scroll-mt-6" id="asks">
        <SectionHead title="سؤال كل دور" />
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {ROLE_ASKS.map((ask) => (
            <article key={ask.who} className="rounded-lg border bg-card p-4">
              <h3 className="text-[14.5px] font-bold">{ask.who}</h3>
              <p className="mt-2.5 text-[13px] font-bold text-primary">{ask.question}</p>
              <p className="mt-1.5 text-[13px] leading-7 text-muted-foreground">{ask.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 scroll-mt-6" id="duties">
        <SectionHead title="من يفعل ماذا" />
        <div className="mt-4">
          <RolesBoard />
        </div>
      </section>
    </div>
  );
}
