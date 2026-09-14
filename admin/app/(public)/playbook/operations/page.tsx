import { DocLayout } from "@/app/(public)/components/doc-layout";
import { DeptJobDescriptions } from "../components/dept-job-descriptions";
import { DeptRoles } from "../components/dept-roles";
import { DeptVoice } from "../components/dept-voice";

/**
 * قسم العمليات — أنشأه خالد في ١٢ سبتمبر ٢٠٢٦: «سوّي قسم، سمّه قسم العمليات،
 * واشتغلوا زي الباقيين». وكان التشغيل قسمًا بلا صفحة: روان تحمل خمس عشرة مهمّة
 * ولا مكان يجمعها، فكان وصفها يُقرأ من صفحة الأوصاف وحدها.
 *
 * ولا صفحات فرعية له بعد. البريف وتأسيس الشريك يعيشان في المحتوى والمبيعات، لأن
 * قارئهما هناك — ويُنقلان إن صارا يُفتحان من هنا أكثر.
 */
export default function OperationsSectionPage() {
  return (
    <DocLayout
      parentHref="/playbook"
      parentLabel="دليل الفريق"
      title="قسم العمليات"
      description="ما بين التوقيع وبدء الإنتاج: أوراق الشريك، وملفّه في الكونسول، والموجز الذي لا ينطلق إنتاجٌ قبله."
    >
      <p className="rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-4 text-[13.5px] leading-7">
        الموجز هو المخرَج. وما دام ناقصًا فالإنتاج كلّه واقف — لا الكاتب يبدأ، ولا المصمّم.
      </p>

      <DeptJobDescriptions deptKey="ops" />

      <DeptVoice deptKey="ops" />


      <DeptRoles deptKey="ops" />
    </DocLayout>
  );
}
