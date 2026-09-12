import { DocLayout } from "@/app/(public)/components/doc-layout";

/** «بعد النشر» و«مَن يملك ماذا» — آخر موضوعين كانا يعيشان داخل المستند الواحد بلا صفحة. */
const healthChecks = [
  "الصورة الرئيسية ونسخ مقاساتها تفتح فعلًا.",
  "صفحة المقال نفسها تفتح — المنشور لازم يشتغل.",
  "الصور داخل النصّ، وشعار الشركة.",
  "روابطنا الداخلية لا تودّي لصفحة ميّتة.",
  "ما أرسلناه لجوجل ما زال يطابق صورة المقال الحالية.",
] as const;

const ownership = [
  ["عنوان المقال ورابطه", "الرابط الأساسي ولغات الصفحة"],
  ["عنوان السيو ووصفه", "البيانات المنظّمة كاملة"],
  ["الصورة الرئيسية ونصّها البديل", "نسخ المقاسات والبديل الضبابي واسم الملف"],
  ["المقالات المرتبطة", "تاريخا النشر والتعديل"],
] as const;

export default function AfterPublishGuidelinePage() {
  return (
    <DocLayout
      parentHref="/playbook"
      parentLabel="دليل الفريق"
      title="بعد النشر: صحّة المقال ومَن يملك ماذا"
      description="الصور تنكسر، والروابط تموت، والمعلومات المرسلة لجوجل تتقادم. وهنا أيضًا قسمة الحقول بينك وبين النظام."
    >
      <section className="rounded-lg border bg-card p-4">
        <h2 className="text-[15px] font-bold">ما تفحصه صفحة «صحّة المقال»</h2>
        <p className="mt-2 text-[13.5px] leading-7 text-muted-foreground">
          تفتح مقالك مثل أي زائر وتفحص عشرة بنود، أهمّها:
        </p>
        <ul className="mt-2 list-disc space-y-1.5 ps-5 text-[13.5px] leading-7 text-muted-foreground marker:text-foreground/40">
          {healthChecks.map((line) => <li key={line}>{line}</li>)}
        </ul>
      </section>

      <section className="rounded-lg border bg-card p-4">
        <h2 className="text-[15px] font-bold">مَن يملك ماذا</h2>
        <p className="mt-2 text-[13.5px] leading-7 text-muted-foreground">
          أكثر ما يضيّع الوقت مطاردة حقل يولّده النظام. هذي القسمة:
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-right text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-3 py-2.5 font-bold">أنت تكتبه</th>
                <th className="px-3 py-2.5 font-bold">النظام يولّده</th>
              </tr>
            </thead>
            <tbody>
              {ownership.map(([you, system]) => (
                <tr key={you} className="border-b last:border-0">
                  <th className="px-3 py-2.5 text-right font-semibold">{you}</th>
                  <td className="px-3 py-2.5 leading-6 text-muted-foreground">{system}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="rounded-lg border border-dashed p-4 text-[13px] leading-7 text-muted-foreground">
        وإن تعارض أي دليل مع سلوك النظام، فالنظام هو الحقيقة — وبلّغ عن التعارض ليُصحَّح هنا.
      </p>
    </DocLayout>
  );
}
