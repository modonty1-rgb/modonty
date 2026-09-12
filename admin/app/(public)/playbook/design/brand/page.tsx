import { CheckCircle2, XCircle } from "lucide-react";

import { DocLayout } from "@/app/(public)/components/doc-layout";

/**
 * الهوية البصرية — الشكل وحده.
 *
 * كانت الصفحة تبدأ بمقدّمة تشرح «لماذا تقرأ هذي الصفحة» وتحيل إلى قسم انتقل أصلًا، وتكرّر
 * كل معلومة مرّتين: مرّة في عنوان ومرّة في فقرة تشرح العنوان (خالد، ١١ سبتمبر ٢٠٢٦: «حشو زائد،
 * والاختصارات كويسة»). صارت جداول مباشرة: اللون ومتى يُستعمل، والخطّ لأي لغة، واللوقو وممنوعاته.
 * الكلام كلّه في صفحة «كيف نتكلّم».
 */
const colors = [
  { hex: "#0e065a", nameAr: "كحلي داكن", swatch: "bg-[#0e065a]", use: "اللوقو والعناوين الرئيسية والنصوص القوية", avoid: "خلفية كاملة — يثقل العين" },
  { hex: "#3030ff", nameAr: "أزرق ملكي", swatch: "bg-[#3030ff]", use: "الأزرار والروابط والعناصر التفاعلية", avoid: "النصوص الطويلة — يتعب العين" },
  { hex: "#00d8d8", nameAr: "سماوي", swatch: "bg-[#00d8d8]", use: "لمسات وشارات وإبرازات خفيفة", avoid: "لون نصّ أساسي — تباين ضعيف" },
  { hex: "#ffffff", nameAr: "أبيض", swatch: "bg-white border border-border", use: "خلفيات نظيفة وبطاقات", avoid: "—" },
  { hex: "#000000", nameAr: "أسود", swatch: "bg-black", use: "نصوص قوية وعناوين", avoid: "خلفيات كبيرة — مدونتي ليست علامة داكنة" },
  { hex: "#5b5b5b", nameAr: "رمادي قاتم", swatch: "bg-[#5b5b5b]", use: "نصّ ثانوي وعناوين فرعية", avoid: "—" },
  { hex: "#a0a0a0", nameAr: "رمادي متوسط", swatch: "bg-[#a0a0a0]", use: "حدود وفواصل", avoid: "النصوص — تباين ضعيف" },
  { hex: "#dbdbdb", nameAr: "رمادي فاتح", swatch: "bg-[#dbdbdb] border border-border", use: "خلفيات ناعمة وأقسام", avoid: "النصوص — غير مقروء" },
] as const;

const logo = {
  dos: [
    "النسخة الأصلية بلا تعديل، وبنسبتها ١:١",
    "مساحة فارغة حوله من كل جهة",
    "الفاتحة على خلفية داكنة، والعكس",
    "٢٤ بكسل حدًّا أدنى",
  ],
  donts: ["تمديد", "تدوير", "عكس أفقي أو رأسي", "تشويه", "إعادة تلوين", "وضعه داخل إطار إضافي"],
} as const;

export default function BrandPage() {
  return (
    <DocLayout
      parentHref="/playbook"
      parentLabel="دليل الفريق"
      title="الهوية البصرية"
      description="اللون والخطّ واللوقو. أما كيف نتكلّم فله صفحته."
    >
      <section className="rounded-lg border bg-card p-4">
        <h2 className="text-[15px] font-bold">الألوان</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-right text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-3 py-2.5 font-bold">اللون</th>
                <th className="px-3 py-2.5 font-bold">استعمله في</th>
                <th className="px-3 py-2.5 font-bold">تجنّبه في</th>
              </tr>
            </thead>
            <tbody>
              {colors.map((c) => (
                <tr key={c.hex} className="border-b last:border-0">
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-2">
                      <span className={`h-5 w-5 shrink-0 rounded-md ${c.swatch}`} />
                      <span className="font-semibold">{c.nameAr}</span>
                      <span className="font-mono text-[11.5px] text-muted-foreground" dir="ltr">{c.hex}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5 leading-6 text-muted-foreground">{c.use}</td>
                  <td className="px-3 py-2.5 leading-6 text-muted-foreground">{c.avoid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-4">
        <h2 className="text-[15px] font-bold">الخطوط</h2>
        <div className="mt-3 grid gap-2.5 md:grid-cols-2">
          <div className="rounded-md border bg-muted/25 p-3">
            <p className="text-[14px] font-bold">تجوال — Tajawal</p>
            <p className="mt-1 text-[12.5px] leading-6 text-muted-foreground">كل النصّ العربي: العناوين والمتن.</p>
          </div>
          <div className="rounded-md border bg-muted/25 p-3">
            <p className="text-[14px] font-bold" dir="ltr">Montserrat</p>
            <p className="mt-1 text-[12.5px] leading-6 text-muted-foreground">الإنجليزي والأرقام والمصطلحات التقنية.</p>
          </div>
        </div>
        <p className="mt-2.5 rounded-md bg-primary/[0.06] p-3 text-[13px] font-semibold leading-6 text-primary">
          لا خطّ ثالث، ولا حتى في عرض تقديمي.
        </p>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] p-4">
          <h2 className="flex items-center gap-1.5 text-[15px] font-bold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            اللوقو: افعل
          </h2>
          <ul className="mt-2.5 list-disc space-y-1.5 ps-5 text-[13px] leading-7 text-muted-foreground marker:text-foreground/40">
            {logo.dos.map((d) => <li key={d}>{d}</li>)}
          </ul>
        </article>
        <article className="rounded-lg border border-rose-500/25 bg-rose-500/[0.05] p-4">
          <h2 className="flex items-center gap-1.5 text-[15px] font-bold">
            <XCircle className="h-4 w-4 text-rose-500" />
            اللوقو: لا تفعل
          </h2>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {logo.donts.map((d) => (
              <span key={d} className="rounded-md border bg-background/70 px-2.5 py-1 text-[12.5px] font-semibold">{d}</span>
            ))}
          </div>
        </article>
      </section>

    </DocLayout>
  );
}
