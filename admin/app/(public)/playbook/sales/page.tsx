import { DocLayout } from "@/app/(public)/components/doc-layout";

import { DeptJobDescriptions } from "../components/dept-job-descriptions";
import { DeptRoles } from "../components/dept-roles";
import { DeptVoice } from "../components/dept-voice";
import { SalesLimits } from "../components/sales-limits";
import { SegmentsLink } from "../components/segments-link";
import { CatalogSection } from "./components/catalog-section";
import { ClientSetupSection } from "./components/client-setup-section";
import { CompareSection } from "./components/compare-section";

/**
 * قسم المبيعات — توصيفٌ وظيفيّ، لا منهج تدريب.
 *
 * خالد، ١٣ سبتمبر ٢٠٢٦: «الصفحة أصبحت صفحة تعليمية وليست صفحة وصف وظيفي … ما أنا ما
 * حأفتح مدرسة ولا سنعلّم. المفروض أنه يوجد توصيف وظيفي».
 *
 * فحُذفت الدروس: السكربتات الثلاثة، والاعتراضات الخمسة، وقاعدة التسعير، وسكربتات
 * القطاعات المصرية، والقواعد الذهبية — كانت ٣٦٦٩ كلمة من أصل ٤٣٩٣، وكل بندٍ فيها
 * يشرح «ليش مهمّة» و«متى تستخدمها»، وهذا شرحُ مدرّبٍ لا وصفُ وظيفة.
 *
 * وما بقي يجيب أسئلة الوظيفة وحدها: ما عملك، ولمن تتّصل، وماذا تبيع وأين حدّه،
 * وبمَ نفترق، وماذا تقول في المواقف المتكرّرة، وما لا يُقال، وماذا تسلّم بعد التوقيع.
 */
function Block({ n, title, hint, children }: { n: number; title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <div className="flex items-start gap-2 border-b pb-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 font-mono text-[12px] font-bold text-primary">
          {n}
        </span>
        <div>
          <h2 className="text-[17px] font-bold leading-6">{title}</h2>
          <p className="mt-0.5 text-[12.5px] leading-6 text-muted-foreground">{hint}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

const beforeAnyCall = [
  "لا تَعِد بترتيب في محركات البحث ولا بعدد عملاء.",
  "كل رقم تقوله للعميل من مصدره الحيّ، لا من ذاكرتك.",
  "حدود الباقة تُقال قبل التوقيع لا بعده.",
  "«لسنا الأنسب لك» جملة مسموحة، وتكسبنا أكثر مما تخسر.",
] as const;

export default function SalesSectionPage() {
  return (
    <DocLayout
      parentHref="/playbook"
      parentLabel="دليل الفريق"
      title="قسم المبيعات"
      description="التوصيف الوظيفي لمن يقابل العميل، ومراجعه."
    >
      <Block n={1} title="وظيفتك" hint="الغرض، وخطوات العمل، والمخرجات، وما تقرّره وحدك، وعلى أيّ رقمٍ تُقاس.">
        <DeptJobDescriptions deptKey="sales" />
      </Block>

      <Block n={2} title="لمن تتّصل" hint="الشرائح بترتيب سهولة الإغلاق، وشجرة القرار، ونقاط الألم.">
        <SegmentsLink />
      </Block>

      <Block
        n={3}
        title="ماذا تبيع، وأين يقف حدّه"
        hint="ما ينفّذه الفريق، وما يقرّره الشريك، وحدّ الباقة عند كل خدمة. وتعريف مدونتي وهيكلها في «ما هي مدونتي؟»."
      >
        <CatalogSection />
      </Block>

      <Block n={4} title="بمَ نفترق عمّن حولنا" hint="ستّ مقارنات تسمعها كل أسبوع، وثلاث حالات لا نناسبها.">
        <CompareSection />
      </Block>

      <Block n={5} title="ماذا تقول" hint="الجملة التي تعرّف بنا، وقواعد ما قبل المكالمة، والمواقف المتكرّرة.">
        <section className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] p-2.5">
          <h3 className="text-[14.5px] font-bold">الجملة التي تقولها للشريك</h3>
          <p className="mt-1.5 text-[13.5px] leading-6 text-muted-foreground">
            «نحوّل خبرتك إلى محتوى يجد الناس فيه إجابتهم، وننشره باسمك على منصة موثّقة يزورها جمهور
            يبحث فعلًا. تأخذ صفحة رسمية بخدماتك وأعمالك وآراء عملائك، ونحن ننتج ونراجع، وأنت تعتمد
            وتتابع أرقامك الحقيقية.»
          </p>
        </section>

        <section className="rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-2.5">
          <h3 className="text-[14.5px] font-bold">أربع قواعد قبل أي مكالمة</h3>
          <ul className="mt-1.5 list-disc space-y-1 ps-4 text-[13.5px] leading-6 text-muted-foreground marker:text-amber-600/70">
            {beforeAnyCall.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </section>

        <DeptVoice deptKey="sales" />
      </Block>

      <Block n={6} title="ما لا يُقال أبدًا" hint="خطوط حمراء لا تُناقَش عند الضغط.">
        <SalesLimits />
      </Block>

      <Block n={7} title="بعد التوقيع" hint="ماذا تسلّم للتشغيل، ومتى يبدأ الإنتاج.">
        <ClientSetupSection />
      </Block>

      <Block n={8} title="مهامّك بالاسم" hint="من لوحة الإسناد — تتغيّر هناك فتتغيّر هنا.">
        <DeptRoles deptKey="sales" />
      </Block>
    </DocLayout>
  );
}
