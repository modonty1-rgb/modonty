import { ModontySystemMap } from "../components/modonty-system-map";
import { SectionHead } from "../components/section-head";
import { UNIVERSAL_RULES } from "../helpers/job-descriptions-data";
import { DUTIES } from "../helpers/roles-data";
import { RolesBoard } from "./components/roles-board";

/** مهمّةٌ بلا مالك: إمّا وظيفة ناقصة أو تأجيلٌ بقرار — وكلاهما يُعرض ولا يُخفى. */
const UNOWNED = DUTIES.filter((d) => d.owner === "");

// أُعيدت التسمية في ١٢ سبتمبر ٢٠٢٦: «الدور الوظيفي» و«الوصف الوظيفي» اسمان يتبادلان
// في الذهن، فأخذت اللوحة اسم سؤالها، ونزل الوصف إلى صفحة كل قسم.
export const metadata = { title: "من يفعل ماذا" };

export default function RolesPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-6" dir="rtl">
      {/* المقدّمة جملة واحدة: ما كان تحتها يشرح الصفحة ويكرّر عدّاد اللوحة (audit ١٢ سبتمبر ٢٠٢٦). */}
      <header className="rounded-xl border bg-card p-5">
        <h1 className="text-xl font-bold">من يفعل ماذا</h1>
        <p className="mt-3 max-w-4xl border-s-2 border-primary ps-3 text-[15.5px] font-bold leading-8">
          كل مهمّة في مدونتي لها مالك واحد بالاسم. تعرف دورك من هنا، وتعرف من تسلّمه ومن يسلّمك.
        </p>
        <p className="mt-3 text-[13px] leading-7 text-muted-foreground">
          هذه اللوحة تُسند المهامّ. أمّا وصف وظيفتك كاملًا — خطوات عملك، وما تقرّره وحدك، وعلى أيّ
          رقمٍ تُقاس — ففي صفحة قسمك.
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

      {/*
        «سؤال كل دور» نزل إلى صفحة كل قسم (خالد، ١٢ سبتمبر ٢٠٢٦): مندوب المبيعات كان
        يقرأ ما يخصّ التصميم. وبقي هنا ما هو عابرٌ للأقسام وحده — الرحلة ولوحة الإسناد.
      */}
      <section className="mt-8 scroll-mt-6" id="duties">
        <SectionHead title="من يفعل ماذا" />
        <div className="mt-4">
          <RolesBoard />
        </div>
      </section>

      {/*
        نزلا من صفحة الأوصاف الملغاة (١٢ سبتمبر ٢٠٢٦). وهما وحدهما ما لم يجد قسمًا يأويه:
        القواعد تسري على الجميع، والمهمّة بلا مالك لا قسم لها بالتعريف.
      */}
      <section className="mt-8">
        <SectionHead title="قواعد تسري على كل وظيفة" />
        <ul className="mt-3 divide-y rounded-lg border bg-card">
          {UNIVERSAL_RULES.map((r, i) => (
            <li key={r} className="flex items-center gap-3 px-4 py-2.5">
              <span className="shrink-0 font-mono text-[11px] font-bold text-amber-700 dark:text-amber-300">
                {i + 1}
              </span>
              <span className="text-[13.5px] leading-6">{r}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <SectionHead title="ما لا يملكه أحد" />
        <div className="mt-3 space-y-2">
          {UNOWNED.map((d) => (
            <div key={d.n} className="rounded-lg border border-rose-500/25 bg-rose-500/[0.04] p-4">
              <p className="text-[13.5px] font-bold leading-6">
                {d.t}
                <span className="ms-2 text-[11.5px] font-normal text-muted-foreground">
                  {d.parked ? "مؤجّلة بقرار" : "بلا مالك"}
                </span>
              </p>
              {d.note ? <p className="mt-1 text-[12.5px] leading-6 text-muted-foreground">{d.note}</p> : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
