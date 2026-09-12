import Link from "next/link";
import { AlertCircle, Link2, Sparkles } from "lucide-react";

import { DocLayout } from "@/app/(public)/components/doc-layout";

/**
 * الريلز — نُقلت من `guidelines/reels` وحُذفت الصفحة هناك.
 * الحالات الستّ مأخوذة من `ReelStatus` في المخطط، والفكرة من مرجع نموذج العمل.
 * ما لم يُحسم يبقى مكتوبًا كما هو: غير محسوم، فلا يُقال في عرض ولا تسعير.
 */
const flow = [
  { status: "DRAFT", label: "مسودّة", note: "قيد الإعداد عندنا، لا أحد يراها." },
  { status: "PENDING_APPROVAL", label: "بانتظار الاعتماد", note: "جاهزة، ولا تنزل قبل موافقة الشريك." },
  { status: "APPROVED", label: "معتمدة", note: "عدّت المراجعة ولم تنزل للفيد بعد." },
  { status: "PUBLISHED", label: "منشورة", note: "حيّة في الفيد العام وصفحة المشاهدة." },
  { status: "REJECTED", label: "مرفوضة", note: "لم تعدّ المراجعة، والسبب مكتوب." },
  { status: "ARCHIVED", label: "مؤرشفة", note: "خرجت من التداول وتاريخها محفوظ." },
] as const;

const unsettled = [
  "عدد الريلز المسموح شهريًّا لكل باقة — يُقرأ من بيانات الباقات، لا من هنا.",
  "الاسم النهائي للريلز في الواجهة العربية.",
  "تفاصيل مسار الإنتاج والرفع — الميزة قيد التطوير وتتغيّر.",
] as const;

export default function ReelsPage() {
  return (
    <DocLayout
      parentHref="/playbook"
      parentLabel="دليل الفريق"
      title="الريلز"
      description="فيديو قصير منسوب لشريك، وتسليم داخل الباقة. ليس محتوى يرفعه المستخدمون."
    >
      <section className="rounded-lg border border-primary/30 bg-primary/[0.05] p-4">
        <h2 className="flex items-center gap-2 text-[15px] font-bold">
          <Sparkles className="h-4 w-4 text-primary" />
          الفكرة في سطر
        </h2>
        <p className="mt-2 text-[13.5px] leading-7 text-muted-foreground">
          الريل عندنا <b className="text-foreground">تسليم</b> منسوب لشريك، مرتبط غالبًا بمقال له أو خدمة،
          ولا ينزل إلى الفيد العام إلا بعد اعتماده. هذا الفرق يحكم كل قرار في إنتاجه.
        </p>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">رحلة الريل: ستّ حالات</h2>
        <div className="mt-3 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {flow.map((step) => (
            <article key={step.status} className="rounded-lg border bg-card p-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13.5px] font-bold">{step.label}</p>
                <span className="font-mono text-[11px] font-bold text-muted-foreground" dir="ltr">{step.status}</span>
              </div>
              <p className="mt-1.5 text-[12.5px] leading-6 text-muted-foreground">{step.note}</p>
            </article>
          ))}
        </div>
        <p className="mt-3 rounded-lg border bg-card p-3 text-[13px] leading-7 text-muted-foreground">
          الاعتماد ليس خطوة شكلية: الريل يمثّل شريكًا أمام جمهوره، وأي خطأ فيه يُنسب إليه هو لا إلينا.
        </p>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-lg border bg-card p-4">
          <h2 className="flex items-center gap-2 text-[15px] font-bold">
            <Link2 className="h-4 w-4 text-primary" />
            الربط شرط لا تحسين
          </h2>
          <p className="mt-2 text-[13px] leading-7 text-muted-foreground">
            كل ريل يجب أن يكون واضحًا لصالح مَن، ومرتبطًا بمقال أو خدمة أو صفحة الشريك.
            الريل بلا وجهة يعطي مشاهدة ولا يعطي الشريك شيئًا، والباقة اشترت أثرًا لا مشاهدات.
          </p>
        </article>

        <article className="rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-4">
          <h2 className="flex items-center gap-2 text-[15px] font-bold">
            <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-300" />
            ما لم يُحسم بعد
          </h2>
          <ul className="mt-2 list-disc space-y-1.5 ps-5 text-[13px] leading-7 text-muted-foreground marker:text-foreground/40">
            {unsettled.map((line) => <li key={line}>{line}</li>)}
          </ul>
          <p className="mt-2 text-[12.5px] leading-6 text-foreground/80">
            إن احتجت رقمًا أو اسمًا من هذه، اسأل. لا تكتبه من ذاكرتك في عرض ولا تسعير.
          </p>
        </article>
      </section>

      <p className="rounded-lg border border-dashed p-4 text-[13px] leading-7 text-muted-foreground">
        مقاسات الفيديو ومدده في{" "}
        <Link href="/playbook/design/media" className="font-semibold text-primary hover:underline">صفحة مقاسات الوسائط</Link>.
      </p>
    </DocLayout>
  );
}
